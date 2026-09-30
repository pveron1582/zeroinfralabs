// ── components/appContent/__tests__/mobile.test.tsx ───────────────
// P1 3.6: el workspace móvil (add-menu, teclas rápidas, popups) estaba sin
// tests. Los límites de ventanas (5 terminales / 2 navegadores) y los
// tokens que se insertan en la terminal son reglas de negocio, no estilo.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileKeyRow } from '../MobileKeyRow';
import { MobileAddMenu } from '../MobileAddMenu';
import { MobileExperiencePopup } from '../MobileExperiencePopup';

describe('MobileKeyRow', () => {
  it('inserta el texto de cada tecla rápida', () => {
    const onInsert = vi.fn();
    render(<MobileKeyRow onInsert={onInsert} />);

    fireEvent.click(screen.getByText('|'));
    expect(onInsert).toHaveBeenCalledWith(' | ');

    fireEvent.click(screen.getByText('Ctrl+C'));
    expect(onInsert).toHaveBeenCalledWith('__CTRL_C__');

    fireEvent.click(screen.getByText('↑'));
    expect(onInsert).toHaveBeenCalledWith('__ARROW_UP__');
  });

  it('Tab inserta un tabulador real, no la palabra', () => {
    const onInsert = vi.fn();
    render(<MobileKeyRow onInsert={onInsert} />);
    fireEvent.click(screen.getByText('Tab'));
    expect(onInsert).toHaveBeenCalledWith('\t');
  });

  it('renderiza las 8 teclas del contrato', () => {
    render(<MobileKeyRow onInsert={vi.fn()} />);
    for (const label of ['Tab', '|', '-', '/', '--', 'Ctrl+C', '↑', 'clear']) {
      expect(screen.getByText(label), label).toBeInTheDocument();
    }
  });
});

describe('MobileAddMenu', () => {
  function renderMenu(overrides: Partial<React.ComponentProps<typeof MobileAddMenu>> = {}) {
    const props = {
      onAddTerminal: vi.fn(),
      onAddBrowser: vi.fn(),
      showBrowser: true,
      canAddTerm: true,
      canAddBrowser: true,
      ...overrides,
    };
    return { props, ...render(<MobileAddMenu {...props} />) };
  }

  it('el modal arranca cerrado y se abre con el botón +', () => {
    renderMenu();
    expect(screen.queryByText('Elegí qué querés abrir')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /agregar ventana/i }));
    expect(screen.getByText('Elegí qué querés abrir')).toBeInTheDocument();
  });

  it('agrega una terminal y cierra el modal', () => {
    const { props } = renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /agregar ventana/i }));
    fireEvent.click(screen.getByText(/Nueva Terminal/));
    expect(props.onAddTerminal).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Elegí qué querés abrir')).not.toBeInTheDocument();
  });

  it('agrega un navegador', () => {
    const { props } = renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /agregar ventana/i }));
    fireEvent.click(screen.getByText(/Nuevo Navegador/));
    expect(props.onAddBrowser).toHaveBeenCalledTimes(1);
  });

  it('con el límite de terminales alcanzado, el botón está deshabilitado y NO agrega', () => {
    const { props } = renderMenu({ canAddTerm: false });
    fireEvent.click(screen.getByRole('button', { name: /agregar ventana/i }));
    const button = screen.getByText(/Nueva Terminal/).closest('button')!;
    expect(button).toBeDisabled();
    expect(button.textContent).toContain('límite 5');
    fireEvent.click(button);
    expect(props.onAddTerminal).not.toHaveBeenCalled();
  });

  it('con showBrowser false no ofrece navegador (escenarios sin web)', () => {
    renderMenu({ showBrowser: false });
    fireEvent.click(screen.getByRole('button', { name: /agregar ventana/i }));
    expect(screen.queryByText(/Nuevo Navegador/)).not.toBeInTheDocument();
  });

  it('Cancelar cierra sin agregar nada', () => {
    const { props } = renderMenu();
    fireEvent.click(screen.getByRole('button', { name: /agregar ventana/i }));
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Elegí qué querés abrir')).not.toBeInTheDocument();
    expect(props.onAddTerminal).not.toHaveBeenCalled();
    expect(props.onAddBrowser).not.toHaveBeenCalled();
  });
});

describe('MobileExperiencePopup', () => {
  beforeEach(() => { sessionStorage.clear(); });

  it('se cierra al continuar y no vuelve en la misma sesión', () => {
    const { unmount } = render(<MobileExperiencePopup scenarioId="lab-01" isEs />);
    fireEvent.click(screen.getByText('Continuar'));
    expect(screen.queryByText('Experiencia en móvil')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('mobile-experience-dismissed-lab-01')).toBe('1');
    unmount();

    // Remontarlo en la misma sesión no lo muestra (el flag es por escenario).
    render(<MobileExperiencePopup scenarioId="lab-01" isEs />);
    expect(screen.queryByText('Experiencia en móvil')).not.toBeInTheDocument();
  });

  it('elismissal es por escenario: otro lab vuelve a mostrarlo', () => {
    render(<MobileExperiencePopup scenarioId="lab-01" isEs />);
    fireEvent.click(screen.getByText('Continuar'));
    render(<MobileExperiencePopup scenarioId="lab-02" isEs />);
    expect(screen.getByText('Experiencia en móvil')).toBeInTheDocument();
  });

  it('texto en inglés cuando isEs es false', () => {
    render(<MobileExperiencePopup scenarioId="lab-03" isEs={false} />);
    expect(screen.getByText('Mobile experience')).toBeInTheDocument();
  });
});
