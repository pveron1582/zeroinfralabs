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
    // corriendo 220 archivos en paralelo —y más todavía en la CI, que ahora corre
    // `test:coverage` con instrumentación v8— el default de 5 s (y el 15 s que
    // había) hacen fallar tests válidos por carga de máquina (docs/mejoras-deep.md
    // §2.1). 30 s deja margen sin hiding de tests colgados.
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      // Ratchet: piso medido con `pnpm test:coverage` el 2026-10-01 →
      // 84.94 stmts / 73.59 branches / 80.87 funcs / 87.30 lines (la corrida
      // es determinista: ±0.03 entre corridas). Los umbrales de abajo son el
      // piso que bloquea: quedan ~1 punto por debajo del medido y suben cuando
      // sube la cobertura (próximo ratchet: subirlos y volver a medir).
      //
      // Antes eran 80/72/75/80 y NUNCA bloqueaban: `ci.yml` corría
      // `pnpm test:run` (sin --coverage), así que el branches=72 quedaba
      // 3 puntos por encima de la realidad y el gate era decorativo.
      thresholds: {
        statements: 84,
        branches: 73,
        functions: 80,
        lines: 86,
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
