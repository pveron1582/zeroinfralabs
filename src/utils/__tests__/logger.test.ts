// ── utils/__tests__/logger.test.ts ────────────────────────────────
// Tests for the application logger (MEJORAS 5.1).
// Verifies that logger is no-op in production and emits in development.
//
// IMPORTANTE: el módulo logger.ts calcula `isProd` UNA sola vez al
// cargar (const en toplevel). Por eso cada test que cambia PROD debe:
//   1) vi.stubEnv('PROD', ...)
//   2) vi.resetModules()   <- descarta el cache del módulo
//   3) await import('../logger')  <- re-ejecuta el toplevel
// Así isProd se recalcula con el nuevo valor de import.meta.env.PROD.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    logSpy.mockRestore();
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  // ── Comportamiento en DEV (PROD=false) ──────────────────────────

  it('expone métodos debug/info/warn/error', async () => {
    vi.stubEnv('PROD', false);
    const { logger } = await import('../logger');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('logger.debug emite vía console.log con prefijo [DEBUG] en dev', async () => {
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.debug('hello', 42);
    expect(logSpy).toHaveBeenCalledWith('[DEBUG]', 'hello', 42);
  });

  it('logger.info emite vía console.info con prefijo [INFO] en dev', async () => {
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.info('arrancó');
    expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'arrancó');
  });

  it('logger.warn emite vía console.warn con prefijo [WARN] en dev', async () => {
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.warn('cuidado');
    expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'cuidado');
  });

  it('logger.error emite vía console.error con prefijo [ERROR] en dev', async () => {
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.error('boom', { code: 500 });
    expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'boom', { code: 500 });
  });

  it('logger acepta múltiples argumentos y los expande', async () => {
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.debug('a', 1, [2, 3], { k: 'v' });
    expect(logSpy).toHaveBeenCalledWith('[DEBUG]', 'a', 1, [2, 3], { k: 'v' });
  });

  // ── Comportamiento en PROD (PROD=true) ─────────────────────────
  // Esta es la rama principal que la feature 5.1 busca garantizar.

  it('logger.debug es no-op en PROD', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.debug('no debes verse');
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logger.info es no-op en PROD', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.info('no debes verse');
    expect(infoSpy).not.toHaveBeenCalled();
  });

  it('logger.warn es no-op en PROD', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.warn('no debes verse');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('logger.error es no-op en PROD', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.error('no debes verse');
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('todos los niveles son no-op en PROD simultáneamente', async () => {
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const { logger } = await import('../logger');
    logger.debug('d');
    logger.info('i');
    logger.warn('w');
    logger.error('e');
    expect(logSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  // ── Verificación de aislamiento entre instancias ──────────────

  it('cambiar PROD entre tests no afecta al módulo ya cargado', async () => {
    vi.stubEnv('PROD', false);
    vi.resetModules();
    const devLogger = (await import('../logger')).logger;
    vi.stubEnv('PROD', true);
    vi.resetModules();
    const prodLogger = (await import('../logger')).logger;
    devLogger.debug('dev');   // PROD=false cuando se cargó => emite
    prodLogger.debug('prod'); // PROD=true cuando se cargó  => no-op
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('[DEBUG]', 'dev');
  });
});
