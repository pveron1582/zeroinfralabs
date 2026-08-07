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
- `custom` — validación especial manejada externamente

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
│       └── SqlInjectionSite.tsx       #     Lab 06 — SQLi
│
├── frameworks/                        # Frameworks de simulación
│   ├── metasploit/                    #   Metasploit Framework completo
│   │   ├── core/                      #     Tipos, helpers, módulos, ContextRegistry
│   │   │   ├── msfTypes.ts            #       MsfState, INITIAL_STATE
│   │   │   ├── msfHelpers.ts          #       withState(), basePrompt(), modulePrompt()
│   │   │   ├── msfModules.ts          #       MSF_MODULES[], MODULE_DEFAULTS
│   │   │   ├── ContextRegistry.ts     #       Registro de comandos por contexto
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
├── laboratorios/                     # Definición de 6 escenarios de laboratorio
│   ├── laboratorio01.ts              #   Lab 01 — WordPress (medium)
│   ├── laboratorio02.ts              #   Lab 02 — Web OSINT & SSH (easy)
│   ├── laboratorio03.ts              #   Lab 03 — EternalBlue MS17-010 (easy)
│   ├── laboratorio04.ts              #   Lab 04 — LFI to RCE (medium)
│   ├── laboratorio05.ts              #   Lab 05 — FTP Enum & PrivEsc (medium)
│   ├── laboratorio06.ts              #   Lab 06 — SQL Injection (medium)
│   ├── attackers/                    #   Máquinas atacantes (Kali)
│   └── templates.ts                  #   Plantillas reutilizables
│
├── store/                            # Estado global (Zustand + localStorage)
│   ├── scenarioStore.ts              #   Store principal (escenarios, máquinas, misiones)
│   ├── selectors.ts                  #   Selectores derivados
│   └── types.ts                      #   Tipos del store
│
├── fs-models/                        # Filesystems virtuales
│   ├── fs-linux.ts                   #   Sistema de archivos Linux base (/etc, /home, /root…)
│   └── fs-windows.ts                 #   Sistema de archivos Windows (C:\Users, C:\Windows…)
│
├── utils/                            # Utilidades
│   ├── labValidator.ts               #   Validador universal (16 criteria types)
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
└── types.ts                          # Tipos globales (Machine, CommandResponse, FileEntry, User, Group)
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
- Estado global modularizado en 4 slices (`uiSlice`, `terminalSlice`, `scenarioSlice`, `identitySlice`) en `src/store/slices/`.
- Fachada unificada `useScenarioStore` en `src/store/scenarioStore.ts`.
- Acciones centralizadas como `resetWorkspace()` para reiniciar el workspace de forma atómica.
- **Persistencia Segura**: `partialize` almacena únicamente preferencias de UI (`theme`, `language`, `termColor`, `view`) en `localStorage`. El estado de escenarios, máquinas y credenciales se mantiene en memoria y se reinicia al recargar la página, garantizando que no se guarden credenciales en texto plano.

### CommandResponse (Discriminated Union)
- `CommandResponse` en `src/types.ts` está definido como una **Discriminated Union** con 15 variantes fuertemente tipadas (`type: 'foundCredentials' | 'scanResults' | 'fileRead' | ...`).
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
