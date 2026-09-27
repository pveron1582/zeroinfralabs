// ── shells/rdp/RdpSession.ts ──────────────────────────────────────
// Sesión RDP interactiva (PLAN_WINDOWS W5): autentica con credenciales
// al estilo SSH y, si son correctas, emite desktopAction.connect.

import type { ShellSession, ShellContext, ShellResult } from '../ShellSession';
import type { DesktopActionData } from '../../../types';
import { getKnownPassword } from '../../../utils/credentials';

// ── Estado de la sesión RDP ───────────────────────────────────────
export interface RdpState {
  connected: boolean;
  targetIp?: string;
  targetId?: string;
  username?: string;
  authenticated: boolean;
  step: 'connecting' | 'username' | 'password' | 'connected';
  /** Cliente que abrió la sesión (mstsc | xrdp) para sus mensajes. */
  clientName?: string;
}

function findRdpTarget(target: string, ctx: ShellContext) {
  return ctx.allMachines.find(m =>
    m.machine_info.ip === target ||
    m.machine_info.hostname.toLowerCase() === target.toLowerCase() ||
    (m.win?.computerName || '').toLowerCase() === target.toLowerCase(),
  );
}

function findOpenRdpPort(machine: ReturnType<typeof findRdpTarget>) {
  if (!machine) return undefined;
  return machine.scan_results.ports.find(p => p.port === 3389 && p.state === 'open');
}

/** Cliente que abrió la sesión, para los mensajes de error de RDP. */
function clientOf(state: RdpState): string {
  return state.clientName ?? 'mstsc';
}

// ── Implementación del shell RDP ──────────────────────────────────
export const rdpSession: ShellSession<RdpState> = {
  name: 'rdp',

  getPrompt(state: RdpState): string {
    if (state.step === 'username') {
      return `Usuario (${state.targetIp || 'localhost'}): `;
    }
    if (state.step === 'password') {
      return `${state.username ?? ''}@${state.targetIp ?? ''}'s password: `;
    }
    return '';
  },

  // args: [target] o [target, username] (el comando ya validó el host)
  createInitialState(args: string[], ctx: ShellContext): RdpState {
    const targetArg = args[0];
    const username = args[1];
    const clientName = ctx.clientName;
    if (!targetArg) {
      return { connected: false, authenticated: false, step: 'connecting', clientName };
    }

    const target = findRdpTarget(targetArg, ctx);
    const rdpPort = findOpenRdpPort(target);
    if (!target || !rdpPort) {
      return { connected: false, authenticated: false, step: 'connecting', clientName };
    }

    return {
      connected: true,
      targetIp: target.machine_info.ip,
      targetId: target.id,
      username: username || undefined,
      authenticated: false,
      step: username ? 'password' : 'username',
      clientName,
    };
  },

  executeCommand(
    input: string,
    state: RdpState,
    ctx: ShellContext,
  ): { result: ShellResult; newState: RdpState } {
    const trimmed = input.trim();

    // ── Conexión inicial sin args (fallback) ──────────────────────
    if (!state.connected) {
      if (!trimmed) {
        return {
          result: { output: `Uso: ${clientOf(state)} /v:<ip-o-hostname> [/u:<usuario>]`, isError: true },
          newState: state,
        };
      }
      const target = findRdpTarget(trimmed.split(/\s+/)[0], ctx);
      const rdpPort = findOpenRdpPort(target);
      if (!target || !rdpPort) {
        return {
          result: {
            output: `${clientOf(state)}: no se pudo conectar a ${trimmed} — el puerto RDP no está abierto.`,
            isError: true,
          },
          newState: state,
        };
      }
      return {
        result: { output: '' },
        newState: {
          connected: true,
          targetIp: target.machine_info.ip,
          targetId: target.id,
          authenticated: false,
          step: 'username',
          clientName: state.clientName,
        },
      };
    }

    // ── Revalidar puerto abierto ──────────────────────────────────
    const target = ctx.allMachines.find(m => m.id === state.targetId);
    const rdpPort = findOpenRdpPort(target);
    if (!target || !rdpPort) {
      return {
        result: {
          output: `${clientOf(state)}: no se pudo conectar a ${state.targetIp} — el puerto RDP no está abierto.`,
          isError: true,
          closeSession: true,
        },
        newState: { ...state, connected: false, authenticated: false },
      };
    }

    // ── Paso 1: usuario ───────────────────────────────────────────
    if (state.step === 'username') {
      if (!trimmed) {
        return {
          result: { output: 'Usuario vacío.', isError: true },
          newState: state,
        };
      }
      return {
        result: { output: '' },
        newState: { ...state, username: trimmed, step: 'password' },
      };
    }

    // ── Paso 2: password → auth ───────────────────────────────────
    if (state.step === 'password') {
      const password = trimmed;
      const portCredOk =
        rdpPort.credentials?.user === state.username &&
        rdpPort.credentials?.pass === password;
      const knownPass = getKnownPassword(target, state.username ?? '');

      if (portCredOk || (knownPass !== undefined && knownPass === password)) {
        const desktopAction: DesktopActionData = {
          action: 'connect',
          machineId: target.id,
          ip: target.machine_info.ip,
        };
        return {
          result: {
            output: `Conectando a ${target.machine_info.ip}...\nEstableciendo sesión de Escritorio remoto.`,
            desktopAction,
            closeSession: true,
            foundCredentials: {
              machineId: target.id,
              user: state.username!,
              pass: password,
              file: 'RDP',
              service: 'rdp',
            },
          },
          newState: { ...state, authenticated: true, step: 'connected' },
        };
      }

      return {
        result: {
          output: 'Permission denied, please try again.',
          isError: true,
          closeSession: true,
          failedUser: state.username
            ? { machineId: target.id, user: state.username }
            : undefined,
        },
        newState: { ...state, connected: false, authenticated: false },
      };
    }

    return {
      result: { output: 'Connection lost.', isError: true, closeSession: true },
      newState: { ...state, connected: false, authenticated: false },
    };
  },

  isActive(state: RdpState): boolean {
    return state.connected && !state.authenticated;
  },
};
