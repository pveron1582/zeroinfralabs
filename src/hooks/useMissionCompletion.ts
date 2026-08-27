// ── hooks/useMissionCompletion.ts ──────────────────────────────────
// Wrapper de validateMission que se conecta al store para encontrar la
// misión activa y marcarla como completada cuando un comando la satisface.
// Extraído de useCommandRunner para separar lógica de misiones de la UI.

import { useScenarioStore } from '../store/scenarioStore';
import { validateMission } from '../utils/labValidator';
import type { CommandResponse } from '../types';

export function useMissionCompletion(onMissionComplete: (id: number) => void) {
  const checkMissionCompletion = (result: CommandResponse) => {
    const { missions } = useScenarioStore.getState();
    const activeMission = missions.find(m => m.status === 'active');
    if (activeMission?.validationCriteria && validateMission(result, activeMission)) {
      onMissionComplete(activeMission.id);
    }
  };

  return { checkMissionCompletion };
}
