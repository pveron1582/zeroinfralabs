// ── vitest.config.ts ───────────────────────────────────────────────
// Configuración de Vitest para testing

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
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
