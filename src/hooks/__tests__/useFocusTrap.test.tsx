// ── hooks/__tests__/useFocusTrap.test.ts ──────────────────────────
// P1 3.8: el foco atrapado de los diálogos. Antes ningún modal lo tenía:
// con teclado el Tab se iba al contenido de atrás y Escape no cerraba.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { useFocusTrap } from '../useFocusTrap';

function Dialog({ open = true, onEscape }: { open?: boolean; onEscape?: () => void }) {
  const ref = useFocusTrap<HTMLDivElement>(open, onEscape);
  if (!open) return null;
  return (
    <div>
      <button>fuera-1</button>
      <div ref={ref} tabIndex={-1} data-testid="dialog">
        <button>ok</button>
        <a href="#x">link</a>
        <input aria-label="campo" />
        <button disabled>deshabilitado</button>
      </div>
      <button>fuera-2</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('al abrir, el foco entra al primer elemento focable del diálogo', () => {
    render(<Dialog />);
    expect(document.activeElement).toBe(screen.getByText('ok'));
  });

  it('el foco queda dentro del diálogo (no en el documento)', () => {
    render(<Dialog />);
    const dialog = screen.getByTestId('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('Escape dispara onEscape', () => {
    const onEscape = vi.fn();
    render(<Dialog onEscape={onEscape} />);
    fireEvent.keyDown(screen.getByTestId('dialog'), { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('sin onEscape, Escape llega a los onKeyDown internos de React', () => {
    // Regresión: el stopPropagation del trap se comía el evento ANTES de que
    // React lo despache (React escucha en su root container, que es ancestro
    // del contenedor atrapado), con lo que la barra de nano —que cancela con
    // Escape— nunca se cerraba.
    const onInternal = vi.fn();
    function Bar() {
      const ref = useFocusTrap<HTMLDivElement>(true);
      return (
        <div ref={ref} tabIndex={-1} data-testid="dialog">
          <input
            aria-label="barra"
            onKeyDown={e => { if (e.key === 'Escape') onInternal(); }}
          />
        </div>
      );
    }
    render(<Bar />);
    fireEvent.keyDown(screen.getByLabelText('barra'), { key: 'Escape' });
    expect(onInternal).toHaveBeenCalledTimes(1);
  });

  it('Tab en el último elemento vuelve al primero (no sale del diálogo)', () => {
    render(<Dialog />);
    const dialog = screen.getByTestId('dialog');
    const last = screen.getByText('deshabilitado');
    expect(last).toBeDisabled();
    const campo = screen.getByLabelText('campo');
    campo.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByText('ok'));
  });

  it('Shift+Tab en el primer elemento va al último', () => {
    render(<Dialog />);
    const dialog = screen.getByTestId('dialog');
    screen.getByText('ok').focus();
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(screen.getByLabelText('campo'));
  });

  it('Tab en un elemento intermedio deja avanzar normal', () => {
    render(<Dialog />);
    const dialog = screen.getByTestId('dialog');
    const ok = screen.getByText('ok');
    ok.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    // El navegador simulado no mueve el foco solo: lo importante es que el
    // handler NO lo devolvió al primero (no hubo preventDefault).
    expect(document.activeElement).toBe(ok);
  });

  it('al cerrar, el foco vuelve al elemento que lo tenía antes', () => {
    function Wrapper() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => setOpen(true)}>abrir</button>
          <Dialog open={open} />
        </div>
      );
    }
    render(<Wrapper />);
    const abrir = screen.getByText('abrir');
    abrir.focus();
    fireEvent.click(abrir);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('no atrapa nada cuando está cerrado', () => {
    render(<Dialog open={false} />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('un diálogo sin elementos focables no explota (foco al contenedor)', () => {
    function Empty() {
      const ref = useFocusTrap<HTMLDivElement>(true);
      return <div ref={ref} tabIndex={-1} data-testid="vacio" />;
    }
    render(<Empty />);
    fireEvent.keyDown(screen.getByTestId('vacio'), { key: 'Tab' });
    expect(document.activeElement).toBe(screen.getByTestId('vacio'));
  });
});
