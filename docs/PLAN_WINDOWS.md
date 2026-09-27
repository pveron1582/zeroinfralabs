# PLAN — Soporte Windows: cmd, PowerShell, escritorio RDP y lab EternalBlue

> Derivado de `docs/ROADMAP_TOPOLOGY_SOC.md` FASE D, expandido a pedido:
> pack de comandos **cmd.exe** + **PowerShell** + **escritorio simulado tipo
> Remote Desktop** + primer lab (EternalBlue) como caso de uso.
>
> **Estado:** ✅ W0–W5 listos (2026-09-23).
> ✅ = Listo | ⏳ = En progreso | ⬜ = Pendiente.
> Relaciona: `docs/ROADMAP_TOPOLOGY_SOC.md`, `docs/ARCHITECTURE.md`,
> `src/fs-models/fs-windows.ts` (ya existe), `docs/PERMISSIONS.md`.

---

## Visión

Una máquina Windows jugable de punta a punta:

- FS Windows real (`C:\...`, `createWindowsFileSystem`) — **ya existe**.
- Identidad Windows (usuario local/admin, `NT AUTHORITY\SYSTEM`).
- Terminal **cmd.exe** (`C:\Users\user>`) y sesión **PowerShell**
  (`PS C:\Users\user>`) con la misma metadata de labs que Linux.
- Servicios SMB/RDP como puertos, módulos MSF tipo EternalBlue.
- **Escritorio simulado** (ventana tipo RDP) con Explorador de archivos,
  Símbolo del sistema y panel de seguridad — para "conectarse" por 3389.

Todo simulado: sin binarios/ISOs/logos de Microsoft (uso nominativo, textos
originales — ver sección Legal de `ROADMAP_TOPOLOGY_SOC.md`).

## Decisiones de diseño

1. **Rutas internas:** se guardan como `C:/Users/...` (separador `/`, como
   todo el FS virtual). `src/utils/winPath.ts` normaliza `C:\foo\bar` →
   `C:/foo/bar` y resuelve `..`/`.\\`. `findFile`/permisos no cambian:
   detectan Windows por la forma de la ruta (empieza con letra de unidad).
2. **Identidad Windows:** no hay `/etc/passwd`. Nuevo campo `machine.win`
   (`currentUser`, `isAdmin`, `computerName`, `domain?`) + reglas de
   identidad en el estilo de las `IDENTITY_RULES` de `users.ts`
   (privesc Windows ⇒ admin, igual que `privesc_completed` hoy).
   Administrators ⇒ bypass igual que root en `canRead`/`canWrite`.
3. **Registro de comandos dual:** `COMMANDS` (Linux, actual) +
   `WINDOWS_COMMANDS` nuevo. El executor elige el mapa según la OS de
   `ctx.machine` (`machine_info.os` / nuevo `machine_info.family`).
4. **PowerShell v1 = capa de cmdlets, NO intérprete completo:** tabla de
   cmdlets (`Get-ChildItem`, `Get-Process`...) que mapean a la lógica
   existente (FS, ProcessManager, networkState) y emiten la misma
   metadata. Puente explícito para un mini-intérprete futuro
   (tipo `src/frameworks/python/`) si se necesita `$vars`/objetos.
5. **Escritorio:** componente React propio (patrón de `FakeBrowser` /
   `useDesktopWindows`), no iframe. Se abre con `mstsc` o botón en el
   NetworkMap; usa `uiMode`/`activeApp` del store existente.

---

## W0 — Fundamentos: identidad y rutas Windows ✅

