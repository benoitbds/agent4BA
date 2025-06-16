import type { SpecLevel } from '../types/SpecNode'

export type NodeType = SpecLevel

export const buildEndpoint = (
  nodeType: NodeType,
  ids: {
    projectId: string
    requirementId?: string
    epicId?: string
    featureId?: string
    storyId?: string
    usecaseId?: string
  },
  isCreate: boolean
): string => {
  switch (nodeType) {
    case 'requirement':
      return `/api/v1/projects/${ids.projectId}/requirements/${isCreate ? '' : `${ids.requirementId}`}`
    case 'epic':
      return `/api/v1/projects/${ids.projectId}/requirements/${ids.requirementId}/epics/${isCreate ? '' : `${ids.epicId}`}`
    case 'feature':
      return `/api/v1/projects/${ids.projectId}/requirements/${ids.requirementId}/epics/${ids.epicId}/features/${isCreate ? '' : `${ids.featureId}`}`
    case 'story':
      return `/api/v1/projects/${ids.projectId}/epics/${ids.epicId}/features/${ids.featureId}/stories/${isCreate ? '' : `${ids.storyId}`}`
    case 'usecase':
      return `/api/v1/projects/${ids.projectId}/features/${ids.featureId}/stories/${ids.storyId}/usecases/${isCreate ? '' : `${ids.usecaseId}`}`
  }
}
