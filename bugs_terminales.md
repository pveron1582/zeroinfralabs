# Bugs de aislamiento de terminales

Review del WIP de aislamiento por terminal (5 ventanas independientes SSH/FTP/NC/RDP/MSF).
Fecha: 2026-09-24. Estado: **todo resuelto** — CRITICAL/HIGH/MEDIUM/LOW cerrados;
el único análisis sin cambio de código es el invariante MSF/PS (verificado sin
divergencia).

Estados: `[ ]` pendiente · `[~]` en curso · `[x]` resuelto

---

## [x] CRITICAL — cleanup atado a los botones de cierre, no al unmount ✅ 2026-09-24

**Resuelto:**
- `useCommandRunner.ts` ahora tiene un effect de cleanup:
  `useEffect(() => { if (!terminalId) return; return () => shellManager.destroyOwner(terminalId); }, [terminalId])`
  — destruye el stack al unmount (cierre, cambio de modo, salir de lección) y nunca
  toca el stack compartido `'default'` sin `terminalId`.
- `LabMiniTerminal.tsx` pasa `terminalId={'labmini-' + labId}`.
- Verificado: minimizar ventanas usa `display:none` y mobile oculta con CSS `hidden`
  (ninguno desmonta → las sesiones vivas no se destruyen).
- Tests nuevos: 3 en `useCommandRunner.test.ts` (destruye con id / no toca sin id /
  destruye el id anterior si cambia) + 1 en `LabMiniTerminal.test.tsx` (terminalId propio).

**Historial del bug:**

`destroyOwner` solo se llama desde `closeWindow`:
- `src/hooks/useDesktopWindows.ts:190`
- `src/components/appContent/MobileWorkspace.tsx:265`

Ningún unmount de Terminal destruye su stack de shells.

**Flujo roto real (Academy):**
1. Lección con lab → usuario abre `ftp` → sale de la lección
   (`src/components/academy/LabMiniTerminal.tsx:88` renderiza `<Terminal>` **sin
   `terminalId`** → cae en la clave constante `'default'`).
2. Terminal unmounta sin `destroyOwner` → frame FTP queda en `'default'`.
3. Vuelve a la lección → el guard `globalResetDoneForScenario === scenarioId`
   (`src/hooks/useCommandRunner.ts:169`) **salta el reset** → `executor.ts` enruta
   todos los comandos al shell viejo. Terminal secuestrada con prompt normal.

**Mismo patrón con ids reutilizables:**
- `'classic-terminal'` (`src/components/appContent/WorkspaceBody.tsx:52`) — `mstsc`
  cambia a modo windows-desktop → la Terminal clásica desmonta con frame RDP vivo →
  al volver remonta con el mismo id y hereda el frame.
- `win-rdp-<machineId>` en `WindowsDesktop` (mismo caso).

**Fix:**
- Cleanup en el unmount de `useCommandRunner`:
  `useEffect(() => () => shellManager.destroyOwner(terminalId), [terminalId])`
  (cubre desktop, mobile, classic, Academy y windows-desktop de una vez).
- `LabMiniTerminal` debe pasar un `terminalId` propio.
- El `destroyOwner` de `closeWindow` queda como redundancia o se elimina.

---

## [x] HIGH — guard de reset global keyed solo por `scenarioId` ✅ 2026-09-24

**Resuelto (SSOT en la entrada de escenario):**
- Nuevo `src/frameworks/resetManagers.ts` → `resetScenarioManagers()`: única
  función que resetea shell/process/network/package/cron/mounts.
- Las **tres entradas de escenario** ahora resetean managers y limpian el marker:
  - `scenarioSlice.selectScenario` (reemplaza `shellManager.reset()` suelto)
  - `AdminPanel.loadScenario`
  - `LabMiniTerminal` (init effect)
  — además AdminPanel y LabMini ahora nullan también `rdpSession` (antes se
  escapaba).
- El effect de `useCommandRunner` queda como **bootstrap/fallback** (primera
  terminal con marker limpio: sesiones de store + identidad con contexto de
  máquina) usando `resetScenarioManagers()`.
- **Descubrimiento de test:** `setup.ts:57` importa el store ANTES de que
  `vi.mock` del archivo de test se registre → `vi.mock` de módulos que el
  slice importa NO intercepta al slice (queda la fn real). Por eso el test de
  `scenarioStore` assertea sobre el efecto real (`vi.spyOn(shellManager, 'reset')`)
  en vez de contar calls del mock. Dejar constancia: no intentar
  `vi.mock(resetManagers)` en tests que ejercitan `scenarioSlice`.
