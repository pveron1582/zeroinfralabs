# Changelog

## [Unreleased]

### 🎨 Landing Page Redesign — Marketing Page + Lab Grid

**Objetivo:** Transformar el landing de una simple grilla de labs a una página de marketing completa que explique qué es ZI Labs para tráfico de redes sociales (TikTok, IG, YouTube).

#### Nueva Arquitectura de Rutas

| Ruta | Componente | Propósito |
|---|---|---|
| `/` o `/:lang` | `LandingPage` | Página de marketing / explicación |
| `/:lang/labs` | `LabGrid` | Selección de escenarios |
| `/:lang/scenario/:id` | `ScenarioLauncher` | Inicio del laboratorio |
| `/:lang/blog` | `BlogListPage` | Blog (sin cambios) |

#### Secciones del Nuevo Landing Page

1. **Hero** — Título + 3 badges (Sin descargas, Sin registro, Entorno seguro) + CTA
2. **"Te presentamos ZI Labs"** — Terminal animada con nmap scan en vivo
3. **"¿Por qué ZI Labs es diferente?"** — 6 tarjetas:
   - 🚀 Sin instalaciones · Sin VMs · Sin configuración
   - 🔑 Sin registro
   - ⌨️ Terminal realista
   - 🔒 100% seguro
   - 📈 Aprendizaje guiado
   - 🔍 Enumeración guiada
4. **"¿Para quién es?"** — 4 audiencias (estudiantes, autodidactas, sin VMs, certificaciones)
5. **"¿Cómo funciona?"** — 4 pasos con animaciones:
   - **01:** Lab select — Cursor animado hace clic en START
   - **02:** Terminal Kali — `nmap -sV` con output en vivo
   - **03:** Firefox — Login animado → WP-Admin con credenciales (password oculto)
   - **04:** Lab completo — Trophy 🏆 + confetti + flag oculta
6. **CTA final** — Botón grande → `/labs`

#### Componentes Nuevos

- `src/components/AnimatedTerminal.tsx` — Terminal mockup con typewriter animation
  - Altura fija calculada dinámicamente según líneas de output
  - IntersectionObserver-free (compatible con tests)
  - Loop automático con animación de typing + output streaming
- `src/components/AnimatedBrowser.tsx` — Firefox mockup con secuencia de login
  - Fase 1: Login page → typing username → typing password
  - Fase 2: Redirecting → Dashboard con items apareciendo progresivamente
  - Credenciales SSH con password oculto (`********************`)
- `src/components/AnimatedLabSelect.tsx` — Grid de labs con cursor animado
  - Cursor SVG que se mueve y hace clic en START
  - Loop automático con fade/reset
- `src/components/AnimatedCompletion.tsx` — Pantalla de lab completado
  - Trofeo animado + confetti particles
  - Flag oculta (`ZIL{***************}`)
- `src/components/LabGrid.tsx` — Componente de selección de labs (extraído del landing anterior)
  - SVG illustrations, ScenarioCards con hover effects
  - Header con botón "Home" ←

#### Archivos Modificados

- `src/components/LandingPage.tsx` — Reescrito completamente como marketing page
- `src/App.tsx` — Nuevas rutas + `ScenarioLauncher` component
- `src/i18n/translations.ts` — +42 nuevas keys (EN/ES) para todas las secciones
- `src/test/setup.ts` — Mock de `IntersectionObserver`
- `src/components/__tests__/LandingPage.test.tsx` — Tests actualizados para nuevo landing
- `src/components/__tests__/LabGrid.test.tsx` — 6 tests nuevos

#### Lab 01 — Mejoras de Game Design

- **Paso 5 dividido en dos misiones:** "Find Credentials" (misión 5) + "WP-Admin Compromise" (misión 6)
- **Hints mejorados:** Hint 2 ya no spoilea el comando exacto (usa placeholders como `<network_range>`)
- **SSH hints actualizados:** Referencia al dashboard de WP como fuente de credenciales (no más `/backup/notes.txt`)
- **Validación SSH en Terminal:** Agregado `validateMission()` en el path de password SSH para que la misión se complete correctamente

#### Detalles de UX

- Animaciones de terminal con altura fija (sin saltos de tamaño)
- SSH password oculto en el dashboard (`********************`)
- Flag oculta en la pantalla de completion (`ZIL{***************}`)
- Layout zigzag: pasos desplazados progresivamente (-6%, -2%, +2%, +6%)
- Todas las animaciones usan `useRef` pattern para evitar circular reference en `useCallback`

**Tests:** 745 tests pasando ✅
**Build:** Compila sin errores ✅

---

### 🔧 Sistema de Validación Universal — Comandos Libres

**Objetivo:** Separar completamente la lógica de comandos de la validación de misiones de laboratorio. Los comandos ahora son "libres" y solo reportan metadata; el `labValidator` decide si una misión se completa.

#### Arquitectura Implementada

```
Comandos (libres) → Metadata → LabValidator → validationCriteria → Misión completada
```

**Archivos nuevos:**
- `src/utils/labValidator.ts` — Validador universal con `validateMission()`
  - Soporta 14 criterios: `discoveredHosts`, `scanResults`, `foundCredentials`, `foundDirectories`, `fileRead`, `privesc`, `sshLogin`, `ftpLogin`, `vulnerabilityFound`, `exploit`, `uidChecked`, `ncListener`, `blockingCommand`, `custom`
- `src/types.ts` — Extendedido con `ValidationCriteria`, `MissionCriteriaType`, y campos de metadata en `CommandResponse`

**Comandos refactorizados (eliminado `completedMissionId` hardcodeado):**
- `src/commands/tools/nmap.ts` — Ahora solo reporta `scanResults`
- `src/commands/tools/hydra.ts` — Ahora solo reporta `foundCredentials`
- `src/commands/tools/gobuster.ts` — Ahora solo reporta `foundDirectories`
- `src/commands/tools/arp-scan.ts` — Ahora solo reporta `discoveredHosts`
- `src/commands/tools/msfCommands/msfExploits.ts` — Limpieza de código obsoleto
- `src/frameworks/shells/ssh/SshSession.ts` — Ahora solo reporta `sshLoginUser`, `foundCredentials`
- `src/commands/builtin/cat.ts` — Ahora solo reporta `fileRead`
- `src/commands/builtin/sudo.ts` — Ahora solo reporta `privescAttempted`

