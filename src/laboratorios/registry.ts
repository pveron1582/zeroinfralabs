// ── laboratorios/registry.ts ──────────────────────────────────────
// REGISTRO de escenarios: la tabla que el store consulta, sin importar los
// labs. Antes `scenarioSlice` importaba `SCENARIOS` directo, con lo cual
// cualquier test del store cargaba los 8 labs (y toda la capa de scenarios).
//
// Es una hoja: solo importa tipos. Quien tiene los datos se registra:
//
//   import { registerScenarios } from './registry';
//   registerScenarios([...SCENARIOS], { testId: TEST_SCENARIO.id });
//
// `laboratorios/laboratorios.ts` lo hace al importarse, así que cualquier
// componente que ya importe los labs (LandingPage, LabGrid, ScenarioLauncher)
// deja el registro poblado sin cambiar una línea.

import type { Scenario } from '../types';

export const SCENARIO_REGISTRY = new Map<string, Scenario>();
let defaultScenarioId: string | undefined;
let testScenarioId: string | undefined;

/** Registra escenarios. El primero es el que abre la app por defecto. */
export function registerScenarios(scenarios: Scenario[], options: { testId?: string } = {}): void {
  for (const scenario of scenarios) SCENARIO_REGISTRY.set(scenario.id, scenario);
  defaultScenarioId ??= scenarios[0]?.id;
  testScenarioId ??= options.testId;
}

/** Todos los escenarios registrados, en orden de registro. */
export function listScenarios(): Scenario[] {
  return [...SCENARIO_REGISTRY.values()];
}

/** Busca por id. El escenario de test responde a su id y a su alias. */
export function findScenario(id: string): Scenario | undefined {
  if (SCENARIO_REGISTRY.has(id)) return SCENARIO_REGISTRY.get(id);
  if (id === 'test' && testScenarioId) return SCENARIO_REGISTRY.get(testScenarioId);
  return undefined;
}

/** Alias con el que se pide el escenario de test (compatibilidad). */
export const TEST_SCENARIO_ALIAS = 'test';

/** El escenario por defecto, o undefined si no registró ninguno. */
export function defaultScenario(): Scenario | undefined {
  return defaultScenarioId ? SCENARIO_REGISTRY.get(defaultScenarioId) : undefined;
}

export function hasScenarios(): boolean {
  return SCENARIO_REGISTRY.size > 0;
}
