// ── store/index.ts ─────────────────────────────────────────────────
// Re-exporta el store, types y selectors

export { useScenarioStore } from './scenarioStore';
export { selectScenario, selectMachines, selectMissions, selectActiveMachine, selectIsWebScenario } from './selectors';
export type { ScenarioState, Notification, FtpSessionState, AppView } from './types';
