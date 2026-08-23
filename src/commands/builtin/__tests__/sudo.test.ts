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
    found_credentials: [{ file: '', user: 'developer', pass: 'devpass', verified: true, service: 'ssh' }],
    files: withSudoers
      ? [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'developer:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ]
      : [],
  });

  const createMockContext = (machine: Machine): CommandContext => ({
    machine,
    allMachines: [machine],
    currentMissionId: 1,
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

    it('debe mostrar los privilegios de root cuando root ejecuta sudo -l', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        su_user: 'root',
        files: [
          { path: '/etc/sudoers', content: 'root ALL=(ALL:ALL) ALL\ndeveloper ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const result = cmd_sudo.execute(['-l'], createMockContext(machine));

      expect(result.isError).toBe(false);
      expect(result.output).toContain('root');
      expect(result.output).toContain('(ALL : ALL) ALL');
      const sp = 'sudoPrivileges' in result ? result.sudoPrivileges : undefined;
      expect(sp?.user).toBe('root');
      expect(sp?.canSudo).toBe(true);
    });

    it('debe mostrar error si no existe /etc/sudoers', () => {
      const machine = createMockMachine(false);
      const result = cmd_sudo.execute(['-l'], createMockContext(machine));

      expect(result.output).toContain('unable to open /etc/sudoers');
      expect(result.isError).toBe(true);
    });

    it('debe devolver sudoPrivileges al ejecutar sudo -l (para que el lab valide)', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['-l'], createMockContext(machine));

      const sp = 'sudoPrivileges' in result ? result.sudoPrivileges : undefined;
      expect(sp).toBeDefined();
      expect(sp?.user).toBe('developer');
      expect(sp?.canSudo).toBe(true);
      // Nota: sudo ya no completa misiones, eso lo hace el laboratorio
    });
  });

  describe('sudo vim -c "!bash" - escalada de privilegios', () => {
    it('debe escalar a root con vim -c "!bash"', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['vim', '-c', '!bash'], createMockContext(machine));

      expect(result.output).toContain('root');
      expect(result.output).toContain('uid=0');
    });

    it('debe reportar privescAttempted al escalar (para que el lab valide)', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['vim', '-c', '!bash'], createMockContext(machine));

      const pa = 'privescAttempted' in result ? result.privescAttempted : undefined;
      const pt = 'privescTool' in result ? result.privescTool : undefined;
      const pv = 'privescViaSudo' in result ? result.privescViaSudo : undefined;
      expect(pa).toBe(true);
      expect(pt).toBe('vim');
      expect(pv).toBe(true);
      // Nota: sudo ya no completa misiones, eso lo hace el laboratorio
    });

    it('debe emitir privescCompleted con el id de la máquina al escalar', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['vim', '-c', '!bash'], createMockContext(machine));

      // Terminal.tsx escucha este campo y llama a setPrivescCompleted(machineId),
      // que pone privesc_completed=true en la máquina. useTerminalIdentity
      // entonces devuelve 'root' y el prompt pasa a root@...#.
      const pc = 'privescCompleted' in result ? result.privescCompleted : undefined;
      expect(pc).toBe(machine.id);
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
    it('debe permitir sudo bash con NOPASSWD: ALL', () => {
      const machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL:ALL) NOPASSWD: ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'developer:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const result = cmd_sudo.execute(['bash'], createMockContext(machine));

      expect(result.output).toContain('root@');
      expect(result.isError).toBe(false);
    });

    it('debe permitir sudo su con NOPASSWD: ALL', () => {
      const machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL:ALL) NOPASSWD: ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'developer:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const result = cmd_sudo.execute(['su'], createMockContext(machine));

      expect(result.output).toContain('root@');
    });

    it('debe rechazar sudo bash si el sudoers solo permite vim', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['bash'], createMockContext(machine));

      expect(result.output).toContain('not allowed');
      expect(result.isError).toBe(true);
    });

    it('debe permitir TODO al usuario en grupo sudo con regla %sudo (como UNIX real)', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [
          // Sin regla por-usuario; solo la de grupo. El usuario es miembro
          // explícito del grupo sudo en /etc/group.
          { path: '/etc/sudoers', content: 'root ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:27:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const ctx = createMockContext(machine);

      const result = cmd_sudo.execute(['bash'], ctx);
      expect(result.output).not.toContain('not allowed');
      expect(result.isError).toBe(false);
    });

    it('debe mostrar las reglas %grupo en sudo -l', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'root ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const result = cmd_sudo.execute(['-l'], createMockContext(machine));

      expect(result.output).toContain('may run the following commands');
      expect(result.output).not.toContain('may not run sudo');
      const sp = 'sudoPrivileges' in result ? result.sudoPrivileges : undefined;
      expect(sp?.canSudo).toBe(true);
    });

    it('NO debe otorgar privilegios por grupo si el sudoers no tiene regla %grupo', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'root ALL=(ALL:ALL) ALL\notheruser ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const result = cmd_sudo.execute(['bash'], createMockContext(machine));

      expect(result.output).toContain('is not in the sudoers file');
      expect(result.isError).toBe(true);
    });
  });

  describe('sudo -i / sudo -s (login shell root)', () => {
    it('sudo -i debe pedir la password de root (sin importar el sudoers)', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['-i'], createMockContext(machine));

      expect(result.output).toBe('');
      expect(result.isError).toBe(false);
      expect('requiresPassword' in result ? result.requiresPassword : undefined).toBe(true);
      // Se valida la password de ROOT, no la del usuario invocante.
      expect('suTarget' in result ? result.suTarget : undefined).toBe('root');
      expect('sudoEscalation' in result ? result.sudoEscalation : undefined).toBe(true);
      // -i mantiene el directorio actual → sin sudoCwd.
      expect('sudoCwd' in result ? result.sudoCwd : undefined).toBeUndefined();
    });

    it('sudo -s debe pedir la password de root y dejar en /root', () => {
      const machine = createMockMachine(true);
      const result = cmd_sudo.execute(['-s'], createMockContext(machine));

      expect(result.output).toBe('');
      expect(result.isError).toBe(false);
      expect('requiresPassword' in result ? result.requiresPassword : undefined).toBe(true);
      expect('suTarget' in result ? result.suTarget : undefined).toBe('root');
      expect('sudoEscalation' in result ? result.sudoEscalation : undefined).toBe(true);
      expect('sudoCwd' in result ? result.sudoCwd : undefined).toBe('/root');
    });

    it('sudo -i no pide nada ni apila cuando ya se es root', () => {
      const machine = {
        ...createMockMachine(true),
        su_user: 'root',
        files: [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const result = cmd_sudo.execute(['-i'], createMockContext(machine));

      expect(result.output).toContain('already root');
      expect(result.isError).toBe(false);
      expect('requiresPassword' in result ? result.requiresPassword : undefined).toBeUndefined();
      expect('privescCompleted' in result ? result.privescCompleted : undefined).toBeUndefined();
    });
  });

  describe('sudo con otros comandos', () => {
    it('debe ejecutar comando genérico si tiene permisos (NOPASSWD: ALL)', () => {
      const machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL:ALL) NOPASSWD: ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'developer:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
        ],
      };
      const result = cmd_sudo.execute(['ls', '/root'], createMockContext(machine));

      expect(result.output).toContain('Ejecutando');
      expect(result.isError).toBe(false);
    });

    it('debe abrir nano como root (elevated) con sudo nano <archivo restringido>', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL:ALL) NOPASSWD: ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
          // /etc/hosts: owner root, solo lectura para otros (0644)
          { path: '/etc/hosts', content: '127.0.0.1 localhost\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        ],
      };
      const result = cmd_sudo.execute(['nano', '/etc/hosts'], createMockContext(machine));

      const nf = 'nanoFile' in result ? result.nanoFile : undefined;
      expect(nf).toBeDefined();
      expect(nf?.path).toBe('/etc/hosts');
      expect(nf?.content).toContain('localhost');
      // Root puede editar: no read-only y elevado para que el save use root.
      expect(nf?.readOnly).toBe(false);
      expect(nf?.elevated).toBe(true);
    });

    it('debe emitir fileRead al abrir una flag con sudo nano (valida la misión)', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL:ALL) NOPASSWD: ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
          { path: '/root/flag2.txt', content: 'ZIL{SUDO_NANO_READS}', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
        ],
      };
      const result = cmd_sudo.execute(['nano', '/root/flag2.txt'], createMockContext(machine));

      const fr = 'fileRead' in result ? result.fileRead : undefined;
      expect(fr).toBeDefined();
      expect(fr?.isFlag).toBe(true);
      expect(fr?.content).toContain('ZIL{');
    });

    it('debe abrir nano como root aunque el usuario no pueda leer el archivo', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [
          { path: '/etc/sudoers', content: 'developer ALL=(ALL:ALL) NOPASSWD: ALL', type: 'text' },
          { path: '/etc/group', content: 'sudo:x:27:developer\nwheel:x:10:developer\n', type: 'text' },
          { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\ndeveloper:x:1001:1001:Developer:/home/developer:/bin/bash\n', type: 'text' },
          // /root/secret.txt: 0600 root → solo root puede leerlo
          { path: '/root/secret.txt', content: 'top secret', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
        ],
      };
      const result = cmd_sudo.execute(['nano', '/root/secret.txt'], createMockContext(machine));

      const nf = 'nanoFile' in result ? result.nanoFile : undefined;
      expect(nf).toBeDefined();
      expect(nf?.path).toBe('/root/secret.txt');
      expect(nf?.content).toBe('top secret');
      expect(nf?.readOnly).toBe(false);
      expect(nf?.elevated).toBe(true);
    });

    it('debe rechazar sudo nano si el sudoers no lo permite', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [{ path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' }],
      };
      const result = cmd_sudo.execute(['nano', '/etc/hosts'], createMockContext(machine));

      expect(result.output).toContain('not allowed');
      expect(result.isError).toBe(true);
      expect('nanoFile' in result).toBe(false);
    });

    it('debe rechazar comando no autorizado en el sudoers (solo vim)', () => {
      const machine: Machine = {
        ...createMockMachine(true),
        files: [{ path: '/etc/sudoers', content: 'developer ALL=(ALL) NOPASSWD: /usr/bin/vim', type: 'text' }],
      };
      const result = cmd_sudo.execute(['rm', '-rf', '/'], createMockContext(machine));

      // Con el parsing estricto, `ALL=(ALL)` es hosts/run-as, NO otorga todos
      // los comandos: la lista de comandos solo contiene /usr/bin/vim.
      expect(result.output).toContain('not allowed');
      expect(result.isError).toBe(true);
    });
  });
});