// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_alias, cmd_unalias } from '../alias';
import { createIsolatedExecutor } from '../../index';
import type { Machine } from '../../../types';

const ctx = (aliases = new Map<string, string>()) =>
  ({ shellAliases: aliases }) as any;

describe('cmd_alias / cmd_unalias', () => {
  it('debe listar vacío si no hay alias', () => {
    expect(cmd_alias.execute([], ctx()).output).toBe('');
  });

  it('debe definir y listar alias', () => {
    const aliases = new Map<string, string>();
    const c = ctx(aliases);
    expect(cmd_alias.execute(["ll='ls -l'"], c).output).toBe('');
    expect(aliases.get('ll')).toBe('ls -l');
    expect(cmd_alias.execute([], c).output).toContain("alias ll='ls -l'");
  });

  it('debe mostrar un alias con consulta', () => {
    const c = ctx(new Map([['ll', 'ls -l']]));
    const result = cmd_alias.execute(['ll'], c);
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain("alias ll='ls -l'");
  });

  it('debe fallar con consulta inexistente y nombre inválido', () => {
    const c = ctx();
    expect(cmd_alias.execute(['nope'], c).isError).toBe(true);
    expect(cmd_alias.execute(['1bad=x'], c).isError).toBe(true);
  });

  it('debe borrar con unalias y limpiar con -a', () => {
    const c = ctx(new Map([['ll', 'ls -l'], ['la', 'ls -a']]));
    expect(cmd_unalias.execute(['ll'], c).output).toBe('');
    expect(cmd_alias.execute([], c).output).not.toContain('ll=');
    expect(cmd_unalias.execute(['nope'], c).isError).toBe(true);
    cmd_unalias.execute(['-a'], c);
    expect(cmd_alias.execute([], c).output).toBe('');
  });
});

describe('expansión de alias en el executor', () => {
  const mk = (): Machine => ({
    id: 'm',
    machine_info: { hostname: 't', ip: '10.0.0.1', mac: '', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: 4, scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/tmp/x.txt', content: 'x', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
    ],
  } as unknown as Machine);

  const req = (m: Machine, line: string) =>
    ({ line, machine: m, allMachines: [m], currentMissionId: 1, currentDir: '/' }) as any;

  it('debe expandir el alias al ejecutar', () => {
    const ex = createIsolatedExecutor();
    const m = mk();
    ex.executeCommand(req(m, "alias ll='ls -l'"));
    const result = ex.executeCommand(req(m, 'll /tmp'));
    expect(result.output).toContain('x.txt');
  });

  it('debe expandir en cada segmento del pipe', () => {
    const ex = createIsolatedExecutor();
    const m = mk();
    ex.executeCommand(req(m, "alias ll='ls'"));
    const result = ex.executeCommand(req(m, 'll /tmp | grep x'));
    expect(result.output).toContain('x.txt');
  });

  it('debe aislar alias por terminal (executor)', () => {
    const ex1 = createIsolatedExecutor();
    const ex2 = createIsolatedExecutor();
    const m = mk();
    ex1.executeCommand(req(m, "alias ll='ls'"));
    const result = ex2.executeCommand(req(m, 'll /tmp'));
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Command not found: ll');
  });
});
