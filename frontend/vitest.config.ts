import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['../tests/**/*.{test,spec}.ts?(x)'],
    setupFiles: ['../tests/setupTests.ts'],
    environment: 'jsdom',
  },
})
