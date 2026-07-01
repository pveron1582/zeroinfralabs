# Changelog

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
