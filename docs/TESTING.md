# Testing Strategy

## Resumen

**Framework:** Vitest 4.x + React Testing Library + jsdom  
**Total Tests:** 3337 en 270 archivos  
**Cobertura (v8):** 84.94% stmts / 73.59% branches / 80.87% funcs / 87.30% lines (medido 2026-10-01)  
**E2E:** Playwright (9 specs / 24 tests en `e2e/`, corren en el job `e2e` de la CI)

## Comandos

```bash
pnpm test                # Watch mode (re-ejecuta al guardar)
pnpm test:run            # Ejecución única (sin cobertura)
pnpm test:coverage       # Cobertura + thresholds — es lo que corre la CI
pnpm test:ui             # UI interactiva de Vitest
pnpm test -- -t "nombre" # Filtrar por nombre de test
pnpm test -- src/path    # Ejecutar un archivo específico
```

### Cobertura thresholds (`vitest.config.ts`)

| Métrica | Umbral | Real (2026-10-01) |
|---------|--------|-------------------|
| statements | 84% | 84.94% |
| branches | 73% | 73.59% |
| functions | 80% | 80.87% |
| lines | 86% | 87.30% |

El piso se mide con `pnpm test:coverage` y va ~1 punto abajo del valor real
(la corrida es determinista: ±0.03). **Subilo cuando suba la cobertura.**
Antes el umbral de branches era 72% —3 puntos por encima de la realidad— y
nada lo hacía cumplir: la CI corría `pnpm test:run` sin `--coverage`.

## Estructura de Tests

```
src/
├── commands/
│   ├── __tests__/           # Happy path por lab + integración
│   │   ├── happyPath-scenario06/06-flow/07-flow/08.test.ts
│   │   ├── happyPathHelpers.ts
│   │   ├── fase3-suid-sticky.test.ts
│   │   ├── fase4-editors.test.ts
│   │   ├── fase5-processes.test.ts
│   │   ├── fase6-network.test.ts
│   │   ├── fase7-packages-pipes-env.test.ts
│   │   ├── fase8-cron.test.ts
│   │   ├── fase9-fs.test.ts
│   │   └── python3.test.ts
│   └── builtin/__tests__/   # Tests unitarios por comando (51 cmds)
├── components/__tests__/    # Tests de React (Terminal, FakeBrowser, etc.)
├── hooks/__tests__/         # Tests de hooks (useCommandRunner, useFtpSession, etc.)
├── store/__tests__/         # Tests de Zustand store
├── utils/__tests__/         # Tests de utilidades (labValidator, permissions, etc.)
├── frameworks/              # Tests de frameworks (metasploit, http, python, proxy)
├── laboratorios/__tests__/  # Tests de definición de labs
├── fs-models/__tests__/     # Tests de filesystem virtual
├── i18n/__tests__/          # Tests de traducciones
├── video/remotion/__tests__/ # Contrato de las composiciones Remotion (Root.tsx, audioTimings)
└── test/setup.ts            # Setup global (mocks, store reset)
```

## Tipos de Tests

### 1. Happy Path por Laboratorio
Flujos completos de cada lab (01-08): scan → enum → exploit → flag. Los labs
01-05 viven en `commands-scenario01..05.test.ts` y los 06-08 en
`happyPath-scenario06 / 06-flow / 07-flow / 08.test.ts`.
Helpers compartidos en `happyPathHelpers.ts` para crear máquinas mock, evolucionar estado y verificar resultados.

### 2. Tests de Fases (fase3-fase9)
Tests organizados por dominio de conocimiento:
- **fase3:** SUID, SGID, sticky bit
- **fase4:** Editores (nano, vim) y privesc
- **fase5:** Procesos (ps, top, kill)
- **fase6:** Red (iptables, ufw, nmap)
- **fase7:** Paquetes, pipes, entorno
- **fase8:** Cron jobs
- **fase9:** Filesystem (mounts, permisos)

### 3. Tests de Hooks
Cobertura de los hooks (25 en `src/hooks/`):
- `useCommandRunner` — orquestador principal (prompt, sesiones, streaming)
- `useRunCommand` — routing por sesión (su, python, FTP, SSH)
- `useFtpSession` / `useSshSession` — ciclo de vida de sesiones
- `usePendingPythonInput` — flujo input() interactivo de Python
- `useReverseShell` — detección de reverse shell entrante
- `processCommandResult` — dispatcher de efectos secundarios

