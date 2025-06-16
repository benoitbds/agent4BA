import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSpecStore } from '../../frontend/src/store/specSlice'
import { apiFetch } from '../../frontend/src/lib/api'

vi.mock('../../frontend/src/lib/api', () => ({ apiFetch: vi.fn() }))

const mockResponse = (data: unknown) => Promise.resolve({ ok: true, json: () => Promise.resolve(data) }) as unknown as Response

describe('specSlice async actions', () => {
  beforeEach(() => {
    useSpecStore.setState({ nodes: [], loading: false })
    ;(apiFetch as unknown as vi.Mock).mockResolvedValue(mockResponse([{ id: 1, title: 'Req', level: 'requirement', project_id: 1 }]))
  })

  it('fetchTree stores nodes', async () => {
    await useSpecStore.getState().fetchTree(1)
    expect(useSpecStore.getState().nodes.length).toBe(1)
    expect((apiFetch as unknown as vi.Mock).mock.calls[0][0]).toContain('/projects/1')
  })
})
