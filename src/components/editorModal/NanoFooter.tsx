// ── components/editorModal/NanoFooter.tsx ────────────────────────
// Footer de dos filas de atajos estilo GNU nano (elemento estático)

import type { ReactNode } from 'react';

function footerGroup(keys: Array<[string, string]>): ReactNode {
  return keys.map(([k, label], i) => (
    <span key={i} className="whitespace-nowrap">
      <span className="text-yellow-400">^{k}</span>
      <span className="text-black">{label}</span>
      {i < keys.length - 1 ? '\u00A0' : ''}
    </span>
  ));
}

const FOOTER_ROW1: Array<[string, string]> = [
  ['G', ' Help '],
  ['O', ' Write Out '],
  ['W', ' Where Is '],
  ['\\', ' Replace '],
  ['K', ' Cut '],
];

const FOOTER_ROW2: Array<[string, string]> = [
  ['U', ' Paste '],
  ['J', ' Justify '],
  ['C', ' Cursor Pos '],
  ['X', ' Exit '],
  ['T', ' To Spell '],
];

export function NanoFooter() {
  return (
    <div className="bg-gray-50 text-black text-[13px] border-t border-gray-300">
      <div className="px-2 py-0.5 flex flex-wrap gap-x-2 overflow-hidden">
        {footerGroup(FOOTER_ROW1)}
      </div>
      <div className="px-2 py-0.5 flex flex-wrap gap-x-2 overflow-hidden">
        {footerGroup(FOOTER_ROW2)}
      </div>
    </div>
  );
}
