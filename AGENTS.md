# AGENTS.md - ZeroInfra Labs

Browser-based pentesting simulator (React 18 + TypeScript + Vite). 5 visible labs + 1 hidden test scenario. 1918 tests across 147 files.

## Commands

```bash
pnpm dev                 # Dev server (port 5173)
pnpm build               # Production build (Vite, chunkSizeWarningLimit: 1000)
pnpm preview             # Preview production build
pnpm test                # Vitest watch mode
pnpm test:run            # Single run (CI)
pnpm test:coverage       # Coverage report (v8 provider)
pnpm test:ui             # Interactive Vitest UI
pnpm test -- -t "name"   # Run tests by name filter
pnpm test -- src/path/to/foo.test.ts  # Run one test file
pnpm exec tsc --noEmit   # Type check (strict: true, noUnusedLocals, noUnusedParameters)
```

No ESLint/Prettier. Only `tsc` and Vite build enforce correctness. Keep files < 300 lines.

## Architecture: Universal Validation System

Commands are completely decoupled from labs. Commands emit metadata on `CommandResponse` → `LabValidator` (`src/utils/labValidator.ts`) checks metadata against `mission.validationCriteria` → mission auto-completes if criteria match.

The `CommandResponse` metadata fields are the contract (`src/types.ts:182-280`): `discoveredHosts`, `scanResults`, `foundCredentials`, `foundDirectories`, `fileRead`, `fileDownloaded`, `privesc`, `sshLogin`, `ftpLogin`, `vulnerabilityFound`, `exploit`, `uidChecked`, `ncListener`, `blockingCommand`, `sudoPrivileges`, `custom` — 16 criteria types, 15 validators (`custom` returns false).

## State Management

Zustand (`src/store/scenarioStore.ts`) with localStorage persistence. Four slices: `uiSlice`, `terminalSlice`, `scenarioSlice`, `identitySlice`. Only UI preferences are persisted via `partialize()` + `merge` (view, language, theme, uiMode, activeApp, termColor). **`machines`/`missions`/`msfState`/`identityStack` etc. are NOT persisted** — reloading resets the lab to its initial state and never rehydrates credentials (see `docs/archive/MEJORAS.md` 7.1).

In tests, reset with:
```typescript
useScenarioStore.setState({ ... }, true)  // third arg `true` replaces, not merges
```

`src/test/setup.ts` does this automatically in `beforeEach` and clears localStorage. Also mocks `matchMedia`, `history`, `ResizeObserver`, `IntersectionObserver`.

Two stateful systems live outside the store:
- **ShellManager** (`src/frameworks/shells/ShellManager.ts`) — SSH/FTP/NC sessions (stack-based, nested shells). `shellManager` singleton.
- **MSF state en Zustand store** — El estado de Metasploit vive en `useScenarioStore.getState().msfState`. `src/commands/index.ts` expone `resetMsfState()`, `isMsfActive()`, `getMsfPrompt()`, `getMsfState()` que leen del store. Los comandos MSF emiten `msfStateUpdate?: MsfState | null` en `CommandResponse` (tipo explícito desde 4.2).

`createIsolatedExecutor()` (`src/commands/index.ts:~437`) crea un executor con estado MSF aislado por terminal — cada terminal puede tener su propio `msfconsole` sin afectar a otras. El estado se guarda en un closure privado, no en el store global.

`blockingCommand` on `CommandResponse` flags commands that pause the prompt (e.g., `nc -lvnp 4444`). The Terminal component detects this and switches UI mode.

`selectScenario()` has a 6.5s timeout for the machine loader animation. `resetWorkspace()` / `goHome()` reset the entire workspace state.

## Command Pattern

Every command follows the same shape:
```typescript
export const cmd_<name> = {
  name: '<name>',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    return { output: '...', isError?: true, <metadata fields> };
  }
};
```

To add a new command:
1. Create `src/commands/builtin/<name>.ts` (system) or `src/commands/tools/<name>.ts` (pentest tool)
2. Export `cmd_<name>`
3. Re-export from `src/commands/builtin/index.ts` or `src/commands/tools/index.ts`
4. Add tests in `src/commands/<dir>/__tests__/`

The `COMMANDS` Map in `src/commands/index.ts` auto-registers by iterating barrel exports. No manual registration needed for standard commands. `msfconsole` is the only exception (factory with state, registered explicitly).

## Lab Pattern

Labs are declarative: define `learningSteps` with `validationCriteria` and let `buildScenario()` (`src/laboratorios/templates.ts`) wire up the Scenario object. `SCENARIOS` (`src/laboratorios/laboratorios.ts`) has 5 visible labs; `TEST_SCENARIO` (laboratorio06) is hidden. `SCENARIOS_META` drives dynamic LandingPage cards.

To add a lab:
1. Create `src/laboratorios/laboratorioXX.ts` with a `scenarioXXData` object
2. Call `buildScenario({...})` with target machine, ports (use `COMMON_PORTS` helpers), and learning steps
3. Export in `src/laboratorios/laboratorios.ts` (add to `SCENARIOS` array)
4. Add happy path tests in `src/commands/__tests__/happyPath-scenarioXX.test.ts`

## Code Conventions

- **Naming:** files `kebab-case`, components `PascalCase`, commands `cmd_<name>`, tests `<name>.test.ts`
- **Import order:** external libs → `import type` → internal modules
- **Error handling:** return `{ output, isError?: true }` — never throw. Spanish messages.
- **Test names:** Spanish, e.g. `it('debe listar archivos', ...)`
- **Test pattern:** call `command.execute(args, context)`, assert `result.output` and metadata fields
- **File size:** keep < 300 lines

### Permissions on filesystem commands

