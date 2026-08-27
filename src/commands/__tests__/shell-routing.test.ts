// ── commands/__tests__/shell-routing.test.ts ──────────────────────
// P2-13 / C1 — el routing de sesiones de shell es POR TERMINAL (ownerId).
// Antes: una sesión abierta en la terminal A secuestraba lo que se escribía
// en la terminal B (shellManager global). Ahora cada terminal tiene su stack.

import { describe, it, expect, beforeEach } from 'vitest';
import { executeCommand, resetShellManager } from '../index';
import { useScenarioStore } from '../../store/scenarioStore';
import type { Machine } from '../../types';

function makeTarget(): Machine {
  return {
    id: 'tgt',
    machine_info: { hostname: 'host', ip: '10.0.0.5', mac: 'aa', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 3,
    scan_results: {
      ports: [
        { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH' },
      ],
    },
    web_enumeration: { web_server: 'Apache', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
  };
}

const req = (terminalId: string, line: string, machine: Machine, allMachines: Machine[]) => ({
  line,
  machine,
  allMachines,
  currentMissionId: 1,
  terminalId,
});

describe('ShellManager routing por terminal (P2-13)', () => {
  beforeEach(() => {
    resetShellManager();
    useScenarioStore.setState({ missions: [] });
  });

  it('una sesión en la terminal A no secuestra la escritura de la terminal B', () => {
    const target = makeTarget();
    const all = [target];

    // Terminal A inicia una sesión SSH contra el objetivo
    const ssh = executeCommand(req('t-A', 'ssh user@10.0.0.5', target, all));
    expect('sshSession' in ssh && ssh.sshSession?.active).toBe(true);

    // Terminal B escribe un comando normal: NO debe entrar a la sesión de A.
    const b = executeCommand(req('t-B', 'echo hola', target, all));
    expect('sshSession' in b).toBe(false);
    expect(b.output).toContain('hola');

    // La sesión SSH de A sigue activa al escribir en A (responde como sesión ssh)
    const a2 = executeCommand(req('t-A', 'pwd', target, all));
    expect('sshSession' in a2).toBe(true);
  });

  it('startShellSession con ownerId distinto crea stacks independientes', () => {
    const target = makeTarget();
    const all = [target];

    executeCommand(req('A', 'ssh user@10.0.0.5', target, all));
    // B nunca inició sesión: su comando normal no se enruta a shell alguno
    const b = executeCommand(req('B', 'echo hola', target, all));
    expect(b.output).toContain('hola');
    expect('sshSession' in b).toBe(false);
  });
});