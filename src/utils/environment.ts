// ── utils/environment.ts ───────────────────────────────────────────
// Variables de entorno del terminal (ROADMAP Fase 7.4). El estado vive
// en el contexto del terminal (como umask), no en un singleton.
// Valores por defecto derivados de la máquina + usuario actual.

import type { Machine } from '../types';
import { getCurrentUser } from './users';

export const DEFAULT_ENV = (machine: Machine): Record<string, string> => {
  const user = getCurrentUser(machine);
  return {
    PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
    HOME: user.home,
    USER: user.username,
    LOGNAME: user.username,
    SHELL: user.shell || '/bin/bash',
    EDITOR: 'nano',
    TERM: 'xterm-256color',
    PWD: '/',
  };
};

// Expande $VAR y ${VAR} usando el entorno dado. Variables desconocidas → vacío.
export function expandVariables(text: string, env?: Record<string, string>): string {
  if (!text.includes('$')) return text;
  const e = env || {};
  return text.replace(/\$\{(\w+)\}|\$(\w+)/g, (_m, braceName: string, name: string) => {
    const key = braceName || name;
    return e[key] !== undefined ? e[key] : '';
  });
}

export function parseExportAssignment(arg: string): { name: string; value: string } | null {
  const eq = arg.indexOf('=');
  if (eq <= 0) return null;
  const name = arg.slice(0, eq);
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) return null;
  let value = arg.slice(eq + 1);
  if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value[value.length - 1] === value[0]) {
    value = value.slice(1, -1);
  }
  return { name, value };
}

export function formatEnvLine(key: string, value: string): string {
  return `${key}=${value}`;
}
