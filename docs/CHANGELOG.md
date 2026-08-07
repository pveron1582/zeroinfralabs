# Changelog

## [Unreleased] - 2026-08-06

### Auditoría de arquitectura completa — MEJORAS_KIMI.md

Sesión de refactorización mayor basada en la auditoría de arquitectura. 9 mejoras aplicadas:

- **4.1** `useCommandRunner` descompuesto: 776 → **384 líneas** (orquestador delgado). 9 hooks especializados extraídos.
- **4.2** MSF state como campo explícito `msfStateUpdate` en `CommandResponse` (antes: parsing de strings frágil con prefijo `MSF_STATE:`).
- **4.3** Tipos de sesión unificados (`FtpSessionData`/`SshSessionData` compartidos entre comandos y store).
- **4.4** Eliminado validator `custom` (confuso, siempre retornaba false). Reemplazado por `browserAction` explícito con campos `url`/`action`.
- **4.5** Identity stack movido al store Zustand (`identitySlice`). Antes: React state local en hook. Ahora: accesible desde cualquier componente.
- **4.6** Estado de sesiones unificado en store. Eliminada duplicación entre `useFtpSession`/`useSshSession` (React state) y componentes que leían del store.
- **4.7** Auto-registro de comandos. Eliminadas 72 entradas manuales del `COMMANDS` Map. Ahora se auto-construye iterando barrel exports (`import * as builtin from './builtin'`).
- **3.7** `AGENTS.md` actualizado: MSF state ya no dice "_msfState module variable", describe el store Zustand actual.
- **8.2** Fix SUID sin try/finally: `ctx.machine.privesc_completed` ahora se restaura en `finally` block. Antes: si el comando lanzaba excepción, quedaba corrupto en `true`.

**Métricas finales:** `tsc` 0 errores | `test:run` **1680/1680** ✅ | Build OK

---

## [Unreleased] - 2026-08-04

### Lab 5: eliminada la flag de usuario de `/home/john` (solo valida la de `/root`)

John tenía una flag en su carpeta home (`/home/john/flag1.txt` con `ZIL{FTP_ANON_ACCESS}`) que al leerla con `cat`/`nano` emitía `fileRead.isFlag: true` y completaba prematuramente la misión "Capture Root Flag" — siendo que la única flag que debe validar esa misión es `/root/flag2.txt`. Se elimina para evitar confusión: solo queda la flag de root tras la escalada. `tsc --noEmit` 0 errores, `pnpm test:run` → **128 archivos / 1681 tests pasando**.

- **`src/laboratorios/laboratorio05.ts`**: eliminado `createFile('/home/john/flag1.txt', scenario05Data.flags.user)` del template y el `flag1.txt` del `targetMachine.files` (dato redundante que no llegaba al escenario).
- **Tests**: `laboratorio05.test.ts` ahora verifica que `flag1.txt` NO exista en `targetMachine.files`; `commands-scenario05.test.ts` quita el `user.txt` con contenido de flag del fixture.

## [Unreleased] - 2026-08-03

### Autocompletado de `msfconsole`

`msfconsole` no aparecía en el autocompletado del sistema: `AVAILABLE_COMMAND_NAMES` (`src/commands/index.ts`) lo excluía con un filtro pensado para el REPL, pero eso solo impedía autocompletar el comando para ARRANCARLO (`msf` + Tab no sugería `msfconsole`). Dentro del REPL el autocompletado ya usa `autocompleteMsf` (msfState activo). `tsc --noEmit` 0 errores, `pnpm test:run` → **128 archivos / 1681 tests pasando**.

- **`src/commands/index.ts`**: se elimina el `.filter(name => name !== 'msfconsole')` de `AVAILABLE_COMMAND_NAMES` — ahora `msf` + Tab → `msfconsole`.
- **Tests**: `autocomplete.test.ts` (msfconsole incluido; dentro de msf usa comandos MSF y autocompleta módulos tras `use`) y `useKeyboardShortcuts.test.ts` (Tab con `msfState` activo completa `use`; Tab con `msf` completa `msfconsole`).

### Lectura de flags/notas con `nano` también valida las misiones

Antes, solo `cat` emitía la metadata `fileRead` y completaba las misiones de tipo flag/nota/payload. Ahora **abrir el archivo con `nano` también las valida** (y los futuros editores como vim/vi podrán hacer lo mismo). `tsc --noEmit` 0 errores, `pnpm test:run` → **128 archivos / 1677 tests pasando**.

- **Nuevo helper compartido `src/utils/fileRead.ts`**: `buildFileReadMetadata(machine, allMachines, resolved)` centraliza la detección de tipo de archivo (`isFlag`/`isNote`/`isPayload`), la detección de usuarios mencionados (`possibleUsers`) y el mapeo de máquina (atacante → víctima).
- **`src/commands/builtin/cat.ts`**: refactorizado para usar el helper (comportamiento idéntico).
- **`src/commands/builtin/nano.ts`**: al abrir un archivo existente emite `fileRead` (+ `possibleUsers`) — resolviendo symlinks como `cat` — así leer una flag/nota/payload con nano valida la misión. El camino `sudo nano` (elevado) también lo emite (lab 5: `sudo nano /root/flag2.txt`).
- **`src/types.ts`**: `fileRead?` y `possibleUsers?` pasan a `CmdResponseBase` (antes solo vivían en la variante `type: 'fileRead'`) para que cualquier herramienta los emita.
- **Cubre lab 5 nota FTP**: `nano nota.txt` descargada del FTP → `fileRead.isNote` + `possibleUsers` (usuario `john`) → completa la misión "Read FTP Note" y muestra el usuario en EnumerationPanel.
- **Tests**: `nano.test.ts` nuevo (6 tests: flag valida misión, nota + possibleUsers, payload, sin fileRead en archivo nuevo/sin args) y `sudo.test.ts` (`sudo nano` de una flag 0600 emite fileRead).

### `su` con autoridad de root + `sudo -l` de root + `sudo nano` elevado

Semántica Unix real para `su`/`sudo`, con el fix del tipeo de password de fondo. `tsc --noEmit` 0 errores, `pnpm test:run` → **127 archivos / 1670 tests pasando**.

**Fix: password de `su` tipeada carácter a carácter (`src/components/Terminal.tsx`):**
- `TerminalInput` forzaba `value=''` cuando `hideValue` estaba activo, así React descartaba los caracteres previos y solo sobrevivía la última tecla → `su: Authentication failure` aunque la password fuera correcta. Ahora usa `type={hideValue ? 'password' : 'text'}` con `value={value}`.
- Test de regresión en `src/components/__tests__/Terminal.test.tsx` que simula el flujo real kali → `su root` → password `zilabs` tipeada char a char.

**`su` con autoridad de root (`src/commands/builtin/su.ts`):**
- **root → usuario de menor privilegio** (`su kali`): NO pide password — root tiene autoridad. Nuevo campo `suUserApplied` en `CommandResponse` (`src/types.ts`); el CommandRunner aplica `setSuUser` + `pushIdentity` al instante (`src/hooks/useCommandRunner.ts`) y el prompt cambia sin pasar por el prompt de password.
- **no-root → root** (`su root` desde kali): pide la password de ROOT y la valida contra `known_passwords` (kali: `zilabs`; todos los labs Linux tienen `root` en `known_passwords`).
- Tests: `su.test.ts` (root → developer sin password; no-root → sigue pidiendo) y `useCommandRunner.test.ts` (caso `suUserApplied`).

**`sudo -l` de root (`src/commands/builtin/sudo.ts`):**
- Antes mostraba `root@kali# -l` (nada). Ahora root también consulta sus privilegios: `User root may run the following commands on kali:` + `(ALL : ALL) ALL`, con metadata `sudoPrivileges`.

**`sudo nano` elevado — emular al usuario destino (`sudo.ts` + `nano.ts`):**
- `sudo nano/vi/vim <archivo>` abre el editor **como root**: puede abrir y modificar archivos restringidos que el usuario solo puede leer (p.ej. `/etc/passwd` 0644) o que ni siquiera puede leer (`/root/secret.txt` 0600). `sudo vim -c "!bash"` sigue siendo la escalada de shell (se detecta antes).
- Nuevos campos: `elevatedEdit` en `CommandContext` y `elevated` en `nanoFile` (`src/types.ts`). `nano.ts` usa `ROOT_USER` (nueva constante en `src/utils/users.ts`) para los checks de permisos; `handleNanoSave` (`src/hooks/useCommandRunner.ts`) guarda con identidad root cuando `nanoFile.elevated` está marcado, conservando el ownership.
- Tests: `sudo.test.ts` (root `sudo -l`, `sudo nano` sobre archivo restringido / no legible / no permitido) y `useCommandRunner.test.ts` (save de `/etc/hosts` rechazado sin elevated y permitido con elevated).

## [Unreleased] - 2026-08-02

### Coverage de `src` + modularización de `help.ts` y `App.tsx`

Subió el coverage global de `src` (estaba bajo en varios archivos) y se modularizaron los dos archivos más grandes del proyecto. `tsc --noEmit` 0 errores, `pnpm test:run` → **125 archivos / 1622 tests pasando**.

**Coverage global mejorado:**

| Métrica | Antes | Después |
|---------|-------|---------|
| Statements | 81.04% | **82.63%** |
| Branches | 69.4% | **71.26%** |
| Functions | 78.26% | **80.84%** |
| Lines | 83.06% | **84.75%** |

- **`AdminPanel.tsx`**: 0% → **94.11% statements**. Nuevo `src/components/__tests__/AdminPanel.test.tsx` (9 tests): login correcto/incorrecto (es/en), cambio de escenario, toggle del panel de debug, pestañas Store/Machines/Missions, abrir/cerrar el mapa de red, navegación al inicio. Mocks de `DesktopTerminal`, `MissionPanel` y `NetworkMap` con `vi.mock`.
- **Tests flaky de FoxyTour (fix):** los 3 tests interactivos (`Ver red`, `Chrome` unit, `Chrome` en AppContent real) fallaban de forma intermitente bajo carga del suite completo (timers reales: interval 200ms + setTimeout 350ms excedían el `waitFor` default de 1000ms). Cambios:
  - `src/components/tour/FoxyTour.tsx`: intervalo de auto-avance 200ms → 150ms y delay de avance 350ms → 250ms (más margen dentro de los timeouts de los tests).
  - `src/components/__tests__/FoxyTour.test.tsx` y `FoxyTour-app.test.tsx`: `waitFor` con `{ timeout: 5000 }` en todos los pasos interactivos y `testTimeout` 20000 en los tests largos de Chrome y Ver red.

**Modularización de `help.ts` (814 → 105 líneas):**
- Las 47 descripciones de comandos (`COMMAND_HELP`) se extrajeron a `src/commands/help/` — un archivo por comando (`su.ts`, `echo.ts`, `nmap.ts`, …), cada uno exporta `help_<cmd>`. íaz`src/commands/help/index.ts` las re-exporta como `COMMAND_HELP`.
- `src/commands/builtin/help.ts` ahora solo importa `COMMAND_HELP` de `../help` y contiene la lógica `execute()` (lista de comandos + lookup).

**Modularización de `App.tsx` (712 → 28 líneas):**
- `src/components/AppContent.tsx` (nuevo, 533 líneas): `AppContent` (workspace completo: terminal, browser, mission panel, network map, overlays), `ThemeSync` y `RootRedirect`.
- `src/components/ScenarioLauncher.tsx` (nuevo, 105 líneas): `ScenarioLauncher` (loader → workspace → LabGrid), `ScenarioLauncherWrapper` (force remount por navegación) y `TestLab`.
- `src/App.tsx` queda solo con el `BrowserRouter` + `Routes` (router puro).
- `src/components/__tests__/FoxyTour-app.test.tsx`: `import { AppContent }` pasa de `'../../App'` a `'../AppContent'`.

## [Unreleased] - 2026-08-02

### Fixes del escritorio (límites de ventanas, z-index de iconos, reloj) + tour de Foxy + manual PDF en inglés

Cuatro tandas de cambios sobre el escritorio, el tour y la documentación. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **125 archivos / 1631 tests pasando** (1626 previos + 5 nuevos).

**Ventanas atrapadas detrás de la barra de tareas (fix):**
- **`src/hooks/useDesktopWindows.ts`**: nuevo helper `clampToDesktop` que acota la posición de cada ventana al área del escritorio — `y` nunca menor que `0` (tope con la barra superior) y siempre quedan ≥80px de la ventana visibles en los 4 bordes para poder volver a agarrarla. Se aplica en `startDrag` y `startResize` (incluye las esquinas superiores `n`/`nw`/`ne`, que podían empujar la ventana bajo la barra). Antes, una ventana arrastrada por encima de la taskbar quedaba tapada por ella (la barra tiene `z-40` vs ventanas `zIndex ≥ 1`) y no se podía volver a mover.
- **Tests**: `src/hooks/__tests__/useDesktopWindows.test.ts` — 4 tests nuevos (movimiento libre dentro de límites, `y` clavado en 0 al arrastrar hacia arriba, 80px visibles al arrastrar hacia la izquierda, resize `n` con tope en 0).

