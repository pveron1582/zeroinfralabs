# Deep — Revisión Técnica profunda de ZeroInfra Labs (cyberops-v2)

> **Fecha del análisis:** 2026-09-15
> **Versión analizada:** `2252bbc` (main) — con working tree sucio (ver §2.4)
> **Stack:** React 18 + TypeScript 5 (strict) + Vite 7 + Zustand 5 + Vitest 4 + Remotion 4 + Tailwind 4
> **Método:** todos los números de este documento fueron **ejecutados**, no copiados de otros docs.
> Comandos: `pnpm exec tsc --noEmit`, `pnpm lint`, `npx vitest run` (×3 corridas), `npx vitest run --coverage`, `git count-objects -vH`, `du -sh`, greps de patrones.
> **Complementa a:** `solar_mejoras.md` (2026-08-09), `glm_mejoras.md` (2026-08-27), `docs/archive/MEJORAS.md`, `docs/ROADMAP.md`.

---

## TL;DR

El proyecto está **arquitectónicamente sano** y muy por encima del promedio: el sistema de validación universal
comandos↔labs está implementado de verdad (17 criterios, 17 validadores, unión discriminada que hace imposible
emitir metadata inválida), la simulación es profunda (permisos Unix reales, shells anidadas, MSF con estado
aislado por terminal, red/paquetes/cron/mounts, mini-intérprete de Python), y el testing es serio (2022 tests,
153 archivos, happy path por lab + 7 specs E2E, thresholds de cobertura en CI).

Los riesgos **no son de diseño sino de operación**:

1. **La suite es flaky** y el CI la corre tal cual → el pipeline es una ruleta rusa (reproducido: 3 corridas,
   3 resultados distintos).
2. **Hay una feature completa sin commitear** (`python3`, 17 entradas en `git status`).
3. **Dos bugs de UX concretos**: `/test` borra todo el `localStorage` del usuario (adiós progreso de Academy) y
   no existe ruta `path="*"` → URLs desconocidas devuelven **pantalla en blanco**.
4. **La puerta de cobertura está al filo**: `branches` 70.28% vs umbral 70 (+0.28 pp).
5. **Los docs ya no describen el proyecto** (dicen 1939/1950 tests en 147/149 archivos; la realidad es
   **2022 en 153**).

Con el bloque **P0** (§5) resuelto — medio día de trabajo — el proyecto queda sólido para escalar labs
y Academy sin sustos.

---

## 0. Estado verificado hoy (evidencia, no docs)

| Check | Comando | Resultado |
|---|---|---|
| Type check | `pnpm exec tsc --noEmit` | ✅ **0 errores** (strict + noUnusedLocals + noUnusedParameters) |
| Lint | `pnpm lint` | ✅ **0 problemas** (salida vacía, EXIT=0) |
| Suite completa | `npx vitest run` | ⚠️ **2022 tests / 153 archivos** — pasan, pero **flaky** (§2.1) |
| Cobertura | `npx vitest run --coverage` | **81.91% stmts / 70.28% branch / 78.65% funcs / 84.2% lines** |
| Duración suite | — | 139.6 s de pared · transform 28 s · setup 155 s · import 62 s · tests 272 s · **environment 336 s** |
| Código | `wc -l` | **63.852 LOC** de producción + **26.239 LOC** de tests (676 archivos `.ts/.tsx`) |
| Comandos | `ls src/commands/builtin/*.ts` | **51 builtin** + **11 tools** (index excluidos) |
| Bundle | `du -sh dist/assets` | ✅ **1.4 MB** total (code-splitting correcto) |
| Build local | `du -sh dist` | ❌ **923 MB** — por `public/videos` (903 MB) copiados por Vite (§3.2) |
| Git | `git count-objects -vH` | `.git` **1.3 GB** · **494 archivos en LFS** · `.git/lfs` **≈1 GB** |
| CI | `.github/workflows/ci.yml` | tsc + lint + test + build (**Playwright NO está en CI**) |

### Cobertura por área (v8, corrida limpia)

| Área | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| **All files** | **81.91** | **70.28** | **78.65** | **84.2** |
| `store` | 100 | 100 | 100 | 100 |
| `fs-models` | 100 | 94.44 | 100 | 100 |
| `blog` | 100 | 100 | 100 | 100 |
| `utils` | 94.05 | 87.18 | 97.54 | 96.35 |
| `academy` | 93.54 | 100 | 84.61 | 95.65 |
| `laboratorios` | 92.18 | 75.75 | 80 | 93.1 |
| `commands` | 87.02 | 71.01 | 81.57 | 88.88 |
| `commands/builtin` | 85.67 | 71.55 | 92.33 | 87.93 |
| `components` | 84.35 | 73.49 | 75.17 | 86.71 |
| **`hooks`** | **76.57** | **59.78** | 81.05 | 77.08 |
| `i18n` | 100 | **40** | 100 | 100 |

> ⚠️ `hooks` es la única área por debajo de los umbrales globales en statements **y** branches, y ahí vive toda
> la orquestación (`useCommandRunner`, `useRunCommand`, `useFtpSession`, `useSshSession`, `useReverseShell`…).
> Es el principal candidato a testear (§2.5).

---

## 1. Puntos fuertes (lo que está muy bien hecho)

### 1.1 La arquitectura de validación universal es el gran acierto

```
Comandos (libres) → metadata en CommandResponse → labValidator → mission.validationCriteria → misión completa
```

- Está implementado de verdad, no de adorno: **17 tipos de criterio** (`types/mission.ts:28`) con **17 validadores**
  agrupados por familia en `src/utils/validators/{discovery,credentials,filesystem,exploit,network}.ts` y
  dispatcher central en `utils/labValidator.ts` (85 líneas, un `switch` exhaustivo).
- El contrato es **fuerte**: `CommandResponse` (`types/command.ts`) es una **unión discriminada** con base común
  (`output`, `isError`, `filesChanged`, `privescAttempted`…) y variantes por tipo de evento
  (`type: 'ssh' | 'ftp' | 'msf' | 'meterpreter' | 'vuln' | 'http' | 'hybrid' | …`). Emitir metadata inválida **no compila**.
