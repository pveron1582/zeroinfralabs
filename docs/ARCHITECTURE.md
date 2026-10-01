# Arquitectura del Sistema

## Sistema de Validación Universal

**Arquitectura:**
```
Comandos (libres) → Metadata → LabValidator → validationCriteria → Misión completada
```

**Principio:** Los comandos están diseñados con bajo acoplamiento — no conocen los laboratorios. Se pueden modificar y actualizar sin afectar la validación de misiones:

- `discoveredHosts` — arp-scan descubrió máquinas
- `scanResults` — nmap escaneó puertos
- `foundCredentials` — hydra encontró credenciales
- `foundDirectories` — gobuster encontró rutas
- `fileRead` — cat leyó archivos relevantes
- `fileDownloaded` — archivo descargado (ftp get)
- `privesc` — sudo intentó escalada
- `sudoPrivileges` — sudo -l enumeró comandos permitidos
- `sshLogin` — sesión SSH iniciada
- `ftpLogin` — sesión FTP iniciada
- `vulnerabilityFound` — vulnerabilidad detectada
- `exploit` — exploit ejecutado
- `uidChecked` — getuid verificó privilegios
- `ncListener` — netcat listener iniciado
- `blockingCommand` — comando bloqueante ejecutado
- `browserAction` — navegación web (FakeBrowser emite, labValidator valida con targetMachineId)
- `httpRequest` — transacción HTTP capturada (Burp Suite / motor HTTP)

**Beneficios:**
- Comandos 100% libres — Ningún comando conoce los labs
- Labs declarativos — Solo definen `validationCriteria`
- Extensible — Nuevos comandos no requieren modificar labs
- Universal — El mismo validator funciona para todos los labs
- Mantenible — Lógica centralizada en `labValidator.ts`

## Estructura del Proyecto