**Iconos del escritorio siempre debajo de las ventanas (fix):**
- **`src/components/DesktopTerminal.tsx`**: el contenedor de iconos pasa de `z-10` a `z-0` — antes pintaba por encima de las ventanas (que usan `zIndex` inline ≥ 1); ahora cualquier ventana (abierta, arrastrada o maximizada) queda por encima de los iconos.
- **Test**: `src/components/__tests__/DesktopTerminal.test.tsx` — verifica `z-0` en los iconos y `zIndex > 0` en la ventana de terminal.

**Reloj de la barra de tareas a la derecha (fix/mejora):**
- **`src/components/DesktopTopBar.tsx`**: el reloj deja de estar centrado (`absolute left-1/2`) y pasa al contenedor derecho de la taskbar, **justo antes del botón de apagado**, mostrando solo **hora y minutos** (`HH:MM`, sin segundos) con `tabular-nums` para que los dígitos no bailen.
- **`src/components/AppContent.tsx`**: el chip de `network_range` ya no se alinea con el centro del reloj (que se movió) — ahora se centra en la barra superior (`bar.clientWidth / 2`); estado renombrado `clockCenter` → `barCenter`.
- **Tests**: `src/components/__tests__/DesktopTopBar.test.tsx` — formato sin segundos + el reloj es el hermano inmediato anterior del botón de apagado.

**Tour de Foxy: burbuja centrada en el inicio y a la derecha en la enumeración (fix):**
- **`src/components/tour/FoxyTour.tsx`**: sin objetivo, la burbuja queda **verticalmente centrada** (`(innerHeight - 200) / 2` en vez de `innerHeight / 2 + 40`, que la dejaba ~140px baja). Nueva propiedad `align: 'right'` en `TourStep`: con ella la burbuja va a la derecha (`innerWidth - width - 48`, margen de 48px) y centrada en altura.
- **`src/components/tour/tourSteps.ts`**: nuevo campo `align?: 'right'`; el paso `network-map-enum` lo usa porque el panel de enumeración **no existe al inicio del lab** (solo se renderiza si hay una máquina con `discovery_level > 0`), así que la burbuja igual apunta a la derecha, donde estaría el panel.
- **Tests**: `src/components/__tests__/FoxyTour.test.tsx` — 2 tests nuevos (burbuja centrada en el paso inicial; burbuja a la derecha en el paso de enumeración saltando con los dots).

**Manual PDF del simulador en inglés (feature):**
- **`manual_zilabs_en.md` (nuevo)**: traducción al inglés del manual (misma estructura que `manual_zilabs.md`).
- **`scripts/generate_manual_pdf.py` (nuevo)**: generador markdown → PDF con reportlab (fuentes DejaVu para Unicode ↑↓→, estilos acordes a la app: títulos esmeralda, código en caja gris, nota en caja ámbar). Soporta `es|en` — `python3 -m venv .venv && .venv/bin/pip install reportlab && .venv/bin/python scripts/generate_manual_pdf.py en`.
- **`public/docs/manual-en.pdf` (nuevo)**: PDF A4 (3 páginas) generado desde `manual_zilabs_en.md`.
- **`src/components/PdfReader.tsx`**: carga `/docs/manual-en.pdf` y muestra `manual-en.pdf` en la barra del lector cuando `isEs` es false; en español sigue con `/docs/manual.pdf`.
- **`src/hooks/useDesktopWindows.ts`**: el título de la ventana del manual en inglés pasa a `User Manual - manual-en.pdf`.
- **Tests**: `src/components/__tests__/PdfReader.test.tsx` (verifica `src` `/docs/manual-en.pdf` + nombre) y `src/hooks/__tests__/useDesktopWindows.test.ts` (título EN del manual).

## [Unreleased] - 2026-08-02

### Ventanas en cascada + paso interactivo "Ver red" en el tour

Las ventanas del escritorio se ordenan en cascada y la guía de Foxy explica la topología y la enumeración automática. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **121 archivos / 1586 tests pasando** (1585 previos + 1 nuevo).

**Ventanas en cascada:**
- **`src/hooks/useDesktopWindows.ts`**: cada tipo de ventana se abre ahora en **cascada prolija** — `CASCADE_STEP = 30`, `CASCADE_MAX = 6` y `cascadeOffset(prev.length)` = `(prev.length % 6) * 30`. Cada tipo tiene su posición base propia: terminal `(90, 60)`, Chrome/browser `(240, 60)`, selector de fondos `(150, 90)`, manual/guide `(390, 60)`. Al abrir ventanas del mismo tipo se desplazan 30px por esquina (se repite cada 6) sin pisarse.

**Paso interactivo "Ver red" en el tour:**
- **`src/components/NetworkMap.tsx`**: nuevos selectores `data-tour` — `network-map` (raíz del modal), `network-map-close` (botón ✕), `network-map-topology` (panel de topología), `network-map-enum` (panel de enumeración).
- **`src/components/tour/tourSteps.ts`**: el paso único `network-map` se reemplaza por 4 pasos — `network-map-btn` (interactivo, pide **hacer clic en "Ver red"** y avanza cuando aparece el mapa, `waitFor`), `network-map-topology` (explica que las PCs de la topología revelan nueva información a medida que avanza el reconocimiento: arp-scan, nmap, gobuster...), `network-map-enum` (explica que credenciales, puertos y servicios se agregan automáticamente y que el botón **"Ver red" se ilumina** cuando hay una novedad) y `network-map-close` (interactivo con `waitForHidden`, pide cerrar la topología con la X y avanza cuando desaparece).
- **Soporte `waitForHidden`**: nueva propiedad opcional `waitForHidden?: string` en `TourStep` — el paso interactivo avanza cuando el selector **desaparece** del DOM (para pasos que se cierran). `FoxyTour.tsx` lo maneja: `shouldAdvance = waitFor ? !!el : waitForHidden ? !el : false`.
- **Test**: `src/components/__tests__/FoxyTour.test.tsx` — nuevo test "el paso Ver red pide hacer clic, avanza al abrirse la topología y al cerrarla" (crea `[data-tour="network-map"]`, verifica el auto-avance al aparecer y al desaparecer; timeout del loop subido a 20000ms). Los pasos `network-map-topology` y `network-map-enum` reutilizan el botón "Ver red" ya iluminado (`hasNewNetworkInfo` + `animate-pulse` en `MissionPanel.tsx`), que el store activa automáticamente vía `createEnumerationSnapshot`/`hasEnumerationChanged`.

## [Unreleased] - 2026-08-01

### Guía interactiva con Foxy (tour con spotlight) + correcciones menores

Nuevo onboarding guiado con un zorro animado que presenta el laboratorio paso a paso. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **121 archivos / 1585 tests pasando** (1566 previos + 19 nuevos).

**Tour interactivo "Foxy":**
- **`src/components/tour/FoxyFox.tsx` (nuevo)**: zorro mascota en SVG puro (sin assets externos) con animaciones CSS (parpadeo de ojos + "respiración").
- **`src/components/tour/tourSteps.ts` (nuevo)**: 9 pasos con selector objetivo, textos ES/EN, y soporte de pasos interactivos (`waitFor`).
- **`src/components/tour/FoxyTour.tsx` (nuevo)**: overlay a pantalla completa que **oscurece todo excepto el elemento enfocado** (spotlight con `box-shadow: 0 0 0 9999px`), burbuja de diálogo con Foxy, navegación (Siguiente/Atrás/Saltar/dots) y animación de "¡Hacé clic!" en pasos interactivos.
- **Secuencia**: presentación → iconos del escritorio → icono de terminal (el tour **pide hacer clic** y avanza automáticamente cuando se abre la ventana) → ventana de terminal → botón de ajustes (idem al abrir el panel) → panel de ajustes → icono de fondos (idem al abrir el selector) → selector de fondos → icono de Chrome (solo en escenarios Web, idem al abrir el navegador) → navegador → icono del manual (idem al abrir la guía) → manual de uso → panel de misiones → topología de red → menú Aplicaciones → cierre.
- **Saltar pasos inexistentes**: `getTourSteps()` (exportado desde `tourSteps.ts`) filtra en tiempo de render los pasos marcados con `skipIfMissing` (p. ej. el icono de Chrome) cuando su `data-tour` no está en el DOM — en escenarios no-Web el paso del navegador y su ventana se omiten sin romper la secuencia. `FoxyTour` usa esta lista filtrada para los dots, el auto-avance y la navegación. *Fix de bug*: la lista se calculaba con `useMemo(..., [])` en el primer render (cuando `open=false` y el DOM del escritorio aún no estaba committeado), por lo que **Chrome nunca aparecía** — ahora se recalcula con `useMemo(..., [open])`, que se ejecuta con el escritorio ya montado. Test de regresión en `FoxyTour-app.test.tsx` (recorre la secuencia real en un escenario Web y verifica que el paso `desktop-icon-browser` está presente).
- **Botón de salir en la burbuja**: la burbuja de Foxy ahora tiene un botón `✕` (aria-label "Salir de la guía") en su esquina superior derecha para cerrar el tour en cualquier paso, además del botón "Saltar" del overlay.
- **Icono de Foxy en el escritorio**: nuevo acceso directo `desktop-icon-foxy` (etiqueta "Guía", `data-tour="desktop-icon-foxy"`) en `DesktopTerminal.tsx` que re-lanza el tour con un clic, igual que la opción "Guía con Foxy" del menú Aplicaciones.
- **El tour arranca siempre del principio**: `FoxyTour` resetea `stepIndex` a 0 cuando `open` pasa de `false` a `true` (antes persistía el paso del cierre y al reabrir mostraba el último paso como terminado). Aplica tanto al icono del escritorio como a la opción del menú. Test de regresión en `FoxyTour.test.tsx`.
- **Cierre con pista para repetir**: el paso "Menú Aplicaciones" ahora menciona la opción "Guía con Foxy", y el paso final ("¡Eso es todo!") indica que se puede repetir el recorrido desde el icono de Foxy del escritorio o desde el menú Aplicaciones.
- **`src/store/slices/uiSlice.ts` + `src/store/types.ts`**: nuevos estados `foxyTourOpen`, `openFoxyTour`, `closeFoxyTour`.
- **`src/App.tsx`**: auto-apertura del tour **cada vez que se entra al workspace** (el effect abre Foxy al montar con `view === 'workspace'`, sin flag de sesión); renderizado solo en modo desktop (`uiMode === 'desktop'`). *Fix de bug*: la versión inicial usaba `sessionStorage` + un ref de transición (`wasWorkspaceRef`) que se inicializaba en `true` porque `ScenarioLauncher` monta `AppContent` ya en `view === 'workspace'` — el tour nunca aparecía. Ahora abre en el montaje directo.
- **`src/test/setup.ts`**: mock de `ResizeObserver` convertido a clase (`new ResizeObserver(...)` fallaba con "is not a constructor" en tests que montan `AppContent`).
- **Selectores `data-tour`**: `terminal-window`/`guide-window`/`wallpaper-window`/`browser-window` en `WindowFrame.tsx`; `settings-btn`/`settings-panel` en la ventana de terminal; `desktop-icons` + `desktop-icon-terminal`/`desktop-icon-wallpaper`/`desktop-icon-browser`/`desktop-icon-guide` en el escritorio (`DesktopTerminal.tsx`); `mission-panel` y `network-map-btn` en `MissionPanel.tsx`; `apps-btn` en `DesktopTopBar.tsx`.
- **Menú Aplicaciones**: nuevo ítem "Guía con Foxy" (re-lanza el tour manualmente). Cableado `App → DesktopTerminal → DesktopTopBar` vía prop `onOpenTour` (agregado a `CommandRunnerProps`).
- **Ventanas cerradas al entrar**: `useDesktopWindows.ts` arranca con lista vacía (`useState([])`) — ya no se abren terminal ni manual por defecto al entrar al lab; se abren desde los iconos del escritorio o el menú Aplicaciones. El tour los abre uno por uno.
- **Test**: `src/components/__tests__/FoxyTour.test.tsx` (12 tests: render ES/EN, navegación, pasos interactivos con `waitFor`, paso de Chrome condicional, cierre con Saltar y con ✕, reinicio al reabrir) + `src/components/__tests__/FoxyTour-app.test.tsx` (3 tests de integración: monta `AppContent` real en workspace, verifica que Foxy aparece, que no se reabre al cerrarlo y que el paso de Chrome existe en escenario Web) + `src/hooks/__tests__/useDesktopWindows.test.ts` reescrito (39 tests, helper `openDefaultWindows`) + `src/components/__tests__/DesktopTerminal.test.tsx` reescrito (10 tests: iconos del escritorio incluido el de Foxy, sin ventanas por defecto).
- **Fix burbuja desbordada**: ancho aumentado a 400px (responsive, `min(400, viewport-24)`) y fila de controles con `flex-wrap` — el botón "Siguiente" ya no queda fuera del cuadro.
- **Fix paso interactivo bloqueado**: el overlay raíz ahora es `pointer-events-none` (solo `burbuja` y `Saltar` capturan clics) — antes interceptaba todos los clics y el usuario no podía hacer clic en el botón de ajustes en el paso 3, por lo que nunca aparecía `settings-panel` y no avanzaba.
- **Fix bucle de auto-avance**: el paso interactivo solo avanza si el elemento `waitFor` aparece **después** de entrar al paso (`alreadyPresent` guard) — evita que al volver atrás con el panel ya abierto re-avance solo.
- **Fix paso interactivo obligatorio**: en pasos con `interactive: true` el botón **"Siguiente" queda deshabilitado** (gris, con texto "Hacé clic") — el usuario debe hacer clic sí o sí en el objetivo (botón de ajustes) para que aparezca el panel y el tour avance solo.
- **Fix burbuja fuera de pantalla**: el posicionamiento ahora decide entre **4 lados** (abajo → arriba → derecha → izquierda) según el espacio disponible. Para el panel de ajustes (que se abre `absolute top-9 right-2` dentro de la ventana del terminal, al borde derecho) Foxy se coloca a la **izquierda** del panel en vez de abajo, donde antes quedaba fuera del viewport. Añadida flecha lateral para colocaciones derecha/izquierda.
- **Fix reapertura al cerrar**: el effect de `App.tsx` re-abría el tour inmediatamente tras cerrarlo (al pulsar "¡A trabajar!"), porque `foxyTourOpen` volvía a `false` con `view` todavía en `'workspace'`. Ahora usa un `useRef` (`tourShownRef`) que abre el tour una sola vez por montaje de `AppContent` — al cerrarlo no se reabre, pero al volver a entrar a un lab (remontaje por `key={location.key}`) vuelve a mostrarse. Test de regresión en `FoxyTour-app.test.tsx`.
- **Fix reloj/IP de la barra**: el reloj/cronómetro de `DesktopTopBar.tsx` ahora se centra con posicionamiento absoluto (`left-1/2 -translate-x-1/2`, `pointer-events-none`) en lugar de depender del flujo del lado izquierdo — ya no se mueve al abrir o cerrar ventanas.

