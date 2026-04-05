import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    env: {
      DATABASE_URL: 'file:./test.db',
      JWT_SECRET: 'test-jwt-secret',
    },
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
})
