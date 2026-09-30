// ── frameworks/metasploit/__tests__/msfContextHelp.test.ts ─────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
import { describe, it, expect } from 'vitest';
import {
  getContextPrompt,
  detectMsfContext,
  getContextAwareHelp,
  executeContextHelp,
} from '../orchestrators/msfContextHelp';
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

  it('con módulo cargado es module', () => {
    expect(detectMsfContext({ ...base, module: 'auxiliary/scanner/smb/smb_ms17_010' })).toBe('module');
  });

  it('sin sesión ni módulo es la consola base', () => {
    expect(detectMsfContext(base)).toBe('msfconsole');
  });

  it('sessionOpen tiene prioridad sobre el módulo cargado', () => {
    const st = { ...base, sessionOpen: true, module: 'exploit/windows/smb/ms17_010_eternalblue' };
    expect(detectMsfContext(st)).toBe('meterpreter');
  });
});

describe('getContextPrompt (módulo cargado)', () => {
  it('en auxiliary usa el prompt con el módulo abreviado', () => {
    const state = { ...base, module: 'auxiliary/scanner/smb/smb_ms17_010' };
    expect(getContextPrompt(state)).toBe('msf6 auxiliary(smb/smb_ms17_010) > ');
  });

  it('en exploit usa el prompt con el módulo abreviado', () => {
    const state = { ...base, module: 'exploit/windows/smb/ms17_010_eternalblue' };
    expect(getContextPrompt(state)).toBe('msf6 exploit(smb/ms17_010_eternalblue) > ');
  });
});

describe('getContextAwareHelp', () => {
  it('en msfconsole lista los comandos core y el ejemplo de uso', () => {
    const help = getContextAwareHelp(base);
    expect(help).toContain('Core Commands');
    expect(help).toContain('Selects a module by name');
    expect(help).toContain("Tip: Type 'use <module>' to select a module");
  });

  it('en module lista los comandos de módulo y marca las opciones vacías', () => {
    const help = getContextAwareHelp({ ...base, module: 'exploit/windows/smb/ms17_010_eternalblue' });
    expect(help).toContain('Module Commands (exploit/windows/smb/ms17_010_eternalblue)');
    expect(help).toContain('No options set');
    expect(help).not.toContain('Core Commands');
  });

  it('en module imprime cada opción con su valor seteado', () => {
    const help = getContextAwareHelp({
      ...base,
      module: 'auxiliary/scanner/smb/smb_ms17_010',
      options: { RHOSTS: '192.168.1.10', RPORT: '445' },
    });
    expect(help).toContain('RHOSTS');
    expect(help).toContain('192.168.1.10');
    expect(help).toContain('445');
    expect(help).not.toContain('No options set');
  });

  it('en meterpreter lista los comandos de meterpreter', () => {
    const help = getContextAwareHelp({ ...base, sessionOpen: true });
    expect(help).toContain('Meterpreter Commands');
    expect(help).toContain('getuid        Get the user that the server is running as');
  });

  it('en windows_shell lista los comandos de cmd.exe', () => {
    const help = getContextAwareHelp({ ...base, shellMode: true, sessionOpen: true });
    expect(help).toContain('Windows Command Shell (cmd.exe)');
    expect(help).toContain('ipconfig      Display network configuration');
  });
});

describe('executeContextHelp', () => {
  it('help devuelve la ayuda del contexto actual con el estado intacto', () => {
    const result = executeContextHelp('help', [], base);
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Core Commands');
    expect(result!.msfStateUpdate).toEqual(base);
  });

  it('? es alias de help', () => {
    const result = executeContextHelp('?', [], { ...base, sessionOpen: true });
    expect(result).not.toBeNull();
    expect(result!.output).toContain('Meterpreter Commands');
  });

  it('cualquier otro comando no lo maneja este orquestador (devuelve null)', () => {
    expect(executeContextHelp('search', ['ms17'], base)).toBeNull();
    expect(executeContextHelp('sysinfo', [], base)).toBeNull();
  });
});
