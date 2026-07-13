// ── Theme tokens for marketing pages ────────────────────────────

import { useScenarioStore } from '../../store/scenarioStore';

export const FONT_SANS = "'Inter', system-ui, -apple-system, sans-serif";
export const FONT_MONO = "'Cascadia Code', 'Fira Code', 'Consolas', monospace";

// ── Color tokens ────────────────────────────────────────────────
export interface ColorTokens {
  readonly emerald: string;
  readonly emeraldDark: string;
  readonly cyan: string;
  readonly heroBg: string;
  readonly heroBgSoft: string;
  readonly pageBg: string;
  readonly sectionBg: string;
  readonly sectionAlt: string;
  readonly text: string;
  readonly textMuted: string;
  readonly border: string;
  readonly borderDark: string;
}

export const colorsLight = {
  emerald:       '#10b981',
  emeraldDark:   '#047857',
  cyan:          '#0891b2',
  heroBg:        '#0f172a',
  heroBgSoft:    '#1e293b',
  pageBg:        '#ffffff',
  sectionBg:     '#f8fafc',
  sectionAlt:    '#f1f5f9',
  text:          '#0f172a',
  textMuted:     '#64748b',
  border:        '#e2e8f0',
  borderDark:    '#334155',
} as const;

export const colorsDark = {
  emerald:       '#10b981',
  emeraldDark:   '#047857',
  cyan:          '#0891b2',
  heroBg:        '#030712',
  heroBgSoft:    '#0f172a',
  pageBg:        '#0a0e14',
  sectionBg:     '#0f172a',
  sectionAlt:    '#11161f',
  text:          '#e2e8f0',
  textMuted:     '#94a3b8',
  border:        '#1e293b',
  borderDark:    '#334155',
} as const;

export const GOBUSTER_DEMO = {
  command: 'gobuster dir -u http://192.168.1.11 -w common.txt',
  outputLines: [
    '==============================================================',
    'Gobuster v3.6',
    'by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)',
    '==============================================================',
    '[+] Url:          http://192.168.1.11',
    '[+] Method:       GET',
    '[+] Threads:      10',
    '[+] Wordlist:     common.txt',
    '==============================================================',
    '/wp-admin             (Status: 301)',
    '/wp-content           (Status: 301)',
    '/wp-includes          (Status: 301)',
    '==============================================================',
    'Progress: 4612 / 4612 (100.00%)',
  ],
  outputDelays: [200, 180, 180, 180, 200, 180, 180, 180, 200, 300, 300, 300, 200, 400],
} as const;

// ── Get theme colors by name ────────────────────────────────────
export function getThemeColors(theme: 'light' | 'dark'): ColorTokens {
  return theme === 'dark' ? colorsDark : colorsLight;
}

// ── React hook to consume current theme colors ──────────────────
export function useColors(): ColorTokens {
  const theme = useScenarioStore((s) => s.theme);
  return getThemeColors(theme);
}
