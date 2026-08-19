// ── video/remotion/fonts.ts ────────────────────────────────────────
// Inyecta JetBrains Mono (woff2 bundleado en /public/fonts) dentro de la
// composición. Se importa en cada composición para que ANDE en el render
// y en el <Player> del Academy. staticFile() resuelve la ruta en ambos.

import React from 'react';
import { staticFile } from 'remotion';

const FACE = `
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('${staticFile('fonts/jetbrains-mono/jetbrains-mono-400.woff2')}') format('woff2');
}
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('${staticFile('fonts/jetbrains-mono/jetbrains-mono-700.woff2')}') format('woff2');
}
`;

export const FontFace: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: FACE }} />
);