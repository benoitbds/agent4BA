import { useMemo } from 'react'
import { useSpecStore } from '../store/specSlice'

export default function StoryMapBoard() {
  const nodes = useSpecStore(s => s.nodes)
  const epics = useMemo(
    () => nodes.filter(n => n.level === 'epic'),
    [nodes]
  )

  return (
    <div className='flex overflow-x-auto gap-4 p-4'>
      {epics.map(epic => (
        <div key={epic.id} className='min-w-[16rem]'>
          <h3 className='font-semibold mb-2'>{epic.title}</h3>
          {nodes
            .filter(n => n.parent_epic_id === epic.id && n.level === 'feature')
            .map(feature => (
              <div key={feature.id} className='mb-3 border rounded p-2'>
                <h4 className='font-medium'>{feature.title}</h4>
                <ul className='list-disc list-inside text-sm'>
                  {nodes
                    .filter(
                      n =>
                        n.parent_feature_id === feature.id &&
                        n.level === 'story'
                    )
                    .map(story => (
                      <li key={story.id}>{story.title}</li>
                    ))}
                </ul>
              </div>
            ))}
        </div>
      ))}
    </div>
  )
}