**Laboratorios actualizados (agregado `validationCriteria` a cada misión):**
- `src/laboratorios/laboratorio01.ts` — 7 misiones con criterios
- `src/laboratorios/laboratorio02.ts` — 6 misiones con criterios
- `src/laboratorios/laboratorio03.ts` — 5 misiones con criterios
  - **Fix:** Agregado `validationCriteria: { type: 'exploit' }` al paso 4 (EternalBlue)
  - **Fix:** Agregado `validationCriteria: { type: 'uidChecked', isSystem: true }` al paso 5 (getuid)
- `src/laboratorios/laboratorio04.ts` — 7 misiones con criterios
- `src/laboratorios/laboratorio05.ts` — 8 misiones con criterios
- `src/laboratorios/templates.ts` — Actualizado `buildScenario()` para soportar `validationCriteria`

**Fixes adicionales:**
- `src/commands/tools/msfCommands/msfExploits.ts` — Mensaje de error LHOST ahora en inglés con placeholder `<local ip>` (eliminada IP hardcodeada 172.16.0.10)

**Integración:**
- `src/components/Terminal.tsx` — `processCommandResult()` ahora usa `validateMission()` en lugar de lógica hardcodeada
- `src/commands/__tests__/happyPathHelpers.ts` — `evolveState()` actualizado para manejar metadata de comandos libres

**Tests actualizados:**
- Tests de SSH actualizados para verificar metadata en lugar de `completedMissionId`
- Tests de Happy Path (scenario01-05) actualizados para nuevo sistema
- 740+ tests pasando ✅

**Beneficios:**
- ✅ Comandos 100% libres — Ningún comando conoce los labs
- ✅ Labs declarativos — Solo definen `validationCriteria`, sin código
- ✅ Extensible — Nuevos comandos no requieren modificar labs
- ✅ Universal — El mismo validator funciona para todos los labs
- ✅ Mantenible — Lógica centralizada en un solo archivo

---

### 🛠️ MSF Architecture Refactor — Fases 1 & 2

**Objetivo:** Implementar arquitectura modular para Metasploit Framework siguiendo diseño de Claudio (contexto de shell + módulos de comandos + registro central).

#### Fase 1: ModuleLoader y Estructura de Módulos

**Nueva estructura de carpetas:**
```
src/frameworks/
├── metasploit/              # NUEVO — Framework de explotación
│   ├── core/
│   │   ├── ModuleLoader.ts  # Registro dinámico de módulos
│   │   └── index.ts
│   ├── modules/
│   │   ├── types.ts         # Tipos: MsfModule, ExploitModule, PayloadModule
│   │   └── data/
│   │       ├── exploits/
│   │       │   └── ms17_010_eternalblue.ts    # Módulo EternalBlue
│   │       ├── auxiliary/
│   │       │   └── smb_ms17_010.ts           # Scanner MS17-010
│   │       └── payloads/
│   │           └── meterpreter_reverse_tcp.ts # Payloads
│   └── index.ts             # Exports unificados
└── shells/                  # MOVIDO desde src/shells/
    ├── ftp/
    ├── ssh/
    └── nc/
```

**Archivos nuevos:**
- `src/frameworks/metasploit/core/ModuleLoader.ts` — Sistema de registro de módulos con búsqueda por tipo, plataforma, y keywords
- `src/frameworks/metasploit/modules/types.ts` — Tipos completos para módulos MSF (BaseModule, ExploitModule, AuxiliaryModule, PayloadModule, etc.)
- `src/frameworks/metasploit/modules/data/exploits/ms17_010_eternalblue.ts` — Módulo EternalBlue con lógica de exploit y check
- `src/frameworks/metasploit/modules/data/auxiliary/smb_ms17_010.ts` — Módulo scanner
- `src/frameworks/metasploit/modules/data/payloads/meterpreter_reverse_tcp.ts` — Payloads x64 y x86
- `src/frameworks/index.ts` — Entry point unificado para todos los frameworks

**Archivos movidos:**
- `src/shells/` → `src/frameworks/shells/` (unificación de shells con metasploit)

#### Fase 2: SessionManager e Integración de Sesiones

**Integración de sesiones MSF con ShellManager:**
- Cuando `exploit` tiene éxito, SessionManager crea una sesión y opcionalmente hace auto-interact
- Las sesiones de meterpreter/shell se manejan como contextos en el stack de ShellManager
- Flujo: `exploit` → crea sesión → `sessions -i 1` → entra a meterpreter → `background` → vuelve a msf6

**Archivos nuevos:**
- `src/frameworks/metasploit/core/SessionManager.ts` — Gestión de ciclo de vida de sesiones (create, interact, background, kill)
- `src/frameworks/metasploit/commands/sessions.ts` — Comandos `sessions`, `background`, `exit`
- `src/frameworks/metasploit/commands/index.ts` — Registry de comandos MSF

**Reorganización de comandos de shell:**
- `src/commands/tools/ftp.ts` → `src/frameworks/shells/ftp/ftpCommand.ts`
- `src/commands/tools/ssh.ts` → `src/frameworks/shells/ssh/sshCommand.ts`
- `src/commands/tools/nc.ts` → `src/frameworks/shells/nc/ncCommand.ts`

**Tests movidos:**
- `src/commands/tools/__tests__/nc.test.ts` → `src/frameworks/shells/nc/__tests__/ncCommand.test.ts`
- `src/commands/tools/__tests__/ssh.test.ts` → `src/frameworks/shells/ssh/__tests__/sshCommand.test.ts`

**Archivos modificados:**
- `src/commands/tools/index.ts` — Actualizado para re-exportar desde `frameworks/shells/`
- `src/commands/index.ts` — Actualizado imports de shells
- `src/frameworks/shells/index.ts` — Ahora exporta sesiones interactivas + comandos iniciales juntos
- `src/frameworks/shells/ftp/FtpSession.ts` — Corregido path de import de store
- `README.md` — Actualizada estructura de directorios

