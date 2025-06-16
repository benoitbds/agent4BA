import { create } from 'zustand'

export type SpecLevel = 'requirement' | 'epic' | 'feature' | 'story'

export interface SpecNode {
  id: string
  title: string
  level: SpecLevel
  children: SpecNode[]
}

interface SpecState {
  projectId: number | null
  nodes: SpecNode[]
  selectedId: string | null
  load: (projectId: number) => void
  select: (id: string | null) => void
  createNode: (level: SpecLevel, parentId?: string | null) => void
  indentNode: (id: string) => void
  outdentNode: (id: string) => void
}

const dummyData: SpecNode[] = [
  {
    id: 'req1',
    title: 'Requirement 1',
    level: 'requirement',
    children: [
      {
        id: 'ep1',
        title: 'Epic 1',
        level: 'epic',
        children: [
          {
            id: 'feat1',
            title: 'Feature 1',
            level: 'feature',
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

export const useSpecStore = create<SpecState>((set) => ({
  projectId: null,
  nodes: dummyData,
  selectedId: null,
  load: (projectId) =>
    set(() => ({
      projectId,
      nodes: dummyData, // TODO fetch real data
    })),
  select: (id) => set({ selectedId: id }),
  createNode: (level, parentId) =>
    set((state) => {
      const node: SpecNode = {
        id: Math.random().toString(36).slice(2),
        title: `New ${level}`,
        level,
        children: []
      }
      if (!parentId) {
        return { nodes: [...state.nodes, node] }
      }
      return { nodes: addChild(state.nodes, parentId, node) }
    }),
  indentNode: (id) => {
    // TODO integrate API and real tree reordering
    console.log('indent', id)
  },
  outdentNode: (id) => {
    // TODO integrate API and real tree reordering
    console.log('outdent', id)
  }
}))
