// ── commands/__tests__/fase7-packages-pipes-env.test.ts ─────────────
// Tests de la Fase 7 del ROADMAP: sistema de paquetes (apt/dpkg),
// pipes y redirección (|, >, >>, <) y variables de entorno
// (export/env/unset, $VAR).

import { describe, it, expect, beforeEach } from 'vitest';
import { cmd_apt } from '../tools/apt';
import { cmd_dpkg } from '../tools/dpkg';
import { cmd_export, cmd_env, cmd_unset } from '../builtin/export';
import { cmd_grep, cmd_head, cmd_tail, cmd_wc, cmd_sort, cmd_uniq } from '../builtin/pipeline';
import { executeCommand } from '../index';
import { resetPackageManager, isInstalled, listInstalled, installPackage, removePackage } from '../../frameworks/packages/packageManager';
import { expandVariables, parseExportAssignment, DEFAULT_ENV } from '../../utils/environment';
import { expandCommandLine, extractRedirection, splitTopLevel, splitArgs } from '../../utils/shellParse';
import type { Machine } from '../../types';

function makeMachine(overrides: Partial<Machine> = {}): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'nginx', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nadmin:x:1000:1000:Admin:/home/admin:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/usr/bin/nmap', content: 'nmap', type: 'binary', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/usr/bin/curl', content: 'curl', type: 'binary', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/admin/.dir', content: '', type: 'text', owner: 'admin', group: 'admin', mode: 0o755 },
      { path: '/home/admin/notes.txt', content: 'todo: root password\nhost: internal-01\n', type: 'text', owner: 'admin', group: 'admin', mode: 0o644 },
      { path: '/etc/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/usr/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
    ],
    ...overrides,
  };
}

function makeRootMachine(overrides: Partial<Machine> = {}): Machine {
  return makeMachine({
    id: 'attacker-01',
    machine_info: { hostname: 'kali', ip: '192.168.1.5', mac: '08:00:27:AA:BB:CC', os: 'Kali Linux 2024.2', status: 'up', type: 'workstation' },
    ...overrides,
  });
}

function makeRootTarget(overrides: Partial<Machine> = {}): Machine {
  return makeMachine({ su_user: 'root', ...overrides });
}

function ctx(machine: Machine) {
  return { machine, allMachines: [machine], currentMissionId: 1, currentDir: '/', language: 'es' as const };
}

function applyResult(machine: Machine, r: { filesChanged?: Machine['files'] }) {
  if (r.filesChanged) machine.files = r.filesChanged;
}

beforeEach(() => {
  resetPackageManager();
});

