import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/database/**/*.test.ts'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['src/lib/database.types.ts']
    }
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
});