## [Unreleased] - 2026-08-01

### Correcciones de parser/shell + manual PDF en el escritorio + redimensión por bordes

Correcciones de comportamiento tipo Linux y nueva app de escritorio. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **119 archivos / 1566 tests pasando** (1549 previos + 17 nuevos).

**Correcciones de shell y laboratorios:**
- **`src/commands/builtin/cat.ts`**: el flag ahora se detecta también por **contenido** (`/(?:ZIL|THM|FLAG)\{[^}]+\}/`), no solo por nombre de archivo. Esto permite que `cat /root/database_dump.sql` (lab 06, paso 8) marque `fileRead.isFlag: true` y complete la misión, ya que el dump descargado se llama `database_dump.sql` y no contiene "flag" en el nombre.
- **`src/utils/shellParse.ts`**: `splitArgs` reimplementado con máquina de estados tipo bash — las comillas (simples o dobles) como **delimitador** agrupan y se eliminan (`echo 'hola'` → `hola`), pero las simples **dentro** de comillas dobles son literales (payloads SQL `-d "username=' OR '1'='1&password=x"` intactos).
- **`src/commands/index.ts`**: los comandos ahora son **case-sensitive** como en Linux (`LS` → `Command not found: LS`); se eliminó el `.toLowerCase()` del dispatch.
- **Bug de sesiones "stuck"**: `resetWorkspace` (`src/store/scenarioStore.ts`) y `selectScenario` (`src/store/slices/scenarioSlice.ts`) ahora llaman `shellManager.reset()`. Antes, salir del lab sin tipear `quit` dejaba la sesión FTP/SSH viva en el singleton y el siguiente `ftp <ip>` respondía `?Invalid command` sin poder re-loguear. Test de regresión `ftp-shell-reset.test.ts`.

**Manual PDF en el escritorio (app "ZeroPDF"):**
- **`manual_zilabs.md` (nuevo)**: guía breve del simulador (bienvenida + escritorio, terminal, browser, misiones, topología/enumeración, wallpapers).
- **`public/docs/manual.pdf`**: PDF real de 3 páginas A4 generado desde el `.md` (script + LibreOffice). Reemplazable.
- **`src/components/PdfReader.tsx` (nuevo)**: lector PDF estilo app inventada "ZeroPDF" (barra con `manual.pdf`, zoom decorativo, footer "Página 1 de 1") que embebe el PDF en un iframe que llena toda la ventana (al maximizar, el documento se escala al ancho completo).
- **`src/hooks/useDesktopWindows.ts`**: nuevo tipo de ventana `'guide'` con **auto-apertura** al cargar el escritorio (ventana del manual junto a la terminal, en todos los labs por ahora); `addGuide`, `guideWindows`.
- **`src/components/DesktopTerminal.tsx`**: icono **Manual** en el escritorio + render de la ventana `guide`.
- **`src/components/DesktopTopBar.tsx`**: entrada "Ver Manual de uso" en el menú Aplicaciones + botón "Manual" en la taskbar (minimizar/restaurar/traer al frente).
- **`src/components/WindowFrame.tsx`**: icono 📄 en la barra de título de las ventanas `guide`.

**Redimensión por bordes:**
- **`src/components/WindowFrame.tsx`**: además de las 4 esquinas, ahora hay handles en los **4 bordes** (superior `n`, inferior `s`, izquierdo `w`, derecho `e`) para redimensionar terminales, Chrome, Manual y fondos.
- **`src/hooks/useDesktopWindows.ts`**: `startResize` ampliado a direcciones `n`/`s`/`w`/`e` (la lógica con `includes()` ya las soportaba).
- **Manual**: la sección 1 del PDF aclara la redimensión desde bordes o esquinas.

## [Unreleased] - 2026-08-01

### Reorganización de la UI del simulador + sitio WordPress + plan Site-as-Data

Cambios de UI, contenido y arquitectura. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **112 archivos / 1495 tests pasando** (1486 previos + 9 nuevos).

**Salida del simulador:**
- **`src/components/DesktopTopBar.tsx`**: botón de apagado al estilo distros Linux (icono de poder al lado de la batería, rojo al hover). Requiere `onRequestExit` opcional.
- **`src/components/ExitConfirm.tsx` (nuevo)**: modal de confirmación "¿Volver al menú?" (ES/EN) con Cancelar / Sí, salir; advierte que se pierde el progreso.
- **`src/App.tsx`**: estado `showExitConfirm` central; el botón rojo del `MissionPanel` y el botón de apagado abren el mismo diálogo → al confirmar ejecuta `handleGoHome` (encuesta si todas las misiones completas, si no `resetWorkspace`). El botón rojo de salida se movió de `DesktopTerminal` al `MissionPanel`; se eliminó el botón "Menú" de la taskbar.
- **`src/hooks/useCommandRunner.ts`**: nueva prop `onRequestExit` en `CommandRunnerProps`, cableada `App → DesktopTerminal → DesktopTopBar`.

**Red/máscara centrada:**
- **`src/App.tsx`**: el `network_range` se posiciona en el centro real de la barra superior (chip blanco en negrita), alineado en columna con el reloj del `DesktopTopBar`. Se mide en runtime el centro del reloj (`ResizeObserver` + `MutationObserver` sobre `[data-desktop-topbar]` / `.desktop-clock`) porque el reloj está en posición `justify-between`; ajuste fino vertical vía `top: calc(50% + 1px)`.

**Panel de ajustes de terminal (unificado):**
- **`src/components/termColors.ts` (nuevo)**: `TERM_COLORS` extraído a módulo compartido (verde/blanco/naranja/azul).
- **`src/components/WindowFrame.tsx`**: se eliminaron los dos botones de la barra de título (opacidad `%` y fuente `px`); ahora un único botón de engranaje (solo terminales) abre un panel con barra de tamaño de fuente (10–20px), barra de opacidad (0–100%) y los 4 puntos de color (usa `setTermColor` global). El panel se cierra al hacer click fuera (listener `pointerdown` en `document`).
- **`src/hooks/useDesktopWindows.ts`**: `activeOpacitySliderId`/`activeFontSliderId` → `activeSettingsId` (estado único por ventana).
- **`src/App.tsx`**: eliminado el color picker de la taskbar superior derecha (ahora el color se configura solo desde el panel de la terminal).

**Animación de carga en ventana:**
- **`src/components/MachineLoader.tsx`**: la animación se muestra dentro de una ventana estilo terminal (440×520px responsive, barra de título con puntos de control, cuerpo translúcido `rgba(15,23,42,0.5)`), centrada sobre el wallpaper; los tres usos (ScenarioLauncher, fallback, modo clásico) heredan el cambio.

**Sitio WordPress (lab 1):**
- **`src/components/fakesites/wordpress/wp01/Index.tsx`**: primer artículo reemplazado por "DeepSeek Flash: the new open model that rivals frontier AI" (actualizado el test de contenido).
- **`src/laboratorios/laboratorio01.ts`**: agregados archivos WordPress al FS del objetivo — `/var/www/html/index.php` (front page con los 3 artículos, `www-data` 0644), `/var/www/html/wp-config.php` (DB `wordpress_db`, salts; coherente con `config.bak`, 0640) y directorios `wp-content/` + `wp-content/uploads/`. Ahora `ls`/`cat` desde la terminal muestran contenido coherente con el sitio.

**Docs:**
- **`docs/PLAN_GENERADOR_LABS.md` (nuevo)**: plan en 4 fases (A: sitios como datos `SiteDefinition`/`SiteRenderer`; B: sitios desde el FS; C: catálogos de vulns/credenciales/privesc/OS; D: generador + UI) con subfases, criterios de salida y observaciones verificadas del acoplamiento actual de los sitios.

## [Unreleased] - 2026-07-31

### Fase 9 — Sistema de archivos avanzado (ROADMAP Fase 9 ✅)

Fase completa del ROADMAP. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **111 archivos / 1488 tests pasando** (1464 previos + 24 nuevos). Cierra la Fase 9 entera (9.1-9.6): montajes con `/etc/fstab`, `df`/`du` con human-readable, enlaces simbólicos con `->` en `ls -l` y seguimiento en `cat`, `find` y `grep -r`.

- **`src/frameworks/fs/mounts.ts` (nuevo)**: estado por máquina NO persistente (patrón ProcessManager). `parseFstab`/`getFstabEntries`/`getMounts`/`mountDevice`/`unmount`/`isMounted`/`resetMounts`; `unmount` no permite desmontar montajes del sistema.
- **`src/commands/builtin/mount.ts` (nuevo)**: `mount` sin args lista montajes base + fstab; `mount /dev/sdb1 /mnt` monta (solo root, el mount point debe existir). `cmd_umount` desmonta (protege mounts de sistema).
- **`src/commands/builtin/df.ts` (nuevo)**: `df -h` con tabla simulada y filtro por mount point.
- **`src/commands/builtin/du.ts` (nuevo)**: `du -h/-s/-a` (flags combinados `-sh`) con tamaño = contenido + bloque base 4K.
- **`src/commands/builtin/ln.ts` (nuevo)**: `ln -s target link` crea `FileEntry` type `'symlink'` + `linkTarget` (`-f` sobreescribe); hard link copia el entry. Guarda paths sin `/` final.
- **`src/commands/builtin/find.ts` (nuevo)**: `find [dir] -name/-iname/-perm -4000/-user/-type f|d` (glob quote-aware, SUID, permisos).
- **`src/commands/builtin/pipeline.ts`**: `grep` gana `-r/--recursive` (flags combinados `-ri`) con salida `path:line`.
- **`src/utils/fs.ts`**: `resolveSymlink` (seguimiento recursivo de enlaces con detección de ciclos).
- **`src/commands/builtin/{cat,ls}.ts`**: `cat` sigue el enlace vía `resolveSymlink`; `ls -l` muestra `lrwxrwxrwx` y `name -> target`.
- **`src/types.ts`**: `FileEntry.linkTarget` para enlaces simbólicos.
- **`src/hooks/useCommandRunner.ts`**: `resetMounts()` al cambiar de escenario.
- **`src/commands/__tests__/fase9-fs.test.ts` (nuevo)**: 24 tests (mount/umount con permisos, df/du, ln -> ls -l/cat, resolveSymlink, find, grep -r).

## [Unreleased] - 2026-07-31

### Fase 8 — Tareas programadas (cron/crontab) (ROADMAP Fase 8 ✅)

Fase completa del ROADMAP. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **110 archivos / 1464 tests pasando** (1443 previos + 21 nuevos). Cierra la Fase 8 entera (8.1-8.3): `crontab` con edición vía nano, reloj virtual y ejecución simulada de cron jobs con logs en syslog y efectos en el filesystem.

