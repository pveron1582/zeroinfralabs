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
- **Tests completos** - 195+ tests unitarios e integración (todos pasando ✓)
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
│   ├── arp-scan.ts
│   ├── nmap.ts
│   ├── gobuster.ts
│   ├── hydra.ts
│   └── ssh.ts
│
├── hosts/
│   ├── attacker01.ts                 # Kali attacker (compartido entre escenarios)
│   ├── server01.ts                   # WordPress vulnerable lab
│   └── server02.ts                   # SSH brute force target
│
├── exercises/
│   ├── scenarios.ts                  # ← Registry central. Agregar nuevos escenarios aquí.
│   ├── exercise01.ts                 # Escenario 1: WordPress Lab
│   └── exercise02.ts                 # Escenario 2: SSH Brute Force Lab
│
└── components/
    ├── Terminal.tsx
    ├── FakeBrowser.tsx
    ├── MissionPanel.tsx
    ├── NetworkMap.tsx
    └── fakesites/
        └── wordpress/
            └── wp01/
                ├── Index.tsx         # Página principal WP
                ├── Login.tsx         # Login /wp-admin (funcional)
                ├── Dashboard.tsx     # Dashboard post-login
                ├── Uploads.tsx       # Directory listing /uploads
                └── ConfigBak.tsx     # Visor raw de /uploads/config.bak
```

## 📚 Documentación

- **[REFACTORING.md](REFACTORING.md)** - Cambios de arquitectura (Zustand, templates, modularización)
- **[TESTING.md](TESTING.md)** - Tests implementados (195+ tests, todos pasando ✓)
- **[SECURITY.md](SECURITY.md)** - Consideraciones de seguridad

---

## 🚀 Actualizaciones Recientes (Marzo 2026)

### Comando Netcat (nc)
- ✅ Implementación de `nc` con soporte a listener (`-nlvp puerto`)
- ✅ Argumentos flexibles: acepta cualquier orden (`-nlvp`, `-pvnl`, `-lvnp`, etc.)
- ✅ Validación de puertos (1-65535)
- ✅ Terminal bloqueante: presiona 'c' para cancelar escucha
- ✅ 7+ tests para cobertura completa

### LFI-RCE Scenario (Escenario 4)
- ✅ Exploit completo de Local File Inclusion (LFI)
- ✅ Payload PHP con reverse shell realista
- ✅ Nuevo paso "Setup Listener" antes de ejecutar payload
- ✅ Detección automática de conexión RCE en terminal
- ✅ Validación de puerto de escucha vs payload

### Mejoras en Terminal
- ✅ Soporte para comandos bloqueantes (nc, listeners)
- ✅ Cierre automático al recibir conexión RCE
- ✅ Input oculto pero funcional para captura de teclas
- ✅ Persistencia de puerto de escucha en Zustand

---

1. Crear `src/hosts/serverXX.ts` con los datos de la máquina objetivo
2. Crear `src/exercises/exerciseXX.ts` con la configuración del escenario
3. Importar y agregar a `src/exercises/scenarios.ts` — nada más

## Cómo agregar un nuevo comando

1. Crear `src/commands/mi-comando.ts` exportando `const cmd_miComando`
2. Importar y agregar al array `COMMANDS` en `src/commands/index.ts`

## Build

Este proyecto usa TypeScript + React. Para buildear:

```bash
npm install
npm run build
```

El bundle single-file listo para Claude artifacts está en `zeroinfra-labs.jsx`.

---

## 🚀 Guía Rápida de Desarrollo

### Instalación y Setup

```bash
# Clonar el repositorio
git clone <repo>
cd zeroinfra-labs

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173 (ZI Labs)
```

### Comandos Disponibles

```bash
### Desarrollo
npm run dev              # Inicia servidor con hot-reload

### Testing  
npm test                 # Modo watch (re-ejecuta tests al guardar)
npm run test:run         # Ejecución única de tests
npm run test:coverage    # Reporte de cobertura
npm run test:ui          # UI interactiva para tests