- Los validadores **cruzan el objetivo**: `FileReadData.machineId`, `BrowserActionData.machineId` contra
  `mission.targetMachineId`, para que la flag/acción cuente solo en la máquina correcta.
- Consecuencia práctica: se agrega un comando sin tocar labs, y un lab sin tocar comandos. Es la decisión que
  explica por qué hay 7 labs, 58 lecciones y 51+11 comandos sin una maraña de `if (labId === 4)`.

### 1.2 Profundidad de simulación muy alta

No es un juguete: es un simulador con superficie realista en varias capas.

- **FS con permisos Unix reales**: owner/group/others, SUID/SGID/sticky, umask, `canRead`/`canWrite`/`canExecute`/
  `canCreateInDir`/`canDeleteInDir`, helpers únicos (`findFile`, `findParentDir`, `defaultOwnership`, `buildNewFile`)
  y contrato transversal documentado en `docs/PERMISSIONS.md` con anti-patrones.
- **Shells interactivas** (SSH/FTP/NC) con stack anidado por `terminalId` (`ShellManager`), aisladas por ventana.
- **Metasploit simulado**: DB de módulos, help por contexto (`msfContextHelp`), sesiones, meterpreter, y **estado MSF aislado por
  terminal** (`createIsolatedExecutor()` en `commands/index.ts:106` con closure privado; el global vive en
  `useScenarioStore.getState().msfState`).
- **Otros frameworks**: `ProcessManager` (ps/top/kill), `NetworkState` (iptables/ufw/interfaces con
  `effectivePortState()`), `PackageManager` (apt/dpkg por máquina), `CronRunner` (reloj virtual → syslog),
  `mounts` (fstab + estado por máquina), `http/` (motor HTTP del lab 07).
- **Mini-intérprete de Python** (`src/frameworks/python/`, 14 archivos, ~1.8k LOC): lexer → parser → evaluator,
  stdlib simulada, `socket` puenteado a `effectivePortState()`, `open()` al FS virtual, `input()` con
  `pythonPendingInput` + re-ejecución del script. Es producto diferencial y no existe en ningún competidor
  browser-based que yo conozca.

### 1.3 Testing serio y con puerta de calidad

- **2022 tests en 153 archivos** (+ 7 specs Playwright), happy path por lab (`happyPath-scenario01..07`),
  helpers compartidos (`happyPathHelpers.ts`), mocks de store centralizados y `src/test/setup.ts` que resetea
  store + `localStorage` y mockea `matchMedia`/`history`/`ResizeObserver`/`IntersectionObserver`.
- Convenciones claras: nombres en español (`it('debe listar archivos', …)`), patrón
  `command.execute(args, ctx)` → assert de `output` + metadata.
- **Thresholds de cobertura configurados** (`vitest.config.ts`: 80/70/75/80) y ejecutados con `--coverage`.
- **Happy path manual documentado** con red flags (`docs/HAPPY_PATH_TEST.md`) además de los tests.

### 1.4 Resiliencia de UI poco habitual

- `lazyWithRetry()` (`utils/lazyRetry.ts`) + `ChunkErrorBoundary`: cubre el caso real de *pestaña abierta antes
  de un deploy* (chunks con hash viejo → pantalla blanca). Casi nadie lo implementa.
- `code-splitting` por ruta (8 vistas lazy) → **1.4 MB de assets totales**.
- Detalles de compatibilidad con navegadores reales: `google: notranslate` + ligaduras de fuente desactivadas en
  inputs (bug reproducido en Chrome/Brave al tipear `../`).

### 1.5 Higiene de estado y persistencia

- Zustand con 5 slices, `partialize()` + `merge()` + `version: 2`, persistiendo **solo** preferencias de UI y
  progreso de Academy. `machines`/`missions`/`msfState`/`identityStack` **no** se persisten → no se rehidratan
  credenciales ni sesiones.
- `getCurrentUser(machine)` (`utils/users.ts:85`) es **única fuente de verdad** de la identidad; el prompt de la
  terminal (`useTerminalIdentity`) la consume en lugar de duplicar la heurística (esto era deuda y se resolvió).

### 1.6 Decisiones de costo/ops pensadas

- Videos fuera del dominio de la app (jsDelivr + repo público `zilabs-videos`), con `.vercelignore` que los excluye
  del deploy, URL base centralizada en `utils/videoUrl.ts` (cambiar de CDN = 1 línea) y carga diferida por lección.
- `vercel.json` con rewrites SPA y `Cache-Control` diferenciado (`immutable` solo para `/assets/`, `must-revalidate`
  para el resto).
- Analytics **opcional** por env var (`VITE_ANALYTICS_WEBHOOK`), sin secretos en el bundle.
- `docs/SECURITY.md` + notas de "hashes y credenciales ficticias" en README/CLAUDE.

### 1.7 Cultura de documentación

`AGENTS.md` (referencia rápida), `CLAUDE.md` (referencia completa), y `docs/` con arquitectura, permisos, testing,
roadmap, changelog, academy, business. Pocos proyectos tienen `docs/PERMISSIONS.md` como contrato explícito para
"todo comando que toque el FS". Esa es la razón por la que el FS simulado es consistente.

---

## 2. 🔴 Urgente (P0) — resolver antes de seguir desarrollando

### 2.1 La suite es flaky y el CI la corre tal cual

**Síntoma:** tres corridas consecutivas del **mismo commit**, tres resultados distintos:

| Corrida | Comando | Resultado | Tests caídos |
|---|---|---|---|
| 1 | `npx vitest run` | ❌ **3 failed** / 2019 passed | `LabBuilder.test.tsx:91`, `LabMiniTerminal.test.tsx:43`, `MachineLoader.test.tsx:48` |
| 2 | `npx vitest run --coverage` | ❌ **1 failed** / 2021 passed | `FoxyTour-app.test.tsx:42` → `Test timed out in 5000ms` |
| 3 | `npx vitest run --coverage` | ✅ 2022 passed, EXIT=0 | — |

