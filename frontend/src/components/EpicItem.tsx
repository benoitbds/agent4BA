// frontend/src/components/EpicItem.tsx
import React from 'react';
import type { Epic as EpicType } from '../types/specs'; // Adjust path if needed
import FeatureItem from './FeatureItem';

interface EpicItemProps {
  epic: EpicType;
}

const EpicItem: React.FC<EpicItemProps> = ({ epic }) => {
  return (
    <div className="mb-4 p-4 border border-green-300 rounded bg-green-50 shadow">
      <h4 className="text-md font-bold text-green-800">{epic.title}</h4>
      <p className="text-gray-700 mb-2">{epic.description}</p>
      {epic.features && epic.features.length > 0 && (
        <div>
          <h5 className="font-semibold text-gray-600 mt-2 mb-1">Features:</h5>
          {epic.features.map((feature) => (
            <FeatureItem key={feature.id} feature={feature} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EpicItem;
