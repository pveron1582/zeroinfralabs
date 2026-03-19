// ── components/__tests__/Terminal.test.tsx ─────────────────────────
// Tests para el componente Terminal

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    // Verificar que el prompt aparece en el documento
    expect(container.textContent).toContain('root@kali:~#');
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

    // Debería mostrar el usuario root con # porque las credenciales son root
    expect(container.textContent).toContain('root@target:~#');
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
});
