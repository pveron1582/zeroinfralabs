// ── components/__tests__/LabGrid.test.tsx ──────────────────────
// Tests for the LabGrid component (lab selection page)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LabGrid } from '../LabGrid';
import { SCENARIOS } from '../../laboratorios/laboratorios';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  document.body.style.overflow = '';
});

afterEach(() => {
  vi.useRealTimers();
});

const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/en/labs']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/:lang/labs" element={ui} />
        <Route path="/:lang/scenario/:id" element={<div data-testid="scenario-page">Scenario</div>} />
        <Route path="/:lang" element={<div data-testid="landing-page">Landing</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('LabGrid', () => {
  it('debe renderizar el header con logo y navegación', () => {
    renderWithRouter(<LabGrid />);
    expect(screen.getByAltText('VEGA')).toBeInTheDocument();
    expect(screen.getAllByText('Labs').length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar el título de la página en inglés', () => {
    renderWithRouter(<LabGrid />);
    expect(screen.getByText('Choose a Lab')).toBeInTheDocument();
  });

  it('debe mostrar todos los escenarios disponibles', () => {
    renderWithRouter(<LabGrid />);
    for (const scenario of SCENARIOS) {
      expect(screen.getByText(scenario.name)).toBeInTheDocument();
    }
  });

  it('debe mostrar los badges hexadecimales', () => {
    renderWithRouter(<LabGrid />);
    expect(screen.getByText('0x01')).toBeInTheDocument();
    expect(screen.getByText('0x02')).toBeInTheDocument();
    expect(screen.getByText('0x03')).toBeInTheDocument();
  });

  it('debe mostrar las dificultades Easy y Medium', () => {
    renderWithRouter(<LabGrid />);
    expect(screen.getAllByText('Easy').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Medium').length).toBeGreaterThanOrEqual(1);
  });

  it('debe mostrar el selector de idioma', () => {
    renderWithRouter(<LabGrid />);
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('ES')).toBeInTheDocument();
  });

  it('debe mostrar las categorías de los escenarios', () => {
    renderWithRouter(<LabGrid />);
    const categories = new Set(SCENARIOS.map(s => s.category));
    for (const cat of categories) {
      expect(screen.getAllByText(cat).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('debe mostrar el botón START para cada escenario', () => {
    renderWithRouter(<LabGrid />);
    const startButtons = screen.getAllByText('START');
    expect(startButtons.length).toBe(SCENARIOS.length);
  });

  it('debe mostrar el network range de los escenarios', () => {
    renderWithRouter(<LabGrid />);
    for (const scenario of SCENARIOS) {
      expect(screen.getAllByText(scenario.network_range).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('debe mostrar el conteo de misiones', () => {
    renderWithRouter(<LabGrid />);
    const missionTexts = screen.getAllByText(/missions/);
    expect(missionTexts.length).toBeGreaterThanOrEqual(SCENARIOS.length);
  });

  it('debe abrir un modal al hacer click en un escenario', () => {
    renderWithRouter(<LabGrid />);
    expect(screen.getByText(SCENARIOS[0].name)).toBeInTheDocument();
    
    // Click the first scenario card
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    
    // Advance timers for requestAnimationFrame setting openAnim
    act(() => {
      vi.advanceTimersByTime(50);
    });
    
    // Modal should appear with Start Lab button
    expect(screen.getByText('Start Lab')).toBeInTheDocument();
  });

  it('debe cerrar el modal al hacer click en el botón cerrar', () => {
    renderWithRouter(<LabGrid />);
    expect(screen.getByText(SCENARIOS[0].name)).toBeInTheDocument();
    
    // Open modal
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    
    expect(screen.getByText('Start Lab')).toBeInTheDocument();
    
    // Close modal
    const closeBtn = screen.getByLabelText('Close');
    fireEvent.click(closeBtn);
    
    // Advance timers so the closeModal 210ms timeout executes
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(screen.queryByText('Start Lab')).not.toBeInTheDocument();
  });

  it('debe mostrar las herramientas (tools) en el modal', () => {
    renderWithRouter(<LabGrid />);
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('debe mostrar el IP Range en el modal', () => {
    renderWithRouter(<LabGrid />);
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText('IP Range')).toBeInTheDocument();
  });

  it('debe mostrar las flechas de navegación prev/next en el modal', () => {
    renderWithRouter(<LabGrid />);
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByLabelText('Previous')).toBeInTheDocument();
    expect(screen.getByLabelText('Next')).toBeInTheDocument();
  });

  it('debe navegar al siguiente escenario con la flecha next', () => {
    renderWithRouter(<LabGrid />);
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText('Start Lab')).toBeInTheDocument();
    
    // Click next
    fireEvent.click(screen.getByLabelText('Next'));
    
    // The modal should now show the second scenario's name as h2
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(SCENARIOS[1].name);
  });

  it('debe cerrar el modal al presionar Escape', () => {
    renderWithRouter(<LabGrid />);
    const card = screen.getByText(SCENARIOS[0].name).closest('[role="button"]')!;
    fireEvent.click(card);
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByText('Start Lab')).toBeInTheDocument();
    
    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    
    // Advance timers so the closeModal 210ms timeout executes
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(screen.queryByText('Start Lab')).not.toBeInTheDocument();
  });

  it('debe cambiar al idioma español cuando se accede con /es/labs', async () => {
    renderWithRouter(<LabGrid />, ['/es/labs']);
    
    // Advance timers to let the useEffect mount handler and Zustand updates execute
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    
    expect(screen.getByText('Elegí un Lab')).toBeInTheDocument();
  });

  it('debe mostrar el footer de marketing', () => {
    renderWithRouter(<LabGrid />);
    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('debe incluir la animación CSS cardIn', () => {
    const { container } = renderWithRouter(<LabGrid />);
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
    expect((article as HTMLElement).style.animation).toContain('cardIn');
  });

  it('debe limpiar body overflow al desmontar', () => {
    const { unmount } = renderWithRouter(<LabGrid />);
    document.body.style.overflow = 'hidden';
    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
