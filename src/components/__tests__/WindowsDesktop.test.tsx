// ── components/__tests__/WindowsDesktop.test.tsx ──────────────────
// Escritorio Windows: monta, abre apps del menú inicio, desconecta RDP.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WindowsDesktop } from '../WindowsDesktop';
import type { Machine } from '../../types';

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
    vi.fn((selector) => selector(mockState)),
    { getState: vi.fn(() => mockState) },
  ),
}));

const winMachine: Machine = {
  id: 'win-01',
  machine_info: {
    hostname: 'WIN7-LAB',
    ip: '192.168.60.10',
    mac: '08:00:27:C4:D5:E6',
    os: 'Windows 7 Professional SP1',
    status: 'up',
    type: 'workstation',
    family: 'windows',
  },
  discovery_level: 2,
  scan_results: {
    ports: [
      { port: 3389, protocol: 'tcp', state: 'open', service: 'ms-wbt-server', version: 'RDP' },
    ],
  },
  web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
  learning_steps: [],
  files: [
    { path: '/C:/.dir', content: '', type: 'text', owner: 'Administrators', group: 'Administrators', mode: 0o755 },
    { path: '/C:/Users/.dir', content: '', type: 'text', owner: 'Administrators', group: 'Administrators', mode: 0o755 },
    { path: '/C:/Users/win7user/.dir', content: '', type: 'text', owner: 'win7user', group: 'win7user', mode: 0o755 },
    { path: '/C:/Users/win7user/Desktop/.dir', content: '', type: 'text', owner: 'win7user', group: 'win7user', mode: 0o755 },
    {
      path: '/C:/Users/win7user/Desktop/notes.txt',
      content: 'Desktop notes: patch Tuesday can wait.',
      type: 'text', owner: 'win7user', group: 'win7user', mode: 0o644,
    },
  ],
  win: { currentUser: 'win7user', isAdmin: false, computerName: 'WIN7-LAB' },
};

function renderDesktop(onDisconnect = vi.fn()) {
  const utils = render(
    <WindowsDesktop
      scenarioId="scenario-08"
      machine={winMachine}
      desktopMachine={winMachine}
      allMachines={[winMachine]}
      currentMissionId={1}
      onMissionComplete={vi.fn()}
      onCredentialsFound={vi.fn()}
      onChangeMachine={vi.fn()}
      onDisconnect={onDisconnect}
    />,
  );
  return { ...utils, onDisconnect };
}

describe('WindowsDesktop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState.globalResetDoneForScenario = 'scenario-w3';
  });

  it('debe montar el escritorio con iconos y taskbar', () => {
    renderDesktop();
    expect(screen.getByTestId('windows-desktop')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-icon-explorer')).toBeInTheDocument();
    expect(screen.getByTestId('start-button')).toBeInTheDocument();
    expect(screen.getByTestId('rdp-disconnect')).toBeInTheDocument();
  });

  it('debe abrir el menú inicio', () => {
    renderDesktop();
    fireEvent.click(screen.getByTestId('start-button'));
    expect(screen.getByTestId('start-menu')).toBeInTheDocument();
  });

  it('al hacer clic en el icono Explorador abre la ventana', () => {
    renderDesktop();
    fireEvent.click(screen.getByTestId('desktop-icon-explorer'));
    expect(screen.getByTestId('win-window-explorer')).toBeInTheDocument();
    expect(screen.getByTestId('win-explorer')).toBeInTheDocument();
  });

  it('el Explorador lista entradas del home del usuario', () => {
    renderDesktop();
    fireEvent.click(screen.getByTestId('desktop-icon-explorer'));
    expect(screen.getByTestId('explorer-entry-Desktop')).toBeInTheDocument();
  });

  it('desconectar invoca onDisconnect', () => {
    const { onDisconnect } = renderDesktop();
    fireEvent.click(screen.getByTestId('rdp-disconnect'));
    expect(onDisconnect).toHaveBeenCalled();
  });

  // ── Hasta 5 terminales PowerShell, aislados entre sí ─────────────
  it('abrir la terminal dos veces crea dos ventanas independientes', () => {
    renderDesktop();
    fireEvent.click(screen.getByTestId('desktop-icon-winterm'));
    fireEvent.click(screen.getByTestId('desktop-icon-winterm'));

    expect(screen.getAllByTestId('win-window-winterm')).toHaveLength(2);
    // Dos componentes Terminal vivos → cada uno con su terminalId propio.
    expect(screen.getAllByRole('application')).toHaveLength(2);
    expect(screen.getAllByText('Windows PowerShell')).not.toHaveLength(0);
    expect(screen.getAllByText('Windows PowerShell (2)')).not.toHaveLength(0);
    // Se registran en el store (NetworkMap) con la máquina del escritorio.
    expect(mockState.registerTerminal).toHaveBeenCalledWith(expect.any(String), 2, 'win-01');
  });

  it('limita a 5 terminales y avisa al intentar abrir el sexto', () => {
    renderDesktop();
    for (let i = 0; i < 6; i++) {
      fireEvent.click(screen.getByTestId('desktop-icon-winterm'));
    }
    expect(screen.getAllByRole('application')).toHaveLength(5);
    expect(mockState.showNotification).toHaveBeenCalledWith(expect.stringContaining('5'));
  });

  it('las demás apps siguen siendo singletons (no se duplican)', () => {
    renderDesktop();
    fireEvent.click(screen.getByTestId('desktop-icon-explorer'));
    fireEvent.click(screen.getByTestId('desktop-icon-explorer'));
    expect(screen.getAllByTestId('win-window-explorer')).toHaveLength(1);
  });

  it('cada terminal recuerda sus propios comandos (historiales aislados)', async () => {
    renderDesktop();
    fireEvent.click(screen.getByTestId('desktop-icon-winterm'));
    fireEvent.click(screen.getByTestId('desktop-icon-winterm'));

    const roots = screen.getAllByRole('application');
    const inputOf = (root: HTMLElement) =>
      root.querySelector('input[aria-label="Terminal command input"]') as HTMLInputElement;
    const run = (root: HTMLElement, cmd: string) => {
      const input = inputOf(root);
      fireEvent.change(input, { target: { value: cmd } });
      fireEvent.keyDown(input, { key: 'Enter' });
    };

    run(roots[0], 'echo alpha-unico');
    await waitFor(() => expect(roots[0].textContent).toContain('alpha-unico'));
    expect(roots[1].textContent).not.toContain('alpha-unico');

    run(roots[1], 'echo beta-unico');
    await waitFor(() => expect(roots[1].textContent).toContain('beta-unico'));
    expect(roots[0].textContent).not.toContain('beta-unico');
  });
});
