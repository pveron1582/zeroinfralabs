// ── commands/builtin/__tests__/which.test.ts ─────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_which, whichPathFor } from '../which';
import { COMMAND_NAMES } from '../../names';

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

// ── Sincronía con el registro (P1 3.2) ─────────────────────────────
// El mapa de paths eran 127 literales sin ningún test: ya mentía en las
// dos direcciones. Ahora la regla se deriva del registro, y esto lo fija.
describe('which — sincronía con el registro de comandos', () => {
  it('todo comando del registro tiene ruta (antes faltaban 11: chmod, scp, xrdp…)', () => {
    const sinPath = COMMAND_NAMES.filter(n => !whichPathFor(n));
    expect(sinPath).toEqual([]);
  });

  it('no inventa rutas para comandos que el simulador NO tiene', () => {
    // El mapa viejo tenía 19 entradas así: `which john`, `which bash`,
    // `which msfvenom` devolvían una ruta.
    for (const fantasma of ['john', 'git', 'bash', 'sh', 'perl', 'python2', 'msfvenom', 'apache2', 'mysql']) {
      expect(whichPathFor(fantasma), fantasma).toBeUndefined();
      expect(cmd_which.execute([fantasma], {} as any).output, fantasma).toBe('');
    }
  });

  it('la familia del directorio es la de cada grupo', () => {
    expect(whichPathFor('ls')).toBe('/bin/ls');
    expect(whichPathFor('ping')).toBe('/bin/ping');
    expect(whichPathFor('ifconfig')).toBe('/sbin/ifconfig');
    expect(whichPathFor('iptables')).toBe('/usr/sbin/iptables');
    // el resto cae en /usr/bin (Debian/Ubuntu)
    expect(whichPathFor('awk')).toBe('/usr/bin/awk');
    expect(whichPathFor('nmap')).toBe('/usr/bin/nmap');
  });

  it('los comandos que antes no tenían path ahora se encuentran', () => {
    // Los 11 que el registro tenía y el mapa no.
    for (const c of ['chmod', 'chown', 'chgrp', 'alias', 'unalias', 'type', 'umask', 'groups', 'history', 'htop', 'scp', 'xrdp', 'end']) {
      expect(cmd_which.execute([c], {} as any).output, c).not.toBe('');
    }
  });

  it('resuelve sin distinguir mayúsculas y no muta la entrada', () => {
    expect(whichPathFor('LS')).toBe('/bin/ls');
    expect(whichPathFor('Nmap')).toBe('/usr/bin/nmap');
  });
});
});
