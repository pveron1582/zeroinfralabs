// ── hooks/useRdpSession.ts ────────────────────────────────────────
// Maneja el ciclo de vida de una sesión RDP interactiva (W5): estado,
// prompt y ejecución del intento de autenticación.
//
// Con `terminalId` el estado vive local (aislado por ventana); sin él
// (modo classic legacy) cae al store compartido — igual que SSH/FTP.

import { useState } from 'react';
import type { CommandResponse, RdpSessionData } from '../types';
import type { SessionRunnerDeps } from './useFtpSession';
import { useScenarioStore } from '../store/scenarioStore';

export interface RdpRunResult {
  result: CommandResponse;
  updatedSession: RdpSessionData | null;
}

const hasRdpSession = (r: CommandResponse): r is CommandResponse & { rdpSession: RdpSessionData } =>
  'rdpSession' in r && r.rdpSession !== undefined;

export const getRdpPromptFor = (rdpSession: RdpSessionData | null): string => {
  if (!rdpSession?.active) return '';
  if (rdpSession.step === 'username') {
    return `Usuario (${rdpSession.targetIp || 'localhost'}): `;
  }
  if (rdpSession.step === 'password') {
    return `${rdpSession.username ?? ''}@${rdpSession.targetIp ?? ''}'s password: `;
  }
  return '';
};

export function useRdpSession(terminalId?: string) {
  const storeRdpSession = useScenarioStore(state => state.rdpSession);
  const setStoreRdpSession = useScenarioStore(state => state.setRdpSession);
  const [localRdpSession, setLocalRdpSession] = useState<RdpSessionData | null>(null);

  const rdpSession = terminalId ? localRdpSession : storeRdpSession;
  // Con terminalId la fuente de verdad es el estado local; el store se
  // espeja solo para display (AdminPanel/AppContentStore/NetworkMap).
  const setRdpSession = (session: RdpSessionData | null) => {
    if (terminalId) setLocalRdpSession(session);
    setStoreRdpSession(session);
  };

  /** Ejecuta la entrada (usuario o password) dentro de una sesión RDP activa. */
  const runRdpInput = (line: string, deps: SessionRunnerDeps): RdpRunResult => {
    const { executor, machine, allMachines, currentMissionId, currentDir, setCurrentDir, umask, setUmask, env, setEnv, language, setMsfState, setPsState, terminalId, suUserOverride } = deps;
    const result = executor.executeCommand({
      line,
      machine, allMachines, currentMissionId, terminalId, suUserOverride,
      onMsfStateChange: setMsfState, onPsStateChange: setPsState, currentDir, setCurrentDir,
      language, umask, setUmask, env, setEnv,
    });

    let updatedSession: RdpSessionData | null = rdpSession;
    if (hasRdpSession(result)) {
      const rs = result.rdpSession;
      updatedSession = rs.active ? {
        active: rs.active,
        targetIp: rs.targetIp,
        targetId: rs.targetId,
        username: rs.username,
        authenticated: rs.authenticated,
        connected: rs.connected,
        step: rs.step || 'password',
      } : null;
      setRdpSession(updatedSession);
    } else if (rdpSession?.active && ('desktopAction' in result || result.isError)) {
      // Sesión cerrada sin metadata rdpSession (auth ok/fail con closeSession).
      updatedSession = null;
      setRdpSession(null);
    }

    return { result, updatedSession };
  };

  /** Inicia una sesión RDP a partir de la respuesta de `mstsc`/`xrdp`. */
  const startRdpSession = (rs: RdpSessionData) => {
    setRdpSession({
      active: true,
      targetIp: rs.targetIp,
      targetId: rs.targetId,
      username: rs.username,
      authenticated: rs.authenticated,
      connected: rs.connected ?? true,
      step: rs.step || 'password',
    });
  };

  return { rdpSession, setRdpSession, runRdpInput, startRdpSession };
}
