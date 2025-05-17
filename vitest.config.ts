import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
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
        'src/validation/**',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        files: {
          'src/core/transport.ts': {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
          },
          'src/client.ts': {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
          },
          'src/transport/http.ts': {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70,
          }
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