// ── hooks/useFtpSession.ts ─────────────────────────────────────────
// Maneja el ciclo de vida de una sesión FTP interactiva: estado, prompt,
// y ejecución de sub-comandos (USER/PASS/GET/PUT/QUIT...) dentro de la sesión.
//
// Con `terminalId` el estado vive local (aislado por ventana); sin él
// (modo legacy/tests) cae al store compartido — igual que SSH/RDP.

import { useState } from 'react';
import type { Machine, CommandResponse, FtpSessionData, PsState } from '../types';
import { isShellSessionActive, startShellSession } from '../commands';
import type { IsolatedExecutor } from '../commands';
import type { MsfState } from '../commands';
import { useScenarioStore } from '../store/scenarioStore';

export interface SessionRunnerDeps {
  executor: IsolatedExecutor;
  machine: Machine;
  allMachines: Machine[];
  currentMissionId: number;
  currentDir: string;
  setCurrentDir: (dir: string) => void;
  umask: number;
  setUmask: (u: number) => void;
  env: Record<string, string> | undefined;
  setEnv: (e: Record<string, string> | undefined) => void;
  language: 'es' | 'en';
  setMsfState: (s: MsfState | null) => void;
  setPsState?: (s: PsState | null) => void;
  // Id de terminal que aísla las sesiones de shell (P2-13/C1).
  terminalId?: string;
  // su del frame de identidad local de la terminal (aislamiento HIGH #2):
  // el executor lo vuelve override de getCurrentUser durante la ejecución.
  suUserOverride?: string;
}

export interface SessionRunResult {
  result: CommandResponse;
  /** Sesión actualizada por el comando (puede ser null si se cerró) */
  updatedSession: FtpSessionData | null;
}

// Type guard para el discriminate 'ftp' — el union completo no estrecha bien
// con `in` en TS porque CommandResponse tiene members sin `type`.
const hasFtpSession = (r: CommandResponse): r is CommandResponse & { ftpSession: FtpSessionData } =>
  'ftpSession' in r;

export const getFtpPromptFor = (ftpSession: FtpSessionData | null): string => {
  if (!ftpSession?.active) return '';
  switch (ftpSession.step) {
    case 'username': return `Name (${ftpSession.targetIp}:root): `;
    case 'password': return 'Password: ';
    case 'connected':
    default: return 'ftp> ';
  }
};

export function useFtpSession(terminalId?: string) {
  const storeFtpSession = useScenarioStore(state => state.ftpSession);
  const setStoreFtpSession = useScenarioStore(state => state.setFtpSession);
  const [localFtpSession, setLocalFtpSession] = useState<FtpSessionData | null>(null);

  const ftpSession = terminalId ? localFtpSession : storeFtpSession;
  // Con terminalId la fuente de verdad es el estado local; el store se
  // espeja solo para display (AdminPanel/AppContentStore/NetworkMap).
  const setFtpSession = (session: FtpSessionData | null) => {
    if (terminalId) setLocalFtpSession(session);
    setStoreFtpSession(session);
  };

  /** Ejecuta un comando dentro de la sesión FTP activa. */
  const runFtpCommand = (cmd: string, deps: SessionRunnerDeps): SessionRunResult => {
    const { executor, machine, allMachines, currentMissionId, currentDir, setCurrentDir, umask, setUmask, env, setEnv, language, setMsfState, setPsState, terminalId, suUserOverride } = deps;
    const result = executor.executeCommand({
      line: cmd,
      machine, allMachines, currentMissionId, terminalId, suUserOverride,
      onMsfStateChange: setMsfState, onPsStateChange: setPsState, currentDir, setCurrentDir,
      language, umask, setUmask, env, setEnv,
    });

    let updatedSession: FtpSessionData | null = ftpSession;
    if (hasFtpSession(result)) {
      const fs = result.ftpSession;
      updatedSession = fs.active ? {
        active: fs.active,
        targetIp: fs.targetIp,
        targetId: fs.targetId,
        username: fs.username,
        loggedIn: fs.loggedIn,
        step: fs.step || 'connected',
      } : null;
      setFtpSession(updatedSession);
    }

    return { result, updatedSession };
  };

  /**
   * Inicia una sesión FTP a partir de la respuesta del comando `ftp <ip>`.
   */
  const startFtpSession = (ftpResult: FtpSessionData, deps: SessionRunnerDeps): void => {
    const { machine, allMachines, currentMissionId, currentDir, setCurrentDir, language, terminalId } = deps;
    const targetIp = ftpResult.targetIp;
    if (targetIp && !isShellSessionActive(terminalId)) {
      startShellSession('ftp', [targetIp], {
        machine, allMachines, currentMissionId, currentDir, setCurrentDir, language,
        terminalId,
      }, terminalId);
    }
    setFtpSession({
      active: true,
      targetIp: ftpResult.targetIp,
      targetId: ftpResult.targetId,
      username: undefined,
      loggedIn: false,
      step: 'username',
    });
  };

  return { ftpSession, setFtpSession, runFtpCommand, startFtpSession };
}
