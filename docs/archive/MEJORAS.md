# MEJORAS — ZeroInfra Labs

Plan unificado de mejoras técnicas al código. Combina:
- El fix técnico de `tsc --noEmit` (proveniente de `ROADMAP_FIX_TSC.md`)
- Las mejoras urgentes detectadas en el análisis de código
- Mejoras de prioridad media y de higiene

Cada ítem se marca con ✅ al completarse. El orden no es estrictamente secuencial pero respeta dependencias (ej: prender `strict` antes de partir el store es más fácil).

> ✅ Fase 0 completa: `pnpm exec tsc --noEmit` → **0 errores**, `pnpm test:run` → **90/90 archivos, 1135 tests**. Continuamos con fases siguientes.

---

## FASE 0 — Solución de errores de TypeScript (`tsc --noEmit`)

Tomado de `ROADMAP_FIX_TSC.md`. Objetivo: 0 errores de `tsc --noEmit` manteniendo 90/90 tests pasando.

### 0.1 Excluir `src/_deprecated/` del `tsconfig.json` ✅
- Eliminar `src/_deprecated/` (39 archivos muertos, ~2.139 LOC) — confirmado sin imports externos por grep.
- Agregar `"exclude": ["node_modules", "src/_deprecated"]` en `tsconfig.json`.
- **Resuelve 22 de los 128 errores (~17%).**
- Archivos: `tsconfig.json`, `src/_deprecated/` (eliminado)

### 0.2 Completar `type: 'text'` en `FileEntry` de `fs-linux.ts` ✅
- Agregar `type: 'text'` explícito a `/etc/passwd`, `/etc/shadow` y wordlists.
- Archivos: `src/fs-models/fs-linux.ts`

### 0.3 Declarar campos nuevos en interfaces base ✅
- `ValidationCriteria`: agregar `service?: string` (ya usado en runtime, no declarado).
- `CommandResponse`: agregar `completedMissionId?: number` (ya emitido por algunos comandos).
- Archivos: `src/types.ts`

### 0.4 Ajustar firmas en tests ✅
- En `useCommandRunner.test.ts`, actualizar llamadas `makeWelcome()` → `makeWelcome([])`.
- Archivos: `src/hooks/__tests__/useCommandRunner.test.ts`

### 0.5 Verificación final ✅
- `pnpm exec tsc --noEmit` → debe reportar 0 errores.
- `pnpm test:run` → debe reportar 90/90 archivos pasando.

---

## FASE 1 — Críticos de arquitectura y tipos

### 1.1 Activar `strict: true` en `tsconfig.json` ✅
- Cambiar `"strict": false` → `"strict": true` y habilitar `noUnusedLocals: true` + `noUnusedParameters: true`.
- Archivos: `tsconfig.json`

### 1.2 Particionar `scenarioStore` en slices y extraer `resetWorkspace()` ✅
- Slices modulares creados en `src/store/slices/`: `scenarioSlice.ts`, `terminalSlice.ts`, `uiSlice.ts`.
- Fachada agregada `useScenarioStore` mantenida en `src/store/scenarioStore.ts`.
- Acción unificada `resetWorkspace()` implementada y utilizada en `App.tsx` y `useCommandRunner.ts`.
- Archivos: `src/store/scenarioStore.ts`, `src/store/slices/*`, `src/App.tsx`, `src/hooks/useCommandRunner.ts`

---

## FASE 2 — Code duplication en `commands/index.ts`

### 2.1 Eliminar `executeCommand` / `createIsolatedExecutor` duplicados ✅
- Extraídos `safeJsonParse<T>`, `parseMsfResponse()`, `createMsfCommand(getState, setState)`, `executeCommandInternal()` — funciones compartidas sin duplicación.
- `executeCommand` y `createIsolatedExecutor` ahora usan las mismas funciones.
- Archivo reducido de ~417 a ~315 líneas.
- Archivos: `src/commands/index.ts`

### 2.2 Eliminar `_msfState` singleton mutable ✅
- `_getMsf()`/`_setMsf()` ahora leen del store (`useScenarioStore.getState().msfState`).
- Eliminada `restoreMsfState()` — redundante.
- `App.tsx`: eliminados 2 efectos de sync MSF.
- Archivos: `src/commands/index.ts`, `src/App.tsx`

### 2.3 Eliminar `try { JSON.parse() } catch {}` silenciosos ✅
- 4 try/catch vacíos reemplazados por `safeJsonParse<T>` con `console.warn` en fallo.
- Archivos: `src/commands/index.ts`

---

## FASE 3 — Permisos especiales: SUID, SGID, Sticky Bit ✅