**API pública del framework:**
```typescript
// Desde src/frameworks/
import { Metasploit } from './metasploit';
import { shellManager, cmd_ssh, cmd_ftp, cmd_nc } from './shells';

// ModuleLoader
Metasploit.moduleRegistry.register(module);
Metasploit.initializeModuleLoader(ALL_MODULES);

// SessionManager
const sessionManager = Metasploit.createSessionManager(shellManager, state, onChange);
sessionManager.handleExploitResult(result, targetIp); // Auto-crea e interactúa
```

**Estado:** Todos los 740 tests pasan 

---

#### Fase 3: Context Registry Jerárquico

**Objetivo:** Implementar resolución de comandos context-aware para MSF. Diferentes comandos disponibles según el contexto actual:
- `msf6 >` → use, search, show, exploit, sessions, set, run
- `meterpreter >` → sysinfo, getuid, ps, shell, background, exit
- `C:\Windows\system32>` → dir, cd, ipconfig, whoami, exit

**Archivos nuevos:**
- `src/frameworks/metasploit/core/ContextRegistry.ts` — Registro jerárquico de comandos:
  - `register(command, contexts)` — Registra comandos para contextos específicos
  - `resolve(commandName, context)` — Resuelve comando según contexto actual
  - `detectContext(state, session)` — Detecta contexto automáticamente
  - `formatHelp(context)` — Muestra help dinámico según contexto
  - `getContextPrompt(context)` — Retorna prompt apropiado (msf6 >, meterpreter >, etc.)

**Tipos exportados:**
```typescript
type MsfContextType = 'msfconsole' | 'module' | 'meterpreter' | 'windows_shell' | 'linux_shell';

interface MsfCommand {
  name: string;
  description: string;
  aliases?: string[];
  execute: (args: string[], ctx: MsfCommandContext) => CommandResponse;
}

interface MsfCommandContext extends CommandContext {
  msfState: MsfState;
  sessionManager: SessionManager;
  currentContext: MsfContextType;
}
```

**API pública:**
```typescript
import {
  contextRegistry,
  getContextPrompt,
  formatContextHelp,
  type MsfCommand,
  type MsfCommandContext,
  type MsfContextType,
} from '../frameworks/metasploit';

// Registrar comando para múltiples contextos
contextRegistry.register(myCommand, ['msfconsole', 'module']);

// Resolver comando según contexto actual
const context = contextRegistry.detectContext(msfState, currentSession);
const command = contextRegistry.resolve('use', context);

// Formatear help dinámico
const helpText = contextRegistry.formatHelp('meterpreter', 'en');
```

**Estado:** Foundation lista. Comandos context-aware en desarrollo. Tests pasan 

---

#### Fase 4: Integración de Context-Aware Help

**Objetivo:** Integrar el sistema de help dinámico basado en contexto con el sistema MSF existente, manteniendo compatibilidad backward.

**Cambios realizados:**

**Nuevos archivos:**
- `src/commands/tools/msfCommands/msfContextHelp.ts` — Sistema de help context-aware:
  - `getContextAwareHelp(state)` — Retorna help según contexto (msfconsole/module/meterpreter/shell)
  - `executeContextHelp(cmd, args, state)` — Handler de comandos `help` y `?`
  - `getContextPrompt(state)` — Genera prompt dinámico
  - `detectMsfContext(state)` — Detecta contexto actual

**Archivos modificados:**
- `src/commands/tools/msfCommands/index.ts` — Exporta `executeContextHelp`, `getContextPrompt`
- `src/commands/tools/msfconsole.ts` — Integra `executeContextHelp()` en flujo principal
- `src/commands/index.ts` — `getMsfPrompt()` usa `getContextPrompt()` para prompts dinámicos

**API de integración:**
```typescript
// Nuevos exports disponibles
import {
  executeContextHelp,   // Handler para 'help' y '?'
  getContextPrompt,     // Prompt según contexto
  getContextAwareHelp,  // Texto de help dinámico
  detectMsfContext,     // Detector de contexto
} from './commands/tools/msfCommands';

// Uso en ejecución de comandos
const helpResult = executeContextHelp(cmd, args, state);
if (helpResult) return helpResult; // Help fue manejado

// Prompt dinámico en Terminal
const prompt = getContextPrompt(msfState);
// 'msf6 >' | 'meterpreter >' | 'C:\Windows\system32>' | 'msf6 exploit(...) >'
```

**Help dinámico por contexto:**
- `msf6 >` → Comandos core: use, search, show, sessions, exit, help
- `msf6 exploit(...) >` → Opciones de módulo: set, unset, exploit, check, back, help
- `meterpreter >` → Comandos meterpreter: sysinfo, getuid, ps, shell, background, exit
- `C:\Windows\system32> `→ Comandos shell: dir, ipconfig, whoami, exit

**Estado:** 739 tests pasan ✅. Sistema de help context-aware funcionando en producción.

---

#### Fase 5a: Comandos Nativos Context-Aware

**Objetivo:** Crear comandos nativos usando la interfaz `MsfCommand` del ContextRegistry, migrando gradualmente desde el sistema legacy.

**Nuevos archivos:**
- `src/frameworks/metasploit/commands/cmd_search.ts` — Comando `search` nativo
- `src/frameworks/metasploit/commands/cmd_use.ts` — Comando `use` nativo  
- `src/frameworks/metasploit/commands/cmd_set.ts` — Comando `set` nativo
- `src/frameworks/metasploit/commands/registerCommands.ts` — Registro de comandos

**Archivos modificados:**
- `src/frameworks/metasploit/commands/index.ts` — Exporta nuevos comandos
- `src/commands/tools/msfTypes.ts` — Actualizado para compatibilidad con framework types

