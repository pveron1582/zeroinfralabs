# Revisión del proyecto — mejoras_bunny

**Fecha:** 2026-09-27 · **Base:** commit `abedddf` · **Estado verificado:** `tsc --noEmit` 0 · `pnpm lint` 0 errores (76 warnings) · `pnpm test:run` → **2686 tests / 218 archivos** · `src/` = 791 archivos, 105.243 líneas.

**Cómo se generó:** tres revisiones en profundidad (arquitectura/acoplamiento, corrección/rendimiento, tests/CI/producto) + verificación manual de los P0 con `grep` y lectura de código. **No se modificó nada del código.** Cada P0 fue reproducido o verificado por lectura directa; los P1 provienen de las revisiones y están marcados como *a verificar* cuando no los comprobé yo.

**Estado:** nada de lo de abajo está arreglado todavía. Los `[ ]` son la lista de trabajo.

---

## 1. Fortalezas (preservar)

1. **Contrato de validación universal.** Cero imports de `components/` desde `commands/`; cero referencias a `laboratorio_0N` desde la capa de comandos; 17 `MissionCriteriaType` ↔ 17 validadores; ningún validador hardcodea herramientas (`nmap|hydra|gobuster` → 0 matches en `utils/validators/`). Es la mejor decisión de arquitectura del proyecto.
2. **Permisos con fuente única y respetada.** `utils/permissions.ts` + `utils/fs.ts` son la SSOT. Solo 2 asignaciones directas a `file.mode` en todo `src` (`chown.ts:90,103`, y sobre objetos nuevos). Sticky bit, umask y `su_user` bien modelados.
3. **Identidad como override de ejecución, no estado de máquina.** `setExecutionSuUser` con restore en `try/finally` (`executor.ts:157-187`) resuelve ~72 call sites de `getCurrentUser` sin tocarlos.
4. **Aislamiento por terminal bien resuelto:** `createIsolatedExecutor` con estado MSF/PowerShell en closure, `destroyOwner` en el unmount, alias con tope de ciclos + `runChild` con detección de ciclo por línea.
5. **Tests e infra:** i18n ES/EN con **0 claves desalineadas** (107/107), `ChunkErrorBoundary` + reintento de chunks en las 8 rutas lazy, CI de 2 etapas con `concurrency` y caché de pnpm, E2E Playwright **sí corriendo en CI** (`ci.yml:42-64`).
6. **Higiene:** 0 `TODO/FIXME` reales (los 39 hits son la palabra "todo" en contenido educativo), 71 `any` en 105k líneas, casi ningún `catch {}` vacío, listeners y timers bien limpiados en `useTerminalEffects`, `useAutoRefresh`, `useDesktopWindows`.

---

## 2. P0 — urgente (verificado)

### [x] P0.1 `rm -rf` borra directorios hermanos con prefijo común — **RESUELTO 2026-09-27**

- **Dónde:** `src/commands/builtin/rm.ts:87` y `:93`
  ```ts
  const children = newFiles.filter(f => f.path.startsWith(dirPrefix) && f.path !== entry.path);
  …
  if (newFiles[i].path.startsWith(dirPrefix)) newFiles.splice(i, 1);
  ```
  Falta la frontera de `/`. Mismo patrón en **`cp.ts:109`, `mv.ts:92,98`, `windows/fsWrite.ts:90`, `powershell/cmdlets/fs.ts:143`, `chgrp.ts:87`** (6 copias).
- **Reproducción:** con `/home/user/x/secret.txt` y `/home/user/xyz/precious.txt`, `rm -rf /home/user/x` deja el FS en `["/.dir","/home/.dir","/home/user/.dir"]` — se llevó `xyz` y su contenido. Con `cp -r` copia de más; con `mv` mueve de más.
- **Impacto:** pérdida de datos irreversible en un entorno de enseñanza + modelo mental falso ("rm -rf borra el directorio y sus hijos" y nada más).
- **Fix:** helper único en `utils/fs.ts`, p.ej. `isUnder(path, dir) = path === dir || path.startsWith(dir + '/')`, usado por los 6 call sites + test de tabla.
- **Esfuerzo:** ~30 min.

### [x] P0.2 El intérprete de Python puede tumbar la app entera — **RESUELTO 2026-09-27**