- **`src/frameworks/cron/cronRunner.ts` (nuevo)**: estado por máquina NO persistente (patrón ProcessManager). Reloj virtual desde base `2024-03-19T10:00:00Z`; `parseCrontab`/`listCronJobs` leen `/etc/crontab` (con columna de usuario) y `/var/spool/cron/crontabs/<user>`; matcher de horario con `*`, `*/n`, rangos y listas; `runCron(machine, minutes)` ejecuta las tareas debidas si el servicio cron está corriendo (`processManager.isServiceRunning('cron')`), genera `CRON[pid]: (user) CMD (...)` en `/var/log/syslog` y aplica efectos simples (`touch`, `echo >|>>`); `resetCron()`.
- **`src/commands/builtin/crontab.ts` (nuevo)**: `crontab -l/-e/-r/-u`. `-e` abre nano (crea la cadena `/var/spool/cron/crontabs` si falta, mode 0600, respeta permisos); `-u` solo root.
- **`src/commands/builtin/{date,sleep}.ts` (nuevos)**: `sleep N` avanza el reloj virtual y ejecuta los cron jobs debidos (disparador por acción del usuario); `date` muestra la hora virtual. Ambos devuelven `filesChanged` cuando cron muta el filesystem.
- **`src/commands/builtin/index.ts` / `src/commands/index.ts` / `which.ts` / `help.ts`**: registro de `crontab`, `date`, `sleep`.
- **`src/hooks/useCommandRunner.ts`**: `resetCron()` al cambiar de escenario.
- **`src/commands/__tests__/fase8-cron.test.ts` (nuevo)**: 21 tests (parse/list, ejecución `* * * * *` y `*/2`, efectos en FS, cron detenido, crontab -l/-e/-r/-u, date, sleep + integración con executeCommand y journalctl).

## [Unreleased] - 2026-07-31

### Fase 7 — Sistema de paquetes, pipes/redirección y variables de entorno (ROADMAP Fase 7 ✅)

Fase completa del ROADMAP. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **109 archivos / 1443 tests pasando** (1404 previos + 39 nuevos). Cierra la Fase 7 entera (7.1-7.5): el `apt`/`dpkg` con estado por máquina, pipes con filtros y redirección global quote-aware, y variables de entorno `export`/`env`/`unset` con expansión `$VAR`.

- **`src/frameworks/packages/packageManager.ts` (nuevo)**: estado por máquina NO persistente (patrón ProcessManager/networkState). Base de datos de ~25 paquetes; el set instalado se deriva de los binarios presentes en el filesystem. `installPackage`/`removePackage`/`isInstalled`/`listInstalled`/`searchPackages`/`resetPackageManager`.
- **`src/commands/tools/apt.ts` (nuevo)**: `apt update/install/remove/list --installed/search`, solo root. Instalar agrega los binarios del paquete al filesystem (con permisos + umask) y devuelve `filesChanged`.
- **`src/commands/tools/dpkg.ts` (nuevo)**: `dpkg -l` y `dpkg -i archivo.deb` (parsea campos Package/Version del archivo).
- **`src/utils/shellParse.ts` (nuevo)**: `splitTopLevel`, `extractRedirection` y `expandCommandLine` — parseo quote-aware (comillas simples literales, dobles con expansión).
- **`src/commands/builtin/pipeline.ts` (nuevo)**: filtros `grep` (`-v`/`-i`), `head`, `tail`, `wc`, `sort` (`-r`/`-n`), `uniq` — leen `CommandContext.pipedInput` o un archivo.
- **`src/commands/builtin/export.ts` (nuevo)**: `export` (define/lista), `env`, `unset`.
- **`src/utils/environment.ts` (nuevo)**: `DEFAULT_ENV(machine)`, `expandVariables`, `parseExportAssignment`, `formatEnvLine`.
- **`src/utils/redirection.ts`**: ampliado con `writeOutputToFile` (permisos + umask centralizados) y `readFileContent`.
- **`src/commands/index.ts`**: `runPipeline()` (ejecuta segmentos en secuencia con `pipedInput`, preserva la metadata del primer comando y fusiona `filesChanged`); redirección global `>`/`>>` y `<` en el executor; expansión `$VAR` antes de despachar. `executeCommand`/`createIsolatedExecutor` ahora aceptan `env`/`setEnv`.
- **`src/types.ts`**: `CommandContext` gana `env`, `setEnv` y `pipedInput`.
- **`src/hooks/useCommandRunner.ts`**: estado `env` por sesión, `resetPackageManager()` al cambiar de escenario, y `env`/`setEnv` pasados al executor.
- **`src/commands/__tests__/fase7-packages-pipes-env.test.ts` (nuevo)**: 39 tests (apt, dpkg, env, filtros, redirección, integración `cat | grep`, `ls | head`, `cat | wc`, shellParse).

## [Unreleased] - 2026-07-31

### Higiene técnica del codebase — MEJORAS.md Fase 4 y Fase 5

Plan parcial ejecutado de `docs/MEJORAS.md`. 8 de 16 puntos de las fases de documentación duplicada, higiene media prioridad y dependencias resueltos. Sin cambios funcionales ni en tests. `tsc --noEmit` 0 errores, `pnpm build` sin warnings, `pnpm test:run` → 106 archivos / 1355 tests pasando (Vitest v4.1.10).

**Fase 4 — Documentación duplicada:**

- **4.4** `GUIA_SIIMULADOR_PDF.md` → `docs/GUIA_SIMULADOR_PDF.md` vía `git mv`. Typo "SIIMULADOR" corregido. Referencias actualizadas en `CLAUDE.md:135`.
- **4.5** `HAPPY_PATH_TEST.md`, `MODELO_NEGOCIO.md`, `SECURITY.md` movidos a `docs/` vía `git mv` (historia preservada). Referencias actualizadas en `CLAUDE.md:9`, `AGENTS.md:167`, `README.md:150`.
- **4.2** Consolidación de CHANGELOGs: `changelog.md` (raíz) ya estaba eliminado en commit `a2ec4c4` previo — verificado ausente del working tree. Quedan como única fuente de verdad `docs/CHANGELOG.md` y `docs/CHANGELOG_ARCHIVE.md`. Link corregido en `README.md:161` (`CHANGELOG.md` → `docs/CHANGELOG.md`).
- **4.3** `README_FULL.md` (951 líneas, desactualizado: npm en vez de pnpm, "740+ tests", 5 labs, "strict: false intencional", rutas `src/shells/` que se movieron) **eliminado**. `README.md` (162) queda como README único y vigente. Contenido único de `README_FULL.md` migrado a **`docs/OVERVIEW.md`** (nuevo): sección de Analytics (webhook de Google Apps Script + queries de Google Sheets) y visión de producto a futuro (Admin Panel, Lab Builder, Community Platform, rutas premium, modelo freemium).

**Fase 5 — Higiene media prioridad:**

- **5.2** `labs.html` (628 líneas, standalone con array `LABS` inline de 5 de 6 labs) **eliminado** vía `git rm`. Era un artefacto muerto: no referenciado desde `index.html`, `vercel.json`, ni código React. La ruta `/:lang/labs` del SPA sirve el componente `LabGrid` (`src/App.tsx:149`), no al `labs.html`. Vite no lo copiaba a `dist/` (estaba en la raíz, no en `public/`), así que en producción `/labs.html` daba 404.
- **5.3** Floors de dependencias acotados en `package.json`:
  - `vitest`: `^4.0.18` → `^4.1.6`. `pnpm update` bumpó installado a **4.1.10** (latest dentro del rango).
  - `@vitest/coverage-v8`: `^4.0.18` → `^4.1.6`. Bumpado a **4.1.10**.
  - `@vitejs/plugin-react`: `^4.0.0` → `^4.7.0` (acota, sin saltar al major 6 no pedido).
  - `pnpm-lock.yaml` actualizado. Mayores (`react 19`, `@types/react 19`, `@testing-library/jest-dom 7`, `jsdom 30`) **no tocados** — breaking changes fuera del scope.
- **5.6** `vitest.config.ts:10`: `include: ['src/**/*.{test,spec}.{ts,tsx}']` simplificado a `['src/**/*.test.{ts,tsx}']`. Verificado que no existe ningún archivo `.spec.*` en `src/` (rg sale 0 resultados).
- **5.7** Imports rotos en `src/frameworks/metasploit/core/ContextRegistry.ts` ya estaban arreglados en commit previo (stopgap local `interface SessionManager {}` con comentario explicativo). Verificación: el archivo importa `MsfState`/`MsfSession` desde `'./msfTypes'` (módulo existente) y define `SessionManager` como marker interface inline. No quedan rutas inexistentes.

Archivos: `docs/MEJORAS.md`, `docs/CHANGELOG.md`, `docs/OVERVIEW.md` (nuevo), `README.md`, `CLAUDE.md`, `AGENTS.md`, `vitest.config.ts`, `package.json`, `pnpm-lock.yaml`, `labs.html` (eliminado), `README_FULL.md` (eliminado), `GUIA_SIIMULADOR_PDF.md` (renombrado/movido), `HAPPY_PATH_TEST.md` (movido), `MODELO_NEGOCIO.md` (movido), `SECURITY.md` (movido).

## [Unreleased] - 2026-07-29

### Generalización del sistema de permisos Unix — Etapas 1-5 del plan `arreglos_minimax_m3.md`

Plan completo ejecutado: `src/utils/fs.ts` + `src/utils/permissions.ts` centralizan los helpers de filesystem y permisos. 8 comandos migrados (`mkdir`, `rmdir`, `rm`, `mv`, `touch`, `echo`, `cp`, `nano`). Cierre de bugs abiertos en `ls`, `nmap`, `ftp get`. `nano` save desacoplado del UI con `existingSnapshot`. Documentación canónica en `docs/PERMISSIONS.md`. Matriz de 46 tests transversales comando × escenario.

- **`src/utils/fs.ts` (nuevo)**: `findFile`, `findDirEntry`, `findParentDir`, `resolveParentDirPath`, `isDirectoryEntry`, `defaultOwnership`, `buildNewFile`. Reemplazan las 10+ copias duplicadas en comandos de fs.
- **`src/utils/permissions.ts`**: nuevos `canEditFile` (alias semántico), `canCreateInDir` (write+execute del padre), `canDeleteInDir` (incluye sticky bit). Root bypass uniforme.
- **`src/commands/builtin/{mkdir,rmdir,rm,mv,touch,echo,cp,nano}.ts`**: migrados a los helpers. Reducción de 70+ LOC en duplicación.
  - `echo.ts` y `cp.ts` aplican preventivamente `canEditFile` al sobreescribir archivos existentes (cierra bugs 3.1 y 3.2 del plan).
  - `nano.ts`: ahora chequea `canRead` para abrir (denegado si no podés leer), `canEditFile` para `readOnly` flag.
- **`src/commands/builtin/ls.ts`**: respeta `canExecute` del directorio target (devuelve "Permission denied" si no podés acceder); filtra entries por `canRead` en formato corto.
- **`src/commands/tools/nmap.ts`**: `-oN`/`-oG` ahora validan permisos del directorio destino (`canCreateInDir`/`canEditFile`) y asignan `owner`/`group`/`mode` del usuario local al archivo creado. Errores de permisos se reportan al final del output.
- **`src/frameworks/shells/ftp/FtpSession.ts`**: `get` valida `canRead` remoto con identidad `anonymous` (uid 65534) y asigna `owner`/`group`/`mode` del atacante al archivo descargado. `550 Permission denied` si el archivo no es world-readable.
- **`src/hooks/useCommandRunner.ts`**: nuevo `handleNanoSave(content, filename?)` que centraliza la lógica de guardado (parent check, canEditFile, addFileToMachine con snapshot). `handleDownloadedFile` propaga los metadatos si vienen en `downloadedFile`.
- **`src/types.ts`**: `nanoFile` incluye `existingSnapshot?: { owner, group, mode }` para preservar las propiedades del archivo al editar.
- **`src/components/Terminal.tsx`**: `onSave` de `nano` reducido a `onSave={handleNanoSave}`. Eliminada toda la lógica de validación inline.
- **`docs/PERMISSIONS.md` (nuevo)**: documentación canónica del patrón. Resumen del modelo, tabla de helpers, tabla operación → helper, template copy-paste para nuevos comandos, anti-patrones, comandos ya migrados, sección sticky bit, sección persistencia, inventario de tests.
- **`AGENTS.md`**: nueva sub-sección "Permissions on filesystem commands" con resumen rápido y puntero a `docs/PERMISSIONS.md`.
- **Tests nuevos** (+101 tests, total 1343):
  - `src/utils/__tests__/fs.test.ts` (13 tests): findFile, findDirEntry, findParentDir, defaultOwnership, buildNewFile.
  - `src/utils/__tests__/permissions.test.ts`: +18 tests para canEditFile, canCreateInDir, canDeleteInDir (incluido sticky bit).
  - `src/commands/__tests__/nano-save-preserve-owner.test.ts` (6 tests): existingSnapshot, readOnly, defaults.
  - `src/commands/__tests__/ls-permissions.test.ts` (7 tests): bob no puede listar `/root` (0700), sí puede `/home/bob` y `/tmp`.
  - `src/commands/tools/__tests__/nmap-output-permissions.test.ts` (4 tests): kali guarda en `/tmp` y `/home/kali`, denegado en `/root/.secret.txt` y `/usr/bin`.
  - `src/frameworks/shells/ftp/__tests__/FtpSession-permissions.test.ts` (3 tests): descarga world-readable OK, denegada en 0600 root, metadatos del atacante asignados.
  - `src/commands/__tests__/permissions-integration.test.ts` (46 tests): matriz transversal comando × escenario (read, write, create, delete+sticky, copy, move, ls, cd, nano, chmod/chown, root bypass).
