// ── hooks/useTerminalEffects.ts ────────────────────────────────────
// Efectos de UI puros: scroll al fondo, foco en el input al dejar de estar
// ocupado, y foco cuando la ventana recupera el foco.

import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { BlockingCommand } from '../types';

interface UseTerminalEffectsOptions {
  scrollRef: RefObject<HTMLDivElement | null>;
  inputRef: RefObject<HTMLInputElement | null>;
  busy: boolean;
  blockingCommand: BlockingCommand | null;
  /** Dependencias que, al cambiar, gatillan scroll al fondo */
  scrollDeps: unknown[];
}

export function useTerminalEffects({
  scrollRef, inputRef, busy, blockingCommand, scrollDeps,
}: UseTerminalEffectsOptions) {
  // Auto-focus when not busy (o cuando hay comando bloqueante que acepta input)
  useEffect(() => {
    if (!busy || (busy && blockingCommand)) {
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [busy, blockingCommand]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, scrollDeps);

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
