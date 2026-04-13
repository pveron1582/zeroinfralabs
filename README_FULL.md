# ZeroInfra Labs — Simulador de Pentesting

## 📖 Descripción del Proyecto

**ZeroInfra Labs** (o **ZI Labs**) es un simulador interactivo de terminal para aprender **ciberseguridad ofensiva** de forma práctica. Es una aplicación web moderna que simula un entorno de pentesting donde los usuarios pueden ejecutar comandos reales en máquinas virtuales (atacante y objetivos) y aprender sobre:

- **Reconocimiento de red** (ARP-Scan, Nmap)
- **Enumeración web** (Gobuster)
- **Acceso remoto** (SSH, Hydra)
- **Explotación con Metasploit Framework**
- **Vulnerabilidades web** (LFI, RCE via PHP)
- **Networking** (Netcat listeners para reverse shells)
- **Análisis forense** (lectura de archivos, permisos, etc)
- **OSINT Básico** (Reconocimiento en sitios web para recolectar información de empleados)

El proyecto está diseñado como un **simulador educativo** con misiones progresivas que guían al usuario a través de escenarios realistas de laboratorios de ciberseguridad.

### 🎯 Características Principales

- **Auto-scroll de terminal** — Nueva salida siempre visible al final
- **HTTPS forzado para Google** — HTTP muestra error de seguridad
- **Directorio inicial /root** — Home real del usuario root en Kali
- **Flag.txt scenario-specific** — Agregado desde escenario de víctima
- **Botones de Google funcionales** - "Buscar con Google" y "Voy a tener suerte" con Easter egg del dinosaurio 🦖
- **Terminal interactiva** - Emula una shell Linux con comandos funcionales
- **Atajos de teclado estándar** - Ctrl+L (limpiar), Ctrl+U (línea), Ctrl+C (detener)
- **Sistema de archivos completo** - Comandos `ls` y `cd` con flags correctos (-l, -a, -la)
- **Autocompletado inteligente** - Navegación con Tab que mantiene paths y barras diagonales
- **Prompt dinámico** - Muestra directorio actual y conserva historial
- **Múltiples escenarios** - WordPress Lab, Web OSINT & SSH Compromise, EternalBlue, LFI-RCE + Próximo
- **Misiones progresivas** - Objetivos claros con niveles de descubrimiento
- **Escenarios Dinámicos**: 5 laboratorios progresivos (WP, SSH Brute, EternalBlue, etc.).
- **Meterpreter Realista**: Verificación de privilegios mediante `getuid` necesaria para marcar objetivos como comprometidos.
- **Enumeración Avanzada**: Panel de detalles que muestra progreso visual (naranja para sospecha, verde para explotación).
- **Sistema de Archivos Virtual**: Archivos editables que impactan la lógica del simulador en tiempo real.
- **Ayuda Condicional Dinámica** - Las misiones se ocultan por defecto ("Modo sin ayuda"), desplegándose dinámicamente con animaciones en cascada y efecto tipo máquina de escribir al solicitar guía. Solo se revelan los pasos activos y completados.
- **Sistema de Pistas Progresivas** - Cada misión incluye pistas opcionales que se revelan gradualmente. El usuario puede hacer clic en "Ver pista 1" para obtener una pista inicial (herramienta a usar), y luego "Ver pista 2" para el comando específico. El carrusel permite navegar entre pasos completados y activos. Los hints son configurables por laboratorio y totalmente opcionales.
- **Indicador Visual de Avance** - El botón "Ver red" avisa con un parpadeo verde cuando descubres nueva información de reconocimiento (como puertos abiertos o directorios ocultos) con tus herramientas.
- **Internacionalización (i18n)** - Soporte para inglés y español en toda la interfaz. Selector de idioma en el header con persistencia en el estado de Zustand.
- **Encuestas Post-Lab** - Al completar un laboratorio al 100%, aparece una encuesta con rating 1-10, dificultad, recomendación y comentarios opcionales. Los datos se envían a Google Sheets vía webhook.
- **Sistema de Feedback General** - Botón de "Feedback" en el header del landing page que permite a cualquier usuario enviar comentarios, sugerencias o reportar problemas. Incluye captcha visual con 5 preguntas de reconocimiento de imágenes para prevenir spam automatizado. Los datos se guardan en Google Sheets (hoja separada) incluyendo nombre (obligatorio), email (opcional) y comentario (obligatorio).
- **Analytics de Actividad** - Tracking automático de inicio de labs, progreso, abandono y completado para análisis de uso.
- **Tarjetas de Laboratorio Dinámicas** - Metadata modular para cada laboratorio (tagline, herramientas, color) que permite rotar y reordenar escenarios fácilmente.
- **FTP Interactivo** - Sesiones FTP completas con login anónimo, descarga de archivos y navegación de directorios.
- **Navegador web simulado** - Acceso a sitios vulnerables dentro del simulador (todo el contenido está en inglés).
- **Mapa de red y Panel de Enumeración** - Visualización detallada de máquinas, puertos y vulnerabilidades. El panel de **Enumeración** muestra información dinámica (directorios, credenciales) extraída en tiempo real de los archivos de la máquina (ej: `config.bak`).
- **Credenciales Dinámicas** - El sistema de login de sitios web (WordPress) y el panel de enumeración son sensibles a cambios en los archivos virtuales. Si un usuario edita un archivo de configuración, las credenciales aceptadas por el simulador cambian automáticamente.
- **Seguimiento de Reconocimiento** - Muestra posibles usuarios SSH descubiertos y resalta fallos en rojo o éxitos en verde.
- **Pantalla de Carga Inmersiva** — Countdown "DESPLEGANDO LABORATORIO" 3..2..1 con animación pop, seguido de carga progresiva de ~6.5s con logs estilo terminal (DNS, provisioning, red, servicios, vectores de ataque, conectividad). Barra de progreso continua con fases visuales y mensaje final "LABORATORIO ACTIVO — Acceso concedido. Ready for attack."
- **Tests completos** - 740+ tests unitarios e integración (todos pasando ✓)
- **Sistema de Validación Universal** - Las misiones se validan automáticamente mediante `validationCriteria` definidos en cada lab, separando completamente la lógica de comandos de la validación de misiones
- **Comando Netcat (nc)** - Listener activo con flexibilidad de argumentos
- **Terminal bloqueante** - Soporte para comandos que requieren escucha (nc -nlvp)
- **Sistema de directorios Linux realista** - Estructura completa de directorios (/etc, /var, /home, /root, /usr, etc.)
- **Archivos del sistema completos** - /etc/passwd, /etc/shadow, /etc/hostname, /etc/hosts, logs del sistema
- **Autocompletado con Tab** - Autocompleta comandos y archivos/directorios como en Linux real

