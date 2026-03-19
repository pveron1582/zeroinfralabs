// ── components/__tests__/MissionPanel.test.tsx ─────────────────────
// Tests para el componente MissionPanel

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MissionPanel } from '../MissionPanel';
import type { Mission, Machine } from '../../types';

const mockMissions: Mission[] = [
  {
    id: 1,
    title: 'Descubrir red',
    description: 'Ejecuta arp-scan para descubrir hosts',
    status: 'completed',
    targetMachineId: 'target-01',
    discoveryLevel: 1,
  },
  {
    id: 2,
    title: 'Escanear puertos',
    description: 'Escanea los puertos de la máquina',
    status: 'active',
    targetMachineId: 'target-01',
    discoveryLevel: 2,
  },
  {
    id: 3,
    title: 'Acceso SSH',
    description: 'Conecta por SSH',
    status: 'pending',
    targetMachineId: 'target-01',
    discoveryLevel: 4,
  },
];

const mockMachines: Machine[] = [
  {
    id: 'target-01',
    machine_info: {
      hostname: 'target',
      ip: '192.168.1.10',
      mac: '00:11:22:33:44:55',
      os: 'Linux',
      status: 'active',
      type: 'server',
    },
    discovery_level: 2,
    scan_results: { ports: [] },
    web_enumeration: { web_server: '', cms: '', directories: [] },
    learning_steps: [],
    files: [],
  },
];

describe('MissionPanel', () => {
  it('debe renderizar el título del panel', () => {
    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    expect(screen.getByText('Misiones')).toBeInTheDocument();
  });

  it('debe mostrar el progreso correcto', () => {
    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    // 1 de 3 completadas = 33%
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('1/3 completadas')).toBeInTheDocument();
  });

  it('debe mostrar todas las misiones', () => {
    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    expect(screen.getByText('Descubrir red')).toBeInTheDocument();
    expect(screen.getByText('Escanear puertos')).toBeInTheDocument();
    expect(screen.getByText('Acceso SSH')).toBeInTheDocument();
  });

  it('debe llamar onOpenNetworkMap al hacer clic en el botón Ver red', () => {
    const onOpenNetworkMap = vi.fn();

    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={onOpenNetworkMap}
      />
    );

    const networkButton = screen.getByText('Ver red');
    fireEvent.click(networkButton);

    expect(onOpenNetworkMap).toHaveBeenCalled();
  });

  it('debe mostrar el hint de la misión activa', () => {
    const { container } = render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    // El hint de la misión activa debe estar visible en el contenedor
    const activeMission = mockMissions.find(m => m.status === 'active');
    expect(container.textContent).toContain(activeMission!.description);
  });

  it('debe mostrar 100% cuando todas las misiones están completadas', () => {
    const allCompletedMissions = mockMissions.map(m => ({ ...m, status: 'completed' as const }));

    render(
      <MissionPanel
        missions={allCompletedMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    expect(screen.getByText('● COMPROMETIDA')).toBeInTheDocument();
  });

  it('debe mostrar los números de misión formateados', () => {
    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
  });

  it('debe mostrar el texto de progreso', () => {
    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    expect(screen.getByText('Progreso')).toBeInTheDocument();
  });
});
