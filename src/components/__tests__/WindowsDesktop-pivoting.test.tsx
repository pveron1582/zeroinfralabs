// ── components/__tests__/WindowsDesktop-pivoting.test.tsx ────────
// Cada terminal del escritorio Windows recuerda A QUÉ MÁQUINA está
// conectada: al conectar una a otra (pivoting), las demás no se mueven.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WindowsDesktop } from '../WindowsDesktop';
import type { Machine } from '../../types';

// Terminal stub: no monta la terminal real (no hace falta para esto), solo
// expone su terminalId/machine y permite "conectar"la con un clic.
vi.mock('../Terminal', async () => {
  const React = await import('react');
  const Stub = (props: {
    terminalId?: string;
    machine: Machine;
    onChangeMachine?: (id: string) => void;
  }) => React.createElement(
    'button',
    {
      type: 'button',
      'data-testid': 'stub-terminal',
      'data-terminal-id': props.terminalId,
      'data-machine': props.machine.id,
      onClick: () => props.onChangeMachine?.('victim-01'),
    },
    props.terminalId,
  );
  return { Terminal: Stub };
});

const mockState = {
  language: 'es' as const,
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
  rdpSession: null,
  setSshSession: vi.fn(),
  setRdpSession: vi.fn(),
  globalResetDoneForScenario: 'scenario-w3',
  markGlobalResetDone: vi.fn(),
  setSuUser: vi.fn(),
  setPrivescCompleted: vi.fn(),
  resetPrivescCompleted: vi.fn(),
  identityStack: [],
  pushIdentity: vi.fn(),
  popIdentity: vi.fn(),
  resetIdentity: vi.fn(),
  applyIdentity: vi.fn(),
  missions: [],
  currentScenario: { initialMachineId: 'attacker-01' },
  showNotification: vi.fn(),
  registerTerminal: vi.fn(),
  unregisterTerminal: vi.fn(),
  setTerminalMachine: vi.fn(),
};

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector: (s: typeof mockState) => unknown) => selector(mockState)),
    { getState: vi.fn(() => mockState) },
  ),
}));

function baseMachine(id: string, hostname: string): Machine {
  return {
    id,
    machine_info: {
      hostname, ip: '10.10.10.50', mac: '52:54:00:12:34:56',
      os: 'Windows Server 2019', status: 'up', type: 'victim', family: 'windows',
    },
    discovery_level: 2,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    files: [],
    win: { currentUser: 'Administrator', isAdmin: true, computerName: hostname },
  } as Machine;
}

const winMachine = baseMachine('win-01', 'WIN7-LAB');
const victimMachine = baseMachine('victim-01', 'web-01');

function renderDesktop() {
  return render(
    <WindowsDesktop
      scenarioId="scenario-08"
      machine={winMachine}
      desktopMachine={winMachine}
      allMachines={[winMachine, victimMachine]}
      currentMissionId={1}
      onMissionComplete={vi.fn()}
      onCredentialsFound={vi.fn()}
      onChangeMachine={vi.fn()}
      onDisconnect={vi.fn()}
    />,
  );
}

function openTwoTerminals() {
  fireEvent.click(screen.getByTestId('desktop-icon-winterm'));
  fireEvent.click(screen.getByTestId('desktop-icon-winterm'));
  return screen.getAllByTestId('stub-terminal');
}

describe('WindowsDesktop — conexión aislada por terminal (pivoting)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.globalResetDoneForScenario = 'scenario-w3';
  });

  it('conectar una terminal a otra máquina no mueve a las demás', () => {
    renderDesktop();
    const terms = openTwoTerminals();
    expect(terms.map(t => t.getAttribute('data-machine'))).toEqual(['win-01', 'win-01']);

    fireEvent.click(terms[0]);

    const after = screen.getAllByTestId('stub-terminal');
    expect(after[0].getAttribute('data-machine')).toBe('victim-01');
    expect(after[1].getAttribute('data-machine')).toBe('win-01');
    // Cada terminal mantiene su propio id (clave de aislamiento).
    expect(after[0].getAttribute('data-terminal-id'))
      .not.toBe(after[1].getAttribute('data-terminal-id'));
  });

  it('la ventana conectada se renombra con el destino y el store se entera', () => {
    renderDesktop();
    const terms = openTwoTerminals();
    fireEvent.click(terms[1]);

    expect(screen.getAllByText(/Windows PowerShell \(2\) - .*@web-01/).length).toBeGreaterThan(0);
    expect(mockState.setTerminalMachine).toHaveBeenCalledWith(expect.any(String), 'victim-01');
    expect(mockState.registerTerminal).toHaveBeenCalledWith(expect.any(String), 2, 'victim-01');
  });

  it('cerrar una terminal la da de baja en el store', () => {
    renderDesktop();
    openTwoTerminals();
    expect(mockState.unregisterTerminal).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByLabelText('Cerrar')[0]);

    expect(mockState.unregisterTerminal).toHaveBeenCalledTimes(1);
    expect(mockState.unregisterTerminal).toHaveBeenCalledWith(expect.any(String));
  });
});
