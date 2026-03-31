# AGENTS.md - ZeroInfra Labs

Agent instructions for this React + TypeScript + Vite pentesting simulator.

---

## Commands

```bash
npm run dev              # Dev server with hot-reload
npm run build           # Production build
npm run preview         # Preview build
npm test                # Watch mode
npm run test:run        # Single run
npm run test:coverage   # Coverage report

# Single test (file path OR name filter)
npm test -- src/commands/builtin/__tests__/ls.test.ts
npm test -- -t "debe listar archivos"
```

---

## Project Structure

```
src/
├── types.ts                     # All TypeScript interfaces
├── commands/
│   ├── index.ts                # Command registry + executeCommand()
│   ├── builtin/                # ls, cd, cat, sudo, etc.
│   └── tools/                  # nmap, ssh, hydra, msfconsole
├── components/                 # Terminal, FakeBrowser, NetworkMap
├── store/scenarioStore.ts     # Zustand global state
├── fs-models/                  # fs-linux.ts, fs-windows.ts
└── laboratorios/              # Lab scenarios
```

---

## Code Style

### File Headers
```typescript
// ── commands/builtin/ls.ts ───────────────────────────────────────
```

### Naming
- Files: `kebab-case.ts` (ls.ts, scenarioStore.ts)
- Components: `PascalCase.tsx` (Terminal.tsx)
- Commands: `cmd_<name>` export (cmd_ls, cmd_ssh)
- Types: PascalCase (Machine, CommandResponse)

### Imports (order matters)
```typescript
// 1. External
import { create } from 'zustand';
import { describe, it, expect } from 'vitest';

// 2. Internal types
import type { CommandContext, CommandResponse } from '../../types';

// 3. Internal modules
import { SCENARIOS } from '../laboratorios/laboratorios';
```

### TypeScript
- Always use explicit types for function params/returns
- Use `type` for unions/primitives, `interface` for objects
- Use `import type` for types only

```typescript
export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    // ...
  }
};
```

### React Components
- Functional components with explicit prop types
- Keep focused (<300 lines)

```typescript
interface TerminalProps {
  onCommand: (cmd: string) => void;
}

export const Terminal = ({ onCommand }: TerminalProps) => { ... };
```

### Error Handling
- Return `{ output: string, isError?: boolean }`
- Early returns for validation
- Spanish error messages

```typescript
if (!args[0]) {
  return { output: 'uso: ssh user@ip [password]', isError: true };
}
```

### Testing
- Tests in `__tests__/` folders
- Spanish descriptions: `it('debe listar archivos', ...)`
- Use `createMachine` helper for mocks

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

### CSS
- Tailwind CSS v4
- Classes directly in JSX

---

## Key Files

| Purpose | File |
|---------|------|
| Global state | `src/store/scenarioStore.ts` |
| Command executor | `src/commands/index.ts` |
| Terminal | `src/components/Terminal.tsx` |
| Types | `src/types.ts` |
| Labs config | `src/laboratorios/laboratorios.ts` |

---

## Adding New Command
1. Create `src/commands/builtin/` or `src/commands/tools/`
2. Export `cmd_<name>` object with `name` + `execute`
3. Register in `src/commands/index.ts`
4. Add tests in `__tests__/`

---

## Known Bugs (README.md)
- Bug #3: SSH credentials not confirmed in topology
- Bug #6: PrivEsc doesn't change prompt to root
