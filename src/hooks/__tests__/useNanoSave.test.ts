// ── hooks/__tests__/useNanoSave.test.ts ───────────────────────────
// Test DIRECTO del guardado de nano: antes solo se ejercitaba desde
// useCommandRunner (70,8 % de statements) y quedaban sin cubrir los
// caminos de archivo NUEVO (directorio inexistente / sin permiso de
// creación) y los early-returns de `null` y ruta vacía.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNanoSave } from '../useNanoSave';
import type { Machine } from '../../types';

const mockState = { addFileToMachine: vi.fn() };

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: (s: typeof mockState) => unknown) => selector(mockState)),
    { getState: vi.fn(() => mockState) }
  ),
}));

const machine = (): Machine => ({
  id: 'victim-01',
  machine_info: { hostname: 'victim', ip: '10.0.0.5', mac: '08:00:27:00:00:01', os: 'Linux', status: 'up', type: 'workstation' },
  discovery_level: 0,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    // 755 ⇒ root escribe y los demás entran; 555 ⇒ los demás no crean archivos
    { path: '/home/.dir', content: '', type: 'dir', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/opt/.dir', content: '', type: 'dir', owner: 'root', group: 'root', mode: 0o555 },
    { path: '/etc/.dir', content: '', type: 'dir', owner: 'root', group: 'root', mode: 0o755 },
    { path: '/etc/hosts', content: '127.0.0.1 localhost\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
});

const render = (over: { suUser?: string; currentDir?: string } = {}) =>
  renderHook(() => useNanoSave({ machine: machine(), currentDir: '/', ...over }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useNanoSave — early returns', () => {
  it('rechaza guardar sin archivo abierto', () => {
    const { result } = render();
    expect(result.current.handleNanoSave(null, 'contenido'))
      .toEqual({ success: false, error: 'No file open' });
    expect(mockState.addFileToMachine).not.toHaveBeenCalled();
  });

  it('rechaza una ruta en blanco', () => {
    const { result } = render();
    expect(result.current.handleNanoSave({ path: '   ', content: '' }, ''))
      .toEqual({ success: false, error: 'No filename specified' });
    expect(mockState.addFileToMachine).not.toHaveBeenCalled();
  });
});

describe('useNanoSave — archivo nuevo', () => {
  it('directorio inexistente es "No such file or directory"', () => {
    const { result } = render();
    const res = result.current.handleNanoSave({ path: '/nope/archivo.txt', content: '' }, 'x');
    expect(res).toEqual({
      success: false,
      error: "nano: '/nope/archivo.txt': No such file or directory",
    });
    expect(mockState.addFileToMachine).not.toHaveBeenCalled();
  });

  it('directorio sin permiso de creación es "Permission denied"', () => {
    const { result } = render({ suUser: 'developer' });
    const res = result.current.handleNanoSave({ path: '/opt/nuevo.txt', content: '' }, 'x');
    expect(res).toEqual({ success: false, error: "nano: '/opt/nuevo.txt': Permission denied" });
    expect(mockState.addFileToMachine).not.toHaveBeenCalled();
  });

  it('guarda en directorio escribible con ownership por defecto (root / 644)', () => {
    const { result } = render({ suUser: 'root' });
    const res = result.current.handleNanoSave({ path: '/home/nota.txt', content: '' }, 'hola');
    expect(res).toEqual({ success: true, savedPath: '/home/nota.txt' });
    expect(mockState.addFileToMachine).toHaveBeenCalledWith(
      'victim-01',
      expect.objectContaining({ path: '/home/nota.txt', content: 'hola', owner: 'root', mode: 0o644 }),
    );
  });

  it('filenameToSave manda sobre el path del archivo abierto', () => {
    const { result } = render({ suUser: 'root' });
    const res = result.current.handleNanoSave({ path: '/home/a.txt', content: '' }, 'x', '/home/b.txt');
    expect(res).toEqual({ success: true, savedPath: '/home/b.txt' });
  });

  it('currentDir vacío cae en "/" y guardarlo en la raíz no sube de nivel', () => {
    const { result } = render({ currentDir: '' });
    const res = result.current.handleNanoSave({ path: '/', content: '' }, 'x');
    expect(res).toEqual({ success: false, error: "nano: '/': No such file or directory" });
    expect(mockState.addFileToMachine).not.toHaveBeenCalled();
  });
});

describe('useNanoSave — archivo existente', () => {
  it('sin permiso de edición es "Permission denied"', () => {
    const { result } = render({ suUser: 'developer' });
    const res = result.current.handleNanoSave({ path: '/etc/hosts', content: '' }, 'x');
    expect(res.success).toBe(false);
    expect(res.error).toBe("nano: '/etc/hosts': Permission denied");
    expect(mockState.addFileToMachine).not.toHaveBeenCalled();
  });

  it('preserva owner/group/mode del snapshot al editar', () => {
    const { result } = render({ suUser: 'root' });
    const res = result.current.handleNanoSave({
      path: '/etc/hosts',
      content: '',
      existingSnapshot: { owner: 'root', group: 'root', mode: 0o600 },
    }, 'nuevo contenido');
    expect(res).toEqual({ success: true, savedPath: '/etc/hosts' });
    expect(mockState.addFileToMachine).toHaveBeenCalledWith(
      'victim-01',
      expect.objectContaining({
        path: '/etc/hosts',
        content: 'nuevo contenido',
        owner: 'root',
        group: 'root',
        mode: 0o600,
      }),
    );
  });
});
