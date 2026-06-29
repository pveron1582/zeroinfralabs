// ── frameworks/metasploit/commands/sessions.ts ─────────────────────
// MSF sessions command - list, interact with, background, and kill sessions

import type { CommandContext, CommandResponse } from '../../../types';
import type { SessionManager } from '../core/SessionManager';
import type { MsfState } from '../modules/types';
import { formatSessionsList } from '../core/SessionManager';

// ── Sessions Command ───────────────────────────────────────────────
export function executeSessionsCommand(
  args: string[],
  state: MsfState,
  sessionManager: SessionManager,
  language: 'en' | 'es' = 'en'
): CommandResponse {
  const subcommand = args[0]?.toLowerCase();
  const sessionId = parseInt(args[1] || '', 10);

  // ── sessions (list all) ───────────────────────────────────────────
  if (!subcommand || subcommand === '-l' || subcommand === 'list') {
    const list = formatSessionsList(sessionManager.getAllSessions(), language);
    return { output: list };
  }

  // ── sessions -i <id> (interact) ───────────────────────────────────
  if (subcommand === '-i' && !isNaN(sessionId)) {
    const result = sessionManager.interactWithSession(sessionId);
    return {
      output: result.output,
      isError: result.isError,
    };
  }

  // ── sessions -k <id> (kill) ───────────────────────────────────────
  if (subcommand === '-k' && !isNaN(sessionId)) {
    const result = sessionManager.killSession(sessionId);
    return {
      output: result.output,
      isError: result.isError,
    };
  }

  // ── sessions -K (kill all) ──────────────────────────────────────────
  if (subcommand === '-k' && args[1]?.toLowerCase() === 'all') {
    const sessions = sessionManager.getAllSessions();
    let output = '';
    for (const session of sessions) {
      const result = sessionManager.killSession(session.id);
      output += result.output + '\n';
    }
    output += language === 'es'
      ? `[*] ${sessions.length} sesiones eliminadas`
      : `[*] ${sessions.length} sessions killed`;
    return { output };
  }

  // ── Unknown option ────────────────────────────────────────────────
  return {
    output: language === 'es'
      ? `Uso: sessions [opciones]\n\nOpciones:\n  -l, list     Listar sesiones activas\n  -i <id>      Interactuar con sesión\n  -k <id/all>  Eliminar sesión(s)`
      : `Usage: sessions [options]\n\nOptions:\n  -l, list     List active sessions\n  -i <id>      Interact with session\n  -k <id/all>  Kill session(s)`,
    isError: true,
  };
}

// ── Background Command ─────────────────────────────────────────────
export function executeBackgroundCommand(
  state: MsfState,
  sessionManager: SessionManager,
  language: 'en' | 'es' = 'en'
): CommandResponse {
  const result = sessionManager.backgroundSession();
  
  if (result.isError) {
    return {
      output: result.output,
      isError: true,
    };
  }

  // Update state to exit session context
  return {
    output: result.output,
    // Signal that we're exiting session context
    // The main handler will detect this and update prompt
  };
}

// ── Exit/Quit Session Command ──────────────────────────────────────
export function executeExitSessionCommand(
  state: MsfState,
  sessionManager: SessionManager,
  language: 'en' | 'es' = 'en'
): CommandResponse {
  // In a session context, exit means kill the session and return to msfconsole
  const currentSession = sessionManager.getCurrentSession();
  
  if (currentSession) {
    // Kill the current session
    sessionManager.killSession(currentSession.id);
    return {
      output: language === 'es'
        ? `[*] Cerrando sesión ${currentSession.id}...`
        : `[*] Closing session ${currentSession.id}...`,
    };
  }

  return {
    output: language === 'es'
      ? '[-] No hay sesión activa para cerrar'
      : '[-] No active session to close',
    isError: true,
  };
}

// ── Command Registry Entry ────────────────────────────────────────
export const cmd_sessions = {
  name: 'sessions',
  description: 'List, interact with, and manage active sessions',
  execute: executeSessionsCommand,
};

export const cmd_background = {
  name: 'background',
  description: 'Background the current session',
  execute: executeBackgroundCommand,
};
