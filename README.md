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

El proyecto está diseñado como un **simulador educativo** con misiones progresivas que guían al usuario a través de escenarios realistas de laboratorios de ciberseguridad.

### 🎯 Características Principales

- **Terminal interactiva** - Emula una shell Linux con comandos funcionales
- **Múltiples escenarios** - WordPress Lab, SSH Brute Force, EternalBlue, LFI-RCE + Próximo
- **Misiones progresivas** - Objetivos claros con niveles de descubrimiento
- **Navegador web simulado** - Acceso a sitios vulnerables dentro del simulador
- **Mapa de red** - Visualización del estado de máquinas (atacante y objetivos)
- **Persistencia de estado** - El progreso se guarda automáticamente
- **Tests completos** - 340+ tests unitarios e integración (todos pasando ✓)
- **Comando Netcat (nc)** - Listener activo con flexibilidad de argumentos
- **LFI-RCE Scenario** - Exploit completo de Local File Inclusion con reverse shell
- **Terminal bloqueante** - Soporte para comandos que requieren escucha (nc -nlvp)

### 🏗️ Arquitectura Modular

El proyecto está completamente refactorizado con:

- **Zustand** - State management centralizado
- **React + TypeScript** - UI moderna y type-safe
- **Vitest** - Testing framework
- **Tailwind CSS** - Estilos responsive
- **Comandos modularizados** - Fácil agregar nuevos comandos y escenarios
- **Separación clara** - Built-in commands vs Pentesting tools

### 🛠️ Stack Tecnológico

```
Frontend:     React 18 + TypeScript + Tailwind CSS
State:        Zustand
Build:        Vite
Testing:      Vitest + React Testing Library
Deployment:   Compatible con cualquier hosting estático
```

---

## 📂 Estructura del Proyecto

```
src/
├── types.ts                          # Todos los tipos TypeScript
├── App.tsx                           # Componente raíz
│
├── utils/
│   └── network.ts                    # assignDHCP helper
│
├── commands/
│   ├── index.ts                      # Registry central + executeCommand()
│   ├── builtin/                      # Comandos del sistema
│   │   ├── help.ts, whoami.ts, ls.ts, cat.ts, cd.ts, exit.ts
│   │   └── __tests__/                # Tests de comandos built-in
│   └── tools/                        # Herramientas de pentesting
│       ├── nmap.ts, ssh.ts, hydra.ts, msfconsole.ts, nc.ts
│       ├── msfCommands/              # Submódulos de Metasploit
│       └── __tests__/                # Tests de herramientas
│
├── exercises/                        # Configuración de escenarios
│   ├── scenarios.ts                  # Registry central
│   ├── exercise01.ts ~ exercise05.ts # Escenarios
│   └── templates.ts                  # Plantillas reutilizables
│
├── components/                       # Componentes React
│   ├── Terminal.tsx
│   ├── FakeBrowser.tsx
│   ├── NetworkMap.tsx
│   ├── MissionPanel.tsx
│   ├── LandingPage.tsx
│   └── fakesites/                    # Sitios web simulados
│
└── store/
    └── scenarioStore.ts              # Estado global (Zustand)
```
## 🔧 Fixes Aplicados (Completados)

### ✅ Fix #1: Resetear MSF State entre escenarios
**Archivo:** `src/App.tsx`
**Estado:** ✅ Completado
Se asegura que al cambiar de escenario, el estado de Metasploit se limpie correctamente.

### ✅ Fix #2: Limpiar blockingCommand al cambiar escenario
**Archivo:** `src/components/Terminal.tsx:102`
**Estado:** ✅ Completado
Agregada dependencia `allMachines.length` al useEffect para que se ejecute correctamente al cambiar de escenario.

### ✅ Fix #3: `whoami.ts` - Usar credenciales reales
**Archivo:** `src/commands/builtin/whoami.ts`
**Estado:** ✅ Completado
El comando ahora respeta el contexto SSH y devuelve el usuario correcto según las credenciales encontradas.

### ✅ Fix #4: `ssh.ts` - Buscar misión SSH dinámicamente
**Archivo:** `src/commands/tools/ssh.ts`
**Estado:** ✅ Completado
Reemplazado `Math.max` por búsqueda dinámica del step SSH por keywords.

### ✅ Fix #5: `nc.ts` - Validar contexto LFI
**Archivo:** `src/commands/tools/nc.ts`
**Estado:** ✅ Completado
Implementada función `findListenerMissionId()` para buscar dinámicamente el step de listener.

### ✅ Fix #6: `nmap.ts` y `gobuster.ts` - No mutar discovery_level
**Archivos:** `src/commands/tools/nmap.ts`, `src/commands/tools/gobuster.ts`
**Estado:** ✅ Completado
Eliminadas mutaciones directas de `discovery_level`. Ahora se actualiza solo vía `completeMission()`.

### ✅ Fix #7: Sincronizar blockingCommand en el store
**Archivo:** `src/store/scenarioStore.ts`
**Estado:** ✅ Completado
El store maneja correctamente el estado de comandos bloqueantes.

### ✅ Fix #8: `InclusionSite.tsx` - Normalización de paths LFI
**Archivo:** `src/components/fakesites/lfi_lab/InclusionSite.tsx`
**Estado:** ✅ Completado
Corregida la sanitización para permitir payloads LFI educativos como `../../../../etc/passwd`.

### ✅ Fix #9: `nmap.ts` - Actualizar discovery_level a 2
**Archivo:** `src/commands/tools/nmap.ts:51`
**Estado:** ✅ Completado
Nmap ahora actualiza `discovery_level` a 2 para que el NetworkMap muestre el SO después del escaneo.

