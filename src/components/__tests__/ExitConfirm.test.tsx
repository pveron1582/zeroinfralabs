// ── components/__tests__/ExitConfirm.test.tsx ─────────────────────
// Tests para el diálogo de confirmación de salida del simulador

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExitConfirm } from '../ExitConfirm';
import { useScenarioStore } from '../../store/scenarioStore';

describe('ExitConfirm', () => {
  const setLang = (lang: 'en' | 'es') =>
    useScenarioStore.setState({ language: lang });

  beforeEach(() => {
    setLang('es');
  });

  it('no debe renderizar nada si open es false', () => {
    const { container } = render(
      <ExitConfirm open={false} onCancel={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('debe mostrar el mensaje de confirmación en español', () => {
    render(<ExitConfirm open={true} onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText('¿Volver al menú?')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Sí, salir')).toBeInTheDocument();
  });

  it('debe mostrar el mensaje en inglés', () => {
    setLang('en');
    render(<ExitConfirm open={true} onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText('Return to menu?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Yes, exit')).toBeInTheDocument();
  });

  it('debe llamar onConfirm al hacer clic en Sí, salir', () => {
    const onConfirm = vi.fn();
    render(<ExitConfirm open={true} onCancel={vi.fn()} onConfirm={onConfirm} />);

    fireEvent.click(screen.getByText('Sí, salir'));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('debe llamar onCancel al hacer clic en Cancelar', () => {
    const onCancel = vi.fn();
    render(<ExitConfirm open={true} onCancel={onCancel} onConfirm={vi.fn()} />);

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });
});
