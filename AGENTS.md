# AGENTS.md - ZeroInfra Labs

Pentesting simulator (React + TypeScript + Vite). 6 labs, 800+ tests.

## Commands

```bash
pnpm dev                 # Dev server (port 5173)
pnpm build               # Production build
pnpm test                # Vitest watch mode
pnpm test:run            # Single run (CI)
pnpm test:coverage       # Run tests with coverage
pnpm test -- -t "filter" # Run tests by name
pnpm exec tsc --noEmit   # Type check
```

No ESLint/Prettier.

## Architecture

**Universal Validation:** Commands emit metadata (`discoveredHosts`, `foundCredentials`, `privesc`, etc.) → `LabValidator` validates against `validationCriteria`. Commands don't know labs.

**State:** Zustand (`src/store/scenarioStore.ts`) with localStorage persist. Reset in tests:
```typescript
useScenarioStore.setState({...}, true)
```

**Shell Sessions:** `ShellManager` (`src/frameworks/shells/`) handles interactive SSH/FTP/NC. `src/commands/index.ts` wraps execution.

**Metasploit:** Stateful `msfconsole` with session state in store.

```
src/
├── commands/
│   ├── builtin/       # ls, cd, cat, sudo, whoami
│   └── tools/         # nmap, hydra, ssh, msfconsole
├── frameworks/
│   ├── metasploit/    # MSF modules
│   └── shells/        # SSH, FTP, NC sessions
├── laboratorios/      # 6 labs (laboratorio01-06.ts)
├── store/             # scenarioStore.ts
├── utils/labValidator.ts  # 14 validation criteria
└── test/setup.ts      # Vitest mocks + store reset
```

## Code Style

**Naming:** Files `kebab-case`, Components `PascalCase`, Commands `cmd_<name>`, Tests `<name>.test.ts`

**Command pattern:**
```typescript
export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'error', isError: true };
    return { output: 'result' };
  }
};
```

**Imports order:** 1) External libs, 2) `import type`, 3) Internal modules

**Error handling:** Return `{ output, isError?: true }` — never throw. Spanish messages.

## Testing

- Vitest 4.x + React Testing Library + jsdom
- Setup: `src/test/setup.ts` (mocks `matchMedia`, `history`, clears localStorage)
- Spanish test names: `it('debe listar archivos', ...)`
- Command tests: `.execute(args, context)` → assert `result.output`

## Adding Features

**New command:**
1. Create `src/commands/builtin/` or `tools/`
2. Export `cmd_<name>` with `name` + `execute`
3. Register in `src/commands/builtin/index.ts` or `tools/index.ts`
4. Add to `COMMANDS` in `src/commands/index.ts`
5. Add tests

**New lab:**
1. Create `src/laboratorios/laboratorioXX.ts` using `buildScenario()`
2. Define `learningSteps` with `validationCriteria`
3. Export in `src/laboratorios/laboratorios.ts`

## Known Issues

- Bug #3: SSH credentials not confirmed in topology
- Bug #6: PrivEsc doesn't change prompt to root

## Docs

- `docs/LABS.md` — Lab guides
- `docs/ARCHITECTURE.md` — Validation system
- `docs/TESTING.md` — Test strategy
