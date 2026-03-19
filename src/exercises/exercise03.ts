// ── exercises/exercise03.ts ───────────────────────────────────────
// Scenario 3 — EternalBlue / MS17-010 Windows 7
// Usa el template de EternalBlue

import { SCENARIO_TEMPLATES, buildScenario } from './templates';
import type { Scenario } from '../types';

const config = SCENARIO_TEMPLATES.eternalBlue({
  id: 'scenario-03',
  name: 'EternalBlue — MS17-010',
  networkRange: '172.16.0.0/24',
  flags: {
    root: 'THM{ETERNALBLUE_SYSTEM_PWNED}',
  },
});

export const scenario_03: Scenario = buildScenario(config);
