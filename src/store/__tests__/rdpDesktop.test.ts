// ── store/__tests__/rdpDesktop.test.ts ────────────────────────────
// openWindowsDesktop / closeWindowsDesktop / toggleUiMode con RDP.
// desktop → ventana movable (uiMode no cambia); classic → full-screen.

import { describe, it, expect, beforeEach } from 'vitest';
import { useScenarioStore } from '../scenarioStore';

describe('RDP Windows desktop (uiSlice)', () => {
  beforeEach(() => {
    useScenarioStore.setState(() => ({
      uiMode: 'desktop' as const,
      _prevUiMode: null,
      rdpMachineId: null,
    }));
  });

  it('openWindowsDesktop en desktop mantiene uiMode y guarda la máquina', () => {
    useScenarioStore.getState().openWindowsDesktop('win-01');
    const s = useScenarioStore.getState();
    expect(s.uiMode).toBe('desktop');
    expect(s.rdpMachineId).toBe('win-01');
    expect(s._prevUiMode).toBeNull();
  });

  it('openWindowsDesktop en classic entra en full-screen windows-desktop', () => {
    useScenarioStore.setState(() => ({
      uiMode: 'classic' as const,
      _prevUiMode: null,
      rdpMachineId: null,
    }));
    useScenarioStore.getState().openWindowsDesktop('win-01');
    const s = useScenarioStore.getState();
    expect(s.uiMode).toBe('windows-desktop');
    expect(s.rdpMachineId).toBe('win-01');
    expect(s._prevUiMode).toBe('classic');
  });

  it('closeWindowsDesktop en desktop limpia rdpMachineId sin cambiar uiMode', () => {
    useScenarioStore.getState().openWindowsDesktop('win-01');
    useScenarioStore.getState().closeWindowsDesktop();
    const s = useScenarioStore.getState();
    expect(s.uiMode).toBe('desktop');
    expect(s.rdpMachineId).toBeNull();
    expect(s._prevUiMode).toBeNull();
  });

  it('closeWindowsDesktop restaura el modo previo desde full-screen', () => {
    useScenarioStore.setState(() => ({
      uiMode: 'classic' as const,
      _prevUiMode: null,
      rdpMachineId: null,
    }));
    useScenarioStore.getState().openWindowsDesktop('win-01');
    useScenarioStore.getState().closeWindowsDesktop();
    const s = useScenarioStore.getState();
    expect(s.uiMode).toBe('classic');
    expect(s.rdpMachineId).toBeNull();
    expect(s._prevUiMode).toBeNull();
  });

  it('toggleUiMode con RDP full-screen cierra y vuelve a classic', () => {
    useScenarioStore.setState(() => ({
      uiMode: 'classic' as const,
      _prevUiMode: null,
      rdpMachineId: null,
    }));
    useScenarioStore.getState().openWindowsDesktop('win-01');
    useScenarioStore.getState().toggleUiMode();
    const s = useScenarioStore.getState();
    expect(s.uiMode).toBe('classic');
    expect(s.rdpMachineId).toBeNull();
  });

  it('toggleUiMode con RDP en ventana cierra rdpMachineId', () => {
    useScenarioStore.getState().openWindowsDesktop('win-01');
    useScenarioStore.getState().toggleUiMode();
    const s = useScenarioStore.getState();
    expect(s.rdpMachineId).toBeNull();
    expect(s.uiMode).toBe('classic');
  });

  it('resetUiState limpia un RDP huérfano en desktop', () => {
    useScenarioStore.getState().openWindowsDesktop('win-01');
    const partial = useScenarioStore.getState().resetUiState();
    expect(partial.rdpMachineId).toBeNull();
    expect(partial.uiMode).toBeUndefined();
    expect(partial._prevUiMode).toBeUndefined();
  });

  it('resetUiState sale de full-screen si el RDP huérfano está ahí', () => {
    useScenarioStore.setState(() => ({
      uiMode: 'classic' as const,
      _prevUiMode: null,
      rdpMachineId: null,
    }));
    useScenarioStore.getState().openWindowsDesktop('win-01');
    const partial = useScenarioStore.getState().resetUiState();
    expect(partial.rdpMachineId).toBeNull();
    expect(partial.uiMode).toBe('classic');
    expect(partial._prevUiMode).toBeNull();
  });
});
