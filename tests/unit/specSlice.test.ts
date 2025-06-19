import { afterEach, describe, expect, it } from 'vitest'
import { rest } from 'msw'
import { server } from '../setupTests'
import { useSpecStore } from '../../frontend/src/store/specSlice'

afterEach(() => {
  server.resetHandlers()
  useSpecStore.setState({ nodes: [], loading: false })
})

describe('specSlice async actions', () => {
  it('fetchTree stores nodes', async () => {
    server.use(
      rest.get(
        'http://localhost/api/v1/projects/:id/requirements/',
        (_req, res, ctx) =>
          res(
            ctx.status(200),
            ctx.json([
              { id: 1, title: 'Req', level: 'requirement', project_id: 1 },
            ]),
          ),
      ),
    )

    await useSpecStore.getState().fetchTree(1)
    expect(useSpecStore.getState().nodes.length).toBe(1)
  })

  it('restore previous state when create fails', async () => {
    const original = {
      id: 1,
      title: 'Req',
      level: 'requirement',
      project_id: 1,
    }
    useSpecStore.setState({ nodes: [original], loading: false })
    server.use(
      rest.post(
        'http://localhost/api/v1/projects/:id/requirements/',
        (_req, res, ctx) => res(ctx.status(500)),
      ),
    )

    await useSpecStore
      .getState()
      .create(1, { title: 'New', level: 'requirement' })
    expect(useSpecStore.getState().nodes).toEqual([original])
  })

  it('restore previous state when update fails', async () => {
    const original = {
      id: 1,
      title: 'Req',
      level: 'requirement',
      project_id: 1,
    }
    useSpecStore.setState({ nodes: [original], loading: false })
    server.use(
      rest.put(
        'http://localhost/api/v1/projects/:pid/requirements/:id',
        (_req, res, ctx) => res(ctx.status(500)),
      ),
    )

    await useSpecStore.getState().update(1, { ...original, title: 'Upd' })
    expect(useSpecStore.getState().nodes).toEqual([original])
  })

  it('restore previous state when delete fails', async () => {
    const original = {
      id: 1,
      title: 'Req',
      level: 'requirement',
      project_id: 1,
    }
    useSpecStore.setState({ nodes: [original], loading: false })
    server.use(
      rest.delete(
        'http://localhost/api/v1/projects/:pid/requirements/:id',
        (_req, res, ctx) => res(ctx.status(500)),
      ),
    )

    await useSpecStore.getState().remove(1, original)
    expect(useSpecStore.getState().nodes).toEqual([original])
  })
})
