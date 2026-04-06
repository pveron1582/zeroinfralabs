# Lab Specification — ZeroInfra Labs

## Overview

Un **Laboratorio** (o **Scenario**) es un escenario educativo completo que simula un entorno de pentesting. Cada lab consiste en:

- **Máquinas virtuales** (atacante + objetivos) con servicios, archivos y vulnerabilidades
- **Misiones progresivas** que guían al usuario paso a paso
- **Herramientas de pentesting** simuladas que interactúan con las máquinas
- **Sistema de archivos virtual** donde el usuario puede leer, escribir y encontrar credenciales

### Flujo típico de un lab

```
Reconocimiento → Escaneo → Enumeración → Explotación → Post-explotación → Flag
   (arp-scan)     (nmap)    (gobuster)    (hydra/msf)     (ssh/cat)      (flag.txt)
```

---

## Estructura de Archivos

```
src/
├── laboratorios/
│   ├── laboratorios.ts              # Registro central (array SCENARIOS)
│   ├── laboratorio01.ts             # Escenario 1: WordPress
│   ├── laboratorio02.ts             # Escenario 2: SSH Brute Force
│   ├── ...                          # Más escenarios
│   └── templates.ts                 # Funciones reutilizables (buildScenario, COMMON_PORTS, createFile)
│
├── commands/tools/                  # Herramientas de pentesting
│   ├── nmap.ts, hydra.ts, gobuster.ts, ssh.ts, arp-scan.ts, ...
│   └── msfCommands/                 # Módulos de Metasploit
│
├── components/fakesites/            # Sitios web simulados
│   ├── WordPressSite.tsx            # Router de contenido WordPress
│   ├── ConsultancySite.tsx          # Sitio corporativo (OSINT)
│   ├── lfi_lab/                     # Laboratorio LFI
│   └── wordpress/wp01/              # Componentes WordPress individuales
│
├── fs-models/                       # Sistemas de archivos virtuales
│   ├── fs-linux.ts                  # Estructura Linux completa
│   └── fs-windows.ts                # Estructura Windows completa
│
└── types.ts                         # Todas las interfaces TypeScript
```

---

## Anatomía de un Scenario

Cada laboratorio se define en su archivo `laboratorioXX.ts` y se registra en `laboratorios.ts`.

### 1. Metadata del Scenario

```typescript
const scenario01Data = {
  id: 'scenario-01',                    // Identificador único
  name: 'WordPress Vulnerable Lab',     // Nombre visible
  tagline: 'Enumerate hidden paths...', // Texto corto para la card del landing
  taglineEs: 'Enumera rutas ocultas...',// Versión en español
  description: 'Web enumeration...',    // Descripción completa
  descriptionEs: 'Enumeración web...',  // Versión en español
  tools: ['arp-scan', 'nmap', 'gobuster', 'ssh'], // Herramientas principales
  accentColor: '#22d3ee',               // Color del lab en la UI
  difficulty: 'Medium',                 // Easy | Medium | Hard
  category: 'Web',                      // Web | Network | System
  networkRange: '192.168.1.0/24',       // Rango de red del lab
};
```

### 2. Target Machine

```typescript
targetMachine: {
  id: 'lab-scenario-01-wp',             // Identificador único de la máquina
  hostname: 'vulnerable-wp-lab',        // Nombre del host
  mac: '08:00:27:A1:B2:C3',            // Dirección MAC (prefijo indica virtualización)
  os: 'Ubuntu 20.04 LTS',              // Sistema operativo
  type: 'server',                       // server | workstation

  // Puertos abiertos/filtrados (se muestran con nmap)
  ports: [
    { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu' },
    { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
    { port: 3306, protocol: 'tcp', state: 'filtered', service: 'mysql', version: 'unknown' },
  ],

  // Para máquinas con servicios web
  webServer: 'Apache/2.4.41',
  cms: 'WordPress 6.0',

  // Directorios web (se muestran con gobuster o navegación)
  directories: [
    { path: '/', status: 200, description: 'Página principal' },
    { path: '/wp-admin', status: 200, description: 'Panel de administración' },
    { path: '/uploads', status: 200, description: 'Archivos subidos' },
    { path: '/backup', status: 403, description: 'Acceso denegado' },
  ],
}
```

**Nota sobre `state` de puertos:**
- `'open'` → Puerto abierto, servicio activo
- `'filtered'` → Firewall bloquea, no se puede determinar
- `'closed'` → Puerto accesible pero sin servicio

### 3. Credentials y Flags

```typescript
credentials: {
  wpAdmin: { user: 'admin', pass: 'P@ssw0rd123!' },
  ssh:     { user: 'root', pass: 'R00t@SSH2024!' },
},
flags: {
  user: 'ZIL{USER_WP_GRANTED}',    // Flag de usuario (opcional)
  root: 'ZIL{ROOT_WP_ACHIEVED}',   // Flag de root (objetivo final)
},
```

