export type SpecLevel = 'requirement' | 'epic' | 'feature' | 'story' | 'usecase'

export interface SpecNode {
  id: number
  title: string
  description?: string | null
  project_id: number
  level: SpecLevel
  parent_req_id?: number | null
  parent_epic_id?: number | null
  parent_feature_id?: number | null
  parent_story_id?: number | null
}
