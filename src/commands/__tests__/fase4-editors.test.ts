import { describe, it, expect, beforeEach } from 'vitest';
import type { Machine } from '../../types';
import { executeCommand } from '../index';

let machine: Machine;

beforeEach(() => {
  machine = {
    id: 'target-test',
    machine_info: { hostname: 'test', ip: '192.168.1.100', mac: '00:00:00:00:00:01', os: 'Linux', status: 'up', type: 'workstation' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/user/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      { path: '/home/user/file.txt', content: 'hello', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
      { path: '/tmp/existing.txt', content: 'old', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: 'root:x:0:\nuser:x:1000:', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    ],
  };
});

describe('Fase 4: Editores y manipulación de archivos', () => {
  describe('4.1 echo', () => {
    it('debe imprimir texto sin redirección', () => {
      const r = executeCommand('echo hola mundo', machine, [machine], 0, undefined, '/home/user/');
      expect(r.output).toBe('hola mundo');
    });

    it('debe escribir archivo con >', () => {
      const r = executeCommand('echo hello world > newfile.txt', machine, [machine], 0, undefined, '/home/user/');
      expect(r.isError).not.toBe(true);
      const f = machine.files.find(f => f.path === '/home/user/newfile.txt');
      expect(f).toBeDefined();
      expect(f!.content).toBe('hello world\n');
    });

    it('debe sobrescribir archivo existente con >', () => {
      const r = executeCommand('echo overwritten > /tmp/existing.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      const f = machine.files.find(f => f.path === '/tmp/existing.txt');
      expect(f!.content).toBe('overwritten\n');
    });

    it('debe append con >>', () => {
      const r = executeCommand('echo appended >> /tmp/existing.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      const f = machine.files.find(f => f.path === '/tmp/existing.txt');
      expect(f!.content).toBe('oldappended\n');
    });

    it('debe crear archivo nuevo con >> si no existe', () => {
      const r = executeCommand('echo new >> /tmp/new_append.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      const f = machine.files.find(f => f.path === '/tmp/new_append.txt');
      expect(f).toBeDefined();
      expect(f!.content).toBe('new\n');
    });

    it('debe denegar escritura sin permiso en el directorio padre', () => {
      const r = executeCommand('echo test > /usr/bin/no_write.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).toBe(true);
      expect(r.output).toContain('Permission denied');
    });
  });

  describe('4.2 touch', () => {
    it('debe crear archivo vacío si no existe', () => {
      const r = executeCommand('touch /tmp/newfile.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      const f = machine.files.find(f => f.path === '/tmp/newfile.txt');
      expect(f).toBeDefined();
      expect(f!.content).toBe('');
    });

    it('debe ignorar archivo existente', () => {
      const r = executeCommand('touch /tmp/existing.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
    });

    it('debe denegar creación sin permiso en el directorio padre', () => {
      const r = executeCommand('touch /usr/bin/cant.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).toBe(true);
      expect(r.output).toContain('Permission denied');
    });
  });

  describe('4.3 rm', () => {
    it('debe eliminar archivo', () => {
      machine.files.push({ path: '/tmp/toremove.txt', content: 'bye', type: 'text', owner: 'user', group: 'user', mode: 0o644 });
      const r = executeCommand('rm /tmp/toremove.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect(machine.files.find(f => f.path === '/tmp/toremove.txt')).toBeUndefined();
    });

    it('debe denegar si no existe (sin -f)', () => {
      const r = executeCommand('rm /tmp/nonexistent.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).toBe(true);
    });

    it('debe ignorar si no existe con -f', () => {
      const r = executeCommand('rm -f /tmp/nonexistent.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
    });

    it('debe eliminar directorio vacío con -r', () => {
      machine.files.push({ path: '/tmp/emptydir/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 });
      const r = executeCommand('rm -r /tmp/emptydir', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect(machine.files.find(f => f.path === '/tmp/emptydir/.dir')).toBeUndefined();
    });

    it('debe eliminar directorio con contenido con -r', () => {
      machine.files.push(
        { path: '/tmp/mydir/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
        { path: '/tmp/mydir/a.txt', content: 'a', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
        { path: '/tmp/mydir/sub/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
      );
      const r = executeCommand('rm -r /tmp/mydir', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect(machine.files.find(f => f.path.startsWith('/tmp/mydir'))).toBeUndefined();
    });

    it('debe rechazar rm sin -r en directorio', () => {
      machine.files.push({ path: '/tmp/adir/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 });
      const r = executeCommand('rm /tmp/adir', machine, [machine], 0, undefined, '/');
      expect(r.output).toContain('Is a directory');
    });
  });

  describe('4.4 cp', () => {
    it('debe copiar archivo', () => {
      const r = executeCommand('cp /home/user/file.txt /tmp/copy.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      const copy = machine.files.find(f => f.path === '/tmp/copy.txt');
      expect(copy).toBeDefined();
      expect(copy!.content).toBe('hello');
    });

    it('debe copiar directorio con -r', () => {
      machine.files.push(
        { path: '/home/user/docs/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 },
        { path: '/home/user/docs/readme.txt', content: 'readme', type: 'text', owner: 'user', group: 'user', mode: 0o644 },
      );
      const r = executeCommand('cp -r /home/user/docs /tmp/docs_copy', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect(machine.files.find(f => f.path === '/tmp/docs_copy/.dir')).toBeDefined();
      expect(machine.files.find(f => f.path === '/tmp/docs_copy/readme.txt')).toBeDefined();
    });

    it('debe denegar cp sin -r en directorio', () => {
      machine.files.push({ path: '/home/user/docs/.dir', content: '', type: 'text', owner: 'user', group: 'user', mode: 0o755 });
      const r = executeCommand('cp /home/user/docs /tmp/docs_copy2', machine, [machine], 0, undefined, '/');
      expect(r.output).toContain('omitting directory');
    });
  });

  describe('4.5 mv', () => {
    it('debe mover archivo', () => {
      machine.files.push({ path: '/tmp/move_me.txt', content: 'moveme', type: 'text', owner: 'user', group: 'user', mode: 0o644 });
      const r = executeCommand('mv /tmp/move_me.txt /home/user/moved.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect(machine.files.find(f => f.path === '/tmp/move_me.txt')).toBeUndefined();
      expect(machine.files.find(f => f.path === '/home/user/moved.txt')).toBeDefined();
    });

    it('debe renombrar archivo en el mismo directorio', () => {
      const r = executeCommand('mv /home/user/file.txt /home/user/renamed.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect(machine.files.find(f => f.path === '/home/user/file.txt')).toBeUndefined();
      expect(machine.files.find(f => f.path === '/home/user/renamed.txt')).toBeDefined();
    });
  });

  describe('4.6 nano', () => {
    it('debe abrir archivo existente', () => {
      const r = executeCommand('nano /home/user/file.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect((r as any).nanoFile).toBeDefined();
      expect((r as any).nanoFile.path).toBe('/home/user/file.txt');
      expect((r as any).nanoFile.content).toBe('hello');
    });

    it('debe crear archivo nuevo si no existe y padre tiene permiso', () => {
      const r = executeCommand('nano /tmp/new_nano_file.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect((r as any).nanoFile).toBeDefined();
      expect((r as any).nanoFile.path).toBe('/tmp/new_nano_file.txt');
      expect((r as any).nanoFile.content).toBe('');
      expect(machine.files.find(f => f.path === '/tmp/new_nano_file.txt')).toBeUndefined();
    });

    it('debe mostrar error si el directorio padre no existe', () => {
      const r = executeCommand('nano /nonexistent_dir/file.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).toBe(true);
    });

    it('debe abrir editor sin argumentos', () => {
      const r = executeCommand('nano', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect((r as any).nanoFile).toBeDefined();
      expect((r as any).nanoFile.path).toBe('');
      expect((r as any).nanoFile.content).toBe('');
    });

    it('debe permitir abrir archivo solo-lectura cuando hay permiso de lectura', () => {
      machine.files.push({
        path: '/srv/shared.txt',
        content: 'secreto',
        type: 'text',
        owner: 'root',
        group: 'user',
        mode: 0o640,
      });
      const r = executeCommand('nano /srv/shared.txt', machine, [machine], 0, undefined, '/');
      expect(r.isError).not.toBe(true);
      expect((r as any).nanoFile.path).toBe('/srv/shared.txt');
      expect((r as any).nanoFile.readOnly).toBe(true);
    });

    it('debe denegar apertura si no hay permiso de lectura ni escritura', () => {
      machine.files.push({
        path: '/root/private.txt',
        content: 'secreto',
        type: 'text',
        owner: 'root',
        group: 'root',
        mode: 0o600,
      });
      const orig = machine.found_credentials;
      machine.found_credentials = undefined;
      machine.su_user = undefined;
      const r = executeCommand('nano /root/private.txt', machine, [machine], 0, undefined, '/');
      machine.found_credentials = orig;
      machine.su_user = undefined;
      expect(r.isError).toBe(true);
      expect(r.output).toContain('Permission denied');
    });
  });

  describe('4.7 redirection utils', () => {
    it('debe parsear > correctamente', async () => {
      const { parseRedirection } = await import('../../utils/redirection');
      const r = parseRedirection(['hello', 'world', '>', 'file.txt']);
      expect(r.text).toBe('hello world');
      expect(r.operator).toBe('>');
      expect(r.filename).toBe('file.txt');
    });

    it('debe parsear >> correctamente', async () => {
      const { parseRedirection } = await import('../../utils/redirection');
      const r = parseRedirection(['line', '>>', '/tmp/log.txt']);
      expect(r.text).toBe('line');
      expect(r.operator).toBe('>>');
      expect(r.filename).toBe('/tmp/log.txt');
    });

    it('debe retornar sin redirección si no hay >', async () => {
      const { parseRedirection } = await import('../../utils/redirection');
      const r = parseRedirection(['just', 'text']);
      expect(r.text).toBe('just text');
      expect(r.operator).toBeNull();
      expect(r.filename).toBeNull();
    });
  });
});
