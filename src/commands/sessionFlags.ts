// ── commands/sessionFlags.ts ──────────────────────────────────────
// "¿Hay sesión de Metasploit / PowerShell activa?" fuera del barrel.
//
// Estas dos livedaves estaban en `commands/index.ts`, así que
// `components/TerminalPrompt.tsx` (que se renderiza en el chunk del
// terminal) importaba el barrel entero para leer dos booleanos y arrastraba
// los ~113 módulos de comando. Acá viven con una sola dependencia (el
// store) y el barrel las re-exporta para no romper a los demás.

import { useScenarioStore } from '../store/scenarioStore';

export const isMsfActive = (): boolean => !!useScenarioStore.getState().msfState?.active;

export const isPsActive = (): boolean => !!useScenarioStore.getState().psState?.active;
