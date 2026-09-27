// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_man, cmd_whatis, cmd_apropos } from '../man';

describe('cmd_man', () => {
  it('debe mostrar la página de un comando', () => {
    const result = cmd_man.execute(['ls'], {} as any);
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('LS(1)');
    expect(result.output).toContain('list');
  });

  it('debe pedir página si no hay argumento', () => {
    const result = cmd_man.execute([], {} as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('What manual page');
  });

  it('debe fallar si no hay entrada', () => {
    const result = cmd_man.execute(['nosuchcmd'], {} as any);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('No manual entry');
  });
});

describe('cmd_whatis', () => {
  it('debe mostrar una línea', () => {
    const result = cmd_whatis.execute(['ssh'], {} as any);
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('ssh (1)');
  });

  it('debe fallar si no hay entrada', () => {
    expect(cmd_whatis.execute(['nosuchcmd'], {} as any).isError).toBe(true);
  });
});

describe('cmd_apropos', () => {
  it('debe buscar por palabra clave', () => {
    const result = cmd_apropos.execute(['firewall'], {} as any);
    expect(result.isError).toBeFalsy();
    expect(result.output).toContain('iptables');
    expect(result.output).toContain('ufw');
  });

  it('debe fallar si no hay coincidencias', () => {
    expect(cmd_apropos.execute(['zzzznada'], {} as any).isError).toBe(true);
  });
});