### Build
npm run build            # Genera bundle optimizado
npm run preview          # Preview del build
```

### Estructura de Carpetas Explicada

```
src/
├── types.ts                      # Definiciones TypeScript (Machine, Scenario, Mission, etc)
├── App.tsx                       # Componente raíz de la aplicación
│
├── store/
│   ├── scenarioStore.ts          # Estado global (Zustand)
│   └── __tests__/                # Tests del store
│
├── commands/                     # Sistema de comandos modular
│   ├── index.ts                  # Registry central de comandos
│   ├── builtin/                  # Comandos del sistema
│   │   ├── help.ts, whoami.ts, ls.ts, cat.ts, etc
│   │   └── __tests__/            # Tests de comandos built-in
│   └── tools/                    # Herramientas de pentesting
│       ├── nmap.ts, ssh.ts, hydra.ts, msfconsole.ts, etc
│       ├── msfCommands/          # Submódulos de Metasploit
│       └── __tests__/            # Tests de herramientas
│
├── exercises/                    # Configuración de escenarios
│   ├── scenarios.ts              # Registry central (agregar nuevos aquí)
│   ├── exercise01.ts, exercise02.ts, exercise03.ts
│   ├── templates.ts              # Plantillas reutilizables
│   └── __tests__/
│
├── components/                   # Componentes React
│   ├── Terminal.tsx              # Terminal interactiva
│   ├── FakeBrowser.tsx           # Navegador web simulado
│   ├── NetworkMap.tsx            # Mapa de red interactivo
│   ├── MissionPanel.tsx          # Panel de misiones
│   ├── LandingPage.tsx           # Página de inicio
│   ├── MachineLoader.tsx         # Animación de carga
│   ├── fakesites/                # Sitios web simulados
│   │   └── wordpress/wp01/       # Instancia vulnerable de WordPress
│   └── __tests__/                # Tests de componentes (59 tests)
│
└── utils/
    └── network.ts                # Utilidades de red (DHCP, etc)
```

---

## 📚 Documentación Completa

- **[REFACTORING.md](REFACTORING.md)** - Cambios de arquitectura (Zustand, templates, modularización)
- **[TESTING.md](TESTING.md)** - Tests implementados (195+ tests, todos pasando ✓)
- **[SECURITY.md](SECURITY.md)** - Consideraciones de seguridad

---

## 🎓 Cómo Usar el Proyecto

### Como Usuario (Estudiante)

1. Accede a `http://localhost:5173`
2. Selecciona un laboratorio disponible (WordPress Lab, SSH Brute Force, etc)
3. Sigue las misiones progresivas en el panel derecho
4. Ejecuta comandos en la terminal:
   ```bash
   help                    # Ver comandos disponibles
   whoami                  # Identificarse (atacante vs objetivo)
   arp-scan -l 192.168.1.0/24  # Descubrir máquinas
   nmap -sV target-ip      # Escanear puertos
   gobuster dir -u http://target -w rockyou.txt  # Enumerar directorios
   ssh user@target         # Conectar por SSH
   ```

### Como Desarrollador (Contribuidor)

#### Agregar un Nuevo Comando

```bash
# 1. Crear archivo en src/commands/builtin/ o src/commands/tools/
# Ejemplo: src/commands/tools/mi-herramienta.ts

export const cmd_miHerramienta = {
  name: 'mi-herramienta',
  description: 'Descripción corta',
  execute: (args: string[], context: CommandContext) => {
    // Lógica del comando
    return { output: 'resultado' };
  }
};

# 2. Registrar en src/commands/index.ts
# 3. Crear tests en src/commands/tools/__tests__/mi-herramienta.test.ts
```

#### Agregar un Nuevo Escenario

```bash
# 1. Crear configuración de máquina en src/exercises/
# Ejemplo: src/exercises/exercise04.ts

export const scenario_04 = buildScenario({
  // configuración...
});

# 2. Exportar desde src/exercises/scenarios.ts
# 3. ¡Listo! Aparecerá automáticamente en la interfaz
```

#### Crear Tests

```bash
# Tests de componentes
src/components/__tests__/MyComponent.test.tsx

# Tests de comandos  
src/commands/tools/__tests__/my-tool.test.ts

# Ejecutar tests
npm test
```

---

## 📊 Estado del Proyecto

### ✅ Completado
- ✓ Sistema de terminal interactivo
- ✓ 3 escenarios educativos completos
- ✓ Integración con Metasploit Framework
- ✓ 166+ tests unitarios (todos pasando)
- ✓ State management con Zustand
- ✓ Navegador web simulado
- ✓ Mapa de red interactivo
- ✓ Persistencia de estado