> **Regla transversal:** todo comando que lea, cree, edite, borre o liste archivos/dirs
> usa los helpers de `src/utils/permissions.ts` (`canRead`, `canWrite`, `canEditFile`,
> `canCreateInDir`, `canDeleteInDir`) y los lookups de `src/utils/fs.ts` (`findFile`,
> `findDirEntry`, `findParentDir`, `defaultOwnership`, `buildNewFile`).

Patrón completo, anti-patrones y comandos ya migrados: **ver `docs/PERMISSIONS.md`**.
Resumen rápido:

- **Crear archivo nuevo:** `findParentDir` + `canCreateInDir(parent, user)` + `defaultOwnership(machine, user, applyUmask(mode))` + `addFileToMachine`.
- **Editar archivo existente:** `findFile` + `canEditFile(file, user)` + **preservar owner/group/mode** del archivo existente.
- **Borrar:** `canDeleteInDir(parent, file, user)` (incluye sticky bit).
- **Mover:** `canDeleteInDir` (source) + `canCreateInDir` (dest).
- **Listar:** `canExecute(dir)`; filtrar por `canRead` por entry en formato corto.
- NO mutar `file.mode`/`file.owner` directamente — siempre vía `addFileToMachine`.
- NO reimplementar `checkStickyBit`, `findFile`/`findDirEntry` localmente.
- NO guardar archivos nuevos sin `owner`/`group`/`mode`.

## Testing

- Vitest 4.x + React Testing Library + jsdom
- Setup: `src/test/setup.ts` (mocks `matchMedia`, `history`, `ResizeObserver`, `IntersectionObserver`, resets store + localStorage)
- Test structure: `src/commands/__tests__/`, `src/components/__tests__/`, `src/store/__tests__/`, `src/utils/__tests__/`, `src/laboratorios/__tests__/`
- Helpers: `src/commands/__tests__/happyPathHelpers.ts` for creating mock machines, evolving state, verifying results
- Mock store pattern:
  ```typescript
  vi.mock('../../store/scenarioStore', () => ({
    useScenarioStore: Object.assign(
      vi.fn((selector) => selector(mockState)),
      { getState: vi.fn(() => mockState) }
    )
  }));
  ```
- Test cache: `rm -rf node_modules/.vitest` if tests behave oddly

## Directory Layout

```
src/
├── commands/
│   ├── builtin/        # 59 system commands (ls, cd, cat, sudo, ps, kill, systemctl, iptables, ufw, ip, ss, export, grep, crontab, mount, df, du, ln, find, ...)
│   ├── tools/          # 11 pentest/system tools (nmap, hydra, ssh, ftp, nc, gobuster, arp-scan, msfconsole, apt, dpkg, ...)
│   └── index.ts        # Central registry: COMMANDS Map + executeCommand() entry point
├── components/         # Terminal, FakeBrowser, NetworkMap, MissionPanel, LandingPage, LabGrid
├── frameworks/
│   ├── metasploit/     # core/ (module DB, ContextRegistry, types) + orchestrators/ (MSF + meterpreter commands)
│   ├── shells/         # ShellManager + SSH/FTP/NC sessions (stack-based, nested)
│   ├── process/        # ProcessManager (buildProcessList, kill/stop/start)
│   ├── network/        # NetworkState (iptables/ufw/interfaces, effectivePortState)
│   ├── packages/       # PackageManager (apt/dpkg DB + installed set per machine)
│   ├── cron/           # CronRunner (virtual clock, parse/list/run cron jobs → syslog)
│   └── fs/             # mounts.ts (fstab parsing + mount state per machine)
├── laboratorios/       # 6 labs (laboratorio01-06.ts) + templates.ts (buildScenario, COMMON_PORTS)
├── store/              # Zustand: scenarioStore.ts + slices/{ui,terminal,scenario} + selectors.ts
├── fs-models/          # Virtual Linux/Windows/Kali filesystems
├── i18n/               # ES/EN translations
├── hooks/              # useKeyboardShortcuts, useTerminalIdentity, useDesktopWindows
├── blog/               # Educational articles (ES/EN)
├── test/setup.ts       # Vitest setup: mocks + store reset
└── types.ts            # All shared types: Machine, Scenario, Mission, CommandResponse, ValidationCriteria
```

## Deployment

Vercel SPA. `vercel.json` rewrites `/es/:path*` and `/en/:path*` to `/index.html`, plus a catch-all for non-asset paths. Cache-Control: `max-age=31536000, immutable` for `/assets/`, `max-age=0, must-revalidate` for everything else. Routes: `/:lang/scenario/:id` and `/:lang/blog/:slug`.

## Environment

`VITE_ANALYTICS_WEBHOOK` — optional Google Apps Script webhook for analytics. Leave empty to disable. See `.env.example`.

## Known Issues

- (ninguno abierto) — Bug #3 (SSH credenciales no confirmadas en topología) y Bug #6 (PrivEsc no cambia prompt a root) verificados como resueltos el 2026-07-31: `SshSession` emite `newMachineId`+`foundCredentials` (servicio `ssh`) → `verifyCredentials` marca `verified: true` y `EnumerationPanel` lo muestra VERIFIED; `sudo vim !bash` emite `privescCompleted` → `setPrivescCompleted` → `getCurrentUser` devuelve root y el prompt pasa a `root@...#`.

## Docs

- `docs/LABS.md` — Lab guides
- `docs/ARCHITECTURE.md` — Validation system
- `docs/TESTING.md` — Test strategy
- `docs/DEVELOPMENT.md` — Dev setup and contribution
- `docs/ROADMAP.md` — Future implementation plan
- `docs/CHANGELOG.md` — Change history
- `docs/HAPPY_PATH_TEST.md` — Manual verification checklist with red flags
- `CLAUDE.md` — Full reference (commands, code style, known issues)