```
src/
├── commands/                          # Sistema de comandos ejecutables
│   ├── builtin/                       #   Comandos del sistema (ls, cd, cat, sudo, ping, ps…)
│   ├── tools/                         #   Herramientas de pentesting (nmap, hydra, gobuster…)
│   │   └── msfconsole.ts              #     Thin wrapper que delega a frameworks/metasploit/
│   └── index.ts                       #   Registro central que une builtin + tools + shells
│
├── components/                        # Componentes React de UI
│   ├── DesktopTerminal.tsx            #   Escritorio Kali (ventanas, barra de tareas, wallpaper)
│   ├── DesktopTopBar.tsx              #   Barra superior con menú de apps, taskbar, reloj
│   ├── WindowFrame.tsx                #   Marco de ventana (drag, resize, minimizar, cerrar)
│   ├── WallpaperPicker.tsx            #   Selector de fondos de escritorio
│   ├── desktopWallpapers.ts           #   Datos de wallpapers (SVG, colores, grids)
│   ├── Terminal.tsx                   #   Terminal interactiva (input, historial, autocomplete)
│   ├── TerminalPrompt.tsx             #   Prompt dinámico (root@kali, ssh user, ftp>, meterpreter)
│   ├── StreamingOutput.tsx            #   Salida animada línea-por-línea para nmap/hydra/exploit
│   ├── AutocompletePanel.tsx          #   Panel de sugerencias Tab
│   ├── FakeBrowser.tsx                #   Navegador simulado (WordPress, LFI, SQLi)
│   ├── NetworkMap.tsx                 #   Mapa de red con nodos y conexiones
│   ├── MissionPanel.tsx               #   Panel de misiones con pistas progresivas
│   ├── EnumerationPanel.tsx           #   Panel de usuarios/credenciales descubiertas
│   ├── LandingPage.tsx                #   Página de inicio con selección de labs
│   ├── LabGrid.tsx                    #   Grid de laboratorios en landing
│   └── fakesites/                     #   Sitios web simulados por lab
│       ├── WordPressSite.tsx          #     Lab 01 — WordPress vulnerable
│       ├── ConsultancySite.tsx        #     Lab 02 — Consultoría
│       ├── InclusionSIte.tsx          #     Lab 04 — LFI
│       ├── SqlInjectionSite.tsx       #     Lab 06 — SQLi
│       └── CasinoVeoSite.tsx           #     Lab 07 — Burp Suite (CasinoVeo)
│
├── frameworks/                        # Frameworks de simulación
│   ├── metasploit/                    #   Metasploit Framework completo
│   │   ├── core/                      #     Tipos, helpers, base de módulos
│   │   │   ├── msfTypes.ts            #       MsfState, INITIAL_STATE
│   │   │   ├── msfHelpers.ts          #       withState(), basePrompt(), modulePrompt()
│   │   │   ├── msfModules.ts          #       MSF_MODULES[], MODULE_DEFAULTS
│   │   │   ├── ModuleLoader.ts        #       Carga de módulos
│   │   │   └── SessionManager.ts      #       Gestión de sesiones meterpreter
│   │   ├── commands/                  #     Sub-comandos individuales
│   │   │   ├── cmd_use.ts             #       use <module>
│   │   │   ├── cmd_set.ts             #       set RHOSTS 10.0.0.1
│   │   │   ├── cmd_search.ts          #       search eternalblue
│   │   │   ├── cmd_show.ts            #       show options/payloads/exploits
│   │   │   ├── cmd_info.ts            #       info <module>
│   │   │   ├── cmd_back.ts            #       back
│   │   │   ├── cmd_exit.ts            #       exit/quit
│   │   │   ├── cmd_banner.ts          #       banner
│   │   │   ├── cmd_shell.ts           #       shell (meterpreter → cmd.exe)
│   │   │   ├── cmd_getuid.ts          #       getuid
│   │   │   ├── cmd_hashdump.ts        #       hashdump
│   │   │   └── cmd_ps.ts              #       ps
│   │   ├── orchestrators/             #     Orquestadores que encadenan sub-comandos
│   │   │   ├── msfBase.ts             #       help, search, use, back, info, show, set…
│   │   │   ├── msfExploits.ts         #       run/exploit/check (EternalBlue)
│   │   │   ├── msfMeterpreter.ts      #       getuid, sysinfo, shell, hashdump…
│   │   │   ├── msfShell.ts            #       cmd.exe (whoami, dir, ipconfig…)
│   │   │   └── msfContextHelp.ts      #       Help contextual por contexto
│   │   └── modules/                   #     Datos de módulos (exploits, payloads, post)
│   └── shells/                        #   Sesiones interactivas (pila LIFO)
│       ├── ShellManager.ts            #   Singleton con stack de sesiones activas
│       ├── ShellSession.ts            #   Interfaz base ShellSession<T>
│       ├── ssh/                       #   Sesión SSH interactiva
│       ├── ftp/                       #   Sesión FTP interactiva (login, ls, get, quit)
│       └── nc/                        #   Sesión Netcat (listener, connect)
│
├── hooks/                            # Custom React hooks
│   ├── useDesktopWindows.ts          #   Estado local de ventanas (drag, resize, minimize…)
│   ├── useCommandRunner.ts           #   Ejecución de comandos, streaming, prompt, sesiones
│   ├── useKeyboardShortcuts.ts       #   Atajos de teclado, autocomplete, historial
│   └── useTerminalIdentity.ts        #   Identidad SSH (usuario, root, prompt)
│
├── laboratorios/                     # Definición de 8 escenarios (01-08; 07 hidden → 7 visibles)
│   ├── laboratorio01.ts              #   Lab 01 — WordPress (medium)
│   ├── laboratorio02.ts              #   Lab 02 — Web OSINT & SSH (easy)
│   ├── laboratorio03.ts              #   Lab 03 — EternalBlue MS17-010 (easy)
│   ├── laboratorio04.ts              #   Lab 04 — LFI to RCE (medium)
│   ├── laboratorio05.ts              #   Lab 05 — FTP Enum & PrivEsc (medium)
│   ├── laboratorio06.ts              #   Lab 06 — SQL Injection (medium)
│   ├── laboratorio07.ts              #   Lab 07 — Burp Suite (medium, hidden)
│   ├── laboratorio08.ts              #   Lab 08 — EternalBlue + cmd.exe (easy)
│   ├── attackers/                    #   Máquinas atacantes (Kali)
│   └── templates.ts                  #   Plantillas reutilizables
│
├── store/                            # Estado global (Zustand + localStorage)
│   ├── scenarioStore.ts              #   Store principal (escenarios, máquinas, misiones)
│   ├── slices/                       #   5 slices: ui, terminal, scenario, identity, academy
│   ├── selectors.ts                  #   Selectores derivados
│   └── types.ts                      #   Tipos del store
│
├── academy/                          # Sistema de aprendizaje
│   ├── paths.ts                      #   8 paths con metadata y lecciones
│   ├── path-*.ts                     #   Definiciones por path (redes, protocolos, hacking...)
│   └── *-lessons.ts                  #   Lecciones compartidas (linux, windows, bash, python...)
│
├── video/                            # Video-lecciones Remotion
│   └── remotion/compositions/        #   132 composiciones animadas (registradas en Root.tsx)
│
├── fs-models/                        # Filesystems virtuales
│   ├── fs-linux.ts                   #   Sistema de archivos Linux base (/etc, /home, /root…)
│   └── fs-windows.ts                 #   Sistema de archivos Windows (C:\Users, C:\Windows…)
│
├── utils/                            # Utilidades
│   ├── labValidator.ts               #   Validador universal (17 criteria types)
│   ├── users.ts                      #   Parseo /etc/passwd y /etc/group, getCurrentUser()
│   ├── permissions.ts                #   Sistema de permisos Unix (rwx, SUID, sticky)
│   ├── path.ts                       #   Normalización de rutas, resolvePath, SYSTEM_DIRS
│   ├── autocomplete.ts               #   Autocompletado de comandos con contexto MSF
│   ├── network.ts                    #   Cálculos de red (subnet, broadcast, netmask)
│   ├── analytics.ts                  #   Tracking de acciones del usuario
│   ├── networkAlert.ts               #   Alertas de red animadas
│   ├── donationMessage.ts            #   Mensaje de donación post-lab
│   └── environment.ts                #   Variables de entorno (PATH, HOME, USER…)
│
├── i18n/                             # Internacionalización
│   └── translations.ts               #   ES/EN
│
├── blog/                             # Datos de artículos del blog
│   └── articles.ts                   #   Artículos educativos ES/EN
│
├── test/                             # Configuración de tests
│   └── setup.ts                      #   Mocks globales (matchMedia, history, localStorage)
│
└── types/                            # Tipos compartidos por dominio
    ├── command.ts                    #   CommandResponse (16 variantes), CmdResponseBase
    ├── machine.ts                    #   Machine, FileEntry, User, Group
    ├── mission.ts                    #   Mission, ValidationCriteria, MissionCriteriaType (17 tipos)
    ├── academy.ts                    #   AcademyPath, Lesson, AcademySubSection
    └── index.ts                      #   Barrel re-export
```

