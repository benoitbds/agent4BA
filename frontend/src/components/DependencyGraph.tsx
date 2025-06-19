import { useSpecStore } from '../store/specSlice'

export default function DependencyGraph() {
  const nodes = useSpecStore(s => s.nodes)
  return (
    <div className='p-4'>
      <h3 className='font-semibold mb-2'>Dependencies</h3>
      <ul className='space-y-1 text-sm'>
        {nodes.map(n => {
          const children = nodes.filter(c => c.parent_story_id === n.id || c.parent_feature_id === n.id || c.parent_epic_id === n.id || c.parent_req_id === n.id)
          return (
            <li key={n.id}>
              {n.title}
              {children.length > 0 && (
                <span className='text-gray-500'> → {children.map(c => c.title).join(', ')}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
