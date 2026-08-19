// ── video/remotion/primitives/KeyCapsule.tsx ───────────────────────
// Cápsula mono con valor coloreado + etiqueta debajo.
// Para descomponer prompts, comandos y flags.

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME, MONO } from '../theme';

export const KeyCapsule: React.FC<{
  label: string;
  value: string;
  accent: string;
  delay?: number;
  size?: number;
}> = ({ label, value, accent, delay = 0, size = 26 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        opacity: interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
        transform: `translateY(${(1 - enter) * 12}px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '14px 22px',
        background: THEME.panel,
        border: `2px solid ${accent}50`,
        borderRadius: 12,
        minWidth: 90,
        fontFamily: MONO,
      }}
    >
      <span style={{ fontSize: size, color: accent, fontWeight: 700 }}>{value}</span>
      <span style={{ fontSize: 13, color: THEME.muted }}>{label}</span>
    </div>
  );
};