// ── video/remotion/primitives/Typewriter.tsx ───────────────────────
// Escribe texto carácter a carácter con cursor parpadeante.
// frame relativo a la Sequence donde se usa.

import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { CSSProperties } from 'react';
import { THEME } from '../theme';

export const Typewriter: React.FC<{
  text: string;
  start?: number;
  charsPerSecond?: number;
  color?: string;
  fontSize?: number;
  cursorColor?: string;
  style?: CSSProperties;
}> = ({ text, start = 0, charsPerSecond = 18, color = THEME.text, fontSize, cursorColor = THEME.cyan, style }) => {
  const frame = useCurrentFrame();
  const shown = Math.max(0, Math.min(text.length, Math.floor((frame - start) * (charsPerSecond / 30))));
  const done = shown >= text.length;
  const blink = Math.floor(frame / 30) % 2 === 0;
  const cursor = !done || blink ? '▌' : ' ';

  return (
    <span style={{ color, fontSize, whiteSpace: 'pre-wrap', ...style }}>
      {text.slice(0, shown)}
      <span style={{ color: cursorColor }}>{cursor}</span>
    </span>
  );
};