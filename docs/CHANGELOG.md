# Changelog

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