### 4. Tests de Componentes React
- Renderizado, interacciones, callbacks, integración con store
- MachineLoader con **fake timers** (eliminó flakeo)

### 5. Tests de Utilidades
- `labValidator.ts` — validación universal (17 criteria types)
- `permissions.ts` — permisos Unix (canRead, canWrite, canExecute)
- `storage.ts` — borrado selectivo de localStorage

## Convenciones

### Nomenclatura
```typescript
// Descripciones en español
describe('Terminal', () => {
  it('debe renderizar el mensaje de bienvenida', () => { ... });
  it('debe limpiar el input al ejecutar un comando', () => { ... });
});
```

### Entorno de test
Los tests de lógica pura (comandos, utils, frameworks, fs-models) usan:
```typescript
// @vitest-environment node  (sin DOM: más rápido)
```
Los tests de componentes y hooks que requieren DOM usan jsdom (default).

### Mocks
```typescript
// Mock de store
vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector) => selector(mockState)),
    { getState: vi.fn(() => mockState) }
  )
}));
```

## Flujos de CI

### Prerequisites para merge
1. `pnpm exec tsc --noEmit` → 0 errores (app: `tsconfig.json` excluye `src/video`)
2. `pnpm typecheck:video` → 0 errores en las compositions Remotion. En la CI
   corre con `continue-on-error`: **no bloquea** (un error de tipos en un
   video no tumba el build de la app) pero el error se ve en el paso
3. `pnpm lint` → 0 problemas
4. `pnpm test:coverage` → tests verdes **y** thresholds de cobertura OK
5. `pnpm build` → exit 0

### Cobertura
- La CI corre `pnpm test:coverage`: los thresholds de `vitest.config.ts`
  bloquean el merge si la cobertura baja del piso
- El reporte HTML se sube como artifact `coverage` (retención 7 días)
- Reporte local: `pnpm test:coverage`
- Para PRs de infra/tests: correr 3 corridas antes de mergear

## Debugging

```bash
# Test específico
pnpm test -- src/commands/__tests__/happyPath-scenario01.test.ts

# Por nombre
pnpm test -- -t "debe autenticar"

# Verbose
pnpm test -- --reporter=verbose

# Aislar tests que fallan (para investigar flakeo)
npx vitest run src/components/__tests__/MachineLoader.test.tsx

# Cache limpia si hay comportamiento raro
rm -rf node_modules/.vitest
```

## Tests E2E (Playwright)

Specs en `e2e/` (**9 specs / 24 tests**). **Sí corren en CI**: el job `e2e`
de `.github/workflows/ci.yml` instala chromium y ejecuta `pnpm test:e2e`.

```bash
pnpm test:e2e
```

Configuración en `playwright.config.ts` (levanta el dev server con
`webServer`, chromium headless, un solo worker).

- **Si los 24 specs fallan en 2 ms con `browserType.launch: Executable
  doesn't exist`:** falta el navegador, no hay nada roto en el código — pasa
  cuando se limpia `~/.cache/ms-playwright` (p. ej. con el limpiador de
  cache del sistema al cambiar de fecha). Lo repone
  `pnpm exec playwright install chromium`.

- 8 specs happy path por lab (`lab01`…`lab08`, incluye el lab oculto 08):
  verifican **texto en el output** de la terminal.
- `mission-completion.spec.ts` (2026-09-30): el **humo de misión
  completada** — comando → metadatos → `LabValidator` → `MissionPanel`
  (`0/8 completed` → `1/8`) → auto-avance del carrusel, con controles
  negativos (`ls` no avanza; `nmap -p 9999` no completa la misión 2).
  Verificado por mutación de `validateMission` en ambos sentidos.
- **Los specs entran en `tsc --noEmit`** (`tsconfig.json` incluye `e2e/`),
  que la CI corre antes de los tests. `playwright.config.ts` queda fuera a
  propósito: usa `process.env` y el proyecto no tiene `@types/node`.
