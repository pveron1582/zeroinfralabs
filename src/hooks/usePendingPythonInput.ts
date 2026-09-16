// ── hooks/usePendingPythonInput.ts ──────────────────────────────────
// Maneja el estado intermedio de `python3 script.py` cuando el script
// queda esperando input(). Como los scripts del Academy son chicos y
// deterministas, la estrategia es re-ejecutar el script desde el inicio
// con la cola de entradas acumulada y mostrar solo el delta de salida
// (mismo espíritu que pendingSu: la terminal captura la próxima línea).

import { useState } from 'react';
import type { CommandResponse } from '../types';
import { cmd_python3 } from '../commands/builtin/python3';
import type { SessionRunnerDeps } from './useFtpSession';

export interface PendingPython {
  argv: string[];
  sourceName: string;
  inputs: string[];
  shownOutput: string;
}

export interface PythonInputResult {
  result: CommandResponse;
  delta: string;
  done: boolean;
}

interface UsePendingPythonOptions {
  sessionDeps: SessionRunnerDeps;
}

export function usePendingPythonInput({ sessionDeps }: UsePendingPythonOptions) {
  const [pendingPython, setPendingPython] = useState<PendingPython | null>(null);

  const handlePythonInput = (line: string): PythonInputResult | null => {
    if (!pendingPython) return null;
    const inputs = [...pendingPython.inputs, line];
    const d = sessionDeps;
    const result = cmd_python3.execute(pendingPython.argv, {
      machine: d.machine,
      allMachines: d.allMachines,
      currentMissionId: d.currentMissionId,
      currentDir: d.currentDir,
      terminalId: d.terminalId,
      language: d.language,
      umask: d.umask,
      setUmask: d.setUmask,
      env: d.env,
      setEnv: d.setEnv,
      pythonInputs: inputs,
    });
    // El script es determinista: el output nuevo es el sufijo que aún no
    // se mostró. Si cambia el prefijo (no debería), mostramos todo.
    const delta = result.output.startsWith(pendingPython.shownOutput)
      ? result.output.slice(pendingPython.shownOutput.length)
      : result.output;

    if (result.pythonPendingInput) {
      setPendingPython({ ...pendingPython, inputs, shownOutput: result.output });
    } else {
      setPendingPython(null);
    }
    return { result, delta, done: !result.pythonPendingInput };
  };

  return { pendingPython, setPendingPython, handlePythonInput };
}
