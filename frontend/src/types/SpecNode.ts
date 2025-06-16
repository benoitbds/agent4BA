export interface RequirementRead {
  id: number
  title: string
  description?: string | null
  project_id: number
  is_active: boolean
}

export interface EpicRead {
  id: number
  title: string
  description?: string | null
  project_id: number
  parent_req_id: number
  is_active: boolean
}

export interface FeatureRead {
  id: number
  title: string
  description?: string | null
  project_id: number
  parent_epic_id: number
  is_active: boolean
}

export interface UserStoryRead {
  id: number
  title: string
  description?: string | null
  project_id: number
  parent_feature_id: number
  acceptance_criteria?: string | null
  is_active: boolean
}

export interface UseCaseRead {
  id: number
  title: string
  description?: string | null
  project_id: number
  parent_story_id: number
  steps?: string | null
  is_active: boolean
}

export type SpecNode =
  | RequirementRead
  | EpicRead
  | FeatureRead
  | UserStoryRead
  | UseCaseRead;

