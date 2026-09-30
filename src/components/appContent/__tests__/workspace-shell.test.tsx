// ── components/appContent/__tests__/workspace-shell.test.tsx ─────
// P1 3.6 (cierre): la rama del cuerpo del workspace y la vista de landing.
// WorkspaceBody decide qué app se monta según `uiMode`/`activeApp`; si se
// rompe, el alumno ve la app equivocada o ninguna.
//
// Las apps hijas (Terminal, WindowsDesktop, FakeBrowser, Burp) se mockean:
// tienen su propio setup pesado y acá lo que se prueba es la SELECCIÓN de
// rama, que es lo que no estaba cubierto.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingView } from '../LandingView';
import { WorkspaceBody } from '../WorkspaceBody';
import { makeTestScenario, makeTestMachine } from '../../../test/fixtures';

vi.mock('../../Terminal', () => ({ Terminal: () => <div data-testid="app-terminal" /> }));
vi.mock('../../DesktopTerminal', () => ({ DesktopTerminal: () => <div data-testid="app-desktop-terminal" /> }));
vi.mock('../../WindowsDesktop', () => ({ WindowsDesktop: () => <div data-testid="app-windows-desktop" /> }));
vi.mock('../../FakeBrowser', () => ({ FakeBrowser: () => <div data-testid="app-browser" /> }));
vi.mock('../../burpsuite', () => ({ BurpSuite: () => <div data-testid="app-burpsuite" /> }));
vi.mock('../../MachineLoader', () => ({
  MachineLoader: ({ machineName, machineIp }: { machineName: string; machineIp: string }) => (
    <div data-testid="machine-loader">{machineName} @ {machineIp}</div>
  ),
}));

const scenario = makeTestScenario({ category: 'Web' });

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    uiMode: 'classic',
    rdpMachine: null,
    activeMachine: scenario.machines[0],
    machines: scenario.machines,
    currentScenario: scenario,
    currentMissionId: 1,
    activeApp: 'terminal',
    browserKey: 0,
    showMachineLoader: false,
    loadingMachine: null,
    language: 'es' as const,
    termColor: '#0d1117',
    completeMission: vi.fn(),
    findCredentials: vi.fn(),
    verifyCredentials: vi.fn(),
    changeMachine: vi.fn(),
    setPossibleUsers: vi.fn(),
    reportVulnerability: vi.fn(),
    setActiveApp: vi.fn(),
    closeWindowsDesktop: vi.fn(),
    onRequestExit: vi.fn(),
    openFoxyTour: vi.fn(),
    checkMissionCompletion: vi.fn(),
    ...overrides,
  } as unknown as React.ComponentProps<typeof WorkspaceBody>;
}

describe('LandingView', () => {
  it('muestra "Loading..." cuando no hay máquina cargando', () => {
    render(<LandingView showMachineLoader={false} loadingMachine={null} language="es" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('muestra el loader con los datos de la máquina que se está arrancando', () => {
    const machine = makeTestMachine({
      machine_info: { ...makeTestMachine().machine_info, hostname: 'dc-01', ip: '10.0.0.5' },
    });
    render(<LandingView showMachineLoader loadingMachine={machine} language="es" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('dc-01 @ 10.0.0.5')).toBeInTheDocument();
  });

  it('con showMachineLoader pero sin máquina, cae al fallback', () => {
    render(<LandingView showMachineLoader loadingMachine={null} language="en" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});

describe('WorkspaceBody — selección de rama', () => {
  it('classic monta la Terminal', () => {
    render(<WorkspaceBody {...baseProps()} />);
    expect(screen.getByTestId('app-terminal')).toBeInTheDocument();
  });

  it('classic en un lab Web monta las TRES apps a la vez (la activa se ve, las otras se ocultan)', () => {
    // No es un if/else: las tres conviven y la que no está activa lleva la
    // clase `hidden`. Montarlas y ocultarlas es lo que conserva el estado
    // (historial de la terminal, sesión del navegador) al cambiar de tab.
    render(<WorkspaceBody {...baseProps({ activeApp: 'terminal' })} />);
    expect(screen.getByTestId('app-terminal')).toBeInTheDocument();
    expect(screen.getByTestId('app-browser')).toBeInTheDocument();
    expect(screen.getByTestId('app-burpsuite')).toBeInTheDocument();
  });

  it('classic en un lab NO Web no monta navegador ni Burp (no hay nada que mostrar)', () => {
    const activeDir = makeTestScenario({ category: 'Active Directory' });
    render(<WorkspaceBody {...baseProps({ currentScenario: activeDir })} />);
    expect(screen.getByTestId('app-terminal')).toBeInTheDocument();
    expect(screen.queryByTestId('app-browser')).not.toBeInTheDocument();
    expect(screen.queryByTestId('app-burpsuite')).not.toBeInTheDocument();
  });

  it('el loader REEMPLAZA a la terminal mientras se arranca la máquina', () => {
    render(<WorkspaceBody {...baseProps({ showMachineLoader: true, loadingMachine: scenario.machines[0] })} />);
    expect(screen.getByTestId('machine-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('app-terminal')).not.toBeInTheDocument();
  });

  it('windows-desktop con rdpMachine monta el escritorio Windows', () => {
    const rdpMachine = makeTestMachine({
      machine_info: { ...makeTestMachine().machine_info, family: 'windows', hostname: 'WIN-DC01' },
    });
    render(<WorkspaceBody {...baseProps({ uiMode: 'windows-desktop', rdpMachine })} />);
    expect(screen.getByTestId('app-windows-desktop')).toBeInTheDocument();
    expect(screen.queryByTestId('app-terminal')).not.toBeInTheDocument();
  });

  it('windows-desktop SIN rdpMachine cae al DesktopTerminal (nunca pantalla en blanco)', () => {
    // Sin `rdpMachine` no hay escritorio que abrir: la rama final es el
    // DesktopTerminal, no un return vacío.
    render(<WorkspaceBody {...baseProps({ uiMode: 'windows-desktop', rdpMachine: null })} />);
    expect(screen.getByTestId('app-desktop-terminal')).toBeInTheDocument();
  });

  it('uiMode desktop monta el DesktopTerminal', () => {
    render(<WorkspaceBody {...baseProps({ uiMode: 'desktop' })} />);
    expect(screen.getByTestId('app-desktop-terminal')).toBeInTheDocument();
    expect(screen.queryByTestId('app-browser')).not.toBeInTheDocument();
  });
});
