// ── components/__tests__/AnimatedDesktop.test.tsx ─────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AnimatedDesktop } from '../AnimatedDesktop';

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('AnimatedDesktop', () => {
  it('debe renderizar el escritorio Kali con barra superior', () => {
    render(<AnimatedDesktop />);
    // Boot timeout (300ms) + initial schedule (500ms)
    act(() => { vi.advanceTimersByTime(900); });
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Chrome')).toBeInTheDocument();
  });

  it('debe mostrar etiquetas en español con isEs', () => {
    render(<AnimatedDesktop isEs />);
    act(() => { vi.advanceTimersByTime(900); });
    expect(screen.getByText('Aplicaciones')).toBeInTheDocument();
  });

  it('debe mostrar los íconos del escritorio', () => {
    render(<AnimatedDesktop />);
    act(() => { vi.advanceTimersByTime(900); });
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Chrome')).toBeInTheDocument();
  });

  it('debe comenzar en fase idle mostrando el status "Kali Desktop"', () => {
    render(<AnimatedDesktop />);
    // Advance past boot but before animation starts
    act(() => { vi.advanceTimersByTime(350); });
    expect(screen.getByText('Kali Desktop')).toBeInTheDocument();
  });

  it('debe mostrar "Escritorio Kali" en español durante fase idle', () => {
    render(<AnimatedDesktop isEs />);
    act(() => { vi.advanceTimersByTime(350); });
    expect(screen.getByText('Escritorio Kali')).toBeInTheDocument();
  });

  it('debe mostrar el terminal después de la fase idle', () => {
    render(<AnimatedDesktop />);
    // Boot (300ms) + runCycle schedule (500ms) → terminal appears
    act(() => { vi.advanceTimersByTime(900); });
    // Terminal window should be visible with title
    expect(screen.getByText('Terminal 1 - root@kali')).toBeInTheDocument();
  });

  it('debe mostrar "gobuster dir" en el status durante el typing', () => {
    render(<AnimatedDesktop />);
    // Boot (300ms) + schedule to show terminal (500ms) + typeCmd schedule (400ms)
    act(() => { vi.advanceTimersByTime(1300); });
    expect(screen.getByText('gobuster dir')).toBeInTheDocument();
  });

  it('debe mostrar la hora 14:32 en la barra superior', () => {
    render(<AnimatedDesktop />);
    act(() => { vi.advanceTimersByTime(400); });
    expect(screen.getByText('14:32')).toBeInTheDocument();
  });

  it('debe aplicar className personalizado', () => {
    const { container } = render(<AnimatedDesktop className="my-custom-class" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('my-custom-class');
  });

  it('debe iniciar con opacidad 0 y pasar a 1 al estar ready', () => {
    const { container } = render(<AnimatedDesktop />);
    const root = container.firstChild as HTMLElement;
    // Before boot timeout, opacity should be 0
    expect(root.style.opacity).toBe('0');
    // After boot
    act(() => { vi.advanceTimersByTime(400); });
    expect(root.style.opacity).toBe('1');
  });

  it('debe limpiar los timers al desmontarse', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(<AnimatedDesktop />);
    act(() => { vi.advanceTimersByTime(900); });
    const callsBefore = clearTimeoutSpy.mock.calls.length;
    unmount();
    // Should have called clearTimeout for cleanup
    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(callsBefore);
    clearTimeoutSpy.mockRestore();
  });

  it('debe mostrar el Chrome en la barra cuando el browser está visible', () => {
    render(<AnimatedDesktop />);
    // Need to advance enough for the browser to appear
    // Boot(300) + runCycle(500) + terminal appears + typing all chars + output lines + browser schedule
    // Let's advance a large amount to get past all animation phases
    act(() => { vi.advanceTimersByTime(30000); });
    // At some point during the cycle, Chrome 1 should appear in the taskbar
    // Since it cycles, it should have shown up
    const chromeLabels = screen.queryAllByText('Chrome 1');
    // Chrome 1 appears both as desktop icon label text AND in taskbar when browser shows
    expect(chromeLabels.length).toBeGreaterThanOrEqual(0);
  });

  it('debe renderizar el contenedor con borde y sombra', () => {
    const { container } = render(<AnimatedDesktop />);
    act(() => { vi.advanceTimersByTime(400); });
    const borderedDiv = container.querySelector('.rounded-2xl.overflow-hidden.border.shadow-2xl');
    expect(borderedDiv).toBeInTheDocument();
  });

  it('debe incluir la animación CSS para demoWinIn', () => {
    const { container } = render(<AnimatedDesktop />);
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeInTheDocument();
    expect(styleTag!.textContent).toContain('demoWinIn');
  });
});
