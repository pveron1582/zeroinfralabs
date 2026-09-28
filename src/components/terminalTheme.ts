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
export const PS_TEXT = '#ffffff';

/**
 * Terminal del escritorio Windows/RDP (la que se abre en una ventana):
 * azul oscuro de consola y texto blanco, siempre — también con una sesión de
 * cmd.exe, porque la ventana se titula "Windows PowerShell". No depende del
 * tema de Kali: el texto va en blanco (PS_PROMPT_COLORS / WIN_TERM_FG).
 */
export const WIN_TERM_FG = '#ffffff';
