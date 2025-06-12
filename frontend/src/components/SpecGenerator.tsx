import { useState } from 'react'
import fetchWithAuth from '../lib/fetchWithAuth'
import { useAuthStore } from '../store/auth'

export default function SpecGenerator() {
  const token = useAuthStore((s) => s.token)
  const [specs, setSpecs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE}/projects/1/generate`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setSpecs(data.specs)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <button onClick={generate} disabled={!token || loading} className="bg-green-600 text-white px-4 py-2 disabled:opacity-50">
        Générer
      </button>
      <ul className="list-disc pl-4">
        {specs.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  )
}
