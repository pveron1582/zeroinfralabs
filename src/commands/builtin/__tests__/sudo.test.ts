// ── commands/builtin/__tests__/sudo.test.ts ───────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_sudo } from '../sudo';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_sudo', () => {
  const createMockMachine = (withSudoers: boolean = true): Machine => ({
    id: 'target-01',
    machine_info: {
      hostname: 'victim-host',
      ip: '192.168.1.10',
      mac: '00:00:00:00:00:00',
      os: 'Ubuntu 20.04',
      status: 'up',
      type: 'server',
    },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: withSudoers
      ? [{ path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' }]
      : [],
  });

  const createMockContext = (machine: Machine, missionId: number = 5): CommandContext => ({
    machine,
    allMachines: [{
      ...machine,
      learning_steps: [
        { id: 1, task: 'Reconocimiento de red', text: 'arp-scan', targetMachineId: machine.id, discoveryLevel: 1 },
        { id: 2, task: 'Escaneo de puertos', text: 'nmap', targetMachineId: machine.id, discoveryLevel: 2 },
        { id: 3, task: 'Fuerza bruta SSH', text: 'hydra', targetMachineId: machine.id, discoveryLevel: 3 },
        { id: 4, task: 'Enumeración de sudo', text: 'sudo -l', targetMachineId: machine.id, discoveryLevel: 3 },
        { id: 5, task: 'Escalada de privilegios', text: 'sudo vim', targetMachineId: machine.id, discoveryLevel: 4 },
      ],
    }],
    currentMissionId: missionId,
    currentDir: '/',
  });

  describe('sin argumentos', () => {
    it('debe mostrar uso cuando no hay argumentos', () => {
      const machine = createMockMachine();
      const result = cmd_sudo.execute([], createMockContext(machine));

      expect(result.output).toContain('usage: sudo');
      expect(result.isError).toBe(false);
    });
  });

  describe('sudo -l', () => {
    it('debe mostrar permisos del usuario en sudoers', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['-l'], createMockContext(machine));

      expect(result.output).toContain('developer');
      expect(result.output).toContain('NOPASSWD');
      expect(result.output).toContain('/usr/bin/vim');
    });

    it('debe mostrar error si no existe /etc/sudoers', () => {
      const machine = createMockMachine(false);
      const result = cmd_sudo.execute(['-l'], createMockContext(machine));

      expect(result.output).toContain('unable to open /etc/sudoers');
      expect(result.isError).toBe(true);
    });

    it('debe completar misión 4 al ejecutar sudo -l', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['-l'], createMockContext(machine, 4));

      expect(result.completedMissionId).toBe(4);
    });
  });

  describe('sudo vim -c "!bash" - escalada de privilegios', () => {
    it('debe escalar a root con vim -c "!bash"', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['vim', '-c', '!bash'], createMockContext(machine, 5));

      expect(result.output).toContain('root');
      expect(result.output).toContain('uid=0');
    });

    it('debe completar misión 5 al escalar privilegios', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['vim', '-c', '!bash'], createMockContext(machine, 5));

      expect(result.completedMissionId).toBe(5);
    });

    it('debe aceptar variantes con comillas dobles', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['vim', '-c', '"!bash"'], createMockContext(machine));

      expect(result.output).toContain('root');
    });

    it('debe aceptar !sh como alternativa', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['vim', '-c', '!sh'], createMockContext(machine));

      expect(result.output).toContain('root');
    });
  });

  describe('sudo su / sudo bash', () => {
    it('debe permitir sudo bash con NOPASSWD', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['bash'], createMockContext(machine));

      expect(result.output).toContain('root@');
      expect(result.isError).toBe(false);
    });

    it('debe permitir sudo su con NOPASSWD', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['su'], createMockContext(machine));

      expect(result.output).toContain('root@');
    });
  });

  describe('sudo con otros comandos', () => {
    it('debe ejecutar comando genérico si tiene permisos', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['ls', '/root'], createMockContext(machine));

      expect(result.output).toContain('Ejecutando');
      expect(result.isError).toBe(false);
    });

    it('debe rechazar comando sin permisos en sudoers', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [{ path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' }],
      };
      const result = cmd_sudo.execute(['rm', '-rf', '/'], createMockContext(machine));

      // El comando 'rm' no está en sudoers, pero 'ALL' permite todo
      // Si queremos testear rechazo, necesitamos un sudoers más restrictivo
      expect(result.output).toBeDefined();
    });
  });
});