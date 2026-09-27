// ── commands/__tests__/bugs-comandos-fix.test.ts ───────────────────
// Tests de regresión para docs/bugs_comandos.md: free -h, scp, ls,
// permisos de lectura, curl -o, wget, fileRead, pipelines, stat, tcpdump.
import { describe, it, expect } from 'vitest';
import { cmd_free } from '../builtin/sysinfo';
import { cmd_ls } from '../builtin/ls';
import { cmd_head, cmd_tail, cmd_grep } from '../builtin/pipeline';
import { cmd_awk } from '../builtin/awk';
import { cmd_sed } from '../builtin/sed';
import { cmd_md5sum, cmd_strings } from '../builtin/crypto';
import { cmd_less } from '../builtin/less';
import { cmd_stat } from '../builtin/stat';
import { cmd_dig } from '../tools/dns';
import { cmd_curl } from '../tools/curl';
import { cmd_wget } from '../tools/wget';
import { cmd_scp } from '../tools/scp';
import { cmd_tcpdump } from '../tools/tcpdump';
import { executeCommand } from '../index';
import type { Machine } from '../../types';

const PASSWD = 'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:student:/home/student:/bin/bash\n';
const GROUP = 'root:x:0:\nstudent:x:1000:\n';

function mkTarget(suUser?: string): Machine {
  return {
    id: 'target-01',
    machine_info: { hostname: 'victima', ip: '10.10.10.11', mac: '00:11:22:33:44:55', os: 'Ubuntu 22.04', status: 'up', type: 'server' },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    ...(suUser ? { su_user: suUser } : {}),
    files: [
      { path: '/etc/passwd', content: PASSWD, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/etc/group', content: GROUP, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/root/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o700 },
      { path: '/root/flag.txt', content: 'FLAG{test_permisos}\n', type: 'text', owner: 'root', group: 'root', mode: 0o600 },
      { path: '/root/enlace', content: '', type: 'symlink', linkTarget: '/root/flag.txt', owner: 'root', group: 'root', mode: 0o777 },
      { path: '/var/log/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/var/log/nginx/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o755 },
      { path: '/var/log/nginx/access.log', content: '10.0.0.1 - - [01/Sep/2026] "GET / HTTP/1.1" 200\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
    ],
  } as unknown as Machine;
}

const ctx = (m: Machine, dir = '/root') =>
  ({ machine: m, allMachines: [m], currentMissionId: 1, currentDir: dir }) as any;

describe('Bug 1: free -h', () => {
  it('debe mostrar la tabla de memoria con -h', () => {
    const r = cmd_free.execute(['-h'], ctx(mkTarget('root')));
    expect(r.isError).toBeFalsy();
    expect(r.output).toContain('Mem:');
  });
  it('debe mostrar ayuda solo con --help', () => {
    expect(cmd_free.execute(['--help'], ctx(mkTarget('root'))).output).toContain('Usage: free');
  });
});

describe('Bug 3: ls con rutas relativas', () => {
  it('debe listar subdirectorio relativo al cwd', () => {
    const r = cmd_ls.execute(['nginx'], ctx(mkTarget('root'), '/var/log'));
    expect(r.output).toContain('access.log');
  });
});

describe('Fuga transversal: permisos de lectura', () => {
  it('head debe denegar flag protegida a student y permitir a root', () => {
    const deny = cmd_head.execute(['/root/flag.txt'], ctx(mkTarget('student')));
    expect(deny.isError).toBe(true);
    expect(deny.output).toContain('Permission denied');
    const ok = cmd_head.execute(['/root/flag.txt'], ctx(mkTarget('root')));
    expect(ok.isError).toBeFalsy();
    expect(ok.output).toContain('FLAG{test_permisos}');
  });
  it('awk, sed, grep y md5sum deben respetar canRead', () => {
    const m = mkTarget('student');
    expect(cmd_awk.execute(['{print}', '/root/flag.txt'], ctx(m)).output).toContain('Permission denied');
    expect(cmd_sed.execute(['s/a/b/', '/root/flag.txt'], ctx(m)).output).toContain('Permission denied');
    expect(cmd_grep.execute(['FLAG', '/root/flag.txt'], ctx(m)).output).toContain('Permission denied');
    expect(cmd_md5sum.execute(['/root/flag.txt'], ctx(m)).output).toContain('Permission denied');
  });
});

describe('fileRead en lectores', () => {
  it('head, tail, less y strings deben emitir fileRead', () => {
    const m = mkTarget('root');
    for (const r of [
      cmd_head.execute(['/root/flag.txt'], ctx(m)),
      cmd_tail.execute(['/root/flag.txt'], ctx(m)),
      cmd_less.execute(['/root/flag.txt'], ctx(m)),
      cmd_strings.execute(['/root/flag.txt'], ctx(m)),
    ]) {
      expect('fileRead' in r && (r as any).fileRead?.isFlag).toBe(true);
    }
  });
  it('el pipeline debe preservar fileRead del primer segmento', () => {
    const m = mkTarget('root');
    const r = executeCommand({ line: 'cat /root/flag.txt | grep FLAG', machine: m, allMachines: [m], currentMissionId: 1, currentDir: '/root' });
    expect(r.output).toContain('FLAG{test_permisos}');
    expect('fileRead' in r).toBe(true);
  });
});

describe('Bug 2: scp con rutas relativas', () => {
  function mkPair() {
    const local = mkTarget('root');
    local.id = 'attacker-01';
    local.files.push({ path: '/root/nota.txt', content: 'secreto\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 });
    const remote: Machine = {
      id: 'web-01',
      machine_info: { hostname: 'web', ip: '10.10.10.12', mac: '00:11:22:33:44:66', os: 'Ubuntu 22.04', status: 'up', type: 'server' },
      discovery_level: 2,
      scan_results: { ports: [{ port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH' }] },
      web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
      learning_steps: [],
      found_credentials: [{ file: '', user: 'student', pass: 'x', verified: true, service: 'ssh' }],
      files: [
        { path: '/etc/passwd', content: PASSWD, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        { path: '/etc/group', content: GROUP, type: 'text', owner: 'root', group: 'root', mode: 0o644 },
        { path: '/tmp/.dir', content: '', type: 'text', owner: 'root', group: 'root', mode: 0o1777 },
        { path: '/etc/remoto.txt', content: 'datos remotos\n', type: 'text', owner: 'root', group: 'root', mode: 0o644 },
      ],
    } as unknown as Machine;
    // la local también conoce la credencial del remoto (como los labs)
    local.found_credentials = [{ file: '', user: 'student', pass: 'x', verified: true, service: 'ssh' }];
    (local as any).scan_results = { ports: [] };
    return { local, remote };
  }
  it('debe subir ruta relativa al directorio remoto', () => {
    const { local, remote } = mkPair();
    const c = { machine: local, allMachines: [local, remote], currentMissionId: 1, currentDir: '/root' } as any;
    const r = cmd_scp.execute(['nota.txt', 'student@10.10.10.12:/tmp/'], c);
    expect(r.isError).toBeFalsy();
    expect(remote.files.some(f => f.path === '/tmp/nota.txt')).toBe(true);
  });
  it('debe descargar a ruta relativa y emitir downloadedFile', () => {
    const { local, remote } = mkPair();
    const c = { machine: local, allMachines: [local, remote], currentMissionId: 1, currentDir: '/root' } as any;
    const r = cmd_scp.execute(['student@10.10.10.12:/etc/remoto.txt', 'loot.txt'], c);
    expect(r.isError).toBeFalsy();
    expect(local.files.some(f => f.path === '/root/loot.txt')).toBe(true);
    expect('downloadedFile' in r).toBe(true);
  });
});

describe('Bug 4 y wget: curl -o / downloadedFile', () => {
  function mkWeb() {
    const m = mkTarget('root');
    m.web_enumeration = { web_server: 'Apache', cms: 'none', directories: [{ path: '/', status: 200, description: 'home' }] };
    return m;
  }
  it('curl -o debe guardar el cuerpo y emitir downloadedFile', () => {
    const m = mkWeb();
    const r = cmd_curl.execute(['-o', 'copia.html', 'http://10.10.10.11/'], ctx(m));
    expect(r.isError).toBeFalsy();
    expect(m.files.some(f => f.path === '/root/copia.html')).toBe(true);
    expect('downloadedFile' in r).toBe(true);
  });
  it('wget debe emitir downloadedFile', () => {
    const m = mkWeb();
    const r = cmd_wget.execute(['http://10.10.10.11/'], ctx(m));
    expect(r.isError).toBe(false);
    expect('downloadedFile' in r).toBe(true);
  });
});

describe('Bug 5: hash de DNS determinista', () => {
  it('nombres con mismo primer caracter deben dar ids distintos', () => {
    const m = mkTarget('root');
    const a = cmd_dig.execute(['abc'], ctx(m)).output;
    const b = cmd_dig.execute(['adc'], ctx(m)).output;
    expect(a).not.toBe(b);
  });
});

describe('stat y tcpdump', () => {
  it('stat debe mostrar el enlace sin -L y el destino con -L', () => {
    const m = mkTarget('root');
    const link = cmd_stat.execute(['/root/enlace'], ctx(m)).output;
    expect(link).toContain('symbolic link');
    expect(link).toContain('->');
    const target = cmd_stat.execute(['-L', '/root/enlace'], ctx(m)).output;
    expect(target).toContain('regular file');
    expect(target).not.toContain('->');
  });
  it('tcpdump debe exigir root', () => {
    expect(cmd_tcpdump.execute([], ctx(mkTarget('student'))).output).toContain("don't have permission");
    expect(cmd_tcpdump.execute(['-c', '1'], ctx(mkTarget('root'))).output).toContain('packets captured');
  });
});