**Objetivo:** que `findFile`, permisos y identidad funcionen sobre `C:\`.

- `src/types/machine.ts`: `MachineInfo.family?: 'linux' | 'windows'` y
  `Machine.win?: { currentUser: string; isAdmin: boolean; computerName: string; domain?: string }` ✅
- `src/utils/winPath.ts`: `normalizeWinPath`, `resolveWinPath`,
  `isWinPath` (detección por `^[A-Za-z]:` o backslash). ✅
- Adaptar `toCleanFilePath`/`readVirtualFile` (`fileRead.ts`) y
  `resolvePath` callers: si `isWinPath`, usar `resolveWinPath`. ✅
- Extender `getCurrentUser` (o `getWindowsUser`) para rama Windows;
  admin bypass en helpers de `permissions.ts`. ✅
  (regla `windows` primera en `IDENTITY_RULES`; uid 0 ⇒ bypass existente
  `uid === 0 || username === 'root'` — sin cambios en permissions.ts)
- Tests: rutas `C:\Users\admin\flag.txt`, identidad admin/no-admin. ✅
  (`src/utils/__tests__/winPath.test.ts`, 26 tests; además el FS Windows
  ahora tiene `owner`/`mode` en archivos sensibles: SAM/config SYSTEM
  0600, flag/notes/config.php del usuario 0600)
- Verificación: `tsc --noEmit` 0 errores; suite 2335/2335 (187 archivos);
  lint sin errores.

## W1 — Pack de comandos cmd.exe ✅

**Archivos:** `src/commands/windows/` (`helpers fs fsWrite session system
admin index`) + tests en `src/commands/windows/__tests__/` (6 archivos,
94 tests).

- MVP implementado (30 comandos + aliases `chdir md rd erase
  traceroute`): `dir cd type copy move del mkdir rmdir echo set cls ver
  hostname whoami ipconfig netstat tasklist taskkill sc reg net
  net user net localgroup schtasks systeminfo ping tracert attrib
  shutdown cmd powershell help`.
- `WINDOWS_COMMANDS` en `src/commands/windows/index.ts`; executor
  (`executor.ts`) selecciona mapa por `machine_info.family === 'windows'`
  con fallback al registro POSIX; `hasCommand` en `buildCommandCtx`
  también consulta el mapa win.
- Prompt: `C:\Users\user>` / `C:\Users\user#` (admin) vía
  `useCommandRunner.basePrompt` + `winDisplay`; `TerminalPrompt` detecta
  prompts win (`isWinPromptText`) y omite el símbolo `└─$`.
- Cwd inicial win = home del usuario (no `/root`); `DEFAULT_ENV` con
  PATH/SHELL/EDITOR win; redirección `>` resuelve rutas win
  (`redirection.ts`); shell del proceso win = `cmd.exe`.
- Metadata: `type` emite `fileRead` (valida flags); permisos reutilizan
  `canRead/canEditFile/canCreateInDir/canDeleteInDir` (SAM/config 0600
  solo admin; `sc stop`/`reg query` exigen uid 0).
- Verificación: `tsc --noEmit` 0 errores; suite **2429/2429 (193
  archivos)**; lint 0 errores (76 warnings advisory).

## W2 — PowerShell (cmdlets MVP) ✅

**Archivo nuevo:** `src/commands/powershell/` (sesión estilo `msfconsole`
con estado + ejecución directa `powershell -Command`).

- Cmdlets MVP (21): `Get-ChildItem Get-Content Set-Content Remove-Item
  Copy-Item New-Item Resolve-Path Get-Process Stop-Process Get-Service
  Start-Service Stop-Service Get-NetTCPConnection Get-NetIPConfiguration
  Test-NetConnection Invoke-WebRequest Get-LocalUser Get-LocalGroupMember
  Get-Help Clear-Host Stop-Computer` + alias en `aliases.ts` (`ls`,
  `cat`, `ps`, `gci`, `dir`, `rm`, `cp`, `help`, `cls`... — solo dentro
  de la sesión PS; no registrados en `WINDOWS_COMMANDS` para no romper
  la regresión `ls` POSIX).
- Parser simple: `Verb-Noun -Param value` / `-Param:value` / switches +
  pipes PS (`splitTopLevel`). **Límites v1 documentados** (sin objetos
  complejos ni `$variables`).
- Sesión: `cmd_powershell` sin args emite `psStateUpdate: { active }`;
  `exit`/`quit` la cierran. Executor intercepta cuando `psState.active`
  (tras check MSF, antes de pipes). Estado en `terminalSlice.psState` +
  aislado por terminal (`isPsActive`/`getPsState`/`resetPsState`).
  Prompt `PS C:\...>` en `useCommandRunner` + `isPsPromptText` en
  `TerminalPrompt`.
- Misma metadata que cmd: `Get-Content` emite `fileRead`; FS usa
  helpers de permisos (`canRead`/`canEditFile`/`canCreateInDir`/
  `canDeleteInDir`).
- Tests: `src/commands/powershell/__tests__/` (parser, session,
  cmdlets) + integración `powershell -Command "Get-Content ..."`.
