// ── components/__tests__/LabGrid.test.tsx ──────────────────────
// Tests for the LabGrid component (lab selection page)

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LabGrid } from '../LabGrid';

beforeEach(() => {
  localStorage.clear();
});

const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/en/labs']) => {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
};

describe('LabGrid', () => {
  it('debe renderizar el header con botón "Home"', async () => {
    renderWithRouter(<LabGrid />);
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('debe mostrar el título de la página', async () => {
    renderWithRouter(<LabGrid />);
    await waitFor(() => {
      expect(screen.getByText('Choose a Lab')).toBeInTheDocument();
    });
  });

  it('debe mostrar todos los escenarios', async () => {
    renderWithRouter(<LabGrid />);
    await waitFor(() => {
      expect(screen.getByText('WordPress Vulnerable Lab')).toBeInTheDocument();
    });
  });

  it('debe mostrar los badges hexadecimales', async () => {
    renderWithRouter(<LabGrid />);
    await waitFor(() => {
      expect(screen.getByText('0x01')).toBeInTheDocument();
      expect(screen.getByText('0x02')).toBeInTheDocument();
    });
  });

  it('debe mostrar las dificultades', async () => {
    renderWithRouter(<LabGrid />);
    await waitFor(() => {
      expect(screen.getAllByText('Medium').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Easy').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('debe mostrar el selector de idioma', async () => {
    renderWithRouter(<LabGrid />);
    await waitFor(() => {
      expect(screen.getByText('EN')).toBeInTheDocument();
      expect(screen.getByText('ES')).toBeInTheDocument();
    });
  });
});
