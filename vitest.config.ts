// ── vitest.config.ts ───────────────────────────────────────────────
// Configuración de Vitest para testing

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Los tests de componentes animados dependen de timers. Con la suite completa
    // corriendo 153 archivos en paralelo, el default de 5 s hacía fallar tests
    // válidos por carga de máquina (ver docs/mejoras-deep.md §2.1).
    testTimeout: 15000,
    hookTimeout: 15000,
    coverage: {
      provider: 'v8',
      // Nota P0-D (docs/mejoras-deep.md §2.5): los thresholds viven al filo de lo medido.
      // Piso real medido con pnpm test:run: 72.18 branches / 81.91 stmts / 78.65 funcs / 84.20 lines.
      thresholds: {
        statements: 80,
        branches: 72,
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
