// ── hooks/__tests__/processCommandResult.test.ts ───────────────────
// Cubre las ramas de processCommandResult que no se ejercitaban vía
// useCommandRunner: filesChanged, identityExit (pop true/false),
// sshSessionClosed, privescCompleted, failedUser, sudoPrivileges,
// possibleUsers, createdFiles, suUserApplied, verify-credentials y
// blockingCommand con listeningPort/clearScreen.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCommandResult } from '../processCommandResult';
import type { ProcessDeps } from '../processCommandResult';

const storeRef = vi.hoisted(() => ({
  current: {
    setMachineFiles: vi.fn(),
    setListeningPort: vi.fn(),
    setSuUser: vi.fn(),
    setPrivescCompleted: vi.fn(),
    setPossibleUsers: vi.fn(),
    addFileToMachine: vi.fn(),
    openWindowsDesktop: vi.fn(),
    closeWindowsDesktop: vi.fn(),
    setRdpSession: vi.fn(),
  },
}));

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: { getState: () => storeRef.current },
}));

function makeDeps(overrides: Partial<ProcessDeps> = {}): ProcessDeps {
  const machine = { id: 'victim-01', machine_info: { type: 'server', hostname: 'v' } } as any;
  const attacker = { id: 'attacker-01', machine_info: { type: 'workstation', hostname: 'kali' } } as any;
  return {
    machine,
    allMachines: [machine, attacker],
    currentDir: '/home/user',
    setCurrentDir: vi.fn(),
    pushIdentity: vi.fn(),
    popIdentity: vi.fn(() => true),
    checkMissionCompletion: vi.fn(),
    onMissionComplete: vi.fn(),
    onChangeMachine: vi.fn(),
    onCredentialsFound: vi.fn(),
    onVerifyCredentials: vi.fn(),
    onFailedUser: vi.fn(),
    onSudoPrivileges: vi.fn(),
    setBlockingCommand: vi.fn(),
    setListeningPort: vi.fn(),
    setNanoFile: vi.fn(),
    setBusy: vi.fn(),
    setHistory: vi.fn(),
    setPendingSu: vi.fn(),
    setPendingPython: vi.fn(),
    reportVulnerability: vi.fn(),
    ...overrides,
  };
}