- **Verificación global**: `tsc --noEmit` 0 errores, 105 archivos de test, 1343/1343 tests pasando.

### Bonus: arreglo del autocompletado de comandos

`src/utils/autocomplete.ts` tenía una lista hardcodeada `AVAILABLE_COMMANDS` desactualizada (28 comandos) que no incluía `chmod`, `chown`, `chgrp`, `nano`, `echo`, `touch`, `rm`, `cp`, `mv`, etc. Derivada ahora del registry real.

- **`src/commands/index.ts`**: nuevo export `AVAILABLE_COMMAND_NAMES: string[]` derivado del `Map` `COMMANDS` (excluye `msfconsole`). Si mañana se agrega un comando nuevo al registry, automáticamente aparece en el autocompletado.
- **`src/utils/autocomplete.ts`**: `autocompleteCommand()` ahora filtra desde `AVAILABLE_COMMAND_NAMES` en lugar del array hardcodeado.
- **`src/hooks/__tests__/useKeyboardShortcuts.test.ts`**: actualizado el `vi.mock('../../commands', ...)` para incluir el nuevo export.
- **`src/utils/__tests__/autocomplete.test.ts`**: +4 tests verificando que `chmod`/`chown`/`chgrp`/`nano`/`echo`/`touch`/`rm`/`cp`/`mv` aparecen y que `msfconsole` se excluye.

## [Unreleased] - 2026-07-29

### Editor `nano` inline en Terminal, redimensionado responsivo y guardado relativo con permisos

- **`src/components/EditorModal.tsx`: Renderizado inline dentro del contenedor de la ventana de Terminal**
  - Se eliminó el overlay modal flotante fijo (`fixed inset-0 z-50 bg-black/70`) y las dimensiones fijas en píxeles.
  - El editor `nano` pasa a ser un contenedor flex `w-full h-full flex-1` que ocupa el área interna de la ventana de la terminal de forma responsiva.
  - Al arrastrar la barra de título de la ventana de la terminal (drag & move), la ventana se mueve fluidamente con `nano` en su interior.
  - Al cambiar el tamaño de la ventana (resize), el editor ajusta su área de texto, locator y barras de estado de forma fluida.
  - Agregado soporte para mensajes de error de permisos en la barra de estado de `nano` (ej: `nano: '/root/secret.txt': Permission denied`). Si ocurre un error de permisos, `nano` no se cierra y permite corregir la ruta o cancelar.

- **`src/components/Terminal.tsx`: Integración inline y resolución de rutas relativas con chequeo Unix de permisos**
  - Cuando `nanoFile` está activo, `EditorModal` sustituye inline la vista del historial/prompt de la terminal.
  - Al presionar `Ctrl+O` o guardar un archivo, resuelve rutas relativas (ej: `mi_archivo.txt` o `./notas.txt`) respecto al directorio actual (`currentDir`) y directorio home (`homeDir`).
  - Realiza validación de permisos de escritura Unix (`canWrite` en archivo existente, o `canWrite` + `canExecute` en directorio padre para archivos nuevos) antes de llamar a `addFileToMachine`.

- **`src/components/__tests__/EditorModal.test.tsx`: Pruebas unitarias para `EditorModal`**
  - Pruebas cubriendo el renderizado inline, edición de texto, estado `Modified`, accesos `Ctrl+X` y `Ctrl+O`, y la respuesta ante errores de permisos.

## [Unreleased] - 2026-07-28

### Editor `nano` rediseñado como réplica fiel de GNU nano 6.2

- **`src/components/EditorModal.tsx`: Reescritura completa del editor**
  - Header tipo GNU nano real: "GNU nano 6.2" + título centrado (archivo o "New Buffer") + indicador "Modified" cuando hay cambios sin guardar.
  - Área de edición con fondo `#0a0a0a`, texto gris y cursor cyan parpadeante (`caretColor` alternando cada 530ms).
  - Locator `[ line X/Y (Z%) ]` + `[ col N ]` que se actualiza al mover el cursor (onKey/onClick/onKeyUp).
  - Barra inferior dinámica con tres modos: `edit` / "File Name to Write:" / "Search:" — emula la barra de prompts de nano real.
  - Footer con dos filas de atajos: `^G Help ^O Write Out ^W Where Is ^\\ Replace ^K Cut` / `^U Paste ^J Justify ^C Cursor Pos ^X Exit ^T To Spell`, con los `^` resaltados en amarillo.
  - Atajos: Ctrl+O → prompt "File Name to Write:", Ctrl+X → sale (pide guardar si hay cambios), Ctrl+W → "Search:" con wrap-around, Ctrl+G → overlay de ayuda.
  - Contrato de props intacto (`onSave(content, filename?)` / `onClose()` / `filePath` / `initialContent`): los 4 tests de `fase4-editors.test.ts` siguen pasando.
  - Bug menor corregido: header con `truncate` + `flex justify-between` dejaba el path ilegible en archivos con rutas largas. Reemplazado por layout `flex` con `min-w-0` y separadores verticales.

### Documentación de plan de trabajo

- **`docs/ROADMAP.md`: Roadmap de features actualizado** (776 líneas). FASES 0–4 marcadas ✅, FASES 5–9 pendientes (procesos, red/firewall, paquetes, cron, fs avanzado). Docker en BACKLOG fuera de secuencia.
- **`docs/MEJORAS.md`: Plan de higiene técnica unificado** (228 líneas). Combina `ROADMAP_FIX_TSC.md` + mejoras urgentes detectadas en análisis de código. FASES 0–4 ✅ (incluye refactor del `CommandResponse` god type en Fase 4). Pendientes: consolidación de CHANGELOGs/READMEs, mover `.md` sueltos a `docs/`, eliminar `console.log` de debug, `useShallow` en `App.tsx` (34 selectors), code-splitting real de Vite, y NO persistir `machines` con credenciales en `localStorage` (Fase 7.1, pendiente crítico).

## [Unreleased] - 2026-07-26

### Fase 4 — Editores de texto y manipulación de archivos (ROADMAP Fase 4 ✅)

- **`src/commands/builtin/touch.ts`: Nuevo comando `touch`**
  - Crea archivos vacíos con `touch <file>`, verifica permisos de escritura en el directorio padre.
  - Usa `applyUmask()` para el mode del archivo nuevo.

- **`src/commands/builtin/echo.ts`: Nuevo comando `echo` con redirección (`>` / `>>`)**
  - `echo texto` imprime texto; `echo texto > archivo` escribe/sobrescribe; `echo texto >> archivo` append.
  - Usa `src/utils/redirection.ts` para parsear la redirección.
  - Verifica permisos de escritura, usa `applyUmask()` para archivos nuevos.

- **`src/commands/builtin/rm.ts`: Nuevo comando `rm`**
  - `rm archivo`, `rm -r directorio` (recursivo), `rm -f` (ignora inexistentes).
  - Verifica permisos de escritura y respeta sticky bit.
  - Bug corregido: `isError` usaba `!r.startsWith('rm:')` que negaba los errores.

- **`src/commands/builtin/cp.ts`: Nuevo comando `cp`**
  - `cp origen destino` copia archivos; `cp -r origen destino` copia directorios (recursivo).
  - Verifica permisos de lectura en origen y escritura en destino.

- **`src/commands/builtin/mv.ts`: Nuevo comando `mv`**
  - `mv origen destino` mueve/renombra archivos y directorios.
  - Verifica permisos de escritura en ambos directorios, respeta sticky bit.

- **`src/commands/builtin/nano.ts`: Nuevo comando `nano`**
  - Abre archivo existente o crea nuevo; muestra contenido + instrucciones Ctrl+O/Ctrl+X.
  - Verifica permisos de escritura.

- **`src/components/EditorModal.tsx`: Nuevo componente EditorModal**
  - Modal con textarea, soporte Ctrl+O (guardar) y Ctrl+X (salir), botones Save/Exit.
  - Props: `onSave(content)`, `onClose()`, `filePath`, `initialContent`.

- **`src/utils/redirection.ts`: Nuevo parser de redirección**
  - `parseRedirection(args)` retorna `{ text, operator: '>' | '>>' | null, filename }`.
  - Reutilizable por echo, cat, nano y futuros comandos.

- **`src/commands/builtin/mkdir.ts`: Actualizado para usar `applyUmask()`**
  - Directorios nuevos creados con `mode: applyUmask(0o777)` en vez de mode implícito.

- **Tests:** `src/commands/__tests__/fase4-editors.test.ts` — 26 tests cubriendo echo, touch, rm, cp, mv, nano y redirection utils.

### Fase 3 — SUID con cambio de identidad y privesc metadata (ROADMAP Fase 3 ✅)

- **`src/commands/index.ts`: SUID handler ahora emite privesc metadata**
  - Cuando un binario SUID (distinto de `sudo`) se ejecuta, la respuesta incluye `privescAttempted: true`, `privescTool: cmdName`, `privescCompleted: machine.id`.
  - `sudo` excluido del handler SUID porque maneja su propia escalada.

- **`src/types.ts`: `privescAttempted`, `privescTool`, `privescCompleted` movidos a `CmdResponseBase`**
  - Cualquier comando puede emitirlos sin necesidad del variant `type: 'sudo'`.

- **`src/commands/builtin/rmdir.ts`: Bug corregido en sticky bit**
  - `checkStickyBit()` buscaba `parentDir + '.dir'` en vez de `parentDir + '/.dir'` — el sticky bit nunca funcionó.
  - Cómputo de `parentDir` corregido: removía incorrectamente el trailing slash antes de `lastIndexOf('/')`.

- **Tests actualizados:** `fase3-suid-sticky.test.ts` — 22 tests (agregados identidad SUID, metadatos privesc, sticky bit root/owner/denied).

- **Verificación:**
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 98/98 archivos, 1.231 tests ✅

### CommandResponse como discriminated union (MEJORAS Fase 3)

- **`src/types.ts`: `CommandResponse` convertido a discriminated union** con 15 variantes tipadas:
  - Extraídos 10 subtipos reutilizables (`FtpSessionData`, `SshSessionData`, `FoundCredentialsData`, `ScanResultsData`, `FoundDirectoriesData`, `FileReadData`, `SudoPrivilegesData`, `FoundVulnerabilityData`, `FailedUserData`, `PossibleUsersData`).
  - Cada comando retorna con un `type` literal (`'scan'`, `'creds'`, `'blocking'`, `'sudo'`, `'discovery'`, etc.) que el compilador verifica.
  - Consumidores (`labValidator`, `useCommandRunner`, tests) usan `'field' in result` para narrowing.
  - ~58 archivos modificados entre tipos, comandos, shells, MSF, hooks, validator y tests.
- **Verificación:**
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 90/90 archivos, 1.135 tests ✅
  - `pnpm build` → compila sin warnings ✅

## [Unreleased] - 2026-07-23

### Code duplication elimination (MEJORAS Fase 2)

- **`src/commands/index.ts`: Eliminada la duplicación entre `executeCommand` / `createIsolatedExecutor`** (FASE 2.1):
  - Extraído `safeJsonParse<T>` — reemplaza 4 try/catch vacíos, loggea errores con `console.warn`.
  - Extraído `parseMsfResponse()` — función compartida que parsea prefijo `MSF_STATE:` y actualiza estado.
  - Extraído `createMsfCommand(getState, setState)` — factory que genera el handler msfconsole sin duplicación.
  - Extraído `executeCommandInternal()` — lógica compartida de ejecución de comandos.
  - `executeCommand` y `createIsolatedExecutor` ahora usan las mismas funciones compartidas.
  - Archivo reducido de ~417 a ~320 líneas, 0 duplicación de lógica.
- **`_msfState` singleton eliminado — migrado al store de Zustand** (FASE 2.2):
  - `_getMsf()`/`_setMsf()` ahora leen del store (`useScenarioStore.getState().msfState`).
  - Eliminada `restoreMsfState()` — redundante, el store es la única fuente de verdad.
  - `resetMsfState()`, `isMsfActive()`, `getMsfPrompt()`, `getMsfState()` delegadas al store.
  - `App.tsx`: eliminados 2 efectos de sync (reset/restore MSF), lee `msfState` directo del store.
  - `useCommandRunner.test.ts`: limpiado mock de `restoreMsfState`.
- **Verificación:**
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 90/90 archivos, 1.135/1.135 tests ✅

## [Unreleased] - 2026-07-22

### Críticos de arquitectura y tipos (MEJORAS Fase 0 + Fase 1)

- **`tsconfig.json`**: Activado `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` — `pnpm exec tsc --noEmit` pasa de 128 errores a 0.
- **Eliminado `src/_deprecated/`** (39 archivos, ~2.139 LOC muerto). Confirmado sin imports externos. Resuelve 22 de los errores de tsc.
- **`scenarioStore` partido en slices** (`src/store/slices/`): `scenarioSlice.ts`, `terminalSlice.ts`, `uiSlice.ts` — el God Store de 460 líneas quedó en 69 líneas (sólo fachada re-exportadora, mantiene compatibilidad con consumers y tests existentes).
- **`resetWorkspace()` extraído**: el bloque `setState({...15 keys...})` duplicado 4× (App.tsx ×3, useCommandRunner.ts ×1) ahora es una acción única que puebla los 3 sub-stores.
- **`src/types.ts` extendido**:
  - `ValidationCriteria.service?: string` (ya usado en runtime, no declarado).
  - `CommandResponse.completedMissionId?: number` (ya emitido por algunos comandos).
