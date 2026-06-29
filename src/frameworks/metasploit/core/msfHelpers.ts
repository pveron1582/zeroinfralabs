import type { CommandResponse } from '../../../types';
import type { MsfState } from './msfTypes';

export const withState = (output: string, state: MsfState): CommandResponse => ({
  output: `MSF_STATE:${JSON.stringify(state)}\n${output}`,
});

export const basePrompt = (): string => `msf6 > `;

export const modulePrompt = (path: string): string => {
  const short = path.split('/').slice(-2).join('/');
  const type  = path.startsWith('auxiliary') ? 'auxiliary' : 'exploit';
  return `msf6 ${type}(${short}) > `;
};
