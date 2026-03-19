// ── commands/tools/msfHelpers.ts ──────────────────────────────────
// Helper functions for MSF console

import type { CommandResponse } from '../../types';
import type { MsfState } from './msfTypes';

/**
 * Encode state in output so Terminal/index.ts can persist it.
 * Format: MSF_STATE:{json}\n{visible output}
 */
export const withState = (output: string, state: MsfState): CommandResponse => ({
  output: `MSF_STATE:${JSON.stringify(state)}\n${output}`,
});

/**
 * Generate base MSF prompt: "msf6 > "
 */
export const basePrompt = (): string => `msf6 > `;

/**
 * Generate module-specific prompt: "msf6 auxiliary(...) > " or "msf6 exploit(...) > "
 */
export const modulePrompt = (path: string): string => {
  const short = path.split('/').slice(-2).join('/');
  const type  = path.startsWith('auxiliary') ? 'auxiliary' : 'exploit';
  return `msf6 ${type}(${short}) > `;
};