- **`src/fs-models/fs-linux.ts`**: 4 `FileEntry` (`/etc/passwd`, `/etc/shadow`, `common.txt`, `rockyou.txt`) con `type: 'text'` faltante.
- **`src/frameworks/metasploit/core/msfTypes.ts`**: `module?` corregido a `string` (era `string | unknown`); `sessions?` tipado a `MsfSession[]`; agregado `MsfSession` interface.
- **`src/frameworks/metasploit/core/ContextRegistry.ts`**: imports rotos (`'../modules/types'`, `'./SessionManager'` — rutas inexistentes) reemplazados por tipos locales stopgap (`MsfSession`, `SessionManager` stub).
- **`src/frameworks/shells/ShellSession.ts`**: agregado `ShellResult.completedMissionId?: number`.
- **`src/hooks/useCommandRunner.ts`**: `CommandRunnerProps.onCredentialsFound.file` ahora opcional (para alinear con consumers que pueden omitirlo); `onVerifyCredentials?.()` con optional chaining.
- **158 archivos editados** en cleanup masivo tras activar `noUnusedLocals`/`noUnusedParameters`:
  - Imports `React` por defecto eliminados (~63 archivos `.tsx` — con `jsx: react-jsx` no es necesario).
  - Locals sin uso eliminados; params sin uso prefix `_`; `const { a, _b, c }` → sin `_b`.
  - Tests alineados a los tipos nuevos: `MsfState` mocks con `uidChecked: false`; `CommandContext` mocks con `currentDir: '/root'`; `cmd_help.execute()` callado con 1 arg (no 2); `makeWelcome([])` en vez de `makeWelcome()`.
  - `DesktopTopBar.test.tsx`: `type: 'wallpapers'` → `'wallpaper'`; `width`/`height` → `w`/`h`; agregados `opacity`/`fontSize` requeridos por `DesktopWindow`.
- **Verificación final**:
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 90/90 archivos, 1.135/1.135 tests ✅

## [Unreleased] - 2026-07-18

### Fase 0 — Sistema de permisos (Foundation)

- **Tipos `User` y `Group`**: Agregados a `src/types.ts` con username, uid, gid, home, shell, groups.
- **`FileEntry` extendido**: Campos opcionales `owner?`, `group?`, `mode?` — compatibilidad backward total.
- **Nuevo `src/utils/users.ts`**: `parsePasswd()`, `parseGroup()`, `getUser()`, `getGroup()`, `getCurrentUser()` (replica la heurística de `useTerminalIdentity`), `isRoot()`.
- **Nuevo `src/utils/permissions.ts`**: `checkPermission()` (owner/group/others bits), `canRead()/canWrite()/canExecute()`, `hasSuid()/hasSgid()/hasStickyBit()`, `formatMode()`.
- **`createFile()` actualizada**: Nueva firma con `owner`, `group`, `mode` opcionales. Defaults: root:root, 755 (dirs) / 644 (files).
- **Permisos reales en todos los filesystems**: `fs-linux.ts`, `templates.ts` (legacy), `kali.ts` — tmp → 1777, root → 700, shadow → 640 root:shadow, logs → 640 root:adm, www-data → 755/644, etc.
- *Archivos: `src/types.ts`, `src/utils/users.ts`, `src/utils/permissions.ts`, `src/laboratorios/templates.ts`, `src/fs-models/fs-linux.ts`, `src/laboratorios/attackers/kali.ts`*

### Fase 1 — Comandos con consciencia de permisos

- **`ls -l`**: Muestra permisos reales (`formatModeFromFile()`), owner y group desde cada `FileEntry` en vez de valores hardcodeados.
- **`cat`**: Verifica `canRead()` antes de mostrar contenido. Si el usuario no tiene permiso de lectura, devuelve `Permission denied`.
- *Archivos: `src/commands/builtin/ls.ts`, `src/commands/builtin/cat.ts`, `src/commands/builtin/__tests__/ls.test.ts`*

## [Unreleased] - 2026-07-17

### Optimización de rendimiento en comandos (fase 1)

- **`commands/index.ts`**: `COMMANDS[]` convertido a `Map<string, Command>` — resolución de comandos O(1) vs O(n). Lo mismo para `createIsolatedExecutor`.
- **`sudo.ts`**: `parseSudoers()` se cachea y se pasa a `hasPermission`/`hasNopasswd` — 3 parseos → 1 por invocación.
- **`nmap.ts`**: `parsePorts()` sin `-p` ya no aloca arrays de 1024/65535 elementos; filtra por rango o devuelve copia directa. Puertos específicos usan `Set.has()` O(1) vs `Array.includes()` O(n).
- **`ls.ts`**: Unificados dos `forEach` sobre `machine.files` en un solo paso.
- **`ping.ts`** y **`traceroute.ts`**: 3-4 `indexOf()` → único `for` con `switch`. Regex movido a constante del módulo.
- **`whoami.ts`**: 3 `.find()` anidados → 1 línea con `||` short-circuit (mínimo de escaneos).
- **`cd.ts`**: Eliminada doble llamada a `getCurrentUser()` (`isRoot` lo hacía internamente). Path normalization extraída a utilidad compartida.
- **`mkdir.ts`** y **`rmdir.ts`**: Path normalization y `SYSTEM_DIRS` extraídos a `utils/path.ts` — elimina código duplicado en 3 comandos.
- **Nuevo `src/utils/path.ts`**: `normalizePath()`, `ensureTrailingSlash()`, `resolvePath()`, `SYSTEM_DIRS` — utilidades compartidas de ruta.
- *Archivos: `src/utils/path.ts`, `src/commands/index.ts`, `src/commands/builtin/sudo.ts`, `src/commands/tools/nmap.ts`, `src/commands/builtin/ls.ts`, `src/commands/builtin/cd.ts`, `src/commands/builtin/mkdir.ts`, `src/commands/builtin/rmdir.ts`, `src/commands/builtin/ping.ts`, `src/commands/builtin/traceroute.ts`, `src/commands/builtin/whoami.ts`*

### Streaming output realista en herramientas + fixes críticos

- Agregado `streamingLineDelays` a nmap, hydra, gobuster, netdiscover, arp-scan y hashcat — el output aparece línea por línea con delays variables según el tipo de operación (puertos, raw packets, GPU, etc.).
- **Fix 🔥 whoami**: ya no crashea si `machine.scan_results` es undefined (`src/commands/builtin/whoami.ts`).
- **Fix 🔥 cat**: resuelve rutas relativas contra `currentDir` — `cat archivo.txt` funciona desde cualquier directorio (`src/commands/builtin/cat.ts`).
- **Fix 🔥 mkdir -p**: detecta directorios existentes con `path + '/.dir'` en vez de `path + '.dir'` — ya no duplica entradas (`src/commands/builtin/mkdir.ts`).
- **Fix 🔴 hydra**: busca la wordlist en todas las máquinas (no solo en la Kali), y si no se encuentra asume pass correcta en vez de fallar (`src/commands/tools/hydra.ts`).
- *Archivos: `src/commands/tools/nmap.ts`, `src/commands/tools/hydra.ts`, `src/commands/tools/gobuster.ts`, `src/commands/tools/netdiscover.ts`, `src/commands/tools/arp-scan.ts`, `src/commands/builtin/hashcat.ts`, `src/commands/builtin/whoami.ts`, `src/commands/builtin/cat.ts`, `src/commands/builtin/mkdir.ts`*

## [Unreleased] - 2026-07-13

### Debug panel renombrado a /zildeb + LinkedIn link

- Ruta `/admin` renombrada a `/zildeb`. El link `[admin]` se eliminó del `MarketingFooter` — ahora solo es accesible escribiendo la URL directamente.
- `@pabloveron` en el footer ahora es un link a LinkedIn (`https://www.linkedin.com/in/pablomarceloveron`).
- *Archivos: `src/App.tsx`, `src/components/landing/MarketingFooter.tsx`*

## [Unreleased] - 2026-07-12

### Bug fix — Links del ConsultancySite sacaban del laboratorio

- Los `<a href="#">` y `<a href="#servicios">` en `ConsultancySite.tsx` ahora tienen `onClick` con `e.preventDefault()` para evitar que la navegación real del browser saque al usuario del lab. Los enlaces a `#servicios` y `#equipo` además hacen scroll suave a la sección correspondiente.
- Se agregó `onNavigate` a las props de `ConsultancySite` y se pasa desde `FakeBrowser.tsx`.
- *Archivos: `src/components/fakesites/ConsultancySite.tsx`, `src/components/FakeBrowser.tsx`*

### Fake site — zeroinfralabs.vercel.app

- Nueva landing page `ZeroInfraLabs.tsx` con diseño futurista/joke (Cloud Null, Seguridad Imaginaria, Deploy a /dev/null). Accesible desde la URL `https://zeroinfralabs.vercel.app` en el FakeBrowser.
- Agregado botón `⚡ zeroinfralabs.vercel.app` en Google Home (debajo de las sugerencias de búsqueda).
- *Archivos: `src/components/fakesites/ZeroInfraLabs.tsx`, `src/components/FakeBrowser.tsx`*

### Chrome button habilitado en labs 3 y 5

- Cambiada categoría de lab 3 (EternalBlue) y lab 5 (FTP + PrivEsc) de `'Network'` a `'Web'` para que muestren el botón de Chrome. Los usuarios pueden abrir el navegador e intentar acceder a los servidores (verán 404).
- *Archivos: `src/laboratorios/laboratorio03.ts`, `src/laboratorios/laboratorio05.ts`, `src/laboratorios/__tests__/laboratorio05.test.ts`*

## [Unreleased] - 2026-07-10

### Theme toggle (dark/light) — Marketing pages

- **Nuevo estado `theme` en store**: Agregado `theme: 'light' | 'dark'` + `setTheme` a `scenarioStore.ts`. Persistido en localStorage.
- **`ThemeSync` en `App.tsx`**: Sincroniza `data-theme` en `<html>` al cambiar el tema.
- **`useColors()` hook**: Creado en `src/components/landing/constants.ts` con 12 tokens por tema (`colorsLight`/`colorsDark`). Todos los componentes marketing lo usan en vez de valores hardcodeados.
- **SiteHeader**: Adaptado completamente al tema — fondo (`rgba(10,14,20,0.92)` dark / `rgba(255,255,255,0.92)` light), navegación, menú mobile, badges activos. Nuevo `ThemeToggle` (sol/luna) al lado del selector de idioma.
- **LandingPage**: Features cards (4 cuadros "hecho para principiantes") y step badges (01-04) ahora usan colores del tema. Hover shadows ajustados para modo oscuro (`hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]`).
- **LandingLabPreview**: Cards, hover shadows, links de "empezar" y "ver todos" adaptados al tema.
- **LabGrid**: Cards (`#11161f` dark / `#ffffff` light), modal, close button, badges, tags — todos theme-aware. Imagen placeholder: `#0a0e14` dark / `#f1f5f9` light.
- **BlogListPage**: ArticleCard, tags, metadata — theme-aware.
- **BlogArticlePage**: `renderMarkdown()` acepta `isDark`/`colors` y genera HTML con colores del tema. Tags y back link adaptados.
- *Archivos: `src/store/types.ts`, `src/store/scenarioStore.ts`, `src/App.tsx`, `src/components/landing/constants.ts`, `src/components/landing/SiteHeader.tsx`, `src/components/LandingPage.tsx`, `src/components/landing/LandingLabPreview.tsx`, `src/components/LabGrid.tsx`, `src/components/BlogListPage.tsx`, `src/components/BlogArticlePage.tsx`*

### CTA siempre visible en LandingPage

- Eliminado `showFloatCta` state y scroll listener. CTA en SiteHeader ahora siempre visible (`showCta={true}`). Eliminado el botón CTA flotante fixed-bottom en mobile.
- *Archivo: `src/components/LandingPage.tsx`*

### Botón "Regresar" en LabGrid

- El botón verde del header en la página de labs ahora dice "Regresar" (ES) / "Back" (EN) y navega al landing (`/${language}`) en vez de "Iniciar" → `/labs`.
- Nueva clave i18n `backToLanding`.
- *Archivos: `src/components/LabGrid.tsx`, `src/i18n/translations.ts`*

### Bug fix — Scroll bloqueado al salir del modal de labs

- Agregado `useEffect` cleanup que restaura `document.body.style.overflow` al desmontar `LabGrid`. Esto evita que el scroll quede bloqueado al navegar ("Start Lab" o botón atrás del browser) mientras el modal está abierto.
- *Archivo: `src/components/LabGrid.tsx`*

## [Unreleased] - 2026-07-09

### 🎨 Rediseño visual completo — Landing, Labs, Blog + tipografía Inter

