// ── video/remotion/theme.ts ────────────────────────────────────────
// Paleta única de los videos (misma del sitio) + fuente mono bundleada.
// JetBrains Mono vive en /public/fonts/ para que el render NO dependa de
// fuentes instaladas en la máquina que renderiza.

export const THEME = {
  bg: '#0b1015',
  bgAlt: '#050a08',
  panel: '#0d1117',
  border: '#1c2a2a',
  green: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  purple: '#a78bfa',
  red: '#ef4444',
  text: '#e5e7eb',
  muted: '#9ca3af',
  dim: '#6b7280',
} as const;

export const MONO = "'JetBrains Mono','Cascadia Code','Fira Code',Consolas,monospace";