- Tests nuevos: guard en `useCommandRunner.test.ts` (3: resetea una vez /
  segunda terminal no resetea / reentrada con marker limpio resetea),
  `scenarioStore.test.ts` (1), `LabMiniTerminal.test.tsx` (1),
  `AdminPanel.test.tsx` (1).

**Historial del bug:**

`src/hooks/useCommandRunner.ts:167-186`: `if (store.globalResetDoneForScenario === scenarioId) return;`

Reentrar al mismo lab sin pasar por `resetWorkspace` (Academy → Labs con el mismo id,
`AdminPanel.loadScenario`, reselección) salta el reset → managers de red/procesos/
cron/mounts y stacks de shells de la sesión anterior contaminan un lab que arranca
"fresco" (máquinas sí se reemplazan, managers no).

**Fix:** resetear managers + limpiar el marker dentro de `selectScenario()` / entrada
de sesión (SSOT en la entrada del escenario). El guard queda solo para el doble-mount
de terminales dentro de una misma entrada.

---

## [x] HIGH — identidad "aislada" solo en apariencia ✅ 2026-09-24

`src/hooks/useIdentityStack.ts:54-62`: el branch local de `popIdentity` llama
`applyIdentityStore(prev)`, que ejecuta `changeMachine` + `setSuUser` +
`resetPrivescCompleted` + `setCurrentDir` **globales** (`identitySlice.ts:55-63`).

Además `machine.su_user` / `privesc_completed` son objetos compartidos: si la terminal A
hace `su root` en victim-01, el prompt de la terminal B en la misma máquina pasa a root
(`useTerminalIdentity` → `getCurrentUser` → regla `su_user`).

El comentario de `src/hooks/useCommandRunner.ts:139-143` promete aislamiento que no existe.

**Fix:** en modo `terminalId` no llamar `applyIdentityStore` (aplicar cwd/suUser al
estado local); derivar el prompt desde la pila local. Si identidad de máquina es global
por diseño → documentarlo en `AGENTS.md`/`docs/ARCHITECTURE.md` y corregir el comentario.

**Resuelto (2026-09-24)** — alcance "aislar solo su_user" (decisión del proyecto):
- `utils/users.ts`: override de ejecución (`setExecutionSuUser`) — la regla `su_user`
  consulta `executionSuUser ?? machine.su_user`; helpers `resolveUsername`/`getUserWithSu`.
- `executor.ts`: `executeCommandInternal` setea/restaura el override desde
  `ctx.suUserOverride` (try/finally) → cubre los ~72 call sites de `getCurrentUser`
  (pipes/MSF/PowerShell incluidos) sin tocarlos. `CommandRequest`/`CommandContext`
  llevan `suUserOverride`; lo pasan `useRunCommand`, FTP/SSH/RDP, `useAutoRefresh`.
- `useCommandRunner`: `topSuUser` del frame local (devuelto por `useIdentityStack`)
  alimenta prompt (`useTerminalIdentity`), `DEFAULT_ENV` y `useNanoSave`.
- `setSuUser` suprimido con `terminalId` en `processCommandResult` (privesc/suUserApplied),
  `usePendingSu` y `useReverseShell` → `machine.su_user` queda siempre vacío en modo aislado.
- `exit.ts`: `machine.su_user || suUserOverride` → identityExit en ambos modos.
- Pop local de `useIdentityStack` ya no llama `applyIdentityStore`; restaura cwd vía
  `setCurrentDir` nuevo. `privesc_completed` y credenciales siguen compartidos por diseño.
- Tests: +27 (`utils/users`, `commands/su-user-override`, `hooks/useIdentityStack`,
  extensiones en `exit`, `processCommandResult`, `useCommandRunner`).

---

## [x] MEDIUM — doble `checkMissionCompletion` en RDP ✅ 2026-09-24

- `src/hooks/useRunCommand.ts:143` llama `checkMissionCompletion(result)`.
- `src/hooks/useRunCommand.ts:144` llama `processCommandResult`, que lo vuelve a llamar
  (`src/hooks/processCommandResult.ts:69`).

Hoy inocuo por el guard de `completeMission`, pero dispara efectos dos veces (p.ej.
`hasNewNetworkInfo`). Además es asimétrico: FTP/SSH no corren `processCommandResult`.

