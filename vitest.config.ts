// ── vitest.config.ts ───────────────────────────────────────────────
// Configuración de Vitest para testing

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      // Blindar el estado actual (82.5% stmts / 71.1% branch / 77.8% funcs / 84.3% lines).
      // Ver informe mejoras_glm.md §P0-6.
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 75,
        lines: 80,
      },
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/test/**/*',
        // Barrel files: solo re-exportan, no tienen lógica propia
        'src/commands/builtin/index.ts',
        'src/commands/tools/index.ts',
      ],
    },
  },
});
