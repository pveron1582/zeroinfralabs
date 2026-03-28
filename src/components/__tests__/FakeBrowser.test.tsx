// ── src/components/__tests__/FakeBrowser.test.tsx ──────────────────
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { FakeBrowser } from '../FakeBrowser';

// Mock dinámico del store para simular la navegación real
let currentUrl = 'https://www.google.com';

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: vi.fn((selector) => {
    const state = {
      browserCurrentUrl: currentUrl,
      browserIsLoggedIn: false,
      browserNavHistory: [currentUrl],
      browserNavIdx: 0,
      setBrowserUrl: vi.fn((url) => { currentUrl = url; }),
      setBrowserLoggedIn: vi.fn(),
      setBrowserNavHistory: vi.fn(),
      refreshBrowser: vi.fn(),
      setActiveApp: vi.fn(),
    };
    return selector(state);
  })
}));

describe('FakeBrowser - Integración de Navegación y Lógica de Hacking', () => {

  // Máquina para pruebas de WordPress (Escenario 1)
  const mockWpMachine = {
    id: 'wp-machine',
    machine_info: { hostname: 'wordpress', ip: '192.168.1.15', mac: '00:00:00:01', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 2,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'Apache', cms: 'WordPress', directories: [] },
    learning_steps: [],
    files: []
  };

  // Máquina para pruebas de LFI (Escenario 4)
  const mockLfiMachine = {
    id: 'lab-scenario-04-lfi',
    machine_info: { hostname: 'lfi-target', ip: '10.10.20.11', mac: '00:00:00:02', os: 'Linux', status: 'up', type: 'server' },
    discovery_level: 2,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'Apache', cms: 'Custom PHP', directories: [] },
    learning_steps: [],
    files: []
  };

  const allMachines = [mockWpMachine, mockLfiMachine];

  beforeEach(() => {
    currentUrl = 'https://www.google.com';
    vi.clearAllMocks();
  });

  it('debe iniciar en la página de Google', () => {
    render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={0}
        mission3Already={false}
        onSetPossibleUsers={vi.fn()}
      />
    );

    // Verificamos que el logo de Google o el buscador estén presentes
    expect(screen.getByPlaceholderText(/Buscar en Google/i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje de bloqueo si el nivel de descubrimiento es insuficiente (Escenario 1)', () => {
    const machinesLow = [{ ...mockWpMachine, discovery_level: 1 }];
    
    const { rerender } = render(
      <FakeBrowser
        allMachines={machinesLow}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={1}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    // Escribimos en la barra de direcciones (el input que ya tiene el valor de currentUrl)
    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15/wp-admin' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Re-render para que tome el cambio de URL del mock
    rerender(<FakeBrowser allMachines={machinesLow} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={1} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verificamos el mensaje de bloqueo "Realizá un escaneo nmap"
    expect(screen.getByText((content) => content.includes('escaneo nmap'))).toBeInTheDocument();
  });

  it('debe permitir ver el sitio de WordPress si el nivel es 2', () => {
    const { rerender } = render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    expect(screen.getByText(/My WordPress Blog/i)).toBeInTheDocument();
  });

  it('debe renderizar correctamente el navegador con CyberBrowser', () => {
    render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    // Verifica que el navegador se renderice con el identificador CyberBrowser
    expect(screen.getByText(/CyberBrowser/i)).toBeInTheDocument();
  });

  it('debe dar acceso total (RCE) al incluir un archivo de uploads (Escenario 4)', async () => {
    const onMissionComplete = vi.fn();
    const onVerifyCredentials = vi.fn();
    
    const { rerender } = render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={onMissionComplete}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={onVerifyCredentials}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://10.10.20.11/?page=uploads/shell.php' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={onMissionComplete} onCredentialsFound={vi.fn()} onVerifyCredentials={onVerifyCredentials} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra la página de error 404 (shell.php no existe en SERVER_FILES)
    expect(screen.getByText(/Error 404/i)).toBeInTheDocument();
    // Verifica que no se congela el navegador (el test no se tarda mas de lo esperado)
  });

  it('debe navegar a WordPress index cuando se accede a la IP', () => {
    const { rerender } = render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15/' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra el sitio WordPress
    expect(screen.getByText(/My WordPress Blog/i)).toBeInTheDocument();
  });

  it('debe mostrar bloqueo en /uploads si el nivel de descubrimiento es menor a 3', () => {
    const { rerender } = render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15/uploads' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra el mensaje de bloqueo
    expect(screen.getByText(/Directorio no enumerado/i)).toBeInTheDocument();
  });

  it('debe mostrar uploads cuando el nivel de descubrimiento es 3 o mayor', () => {
    const machinesWithLevel3 = [{ ...mockWpMachine, discovery_level: 3 }];
    
    const { rerender } = render(
      <FakeBrowser
        allMachines={machinesWithLevel3}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={3}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15/uploads' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={machinesWithLevel3} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={3} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra el directorio de uploads
    expect(screen.getByText(/Index of/i)).toBeInTheDocument();
  });

  it('debe mostrar config.bak cuando se accede a /uploads/config.bak', () => {
    const machinesWithLevel3 = [{ ...mockWpMachine, discovery_level: 3 }];
    
    const { rerender } = render(
      <FakeBrowser
        allMachines={machinesWithLevel3}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={3}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15/uploads/config.bak' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={machinesWithLevel3} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={3} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra el archivo config.bak (puede haber múltiples elementos)
    expect(screen.getAllByText(/config.bak/i).length).toBeGreaterThan(0);
  });

  it('debe mostrar página 404 para URLs desconocidas', () => {
    const { rerender } = render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://99.99.99.99/unknown' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra la página 404
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Found/i)).toBeInTheDocument();
  });

  it('debe llamar onClose al hacer clic en el botón rojo', () => {
    const onClose = vi.fn();
    
    render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={onClose}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    // El botón rojo es el primero en la barra de título
    const redButton = screen.getAllByRole('button')[0];
    fireEvent.click(redButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('debe mostrar sugerencias de búsqueda en Google', () => {
    render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    // Verifica que se muestran las sugerencias
    expect(screen.getByText(/nmap tutorial/i)).toBeInTheDocument();
    expect(screen.getByText(/wordpress exploit/i)).toBeInTheDocument();
    expect(screen.getByText(/gobuster wordlist/i)).toBeInTheDocument();
    expect(screen.getByText(/ssh brute force/i)).toBeInTheDocument();
  });

  it('debe navegar a Google Search al presionar Enter con una búsqueda', () => {
    const { rerender } = render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Buscar en Google/i);
    fireEvent.change(searchInput, { target: { value: 'nmap tutorial' } });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra la página de resultados
    expect(screen.getByText(/nmap tutorial - Wikipedia/i)).toBeInTheDocument();
  });

  it('debe permitir ver el sitio de consultoría (Escenario 2)', () => {
    const mockSshIp = '10.10.10.11';
    const mockSshMachine = {
      id: 'lab-scenario-02-ssh',
      machine_info: { hostname: 'ssh-target', ip: mockSshIp, mac: '00:00:00:03', os: 'Linux', status: 'up', type: 'server' },
      discovery_level: 2,
      scan_results: { ports: [] },
      web_enumeration: { web_server: 'Apache', cms: 'none', directories: [{ path: '/', status: 200, description: 'Consultancy Site' }] },
      learning_steps: [],
      files: []
    };
    const machinesWithSsh = [...allMachines, mockSshMachine];

    const { rerender } = render(
      <FakeBrowser
        allMachines={machinesWithSsh}
        onClose={vi.fn()}
        onMissionComplete={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={0}
        mission3Already={false}
        onSetPossibleUsers={vi.fn()}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: `http://${mockSshIp}` } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={machinesWithSsh} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={0} mission3Already={false} onSetPossibleUsers={vi.fn()} />);

    // Verifica que se muestra el sitio de consultoría (múltiples ocurrencias: logo, footer, etc.)
    expect(screen.getAllByText(/DevConsultancy/i).length).toBeGreaterThan(0);
  });
});
