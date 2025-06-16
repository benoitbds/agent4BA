import type { SpecNode, SpecLevel } from '../types/SpecNode'

export function buildEndpoint(node: Partial<SpecNode> & { level: SpecLevel }, projectId: number): string {
  let path = `/api/v1/projects/${projectId}`
  switch (node.level) {
    case 'requirement':
      path += `/requirements/${node.id ?? ''}`
      break
    case 'epic':
      path += `/requirements/${node.parent_req_id}/epics/${node.id ?? ''}`
      break
    case 'feature':
      path += `/requirements/${node.parent_req_id}/epics/${node.parent_epic_id}/features/${node.id ?? ''}`
      break
    case 'story':
      path += `/epics/${node.parent_epic_id}/features/${node.parent_feature_id}/stories/${node.id ?? ''}`
      break
    case 'usecase':
      path += `/features/${node.parent_feature_id}/stories/${node.parent_story_id}/usecases/${node.id ?? ''}`
      break
  }
  return path.replace(/\/$/, '')
}
