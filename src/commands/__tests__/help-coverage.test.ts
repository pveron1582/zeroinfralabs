// ── commands/__tests__/help-coverage.test.ts ───────────────────────
// Cobertura del sistema de ayuda: el listado de `help` sin argumentos
// debe nombrar exactamente COMMAND_NAMES, y cada comando debe tener
// página en COMMAND_HELP y one-liner en WHATIS.

import { describe, it, expect } from 'vitest';
import { cmd_help } from '../builtin/help';
import { COMMAND_NAMES } from '../names';
import { COMMAND_HELP } from '../help';
import { WHATIS } from '../help/whatis';

function listedNames(): string[] {
  const names: string[] = [];
  const { output } = cmd_help.execute([]);
  for (const line of output.split('\n')) {
    if (!line.startsWith('  ')) continue;
    const dash = line.indexOf(' - ');
    const head = (dash >= 0 ? line.slice(0, dash) : line).trim();
    const words = head.split(/\s+/);
    const first = words[0];
    if (first.includes('/')) {
      names.push(...first.split('/').filter(p => p.length > 0));
      continue;
    }
    names.push(first);
    if (words[1] === '/' && words[2]) names.push(words[2]);
  }
  return names;
}

describe('help - cobertura del listado y las páginas', () => {
  const names = [...COMMAND_NAMES];

  it('el listado de help sin argumentos nombra exactamente COMMAND_NAMES', () => {
    const listed = listedNames();
    expect(new Set(listed).size).toBe(listed.length);
    expect(new Set(listed)).toEqual(new Set(names));
  });

  it('cada comando tiene una página en COMMAND_HELP', () => {
    const missing = names.filter(n => !COMMAND_HELP[n]);
    expect(missing).toEqual([]);
  });

  it('cada comando tiene un one-liner en WHATIS', () => {
    const missing = names.filter(n => !WHATIS[n]);
    expect(missing).toEqual([]);
  });
});