### 🏗️ Arquitectura Modular

El proyecto está completamente refactorizado con:

- **Zustand** - State management centralizado
- **React + TypeScript** - UI moderna y type-safe
- **Vitest** - Testing framework
- **Tailwind CSS** - Estilos responsive
- **Comandos modularizados** - Fácil agregar nuevos comandos y escenarios
- **Separación clara** - Built-in commands vs Pentesting tools

### 🔧 Sistema de Validación Universal (Nuevo)

La arquitectura actual implementa un **sistema de validación universal** que separa completamente los comandos de la lógica de laboratorios:

```
┌─────────────────────────────────────────────────────────────┐
│  Comandos "Libres" (sin lógica de lab)                      │
│  ├── nmap, arp-scan, hydra, gobuster                        │
│  ├── ssh, ftp, sudo, cat                                   │
│  └── msfconsole                                             │
│       ↓                                                     │
│  Reportan metadata en CommandResponse                       │
│  ├── discoveredHosts, scanResults, foundCredentials         │
│  ├── foundDirectories, fileRead, sshLogin                   │
│  └── privescAttempted, vulnerabilityFound                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  LabValidator (src/utils/labValidator.ts)                   │
│  ├── Compara metadata contra validationCriteria             │
│  ├── validateMission() decide si completar misión           │
│  └── Soporta: discoveredHosts, scanResults, foundCreds,     │
│       sshLogin, fileRead, privesc, vulnFound, etc.          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Laboratorios (laboratorio01.ts - 05.ts)                    │
│  ├── Cada misión tiene validationCriteria definido            │
│  ├── Ej: { type: 'discoveredHosts', minHosts: 1 }           │
│  └── Ej: { type: 'sshLogin', user: 'root' }                 │
└─────────────────────────────────────────────────────────────┘
```

**Ventajas de esta arquitectura:**
- **Comandos 100% libres** - Ningún comando conoce los labs ni las misiones
- **Labs declarativos** - Solo definen `validationCriteria`, no código
- **Extensible** - Agregar un nuevo comando no requiere modificar labs
- **Testeable** - Cada componente se testea aisladamente
- **Universal** - El mismo validator funciona para todos los labs (1-5)

---

## 🧪 Laboratorios Disponibles

ZeroInfra Labs incluye una serie de escenarios progresivos:

### Laboratorio 01: WordPress Exploitation
Enfocado en enumeración web, descubrimiento de archivos sensibles (`config.bak`) y explotación de vulnerabilidades conocidas en CMS.

### Laboratorio 02: Web OSINT & SSH Compromise *(antes "SSH Brute Force")*
Práctica de recolección de información (OSINT) en sitios corporativos para generar listas de usuarios y ataque de fuerza bruta con `hydra`.

### Laboratorio 03: EternalBlue (MS17-010)
Explotación de vulnerabilidades criticas en Windows mediante Metasploit, manejo de sesiones de Meterpreter y confirmación de privilegios.

### Laboratorio 04: Local File Inclusion (LFI)
Laboratorio avanzado de vulnerabilidades web donde se aprende a leer archivos del sistema y escalar a RCE mediante la subida de payloads PHP.

**Objetivos:**
- Enumeración de aplicaciones web.
- Descubrimiento de LFI guiado paso a paso.
- Preparación e inspección de payloads PHP.
- Uso de `nc` para recibir conexiones reversas (Reverse Shell).

### Laboratorio 05: FTP Enumeration & Privilege Escalation
Escenario de post-explotación que incluye enumeración mediante FTP anónimo, fuerza bruta SSH con Hydra y escalada de privilegios explotando sudo vim.

**Objetivos:**
- Acceso FTP anónimo para recuperar información sensible
- Fuerza bruta de credenciales SSH con diccionario rockyou.txt
- Escalada de privilegios mediante explotación de sudo misconfiguration
- Captura de flags de usuario y root

### 🛠️ Stack Tecnológico

