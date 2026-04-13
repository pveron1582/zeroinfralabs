// ── components/fakesites/__tests__/SqlInjectionSite.test.tsx ─────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SqlInjectionSite } from '../SqlInjectionSite';
import type { Machine } from '../../../types';

const createMockMachine = (): Machine => ({
  id: 'lab-scenario-06-sqli',
  machine_info: {
    hostname: 'sql-injection-web',
    ip: '192.168.40.11',
    mac: '08:00:27:D5:E6:F7',
    os: 'Ubuntu 18.04 LTS',
    status: 'up',
    type: 'server',
  },
  discovery_level: 4,
  scan_results: {
    ports: [
      { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'ProFTPD 1.3.5e' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.29' },
      { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL 5.7.26' },
    ],
  },
  web_enumeration: {
    web_server: 'Apache/2.4.29',
    cms: 'PHP 7.2 - Vulnerable Login Form',
    directories: [
      { path: '/', status: 200, description: 'Página de inicio' },
      { path: '/login', status: 200, description: 'Formulario de login (VULNERABLE)' },
      { path: '/admin', status: 403, description: 'Panel de administración' },
      { path: '/backup', status: 200, description: 'Directorio de respaldo' },
    ],
  },
  files: [],
  learning_steps: [],
});

describe('SqlInjectionSite - Main Site', () => {
  it('debe renderizar la página de inicio', () => {
    render(
      <SqlInjectionSite
        machine={createMockMachine()}
        currentUrl="http://192.168.40.11/"
        browserIsLoggedIn={false}
        onNavigate={vi.fn()}
        onLoginSuccess={vi.fn()}
        onLogout={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    expect(screen.getByText('Secure Web Application')).toBeInTheDocument();
    expect(screen.getByText('Welcome to our secure login portal')).toBeInTheDocument();
  });

  it('debe navegar al login al hacer click en User Login', () => {
    const mockNavigate = vi.fn();
    
    render(
      <SqlInjectionSite
        machine={createMockMachine()}
        currentUrl="http://192.168.40.11/"
        browserIsLoggedIn={false}
        onNavigate={mockNavigate}
        onLoginSuccess={vi.fn()}
        onLogout={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Login Now' }));
    expect(mockNavigate).toHaveBeenCalledWith('http://192.168.40.11/login');
  });

  it('debe mostrar página de acceso denegado en /admin', () => {
    const mockNavigate = vi.fn();
    
    render(
      <SqlInjectionSite
        machine={createMockMachine()}
        currentUrl="http://192.168.40.11/admin"
        browserIsLoggedIn={false}
        onNavigate={mockNavigate}
        onLoginSuccess={vi.fn()}
        onLogout={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/403 Forbidden/)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: 'Go to Login' }));
    expect(mockNavigate).toHaveBeenCalledWith('http://192.168.40.11/login');
  });

  it('debe mostrar directorio de backup', () => {
    render(
      <SqlInjectionSite
        machine={createMockMachine()}
        currentUrl="http://192.168.40.11/backup"
        browserIsLoggedIn={false}
        onNavigate={vi.fn()}
        onLoginSuccess={vi.fn()}
        onLogout={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    expect(screen.getByText('Backup Directory')).toBeInTheDocument();
    expect(screen.getByText('database_dump.sql')).toBeInTheDocument();
    expect(screen.getByText('config_backup.tar.gz')).toBeInTheDocument();
  });

  it('debe mostrar información del sistema', () => {
    render(
      <SqlInjectionSite
        machine={createMockMachine()}
        currentUrl="http://192.168.40.11/"
        browserIsLoggedIn={false}
        onNavigate={vi.fn()}
        onLoginSuccess={vi.fn()}
        onLogout={vi.fn()}
        onCredentialsFound={vi.fn()}
        onVerifyCredentials={vi.fn()}
        onMissionComplete={vi.fn()}
      />
    );
    
    expect(screen.getByText('Apache/2.4.29')).toBeInTheDocument();
    expect(screen.getByText('PHP 7.2')).toBeInTheDocument();
    expect(screen.getByText('MySQL 5.7')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });
});