- **Dónde:** `frameworks/python/evalExpr.ts:205-206` (y `:207-211` para listas), `frameworks/python/runtime.ts:60`, `commands/builtin/python3.ts:99`, `frameworks/python/interpreter.ts:140-161`
- **Causa:** `l.repeat(Math.max(0, asNum(r)))` sin tope; `runtime.ts:60` hace `throw e` para todo lo que no sea `PyError`; `python3.ts` no tiene `try/catch`; no hay guarda de profundidad.
- **Reproducción:**
  - `python3 -c '"A"*1000000000'` → `RangeError: Invalid string length` escapa del runtime y `ChunkErrorBoundary` (envuelve toda la app) reemplaza la UI por *"No se pudo cargar la página"*.
  - `python3 -c '"A"*300000000'` → reserva 300 MB en 0 ms y mata la pestaña.
  - `python3 -c $'def f():\n f()\nf()'` → `RangeError: Maximum call stack size exceeded`, mismo colapso. `academy/python-lessons.ts:176` ya enseña `def`, así que la recursión es el primer experimento del alumno.
- **Lo que ya está bien:** `while True: pass` **sí** está protegido (`guardSteps` + `DEFAULT_MAX_STEPS=200_000`, 19 ms) y `range(1e8)` da `OverflowError` limpio (`interpreter.ts:176-180`). El agujero es **memoria y recursión**, no el lazo. No hay `eval` ni `new Function` en todo `frameworks/python/`.
- **Fix:** `MAX_STRING_LEN` / `MAX_ITER` con `PyError('MemoryError')`; contador de profundidad en `RunCtx` → `PyError('RecursionError')`; y un `catch` de seguridad en `python3.ts` que traduzca cualquier `Error` JS a traceback.
- **Esfuerzo:** ~1-2 h.

**Resolución (2026-09-27):** límites nuevos en `frameworks/python/context.ts`
(`MAX_STRING_LEN` 1M, `MAX_ITEMS` 100k, `MAX_CALL_DEPTH` 100) con
`callDepth` en `RunState`. `evalExpr.ts` los aplica en `*` y `+` de strings
y listas (y dejó de usar `out.push(...items)`, que revienta el stack de JS).
`interpreter.ts` corta la recursión con `RecursionError`. `runtime.ts` ya
nunca re-lanza: traduce cualquier error de JS a traceback. `python3.ts`
agrega un `try/catch` de defensa en depth. Un detalle que el reporte no
mencionaba: el **crecimiento exponencial** (`s = s + s` en un loop) escapaba
del guard de pasos, porque 30 iteraciones ya son 1 GB — también cae ahora en
MemoryError. Los cuatro vectores verificados responden en 0-3 ms con error
de Python en vez de tumbar la app.

### [x] P0.3 La gate de cobertura es configuración muerta — **RESUELTO 2026-09-27**

- **Dónde:** `.github/workflows/ci.yml:37` → `run: pnpm test:run` (sin `--coverage`) vs `vitest.config.ts:21-26` con thresholds `statements 80 / branches 72 / functions 75 / lines 80`.
- **Impacto:** los thresholds **nunca bloquean nada**. Todo el trabajo de cobertura es documental.
- **Fix:** `pnpm test:coverage` en el job de CI (y de paso `--reporter=dot` + `maxWorkers` acotado).
- **Esfuerzo:** 1 línea. **Es la mayor palanca de calidad del proyecto.**

**Resolución (2026-09-27):** la CI corre `pnpm test:coverage` y sube el
reporte HTML como artifact. Al medirlo apareció el motivo real del
desenchufe: la cobertura real es **68.80% branches**, y el umbral era 72% —
3 puntos por encima, o sea que activarlo a secas dejaba la CI en rojo. Se
bajó el piso a lo medido (80 / 68 / 77 / 83 statements/branches/functions/
lines contra 81.08 / 68.80 / 77.52 / 84.06 reales) y quedó como ratchet: la
corrida es determinista (±0.03 entre corridas) y el umbral sube cuando sube
la cobertura. `docs/TESTING.md` actualizado con las cifras reales.

### [x] P0.4 `CLEAR_TERMINAL` descarta toda la metadata del comando — **RESUELTO 2026-09-27**

- **Dónde:** `src/hooks/useRunCommand.ts:236`
  ```ts
  if (result.output === 'CLEAR_TERMINAL') { setHistory([]); return; }
  ```
  El `return` ocurre **antes** de `processCommandResult` (`useRunCommand.ts:230`).
