import { describe, it, expect } from 'vitest';
import { cmd_umask, applyUmask } from '../umask';
import type { CommandContext } from '../../../types';

function makeContext(initial = 0o022): { ctx: CommandContext; get: () => number } {
  let value = initial;
  const ctx = {
    umask: value,
    setUmask: (m: number) => { value = m; },
  } as CommandContext;
  return { ctx, get: () => value };
}

describe('cmd_umask', () => {
  it('debe mostrar la máscara actual en octal por defecto', () => {
    const { ctx } = makeContext();
    const result = cmd_umask.execute([], ctx);
    expect(result.output).toBe('022');
    expect(result.isError).toBe(undefined);
  });

  it('debe mostrar la máscara actual del contexto', () => {
    const { ctx } = makeContext(0o077);
    const result = cmd_umask.execute([], ctx);
    expect(result.output).toBe('077');
  });

  it('debe establecer nueva máscara con valor octal', () => {
    const { ctx, get } = makeContext();
    const result = cmd_umask.execute(['077'], ctx);
    expect(result.isError).toBe(undefined);
    expect(result.output).toBe('');
    expect(get()).toBe(0o077);
  });

  it('debe establecer nueva máscara con prefijo 0', () => {
    const { ctx, get } = makeContext();
    cmd_umask.execute(['002'], ctx);
    expect(get()).toBe(0o002);
  });

  it('debe mostrar modo simbólico con -S', () => {
    const { ctx } = makeContext(0o022);
    const result = cmd_umask.execute(['-S'], ctx);
    expect(result.output).toBe('u=rwx,g=rx,o=rx');
    expect(result.isError).toBe(undefined);
  });

  it('debe mostrar error con argumentos de más', () => {
    const { ctx } = makeContext();
    const result = cmd_umask.execute(['022', 'extra'], ctx);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('usage: umask');
  });

  it('debe mostrar error con máscara inválida', () => {
    const { ctx } = makeContext();
    const result = cmd_umask.execute(['abc'], ctx);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid mask');
  });

  it('debe mostrar error con número fuera de rango', () => {
    const { ctx } = makeContext();
    const result = cmd_umask.execute(['888'], ctx);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('invalid mask');
  });
});

describe('applyUmask', () => {
  it('debe calcular mode efectivo correctamente', () => {
    expect(applyUmask(0o666, 0o022)).toBe(0o644);
    expect(applyUmask(0o777, 0o022)).toBe(0o755);
  });

  it('debe calcular con umask 077', () => {
    expect(applyUmask(0o666, 0o077)).toBe(0o600);
    expect(applyUmask(0o777, 0o077)).toBe(0o700);
  });

  it('debe usar 022 por defecto si no se pasa umask', () => {
    expect(applyUmask(0o666)).toBe(0o644);
  });
});