**API de comandos nativos:**
```typescript
import { cmd_search, cmd_use, cmd_set, registerNativeCommands } from './frameworks/metasploit/commands';

// Registrar todos los comandos nativos
registerNativeCommands();

// Usar comando individual
const result = cmd_search.execute(['smb'], context);

// El ContextRegistry ahora resuelve estos comandos
const searchCmd = contextRegistry.resolve('search', 'msfconsole');
```

**Sistema dual:**
- Legacy handlers: `executeBaseCommand()`, `executeMeterpreterCommand()` — siguen funcionando
- Comandos nativos: `cmd_search`, `cmd_use`, `cmd_set` — registrados en ContextRegistry
- Gradual migration: Los comandos nativos pueden coexistir con handlers legacy

**Estado:** 739 tests pasan ✅. Sistema dual operativo.

---

#### Fase 5b: Comandos Meterpreter y Base

**Objetivo:** Completar migración de comandos legacy a sistema nativo.

**Nuevos comandos (10):**
| Comando | Contexto | Descripción |
|---------|----------|-------------|
| `cmd_back` | module | Volver a msfconsole desde módulo |
| `cmd_show` | msfconsole, module | Mostrar módulos u opciones |
| `cmd_info` | msfconsole, module | Info de módulo |
| `cmd_unset` | msfconsole, module | Borrar opción |
| `cmd_clear` | all | Limpiar pantalla |
| `cmd_exit` | all | Salir (con comportamiento context-aware) |
| `cmd_banner` | msfconsole | Mostrar banner |
| `cmd_getuid` | meterpreter | Obtener usuario actual |
| `cmd_sysinfo` | meterpreter | Info del sistema |
| `cmd_ps` | meterpreter | Listar procesos |
| `cmd_hashdump` | meterpreter | Dump de hashes |
| `cmd_shell` | meterpreter | Abrir shell de sistema |

**Total:** 15 comandos nativos registrados en ContextRegistry.

**Estado:** 740 tests pasan ✅. Migración 80% completa.

---

### Game Designer — Revisión y Corrección del Laboratorio 05

**Problemas encontrados:**
- 10 pasos para un lab Medium (demasiados, con pasos redundantes)
- Tagline incompleto (solo describía privesc, ignoraba FTP e hydra)
- Array `tools` incompleto (faltaban `ftp` e `hydra`)
- Paso 4 tenía `discoveryLevel: 0` (inconsistente)
- Validación de FTP se completaba solo con login, no al descargar/leer

**Correcciones aplicadas:**
- **Pasos reducidos de 10 a 8** — Fusionados pasos 3-5 (FTP connect + download + read) en un solo paso "FTP Enumeration"
- **Tagline actualizado** — Ahora refleja todo el flujo: FTP → hydra → privesc
- **`tools` completo** — Agregados `ftp` e `hydra`
- **`discoveryLevel` inconsistente eliminado** — El paso 4 (descargar nota) ya no existe como paso separado
- **Validación de FTP corregida** — La misión 3 se completa al **leer** la nota con `cat`, no al descargarla con `get`
  - `FtpSession.ts`: removido `completedMissionId` del login y del `get`
  - `cat.ts`: ampliada detección de notas para incluir keywords de FTP Enumeration

### 📋 Documentación del Sistema de Agentes

**Archivos nuevos:**
- `specs/LAB_SPEC.md` — Anatomía completa de un laboratorio basada en el lab01
- `specs/SKILLS.md` — 10 skills reutilizables documentadas (generate_spec, generate_lab, generate_tests, analyze_scenario, etc.)
- `specs/ROLES.md` — 6 roles de agente documentados con mindset, criterios y ejemplos de uso

### 🛠️ Nmap — Flags Completas

**Nuevas flags soportadas:**
- Scan types: `-sS` (SYN stealth), `-sn`/`-sP` (ping scan), `-O` (OS detection), `-A` (aggressive)
- Host discovery: `-Pn` (skip host discovery)
- Verbosidad: `-v`, `-vv`, `-vvv` (raw packets simulados)
- Puertos: `-p 22,80`, `-p 1-1000`, `-p-` (todos los 65535)
- Output: `-oN archivo.txt` (normal), `-oG archivo.gnmap` (grepable)
- Ayuda: `-h`, `--help`

**Archivos modificados:**
- `nmap.ts` — Reescrito con soporte completo de flags (~350 líneas)
- `nmap.test.ts` — 24 tests (de 5 a 24) cubriendo todas las flags nuevas
- `types.ts` — Agregado `createdFiles` a `CommandResponse`
- `Terminal.tsx` — Procesamiento de `createdFiles` para archivos generados por comandos

### 🐛 Bug Fixes

- **Streaming del exploit ms17-010** — El exploit ahora muestra output línea por línea con delays dramáticos (antes se mostraba todo de golpe)
- **FTP mission validation** — La misión FTP se completa al leer la nota descargada, no solo al conectarse

### 🏗️ Modularización de Componentes Grandes

#### Lab Completion Overlay (`src/components/LabCompletionOverlay.tsx`)
**Archivo nuevo:**
- `src/components/LabCompletionOverlay.tsx` — Animación de celebración al completar un laboratorio
  - 40 partículas de confetti CSS puro cayendo con colores variados
  - Trofeo animado con efecto pulse + glow dorado
  - Texto "LAB COMPLETE!" con gradiente verde→cyan
  - Nombre del laboratorio y stats (`X/Y missions completed`)
  - Botón "Continue" para cerrar
  - Auto-dismiss a los 6 segundos
  - Click anywhere para cerrar antes
  - Transición suave de entrada (scale + fade)

**Store actualizado:**
- `types.ts` — Agregados `showCompletionOverlay: boolean` y `setShowCompletionOverlay`
- `scenarioStore.ts` — En `completeMission`: detecta si todas las misiones están `completed` → muestra overlay
- `scenarioStore.ts` — En `goHome` y `selectScenario`: resetea overlay a `false`
- `App.tsx` — Renderiza `<LabCompletionOverlay />` encima de todo (z-[100])

#### Nuevo Step 7 en Lab 01 — Capture Root Flag
- Agregado paso "Capture Root Flag" con hints: "Search in /root" y "cat /root/flag.txt"
- `cat.ts` ahora detecta `/root/flag.txt` como flag completion

