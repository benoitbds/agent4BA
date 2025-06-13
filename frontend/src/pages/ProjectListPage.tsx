import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectForm from '../components/ProjectForm'
import { useProjectsStore } from '../store/projects'

export default function ProjectListPage() {
  const { projects, fetchProjects } = useProjectsStore()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    fetchProjects()
      .catch(() => setError('Erreur lors du chargement'))
      .finally(() => setLoading(false))
  }, [fetchProjects])

  return (
    <div className="grid lg:grid-cols-2 gap-4 p-8">
      <div className="col-span-full mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Créer nouveau projet
        </button>
      </div>
      {showForm && (
        <div className="col-span-full mb-4">
          <ProjectForm onFinish={() => setShowForm(false)} />
        </div>
      )}
      {error && <p className="text-red-500 col-span-full">{error}</p>}
      {loading ? (
        <div className="flex justify-center col-span-full p-4">
          <span className="spinner-border animate-spin h-6 w-6"></span>
        </div>
      ) : (
        <>
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate('/projects/' + p.id)}
              className="rounded-xl shadow p-4 bg-white cursor-pointer"
            >
              <h3 className="font-semibold">{p.name}</h3>
              {p.description && (
                <p className="text-sm text-gray-600">{p.description}</p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
