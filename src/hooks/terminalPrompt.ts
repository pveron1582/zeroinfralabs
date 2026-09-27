// ── hooks/terminalPrompt.ts ───────────────────────────────────────
// Derivación del prompt de la terminal: prioridad su/pendientes >
// PowerShell > Metasploit > sesiones FTP/SSH/RDP > prompt base.
// Extraído de useCommandRunner como función pura.

import type { FtpSessionData, SshSessionData, RdpSessionData } from '../types';
import type { PendingSu } from './usePendingSu';
import type { PendingPython } from './usePendingPythonInput';
import { getFtpPromptFor } from './useFtpSession';
import { getSshPromptFor } from './useSshSession';
import { getRdpPromptFor } from './useRdpSession';

export interface PromptState {
  pendingSu: PendingSu | null;
  pendingPython: PendingPython | null;
  isPsActive: boolean;
  isMsfActive: boolean;
  msfPrompt: string | null;
  ftpSession: FtpSessionData | null;
  sshSession: SshSessionData | null;
  rdpSession: RdpSessionData | null;
  hostname: string;
  displayPath: string;
  basePrompt: string;
}

export function buildPrompt(s: PromptState): string {
  if (s.pendingSu) {
    return `${s.pendingSu.targetUser}@${s.hostname}'s password: `;
  }
  // El prompt del script python ya está en el output; la línea entra tal cual.
  if (s.pendingPython) return '';
  if (s.isPsActive) return `PS ${s.displayPath}>`;
  if (s.isMsfActive) return s.msfPrompt || 'msf6 >';
  if (s.ftpSession?.active) return getFtpPromptFor(s.ftpSession) || 'ftp> ';
  if (s.sshSession?.active) return getSshPromptFor(s.sshSession) || '';
  if (s.rdpSession?.active) return getRdpPromptFor(s.rdpSession) || '';
  return s.basePrompt;
}
