// ── video/remotion/primitives/TitleScene.tsx ───────────────────────
// Título centrado con fade + slide. Para escenas de apertura/cierre.

import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME, MONO } from '../theme';

export const TitleScene: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  delay?: number;
  fontSize?: number;
}> = ({ title, subtitle, delay = 0, fontSize = 42 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const opacity = interpolate(frame - delay, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ opacity, transform: `translateY(${(1 - enter) * 20}px)` }}>
        <div style={{ fontSize, fontWeight: 800, color: THEME.text, fontFamily: MONO, lineHeight: 1.2 }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO, marginTop: 14 }}>
            {subtitle}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};