// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { cmd_dig, cmd_nslookup } from '../dns';
import { cmd_wget } from '../wget';
import { cmd_scp } from '../scp';
import { cmd_whois } from '../whois';
import { cmd_tcpdump } from '../tcpdump';
import type { Machine } from '../../../types';

function mkWeb(id: string, ip: string, hostname: string, extra: Partial<Machine> = {}): Machine {
  return {
    id,
    machine_info: { hostname, ip, mac: '00:11:22:33:44:55', os: 'Ubuntu 22.04', status: 'up', type: 'server' },
    discovery_level: 2,
    scan_results: { ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH' }, { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache' }] },
    web_enumeration: { web_server: 'Apache', cms: 'none', directories: [{ path: '/', status: 200, description: 'home' }] },
    learning_steps: [],
    found_credentials: [{ file: '', user: 'kali', pass: 'kali123', verified: true, service: 'ssh' }],
    files: [
      { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
    ],
    ...extra,
  } as unknown as Machine;
}

const web = mkWeb('web-01', '192.168.1.10', 'target.local');
const kali = mkWeb('kali-01', '192.168.1.5', 'kali-attacker', {
  su_user: 'root',
  files: [
    { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
    { path: '/etc/passwd', content: 'root:x:0:0:root:/root:/bin/bash\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
  ],
} as Partial<Machine>);
const ctx = { machine: kali, allMachines: [kali, web], currentMissionId: 1, currentDir: '/root' } as any;

describe('cmd_dig', () => {
  it('debe resolver A record', () => {
    const r = cmd_dig.execute(['target.local'], ctx);
    expect(r.isError).toBeUndefined();
    expect(r.output).toContain('192.168.1.10');
    expect(r.output).toContain('NOERROR');
  });
  it('debe soportar +short', () => {
    expect(cmd_dig.execute(['+short', 'target.local'], ctx).output).toBe('192.168.1.10');
  });
  it('debe hacer reverso con -x', () => {
    const r = cmd_dig.execute(['-x', '192.168.1.10'], ctx);
    expect(r.output).toContain('PTR');
    expect(r.output).toContain('target.local');
  });
  it('debe dar NXDOMAIN para desconocido', () => {
    expect(cmd_dig.execute(['nada.local'], ctx).isError).toBe(true);
    expect(cmd_dig.execute(['nada.local'], ctx).output).toContain('NXDOMAIN');
  });
});

describe('cmd_nslookup', () => {
  it('debe resolver directo y reverso', () => {
    expect(cmd_nslookup.execute(['target.local'], ctx).output).toContain('192.168.1.10');
    expect(cmd_nslookup.execute(['192.168.1.10'], ctx).output).toContain('in-addr.arpa');
  });
});

describe('cmd_wget', () => {
  it('debe descargar el index al cwd', () => {
    const r = cmd_wget.execute(['http://192.168.1.10/'], ctx);
    expect(r.isError).toBe(false);
    expect((r as any).filesChanged?.some(() => true) ?? false).toBe(true);
  });
  it('debe soportar -O y -q', () => {
    const r = cmd_wget.execute(['-O', 'report.html', '-q', 'http://192.168.1.10/robots.txt'], ctx);
    expect(r.isError).toBe(false);
    expect(r.output).toBe('');
  });
  it('debe fallar con NXDOMAIN', () => {
    const r = cmd_wget.execute(['http://nada.local/'], ctx);
    expect(r.isError).toBe(true);
  });
});

describe('cmd_scp', () => {
  it('debe copiar local → remoto con ssh open + creds', () => {
    const r = cmd_scp.execute(['/etc/passwd', 'kali@192.168.1.10:/tmp/loot.txt'], { ...ctx, machine: { ...kali, files: [...kali.files] } } as any);
    expect(r.isError).toBeFalsy();
    expect((web.files ?? []).some(f => f.path === '/tmp/loot.txt')).toBe(true);
  });
  it('debe fallar sin credenciales conocidas', () => {
    const noAuth = { ...web, found_credentials: [] };
    const r = cmd_scp.execute(['/etc/passwd', 'kali@192.168.1.10:/tmp/x.txt'], { ...ctx, allMachines: [kali, noAuth] } as any);
    expect(r.isError).toBe(true);
    expect(r.output).toContain('Permission denied');
  });
});

describe('cmd_whois', () => {
  it('debe mostrar registro sintético', () => {
    const r = cmd_whois.execute(['192.168.1.10'], ctx);
    expect(r.isError).toBeFalsy();
    expect(r.output).toContain('ZI Labs whois server');
    expect(r.output).toContain('targetlocal');
  });
});

describe('cmd_tcpdump', () => {
  it('debe capturar N paquetes entre los peers', () => {
    const r = cmd_tcpdump.execute(['-i', 'eth0', '-c', '3'], ctx);
    expect(r.isError).toBeUndefined();
    expect(r.output).toContain('listening on eth0');
    expect((r.output.match(/\n/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(r.output).toContain('3 packets captured');
  });
});