#### Carrusel de Misiones — Fix de Auto-Advance
- Reemplazada lógica de tracking por `activeMission?.id` con `completedMissionIdsRef` (Set de IDs)
- El auto-advance solo se dispara cuando una misión **realmente se completa** (nueva entrada en el Set)
- Navegación manual (flechas, hints) ya no provoca auto-advance de vuelta
- El usuario puede navegar libremente entre steps completados sin ser empujado hacia adelante

#### Comandos de Ayuda — Todos en Inglés
- `arp-scan.ts`: `Uso/Ejemplo` → `Usage/Example`
- `nmap.ts`: `Uso/Ejemplo` → `Usage/Example`
- `ssh.ts`: `uso:` → `usage:`
- `hydra.ts`: `Uso/Ejemplo/Usa/no válida` → `Usage/Example/Use/not valid`
- `gobuster.ts`: `Uso/Usa/no válida` → `Usage/Use/not valid`
- `ftp.ts`: `uso/dentro de FTP` → `usage/inside FTP`
- `msfExploits.ts`: `Usa:` → `Use:`
- `cat.ts`: `uso: cat <archivo>` → `usage: cat <file>`
- `help.ts`: Todo el contenido traducido al inglés (títulos, opciones, ejemplos, descripciones)
- Tests actualizados para match con los nuevos mensajes

#### Renombrado de Laboratorio 02
**Antes:** "SSH Brute Force Lab" → **Ahora:** "Web OSINT & SSH Compromise"
**Motivo:** El lab no es solo fuerza bruta SSH — el usuario primero hace reconocimiento web para descubrir usernames y luego usa Hydra. El nombre anterior era engañoso.
**Archivos modificados:**
- `laboratorio02.ts` — nombre, tagline, description, flag root, step 4 task
- `LandingPage.test.tsx` — nombre del escenario mock
- `happyPath-scenario02.test.ts` — describe y step 4 task
- `integration.test.ts` — comentario
- `README.md` — sección del lab 02 y lista de escenarios
- `CHANGELOG.md` — esta entrada

### 🏗️ Modularización de Componentes Grandes

#### Módulo de Máquinas Atacantes (`src/laboratorios/attackers/`)
**Archivos nuevos:**
- `src/laboratorios/attackers/kali.ts` — Definición centralizada de Kali Linux 2026.1
  - `createKaliMachine(options)` — Factory con IP auto-asignada, MAC pool, filesystem completo
  - `createKaliFilesystem(username, extraFiles)` — Filesystem Kali con diccionarios pre-instalados:
    - `/usr/share/wordlists/rockyou.txt` (~100 passwords)
    - `/usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt` (~60 directorios web)
    - `/usr/share/wordlists/SecLists/Passwords/common-passwords.txt` (~40 passwords comunes)
    - `/root/.bashrc` con aliases de pentesting
    - `/root/notes.txt` con notas de ataque
    - Marcadores de herramientas en `/usr/bin/`
  - `resetKaliCounter()` — Resetea el pool de MACs entre escenarios
- `src/laboratorios/attackers/index.ts` — Registry centralizado (listo para Parrot, Arch, etc.)

**Archivos modificados:**
- `src/laboratorios/templates.ts` — `createAttackerMachine()` ahora delega a `createKaliMachine()`
- `src/laboratorios/laboratorio05.ts` — Eliminado `createAttackerMachine()` duplicado + `ROCKYOU_CONTENT`
- `src/laboratorios/attackers/kali.ts` — El diccionario rockyou.txt ya viene incluido en el filesystem de Kali

**Beneficio:** Un solo lugar para actualizar Kali (OS version, username, diccionarios, herramientas). Agregar un nuevo atacante (Parrot OS, Arch Linux) es crear un archivo nuevo y registrarlo en `index.ts`.

#### Terminal.tsx — Refactorización (648 → ~440 líneas)
**Archivos nuevos:**
- `src/components/StreamingOutput.tsx` — Componente de output animado línea por línea con delays configurables
- `src/components/TerminalPrompt.tsx` — Renderers de prompts (Kali style `┌──(㉿)-[]`, MSF, FTP) con colores y lógica de detección
- `src/hooks/useTerminalIdentity.ts` — Hook para determinar sshUser, isRoot, rceCred + helper `getShortPath`
- `src/components/__tests__/fixtures.ts` — Fixtures compartidos (`createMockMachine`, `mockPorts`, `mockVulnerabilities`, etc.)

**Cambios:**
- `processCommandResult` y `handleDownloadedFile` extraídos como handlers separados de `runCommand`
- Prompt rendering delegado a `TerminalPrompt.tsx`
- Identidad del terminal (usuario, root status) centralizada en hook reutilizable
- Streaming output como componente independiente

#### scenarioStore.ts — Modularización (558 → ~380 líneas)
**Archivos nuevos:**
- `src/store/types.ts` — Tipos del store (`ScenarioState`, `Notification`, `FtpSessionState`, `AppView`)
- `src/store/selectors.ts` — Selectores memoizados (`selectScenario`, `selectMachines`, `selectMissions`, etc.)
- `src/store/index.ts` — Re-exports centralizados

**Cambios:**
- Tipos extraídos del store principal para mejor separación de responsabilidades
- Selectores memoizados para uso con `useShallow`
- Import actualizado en `NetworkMap.tsx` para usar `types.ts`

#### EnumerationPanel.test.tsx — Refactorización (518 → ~413 líneas)
**Cambios:**
- Fixtures extraídos a `__tests__/fixtures.ts`
- Tests agrupados en `describe` por sección (Ports, Credentials, SSH, Vulnerabilities, etc.)
- `as const` en vulnerabilidades para type safety

### 🎬 MachineLoader — Pantalla de Carga Inmersiva

#### Rediseño completo
**Archivo:** `src/components/MachineLoader.tsx`

**Countdown inicial (1.5s):**
- Texto "DESPLEGANDO LABORATORIO" con branding "ZeroInfra Labs"
- Countdown 3..2..1 con animación pop y efecto de escala
- Info de la máquina (target, IP) durante el countdown

