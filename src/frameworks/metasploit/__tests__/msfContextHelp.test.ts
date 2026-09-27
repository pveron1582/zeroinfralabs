// ── frameworks/metasploit/__tests__/msfContextHelp.test.ts ─────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import { getContextPrompt, detectMsfContext } from '../orchestrators/msfContextHelp';
import type { MsfState } from '../core/msfTypes';

const base: MsfState = {
  active: true,
  options: {},
  sessionOpen: false,
  shellMode: false,
  auxChecked: false,
  uidChecked: false,
};

describe('getContextPrompt', () => {
  it('en msfconsole muestra el prompt base', () => {
    expect(getContextPrompt(base)).toBe('msf6 > ');
  });

  it('en meterpreter muestra meterpreter >', () => {
    expect(getContextPrompt({ ...base, sessionOpen: true })).toBe('meterpreter > ');
  });

  it('en windows_shell usa el cwd de la sesión', () => {
    const state: MsfState = {
      ...base, shellMode: true, sessionOpen: true,
      cwd: '/C:/Users/win7user/Documents',
    };
    expect(getContextPrompt(state)).toBe('C:\\Users\\win7user\\Documents> ');
  });

  it('en windows_shell sin cwd cae al system32 por defecto', () => {
    const state: MsfState = { ...base, shellMode: true, sessionOpen: true };
    expect(getContextPrompt(state)).toBe('C:\\Windows\\system32> ');
  });
});

describe('detectMsfContext', () => {
  it('shellMode tiene prioridad sobre sessionOpen', () => {
    expect(detectMsfContext({ ...base, shellMode: true, sessionOpen: true })).toBe('windows_shell');
  });

  it('sessionOpen sin shellMode es meterpreter', () => {
    expect(detectMsfContext({ ...base, sessionOpen: true })).toBe('meterpreter');
  });
});
