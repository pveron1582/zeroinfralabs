// ── fs-models/index.ts ────────────────────────────────────────────
// Exportaciones de modelos de sistemas de archivos

export { createLinuxFileSystem } from './fs-linux';
export type { LinuxFileSystemConfig } from './fs-linux';

export { createWindowsFileSystem } from './fs-windows';
export type { WindowsFileSystemConfig } from './fs-windows';

export { MACHINE_HOSTNAME_PLACEHOLDER } from './placeholders';