- **LandingPage**: rediseño completo. Pasó de fondo oscuro `#0b1015` 100% monospace a hero oscuro (`#0f172a` → `#1e293b`) + secciones de contenido con fondo claro (`#ffffff`, `#f8fafc`). Tipografía cambia de monospace a **Inter (sans-serif)**. Se eliminaron 10 cards de features/audience → 4 cards compactas. Nueva sección "How it works" con animaciones alternadas. Nuevos componentes compartidos: `SiteHeader`, `MarketingFooter`, `PageHero`, `LandingLabPreview`. Se eliminaron gradientes verdes en títulos. Nuevo CTA flotante en mobile.
- **LabGrid**: mismo cambio de fondo oscuro → `#f8fafc` con tipografía Inter. Cards de laboratorios pasaron de fondo `#0d1117` con bordes verdes oscuros a fondo **blanco** con bordes `#e2e8f0` y sombras sutiles. Título con gradiente eliminado, reemplazado por `PageHero`.
- **BlogListPage**: fondo oscuro → secciones claras. ArticleCard: fondo `#0d1117` borde `#243030` → fondo blanco con borde `#e2e8f0`. Tags pasaron de estilo verde-oscuro a `rounded-full` verde claro. Monospace → Inter.
- **BlogArticlePage**: mismo cambio de fondo. Markdown renderizado pasó de colores `#10b981`/`#22d3ee`/`text-gray-300` a `text-emerald-800`/`text-slate-600`.
- **Tipografía**: se agregó Google Fonts **Inter** en `index.html`. Definida en `src/components/landing/constants.ts` como `FONT_SANS`. Monospace queda solo para badges, tags y metadata técnica.
- **Paleta centralizada**: nuevo archivo `src/components/landing/constants.ts` con objeto `C` conteniendo todos los colores del nuevo diseño, `FONT_SANS`, `FONT_MONO` y demo de nmap.
- **App.tsx**: nueva ruta `/:lang/admin` con componente `AdminPanel`.
- *Archivos: `src/components/LandingPage.tsx`, `src/components/LabGrid.tsx`, `src/components/BlogListPage.tsx`, `src/components/BlogArticlePage.tsx`, `src/components/landing/*`, `index.html`, `src/App.tsx`*

## [Unreleased] - 2026-07-08

### Bug fixes — Path relativo sin separador en `mkdir`, `rmdir`, `cd`

- **`mkdir` / `rmdir` / `cd`**: al construir paths relativos, concatenaban `currentDir + dir` sin asegurar que `currentDir` terminara con `/`. Si `currentDir` era `'/root'` (sin trailing slash), `mkdir hola` creaba `/roothola/` en vez de `/root/hola/`. Lo mismo ocurría con `cd hola` y `rmdir hola`.
- *Archivos: `src/commands/builtin/mkdir.ts`, `src/commands/builtin/rmdir.ts`, `src/commands/builtin/cd.ts`*

## [Unreleased] - 2026-07-05

### Admin Panel (debug)
- **Nuevo `/:lang/admin` route** con panel debug completo (login `admin/admin`, selector de escenario, debug overlay flotante con pestañas Store/Machines/Missions)
- **Workspace con DesktopTerminal real** — muestra el escritorio Linux completo (ventanas, wallpaper, taskbar) como en los labs, no solo Terminal aislada
- *Archivos: `src/components/AdminPanel.tsx`, `src/App.tsx`, `src/components/LandingPage.tsx`*

### Bug fixes — Case sensitivity en comandos
- **`executeCommand`** ya no baja a mayúsculas el nombre del comando (`parts[0].toLowerCase()` → `parts[0]`). Ahora `NMAP`, `LS`, `CAT`, `CD`, etc. dan `Command not found`
- **`help` lookup** ya no usa `toLowerCase()` — `help NMAP` ya no muestra la ayuda de `nmap`
- **Autocomplete de comandos** ya no filtra con `toLowerCase()` — `NM` + Tab ya no sugiere `nmap`
- *Archivos: `src/commands/index.ts`, `src/commands/builtin/help.ts`, `src/utils/autocomplete.ts`*
- *Tests: `src/commands/builtin/__tests__/help.test.ts`, `src/utils/__tests__/autocomplete.test.ts`*

### Bug fixes — `ls` sin trailing slash en directorios
- **Formato simple** (`ls`): directorios ya no muestran `/` al final (`bin/` → `bin`)
- **Formato largo** (`ls -l`): directorios ya no muestran `/` al final del nombre
- Comportamiento como Linux real (`ls` sin `-F` no agrega `/`)
- *Archivo: `src/commands/builtin/ls.ts`*
- *Tests: `src/commands/builtin/__tests__/ls.test.ts`*

### Bug fixes — `admin` hardcodeado en template de filesystem
- **`createLinuxFileSystem`** (`fs-linux.ts`): eliminado `/home/admin/.dir`, `.bashrc`, `.profile`, `.bash_history` del template estándar. Cada lab define sus propios usuarios.
- **`/etc/passwd` y `/etc/shadow`**: eliminada la entrada hardcodeada de `admin`. Solo existe el usuario dinámico `${u}` del config.
- **`createLinuxFileSystemLegacy`** (`templates.ts`): mismo cambio.
- **`laboratorio01.ts`**: agregados `.bashrc`, `.profile`, `.bash_history` de admin (es el único lab que lo necesita).
- *Archivos: `src/fs-models/fs-linux.ts`, `src/laboratorios/templates.ts`, `src/laboratorios/laboratorio01.ts`*

### Bug fixes — `nmap.ts` (sesión anterior)
- ✅ `-sV` ya no se trata como scan type (era un flag de versión)
- ✅ Default scan type cambiado a `-sS` (SYN stealth)
- ✅ `-Pn` solo muestra mensaje en modo verbose (`-v`)
- ✅ "Not shown" movido antes de la tabla de puertos
- ✅ `-oG` formato corregido (protocol/state, doble `//` entre service/version)
- ✅ `getKnownService()` eliminada (código muerto)
- *Archivo: `src/commands/tools/nmap.ts`*

## [Unreleased] - 2026-06-21

### Fixes `laboratorio05.ts` — Code Review

- ✅ **`REVERSE_SHELL_PAYLOAD` eliminado** de `validationCriteria` — solo existe en lab 4 (`laboratorio05.ts:295`)
- ✅ **`COMMON_PORTS` corregido a `DISCOVERED_PORTS`** — referenciaba constante inexistente
- ✅ **`"service"` corregido a `"services"`** — typo en validación de servicio
- ✅ **`criteria[0]` corregido a `criteria[i]`** — siempre validaba el primer criterio en el bucle
- ✅ **`targetMachineId` hardcoded reemplazado** por `config.targetMachineId`
- ✅ **Import `SCENARIO_TEMPLATES` corregido** — era `SCENARIO_TEMPLATE` (inexistente)
- ✅ **`description` corregido a `descripcion`** — propiedad incorrecta en metadatos del lab

### Pentester: Shortcuts eliminados

- ✅ **`cmd_ssh` v2** — ya no emite `foundCredentials` automáticamente al hacer SSH (era un shortcut que saltaba la validación)
- ✅ **`cmd_nmap` v2** — `nmap -sn` ya no emite `discoveredHosts` (el escaneo de descubrimiento no debe revelar hosts automáticamente)

### Tests: `AnimatedBrowser.test.tsx` corregido

- ✅ **Mock de `Math.random`** añadido (`mockReturnValue(0)`) para hacer la animación determinista con fake timers
- ✅ **Timings ajustados** para coincidir con la línea de tiempo real de la animación (1200/1500/1000/1500/2000ms)
- ✅ **URL personalizada** — `advanceTimersByTime(12000)` → `5000ms` para evitar entrar al segundo ciclo de animación

## [Unreleased] - 2026-06-18

### UX: Ventanas de escritorio más grandes, centradas y con opacidad default 50%

- ✅ **Terminal inicial más grande y centrada** (`useDesktopWindows.ts:46-58`) — `x:40,y:60,w:640,h:400,opacity:0.92` → `x:100,y:80,w:820,h:520,opacity:0.5`. Nuevas terminales (`addTerminal`) usan los mismos defaults.
- ✅ **Wallpaper picker más grande y centrado** (`useDesktopWindows.ts:119`) — `x:120,y:100,w:520,h:400` → `x:180,y:100,w:660,h:540`. Previews `h-16` → `h-24`, gap `gap-3` → `gap-4`, padding `p-2.5` → `p-3`.
- ✅ **Text selection en browser y terminal** (`FakeBrowser.tsx:446`, `Terminal.tsx:63`) — El `select-none` del escritorio impedía seleccionar texto en todas las ventanas. Se agregó `select-text` al contenido del browser y la terminal.
- ✅ **WPIndex responsivo** (`Index.tsx`) — `max-w-4xl` → `max-w-7xl` con padding, sidebar y textos responsivos por breakpoint (`md:`/`lg:`/`xl:`). Layout `flex-col` en mobile, `lg:flex-row` en desktop.

### Refactor: Bajo acoplamiento — correcciones de alta prioridad

- ✅ **ShellSession.ts: import roto reparado** (`frameworks/shells/ShellSession.ts:4`) — El import apuntaba a `'../types'` que resuelve a `src/frameworks/types.ts` (inexistente). Corregido a `'../../types'` que resuelve a `src/types.ts`. Era un bug latente que funcionaba solo por `moduleResolution: "bundler"` de Vite.

- ✅ **FtpSession.ts: dependencia directa del store eliminada** (`frameworks/shells/ftp/FtpSession.ts:4`) — El shell FTP importaba `useScenarioStore` desde `store/scenarioStore`, una violación de capas grave (framework → store). El import no se usaba en el código, solo era un residual. Eliminado.

- ✅ **autocomplete.ts: desacoplado de `frameworks/metasploit`** (`utils/autocomplete.ts:7`) — La capa de utilidades (`utils/`) importaba `MSF_MODULES` desde `frameworks/metasploit/core/msfModules`, creando una dependencia invertida. Se refactorizó para que `autocompleteMsf` y `getAutocompleteSuggestions` reciban los módulos como parámetro opcional. El llamador (`useKeyboardShortcuts.ts`) los importa y pasa. Tests actualizados.

- ✅ **useCommandRunner.ts: eliminada validación duplicada** (`hooks/useCommandRunner.ts`) — El bloque de validación de misiones (`validateMission`) estaba repetido 3 veces (comando normal, sesión FTP, sesión SSH). Se extrajo en el helper `checkMissionCompletion()` y se unificaron las 3 llamadas. También se eliminó la duplicación del manejo de descarga de archivos FTP reutilizando `handleDownloadedFile()`. El archivo pasó de 582 a 540 líneas.

### Refactor: Modularización de DesktopTerminal

- ✅ **DesktopTerminal.tsx reducido de 1011 a 159 líneas** — Se extrajeron 5 módulos:
  - `src/components/desktopWallpapers.ts`: interfaz `Wallpaper` + 6 wallpapers SVG
  - `src/hooks/useDesktopWindows.ts`: hook con toda la lógica de ventanas (drag, resize, add, close, minimize, wallpaper, clock)
  - `src/components/DesktopTopBar.tsx`: barra superior con menú de apps, taskbar, reloj, indicadores de sistema
  - `src/components/WindowFrame.tsx`: marco de ventana con header, sliders de opacidad/fuente, botones de control, handles de resize
  - `src/components/WallpaperPicker.tsx`: grilla de selección de wallpaper

- ✅ **Tests de hooks**: `useDesktopWindows.test.ts` (31 tests) y `useCommandRunner.test.ts` (15 tests) nuevos, usando `vi.hoisted()` para evitar TDZ, store ref reseteable, timers fake para comandos streaming, y `waitFor` para operaciones asíncronas.

### Refactor: Metasploit unificado en `src/frameworks/metasploit/`

- ✅ **Movidos `msfTypes.ts`, `msfHelpers.ts`, `msfModules.ts`** de `src/commands/tools/` a `src/frameworks/metasploit/core/`
- ✅ **Movido `msfCommands/` (orquestadores)** de `src/commands/tools/` a `src/frameworks/metasploit/orchestrators/`
- ✅ **`msfconsole.ts`** queda como thin wrapper en `src/commands/tools/` con comentario apuntando a `frameworks/metasploit/`
- ✅ Actualizados imports en 25+ archivos, eliminados archivos duplicados

### Structure final de MSF

```
src/frameworks/metasploit/
├── core/              ← tipos, helpers, módulos, context-registry
├── commands/          ← sub-comandos (use, set, show, search, exit…)
├── orchestrators/     ← orquestadores (msfBase, msfMeterpreter, msfShell, msfExploits, msfContextHelp)
├── modules/           ← módulos de exploit/post
└── index.ts
```

---

## [Unreleased] - 2026-06-16

### Nuevo: DesktopTerminal — Entorno de escritorio Linux simulado

Se reemplazó la terminal simple por un escritorio Kali virtual completo con ventanas arrastrables, redimensionables, minimizables y maximizables. Todo el estado de las ventanas se maneja localmente en `DesktopTerminal.tsx` con un array de `DesktopWindow`.