```
Frontend:     React 18 + TypeScript + Tailwind CSS
State:        Zustand (con persistencia)
Build:        Vite
Testing:      Vitest + React Testing Library
I18n:         Sistema de traducción modular (EN/ES)
Analytics:    Google Apps Script + Google Sheets (webhook)
Deployment:   Compatible con cualquier hosting estático
```

### 📊 Analytics y Encuestas Post-Lab

Al completar un laboratorio al 100%, aparece una encuesta emergente con:
- **Rating general** (1-10) con puntos clickeables
- **Dificultad percibida** (Fácil / Medio / Difícil / Muy difícil)
- **Recomendación** (Sí / No)
- **Comentarios libres** (textarea opcional)

La encuesta se dispara tanto con el comando `end` como con el botón "Menú".

#### Configuración del Webhook (Google Apps Script)

1. Crear una Google Sheet con columnas: `Timestamp | EventType | ScenarioId | ScenarioName | Details`
2. Ir a **Extensions → Apps Script** y pegar el código del `doPost` handler
3. **Deploy → New deployment → Web app** — Execute as: **Me**, Who has access: **Anyone**
4. Copiar la URL y crear `.env.local`:

```env
VITE_ANALYTICS_WEBHOOK=https://script.google.com/macros/s/TU_ID/exec
```

> Sin la variable de entorno, el tracking se desactiva silenciosamente.

#### Eventos Rastreados

| Evento | Cuándo se dispara |
|--------|-------------------|
| `lab_started` | Al iniciar un laboratorio |
| `mission_complete` | Cada misión completada |
| `lab_completed` | Al salir con 100% de progreso |
| `lab_abandoned` | Al salir con progreso parcial |
| `lab_changed` | Al cambiar de lab sin progreso |
| `survey_submitted` | Al enviar la encuesta post-lab |

#### Estructura de Datos en Google Sheets

Cada evento genera una fila con 13 columnas:

| Columna | Contenido | Ejemplo |
|---|---|---|
| A: Timestamp | Fecha/hora del evento | 1/4/2026 21:17:18 |
| B: EventType | Tipo de evento | `mission_complete` |
| C: ScenarioId | ID del escenario | `scenario-01` |
| D: ScenarioName | Nombre del lab | `WordPress Vulnerable Lab` |
| E: Details | JSON completo con todos los datos | `{"overall":9,...}` |
| F: sessionId | ID anónimo de sesión | `sess_1e0ce066` |
| G: language | Idioma del usuario | `en` / `es` |
| H: sessionDuration | Segundos desde que abrió la página | `1344` |
| I: labDuration | Segundos en el lab actual | `1344` |
| J: overall | Rating encuesta (1-10) | `9` |
| K: difficulty | Dificultad percibida | `medium` |
| L: recommend | ¿Lo recomendaría? | `TRUE` / `FALSE` |
| M: comments | Comentario libre | `cool!!!!` |

#### Google Apps Script — Código Completo

```javascript
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    const d = data.details || {};

    sheet.appendRow([
      new Date(),
      data.eventType || 'unknown',
      data.scenarioId || '-',
      data.scenarioName || '-',
      JSON.stringify(d),
      d.sessionId || '',
      d.language || '',
      d.sessionDuration || '',
      d.labDuration || '',
      d.overall !== undefined ? d.overall : '',
      d.difficulty || '',
      d.recommend !== undefined ? String(d.recommend) : '',
      d.comments || ''
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
```

> **Importante**: Cada vez que modifiques el script, hacé **Deploy → Manage deployments → Edit → New version → Deploy**.

#### Cómo Analizar los Datos

**1. Ver actividad por usuario (sheet "PorUsuario")**

Creá una sheet nueva y en A1:

```
=QUERY('Hoja 1'!A:M, "SELECT F, A, B, C, D, J, K, L, M WHERE F <> '' ORDER BY F, A", 1)
```

Esto agrupa todos los eventos por `sessionId`, mostrando el recorrido completo de cada usuario.

**2. Ver detalle de un usuario específico (sheet "DetalleUsuario")**

- En **A1** creá un dropdown: **Datos → Validación de datos → Menú desplegable (desde un intervalo)**
- El intervalo apuntá a una lista de sessionIds únicos generada con:
  ```
  =UNIQUE(FILTER('Hoja 1'!F:F, 'Hoja 1'!F:F<>"", 'Hoja 1'!F:F<>"sessionId"))
  ```
- En **A3** poné:
  ```
  =QUERY('Hoja 1'!A:M, "SELECT A, B, C, D, J, K, L, M WHERE F = '"&A1&"' ORDER BY A", 1)
  ```

**3. Solo encuestas (sheet "Respuestas")**

En una sheet nueva, en A1:
```
=FILTER('Hoja 1'!A:E, 'Hoja 1'!B:B="survey_submitted")
```

Luego extraé los campos de la encuesta con `REGEXEXTRACT` en las columnas siguientes.

**4. Tabla dinámica de encuestas**

Seleccioná la tabla de respuestas → **Insertar → Tabla dinámica**:
- **Filas**: `scenario` (nombre del lab)
- **Columnas**: `difficulty`
- **Valores**: `difficulty` → CONTARA (cuenta respuestas por dificultad)
- **Valores**: `overall` → PROMEDIO (rating promedio por lab)
- **Valores**: `recommend` → PROMEDIO (% que lo recomendaría)

#### Métricas Útiles

