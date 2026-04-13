# QWEN.md — ZeroInfra Labs Context

## Project Overview

**ZeroInfra Labs** is an interactive web-based pentesting simulator built with **React 18 + TypeScript + Vite**. It simulates a cybersecurity learning environment where users can execute real hacking commands against virtual machines (attacker Kali Linux + target machines) through progressive lab scenarios.

### Key Features
- **Interactive terminal** with Linux-like shell, autocomplete (Tab), and keyboard shortcuts (Ctrl+L/C/U)
- **5 progressive labs**: WordPress Exploitation, SSH Brute Force, EternalBlue (MS17-010), LFI/RCE, FTP Enumeration & Privilege Escalation
- **Pentesting tools**: nmap, arp-scan, hydra, gobuster, msfconsole (Metasploit), ssh, ftp, nc (netcat), hashcat
- **Simulated browser** for web-based attacks and OSINT
- **Network map** and enumeration panels for visualization
- **Virtual filesystem** (Linux & Windows) with realistic directory structures
- **i18n** support (English/Spanish)
- **Analytics & surveys** via Google Sheets webhook
- **740+ passing tests** (Vitest + React Testing Library)

### Tech Stack
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| State | Zustand (with localStorage persistence) |
| Testing | Vitest 4.x + React Testing Library + jsdom |
| Routing | React Router DOM v7 |

---

## Commands Reference

### Development
```bash
npm run dev              # Dev server with hot-reload
npm run build            # Production build (includes TS type-check)
npm run preview          # Preview production build
npx tsc --noEmit         # TypeScript type-check only
```

### Testing
```bash
npm test                 # Watch mode
npm run test:run         # Single run (CI-friendly)
npm run test:coverage    # Coverage report (v8)
npm run test:ui          # Interactive Vitest UI

# Single test by file
npm test -- src/commands/builtin/__tests__/ls.test.ts

# Single test by name filter
npm test -- -t "debe listar archivos"
```

### Linting/Formatting
No ESLint or Prettier. Type checking via `npx tsc --noEmit`.

---

## Project Structure

```
src/
├── types.ts                          # All TypeScript interfaces (Machine, CommandResponse, etc.)
├── App.tsx                           # Root component (routing, workspace, analytics)
├── main.tsx                          # Entry point
├── index.css                         # Global styles
│
├── commands/
│   ├── index.ts                      # Command registry + executeCommand()
│   ├── builtin/                      # ls, cd, cat, sudo, whoami, ifconfig, hashcat, help, etc.
│   └── tools/                        # nmap, ssh, hydra, gobuster, msfconsole, nc, ftp, arp-scan
│
├── frameworks/                       # Unified pentesting frameworks
│   ├── metasploit/                   # Metasploit (ModuleLoader, SessionManager, ContextRegistry)
│   └── shells/                       # Interactive shells (FTP, SSH, NC sessions)
│       ├── ftp/                      # FTP command + FtpSession
│       ├── ssh/                      # SSH command + SshSession
│       └── nc/                       # Netcat command + NcSession
│
├── components/
│   ├── Terminal.tsx                  # Main interactive terminal (~440 lines)
│   ├── FakeBrowser.tsx               # Simulated web browser
│   ├── NetworkMap.tsx                # Network topology visualization
│   ├── EnumerationPanel.tsx          # Machine details / enumeration progress
│   ├── MissionPanel.tsx              # Mission objectives + hints carousel
│   ├── MachineLoader.tsx             # Loading screen with countdown
│   ├── LandingPage.tsx               # Home / lab selection screen
│   ├── SurveyModal.tsx               # Post-lab survey modal
│   ├── FeedbackModal.tsx             # General feedback modal with captcha
│   ├── LabCompletionOverlay.tsx      # Completion animation (confetti + trophy)
│   └── fakesites/                    # Simulated vulnerable websites (WordPress, LFI lab, etc.)
│
├── store/
│   ├── scenarioStore.ts              # Zustand global state (persisted to localStorage)
│   ├── types.ts                      # Store type definitions
│   └── selectors.ts                  # Memoized selectors
│
├── fs-models/
│   ├── fs-linux.ts                   # Linux virtual filesystem
│   └── fs-windows.ts                 # Windows virtual filesystem
│
├── laboratorios/
│   ├── laboratorios.ts               # SCENARIOS registry
│   ├── laboratorio01.ts ~ 05.ts      # Individual lab scenarios
│   ├── templates.ts                  # Scenario building helpers
│   └── attackers/                    # Attacker machines (Kali Linux factory)
│
├── hooks/                            # Custom React hooks
│   ├── useKeyboardShortcuts.ts       # Ctrl+L/C/U, Tab, arrow keys
│   └── useTerminalIdentity.ts        # SSH user / root prompt logic
│
├── utils/
│   ├── autocomplete.ts               # Tab-completion system
│   ├── network.ts                    # assignDHCP helper
│   ├── networkAlert.ts               # Enumeration change detection
│   ├── labValidator.ts               # Universal mission validation engine
│   └── analytics.ts                  # Google Sheets webhook integration
│
├── i18n/
│   └── translations.ts               # EN/ES translation dictionary
│
└── test/
    └── setup.ts                      # Vitest setup (mocks, localStorage cleanup, store reset)
```

