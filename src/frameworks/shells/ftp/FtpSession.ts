// ── shells/ftp/FtpSession.ts ──────────────────────────────────────

import type { ShellSession, ShellContext, ShellResult } from '../ShellSession';
import { runFtpCommand } from './ftpCommands';

// ── Estado del shell FTP ──────────────────────────────────────────
export interface FtpState {
  connected: boolean;
  targetIp?: string;
  targetId?: string;
  username?: string;
  password?: string;
  loggedIn: boolean;
  step: 'connecting' | 'username' | 'password' | 'connected';
}

// ── Implementación del shell FTP ──────────────────────────────────
export const ftpSession: ShellSession<FtpState> = {
  name: 'ftp',

  // ── Prompt dinámico ────────────────────────────────────────────
  getPrompt(state: FtpState): string {
    if (state.step === 'username') {
      return `Name (${state.targetIp || 'localhost'}:${state.username || 'root'}): `;
    }
    if (state.step === 'password') {
      return 'Password: ';
    }
    return 'ftp> ';
  },

  // ── Estado inicial ─────────────────────────────────────────────
  createInitialState(args: string[], ctx: ShellContext): FtpState {
    if (args[0]) {
      const targetIp = args[0];
      const target = ctx.allMachines.find(m => m.machine_info.ip === targetIp);

      if (!target) {
        return { connected: false, loggedIn: false, step: 'connecting' };
      }

      const ftpPort = target.scan_results.ports.find(
        p => p.service === 'ftp' && p.state === 'open'
      );

      if (!ftpPort) {
        return { connected: false, loggedIn: false, step: 'connecting' };
      }

      return {
        connected: true,
        targetIp,
        targetId: target.id,
        loggedIn: false,
        step: 'username',
      };
    }

    return { connected: false, loggedIn: false, step: 'connecting' };
  },

  // ── Lógica principal ───────────────────────────────────────────
  executeCommand(
    input: string,
    state: FtpState,
    ctx: ShellContext
  ): { result: ShellResult; newState: FtpState } {

    const trimmedInput = input.trim();
    const parts = trimmedInput.split(/\s+/);

    // ── 1. Conexión inicial (ftp <ip>) ─────────────────────────────
    if (!state.connected) {
      if (!trimmedInput) {
        return {
          result: { output: `uso: ftp <hostname-or-ip>`, isError: true },
          newState: state,
        };
      }

      const targetIp = parts[0];
      const target = ctx.allMachines.find(m => m.machine_info.ip === targetIp);

      if (!target) {
        return {
          result: { output: `ftp: connect: Connection refused`, isError: true },
          newState: state,
        };
      }

      const ftpPort = target.scan_results.ports.find(
        p => p.service === 'ftp' && p.state === 'open'
      );

      if (!ftpPort) {
        return {
          result: { output: `ftp: connect: Connection refused`, isError: true },
          newState: state,
        };
      }

      return {
        result: {
          output: `Connected to ${targetIp}.\n220 (vsFTPd 3.0.3)\nName (${targetIp}:anonymous): `,
        },
        newState: {
          connected: true,
          targetIp,
          targetId: target.id,
          loggedIn: false,
          step: 'username',
        },
      };
    }

    // ── 2. Username ───────────────────────────────────────────────
    if (state.step === 'username') {
      const username = trimmedInput;
      const target = ctx.allMachines.find(m => m.id === state.targetId);
      const ftpPort = target?.scan_results.ports.find(
        p => p.service === 'ftp' && p.state === 'open'
      );
      const validUser = ftpPort?.credentials?.user;

      // Acepta anonymous (cualquier password) o el usuario configurado en el puerto
      if (username.toLowerCase() === 'anonymous' || (validUser && username === validUser)) {
        return {
          result: {
            output: `331 Please specify the password.`,
          },
          newState: {
            ...state,
            username: trimmedInput,
            step: 'password',
          },
        };
      }

      return {
        result: {
          output: `530 Login incorrect.\nftp: Login failed.`,
          isError: true,
          closeSession: true,
        },
        newState: { ...state, connected: false, loggedIn: false },
      };
    }

    // ── 3. Password ──────────────────────────────────────────────
    if (state.step === 'password') {
      const target = ctx.allMachines.find(m => m.id === state.targetId);
      const ftpPort = target?.scan_results.ports.find(
        p => p.service === 'ftp' && p.state === 'open'
      );
      const validPass = ftpPort?.credentials?.pass;
      const isAnonymous = state.username?.toLowerCase() === 'anonymous';

      // anonymous: acepta cualquier password (incluyendo vacía).
      // Usuario configurado (p. ej. ftpuser): exige la contraseña correcta.
      const authOk = isAnonymous || (validPass !== undefined && trimmedInput === validPass);

      if (authOk) {
        return {
          result: {
            output: `230 Login successful.\nRemote system type is UNIX.\nUsing binary mode to transfer files.`,
          },
          newState: {
            ...state,
            loggedIn: true,
            step: 'connected',
            password: trimmedInput,
          },
        };
      }

      return {
        result: {
          output: `530 Login incorrect.\nftp: Login failed.`,
          isError: true,
          closeSession: true,
        },
        newState: { ...state, connected: false, loggedIn: false },
      };
    }

    // ── 4. Comandos FTP (logueado) ────────────────────────────────
    if (state.loggedIn && state.connected) {
      return runFtpCommand(input, state, ctx);
    }

    // ── Fallback ──────────────────────────────────────────────────
    return {
      result: { output: `?Invalid command or not logged in`, isError: true },
      newState: state,
    };
  },

  // ── Mantener sesión activa ─────────────────────────────────────
  isActive(state: FtpState): boolean {
    return state.connected;
  },
};