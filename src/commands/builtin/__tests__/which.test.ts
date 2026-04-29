// ── commands/builtin/__tests__/which.test.ts ─────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_which } from '../which';

describe('cmd_which', () => {
  it('debe retornar path para comandos existentes', () => {
    const result = cmd_which.execute(['nmap'], {} as any);

    expect(result.output).toBe('/usr/bin/nmap');
  });

  it('debe retornar path para comandos builtin', () => {
    const result = cmd_which.execute(['ls'], {} as any);

    expect(result.output).toBe('/bin/ls');
  });

  it('debe retornar path para comandos de pentesting', () => {
    const result = cmd_which.execute(['hydra'], {} as any);

    expect(result.output).toBe('/usr/bin/hydra');
  });

  it('debe retornar path para netdiscover', () => {
    const result = cmd_which.execute(['netdiscover'], {} as any);

    expect(result.output).toBe('/usr/bin/netdiscover');
  });

  it('debe retornar path para ping', () => {
    const result = cmd_which.execute(['ping'], {} as any);

    expect(result.output).toBe('/bin/ping');
  });

  it('debe retornar path para traceroute', () => {
    const result = cmd_which.execute(['traceroute'], {} as any);

    expect(result.output).toBe('/usr/bin/traceroute');
  });

  it('debe retornar empty string para comandos inexistentes', () => {
    const result = cmd_which.execute(['comandoInexistente'], {} as any);

    expect(result.output).toBe('');
  });

  it('debe aceptar múltiples comandos', () => {
    const result = cmd_which.execute(['nmap', 'ls', 'hydra'], {} as any);

    expect(result.output).toContain('/usr/bin/nmap');
    expect(result.output).toContain('/bin/ls');
    expect(result.output).toContain('/usr/bin/hydra');
  });

  it('debe ignorar comandos inexistentes cuando hay algunos existentes', () => {
    const result = cmd_which.execute(['nmap', 'comandoInexistente'], {} as any);

    expect(result.output).toBe('/usr/bin/nmap');
  });

  it('debe retornar empty string sin argumentos', () => {
    const result = cmd_which.execute([], {} as any);

    expect(result.output).toBe('');
  });

  it('debe ignorar flags', () => {
    const result = cmd_which.execute(['--all', 'nmap'], {} as any);

    expect(result.output).toBe('/usr/bin/nmap');
  });

  it('debe ser case-insensitive', () => {
    const result = cmd_which.execute(['NMAP'], {} as any);

    expect(result.output).toBe('/usr/bin/nmap');
  });
});