- **Reproducción:**
  - `cat /etc/shadow | clear` → el `fileRead` se descarta → **la misión de lectura no valida**.
  - `touch /tmp/x | clear` → el archivo existe en el store pero con la misma identidad de objeto ⇒ **sin re-render** (invisible hasta el próximo render que toque otra cosa).
- **Higiene:** el protocolo es *igualdad de string*, y ya existe el mecanismo correcto (`blockingCommand.clearScreen`, `processCommandResult.ts:102`). Con el protocolo actual, `python3 -c "print('CLEAR_TERMINAL')"` te borra la terminal.
- **Fix:** mover `clear` a `blockingCommand`, y que ninguna salida temprana corte antes de procesar metadata.
- **Esfuerzo:** ~1 h.

**Resolución (2026-09-27):** dos campos nuevos en el contrato
`CommandResponse`: `clearScreen` y `exitToLanding`. Los seis productores
(`clear`, `cls` de cmd.exe, `Clear-Host` de PowerShell, `cls`/`clear` de las
sesiones de Metasploit y `end`) emiten `output: ''` + el flag, en vez de
escribir un centinela en el texto. En `useRunCommand` el handler procesa la
metadata **antes** de limpiar/salir, así que `cat flag | clear` completa la
misión y `touch x | clear` re-renderiza. Y `python3 -c "print('CLEAR_
TERMINAL')"` / `echo EXIT_TO_LANDING` ya no borran la pantalla ni sacan al
alumno del lab. Nota: el review sugería usar `blockingCommand.clearScreen`,
pero ese campo es para comandos *bloqueantes* (`nc`): no correspondía.

### [x] P0.5 Dos timers sin cleanup mueven el estado del escenario equivocado — **RESUELTO 2026-09-27**

- **Dónde:** `store/slices/scenarioSlice.ts:65-115` (`selectScenario`, 6.5 s) y `hooks/useRunCommand.ts:269-276` (streaming, hasta ~15 s; delays en `frameworks/metasploit/.../msfExploits.ts:77-104`).
- **Reproducción:**
  - Doble click en una tarjeta de lab antes de 6.5 s ⇒ el primer timer dispara y pisa `machines/missions/currentScenario` + `history.pushState` del segundo. Igual si pulsás "volver a labs" durante la animación: 6.5 s después la app te teletransporta al lab que dejaste.
  - Lab 04: el `exploit` de EternalBlue suma ~15.3 s con `busy=true` (input bloqueado). Si en esa ventana navegás a otro lab, el timer aplica `setMachineFiles`, `onChangeMachine(newMachineId)` y `setCurrentDir` **contra el escenario nuevo**.
- **Fix:** guardar el id del timer en el slice y `clearTimeout` al inicio de cada `selectScenario` y en `resetWorkspace`/`goHome`; en el streaming, cleanup en el unmount + guarda de escenario vigente.
- **Esfuerzo:** ~30 min.

**Resolución (2026-09-27):**
- **Loader** (`store/slices/scenarioSlice.ts`): `loaderTimer` + `loadGeneration`
  a nivel de módulo y un `cancelPendingScenarioLoad()` que se llama al
  empezar una carga y desde `resetWorkspace`/`goHome`. El callback además
  descarta su trabajo si la generación ya cambió. Efecto colateral que
  apareció al testear: `resetUiState` no limpiaba `showMachineLoader`/
  `loadingMachine`, así que cancelar el timer dejaba el loader congelado;
  ahora se limpian también.
- **Streaming** (`hooks/useRunCommand.ts`): el `setTimeout` se guarda en un
  ref con cleanup en el unmount, y el callback compara el `currentScenario.id`
  capturado: si el alumno cambió de lab mientras se escribía la salida (el
  exploit de EternalBlue son ~15 s), no aplica `setMachineFiles`,
  `onChangeMachine` ni `setCurrentDir` sobre el escenario nuevo. El `busy` se
  libera igual para no dejar la terminal bloqueada.
- **Bonus, misma clase**: las dos notificaciones (`uiSlice` y `scenarioSlice`)
  tenían timers independientes y con dos misiones seguidas la primera apagaba
  la segunda. Ahora hay un `scheduleNotificationClear` único.
