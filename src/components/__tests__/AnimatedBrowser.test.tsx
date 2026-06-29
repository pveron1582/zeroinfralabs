import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnimatedBrowser } from '../AnimatedBrowser';

describe('AnimatedBrowser', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('debe renderizar inicialmente la barra de Chrome y el formulario de login', () => {
    render(<AnimatedBrowser />);
    
    expect(screen.getByText('Chrome')).toBeInTheDocument();
    expect(screen.getByText('http://192.168.1.11/wp-login.php')).toBeInTheDocument();
    expect(screen.getByText(/Username/)).toBeInTheDocument();
    expect(screen.getByText(/Password/)).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  it('debe aceptar una URL personalizada por prop', () => {
    render(<AnimatedBrowser url="http://custom-url/wp-admin" />);
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('http://custom-url/wp-admin')).toBeInTheDocument();
  });

  it('debe avanzar por las distintas fases de animación usando fake timers', () => {
    render(<AnimatedBrowser />);

    expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    
    expect(screen.getByText(/admin/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('Logging in...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Redirecting to dashboard...')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('My Blog')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('✓ Compromised')).toBeInTheDocument();
    expect(screen.getByText('🔑 SSH Credentials Found')).toBeInTheDocument();
    expect(screen.getByText(/Access granted/i)).toBeInTheDocument();
  });

  it('debe reiniciar el ciclo automáticamente tras completarse', () => {
    render(<AnimatedBrowser />);

    act(() => {
      vi.advanceTimersByTime(8000);
    });
    expect(screen.getByText('✓ Compromised')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.queryByText('✓ Compromised')).not.toBeInTheDocument();
  });

  it('debe limpiar los timeouts al desmontar el componente', () => {
    const { unmount } = render(<AnimatedBrowser />);
    
    unmount();

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(10000);
      });
    }).not.toThrow();
  });
});
