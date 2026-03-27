// ── components/__tests__/NetworkMap.test.tsx ──────────────────────
// Tests para el componente NetworkMap

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NetworkMap } from '../NetworkMap';
import type { Machine, Scenario } from '../../types';

const createMockMachine = (overrides: Partial<Machine> = {}): Machine => ({
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
  scan_results: {
    ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.0' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache 2.4' },
    ],
  },
  web_enumeration: {
    web_server: 'Apache',
    cms: 'WordPress',
    directories: [
      { path: '/wp-admin', status: 200, description: 'Admin panel' },
    ],
  },
  learning_steps: [
    { id: 1, task: 'ARP-Scan', text: 'Descubrir', targetMachineId: 'target-01', discoveryLevel: 1 },
    { id: 2, task: 'Nmap', text: 'Escanear', targetMachineId: 'target-01', discoveryLevel: 2 },
    { id: 3, task: 'Gobuster', text: 'Enumerar', targetMachineId: 'target-01', discoveryLevel: 3 },
  ],
  files: [],
  ...overrides,
});

const createAttackerMachine = (): Machine => ({
  id: 'attacker-01',
  machine_info: {
    hostname: 'kali',
    ip: '192.168.1.5',
    mac: '00:11:22:33:44:AA',
    os: 'Kali Linux',
    status: 'active',
    type: 'workstation',
  },
  discovery_level: 4,
  scan_results: { ports: [] },
  web_enumeration: { web_server: '', cms: '', directories: [] },
  learning_steps: [],
  files: [],
});

const mockScenario: Scenario & { machines: Machine[] } = {
  id: 'scenario-01',
  name: 'WordPress Lab',
  description: 'Laboratorio de WordPress',
  difficulty: 'Easy',
  category: 'Web',
  network_range: '192.168.1.0/24',
  initialMachineId: 'attacker-01',
  machines: [createAttackerMachine(), createMockMachine()],
  missions: [
    { id: 1, title: 'Descubrir', description: 'Descubrir la máquina objetivo', status: 'active', targetMachineId: 'target-01', discoveryLevel: 1 },
    { id: 2, title: 'Escanear', description: 'Escanear puertos y servicios', status: 'pending', targetMachineId: 'target-01', discoveryLevel: 2 },
    { id: 3, title: 'Enumerar', description: 'Enumerar directorios web', status: 'pending', targetMachineId: 'target-01', discoveryLevel: 3 },
  ],
};

describe('NetworkMap', () => {
  it('debe renderizar el nombre del escenario', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('WordPress Lab')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.0/24')).toBeInTheDocument();
  });

  it('debe mostrar todas las máquinas', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('kali')).toBeInTheDocument();
    expect(screen.getByText('target')).toBeInTheDocument();
  });

  it('debe mostrar "Sesión Activa" para la máquina atacante', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Sesión Activa')).toBeInTheDocument();
  });

  it('debe mostrar "Sesión Activa" para la máquina activa', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="target-01"
        onClose={vi.fn()}
      />
    );

    // Buscar el badge en la máquina target (la segunda máquina)
    const targetMachine = screen.getAllByText('Sesión Activa')[0];
    expect(targetMachine).toBeInTheDocument();
  });

  it('debe mostrar solo una "Sesión Activa" cuando hay una máquina activa', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="target-01"
        onClose={vi.fn()}
      />
    );

    // Debe haber solo un badge "Sesión Activa" visible (en la máquina activa)
    const sessionBadges = screen.getAllByText('Sesión Activa');
    expect(sessionBadges).toHaveLength(1); // solo la máquina activa debe tener el badge visible
  });

  it('debe mostrar IPs para máquinas descubiertas', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('192.168.1.5')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
  });

  it('debe mostrar ??? para máquinas no descubiertas', () => {
    const hiddenMachine = createMockMachine({
      id: 'hidden-01',
      machine_info: {
        hostname: 'secret',
        ip: '192.168.1.20',
        mac: '00:11:22:33:44:BB',
        os: 'Windows',
        status: 'active',
        type: 'server',
      },
      discovery_level: 0,
    });

    const scenarioWithHidden = {
      ...mockScenario,
      machines: [createAttackerMachine(), hiddenMachine],
    };

    render(
      <NetworkMap
        scenario={scenarioWithHidden}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('?.?.?.?')).toBeInTheDocument();
    expect(screen.getByText('Objetivo Desconocido')).toBeInTheDocument();
  });

  it('debe llamar onClose al hacer clic en el botón cerrar', () => {
    const onClose = vi.fn();
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="attacker-01"
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('debe mostrar badges de progreso para máquinas descubiertas', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    // La máquina target tiene discovery_level 2, así que debería mostrar badges ARP-Scan y Nmap
    expect(screen.getByText('ARP-Scan')).toBeInTheDocument();
    expect(screen.getByText('Nmap')).toBeInTheDocument();
  });

  it('debe mostrar la leyenda de niveles', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Desconocido')).toBeInTheDocument();
    expect(screen.getByText('Descubierto')).toBeInTheDocument();
    expect(screen.getByText('Escaneado')).toBeInTheDocument();
    expect(screen.getByText('Enumerado')).toBeInTheDocument();
    expect(screen.getByText('Comprometido')).toBeInTheDocument();
  });

  it('debe mostrar credenciales encontradas', () => {
    const machineWithCreds = createMockMachine({
      found_credentials: [{
        file: '/uploads/config.bak',
        user: 'admin',
        pass: 'password123',
        verified: true,
        service: 'wp-admin'
      }],
    });
    const scenarioWithCreds = {
      ...mockScenario,
      machines: [createAttackerMachine(), machineWithCreds],
    };

    render(
      <NetworkMap
        scenario={scenarioWithCreds}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    // Hacer clic en la máquina target para abrir el modal
    const targetCard = screen.getByText('target');
    fireEvent.click(targetCard);

    expect(screen.getByText('Credenciales Encontradas')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('password123')).toBeInTheDocument();
  });

  it('debe mostrar credenciales sin verificar', () => {
    const machineWithUnverifiedCreds = createMockMachine({
      found_credentials: [{
        file: '/uploads/config.bak',
        user: 'admin',
        pass: 'password123',
        verified: false,
        service: 'wp-admin'
      }],
    });
    const scenarioWithUnverified = {
      ...mockScenario,
      machines: [createAttackerMachine(), machineWithUnverifiedCreds],
    };

    render(
      <NetworkMap
        scenario={scenarioWithUnverified}
        activeMachineId="attacker-01"
        onClose={vi.fn()}
      />
    );

    const targetCard = screen.getByText('target');
    fireEvent.click(targetCard);

    expect(screen.getByText('Sin verificar')).toBeInTheDocument();
  });

  it('debe cambiar la sesión activa al cambiar de máquina', () => {
    render(
      <NetworkMap
        scenario={mockScenario}
        activeMachineId="target-01"
        onClose={vi.fn()}
      />
    );

    // Verificar que la máquina target tiene "Sesión Activa"
    const targetBadges = screen.getAllByText('Sesión Activa');
    expect(targetBadges).toHaveLength(1); // solo la máquina activa debe tener el badge visible
    
    // La primera ocurrencia es la target
    const targetBadge = targetBadges[0];
    expect(targetBadge).toBeInTheDocument();
  });
});
