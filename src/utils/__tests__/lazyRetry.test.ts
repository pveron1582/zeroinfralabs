import { describe, it, expect, vi } from 'vitest';
import { lazyWithRetry, loadWithRetry } from '../lazyRetry';
import { createElement, Suspense } from 'react';
import { render, waitFor } from '@testing-library/react';

describe('loadWithRetry', () => {
  it('resuelve al primer intento si funciona', async () => {
    const fn = vi.fn(async () => 'ok');
    const result = await loadWithRetry(fn, 0, 2, 1);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('reintenta y resuelve si el segundo intento funciona', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new Error('Failed to fetch dynamically imported module');
      return 'ok';
    });
    const result = await loadWithRetry(fn, 0, 2, 1);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('lanza el error tras agotar los reintentos', async () => {
    const err = new Error('Failed to fetch dynamically imported module');
    const fn = vi.fn(async () => { throw err; });
    await expect(loadWithRetry(fn, 0, 2, 1)).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(3); // 1 inicial + 2 reintentos
  });
});

describe('lazyWithRetry', () => {
  it('crea un lazy component que renderiza tras resolver', async () => {
    const Comp = () => createElement('div', null, 'ok');
    const fn = vi.fn(async () => ({ default: Comp }));
    const Lazy = lazyWithRetry(fn, { retries: 1, delayMs: 1 });

    const { container } = render(
      createElement(Suspense, { fallback: null }, createElement(Lazy))
    );
    await waitFor(() => expect(container.textContent).toBe('ok'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('recupera con reintento si el primer import falla', async () => {
    let calls = 0;
    const fn = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new Error('Failed to fetch dynamically imported module');
      const Comp = () => createElement('div', null, 'recovered');
      return { default: Comp };
    });
    const Lazy = lazyWithRetry(fn, { retries: 2, delayMs: 1 });

    const { container } = render(
      createElement(Suspense, { fallback: null }, createElement(Lazy))
    );
    await waitFor(() => expect(container.textContent).toBe('recovered'), { timeout: 3000 });
    expect(calls).toBeGreaterThanOrEqual(2);
  });
});
