// ── commands/__tests__/commands-basics.test.ts ────────────────────
// Test de humo: help, whoami, ifconfig, clear, ls, cat
// Verifica que comandos built-in respondan sin depender de ningún lab

import { describe, it, expect } from 'vitest';
import { createAttacker, exec, expectSuccess, setupBeforeEach } from './happyPathHelpers';
import type { Machine } from '../../types';

setupBeforeEach();

describe('Comandos básicos funcionan en todos los contextos', () => {
  const attacker = createAttacker();

  it('help muestra comandos clave de pentesting', () => {
    const result = exec('help', attacker, [attacker], 1);
    expect(result.isError).not.toBe(true);
    expect(result.output).toContain('arp-scan');
    expect(result.output).toContain('nmap');
    expect(result.output).toContain('hydra');
    expect(result.output).toContain('ssh');
    expect(result.output).toContain('msfconsole');
  });

  it('whoami muestra root en atacante', () => {
    const result = exec('whoami', attacker, [attacker], 1);
    expect(result.isError).not.toBe(true);
    expect(result.output).toContain('root');
  });

  it('ifconfig muestra IP del atacante', () => {
    const result = exec('ifconfig', attacker, [attacker], 1);
    expect(result.isError).not.toBe(true);
    expect(result.output).toContain('192.168.1.10');
  });

  it('clear retorna CLEAR_TERMINAL', () => {
    const result = exec('clear', attacker, [attacker], 1);
    expect(result.output).toBe('CLEAR_TERMINAL');
  });

  it('comando desconocido retorna isError true', () => {
    const result = exec('fakecommand', attacker, [attacker], 1);
    expect(result.isError).toBe(true);
    expect(result.output).toContain('Command not found');
  });

  it('ls lista archivos del atacante', () => {
    const attackerWithFiles: Machine = {
      ...attacker,
      files: [
        { path: '/root/payload.php', content: '<?php echo "test"; ?>', type: 'text' },
        { path: '/root/notes.txt', content: 'My notes', type: 'text' },
      ],
    };
    const result = exec('ls /root', attackerWithFiles, [attackerWithFiles], 1);
    expect(result.isError).not.toBe(true);
    expect(result.output).toContain('payload.php');
    expect(result.output).toContain('notes.txt');
  });

  it('cat lee archivo existente — valida contenido exacto', () => {
    const attackerWithFiles: Machine = {
      ...attacker,
      files: [
        { path: '/root/flag.txt', content: 'THM{TEST_FLAG}', type: 'text' },
      ],
    };
    const result = exec('cat /root/flag.txt', attackerWithFiles, [attackerWithFiles], 1);
    expectSuccess(result);
    expect(result.output).toBe('THM{TEST_FLAG}');
  });

  it('cat con archivo inexistente retorna isError true', () => {
    const result = exec('cat /root/nonexistent.txt', attacker, [attacker], 1);
    expect(result.isError).toBe(true);
    //expect(result.completedMissionId).toBeUndefined(); no hace mas esto, se modifico variable
  });
});
