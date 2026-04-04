// ── __tests__/fixtures.ts ─────────────────────────────────────────────
// Test fixtures y helpers para EnumerationPanel tests

import type { Machine } from '../../types';

export const createMockMachine = (overrides: Partial<Machine> = {}): Machine => ({
  id: 'target-01',
  machine_info: {
    hostname: 'target',
    ip: '192.168.1.10',
    mac: '00:11:22:33:44:55',
    os: 'Linux',
    status: 'up',
    type: 'server',
  },
  discovery_level: 2,
  scan_results: {
    ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.0' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
    ],
  },
  web_enumeration: {
    web_server: 'Apache',
    cms: 'WordPress',
    directories: [
      { path: '/wp-admin', status: 200, description: 'Admin panel' },
      { path: '/wp-login.php', status: 200, description: 'Login page' },
    ],
  },
  learning_steps: [],
  files: [],
  ...overrides,
});

export const mockPorts = [
  { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.0' },
  { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
];

export const mockDirectories = [
  { path: '/wp-admin', status: 200, description: 'Admin panel' },
  { path: '/secret', status: 403, description: 'Forbidden' },
];

export const mockCredential = {
  file: '/uploads/config.bak',
  user: 'admin',
  pass: 'password123',
  verified: true,
  service: 'wp-admin',
};

export const mockVulnerabilities: Array<{ id: string; name: string; status: 'detected' | 'confirmed' }> = [
  { id: 'CVE-2017-0144', name: 'EternalBlue', status: 'confirmed' },
  { id: 'CVE-2021-41773', name: 'Apache Path Traversal', status: 'detected' },
];

export const mockSudoVim = {
  user: 'developer',
  commands: ['vim', 'apt-get'],
  canSudo: true,
};

export const mockReverseShellCred = {
  file: '/tmp/shell.php',
  user: 'www-data',
  pass: '',
  verified: true,
  service: 'reverse-shell',
};
