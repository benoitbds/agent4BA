import { useEffect, useState, FormEvent } from 'react'
import { Project, useProjectsStore } from '../store/projects'

interface Props {
  project?: Project | null
  onFinish?: () => void
}

export default function ProjectForm({ project, onFinish }: Props) {
  const { createProject, updateProject } = useProjectsStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    setName(project?.name || '')
    setDescription(project?.description || '')
  }, [project])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      if (project) {
        await updateProject(project.id, { name, description })
        setToast({ type: 'success', message: 'Projet mis à jour' })
      } else {
        await createProject(name, description)
        setToast({ type: 'success', message: 'Projet créé' })
      }
      setName('')
      setDescription('')
      onFinish && onFinish()
    } catch (err) {
      console.error(err)
      setToast({ type: 'error', message: 'Erreur lors de l\'enregistrement' })
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="flex flex-col">
        <span>Nom</span>
        <input
          className="border rounded p-2 w-full"
          placeholder="Nom du projet"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className="flex flex-col">
        <span>Description</span>
        <input
          className="border rounded p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      {toast && (
        <p className={`${toast.type === 'success' ? 'text-green-600' : 'text-red-600'} text-sm`}>
          {toast.message}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          {project ? 'Mettre à jour' : 'Créer'}
        </button>
        {project && (
          <button type="button" onClick={onFinish} className="border px-4 py-2 rounded">
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}