**Fix:** quitar la línea 143 (o unificar las tres ramas de sesión sobre un único dispatch).

**Resuelto:** eliminada la línea duplicada — la rama RDP despacha un solo
`processCommandResult` (que ya llama `checkMissionCompletion`).

---

## [x] MEDIUM — prompt RDP reimplementado inline ✅ 2026-09-24

`src/hooks/useRunCommand.ts:145-151` construye el prompt username/password a mano,
mientras ya existe `getRdpPromptFor` (importado en `useCommandRunner.ts:223`).
Duplicación que ya divergió del helper.

**Fix:** `import { getRdpPromptFor } from './useRdpSession'` y usarlo en el fallback.

**Resuelto:** el fallback de `handleDownloadedFile` usa
`getRdpPromptFor(updatedSession) || currentPrompt`.

---

## [x] MEDIUM — `registerTerminal` dentro del initializer de `useState` ✅ 2026-09-24

`src/components/appContent/MobileWorkspace.tsx:139`: registro corre durante el render.
StrictMode doble-invoca initializers → si `Date.now()` pega en distinto ms queda un
registro fantasma en `activeTerminals` que nunca se des-registra y NetworkMap lo pinta
como chip extra (`NetworkMap.tsx:35-37,140`).

Relacionado: `useDesktopWindows.ts:80,93` llama `showNotification`/`registerTerminal`
**dentro del updater** de `setWindows` (updater impuro → toast duplicado en dev StrictMode).

**Fix:** registro y notificación en `useEffect` / fuera del updater.

**Resuelto:** en `MobileWorkspace` el registro de la terminal inicial pasó a un
`useEffect` de mount (usa el id real de `windows[0]`, no uno generado en el
initializer); en `useDesktopWindows` los cinco updaters impuros
(`addTerminal`/`addBrowser`/`openWallpaperPicker`/`addBurp`/`addGuide`) ahora
hacen `showNotification`/`registerTerminal`/`restoreWindow`/`bringToFront`
fuera de `setWindows` — el updater solo appendea la ventana computada.

---

## [x] MEDIUM — tests que esconden los bugs ✅ 2026-09-24

1. ~~`useCommandRunner.test.ts` mockea `markGlobalResetDone`...~~ ✅ mock hecho
   fiel (escribe estado) + 3 tests del guard agregados con el fix del HIGH #1.
2. ✅ Tests agregados: `useDesktopWindows.test.ts` (`closeWindow` →
   `destroyOwner(id)`; ventana no-terminal NO destruye) y
   `DesktopTerminal.test.tsx` (cerrar terminal → `destroyOwner('term-*')`).
   El test de unmount sin `closeWindow` ya existía en `useCommandRunner.test.ts`.
