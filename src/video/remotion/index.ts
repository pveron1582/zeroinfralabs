// ── video/remotion/index.ts ─────────────────────────────────────────
// Entry point para Remotion. Cada composición es un video renderizable
// via `pnpm remotion render`. Los MP4 van a public/videos/ para servir
// como assets estáticos (Vercel los serve de /videos/).

import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
