# AGENTS.md - ZeroInfra Labs

Agent instructions for this React + TypeScript + Vite pentesting simulator.

---

## Commands

```bash
npm run dev              # Dev server with hot-reload
npm run build           # Production build (includes TS type-check)
npm run preview         # Preview production build
npm test                # Watch mode (vitest)
npm run test:run        # Single run (CI-friendly)
npm run test:coverage   # Coverage report (v8)
npm run test:ui         # Interactive Vitest UI

# Single test by file path
npm test -- src/commands/builtin/__tests__/ls.test.ts

# Single test by name filter
npm test -- -t "debe listar archivos"
```

**Linting/Formatting:** No ESLint or Prettier. TypeScript type-checking via `tsconfig.json` + `npx tsc --noEmit`. Vite handles compilation during `npm run build`.

---

## Project Structure

```
src/
├── types.ts                     # All TypeScript interfaces (Machine, CommandResponse, etc.)
├── commands/
│   ├── index.ts                # Command registry + executeCommand() + shell manager wrappers
│   ├── builtin/                # ls, cd, cat, sudo, whoami, ifconfig, hashcat, etc.
│   └── tools/                  # nmap, ssh, hydra, gobuster, msfconsole, nc, ftp, arp-scan
├── shells/                     # Interactive shell sessions (FTP, SSH, NC)
│   └── ShellManager.ts         # Manages stateful shell sessions
├── components/                 # Terminal, FakeBrowser, NetworkMap, LandingPage, etc.
├── store/scenarioStore.ts     # Zustand global state (persisted to localStorage)
├── fs-models/                  # fs-linux.ts, fs-windows.ts (virtual filesystem)
├── laboratorios/              # Lab scenarios (SCENARIOS array)
├── hooks/                     # Custom React hooks
├── utils/                     # Utility functions (network, autocomplete)
└── test/setup.ts              # Vitest setup (mocks, cleanup, store reset)
```

---

## Code Style

### File Headers
```typescript
// ── commands/builtin/ls.ts ───────────────────────────────────────
```

### Naming
- Files: `kebab-case.ts` (`ls.ts`, `scenarioStore.ts`)
- Components: `PascalCase.tsx` (`Terminal.tsx`)
- Commands: `cmd_<name>` export (`cmd_ls`, `cmd_ssh`)
- Types: PascalCase (`Machine`, `CommandResponse`)
- Test files: `<name>.test.ts` inside `__tests__/` folders

### Imports (order matters)
```typescript
// 1. External libraries
import { create } from 'zustand';

// 2. Internal types (use `import type`)
import type { CommandContext, CommandResponse } from '../../types';

// 3. Internal modules
import { SCENARIOS } from '../laboratorios/laboratorios';
```

### TypeScript
- Always use explicit types for function params/returns
- Use `type` for unions/primitives, `interface` for objects
- Use `import type` for type-only imports
- Command pattern: export an object with `name` + `execute`

```typescript
export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    // ...
  }
};
```

### React Components
- Functional components with explicit prop interfaces
- Keep files focused (<300 lines)
- Tailwind CSS v4 classes directly in JSX (no CSS modules)

```typescript
interface TerminalProps {
  onCommand: (cmd: string) => void;
}

export const Terminal = ({ onCommand }: TerminalProps) => { ... };
```

### Error Handling
- Return `{ output: string, isError?: boolean }` — never throw
- Early returns for validation errors
- Spanish error messages for user-facing output

```typescript
if (!args[0]) {
  return { output: 'uso: ssh user@ip [password]', isError: true };
}
```

### State Management
- Global state via Zustand (`src/store/scenarioStore.ts`) with `persist` middleware
- Access store: `useScenarioStore()` hook or `useScenarioStore.getState()` outside components
- Reset store in tests via `useScenarioStore.setState({...}, true)`

---

## Testing

- Framework: Vitest 4.x + React Testing Library + jsdom
- Config: `globals: true`, `environment: 'jsdom'`
- Setup: `src/test/setup.ts` — mocks `matchMedia`, `history`, `ResizeObserver`; clears localStorage; resets Zustand store
- Spanish descriptions: `it('debe listar archivos', ...)`
- Command tests: call `.execute(args, context)` and assert on `result.output`
- Component tests: use `render()`, `screen.getByText()`, `fireEvent`
- Use `vi.fn()` for mocks, `expect(fn).toHaveBeenCalled()` for assertions

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

it('debe listar archivos', () => {
  const machine = createMachine([{ path: '/root/file.txt', content: 'test', type: 'text' }]);
  const result = cmd_ls.execute([], { machine, currentDir: '/root/' } as any);
  expect(result.output).toContain('file.txt');
});
```

---

## Adding New Command
1. Create file in `src/commands/builtin/` (system) or `src/commands/tools/` (pentesting)
2. Export `cmd_<name>` object with `name` + `execute`
3. Register in `src/commands/builtin/index.ts` or `src/commands/tools/index.ts`
4. Import and add to `COMMANDS` array in `src/commands/index.ts`
5. Add tests in `__tests__/` directory

---

## Known Bugs (README.md)
- Bug #3: SSH credentials not confirmed in topology
- Bug #6: PrivEsc doesn't change prompt to root
