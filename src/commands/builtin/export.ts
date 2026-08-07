// ── commands/builtin/export.ts ──────────────────────────────────────
// Comandos de variables de entorno (ROADMAP Fase 7.4): export, env,
// unset. El entorno vive en CommandContext.env (per-sesión, no
// persistente) igual que umask.

import type { CommandContext, CommandResponse } from '../../types';
import { parseExportAssignment } from '../../utils/environment';

export const cmd_export = {
  name: 'export',
  execute: (args: string[], { env, setEnv }: CommandContext): CommandResponse => {
    if (args.length === 0) {
      const current = env || {};
      const out = Object.keys(current)
        .sort()
        .map(k => `declare -x ${k}="${current[k]}"`)
        .join('\n');
      return { output: out };
    }

    const arg = args[0];
    const parsed = parseExportAssignment(arg);
    if (parsed) {
      setEnv?.({ ...(env || {}), [parsed.name]: parsed.value });
      return { output: '' };
    }

    // export VAR sin valor: conserva el valor existente (o vacío)
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(arg)) {
      const current = env || {};
      setEnv?.({ ...current, [arg]: current[arg] ?? '' });
      return { output: '' };
    }

    return { output: `export: not valid in this context: ${arg}`, isError: true };
  }
};

export const cmd_env = {
  name: 'env',
  execute: (_args: string[], { env }: CommandContext): CommandResponse => {
    const current = env || {};
    const out = Object.keys(current)
      .sort()
      .map(k => `${k}=${current[k]}`)
      .join('\n');
    return { output: out };
  }
};

export const cmd_unset = {
  name: 'unset',
  execute: (args: string[], { env, setEnv }: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'unset: usage: unset VAR', isError: true };
    const current = { ...(env || {}) };
    delete current[args[0]];
    setEnv?.(current);
    return { output: '' };
  }
};