## Componentes Principales

### Terminal
- Input interactivo con autocompletado (Tab)
- Atajos de teclado (Ctrl+L, Ctrl+U, Ctrl+C)
- Historial de comandos (flechas arriba/abajo)
- Prompt dinámico con directorio actual

### LabValidator
Centralizado en `src/utils/labValidator.ts`. Valida misiones según `validationCriteria`:

```typescript
validationCriteria: {
  type: 'foundCredentials',
  service: 'ssh',
  user: 'john'
}
```

### Store (Zustand)
- Estado global modularizado en 5 slices (`uiSlice`, `terminalSlice`, `scenarioSlice`, `identitySlice`, `academySlice`) en `src/store/slices/`.
- Fachada unificada `useScenarioStore` en `src/store/scenarioStore.ts`.
- Acciones centralizadas como `resetWorkspace()` para reiniciar el workspace de forma atómica.
- **Persistencia Segura**: `partialize` almacena preferencias de UI y progreso Academy (`theme`, `language`, `termColor`, `view`, `completedLessons`, `quizResults`) en `localStorage`. El estado de escenarios, máquinas y credenciales se mantiene en memoria y se reinicia al recargar la página, garantizando que no se guarden credenciales en texto plano.

### CommandResponse (Discriminated Union)
- `CommandResponse` en `src/types/command.ts` está definido como una **Discriminated Union** con 16 variantes fuertemente tipadas (`type: 'foundCredentials' | 'scanResults' | 'fileRead' | ...`), incluyendo `http` para Burp Suite.
- Elimina campos opcionales ambiguos y permite al compilador de TypeScript verificar metadatos de comandos en tiempo de compilación.

