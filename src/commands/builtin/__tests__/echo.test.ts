// ── commands/builtin/__tests__/echo.test.ts ─────────────────────────
import { describe, it, expect } from 'vitest';
import { cmd_echo } from '../echo';
import type { Machine, CommandContext } from '../../../types';

describe('cmd_echo', () => {
  const createMockMachine = (): Machine => ({
    id: 'target-01',
    machine_info: { hostname: 'victim', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Ubuntu', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [
      { path: '/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/home/kali/.dir', content: '', type: 'text', owner: 'kali', group: 'kali', mode: 0o755 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o777 },
      { path: '/bin/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali:/home/kali/:/bin/bash\n', type: 'text' },
      { path: '/etc/group', content: 'root:x:0:\nkali:x:1000:\n', type: 'text' },
    ],
    found_credentials: [{ file: '', user: 'kali', pass: 'kali', verified: true }],
  });

  const createContext = (machine: Machine, currentDir = '/home/kali/', umask = 0o022): CommandContext => ({
    machine,
    allMachines: [machine],
    currentMissionId: 1,
    currentDir,
    umask,
  });

  it('debe devolver vacío sin argumentos', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute([], createContext(machine));

    expect(result.output).toBe('');
    expect(result.isError).toBeFalsy();
  });

  it('debe imprimir texto sin redirección', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['hola', 'mundo'], createContext(machine));

    expect(result.output).toBe('hola mundo');
    expect(result.isError).toBeFalsy();
  });

  it('debe crear archivo nuevo con >', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['hola', '>', 'nota.txt'], createContext(machine));

    expect(result.output).toBe('hola');
    expect(result.isError).toBeFalsy();
    const file = machine.files.find(f => f.path === '/home/kali/nota.txt');
    expect(file).toBeDefined();
    expect(file?.content).toBe('hola\n');
    expect(file?.owner).toBe('kali');
    expect(file?.mode).toBe(0o644);
  });

  it('debe sobrescribir archivo existente con >', () => {
    const machine = createMockMachine();
    machine.files.push({ path: '/home/kali/nota.txt', content: 'viejo\n', type: 'text', owner: 'kali', group: 'kali', mode: 0o644 });

    const result = cmd_echo.execute(['nuevo', '>', 'nota.txt'], createContext(machine));

    expect(result.output).toBe('nuevo');
    const file = machine.files.find(f => f.path === '/home/kali/nota.txt');
    expect(file?.content).toBe('nuevo\n');
  });

  it('debe añadir a archivo existente con >>', () => {
    const machine = createMockMachine();
    machine.files.push({ path: '/home/kali/nota.txt', content: 'linea1\n', type: 'text', owner: 'kali', group: 'kali', mode: 0o644 });

    const result = cmd_echo.execute(['linea2', '>>', 'nota.txt'], createContext(machine));

    expect(result.output).toBe('linea2');
    const file = machine.files.find(f => f.path === '/home/kali/nota.txt');
    expect(file?.content).toBe('linea1\nlinea2\n');
  });

  it('debe crear archivo con ruta absoluta', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['data', '>', '/tmp/data.txt'], createContext(machine));

    expect(result.isError).toBeFalsy();
    const file = machine.files.find(f => f.path === '/tmp/data.txt');
    expect(file?.content).toBe('data\n');
  });

  it('debe fallar si el directorio padre no existe', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['hola', '>', '/nonexistent/file.txt'], createContext(machine));

    expect(result.output).toContain('No such file or directory');
    expect(result.isError).toBe(true);
  });

  it('debe fallar con permisos insuficientes para editar archivo ajeno', () => {
    const machine = createMockMachine();
    machine.files.push({ path: '/home/kali/rootfile.txt', content: 'secreto\n', type: 'text', owner: 'root', group: 'root', mode: 0o444 });

    const result = cmd_echo.execute(['hack', '>', 'rootfile.txt'], createContext(machine));

    expect(result.output).toContain('Permission denied');
    expect(result.isError).toBe(true);
  });

  it('debe fallar con permisos insuficientes para crear en directorio del sistema', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['hack', '>', '/bin/hack.sh'], createContext(machine));

    expect(result.output).toContain('Permission denied');
    expect(result.isError).toBe(true);
  });

  it('debe soportar la tilde ~ como home del usuario', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['hola', '>', '~/tilde.txt'], createContext(machine));

    expect(result.isError).toBeFalsy();
    const file = machine.files.find(f => f.path === '/home/kali/tilde.txt');
    expect(file?.content).toBe('hola\n');
  });

  it('debe aplicar umask al crear archivos nuevos', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['hola', '>', 'seguro.txt'], createContext(machine, '/home/kali/', 0o077));

    expect(result.isError).toBeFalsy();
    const file = machine.files.find(f => f.path === '/home/kali/seguro.txt');
    expect(file?.mode).toBe(0o600);
  });

  it('debe incluir filesChanged en la respuesta al escribir', () => {
    const machine = createMockMachine();
    const result = cmd_echo.execute(['hola', '>', 'nuevo.txt'], createContext(machine));

    expect('filesChanged' in result).toBe(true);
    if ('filesChanged' in result) {
      expect(result.filesChanged!.some(f => f.path === '/home/kali/nuevo.txt')).toBe(true);
    }
  });
});