| Pregunta | Cómo verla |
|---|---|
| ¿Cuántos usuarios únicos? | `=COUNTUNIQUE(F:F)` en Hoja 1 |
| ¿Cuántos completaron un lab? | Contar filas con `lab_completed` |
| ¿Dónde abandonan la mayoría? | Último `EventType` antes de `lab_abandoned` |
| ¿Qué lab es más difícil? | Tabla dinámica: scenario vs difficulty |
| ¿Rating promedio general? | `=AVERAGE(J:J)` en sheet Respuestas |
| ¿Cuánto tardan en promedio? | `=AVERAGE(I:I)` filtrando por `lab_completed` |

---

## 📂 Estructura del Proyecto

```
src/
├── types.ts                          # Todos los tipos TypeScript
├── App.tsx                           # Componente raíz
├── main.tsx                          # Punto de entrada
├── index.css                         # Estilos globales
├── vite-env.d.ts                     # Tipos de Vite
│
├── utils/
│   ├── autocomplete.ts               # Sistema de autocompletado
│   ├── network.ts                    # assignDHCP helper
│   ├── networkAlert.ts               # Detección de cambios en enumeración
│   └── __tests__/                    # Tests de utilidades
│
├── hooks/                            # Custom React hooks
│   ├── useKeyboardShortcuts.ts       # Atajos de teclado (Ctrl+L/C/U, Tab, flechas)
│   ├── useTerminalIdentity.ts        # Hook para sshUser/isRoot + getShortPath
│   └── __tests__/
│
├── fs-models/                        # Modelos de sistemas de archivos
│   ├── fs-linux.ts                   # Sistema de archivos Linux
│   ├── fs-windows.ts                 # Sistema de archivos Windows
│   ├── index.ts                      # Exportaciones centralizadas
│   └── __tests__/                    # Tests de sistemas de archivos
│
├── commands/
│   ├── index.ts                      # Registry central + executeCommand()
│   ├── __tests__/                    # Tests de integración y happy path
│   │   ├── happyPathHelpers.ts        # Helpers compartidos para tests E2E
│   │   ├── happyPath-scenario01..05  # Tests E2E modularizados por escenario
│   │   └── happyPath-commands.test.ts # Tests de comandos básicos
│   ├── builtin/                      # Comandos del sistema
│   │   ├── help.ts, whoami.ts, ls.ts, cat.ts, cd.ts
│   │   ├── exit.ts, end.ts, sudo.ts, mkdir.ts, rmdir.ts
│   │   ├── clear.ts, ifconfig.ts, hashcat.ts
│   │   └── __tests__/                # Tests de comandos built-in
│   └── tools/                        # Herramientas de pentesting (no-shell)
│       ├── nmap.ts, hydra.ts, msfconsole.ts
│       ├── arp-scan.ts, gobuster.ts
│       ├── msfHelpers.ts, msfModules.ts, msfTypes.ts
│       ├── msfCommands/              # Submódulos de Metasploit (legacy)
│       │   ├── index.ts, msfBase.ts, msfExploits.ts
│       │   ├── msfMeterpreter.ts, msfShell.ts
│       └── __tests__/                # Tests de herramientas
│
├── frameworks/                       # Frameworks de pentesting unificados
│   ├── metasploit/                   # Metasploit Framework (nueva arquitectura)
│   │   ├── core/                     # ModuleLoader, SessionManager, ContextRegistry
│   │   │   ├── ModuleLoader.ts       # Registro dinámico de módulos (Fase 1)
│   │   │   ├── SessionManager.ts     # Gestión de sesiones MSF (Fase 2)
│   │   │   └── ContextRegistry.ts    # Context-aware command registry (Fase 3)
│   │   ├── modules/                  # Módulos individuales (exploits, aux, payloads)
│   │   │   ├── types.ts              # Tipos de módulos y MsfState
│   │   │   └── data/
│   │   │       ├── exploits/         # ms17_010_eternalblue, etc.
│   │   │       ├── auxiliary/        # smb_ms17_010, etc.
│   │   │       └── payloads/         # meterpreter_reverse_tcp, etc.
│   │   └── commands/                 # Comandos MSF (sessions, background, context-aware)
│   └── shells/                       # Shells interactivas (movido desde src/shells/)
│       ├── index.ts                  # ShellManager central + exports
│       ├── ftp/                      # FTP: comando + sesión interactiva
│       │   ├── ftpCommand.ts         # Comando inicial: ftp <ip>
│       │   ├── FtpSession.ts         # Shell interactivo (USER, PASS, LIST)
│       │   └── __tests__/
│       ├── ssh/                      # SSH: comando + sesión interactiva
│       │   ├── sshCommand.ts         # Comando inicial: ssh user@ip
│       │   ├── SshSession.ts         # Shell interactivo (password, comandos)
│       │   └── __tests__/
│       └── nc/                       # Netcat: comando + listener
│           ├── ncCommand.ts          # Comando: nc -nlvp <port>
│           ├── NcSession.ts          # Listener interactivo
│           └── __tests__/
│
├── laboratorios/                     # Configuración de laboratorios (escenarios)
│   ├── laboratorios.ts               # Registro central (SCENARIOS)
│   ├── laboratorio01.ts ~ laboratorio05.ts # Escenarios numerados
│   ├── templates.ts                  # Plantillas reutilizables (buildScenario, COMMON_PORTS)
│   └── attackers/                    # Máquinas atacantes (centralizado)
│       ├── index.ts                  # Registry de attackers
│       └── kali.ts                   # Kali Linux 2026.1 (filesystem, diccionarios, factory)
│
├── components/                       # Componentes React
│   ├── Terminal.tsx                  # Terminal interactiva (~440 líneas)
│   ├── TerminalPrompt.tsx            # Renderers de prompts (Kali, MSF, FTP)
│   ├── StreamingOutput.tsx           # Output animado línea por línea
│   ├── FakeBrowser.tsx               # Navegador simulado (~280 líneas)
│   ├── AutocompletePanel.tsx         # Panel de autocompletado
│   ├── EnumerationPanel.tsx          # Panel de detalles de máquina
│   ├── NetworkMap.tsx                # Visualización de topología de red
│   ├── MissionPanel.tsx              # Panel de misiones + hints + carrusel
│   ├── MachineLoader.tsx             # Pantalla de carga con countdown 3..2..1
│   ├── LandingPage.tsx               # Página de inicio / selección de lab
│   ├── FeedbackModal.tsx             # Modal de feedback con captcha visual
│   ├── SurveyModal.tsx               # Encuesta post-lab
│   ├── LabCompletionOverlay.tsx      # Animación de lab completo (confetti + trophy)
│   ├── __tests__/                    # Tests de componentes
│   ├── fixtures.ts                   # Fixtures compartidos para tests
│   └── fakesites/
│       ├── WordPressSite.tsx         # Router de contenido WordPress
│       ├── ConsultancySite.tsx       # Sitio de consultoría (Escenario 02)
│       ├── wordpress/wp01/           # Componentes WordPress individuales
│       │   ├── Index.tsx, Login.tsx, Dashboard.tsx
│       │   ├── Uploads.tsx, ConfigBak.tsx
│       │   └── __tests__/
│       ├── lfi_lab/                  # Laboratorio LFI
│       │   ├── InclusionSite.tsx
│       │   └── __tests__/
│       └── __tests__/                # Tests de fakesites
│
├── store/                            # Zustand global state
│   ├── index.ts                      # Re-exports centralizados
│   ├── scenarioStore.ts              # Estado global (Zustand + persist)
│   ├── types.ts                      # Tipos del store (ScenarioState, etc.)
│   ├── selectors.ts                  # Selectores memoizados
│   └── __tests__/                    # Tests del store
│
├── i18n/
│   └── translations.ts               # Sistema de traducción EN/ES
│
└── test/
    └── setup.ts                      # Setup de Vitest (mocks, cleanup)
```

