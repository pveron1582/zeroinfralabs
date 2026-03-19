// ── exercises/exercise01.ts ───────────────────────────────────────
// Scenario 1 — WordPress Vulnerable Lab
// Usa el template de WordPress para reducir código duplicado

import { SCENARIO_TEMPLATES, buildScenario } from './templates';
import type { Scenario } from '../types';

const config = SCENARIO_TEMPLATES.wordpress({
  id: 'scenario-01',
  name: 'WordPress Vulnerable Lab',
  networkRange: '192.168.1.0/24',
  wpVersion: '6.0',
  flags: {
    user: 'THM{USER_ACCESS_GRANTED}',
    root: 'THM{ROOT_ACCESS_ACHIEVED}',
  },
  credentials: {
    user: 'admin',
    pass: 'P@ssw0rd123!',
  },
});

export const scenario_01: Scenario = buildScenario(config);
