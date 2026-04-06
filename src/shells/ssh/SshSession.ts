// ── shells/ssh/SshSession.ts ──────────────────────────────────────
// Implementación modular del shell SSH con flujo interactivo real

import type { ShellSession, ShellContext, ShellResult } from '../ShellSession';

// ── Estado del shell SSH ──────────────────────────────────────────
export interface SshState {
  connected: boolean;
  targetIp?: string;
  targetId?: string;
  username?: string;
  authenticated: boolean;
  step: 'connecting' | 'password' | 'connected';
}

// ── Implementación del shell SSH ──────────────────────────────────
export const sshSession: ShellSession<SshState> = {
  name: 'ssh',

  getPrompt(state: SshState): string {
    if (state.step === 'password') {
      return `${state.username}@${state.targetIp}'s password: `;
    }
    return '';
  },

  createInitialState(args: string[], ctx: ShellContext): SshState {
    if (!args[0]) {
      return { connected: false, authenticated: false, step: 'connecting' };
    }

    const targetArg = args[0];
    const [user, ip] = targetArg.split('@');

    if (!user || !ip) {
      return { connected: false, authenticated: false, step: 'connecting' };
    }

    const target = ctx.allMachines.find(m => m.machine_info.ip === ip);
    if (!target) {
      return { connected: false, authenticated: false, step: 'connecting' };
    }

    const sshPort = target.scan_results.ports.find(
      p => p.service === 'ssh' && p.state === 'open'
    );
    if (!sshPort) {
      return { connected: false, authenticated: false, step: 'connecting' };
    }

    // Conexión establecida, esperando password
    return {
      connected: true,
      targetIp: ip,
      targetId: target.id,
      username: user,
      authenticated: false,
      step: 'password',
    };
  },

  executeCommand(input: string, state: SshState, ctx: ShellContext): { result: ShellResult; newState: SshState } {
    // ── Si no está conectado, manejar conexión ─────────────────────
    if (!state.connected) {
      const trimmedInput = input.trim();
      if (!trimmedInput) {
        return {
          result: { output: 'usage: ssh user@ip', isError: true },
          newState: state,
        };
      }

      const parts = trimmedInput.split(/\s+/);
      const targetArg = parts[0];
      const [user, ip] = targetArg.split('@');

      if (!user || !ip) {
        return {
          result: { output: 'usage: ssh user@ip', isError: true },
          newState: state,
        };
      }

      const target = ctx.allMachines.find(m => m.machine_info.ip === ip);
      if (!target) {
        return {
          result: { output: `ssh: connect to host ${ip} port 22: No route to host`, isError: true },
          newState: state,
        };
      }

      const sshPort = target.scan_results.ports.find(
        p => p.service === 'ssh' && p.state === 'open'
      );

      if (!sshPort) {
        return {
          result: { output: `ssh: connect to host ${ip} port 22: Connection refused`, isError: true },
          newState: state,
        };
      }

      return {
        result: { output: `${user}@${ip}'s password: ` },
        newState: {
          connected: true,
          targetIp: ip,
          targetId: target.id,
          username: user,
          authenticated: false,
          step: 'password',
        },
      };
    }

    // ── Esperando password ───────────────────────────────────────
    if (state.step === 'password') {
      const target = ctx.allMachines.find(m => m.id === state.targetId);

      if (!target) {
        return {
          result: { output: `Connection lost.`, isError: true, closeSession: true },
          newState: { ...state, connected: false, authenticated: false },
        };
      }

      const sshPort = target.scan_results.ports.find(
        p => p.service === 'ssh' && p.state === 'open'
      );

      if (!sshPort) {
        return {
          result: { output: `ssh: connect to host ${state.targetIp} port 22: Connection refused`, isError: true, closeSession: true },
          newState: { ...state, connected: false, authenticated: false },
        };
      }

      const password = input.trim();

      if (sshPort.credentials?.user === state.username && sshPort.credentials?.pass === password) {
        const atkIp = ctx.allMachines.find(m => m.id.includes('attacker'))?.machine_info.ip || '10.0.0.1';
        const osName = target.machine_info.os.includes('Windows')
          ? target.machine_info.os
          : `${target.machine_info.os} (GNU/Linux 5.15.0 x86_64)`;

        let output = `Warning: Permanently added '${state.targetIp}' (ECDSA) to list of known hosts.\n`;
        output += `Welcome to ${osName}\n\n`;
        output += `Last login: ${new Date().toLocaleString()} from ${atkIp}`;

        const canComplete = target.learning_steps.some(s => s.id === ctx.currentMissionId);

        return {
          result: {
            output,
            completedMissionId: canComplete ? ctx.currentMissionId : undefined,
            newMachineId: state.targetId,
            sshLoginUser: state.username,
            closeSession: true,
            sshSessionClosed: true,
            foundCredentials: {
              machineId: state.targetId!,
              user: state.username!,
              pass: password,
              file: '/etc/passwd',
              service: 'ssh',
              verified: true,
            },
          },
          newState: {
            ...state,
            authenticated: true,
            step: 'connected',
          },
        };
      }

      return {
        result: {
          output: `Permission denied, please try again.`,
          isError: true,
          closeSession: true,
          failedUser: state.username ? {
            machineId: state.targetId!,
            user: state.username,
          } : undefined,
        },
        newState: { ...state, connected: false, authenticated: false },
      };
    }

    // ── Fallback ──────────────────────────────────────────────────
    return {
      result: { output: `Connection lost.`, isError: true, closeSession: true },
      newState: { ...state, connected: false, authenticated: false },
    };
  },

  isActive(state: SshState): boolean {
    return state.connected && !state.authenticated;
  },
};
