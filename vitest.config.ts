import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    setupFiles: ['tests/setupTests.ts'],
    environment: 'node'
  }
})
