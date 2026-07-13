// ── components/__tests__/LandingPage.test.tsx ──────────────────────
// Tests for the marketing LandingPage

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';

beforeEach(() => {
  localStorage.clear();
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('LandingPage (marketing)', () => {
  it('debe renderizar el header con el logo', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getAllByAltText('VEGA').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('debe mostrar el subtítulo del hero', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText(/LEARN ETHICAL HACKING/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar el título principal del hero', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Learn hacking from scratch/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar los badges de valor', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getAllByText('No prior knowledge').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('No registration').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('100% safe & legal').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('debe mostrar el botón CTA hacia los labs', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      const ctaButtons = screen.getAllByText(/Start for free now/i);
      expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('debe mostrar la sección intro con terminal', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Never hacked anything\? Perfect/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Kali desktop in your browser/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar preview de labs', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText('Pick your first lab')).toBeInTheDocument();
      expect(screen.getAllByText('WordPress Vulnerable Lab').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/View all labs \(5\)/)).toBeInTheDocument();
    });
  });

  it('debe mostrar las 4 tarjetas de características unificadas', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Built for beginners/i)).toBeInTheDocument();
      expect(screen.getAllByText('Realistic terminal').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Guided learning').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Cybersecurity students').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('debe mostrar la sección "¿Cómo funciona?"', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText('How it works')).toBeInTheDocument();
    });
  });

  it('debe mostrar los 4 pasos', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText('Choose a lab')).toBeInTheDocument();
      expect(screen.getByText('Open the terminal')).toBeInTheDocument();
      expect(screen.getByText('Start hacking')).toBeInTheDocument();
      expect(screen.getByText('Complete the labs')).toBeInTheDocument();
    });
  });

  it('debe mostrar el CTA final', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText('Ready for your first machine?')).toBeInTheDocument();
    });
  });

  it('debe renderizar el footer', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText(/ZI Labs · Controlled practice environment/)).toBeInTheDocument();
    });
  });
});