- Verificación: `tsc --noEmit` 0 errores; suite **2506/2506 (200
  archivos)**; lint 0 errores (76 warnings advisory).

## W3 — Escritorio Windows simulado (RDP) ✅

**Componente nuevo:** `src/components/WindowsDesktop/`.

- Taskbar (reloj, menú inicio simple), apps en ventanas
  (hook propio `useWinDesktopWindows`, no el de Kali):
  - **Explorador de archivos** sobre el FS virtual de la máquina
    (`canRead`/`canExecute`/`winDisplay`, home del usuario win).
  - **Símbolo del sistema** → `Terminal` existente con `machine` =
    objetivo RDP + `terminalId` aislado.
  - **Windows Security** → panel prep SIEM (firewall/creds/privesc).
  - **Propiedades del sistema** → `systeminfo` gráfico.
- Apertura:
  - `mstsc /v:<ip-o-hostname>` (`src/commands/windows/mstsc.ts`; en
    Linux el equivalente es `xrdp`, en `src/commands/tools/xrdp.ts`) →
    emite `desktopAction: { action: 'connect', machineId, ip }` si
    el host es `family === 'windows'` y el 3389 está open.
  - Botón **Abrir escritorio (RDP)** en `NetworkMap` para máquinas
    Windows descubiertas (`openWindowsDesktop` + cierra el mapa).
- `uiMode: 'windows-desktop'` + `rdpMachineId` en `uiSlice`;
  `processCommandResult` consume `desktopAction`; persistencia
  coacciona `windows-desktop` → `desktop` al rehidratar; al salir
  del workspace / cambiar de lab se limpia el RDP huérfano.
- Tests: `mstsc` (5), `processCommandResult` desktopAction (2),
  store RDP (4), RTL `WindowsDesktop` (5), NetworkMap RDP (2).
- Verificación: `tsc --noEmit` 0 errores; suite **2524/2524 (203
  archivos)**; lint 0 errores (76 warnings advisory).

## W4 — Servicios + Lab EternalBlue (caso de uso) ✅

- `COMMON_PORTS`: `445/tcp (smb)`, `3389/tcp (rdp)` con servicios
  reconocidos por `nmap`.
- Módulo MSF simulado: `exploit/windows/smb/ms17_010_eternalblue` →
  emite `exploit` + sesión shell Windows de baja privilegio
  (patrón de los orquestadores existentes en
  `src/frameworks/metasploit/`).
- **winPEAS**: comando/FS (`C:\peas\winPEAS.exe` o script) que lista
  hallazgos (credenciales guardadas, servicios con ruta no escapada,
  token privilegiado) → `foundCredentials`/`fileRead`.
- Privesc estilo **Potato** o servicio misconfigurado (binario en dir
  escribible) → `privescCompleted` (reusar lógica SUID/sudo).
- `src/laboratorios/laboratorio08.ts` con `buildScenario` + learningSteps
  (port scan SMB → explotar EternalBlue → winPEAS → privesc → flag en
  `C:\Users\Administrator\flag.txt`) + test happy-path.
- Entregado: `winpeas` + `potato` en `src/commands/windows/` (metadata
  `foundCredentials`/`fileRead`/`privescCompleted`, desacoplados del lab);
  `laboratorio08.ts` visible en landing (7 labs, network 192.168.60.0/24);
  tests estructural + happy-path (aux → exploit → winPEAS → potato → flag
  gated por 0600). Verificación: `tsc --noEmit` 0 errores; suite
  **2461/2461 (197 archivos)**; lint 0 errores (76 warnings advisory).

## W5 — RDP como servicio + pulido ✅

- `3389`: intento de conexión con credenciales (`xfreerdp`/`mstsc`
  sintético) que abre W3 si hay cred; falla con auth como `ssh`.
- Integración con NetworkMap (icono Windows) y SCENARIOS_META.

**Entregado (2026-09-23):**
- `cmd_mstsc` reescrito con auth one-shot (`/v /u /p`) o interactiva
  (paso usuario → password, estilo `ssh`); valida host + 3389 open;
  falla con `Permission denied, please try again.`
- Sesión `RdpSession` (`src/frameworks/shells/rdp/`) + `RdpState` en
  ShellSession (steps connecting/username/password/connected); store
  `rdpSession` en `terminalSlice`; hook `useRdpSession`; prompt RDP
  en Terminal con `hideValue` en password.