### Sistema de Archivos Virtual

**Estructura:** Array de `FileEntry[]` en cada `Machine`. No hay un objeto FileSystem ni sistema de archivos montado — es puramente un array plano que los comandos recorren con `Array.find()`, `Array.filter()`, `Array.some()`.

**Representación de directorios:** Un directorio `/home/` existe si hay un `FileEntry` con `path: '/home/.dir'`. El sufijo `.dir` es el marcador de directorio. Los comandos (`ls`, `cd`, `mkdir`) lo usan para determinar si una ruta es un directorio válido.

```typescript
interface FileEntry {
  path: string;       // "/etc/passwd", "/home/.dir"
  content: string;    // Contenido del archivo
  type: string;       // 'text' | 'hash' | 'binary'
  owner?: string;     // username del dueño (default: 'root')
  group?: string;     // nombre del grupo (default: 'root')
  mode?: number;      // bits de permiso (default: 0o644 files / 0o755 dirs)
}
```

**Creación:** `createFile()` en `src/laboratorios/templates.ts` es la factory central. Cada laboratorio, más los templates base (`fs-linux.ts`, `fs-windows.ts`, `kali.ts`), la usan para construir el filesystem.

### Convención `filesChanged` (snapshot completo)

**Regla:** cuando un comando cambia el árbol, el `CommandResponse` lleva `filesChanged: FileEntry[]` con el **snapshot completo** del FS de la máquina — no una lista de cambios. `responseHandlers.ts` lo pasa a `store.setMachineFiles()`, que **reemplaza** `machine.files` entero:

```typescript
// bien: el árbol completo
return { output, filesChanged: [...machine.files, entry] };
// mal: sólo lo nuevo ⇒ el store queda con 1 archivo tras wget
return { output, filesChanged: [entry] };
```

Tres incumplimientos reales (2026-10-01): `wget` mandaba un delta → 6 archivos quedaban en **1**; `runPipeline` concatenaba los snapshots de los segmentos → 6 paths únicos se aplicaban como **11** entradas; y la redirección pisaba el `filesChanged` del comando → `crontab -e > log` perdía los spool dirs que crontab sólo declaraba.

**Los tres helpers** viven en `src/utils/filesChanged.ts`:

| función | quién la usa | semántica |
|---|---|---|
| `materializeDeclared(machine, declared)` | `executor`, tras cada comando | materializa la declaración sobre el árbol in-place: es lo que hace que la redirección, la validación de misiones y los segmentos de un pipeline vean los cambios de los comandos que **sólo declaran** |
| `upsertFiles(base, changes)` | `wget`, y dentro de `materializeDeclared` | lo declarado pisa lo viejo por path (hashcat reescribiendo su output) |
| `uniqueFiles(files)` | `setMachineFiles` | paths únicos (gana la entrada más nueva); devuelve el mismo array si no había repetidos |

**Dos familias de comandos** conviven a propósito: los que **mutan** `machine.files` (cp, mv, rm, echo, tee…) y declaran el snapshot para notificar, y los que **sólo declaran** (dpkg agregando binarios, `hashcat -o`, el consolidado de cron vía `sleep`). La mutación in-place es la verdad del estado y el `filesChanged` es lo que dispara el re-render de los componentes que pintan el FS (`Explorer`, `EnumerationPanel`, `FakeBrowser`, `DebugPanel`); un delta no sirve porque no puede expresar los borrados de `rm`, y borrar exige mutación in-place (ningún declarante-sin-mutar borra paths).

