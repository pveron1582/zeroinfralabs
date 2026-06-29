// ── commands/tools/__tests__/msfCommands/msfHelpers.test.ts ───────
import { describe, it, expect } from 'vitest';
import { withState, basePrompt, modulePrompt } from '../../../../frameworks/metasploit/core/msfHelpers';
import type { MsfState } from '../../../../frameworks/metasploit/core/msfTypes';

describe('msfHelpers', () => {
  const testState: MsfState = {
    active: true,
    options: { RHOSTS: '192.168.1.10' },
    sessionOpen: false,
    shellMode: false,
    auxChecked: false
  };

  describe('withState', () => {
    it('debe encodear el estado en el output', () => {
      const result = withState('Test output', testState);
      expect(result.output).toContain('MSF_STATE:');
      expect(result.output).toContain('Test output');
    });

    it('debe serializar el estado como JSON', () => {
      const result = withState('Test', testState);
      const stateMatch = result.output.match(/MSF_STATE:(\{[^\n]*\})/);
      expect(stateMatch).not.toBeNull();
      if (stateMatch) {
        const state = JSON.parse(stateMatch[1]);
        expect(state.active).toBe(true);
        expect(state.options.RHOSTS).toBe('192.168.1.10');
      }
    });

    it('debe incluir el output después del estado', () => {
      const result = withState('Test output', testState);
      const lines = result.output.split('\n');
      expect(lines[0]).toContain('MSF_STATE:');
      expect(lines[1]).toBe('Test output');
    });
  });

  describe('basePrompt', () => {
    it('debe retornar el prompt base de msfconsole', () => {
      const prompt = basePrompt();
      expect(prompt).toBe('msf6 > ');
    });
  });

  describe('modulePrompt', () => {
    it('debe generar prompt para módulo auxiliary', () => {
      const prompt = modulePrompt('auxiliary/scanner/smb/smb_ms17_010');
      expect(prompt).toContain('auxiliary');
      expect(prompt).toContain('smb_ms17_010');
      expect(prompt).toContain('msf6');
    });

    it('debe generar prompt para módulo exploit', () => {
      const prompt = modulePrompt('exploit/windows/smb/ms17_010_eternalblue');
      expect(prompt).toContain('exploit');
      expect(prompt).toContain('ms17_010_eternalblue');
      expect(prompt).toContain('msf6');
    });

    it('debe usar solo los últimos dos segmentos del path', () => {
      const prompt = modulePrompt('exploit/windows/smb/ms17_010_eternalblue');
      // Should be "smb/ms17_010_eternalblue", not full path
      expect(prompt).toContain('smb/ms17_010_eternalblue');
      expect(prompt).not.toContain('exploit/windows/smb');
    });
  });
});
