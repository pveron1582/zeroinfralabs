// ── hooks/processCommandResult.ts ──────────────────────────────────
// Dispatcher puro de los efectos secundarios de un CommandResponse:
// misiones, archivos, credenciales, identidades, sesiones, prompts.
// Extraído de useCommandRunner como función pura (sin React) para poder
// testearla y reutilizarla desde varios hooks.
//
// QUÉ hace cada campo vive en `responseHandlers.ts` (tabla exhaustiva del
// contrato, en orden de ejecución). Acá solo la API pública y el recorrido,
// que inyecta el pseudo-paso de validación de misiones. El estado del store
// se lee una sola vez por comando (antes: 13 getState()).

import type { Machine, CommandResponse, BlockingCommand } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { handlers, type DispatchCtx } from './responseHandlers';
import type { IdentityFrame } from './useIdentityStack';
import type { PendingSu } from './usePendingSu';
import type { PendingPython } from './usePendingPythonInput';

export interface HistoryEntry {
  command: string | null;
  output?: string;
  lines?: string[];
  streaming: boolean;
  prompt?: string;
  timestamp: number;
  result?: CommandResponse;
  lineDelays?: number[];
}

/** Entrada de bienvenida (historial vacío al montar / resetear). */
export const makeWelcome = (_machines: Machine[]): HistoryEntry => ({
  command: null, streaming: false,
  output: '',
  timestamp: Date.now(),
});

export interface ProcessDeps {
  machine: Machine;
  allMachines: Machine[];
  currentDir: string;
  setCurrentDir: (dir: string) => void;
  pushIdentity: (frame: IdentityFrame) => void;
  popIdentity: () => boolean;
  checkMissionCompletion: (result: CommandResponse) => void;
  onMissionComplete: (id: number) => void;
  onChangeMachine: (id: string) => void;
  onCredentialsFound: (machineId: string, user: string, pass: string, file?: string, service?: string) => void;
  onVerifyCredentials?: (machineId: string, service?: string) => void;
  onFailedUser?: (machineId: string, user: string) => void;
  onSudoPrivileges?: (machineId: string, user: string, commands: string[], canSudo: boolean) => void;
  setBlockingCommand: (bc: BlockingCommand | null) => void;
  setListeningPort: (port: number | null) => void;
  setNanoFile: (f: NonNullable<CommandResponse['nanoFile']> | null) => void;
  setBusy: (busy: boolean) => void;
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  setPendingSu: React.Dispatch<React.SetStateAction<PendingSu | null>>;
  setPendingPython: React.Dispatch<React.SetStateAction<PendingPython | null>>;
  reportVulnerability: (machineId: string, vulnId: string, status: string) => void;
  // Con terminalId el su vive en el frame local: NO se escribe el
  // machine.su_user compartido (aislamiento por terminal — HIGH #2).
  terminalId?: string;
}

// Re-export para no romper los imports del contrato de handlers.
export { handlers, type FieldHandlers, type DispatchCtx } from './responseHandlers';

/**
 * La validación de misiones no cuelga de ningún campo: es un pseudo-paso que
 * se inyecta justo después de `filesChanged` (el validador lee el FS).
 */
const MISSION_AFTER = 'filesChanged';

/** Aplica todos los side-effects declarados en un CommandResponse. */
export function processCommandResult(deps: ProcessDeps, result: CommandResponse, isStreaming: boolean) {
  const store = useScenarioStore.getState();
  const ctx: DispatchCtx = {
    deps, result, isStreaming, store,
    currentDir: deps.currentDir,
    machine: deps.machine,
    allMachines: deps.allMachines,
  };
  const table = handlers as unknown as Record<string, (value: unknown, ctx: DispatchCtx) => void>;
  const record = result as unknown as Record<string, unknown>;
  let validated = false;
  for (const field of Object.keys(table)) {
    if (field === MISSION_AFTER) {
      deps.checkMissionCompletion(result);
      validated = true;
    }
    table[field](record[field], ctx);
  }
  if (!validated) deps.checkMissionCompletion(result);
}
