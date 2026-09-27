// ── hooks/__tests__/useTerminalEffects.test.ts ───────────────────
// Scroll de la terminal: tras un comando el prompt de entrada queda visible
// en la última línea; mientras se lee salida vieja, tipear no arrastra el
// scroll al final.

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTerminalEffects } from '../useTerminalEffects';

const HEIGHT = 500;
const VIEW = 100;

/** Elemento scrolleable con métricas controlables (jsdom no las tiene). */
function makeScrollable(initialTop = 0): HTMLDivElement {
  const el = document.createElement('div');
  let top = initialTop;
  Object.defineProperty(el, 'scrollHeight', { value: HEIGHT, configurable: true });
  Object.defineProperty(el, 'clientHeight', { value: VIEW, configurable: true });
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => top,
    set: (v: number) => { top = v; },
  });
  return el;
}

interface Deps { hard: number; soft: number }

function setup(props: Deps = { hard: 1, soft: 1 }) {
  const scrollRef = { current: makeScrollable(0) };
  const inputRef = { current: document.createElement('input') };
  const utils = renderHook(
    ({ hard, soft }: Deps) => useTerminalEffects({
      scrollRef, inputRef, busy: false, blockingCommand: null,
      scrollDeps: [hard], softDeps: [soft],
    }),
    { initialProps: props },
  );
  return { ...utils, scrollRef };
}

describe('useTerminalEffects — scroll al fondo', () => {
  it('tras un comando (cambio de historial) lleva el scroll al final', () => {
    const { rerender, scrollRef } = setup();
    scrollRef.current!.scrollTop = 120; // usuario quedó a media salida
    rerender({ hard: 2, soft: 1 });
    expect(scrollRef.current!.scrollTop).toBe(HEIGHT);
  });

  it('tipear estando al final lo mantiene pegado al fondo', () => {
    const { rerender, scrollRef } = setup();
    scrollRef.current!.scrollTop = HEIGHT - VIEW - 20;
    scrollRef.current!.dispatchEvent(new Event('scroll'));
    rerender({ hard: 1, soft: 2 });
    expect(scrollRef.current!.scrollTop).toBe(HEIGHT);
  });

  it('tipear mientras se lee salida vieja NO arrastra el scroll', () => {
    const { rerender, scrollRef } = setup();
    scrollRef.current!.scrollTop = 0;
    scrollRef.current!.dispatchEvent(new Event('scroll'));
    rerender({ hard: 1, soft: 2 });
    expect(scrollRef.current!.scrollTop).toBe(0);
  });
});
