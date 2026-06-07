# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ZeroInfra Labs** — a browser-based pentesting simulator (React 18 + TypeScript + Vite). 6 progressive labs that teach offensive security through simulated Linux/Windows machines, a functional terminal, and a fake browser. No VMs, no real exploits — everything runs in the browser with deterministic, scripted responses.

> All hashes and credentials in this repo are fictitious and for educational use only. See `SECURITY.md`.

## Commands

```bash
pnpm install              # Install deps (pnpm v11+ required)
pnpm dev                  # Dev server on http://localhost:5173
pnpm build                # Production build (Vite)
pnpm preview              # Preview production build

pnpm test                 # Vitest watch mode
pnpm test:run             # Single run (CI)
pnpm test:coverage        # Coverage report (v8 provider)
pnpm test:ui              # Interactive Vitest UI
pnpm test -- -t "name"    # Run tests by name filter
pnpm test -- src/path/to/foo.test.ts  # Run one test file

pnpm exec tsc --noEmit    # Type check
```

**No ESLint/Prettier** — only TypeScript type-checking and Vite's build enforce correctness. Keep files < 300 lines.

## Architecture: Universal Validation System

The core abstraction. Commands are **completely decoupled** from labs.

```
Command executes → emits metadata on CommandResponse
                 → LabValidator checks metadata against mission.validationCriteria
                 → mission auto-completes if criteria match
```

Commands (in `src/commands/`) know nothing about labs. Labs (in `src/laboratorios/`) know nothing about which command produced the metadata. The metadata fields on `CommandResponse` are the contract: `discoveredHosts`, `scanResults`, `foundCredentials`, `foundDirectories`, `fileRead`, `fileDownloaded`, `privesc`, `sshLogin`, `ftpLogin`, `vulnerabilityFound`, `exploit`, `uidChecked`, `ncListener`, `blockingCommand`. See `src/types.ts:91-123` for the full `MissionCriteriaType` union and `src/utils/labValidator.ts` for the 14 validators.

## Directory Layout

```
src/
├── commands/
│   ├── builtin/        # ls, cd, cat, sudo, whoami, ifconfig, hashcat, ping, traceroute, ps, top, htop, which
│   ├── tools/          # nmap, hydra, gobuster, arp-scan, netdiscover, msfconsole
│   ├── tools/msfCommands/   # Stateful MSF sub-commands
│   └── index.ts        # Central registry: COMMANDS array + executeCommand() entry point
├── components/         # Terminal, FakeBrowser, NetworkMap, MissionPanel, LandingPage, LabGrid
├── frameworks/
│   ├── metasploit/     # ModuleLoader, SessionManager, exploit modules (ms17_010)
│   └── shells/         # ShellManager + SSH/FTP/NC sessions
├── laboratorios/       # 6 lab definitions (laboratorio01-06.ts) + templates.ts (buildScenario, COMMON_PORTS)
├── store/              # Zustand: scenarioStore.ts + selectors.ts
├── utils/              # labValidator.ts, autocomplete, network, analytics, networkAlert
├── fs-models/          # Virtual Linux/Windows filesystems
├── i18n/               # ES/EN translations
├── hooks/              # useKeyboardShortcuts, useTerminalIdentity
├── test/setup.ts       # Vitest setup: mocks matchMedia/ResizeObserver, resets store + localStorage
└── types.ts            # All shared types: Machine, Scenario, Mission, CommandResponse, ValidationCriteria
```

## State Management

**Zustand** with `localStorage` persistence — `src/store/scenarioStore.ts`. Key slices: language, view (landing/workspace), currentScenario, machines, missions, msfState, ftpSession, sshSession, blockingCommand, currentDir.

In tests, reset with:
```typescript
useScenarioStore.setState({ ... }, true)  // third arg `true` replaces, not merges
```

The setup file (`src/test/setup.ts`) does this automatically in `beforeEach` and clears `localStorage`.

## Interactive Sessions (Shells)

