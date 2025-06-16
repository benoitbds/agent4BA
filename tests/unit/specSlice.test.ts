import { beforeAll, afterAll, afterEach, describe, it, expect } from 'vitest'
import { http } from 'msw/lib/core/http.mjs'
import { setupServer } from 'msw/node'
import { useSpecStore } from '../../frontend/src/store/specSlice'
import type { SpecNode, SpecLevel } from '../../frontend/src/types/SpecNode'

let db: SpecNode[] = []

const server = setupServer(
  http.get('/api/v1/projects/:pid/requirements/', (req, res, ctx) => {
    const pid = Number(req.params.pid)
    return res(ctx.json(db.filter((n) => n.project_id === pid)))
  }),
  http.post('*', async (req, res, ctx) => {
    const data = await req.json()
    const node: SpecNode = { id: Date.now(), project_id: 1, ...data }
    db.push(node)
    return res(ctx.json(node))
  }),
  http.put('*', async (req, res, ctx) => {
    const data = await req.json()
    const idx = db.findIndex((n) => n.id === data.id)
    if (idx >= 0) db[idx] = { ...db[idx], ...data }
    return res(ctx.json(db[idx]))
  }),
  http.delete('*', (req, res, ctx) => {
    const id = Number(req.url.pathname.match(/\d+$/)?.[0])
    db = db.filter((n) => n.id !== id)
    return res(ctx.status(200))
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())
afterEach(() => {
  server.resetHandlers()
  useSpecStore.setState({ nodes: [], loading: false, error: undefined })
  db = []
})

const reqNode: SpecNode = { id: 1, title: 'req', level: 'requirement', project_id: 1 }
const epicNode: SpecNode = { id: 2, title: 'epic', level: 'epic', project_id: 1, parent_req_id: 1 }
const featureNode: SpecNode = {
  id: 3,
  title: 'feature',
  level: 'feature',
  project_id: 1,
  parent_req_id: 1,
  parent_epic_id: 2,
}
const storyNode: SpecNode = {
  id: 4,
  title: 'story',
  level: 'story',
  project_id: 1,
  parent_epic_id: 2,
  parent_feature_id: 3,
}
const usecaseNode: SpecNode = {
  id: 5,
  title: 'uc',
  level: 'usecase',
  project_id: 1,
  parent_feature_id: 3,
  parent_story_id: 4,
}

function parents(level: SpecLevel): SpecNode[] {
  switch (level) {
    case 'requirement':
      return []
    case 'epic':
      return [reqNode]
    case 'feature':
      return [reqNode, epicNode]
    case 'story':
      return [reqNode, epicNode, featureNode]
    case 'usecase':
      return [reqNode, epicNode, featureNode, storyNode]
  }
}

function nodeFor(level: SpecLevel): SpecNode {
  switch (level) {
    case 'requirement':
      return { ...reqNode }
    case 'epic':
      return { ...epicNode }
    case 'feature':
      return { ...featureNode }
    case 'story':
      return { ...storyNode }
    case 'usecase':
      return { ...usecaseNode }
  }
}

describe('specSlice CRUD actions', () => {
  const levels: SpecLevel[] = ['requirement', 'epic', 'feature', 'story', 'usecase']

  levels.forEach((level) => {
    it(`creates ${level}`, async () => {
      db = parents(level)
      await useSpecStore.getState().fetchTree(1)
      const { id, project_id, ...data } = nodeFor(level)
      await useSpecStore.getState().create(1, data)
      expect(useSpecStore.getState().nodes.some((n) => n.level === level)).toBe(true)
    })

    it(`updates ${level}`, async () => {
      const node = nodeFor(level)
      db = [...parents(level), node]
      await useSpecStore.getState().fetchTree(1)
      await useSpecStore.getState().update(1, { ...node, title: 'upd' })
      expect(useSpecStore.getState().nodes.find((n) => n.id === node.id)?.title).toBe('upd')
    })

    it(`deletes ${level}`, async () => {
      const node = nodeFor(level)
      db = [...parents(level), node]
      await useSpecStore.getState().fetchTree(1)
      await useSpecStore.getState().remove(1, node)
      expect(useSpecStore.getState().nodes.find((n) => n.id === node.id)).toBeUndefined()
    })
  })
})
