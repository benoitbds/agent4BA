import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['../tests/unit/**/*.ts'],
    deps: { inline: ['msw'] }
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    include: ['msw']
  },
  resolve: {
    alias: {
      msw: resolve(__dirname, 'node_modules/msw/lib/index.mjs')
    }
  }
})
