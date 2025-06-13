// frontend/src/types/specs.ts
export interface UserStory {
  text: string; // Assuming user stories are strings for now, adjust if they become objects
}

export interface Feature {
  title: string;
  description: string;
  user_stories: string[]; // Array of user story strings
}

export interface Epic {
  title: string;
  description: string;
  features: Feature[];
}
