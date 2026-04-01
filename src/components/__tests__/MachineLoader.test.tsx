// ── components/__tests__/MachineLoader.test.tsx ───────────────────
// Tests para el componente MachineLoader

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MachineLoader } from '../MachineLoader';

describe('MachineLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debe renderizar la información de la máquina', () => {
    render(
      <MachineLoader
        machineName="Kali Linux"
        machineIp="192.168.1.10"
        machineOs="Linux"
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText('Kali Linux')).toBeInTheDocument();
    expect(screen.getByText('IP: 192.168.1.10')).toBeInTheDocument();
    expect(screen.getByText('OS: Linux')).toBeInTheDocument();
  });

  it('debe mostrar el progreso inicial en 0%', () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Windows"
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Scanning network...')).toBeInTheDocument();
  });

  it('debe avanzar el progreso con el tiempo', async () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
      />
    );

    // Avanzar el tiempo para ver progreso
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      const progressText = screen.getByText(/\d+%/);
      expect(progressText).toBeInTheDocument();
    });
  });

  it('debe cambiar de fase durante la carga', async () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
      />
    );

    // Fase inicial
    expect(screen.getByText('Scanning network...')).toBeInTheDocument();

    // Avanzar tiempo para llegar a la siguiente fase
    vi.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(screen.getByText('Initializing services...')).toBeInTheDocument();
    });
  });

  it('debe llamar onComplete al finalizar la carga', async () => {
    const onComplete = vi.fn();

    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={onComplete}
      />
    );

    // Avanzar tiempo hasta completar todas las fases
    vi.advanceTimersByTime(6000);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('debe mostrar el mensaje final cuando está completo', async () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
      />
    );

    // Avanzar tiempo hasta completar
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByText('System loaded. Ready for attack.')).toBeInTheDocument();
    });
  });

  it('debe mostrar el indicador de progreso visual', () => {
    const { container } = render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
      />
    );

    // Verificar que existe la barra de progreso
    const progressBar = container.querySelector('[class*="rounded-full"][class*="h-2"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('debe mostrar los indicadores de carga animados', () => {
    const { container } = render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
      />
    );

    // Verificar que existen los elementos animados
    const animatedElements = container.querySelectorAll('.animate-pulse');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});
