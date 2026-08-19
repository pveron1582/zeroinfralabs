// ── utils/lazyRetry.ts ────────────────────────────────────────────
// React.lazy wrapper con reintentos: si falla la carga de un chunk
// (p. ej. tab abierta antes de un reinicio del dev server, o un
// despliegue nuevo que invalidó los hashes), reintenta antes de
// fallar y dejar la pantalla en blanco.

import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 400;

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
}

export function lazyWithRetry<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options: RetryOptions = {},
): LazyExoticComponent<T> {
  return lazy(() => loadWithRetry(importFn, 0, options.retries ?? MAX_RETRIES, options.delayMs ?? RETRY_DELAY_MS));
}

export async function loadWithRetry<T>(
  importFn: () => Promise<T>,
  attempt: number,
  maxRetries: number,
  delayMs: number,
): Promise<T> {
  try {
    return await importFn();
  } catch (err) {
    if (attempt >= maxRetries) throw err;
    await new Promise(r => setTimeout(r, delayMs * (attempt + 1)));
    return loadWithRetry(importFn, attempt + 1, maxRetries, delayMs);
  }
}
