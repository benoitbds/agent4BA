import { create } from 'zustand'
import fetchWithAuth from '../lib/fetchWithAuth'

export type SpecLevel = 'requirement' | 'epic' | 'feature' | 'story'

export interface SpecNode {
  id: string
  title: string
  level: SpecLevel
  children: SpecNode[]
  parentId?: string | null
  description?: string
}

const apiPath = (node: SpecNode, projectId: number) => {
  const base = `${import.meta.env.VITE_API_BASE}/projects/${projectId}`
  if (node.level === 'requirement') {
    return `${base}/requirements/${node.id}`
  }
  if (node.level === 'epic' && node.parentId) {
    return `${base}/requirements/${node.parentId}/epics/${node.id}`
  }
  if (node.level === 'feature' && node.parentId) {
    return `${base}/epics/${node.parentId}/features/${node.id}`
  }
  if (node.level === 'story' && node.parentId) {
    return `${base}/features/${node.parentId}/stories/${node.id}`
  }
  return ''
}

interface SpecState {
  projectId: number | null
  nodes: SpecNode[]
  selectedId: string | null
  load: (projectId: number) => void
  select: (id: string | null) => void
  createNode: (level: SpecLevel, parentId?: string | null) => void
  rename: (id: string, title: string, description?: string) => void
  deleteNode: (id: string) => void
  indentNode: (id: string) => void
  outdentNode: (id: string) => void
}

const dummyData: SpecNode[] = [
  {
    id: 'req1',
    title: 'Requirement 1',
    level: 'requirement',
    description: 'Req desc',
    children: [
      {
        id: 'ep1',
        title: 'Epic 1',
        level: 'epic',
        description: 'Epic desc',
        children: [
          {
            id: 'feat1',
            title: 'Feature 1',
            level: 'feature',
            description: 'Feature desc',
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'req2',
    title: 'Requirement 2',
    level: 'requirement',
    description: '',
    children: []
  }
]

function addChild(nodes: SpecNode[], parentId: string, child: SpecNode): SpecNode[] {
  return nodes.map((n) =>
    n.id === parentId
      ? { ...n, children: [...n.children, child] }
      : { ...n, children: addChild(n.children, parentId, child) }
  )
}

function findNode(nodes: SpecNode[], id: string): SpecNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    const child = findNode(n.children, id)
    if (child) return child
  }
  return null
}

function updateNode(nodes: SpecNode[], id: string, changes: Partial<SpecNode>): SpecNode[] {
  return nodes.map((n) =>
    n.id === id
      ? { ...n, ...changes }
      : { ...n, children: updateNode(n.children, id, changes) }
  )
}

function removeNode(nodes: SpecNode[], id: string): SpecNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeNode(n.children, id) }))
}

export const useSpecStore = create<SpecState>((set) => ({
  projectId: null,
  nodes: dummyData,
  selectedId: null,
  load: (projectId) =>
    set(() => ({
      projectId,
      nodes: dummyData,
    })),
  select: (id) => set({ selectedId: id }),
  createNode: (level, parentId) =>
    set((state) => {
      const node: SpecNode = {
        id: Math.random().toString(36).slice(2),
        title: `New ${level}`,
        level,
        parentId: parentId ?? null,
        description: '',
        children: []
      }
      const updated = parentId ? addChild(state.nodes, parentId, node) : [...state.nodes, node]
      if (state.projectId) {
        const url = parentId
          ? apiPath({ ...node, id: '', parentId }, state.projectId).replace(/\/$/, '')
          : `${import.meta.env.VITE_API_BASE}/projects/${state.projectId}/requirements/`
        fetchWithAuth(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: node.title })
        }).then(res => {
          if (!res.ok) set({ nodes: state.nodes })
        })
      }
      return { nodes: updated }
    }),
  rename: (id, title, description?) => {
    set((state) => {
      const prev = state.nodes
      const updated = updateNode(state.nodes, id, { title, description })
      const node = findNode(state.nodes, id)
      if (state.projectId && node) {
        fetchWithAuth(apiPath(node, state.projectId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        }).then((res) => {
          if (!res.ok) set({ nodes: prev })
        })
      }
      return { nodes: updated }
    })
  },
  deleteNode: (id) => {
    set((state) => {
      const prev = state.nodes
      const updated = removeNode(state.nodes, id)
      const node = findNode(state.nodes, id)
      if (state.projectId && node) {
        fetchWithAuth(apiPath(node, state.projectId), { method: 'DELETE' }).then(
          (res) => {
            if (!res.ok) set({ nodes: prev })
          }
        )
      }
      return { nodes: updated, selectedId: state.selectedId === id ? null : state.selectedId }
    })
  },
  indentNode: (id) => {
    // TODO integrate API and real tree reordering
    console.log('indent', id)
  },
  outdentNode: (id) => {
    // TODO integrate API and real tree reordering
    console.log('outdent', id)
  }
}))
