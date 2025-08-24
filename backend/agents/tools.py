from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ValidationError, model_validator
from sqlmodel import Session, select

from app.models.item import Item, ItemType
from app.db.session import engine
from app.services import crud


# Utility --------------------------------------------------------------


def model_to_dict(model: Any) -> Dict[str, Any]:
    if hasattr(model, "model_dump"):
        return model.model_dump()
    return model.dict()


ALLOWED_PARENTS: Dict[ItemType, Optional[set[ItemType]]] = {
    ItemType.EPIC: None,
    ItemType.CAPABILITY: {ItemType.EPIC},
    ItemType.FEATURE: {ItemType.CAPABILITY, ItemType.EPIC},
    ItemType.US: {ItemType.FEATURE},
    ItemType.UC: {ItemType.US},
}


# Schemas --------------------------------------------------------------


class GetItemInput(BaseModel):
    id: Optional[int] = None
    type: Optional[ItemType] = None
    title: Optional[str] = None
    project_id: Optional[int] = None

    @model_validator(mode="after")
    def check_one(cls, values: "GetItemInput") -> "GetItemInput":
        if values.id is not None:
            if any([values.type, values.title, values.project_id]):
                raise ValueError("id cannot be combined with other fields")
        else:
            if not (values.type and values.title and values.project_id):
                raise ValueError("provide either id or (type, title, project_id)")
        return values


class ListItemsInput(BaseModel):
    project_id: int
    type: Optional[ItemType] = None
    query: Optional[str] = None
    limit: int = 100
    offset: int = 0


class DeleteItemInput(BaseModel):
    id: int


class MoveItemInput(BaseModel):
    id: int
    new_parent_id: int


class SummarizeProjectInput(BaseModel):
    project_id: int
    depth: int = 3


class FeatureCreate(BaseModel):
    title: str
    description: Optional[str] = None


class BulkCreateFeaturesInput(BaseModel):
    project_id: int
    parent_id: int
    items: List[FeatureCreate]


# Handlers -------------------------------------------------------------


def handle_get_item(payload: Dict[str, Any], run_id: int = 0) -> Dict[str, Any]:
    crud.record_run_step(run_id, "tool:get_item", payload)
    try:
        data = GetItemInput(**payload)
    except ValidationError as e:
        return {"ok": False, "error": str(e)}

    with Session(engine) as db:
        if data.id is not None:
            item = db.get(Item, data.id)
        else:
            stmt = select(Item).where(
                Item.type == data.type,
                Item.title == data.title,
                Item.project_id == data.project_id,
            )
            item = db.exec(stmt).first()
    if not item:
        return {"ok": False, "error": "item not found"}
    return {"ok": True, "result": model_to_dict(item)}


def handle_list_items(payload: Dict[str, Any], run_id: int = 0) -> Dict[str, Any]:
    crud.record_run_step(run_id, "tool:list_items", payload)
    try:
        data = ListItemsInput(**payload)
    except ValidationError as e:
        return {"ok": False, "error": str(e)}

    with Session(engine) as db:
        stmt = select(Item).where(Item.project_id == data.project_id)
        if data.type:
            stmt = stmt.where(Item.type == data.type)
        if data.query:
            stmt = stmt.where(Item.title.contains(data.query))
        stmt = stmt.offset(data.offset).limit(data.limit)
        items = db.exec(stmt).all()
    result = [
        {
            "id": i.id,
            "type": i.type,
            "title": i.title,
            "parent_id": i.parent_id,
            "status": i.status,
        }
        for i in items
    ]
    return {"ok": True, "result": result}


def _collect_descendants(db: Session, item_id: int) -> List[Item]:
    items = []
    stack = [item_id]
    while stack:
        current = stack.pop()
        children = db.exec(select(Item).where(Item.parent_id == current)).all()
        for child in children:
            stack.append(child.id)
            items.append(child)
    return items


def handle_delete_item(payload: Dict[str, Any], run_id: int = 0) -> Dict[str, Any]:
    crud.record_run_step(run_id, "tool:delete_item", payload)
    try:
        data = DeleteItemInput(**payload)
    except ValidationError as e:
        return {"ok": False, "error": str(e)}

    with Session(engine) as db:
        item = db.get(Item, data.id)
        if not item:
            return {"ok": False, "error": "item not found"}
        to_delete = _collect_descendants(db, item.id)
        for child in to_delete:
            db.delete(child)
        db.delete(item)
        db.commit()
    return {"ok": True, "result": {"deleted": len(to_delete) + 1}}


