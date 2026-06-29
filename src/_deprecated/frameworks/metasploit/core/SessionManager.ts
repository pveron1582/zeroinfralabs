// ── frameworks/metasploit/core/SessionManager.ts ───────────────────
// Integrates MSF sessions (meterpreter, shell) with ShellManager stack
// When exploit succeeds, pushes meterpreter context to shell stack

import type { ShellManager, ShellContext, ShellResult } from '../../shells';
import type { MsfState, MsfSession, ExploitResult } from '../modules/types';

// ── Session Context Types ─────────────────────────────────────────
export type MsfSessionType = 'meterpreter' | 'shell';

export interface MsfSessionContext {
  type: 'msf_session';
  sessionId: number;
  sessionType: MsfSessionType;
  targetIp: string;
  targetInfo?: {
    computer?: string;
    os?: string;
    arch?: string;
    username?: string;
    isSystem?: boolean;
  };
}

// ── Session Manager ────────────────────────────────────────────────
export class SessionManager {
  private state: MsfState;
  private onStateChange: (state: MsfState) => void;
  private shellManager: ShellManager;
  private nextSessionId = 1;

  constructor(
    shellManager: ShellManager,
    initialState: MsfState,
    onStateChange: (state: MsfState) => void
  ) {
    this.shellManager = shellManager;
    this.state = { ...initialState, sessions: initialState.sessions || [] };
    this.onStateChange = onStateChange;
    
    // Restore nextSessionId from existing sessions
    if (this.state.sessions && this.state.sessions.length > 0) {
      this.nextSessionId = Math.max(...this.state.sessions.map(s => s.id)) + 1;
    }
  }

  // ── Session Lifecycle ─────────────────────────────────────────────

  /**
   * Create a new session from successful exploit
   * Called by exploit modules when they succeed
   */
  createSession(
    sessionType: MsfSessionType,
    targetIp: string,
    targetInfo?: MsfSessionContext['targetInfo']
  ): MsfSession {
    const session: MsfSession = {
      id: this.nextSessionId++,
      type: sessionType,
      targetIp,
      targetInfo,
      isBackgrounded: false,
    };

    // Add to state
    this.state.sessions = [...(this.state.sessions || []), session];
    this.state.sessionOpen = true;
    this.notifyStateChange();

    return session;
  }

  /**
   * Push session context to ShellManager stack
   * Called when user runs 'sessions -i <id>' or exploit auto-interacts
   */
  interactWithSession(sessionId: number): ShellResult {
    const session = this.getSession(sessionId);
    if (!session) {
      return {
        output: `[-] Invalid session id: ${sessionId}`,
        isError: true,
      };
    }

    // Mark as foreground
    this.state.sessions = this.state.sessions?.map(s => ({
      ...s,
      isBackgrounded: s.id !== sessionId, // Background others
    }));
    this.state.currentSessionId = sessionId;
    this.notifyStateChange();

    // Build prompt based on session type
    const prompt = this.buildPrompt(session);

    // Return success - the prompt will be managed by ShellManager via getPrompt()
    return {
      output: `[*] Starting interaction with ${session.type} session ${sessionId}...\n\n${prompt}`,
    };
  }

  /**
   * Background current session (Ctrl+Z behavior)
   * Returns to msf6 > prompt
   */
  backgroundSession(): ShellResult {
    const currentId = this.state.currentSessionId;
    if (!currentId) {
      return {
        output: '[-] No active session to background',
        isError: true,
      };
    }

    // Mark session as backgrounded
    this.state.sessions = this.state.sessions?.map(s =>
      s.id === currentId ? { ...s, isBackgrounded: true } : s
    );
    this.state.currentSessionId = undefined;
    this.state.sessionOpen = false;
    this.notifyStateChange();

    return {
      output: '[*] Backgrounding session...',
    };
  }

  /**
   * Exit/kill a session permanently
   */
  killSession(sessionId: number): ShellResult {
    const session = this.getSession(sessionId);
    if (!session) {
      return {
        output: `[-] Invalid session id: ${sessionId}`,
        isError: true,
      };
    }

    // Remove from sessions
    this.state.sessions = this.state.sessions?.filter(s => s.id !== sessionId);
    
    // If killing current session, update state
    if (this.state.currentSessionId === sessionId) {
      this.state.currentSessionId = undefined;
      this.state.sessionOpen = false;
    }

    this.notifyStateChange();

    return {
      output: `[*] Killed session ${sessionId}`,
    };
  }

  // ── Query Methods ─────────────────────────────────────────────────

  getSession(id: number): MsfSession | undefined {
    return this.state.sessions?.find(s => s.id === id);
  }

  getAllSessions(): MsfSession[] {
    return this.state.sessions || [];
  }

  getActiveSessions(): MsfSession[] {
    return this.state.sessions?.filter(s => !s.isBackgrounded) || [];
  }

  getCurrentSession(): MsfSession | undefined {
    if (!this.state.currentSessionId) return undefined;
    return this.getSession(this.state.currentSessionId);
  }

  hasSessions(): boolean {
    return (this.state.sessions?.length || 0) > 0;
  }

  // ── Prompt Building ────────────────────────────────────────────────

  private buildPrompt(session: MsfSession): string {
    if (session.type === 'meterpreter') {
      return 'meterpreter > ';
    } else if (session.type === 'shell') {
      // Windows shell from meterpreter
      return 'C:\\Windows\\system32> ';
    }
    return '> ';
  }

  // ── State Management ──────────────────────────────────────────────

  private notifyStateChange(): void {
    this.onStateChange({ ...this.state });
  }

  getState(): MsfState {
    return { ...this.state };
  }

  // ── Integration with Exploit Results ───────────────────────────────

  /**
   * Process exploit result and create session if successful
   * Called by exploit command handler
   */
  handleExploitResult(result: ExploitResult, targetIp: string): ShellResult {
    if (!result.success || !result.sessionCreated) {
      return {
        output: result.output,
        isError: !result.success,
      };
    }

    // Create the session
    const session = this.createSession(
      result.sessionType || 'meterpreter',
      targetIp,
      result.targetInfo
    );

    // Auto-interact with new session (Metasploit default behavior)
    const interactResult = this.interactWithSession(session.id);

    return {
      output: result.output + '\n' + interactResult.output,
    };
  }
}

// ── Helper Functions ───────────────────────────────────────────────

/**
 * Format sessions list for 'sessions' command output
 */
export function formatSessionsList(
  sessions: MsfSession[],
  language: 'en' | 'es' = 'en'
): string {
  if (sessions.length === 0) {
    return language === 'es'
      ? 'Sesiones activas\n================\n\nNo hay sesiones activas.'
      : 'Active sessions\n===============\n\nNo active sessions.';
  }

  const header = language === 'es'
    ? 'Sesiones activas\n================\n\n  Id  Tipo         Información de conexión'
    : 'Active sessions\n===============\n\n  Id  Type         Connection Information';

  const rows = sessions.map(s => {
    const type = s.type === 'meterpreter' ? 'meterpreter' : 'shell';
    const target = `${s.targetIp} (${s.targetInfo?.computer || 'Unknown'})`;
    const status = s.isBackgrounded ? ' (backgrounded)' : '';
    return `  ${s.id.toString().padEnd(3)} ${type.padEnd(12)} ${target}${status}`;
  });

  return [header, ...rows, ''].join('\n');
}

/**
 * Create initial SessionManager instance
 */
export function createSessionManager(
  shellManager: ShellManager,
  state: MsfState,
  onStateChange: (state: MsfState) => void
): SessionManager {
  return new SessionManager(shellManager, state, onStateChange);
}