### 4. Learning Steps

Cada paso es una misión que el usuario debe completar. Se definen en orden progresivo:

```typescript
learningSteps: [
  {
    task: 'Network Reconnaissance',        // Título del paso
    taskEs: 'Reconocimiento de red',       // Título en español
    text: 'Discover the active hosts...',  // Descripción
    textEs: 'Descubrí los hosts activos...', // Descripción en español
    discoveryLevel: 1,                     // Nivel de descubrimiento requerido
    hints: {
      hint1: { en: 'Use arp-scan', es: 'Usá arp-scan' },
      hint2: { en: 'arp-scan 192.168.1.0/24', es: 'arp-scan 192.168.1.0/24' }
    }
  },
  // ... más pasos
]
```

**`discoveryLevel`** indica en qué nivel de descubrimiento se encuentra la máquina tras completar este paso:
- `1` → Host descubierto (arp-scan)
- `2` → Puertos escaneados (nmap)
- `3` → Servicios enumerados (gobuster, hydra)
- `4` → Acceso comprometido (ssh, exploit)

### 5. Archivos de la Máquina

Los archivos se definen en el array `files` de la máquina. Se usan las funciones helper de `templates.ts`:

```typescript
import { createFile, createLinuxFileSystem } from './templates';

files: [
  ...createLinuxFileSystem({ username: 'admin' }),  // Sistema base Linux
  createFile('/home/admin/user.txt', 'ZIL{USER_WP_GRANTED}'),
  createFile('/root/flag.txt', 'ZIL{ROOT_WP_ACHIEVED}'),
  createFile('/uploads/config.bak', `
# WordPress Configuration Backup
WP_ADMIN_USER = admin
WP_ADMIN_PASS = P@ssw0rd123!
  `.trim(), 'text'),
]
```

**Tipos de archivo:**
- `'text'` → Contenido legible (default)
- `'binary'` → Contenido binario (se muestra como `[binary]`)

---

## Discovery Level — Sistema de Progresión

El `discovery_level` controla qué información está disponible sobre una máquina en cada momento:

| Nivel | Qué significa | Cómo se alcanza | Qué se muestra en la UI |
|-------|--------------|-----------------|------------------------|
| `0` | No descubierta | Estado inicial | Nada (oculta del mapa de red) |
| `1` | Host encontrado | `arp-scan` en el rango | IP, hostname, MAC en el mapa |
| `2` | Puertos escaneados | `nmap -sV` | Puertos abiertos, servicios |
| `3` | Servicios enumerados | `gobuster`, `hydra`, navegación web | Directorios, credenciales |
| `4` | Acceso comprometido | `ssh`, exploit exitoso | Máquina marcada como comprometida |

**Regla:** Una herramienta puede requerir un `discovery_level` mínimo antes de ejecutarse. Por ejemplo, `nmap` requiere nivel ≥ 1 (el host debe estar descubierto).

---

## Missions — Sistema de Misiones

Las **Missions** se generan automáticamente desde los `learningSteps` mediante `buildScenario()`. Cada step se convierte en una misión:

```typescript
// Generado automáticamente por buildScenario()
missions: [
  { id: 1, title: 'Network Reconnaissance', status: 'active', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 1, hintLevel: 0 },
  { id: 2, title: 'Port Scanning', status: 'pending', targetMachineId: 'lab-scenario-01-wp', discoveryLevel: 2, hintLevel: 0 },
  // ...
]
```

### Cómo se completa una misión

Cada herramienta decide si completa una misión basándose en:

1. **Keyword matching** en `learning_steps.task` (busca "escaneo", "nmap", "hydra", etc.)
2. **`currentMissionId`** del contexto (la misión actualmente activa)
3. **Validación del resultado** (IP correcta, servicio encontrado, credenciales válidas)

```typescript
// Ejemplo: nmap.ts
return {
  output: '...',
  completedMissionId: canComplete ? missionId : undefined,  // Completa la misión
  discoveredPorts: target.id,  // Dispara pulso en el mapa de red
};
```

### Flujo de completado

```
Usuario ejecuta comando
  → Herramienta procesa y devuelve CommandResponse
    → Terminal.processCommandResult() inspecciona completedMissionId
      → scenarioStore.completeMission(id)
        → Marca misión como 'completed'
        → Activa siguiente misión
        → Actualiza discovery_level de la máquina
        → Muestra notificación
```

---

## Herramientas Soportadas

### arp-scan
```bash
arp-scan 192.168.1.0/24
```
Descubre hosts en la red. Requiere rango CIDR. Setea `discovery_level = 1`.