describe('processCommandResult', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('filesChanged actualiza los archivos de la máquina', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', filesChanged: [{ path: '/x', content: '' }] } as any, false);
    expect(storeRef.current.setMachineFiles).toHaveBeenCalledWith('victim-01', expect.any(Array));
  });

  it('identityExit: popIdentity true no resetea suUser', () => {
    const deps = makeDeps({ popIdentity: vi.fn(() => true) });
    processCommandResult(deps, { output: 'ok', identityExit: true } as any, false);
    expect(storeRef.current.setSuUser).not.toHaveBeenCalled();
  });

  it('identityExit: popIdentity false resetea suUser', () => {
    const deps = makeDeps({ popIdentity: vi.fn(() => false) });
    processCommandResult(deps, { output: 'ok', identityExit: true } as any, false);
    expect(storeRef.current.setSuUser).toHaveBeenCalledWith('victim-01', undefined);
  });

  it('newMachineId sin sshSessionClosed apila identidad y cambia de máquina', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', newMachineId: 'victim-02' } as any, false);
    expect(deps.onChangeMachine).toHaveBeenCalledWith('victim-02');
    expect(deps.pushIdentity).toHaveBeenCalledWith({ machineId: 'victim-02', cwd: '/home/user' });
  });

  it('newMachineId con sshSessionClosed hace pop y cambia de máquina', () => {
    const deps = makeDeps({ popIdentity: vi.fn(() => false) });
    processCommandResult(deps, { output: 'ok', newMachineId: 'victim-02', sshSessionClosed: true } as any, false);
    expect(deps.popIdentity).toHaveBeenCalled();
    expect(deps.onChangeMachine).toHaveBeenCalledWith('victim-02');
  });

  it('newMachineId resetea el cwd al home del nuevo SO (exploit → Windows)', () => {
    const win = {
      id: 'win-01',
      machine_info: { type: 'server', hostname: 'WIN7-LAB', family: 'windows' },
      win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
    } as any;
    const base = makeDeps();
    const deps = makeDeps({ allMachines: [...base.allMachines, win], currentDir: '/root' });
    processCommandResult(deps, { output: 'ok', newMachineId: 'win-01' } as any, false);
    expect(deps.setCurrentDir).toHaveBeenCalledWith('/C:/Users/win7user');
    expect(deps.pushIdentity).toHaveBeenCalledWith({ machineId: 'win-01', cwd: '/C:/Users/win7user' });
  });

  it('newMachineId + sshLoginUser usa el home del usuario conectado', () => {
    const deps = makeDeps({ currentDir: '/root' });
    processCommandResult(
      deps, { output: 'ok', newMachineId: 'victim-02', sshLoginUser: 'bob' } as any, false
    );
    expect(deps.pushIdentity).toHaveBeenCalledWith({ machineId: 'victim-02', cwd: '/home/bob' });
  });

  it('sshLoginUser cambia el directorio a /home/<user>', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', sshLoginUser: 'bob' } as any, false);
    expect(deps.setCurrentDir).toHaveBeenCalledWith('/home/bob');
  });

  it('privescCompleted marca privesc y apila identidad root', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', privescCompleted: 'victim-01' } as any, false);
    expect(storeRef.current.setPrivescCompleted).toHaveBeenCalledWith('victim-01');
    expect(storeRef.current.setSuUser).toHaveBeenCalledWith('victim-01', 'root');
    expect(deps.pushIdentity).toHaveBeenCalledWith({ machineId: 'victim-01', suUser: 'root', cwd: '/home/user' });
  });

  it('failedUser invoca onFailedUser', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', failedUser: { machineId: 'victim-01', user: 'root' } } as any, false);
    expect(deps.onFailedUser).toHaveBeenCalledWith('victim-01', 'root');
  });

  it('sudoPrivileges invoca onSudoPrivileges', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', sudoPrivileges: { machineId: 'victim-01', user: 'john', commands: ['vim'], canSudo: true } } as any, false);
    expect(deps.onSudoPrivileges).toHaveBeenCalledWith('victim-01', 'john', ['vim'], true);
  });

  it('newMachineId + foundCredentials invoca onVerifyCredentials', () => {
    const deps = makeDeps();
    processCommandResult(deps, {
      output: 'ok',
      newMachineId: 'victim-02',
      foundCredentials: { machineId: 'victim-02', user: 'a', pass: 'p', file: 'f', service: 'ssh' },
    } as any, false);
    expect(deps.onVerifyCredentials).toHaveBeenCalledWith('victim-02', 'ssh');
  });

  it('sshSessionClosed setea el directorio a /root', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', sshSessionClosed: true } as any, false);
    expect(deps.setCurrentDir).toHaveBeenCalledWith('/root/');
  });

  it('possibleUsers setea usuarios si la máquina existe', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', possibleUsers: { machineId: 'victim-01', users: ['a', 'b'] } } as any, false);
    expect(storeRef.current.setPossibleUsers).toHaveBeenCalledWith('victim-01', ['a', 'b']);
  });

  it('createdFiles agrega a la máquina atacante', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', createdFiles: [{ path: '/root/x.sh', content: '#!/bin/bash', type: 'text' }] } as any, false);
    expect(storeRef.current.addFileToMachine).toHaveBeenCalledWith('attacker-01', expect.objectContaining({ path: '/root/x.sh' }));
  });

  it('blockingCommand con listeningPort y clearScreen setea todo', () => {
    const deps = makeDeps();
    processCommandResult(deps, {
      output: 'ok',
      blockingCommand: { message: 'Escuchando', listeningPort: 4444, clearScreen: true },
    } as any, false);
    expect(deps.setBlockingCommand).toHaveBeenCalled();
    expect(deps.setListeningPort).toHaveBeenCalledWith(4444);
    expect(storeRef.current.setListeningPort).toHaveBeenCalledWith(4444);
    expect(deps.setHistory).toHaveBeenCalledWith([]);
    expect(deps.setBusy).toHaveBeenCalledWith(true);
  });

  it('nanoFile abre el editor y marca busy', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', nanoFile: { path: '/etc/x', content: '' } } as any, false);
    expect(deps.setNanoFile).toHaveBeenCalled();
    expect(deps.setBusy).toHaveBeenCalledWith(true);
  });

  it('requiresPassword con sudoEscalation/sudoCwd setea pendingSu', () => {
    const deps = makeDeps();
    processCommandResult(deps, {
      output: '', isError: false, requiresPassword: true, suTarget: 'root', sudoEscalation: true, sudoCwd: '/root',
    } as any, false);
    expect(deps.setPendingSu).toHaveBeenCalledWith(expect.objectContaining({ targetUser: 'root', sudoEscalation: true, sudoCwd: '/root' }));
  });

  it('suUserApplied aplica el switch y apila identidad', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'ok', suUserApplied: 'developer' } as any, false);
    expect(storeRef.current.setSuUser).toHaveBeenCalledWith('victim-01', 'developer');
    expect(deps.pushIdentity).toHaveBeenCalledWith({ machineId: 'victim-01', suUser: 'developer', cwd: '/home/user' });
  });

  it('con terminalId suUserApplied NO escribe el su compartido (aislamiento HIGH #2)', () => {
    const deps = makeDeps({ terminalId: 't-A' });
    processCommandResult(deps, { output: 'ok', suUserApplied: 'developer' } as any, false);
    expect(storeRef.current.setSuUser).not.toHaveBeenCalled();
    expect(deps.pushIdentity).toHaveBeenCalledWith({ machineId: 'victim-01', suUser: 'developer', cwd: '/home/user' });
  });

  it('con terminalId privescCompleted NO escribe el su compartido pero sí apila el frame', () => {
    const deps = makeDeps({ terminalId: 't-A' });
    processCommandResult(deps, { output: 'ok', privescCompleted: 'victim-01' } as any, false);
    expect(storeRef.current.setPrivescCompleted).toHaveBeenCalledWith('victim-01');
    expect(storeRef.current.setSuUser).not.toHaveBeenCalled();
    expect(deps.pushIdentity).toHaveBeenCalledWith({ machineId: 'victim-01', suUser: 'root', cwd: '/home/user' });
  });

  it('pythonPendingInput captura la próxima línea', () => {
    const deps = makeDeps();
    processCommandResult(deps, { output: 'Pregunta? ', pythonPendingInput: { argv: ['x.py'], sourceName: 'x.py' } } as any, false);
    expect(deps.setPendingPython).toHaveBeenCalledWith(expect.objectContaining({ argv: ['x.py'] }));
  });

  it('desktopAction connect abre el escritorio Windows', () => {
    const deps = makeDeps();
    processCommandResult(deps, {
      output: 'ok',
      desktopAction: { action: 'connect', machineId: 'win-01', ip: '10.0.0.5' },
    } as any, false);
    expect(storeRef.current.openWindowsDesktop).toHaveBeenCalledWith('win-01');
    expect(storeRef.current.closeWindowsDesktop).not.toHaveBeenCalled();
  });

  it('desktopAction disconnect cierra el escritorio Windows', () => {
    const deps = makeDeps();
    processCommandResult(deps, {
      output: 'ok',
      desktopAction: { action: 'disconnect' },
    } as any, false);
    expect(storeRef.current.closeWindowsDesktop).toHaveBeenCalled();
    expect(storeRef.current.openWindowsDesktop).not.toHaveBeenCalled();
  });
});