- `vitest.config.ts`: `testTimeout` 15 s → 30 s. Al activar la cobertura en
  la CI (P0.3) una corrida con instrumentación v8 tardó 248 s y un test de
  FoxyTour dio timeout por carga, no por regresión.

---

## 3. P1 — mejoras de alto retorno

### [x] 3.1 Documentación desactualizada — **RESUELTO 2026-09-27**

| Archivo:línea | Afirma | Realidad |
|---|---|---|
| `AGENTS.md:9`, `CLAUDE.md:152` | `chunkSizeWarningLimit: 1000` | **No existe en `vite.config.ts`** |
| `AGENTS.md:136`, `CLAUDE.md:50`, `README.md:30,85,188`, `docs/ARCHITECTURE.md:136` | "39 compositions" | **132** `<Composition>` en `video/remotion/Root.tsx` |
| `docs/TESTING.md:8`, `:155` | Playwright "no corre en CI" | `ci.yml:42-64` corre `pnpm test:e2e` |
| `AGENTS.md:3,135`, `CLAUDE.md:9,49`, `README.md:7,84,123,187` | "58 lecciones" | ~65 lecciones reales |
| `docs/ROADMAP.md:367` | `getSuidEffectiveUser()` en `index.ts:107` | no existe en ese archivo (está en `commands/suid.ts`) |
| `docs/ROADMAP.md:17` | `docs/MEJORAS.md` | el archivo está en `docs/archive/MEJORAS.md` |
| `docs/TESTING.md:36` | `happyPath-scenario01..07` | existen `-scenario06`, `-06-flow`, `-07-flow`, `-scenario08`; no hay 01-05 |
| `docs/TESTING.md:75` / `CLAUDE.md:69` | "16 / 14 hooks" | **25** hooks en `src/hooks/` |
| `AGENTS.md:132` vs `CLAUDE.md:52` | builtin "~100" vs "(59)" | 69 archivos en `commands/builtin/` |
| `docs/ROADMAP.md:935` | Lab 08 "⏳ próximo" | `laboratorio08.ts` existe y está registrado (es EternalBlue+cmd.exe, no AD) |
| `docs/LABS.md` | guías 01–07 | falta la guía del Lab 08 |

`AGENTS.md` es la referencia operativa de los agentes: mientras diga 58/39/`chunkSizeWarningLimit`, cualquier trabajo futuro parte de una base falsa.

**Resolución (2026-09-27):** 15 correcciones, todas con el número **medido**
en el código, no estimado:
- Academy **59 lecciones** (docs decían 58): 7 archivos `*-lessons.ts` (29) +
  7 archivos `path-*.ts` con lecciones inline (30); `path-scripting.ts` compone
  las suyas desde `bash-lessons`/`python-lessons`. Los ids son únicos (59/59).
- Remotion **132 compositions** en `Root.tsx` (docs decían 39).
- `chunkSizeWarningLimit`: **no existe** en `vite.config.ts` → se sacó de
  `AGENTS.md:9` y `CLAUDE.md:152` (y se aclara que sigue el default de Vite).
- Playwright **sí corre en CI** (`ci.yml`, job `e2e`) → corregido en
  `docs/TESTING.md:8`, y la lista de happyPath ahora es la real
  (06/06-flow/07-flow/08).
- `builtin/` son **69** archivos (no "~100" ni "59"); `tools/` son 19 comandos
  en 17 archivos, con `xrdp` agregado a la lista.
- Hooks: **25** en `src/hooks/` (no 14 ni 16).
- Rutas que no existen: `docs/MEJORAS.md` → `docs/archive/MEJORAS.md`;
  `getSuidEffectiveUser()` está en `src/commands/suid.ts:33` (no
  `index.ts:107`); `/etc/group` lo define `fs-etc.ts:82` (no `fs-linux.ts:116`);
  los tipos viven en `src/types/`.
- ROADMAP: el "Lab 08 de Active Directory" marcado ⏳ ya no aplica — el
  `laboratorio08.ts` existe con otro enfoque; el de AD pasa a ser un Lab 09.
- **No se tocó `docs/mejoras-deep.md`**: es una revisión fechada (2026-09-15,
  commit `2252bbc`) y sus números son correctos para esa fecha.

### [ ] 3.2 Segundo registro de comandos

