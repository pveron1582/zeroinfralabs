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
- **Múltiples escenarios** - WordPress Lab, SSH Brute Force, EternalBlue, LFI-RCE + Próximo
- **Misiones progresivas** - Objetivos claros con niveles de descubrimiento
- **Escenarios Dinámicos**: 5 laboratorios progresivos (WP, SSH Brute, EternalBlue, etc.).
- **Meterpreter Realista**: Verificación de privilegios mediante `getuid` necesaria para marcar objetivos como comprometidos.
- **Enumeración Avanzada**: Panel de detalles que muestra progreso visual (naranja para sospecha, verde para explotación).
- **Sistema de Archivos Virtual**: Archivos editables que impactan la lógica del simulador en tiempo real.
- **Ayuda Condicional Dinámica** - Las misiones se ocultan por defecto ("Modo sin ayuda"), desplegándose dinámicamente con animaciones en cascada y efecto tipo máquina de escribir al solicitar guía. Solo se revelan los pasos activos y completados.
- **Indicador Visual de Avance** - El botón "Ver red" avisa con un parpadeo verde cuando descubres nueva información de reconocimiento (como puertos abiertos o directorios ocultos) con tus herramientas.
- **Internacionalización (i18n)** - Soporte para inglés y español en toda la interfaz. Selector de idioma en el header con persistencia en el estado de Zustand.
- **Tarjetas de Laboratorio Dinámicas** - Metadata modular para cada laboratorio (tagline, herramientas, color) que permite rotar y reordenar escenarios fácilmente.
- **FTP Interactivo** - Sesiones FTP completas con login anónimo, descarga de archivos y navegación de directorios.
- **Navegador web simulado** - Acceso a sitios vulnerables dentro del simulador (todo el contenido está en inglés).
- **Mapa de red y Panel de Enumeración** - Visualización detallada de máquinas, puertos y vulnerabilidades. El panel de **Enumeración** muestra información dinámica (directorios, credenciales) extraída en tiempo real de los archivos de la máquina (ej: `config.bak`).
- **Credenciales Dinámicas** - El sistema de login de sitios web (WordPress) y el panel de enumeración son sensibles a cambios en los archivos virtuales. Si un usuario edita un archivo de configuración, las credenciales aceptadas por el simulador cambian automáticamente.
- **Seguimiento de Reconocimiento** - Muestra posibles usuarios SSH descubiertos y resalta fallos en rojo o éxitos en verde.
- **Persistencia de estado** - El progreso se guarda automáticamente con Zustand persist
- **Tests completos** - 500+ tests unitarios e integración (todos pasando ✓)
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

---

## 🧪 Laboratorios Disponibles

ZeroInfra Labs incluye una serie de escenarios progresivos:

### Laboratorio 01: WordPress Exploitation
Enfocado en enumeración web, descubrimiento de archivos sensibles (`config.bak`) y explotación de vulnerabilidades conocidas en CMS.

### Laboratorio 02: SSH Brute Force
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
Deployment:   Compatible con cualquier hosting estático
```

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
│   └── __tests__/                    # Tests de utilidades
│
├── fs-models/                         # Modelos de sistemas de archivos
│   ├── fs-linux.ts                   # Sistema de archivos Linux
│   ├── fs-windows.ts                 # Sistema de archivos Windows
│   ├── index.ts                      # Exportaciones centralizadas
│   └── __tests__/                    # Tests de sistemas de archivos
│
├── commands/
│   ├── index.ts                      # Registry central + executeCommand()
│   ├── __tests__/                    # Tests de integración y happy path
│   ├── builtin/                      # Comandos del sistema
│   │   ├── help.ts, whoami.ts, ls.ts, cat.ts, cd.ts
│   │   ├── exit.ts, end.ts, sudo.ts, mkdir.ts, rmdir.ts
│   │   ├── clear.ts, ifconfig.ts, hashcat.ts
│   │   └── __tests__/                # Tests de comandos built-in
│   └── tools/                        # Herramientas de pentesting
│       ├── nmap.ts, ssh.ts, hydra.ts, msfconsole.ts, nc.ts
│       ├── arp-scan.ts, gobuster.ts
│       ├── msfHelpers.ts, msfModules.ts, msfTypes.ts
│       ├── msfCommands/              # Submódulos de Metasploit
│       │   ├── index.ts, msfBase.ts, msfExploits.ts
│       │   ├── msfMeterpreter.ts, msfShell.ts
│       └── __tests__/                # Tests de herramientas
│
├── laboratorios/                      # Configuración de laboratorios (escenarios)
│   ├── laboratorios.ts                # Registro central (antes laboratorios.ts)
│   ├── laboratorio01.ts ~ laboratorio05.ts # Escenarios numerados
│   └── templates.ts                   # Plantillas de máquinas y servicios
│
├── components/                       # Componentes React
│   ├── Terminal.tsx
│   ├── FakeBrowser.tsx
│   ├── NetworkMap.tsx
│   ├── MissionPanel.tsx
│   ├── LandingPage.tsx
│   ├── MachineLoader.tsx
│   ├── __tests__/                    # Tests de componentes
│   └── fakesites/
│       ├── wordpress/wp01/           # Sitio WordPress simulado
│       │   ├── Index.tsx, Login.tsx, Dashboard.tsx
│       │   ├── Uploads.tsx, ConfigBak.tsx
│       │   └── __tests__/
│       └── lfi_lab/                  # Laboratorio LFI
│           ├── InclusionSite.tsx
│           └── __tests__/
│
├── test/                            # Configuración de tests
│   └── setup.ts                     # Setup de Vitest
│
└── store/
    ├── index.ts
    ├── scenarioStore.ts              # Estado global (Zustand)
    └── __tests__/                    # Tests del store
```

