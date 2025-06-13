// frontend/src/components/UserStoryListItem.tsx
import React from 'react';

interface UserStoryListItemProps {
  story: string;
}

const UserStoryListItem: React.FC<UserStoryListItemProps> = ({ story }) => {
  return <li className="text-sm ml-4 list-disc">{story}</li>;
};

export default UserStoryListItem;
