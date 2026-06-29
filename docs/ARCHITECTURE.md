# Arquitectura del Sistema

## Sistema de Validación Universal

**Arquitectura:**
```
Comandos (libres) → Metadata → LabValidator → validationCriteria → Misión completada
```

**Principio:** Los comandos son "libres" — no conocen los laboratorios. Solo reportan metadata sobre lo que hicieron:

- `discoveredHosts` — arp-scan descubrió máquinas
- `scanResults` — nmap escaneó puertos
- `foundCredentials` — hydra encontró credenciales
- `foundDirectories` — gobuster encontró rutas
- `fileRead` — cat leyó archivos relevantes
- `privesc` — sudo intentó escalada
- `sshLogin` — sesión SSH iniciada
- `ftpLogin` — sesión FTP iniciada
- `vulnerabilityFound` — vulnerabilidad detectada
- `exploit` — exploit ejecutado
- `uidChecked` — getuid verificó privilegios
- `ncListener` — netcat listener iniciado
- `blockingCommand` — comando bloqueante ejecutado

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
│   ├── fs-linux.ts                   #   Sistema de archivos Linux (/etc, /home, /root…)
│   └── fs-windows.ts                 #   Sistema de archivos Windows (C:\Users, C:\Windows…)
│
├── utils/                            # Utilidades
│   ├── labValidator.ts               #   Validador universal (14 criterios de misión)
│   ├── autocomplete.ts               #   Autocompletado de comandos con contexto MSF
│   ├── network.ts                    #   Cálculos de red (subnet, broadcast, netmask)
│   ├── analytics.ts                  #   Tracking de acciones del usuario
│   ├── networkAlert.ts               #   Alertas de red animadas
│   └── donationMessage.ts            #   Mensaje de donación post-lab
│
├── i18n/                             # Internacionalización
│   └── translations.ts               #   ES/EN
│
├── test/                             # Configuración de tests
│   └── setup.ts                      #   Mocks globales (matchMedia, history, localStorage)
│
└── types.ts                          # Tipos globales (Machine, CommandResponse, etc.)
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
- Estado global con persistencia localStorage
- Escenarios, máquinas, misiones
- Sesiones (SSH, FTP, Metasploit)
- Analytics y tracking de actividad

### Sistema de Archivos
- FileSystem virtual para Linux y Windows
- Directorios y archivos realistas
- Permisos y contenido dinámico