- `desktopAction: connect` en auth correcta → `processCommandResult`
  abre `WindowsDesktop` + limpia `rdpSession` + `onVerifyCredentials`
  si hay `foundCredentials`; `disconnect` al salir.
- NetworkMap: icono monitor para `family === 'windows'`;
  `COMMON_PORTS.rdp()` en lab08; `mstsc` en tools del lab + help.
- Tests: `RdpSession` (8) + `mstsc` (8) reescritos; mocks de store
  actualizados (`setRdpSession`). Verificación: `tsc --noEmit` 0
  errores; lint 0 errores; **2542/2542 (204 archivos)**.

## W6 — Pulido visual + RDP como ventana en Kali ✅

Post-feedback del lab08 (2026-09-23):

1. **Contraste de apps Windows**: `SystemProps`/`SecurityPanel` a tema
   claro Win10 (slate-900 sobre `bg-white`); lista del Explorador con
   fondo slate-900.
2. **Chrome de ventana**: sombra `0_8px_28px`, title bar gradiente
   `#0078d4→#0067b8`, hover close `#e81123` (`WindowHost`).
3. **PowerShell**: fondo `#012456` + texto blanco (`terminalTheme.ts`);
   `Terminal` aplica `PS_BG`/`PS_TEXT` según `isPsActive`/prompt PS.
4. **Logo del top bar**: click abre `ExitConfirm` (ya no cierra a
   ciegas); badge RDP en `WorkspaceTopBar` vía prop `rdpActive`.
5. **RDP como ventana movable** sobre el escritorio Kali:
   - `openWindowsDesktop` en modo `desktop` solo setea `rdpMachineId`
     (Kali sigue montado); en `classic` cae a full-screen
     `windows-desktop` (sin escritorio Kali que aloje la ventana).
   - `useDesktopWindows`: tipo `'rdp'` + `openRdp`/`closeRdp`
     (singleton por `machineId`); drag/resize extraídos a
     `desktopWindowGeometry.ts`.
   - `DesktopTerminal` sincroniza `rdpMachineId` → ventana `WindowFrame`
     que monta `WindowsDesktop`; chips RDP en `DesktopTopBar`;
     desconectar/cerrar limpia el store.
   - `WorkspaceTopBar` muestra badge RDP en ambos layouts.
- Tests: `rdpDesktop` ampliado (8), `openRdp`/`closeRdp` (3),
  `DesktopTopBar` con `rdpWindows`. Verificación: `tsc --noEmit` 0
  errores; lint 0 errores; **2546/2546 (205 archivos)** (incluye
  `ScenarioLauncher` accesos URL scenario-07).

---

## Orden y estimación

Orden recomendado: **W0 → W1 → W4 (lab MVP con solo cmd) → W2 → W3 → W5.**
PowerShell y escritorio pueden paralelizarse después de W1.

| Fase | Qué entrega | Estimado (con IA) |
|---|---|---|
| W0 identidad + rutas | `C:\` funciona con permisos | 1 sesión |
| W1 pack cmd (~35) | Terminal Windows usable | 1–2 sesiones |
| W2 PowerShell MVP | Sesión PS con cmdlets | 1–2 sesiones |
| W3 escritorio RDP | Ventana estilo VM con apps | 1 sesión |
| W4 EternalBlue lab | Lab completo jugable | +4–6 h (módulo MSF + FS + test) |
| W5 RDP servicio | Conexión 3389 → W3 | medio día |

**Total: ~1 semana de trabajo asistido** (no "de un abrir y cerrar de
ojos": W0-W1 son mecánicos pero con tests; W4 es el lab real).

## Riesgos

- **Rutas `C:\`** rompiendo helpers POSIX → mitigación: detección por
  forma de ruta + tests W0 antes de escribir comandos.
- **Scope creep de PowerShell** → v1 acotado a tabla de cmdlets,
  intérprete completo = iteración futura (no bloquea el lab).
- **Registro dual de comandos** → decisión W1 explícita; no duplicar
  lógica (cmd reutiliza helpers Linux: `fs.ts`, `permissions.ts`).

## Siguiente paso concreto

**Plan W0–W5 completo** (2026-09-23). Próximas iteraciones posibles:
intérprete PowerShell completo (sin `$variables` v1), más apps en el
escritorio, o FASE E del `ROADMAP_TOPOLOGY_SOC.md`.