### 3.1 SUID en ejecución de comandos ✅
- **`src/commands/index.ts`**: Nuevas funciones `findBinaryFile()` y `getSuidEffectiveUser()` que buscan el binario en paths estándar y detectan SUID (`mode & 0o4000`).
- En `executeCommandInternal()`: cuando se ejecuta un binario con SUID, se marca temporalmente `privesc_completed = true` para que `getCurrentUser()` retorne el owner efectivo (root), y se restaura al finalizar.

### 3.2 Sticky bit en /tmp ✅
- **`src/commands/builtin/rmdir.ts`**: Nueva función `checkStickyBit()` que verifica si el directorio padre tiene sticky bit. Si está activo, solo el dueño del archivo (o root) puede eliminar archivos dentro.
- `rmdir` ahora usa `getCurrentUser()` unificado.

### 3.3 Binarios SUID en fs-model ✅
- **`src/fs-models/fs-linux.ts`**: 5 binarios SUID agregados con mode 0o4755: `su`, `sudo`, `passwd`, `find`, `vim`.

### 3.4 Escalada de privilegios vía SUID ✅
- La ejecución de un binario SUID de root marca `privesc_completed = true` temporalmente, lo que permite que `getCurrentUser()` retorne root durante la ejecución.

### 3.5 Tests de Fase 3 ✅
- **Nuevo `src/commands/__tests__/fase3-suid-sticky.test.ts`**: 17 tests cubriendo detección de SUID, sticky bit, formato `ls -l` para SUID/sticky, y verificación del fs-model base.

### Verificación
- `pnpm exec tsc --noEmit` → 0 errores ✅
- `pnpm test:run` → 91/91 archivos, 1.150/1.150 tests ✅

---

## FASE 4 —`CommandResponse` god type ✅

### 4.1 Partir `CommandResponse` (277 líneas) en unions discriminadas ✅
- **Problema:** `src/types.ts:181-277` define `CommandResponse` con ~25 campos opcionales que cubren FTP, SSH, MSF, privesc, nmap, gobuster, fileRead, etc. — todo en una interfaz. Compilador no puede verificar que un comando emita metadata coherente.
- **Implementado:** `CommandResponse` es discriminated union con 15 variantes tipadas (+15 interfaces extraídas para subtipos reutilizables: `FtpSessionData`, `SshSessionData`, `FoundCredentialsData`, `ScanResultsData`, `FoundDirectoriesData`, `FileReadData`, `SudoPrivilegesData`, `FoundVulnerabilityData`, `FailedUserData`, `PossibleUsersData`). Cada comando lleva `type` discriminator. Consumidores usan `'field' in result` para narrowing.
- **Impacto:** ~58 archivos modificados entre tipos, comandos, shells, MSF, hooks, validator y tests.
- Archivos: `src/types.ts`, ~30 archivos en `src/commands/`, `src/frameworks/`, `src/hooks/`, `src/utils/`, ~20 tests

---

## FASE 4 — Documentación duplicada

### 4.1 Eliminar `roadmapv0.md` ✅
- File `docs/roadmapv0.md` (742 líneas) es versión vieja de `docs/ROADMAP.md` (765), headers casi idénticos. Confirmar que está completamente subsumido por `ROADMAP.md` y eliminar.

### 4.2 Consolidar CHANGELOGs ✅
- `changelog.md` (raíz) ya eliminado en commit `a2ec4c4` previo a esta tarea — verificado ausente del working tree.
- Quedan como única fuente de verdad: `docs/CHANGELOG.md` (vigente, cambios recientes) y `docs/CHANGELOG_ARCHIVE.md` (historial previo).
- Link corregido en `README.md:161`: `CHANGELOG.md` → `docs/CHANGELOG.md`.

### 4.3 Consolidar READMEs ✅
- `README_FULL.md` (951 líneas) eliminado — estaba desactualizado (npm en vez de pnpm, "740+ tests", 5 labs, "strict: false intencional", rutas `src/shells/` que se movieron, etc.).
- `README.md` (162 líneas) queda como README único y vigente.
- Contenido único de `README_FULL.md` migrado a **`docs/OVERVIEW.md`** (nuevo): sección de Analytics + webhook de Google Apps Script + queries de Sheets + visión de producto a futuro (Admin Panel, Lab Builder, Community Platform, rutas premium, modelo freemium).
- Puntero a `docs/OVERVIEW.md` agregado a la sección de Documentación de `README.md`.

### 4.4 Renombrar typo en `GUIA_SIIMULADOR_PDF.md` ✅
- Renombrado a `GUIA_SIMULADOR_PDF.md` (doble I en `SIIMULADOR`) y movido a `docs/` vía `git mv`.
- Referencias actualizadas en `CLAUDE.md:135`.

