// ── components/__tests__/LandingPage.test.tsx ──────────────────────
// Tests para el componente LandingPage

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../LandingPage';
import type { Scenario } from '../../types';

// Reset storage before each test to ensure consistent language state
beforeEach(() => {
  localStorage.clear();
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

const mockScenarios: Scenario[] = [
  {
    id: 'scenario-01',
    name: 'WordPress Lab',
    description: 'Laboratorio de WordPress vulnerable',
    difficulty: 'Easy',
    category: 'Web',
    network_range: '192.168.1.0/24',
    initialMachineId: 'attacker-01',
    machines: [],
    missions: [
      { id: 1, title: 'M1', description: 'D1', status: 'active', targetMachineId: 't1', discoveryLevel: 1, hintLevel: 0 },
      { id: 2, title: 'M2', description: 'D2', status: 'pending', targetMachineId: 't1', discoveryLevel: 2, hintLevel: 0 },
    ],
  },
  {
    id: 'scenario-02',
    name: 'Web OSINT & SSH Compromise',
    description: 'Web reconnaissance and SSH compromise using Hydra',
    difficulty: 'Medium',
    category: 'Network',
    network_range: '10.0.0.0/24',
    initialMachineId: 'attacker-01',
    machines: [],
    missions: [
      { id: 1, title: 'M1', description: 'D1', status: 'active', targetMachineId: 't1', discoveryLevel: 1, hintLevel: 0 },
    ],
  },
  {
    id: 'scenario-03',
    name: 'EternalBlue',
    description: 'Exploit MS17-010',
    difficulty: 'Hard',
    category: 'Exploit',
    network_range: '10.0.0.0/24',
    initialMachineId: 'attacker-01',
    machines: [],
    missions: [],
  },
];

describe('LandingPage', () => {
  it('debe renderizar el header con el logo', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('ZI Labs')).toBeInTheDocument();
      expect(screen.getByText('v4.5')).toBeInTheDocument();
    });
  });

  it('debe mostrar la cantidad de labs disponibles', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/3 missions/)).toBeInTheDocument();
    });
  });

  it('debe renderizar el título principal', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Choose a/)).toBeInTheDocument();
      expect(screen.getByText('lab')).toBeInTheDocument();
    });
  });

  it('debe mostrar todas las tarjetas de escenarios', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('WordPress Lab')).toBeInTheDocument();
      expect(screen.getByText('Web OSINT & SSH Compromise')).toBeInTheDocument();
      expect(screen.getByText('EternalBlue')).toBeInTheDocument();
    });
  });

  it('debe mostrar la dificultad de cada escenario', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
    });
  });

  it('debe mostrar la categoría de cada escenario', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Web')).toBeInTheDocument();
      expect(screen.getByText('Network')).toBeInTheDocument();
      expect(screen.getByText('Exploit')).toBeInTheDocument();
    });
  });

  it('debe mostrar el rango de red de cada escenario', async () => {
    const { container } = renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(container.textContent).toContain('192.168.1.0/24');
      expect(container.textContent).toContain('10.0.0.0/24');
    });
  });

  it('debe mostrar la cantidad de misiones por escenario', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('2 missions')).toBeInTheDocument();
      expect(screen.getByText('1 missions')).toBeInTheDocument();
    });
  });

  it('debe llamar onSelect al hacer clic en START', async () => {
    const onSelect = vi.fn();
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={onSelect} />);

    await waitFor(() => {
      const startButtons = screen.getAllByText('START');
      fireEvent.click(startButtons[0]); // Click en el primer botón START (WordPress Lab)
    });

    expect(onSelect).toHaveBeenCalledWith('scenario-01');
  });

  it('debe mostrar los badges hexadecimales', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('0x01')).toBeInTheDocument();
      expect(screen.getByText('0x02')).toBeInTheDocument();
      expect(screen.getByText('0x03')).toBeInTheDocument();
    });
  });

  it('debe mostrar las herramientas de cada escenario', async () => {
    const { container } = renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      // Herramientas del escenario 01
      expect(container.textContent).toContain('arp-scan');
      expect(container.textContent).toContain('nmap');
      expect(container.textContent).toContain('gobuster');
      expect(container.textContent).toContain('ssh');
    });
  });

  it('debe mostrar el botón START en cada tarjeta', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      const startButtons = screen.getAllByText('START');
      expect(startButtons.length).toBe(3);
    });
  });

  it('debe renderizar el footer', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/ZI Labs · Controlled practice environment/)).toBeInTheDocument();
    });
  });

  it('debe mostrar el subtítulo correcto', async () => {
    renderWithRouter(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Pentesting Lab Simulator')).toBeInTheDocument();
    });
  });
});
