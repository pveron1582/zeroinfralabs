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
      // Ratchet: piso medido con `pnpm test:coverage` el 2026-09-27 →
      // 81.08 stmts / 68.80 branches / 77.52 funcs / 84.06 lines (la corrida
      // es determinista: ±0.03 entre corridas). Los umbrales van ~1 punto
      // abajo para no flakear, y suben cuando sube la cobertura.
      //
      // Antes eran 80/72/75/80 y NUNCA bloqueaban: `ci.yml` corría
      // `pnpm test:run` (sin --coverage), así que el branches=72 quedaba
      // 3 puntos por encima de la realidad y el gate era decorativo.
      thresholds: {
        statements: 80,
        branches: 68,
        functions: 77,
        lines: 83,
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
