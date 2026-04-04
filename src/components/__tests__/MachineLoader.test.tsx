// ── components/__tests__/MachineLoader.test.tsx ───────────────────
// Tests para el componente MachineLoader (versión con countdown + carga realista)

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MachineLoader } from '../MachineLoader';

describe('MachineLoader', () => {
  it('debe renderizar la información de la máquina durante el countdown', () => {
    render(
      <MachineLoader
        machineName="Kali Linux"
        machineIp="192.168.1.10"
        machineOs="Linux"
        onComplete={vi.fn()}
        language="es"
      />
    );

    expect(screen.getByText('DESPLEGANDO LABORATORIO')).toBeInTheDocument();
    expect(screen.getByText('Kali Linux')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('debe mostrar el countdown 3..2..1..GO', async () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Windows"
        onComplete={vi.fn()}
        language="es"
      />
    );

    expect(screen.getByText('3')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    }, { timeout: 600 });

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    }, { timeout: 600 });

    // After countdown transitions to loading phase
    await waitFor(() => {
      expect(screen.getByText('Resolviendo infraestructura...')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('debe avanzar el progreso con log lines durante la carga', async () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
        language="es"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('→ Resolviendo DNS del laboratorio...')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('debe mostrar logs con interpolación de variables', async () => {
    render(
      <MachineLoader
        machineName="Target-01"
        machineIp="192.168.1.50"
        machineOs="Windows 10"
        onComplete={vi.fn()}
        language="es"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('→ Provisionando Target-01...')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('debe llamar onComplete al finalizar la carga', async () => {
    const onComplete = vi.fn();

    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={onComplete}
        duration={2000}
        language="es"
      />
    );

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('debe mostrar el mensaje final cuando está completo', async () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
        duration={2000}
        language="es"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('LABORATORIO ACTIVO')).toBeInTheDocument();
      expect(screen.getByText('Acceso concedido. Ready for attack.')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('debe mostrar el indicador de progreso visual durante la carga', async () => {
    const { container } = render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
        language="es"
      />
    );

    await waitFor(() => {
      const progressBar = container.querySelector('[class*="rounded-full"][class*="h-2"]');
      expect(progressBar).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('debe mostrar textos en inglés cuando language="en"', async () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
        language="en"
      />
    );

    expect(screen.getByText('DEPLOYING LAB')).toBeInTheDocument();
    expect(screen.getByText('INITIALIZING')).toBeInTheDocument();
  });
});
