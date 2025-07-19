import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["../tests/**/*.{test,spec}.ts?(x)"],
    setupFiles: ["./vitest.setup.ts"],
    environment: "jsdom",
    deps: {
      inline: ["msw"],
    },
  },
  server: {
    deps: {
      inline: ["msw"],
    },
  },
  resolve: {
    alias: {
      "msw/node": "msw/lib/node/index.js",
    },
  },
});
