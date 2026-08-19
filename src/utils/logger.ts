// ── utils/logger.ts ───────────────────────────────────────────────
// Logger de aplicación: no-op en producción, loguea en desarrollo.
// Reemplaza console.log de debug en producción (MEJORAS 5.1).
//
// Uso:
//   import { logger } from '../utils/logger';
//   logger.debug('Loading scenario:', id);
//   logger.info('Mission completed');
//   logger.warn('Unknown command:', cmd);
//   logger.error('Failed to persist:', err);
//
// En prod (import.meta.env.PROD === true): todas las llamadas son no-op.
// En dev: prefijan con [DEBUG]/[INFO]/[WARN]/[ERROR] y delegan a console.

const isProd = typeof import.meta !== 'undefined' && import.meta.env?.PROD === true;

export const logger = {
  debug(...args: unknown[]): void {
    if (isProd) return;
    // eslint-disable-next-line no-console
    console.log('[DEBUG]', ...args);
  },

  info(...args: unknown[]): void {
    if (isProd) return;
    // eslint-disable-next-line no-console
    console.info('[INFO]', ...args);
  },

  warn(...args: unknown[]): void {
    if (isProd) return;
     
    console.warn('[WARN]', ...args);
  },

  error(...args: unknown[]): void {
    if (isProd) return;
     
    console.error('[ERROR]', ...args);
  },
};
