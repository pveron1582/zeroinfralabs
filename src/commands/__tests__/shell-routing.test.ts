// ── commands/__tests__/shell-routing.test.ts ──────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// P2-13 / C1 — el routing de sesiones de shell es POR TERMINAL (ownerId).
// Antes: una sesión abierta en la terminal A secuestraba lo que se escribía
// en la terminal B (shellManager global). Ahora cada terminal tiene su stack.

import { describe, it, expect, beforeEach } from 'vitest';
import { executeCommand, resetShellManager, createIsolatedExecutor } from '../index';
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

  it('abrir una terminal nueva no hereda la sesión SSH de otra', () => {
    const target = makeTarget();
    const all = [target];

    // Terminal A conectada por SSH
    const a = executeCommand(req('term-1', 'ssh user@10.0.0.5', target, all));
    expect('sshSession' in a && a.sshSession?.active).toBe(true);

    // Terminal recién abierta (term-2): sin sesión propia, prompt no-ssh
    const fresh = executeCommand(req('term-2', 'whoami', target, all));
    expect('sshSession' in fresh).toBe(false);
    expect(fresh.output).not.toContain('Connection to');

    // A sigue en su sesión
    const a2 = executeCommand(req('term-1', 'id', target, all));
    expect('sshSession' in a2).toBe(true);
  });
});

describe('Aislamiento MSF por terminal (createIsolatedExecutor)', () => {
  it('msfconsole en una terminal no activa msf en la otra', () => {
    const exA = createIsolatedExecutor();
    const exB = createIsolatedExecutor();
    const target = makeTarget();

    exA.executeCommand({ line: 'msfconsole', machine: target, allMachines: [target], currentMissionId: 1, terminalId: 'A' });
    expect(exA.isMsfActive()).toBe(true);

    // Terminal B: recién abierta, sin msf
    expect(exB.isMsfActive()).toBe(false);
    expect(exB.getMsfPrompt()).toBeNull();

    // B puede abrir su propio msf sin afectar el de A
    exB.executeCommand({ line: 'msfconsole', machine: target, allMachines: [target], currentMissionId: 1, terminalId: 'B' });
    expect(exB.isMsfActive()).toBe(true);
    expect(exA.isMsfActive()).toBe(true);

    // Cerrar msf en B no cierra el de A
    exB.resetMsfState();
    expect(exB.isMsfActive()).toBe(false);
    expect(exA.isMsfActive()).toBe(true);
  });
});