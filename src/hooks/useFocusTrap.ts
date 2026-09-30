// ── hooks/useFocusTrap.ts ─────────────────────────────────────────
// Foco atrapado dentro de un modal mientras está abierto. P1 3.8: ningún
// modal del proyecto lo tenía, así que con teclado el foco se iba al
// contenido de atrás (el simulador queda "editable" por detrás del diálogo).
//
// Hace las cuatro cosas que se esperan de un diálogo:
//  1. al abrir, mueve el foco al primer elemento focable;
//  2. Tab / Shift+Tab ciclan dentro (nunca salen del modal);
//  3. Escape dispara onEscape (el modal lo usa para cerrar);
//  4. al cerrar, devuelve el foco al elemento que lo tenía antes.

import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusableIn(container: HTMLElement): HTMLElement[] {
  // Sin filtro por offsetParent: en jsdom siempre es null y el diálogo se
  // quedaba sin foco interno. LaVisibility la cubre `hidden`/`aria-hidden`,
  // y el selector ya excluye disabled y tabindex="-1".
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(el => !el.hidden && el.getAttribute('aria-hidden') !== 'true'
      && !el.closest('[hidden], [aria-hidden="true"]'));
}

export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
  onEscape?: () => void,
): React.MutableRefObject<T | null> {
  const ref = useRef<T | null>(null);
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // 1) Foco adentro: el primer focable, o el propio contenedor si no hay.
    const first = focusableIn(container)[0];
    (first ?? container).focus?.();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        escapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusableIn(container);
      if (items.length === 0) {
        e.preventDefault();
        container.focus?.();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const current = document.activeElement;
      // 2) Ciclar: si el foco está en el último y va hacia adelante, vuelve
      // al primero (y al revés desde el primero).
      if (e.shiftKey && (current === firstItem || !container.contains(current))) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && (current === lastItem || !container.contains(current))) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      // 4) Devolver el foco a donde estaba: si no, el usuario queda en el
      // body y el siguiente Tab arranca desde arriba de la página.
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}