---

## 🐛 Bugs Pendientes (Por Resolver)

### 🔴 Bug #1: OS visible en topología tras arp-scan
**Descripción:** Luego del escaneo con arp-scan, al ver la topología de red la máquina víctima muestra el Sistema Operativo, pero debería verse "Desconocido" hasta ejecutar nmap.
**Prioridad:** Alta

### 🔴 Bug #2: Pasos de EternalBlue necesitan más detalle
**Descripción:** Los pasos para EternalBlue son demasiado breves. Se necesitan agregar pasos intermedios:
1. Ingresar a metasploit con `msfconsole`
2. Buscar exploit con `search ms17-010`
3. Seleccionar con `use 0` para auxiliar
4. Ejecutar `show options`
5. Configurar `set rhosts <ip>`
6. Ejecutar `run` o `exploit` para verificar vulnerabilidad
7. `back` para salir del módulo
8. Repetir `search ms17` para buscar exploit
9. `use 1` para seleccionar exploit
10. Configurar rhosts y lhost
11. `run` o `exploit`
12. `getuid` para verificar usuario admin
**Prioridad:** Alta

### 🔴 Bug #3: Escenario 5 - Validaciones de steps
**Descripción:** Al ejecutar SSH, no se marca como confirmada la info de credenciales en la topología. Al ejecutar `sudo -l`, el step no cambia a confirmado.
**Prioridad:** Alta

### 🟠 Bug #4: Sesión activa de máquina atacante dice "TU ESTACION"
**Descripción:** En el NetworkMap, la máquina atacante activa muestra "TU ESTACION" en lugar de "SESION ACTIVA".
**Prioridad:** Media

### 🟠 Bug #5: `whoami` en conexión SSH muestra hostname e IP
**Descripción:** Al ejecutar `whoami` en una sesión SSH, muestra información adicional (hostname, IP) cuando solo debería mostrar el nombre de usuario.
**Prioridad:** Media

### 🟠 Bug #6: Escenario 5 - PrivEsc no cambia prompt a root
**Descripción:** Al escalar privilegios con `sudo vim -c '!bash'`, el prompt no cambia a `root@hostname`.
**Prioridad:** Media

### ✅ Bug resuelto #8: Validación de navegador (google.com)
**Descripción:** Resuelto en v2.6.0. El navegador ahora acepta `google.com` y `www.google.com` con HTTPS. Las URLs con HTTP muestran error de seguridad "Tu conexión no es privada".

### ✅ Bug resuelto: Directorio inicial de Kali
**Descripción:** Resuelto en v2.6.0. El directorio inicial ahora es `/root` en lugar de `/`.

### ✅ Bug resuelto: flag.txt en máquina atacante
**Descripción:** Resuelto en v2.6.0. La flag se removió del filesystem base y ahora se agrega desde el escenario de la víctima.

### ✅ Bug resuelto: Credenciales SSH no aparecían en topología
**Descripción:** Resuelto en v2.6.0. Las credenciales SSH descubiertas vía `hydra` o `config.bak` ahora aparecen correctamente en el panel de máquina con etiqueta "SSH".

### ✅ Bug resuelto: Credenciales mostraban "Desconocido" en lugar del servicio
**Descripción:** Resuelto en v2.6.0. El parámetro `service` ahora se pasa correctamente al descubrir credenciales, mostrando "WordPress Admin", "SSH" o "FTP" según corresponda.

### ✅ Bug resuelto: Al salir de SSH las credenciales volvían a naranja
**Descripción:** Resuelto en v2.6.0. Las credenciales verificadas permanecen verdes (verificadas) incluso después de cerrar la sesión SSH.

### ✅ Mejora: WordPress Lab — Config.bak limpio (solo WP-Admin)
**Descripción:** Resuelto en v2.6.0. El archivo `config.bak` ahora solo muestra credenciales WP-Admin. Se removieron las credenciales SSH y de base de datos para simplificar el descubrimiento.