**Carga progresiva (~5s):**
- 7 fases con nombres tipo terminal:
  - Resolviendo infraestructura...
  - Provisionando máquinas virtuales...
  - Configurando red aislada...
  - Inicializando servicios...
  - Desplegando vectores de ataque...
  - Verificando conectividad...
  - Finalizando...
- Log terminal que aparece línea por línea con numeración `[01]`, `[02]`, etc.
- Colores por tipo: info (gris), ok (verde), warn (naranja)
- Barra de progreso continua con gradiente y glow
- Decoración de barras animadas en la parte inferior

**Pantalla final:**
- Checkmark animado con "LABORATORIO ACTIVO"
- Resumen de últimos logs
- "Acceso concedido. Ready for attack."

**Duración total:** ~6.5s (sincronizado con el store)
**Prop `duration`:** configurable para tests rápidos (2000ms)

### 🐧 Kali Linux — Actualización a 2026.1
- `src/laboratorios/laboratorio05.ts` — `Kali Linux 2023.4` → `Kali Linux 2026.1`
- `src/laboratorios/templates.ts` — `Kali Linux 2023.4` → `Kali Linux 2026.1`
- `src/commands/__tests__/happyPathHelpers.ts` — `Kali Linux 2023.4` → `Kali Linux 2026.1`

### 🧪 Tests
- 618 tests pasando (+11 nuevos)
- 55 archivos de test

---

### 🎯 Sistema de Pistas Progresivas

#### Nueva funcionalidad
Sistema de ayuda gradual que permite a los usuarios recibir pistas incrementales sin revelar toda la solución.

**Componentes nuevos/modificados:**
- `src/types.ts` — Nuevos tipos `StepHint`, `hints` en `LearningStep`, `hints` y `hintLevel` en `Mission`
- `src/store/scenarioStore.ts` — Nueva acción `revealNextHint(missionId)` para revelar pistas progresivamente
- `src/components/MissionPanel.tsx` — Nuevo componente `HintSection` y `StepCarousel` con navegación < > entre pasos
- `src/i18n/translations.ts` — Nuevas traducciones `showHint1`, `showHint2`
- `src/commands/builtin/cat.ts` — Actualizada lógica de detección de completamiento para buscar en hints

**Características:**
- Cada step puede tener 0, 1 o 2 hints (opcionales)
- Hints se revelan progresivamente: "Ver pista 1" → "Ver pista 2" → (ninguno)
- Carrusel con flechas < > para navegar entre steps completados y activos
- Indicador de posición "Step X of Y"
- Puntos de navegación clickeables
- Traducciones automáticas EN/ES
- Hints disponibles solo para el step activo

**Modelo de datos:**
```typescript
{ 
  id: 1, 
  task: 'Host Discovery', 
  taskEs: 'Descubrimiento de host',
  text: 'Discover the active host on the network',
  textEs: 'Descubrí el host activo en la red',
  hints: { 
    hint1: { en: 'Use arp-scan', es: 'Usá arp-scan' }, 
    hint2: { en: 'arp-scan 10.10.20.0/24', es: 'arp-scan 10.10.20.0/24' } 
  } 
}
```