### nmap
```bash
nmap -sV 192.168.1.10          # Escaneo con versiones
nmap -sS -p 22,80 192.168.1.10 # SYN scan, puertos específicos
nmap -sV -p- 192.168.1.10      # Todos los puertos
nmap -sV -oN scan.txt 192.168.1.10  # Guardar output a archivo
nmap -sn 192.168.1.10          # Ping scan (solo host discovery)
nmap -O 192.168.1.10           # OS detection
nmap -sV -vv -O 192.168.1.10   # Verbose + OS detection
nmap -h                        # Ayuda completa
```

**Flags soportadas:** `-sS`, `-sT`, `-sV`, `-sn`, `-sP`, `-Pn`, `-O`, `-A`, `-v`, `-vv`, `-vvv`, `-p`, `-p-`, `-oN`, `-oG`, `-h`, `--help`

**Requiere:** `discovery_level >= 1` (salvo con `-Pn`)
**Setea:** `discovery_level = 2`

### gobuster
```bash
gobuster dir -u http://192.168.1.10 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
```

**Requiere:** `discovery_level >= 2`, wordlist `common.txt` de SecLists

### hydra
```bash
hydra -l root -P /usr/share/wordlists/rockyou.txt 192.168.1.10 ssh
```

**Requiere:** `discovery_level >= 2`, wordlist `rockyou.txt`, credenciales correctas en el puerto del servicio

### ssh
```bash
ssh root@192.168.1.10 R00t@SSH2024!
```

**Requiere:** Puerto SSH abierto, credenciales válidas

### msfconsole
```bash
msfconsole
> use auxiliary/scanner/smb/smb_ms17_010
> set rhosts 172.16.0.11
> run
> use exploit/windows/smb/ms17_010_eternalblue
> set RHOSTS 172.16.0.11
> set LHOST 172.16.0.10
> exploit
> getuid
```

### nc (Netcat)
```bash
nc -nlvp 4444    # Listener para reverse shell
```

### ftp
```bash
ftp 192.168.30.11    # Conexión FTP interactiva
```

---

## CommandResponse — Estructura de Respuesta

Toda herramienta devuelve un objeto `CommandResponse`:

```typescript
interface CommandResponse {
  output: string;                    // Texto que se muestra en terminal
  isError?: boolean;                 // Si es true, se muestra en rojo

  // Efectos secundarios
  completedMissionId?: number;       // ID de misión a completar
  newMachineId?: string;             // Cambiar máquina activa
  discoveredPorts?: string;          // machineId — dispara pulso en mapa
  foundCredentials?: { machineId, user, pass, file, service };
  foundVulnerability?: { machineId, vulnId, status };
  createdFiles?: FileEntry[];        // Archivos creados (nmap -oN)
  downloadedFile?: FileEntry;        // Archivo descargado (ftp get)
  blockingCommand?: BlockingCommand; // Comando bloqueante (nc listener)
  streamingLineDelays?: number[];    // Delays para streaming línea por línea
  // ... más campos opcionales
}
```

---

## CommandContext — Contexto de Ejución

Cada herramienta recibe un `CommandContext`:

```typescript
interface CommandContext {
  machine: Machine;           // Máquina atacante (kali)
  allMachines: Machine[];     // Todas las máquinas del escenario
  currentMissionId: number;   // Misión actualmente activa
  currentDir: string;         // Directorio actual
  setCurrentDir?: (dir: string) => void;
  listeningPort?: number | null;  // Puerto del listener nc
  language?: 'en' | 'es';
}
```

---

## Flujos de Datos Completos

### Ejemplo: Lab 1 — WordPress (paso a paso)