**Verja:** `src/commands/__tests__/files-changed-contract.test.ts` — (1) quien muta `.files =` declara `filesChanged` (sino la UI queda congelada) y (2) quien declara `filesChanged` referencia `machine.files` en el cuerpo (prueba estática de que es snapshot y no delta), con allowlist por archivo y test "sin muertos". La regla 2 sólo alcanza a ver deltas armados en archivos que jamás nombran el árbol, así que `files-changed-behavior.test.ts` agrega las regresiones de los tres bugs + un barrido genérico de 11 comandos FS que exige conservar el árbol anterior en cada paso.

### Sistema de Permisos Universal

**Transversal:** Aplica a todas las máquinas (Kali y víctimas) sin excepción. Los comandos no necesitan saber a qué máquina pertenecen — las utilidades de permisos operan sobre `FileEntry` y `Machine` genéricos mediante `src/utils/permissions.ts` y `src/utils/fs.ts`.

**`checkPermission()`** (`src/utils/permissions.ts`):

```
checkPermission(machine, file, user, 'read'|'write'|'execute') → boolean
```

Lógica:
1. Si `user` es root (`uid === 0`) → siempre permite
2. Si `user` es el `owner` del archivo → evalúa bits de owner (mode >> 6)
3. Si `user` pertenece al `group` del archivo → evalúa bits de group (mode >> 3)
4. Sino → evalúa bits of others (mode & 7)
5. Si el archivo no tiene `mode` set → defaults permisivos (644/755)

Bits especiales:
- `hasSuid(mode)` → 0o4000, `hasSgid(mode)` → 0o2000, `hasStickyBit(mode)` → 0o1000
- `formatMode(mode, isDir)` → `-rwxr-xr-x`, `drwxrwxrwt`, `-rwsr-xr-x`

**Permisos por defecto en el filesystem base:**

| Ruta | owner | group | mode |
|---|---|---|---|
| `/etc/passwd` | root | root | 644 |
| `/etc/shadow` | root | shadow | 640 |
| `/etc/ssh/sshd_config` | root | root | 600 |
| `/root/` | root | root | 700 |
| `/root/.bashrc` | root | root | 600 |
| `/tmp/` | root | root | 1777 (sticky) |
| `/var/log/*` | root | adm | 640 |
| `/var/www/html/` | www-data | www-data | 755/644 |
| `/usr/bin/*` | root | root | 755 |
| Demás directorios | root | root | 755 |
| Demás archivos | root | root | 644 |

**Comandos que respetan y aplican el sistema de permisos:**
- `ls -l` — muestra permisos, owner y group reales (vía `formatModeFromFile()`)
- `cat` — verifica `canRead()` antes de mostrar contenido
- `cd` — verifica `canExecute()` en el directorio destino
- `mkdir` / `rmdir` — verifica `canCreateInDir()` / `canDeleteInDir()` y sticky bit en `/tmp`
- `chmod` / `chown` / `chgrp` / `umask` — modifican `mode` / `owner` / `group` y máscara
- `touch` / `echo >` / `nano` / `cp` / `mv` / `rm` — verifican permisos de edición/creación/eliminación manteniendo metadatos del dueño
- **Binarios SUID** — ejecutan binarios con elevación de privilegios efectiva al dueño (root) si `mode & 0o4000` está activo

### Determinación de Identidad

Cada terminal tiene un "usuario actual" que determina qué permisos tiene. Esta identidad se calcula con heurística (no hay login/password state):

**Flujo de `getCurrentUser(machine)`** (`src/utils/users.ts`):

```
1. ¿machine.id incluye 'attacker'?           → root
2. ¿privesc_completed?                        → root
3. ¿RCE/reverse-shell credential?             → ese usuario
4. ¿SSH credential verificada?                → ese usuario
5. ¿alguna credential verificada?             → ese usuario
6. ¿puerto SSH escaneado con creds?           → ese usuario
7. fallback                                   → 'user' (uid 1000)
```

En cada paso, si el usuario existe en `/etc/passwd` se devuelve el `User` real con su `uid`/`gid`/groups. Si no existe, se construye uno sintético (uid 1000, gid 1000, home /home/user). El hook `useTerminalIdentity` en el frontend replica esta misma heurística para mostrar el prompt correcto (`root@kali:~#`, `john@target-server:~$`).
