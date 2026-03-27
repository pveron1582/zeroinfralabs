// ── commands/tools/nc.ts ───────────────────────────────────────
// Netcat (nc) - Network utility for reading and writing data across networks

import type { CommandContext, CommandResponse } from '../../types';

// Encuentra el step de "Setup Listener" por keyword en los learning_steps de todas
// las máquinas del escenario. Evita hardcodear completedMissionId: 4, lo que rompía
// si el escenario tenía nc en un orden distinto o si se usaba nc fuera del escenario LFI.
function findListenerMissionId(context: CommandContext): number | undefined {
  const LISTENER_KEYWORDS = ['listener', 'setup listener', 'escucha', 'nc -nlvp', 'netcat'];
  if (!Array.isArray(context.allMachines)) return undefined;
  for (const machine of context.allMachines) {
    const step = machine.learning_steps.find(s =>
      LISTENER_KEYWORDS.some(k =>
        s.task.toLowerCase().includes(k) || s.text.toLowerCase().includes(k)
      )
    );
    if (step && step.id === context.currentMissionId) return step.id;
  }
  return undefined;
}

// Función helper para parsear argumentos de forma flexible
function parseListenerMode(args: string[]): { isListener: boolean; port?: string; error?: string } {
  // Detectar si es modo listener (-l debe estar presente)
  const hasListener = args.some(arg => arg === '-l' || arg.startsWith('-') && arg.includes('l'));
  if (!hasListener) return { isListener: false };

  // Buscar el puerto: después de -p o como último argumento numérico
  let port: string | undefined;

  // Búsqueda 1: después de -p
  const pIdx = args.findIndex(arg => arg === '-p');
  if (pIdx >= 0 && pIdx + 1 < args.length) {
    port = args[pIdx + 1];
  }

  // Búsqueda 2: último argumento que sea un número (si no tiene -p)
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

  return { isListener: true, port };
}

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
  -p port         Specify port

Examples:
  nc -nlvp 4444           Listen on port 4444 (common for reverse shells)
  nc -lvnp 4444           (same, different order)
  nc target.com 80        Connect to target.com on port 80
  nc -l -p 9999           Listen on port 9999 (without verbose)`,
        isError: false,
      };
    }

    // Parsear modo listener con soporte a cualquier orden de argumentos
    const listenerResult = parseListenerMode(args);
    
    if (listenerResult.isListener) {
      if (listenerResult.error) {
        return {
          output: listenerResult.error,
          isError: true,
        };
      }

      const port = listenerResult.port!;

      // Buscar el step de listener dinámicamente en lugar de hardcodear id: 4.
      // completedMissionId: 4 rompía si nc se usaba en escenarios donde el paso
      // del listener no era el step 4, o si nc se ejecutaba fuera del contexto LFI.
      const listenerMissionId = findListenerMissionId(context);
      return {
        output: `listening on [any] ${port} ...`,
        isError: false,
        completedMissionId: listenerMissionId,
        blockingCommand: {
          message: `⏳ Escuchando en puerto ${port}... Presiona Ctrl+C para cancelar`,
          listeningPort: parseInt(port), // Guardar puerto para validación de payload
        },
      };
    }

    // Modo de conexión (connect mode)
    if (args.length >= 2 && !args[0].startsWith('-')) {
      const hostname = args[0];
      const port = args[1];

      if (isNaN(Number(port))) {
        return {
          output: `nc: bad port number`,
          isError: true,
        };
      }

      return {
        output: `(UNKNOWN) [${hostname}] ${port} (?) : Connection refused`,
        isError: true,
      };
    }

    return {
      output: `nc: missing arguments`,
      isError: true,
    };
  },
};
