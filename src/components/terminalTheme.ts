// ── components/terminalTheme.ts ───────────────────────────────────
// Colores del prompt/salida: tema Kali por defecto + PowerShell clásico.

export const promptColors = {
  user: '#7fffd4',
  at: '#7fffd4',
  host: '#7fffd4',
  colon: '#ffffff',
  path: '#ffffff',
  symbol: '#7fffd4',
  bracket: '#0000ff',
  line: '#0000ff',
};

/** Tema clásico de Windows PowerShell: fondo azul #012456, texto blanco. */
export const PS_PROMPT_COLORS = {
  user: '#ffffff',
  at: '#ffffff',
  host: '#ffffff',
  colon: '#ffffff',
  path: '#ffffff',
  symbol: '#ffffff',
  bracket: '#ffffff',
  line: '#ffffff',
};

export const PS_BG = '#012456';
export const CMD_BG = '#0c0c0c';
export const PS_TEXT = '#ffffff';
