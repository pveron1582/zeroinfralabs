// ── hooks/useSshSession.ts ─────────────────────────────────────────
// Maneja el ciclo de vida de una sesión SSH interactiva: estado, prompt
// de password, y ejecución del intento de autenticación.
//
// Con `terminalId` el estado vive local (aislado por ventana); sin él
// (modo legacy/tests) cae al store compartido — igual que FTP/RDP.

import { useState } from 'react';
import type { CommandResponse, SshSessionData } from '../types';
import type { SessionRunnerDeps } from './useFtpSession';
import { useScenarioStore } from '../store/scenarioStore';

export interface SshRunResult {
  result: CommandResponse;
  updatedSession: SshSessionData | null;
}

const hasSshSession = (r: CommandResponse): r is CommandResponse & { sshSession: SshSessionData } =>
  'sshSession' in r;

export const getSshPromptFor = (sshSession: SshSessionData | null): string => {
  if (!sshSession?.active) return '';
  if (sshSession.step === 'password') {
    return `${sshSession.username}@${sshSession.targetIp}'s password: `;
  }
  return '';
};

export function useSshSession(terminalId?: string) {
  const storeSshSession = useScenarioStore(state => state.sshSession);
  const setStoreSshSession = useScenarioStore(state => state.setSshSession);
  const [localSshSession, setLocalSshSession] = useState<SshSessionData | null>(null);

  const sshSession = terminalId ? localSshSession : storeSshSession;
  // Con terminalId la fuente de verdad es el estado local; el store se
  // espeja solo para display (AdminPanel/AppContentStore/NetworkMap).
  const setSshSession = (session: SshSessionData | null) => {
    if (terminalId) setLocalSshSession(session);
    setStoreSshSession(session);
  };

  /** Ejecuta el password dentro de una sesión SSH en estado `password`. */
  const runSshPassword = (password: string, deps: SessionRunnerDeps): SshRunResult => {
    const { executor, machine, allMachines, currentMissionId, currentDir, setCurrentDir, umask, setUmask, env, setEnv, language, setMsfState, setPsState, terminalId, suUserOverride } = deps;
    const result = executor.executeCommand({
      line: password,
      machine, allMachines, currentMissionId, terminalId, suUserOverride,
      onMsfStateChange: setMsfState, onPsStateChange: setPsState, currentDir, setCurrentDir,
      language, umask, setUmask, env, setEnv,
    });

    let updatedSession: SshSessionData | null = sshSession;
    if (hasSshSession(result)) {
      const ss = result.sshSession;
      updatedSession = ss.active ? {
        active: ss.active,
        targetIp: ss.targetIp,
        targetId: ss.targetId,
        username: ss.username,
        authenticated: ss.authenticated,
        step: ss.step || 'password',
      } : null;
      setSshSession(updatedSession);
    }

    return { result, updatedSession };
  };

  /** Inicia una sesión SSH a partir de la respuesta del comando `ssh`. */
  const startSshSession = (ss: SshSessionData) => {
    setSshSession({
      active: true,
      targetIp: ss.targetIp,
      targetId: ss.targetId,
      username: ss.username,
      authenticated: ss.authenticated,
      step: ss.step || 'password',
    });
  };

  return { sshSession, setSshSession, runSshPassword, startSshSession };
}
