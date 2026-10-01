// ── hooks/__tests__/useIsMobile.test.ts ───────────────────────────
// Test DIRECTO: el hook solo se ejercitaba por rebote desde AppContent
// (73,7 % de statements). Cubre el handler `change` de matchMedia, el
// fallback addListener/removeListener de Safari viejo y el breakpoint
// pasado por argumento.
//
// Huecos documentados (defensivos): los `typeof window === 'undefined'`
// de las líneas 9 y 14 — en jsdom y en el navegador siempre hay window.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../useIsMobile';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = originalMatchMedia;
});

describe('useIsMobile', () => {
  it('el evento change de matchMedia actualiza el estado', () => {
    let handler: ((e: MediaQueryListEvent) => void) | undefined;
    const addEventListener = vi.fn((_t: string, cb: (e: MediaQueryListEvent) => void) => {
      handler = cb;
    });
    const removeEventListener = vi.fn();
    window.matchMedia = vi.fn(() => ({
      matches: false,
      media: '',
      addEventListener,
      removeEventListener,
    }) as unknown as MediaQueryList);

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => { handler?.({ matches: true } as MediaQueryListEvent); });
    expect(result.current).toBe(true);

    act(() => { handler?.({ matches: false } as MediaQueryListEvent); });
    expect(result.current).toBe(false);

    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(removeEventListener).not.toHaveBeenCalled();
  });

  it('usa addListener/removeListener cuando matchMedia no soporta eventos (Safari viejo)', () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();
    window.matchMedia = vi.fn(() => ({
      matches: true,
      media: '',
      addListener,
      removeListener,
    }) as unknown as MediaQueryList);

    const { result, unmount } = renderHook(() => useIsMobile(500));
    // el estado inicial lo manda mql.matches (true), no innerWidth
    expect(result.current).toBe(true);
    expect(addListener).toHaveBeenCalledTimes(1);

    unmount();
    expect(removeListener).toHaveBeenCalledTimes(1);
  });

  it('construye la media query con el breakpoint menos 1', () => {
    window.matchMedia = vi.fn(() => ({
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as MediaQueryList);

    renderHook(() => useIsMobile(1200));
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1199px)');
  });
});