---

> **Nota:** Para ver el historial completo de bugs resueltos y nuevas características, consulta el [CHANGELOG.md](CHANGELOG.md).

---

## 🖥️ Sistema de Archivos Modular

El simulador incluye un sistema de archivos modularizado que soporta múltiples sistemas operativos:

### 📁 Estructura de Módulos

```
src/fs-models/
├── fs-linux.ts          # Sistema de archivos Linux completo
├── fs-windows.ts        # Sistema de archivos Windows completo
└── __tests__/           # Tests de sistemas de archivos
```

### 🐧 Sistema Linux (`fs-linux.ts`)

#### Configuración Dinámica
```typescript
interface LinuxFileSystemConfig {
  username?: string;        // Usuario personalizado
  password?: string;        // Contraseña personalizada
  shadowPassword?: string;  // Hash de contraseña
}

// Uso en escenarios
const files = createLinuxFileSystem({ 
  username: 'www-data',
  shadowPassword: '$6$custom_hash...'
});
```

#### Directorios Disponibles
- **Estructura completa**: /bin, /boot, /dev, /etc, /home, /lib, /lib64, /media, /mnt, /opt, /proc, /root, /run, /sbin, /srv, /sys, /tmp, /usr, /var
- **Archivos de sistema**: /etc/passwd, /etc/shadow, /etc/hostname, /etc/hosts, /etc/os-release, etc.
- **Logs del sistema**: /var/log/syslog, /var/log/auth.log, /var/log/kern.log
- **Configuraciones**: Apache, SSH, MySQL en /etc/

### 🪟 Sistema Windows (`fs-windows.ts`)

#### Configuración Dinámica
```typescript
interface WindowsFileSystemConfig {
  username?: string;         // Usuario personalizado
  computerName?: string;     // Nombre del equipo
}

// Uso en escenarios
const files = createWindowsFileSystem({ 
  username: 'Administrator',
  computerName: 'WIN-SERVER'
});
```

#### Directorios Disponibles
- **Estructura Windows**: C:\, C:\Windows, C:\Windows\System32, C:\Program Files, C:\Users
- **Perfiles de usuario**: C:\Users\{username}\Desktop, C:\Users\{username}\Documents
- **Sistema de 32/64 bits**: Soporte para Program Files y Program Files (x86)

### 🔧 Integración con Escenarios

Los sistemas de archivos se integran mediante `templates.ts`:

```typescript
import { createLinuxFileSystem, createWindowsFileSystem } from '../fs-models';

// Para máquinas Linux
const linuxFiles = createLinuxFileSystem({ username: 'www-data' });

// Para máquinas Windows  
const windowsFiles = createWindowsFileSystem({ username: 'Administrator' });

// Asignación a máquinas
machine.files = linuxFiles; // o windowsFiles según escenario
```

### 📋 Ejemplos de Uso en Terminal

