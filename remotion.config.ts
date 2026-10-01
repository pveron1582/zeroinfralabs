import { Config } from '@remotion/cli/config';

// Entry único: sin esto el studio y `pnpm remotion render` buscan
// src/index.ts (no existe; la app entra por src/main.tsx).
Config.setEntryPoint('src/video/remotion/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
