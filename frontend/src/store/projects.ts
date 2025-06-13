import { create } from 'zustand'
import fetchWithAuth from '../lib/fetchWithAuth'

export interface Project {
  id: number
  name: string
  description?: string | null
  owner_id: number
  created_at: string
}

interface ProjectsState {
  projects: Project[]
  selectedId: number | null
  selectedProject: Project | null
  fetchProjects: () => Promise<void>
  getById: (id: number) => Promise<Project | null>
  selectProject: (id: number) => Promise<void>
  createProject: (name: string, description: string) => Promise<void>
  updateProject: (id: number, data: { name: string; description: string }) => Promise<void>
  deleteProject: (id: number) => Promise<void>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  selectedId: null,
  selectedProject: null,
  async fetchProjects() {
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE}/projects`)
    if (!res.ok) throw new Error('fetch error')
    const data = await res.json()
    set({ projects: data })
  },
  async getById(id) {
    const existing = get().projects.find((p) => p.id === id)
    if (existing) return existing
    const res = await fetchWithAuth(
      `${import.meta.env.VITE_API_BASE}/projects/${id}`
    )
    if (!res.ok) throw new Error('fetch error')
    const project = await res.json()
    set((state) => ({ projects: [...state.projects, project] }))
    return project
  },
  async selectProject(id) {
    const project = await get().getById(id)
    set({ selectedId: id, selectedProject: project })
  },
  async createProject(name, description) {
    const userRes = await fetchWithAuth(`${import.meta.env.VITE_API_BASE}/users/me`)
    if (!userRes.ok) return
    const user = await userRes.json()
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, owner_id: user.id }),
    })
    if (res.ok) {
      const project = await res.json()
      set((state) => ({ projects: [...state.projects, project] }))
    }
  },
  async updateProject(id, data) {
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const project = await res.json()
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? project : p)),
        selectedProject:
          state.selectedId === id ? project : state.selectedProject,
      }))
    }
  },
  async deleteProject(id) {
    const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE}/projects/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        selectedProject:
          state.selectedId === id ? null : state.selectedProject,
        selectedId: state.selectedId === id ? null : state.selectedId,
      }))
    }
  },
}))
