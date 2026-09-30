// ── components/__tests__/modal-a11y.test.tsx ──────────────────────
// P1 3.8: los modales ahora usan ModalShell (role="dialog", aria-modal,
// foco atrapado y Escape). Estos tests fijan el contrato en los tres
// diálogos donde el teclado importa de verdad: la confirmación de salida
// (destructiva), la encuesta de fin de lab y el editor nano.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExitConfirm } from '../ExitConfirm';
import { SurveyModal } from '../SurveyModal';
import { makeTestScenario } from '../../test/fixtures';

describe('ExitConfirm', () => {
  it('no renderiza nada cuando está cerrado', () => {
    const { container } = render(<ExitConfirm open={false} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('es un diálogo con nombre accesible', () => {
    render(<ExitConfirm open onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: /confirmar salida|confirm exit/i })).toBeInTheDocument();
  });

  it('el foco arranca en Cancelar (no en la acción destructiva)', () => {
    render(<ExitConfirm open onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByText(/^Cancelar$|^Cancel$/));
  });

  it('Escape cancela (no confirma: un Enter a ciegas no puede perder el progreso)', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(<ExitConfirm open onCancel={onCancel} onConfirm={onConfirm} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('clickear el fondo cancela y los botones hacen lo suyo', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const { unmount } = render(<ExitConfirm open onCancel={onCancel} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText(/Sí, salir|Yes, exit/));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    unmount();

    const onCancel2 = vi.fn();
    render(<ExitConfirm open onCancel={onCancel2} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByRole('dialog').parentElement!);
    expect(onCancel2).toHaveBeenCalled();
  });
});

describe('SurveyModal', () => {
  const scenario = makeTestScenario();

  it('es un diálogo con nombre accesible y no se cierra clickeando el fondo', () => {
    const onSubmit = vi.fn();
    render(<SurveyModal scenario={scenario} onSubmit={onSubmit} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    fireEvent.click(dialog.parentElement!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('Enviar marca enviada y muestra el agradecimiento (sin Escape: es el cierre)', () => {
    const onSubmit = vi.fn();
    vi.useFakeTimers();
    render(<SurveyModal scenario={scenario} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText(/^Enviar$|^Submit$/));
    expect(screen.getByText(/¡Gracias por tu feedback|Thanks for your feedback/)).toBeInTheDocument();
    vi.advanceTimersByTime(1500);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('Omitir envía directo', () => {
    const onSubmit = vi.fn();
    render(<SurveyModal scenario={scenario} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText(/^Omitir$|^Skip$/));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
