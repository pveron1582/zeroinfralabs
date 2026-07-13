# Changelog

## 2026-07-10

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

## 2026-06-30

### Bug fixes — Lab 4 (LFI to RCE)

- **Reverse shell no conectaba**: El `listeningPort` del store nunca se actualizaba al ejecutar `nc -nlvp 4444` (solo se actualizaba el estado local del hook). `FakeBrowser` leía del store y no detectaba el listener activo.  
  *Archivos: `src/hooks/useCommandRunner.ts`, `src/components/FakeBrowser.tsx`*

- **RCE duplicado en InclusionSite**: El componente `InclusionSite` tenía un `useEffect` que completaba la misión 5 incorrecta y no cambiaba la terminal. Se eliminó y se unificó en `FakeBrowser`.  
  *Archivos: `src/components/fakesites/lfi_lab/InclusionSIte.tsx`, `src/components/FakeBrowser.tsx`*

- **Cualquier `.php` en files/ disparaba RCE**: El efecto solo verificaba `.php` genérico, así que cualquier archivo PHP consumía el listener y bloqueaba reintentos con `rceCompletedRef`. Ahora solo `payload.php` dispara la conexión.  
  *Archivo: `src/components/FakeBrowser.tsx`*

- **Misión 6 se completaba sin conexión real**: `onMissionComplete(6)` se llamaba desde el browser aunque el terminal no estuviese escuchando (`busy = false`). Se movió a la terminal: solo se completa cuando el terminal procesa `connected + busy`.  
  *Archivos: `src/components/FakeBrowser.tsx`, `src/hooks/useCommandRunner.ts`*

- **Listener fantasma al cancelar nc con Ctrl+C**: El store no limpiaba `listeningPort` al cancelar, por lo que `FakeBrowser` seguía detectando un listener activo.  
  *Archivos: `src/hooks/useCommandRunner.ts`*

### Bug fixes — Terminal

- **Directorio inicial `/` en vez de `/root`**: El estado local `currentDir` iniciaba en `/`. Cambiado a `/root` y se resetea al cambiar de escenario.  
  *Archivo: `src/hooks/useCommandRunner.ts`*

- **`cd` sin argumentos usa `/home/user` hardcodeado**: Ahora determina el usuario real desde la máquina (misma lógica que `useTerminalIdentity`) y dirige a `/home/{usuario}` o `/root` según corresponda.  
  *Archivo: `src/commands/builtin/cd.ts`*

### Bug fixes — UI/UX

- **Taskbar: doble click para enfocar ventana**: Al hacer click en una ventana de la barra de tareas, si estaba detrás de otra, se minimizaba en vez de traerse al frente. Ahora trae al frente inmediatamente; solo minimiza si ya es la ventana activa.  
  *Archivo: `src/components/DesktopTopBar.tsx`*

- **Exit lab recargaba el escenario**: `goHome()` llamaba a `window.history.back()` que causaba un remount del `ScenarioLauncher`, ejecutando `selectScenario()` de nuevo. Eliminado el `history.back()`.  
  *Archivo: `src/store/scenarioStore.ts`*

### Bug fixes — Topología de red

- **RCE como www-data mostraba "Compromised"**: Las misiones 6 (RCE) y 7 (flag) tenían `discoveryLevel: 4`, que activa el banner "Compromised" en el mapa de red. Cambiadas a `discoveryLevel: 3` (Enumerado). Como lab4 no tiene escalada de privilegios, nunca debe mostrar "Compromised".  
  *Archivo: `src/laboratorios/laboratorio04.ts`*

### Tests

- Actualizados tests para reflejar los cambios de estado y comportamiento.  
  *Archivos: `src/hooks/__tests__/useCommandRunner.test.ts`, `src/components/__tests__/DesktopTopBar.test.tsx`, `src/store/__tests__/scenarioStore.test.ts`*

## 2026-07-11

### Landing page — Visual overhaul

- **Hero background**: Reemplazado gradiente radial verde por `back_hero.png` con overlay oscuro (`opacity-60`). Sin glow verde. Padding `pt-10 pb-10 md:pt-12 md:pb-12`.
- **VEGA logo**: Logo en SiteHeader (top-left). Removida imagen duplicada de VEGA en el cuerpo del hero.
- **GOBUSTER_DEMO**: Reemplazada animación de NMAP por gobuster mostrando `/wp-admin` en `AnimatedDesktop`.
- **Password dots + fake creds**: Campo de password con dots animados + credenciales falsas `admin:SSHCREDENTIALS` en `AnimatedDesktop`.
- **AnimatedLabSelect**: Rediseñado para coincidir con LabGrid real (cards blancas, imagen con gradiente + badges hex/diff, tag categoría, nombre completo, missions + START).
- **Cursor position**: Fijo en `x:18 y:30` (sobre la primer card WordPress) en `AnimatedLabSelect`.
- **@keyframes**: Agregados `confettiFall`, `trophyPop`, `fadeInUp` a `AnimatedCompletion`.
- **Uniform height**: Todos los step visuals (`AnimatedLabSelect`, `AnimatedBrowser`, `AnimatedCompletion`) con `min-h-[300px] max-h-[300px]`.
- **Blog image**: Cambiada imagen del artículo de `/cap1.png` a `/newdesktop.png` (en/es).
- **Lab hint2s**: Todos los labs (01-06) cambiados de `nmap -sV <target-ip>` a `nmap -sS -p- --min-rate 5000 <target-ip>`.
- *Archivos: `src/components/LandingPage.tsx`, `src/components/landing/SiteHeader.tsx`, `src/components/landing/constants.ts`, `src/components/AnimatedLabSelect.tsx`, `src/components/AnimatedCompletion.tsx`, `src/components/AnimatedBrowser.tsx`, `src/components/AnimatedDesktop.tsx`, `src/blog/articles.ts`, `src/laboratorios/laboratorio01-06.ts`*

### MSF console — Banners y UX

- **Rabbit banner**: Reemplazado el ASCII art con Unicode roto por el clásico "white rabbit" de The Matrix / Metasploit original.
- **5 banners rotativos**: Todos los códigos ANSI eliminados para que no aparezcan como texto crudo.
- **`options` alias**: Agregado `options` como alias de `show options` en `msfBase.ts`.
- *Archivos: `src/commands/tools/msfconsole.ts`, `src/frameworks/metasploit/orchestrators/msfBase.ts`*

### Bug fixes

- **SSH password duplicado**: Eliminado el string de output del password SSH que se mostraba tanto como output como en el prompt. En `src/commands/index.ts`.
- **Ctrl+C en msfconsole**: No reseteaba el estado interno del executor (`_isolatedMsfState`), por lo que el siguiente comando reactivaba MSF. Creado wrapper `handleSetMsfState` que también llama a `executor.resetMsfState()`.  
  *Archivo: `src/hooks/useCommandRunner.ts`*
- **`exit` no cerraba terminal**: En el prompt bash de la máquina atacante, `exit` ahora dispara `exitTerminal: true` → cierra la ventana de terminal en modo desktop (como bash real). Agregado `exitTerminal` a `CommandResponse` + `onExitTerminal` a `CommandRunnerProps`.  
  *Archivos: `src/types.ts`, `src/commands/builtin/exit.ts`, `src/hooks/useCommandRunner.ts`, `src/components/DesktopTerminal.tsx`*
- **Tests actualizados**: Expectativas de `cmd_exit` corregidas (nuevo mensaje "Cerrando terminal...").  
  *Archivo: `src/commands/builtin/__tests__/exit.test.ts`*
