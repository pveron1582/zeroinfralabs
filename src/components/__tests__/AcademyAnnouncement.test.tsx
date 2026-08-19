// ── components/__tests__/AcademyAnnouncement.test.tsx ──────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AcademyAnnouncement } from '../academy/AcademyAnnouncement';
import { useScenarioStore } from '../../store/scenarioStore';

const renderIt = () =>
  render(
    <MemoryRouter>
      <AcademyAnnouncement />
    </MemoryRouter>
  );

describe('AcademyAnnouncement', () => {
  beforeEach(() => {
    useScenarioStore.setState({ language: 'en', completedLessons: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no debe aparecer antes del delay', () => {
    renderIt();
    expect(screen.queryByText('🎓 Academy')).not.toBeInTheDocument();
  });

  it('debe aparecer tras el delay con el CTA hacia la academy', () => {
    renderIt();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(screen.getByText('🎓 Academy')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Go to Academy/i });
    expect(link.getAttribute('href')).toBe('/en/academy');
  });

  it('debe mostrar los módulos del academy', () => {
    renderIt();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(screen.getByText('🐧 Linux')).toBeInTheDocument();
    expect(screen.getByText('🪟 Windows')).toBeInTheDocument();
    expect(screen.getByText('🌐 Networking')).toBeInTheDocument();
    expect(screen.queryByText('🐍 Scripting')).not.toBeInTheDocument();
    expect(screen.getByText('💻 Scripting')).toBeInTheDocument();
  });

  it('debe cerrarse con el botón X', () => {
    renderIt();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Close announcement' }));
    expect(screen.queryByText('🎓 Academy')).not.toBeInTheDocument();
  });

  it('debe cerrarse al hacer click en el backdrop', () => {
    const { container } = renderIt();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    const backdrop = container.querySelector('.bg-black\\/70');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop as HTMLElement);
    expect(screen.queryByText('🎓 Academy')).not.toBeInTheDocument();
  });

  it('debe cerrarse con Escape', () => {
    renderIt();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('🎓 Academy')).not.toBeInTheDocument();
  });

  it('debe mostrar el botón "Not now"', () => {
    renderIt();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));
    expect(screen.queryByText('🎓 Academy')).not.toBeInTheDocument();
  });

  it('debe mostrar textos en español cuando el idioma es es', () => {
    useScenarioStore.setState({ language: 'es' });
    renderIt();
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(screen.getByText('Ir a la Academy')).toBeInTheDocument();
    expect(screen.getByText('Ahora no')).toBeInTheDocument();
  });
});