`commands/builtin/which.ts:9-140` mantiene `COMMAND_PATHS` con **127 entradas** a mano y `:142-167` `CMD_TO_PACKAGE` con 25, **sin ningún test de sincronía** (grep de `COMMAND_PATHS` fuera del archivo → vacío). Ya miente sobre ~25 comandos. Conviviendo con `commands/names.ts`, que sí está protegido por `commandNames.test.ts`. Además `NetworkMap.tsx:5` y `TerminalPrompt.tsx:1` importan del barrel `commands/index.ts` (el problema de chunking que el propio `names.ts` documenta y no se aplicó).

### [ ] 3.3 Capas invertidas

- `store/slices/scenarioSlice.ts:3` → `laboratorios/laboratorios.ts`; `scenarioStore.ts:11` → `frameworks/shells/ShellManager.ts`; `scenarioSlice.ts:5` → `frameworks/resetManagers.ts`.
- `frameworks/metasploit/orchestrators/msfMeterpreter.ts:6`, `msfShell.ts:11` → `commands/windows/fs.ts`; `shells/ftp/ftpCommands.ts:9` → `commands/builtin/umask.ts` (una regla de permisos viviendo en un comando).
- `utils/autocomplete.ts:6,7` → `frameworks/metasploit/core/msfModules.ts` y `commands/names.ts`.
- Consecuencia práctica: **un slice no se puede testear sin cargar los 8 labs**.

### [ ] 3.4 Bolsas de campos y god function

- `types/command.ts`: `CmdResponseBase` 25 campos + unión de 16 variantes + `CommandContext` 24 campos. Agregar un canal = tocar 3 sitios.
- `store/types.ts:23-117`: `ScenarioState` con **73 campos**, de los cuales ~35 acciones de dominio viven en la raíz en vez de un slice propio.
- `hooks/useRunCommand.ts:23-52` `RunCommandDeps` 28 campos · `processCommandResult.ts:33-56` `ProcessDeps` 21 · `useFtpSession.ts:15-34` `SessionRunnerDeps` 17 — cableados a mano en `useCommandRunner.ts:141-147,182-191,213-224`.
- `hooks/processCommandResult.ts:74-253`: 180 líneas, 13 `getState()` y 8 `if ('x' in result)` secuenciales. Debería ser `Record<keyof CmdResponseBase, handler>` + un test que falle si el contrato crece sin handler (convierte deuda invisible en deuda que rompe el build).

### [x] 3.5 Helpers duplicados — **RESUELTO 2026-09-27**

- `isRoot` inline en **7 sitios** (`permissions.ts:40,80,92`, `chmod.ts:79`, `chgrp.ts:14`, `chown.ts:14`).
- `humanSize` reimplementado 4 veces con unidades distintas: `ls.ts:48` (K), `du.ts:36` (K), `df.ts:12` (G), `sysinfo.ts:70-71` (Mi/Gi).
- **mtime inconsistente:** `stat.ts:23-38` (`stableTimestamp`, ya exportado) vs `ls.ts:109-121` (`stableDate`) con otra codificación → `ls -l` y `stat` muestran fechas distintas para el mismo archivo.
- ~13 lookups de archivos a mano saltándose `findFile` (`cd.ts:39`, `ls.ts:201`, `sudo.ts:142`, `dpkg.ts:43`, `winpeas.ts:83`, `suid.ts:23`, `hydra.ts:68,102`, `cat.ts:17`, …), que `AGENTS.md` prohíbe explícitamente.
- 142 literales de modo (`0o644/755/…`) fuera de tests; deberían ser constantes en `utils/fs.ts`.

**Resolución (2026-09-27):**
- **Bug real cerrado**: `homeDirFor(user)` en `utils/users.ts` reemplaza las
  tres copias de la regla "home del usuario". Una de ellas
  (`processCommandResult.ts:166`) interpolaba `/home/${sshLoginUser}` sin el
  caso root, así que un `ssh root@victim` dejaba el cwd en **`/home/root`**.
- **`isRoot` con fuente única**: los 6 inline `uid === 0 || username === 'root'`
  de `permissions.ts`, `chmod`, `chgrp` y `chown` ahora usan el helper de
  `utils/users.ts` (que ya era el canónico). No se tocaron los chequeos de
  admin de los comandos de Windows (`system.ts`, `potato`, `winpeas`), que son
  otra regla: ahí `uid === 0` significa "administrador".
