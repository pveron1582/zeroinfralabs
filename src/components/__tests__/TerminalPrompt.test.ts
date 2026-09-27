// ── components/__tests__/TerminalPrompt.test.ts ──────────────────
// @vitest-environment node  (lógica pura de prompts, sin DOM)
// Regresión: PS C:\...> y C:\...> son prompts de UNA línea — el componente
// Terminal debe pintar prompt e input en el mismo renglón (bug reportado).

import { describe, it, expect } from 'vitest';
import { isOneLinePrompt, isPsPromptText, isWinPromptText } from '../TerminalPrompt';

describe('isOneLinePrompt', () => {
  it('los prompts de PowerShell son de una línea', () => {
    expect(isPsPromptText('PS C:\\Users\\Administrator>')).toBe(true);
    expect(isPsPromptText('PS C:\\')).toBe(true);
    expect(isOneLinePrompt('PS C:\\Users\\Administrator>')).toBe(true);
  });

  it('los prompts de cmd.exe son de una línea', () => {
    expect(isWinPromptText('C:\\Windows\\system32>')).toBe(true);
    expect(isWinPromptText('C:\\')).toBe(true);
    expect(isOneLinePrompt('D:\\servicios')).toBe(true);
  });

  it('los prompts de Kali y Metasploit no lo son', () => {
    expect(isOneLinePrompt('kali@kali:~$')).toBe(false);
    expect(isOneLinePrompt('msf6 >')).toBe(false);
    expect(isPsPromptText('root@target:/#')).toBe(false);
    expect(isWinPromptText('kali@kali:~$')).toBe(false);
  });

  it('sin prompt (undefined / vacío) no es de una línea', () => {
    expect(isOneLinePrompt(undefined)).toBe(false);
    expect(isOneLinePrompt('')).toBe(false);
  });
});
