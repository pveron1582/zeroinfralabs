// ── shells/ssh/SshSession.ts ──────────────────────────────────────
// Implementación modular del shell SSH

import type { ShellSession, ShellContext, ShellResult } from '../ShellSession';

// ── Estado del shell SSH ──────────────────────────────────────────
export interface SshState {
  connected: boolean;
  targetIp?: string;
  targetId?: string;
  user?: string;
  authenticated: boolean;
}

// ── Implementación del shell SSH ──────────────────────────────────
export const sshSession: ShellSession<SshState> = {
  name: 'ssh',

  getPrompt(state: SshState): string {
    if (state.authenticated && state.targetIp) {
      return `${state.user}@${state.targetIp}:~$ `;
    }
    return '';
  },

  createInitialState(args: string[], ctx: ShellContext): SshState {
    // Formato: ssh user@ip [password]
    if (!args[0]) {
      return { connected: false, authenticated: false };
    }

    const [userAtIp, password] = args;
    const [user, ip] = userAtIp.split('@');

    if (!user || !ip) {
      return { connected: false, authenticated: false };
    }

    const target = ctx.allMachines.find(m => m.machine_info.ip === ip);
    if (!target) {
      return { connected: false, authenticated: false };
    }

    const sshPort = target.scan_results.ports.find(
      p => p.service === 'ssh' && p.state === 'open'
    );
    if (!sshPort) {
      return { connected: false, authenticated: false };
    }

    // Verificar credenciales
    if (sshPort.credentials?.user === user && sshPort.credentials?.pass === password) {
      return {
        connected: true,
        targetIp: ip,
        targetId: target.id,
        user,
        authenticated: true,
      };
    }

    // Conexión establecida pero no autenticada
    return {
      connected: true,
      targetIp: ip,
      targetId: target.id,
      user,
      authenticated: false,
    };
  },

  executeCommand(input: string, state: SshState, ctx: ShellContext): { result: ShellResult; newState: SshState } {
    const parts = input.trim().split(/\s+/);
    const cmd = parts[0]?.toLowerCase() || '';

    // ── Si no está autenticado, manejar login ─────────────────────
    if (!state.authenticated) {
      // Si tenemos usuario pero no password, pedir password
      if (state.user && !state.authenticated) {
        const password = input.trim();
        const target = ctx.allMachines.find(m => m.id === state.targetId);
        const sshPort = target?.scan_results.ports.find(
          p => p.service === 'ssh' && p.state === 'open'
        );

        if (sshPort?.credentials?.user === state.user && sshPort?.credentials?.pass === password) {
          const atkIp = ctx.allMachines.find(m => m.id.includes('attacker'))?.machine_info.ip || '10.0.0.1';
          const output = `Warning: Permanently added '${state.targetIp}' (ECDSA) to list of known hosts.\n` +
            `Welcome to ${target?.machine_info.os || 'Linux'} (GNU/Linux 5.15.0 x86_64)\n\n` +
            `Last login: ${new Date().toLocaleString()} from ${atkIp}`;

          return {
            result: {
              output,
              newMachineId: state.targetId,
              foundCredentials: {
                machineId: state.targetId!,
                user: state.user!,
                pass: password,
                file: '/etc/passwd',
                service: 'ssh',
              },
            },
            newState: { ...state, authenticated: true },
          };
        }

        return {
          result: { output: `${state.user}@${state.targetIp}'s password:\nPermission denied, please try again.`, isError: true },
          newState: state,
        };
      }

      return {
        result: { output: 'Not connected.', isError: true, closeSession: true },
        newState: state,
      };
    }

    // ── Comandos SSH autenticados ──────────────────────────────────
    switch (cmd) {
      case 'exit':
      case 'quit':
      case 'logout': {
        return {
          result: { output: 'logout\nConnection to closed.', closeSession: true },
          newState: { ...state, connected: false, authenticated: false },
        };
      }

      case 'whoami': {
        return {
          result: { output: state.user || 'user' },
          newState: state,
        };
      }

      case 'pwd': {
        return {
          result: { output: `/home/${state.user}` },
          newState: state,
        };
      }

      case 'ls': {
        return {
          result: { output: `Desktop  Documents  Downloads  Music  Pictures  Videos` },
          newState: state,
        };
      }

      case 'hostname': {
        return {
          result: { output: state.targetIp || 'target' },
          newState: state,
        };
      }

      case 'id': {
        const uid = state.user === 'root' ? '0' : '1000';
        const gid = state.user === 'root' ? '0' : '1000';
        return {
          result: { output: `uid=${uid}(${state.user}) gid=${gid}(${state.user}) groups=${gid}(${state.user})` },
          newState: state,
        };
      }

      case 'uname': {
        if (parts.includes('-a')) {
          return {
            result: { output: `Linux ${state.targetIp} 5.15.0-generic #1 SMP x86_64 GNU/Linux` },
            newState: state,
          };
        }
        return {
          result: { output: 'Linux' },
          newState: state,
        };
      }

      case 'help':
      case '?': {
        return {
          result: {
            output: `Available commands:\n  whoami    Show current user\n  pwd       Print working directory\n  ls        List files\n  hostname  Show hostname\n  id        Show user/group IDs\n  uname     System information\n  exit      Logout`,
          },
          newState: state,
        };
      }

      default: {
        if (cmd) {
          return {
            result: { output: `${cmd}: command not found` },
            newState: state,
          };
        }
        return { result: { output: '' }, newState: state };
      }
    }
  },

  isActive(state: SshState): boolean {
    return state.connected && state.authenticated;
  },
};