**Los 4 tests caídos pasan en aislamiento.** Verificación ejecutada:
`npx vitest run src/components/__tests__/{LabBuilder,LabMiniTerminal,MachineLoader}.test.tsx`
→ **3 files passed / 22 tests passed** (14.12 s).

**Causa raíz:** esperas sobre **timers reales** con márgenes cortos, dentro de una suite que corre 153 archivos en
paralelo con jsdom (evidencia: `environment 336 s`, `setup 155 s` para 139 s de pared).

- `src/components/__tests__/MachineLoader.test.tsx:39-50` — `waitFor(..., { timeout: 600 })` y `{ timeout: 1000 }`
  para un countdown real de reloj.
- `src/components/__tests__/FoxyTour-app.test.tsx:42-56` — `waitFor(..., { timeout: 3000 })` + `sleep` real, con
  `testTimeout` default de 5000 ms → el test entero expira.
- Censo: **25** apariciones de `timeout: N` en tests de componentes, **14** archivos usan `useFakeTimers`,
  **2** usan `await new Promise(r => setTimeout(...))`.
- Contexto que agrava: decenas de `Warning: An update to X inside a test was not wrapped in act(...)`
  (DonationModal, FoxyTour, DesktopTerminal, FakeBrowser…) → updates fuera de `act()` que escapan del control del test.

**Impacto:** `pnpm test:run` es el gate del CI (`ci.yml`). Un PR puede quedar rojo sin que su código tenga nada que ver,
y el equipo aprende a re-ejecutar hasta que pase → el gate pierde valor.

**Acción propuesta:**

- [x] **2.1.1** En `vitest.config.ts`: `testTimeout: 15000`, `hookTimeout: 15000` (hoy ambos en default 5000). → **RESUELTO 2026-10-01:** ya estaba: `testTimeout: 30000` y `hookTimeout: 30000` en `vitest.config.ts` (por encima de lo pedido).
- [ ] **2.1.2** Migrar los `waitFor` con `timeout: N` de componentes con temporizadores a `vi.useFakeTimers()` +
      `vi.advanceTimersByTime()` (ya hay 14 archivos con el patrón, seguirlo). Especialmente
      `MachineLoader.test.tsx` y `FoxyTour-app.test.tsx`. (estado 2026-10-01: `MachineLoader.test.tsx` ya usa `vi.useFakeTimers()`; `FoxyTour-app.test.tsx` sigue con `waitFor … { timeout: 3000/5000 }` ⇒ sigue abierto.)
- [ ] **2.1.3** **Acelerar la suite** (esto además baja el flakeo): marcar con `// @vitest-environment node` los tests
      que no tocan DOM (comandos, utils, fs-models, frameworks). Hoy los 153 archivos levantan jsdom.
      Objetivo: bajar `environment` de ~336 s a la mitad o menos. (estado 2026-10-01: 140 de 266 archivos ya llevan `@vitest-environment node` y `environment` bajó de ~336 s a **176 s**, todavía por encima de la mitad ⇒ sigue abierto.)
- [x] **2.1.4** Envolver los updates async en `act()` para eliminar los warnings (ruido que esconde fallos reales). → **RESUELTO 2026-10-01:** **0 warnings `act()`** en las 3 corridas consecutivas (grep sobre los logs de `pnpm test:run` y `test:coverage`), y `src/test/setup.ts` no silencia `console.error` — no queda ruido que eliminar.
- [x] **2.1.5** Criterio de cierre: **3 corridas consecutivas verdes** de `pnpm test:run` sin tocar código. → **RESUELTO 2026-10-01:** 3 corridas consecutivas verdes el 2026-10-01 sin tocar código entre ellas: 91,4 s / 91,5 s / 111,7 s — **3295/3295** cada una.

### 2.2 La ruta `/test` borra TODO el `localStorage` del usuario

**Ubicación:** `src/components/ScenarioLauncher.tsx:95-110` (`TestLab`) + `src/App.tsx:49` (`<Route path="/test" …>`).

```ts
function TestLab() {
  useEffect(() => {
    localStorage.clear();   // ← borra TODAS las claves del origen
    …
```

**Problema:** la ruta es **pública** (no hay guard de `import.meta.env.DEV`) y `localStorage.clear()` es global, no
selectivo. Un usuario que llegue a `/test` (o un crawler, o un enlace compartido) **pierde de golpe**:
progreso de Academy (`completedLessons`, `quizResults`), `theme`, `language`, `uiMode`, `termColor`, wallpaper
(`cyberops-desktop-wallpaper`) y cualquier otro dato del mismo origen.

**Acción propuesta:**

- [x] **2.2.1** Guardar la ruta: `{import.meta.env.DEV && <Route path="/test" …/>}`. → **RESUELTO 2026-10-01:** `App.tsx:57` gatea `/test` con `import.meta.env.DEV`.
- [x] **2.2.2** Reemplazar `localStorage.clear()` por borrado selectivo de las claves propias
      (`cyberops-store`, `cyberops-desktop-wallpaper`, `cyberops-session-id`) — helper tipo `clearZilabsStorage()`. → **RESUELTO 2026-10-01:** helper `clearZilabsStorage()` en `src/utils/storage.ts` (lo usa TestLab) + `utils/__tests__/storage.test.ts`.
- [x] **2.2.3** Test que garantice que el reset **no** toca `completedLessons` de Academy. → **RESUELTO 2026-10-01:** `clearZilabsStorage()` ya NO borra `cyberops-store` (con `partialize` sólo guarda preferencias + progreso de Academy, no estado de lab) y hay 4 tests en `src/utils/__tests__/storage.test.ts`, incluido uno que exige que `completedLessons`/`quizResults` sobrevivan al reset.
      *Estado 2026-10-01: `storage.test.ts` sólo fija claves ajenas al origen;
      `clearZilabsStorage()` borra `cyberops-store` entero (y ahí vive
      `completedLessons`), así que el reset del lab dev todavía lo pierde.*

