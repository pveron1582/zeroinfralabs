// ── hooks/__tests__/terminalPrompt.test.ts ────────────────────────
// Test DIRECTO de `buildPrompt` (función pura): solo se ejercitaba por
// rebote desde useCommandRunner y se quedaban sin cubrir `pendingPython`
// y las sesiones FTP/SSH/RDP (11/15 statements).
//
// Hueco documentado: el `|| 'ftp> '` de la línea 35 nunca evalúa el
// operando derecho — `getFtpPromptFor` solo devuelve '' cuando la sesión
// no está activa, y ese caso ya lo corta el `if` de arriba.

import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../terminalPrompt';
import type { PromptState } from '../terminalPrompt';

const base: PromptState = {
  pendingSu: null,
  pendingPython: null,
  isPsActive: false,
  isMsfActive: false,
  msfPrompt: null,
  ftpSession: null,
  sshSession: null,
  rdpSession: null,
  hostname: 'kali',
  displayPath: 'C:\\Users\\admin',
  basePrompt: 'root@kali:/# ',
};

const prompt = (over: Partial<PromptState>): string => buildPrompt({ ...base, ...over });

describe('buildPrompt', () => {
  it('el su pendiente tiene prioridad sobre todo lo demás', () => {
    expect(prompt({
      pendingSu: { targetUser: 'root', promptToken: 'tok' },
      isPsActive: true,
      isMsfActive: true,
      msfPrompt: 'msf6(free) >',
      ftpSession: { active: true, targetIp: '10.0.0.5', step: 'username' },
    })).toBe("root@kali's password: ");
  });

  it('python3 pendiente devuelve línea vacía (el prompt ya salió en el output)', () => {
    expect(prompt({
      pendingPython: { argv: ['x.py'], sourceName: '<stdin>', inputs: [], shownOutput: '' },
      isPsActive: true,
      isMsfActive: true,
    })).toBe('');
  });

  it('PowerShell gana a Metasploit', () => {
    expect(prompt({ isPsActive: true, isMsfActive: true, msfPrompt: 'msf6(free) >' }))
      .toBe('PS C:\\Users\\admin>');
  });

  it('Metasploit usa su prompt o el default msf6 >', () => {
    expect(prompt({ isMsfActive: true, msfPrompt: 'msf6(free) >' })).toBe('msf6(free) >');
    expect(prompt({ isMsfActive: true, msfPrompt: null })).toBe('msf6 >');
    expect(prompt({ isMsfActive: true, msfPrompt: '' })).toBe('msf6 >');
  });

  it('sesión FTP: el prompt cambia según el paso', () => {
    expect(prompt({ ftpSession: { active: true, targetIp: '10.0.0.5', step: 'username' } }))
      .toBe('Name (10.0.0.5:root): ');
    expect(prompt({ ftpSession: { active: true, targetIp: '10.0.0.5', step: 'password' } }))
      .toBe('Password: ');
    expect(prompt({ ftpSession: { active: true, targetIp: '10.0.0.5', step: 'connected' } }))
      .toBe('ftp> ');
  });

  it('sesión SSH: solo pide contraseña en el paso password', () => {
    expect(prompt({
      sshSession: { active: true, targetIp: '10.0.0.5', username: 'developer', step: 'password' },
    })).toBe("developer@10.0.0.5's password: ");
    expect(prompt({
      sshSession: { active: true, targetIp: '10.0.0.5', username: 'developer', step: 'connected' },
    })).toBe('');
  });

  it('sesión RDP: usuario o contraseña según el paso', () => {
    expect(prompt({ rdpSession: { active: true, targetIp: '10.0.0.5', step: 'username' } }))
      .toBe('Usuario (10.0.0.5): ');
    expect(prompt({
      rdpSession: { active: true, targetIp: '10.0.0.5', username: 'admin', step: 'password' },
    })).toBe("admin@10.0.0.5's password: ");
    expect(prompt({ rdpSession: { active: true, targetIp: '10.0.0.5', step: 'connected' } }))
      .toBe('');
  });

  it('cae al prompt base cuando no hay nada pendiente', () => {
    expect(prompt({})).toBe('root@kali:/# ');
    expect(prompt({ msfPrompt: 'x' })).toBe('root@kali:/# ');
  });
});
