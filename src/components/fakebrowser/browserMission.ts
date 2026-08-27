// ── components/fakebrowser/browserMission.ts ────────────────────────
// Puente FakeBrowser → LabValidator: emite acciones del navegador como
// metadata browserAction y las valida contra la misión activa, igual que
// useMissionCompletion lo hace con los comandos. Reemplaza los IDs mágicos
// de misión que vivían hardcodeados en FakeBrowser y los fakesites
// (ver mejoras_glm.md P1-7).

import { useScenarioStore } from '../../store/scenarioStore';
import { validateMission } from '../../utils/labValidator';
import type { BrowserActionData, CommandResponse } from '../../types';

export type BrowserAction = BrowserActionData['action'];

/**
 * Emite una acción del navegador y la valida contra la misión activa
 * (criterio browserAction).
 *
 * @returns el id de la misión activa si la acción satisface sus criterios,
 *          o null si no hay misión activa de navegador o no coinciden.
 */
export function emitBrowserAction(
  action: BrowserAction,
  opts: { url: string; machineId: string }
): number | null {
  const { missions } = useScenarioStore.getState();
  const activeMission = missions.find(m => m.status === 'active');
  if (!activeMission?.validationCriteria || activeMission.validationCriteria.type !== 'browserAction') {
    return null;
  }

  const result: CommandResponse = {
    output: '',
    browserAction: { action, url: opts.url, machineId: opts.machineId },
  };
  return validateMission(result, activeMission) ? activeMission.id : null;
}