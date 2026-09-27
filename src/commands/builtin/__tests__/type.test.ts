// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_type } from '../type';

const ctx = () =>
  ({
    shellAliases: new Map([['ll', 'ls -l']]),
    hasCommand: (n: string) => n === 'ls' || n === 'nmap',
  }) as any;

describe('cmd_type', () => {
  it('debe detectar alias', () => {
    const result = cmd_type.execute(['ll'], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain("aliased to `ls -l'");
  });

  it('debe detectar comando', () => {
    const result = cmd_type.execute(['nmap'], ctx());
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('is a command');
  });

  it('debe fallar si no existe', () => {
    const result = cmd_type.execute(['nosuchcmd'], ctx());
    expect(result.isError).toBe(true);
    expect(result.output).toContain('not found');
  });

  it('debe pedir argumento', () => {
    expect(cmd_type.execute([], ctx()).isError).toBe(true);
  });
});
