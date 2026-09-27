// ── hooks/__tests__/useDownloadedFile.test.ts ──────────────────────
// Cubre las ramas de useDownloadedFile (13% branch antes de este test):
// sin archivo, rename de nota/note, owner/group/mode opcionales, idioma.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDownloadedFile } from '../useDownloadedFile';

const storeRef = vi.hoisted(() => ({ current: { addFileToMachine: vi.fn() } }));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: { getState: () => storeRef.current },
}));

function makeOpts(language: 'es' | 'en' = 'es') {
  return { attackerMachineId: 'attacker-01', allMachines: [], language, setHistory: vi.fn() };
}

describe('useDownloadedFile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('no hace nada sin downloadedFile', () => {
    const { result } = renderHook(() => useDownloadedFile(makeOpts()));
    act(() => { result.current.handleDownloadedFile({ output: 'ok' }, () => 'prompt> '); });
    expect(storeRef.current.addFileToMachine).not.toHaveBeenCalled();
  });

  it('renombra nota.txt a /root y guarda en ES', () => {
    const { result } = renderHook(() => useDownloadedFile(makeOpts('es')));
    act(() => {
      result.current.handleDownloadedFile(
        { output: 'ok', downloadedFile: { path: '/tmp/nota.txt', content: 'secreto', type: 'text' } },
        () => 'ftp> ',
      );
    });
    expect(storeRef.current.addFileToMachine).toHaveBeenCalledWith('attacker-01',
      expect.objectContaining({ path: '/root/nota.txt', content: 'secreto' }));
  });

  it('renombra note.txt a /root y usa owner/group/mode cuando vienen', () => {
    const { result } = renderHook(() => useDownloadedFile(makeOpts('en')));
    act(() => {
      result.current.handleDownloadedFile(
        { output: 'ok', downloadedFile: { path: '/tmp/note.txt', content: 'x', type: 'text', owner: 'root', group: 'root', mode: 0o600 } },
        () => 'ftp> ',
      );
    });
    const call = storeRef.current.addFileToMachine.mock.calls[0][1];
    expect(call.path).toBe('/root/note.txt');
    expect(call.owner).toBe('root');
    expect(call.group).toBe('root');
    expect(call.mode).toBe(0o600);
  });

  it('usa el path original si no es una nota', () => {
    const { result } = renderHook(() => useDownloadedFile(makeOpts()));
    act(() => {
      result.current.handleDownloadedFile(
        { output: 'ok', downloadedFile: { path: '/root/loot.zip', content: 'bin', type: 'text' } },
        () => 'ftp> ',
      );
    });
    expect(storeRef.current.addFileToMachine).toHaveBeenCalledWith('attacker-01',
      expect.objectContaining({ path: '/root/loot.zip' }));
  });
});
