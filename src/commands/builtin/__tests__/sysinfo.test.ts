// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_uptime, cmd_free, cmd_arch, cmd_hostnamectl, cmd_lsb_release, cmd_lscpu, cmd_w, cmd_last } from '../sysinfo';
import type { Machine } from '../../../types';

const mk = (hostname = 'kali-attacker', os = 'Kali Linux 2024.2'): Machine => ({
  id: 'm',
  machine_info: { hostname, ip: '192.168.1.10', mac: 'aa:bb', os, status: 'up', type: 'workstation' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [{ path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\n', type: 'text' }],
} as unknown as Machine);

const ctx = (m: Machine) => ({ machine: m, allMachines: [m], currentDir: '/', currentMissionId: 1 } as any);

describe('cmd_uptime', () => {
  it('debe mostrar uptime con load average', () => {
    const out = cmd_uptime.execute([], ctx(mk())).output;
    expect(out).toMatch(/\d{2}:\d{2}:\d{2} up /);
    expect(out).toContain('load average:');
  });
  it('debe soportar -p y -s', () => {
    expect(cmd_uptime.execute(['-p'], ctx(mk())).output).toMatch(/^up /);
    expect(cmd_uptime.execute(['-s'], ctx(mk())).output).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe('cmd_free', () => {
  it('debe mostrar Mem y Swap', () => {
    const out = cmd_free.execute([], ctx(mk())).output;
    expect(out).toContain('Mem:');
    expect(out).toContain('Swap:');
    expect(out).toContain('Gi');
  });
  it('debe soportar -m', () => {
    expect(cmd_free.execute(['-m'], ctx(mk())).output).not.toContain('Gi');
  });
});

describe('cmd_arch', () => {
  it('debe devolver x86_64', () => {
    expect(cmd_arch.execute([], ctx(mk())).output).toBe('x86_64');
  });
});

describe('cmd_hostnamectl', () => {
  it('debe mostrar hostname y kernel', () => {
    const out = cmd_hostnamectl.execute([], ctx(mk())).output;
    expect(out).toContain('Static hostname: kali-attacker');
    expect(out).toContain('Kali Linux 2024.2');
    expect(out).toContain('Architecture: x86-64');
  });
});

describe('cmd_lsb_release', () => {
  it('debe mostrar todo con -a', () => {
    const out = cmd_lsb_release.execute(['-a'], ctx(mk())).output;
    expect(out).toContain('Distributor ID:');
    expect(out).toContain('Kali');
  });
  it('debe mostrar solo la descripción con -d', () => {
    const out = cmd_lsb_release.execute(['-d'], ctx(mk())).output;
    expect(out).toContain('Description:');
  });
  it('debe soportar Ubuntu', () => {
    const out = cmd_lsb_release.execute(['-a'], ctx(mk('target', 'Ubuntu 22.04'))).output;
    expect(out).toContain('jammy');
  });
});

describe('cmd_lscpu', () => {
  it('debe mostrar arquitectura x86_64', () => {
    const out = cmd_lscpu.execute([], ctx(mk())).output;
    expect(out).toContain('x86_64');
    expect(out).toContain('CPU(s):');
  });
});

describe('cmd_w', () => {
  it('debe mostrar usuario y uptime', () => {
    const out = cmd_w.execute([], ctx(mk())).output;
    expect(out).toContain('up');
    expect(out).toContain('USER');
    expect(out).toContain('user');
  });
});

describe('cmd_last', () => {
  it('debe listar logins y wtmp', () => {
    const out = cmd_last.execute([], ctx(mk())).output;
    expect(out).toContain('still logged in');
    expect(out).toContain('wtmp begins');
  });
});
