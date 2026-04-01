// ── components/fakesites/__tests__/WordPressSite.test.tsx ──────────
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { WordPressSite } from '../WordPressSite';

const createWpMachine = (overrides = {}) => ({
  id: 'wp-machine',
  machine_info: { hostname: 'wordpress', ip: '192.168.1.15', mac: '00:00:00:01', os: 'Linux', status: 'up', type: 'server' },
  discovery_level: 2,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'Apache', cms: 'WordPress', directories: [] },
  learning_steps: [],
  files: [],
  ...overrides,
});

const defaultProps = {
  machine: createWpMachine(),
  currentUrl: 'http://192.168.1.15/',
  browserIsLoggedIn: false,
  onNavigate: vi.fn(),
  onLoginSuccess: vi.fn(),
  onLogout: vi.fn(),
  onCredentialsFound: vi.fn(),
  onVerifyCredentials: vi.fn(),
  onMissionComplete: vi.fn(),
};

describe('WordPressSite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el index de WordPress en la raíz', () => {
    render(<WordPressSite {...defaultProps} />);
    expect(screen.getByText(/My WordPress Blog/i)).toBeInTheDocument();
  });

  it('debe mostrar mensaje de bloqueo si discovery_level < 2', () => {
    const machine = createWpMachine({ discovery_level: 1 });
    render(<WordPressSite {...defaultProps} machine={machine} currentUrl="http://192.168.1.15/wp-admin" />);
    expect(screen.getByText(/escaneo nmap/i)).toBeInTheDocument();
  });

  it('debe mostrar login en /wp-admin cuando no está logueado', () => {
    render(<WordPressSite {...defaultProps} currentUrl="http://192.168.1.15/wp-admin" />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('debe mostrar dashboard cuando está logueado', () => {
    render(<WordPressSite {...defaultProps} currentUrl="http://192.168.1.15/wp-admin" browserIsLoggedIn={true} />);
    expect(screen.getByText(/Access granted/i)).toBeInTheDocument();
    expect(screen.getByText(/SSH Credentials Found/i)).toBeInTheDocument();
  });

  it('debe redirigir a login si intenta acceder a dashboard sin estar logueado', async () => {
    render(<WordPressSite {...defaultProps} currentUrl="http://192.168.1.15/wp-admin/dashboard" />);
    await waitFor(() => {
      expect(defaultProps.onNavigate).toHaveBeenCalledWith('http://192.168.1.15/wp-admin');
    });
  });

  it('debe mostrar bloqueo en /uploads si discovery_level < 3', () => {
    render(<WordPressSite {...defaultProps} currentUrl="http://192.168.1.15/uploads" />);
    expect(screen.getByText(/Directorio no enumerado/i)).toBeInTheDocument();
  });

  it('debe mostrar uploads cuando discovery_level >= 3', () => {
    const machine = createWpMachine({ discovery_level: 3 });
    render(<WordPressSite {...defaultProps} machine={machine} currentUrl="http://192.168.1.15/uploads" />);
    expect(screen.getByText(/Index of/i)).toBeInTheDocument();
  });

  it('debe mostrar config.bak cuando se accede a /uploads/config.bak', () => {
    const machine = createWpMachine({ discovery_level: 3 });
    render(<WordPressSite {...defaultProps} machine={machine} currentUrl="http://192.168.1.15/uploads/config.bak" />);
    expect(screen.getAllByText(/config.bak/i).length).toBeGreaterThan(0);
  });

  it('debe reportar credenciales SSH al acceder al dashboard', () => {
    const onCredentialsFound = vi.fn();
    render(
      <WordPressSite
        {...defaultProps}
        currentUrl="http://192.168.1.15/wp-admin"
        browserIsLoggedIn={true}
        onCredentialsFound={onCredentialsFound}
      />
    );
    expect(onCredentialsFound).toHaveBeenCalledWith(
      'wp-machine',
      'root',
      'R00t@SSH2024!',
      '/wp-admin/wp-config.php',
      'ssh'
    );
  });

  it('debe llamar onLogout al hacer click en Logout', () => {
    const onLogout = vi.fn();
    render(
      <WordPressSite
        {...defaultProps}
        currentUrl="http://192.168.1.15/wp-admin"
        browserIsLoggedIn={true}
        onLogout={onLogout}
      />
    );
    const logoutBtn = screen.getByText(/Logout/i);
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalled();
  });
});
