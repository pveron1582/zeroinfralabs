// ── exercises/exercise02.ts ───────────────────────────────────────
// Scenario 2 — SSH Brute Force Lab
// Usa el template de SSH Brute Force

import { SCENARIO_TEMPLATES, buildScenario } from './templates';
import type { Scenario } from '../types';

const config = SCENARIO_TEMPLATES.sshBrute({
  id: 'scenario-02',
  name: 'SSH Brute Force Lab',
  networkRange: '10.10.10.0/24',
  flags: {
    root: 'THM{SSH_BRUTE_FORCE_SUCCESS}',
  },
  credentials: {
    user: 'root',
    pass: 'toor',
  },
});

export const scenario_02: Scenario = buildScenario(config);