def _is_descendant(db: Session, ancestor_id: int, descendant_id: int) -> bool:
    current = db.get(Item, descendant_id)
    while current and current.parent_id is not None:
        if current.parent_id == ancestor_id:
            return True
        current = db.get(Item, current.parent_id)
    return False


def handle_move_item(payload: Dict[str, Any], run_id: int = 0) -> Dict[str, Any]:
    crud.record_run_step(run_id, "tool:move_item", payload)
    try:
        data = MoveItemInput(**payload)
    except ValidationError as e:
        return {"ok": False, "error": str(e)}

    with Session(engine) as db:
        item = db.get(Item, data.id)
        new_parent = db.get(Item, data.new_parent_id)
        if not item or not new_parent:
            return {"ok": False, "error": "item or parent not found"}
        if item.parent_id == new_parent.id:
            return {"ok": True, "result": model_to_dict(item)}
        allowed = ALLOWED_PARENTS.get(item.type)
        if allowed is not None and new_parent.type not in allowed:
            return {"ok": False, "error": "invalid parent type"}
        if _is_descendant(db, item.id, new_parent.id):
            return {"ok": False, "error": "cycle detected"}
        item.parent_id = new_parent.id
        db.add(item)
        db.commit()
        db.refresh(item)
    return {"ok": True, "result": model_to_dict(item)}


def handle_summarize_project(
    payload: Dict[str, Any], run_id: int = 0
) -> Dict[str, Any]:
    crud.record_run_step(run_id, "tool:summarize_project", payload)
    try:
        data = SummarizeProjectInput(**payload)
    except ValidationError as e:
        return {"ok": False, "error": str(e)}

    with Session(engine) as db:
        items = db.exec(select(Item).where(Item.project_id == data.project_id)).all()
    counts = {t.value: 0 for t in ItemType}
    by_parent: Dict[Optional[int], List[Item]] = defaultdict(list)
    for item in items:
        counts[item.type.value] += 1
        by_parent[item.parent_id].append(item)

    def build_lines(pid: Optional[int], depth: int, current: int = 0) -> List[str]:
        if current >= depth:
            return []
        lines: List[str] = []
        for child in by_parent.get(pid, []):
            lines.append("  " * current + f"- {child.type.value}: {child.title}")
            lines.extend(build_lines(child.id, depth, current + 1))
        return lines

    text = "\n".join(build_lines(None, data.depth))
    return {"ok": True, "result": {"text": text, "counts": counts}}


def handle_bulk_create_features(
    payload: Dict[str, Any], run_id: int = 0
) -> Dict[str, Any]:
    crud.record_run_step(run_id, "tool:bulk_create_features", payload)
    try:
        data = BulkCreateFeaturesInput(**payload)
    except ValidationError as e:
        return {"ok": False, "error": str(e)}

    with Session(engine) as db:
        parent = db.get(Item, data.parent_id)
        if not parent:
            return {"ok": False, "error": "parent not found"}
        if parent.type not in {ItemType.EPIC, ItemType.CAPABILITY}:
            return {"ok": False, "error": "features require epic or capability parent"}
        # existing titles under parent
        existing_titles = {
            i.title
            for i in db.exec(
                select(Item).where(
                    Item.parent_id == parent.id,
                    Item.type == ItemType.FEATURE,
                )
            ).all()
        }
        created: List[Item] = []
        for feature in data.items:
            if feature.title in existing_titles or any(
                c.title == feature.title for c in created
            ):
                continue
            item = Item(
                project_id=data.project_id,
                type=ItemType.FEATURE,
                title=feature.title,
                description=feature.description,
                parent_id=parent.id,
            )
            db.add(item)
            db.flush()
            created.append(item)
        db.commit()
        for item in created:
            db.refresh(item)
    return {
        "ok": True,
        "result": [model_to_dict(i) for i in created],
    }


HANDLERS = {
    "get_item": handle_get_item,
    "list_items": handle_list_items,
    "delete_item": handle_delete_item,
    "move_item": handle_move_item,
    "summarize_project": handle_summarize_project,
    "bulk_create_features": handle_bulk_create_features,
}