### ✅ Fix #10: Resetear discovery_level al cambiar escenario
**Archivo:** `src/store/scenarioStore.ts:88,128`
**Estado:** ✅ Completado
Las máquinas se reinician con `discovery_level: 0` al seleccionar un escenario.

### ✅ Fix #11: Terminal no resetea `rceCompletedRef`
**Archivo:** `src/components/FakeBrowser.tsx`
**Estado:** ✅ Completado
Agregado useEffect para resetear el ref al cambiar de escenario.

### ✅ Fix #12: `whoami` muestra información extra
**Archivo:** `src/commands/builtin/whoami.ts`
**Estado:** ✅ Completado
Simplificado para mostrar solo el nombre de usuario.

### ✅ Fix #13: Sistema de directorios virtual
**Archivos:** `src/commands/builtin/cd.ts`, `src/commands/builtin/ls.ts`
**Estado:** ✅ Completado
Implementados comandos `cd` y `ls` con soporte para navegación de directorios.

### ✅ Fix #14: Comando `exit` para salir del laboratorio
**Archivo:** `src/commands/builtin/exit.ts`
**Estado:** ✅ Completado
El comando `exit` permite salir de la sesión SSH y volver al landing page desde la máquina atacante.

### ✅ Fix #15: Comando `end` para salir del laboratorio
**Archivo:** `src/commands/builtin/end.ts`
**Estado:** ✅ Completado
Nuevo comando `end` para salir del laboratorio y volver al landing page. El comando `exit` ahora solo cierra sesiones SSH.

### ✅ Fix #16: Credenciales verificadas en topología
**Archivos:** `src/components/Terminal.tsx`, `src/App.tsx`
**Estado:** ✅ Completado
Al conectarse por SSH exitosamente, las credenciales se marcan como verificadas (verde) en el NetworkMap.

### ✅ Fix #17: Modularización de escenarios (Opción C)
**Archivos:** `src/exercises/templates.ts`, `src/exercises/exercise01.ts`, `src/exercises/exercise02.ts`
**Estado:** ✅ Completado (Labs 1 y 2)
Refactorización completa para eliminar código duplicado:
- `templates.ts`: Contiene solo funciones comunes reutilizables
- `exercise01.ts`: Solo datos específicos del escenario WordPress
- `exercise02.ts`: Solo datos específicos del escenario SSH Brute Force
- Cada escenario importa funciones de `templates.ts` vía `buildScenario()`

**Pendiente:** Aplicar la misma modularización a:
- [ ] `exercise03.ts` (EternalBlue)
- [ ] `exercise04.ts` (LFI-RCE)
- [ ] `exercise05.ts` (PrivEsc)

---

## 🐛 Bugs Pendientes (Por Resolver)

### 🔴 Bug #1: Sesión activa de máquina atacante dice "TU ESTACION"
**Descripción:** En el NetworkMap, la máquina atacante activa muestra "TU ESTACION" en lugar de "SESION ACTIVA".
**Prioridad:** Media

### 🔴 Bug #2: `whoami` en conexión SSH muestra hostname e IP
**Descripción:** Al ejecutar `whoami` en una sesión SSH, muestra información adicional (hostname, IP) cuando solo debería mostrar el nombre de usuario.
**Prioridad:** Media

### 🔴 Bug #3: OS visible en topología tras arp-scan
**Descripción:** Luego del escaneo con arp-scan, al ver la topología de red la máquina víctima muestra el Sistema Operativo, pero debería verse "Desconocido" hasta ejecutar nmap.
**Prioridad:** Alta

### 🔴 Bug #4: Pasos de EternalBlue necesitan más detalle
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

### 🟠 Bug #5: Validación de navegador (google.com)
**Descripción:** El navegador solo valida `www.google.com` y `https://www.google.com`, pero debería aceptar también `http://www.google.com` y `https://google.com` redirigiendo a la URL canónica.
**Prioridad:** Baja

### 🟠 Bug #6: Escenario 5 - PrivEsc no cambia prompt a root
**Descripción:** Al escalar privilegios con `sudo vim -c '!bash'`, el prompt no cambia a `root@hostname`.
**Prioridad:** Media

### 🟠 Bug #7: Escenario 5 - Validaciones de steps
**Descripción:** Al ejecutar SSH, no se marca como confirmada la info de credenciales en la topología. Al ejecutar `sudo -l`, el step no cambia a confirmado.
**Prioridad:** Alta

### 🟡 Bug #8: Comandos no implementados con estilo
**Descripción:** En lugar de "Command not found", mostrar mensajes realistas del estilo: "Error: El binario /usr/bin/tcpdump requiere privilegios de kernel que no están disponibles en esta terminal restringida."
**Prioridad:** Baja

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
- ✓ Sistema de terminal interactivo
- ✓ 5 escenarios educativos completos
- ✓ Integración con Metasploit Framework
- ✓ 340+ tests unitarios (todos pasando)
- ✓ State management con Zustand
- ✓ Navegador web simulado
- ✓ Mapa de red interactivo
- ✓ Persistencia de estado
- ✓ Sistema de directorios virtual (cd, ls)
- ✓ Comando exit funcional

### 📋 En Progreso / Planeado
- [ ] Tests para comandos faltantes (gobuster, arp-scan)
- [ ] Tests end-to-end (E2E)
- [ ] Más escenarios educativos
- [ ] Internacionalización (i18n) - inglés/español
- [ ] Modo tutorial con hints contextual
- [ ] Sistema de badges/logros

---

## 🔒 Seguridad

El proyecto simula comandos reales pero en un entorno controlado. **No hay código malicioso** ni acceso real a sistemas. Es solo educativo.

---

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo, modificarlo y compartirlo.

---

**Versión:** 2.0.0
**Última actualización:** 23 de Marzo, 2026
**Tecnologías:** React 18 + TypeScript + Vitest + Zustand