### 📋 En Progreso / Planeado
- [ ] Tests para comandos faltantes (gobuster, arp-scan)
- [ ] Tests end-to-end (E2E)
- [ ] Más escenarios educativos
- [ ] Internacionalización (i18n) - inglés/español
- [ ] Modo tutorial con hints contextual
- [ ] Sistema de badges/logros

### 📋 BUGS ENCONTRADOS / MEJORAS
- [ ] 1. Sesion activa de maquina atacante dice TU ESTACION y deberia decir SESION ACTIVA
- [ ] 2. al ejecutar whoami en la conexion ssh, me dice admin y ademas me devuelve el hostname y la ip, cuando solo deberia ser el usuario
- [ ] 3. luego del escaneo con arp-scan, al ver en la topologia la maquina victima no dice el Sistema Operativo, pero al hacer click en la info si y no deberia verse hasta luego del escaneo del nmap.
- [ ] 4. los pasos de resolucion para eternalblue necesitan ser mas. para verificar la vulnerabilidad es demasiado berve para alguien que no sabe usarla. hay que agregar mas pasos. luego del escaneo de nmap paso 3. ingresar a metasploit con msfconsole 4. buscar exploit con comando "search ms17-010" 5. seleccionar con "use 0" para seleccionar auxiliar 6. ejecutar "show options" para ver opciones 7. ingresar "set rhosts 172.16.0.11" para indicar ip victima. 8. ejecutar run o exploit para comprobar si es vulnerable 9. ingresar back para salir del modulo 10. repetir comando "search ms17" para buscar exploit. 11. ingresar "use 1" 12. repetir configuracion de rhosts 13. configurar lhost con ip local 14. run o exploit. 15. ejecutar getuid para comprobar usuario admin windows
- [x] 5. agregar un sistema de directorios en las maquinas lo mas real posible con al menos algunos 
directorios importantes como el home de usuario y el root, algunos directorios de /etc con los archivos passwd y shadow. tambien el directorio /var/www/html y alguno otro que se considere muy importante para empezar.
- [ ] 6. revisar la carga de google en el browser. el navegador solamente valida www.gooogle.com y https://www.google.com pero tambien deberia validar al menos http://www.google.com y https://google.com y redirigir ambas a https://www.google.com
- [ ] 7. el escenario 5 de privesc funciona pero al escalar no cambia el prompt a root. y el dato del usuario developer lo brinda el step pero no dice en ningun lado de donde sale, asume que con el nmap directamente lo saca. podriamos poner un web site muy simple con alguna nota en el codigo que pida al usuario developer que cambie la contraseña por ser muy facil, asi el usuario interpreta que debe hacer bruteforce con hydra primero.
- [ ] 8. completar los test de los comandos nuevos como sudo y otros elementos agregados mas que nada dede el escenario 4 y 5.
- [ ] 9. Añadir si se ingresa el comando exit en la terminal sin ningun entonrno en especial, que al hacerlo me saque del laboratorio y vuelva al landingpage
- [ ] 10. tener en cuenta: El truco del "Comando no implementado" con Estilo
En lugar de un aburrido "Command not found", usa el realismo a tu favor. Si el usuario escribe un comando que existe en Linux pero tú no has programado (ej. iptables o tcpdump), puedes devolver mensajes como:
"Error: El binario /usr/bin/tcpdump requiere privilegios de kernel que no están disponibles en esta terminal restringida."
"Comando no instalado. El administrador ha eliminado esta herramienta para endurecer el sistema (Hardening)."
---

## 🔒 Seguridad

El proyecto simula comandos reales pero en un entorno controlado. **No hay código malicioso** ni acceso real a sistemas. Es solo educativo.

Para más detalles sobre consideraciones de seguridad, ver [SECURITY.md](SECURITY.md).

--

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de usarlo, modificarlo y compartirlo.

---

## 📧 Contacto y Contribuciones

¿Quieres contribuir? ¡Bienvenido! Puedes:
- Agregar nuevos comandos
- Crear nuevos escenarios
- Mejorar la documentación
- Reportar bugs
- Sugerir características

**Versión:** 2.0.0  
**Última actualización:** 17 de Marzo, 2026  
**Tecnologías:** React 18 + TypeScript + Vitest + Zustand