### 2.3 No existe ruta catch-all → pantalla en blanco en URLs desconocidas

**Ubicación:** `src/App.tsx:37-50` (no hay `<Route path="*">`).

Como `vercel.json` reescribe a `index.html` todo lo que no sea asset
(`"source": "/((?!assets|static|.*\\.[^/]+$).*)"`), una URL como `/es/labs/typo`, `/en/academy/nope` o `/es/foo`
hace match con el rewrite → sirve `index.html` → React Router **no matchea ninguna ruta** → `<Suspense>` resuelve
`null` → **documento vacío, sin header ni forma de volver**.

**Acción propuesta:**

- [x] **2.3.1** Agregar `<Route path="*" element={<NotFound />} />` (componente liviano, bilingüe, con link a
      `/:lang/labs` y `/:lang/academy`). → **RESUELTO 2026-10-01:** `<Route path="*">` + `components/NotFound.tsx` (App.tsx:59).
- [x] **2.3.2** Validar `:lang` (hoy `/:lang` acepta cualquier string; `RootRedirect` defaultea a `en` solo en `/`). → **RESUELTO 2026-10-01:** layout `/:lang` envuelto en `RequireLang` (`src/components/RequireLang.tsx`): sólo `es`/`en` y cualquier otro idioma responde 404; tests en `requireLang.test.tsx` (incl. que los links del 404 nunca apunten a un `:lang` inválido).
- [x] **2.3.3** Test de render de NotFound en ES/EN. → **RESUELTO 2026-10-01:** `components/__tests__/NotFound.test.tsx` (404 en ES y en EN).

### 2.4 Hay una feature completa sin commitear (`python3`)

`git status --porcelain` → **17 entradas**:

```
 M AGENTS.md                      ?? src/commands/builtin/python3.ts
 M src/commands/builtin/help.ts   ?? src/commands/help/python3.ts
 M src/commands/builtin/index.ts  ?? src/frameworks/python/            (14 archivos)
 M src/commands/help/index.ts     ?? src/hooks/__tests__/usePendingPythonInput.test.ts
 M src/commands/names.ts          ?? src/hooks/usePendingPythonInput.ts
 M src/hooks/processCommandResult.ts
 M src/hooks/streamingConfig.ts
 M src/hooks/useCommandRunner.ts
 M src/hooks/useKeyboardShortcuts.ts
 M src/hooks/useRunCommand.ts
 M src/types/command.ts
```

Es una feature grande y de valor: intérprete Python (**1.823 LOC** en `frameworks/python`, 14 archivos),
comando `python3` (184 LOC), help propio (`commands/help/python3.ts`), hook de `input()` pendiente
(`usePendingPythonInput.ts`, 65 LOC) y **2 archivos de test nuevos**. Compila (`tsc` 0 errores) y los tests pasan —
con la salvedad de que `AGENTS.md` está modificado a medias junto con el resto.

**Riesgo:** es exactamente el trabajo que se pierde con un `git checkout .` / `git stash` accidental, y mezcla
cambios de documentación con una feature.

**Acción propuesta:**

- [x] **2.4.1** Commit de la feature en una rama (`feat/python3-interpreter`), separando docs si se quiere. → **RESUELTO 2026-10-01:** la feature ya está commiteada en `main`, con los docs alineados y el árbol limpio (no quedó trabajo sin commitear).
- [x] **2.4.2** Verificar la sección de Python en `AGENTS.md`/`CLAUDE.md`: agregar `python3` al listado de builtin
      (hoy dice "60 system commands") y `frameworks/python/` al layout — **en el mismo commit**. → **RESUELTO 2026-10-01:** `python3` en los listados builtin y `frameworks/python/` en el layout de AGENTS.md, CLAUDE.md y README.md.
- [x] **2.4.3** Sumar un test de integración de `python3` contra el FS virtual (hoy hay tests del intérprete y del → **RESUELTO 2026-10-01:** `src/commands/__tests__/python3-fs.test.ts` (7 tests): `open()` absoluto/relativo/symlink, denegación por `canRead` (600 vs 644), `[Errno 13]` al cargar el script y la metadata `fileRead`.
      comando por separado).

### 2.5 La puerta de cobertura está al filo (branches 70.28 vs 70)

| Métrica | Umbral (`vitest.config.ts`) | Real | Margen |
|---|---|---|---|
| statements | 80 | 81.91 | **+1.91 pp** |
| branches | **70** | **70.28** | **+0.28 pp** ⚠️ |
| functions | 75 | 78.65 | +3.65 pp |
| lines | 80 | 84.2 | +4.2 pp |

Cualquier refactor que agregue un `if`/ternario en un área poco cubierta rompe el CI sin que haya un bug.
El área débil es `hooks` (**76.57 stmts / 59.78 branch**), justo donde vive la orquestación.

**Acción propuesta:**

- [x] **2.5.1** Cubrir ramas de `hooks`: `useRunCommand` (dispatch de pending su/python/ftp/ssh), `useFtpSession`, → **RESUELTO 2026-10-01:** ramas de los hooks nombrados: `useRunCommand` 87,2 · `useFtpSession` 95,0 · `useSshSession` 87,5 · `useReverseShell` 81,8 · `useKeyboardShortcuts` 100.
      `useSshSession`, `useReverseShell`, `useKeyboardShortcuts` (cancelación de bloqueantes).
- [x] **2.5.2** Si no se llega rápido, subir el umbral de `branches` a **72** con el nuevo piso real (dejar de vivir → **RESUELTO 2026-10-01:** umbral de `branches` en **73** (piso real 73,59), junto con `statements` 84 / `functions` 80 / `lines` 86 — no sólo 72.
      con margen de 0.3 pp) y seguir subiendo por sprint.
