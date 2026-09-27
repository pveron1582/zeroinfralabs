// ── hooks/useTerminalEffects.ts ────────────────────────────────────
// Efectos de UI puros: scroll al fondo, foco en el input al dejar de estar
// ocupado, y foco cuando la ventana recupera el foco.
//
// El prompt de entrada siempre tiene que quedar visible en la última línea
// tras ejecutar un comando. Para eso el scroll se fija en tres momentos
// (síncrono, al pintar y tras el paint tardío): en el commit de React el
// layout todavía no está — fuentes (font-display: swap), streams de salida
// y el intercambio del placeholder de "busy" por el input real siguen
// creciendo el contenido.

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { BlockingCommand } from '../types';

interface UseTerminalEffectsOptions {
  scrollRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  busy: boolean;
  blockingCommand: BlockingCommand | null;
  /** Dependencias que gatillan scroll FORZADO al fondo (historial / busy). */
  scrollDeps: unknown[];
  /**
   * Dependencias que solo mantienen el fondo si el usuario ya estaba cerca
   * (tipeo): no se lo arrastra al final si está leyendo salida vieja.
   */
  softDeps?: unknown[];
  /** Tolerancia en px para considerar que se está "al fondo". */
  bottomThreshold?: number;
}

export function useTerminalEffects({
  scrollRef, inputRef, busy, blockingCommand, scrollDeps, softDeps = [],
  bottomThreshold = 80,
}: UseTerminalEffectsOptions) {
  // Cerca del final? Se actualiza con cada scroll (también el programático,
  // que sale del mismo efecto de pin — por eso el umbral es holgado).
  const nearBottomRef = useRef(true);

  // Auto-focus when not busy (o cuando hay comando bloqueante que acepta input)
  useEffect(() => {
    if (!busy || (busy && blockingCommand)) {
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [busy, blockingCommand]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pin al fondo: fuerza tras un comando / nueva salida ──────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pin = () => { el.scrollTop = el.scrollHeight; };
    pin();
    const raf = requestAnimationFrame(pin);
    const timer = window.setTimeout(pin, 80);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, scrollDeps);

  // ── Pin suave mientras se tipea: solo si ya se estaba al fondo ───
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !nearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, softDeps);

  // ── ¿Está al final? ──────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < bottomThreshold;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef, bottomThreshold]);

  // ── Resize del contenedor (ventana, maximize, cambio de fuente) ──
  // El bottom se corre de lugar: si el usuario estaba al final hay que
  // volver a pegarlo, si está leyendo no se lo molesta.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      if (nearBottomRef.current) el.scrollTop = el.scrollHeight;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollRef]);

  // Window focus handler
  useEffect(() => {
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 50);
    const handleWindowFocus = () => {
      setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('focus', handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, blockingCommand]);
}