```bash
# Sistema Linux
root@kali:/# ls /
bin/   boot/   dev/   etc/   home/   lib/   lib64/   media/   mnt/   opt/   proc/   root/   run/   sbin/   srv/   sys/   tmp/   usr/   var/

root@kali:/# ls -l /etc/
-rw-r--r--  1 root   root   1852 Jan 01 00:00 passwd
-rw-r--r--  1 root   root   1205 Jan 01 00:00 shadow
-rw-r--r--  1 root   root    215 Jan 01 00:00 hostname

root@kali:/# cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

# Sistema Windows (si aplica)
C:\Users\Administrator> dir C:\
 Volume in drive C is Windows Server
 Directory of C:\

10/25/2023  12:00 PM    <DIR>          Program Files
10/25/2023  12:00 PM    <DIR>          Users
10/25/2023  12:00 PM    <DIR>          Windows
```

---

## ⌨️ Autocompletado con Tab

El simulador incluye un sistema de autocompletado similar a una terminal Linux real:

### Características

- **Autocompletado de comandos**: Presiona Tab para completar comandos como `help`, `ls`, `cat`, `cd`, `nmap`, `ssh`, etc.
- **Autocompletado de archivos**: Después de un comando, presiona Tab para completar rutas de archivos y directorios
- **Comportamiento inteligente**:
  - Una coincidencia: completa automáticamente
  - Múltiples coincidencias: muestra lista de opciones
  - Prefijo común: completa hasta donde las coincidencias son iguales
- **Navegación con Tab**: Presiona Tab múltiples veces para ciclar entre sugerencias
- **Navegación con flechas**: Usa ↑/↓ para navegar entre sugerencias
- **Cierre con Escape**: Presiona Escape para cerrar el panel de sugerencias

### Ejemplos

```bash
# Autocompletar comando
root@target-server:/# nm<TAB>
# Completa a: nmap

# Autocompletar archivo
root@target-server:/# cat /etc/pa<TAB>
# Completa a: cat /etc/passwd

# Múltiples coincidencias
root@target-server:/# ls /etc/<TAB>
# Muestra: apache2/  ssh/  mysql/  passwd  shadow  hostname  hosts  ...

# Autocompletar directorio
root@target-server:/# cd /ho<TAB>
# Completa a: cd /home/
```

---

## 🚀 Guía Rápida de Desarrollo

### Instalación y Setup

```bash
# Clonar el repositorio
git clone <repo>
cd cyberops-v2

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

### Comandos Disponibles

```bash
### Desarrollo
npm run dev              # Inicia servidor con hot-reload

### Testing
npm test                 # Modo watch (re-ejecuta tests al guardar)
npm run test:run         # Ejecución única de tests
npm run test:coverage    # Reporte de cobertura

### Build
npm run build            # Genera bundle optimizado
npm run preview          # Preview del build
```

---

## 📊 Estado del Proyecto

### ✅ Completado
- ✓ Diccionario rockyou.txt en /usr/share/wordlists/ (100+ contraseñas para hydra)
- ✓ Diccionario common.txt en /usr/share/wordlists/SecLists/Discovery/Web-Content/ (100+ directorios para gobuster)
- ✓ Sistema de terminal interactivo
- ✓ 5 escenarios educativos completos
- ✓ Integración con Metasploit Framework
- ✓ 740+ tests unitarios (todos pasando ✓)
- ✓ **Sistema de Validación Universal** - Comandos libres + labValidator + validationCriteria en todos los labs (1-5)
- ✓ State management con Zustand
- ✓ Navegador web simulado
- ✓ Mapa de red interactivo
- ✓ Persistencia de estado
- ✓ Sistema de directorios virtual (cd, ls)
- ✓ Comando exit funcional
- ✓ Sistema de directorios Linux realista
- ✓ Archivos del sistema completos
- ✓ Autocompletado con Tab
- ✓ Atajos de teclado estándar (Ctrl+L, Ctrl+U, Ctrl+C)
- ✓ Comando ls con flags (-l, -a, -la)
- ✓ Prompt dinámico con directorio actual
- ✓ Autocompletado de paths con navegación consecutiva
- ✓ Arquitectura modularizada (Terminal, FakeBrowser, hooks)
- ✓ Tests E2E modularizados por escenario
- ✓ Internacionalización (i18n) — inglés/español
- ✓ Encuestas post-lab con analytics
- ✓ Tracking de actividad del usuario
- ✓ Sistema de pistas progresivas (hint1/herramienta + hint2/comando)
- ✓ Carrusel de pasos con navegación < >
- ✓ Auto-advance del carrusel al completar paso
- ✓ Feedback modal con captcha visual
- ✓ Rediseño completo de todos los labs con hints

### 📋 En Progreso / Planeado
- [ ] Dashboard de analytics con visualización de encuestas
- [ ] Sistema de badges/logros
- [ ] Más escenarios educativos
- [ ] Tests adicionales para coverage

---

### ✅ Mejora Arquitectónica Implementada: Sistema de Validación Universal

**Estado:** ✅ **COMPLETADO** — Todos los labs (1-5) migrados al nuevo sistema

**Arquitectura implementada:**

| Capa | Responsabilidad | Archivos |
|------|----------------|----------|
| **Comandos Libres** | Solo ejecutan y reportan metadata | `nmap.ts`, `hydra.ts`, `ssh.ts`, `sudo.ts`, `cat.ts`, etc. |
| **LabValidator** | Valida misiones comparando metadata contra criteria | `src/utils/labValidator.ts` |
| **Laboratorios** | Declaran `validationCriteria` por misión | `laboratorio01.ts`–`05.ts` |

**Cambios realizados:**
- **Comandos refactorizados**: Eliminado todo `completedMissionId` hardcodeado de ~15 archivos
- **Nuevo sistema de validación**: `validateMission()` en `labValidator.ts` con 10+ criterios soportados
- **Labs actualizados**: Todos los labs (1-5) tienen `validationCriteria` en cada misión
- **Metadata estandarizada**: `CommandResponse` incluye campos como `discoveredHosts`, `scanResults`, `foundCredentials`, `sshLogin`, `privescAttempted`, `fileRead`, `vulnerabilityFound`

**Beneficios logrados:**
- ✅ **Comandos 100% libres** — Ningún comando conoce los labs
- ✅ **Labs declarativos** — Solo definen criterios, sin código
- ✅ **Extensible** — Agregar nuevos comandos no requiere modificar labs existentes
- ✅ **Universal** — El mismo validator funciona para todos los labs
- ✅ **Testeable** — 740+ tests pasando, incluyendo tests del nuevo sistema

**Criterios de validación soportados:**
```typescript
type MissionCriteriaType = 
  | 'discoveredHosts'      // arp-scan
  | 'scanResults'          // nmap  
  | 'foundCredentials'     // hydra
  | 'foundDirectories'     // gobuster
  | 'fileRead'             // cat
  | 'privesc'              // sudo
  | 'sshLogin'             // ssh
  | 'ftpLogin'             // ftp
  | 'vulnerabilityFound'   // msf
  | 'exploit'              // msf exploit
  | 'uidChecked'           // meterpreter
  | 'ncListener'           // netcat
  | 'blockingCommand'      // listeners
  | 'custom';              // casos especiales

