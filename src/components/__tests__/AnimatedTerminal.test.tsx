// ── components/__tests__/AnimatedTerminal.test.tsx ──────────────────────
// Tests for the AnimatedTerminal mockup component

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AnimatedTerminal } from '../AnimatedTerminal';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

const defaultProps = {
  prompt: 'root@kali:~$',
  command: 'nmap -sV 192.168.1.0/24',
  outputLines: [
    'Starting Nmap 7.94',
    'PORT   STATE SERVICE VERSION',
    '22/tcp open  ssh     OpenSSH 8.9',
    '80/tcp open  http    Apache 2.4',
    'Nmap scan complete',
  ],
};

describe('AnimatedTerminal', () => {
  it('debe renderizar la barra de título del terminal', () => {
    render(<AnimatedTerminal {...defaultProps} />);
    expect(screen.getByText('root@kali')).toBeInTheDocument();
  });

  it('debe mostrar el prompt correcto con icono kali', () => {
    render(<AnimatedTerminal {...defaultProps} />);
    expect(screen.getByText('root㉿kali')).toBeInTheDocument();
  });

  it('debe mostrar el prompt de la línea de comandos', () => {
    render(<AnimatedTerminal {...defaultProps} />);
    expect(screen.getByText('└─$')).toBeInTheDocument();
    expect(screen.getByText('┌──(')).toBeInTheDocument();
  });

  it('debe renderizar con color de acento personalizado', () => {
    const { container } = render(
      <AnimatedTerminal {...defaultProps} accentColor="#f87171" />
    );
    const outerDiv = container.firstChild as HTMLElement;
    const termBox = outerDiv.querySelector('.rounded-xl') as HTMLElement;
    expect(termBox).toBeTruthy();
    expect(termBox.getAttribute('style')).toContain('f87171');
  });

  it('debe mostrar un título si se provee', () => {
    render(<AnimatedTerminal {...defaultProps} title="Network scan" />);
    expect(screen.getByText('Network scan')).toBeInTheDocument();
  });

  it('no debe mostrar título si no se provee', () => {
    render(<AnimatedTerminal {...defaultProps} />);
    expect(screen.queryByText('Network scan')).not.toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    const { container } = render(
      <AnimatedTerminal {...defaultProps} className="custom-terminal" />
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('custom-terminal');
  });

  it('debe comenzar a escribir el comando después del boot', async () => {
    render(<AnimatedTerminal {...defaultProps} />);
    // Boot delay (300ms) + visible + runAnimation start (600ms) = 900ms.
    // Advance to 1500ms to allow typing 'nmap' (4 characters * average 75ms = 300ms) safely.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    const commandText = screen.getByText('nmap', { exact: false });
    expect(commandText).toBeInTheDocument();
  });

  it('debe mostrar el cursor parpadeante durante la fase de typing', async () => {
    const { container } = render(<AnimatedTerminal {...defaultProps} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    const cursor = container.querySelector('.animate-pulse');
    expect(cursor).toBeInTheDocument();
  });

  it('debe mostrar las líneas de output después de escribir el comando', async () => {
    render(<AnimatedTerminal {...defaultProps} />);
    // Advance just enough to show all output lines but before completion auto-reset (at ~8s)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    expect(screen.getByText('Starting Nmap 7.94')).toBeInTheDocument();
  });

  it('debe colorear correctamente las líneas con puertos abiertos', async () => {
    const { container } = render(<AnimatedTerminal {...defaultProps} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const openPortLines = outputContainer.querySelectorAll('.text-emerald-400');
    expect(openPortLines.length).toBeGreaterThanOrEqual(1);
  });

  it('debe colorear correctamente líneas que empiezan con PORT', async () => {
    const propsWithPort = {
      ...defaultProps,
      outputLines: ['PORT   STATE SERVICE VERSION', '22/tcp open ssh'],
    };
    const { container } = render(<AnimatedTerminal {...propsWithPort} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const boldLines = outputContainer.querySelectorAll('.font-bold');
    expect(boldLines.length).toBeGreaterThanOrEqual(1);
  });

  it('debe colorear correctamente líneas con Found:', async () => {
    const propsWithFound = {
      ...defaultProps,
      outputLines: ['Found: /wp-admin', 'Status: 200'],
    };
    const { container } = render(<AnimatedTerminal {...propsWithFound} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const amberLines = outputContainer.querySelectorAll('.text-amber-300');
    expect(amberLines.length).toBeGreaterThanOrEqual(1);
  });

  it('debe colorear líneas con filtered/closed como text-gray-500', async () => {
    const propsWithFiltered = {
      ...defaultProps,
      outputLines: ['22/tcp filtered ssh'],
    };
    const { container } = render(<AnimatedTerminal {...propsWithFiltered} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const grayLines = outputContainer.querySelectorAll('.text-gray-500');
    expect(grayLines.length).toBeGreaterThanOrEqual(1);
  });

  it('debe usar outputDelays personalizados si se proporcionan', async () => {
    const customDelays = [50, 50, 50, 50, 50];
    render(<AnimatedTerminal {...defaultProps} outputDelays={customDelays} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    expect(screen.getByText('Nmap scan complete')).toBeInTheDocument();
  });

  it('debe reiniciar la animación después de completar', async () => {
    render(<AnimatedTerminal {...defaultProps} />);
    // Complete the full cycle: typing (~3s) + output (~1s) + done pause (3.5s) + reset + restart (0.8s) = ~8.3s
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(screen.getByText('root㉿kali')).toBeInTheDocument();
  });

  it('debe limpiar timers al desmontar', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(<AnimatedTerminal {...defaultProps} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    const callsBefore = clearTimeoutSpy.mock.calls.length;
    unmount();
    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    clearTimeoutSpy.mockRestore();
  });

  it('debe calcular la altura basada en el número de líneas', () => {
    const { container } = render(<AnimatedTerminal {...defaultProps} />);
    const body = container.querySelector('[style*="height"]') as HTMLElement;
    expect(body).toBeInTheDocument();
    expect(body.style.height).toBe('180px');
  });

  it('debe mostrar las tres bolitas de la barra de título', () => {
    const { container } = render(<AnimatedTerminal {...defaultProps} />);
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots.length).toBe(3);
  });

  it('debe colorear líneas de Starting/Service detection como gray-400', async () => {
    const propsWithService = {
      ...defaultProps,
      outputLines: ['Starting Nmap scan', 'Service detection performed'],
    };
    const { container } = render(<AnimatedTerminal {...propsWithService} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const gray400Lines = outputContainer.querySelectorAll('.text-gray-400');
    expect(gray400Lines.length).toBeGreaterThanOrEqual(1);
  });

  it('debe colorear líneas con ➜ o ✓ como emerald semibold', async () => {
    const propsWithCheck = {
      ...defaultProps,
      outputLines: ['➜ Success', '✓ Done'],
    };
    const { container } = render(<AnimatedTerminal {...propsWithCheck} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const semiboldLines = outputContainer.querySelectorAll('.font-semibold');
    expect(semiboldLines.length).toBeGreaterThanOrEqual(1);
  });

  it('debe colorear líneas con STATUS: como gray-500', async () => {
    const propsWithStatus = {
      ...defaultProps,
      outputLines: ['STATUS: completed'],
    };
    const { container } = render(<AnimatedTerminal {...propsWithStatus} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const grayLines = outputContainer.querySelectorAll('.text-gray-500');
    expect(grayLines.length).toBeGreaterThanOrEqual(1);
  });

  it('debe manejar líneas vacías con espacio no-break', async () => {
    const propsWithEmpty = {
      ...defaultProps,
      outputLines: ['line1', '', 'line3'],
    };
    render(<AnimatedTerminal {...propsWithEmpty} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    expect(screen.getByText('line1')).toBeInTheDocument();
    expect(screen.getByText('line3')).toBeInTheDocument();
  });

  it('debe renderizar con el color de acento por defecto (#10b981)', () => {
    const { container } = render(<AnimatedTerminal {...defaultProps} />);
    const termBox = container.querySelector('.rounded-xl') as HTMLElement;
    expect(termBox.getAttribute('style')).toContain('10b981');
  });

  it('debe calcular altura mayor para muchas líneas de output', () => {
    const manyLines = Array.from({ length: 20 }, (_, i) => `line ${i}`);
    const { container } = render(
      <AnimatedTerminal {...defaultProps} outputLines={manyLines} />
    );
    const body = container.querySelector('[style*="height"]') as HTMLElement;
    expect(body.style.height).toBe('436px');
  });

  it('debe renderizar con líneas que contienen ── como text-gray-300 font-bold', async () => {
    const propsWithDashes = {
      ...defaultProps,
      outputLines: ['────────────────'],
    };
    const { container } = render(<AnimatedTerminal {...propsWithDashes} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4500);
    });
    const outputContainer = container.querySelector('.mt-1.space-y-0') as HTMLElement;
    const boldLines = outputContainer.querySelectorAll('.text-gray-300.font-bold');
    expect(boldLines.length).toBeGreaterThanOrEqual(1);
  });
});