- **Gestión de ventanas**: Drag desde el header, resize desde las 4 esquinas, minimizar (−), maximizar/restaurar (□/⧉), cerrar (×).
- **Barra de tareas (Kali-style)**: Botón de aplicaciones, botones individuales para cada ventana de terminal (1–5), Chrome (1–2) y configuración de fondos. Solo el botón de la ventana superior se resalta.
- **Comportamiento del botón en barra de tareas**: Si la ventana está minimizada → se restaura y trae al frente. Si está visible (aunque esté detrás de otra) → se minimiza.
- **Z-index compartido**: Terminales, Chrome y ventana de fondos comparten el mismo stack de z-index; se pueden intercalar.
- **Aplicación "Change Wallpaper"**: Se abre como una ventana tipo `wallpaper` en el escritorio, con los mismos controles (minimize, maximize, close) y botón en la barra de tareas.

### Chrome como ventana nativa del escritorio

- Chrome se movió de un overlay separado a una `DesktopWindow` con `type: 'browser'`, heredando todas las capacidades de ventana (drag, resize, minimize, maximize, close).
- Cada instancia de Chrome tiene estado **independiente** (URL actual, historial de navegación, login) manejado con `useState` local en `FakeBrowser`, en lugar del store global.
- La numeración de Chrome es **monótona creciente** (1, 2, 3…) sin reiniciar al cerrar ventanas.
- Al cerrar un Chrome y reabrirlo, arranca desde `https://www.google.com`.
- Límite: máximo 2 ventanas de Chrome.
- "Firefox" renombrado a "Chrome" en toda la interfaz (etiquetas, menú, icono de escritorio, AnimatedBrowser, pistas de laboratorio). Nuevo icono SVG estilo Chrome.

### Estado aislado por terminal

Cada terminal tiene ahora su propio contexto de ejecución independiente:

- `msfState` — cada terminal puede ejecutar `msfconsole` sin afectar a otras.
- `currentDir` — cada terminal tiene su propio directorio de trabajo.
- `blockingCommand` / `listeningPort` — comandos bloqueantes como `nc` son por terminal.
- `ftpSession` / `sshSession` — sesiones FTP/SSH interactivas por terminal.
- Nuevo `createIsolatedExecutor()` en `commands/index.ts` que devuelve un ejecutor con `_msfState` capturado en closure.
- Limpieza del store: eliminados `browserMinimized`, `firefoxOpenCount`, `setBrowserMinimized`, `setFirefoxOpenCount`.

### Botones de ventana reordenados

- Verde (−) = minimizar
- Amarillo (□/⧉) = maximizar/restaurar

### Limpieza de código

- Eliminado el overlay de Chrome de `App.tsx` en modo desktop.
- Eliminados `browserClosing`, `browserMaximized`, `browserCustomDims`, resize refs del `App.tsx`.
- FakeBrowser convertido a estado local (`useState`) para URL, navegación y login.

---

## [Unreleased] - 2026-06-08

### Fixes de Laboratorio / Validación

- ✅ **Lab 5: `cat nota.txt` ahora muestra a `john` en "Possible SSH Users"** — La nota FTP se descarga en la máquina atacante, por lo que el `cat` corría siempre con `machine.id === 'attacker-01'`. El `possibleUsers.machineId` quedaba guardado en el atacante y el `EnumerationPanel` (que filtra máquinas no-atacante) nunca mostraba a `john` como posible usuario SSH. Se restauró la resolución: si el `cat` corre en el atacante y hay `allMachines`, los usuarios descubiertos se asignan al target del lab. Además, se restauró el regex robusto de `extractMentionedUsers` con `matchAll` + filtrado de falsos positivos (`esta`, `equipo`, `seguridad`, `root`) + `length >= 3` + word boundaries, que también se había perdido en la "restauración" del 7 de junio.
  - `src/commands/builtin/cat.ts`: `extractMentionedUsers` y resolución de `machineId` corregidas.
  - `src/commands/builtin/__tests__/cat.test.ts`: 5 tests de regresión nuevos (atacante→target, ES/EN, falsos positivos, fallback sin `allMachines`).

---

## [Unreleased] - 2026-06-06

### Fixes de Laboratorio / Validación

- ✅ **Solución a la validación del Paso 3 en Lab 5 (FTP + PrivEsc)** — Se rehizo este cambio partiendo de una versión anterior en el GitHub del 29 de abril.
  - Implementado el tipo de validación `fileDownloaded` en `MissionCriteriaType` (`src/types.ts`) y su validador respectivo en `validateMission` (`src/utils/labValidator.ts`).
  - Agregada la validación universal del laboratorio en el flujo interactivo de FTP (`Terminal.tsx`) al descargar archivos con `get`.
  - Añadidas pruebas unitarias para `fileDownloaded` en `labValidator.test.ts`.

---

## [Unreleased] - 2026-05-28

### DevOps y Gestión de Dependencias

- ✅ **Migración a pnpm** — Se migró el gestor de paquetes de `npm` a `pnpm` (v11) para acelerar las instalaciones, mejorar la seguridad del árbol de dependencias y optimizar el almacenamiento.
  - Reemplazado `package-lock.json` por `pnpm-lock.yaml`.
  - Actualizada toda la documentación y guías del proyecto (`README.md`, `AGENTS.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`) con las nuevas instrucciones de ejecución basadas en `pnpm`.

---

## [Unreleased] - 2026-04-29

### Mejoras de UX y Routing

- ✅ **Detección automática de idioma** — Detecta `navigator.language` del navegador
  - Redirige a `/es` si el navegador está en español (es-ES, es-MX, es-AR, etc.)
  - Redirige a `/en` por defecto o para otros idiomas
  - Respeta preferencia guardada en localStorage si el usuario ya cambió manualmente

- ✅ **Language switcher fix** — Cambio de idioma actualiza la URL correctamente
  - Al cambiar ES → EN, la URL cambia de `/es/scenario/...` a `/en/scenario/...`
  - Preserva la ruta completa, solo cambia el prefijo de idioma

- ✅ **Persistencia de directorio actual** — `currentDir` se guarda en localStorage
  - Valor inicial: `/root` (en lugar de `/`)
  - Al refrescar la página, mantiene el directorio donde estabas

### Comandos

- ✅ **nmap -oN / -oG fix** — Guarda archivos en el directorio actual
  - Ej: `nmap -oN basico 192.168.1.10` guarda en `/root/basico`
  - Ej: `nmap -oN salida.txt 192.168.1.10` guarda en `/root/salida.txt`
  - Paths absolutos se respetan: `nmap -oN /tmp/scan.txt ...` guarda en `/tmp/scan.txt`
  - `-oG` funciona igual que `-oN`

- ✅ **nmap --open** — Nuevo flag para filtrar solo puertos abiertos

### DevOps

- ✅ **vercel.json** — Configuración para SPA routing
  - Soluciona error 404 al refrescar páginas con rutas dinámicas (`/es/labs`, `/en/scenario/...`)
  - Redirige todas las rutas al `index.html` para que React Router maneje el routing

- ✅ **chunkSizeWarningLimit** — Aumentado a 1000KB para suprimir warning de Vercel

---

## [Unreleased] - 2026-04-23

### Comandos de Sistema y Red

- ✅ **ping** — Comando ICMP para testear conectividad de red
  - Flags: `-c` (count), `-i` (interval), `-W` (timeout), `-s` (size), `-h` (help)
  - Simula respuestas de hosts existentes con TTL (64 Linux / 128 Windows)
  - 10 tests incluidos

- ✅ **traceroute** — Trazar ruta a un destino
  - Flags: `-m` (max hops), `-q` (queries), `-w` (wait), `-h` (help)
  - Simula saltos intermedios con latencias
  - 7 tests incluidos

- ✅ **ps** — Reportar estado de procesos
  - Opciones: `ps`, `ps aux`, `ps -e`, `ps -ef`
  - Procesos simulados según OS (Linux/Windows)
  - 5 tests incluidos

- ✅ **top** — Visor dinámico de procesos en tiempo real
  - Implementado como comando bloqueante (sale con `q`)
  - Muestra CPU%, MEM%, load average, uptime
  - 6 tests incluidos

- ✅ **which** — Localizar ejecutables en PATH
  - Soporta múltiples comandos: `which nmap ls python`
  - Lista completa de comandos builtin y tools
  - 12 tests incluidos

- ✅ **htop** — Visor de procesos interactivo con colores
  - Barras visuales de CPU (múltiples cores)
  - Barras de memoria y swap con porcentajes
  - Proceso htop resaltado con '>'
  - Menú de function keys (F1-F10)
  - Sale con 'q' o F10
  - 8 tests incluidos

### Comandos de Reconocimiento de Red

- ✅ **netdiscover** — Nuevo comando de descubrimiento de hosts pasivo/activo
  - Auto-detección de red desde la IP de la máquina
  - Flags: `-r` (rango), `-p` (pasivo), `-v` (verbose), `-P` (parseable), `-f` (fast), `-n` (nodo inicial)
  - Output tipo netdiscover real con tabla de hosts encontrados
  - 12 tests incluidos

- ✅ **nmap -sn con CIDR** — Escaneo de red completa (`nmap -sn 192.168.1.0/24`)
  - Encuentra todos los hosts en la red especificada
  - Retorna `discoveredHosts` para validación de labs
  - 4 tests nuevos para CIDR

- ✅ **nmap simplificado** — Removida validación de `discovery_level` del comando
  - El comando ahora es completamente "libre" (sin validaciones internas)
  - La validación de pasos debe hacerse en el sistema de labs (labValidator)

### Documentación

- ✅ **docs/nmap/help.md** — Referencia rápida de opciones de nmap
- ✅ **docs/nmap/man.md** — Manual completo de nmap en formato Unix man page

### DevOps

- ✅ **Vercel Analytics** — Agregado seguimiento de analytics con `@vercel/analytics` en `src/main.tsx`

---

## [1.1.0] - 2026-04-12

### Fixes de Navegación

- ✅ **Corregido tipo `lang` en `App.tsx`** — Validación explícita `'en' | 'es'` con fallback seguro a `'en'`
- ✅ **Flujo encuesta → LabGrid corregido** — Al saltar o enviar encuesta, navega directamente a `/:lang/labs` en vez de volver al mismo lab (usaba `history.back()`)
- ✅ **Botones atrás/adelante del browser** — `popstate` handler ahora hace cleanup directo + `navigate()` para evitar loops con `history.back()`
- ✅ **Estado se limpia correctamente** — Survey y workspace state se resetean completamente al salir de un lab
- ✅ **7 tests de navegación nuevos** — `AppNavigation.test.tsx` cubriendo todos los flujos en ambos idiomas

### Landing Page — Textos para principiantes

- ✅ **Hero** — Supertítulo: "LA PRIMERA PLATAFORMA DE HACKING ÉTICO EN ESPAÑOL — DIRECTO EN TU NAVEGADOR"
- ✅ **Hero** — Título: "Aprendé hacking desde cero — sin instalar nada"
- ✅ **Hero** — 4 badges: Sin conocimientos previos, Sin registro, 100% seguro y legal, ⏱️ Sin límite de tiempo
- ✅ **Hero** — CTA: "Empezar gratis ahora →"
- ✅ **Sección "¿Nunca hackeaste nada? Perfecto."** — Reemplaza "Meet ZI Labs"
- ✅ **Card "Terminal realista"** — Texto centrado en aprender haciendo
- ✅ **Card "Curiosos del hacking"** — Reemplaza "Preparación para certificaciones" (ícono 👀)
- ✅ **Paso 01** — "Labs ordenados de más fácil a más difícil"
- ✅ **Sección nueva: Disclaimer legal** — "Hacking ético, siempre." con ícono de escudo
- ✅ **6ta card "Sin límite de tiempo"** — Reemplaza "Enumeración guiada" (ícono ⏱️)
- ✅ **Card "Autodidactas"** — Mención al tiempo: "ni un reloj corriendo en contra"
- ✅ **Card "Sin dolores de cabeza con VMs"** → **"Amantes de lo simple"** (ES) / **"Lovers of simplicity"** (EN)
- ✅ **Todos los textos en ES (voseo) y EN**

### Lab 02 — SSH Compromised Fix

- ✅ **Misiones 5 y 6** — `discoveryLevel: 4` → `3` — SSH como `gonzalo` ya no marca la máquina como "Compromised" (no hay escalada de privilegios en este lab)

---

## [1.0.0] - 2026-04-11

### Features Principales

- **6 Laboratorios completos** — WordPress, SSH Brute, EternalBlue, LFI/RCE, FTP+PrivEsc, SQL Injection
- **Terminal realista** — 20+ comandos funcionales (nmap, hydra, ssh, msfconsole, etc.)
- **Sistema de Validación Universal** — Comandos libres, validación declarativa
- **Landing Page** — Marketing completo con animaciones
- **800+ Tests** — Cobertura completa con Vitest

### Arquitectura

- React 18 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- Zustand + localStorage persistence
- i18n (Español/Inglés)

### Fixes Recientes

- ✅ Validación universal implementada (14 criterios)
- ✅ LHOST mensaje genérico en MSF exploit
- ✅ Tests de Terminal actualizados con store mock
- ✅ Coverage de store mejorado (selectors tests)

---

## Versiones Anteriores

Ver [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) para historial completo de versiones anteriores.