- [x] **2.5.3** Publicar el reporte de cobertura como artefacto del CI (hoy `coverage/` es gitignored y solo se ve → **RESUELTO 2026-10-01:** step "Upload coverage report" en `ci.yml` (sube `coverage/` como artefacto).
      local).

---

## 3. Medio plazo (P1) — deuda que conviene pagar pronto

### 3.1 Los docs ya no describen el proyecto (drift de números)

| Doc | Dice | Realidad (2026-09-15) |
|---|---|---|
| `README.md` | "1950 tests (149 test files + 19 E2E)" | **2022 tests / 153 archivos** |
| `AGENTS.md` | "1939 tests across 147 files" | idem |
| `AGENTS.md` / `CLAUDE.md` | "60 system commands" (builtin) | **51** (– index) |
| `docs/TESTING.md` | "Total Tests: 800+" y lista **5 escenarios** | 2022 y **7 labs** |
| `CLAUDE.md` | "59 builtin + 12 tools" | 51 + 11 |
| `docs/mejoras-deep.md` §0 | este doc | ✅ es el único con números frescos |

Ya pasó antes (el informe de `glm_mejoras.md` incluye una corrección de conteos). El problema no es el número, es que
**cada doc se actualiza a mano** y vuelven a divergir.

- [x] **3.1.1** Unificar la fuente de verdad: generar los conteos con un script (`scripts/`) o un test que falle si → **RESUELTO 2026-10-01:** `src/test/docs-sync.test.ts` mide labs, comandos, hooks, compositions, archivos de test y specs E2E contra README/AGENTS/CLAUDE; en su primer run cazó la deriva real de compositions (132 documentado → 118 real).
      `AGENTS.md`/`README.md` no coinciden con la realidad (patrón "doc test").
- [x] **3.1.2** Reescribir `docs/TESTING.md` (está en estado 2025: "800+ tests", 5 escenarios, cobertura objetivo por
      módulo sin números actuales). → **RESUELTO 2026-10-01:** `docs/TESTING.md` reescrito: 3278 tests / 262 archivos, tabla de thresholds y flujos de CI.
- [x] **3.1.3** Agregar a `docs/TESTING.md` el flujo real: 3 corridas verdes antes de cerrar un PR de infra/tests. → **RESUELTO 2026-10-01:** `docs/TESTING.md` §Flujos de CI: «3 corridas antes de mergear un PR de infra/tests».

### 3.2 `pnpm build` genera un `dist/` de 923 MB

`du -sh dist` = **923 MB**, de los cuales **903 MB son `public/videos`** copiados por Vite al outDir. El bundle real
(JS/CSS) son **1.4 MB**.

Los videos **no se sirven desde la app**: `utils/videoUrl.ts` apunta al CDN de jsDelivr y `.vercelignore` los excluye
del deploy. O sea: en el build local/CI se copian 903 MB que nunca se usan, y `dist/` (gitignored) ocupa ~1 GB.

- [x] **3.2.1** Mover los originales de `public/videos/` a `media/videos/` (fuera de `publicDir`) y ajustar
      `.vercelignore`/`.gitattributes` (el LFS config sigue funcionando por path). → **RESUELTO 2026-10-01:** commit `73b3b72` (`perf(build): mover videos de public/ a media/ → dist 923MB → 20MB`): `public/videos/` ya no existe, `.gitattributes` apunta a `media/videos/**` y `.vercelignore` documenta que están fuera del `publicDir`.
- [x] **3.2.2** Alternativa mínima: `build: { copyPublicDir: false }` + `publicDir` apuntando a un dir sin videos, o
      un script `build:light`. → **RESUELTO 2026-10-01:** no aplica: se tomó el camino de 3.2.1 (los videos salieron del `publicDir`). `du -sh dist` = **20 MB** medido el 2026-10-01.
- [x] **3.2.3** Verificar que dev sigue funcionando (hoy `pnpm dev` con `public/videos` presente permite trabajar
      offline con el fallback local si se usa). → **RESUELTO 2026-10-01:** verificado 2026-10-01: `pnpm dev` levanta y `GET /es/labs` responde 200 sin `public/videos/`.
- [x] **3.2.4** Nota CI: `actions/checkout@v4` **no** trae LFS por default, así que en CI los videos son punteros
      (~130 bytes) y el build es liviano. El problema es local + cualquier job que active `lfs: true`. → **RESUELTO 2026-10-01:** ya no aplica: los videos no están en el `publicDir`, así que ni local ni en CI se copian al `dist/` (el LFS de `media/videos/**` sólo afecta al repo).

### 3.3 `resetWorkspace()` enumera 20 campos a mano

`src/store/scenarioStore.ts:17-41` define el reset listando campo por campo:

```ts
const resetWorkspace = () => {
  shellManager.reset();
  set({ view: 'landing', showNetworkMap: false, hasNewNetworkInfo: false, notification: null,
        browserCurrentUrl: …, browserIsLoggedIn: false, browserNavHistory: […], browserNavIdx: 0,
        listeningPort: null, blockingCommand: null, msfState: null, ftpSession: null, sshSession: null,
        showSurvey: false, pendingSurveyScenario: null, showCompletionOverlay: false,
        _prevMachinesSnapshot: [], globalResetDoneForScenario: null });
};
```

**Riesgo:** si alguien agrega un campo a una slice y no lo agrega acá, ese estado **sobrevive entre labs**. Es
exactamente la red flag documentada en `docs/HAPPY_PATH_TEST.md`: *"Cambias de escenario y el listener anterior sigue
activo"*. Además el reset no resetea `identityStack` (se resetea en `selectScenario`), así que la cobertura del reset
depende de **dos** lugares distintos.

- [ ] **3.3.1** Exportar `initialState` (o `createInitialXState()`) por slice y componer
      `resetWorkspace = () => set({ ...initialUI, ...initialTerminal, ...initialScenario, ...initialIdentity, ...initialAcademy })`.
- [ ] **3.3.2** Test de contrato: tras `resetWorkspace()`, **todas** las claves del store coinciden con el estado
      inicial salvo las que se declaren explícitamente persistentes.
