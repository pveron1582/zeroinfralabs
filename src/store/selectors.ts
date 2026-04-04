// ── store/selectors.ts ─────────────────────────────────────────────────
// Memoized selectors for use with useShallow

import type { ScenarioState } from './types';

export const selectScenario = (state: ScenarioState) => state.currentScenario;
export const selectMachines = (state: ScenarioState) => state.machines;
export const selectMissions = (state: ScenarioState) => state.missions;
export const selectActiveMachine = (state: ScenarioState) => state.getActiveMachine();
export const selectIsWebScenario = (state: ScenarioState) => state.currentScenario.category === 'Web';
