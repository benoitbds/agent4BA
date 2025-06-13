import type { Project } from '../store/projects'

interface Props {
  project: Project
  onGenerate: () => void
  loading?: boolean
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectCard({ project, onGenerate, loading, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl shadow p-4 flex justify-between">
      <div>
        <h3 className="font-semibold">{project.name}</h3>
        {project.description && <p className="text-sm text-gray-600">{project.description}</p>}
      </div>
      <div className="flex gap-2 items-start">
        <button
          onClick={onGenerate}
          className="bg-indigo-600 text-white px-3 py-1 flex items-center rounded"
        >
          {loading && <span className="spinner-border animate-spin h-4 w-4 mr-2" />}
          Générer
        </button>
        <button onClick={onEdit} className="border px-3 py-1 rounded">
          Éditer
        </button>
        <button onClick={onDelete} className="border px-3 py-1 rounded">
          Supprimer
        </button>
      </div>
    </div>
  )
}
