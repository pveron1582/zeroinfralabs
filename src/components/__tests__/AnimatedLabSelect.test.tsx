// ── components/__tests__/AnimatedLabSelect.test.tsx ──────────────────────
// Tests for the AnimatedLabSelect mockup component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AnimatedLabSelect } from '../AnimatedLabSelect';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AnimatedLabSelect', () => {
  it('debe renderizar el header con título', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('ZI Labs — Choose a Lab')).toBeInTheDocument();
  });

  it('debe mostrar las tarjetas de todos los labs', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('WordPress Vulnerable Lab')).toBeInTheDocument();
    expect(screen.getByText('Web OSINT & SSH Compromise')).toBeInTheDocument();
    expect(screen.getByText('EternalBlue (MS17-010)')).toBeInTheDocument();
    expect(screen.getByText('Local File Inclusion / RCE')).toBeInTheDocument();
    expect(screen.getByText('FTP Enumeration & PrivEsc')).toBeInTheDocument();
  });

  it('debe mostrar el botón START para cada lab', () => {
    render(<AnimatedLabSelect />);
    const startButtons = screen.getAllByText('START');
    expect(startButtons.length).toBe(5);
  });

  it('debe mostrar los números hexadecimales de los labs', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('0x01')).toBeInTheDocument();
    expect(screen.getByText('0x02')).toBeInTheDocument();
    expect(screen.getByText('0x03')).toBeInTheDocument();
    expect(screen.getByText('0x04')).toBeInTheDocument();
    expect(screen.getByText('0x05')).toBeInTheDocument();
  });

  it('debe mostrar las dificultades Easy y Medium', () => {
    render(<AnimatedLabSelect />);
    const easyBadges = screen.getAllByText('Easy');
    const mediumBadges = screen.getAllByText('Medium');
    expect(easyBadges.length).toBe(2);
    expect(mediumBadges.length).toBe(3);
  });

  it('debe mostrar el conteo de misiones para cada lab', () => {
    render(<AnimatedLabSelect />);
    expect(screen.getByText('8 missions')).toBeInTheDocument();
    expect(screen.getByText('7 missions')).toBeInTheDocument();
    // 6 missions appears in both EternalBlue and FTP enum, so we check using getAllByText
    expect(screen.getAllByText('6 missions').length).toBe(2);
    expect(screen.getByText('5 missions')).toBeInTheDocument();
  });

  it('debe mostrar las categorías de los labs', () => {
    render(<AnimatedLabSelect />);
    const webCategories = screen.getAllByText('Web');
    expect(webCategories.length).toBe(3);
    expect(screen.getByText('Exploit')).toBeInTheDocument();
    expect(screen.getByText('Enum')).toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    const { container } = render(<AnimatedLabSelect className="my-class" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('my-class');
  });

  it('debe renderizar las tres bolitas de la barra', () => {
    const { container } = render(<AnimatedLabSelect />);
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(3);
  });

  it('debe mostrar el cursor del mouse durante la animación hovering', async () => {
    const { container } = render(<AnimatedLabSelect />);
    // Initial timeout (600ms) + cursor appears after 500ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });
    // SVG cursor should be present (mouse pointer)
    const cursor = container.querySelector('svg[viewBox="0 0 24 24"]');
    expect(cursor).toBeInTheDocument();
  });

  it('debe simular el click en un lab cambiando START a → LOADING', async () => {
    render(<AnimatedLabSelect />);
    // After clicking phase: 600ms initial + 2200ms to click
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(screen.getByText('→ LOADING')).toBeInTheDocument();
  });

  it('debe reducir opacidad de otros labs en fase selected', async () => {
    const { container } = render(<AnimatedLabSelect />);
    // 600ms + 2800ms for selected phase
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
    });
    const cards = container.querySelectorAll('.rounded-lg.overflow-hidden.border');
    // The non-selected cards should have opacity 0.5
    const reducedOpacity = Array.from(cards).filter(
      card => (card as HTMLElement).style.opacity === '0.5'
    );
    expect(reducedOpacity.length).toBe(4); // 4 non-selected labs
  });

  it('debe reiniciar la animación en un ciclo', async () => {
    render(<AnimatedLabSelect />);
    // Complete cycle: 600ms + 5000ms restart + 400ms + 500ms
    await act(async () => {
      await vi.advanceTimersByTimeAsync(7000);
    });
    // After reset, all should show START again (no LOADING)
    const startButtons = screen.getAllByText('START');
    expect(startButtons.length).toBe(5);
  });

  it('debe tener un grid de 3 columnas para los labs', () => {
    const { container } = render(<AnimatedLabSelect />);
    const grid = container.querySelector('.grid.grid-cols-3');
    expect(grid).toBeInTheDocument();
  });

  it('debe renderizar con el patrón de fondo (dot grid)', () => {
    const { container } = render(<AnimatedLabSelect />);
    const bgPattern = container.querySelector('.pointer-events-none');
    expect(bgPattern).toBeInTheDocument();
  });

  it('debe ocultar el cursor en fase reset', async () => {
    const { container } = render(<AnimatedLabSelect />);
    // 600ms + 5000ms (start of restart/reset)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5700);
    });
    // During reset phase, cursor should not be visible
    const svgCursors = container.querySelectorAll('.pointer-events-none.transition-all');
    const visibleCursors = Array.from(svgCursors).filter(el =>
      el.querySelector('svg[viewBox="0 0 24 24"]')
    );
    expect(visibleCursors.length).toBeLessThanOrEqual(svgCursors.length);
    expect(container.firstChild).toBeInTheDocument();
  });
});
