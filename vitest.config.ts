import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/types/**',
        'src/index.ts',
        'src/types/index.ts',
        'tatou/**',
        'scripts/**',
        '**/*.d.ts',
        "vitest.config.ts",
        'src/core/index.ts',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
        files: {
          'src/core/transport.ts': {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
          },
        },
      } as any,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 