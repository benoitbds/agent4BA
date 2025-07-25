import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import HierarchyTree from '../components/HierarchyTree'
import DetailPanel from '../components/DetailPanel'
import { useProjectsStore } from '../store/projects'
import { useSpecStore } from '../store/specSlice'
import type { Project } from '../store/projects'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const getById = useProjectsStore((s) => s.getById)
  const fetchTree = useSpecStore((s) => s.fetchTree)
  const specsLoading = useSpecStore((s) => s.loading)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getById(Number(id))
      .then((p) => {
        if (!p) throw new Error('not found')
        setProject(p)
        fetchTree(p.id)
      })
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [id, getById, fetchTree])

  if (loading || specsLoading) {
    return (
      <div className="flex justify-center p-6">
        <span className="spinner-border animate-spin h-6 w-6 mr-2"></span>
        Chargement...
      </div>
    )
  }

  if (error || !project) {
    return <p className="text-red-500 p-6">{error || 'Projet introuvable'}</p>
  }

  return (
    <div className="h-full">
      <div className="grid grid-cols-[1fr_2fr] h-full">
        <HierarchyTree editable={editMode} projectId={project.id} />
        <div className="flex flex-col">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-semibold">{project.name}</h2>
            <div className="flex gap-2">
              <button onClick={() => setEditMode(!editMode)} className="underline text-sm">
                {editMode ? 'Finir édition' : 'Éditer'}
              </button>
              <button onClick={() => navigate('/projects')} className="underline text-sm">
                Retour
              </button>
            </div>
          </div>
          <DetailPanel />
        </div>
      </div>
    </div>
  )
}
