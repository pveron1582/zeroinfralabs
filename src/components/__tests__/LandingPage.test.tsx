// ── components/__tests__/LandingPage.test.tsx ──────────────────────
// Tests for the new marketing LandingPage

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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
      expect(screen.getByText('ZI Labs')).toBeInTheDocument();
      expect(screen.getByText('v4.5')).toBeInTheDocument();
    });
  });

  it('debe mostrar el subtítulo "Simulador de Laboratorios"', async () => {
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

  it('debe mostrar los 3 badges de valor', async () => {
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

  it('debe mostrar la sección "Te presentamos ZI Labs"', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Never hacked anything\? Perfect/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar la sección "Por qué ZI Labs es diferente"', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText('Why ZI Labs is different')).toBeInTheDocument();
    });
  });

  it('debe mostrar las 6 tarjetas de características', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getAllByText('Realistic terminal').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('100% safe').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Guided learning').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('No registration').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('No time limits').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('debe mostrar la sección "¿Para quién es?"', async () => {
    renderWithRouter(<LandingPage />);
    await waitFor(() => {
      expect(screen.getByText('Who is this for?')).toBeInTheDocument();
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
