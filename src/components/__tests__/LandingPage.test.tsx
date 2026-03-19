// ── components/__tests__/LandingPage.test.tsx ──────────────────────
// Tests para el componente LandingPage

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LandingPage } from '../LandingPage';
import type { Scenario } from '../../types';

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
      { id: 1, title: 'M1', description: 'D1', status: 'active', targetMachineId: 't1', discoveryLevel: 1 },
      { id: 2, title: 'M2', description: 'D2', status: 'pending', targetMachineId: 't1', discoveryLevel: 2 },
    ],
  },
  {
    id: 'scenario-02',
    name: 'SSH Brute Force',
    description: 'Ataque de fuerza bruta SSH',
    difficulty: 'Medium',
    category: 'Network',
    network_range: '10.0.0.0/24',
    initialMachineId: 'attacker-01',
    machines: [],
    missions: [
      { id: 1, title: 'M1', description: 'D1', status: 'active', targetMachineId: 't1', discoveryLevel: 1 },
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
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('CyberOps')).toBeInTheDocument();
      expect(screen.getByText('v4.5')).toBeInTheDocument();
    });
  });

  it('debe mostrar la cantidad de labs disponibles', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('3 labs disponibles')).toBeInTheDocument();
    });
  });

  it('debe renderizar el título principal', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Elegí un/)).toBeInTheDocument();
      expect(screen.getByText(/laboratorio/)).toBeInTheDocument();
    });
  });

  it('debe mostrar todas las tarjetas de escenarios', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('WordPress Lab')).toBeInTheDocument();
      expect(screen.getByText('SSH Brute Force')).toBeInTheDocument();
      expect(screen.getByText('EternalBlue')).toBeInTheDocument();
    });
  });

  it('debe mostrar la dificultad de cada escenario', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Fácil')).toBeInTheDocument();
      expect(screen.getByText('Medio')).toBeInTheDocument();
      expect(screen.getByText('Difícil')).toBeInTheDocument();
    });
  });

  it('debe mostrar la categoría de cada escenario', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Web')).toBeInTheDocument();
      expect(screen.getByText('Network')).toBeInTheDocument();
      expect(screen.getByText('Exploit')).toBeInTheDocument();
    });
  });

  it('debe mostrar el rango de red de cada escenario', async () => {
    const { container } = render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(container.textContent).toContain('192.168.1.0/24');
      expect(container.textContent).toContain('10.0.0.0/24');
    });
  });

  it('debe mostrar la cantidad de misiones por escenario', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('2 misiones')).toBeInTheDocument();
      expect(screen.getByText('1 misiones')).toBeInTheDocument();
    });
  });

  it('debe llamar onSelect al hacer clic en una tarjeta', async () => {
    const onSelect = vi.fn();
    render(<LandingPage scenarios={mockScenarios} onSelect={onSelect} />);

    await waitFor(() => {
      const card = screen.getByText('WordPress Lab');
      fireEvent.click(card);
    });

    expect(onSelect).toHaveBeenCalledWith('scenario-01');
  });

  it('debe mostrar los badges hexadecimales', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('0x01')).toBeInTheDocument();
      expect(screen.getByText('0x02')).toBeInTheDocument();
      expect(screen.getByText('0x03')).toBeInTheDocument();
    });
  });

  it('debe mostrar las herramientas de cada escenario', async () => {
    const { container } = render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      // Herramientas del escenario 01
      expect(container.textContent).toContain('arp-scan');
      expect(container.textContent).toContain('nmap');
      expect(container.textContent).toContain('gobuster');
      expect(container.textContent).toContain('ssh');
    });
  });

  it('debe mostrar el botón INICIAR en cada tarjeta', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      const iniciarButtons = screen.getAllByText('INICIAR');
      expect(iniciarButtons.length).toBe(3);
    });
  });

  it('debe renderizar el footer', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/CyberOps · Entorno de práctica controlado/)).toBeInTheDocument();
    });
  });

  it('debe mostrar el subtítulo correcto', async () => {
    render(<LandingPage scenarios={mockScenarios} onSelect={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Pentesting Lab Simulator')).toBeInTheDocument();
    });
  });
});
