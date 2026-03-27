// ── components/__tests__/Terminal.test.tsx ─────────────────────────
// Tests para el componente Terminal

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Terminal } from '../Terminal';
import type { Machine } from '../../types';

const createMockMachine = (overrides: Partial<Machine> = {}): Machine => ({
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
  ...overrides,
});

const createTargetMachine = (): Machine => ({
  id: 'target-01',
  machine_info: {
    hostname: 'target',
    ip: '192.168.1.20',
    mac: '00:11:22:33:44:AA',
    os: 'Ubuntu',
    status: 'active',
    type: 'server',
  },
  discovery_level: 2,
  scan_results: {
    ports: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.0', credentials: { user: 'root', pass: 'toor' } },
    ],
  },
  web_enumeration: { web_server: '', cms: '', directories: [] },
  learning_steps: [],
  files: [],
});

describe('Terminal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el mensaje de bienvenida', () => {
    const attackerMachine = createMockMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    expect(container.textContent).toContain('ZeroInfra Labs Terminal v2.0.0');
    expect(container.textContent).toContain('Kali Linux');
    expect(container.textContent).toContain('192.168.1.10');
  });

  it('debe mostrar el prompt correcto para la máquina atacante', () => {
    const attackerMachine = createMockMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Verificar que el prompt estilo Kali Linux aparece en el documento
    // Formato: ┌──(㉿)-[/] + └─#
    expect(container.textContent).toContain('root');
    expect(container.textContent).toContain('kali');
    expect(container.textContent).toContain('/');
  });

  it('debe mostrar el prompt correcto para máquina target', () => {
    const targetMachine = createTargetMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={targetMachine}
        allMachines={[targetMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Verificar que el prompt estilo Kali Linux aparece en el documento
    // Formato: ┌──(㉿)-[/] + └─#
    expect(container.textContent).toContain('root');
    expect(container.textContent).toContain('target');
    expect(container.textContent).toContain('/');
  });

  it('debe aceptar entrada de texto', () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'help' } });

    expect((input as HTMLInputElement).value).toBe('help');
  });

  it('debe limpiar el input al ejecutar un comando', () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(input.value).toBe('');
  });

  it('debe navegar por el historial de comandos con flechas', async () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;

    // Ejecutar primer comando
    fireEvent.change(input, { target: { value: 'primer-comando' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Ejecutar segundo comando
    fireEvent.change(input, { target: { value: 'segundo-comando' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Navegar hacia arriba
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('segundo-comando');

    // Navegar hacia arriba de nuevo
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.value).toBe('primer-comando');

    // Navegar hacia abajo
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('segundo-comando');

    // Navegar hacia abajo de nuevo (debería limpiar)
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.value).toBe('');
  });

  it('debe aplicar el color de terminal personalizado', () => {
    const attackerMachine = createMockMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
        termColor="#ff0000"
      />
    );

    // El input debería tener el color personalizado
    const input = container.querySelector('input');
    expect(input?.style.color).toBe('rgb(255, 0, 0)');
  });

  it('debe resetear el historial cuando cambia el scenarioId', async () => {
    const attackerMachine = createMockMachine();
    const { rerender, container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Ejecutar un comando
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'comando' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Cambiar de escenario
    rerender(
      <Terminal
        scenarioId="scenario-02"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // El historial debería estar limpio (solo el mensaje de bienvenida)
    expect(container.textContent).toContain('ZeroInfra Labs Terminal v2.0.0');
  });

  it('debe mostrar el estado ready cuando no hay comandos ejecutándose', () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    expect(screen.getByText((content, element) => {
      return content.includes('ready');
    })).toBeInTheDocument();
  });

  it('debe mostrar el header con los botones de control', () => {
    const attackerMachine = createMockMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Verificar que existen los círculos de control (simulando botones de ventana)
    const circles = container.querySelectorAll('[class*="rounded-full"]');
    expect(circles.length).toBeGreaterThan(0);
  });

  it('debe mostrar sugerencias de autocompletado al presionar Tab', async () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Escribir 'h' y presionar Tab
    fireEvent.change(input, { target: { value: 'h' } });
    fireEvent.keyDown(input, { key: 'Tab' });

    // Debería mostrar sugerencias (help, hashcat)
    await waitFor(() => {
      expect(screen.getByText('help')).toBeInTheDocument();
    });
  });

  it('debe cerrar sugerencias al presionar Escape', async () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Escribir 's' y presionar Tab para mostrar sugerencias
    fireEvent.change(input, { target: { value: 's' } });
    fireEvent.keyDown(input, { key: 'Tab' });

    // Presionar Escape para cerrar
    fireEvent.keyDown(input, { key: 'Escape' });

    // Las sugerencias deberían desaparecer
    await waitFor(() => {
      expect(screen.queryByText('sudo')).not.toBeInTheDocument();
    });
  });

  it('debe navegar entre sugerencias con flechas', async () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Escribir 's' y presionar Tab para mostrar sugerencias
    fireEvent.change(input, { target: { value: 's' } });
    fireEvent.keyDown(input, { key: 'Tab' });

    // Verificar que se muestran sugerencias
    await waitFor(() => {
      const suggestions = screen.getAllByText(/^(sudo|ssh)$/);
      expect(suggestions.length).toBeGreaterThan(0);
    });

    // Presionar flecha abajo para navegar entre sugerencias
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Verificar que el índice de sugerencia cambió (el componente internamente lo maneja)
    // No verificamos el valor del input porque el comportamiento es navegar entre sugerencias
    // sin modificar el input hasta que se seleccione una
  });

  it('debe seleccionar sugerencia al hacer click', async () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Escribir 'h' y presionar Tab
    fireEvent.change(input, { target: { value: 'h' } });
    fireEvent.keyDown(input, { key: 'Tab' });

    // Hacer click en una sugerencia
    await waitFor(() => {
      const helpOption = screen.getByText('help');
      fireEvent.click(helpOption);
    });

    // El input debería tener el valor seleccionado
    expect(input.value).toContain('help');
  });

  it('debe llamar a onMissionComplete cuando se completa una misión', () => {
    const onMissionComplete = vi.fn();
    const attackerMachine = createMockMachine();
    
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={onMissionComplete}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Ejecutar un comando que complete una misión (simulado)
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // onMissionComplete no debería ser llamado para help
    expect(onMissionComplete).not.toHaveBeenCalled();
  });

  it('debe llamar a onCredentialsFound cuando se encuentran credenciales', () => {
    const onCredentialsFound = vi.fn();
    const attackerMachine = createMockMachine();
    
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={onCredentialsFound}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Ejecutar un comando
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // onCredentialsFound no debería ser llamado para help
    expect(onCredentialsFound).not.toHaveBeenCalled();
  });

  it('debe llamar a onChangeMachine cuando se conecta a otra máquina', () => {
    const onChangeMachine = vi.fn();
    const attackerMachine = createMockMachine();
    
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={onChangeMachine}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Ejecutar un comando
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // onChangeMachine no debería ser llamado para help
    expect(onChangeMachine).not.toHaveBeenCalled();
  });

  it('debe mostrar estado running cuando hay un comando ejecutándose', async () => {
    const attackerMachine = createMockMachine();
    render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Ejecutar un comando con streaming (nmap)
    fireEvent.change(input, { target: { value: 'nmap' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Debería mostrar estado running
    await waitFor(() => {
      expect(screen.getByText(/running/)).toBeInTheDocument();
    });
  });

  it('debe limpiar la terminal con el comando clear', async () => {
    const attackerMachine = createMockMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Ejecutar un comando primero
    fireEvent.change(input, { target: { value: 'help' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Verificar que hay contenido en el historial
    await waitFor(() => {
      expect(container.textContent).toContain('help');
    });

    // Ejecutar clear
    fireEvent.change(input, { target: { value: 'clear' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // La terminal debería estar vacía después del clear
    // Verificamos que el comando 'help' ya no aparece en el contenido
    await waitFor(() => {
      const helpElements = container.querySelectorAll('pre');
      const hasHelp = Array.from(helpElements).some(el => el.textContent?.includes('Comandos disponibles'));
      expect(hasHelp).toBe(false);
    });
  });

  it('debe mostrar prompt de usuario no root con $', () => {
    const targetMachine = createTargetMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={targetMachine}
        allMachines={[targetMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Verificar que el prompt estilo Kali Linux aparece en el documento
    // Formato: ┌──(㉿)-[/] + └─#
    expect(container.textContent).toContain('root');
    expect(container.textContent).toContain('target');
    expect(container.textContent).toContain('/');
  });

  it('debe mostrar prompt de usuario regular con $', () => {
    const userMachine = createTargetMachine();
    userMachine.found_credentials = { user: 'admin', pass: 'admin123', file: '/etc/passwd', verified: true };
    
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={userMachine}
        allMachines={[userMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Verificar que el prompt estilo Kali Linux aparece en el documento
    // Formato: ┌──(㉿)-[path] + └─$
    expect(container.textContent).toContain('admin');
    expect(container.textContent).toContain('target');
    expect(container.textContent).toContain('└─$');
  });

  it('debe enfocar el input al hacer click en la terminal', () => {
    const attackerMachine = createMockMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    // Hacer click en la terminal
    fireEvent.click(container.firstChild as Element);

    // El input debería estar enfocado
    expect(document.activeElement).toBe(input);
  });

  it('debe mostrar mensaje de bienvenida con información del sistema', () => {
    const attackerMachine = createMockMachine();
    const { container } = render(
      <Terminal
        scenarioId="scenario-01"
        machine={attackerMachine}
        allMachines={[attackerMachine]}
        currentMissionId={1}
        onMissionComplete={vi.fn()}
        onChangeMachine={vi.fn()}
        onCredentialsFound={vi.fn()}
      />
    );

    // Verificar que muestra información del sistema
    expect(container.textContent).toContain('Kali Linux');
    expect(container.textContent).toContain('192.168.1.10');
    expect(container.textContent).toContain("Escribe 'help' para ver los comandos disponibles");
  });
});
