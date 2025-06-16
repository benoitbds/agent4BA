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
    set({ loading: true, error: undefined })
    try {
      const res = await apiFetch(buildEndpoint(data as SpecNode, projectId, true), {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('create failed')
      await get().fetchTree(projectId)
    } catch (e: unknown) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  async update(projectId, node) {
    set({ loading: true, error: undefined })
    try {
      const res = await apiFetch(buildEndpoint(node, projectId, false), {
        method: 'PUT',
        body: JSON.stringify(node),
      })
      if (!res.ok) throw new Error('update failed')
      await get().fetchTree(projectId)
    } catch (e: unknown) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },

  async remove(projectId, node) {
    set({ loading: true, error: undefined })
    try {
      const res = await apiFetch(buildEndpoint(node, projectId, false), { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      await get().fetchTree(projectId)
    } catch (e: unknown) {
      set({ error: (e as Error).message })
    } finally {
      set({ loading: false })
    }
  },
}))
