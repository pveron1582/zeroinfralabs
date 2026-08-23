// ── academy/index.ts ───────────────────────────────────────────────
// Barra pública del módulo Academy (mismo patrón que types/index.ts,
// commands/index.ts y tools/index.ts). Los consumers externos importan
// desde '../../academy' — nunca tocan paths.ts ni los archivos internos
// de lecciones. paths.ts se conserva como ruta de compatibilidad.

export * from './paths';
export * from './path-os';
export * from './path-redes';
export * from './path-protocolos';
export * from './path-protocolos-ii';
export * from './path-ciberseguridad';
export * from './path-hacking';
export * from './path-hacking-web';
export * from './path-scripting';
export * from './linux-lessons';
export * from './windows-lessons';
export * from './others-lessons';
export * from './others-hw-lessons';
export * from './bash-lessons';
export * from './powershell-lessons';
export * from './python-lessons';