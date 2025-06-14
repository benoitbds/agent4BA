export interface FlatRequirement {
  id: number;
  title: string;
  description?: string | null;
  level: 'requirement' | 'epic' | 'feature' | 'story' | 'use_case';
  parent_req_id?: number | null;
  parent_epic_id?: number | null;
  parent_feature_id?: number | null;
  parent_story_id?: number | null;
}

export interface RequirementNode extends Omit<FlatRequirement, 'parent_req_id' | 'parent_epic_id' | 'parent_feature_id' | 'parent_story_id'> {
  children: RequirementNode[];
}

export function transformToTree(list: FlatRequirement[]): RequirementNode[] {
  const map = new Map<number, RequirementNode>();
  list.forEach((item) => {
    map.set(item.id, {
      id: item.id,
      title: item.title,
      description: item.description,
      level: item.level,
      children: [],
    });
  });

  const roots: RequirementNode[] = [];
  list.forEach((item) => {
    const node = map.get(item.id)!;
    const parentId =
      item.parent_story_id ??
      item.parent_feature_id ??
      item.parent_epic_id ??
      item.parent_req_id ??
      null;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}
