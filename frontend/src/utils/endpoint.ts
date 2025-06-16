import type { SpecNode } from '../types/SpecNode'

export const buildEndpoint = (
  node: SpecNode,
  projectId: number,
  isCreate: boolean
): string => {
  const pid = String(projectId)
  switch (node.level) {
    case 'requirement':
      return `/api/v1/projects/${pid}/requirements/${isCreate ? '' : node.id}`
    case 'epic':
      return `/api/v1/projects/${pid}/requirements/${node.parent_req_id}/epics/${isCreate ? '' : node.id}`
    case 'feature':
      return `/api/v1/projects/${pid}/requirements/${node.parent_req_id}/epics/${node.parent_epic_id}/features/${isCreate ? '' : node.id}`
    case 'story':
      return `/api/v1/projects/${pid}/epics/${node.parent_epic_id}/features/${node.parent_feature_id}/stories/${isCreate ? '' : node.id}`
    case 'usecase':
      return `/api/v1/projects/${pid}/features/${node.parent_feature_id}/stories/${node.parent_story_id}/usecases/${isCreate ? '' : node.id}`
  }
}
