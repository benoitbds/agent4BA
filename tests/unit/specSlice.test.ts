import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { useSpecStore } from '../../frontend/src/store/specSlice'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  useSpecStore.setState({ nodes: [], loading: false })
})
afterAll(() => server.close())

describe('specSlice async actions', () => {
  it('fetchTree stores nodes', async () => {
    server.use(
      rest.get('/api/v1/projects/:id/requirements/', (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([{ id: 1, title: 'Req', level: 'requirement', project_id: 1 }])
        )
      )
    )

    await useSpecStore.getState().fetchTree(1)
    expect(useSpecStore.getState().nodes.length).toBe(1)
  })
})