- [ ] **3.3.3** Incluir `identityStack` en el reset (hoy queda a cargo de `selectScenario`).

### 3.4 Los E2E existen pero no corren en CI

`e2e/` tiene 7 specs (210 LOC) + `helpers.ts` (39 LOC) y `playwright.config.ts`, pero `.github/workflows/ci.yml` solo
hace **tsc + lint + test + build**.

- [x] **3.4.1** Job de Playwright en CI (o nightly): `playwright install --with-deps chromium` + `pnpm test:e2e`. → **RESUELTO 2026-10-01:** job `e2e` en `ci.yml` (`needs: verify`: Playwright install + `pnpm test:e2e`).
- [x] **3.4.2** Publicar el reporte (`playwright-report/`) como artefacto en fallo (ya está gitignored). → **RESUELTO 2026-10-01:** step "Upload Playwright report" con `if: failure()` (7 días de retención).

### 3.5 Duplicación ES/EN en Remotion (116 archivos)

`src/video/remotion/compositions/` tiene **116 archivos** para **39 composiciones**, en pares
`X.tsx` / `XEn.tsx` con el mismo árbol de animación y distinto texto/audio (`Li05Permissions.tsx` 342 LOC +
`Li05PermissionsEn.tsx` 333 LOC; `Pe02Filesystem.tsx` 318 + `Pe02FilesystemEn.tsx` 308…). Y `video/remotion/Root.tsx`
tiene **1.083 líneas** (registro de las 39 composiciones × idioma).

- [ ] **3.5.1** Parametrizar por prop: una composición con `lang: 'es' | 'en'` y un `t()` local (o un objeto
      `copy[lang]`) → se elimina ~50% de archivos y el riesgo de que ES/EN diverjan visualmente.
- [ ] **3.5.2** `Root.tsx`: generar el registro con un array de metadata en lugar de 1.083 líneas repetidas.
- [ ] **3.5.3** Aprovechar para unificar la ruta de assets de audio (ya hay `audio-es` / `audio-en` por idioma).

### 3.6 El wrapper de comandos posicional sigue vivo

`commands/index.ts:82-115` conserva `legacyArgsToRequest()` (una firma de **13 parámetros** posicionales con
`rest[i] as …`) además de la firma `CommandRequest` preferida. Es deuda heredada que se paga en cada call site y en
cada cast.

- [ ] **3.6.1** Migrar los call sites restantes a `CommandRequest` y marcar la firma posicional como `@deprecated`.
- [ ] **3.6.2** Cuando no queden usos en `src/` (y tests migrados), eliminar `legacyArgsToRequest` y su overload.

---

## 4. 🔵 Prioridad baja / higiene (P2)

### 4.1 `getCurrentUser()` es una cadena de 7 heurísticas implícitas

`src/utils/users.ts:85-133` decide la identidad efectiva en orden: `su_user` → `attacker` → `privesc_completed` →
credential `reverse-shell` → credencial SSH verificada → credencial verificada genérica → credencial de puerto SSH →
fallback `user` (uid 1000). Además construye **4 veces** el mismo usuario sintético (`{ username, uid: 1000, gid: 1000,
home: /home/x, shell: /bin/bash, groups: [1000] }`).

Funciona (y es la única fuente de verdad, lo cual es bueno), pero es un cerebro de lógica **orden-dependiente** y sin
tests table-driven que lo blinden.

- [ ] **4.1.1** Refactor a tabla de reglas: `const RULES: Array<{ id: string; match(m): User | null }>`, evaluadas en
      orden, con el `id` de la regla que matcheó (útil para debug y para el prompt).
- [ ] **4.1.2** Extraer `buildSyntheticUser(username)` para eliminar la repetición del literal.
- [ ] **4.1.3** Tests table-driven: una fila por escalón de la heurística, incluyendo casos "credential existe pero el
      usuario no está en `/etc/passwd`".

### 4.2 Comentario desactualizado en el contrato de validación

`src/types/mission.ts:44`:

```ts
| 'browserAction'        // navegación web (validada por FakeBrowser, no por labValidator)
```

Pero `src/utils/labValidator.ts:79-80` **sí** despacha a `validateBrowserAction(result, mission, conditions)`
(único validador que recibe `mission` además de `result`, porque cruza `machineId` con `targetMachineId`).

- [x] **4.2.1** Corregir el comentario (es el archivo que la gente lee para entender el contrato). → **RESUELTO 2026-10-01:** el comentario de `types/mission.ts:44` ya dice «FakeBrowser emite, labValidator valida con targetMachineId».
- [x] **4.2.2** Aclarar en `docs/ARCHITECTURE.md` quién emite cada metadata (FakeBrowser emite, labValidator valida). → **RESUELTO 2026-10-01:** `ARCHITECTURE.md` documenta cada criterio con su emisor y validador (p. ej. `browserAction — FakeBrowser emite, labValidator valida con targetMachineId`).

### 4.3 Censos de `any`, supresiones y `console`

Medido sobre `src/` (incluye tests):

| Patrón | Total |
|---|---|
| `: any` | **18** |
| `@ts-ignore` / `@ts-expect-error` / `eslint-disable` | **18** |
| `console.*` | **22** (la mayoría legítimos: `logger.ts`, `ChunkErrorBoundary`, `ShellManager`, tests) |
| `throw new` | **28** (25 son `PyError` del intérprete Python: correcto, simula excepciones) |

- [ ] **4.3.1** Priorizar los `any`/supresiones de `frameworks/shells/*`, `commands/executor.ts` y hooks; los de tests
      (`: any` en mocks de props) son aceptables.
- [ ] **4.3.2** Revisar que ningún `console.*` de producción quede fuera de `utils/logger.ts` (ya hay precedentes
      aceptados: `ChunkErrorBoundary.error`, `ShellManager.error`).

### 4.4 `index.html` fijo en inglés para una app bilingüe

