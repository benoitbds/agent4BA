import { describe, it, expect } from 'vitest'
import { useSpecStore } from '../../frontend/src/store/specSlice'

describe('specSlice reducers', () => {
  it('creates node', () => {
    useSpecStore.getState().createNode('requirement')
    expect(useSpecStore.getState().nodes.length).toBeGreaterThan(0)
  })
})
