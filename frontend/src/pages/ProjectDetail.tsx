import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import TreeView from '../components/TreeView'
import RightPane from '../components/RightPane'
import { useProjectsStore } from '../store/projects'
import { useRequirementsStore } from '../store/requirements'
import type { Project } from '../store/projects'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const getById = useProjectsStore((s) => s.getById)
  const fetchTree = useRequirementsStore((s) => s.fetchTree)
  const reqLoading = useRequirementsStore((s) => s.loading)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading || reqLoading) {
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
    <div className="flex">
      <TreeView projectId={project.id} />
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <h2 className="text-xl font-semibold">{project.name}</h2>
          <div className="flex gap-4 text-sm">
            <button onClick={() => navigate('/projects')} className="underline">
              Retour
            </button>
            <Link to={`/projects/${project.id}/specs`} className="underline">
              Specs (β)
            </Link>
          </div>
        </div>
        <RightPane />
      </div>
    </div>
  )
}
