import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import LoginForm from './components/LoginForm'
import ProjectForm from './components/ProjectForm'
import ProjectCard from './components/ProjectCard'
import SpecHistory from './components/SpecHistory'
import fetchWithAuth from './lib/fetchWithAuth'
import { useAuthStore } from './store/auth'
import type { Project } from './store/projects'
import { useProjectsStore } from './store/projects'
import './index.css'

function App() {
  const { token, logout } = useAuthStore()
  const { projects, fetchProjects, deleteProject } = useProjectsStore()
  const [editing, setEditing] = useState<Project | null>(null)
  const [specs, setSpecs] = useState<string[]>([])
  const [loadingId, setLoadingId] = useState<number | null>(null)

  useEffect(() => {
    if (token) fetchProjects()
  }, [fetchProjects, token])

  const generate = async (id: number) => {
    setLoadingId(id)
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE}/projects/${id}/generate`, {
      method: 'POST',
    })
    if (res.ok) {
      const data = await res.json()
      setSpecs(data.specs)
    }
    setLoadingId(null)
  }

  return (
    <Layout>
      {token ? (
        <>
          <button onClick={logout} className="self-end text-sm underline">
            Déconnexion
          </button>
          <ProjectForm project={editing} onFinish={() => setEditing(null)} />
          <div className="flex flex-col gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                loading={loadingId === p.id}
                onGenerate={() => generate(p.id)}
                onEdit={() => setEditing(p)}
                onDelete={() => deleteProject(p.id)}
              />
            ))}
          </div>
          {specs.length > 0 && <SpecHistory specs={specs} />}
        </>
      ) : (
        <LoginForm />
      )}
    </Layout>
  )
}

export default App
