// ── components/__tests__/MachineLoader.test.tsx ───────────────────
// Tests para el componente MachineLoader (versión con countdown + carga realista)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MachineLoader } from '../MachineLoader';

// La animación del loader depende de setTimeout/setInterval/requestAnimationFrame y de
// Date.now(). Con timers reales cada dígito del countdown vive ~500 ms, y con la suite
// completa corriendo en paralelo (153 archivos) estos tests fallaban de forma
// intermitente por carga de máquina (ver docs/mejoras-deep.md §2.1).
// Acá se usan SIEMPRE fake timers y se avanza el reloj a mano: determinista y rápido.
// `vi.useFakeTimers()` fakea Date y requestAnimationFrame, así que la fase de carga
// también avanza con advanceTimersByTime.
const advance = (ms: number) => {
  act(() => { vi.advanceTimersByTime(ms); });
};

describe('MachineLoader', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

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

  it('debe mostrar el countdown 3..2..1..GO', () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Windows"
        onComplete={vi.fn()}
        language="es"
      />
    );

    // El countdown dura 1500 ms repartidos en 3 tramos de 500 ms
    expect(screen.getByText('3')).toBeInTheDocument();

    advance(600);
    expect(screen.getByText('2')).toBeInTheDocument();

    advance(500);
    expect(screen.getByText('1')).toBeInTheDocument();

    // El tramo que cruza los 1500 ms cambia a la fase de carga. Ojo: el efecto de esa
    // fase (y su requestAnimationFrame) se registra al salir del act(), así que el
    // primer tick del loader necesita un advance extra.
    advance(500);
    advance(200);
    expect(screen.getByText('Resolviendo infraestructura...')).toBeInTheDocument();
  });

  it('debe avanzar el progreso con log lines durante la carga', () => {
    render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
        language="es"
      />
    );

    advance(1600); // fin del countdown → fase de carga
    advance(300);  // el primer log se emite al 3% de 5000 ms de carga
    expect(screen.getByText('→ Resolviendo DNS del laboratorio...')).toBeInTheDocument();
  });

  it('debe mostrar logs con interpolación de variables', () => {
    render(
      <MachineLoader
        machineName="Target-01"
        machineIp="192.168.1.50"
        machineOs="Windows 10"
        onComplete={vi.fn()}
        language="es"
      />
    );

    advance(1600);
    advance(1100); // 18% de los 5000 ms de carga → log de provisionamiento
    expect(screen.getByText('→ Provisionando Target-01...')).toBeInTheDocument();
  });

  it('debe llamar onComplete al finalizar la carga', () => {
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

    expect(onComplete).not.toHaveBeenCalled();

    advance(1600); // countdown → fase de carga (el efecto se registra al salir del act)
    advance(700);  // la carga (500 ms) termina → fase complete + setTimeout(onComplete, 400)
    advance(500);  // se dispara onComplete
    expect(onComplete).toHaveBeenCalled();
  });

  it('debe mostrar el mensaje final cuando está completo', () => {
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

    advance(1600); // countdown → fase de carga (el efecto se registra al salir del act)
    advance(700);  // la carga (500 ms) termina → pantalla de completado
    expect(screen.getByText('LABORATORIO ACTIVO')).toBeInTheDocument();
    expect(screen.getByText('Acceso concedido. Ready for attack.')).toBeInTheDocument();
  });

  it('debe mostrar el indicador de progreso visual durante la carga', () => {
    const { container } = render(
      <MachineLoader
        machineName="Test Machine"
        machineIp="10.0.0.1"
        machineOs="Linux"
        onComplete={vi.fn()}
        language="es"
      />
    );

    advance(1600); // entra en fase de carga, donde vive la barra de progreso
    const progressBar = container.querySelector('[class*="rounded-full"][class*="h-2"]');
    expect(progressBar).toBeInTheDocument();
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
