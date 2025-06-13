import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ProjectForm from '../components/ProjectForm'
import SpecGenerator from '../components/SpecGenerator'
import SpecHistory from '../components/SpecHistory'
import { useProjectsStore } from '../store/projects'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedProject, selectProject } = useProjectsStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [specs, setSpecs] = useState<string[]>([])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    selectProject(Number(id))
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [id, selectProject])

  const onGenerated = (s: string[]) => setSpecs(s)

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <span className="spinner-border animate-spin h-6 w-6"></span>
      </div>
    )
  }

  if (error || !selectedProject) {
    return <p className="text-red-500 p-6">{error || 'Projet introuvable'}</p>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
        <button onClick={() => navigate('/projects')} className="underline">
          Retour aux projets
        </button>
      </div>
      <ProjectForm project={selectedProject} />
      <SpecGenerator projectId={selectedProject.id} onGenerated={onGenerated} />
      <SpecHistory specs={specs} />
    </div>
  )
}
