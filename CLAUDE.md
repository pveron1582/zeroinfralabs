# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ZeroInfra Labs** — a browser-based pentesting simulator (React 18 + TypeScript + Vite). 7 progressive labs, an Academy (8 paths / 58 lessons), and Remotion video lessons that teach offensive security through simulated Linux/Windows machines, a functional terminal, and a fake browser. No VMs, no real exploits — everything runs in the browser with deterministic, scripted responses.

> All hashes and credentials in this repo are fictitious and for educational use only. See `docs/SECURITY.md`.

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

**ESLint exists** (`eslint.config.mjs`: flat config, react-hooks as errors, unused-vars/no-explicit-any/no-console as warns). No Prettier — formatting is manual. Hard correctness enforced by `tsc` + Vitest; ESLint is advisory. Keep files < 300 lines.

## Architecture: Universal Validation System

The core abstraction. Commands are **completely decoupled** from labs.

```
Command executes → emits metadata on CommandResponse
                 → LabValidator checks metadata against mission.validationCriteria
                 → mission auto-completes if criteria match
```

Commands (in `src/commands/`) know nothing about labs. Labs (in `src/laboratorios/`) know nothing about which command produced the metadata. The metadata fields on `CommandResponse` are the contract: `discoveredHosts`, `scanResults`, `foundCredentials`, `foundDirectories`, `fileRead`, `fileDownloaded`, `privesc`, `sshLogin`, `ftpLogin`, `vulnerabilityFound`, `exploit`, `uidChecked`, `ncListener`, `blockingCommand`, `sudoPrivileges`, `browserAction`, `httpRequest`. See `src/types/mission.ts:28` for the full `MissionCriteriaType` union (17 types) and `src/utils/labValidator.ts` for the 17 validators.

## Directory Layout

```
src/
├── academy/            # 8 paths / 58 lessons + video-lession metadata
├── video/              # Remotion video compositions (39)
├── commands/
│   ├── builtin/        # ls, cd, cat, sudo, whoami, ifconfig, hashcat, ping, traceroute, ps, top, htop, which (59)
│   ├── tools/          # nmap, hydra, gobuster, arp-scan, netdiscover, curl, msfconsole, apt, dpkg; ssh/nc/ftp re-exported from frameworks/shells (12)
│   └── index.ts        # Central registry: COMMANDS Map + executeCommand() entry point
├── components/         # Terminal, FakeBrowser, NetworkMap, MissionPanel, LandingPage, LabGrid, academy/, tour/, ...
├── frameworks/
│   ├── metasploit/     # core/ (module DB, ContextRegistry, types) + orchestrators/ (MSF + meterpreter commands)
│   ├── shells/         # ShellManager + SSH/FTP/NC sessions
│   ├── process/        # ProcessManager
│   ├── network/        # NetworkState (iptables, ufw, interfaces)
│   ├── packages/       # PackageManager (apt, dpkg)
│   ├── cron/           # CronRunner (virtual clock, cron jobs)
│   └── fs/             # mounts.ts (fstab, mount state)
├── laboratorios/       # 7 lab definitions (laboratorio01-07.ts) + templates.ts (buildScenario, COMMON_PORTS) + attackers/
├── store/              # Zustand: 5 slices (ui, terminal, scenario, identity, academy) + selectors.ts
├── utils/              # labValidator.ts, permissions, fs, path, autocomplete, network, analytics, logger
├── fs-models/          # Virtual Linux/Windows filesystems
├── i18n/               # ES/EN translations
├── hooks/              # 14 hooks: useCommandRunner, useKeyboardShortcuts, useTerminalIdentity, ...
├── types/              # Shared types split by domain: command.ts, machine.ts, mission.ts, academy.ts (barrel: index.ts)
├── blog/               # Educational articles ES/EN
└── test/setup.ts       # Vitest setup: mocks matchMedia/ResizeObserver, resets store + localStorage
```

## State Management

**Zustand** with `localStorage` persistence — `src/store/scenarioStore.ts`. Five slices: `uiSlice`, `terminalSlice`, `scenarioSlice`, `identitySlice`, `academySlice`. Only UI preferences and Academy progress are persisted; lab state resets on reload.

