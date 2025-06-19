import { useState } from 'react'
import { useSpecStore } from '../store/specSlice'

export default function SpecCommandPalette() {
  const nodes = useSpecStore(s => s.nodes)
  const [query, setQuery] = useState('')
  const results = nodes.filter(n => n.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className='p-4'>
      <input
        type='text'
        className='border p-2 rounded w-full mb-2'
        placeholder='Search specs'
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <ul className='text-sm max-h-40 overflow-y-auto'>
        {results.map(r => (
          <li key={r.id}>{r.title}</li>
        ))}
      </ul>
    </div>
  )
}
