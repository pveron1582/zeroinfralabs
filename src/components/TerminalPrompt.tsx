// ── components/TerminalPrompt.tsx ───────────────────────────────────────
import React from 'react';
import { isMsfActive } from '../commands';

interface PromptColors {
  user: string;
  at: string;
  host: string;
  colon: string;
  path: string;
  symbol: string;
  bracket: string;
  line: string;
}

export const defaultPromptColors: PromptColors = {
  user: '#7fffd4',
  at: '#7fffd4',
  host: '#7fffd4',
  colon: '#ffffff',
  path: '#ffffff',
  symbol: '#7fffd4',
  bracket: '#0000ff',
  line: '#0000ff',
};

export function isMsfPromptText(promptText: string): boolean {
  return (
    promptText.includes('msf6') ||
    promptText.includes('meterpreter') ||
    promptText.includes('C:\\Windows\\system32>')
  );
}

export function renderKaliPrompt(promptText: string, colors: PromptColors = defaultPromptColors) {
  if (isMsfPromptText(promptText)) {
    return <span style={{ color: colors.user }}>{promptText}</span>;
  }

  const match = promptText.match(/^([^@]+)@([^:]+):([^$#]+)([$#])$/);
  if (!match) {
    return <span style={{ color: colors.user }}>{promptText}</span>;
  }

  const [, user, host, path] = match;
  return (
    <span>
      <span style={{ color: colors.line }}>┌──(</span>
      <span style={{ color: colors.user }}>{user}</span>
      <span style={{ color: colors.at }}>㉿</span>
      <span style={{ color: colors.host }}>{host}</span>
      <span style={{ color: colors.line }}>)</span>
      <span style={{ color: colors.line }}>-[</span>
      <span style={{ color: colors.path }}>{path}</span>
      <span style={{ color: colors.line }}>]</span>
    </span>
  );
}

export function renderKaliPromptSymbol(promptText?: string, isRoot?: boolean, colors: PromptColors = defaultPromptColors) {
  const inMsf = promptText !== undefined ? isMsfPromptText(promptText) : isMsfActive();
  if (inMsf) {
    return <span style={{ color: colors.user }}>{'>'}</span>;
  }
  const symbol = promptText !== undefined
    ? (promptText.match(/([$#])$/)?.[1] || (isRoot ? '#' : '$'))
    : (isRoot ? '#' : '$');
  return (
    <span>
      <span style={{ color: colors.line }}>└─</span>
      <span style={{ color: colors.symbol }}>{symbol}</span>
    </span>
  );
}
