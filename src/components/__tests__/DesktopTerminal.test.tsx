import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DesktopTerminal } from '../DesktopTerminal';
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
  globalResetDoneForScenario: null,
  markGlobalResetDone: vi.fn(),
  // Identity slice (necesario para useIdentityStack)
  identityStack: [],
  pushIdentity: vi.fn(),
  popIdentity: vi.fn(),
  resetIdentity: vi.fn(),
  applyIdentity: vi.fn(),
  missions: [],
  currentScenario: { id: 'scenario-01', initialMachineId: 'attacker-01', category: 'General' } as any,
  language: 'es',
  showNotification: vi.fn(),
  activeApp: 'terminal',
  setActiveApp: vi.fn(),
  refreshBrowser: vi.fn(),
  toggleUiMode: vi.fn(),
  setTermColor: vi.fn(),
  termColor: '#10b981',
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

  function renderDesktop() {
    const machine = createMockMachine();
    const onOpenTour = vi.fn();
    render(
      <DesktopTerminal
        scenarioId="scenario-01"
        machine={machine}
        allMachines={[machine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
        onOpenTour={onOpenTour}
      />
    );
    return { machine, onOpenTour };
  }

  it('debe renderizar el escritorio, el reloj y los iconos sin ventanas abiertas', () => {
    renderDesktop();

    // Debe contener el botón de aplicaciones
    expect(screen.getByText('Aplicaciones')).toBeInTheDocument();

    // Sin ventanas iniciales: solo los iconos del escritorio
    expect(screen.queryByText('Terminal 1 - root@kali')).not.toBeInTheDocument();
    expect(screen.queryByText('Manual de uso - manual.pdf')).not.toBeInTheDocument();
    expect(screen.getByText('Terminal', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Fondos')).toBeInTheDocument();
    expect(screen.getByText('Manual', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Guía', { selector: 'span' })).toBeInTheDocument();
  });

  it('debe abrir el tour al hacer clic en el icono de Foxy', () => {
    const { onOpenTour } = renderDesktop();

    fireEvent.click(screen.getByText('Guía', { selector: 'span' }));

    expect(onOpenTour).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar las ventanas por encima de los iconos del escritorio', () => {
    renderDesktop();

    // Abrir una terminal para comparar z-index con los iconos
    fireEvent.click(screen.getByText('Terminal', { selector: 'span' }));

    const icons = document.querySelector('[data-tour="desktop-icons"]');
    const termWin = document.querySelector('[data-tour="terminal-window"]');

    expect(icons).not.toBeNull();
    expect(termWin).not.toBeNull();

    // Los iconos deben quedar por debajo de cualquier ventana: z-0 vs zIndex >= 1
    expect(icons?.className).toContain('z-0');
    expect(icons?.className).not.toContain('z-10');
    expect(parseInt((termWin as HTMLElement).style.zIndex, 10)).toBeGreaterThan(0);
  });

  it('debe abrir el manual PDF al hacer clic en su icono del escritorio', () => {
    renderDesktop();

    // Hacer clic en el icono Manual del escritorio
    fireEvent.click(screen.getByText('Manual', { selector: 'span' }));

    expect(screen.getByText('Manual de uso - manual.pdf')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-reader')).toBeInTheDocument();
  });

  it('debe abrir una terminal al hacer clic en su icono del escritorio', () => {
    renderDesktop();

    // Click en el icono Terminal del escritorio
    fireEvent.click(screen.getByText('Terminal', { selector: 'span' }));

    expect(screen.getByText('Terminal 1 - root@kali')).toBeInTheDocument();
  });

  it('debe abrir una nueva terminal y asignarle un título incremental', async () => {
    renderDesktop();

    // Click en botón agregar terminal (el de icono +)
    const addButton = screen.getByTitle('Nueva Terminal');
    fireEvent.click(addButton);

    // Debería aparecer "Terminal 1" (primera terminal)
    expect(screen.getByText('Terminal 1 - root@kali')).toBeInTheDocument();

    fireEvent.click(addButton);
    expect(screen.getByText('Terminal 2 - root@kali')).toBeInTheDocument();
  });

  it('debe poder cerrar una terminal', async () => {
    renderDesktop();

    // Abrir la primera terminal
    fireEvent.click(screen.getByText('Terminal', { selector: 'span' }));
    expect(screen.getByText('Terminal 1 - root@kali')).toBeInTheDocument();

    const closeButton = screen.getAllByTitle('Cerrar')[0];
    fireEvent.click(closeButton);

    // Esperar a que la animación de cierre termine (300ms timeout en closeWindow)
    await waitFor(() => {
      expect(screen.queryByText('Terminal 1 - root@kali')).not.toBeInTheDocument();
    });
  });

  it('debe alternar la transparencia de la terminal desde el panel de configuración', async () => {
    renderDesktop();

    // Abrir la primera terminal para poder usar sus ajustes
    fireEvent.click(screen.getByText('Terminal', { selector: 'span' }));

    // Abrir el panel de configuración de terminal
    fireEvent.click(screen.getByTitle('Configuración de terminal'));

    await waitFor(() => {
      expect(screen.getAllByRole('slider')).toHaveLength(2);
    });

    const [, opacitySlider] = screen.getAllByRole('slider') as HTMLInputElement[];
    expect(opacitySlider.value).toBe('50');

    fireEvent.change(opacitySlider, { target: { value: '75' } });
    expect(opacitySlider.value).toBe('75');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('debe ajustar el tamaño de fuente desde el panel de configuración', async () => {
    renderDesktop();

    fireEvent.click(screen.getByText('Terminal', { selector: 'span' }));

    // Abrir el panel de configuración de terminal
    fireEvent.click(screen.getByTitle('Configuración de terminal'));

    await waitFor(() => {
      expect(screen.getAllByRole('slider')).toHaveLength(2);
    });

    const [fontSlider] = screen.getAllByRole('slider') as HTMLInputElement[];
    expect(fontSlider.value).toBe('13');

    fireEvent.change(fontSlider, { target: { value: '16' } });
    expect(fontSlider.value).toBe('16');
    expect(screen.getByText('16px')).toBeInTheDocument();
  });

  it('debe cerrar el panel de configuración al hacer click fuera', async () => {
    renderDesktop();

    fireEvent.click(screen.getByText('Terminal', { selector: 'span' }));

    // Abrir el panel de configuración de terminal
    fireEvent.click(screen.getByTitle('Configuración de terminal'));

    await waitFor(() => {
      expect(screen.getAllByRole('slider')).toHaveLength(2);
    });

    // Click fuera del panel (sobre el documento)
    fireEvent.pointerDown(document.body);

    await waitFor(() => {
      expect(screen.queryAllByRole('slider')).toHaveLength(0);
    });
  });

  it('debe cambiar el color del texto desde el panel de configuración', async () => {
    renderDesktop();

    fireEvent.click(screen.getByText('Terminal', { selector: 'span' }));

    // Abrir el panel de configuración de terminal
    fireEvent.click(screen.getByTitle('Configuración de terminal'));

    await waitFor(() => {
      expect(screen.getByTitle('Naranja')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Naranja'));
    expect(mockState.setTermColor).toHaveBeenCalledWith('#f97316');
  });
});