### 4.5 Mover markdown sueltos a `docs/` ✅
- `HAPPY_PATH_TEST.md` → `docs/HAPPY_PATH_TEST.md`
- `MODELO_NEGOCIO.md` → `docs/MODELO_NEGOCIO.md`
- `SECURITY.md` → `docs/SECURITY.md`
- Referencias actualizadas en `CLAUDE.md:9`, `AGENTS.md:167`, `README.md:150`.

---

## FASE 5 — Higiene media prioridad

### 5.1 Eliminar `console.log` de debug en producción ✅
- 9 sitios identificados (algunos ya removidos en rondas previas); **6 sitios finales** migrados:
  - `src/App.tsx:31,32,34,87,91` (logs de "Loading TEST_SCENARIO", "ScenarioLauncher Render")
  - `src/components/FakeBrowser.tsx:225` (log de "Available machines")
- **`src/utils/logger.ts` (nuevo)**: exporta `logger.debug/info/warn/error`. En prod (`import.meta.env.PROD === true`) todas las llamadas son no-op; en dev prefijan con `[DEBUG]/[INFO]/[WARN]/[ERROR]` y delegan a `console.*` correspondiente.
- **`src/utils/__tests__/logger.test.ts` (nuevo)**: 5 tests verificando firma del logger y emisión correcta por nivel en dev.

### 5.2 Sincronizar `labs.html` con laboratorios reales ✅
- `labs.html` (628 líneas, standalone con `LABS` inline de 5 de 6 labs) **eliminado** vía `git rm`.
- Verificación previa: el archivo no estaba referenciado desde `index.html`, `vercel.json`, ni desde el código React. La ruta `/:lang/labs` del SPA apunta al componente `LabGrid` (definido en `src/App.tsx:149`), no al `labs.html`.
- Vite no lo copiaba a `dist/` (estaba en la raíz del repo, no en `public/`), así que visiting `https://zilabs.vercel.app/labs.html` en producción daba 404. Era un artefacto muerto de un mockup previo a la migración a React Router.
- Decisión: eliminar (no autogenerar) — no hay nada que lo consuma.

### 5.3 Bump de versiones de dependencias ✅
- `vitest`: `^4.0.18` → `^4.1.6` (floor alineado con la versión realmente usada). `pnpm update` bumpó installado a **4.1.10** (latest dentro del rango).
- `@vitest/coverage-v8`: `^4.0.18` → `^4.1.6`. `pnpm update` bumpó a **4.1.10**.
- `@vitejs/plugin-react`: `^4.0.0` → `^4.7.0` (acota al actual resuelto, evita saltar a majors 5/6 no pedidos por esta tarea). Sin cambio de versión (4.7.0 ya es la latest dentro del rango).
- `pnpm-lock.yaml` actualizado. Mayores (`@types/react 19`, `react 19`, `@testing-library/jest-dom 7`, `@vitejs/plugin-react 6`, `jsdom 30`) **no tocados** — son breaking changes fuera del scope de 5.3.
- Verificación post-bump: `tsc --noEmit` 0 errores, `pnpm build` sin warnings, `pnpm test:run` → **v4.1.10 / 106 archivos / 1355 tests** pasando.

### 5.4 Uso de `useShallow` en selectors pesados ✅
- `src/App.tsx` `AppContent`: los **34 `useScenarioStore((s) => s.X)`** se agruparon en **4 `useShallow` calls** (3 de estado + 1 de acciones estables). Las 14 acciones se leen en una sola suscripción (identidades estables → nunca disparan re-render).
- Mismo patrón en `AdminPanel.tsx`: 19 selectors → 3 `useShallow` calls (estado, acciones, language/setLanguage).
- Import de `useShallow` desde `zustand/react/shallow` (zustand 5).

### 5.5 Arreglar `vite.config.ts` "suprimir warning" hack ✅
- Eliminado `chunkSizeWarningLimit: 1000`.
- Code splitting real con `build.rollupOptions.output.manualChunks`: chunk `react` (`react`, `react-dom`, `react-router-dom`) y chunk `zustand`.
- Resultado del build: `react-*.js` 178 kB (gzip 58.55 kB), `zustand-*.js` 0.65 kB, app `index-*.js` 494 kB (gzip 136 kB) — bajo el límite default de 500 kB, sin warnings.
- Nota: `react-router` v7 no se lista en `manualChunks` porque con pnpm strict layout no es un dep directo (queda incluido en el chunk `react` vía `react-router-dom`).

### 5.6 Eliminar `vitest.config.ts` glob muerto ✅
- `include: ['src/**/*.{test,spec}.{ts,tsx}']` simplificado a `['src/**/*.test.{ts,tsx}']`. Verificado que no existe ningún archivo `.spec.*` en el repo (rg sale 0 resultados).

