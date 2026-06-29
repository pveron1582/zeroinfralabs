import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DesktopTerminal } from '../DesktopTerminal';
import { useScenarioStore } from '../../store/scenarioStore';
import type { Machine } from '../../types';

// Mock del store
const mockState = {
  msfState: null,
  setMsfState: vi.fn(),
  reportVulnerability: vi.fn(),
  setListeningPort: vi.fn(),
  listeningPort: null,
  currentDir: '/',
  setCurrentDir: vi.fn(),
  goHome: vi.fn(),
  blockingCommand: null,
  setBlockingCommand: vi.fn(),
  ftpSession: null,
  setFtpSession: vi.fn(),
  sshSession: null,
  setSshSession: vi.fn(),
  missions: [],
  currentScenario: { id: 'scenario-01', initialMachineId: 'attacker-01', category: 'General' } as any,
  language: 'es',
  showNotification: vi.fn(),
  activeApp: 'terminal',
  setActiveApp: vi.fn(),
  refreshBrowser: vi.fn(),
  toggleUiMode: vi.fn(),
};

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector) => selector(mockState)),
    { getState: vi.fn(() => mockState) }
  )
}));

const createMockMachine = (): Machine => ({
  id: 'attacker-01',
  machine_info: {
    hostname: 'kali',
    ip: '192.168.1.10',
    mac: '00:11:22:33:44:55',
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

describe('DesktopTerminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el escritorio y mostrar el reloj', () => {
    const machine = createMockMachine();
    render(
      <DesktopTerminal
        scenarioId="scenario-01"
        machine={machine}
        allMachines={[machine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Debe contener el botón de aplicaciones
    expect(screen.getByText('Aplicaciones')).toBeInTheDocument();
    
    // Al menos una terminal inicial debe estar renderizada
    expect(screen.getByText('Terminal 1 - root@kali')).toBeInTheDocument();
  });

  it('debe abrir una nueva terminal y asignarle un título incremental', async () => {
    const machine = createMockMachine();
    render(
      <DesktopTerminal
        scenarioId="scenario-01"
        machine={machine}
        allMachines={[machine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Click en botón agregar terminal (el de icono +)
    const addButton = screen.getByTitle('Nueva Terminal');
    fireEvent.click(addButton);

    // Debería aparecer "Terminal 2"
    expect(screen.getByText('Terminal 2 - root@kali')).toBeInTheDocument();
  });

  it('debe poder cerrar una terminal', async () => {
    const machine = createMockMachine();
    render(
      <DesktopTerminal
        scenarioId="scenario-01"
        machine={machine}
        allMachines={[machine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Terminal 1 inicialmente presente
    expect(screen.getByText('Terminal 1 - root@kali')).toBeInTheDocument();

    const closeButton = screen.getByTitle('Cerrar');
    fireEvent.click(closeButton);

    // Esperar a que la animación de cierre termine (300ms timeout en closeWindow)
    await waitFor(() => {
      expect(screen.queryByText('Terminal 1 - root@kali')).not.toBeInTheDocument();
    });
  });

  it('debe alternar la transparencia de la terminal usando la barra deslizante', async () => {
    const machine = createMockMachine();
    render(
      <DesktopTerminal
        scenarioId="scenario-01"
        machine={machine}
        allMachines={[machine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // El botón de opacidad debe iniciar en 50%
    const opacityBtn = screen.getByRole('button', { name: '50%' });
    expect(opacityBtn).toBeInTheDocument();

    // Al hacer click, debe abrir el slider
    fireEvent.click(opacityBtn);
    
    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('50');

    fireEvent.change(slider, { target: { value: '75' } });
    expect(slider.value).toBe('75');

    // Click en ✓ para confirmar
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('✓'));

    // El control vuelve a ser un botón con el nuevo porcentaje
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '75%' })).toBeInTheDocument();
    });
  });

  it('debe ajustar el tamaño de fuente usando la barra deslizante', async () => {
    const machine = createMockMachine();
    render(
      <DesktopTerminal
        scenarioId="scenario-01"
        machine={machine}
        allMachines={[machine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // El botón de fuente debe iniciar en 13px
    const fontBtn = screen.getByRole('button', { name: '13px' });
    expect(fontBtn).toBeInTheDocument();

    // Al hacer click, debe abrir el slider
    fireEvent.click(fontBtn);

    await waitFor(() => {
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('13');

    fireEvent.change(slider, { target: { value: '16' } });
    expect(slider.value).toBe('16');

    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('✓'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '16px' })).toBeInTheDocument();
    });
  });
});