`ShellManager` (`src/frameworks/shells/ShellManager.ts`) handles stateful interactive sessions (SSH, FTP, netcat). `src/commands/index.ts:executeCommand` intercepts input when a shell is active and routes to `executeShellCommand()`. Two stateful systems live outside the store:

- **ShellManager** — SSH/FTP/NC sessions
- **`_msfState` module variable** — Metasploit console (`msfconsole`). Module-level because Metasploit state is global to the simulator. `src/commands/index.ts` exposes `resetMsfState()` / `restoreMsfState()` so `App.tsx` can sync it with the persisted store.

`blockingCommand` on `CommandResponse` flags a command that pauses the prompt (e.g., `nc -lvnp 4444`). The Terminal component detects this and switches UI mode.

## Command Pattern

Every command follows the same shape:
```typescript
export const cmd_<name> = {
  name: '<name>',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    // return { output: '...', isError?: true, <metadata fields> }
  }
};
```

To add a new command:
1. Create `src/commands/builtin/<name>.ts` (system) or `src/commands/tools/<name>.ts` (pentest tool)
2. Export `cmd_<name>`
3. Re-export from `src/commands/builtin/index.ts` or `src/commands/tools/index.ts`
4. Add to the `COMMANDS` array in `src/commands/index.ts`
5. Add tests — see `src/commands/__tests__/happyPath-scenario01.test.ts` for examples

## Lab Pattern

Labs are declarative: define `learningSteps` with `validationCriteria` and let `buildScenario()` (`src/laboratorios/templates.ts`) wire up the Scenario object. The template handles IP assignment (DHCP), attacker machine creation (`createKaliMachine`), file system creation, and mission generation.

To add a lab:
1. Create `src/laboratorios/laboratorioXX.ts` with a `scenarioXXData` object
2. Call `buildScenario({...})` with target machine, ports (use `COMMON_PORTS` helpers), and learning steps
3. Export in `src/laboratorios/laboratorios.ts` (add to `SCENARIOS` array — `TEST_SCENARIO` is hidden)

## Code Conventions

- **Naming:** files `kebab-case`, components `PascalCase`, commands `cmd_<name>`, tests `<name>.test.ts`
- **Import order:** external libs → `import type` → internal modules
- **Error handling:** return `{ output, isError?: true }` — **never throw**. Spanish messages.
- **Test names:** Spanish, e.g. `it('debe listar archivos', ...)`
- **Test pattern:** call `command.execute(args, context)`, assert `result.output` and metadata fields
- TypeScript `strict: false` is intentional — don't tighten without coordination.

## Known Issues

See `AGENTS.md` for the active bug list (currently: SSH credentials not confirmed in topology, PrivEsc prompt doesn't switch to root). When investigating, check git log for in-flight fixes.

## Documentation

- `docs/LABS.md` — Per-lab walkthroughs
- `docs/ARCHITECTURE.md` — Full architecture + validation system details
- `docs/DEVELOPMENT.md` — Dev setup and contribution guide
- `docs/TESTING.md` — Test strategy, naming, helpers (`happyPathHelpers.ts`)
- `docs/CHANGELOG.md` — Change history
- `AGENTS.md` — Quick reference (commands, code style, known issues)
- `MODELO_NEGOCIO.md`, `GUIA_SIIMULADOR_PDF.md` — Business/product docs (Spanish)

## Deployment

Vercel SPA. `vercel.json` rewrites all non-asset paths to `/index.html` and adds `Cache-Control` headers (immutable for `/assets/`, must-revalidate for everything else). Routes: `/:lang/scenario/:id` and `/:lang/blog/:slug`. The Vite build uses `chunkSizeWarningLimit: 1000` to silence warnings on the bundle.

## MCP Servers

`.mcp.json` configures filesystem, git, playwright, and fetch MCP servers. Useful for read-only exploration of the repo without leaving the terminal.

## Analytics

Optional Google Apps Script webhook via `VITE_ANALYTICS_WEBHOOK` env var (see `.env.example`). Leave empty to disable.