### 5.7 Eliminar imports rotos en `ContextRegistry.ts` ✅
- Verificación: los imports rotos originales (`'../modules/types'`, `'./SessionManager'`) ya fueron reemplazados en commit previo.
- `import type { MsfState, MsfSession } from './msfTypes'` apunta al módulo existente (`./msfTypes` en el mismo directorio).
- `SessionManager` se definió como stub local (`export interface SessionManager {}` marker interface, líneas 13-15) con comentario explicativo referenciando esta tarea, ya que la carpeta `src/frameworks/metasploit/modules/` no existe. El stub cumple su rol tipográfico — se usa solo como tipo de `MsfCommandContext.sessionManager` (línea 34).

---

## FASE 6 — Higiene baja prioridad

### 6.1 Eliminar `style={{}}` en exceso y mutación DOM directa ✅
- 254 inline `style={{...}}` en `.tsx`. Los componentes con theming dinámico (LabGrid, Terminal, MachineLoader) son entendibles, pero:
- **Mutación directa del DOM** en `LabGrid.tsx` — `e.currentTarget.style.color = ...` (flechas prev/next del modal y botón de cierre) **migrada a estado React** (`prevHover`, `nextHover`, `closeHover`). Sin mutación DOM directa.

### 6.2 Unificar 4 inputs repetidos en `Terminal.tsx` ✅
- `src/components/Terminal.tsx` — los 4 bloques `<input>` por modo (ftp, ssh, msf, normal) extraídos a componente compartido `<TerminalInput>`. Mismo comportamiento (ref, color/caretColor, autoFocus, autocompletados desactivados).

### 6.3 Mover keyframes a `index.css` ✅
- `@keyframes fadeInEntry` (Terminal.tsx) y `@keyframes cardIn` (LabGrid.tsx) movidos a `src/index.css`. Se eliminan los `<style>` JSX inyectados por render.
- Test `LabGrid.test.tsx` actualizado: verifica `animation: cardIn` en el `article` en vez del `<style>` inline.

### 6.4 Eliminar `// eslint-disable-next-line` colgados ✅
- `src/App.tsx` — 2 comentarios `react-hooks/exhaustive-deps` eliminados (el proyecto no tiene ESLint).

### 6.5 Integrar `ShellManager.serialize/deserialize` ✅
- `ShellManager.ts` — `serialize()` y `deserialize()` **eliminados** (métodos muertos, nunca llamados por `partialize`).
- Decisión: con 7.1 (no persistir estado de labs) restaurar shells abiertas en reload es inconsistente — el lab se reinicia, no hay nada que rehidratar.
- Tests de serialización eliminados de `ShellManager.test.ts`.

### 6.6 Limpiar `.gitignore` ✅
- Agregados `.venv/`, `.kilo/`, `.continue/`, `*.mcp.json`. `.mcp.json` untracked vía `git rm --cached` (queda en disco local, fuera del repo).

### 6.7 Eliminar `push.sh` y `list-files-by-lines.sh` del version-control ✅
- Ambos eliminados del repo (`git rm --cached`; no forman parte del producto).
- `push.sh` hacía `git add -A && git commit && git push` — riesgo de meter secretos al histórico.

### 6.8 Corregir commit messages inconsistentes ◻️
- Hay commits como `e351403 -h` (literal `-h` sololossalosa, flag colado), mezcla de conventional commits (`feat:`/`fix:`) con mensajes en español libres.
- No se pueden cambiar commits pasados sin rewrite, pero conveniente alinear往前 going forward.

---

## FASE 7 — Persistencia de secrets en localStorage

### 7.1 No persistir `machines` con credenciales en plaintext ✅
- **Problema:** `scenarioStore.ts` `partialize` persistía `machines` completo, incluyendo `found_credentials` con passwords en plaintext (ej. `R00t@SSH2024!` en `laboratorio01.ts:32`).
- **Implementado (Opción A):** `partialize` persiste solo preferencias UI (`view`, `language`, `theme`, `uiMode`, `activeApp`, `termColor`). No persiste `machines`, `missions`, `currentScenario`, `currentMissionId`, `activeMachineId`, `msfState`, `currentDir`, ni estado de browser/survey.
- **`version: 2` + `merge`:** whitelist de campos al rehidratar — descarta los datos viejos (con credenciales) que ya están en `localStorage` de usuarios existentes. Recargar el browser resetea el lab a estado inicial.
- Efecto: las sesiones de labs ya no persisten entre recargas (comportamiento intencional, consistente con 6.5).

---

## Verificación global

Al finalizar todas las fases, correr:
```bash
pnpm exec tsc --noEmit   # debe reportar 0 errores
pnpm test:run            # debe reportar 90/90 archivos pasando (o superior)
pnpm build               # debe compilar sin warnings de chunk size
```
