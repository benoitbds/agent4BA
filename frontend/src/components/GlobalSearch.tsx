import { useState } from 'react'
import { useSpecStore } from '../store/specSlice'

export default function GlobalSearch() {
  const [q, setQ] = useState('')
  const nodes = useSpecStore(s => s.nodes)
  const results = nodes.filter(n => n.title.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className='p-4'>
      <input
        className='border rounded p-2 w-full'
        placeholder='Global search'
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <ul className='mt-2 text-sm max-h-56 overflow-y-auto'>
        {results.map(r => (
          <li key={r.id}>{r.title}</li>
        ))}
      </ul>
    </div>
  )
}
