// ── video/remotion/fonts.ts ────────────────────────────────────────
// Inyecta JetBrains Mono dentro de la composición. Se importa en cada
// composición para que ANDE en el studio y en el render (el <Player> del
// Academy no se usa: las video-lecciones son un <video> apuntando al CDN).
// staticFile() resuelve contra el publicDir de Remotion — media/, ver
// remotion.config.ts — por eso los woff2 están también en
// media/fonts/jetbrains-mono/: copia byte a byte de public/fonts/,
// que es la que sigue sirviendo el sitio (la comprueba
// compositions-contract.test.ts).

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