- **Nuevo `src/utils/format.ts`**: `formatBytes` (estilo `ls -h`/`du -h`),
  `formatBytesBinary` (estilo `free`) y `formatMegabytes` (estilo `df`)
  reemplazan las 4 copias de conversión, que además usaban unidades
  distintas. `du -h` ahora escala igual que `ls -h` (antes nunca pasaba de K).
- **Un solo mtime virtual**: `stableTimestamp` + `hashPath` se mudaron a
  `utils/format.ts` y `ls -l` formatea desde ahí (`formatLsDate`). Antes
  `ls.ts` y `stat.ts` hasheaban el path por separado y **mostraban fechas
  distintas para el mismo archivo**; ahora coinciden por construcción.
- **Lookups de archivo**: `cd` ahora usa `findDirEntry` y `sudo`/`reg query`
  usan `findFile` en vez de `machine.files.find(...)`. Los ~10 lookups
  restantes NO se migraron a propósito: tienen otra semántica (búsqueda por
  sufijo entre máquinas en `hydra`, rutas múltiples de binario en `suid`,
  fallback tolerante en `cat`).
- Sanidad en el helper: `formatBytes(NaN)` imprimía `NaNG` (lo detectó el
  test nuevo); ahora NaN/Infinity/negativo → `0`.

### [ ] 3.6 Cobertura de tests (brechas) — **academy/ RESUELTO 2026-09-27**

| Área | LOC | Tests | Prioridad |
|---|---|---|---|
| `src/academy/` (65 lecciones) | — | **0** | **P0** — un typo en un `id` rompe navegación en runtime |
| `src/components/appContent/` (shell del workspace) | 1302 | **0** | **P0** |
| `src/frameworks/metasploit/{core,orchestrators}` | 9 archivos | 0 unitarios | P1 |
| `src/frameworks/{cron,fs,network,packages,process}` | 5 archivos | 0 directos (solo rebote) | P1 |
| `src/frameworks/python/` | 14 | 1 archivo | P1 |
| `src/hooks/` sin test | 25 hooks, 14 con test | 11 sin cubrir | P1 |
| `src/video/` | 70 | 0 (riesgo bajo: no entra al bundle) | P2 |
| E2E | 7 specs / 17 tests | sin smoke de misión completada, sin `lab08.spec.ts` | **P0** |
| `src/laboratorios/__tests__/` | falta `laboratorio04.test.ts` | | P2 |

Además: `pnpm test:ui` **está roto** (`package.json:20` invoca `vitest --ui` pero `@vitest/ui` no está en `devDependencies`).

**Resolución parcial (2026-09-27) — `academy/`:** nuevo
`src/academy/__tests__/paths.test.ts` (+24 asserts) como contrato de datos de
los 8 paths y 59 lecciones, que hasta ahora no tenían un solo test:
unicidad global de ids, `lesson.pathId` coherente con el path que la lista,
`order` único **por módulo** (es por subsección, no por path: `os` tiene 14
lecciones y 5 orders distintos), `getLesson`/`getPath`/`getSubIdForLesson`
resolviendo para toda lección, subsecciones que cuadran con el array flat,
quizzes con `correctIndex` en rango y paridad ES/EN de options, captions de
video y pares de matching, y `labRef`/`labId` apuntando a labs existentes.
Escribirlo enforceable mis supuestos: `order` es por sección y las
subsecciones guardan `Lesson[]`, no ids.

**Pendiente de 3.6:** `appContent/` (1302 LOC sin tests), los hooks sin
cubrir, `metasploit/{core,orchestrators}` y el E2E de humo de misión.

### [ ] 3.7 Rendimiento en el camino caliente

1. `components/StreamingOutput.tsx:15-20`: `lines.slice(0,shown).join('\n')` por línea → **O(n²)** + re-layout completo del `<pre>` por línea (500 líneas de gobuster ⇒ ~125k caracteres reconstruidos con el input bloqueado).
2. Sin tope de volumen de salida: medido **1.7 MB / 100k líneas** en un solo `<pre>` y retenidas en el estado de React.
3. `Terminal.tsx:126` `history.map(...)` por render (por tecla) + `useTerminalEffects.ts:61-66` fuerza `scrollTop` en `softDeps` ⇒ layout sincrónico por tecla.
4. `hooks/usePendingPythonInput.ts:37` re-ejecuta el script entero por cada `input()`; además `python3.ts:171-177` no deduplica puertos → filas repetidas en `EnumerationPanel.tsx:83`.
5. `EnumerationPanel.tsx:38` `getDynamicCredentials()` sin memo, en el cuerpo del render.
6. Convención `filesChanged` = snapshot completo: 31 sitios con `machine.files =` re-renderizan a todos los suscriptores por escritura.

