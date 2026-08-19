// ── video/remotion/primitives/TerminalWindow.tsx ───────────────────
// Ventana de terminal con barra (puntitos rojo/ámbar/verde + título)
// y borde. Envuelve contenido con estética de terminal real.

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME, MONO } from '../theme';

export const TerminalWindow: React.FC<{
  title?: string;
  children?: React.ReactNode;
  delay?: number;
  width?: number;
}> = ({ title = 'kali@attacker-01:~$', children, delay = 0, width = 760 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const opacity = interpolate(frame - delay, [0, 12], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        width,
        maxWidth: '100%',
        opacity,
        transform: `translateY(${(1 - enter) * 24}px)`,
        background: THEME.bgAlt,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        fontFamily: MONO,
        boxShadow: '0 14px 44px rgba(0,0,0,0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: THEME.panel,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.red }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.amber }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.green }} />
        <span style={{ marginLeft: 8, fontSize: 13, color: THEME.dim }}>{title}</span>
      </div>
      <div style={{ padding: '20px 24px', fontSize: 20 }}>{children}</div>
    </div>
  );
};