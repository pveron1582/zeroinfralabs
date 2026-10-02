import { Config } from '@remotion/cli/config';

// Entry único: sin esto el studio y `pnpm remotion render` buscan
// src/index.ts (no existe; la app entra por src/main.tsx).
Config.setEntryPoint('src/video/remotion/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Assets que Remotion sirve por staticFile() (audios de las escenas y
// fuentes de las composiciones) viven en media/, no en public/:
// §3.2.1 sacó public/videos del publicDir de Vite para bajar el dist de
// 923 MB a 20, y dejar este publicDir en `public/` hacía que todo render
// muriera con "Failed to load audio" (mejoras-deep §3.5.4, abierto desde
// el move de 73b3b72).
//
//   staticFile('videos/audio-es/…')      → media/videos/audio-es/…
//   staticFile('fonts/jetbrains-mono/…') → media/fonts/jetbrains-mono/…
//
// Sólo lo lee el CLI de Remotion: Vite sigue usando public/ (la app se
// sirve de public/fonts, y media/ queda fuera del build y del deploy).
Config.setPublicDir('media');
