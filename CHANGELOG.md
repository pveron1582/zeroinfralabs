# Changelog

## [Unreleased]

### 🎮 Game Designer — Revisión y Corrección del Laboratorio 05

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
