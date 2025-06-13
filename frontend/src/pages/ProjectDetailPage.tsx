import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../components/ProjectForm'
import SpecGenerator from '../components/SpecGenerator'
import SpecHistory from '../components/SpecHistory'
import { useProjectsStore } from '../store/projects'
import type { Project } from '../store/projects'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const getById = useProjectsStore((s) => s.getById)
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
      })
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [id, getById])

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <span className="spinner-border animate-spin h-6 w-6"></span>
      </div>
    )
  }

  if (error || !project) {
    return <p className="text-red-500 p-6">{error || 'Projet introuvable'}</p>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{project.name}</h2>
        <button onClick={() => navigate('/projects')} className="underline">
          Retour
        </button>
      </div>
      <ProjectForm project={project} />
      <SpecGenerator projectId={project.id} />
      <SpecHistory projectId={project.id} />
    </div>
  )
}
