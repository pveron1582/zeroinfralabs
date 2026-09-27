import { describe, it } from 'vitest';
import { cmd_md5sum, cmd_sha256sum } from '../crypto';
import type { Machine } from '../../../types';

const m = {
  id: 'x',
  machine_info: { hostname: 't', ip: '1.1.1.1', mac: '', os: 'U', status: 'up', type: 'server' },
  discovery_level: 4, scan_results: { ports: [] },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/e.txt', content: '', type: 'text' },
    { path: '/a.txt', content: 'a', type: 'text' },
    { path: '/hello.txt', content: 'hello', type: 'text' },
    { path: '/md.txt', content: 'message digest', type: 'text' },
  ],
} as unknown as Machine;
const ctx = { machine: m, allMachines: [m], currentDir: '/' } as any;

describe('verify vectors', () => {
  it('md5 vectors', () => {
    console.log('md5("")=', cmd_md5sum.execute(['e.txt'], ctx).output);
    console.log('md5("a")=', cmd_md5sum.execute(['a.txt'], ctx).output);
    console.log('md5("hello")=', cmd_md5sum.execute(['hello.txt'], ctx).output);
    console.log('md5("md")=', cmd_md5sum.execute(['md.txt'], ctx).output);
  });
  it('sha vectors', () => {
    console.log('sha("")=', cmd_sha256sum.execute(['e.txt'], ctx).output);
    console.log('sha("abc")=', cmd_sha256sum.execute(['a.txt'], { ...ctx, machine: { ...m, files: [{ path: '/a.txt', content: 'abc', type: 'text' }] }, allMachines: [] } as any).output);
    console.log('sha("hello")=', cmd_sha256sum.execute(['hello.txt'], ctx).output);
  });
});
