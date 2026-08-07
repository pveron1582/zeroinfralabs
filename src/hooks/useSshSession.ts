// ── hooks/useSshSession.ts ─────────────────────────────────────────
// Maneja el ciclo de vida de una sesión SSH interactiva: estado, prompt
// de password, y ejecución del intento de autenticación.
//
// El estado vive en el store (terminalSlice) — no hay estado local React.

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

export function useSshSession() {
  const sshSession = useScenarioStore(state => state.sshSession);
  const setSshSession = useScenarioStore(state => state.setSshSession);

  /** Ejecuta el password dentro de una sesión SSH en estado `password`. */
  const runSshPassword = (password: string, deps: SessionRunnerDeps): SshRunResult => {
    const { executor, machine, allMachines, currentMissionId, currentDir, setCurrentDir, umask, setUmask, env, setEnv, language, setMsfState } = deps;
    const result = executor.executeCommand(
      password, machine as any, allMachines as any, currentMissionId,
      setMsfState, currentDir, setCurrentDir, undefined, language,
      umask, setUmask, env, setEnv,
    );

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
