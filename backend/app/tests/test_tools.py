import pytest
from sqlmodel import Session, SQLModel

from app.db.session import engine
from app.models import Item, ItemType, Project, User
from agents.tools import (
    handle_bulk_create_features,
    handle_list_items,
    handle_move_item,
)


@pytest.fixture(autouse=True)
def setup_db():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


@pytest.fixture
def project():
    with Session(engine) as session:
        user = User(
            username="tester",
            email="t@example.com",
            hashed_password="x",
            is_active=True,
            is_superuser=False,
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        project = Project(name="Proj", owner_id=user.id)
        session.add(project)
        session.commit()
        session.refresh(project)
        return project


def test_list_items_filters(project):
    with Session(engine) as session:
        epic = Item(project_id=project.id, type=ItemType.EPIC, title="Epic1")
        session.add(epic)
        session.flush()
        feat = Item(
            project_id=project.id,
            type=ItemType.FEATURE,
            title="Alpha Feature",
            parent_id=epic.id,
        )
        session.add(feat)
        session.commit()

    res = handle_list_items({"project_id": project.id})
    assert res["ok"] and len(res["result"]) == 2

    res_type = handle_list_items({"project_id": project.id, "type": "Epic"})
    assert res_type["ok"] and len(res_type["result"]) == 1
    assert res_type["result"][0]["type"] == ItemType.EPIC

    res_query = handle_list_items({"project_id": project.id, "query": "Alpha"})
    assert res_query["ok"] and len(res_query["result"]) == 1
    assert res_query["result"][0]["title"] == "Alpha Feature"


def test_move_item_validations(project):
    with Session(engine) as session:
        epic = Item(project_id=project.id, type=ItemType.EPIC, title="Epic1")
        session.add(epic)
        session.flush()
        cap = Item(
            project_id=project.id,
            type=ItemType.CAPABILITY,
            title="Cap1",
            parent_id=epic.id,
        )
        session.add(cap)
        session.flush()
        feat = Item(
            project_id=project.id,
            type=ItemType.FEATURE,
            title="Feat1",
            parent_id=cap.id,
        )
        session.add(feat)
        session.commit()
        epic_id, cap_id, feat_id = epic.id, cap.id, feat.id

    # Invalid parent type
    res = handle_move_item({"id": epic_id, "new_parent_id": feat_id})
    assert not res["ok"]

    # Cycle detection
    res = handle_move_item({"id": cap_id, "new_parent_id": feat_id})
    assert not res["ok"]

    # Same parent no-op
    res = handle_move_item({"id": feat_id, "new_parent_id": cap_id})
    assert res["ok"] and res["result"]["parent_id"] == cap_id


def test_bulk_create_features(project):
    with Session(engine) as session:
        epic = Item(project_id=project.id, type=ItemType.EPIC, title="Epic1")
        session.add(epic)
        session.commit()
        epic_id = epic.id
        existing = Item(
            project_id=project.id,
            type=ItemType.FEATURE,
            title="Existing",
            parent_id=epic_id,
        )
        session.add(existing)
        session.commit()

    payload = {
        "project_id": project.id,
        "parent_id": epic_id,
        "items": [
            {"title": "Existing"},
            {"title": "New1"},
            {"title": "New1"},
            {"title": "New2"},
        ],
    }
    res = handle_bulk_create_features(payload)
    assert res["ok"] and len(res["result"]) == 2
    titles = {f["title"] for f in res["result"]}
    assert titles == {"New1", "New2"}