**Archivos nuevos:**
- `src/utils/labValidator.ts` — Validador universal de misiones
- `src/types.ts` — Extendedido con `ValidationCriteria` y `MissionCriteriaType`

**Archivos modificados:**
- `src/commands/tools/*.ts` — Eliminado `completedMissionId` hardcodeado
- `src/frameworks/shells/ssh/SshSession.ts` — Refactorizado para metadata
- `src/commands/tools/msfCommands/msfExploits.ts` — Limpieza de código obsoleto
- `src/laboratorios/laboratorio01.ts`–`05.ts` — Agregado `validationCriteria` a cada misión
- `src/components/Terminal.tsx` — Integración con `validateMission()`
- `src/commands/__tests__/happyPathHelpers.ts` — Actualizado `evolveState()` para metadata

---

## 📈 Estado del Proyecto

### 📊 Métricas Actuales
- **Tests**: 740+ tests unitarios pasando
- **Archivos de test**: 64 archivos de test
- **Terminal.tsx**: ~440 líneas
- **scenarioStore.ts**: ~380 líneas
- **Sistema de Validación Universal**: 10+ criterios soportados
- **Labs con validationCriteria**: 5/5 (100%)
- **Comandos libres**: 15+ comandos sin lógica de lab
- **Kali Linux**: 2026.1 (última versión)

### 🔧 Tareas Pendientes (Technical Debt)
- **Mejora**: Aumentar coverage de componentes con lógica condicional
- **Optimización**: Revisar archivos >300 líneas

---

## 📜 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial completo de cambios, fixes y nuevas características por versión.
## 🧪 Testing Strategy

### ✅ Qué ya implementamos

El proyecto cuenta con una suite de tests de integración usando **Vitest** enfocada en validar el comportamiento real del simulador.

### 🔹 Cobertura actual

Se implementaron tests tipo "happy path" para los principales escenarios:

- WordPress exploitation
- SSH brute force
- EternalBlue (Metasploit)
- LFI → RCE
- Privilege escalation

### 🔹 Características clave

#### 🧠 1. Tests de flujo completo (Golden Path)

Cada lab incluye un test que simula el comportamiento real del usuario:

```
arp-scan → nmap → enumeración → explotación → acceso
```

👉 Esto permite validar el sistema como un todo, no solo funciones aisladas.

#### 🔍 2. Validaciones basadas en estado (no solo output)

Se prioriza validar propiedades del sistema en lugar de strings:

- `completedMissionId`
- `foundCredentials`
- `newMachineId`
- `isError`

👉 Esto hace los tests más robustos frente a cambios de texto.

#### ⚠️ 3. Validaciones estrictas de errores

Se utilizan checks explícitos:

```typescript
expect(result.isError).toBe(false);
```

👉 Evita falsos positivos comunes en tests generados automáticamente.

#### 🧩 4. Simulación controlada de estado

Debido a limitaciones actuales del engine, el estado del sistema se simula mediante un helper:

```typescript
advanceState(target, level)
```

👉 Esto reemplaza asignaciones manuales y centraliza la lógica de simulación.

#### 🧼 5. Código de tests mantenible

- Uso de helpers (`exec`, `expectSuccess`, `advanceState`)
- Reducción de duplicación
- Mejor legibilidad del flujo

### ⚠️ Limitación actual (importante)

Actualmente, el engine del simulador **no expone el estado actualizado** después de ejecutar comandos.

Por esta razón:

- ❌ Los tests no pueden depender de estado real
- ✅ Se utiliza simulación controlada (`advanceState`)

### 🚀 Mejora futura recomendada

#### 🔹 Exponer estado real desde el engine

