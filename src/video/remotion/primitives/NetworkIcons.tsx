// ── video/remotion/primitives/NetworkIcons.tsx ─────────────────────
// Iconos SVG de red: patchcord (cable con conectores, parametrizable por
// color: cobre/fibra), cable de fibra y router como disco/cilindro
// aplanado con flechas. Reutilizados por las composiciones.

import React from 'react';
import { THEME } from '../theme';

export const PatchCord: React.FC<{ width?: number; color?: string }> = ({ width = 168, color = THEME.cyan }) => {
  const height = Math.round((width * 32) / 168);
  return (
    <svg width={width} height={height} viewBox="0 0 168 32">
      <line x1={18} y1={16} x2={150} y2={16} stroke={color} strokeWidth={6} strokeLinecap="round" />
      <rect x={6} y={10} width={14} height={12} rx={2} fill={color} />
      <rect x={9} y={6} width={8} height={4} rx={1} fill={color} opacity={0.75} />
      <rect x={148} y={10} width={14} height={12} rx={2} fill={color} />
      <rect x={151} y={6} width={8} height={4} rx={1} fill={color} opacity={0.75} />
    </svg>
  );
};

export const FiberCable: React.FC<{ width?: number }> = ({ width = 210 }) => {
  const height = Math.round((width * 40) / 210);
  return (
    <svg width={width} height={height} viewBox="0 0 210 40">
      <line x1={16} y1={21} x2={194} y2={21} stroke={THEME.cyan} strokeWidth={7} strokeLinecap="round" />
      <line x1={42} y1={21} x2={78} y2={21} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
      <line x1={132} y1={21} x2={168} y2={21} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />
      <rect x={2} y={14} width={14} height={14} rx={2} fill={THEME.cyan} opacity={0.45} />
      <rect x={194} y={14} width={14} height={14} rx={2} fill={THEME.cyan} opacity={0.45} />
    </svg>
  );
};

export const RouterDisc: React.FC<{ width?: number }> = ({ width = 64 }) => {
  const height = Math.round((width * 48) / 64);
  return (
    <svg width={width} height={height} viewBox="0 0 64 48">
      <rect x={8} y={16} width={48} height={22} rx={8} fill={THEME.green} opacity={0.22} />
      <ellipse cx={32} cy={17} rx={26} ry={9} fill={THEME.green} />
      <ellipse cx={32} cy={37} rx={26} ry={9} fill={THEME.green} opacity={0.6} />
      <path d="M18 17 h28 M46 17 l-6 -5 M46 17 l-6 5" stroke={THEME.bg} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 17 h-28 M18 17 l6 -5 M18 17 l6 5" stroke={THEME.bg} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};