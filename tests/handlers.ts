import { rest } from 'msw'

export const handlers = [
  rest.get('/api/v1/projects/:id/requirements/', (_req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json([{ id: 1, title: 'Req', level: 'requirement', project_id: 1 }])
    )
  ),
]