3. ✅ Ya cubierto por `alias.test.ts` ("debe aislar alias por terminal
   (executor)" — ex1 define, ex2 no lo ve); el archivo es nuevo sin trackear,
   por eso no se vio en el review original.

---

## [x] MEDIUM — fallback a store muerto en todos los modos de workspace ✅ 2026-09-24

Los tres modos pasan `terminalId` (`WorkspaceBody.tsx:52`, `DesktopTerminal.tsx:199`,
`MobileWorkspace.tsx:392`) → `store.ftpSession/sshSession/rdpSession` solo los escribe la
mini-terminal de Academy (la única sin `terminalId`). Consecuencias:
- `AdminPanel.tsx:158-159` (`ftpActive`/`sshActive` en snapshot) siempre lee `null`.
- `useAppContentStore.ts:23` siempre `null`.
- NetworkMap no muestra sesiones por-terminal (solo el registry `activeTerminals`).

**Decisión del usuario:** espejar la sesión activa al store para display.

**Resuelto:** los setters de `useFtpSession`/`useSshSession`/`useRdpSession` ahora
escriben **siempre** al store (con `terminalId`: primero el estado local, que sigue
siendo la fuente de verdad, y luego el espejo display; sin `terminalId`: igual que
antes). El store queda como mejor-esfuerzo de "última sesión con actividad" y los
tres lectores vuelven a ver datos reales. Tests nuevos: mirror en
`useFtpSession.test.ts` y `useSshSession.test.ts` + archivo nuevo
`useRdpSession.test.ts` (prompt + aislamiento + espejo).

---

## [x] MEDIUM — archivos sobre 300 líneas ✅ 2026-09-24

Convención explícita (`AGENTS.md`: keep < 300):
- ~~`src/hooks/useCommandRunner.ts` — 334~~ → **285**: `makeWelcome` →
  `processCommandResult.ts`, `buildBasePrompt` → `useTerminalIdentity.ts`,
  prompt ternario → `hooks/terminalPrompt.ts`, resets → hooks nuevos
  `useScenarioGlobalReset.ts` / `useTerminalMountReset.ts`.
- ~~`src/components/appContent/MobileWorkspace.tsx` — 497~~ → **148**: tipos →
  `mobileTypes.ts`, `useMobileWindows.ts` (estado/handlers, espejo móvil de
  `useDesktopWindows`), y sub-componentes `MobileKeyRow`, `MobileAddMenu`,
  `MobileExperiencePopup`, `MobileHelpDrawer`, `MobileWindowContent` (todos < 110).
- Todos los archivos nuevos/existing tocados quedan < 300.

---

## [x] LOW — misceláneo ✅ 2026-09-24 (6 de 7)

- ✅ SSOT de reset: eliminado `resetShellSessions`, queda solo `resetShellManager`
  (`shellIntegration.ts`); call sites migrados en `happyPath-scenario06-flow`,
  `ftp-shell-reset`, `closeSession` y `mstsc.test`.
- ✅ Deps muertas `setFtpSession`/`setSshSession` eliminadas de `ProcessDeps`, del
  objeto `processDeps` y del destructure en `useCommandRunner` (+ `makeDeps` del
  test).
- ✅ Headers de `useSshSession`/`useFtpSession` actualizados (el de `useRdpSession`
  ya era correcto): estado local con `terminalId`, store solo en modo legacy/tests.
- ✅ `initialCwd(m)` movido a `utils/users.ts` (SSOT compartido con
  `useCommandRunner`); `useIdentityStack` ya no hardcodea `/root` — el pop en una
  terminal Windows aplica el home win correcto.
- ✅ Ids de terminal con sufijo aleatorio (`term-<ts>-<rand>`) en
  `useDesktopWindows` y en el `useState` inicial de `MobileWorkspace`.
- ✅ `resetActiveTerminals` eliminado de `terminalSlice` (+ comentario en
  `types.ts`) — `resetTerminalState` ya limpia `activeTerminals`.
- [x] Dos fuentes de verdad MSF/PS — **verificado sin divergencia** (2026-09-24):
  las únicas mutaciones non-null de `msfState` local vienen de los comandos
  (`onMsfStateChange` en `useRunCommand`), y esos comandos actualizan el closure
  del executor ellos mismos; el único camino externo es el shortcut Ctrl+D
  (`useKeyboardShortcuts` → `setMsfState(null)`) y `handleSetMsfState` sí
  resetea el executor en `null`. El "solo sincroniza null" es correcto por
  construcción — invariante documentado en `useCommandRunner.ts` para que no se
  agregue una mutación non-null externa.

**Verificación del lote:** `tsc --noEmit` 0 · `pnpm lint` 0 errores (76 warnings)
· `pnpm test:run` → **2597 tests / 209 archivos**.

---

## Lo que está bien (no tocar)

- Arquitectura por-`ownerId` en `ShellManager` (stacks por clave + `destroyOwner` +
  `getActiveOwners`), retrocompatible con `'default'`, con tests
  (`ShellManager.test.ts:248-263`).
- `shell-routing.test.ts` cubre la regresión original: A no secuestra a B, terminal
  nueva no hereda sesión.
- `aliasTables` como `WeakMap<Map<Command>, Map<alias>>`: aísla alias por executor sin
  tocar el registry global.
- Routing `terminalId → local vs store` consistente en los tres hooks de sesión
  (FTP/SSH/RDP) y en `useIdentityStack`.
- Guard de reset global (cuando dispara) resuelve el bug real de "segunda terminal
  reinicia el laboratorio de la primera".
- Mock de `DesktopTerminal.test.tsx` completo (`registerTerminal`/`markGlobalResetDone`).

---

## Orden sugerido de ataque

1. CRITICAL (unmount cleanup + `LabMiniTerminal`) — fix acotado, cierra el hijack real.
2. HIGH guard de reset (entrada de escenario) — depende del 1 para no doblear lógica.
3. HIGH identidad local — decisiones de diseño, más tiempo.
4. Tests MEDIUM #1/#2 primero (cubren la lógica nueva), luego el resto.
