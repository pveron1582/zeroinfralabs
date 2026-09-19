// ── hooks/useIsMobile.ts ────────────────────────────────────────
// Hook para detectar viewport móvil (branch AppContent desktop/mobile)
// Usa matchMedia, con fallback a window.innerWidth para tests/jsdom.

import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    // Estado inicial desde mql
    setIsMobile(mql.matches);
    // Compat: addEventListener en modernos, addListener en Safari viejo
    if (mql.addEventListener) mql.addEventListener('change', handler as (e: Event) => void);
    else (mql as unknown as { addListener: (cb: (e: MediaQueryListEvent) => void) => void }).addListener(handler as unknown as (e: MediaQueryListEvent) => void);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler as (e: Event) => void);
      else (mql as unknown as { removeListener: (cb: (e: MediaQueryListEvent) => void) => void }).removeListener(handler as unknown as (e: MediaQueryListEvent) => void);
    };
  }, [breakpoint]);

  return isMobile;
}