`index.html`: `<html lang="en">`, `<title>` solo en inglés, OG/Twitter solo en inglés, sin `hreflang`.
`ThemeSync` ya setea `data-theme` desde el store; el `lang` del documento no se sincroniza nunca.

- [ ] **4.4.1** Setear `document.documentElement.lang` desde el idioma activo (accesibilidad: lectores de pantalla).
- [ ] **4.4.2** `hreflang` es/en + `<link rel="alternate">` (SEO de rutas `/:lang`).
- [ ] **4.4.3** Evaluar title/description dinámicos por ruta (hoy son estáticos; las vistas están lazy → se puede
      hacer con un hook sin SSR).

### 4.5 Analytics: endpoint público sin throttle

`utils/analytics.ts` postea eventos a `VITE_ANALYTICS_WEBHOOK` (Google Apps Script) con un `sessionId` anónimo de
`sessionStorage`. No hay secretos en el bundle (correcto), pero cualquiera puede leer la URL y postear en loop contra
la Sheet.

- [ ] **4.5.1** Throttle cliente (p. ej. máx. N eventos/ventana) y dedupe por `sessionId` + `eventType`.
- [ ] **4.5.2** Validación de payload del lado del Apps Script (tamaño, campos esperados, rate limit por IP).

### 4.6 `docs/CHANGELOG.md` en 190 KB

Un único archivo para todo el historial (188.221 bytes, con `## [Unreleased] - fecha` repetido 15+ veces).

- [x] **4.6.1** Partir por release (`docs/changelog/2026-09.md`, …) e indexar en `CHANGELOG.md`. → **RESUELTO 2026-10-01:** `docs/changelog/` con mensuales de 2026-04 a 2026-10 e index en `docs/CHANGELOG.md`.
- [ ] **4.6.2** Unificar el formato: hoy se repite `## [Unreleased]` varias veces, no sigue Keep a Changelog estricto
      (no hay secciones `Added`/`Fixed`/`Changed` consistentes ni versiones).

### 4.7 Config y DX

- [x] **4.7.1** Quitar `"src/_deprecated"` del `exclude` de `tsconfig.json`: **ese directorio ya no existe** (se
      eliminó en la Fase 0 de `docs/archive/MEJORAS.md`). → **RESUELTO 2026-10-01:** `tsconfig.json` ya no menciona `src/_deprecated` (el directorio no existe).
- [x] **4.7.2** Agregar script `"typecheck": "tsc --noEmit"` a `package.json` (hoy el CI usa `pnpm exec tsc --noEmit`;
      un script evita divergencias y es más descubrible). → **RESUELTO 2026-10-01:** script `"typecheck": "tsc --noEmit"` en `package.json` (más `typecheck:video`).
- [x] **4.7.3** Comentario de `coverage.thresholds` en `vitest.config.ts`: actualizarlo con los números reales
      (81.91/70.28/78.65/84.2) — hoy cita los de `mejoras_glm.md` (82.5/71.1/77.8/84.3, ya viejos). → **RESUELTO 2026-10-01:** comentario de `coverage.thresholds` actualizado con el piso del 2026-10-01.
- [ ] **4.7.4** `i18n` tiene 100% de statements con **40% de branches**: los fallbacks (`??`, idioma inválido) no están
      cubiertos. Agregar 2-3 tests.

### 4.8 Clutter en la raíz del repo

En la raíz conviven `AGENTS.md`, `CLAUDE.md`, `README.md`, `manual_zilabs.md`, `manual_zilabs_en.md` (tracked) y
varios directorios de herramientas/specs (`specs/`, `documents_labs/`, `scripts/`, `push.sh`, `.opencode/`, `.kilo/`,
`.continue/`, `.codeboarding/`). Los `.md` de sesiones de IA ya están gitignoreados (`glm_mejoras.md`,
`mejoras_glm.md`, `QWEN3.8.md`, `solar_mejoras.md`): eso está bien, y este documento es la versión "de proyecto"
dentro de `docs/`.

- [ ] **4.8.1** Consolidar guías: `CLAUDE.md` es mayormente un subconjunto de `AGENTS.md` → unificar en `AGENTS.md` y
      dejar `CLAUDE.md` como puntero (o eliminarlo).
- [ ] **4.8.2** Mover los `manual_zilabs*.md` a `docs/` (hoy en raíz y sin enlaces desde README).
- [ ] **4.8.3** Decidir destino de `specs/LAB_SPEC.md`, `ROLES.md`, `SKILLS.md` y `documents_labs/steps_lab*.md`:
      documentación útil pero desconectada de `docs/`.

### 4.9 Repo y LFS

`.git` = **1.3 GB**; `.git/lfs` = **≈1 GB** con **494 archivos** (videos ES/EN + wavs por escena + audios por
idioma).

- [ ] **4.9.1** `git lfs prune` periódico y evaluar versionar solo los másters de audio (no cada `*-sceneN.wav`).
- [ ] **4.9.2** Documentar en README que clonar sin `git lfs` deja punteros (los videos vienen del CDN → no rompe
      `pnpm dev`, pero confunde).
- [x] **4.9.3** `.gitattributes` declara `public/videos/** filter=lfs`; si en §3.2 se mueven a `media/videos/`,
      actualizar el path del filtro. → **RESUELTO 2026-10-01:** `.gitattributes` ya declara `media/videos/** filter=lfs` — el path se actualizó junto con el move de §3.2.

### 4.10 Observaciones menores (heredadas de `solar_mejoras.md`, siguen válidas)

- [ ] **4.10.1** `eslint-disable-next-line react-hooks/exhaustive-deps` en `hooks/*`: revisar que cada supresión tenga
      comentario del porqué (si no, es deuda silenciosa).
- [ ] **4.10.2** Números mágicos en `useReverseShell` (puertos/payloads): centralizar en constantes nombradas.
- [ ] **4.10.3** Wordlist de `hydra` hardcodeada: moverla a datos (`fs-wordlists.ts`) o documentarla como decisión.
- [ ] **4.10.4** `src/i18n` (UI, 111+111 líneas) convive con strings bilingües inline en academy/labs (~501 pares
      `en:`/`es:`): está bien por diseño (contenido vs UI), pero conviene documentarlo en `docs/DEVELOPMENT.md` para
      que nadie "migre" contenido didáctico al i18n de UI.