### ✅ Fix: WP-Admin Login — Credenciales correctas y campo limpio
**Descripción:** Resuelto en v2.6.0. El login de WP-Admin ahora usa las credenciales correctas (admin/P@ssw0rd123!). El campo de usuario aparece vacío (sin placeholder "admin") para evitar confusión.

### ✅ Mejora: WordPress Lab — Credenciales SSH root desde Dashboard
**Descripción:** Resuelto en v2.6.0. Las credenciales SSH ahora se descubren al acceder al WP-Admin Dashboard (no en config.bak). Las credenciales son de **root** (no admin) para acceso completo a la máquina. Flujo: WP-Admin (misión 5) → Dashboard revela credenciales SSH root → SSH como root completa el lab (misión 6).

### ✅ Bug #7 (Resuelto): Tab autocomplete mostraba `.dir` internos
**Descripción:** Resuelto en v2.5.1. El autocompletado ya no muestra archivos marcadores `.dir` internos del sistema de archivos virtual.

### 🟡 Bug #8 (Antes Bug #7): Validación de navegador (google.com)
**Descripción:** El navegador solo valida `www.google.com` y `https://www.google.com`, pero debería aceptar también `http://www.google.com` y `https://google.com` redirigiendo a la URL canónica.
**Prioridad:** Baja

### ✅ Bug resuelto: Escenarios 3 y 4 — `ls` y `cd` no funcionaban
**Descripción:** Resuelto en v2.5.0. `laboratorio03.ts` y `laboratorio04.ts` tenían su propia copia de `createAttackerMachine` que retornaba `files: []`, dejando la máquina atacante sin sistema de archivos. Ahora usan `templates.ts`.

### ✅ Bug resuelto: `ls` mostraba directorios como subdirectorios de sí mismos
**Descripción:** Resuelto en v2.5.1. El parser de marcadores `.dir` usaba `slice(0,-4)` dejando barra diagonal, causando que `/var/mail` apareciera dentro de `/var/mail/`.

### ✅ Bug resuelto: Prompts históricos cambiaban al entrar a msfconsole
**Descripción:** Resuelto en v2.5.2. Los prompts en el historial ahora mantienen su estilo original (Kali-style) al entrar/salir de Metasploit.

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
- ✓ 436 tests unitarios (todos pasando)
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

### 📋 En Progreso / Planeado
- [ ] Tests para comandos faltantes (gobuster, arp-scan)
- [ ] Tests end-to-end (E2E)
- [ ] Más escenarios educativos
- [ ] Internacionalización (i18n) - inglés/español
- [ ] Modo tutorial con hints contextual
- [ ] Sistema de badges/logros

---

## � Estado del Proyecto (Actualizado: 25 de Marzo, 2026)

### 📈 Líneas de Código Actuales
- **Total**: ~14,000 líneas (excluyendo node_modules y cache)
- **Archivo más grande**: `happyPath.test.ts` (585 líneas)
- **Componente principal**: `Terminal.tsx` (431 líneas)
- **Estado global**: `scenarioStore.ts` (303 líneas)
- **Tests**: 436 tests unitarios pasando

### 🎯 Top 10 Archivos por Líneas
1. `happyPath.test.ts` - 585 líneas (Tests E2E)
2. `Terminal.tsx` - 431 líneas (Componente UI)
3. `README.md` - 371 líneas (Documentación)
4. `FakeBrowser.test.tsx` - 366 líneas (Tests)
5. `App.tsx` - 317 líneas (Componente principal)
6. `msfBase.test.ts` - 315 líneas (Tests Metasploit)
7. `NetworkMap.test.tsx` - 309 líneas (Tests)
8. `FakeBrowser.tsx` - 305 líneas (Componente UI)
9. `scenarioStore.ts` - 303 líneas (Estado Zustand)
10. `InclusionSite.tsx` - 299 líneas (Sitio simulado LFI)

### 🔧 Tareas Pendientes (Technical Debt)
- **URGENTE**: Modularizar `happyPath.test.ts` (585 líneas → archivos separados por ejercicio)
  - `happyPath-scenario01.test.ts`
  - `happyPath-scenario02.test.ts` 
  - `happyPath-scenario03.test.ts`
  - `happyPath-scenario04.test.ts`
  - `happyPath-scenario05.test.ts`
- **Mejora**: Reducir complejidad en `Terminal.tsx` (431 líneas)
- **Optimización**: Revisar componentes grandes >300 líneas

---

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

## 🔒 Seguridad

El proyecto simula comandos reales pero en un entorno controlado. **No hay código malicioso** ni acceso real a sistemas. Es solo educativo.

---

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo, modificarlo y compartirlo.

---

**Versión:** 2.6.0
**Última actualización:** 26 de Marzo, 2026
**Tecnologías:** React 18 + TypeScript + Vitest + Zustand
