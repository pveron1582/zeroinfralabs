// ── components/TerminalPrompt.tsx ───────────────────────────────────────
// Sin el barrel: TerminalPrompt va en el chunk del terminal y arrastrar los
// ~113 módulos de comando por dos booleanos rompe el code splitting.
import { isMsfActive, isPsActive } from '../commands/sessionFlags';

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

/** Prompt PowerShell (PS C:\...>): el símbolo > ya va incluido. */
export function isPsPromptText(promptText: string): boolean {
  return promptText.startsWith('PS ');
}

/** Prompt estilo cmd.exe (C:\..., D:\...): el símbolo ya va incluido. */
export function isWinPromptText(promptText: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(promptText);
}

/**
 * Prompt de UNA sola línea (PowerShell `PS C:\...>` y cmd.exe `C:\...>`).
 * Para estos el prompt y la línea de input/commando van en el MISMO renglón;
 * renderizarlos en dos filas deja el prompt suelto arriba y el texto a
 * escribir un renglón abajo (reporte de la terminal PowerShell).
 */
export function isOneLinePrompt(promptText?: string): boolean {
  if (!promptText) return false;
  return isPsPromptText(promptText) || isWinPromptText(promptText);
}

export function renderKaliPrompt(promptText: string, colors: PromptColors = defaultPromptColors) {
  if (isPsPromptText(promptText)) {
    return <span style={{ color: colors.user }}>{promptText}</span>;
  }
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
  const inPs = promptText !== undefined ? isPsPromptText(promptText) : isPsActive();
  if (inPs) {
    // PS prompt already ends with '>'
    return null;
  }
  const inMsf = promptText !== undefined ? isMsfPromptText(promptText) : isMsfActive();
  if (inMsf) {
    return <span style={{ color: colors.user }}>{'>'}</span>;
  }
  // Prompt win (C:\Users\x>): el símbulo > / # ya está en promptText.
  if (promptText !== undefined && isWinPromptText(promptText)) {
    return null;
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
