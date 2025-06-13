// frontend/src/components/FeatureItem.tsx
import React from 'react';
import type { Feature as FeatureType } from '../types/specs'; // Adjust path if needed
import UserStoryListItem from './UserStoryListItem';

interface FeatureItemProps {
  feature: FeatureType;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature }) => {
  return (
    <div className="ml-4 mb-3 p-3 border border-blue-200 rounded bg-blue-50">
      <h5 className="font-semibold text-blue-700">{feature.title}</h5>
      <p className="text-sm text-gray-600 mb-1">{feature.description}</p>
      {feature.user_stories && feature.user_stories.length > 0 && (
        <>
          <h6 className="text-xs font-medium text-gray-500 mt-1">User Stories:</h6>
          <ul className="pl-4">
            {feature.user_stories.map((story, index) => (
              <UserStoryListItem key={index} story={story} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default FeatureItem;
