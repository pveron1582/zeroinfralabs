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
├── commands/
│   ├── builtin/            # Comandos del sistema
│   │   ├── cat.ts
│   │   ├── cd.ts
│   │   ├── clear.ts
│   │   ├── ls.ts
│   │   ├── sudo.ts
│   │   └── whoami.ts
│   ├── tools/              # Herramientas de pentesting
│   │   ├── nmap.ts
│   │   ├── hydra.ts
│   │   ├── gobuster.ts
│   │   ├── arp-scan.ts
│   │   ├── msfconsole.ts
│   │   └── msfCommands/    # Subcomandos de Metasploit
│   │       ├── msfBase.ts
│   │       ├── msfExploits.ts
│   │       └── msfMeterpreter.ts
│   ├── index.ts            # Registro central de comandos
│   └── __tests__/          # Happy path tests
├── components/             # Componentes React
│   ├── Terminal.tsx
│   ├── FakeBrowser.tsx
│   ├── NetworkMap.tsx
│   ├── MissionPanel.tsx
│   ├── LandingPage.tsx
│   ├── LabGrid.tsx
│   └── __tests__/          # Tests de componentes
├── frameworks/
│   ├── metasploit/         # Framework MSF
│   │   ├── core/
│   │   │   ├── ModuleLoader.ts
│   │   │   └── SessionManager.ts
│   │   ├── modules/
│   │   │   └── data/
│   │   │       └── exploits/
│   │   │           └── ms17_010_eternalblue.ts
│   │   └── commands/
│   └── shells/             # Sesiones interactivas
│       ├── ssh/
│       ├── ftp/
│       └── nc/
├── laboratorios/           # Definición de 6 escenarios
│   ├── laboratorio01.ts    # WordPress
│   ├── laboratorio02.ts    # Web OSINT & SSH
│   ├── laboratorio03.ts    # EternalBlue
│   ├── laboratorio04.ts    # LFI to RCE
│   ├── laboratorio05.ts    # FTP + PrivEsc
│   └── laboratorio06.ts    # SQL Injection
├── store/                  # Estado global
│   ├── scenarioStore.ts
│   ├── selectors.ts
│   └── __tests__/
├── fs-models/              # Filesystems virtuales
│   ├── fs-linux.ts
│   └── fs-windows.ts
├── utils/                  # Utilidades
│   ├── labValidator.ts     # Validador universal (14 criterios)
│   ├── autocomplete.ts
│   ├── network.ts
│   ├── analytics.ts
│   ├── networkAlert.ts
│   └── donationMessage.ts
├── hooks/                  # Custom React hooks
│   ├── useKeyboardShortcuts.ts
│   └── useTerminalIdentity.ts
├── i18n/                   # Internacionalización
│   └── translations.ts
└── test/                   # Configuración de tests
    └── setup.ts
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