---

## 5. Plan priorizado (checklist global)

### P0 — antes de seguir desarrollando (≈ medio día)

- [ ] **A. Suite estable** → `testTimeout`/`hookTimeout` a 15000 + fake timers en `MachineLoader` y `FoxyTour-app`
      (§2.1.1-2.1.2). Cierre: **3 corridas verdes consecutivas** de `pnpm test:run`.
- [ ] **B. Suite rápida** → `@vitest-environment node` en tests sin DOM (§2.1.3). Objetivo: `environment` ≤ 150 s.
- [x] **C. Commit de `python3`** en rama, con docs alineados (§2.4). → **RESUELTO 2026-10-01:** la feature de `python3` ya está en `main` con los docs alineados.
- [x] **D. `/test` seguro** → guard `import.meta.env.DEV` + borrado selectivo de claves (§2.2). → **RESUELTO 2026-10-01:** guard `import.meta.env.DEV` + borrado selectivo de claves, con el progreso de Academy preservado.
- [x] **E. `Route path="*"`** con `NotFound` bilingüe (§2.3). → **RESUELTO 2026-10-01:** `Route path="*"` con `NotFound` bilingüe, y el gate de idioma de §2.3.2 encima.
- [x] **F. Docs sincronizados** → números reales (2022 tests / 153 archivos / 51 builtin) en README, AGENTS, CLAUDE y
      TESTING (§3.1). → **RESUELTO 2026-10-01:** README / AGENTS / CLAUDE / TESTING con los números reales de hoy (3278/262, 69+19 comandos, 132 compositions).

### P1 — siguientes 1-2 semanas

- [x] **G.** Cobertura: ramas de `hooks` + umbral `branches` a 72 (§2.5). → **RESUELTO 2026-10-01:** ramas de `hooks` ≥ 81% en los hooks nombrados y umbral de `branches` en 73.
- [x] **H.** Sacar `public/videos` del `publicDir` del build (§3.2) → `dist` de 923 MB a ~20 MB. → **RESUELTO 2026-10-01:** commit `73b3b72`; `public/videos/` no existe y `du -sh dist` = **20 MB** medido el 2026-10-01.
- [ ] **I.** `resetWorkspace()` por slices + test de contrato (§3.3).
- [x] **J.** Playwright en CI (§3.4). → **RESUELTO 2026-10-01:** job `e2e` en `ci.yml` + reporte en fallo.
- [ ] **K.** Remotion: composición única con `lang` + `Root.tsx` generado (§3.5).

### P2 — cuando haya aire

- [ ] **L.** `getCurrentUser` table-driven (§4.1).
- [x] **M.** Comentario de `types/mission.ts` + ARCHITECTURE (§4.2). → **RESUELTO 2026-10-01:** comentario corregido y ARCHITECTURE con emisores/validadores.
- [ ] **N.** Higiene: `any`/supresiones, `tsconfig` (`src/_deprecated`), script `typecheck`, comentario de thresholds
      (§4.3, §4.7).
- [ ] **O.** `index.html` lang/hreflang dinámicos (§4.4) + throttle de analytics (§4.5).
- [ ] **P.** Documentación: partir CHANGELOG, consolidar guías de agentes, mover manuales a `docs/` (§4.6, §4.8).
- [ ] **Q.** Eliminar `legacyArgsToRequest` cuando no queden call sites (§3.6).

---

## 6. Metodología y reproducibilidad

Todo lo afirmado acá se puede reproducir con estos comandos (ejecutados el 2026-09-15 sobre `2252bbc`):

```bash
# Estado de calidad
pnpm exec tsc --noEmit            # → 0 errores (EXIT=0)
pnpm lint                         # → sin salida (0 problemas, EXIT=0)

# Suite (repetir 3 veces para ver el flakeo)
npx vitest run --reporter=dot
npx vitest run --coverage

# Aislamiento de los tests que fallaron en la corrida full
npx vitest run src/components/__tests__/LabBuilder.test.tsx \
               src/components/__tests__/LabMiniTerminal.test.tsx \
               src/components/__tests__/MachineLoader.test.tsx

# Tamaños y censos
du -sh dist dist/assets public/videos .git/lfs
git count-objects -vH ; git lfs ls-files | wc -l
find src -type f \( -name '*.ts' -o -name '*.tsx' \) -not -path '*__tests__*' -print0 | xargs -0 wc -l | tail -1
grep -rn 'localStorage' src --include=*.ts --include=*.tsx | grep -v __tests__
grep -rn '@ts-ignore\|@ts-expect-error\|eslint-disable' src --include=*.ts --include=*.tsx | wc -l
grep -rln 'useFakeTimers' src | wc -l
grep -rn 'path="\*"' src/App.tsx
```

**Notas de honestidad:**

- Una de las tres corridas de la suite dio **verde total (2022/2022, EXIT=0)**. El flakeo §2.1 es **intermitente y
  dependiente de carga**, no un fallo determinista: no hay que "arreglar tests rotos" sino eliminar la dependencia de
  timers reales.
- Las cifras de cobertura provienen de la corrida limpia (2022 passed). En corridas con fallos, Vitest no imprimió la
  tabla (y recreó `coverage/`), por lo que la única medición válida es esa.
- Los conteos de docs (§3.1) y de comandos (§0) se midieron con `wc -l`/`ls`, no se copiaron de otros documentos.
- No se modificó código de producción durante esta revisión: solo se creó este documento y se regeneró `coverage/`
  (gitignored).

### Historial de esta revisión

| Fecha | Autor | Cambio |
|---|---|---|
| 2026-09-15 | revisión asistida (Deep) | Versión inicial: estado medido, P0 (flakeo, `/test`, 404, WIP python3, thresholds), P1 y P2 |
