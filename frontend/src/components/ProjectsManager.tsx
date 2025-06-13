import { useEffect, useState } from 'react'
import { useProjectsStore } from '../store/projects'
import SpecGenerator from './SpecGenerator'

export default function ProjectsManager() {
  const { projects, fetchProjects, createProject, updateProject, deleteProject } = useProjectsStore()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setDescription('')
  }

  const startEdit = (id: number) => {
    const p = projects.find((pr) => pr.id === id)
    if (!p) return
    setEditingId(id)
    setName(p.name)
    setDescription(p.description || '')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await updateProject(editingId, { name, description })
    } else {
      await createProject(name, description)
    }
    resetForm()
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex flex-col gap-2">
        <input
          className="border p-2"
          placeholder="Nom du projet"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2">
            {editingId ? 'Mettre à jour' : 'Créer'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-4 py-2">
              Annuler
            </button>
          )}
        </div>
      </form>
      <ul className="flex flex-col gap-2">
        {projects.map((p) => (
          <li key={p.id} className="border p-2 flex justify-between items-center">
            <span onClick={() => setSelectedId(p.id)} className="cursor-pointer">
              {p.name}
            </span>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p.id)} className="text-sm underline">
                Éditer
              </button>
              <button
                onClick={() => deleteProject(p.id)}
                className="text-sm underline text-red-600"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>
      {selectedId && (
        <div className="mt-4">
          <SpecGenerator projectId={selectedId} />
        </div>
      )}
    </div>
  )
}
