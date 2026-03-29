// ── components/__tests__/MissionPanel.test.tsx ─────────────────────
// Tests para el componente MissionPanel

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
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
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar el título del panel y empezar en modo sin ayuda', () => {
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
    expect(screen.getByText('Modo sin ayuda.')).toBeInTheDocument();
  });

  it('debe habilitar las misiones (solo activas y completadas) animadas al hacer clic en ayuda', () => {
    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    const helpBtn = screen.getByTitle('Habilitar ayuda');
    fireEvent.click(helpBtn);

    // Avanzar temporizadores para animaciones iniciales
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('Descubrir red')).toBeInTheDocument();
    expect(screen.getByText('Escanear puertos')).toBeInTheDocument();
    // Acceso SSH está pending, no se renderiza
    expect(screen.queryByText('Acceso SSH')).not.toBeInTheDocument();
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

  it('debe mostrar los números de misión formateados cuando se habilita ayuda', () => {
    render(
      <MissionPanel
        missions={mockMissions}
        allMachines={mockMachines}
        networkRange="192.168.1.0/24"
        onOpenBrowser={vi.fn()}
        onOpenNetworkMap={vi.fn()}
      />
    );

    fireEvent.click(screen.getByTitle('Habilitar ayuda'));

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    // 03 es pending, no se muestra
    expect(screen.queryByText('03')).not.toBeInTheDocument();
  });
});