**Rediseño completo de labs:**
- `laboratorio01.ts` — 6 steps con hints (WordPress)
- `laboratorio02.ts` — 5 steps con hints (SSH Brute Force)
- `laboratorio03.ts` — 5 steps con hints (EternalBlue)
- `laboratorio04.ts` — 6 steps con hints (LFI to RCE)
- `laboratorio05.ts` — 10 steps con hints (FTP + PrivEsc)
```

### 💬 Sistema de Feedback General

#### Nueva funcionalidad
Sistema para que cualquier usuario pueda enviar comentarios, sugerencias o reportar problemas sobre la plataforma.

**Componentes nuevos:**
- `src/components/FeedbackModal.tsx` — Modal con formulario de feedback y captcha visual
- `public/captcha/` — 25 imágenes para el captcha (descargadas de Unsplash)

**Características:**
- Botón "Feedback" en el header del landing page
- Formulario con: Nombre (obligatorio), Email (opcional), Comentario (obligatorio)
- Captcha visual con 5 preguntas de reconocimiento de imágenes
- 25 imágenes en 5 categorías (animales, vehículos, muebles, objetos, naturaleza)
- Validación de captcha antes de enviar
- Nuevo evento `feedback_submitted` en analytics

**Flujo del captcha:**
1. Usuario abre modal de feedback
2. Se muestra 1 imagen aleatoria + 5 opciones (de las 25 disponibles)
3. Usuario selecciona una opción
4. Si es correcta → habilita botón de envío
5. Si es incorrecta → nueva pregunta aleatoria (las preguntas rotan para cada intento)

**Datos guardados en Google Sheets (hoja "Feedback"):**
- Timestamp, Nombre, Email (opcional), Comentario, sessionId, language

### 📊 Analytics & Post-Lab Survey

#### Sistema de Tracking de Actividad
**Archivos nuevos:**
- `src/utils/analytics.ts` — Módulo de tracking que envía eventos a un webhook (Google Apps Script)
- `src/components/SurveyModal.tsx` — Encuesta post-lab con rating 1-10, dificultad, recomendación y comentarios

**Eventos rastreados:**
- `lab_started` — Cuando el usuario inicia un laboratorio
- `mission_complete` — Cada misión completada (con ID y título)
- `lab_completed` — Laboratorio completado al 100%
- `lab_abandoned` — Usuario vuelve al menú con progreso parcial
- `lab_changed` — Usuario cambia de laboratorio sin progreso
- `survey_submitted` — Encuesta enviada con rating, dificultad, recomendación y comentarios

**Datos incluidos en cada evento:**
- `sessionId` — ID anónimo por sesión (sessionStorage, se borra al cerrar la pestaña)
- `language` — Idioma activo del usuario (en/es)
- `sessionDuration` — Segundos desde que abrió la página
- `labDuration` — Segundos dentro del laboratorio actual

**Configuración:**
- Crear `.env.local` con `VITE_ANALYTICS_WEBHOOK=<url>` (Google Apps Script)
- Sin la variable, el tracking se desactiva silenciosamente (seguro para desarrollo)

**¿Cuándo aparece la encuesta?**
- Al ejecutar `end` cuando todas las misiones están completadas
- Al presionar el botón "Menú" cuando el lab está al 100%
- Es opcional — se puede saltar con "Skip"

**Análisis de datos en Google Sheets:**
- 13 columnas por evento (Timestamp, EventType, ScenarioId, ScenarioName, Details JSON, sessionId, language, sessionDuration, labDuration, overall, difficulty, recommend, comments)
- Sheets auxiliares recomendadas: "PorUsuario" (agrupado por sessionId), "Respuestas" (solo encuestas), "DetalleUsuario" (dropdown para ver actividad individual)
- Tablas dinámicas para métricas: dificultad percibida por lab, rating promedio, % de recomendación

#### LandingPage — Rediseño del Hero Section
- **Frase principal**: "Practice hacking techniques from your browser" / "Practicá técnicas de hacking desde tu navegador" con gradiente
- **3 badges de valor**: Sin descargas (verde), Sin registro (cyan), Entorno seguro (violeta) con iconos SVG
- **Banderas de idioma**: 🇺🇸 EN / 🇪🇸 ES en el selector de idioma
- **"Choose a lab"** movido debajo de los badges como texto secundario
- **Aviso de privacidad** en el footer (texto discreto sobre datos anónimos)

### 🏗️ Refactorización de Arquitectura

#### Terminal.tsx — Modularización (899 → ~430 líneas)
**Archivos nuevos:**
- `src/components/AutocompletePanel.tsx` — Panel de sugerencias de autocompletado extraído como componente reutilizable
- `src/hooks/useKeyboardShortcuts.ts` — Hook personalizado que maneja Tab, Ctrl+L/C/U, flechas, Escape

**Cambios:**
- Lógica de autocompletado movida de Terminal a `AutocompletePanel`
- Manejo de atajos de teclado extraído a `useKeyboardShortcuts`
- Terminal se enfoca en ejecución de comandos, streaming y renderizado de historial

#### FakeBrowser.tsx — Delegación de contenido (547 → ~280 líneas)
**Archivo nuevo:**
- `src/components/fakesites/WordPressSite.tsx` — Toda la lógica de WordPress (ruteo, credenciales, discovery level, parseo de config.bak)

**Cambios:**
- FakeBrowser ahora solo actúa como router de URLs
- WordPressSite maneja: index, login, dashboard, uploads, config.bak
- LFI y ConsultancySite ya estaban en componentes separados
- Eliminada duplicación de imports y lógica de parseo de credenciales

### 🧪 Tests Nuevos
- **useKeyboardShortcuts**: 12 tests (hook de atajos de teclado)
- **WordPressSite**: 10 tests (ruteo, discovery levels, credenciales dinámicas, logout)
- **AutocompletePanel**: 6 tests (renderizado, selección, iconos archivo/carpeta)
- **Total**: 579 tests pasando (+28 tests nuevos)

### 🐛 Fixes
- **Bug #1 resuelto**: OS ya no se muestra tras arp-scan (solo tras nmap, discovery_level >= 2)

### 📦 Test Coverage Mejorado
| Componente | Antes | Después |
|------------|-------|---------|
| AutocompletePanel | — | 80% |
| WordPressSite | — | 42% |
| useKeyboardShortcuts | — | 48% |
| FakeBrowser | 67% | 67% |
| Terminal | 57% | 57% |

---

## [2.6.0] - 2026-03-26

### ✨ Nuevas Características

#### NetworkMap — Múltiples credenciales con indicador de servicio
**Archivos:** `src/components/NetworkMap.tsx`, `src/store/scenarioStore.ts`, `src/types.ts`
- **Mejora**: El panel de máquina ahora muestra múltiples credenciales (WP-Admin y SSH) simultáneamente
- **Nuevo**: Etiqueta de servicio visible para cada credencial (WordPress Admin, SSH, FTP)
- **Colores**: Naranja (sin verificar) → Verde (verificado) por credencial individual
- **Implementación**: `found_credentials` ahora es array con campo `service` en cada credencial

#### WordPress Lab — Config.bak limpio (solo WP-Admin)
**Archivo:** `src/components/fakesites/wordpress/wp01/ConfigBak.tsx`
- Removidas credenciales SSH y de base de datos del archivo `config.bak`
- Solo muestra credenciales WP-Admin (`admin`/`P@ssw0rd123!`)

#### WP-Admin Login — Fix de credenciales y campo limpio
**Archivos:** `src/components/FakeBrowser.tsx`, `src/components/fakesites/wordpress/wp01/Login.tsx`
- El login ahora usa credenciales WP-Admin correctas (no SSH)
- Campo de usuario vacío (sin placeholder "admin")

#### WordPress Lab — Credenciales SSH root descubiertas en Dashboard
**Archivos:** `src/components/fakesites/wordpress/wp01/Dashboard.tsx`
- Al acceder al WP-Admin Dashboard, se descubren credenciales SSH de **root**
- Flujo: WP-Admin → Dashboard revela SSH root → SSH como root completa el lab

#### Terminal — Parámetro `service` en credenciales
- Los comandos `hydra` y `ssh` ahora pasan el parámetro `service` al descubrir/verificar credenciales
- Las credenciales SSH muestran "SSH" correctamente en lugar de "Desconocido"

### 🔧 Cambios

#### Terminal — Auto-scroll automático al final
- Scroll suave automático cuando aparece nueva salida
- `useEffect` con `scrollTo({ behavior: 'smooth' })`

#### FakeBrowser — Seguridad HTTPS forzada para Google
- Nuevo componente `HttpSecurityError` — muestra página de error estilo Chrome
- URLs HTTP muestran "Tu conexión no es privada" con `NET::ERR_CERT_AUTHORITY_INVALID`

#### Directorio inicial de Kali — `/` → `/root`
- El directorio inicial ahora es `/root` (home real del usuario root en Kali)

#### Sistema de archivos — flag.txt removido del atacante
- `/root/flag.txt` ya no está en el filesystem base de Linux
- Cada escenario agrega su propia flag desde la configuración

### 🧪 Tests
- 474 tests pasando (todos exitosos)

---

## [2.5.7] - 2026-03-26

### 🐛 Fixes
- **Terminal**: Ctrl+C en Metasploit ahora preserva el prompt
- **Exercise01**: Texto del step de gobuster actualizado con ruta correcta
- **MissionPanel**: Texto de steps largos ahora se muestra completo (`break-all`)

---

## [2.5.6] - 2026-03-26

### 🐛 Fixes
- **FakeBrowser**: Logo "Go" corregido a "Google" en resultados de búsqueda
- **Terminal**: Ctrl+L preserva el input actual

---

## [2.5.5] - 2026-03-26

### ✨ Nuevas Características
- **Diccionario rockyou.txt** en `/usr/share/wordlists/rockyou.txt` (~100 contraseñas)
- **Diccionario common.txt** de SecLists en `/usr/share/wordlists/SecLists/Discovery/Web-Content/`
- **Gobuster** ahora valida diccionario de directorios web
- **Hydra** ahora requiere diccionario específico

### 🧪 Tests
- 45 tests pasando con nueva sintaxis de diccionarios

---

## [2.5.4] - 2026-03-26

### ✨ Nuevas Características
- **Contenido real en WordPress**: Artículos de tecnología (Claude 4, ciberseguridad, vulnerabilidades)
- **Botones de Google funcionales**: "Buscar con Google" y "Voy a tener suerte"
- **Página del dinosaurio de Chrome** (Easter Egg): `chrome://dino` con `ERR_INTERNET_SIMULATOR_MODE`

