import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
    setupFiles: ['src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/middleware/**/*.ts',
        'src/services/**/*.ts',
        'src/routes/**/*.ts',
      ],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.ts'],
    },
  },
});