```
┌─────────────────────────────────────────────────────────────────┐
│ Paso 1: Network Reconnaissance (discoveryLevel: 1)              │
│ Comando: arp-scan 192.168.1.0/24                                │
│ Tool: arp-scan.ts                                               │
│ Valida: rango CIDR válido                                       │
│ Output: lista de hosts encontrados                              │
│ Efecto: completedMissionId=1, discovery_level=1                 │
├─────────────────────────────────────────────────────────────────┤
│ Paso 2: Port Scanning (discoveryLevel: 2)                       │
│ Comando: nmap -sV 192.168.1.11                                  │
│ Tool: nmap.ts                                                   │
│ Valida: discovery_level >= 1, IP existe                         │
│ Output: tabla de puertos/servicios                              │
│ Efecto: completedMissionId=2, discovery_level=2                 │
├─────────────────────────────────────────────────────────────────┤
│ Paso 3: Web Enumeration (discoveryLevel: 2)                     │
│ Acción: Navegar a http://192.168.1.11 en el FakeBrowser         │
│ Component: WordPressSite.tsx                                    │
│ Valida: puerto 80 abierto                                       │
│ Efecto: completedMissionId=3                                    │
├─────────────────────────────────────────────────────────────────┤
│ Paso 4: Directory Discovery (discoveryLevel: 3)                 │
│ Comando: gobuster dir -u http://192.168.1.11 -w common.txt     │
│ Tool: gobuster.ts                                               │
│ Valida: discovery_level >= 2, wordlist correcta                 │
│ Output: lista de directorios encontrados                        │
│ Efecto: completedMissionId=4                                    │
├─────────────────────────────────────────────────────────────────┤
│ Paso 5: WP-Admin Compromise (discoveryLevel: 3)                 │
│ Acción: Navegar a /uploads → encontrar config.bak → credenciales│
│ Component: Uploads.tsx, ConfigBak.tsx                           │
│ Acción: Navegar a /wp-admin → login con credenciales            │
│ Efecto: completedMissionId=5                                    │
├─────────────────────────────────────────────────────────────────┤
│ Paso 6: SSH Connection (discoveryLevel: 4)                      │
│ Comando: ssh root@192.168.1.11 R00t@SSH2024!                   │
│ Tool: ssh.ts                                                    │
│ Valida: puerto 22 abierto, credenciales correctas               │
│ Efecto: completedMissionId=6, discovery_level=4                 │
├─────────────────────────────────────────────────────────────────┤
│ Paso 7: Capture Root Flag (discoveryLevel: 4)                   │
│ Comando: cat /root/flag.txt                                     │
│ Tool: cat.ts (builtin)                                          │
│ Valida: archivo existe                                          │
│ Efecto: completedMissionId=7                                    │
│ Resultado: Todas las misiones completadas → overlay de victoria │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checklist para Crear un Lab Nuevo

### 1. Definir el escenario
- [ ] `id` único (`scenario-XX`)
- [ ] `name` descriptivo
- [ ] `tagline` y `taglineEs` (cortos, para cards)
- [ ] `description` y `descriptionEs`
- [ ] `tools` (array de herramientas principales)
- [ ] `accentColor` (color hexadecimal)
- [ ] `difficulty` (Easy/Medium/Hard)
- [ ] `category` (Web/Network/System)
- [ ] `networkRange` (CIDR)

### 2. Definir máquinas
- [ ] **Attacker**: usar factory de `kali.ts`
- [ ] **Target(s)**: definir `id`, `hostname`, `mac`, `os`, `type`
- [ ] **Puertos**: definir cada puerto con `port`, `protocol`, `state`, `service`, `version`
- [ ] **Credenciales**: asociar a puertos relevantes (`credentials: { user, pass }`)
- [ ] **Web** (si aplica): definir `webServer`, `cms`, `directories`
- [ ] **Files**: sistema de archivos + archivos custom (flags, configs)

### 3. Definir learning steps
- [ ] Cada step tiene `task`, `taskEs`, `text`, `textEs`
- [ ] `discoveryLevel` correcto para cada paso
- [ ] `hints.hint1` (herramienta) y `hints.hint2` (comando específico)
- [ ] Orden lógico: recon → scan → enum → exploit → post → flag

### 4. Registrar el escenario
- [ ] Importar en `laboratorios/laboratorios.ts`
- [ ] Agregar al array `SCENARIOS`
- [ ] Verificar que `initialMachineId` apunte a la máquina atacante

### 5. Crear fakesites (si aplica)
- [ ] Componente en `components/fakesites/`
- [ ] Router en `FakeBrowser.tsx` si es un sitio nuevo
- [ ] Tests en `__tests__/`

### 6. Tests
- [ ] `happyPath-scenarioXX.test.ts` con el flujo completo
- [ ] Tests de herramientas específicas si hay lógica nueva
- [ ] `npm test` pasa todos los tests

### 7. Validación final
- [ ] `npm run build` compila sin errores
- [ ] `npm run dev` funciona en el navegador
- [ ] El flujo completo funciona de principio a fin
- [ ] Las misiones se completan en orden
- [ ] Los hints aparecen correctamente
- [ ] El mapa de red se actualiza

---

## Arquitectura Planificada: Command Evaluator

> **Estado:** Planificada — ver README.md para detalles completos

Actualmente cada herramienta decide por su cuenta si completa una misión. La mejora planificada separa:

| Capa | Responsabilidad | Archivos |
|------|----------------|----------|
| **Herramientas** | Ejecutan y reportan estado (`error`/`fail`/`success`) | `nmap.ts`, `hydra.ts`, etc. |
| **Command Evaluator** | Compara resultado contra condiciones del lab | `commandEvaluator.ts` (nuevo) |
| **Laboratorios** | Declaran condiciones por step | `laboratorio01.ts`–`05.ts` |

Esto permitirá:
- Agregar herramientas alternativas sin modificar código existente
- Labs que acepten múltiples herramientas para el mismo objetivo
- Definir prerrequisitos declarativos por step

---

*Última actualización: Abril 2026*
*Basado en: laboratorio01.ts (WordPress Vulnerable Lab)*