Idealmente, la función principal debería retornar algo como:

```typescript
{
  output: string,
  isError: boolean,
  updatedState: GameState,
  completedMissionId?: number
}
```

Esto permitiría:

- Eliminar `advanceState`
- Tests 100% realistas
- Detectar bugs de transición de estado
- Simplificar los tests

### 📊 Nivel actual de testing

| Área | Estado |
|------|--------|
| Cobertura de flujos | ✅ Alta |
| Robustez | ✅ Buena |
| Mantenibilidad | ✅ Buena |
| Estado real del sistema | ⚠️ Parcial |

### 🧠 Importancia de la mejora pendiente

**¿Qué tan importante es?**

- 🟢 **Para tu etapa actual:** NO es crítico → el sistema ya es confiable
- 🔵 **Para escalar a producto:** SÍ es importante → necesario para:
  - Persistencia real
  - Múltiples usuarios
  - Debugging complejo

### 🧪 Filosofía de testing del proyecto

> "Testear comportamiento del usuario, no implementación interna"

---

## 🚀 Future Roadmap & Community Vision

### Fase 1: Admin Panel (CRUD de Labs)
Interfaz web protegida para crear, editar y eliminar laboratorios sin tocar código.

- **Lab Editor:** Formulario con secciones para metadata, máquinas, learning steps, misiones, hints
- **File Manager:** Editor de archivos virtuales para cada máquina
- **Preview:** Vista previa del lab antes de guardarlo
- **Export/Import:** Labs como JSON portable

### Fase 2: Lab Builder con Piezas Modulares
Interfaz para armar labs combinando componentes predefinidos.

| Categoría | Piezas |
|---|---|
| **Attacker** | Kali Linux 2026.1, Parrot OS, Arch Linux |
| **Target OS** | Ubuntu 22.04, Windows 7, Windows 10, Debian |
| **Services** | SSH, FTP, HTTP, SMB, MySQL, PostgreSQL |
| **Vulnerabilities** | LFI, SQLi, EternalBlue, FTP Anonymous, Weak SSH Creds, Misconfigured Sudo, WordPress Admin Leak |
| **Web Sites** | WordPress, Consultancy Site, Login Portal, Custom |
| **Flags** | User flag, Root flag, Custom flag |

**Crear un lab nuevo:** De ~100 líneas de código → 5 minutos en UI.

### Fase 3: Community Platform & Gamification
Plataforma viva donde la comunidad crea, vota y comparte labs.

- **Votación de labs:** Los usuarios votan los mejores labs de la comunidad
- **Niveles de creador:** Novato → Creador → Arquitecto → Maestro
- **Recompensas:** Labs más votados = meses gratis de premium
- **Template gallery:** Labs de la comunidad con rating y sharing
- **Lab Composer:** Usuarios avanzados combinan piezas y comparten sus creaciones

### Fase 4: Rutas de Aprendizaje (Premium)
Diferenciador clave: no solo "hacé el lab", sino "aprendé pentesting paso a paso".

- Rutas progresivas: Recon → Enumeración → Explotación → Post-explotación → Reporting
- Labs con dificultad creciente dentro de cada ruta
- Certificados descargables al completar rutas
- Scoring y leaderboards

### Modelo Freemium
| Free | Premium |
|---|---|
| Labs básicos | Rutas de aprendizaje completas |
| Crear labs propios | Labs avanzados exclusivos |
| Comunidad | Certificados + mentoring |
| Votar labs | Leaderboards + badges especiales |

---

## 🔒 Seguridad

El proyecto simula comandos reales pero en un entorno controlado. **No hay código malicioso** ni acceso real a sistemas. Es solo educativo.

---

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo, modificarlo y compartirlo.

---

---

## 🗺️ Roadmap / Tareas Pendientes

### 🔴 Prioritario: MSF Architecture Completion
**Estado:** Fase 5a/b completada - Comandos nativos migrados al ContextRegistry

**Comandos migrados (15 total):**
- **msfconsole:** `search`, `use`, `set`, `back`, `show`, `info`, `unset`, `clear`, `exit`, `banner`
- **meterpreter:** `getuid`, `sysinfo`, `ps`, `hashdump`, `shell`

**Pendiente:**
- Comandos legacy de `msfShell.ts` (`dir`, `cd`, `ipconfig`, `whoami`, `exit`, `cls`) - usar cuando se necesite Windows shell real
- Comandos de `msfExploits.ts` (`exploit`, `run`, `check`) - integrar con module execution
- **Tests para comandos nativos** (uno por archivo)
- **Eliminar sistema legacy** una vez todo migrado (cleanup final)

**Resultado:** Sistema MSF ~80% basado en ContextRegistry. Sistema dual operativo (legacy + nativo).

### 🟡 Medium Priority (post-MSF)
1. **Unificar comandos built-in** (`ls`, `cd`, `cat`, `sudo`, etc.) bajo patrón similar al MSF
2. **Estandarizar tools de pentesting** (`nmap`, `hydra`, `gobuster`) con registry unificado
3. **ScenarioBuilder declarativo** para laboratorios (si escala a 50+ labs)

---

**Versión:** 2.10.0  
**Última actualización:** 10 de Abril, 2026  
**Tecnologías:** React 18 + TypeScript + Vitest + Zustand  
**Tests:** 740+ pasando ✅  
**Característica principal:** Sistema de Validación Universal con Comandos Libres
