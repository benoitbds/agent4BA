import { create } from 'zustand'
import { apiFetch } from '../lib/api'
import { buildEndpoint } from '../utils/endpoint'
import type { SpecNode } from '../types/SpecNode'

interface SpecState {
  nodes: SpecNode[]
  loading: boolean
  error?: string
  fetchTree: (projectId: number) => Promise<void>
  create: (projectId: number, data: Omit<SpecNode, 'id' | 'project_id'>) => Promise<void>
  update: (projectId: number, node: SpecNode) => Promise<void>
  remove: (projectId: number, node: SpecNode) => Promise<void>
}

export const useSpecStore = create<SpecState>((set, get) => ({
  nodes: [],
  loading: false,
  error: undefined,

  async fetchTree(projectId) {
    set({ loading: true, error: undefined })
    try {
      const res = await apiFetch(`/api/v1/projects/${projectId}/requirements/`)
      if (!res.ok) throw new Error('fetch error')
      const data = (await res.json()) as SpecNode[]
      set({ nodes: data, loading: false })
    } catch {
      set({ error: 'Failed to load', loading: false })
    }
  },

  async create(projectId, data) {
    const tempId = Date.now()
    const optimistic: SpecNode = { id: tempId, project_id: projectId, ...data }
    set((state) => ({ nodes: [...state.nodes, optimistic] }))
    const res = await apiFetch(buildEndpoint(data as SpecNode, projectId), {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (res.ok) {
      const created = await res.json()
      set((state) => ({
        nodes: state.nodes.map((n) => (n.id === tempId ? created : n)),
      }))
    } else {
      set((state) => ({ nodes: state.nodes.filter((n) => n.id !== tempId) }))
    }
  },

  async update(projectId, node) {
    const prev = get().nodes
    set({ nodes: prev.map((n) => (n.id === node.id ? node : n)) })
    const res = await apiFetch(buildEndpoint(node, projectId), {
      method: 'PUT',
      body: JSON.stringify(node),
    })
    if (!res.ok) {
      set({ nodes: prev })
    } else {
      const updated = await res.json()
      set((state) => ({ nodes: state.nodes.map((n) => (n.id === node.id ? updated : n)) }))
    }
  },

  async remove(projectId, node) {
    const prev = get().nodes
    set({ nodes: prev.filter((n) => n.id !== node.id) })
    const res = await apiFetch(buildEndpoint(node, projectId), { method: 'DELETE' })
    if (!res.ok) {
      set({ nodes: prev })
    }
  },
}))
