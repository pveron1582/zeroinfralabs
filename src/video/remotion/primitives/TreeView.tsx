// ── video/remotion/primitives/TreeView.tsx ─────────────────────────
// Árbol de directorios estilo `tree`/`find`: connectors ASCII (├ └ │)
// en mono con fade por fila. Soporta resaltar la fila que el narrador
// está mencionando (rectángulo con glow + pop) y dejar marcadas las que
// ya pasaron (caja sutil persistente). El tamaño y profundidad aguantan
// cualquier filesystem.

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { THEME, MONO } from '../theme';

export interface TreeItem {
  label: string;
  icon?: string;
  desc?: string;
  color?: string;
  children?: TreeItem[];
}

interface FlatRow {
  indent: string;
  branch: string;
  icon?: string;
  label: string;
  desc?: string;
  color: string;
}

function flatten(items: TreeItem[], depth: number, ancestorMore: boolean[]): FlatRow[] {
  const rows: FlatRow[] = [];
  items.forEach((item, i) => {
    const last = i === items.length - 1;
    let indent = '';
    for (const more of ancestorMore) indent += more ? '│   ' : '    ';
    const branch = depth === 0 ? '' : last ? '└── ' : '├── ';
    rows.push({ indent, branch, icon: item.icon, label: item.label, desc: item.desc, color: item.color ?? THEME.text });
    if (item.children && item.children.length > 0) {
      rows.push(...flatten(item.children, depth + 1, [...ancestorMore, !last]));
    }
  });
  return rows;
}

export const TreeView: React.FC<{
  items: TreeItem[];
  start?: number;
  framesPerRow?: number;
  fontSize?: number;
  /** label de la fila que se está narrando ahora (rectángulo con glow) */
  highlight?: string | null;
  /** frame en que `highlight` se activó (para el pop) */
  highlightStart?: number;
  /** labels ya narrados (quedan con caja sutil persistente) */
  highlighted?: string[];
}> = ({
  items,
  start = 0,
  framesPerRow = 9,
  fontSize = 19,
  highlight = null,
  highlightStart = 0,
  highlighted = [],
}) => {
  const frame = useCurrentFrame();
  const rows = flatten(items, 0, []);

  return (
    <div style={{ fontFamily: MONO, fontSize, lineHeight: 1.7, whiteSpace: 'pre' }}>
      {rows.map((r, i) => {
        const delay = start + i * framesPerRow;
        const inPx = Math.max(0, Math.min(1, (frame - delay) / 8));
        const opacity = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
        const isCurrent = highlight === r.label;
        const isDone = highlighted.includes(r.label);
        const boxed = isCurrent || isDone;
        const pop = isCurrent
          ? interpolate(frame - highlightStart, [0, 8], [0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
          : 1;
        return (
          <div key={i} style={{ opacity, transform: `translateX(${(1 - inPx) * 14}px)` }}>
            <span style={{ color: THEME.border }}>{r.indent}</span>
            <span style={{ color: THEME.dim }}>{r.branch}</span>
            {boxed ? (
              <span
                style={{
                  display: 'inline-block',
                  padding: '0 8px',
                  borderRadius: 7,
                  border: `1.5px solid ${isCurrent ? r.color : r.color + '66'}`,
                  background: isCurrent ? r.color + '26' : r.color + '14',
                  boxShadow: isCurrent ? `0 0 16px ${r.color}66` : 'none',
                  transform: `scale(${pop})`,
                  transformOrigin: 'left center',
                }}
              >
                <span style={{ color: r.color, fontWeight: 700 }}>{r.icon ? r.icon + ' ' : ''}{r.label}</span>
              </span>
            ) : (
              <span style={{ color: r.color, fontWeight: 700 }}>{r.icon ? r.icon + ' ' : ''}{r.label}</span>
            )}
            {r.desc && <span style={{ color: THEME.muted }}>{'   ' + r.desc}</span>}
          </div>
        );
      })}
    </div>
  );
};
