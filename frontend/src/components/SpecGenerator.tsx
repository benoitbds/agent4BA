import { useState } from 'react'
import fetchWithAuth from '../lib/fetchWithAuth'
import { useAuthStore } from '../store/auth'

interface Props {
  projectId: number
  onGenerated?: (specs: string[]) => void
}
export default function SpecGenerator({ projectId, onGenerated }: Props) {
  const token = useAuthStore((s) => s.token)
  const [specs, setSpecs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_BASE}/projects/${projectId}/generate`,
      { method: 'POST' }
    )
    if (res.ok) {
      const data = await res.json()
      setSpecs(data.specs)
      onGenerated?.(data.specs)
    } else {
      setError('Erreur lors de la génération')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={generate}
        disabled={!token || loading}
        className="bg-green-600 text-white px-4 py-2 disabled:opacity-50 flex items-center justify-center"
      >
        {loading && (
          <span className="spinner-border animate-spin h-4 w-4 mr-2" />
        )}
        Générer
      </button>
      <ul className="list-disc pl-4">
        {specs.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