describe('Fase 7 - apt', () => {
  it('apt: update requiere root', () => {
    const machine = makeMachine();
    const r = cmd_apt.execute(['update'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('root');
  });

  it('apt: install agrega binarios del paquete al filesystem', () => {
    const machine = makeRootTarget();
    const r = cmd_apt.execute(['install', 'git'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(isInstalled(machine, 'git')).toBe(true);
    applyResult(machine, r);
    expect(machine.files.some(f => f.path === '/usr/bin/git')).toBe(true);
    expect(r.filesChanged).toBeDefined();
  });

  it('apt: install paquete desconocido falla', () => {
    const machine = makeRootTarget();
    const r = cmd_apt.execute(['install', 'no-such-pkg'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Unable to locate package');
  });

  it('apt: remove desinstala el paquete', () => {
    const machine = makeRootTarget();
    cmd_apt.execute(['install', 'curl'], ctx(machine));
    expect(isInstalled(machine, 'curl')).toBe(true);
    const r = cmd_apt.execute(['remove', 'curl'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(isInstalled(machine, 'curl')).toBe(false);
  });

  it('apt: list --installed muestra los paquetes base', () => {
    const machine = makeRootTarget();
    const r = cmd_apt.execute(['list', '--installed'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('nmap');
    expect(r.output).toContain('curl');
    expect(r.output).toContain('[installed]');
  });

  it('apt: search encuentra paquetes por descripción', () => {
    const machine = makeRootTarget();
    const r = cmd_apt.execute(['search', 'server'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('apache2');
    expect(r.output).toContain('nginx');
  });
});

describe('Fase 7 - dpkg', () => {
  it('dpkg: -l lista paquetes instalados', () => {
    const machine = makeRootTarget();
    const r = cmd_dpkg.execute(['-l'], ctx(machine));
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('ii');
    expect(r.output).toContain('nmap');
  });

  it('dpkg: -i instala un .deb local', () => {
    const machine = makeRootTarget();
    machine.files.push({ path: '/tmp/hydra.deb', content: 'Package: hydra\nVersion: 9.5-1\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 });
    const r = cmd_dpkg.execute(['-i', '/tmp/hydra.deb'], { ...ctx(machine), currentDir: '/' });
    expect(r.isError).not.toBe(true);
    expect(isInstalled(machine, 'hydra')).toBe(true);
    expect(r.output).toContain('Setting up hydra');
  });

  it('dpkg: -i requiere root', () => {
    const machine = makeMachine();
    const r = cmd_dpkg.execute(['-i', '/tmp/x.deb'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('superuser');
  });

  it('dpkg: -i archivo inexistente falla', () => {
    const machine = makeRootTarget();
    const r = cmd_dpkg.execute(['-i', '/tmp/missing.deb'], ctx(machine));
    expect(r.isError).toBe(true);
    expect(r.output).toContain('No such file');
  });
});

describe('Fase 7 - variables de entorno', () => {
  it('env: muestra las variables por defecto', () => {
    const machine = makeRootTarget();
    const r = cmd_env.execute([], { ...ctx(machine), env: DEFAULT_ENV(machine) });
    expect(r.output).toContain('PATH=/usr/local/sbin');
  });

  it('export: define una variable', () => {
    const machine = makeRootTarget();
    let env: Record<string, string> | undefined = undefined;
    const r = cmd_export.execute(['FOO=bar'], { ...ctx(machine), env, setEnv: e => { env = e; } });
    expect(r.isError).not.toBe(true);
    expect(env?.['FOO']).toBe('bar');
  });

  it('export: sin argumentos lista las variables', () => {
    const machine = makeRootTarget();
    const r = cmd_export.execute([], { ...ctx(machine), env: { USER: 'admin' } });
    expect(r.output).toContain('USER="admin"');
  });

  it('unset: elimina una variable', () => {
    const machine = makeRootTarget();
    let env: Record<string, string> = { FOO: 'bar' };
    const r = cmd_unset.execute(['FOO'], { ...ctx(machine), env, setEnv: e => { env = e; } });
    expect(r.isError).not.toBe(true);
    expect(env['FOO']).toBeUndefined();
  });

  it('parseExportAssignment: maneja comillas simples/dobles', () => {
    expect(parseExportAssignment('X="hello world"')).toEqual({ name: 'X', value: 'hello world' });
    expect(parseExportAssignment("Y='a b'")).toEqual({ name: 'Y', value: 'a b' });
    expect(parseExportAssignment('Z=plain')).toEqual({ name: 'Z', value: 'plain' });
    expect(parseExportAssignment('bad')).toBeNull();
  });

  it('expandVariables: expande $VAR y ${VAR}, desconocidas vacías', () => {
    const env = { USER: 'admin', HOME: '/home/admin' };
    expect(expandVariables('echo $USER', env)).toBe('echo admin');
    expect(expandVariables('echo ${HOME}', env)).toBe('echo /home/admin');
    expect(expandVariables('$NOPE', env)).toBe('');
  });

  it('DEFAULT_ENV: deriva HOME/USER de la máquina', () => {
    const machine = makeMachine({ found_credentials: [{ file: '', user: 'admin', pass: 'p', verified: true, service: 'ssh' }] });
    const env = DEFAULT_ENV(machine);
    expect(env['USER']).toBe('admin');
    expect(env['HOME']).toBe('/home/admin');
  });
});

describe('Fase 7 - pipes', () => {
  it('grep: filtra por patrón desde pipe', () => {
    const machine = makeRootTarget();
    const r = cmd_grep.execute(['root'], { ...ctx(machine), pipedInput: 'root:x:0:0\nadmin:x:1000\n' });
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe('root:x:0:0');
  });

  it('grep: -v invierte el filtro', () => {
    const machine = makeRootTarget();
    const r = cmd_grep.execute(['-v', 'root'], { ...ctx(machine), pipedInput: 'root:x\nadmin:x\n' });
    expect(r.output).toBe('admin:x');
  });

  it('grep: lee de un archivo si no hay pipe', () => {
    const machine = makeRootTarget();
    const r = cmd_grep.execute(['admin', '/etc/passwd'], ctx(machine));
    expect(r.output).toContain('admin:x:1000');
  });

  it('head/tail: recortan líneas', () => {
    const machine = makeRootTarget();
    expect(cmd_head.execute(['-n', '2'], { ...ctx(machine), pipedInput: 'a\nb\nc\n' }).output).toBe('a\nb');
    expect(cmd_tail.execute(['-n', '1'], { ...ctx(machine), pipedInput: 'a\nb\nc\n' }).output).toBe('c');
  });

  it('wc: cuenta líneas, palabras y caracteres', () => {
    const machine = makeRootTarget();
    expect(cmd_wc.execute([], { ...ctx(machine), pipedInput: 'uno dos\ntres\n' }).output).toBe('2 3 13');
  });

  it('sort: ordena líneas', () => {
    const machine = makeRootTarget();
    expect(cmd_sort.execute([], { ...ctx(machine), pipedInput: 'c\na\nb\n' }).output).toBe('a\nb\nc');
  });

  it('uniq: elimina duplicados consecutivos', () => {
    const machine = makeRootTarget();
    expect(cmd_uniq.execute([], { ...ctx(machine), pipedInput: 'a\na\nb\n' }).output).toBe('a\nb');
  });

  it('executeCommand: nmap | grep integrado preserva metadata del escáner', () => {
    const target = makeRootTarget();
    const attacker = makeRootMachine();
    const r = executeCommand('nmap -sV 192.168.1.10', attacker, [attacker, target], 1);
    expect('scanResults' in r).toBe(true);
  });

  it('executeCommand: cat | grep filtra el output real', () => {
    const machine = makeRootTarget();
    const r = executeCommand('cat /etc/passwd | grep admin', machine, [machine], 1);
    expect(r.isError).not.toBe(true);
    expect(r.output).toBe('admin:x:1000:1000:Admin:/home/admin:/bin/bash');
  });

  it('executeCommand: ls | head limita líneas', () => {
    const machine = makeRootTarget();
    const r = executeCommand('ls /etc | head -n 1', machine, [machine], 1);
    expect(r.isError).not.toBe(true);
    expect(r.output.split('\n')).toHaveLength(1);
  });

  it('executeCommand: wc cuenta salida de un pipe', () => {
    const machine = makeRootTarget();
    const r = executeCommand('cat /etc/passwd | wc', machine, [machine], 1);
    expect(r.isError).not.toBe(true);
    expect(r.output).toMatch(/^2 \d+ \d+/);
  });
});

describe('Fase 7 - redirección global', () => {
  it('executeCommand: > escribe output de un comando a archivo', () => {
    const machine = makeRootTarget();
    const r = executeCommand('ls /etc > /home/admin/salida.txt', machine, [machine], 1);
    expect(r.isError).not.toBe(true);
    expect(machine.files.some(f => f.path === '/home/admin/salida.txt')).toBe(true);
    expect(r.filesChanged).toBeDefined();
  });

  it('executeCommand: >> append respeta permisos', () => {
    const machine = makeRootTarget();
    executeCommand('echo uno > /home/admin/acc.txt', machine, [machine], 1);
    const r = executeCommand('echo dos >> /home/admin/acc.txt', machine, [machine], 1);
    expect(r.isError).not.toBe(true);
    const f = machine.files.find(f => f.path === '/home/admin/acc.txt');
    expect(f?.content).toContain('uno');
    expect(f?.content).toContain('dos');
  });

  it('executeCommand: usuario sin permisos recibe Permission denied', () => {
    const machine = makeMachine();
    const r = executeCommand('echo hola > /etc/no-write.txt', machine, [machine], 1);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });

  it('executeCommand: < lee contenido como argumento de cat', () => {
    const machine = makeRootTarget();
    const r = executeCommand('cat < /etc/passwd', machine, [machine], 1);
    expect(r.isError).not.toBe(true);
    expect(r.output).toContain('admin:x:1000');
  });
});

describe('Fase 7 - expansión integrada', () => {
  it('executeCommand: $VAR se expande en el comando', () => {
    const machine = makeRootTarget();
    const env = { USER: 'admin' };
    const r = executeCommand('echo hola $USER', machine, [machine], 1, undefined, '/', undefined, undefined, undefined, undefined, undefined, env);
    expect(r.output).toBe('hola admin');
  });

  it('executeCommand: echo $USER no expande dentro de comillas simples', () => {
    const machine = makeRootTarget();
    const env = { USER: 'admin' };
    const r = executeCommand("echo '$USER'", machine, [machine], 1, undefined, '/', undefined, undefined, undefined, undefined, undefined, env);
    expect(r.output).toContain('$USER');
  });
});

describe('Fase 7 - shellParse', () => {
  it('splitTopLevel: respeta comillas', () => {
    expect(splitTopLevel('echo "a | b" | grep b', '|')).toEqual(['echo "a | b"', 'grep b']);
  });

  it('splitArgs: agrupa y elimina comillas (simples y dobles); literales dentro de dobles', () => {
    expect(splitArgs('curl -d "username=\' OR \'1\'=\'1&password=x" http://x/login')).toEqual([
      'curl',
      '-d',
      "username=' OR '1'='1&password=x",
      'http://x/login',
    ]);
    expect(splitArgs("echo 'hola mundo'")).toEqual(['echo', 'hola mundo']);
    expect(splitArgs("curl -d username='&password=x http://x/login")).toEqual([
      'curl',
      '-d',
      "username=&password=x http://x/login",
    ]);
    expect(splitArgs('echo a  b\t c')).toEqual(['echo', 'a', 'b', 'c']);
    expect(splitArgs('')).toEqual([]);
  });

  it('extractRedirection: detecta >, >> y < fuera de comillas', () => {
    expect(extractRedirection('ls / > out.txt')).toEqual({ command: 'ls /', operator: '>', outputFile: 'out.txt' });
    expect(extractRedirection('echo x >> acc')).toEqual({ command: 'echo x', operator: '>>', outputFile: 'acc' });
    expect(extractRedirection('cat < in.txt')).toEqual({ command: 'cat', inputFile: 'in.txt' });
    expect(extractRedirection('echo "a > b"')).toBeNull();
  });

  it('expandCommandLine: expande pero respeta comillas simples', () => {
    const env = { USER: 'admin' };
    expect(expandCommandLine('echo $USER', env)).toBe('echo admin');
    expect(expandCommandLine("echo '$USER'", env)).toBe("echo '$USER'");
  });
});

describe('Fase 7 - packageManager', () => {
  it('listInstalled: deriva el set base de los binarios del filesystem', () => {
    const machine = makeRootTarget();
    const installed = listInstalled(machine).map(p => p.name);
    expect(installed).toContain('nmap');
    expect(installed).toContain('curl');
    expect(installed).not.toContain('git');
  });

  it('installPackage/removePackage: mutan el estado por máquina', () => {
    const machine = makeRootTarget();
    installPackage(machine, 'git');
    expect(isInstalled(machine, 'git')).toBe(true);
    removePackage(machine, 'git');
    expect(isInstalled(machine, 'git')).toBe(false);
  });
});