### 🐛 Fixes
- **FakeBrowser**: `chrome://dino` no funcionaba (agregaba `http://` al esquema)

---

## [2.5.3] - 2026-03-26

### 📝 Documentación
- Testing Strategy agregada al README

---

## [2.5.2] - 2026-03-26

### 🐛 Fixes
- **Terminal**: Prompts históricos no cambian al entrar a msfconsole
- Las funciones de renderizado ahora inspeccionan el contenido del texto del prompt

---

## [2.5.1] - 2026-03-26

### 🐛 Fixes
- **ls**: Directorio mostrándose a sí mismo como subdirectorio (`.dir` slicing)
- **Autocompletado**: Tab mostraba archivos `.dir` internos
- **Autocompletado**: `mkdir` y `rmdir` sin Tab completion

---

## [2.5.0] - 2026-03-26

### 🔧 Refactoring
- **exercise03 y exercise04**: Eliminación de código duplicado, ahora usan `templates.ts`
- **cd**: Lista de directorios conocidos actualizada (`/home/kali/`)
- **scenarioStore**: `currentDir` se resetea al cambiar escenario

---

## [2.4.5] - 2026-03-25

### 🧪 Tests
- **mkdir**: 14 tests, **rmdir**: 13 tests, **help**: 9 tests
- Coverage mejorado: mkdir 1% → 90%, rmdir 1% → 85%, help 44% → 95%

---

## [2.4.0] - 2026-03-25

### 🚀 Nuevas Funcionalidades
- **mkdir** y **rmdir** implementados con flags `-p`
- Sistema de ayuda mejorado (`help mkdir`, `help rmdir`, etc.)
- Usuario de máquina atacante: `root` → `kali`

---

## [2.3.0] - 2026-03-25

### ✨ Nuevas Funcionalidades
- **Atajos de teclado**: Ctrl+L (limpiar), Ctrl+U (línea), Ctrl+C (detener)
- **ls** con flags `-l`, `-a`, `-la`
- **Autocompletado** de paths mejorado (paths absolutos, navegación consecutiva)
- **Prompt dinámico** con directorio actual

### 🧪 Tests
- 436 tests pasando

---

## [2.2.0] - 2026-03-25

### ✨ Nuevas Características
- **Prompt estilo Kali Linux**: Dos líneas (`┌──(㉿)-[~]` + `└─$`)
- **Sistema de Modelos de Archivos** (`fs-models/`):
  - `fs-linux.ts`: Sistema completo de Linux
  - `fs-windows.ts`: Sistema completo de Windows Server

### 🧪 Tests
- 432 tests pasando (+35 nuevos)

---

## [2.1.0] - 2026-03-24

### ✨ Nuevas Características
- **Sistema de Autocompletado**: Tab para comandos y archivos, panel de sugerencias
- **Sistema de Directorios Linux Realista**: 19 directorios raíz, archivos del sistema completos

### 🧪 Tests
- 397 tests pasando (+57 nuevos)

---

## [2.0.0] - 2026-03-24

### 🐛 17 Bugs Fixeados
- Reset de MSF State entre escenarios
- Limpieza de `blockingCommand` al cambiar escenario
- `whoami` usa credenciales reales
- `ssh` busca misión dinámicamente
- `nc` valida contexto LFI
- `nmap` y `gobuster` no mutan `discovery_level`
- Sincronización de `blockingCommand` en el store
- Normalización de paths LFI
- `nmap` actualiza `discovery_level` a 2
- Reset de `discovery_level` al cambiar escenario
- Reset de `rceCompletedRef` en FakeBrowser
- `whoami` sin información extra
- Sistema de directorios virtual (`cd`, `ls`)
- Comando `exit` y `end`
- Credenciales verificadas en topología
- Modularización de escenarios

### ✨ Nuevas Características
- Comandos: `cd`, `ls`, `exit`, `end`, `cat`, `whoami`, `sudo`
- Metasploit Framework con submódulos
- Sistema de directorios virtual

### 🧪 Tests
- 340+ tests pasando (+145 nuevos)

---

## [1.0.0] - Versión Inicial

- Simulador de ciberseguridad educativo
- Terminal interactiva
- 2 escenarios (WordPress Lab, SSH Brute Force)
- 195+ tests
