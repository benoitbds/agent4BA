import { useEffect, useState } from 'react'
import fetchWithAuth from '../lib/fetchWithAuth'

interface Props {
  projectId: number
}

export default function SpecHistory({ projectId }: Props) {
  const [specs, setSpecs] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_BASE}/projects/${projectId}/specs`
      )
      if (res.ok) {
        const data = await res.json()
        setSpecs(data.specs || data)
      }
    }
    load()
  }, [projectId])

  return (
    <div className="h-60 overflow-y-auto border rounded p-4">
      <ol className="list-decimal list-inside text-sm marker:text-gray-400">
        {specs.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  )
}
