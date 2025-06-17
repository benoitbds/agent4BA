// frontend/src/types/specs.ts
export interface UserStory {
  id: string;
  text: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  user_stories: UserStory[];
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  features: Feature[];
}
