import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'

interface Props {
  title?: string
  description?: string | null
  onSave: (values: { title: string; description: string }) => void
  onCancel?: () => void
}

export default function NodeForm({ title, description, onSave, onCancel }: Props) {
  const [t, setT] = useState('')
  const [d, setD] = useState('')
  useEffect(() => {
    setT(title || '')
    setD(description || '')
  }, [title, description])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSave({ title: t, description: d })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="flex flex-col">
        <span>Titre</span>
        <input className="border rounded p-2" value={t} onChange={(e) => setT(e.target.value)} />
      </label>
      <label className="flex flex-col">
        <span>Description</span>
        <textarea className="border rounded p-2" value={d} onChange={(e) => setD(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          Enregistrer
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="border px-4 py-2 rounded">
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
