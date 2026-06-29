import { scenario_01 as laboratorio_01, scenario01Data } from './laboratorio01';
import { scenario_02 as laboratorio_02, scenario02Data } from './laboratorio02';
import { scenario_03 as laboratorio_03, SCENARIO_TEMPLATES_ETERNAL } from './laboratorio03';
import { scenario_04 as laboratorio_04, SCENARIO_TEMPLATES_LFI } from './laboratorio04';
import { scenario_05 as laboratorio_05, scenario05Data, SCENARIO_TEMPLATES } from './laboratorio05';
import { scenario_06 as laboratorio_06, scenario06Data } from './laboratorio06';

export const SCENARIOS = [laboratorio_01, laboratorio_02, laboratorio_03, laboratorio_04, laboratorio_05];

// Hidden test scenario - not visible in main menu
export const TEST_SCENARIO = laboratorio_06;
export const TEST_SCENARIO_DATA = scenario06Data;

// Export metadata for dynamic LandingPage cards
export const SCENARIOS_META = [
  { id: scenario01Data.id, tagline: scenario01Data.tagline, taglineEs: scenario01Data.taglineEs, description: scenario01Data.description, descriptionEs: scenario01Data.descriptionEs, tools: scenario01Data.tools, accentColor: scenario01Data.accentColor },
  { id: scenario02Data.id, tagline: scenario02Data.tagline, taglineEs: scenario02Data.taglineEs, description: scenario02Data.description, descriptionEs: scenario02Data.descriptionEs, tools: scenario02Data.tools, accentColor: scenario02Data.accentColor },
  { tagline: SCENARIO_TEMPLATES_ETERNAL.eternalBlue().tagline, taglineEs: SCENARIO_TEMPLATES_ETERNAL.eternalBlue().taglineEs, description: SCENARIO_TEMPLATES_ETERNAL.eternalBlue().description, descriptionEs: SCENARIO_TEMPLATES_ETERNAL.eternalBlue().descriptionEs, tools: SCENARIO_TEMPLATES_ETERNAL.eternalBlue().tools, accentColor: SCENARIO_TEMPLATES_ETERNAL.eternalBlue().accentColor },
  { tagline: SCENARIO_TEMPLATES_LFI.lfiRce().tagline, taglineEs: SCENARIO_TEMPLATES_LFI.lfiRce().taglineEs, description: SCENARIO_TEMPLATES_LFI.lfiRce().description, descriptionEs: SCENARIO_TEMPLATES_LFI.lfiRce().descriptionEs, tools: SCENARIO_TEMPLATES_LFI.lfiRce().tools, accentColor: SCENARIO_TEMPLATES_LFI.lfiRce().accentColor },
  { id: scenario05Data.id, tagline: scenario05Data.tagline, taglineEs: scenario05Data.taglineEs, description: scenario05Data.description, descriptionEs: scenario05Data.descriptionEs, tools: scenario05Data.tools, accentColor: scenario05Data.accentColor },
];