In tests, reset with:
```typescript
useScenarioStore.setState({ ... }, true)  // third arg `true` replaces, not merges
```

The setup file (`src/test/setup.ts`) does this automatically in `beforeEach` and clears `localStorage`.

## Interactive Sessions (Shells)

`ShellManager` (`src/frameworks/shells/ShellManager.ts`) handles stateful interactive sessions (SSH, FTP, netcat). `src/commands/index.ts:executeCommand` intercepts input when a shell is active and routes to `executeShellCommand()`. Two stateful systems live outside the store:

- **ShellManager** — SSH/FTP/NC sessions
- **MSF state in Zustand store** — Metasploit console state lives in `useScenarioStore.getState().msfState`. `src/commands/index.ts` exposes `resetMsfState()` / `isMsfActive()` / `getMsfPrompt()` / `getMsfState()`. `createIsolatedExecutor()` creates per-terminal isolated MSF state.

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
4. The `COMMANDS` Map auto-registers by iterating barrel exports — no manual registration needed for standard commands. `msfconsole` is the only exception (factory with state, registered explicitly).
5. Add tests — see `src/commands/__tests__/happyPath-scenario01.test.ts` for examples

## Lab Pattern

Labs are declarative: define `learningSteps` with `validationCriteria` and let `buildScenario()` (`src/laboratorios/templates.ts`) wire up the Scenario object. The template handles IP assignment (DHCP), attacker machine creation (`createKaliMachine`), file system creation, and mission generation. `SCENARIOS` has 7 labs; `TEST_SCENARIO` is a legacy alias of laboratorio_06.

To add a lab:
1. Create `src/laboratorios/laboratorioXX.ts` with a `scenarioXXData` object
2. Call `buildScenario({...})` with target machine, ports (use `COMMON_PORTS` helpers), and learning steps
3. Export in `src/laboratorios/laboratorios.ts` (add to `SCENARIOS` array)
4. Add happy path tests in `src/commands/__tests__/happyPath-scenarioXX.test.ts`

## Code Conventions

- **Naming:** files `kebab-case`, components `PascalCase`, commands `cmd_<name>`, tests `<name>.test.ts`
- **Import order:** external libs → `import type` → internal modules
- **Error handling:** return `{ output, isError?: true }` — **never throw**. Spanish messages.
- **Test names:** Spanish, e.g. `it('debe listar archivos', ...)`
- **Test pattern:** call `command.execute(args, context)`, assert `result.output` and metadata fields
- TypeScript `strict: true` is enabled (with `noUnusedLocals` and `noUnusedParameters`). Enforced cleanly with 0 errors via `tsc --noEmit`.

## Known Issues

No active open bugs (Bug #3 and Bug #6 verified resolved).

## Documentation

- `docs/LABS.md` — Per-lab walkthroughs
- `docs/ARCHITECTURE.md` — Full architecture + validation system details
- `docs/DEVELOPMENT.md` — Dev setup and contribution guide
- `docs/TESTING.md` — Test strategy, naming, helpers (`happyPathHelpers.ts`)
- `docs/CHANGELOG.md` — Change history
- `docs/PROYECTO_ACADEMY.md` — Academy design (paths, lessons, quizzes)
- `docs/ROADMAP.md` — Current implementation plan
- `docs/archive/` — Historical improvement plans and completion reports (`MEJORAS.md`, etc.)
- `AGENTS.md` — Quick reference (commands, code style, architecture summary)
- `docs/MODELO_NEGOCIO.md`, `docs/GUIA_SIMULADOR_PDF.md` — Business/product docs (Spanish)

## Deployment

Vercel SPA. `vercel.json` rewrites all non-asset paths to `/index.html` and adds `Cache-Control` headers (immutable for `/assets/`, must-revalidate for everything else). Routes: `/:lang/scenario/:id` and `/:lang/blog/:slug`. The Vite build uses `chunkSizeWarningLimit: 1000` to silence warnings on the bundle.

## MCP Servers

`.mcp.json` configures filesystem, git, playwright, and fetch MCP servers. Useful for read-only exploration of the repo without leaving the terminal.

## Analytics

Optional Google Apps Script webhook via `VITE_ANALYTICS_WEBHOOK` env var (see `.env.example`). Leave empty to disable.
