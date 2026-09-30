// ── frameworks/fs/__tests__/mounts.test.ts ─────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Test DIRECTO de la tabla de montajes. Antes solo se llegaba por rebote
// desde `fase9-fs.test.ts` (comandos mount/umount/df) y se quedaban sin
// correr: la línea de fstab con menos de 3 campos, un equipo sin
// /etc/fstab, y el intento de montar dos veces sobre el mismo mountpoint.
//
// Nota: el `if (!m)` de `extraDevice` (línea 78) sigue sin alcanzarse:
// `mountDevice` crea el mapa de dispositivos y el de montajes juntos, así
// que nunca hay un mountpoint sin dispositivo. Es código defensivo.

import { describe, it, expect, beforeEach } from 'vitest';
import { parseFstab, getFstabEntries, getMounts, isMounted, mountDevice, unmount, resetMounts } from '../mounts';
import type { Machine, FileEntry } from '../../../types';

const dir = (path: string): FileEntry => ({ path: `${path}/.dir`, content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 });
const file = (path: string, content: string): FileEntry => ({ path, content, type: 'text', owner: 'root', group: 'root', mode: 0o644 });

const FSTAB = `# /etc/fstab
UUID=123 /               ext4    errors=remount-ro 0 1
UUID=456 /boot           ext4    defaults          0 2
proc      /proc           proc    defaults          0 0
/swapfile none            swap    sw                0 0
`;

function makeMachine(withFstab = true): Machine {
  const files: FileEntry[] = [dir('/'), dir('/etc'), dir('/boot'), dir('/home'), dir('/mnt'), dir('/tmp')];
  if (withFstab) files.push(file('/etc/fstab', FSTAB));
  return {
    id: 'target-01',
    machine_info: { hostname: 'target-server', ip: '192.168.1.10', mac: '08:00:27:A1:B2:C3', os: 'Ubuntu 20.04 LTS', status: 'up', type: 'server' },
    discovery_level: 0,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files,
  } as Machine;
}

beforeEach(() => resetMounts());

describe('parseFstab', () => {
  it('parsea device/mountpoint/fs/options e ignora comentarios, vacíos y swap', () => {
    const entries = parseFstab(FSTAB);
    expect(entries.map(e => e.mountpoint)).toEqual(['/', '/boot', '/proc']);
    expect(entries[0].options).toBe('errors=remount-ro');
    expect(entries.every(e => e.fs !== 'swap')).toBe(true);
  });

  it('una línea con menos de 3 campos se descarta', () => {
    const entries = parseFstab('solo-dos-campos /proc\n');
    expect(entries).toEqual([]);
  });

  it('si falta la columna de options cae a "defaults"', () => {
    const entries = parseFstab('proc /proc proc\n');
    expect(entries).toHaveLength(1);
    expect(entries[0].options).toBe('defaults');
  });
});

describe('getFstabEntries / getMounts', () => {
  it('un equipo sin /etc/fstab devuelve lista vacía', () => {
    expect(getFstabEntries(makeMachine(false))).toEqual([]);
    expect(getMounts(makeMachine(false)).map(e => e.mountpoint)).toEqual(['/', '/proc', '/sys', '/dev']);
  });

  it('getMounts agrega lo del fstab sin duplicar las entradas base', () => {
    const mounts = getMounts(makeMachine());
    expect(mounts.filter(e => e.mountpoint === '/').every(e => e.device === '/dev/sda1')).toBe(true);
    expect(mounts.map(e => e.mountpoint)).toEqual(['/', '/proc', '/sys', '/dev', '/boot']);
    expect(mounts.filter(e => e.mountpoint === '/proc')).toHaveLength(1);
    expect(mounts.every(e => e.system)).toBe(true);
  });
});

describe('mountDevice / unmount / isMounted', () => {
  it('no monta sobre un mountpoint que no existe como directorio', () => {
    expect(mountDevice(makeMachine(), '/dev/sdb1', '/no/existe')).toBe(false);
    expect(isMounted(makeMachine(), '/no/existe')).toBe(false);
  });

  it('no monta dos veces sobre el mismo mountpoint', () => {
    const m = makeMachine();
    expect(mountDevice(m, '/dev/sdb1', '/mnt')).toBe(true);
    expect(mountDevice(m, '/dev/sdc1', '/mnt')).toBe(false);
    expect(isMounted(m, '/mnt')).toBe(true);
  });

  it('un montaje nuevo aparece con el dispositivo elegido', () => {
    const m = makeMachine();
    mountDevice(m, '/dev/sdb1', '/mnt');
    const entry = getMounts(m).find(e => e.mountpoint === '/mnt');
    expect(entry).toMatchObject({ device: '/dev/sdb1', fs: 'ext4' });
    expect(entry?.system).toBeFalsy();
  });

  it('sin dispositivo propio cae al default /dev/sdb1', () => {
    const m = makeMachine();
    mountDevice(m, '/dev/sdz9', '/home');
    // El mapa recuerda el dispositivo por (máquina, mountpoint).
    expect(getMounts(m).find(e => e.mountpoint === '/home')?.device).toBe('/dev/sdz9');
  });

  it('no se puede desmontar un mountpoint del sistema', () => {
    const m = makeMachine();
    expect(unmount(m, '/')).toBe(false);
    expect(unmount(m, '/proc')).toBe(false);
    expect(isMounted(m, '/')).toBe(true);
  });

  it('desmontar un montaje de usuario lo saca de la tabla', () => {
    const m = makeMachine();
    mountDevice(m, '/dev/sdb1', '/mnt');
    expect(unmount(m, '/mnt')).toBe(true);
    expect(isMounted(m, '/mnt')).toBe(false);
    expect(unmount(m, '/mnt')).toBe(false); // ya no estaba
  });

  it('resetMounts limpia los montajes de usuario', () => {
    const m = makeMachine();
    mountDevice(m, '/dev/sdb1', '/mnt');
    resetMounts();
    expect(isMounted(m, '/mnt')).toBe(false);
  });
});
