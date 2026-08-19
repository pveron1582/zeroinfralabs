// ── video/remotion/primitives/RevealLine.tsx ───────────────────────
// Línea que aparece con fade + slide en el momento indicado (at).
// Para listas que se van llenando en sincronía con la narración.

import React from 'react';
import { interpolate, spring, useCurrentFrame } from 'remotion';
import { THEME, MONO } from '../theme';

export const RevealLine: React.FC<{
  at: number;
  fps: number;
  mark?: string;
  color?: string;
  children: React.ReactNode;
}> = ({ at, fps, mark = '✓', color = THEME.green, children }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      transform: `translateY(${(1 - enter) * 10}px)`,
      fontSize: 18, color: THEME.text, fontFamily: MONO, marginTop: 8,
    }}>
      <span style={{ color }}>{mark}</span> {children}
    </div>
  );
};
