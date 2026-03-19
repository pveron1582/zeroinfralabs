import { SCENARIO_TEMPLATES, buildScenario } from './templates';
import type { Scenario } from '../types';

const config = SCENARIO_TEMPLATES.lfiRce({
  id: 'scenario-04',
  name: 'LFI to RCE Lab',
  networkRange: '192.168.20.0/24',
  flags: {
    root: 'THM{LFI_REVERSE_SHELL_PWNED}',
  },
});

export const scenario_04: Scenario = buildScenario(config);