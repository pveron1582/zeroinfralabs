// ── src/components/__tests__/FakeBrowser.test.tsx ──────────────────
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
      />
    );

    // Escribimos en la barra de direcciones (el input que ya tiene el valor de currentUrl)
    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15/wp-admin' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Re-render para que tome el cambio de URL del mock
    rerender(<FakeBrowser allMachines={machinesLow} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={1} mission3Already={true} />);

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
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://192.168.1.15' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={vi.fn()} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} />);

    expect(screen.getByText(/My WordPress Blog/i)).toBeInTheDocument();
  });

  it('debe activar la misión 3 (LFI) al acceder a /etc/passwd (Escenario 4)', () => {
    const onMissionComplete = vi.fn();
    
    const { rerender } = render(
      <FakeBrowser
        allMachines={allMachines}
        onClose={vi.fn()}
        onMissionComplete={onMissionComplete}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        scenarioHasWeb={true}
        wpDiscoveryLevel={2}
        mission3Already={true}
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://10.10.20.11/?page=../../../../etc/passwd' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={onMissionComplete} onCredentialsFound={vi.fn()} onVerifyCredentials={vi.fn()} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} />);

    // Verifica que se llamó a completar la misión 3
    expect(onMissionComplete).toHaveBeenCalledWith(3);
    // Verifica que se muestra el contenido del archivo passwd
    expect(screen.getByText(/root:x:0:0/i)).toBeInTheDocument();
  });

  it('debe dar acceso total (RCE) al incluir un archivo de uploads (Escenario 4)', () => {
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
      />
    );

    const input = screen.getByDisplayValue('https://www.google.com');
    fireEvent.change(input, { target: { value: 'http://10.10.20.11/?page=uploads/shell.php' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    rerender(<FakeBrowser allMachines={allMachines} onClose={vi.fn()} onMissionComplete={onMissionComplete} onCredentialsFound={vi.fn()} onVerifyCredentials={onVerifyCredentials} scenarioHasWeb={true} wpDiscoveryLevel={2} mission3Already={true} />);

    // Misión 5 es el RCE
    expect(onMissionComplete).toHaveBeenCalledWith(5);
    // Debe dar acceso a la terminal cambiando de máquina
    expect(onVerifyCredentials).toHaveBeenCalledWith(mockLfiMachine.id);
  });
});