import { create } from 'zustand'
import * as api from '../api/requirements'
import {
  transformToTree,
  type RequirementNode,
  type FlatRequirement,
} from '../utils/transformToTree'

export type { RequirementNode } from '../utils/transformToTree'

export interface NewRequirement {
  title: string
  description?: string
}


interface RequirementsState {
  tree: RequirementNode[]
  loading: boolean
  error: string | null
  selectedId: number | null
  projectId: number | null
  fetchTree: (projectId: number) => Promise<void>
  select: (id: number | null) => void
  addNode: (parentId: number | null, data: Partial<RequirementNode>) => Promise<void>
  updateNode: (id: number, data: Partial<RequirementNode>) => Promise<void>
  createRootRequirement: (
    projectId: number,
    data: NewRequirement
  ) => Promise<void>
}

export const useRequirementsStore = create<RequirementsState>((set, get) => ({
  tree: [],
  loading: false,
  error: null,
  selectedId: null,
  projectId: null,
  async fetchTree(projectId) {
    set({ loading: true, error: null, projectId })
    try {
      const list = (await api.getRequirements(projectId)) as FlatRequirement[]
      const tree = transformToTree(list)
      set({ tree, loading: false })
    } catch {
      set({ error: 'Erreur de chargement', loading: false })
    }
  },
  select(id) {
    set({ selectedId: id })
  },
  async createRootRequirement(projectId: number, data: NewRequirement) {
    set({ loading: true })
    try {
      await api.createRequirement(projectId, {
        title: data.title,
        description: data.description ?? '',
      })
      await get().fetchTree(projectId)
    } finally {
      set({ loading: false })
    }
  },
  async addNode(parentId, data) {
    const { projectId } = get()
    if (!projectId) return
    let res: Response | null = null
    if (data.level === 'requirement' || parentId === null) {
      res = await api.createRequirement(projectId, {
        title: data.title || '',
        description: data.description || undefined,
      })
    } else if (data.level === 'epic' && parentId) {
      res = await api.createEpic(projectId, parentId, {
        title: data.title || '',
        description: data.description || undefined,
      })
    } else if (data.level === 'feature' && parentId) {
      const parentNode = findNode(get().tree, parentId)
      if (!parentNode) return
      const reqNode = findParentRequirement(get().tree, parentId)
      if (!reqNode) return
      res = await api.createFeature(projectId, reqNode.id, parentId, {
        title: data.title || '',
        description: data.description || undefined,
      })
    }
    if (res && res.ok) {
      await get().fetchTree(projectId)
    }
  },
  async updateNode(id, data) {
    const { projectId } = get()
    if (!projectId) return
    const node = findNode(get().tree, id)
    if (!node) return
    let url = ''
    if (node.level === 'requirement') {
      url = `${import.meta.env.VITE_API_BASE}/projects/${projectId}/requirements/${id}`
    } else if (node.level === 'epic') {
      const req = findParentRequirement(get().tree, id)
      if (!req) return
      url = `${import.meta.env.VITE_API_BASE}/projects/${projectId}/requirements/${req.id}/epics/${id}`
    } else if (node.level === 'feature') {
      const epic = findParent(get().tree, id, 'epic')
      const req = findParentRequirement(get().tree, epic?.id || 0)
      if (!epic || !req) return
      url = `${import.meta.env.VITE_API_BASE}/projects/${projectId}/requirements/${req.id}/epics/${epic.id}/features/${id}`
    }
    if (url) {
      const payload = {
        title: data.title,
        description: data.description ?? undefined,
      }
      const res = await api.updateNode(url, payload)
      if (res.ok) {
        await get().fetchTree(projectId)
      }
    }
  },
}))

function findNode(nodes: RequirementNode[], id: number): RequirementNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const child = findNode(n.children, id)
    if (child) return child
  }
  return null
}

function findParentRequirement(nodes: RequirementNode[], id: number): RequirementNode | null {
  for (const n of nodes) {
    if (n.children.find((c) => c.id === id)) return n
    const child = findParentRequirement(n.children, id)
    if (child) return child
  }
  return null
}

function findParent(nodes: RequirementNode[], id: number, level: string): RequirementNode | null {
  for (const n of nodes) {
    for (const c of n.children) {
      if (c.id === id && c.level === level) return n
    }
    const child = findParent(n.children, id, level)
    if (child) return child
  }
  return null
}