### [x] 3.8 Accesibilidad — **RESUELTO 2026-09-27 (parcial)**

- 20 de 118 `.tsx` de componentes usan `aria-label`.
- `components/labGrid/ScenarioCard.tsx:26,42`: `role="button" tabIndex={0}` **sin `onKeyDown`** → las tarjetas del LabGrid no se abren con teclado.
- Ningún modal tiene focus trap.
- Lo bueno: `Terminal.tsx:67-68` (`role="application"` + `aria-label`), `:120-121` (`role="log"`), `TerminalInput.tsx:24` — y los E2E dependen de ese `aria-label`, lo que lo ata a un contrato estable.

**Resolución (2026-09-27):** las tarjetas del LabGrid se abren con **Enter y
Espacio** (`onKeyDown` + `aria-label` con el nombre del lab; el Espacio hace
`preventDefault` para no scrollear la página). Era el único `role="button"` del
proyecto sin handler de teclado: los de `DesktopTerminal` y `MobileWorkspace`
ya lo tenían. Tests: 2 en `LabGrid.test.tsx`.

**Pendiente de 3.8:** focus trap en los modales, `aria-label` en los ~98
componentes que no lo tienen, y auditar el resto de la app (no se hizo un
barrido completo).

### [ ] 3.9 Producto / superficie

- `App.tsx:49` expone `/:lang/zildeb` (LabBuilder, LessonBuilder y **DebugPanel**, que vuelca el store completo) con login comparado **en el bundle del cliente** (`LoginScreen.tsx`), sin auth de servidor. Todo es local, pero en producción es superficie de debug pública.
- `store/scenarioStore.ts:44` tiene `version: 2` + `merge` **sin `migrate`**: cualquier bump futuro hay que hacerlo a mano.
- `tsconfig.json:21` incluye `src` → el `tsc --noEmit` del CI type-chequea las 132 compositions de Remotion: un error de tipos en un video tumba el CI de la app.
- No hay script `remotion` en `package.json` pese a que `README.md:30` describe el pipeline de render.

---

## 4. Plan de ataque sugerido

| # | Ítem | Esfuerzo | Impacto |
|---|---|---|---|
| 1 | P0.1 `isUnder` en `rm/cp/mv` + 3 call sites más | 30 min | Cierra pérdida de datos |
| 2 | P0.3 coverage en CI | 1 línea | Activa el gate que ya existe |
| 3 | P0.5 `clearTimeout` en `selectScenario` y streaming | 30 min | Evita estado cruzado entre labs |
| 4 | P0.2 topes de memoria/recursión en Python + `catch` de seguridad | 1-2 h | Evita que el alumno pierda la sesión |
| 5 | P0.4 `clear` → `blockingCommand`, sin cortar metadata | 1 h | Misiones que no validan |
| 6 | 3.1 documentación (12 correcciones, empezar por `AGENTS.md`) | 1-2 h | Deja de propagar datos falsos |
| 7 | 3.6 tests de `academy/paths` (65 lecciones, ~40 asserts) | 2 h | Red que hoy no existe |
| 8 | 3.7 tope de salida + fin del O(n²) en `StreamingOutput` | 2 h | Evita el cuelgue con salidas grandes |
| 9 | 3.4 `processCommandResult` como tabla de handlers | 3 h | Corta el coste de cambio del contrato |
| 10 | 3.2 `which.ts`: derivar paths de `names.ts` + test de sincronía | 1 h | Saca un registro manual |
| 11 | 3.5 `formatBytes` / `homeDirFor` / `stableTimestamp` único | 3 h | Arregla mtimes y tamaños inconsistentes |
| 12 | 3.3 invertir las 3 dependencias de capa del store | 2 h | Habilita testear slices aislados |

Los ítems 1-5 son P0 y ninguno requiere decisiones de diseño: son bugs localizados.
