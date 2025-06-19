import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
  if (!globalThis.localStorage) {
    const store: Record<string, string> = {}
    globalThis.localStorage = {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value
      },
      removeItem: (key) => {
        delete store[key]
      },
      clear: () => {
        for (const k in store) delete store[k]
      },
    } as Storage
  }
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