---

## Architecture Highlights

### Universal Validation System
Commands are **completely decoupled** from lab logic. Commands return metadata in `CommandResponse`, and a `LabValidator` compares it against `validationCriteria` defined declaratively in each lab's missions.

```
Commands (free) → CommandResponse (metadata) → LabValidator → Mission complete/incomplete
```

### Command Pattern
Every command exports an object with `name` and `execute`:

```typescript
export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], context: CommandContext): CommandResponse => { ... }
};
```

### State Management
- Global state via **Zustand** with `persist` middleware (localStorage)
- Access in components: `useScenarioStore()` hook
- Access outside components: `useScenarioStore.getState()`
- Reset in tests: `useScenarioStore.setState({...}, true)`

### Error Handling
- **Never throw** — return `{ output: string, isError?: boolean }`
- User-facing error messages are in **Spanish**
- Early returns for validation errors

---

## Coding Conventions

### Naming
| Item | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `ls.ts`, `scenarioStore.ts` |
| Components | `PascalCase` | `Terminal.tsx` |
| Commands | `cmd_<name>` export | `cmd_ls`, `cmd_ssh` |
| Types | PascalCase | `Machine`, `CommandResponse` |
| Tests | `<name>.test.ts` | inside `__tests__/` |

### File Headers
```typescript
// ── commands/builtin/ls.ts ───────────────────────────────────────
```

### Import Order
1. External libraries (e.g., `zustand`, `react`)
2. Internal types (`import type`)
3. Internal modules

### TypeScript
- Always use explicit types for function params/returns
- Use `type` for unions/primitives, `interface` for objects
- Use `import type` for type-only imports
- `strict: false` in tsconfig (relaxed)

### React Components
- Functional components with explicit prop interfaces
- Keep files focused (<300 lines preferred)
- Tailwind CSS v4 classes directly in JSX (no CSS modules)

### Testing
- Spanish descriptions: `it('debe listar archivos', ...)`
- Command tests: call `.execute(args, context)` and assert on `result.output`
- Component tests: `render()`, `screen.getByText()`, `fireEvent`
- Use `vi.fn()` for mocks

**Test helper pattern:**
```typescript
const createMachine = (files): Machine => ({
  id: 'test-machine',
  machine_info: { hostname: 'test', ip: '10.0.0.1', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files,
});
```

---

## Adding a New Command

1. Create file in `src/commands/builtin/` (system) or `src/commands/tools/` (pentesting)
2. Export `cmd_<name>` object with `name` + `execute`
3. Register in `src/commands/builtin/index.ts` or `src/commands/tools/index.ts`
4. Import and add to `COMMANDS` array in `src/commands/index.ts`
5. Add tests in `__tests__/` directory

---

## Labs Overview

| Lab | Title | Focus |
|---|---|---|
| 01 | WordPress Exploitation | Web enumeration, config.bak, CMS exploitation |
| 02 | Web OSINT & SSH Compromise | OSINT on corporate sites, hydra brute force |
| 03 | EternalBlue (MS17-010) | Metasploit, Meterpreter, privilege escalation |
| 04 | Local File Inclusion (LFI) | LFI → RCE via PHP upload + netcat reverse shell |
| 05 | FTP Enumeration & Privilege Escalation | Anonymous FTP, hydra SSH, sudo vim privesc |

---

## Known Bugs
- **Bug #3**: SSH credentials not confirmed in topology
- **Bug #6**: PrivEsc doesn't change prompt to root

---

## Environment Setup

Create `.env.local` for analytics webhook:
```env
VITE_ANALYTICS_WEBHOOK=https://script.google.com/macros/s/YOUR_ID/exec
```

Without this variable, analytics tracking is silently disabled.
