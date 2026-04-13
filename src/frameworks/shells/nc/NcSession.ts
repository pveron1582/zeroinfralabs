// ── shells/nc/NcSession.ts ────────────────────────────────────────
// Implementación modular del shell Netcat (nc)

import type { ShellSession, ShellContext, ShellResult } from '../ShellSession';

// ── Estado del shell NC ───────────────────────────────────────────
export interface NcState {
  listening: boolean;
  port?: number;
  connected: boolean;
}

// ── Helper para parsear argumentos de listener ────────────────────
function parseListenerMode(args: string[]): { isListener: boolean; port?: number; error?: string } {
  const hasListener = args.some(arg => arg === '-l' || (arg.startsWith('-') && arg.includes('l')));
  if (!hasListener) return { isListener: false };

  let port: string | undefined;

  // Búsqueda 1: después de -p
  const pIdx = args.findIndex(arg => arg === '-p');
  if (pIdx >= 0 && pIdx + 1 < args.length) {
    port = args[pIdx + 1];
  }

  // Búsqueda 2: último argumento numérico
  if (!port) {
    for (let i = args.length - 1; i >= 0; i--) {
      if (!args[i].startsWith('-') && !isNaN(Number(args[i]))) {
        port = args[i];
        break;
      }
    }
  }

  if (!port) {
    return { isListener: true, error: 'nc: missing port specification' };
  }

  if (isNaN(Number(port))) {
    return { isListener: true, error: 'nc: bad port number' };
  }

  const portNum = Number(port);
  if (portNum < 1 || portNum > 65535) {
    return { isListener: true, error: `nc: port ${port} out of range` };
  }

  return { isListener: true, port: portNum };
}

// ── Implementación del shell NC ───────────────────────────────────
export const ncSession: ShellSession<NcState> = {
  name: 'nc',

  getPrompt(state: NcState): string {
    return '';
  },

  createInitialState(): NcState {
    return { listening: false, connected: false };
  },

  executeCommand(input: string, state: NcState, ctx: ShellContext): { result: ShellResult; newState: NcState } {
    const parts = input.trim().split(/\s+/);

    // Sin argumentos: mostrar uso
    if (parts.length === 0 || !parts[0]) {
      return {
        result: {
          output: `usage: nc [-options] hostname port
       nc -l [-options] port

General options:
  -l              Listen for incoming connection
  -n              Don't perform DNS lookups
  -v              Verbose (print commands before executing)
  -p port         Specify port

Examples:
  nc -nlvp 4444           Listen on port 4444 (common for reverse shells)
  nc -lvnp 4444           (same, different order)
  nc target.com 80        Connect to target.com on port 80
  nc -l -p 9999           Listen on port 9999 (without verbose)`,
          closeSession: true,
        },
        newState: state,
      };
    }

    // Parsear modo listener
    const listenerResult = parseListenerMode(parts);

    if (listenerResult.isListener) {
      if (listenerResult.error) {
        return {
          result: { output: listenerResult.error, isError: true, closeSession: true },
          newState: state,
        };
      }

      const port = listenerResult.port!;

      // NcSession ahora es libre - solo reporta el listener iniciado
      // El labValidator detectará el blockingCommand y validará la misión
      return {
        result: {
          output: `listening on [any] ${port} ...`,
          blockingCommand: {
            message: `⏳ Escuchando en puerto ${port}... Presiona Ctrl+C para cancelar`,
            listeningPort: port,
          },
        },
        newState: { listening: true, port, connected: false },
      };
    }

    // Modo conexión
    if (parts.length >= 2 && !parts[0].startsWith('-')) {
      const hostname = parts[0];
      const port = parts[1];

      if (isNaN(Number(port))) {
        return {
          result: { output: `nc: bad port number`, isError: true, closeSession: true },
          newState: state,
        };
      }

      return {
        result: {
          output: `(UNKNOWN) [${hostname}] ${port} (?) : Connection refused`,
          isError: true,
          closeSession: true,
        },
        newState: state,
      };
    }

    return {
      result: { output: `nc: missing arguments`, isError: true, closeSession: true },
      newState: state,
    };
  },

  isActive(state: NcState): boolean {
    return state.listening || state.connected;
  },
};