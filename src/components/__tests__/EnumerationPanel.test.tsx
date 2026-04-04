// ── components/__tests__/EnumerationPanel.test.tsx ─────────────────────
// Tests para el componente EnumerationPanel

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EnumerationPanel } from '../EnumerationPanel';
import {
  createMockMachine,
  mockPorts,
  mockDirectories,
  mockCredential,
  mockVulnerabilities,
  mockSudoVim,
  mockReverseShellCred,
} from './fixtures';

describe('EnumerationPanel', () => {
  it('debe renderizar el hostname y la IP de la máquina', () => {
    const machine = createMockMachine();
    render(<EnumerationPanel machine={machine} />);

    expect(screen.getByText('target')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
  });

  it('debe mostrar el indicador de estado cuando la máquina está up', () => {
    const machine = createMockMachine({ machine_info: { hostname: 'target', ip: '192.168.1.10', mac: '00:00:00:00:00:00', os: 'Linux', status: 'up', type: 'server' } });
    render(<EnumerationPanel machine={machine} />);

    expect(screen.getByText('Target Enumeration')).toBeInTheDocument();
  });

  describe('Ports and Services', () => {
    it('debe mostrar los puertos escaneados cuando discovery_level >= 2', () => {
      const machine = createMockMachine({ discovery_level: 2, scan_results: { ports: mockPorts } });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Ports and Services')).toBeInTheDocument();
      expect(screen.getByText('22/tcp')).toBeInTheDocument();
      expect(screen.getByText('ssh')).toBeInTheDocument();
      expect(screen.getByText('OpenSSH 8.0')).toBeInTheDocument();
      expect(screen.getByText('80/tcp')).toBeInTheDocument();
      expect(screen.getByText('http')).toBeInTheDocument();
      expect(screen.getByText('Apache 2.4')).toBeInTheDocument();
    });

    it('no debe mostrar puertos cuando discovery_level < 2', () => {
      const machine = createMockMachine({ discovery_level: 1, scan_results: { ports: mockPorts } });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.queryByText('Ports and Services')).not.toBeInTheDocument();
    });

    it('debe mostrar puertos sin versión cuando version está vacío', () => {
      const machine = createMockMachine({
        scan_results: {
          ports: [
            { port: 443, protocol: 'tcp', state: 'open', service: 'https', version: '' },
          ],
        },
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('443/tcp')).toBeInTheDocument();
      expect(screen.getByText('https')).toBeInTheDocument();
    });

    it('debe formatear versión de Windows 7 SP en puerto 445', () => {
      const machine = createMockMachine({
        scan_results: {
          ports: [
            { port: 445, protocol: 'tcp', state: 'open', service: 'microsoft-ds', version: 'Windows 7 Professional SP1' },
          ],
        },
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('445/tcp')).toBeInTheDocument();
      expect(screen.getByText('Windows 7 SP1')).toBeInTheDocument();
    });

    it('debe formatear netbios-ssn en puerto 139', () => {
      const machine = createMockMachine({
        scan_results: {
          ports: [
            { port: 139, protocol: 'tcp', state: 'open', service: 'netbios-ssn', version: 'netbios-ssn' },
          ],
        },
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('139/tcp')).toBeInTheDocument();
      expect(screen.getAllByText('netbios-ssn').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Web Enumeration', () => {
    it('debe mostrar directorios web cuando discovery_level >= 3', () => {
      const machine = createMockMachine({
        discovery_level: 3,
        web_enumeration: {
          web_server: 'Apache',
          cms: 'WordPress',
          directories: mockDirectories,
        },
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Identified Directories')).toBeInTheDocument();
      expect(screen.getByText('wp-admin')).toBeInTheDocument();
      expect(screen.getByText('secret')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('403')).toBeInTheDocument();
    });

    it('no debe mostrar directorios cuando discovery_level < 3', () => {
      const machine = createMockMachine({
        discovery_level: 2,
        web_enumeration: {
          web_server: 'Apache',
          cms: 'WordPress',
          directories: mockDirectories,
        },
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.queryByText('Identified Directories')).not.toBeInTheDocument();
    });
  });

  describe('Credentials', () => {
    it('debe mostrar credenciales encontradas', () => {
      const machine = createMockMachine({ found_credentials: [mockCredential] });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Credentials')).toBeInTheDocument();
      expect(screen.getByText('wp-admin')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('password123')).toBeInTheDocument();
      expect(screen.getByText('VERIFIED')).toBeInTheDocument();
    });

    it('debe mostrar credenciales como PENDING cuando no están verificadas', () => {
      const machine = createMockMachine({
        found_credentials: [{ ...mockCredential, verified: false, service: 'ssh' }],
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('PENDING')).toBeInTheDocument();
      expect(screen.queryByText('VERIFIED')).not.toBeInTheDocument();
    });

    it('no debe mostrar credenciales cuando no hay', () => {
      const machine = createMockMachine({ found_credentials: [] });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.queryByText('Credentials')).not.toBeInTheDocument();
    });

    it('no debe mostrar reverse-shell en la sección de Credentials', () => {
      const machine = createMockMachine({
        found_credentials: [
          mockReverseShellCred,
          { ...mockCredential, verified: false, service: 'ssh' },
        ],
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Credentials')).toBeInTheDocument();
      expect(screen.getAllByText('ssh').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('reverse-shell')).not.toBeInTheDocument();
    });

    it('debe parsear credenciales dinámicas desde config.bak', () => {
      const machine = createMockMachine({
        id: 'wp-target',
        files: [
          {
            path: '/var/www/html/config.bak',
            content: "DB_USER='wordpress_user'\nDB_PASS='wordpress_pass'",
            type: 'text',
          },
        ],
        found_credentials: [
          {
            file: '/var/www/html/config.bak',
            user: '',
            pass: '',
            verified: false,
            service: 'wp-admin',
          },
        ],
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('wordpress_user')).toBeInTheDocument();
      expect(screen.getByText('wordpress_pass')).toBeInTheDocument();
    });

    it('debe parsear credenciales dinámicas desde wp-config.php', () => {
      const machine = createMockMachine({
        id: 'wp-target',
        files: [
          {
            path: '/var/www/html/wp-config.php',
            content: "DB_USER='wp_admin'\nDB_PASS='wp_secret'",
            type: 'text',
          },
        ],
        found_credentials: [
          {
            file: '/var/www/html/wp-config.php',
            user: '',
            pass: '',
            verified: false,
            service: 'wp-admin',
          },
        ],
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('wp_admin')).toBeInTheDocument();
      expect(screen.getByText('wp_secret')).toBeInTheDocument();
    });
  });

  describe('SSH Users', () => {
    it('debe mostrar posibles usuarios SSH', () => {
      const machine = createMockMachine({ possible_ssh_users: ['admin', 'root', 'user1'] });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Possible SSH Users')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('root')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getAllByText('UNTESTED')).toHaveLength(3);
    });

    it('debe mostrar usuarios SSH con credenciales válidas como VALID', () => {
      const machine = createMockMachine({
        possible_ssh_users: ['admin', 'root'],
        found_credentials: [
          {
            file: '/etc/passwd',
            user: 'admin',
            pass: 'secret',
            verified: true,
            service: 'ssh',
          },
        ],
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('VALID')).toBeInTheDocument();
      expect(screen.getByText('UNTESTED')).toBeInTheDocument();
    });

    it('debe mostrar usuarios SSH fallidos como FAILED', () => {
      const machine = createMockMachine({
        possible_ssh_users: ['admin', 'root'],
        failed_ssh_users: ['root'],
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('FAILED')).toBeInTheDocument();
      expect(screen.getByText('UNTESTED')).toBeInTheDocument();
    });
  });

  describe('Vulnerabilities', () => {
    it('debe mostrar vulnerabilidades críticas', () => {
      const machine = createMockMachine({ vulnerabilities: mockVulnerabilities });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Critical Vulnerabilities')).toBeInTheDocument();
      expect(screen.getByText('CVE-2017-0144')).toBeInTheDocument();
      expect(screen.getByText('EternalBlue')).toBeInTheDocument();
      expect(screen.getByText('CVE-2021-41773')).toBeInTheDocument();
      expect(screen.getByText('Apache Path Traversal')).toBeInTheDocument();
    });

    it('no debe mostrar vulnerabilidades cuando no hay', () => {
      const machine = createMockMachine({ vulnerabilities: [] });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.queryByText('Critical Vulnerabilities')).not.toBeInTheDocument();
    });
  });

  describe('Privilege Escalation', () => {
    it('debe mostrar la sección de Privilege Escalation cuando hay sudo vim', () => {
      const machine = createMockMachine({
        sudo_privileges: mockSudoVim,
        privesc_completed: false,
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Possible Vulnerability')).toBeInTheDocument();
      expect(screen.getByText('Sudo Vim → Root Shell')).toBeInTheDocument();
      expect(screen.getByText(/sudo vim -c/)).toBeInTheDocument();
      expect(screen.getByText("'!bash'")).toBeInTheDocument();
    });

    it('debe mostrar Privilege Escalation como explotada cuando privesc_completed es true', () => {
      const machine = createMockMachine({
        sudo_privileges: { user: 'developer', commands: ['vim'], canSudo: true },
        privesc_completed: true,
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Privilege Escalation')).toBeInTheDocument();
      expect(screen.getByText('Exploited: Sudo Vim')).toBeInTheDocument();
      expect(screen.queryByText('Possible Vulnerability')).not.toBeInTheDocument();
    });

    it('no debe mostrar Privilege Escalation cuando no hay sudo vim', () => {
      const machine = createMockMachine({
        sudo_privileges: { user: 'developer', commands: ['apt-get'], canSudo: true },
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.queryByText('Possible Vulnerability')).not.toBeInTheDocument();
      expect(screen.queryByText('Privilege Escalation')).not.toBeInTheDocument();
    });
  });

  describe('RCE Access', () => {
    it('debe mostrar RCE Access cuando hay credenciales de reverse-shell', () => {
      const machine = createMockMachine({ found_credentials: [mockReverseShellCred] });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Remote Access Established')).toBeInTheDocument();
      expect(screen.getByText('RCE Access')).toBeInTheDocument();
      expect(screen.getByText(/Payload: shell\.php/)).toBeInTheDocument();
      expect(screen.getByText('www-data')).toBeInTheDocument();
      expect(screen.getByText('nc -nlvp 4444')).toBeInTheDocument();
    });
  });

  describe('UI Interactions', () => {
    it('debe llamar onClose al hacer clic en el botón de cerrar', () => {
      const onClose = vi.fn();
      const machine = createMockMachine();
      render(<EnumerationPanel machine={machine} onClose={onClose} />);

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('no debe mostrar botón de cerrar cuando onClose no está definido', () => {
      const machine = createMockMachine();
      render(<EnumerationPanel machine={machine} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('debe renderizar en modo inline cuando inline es true', () => {
      const machine = createMockMachine();
      const { container } = render(<EnumerationPanel machine={machine} inline />);

      expect(container.querySelector('.backdrop-blur-md')).not.toBeInTheDocument();
    });

    it('debe renderizar con overlay cuando inline es false', () => {
      const machine = createMockMachine();
      const { container } = render(<EnumerationPanel machine={machine} inline={false} />);

      expect(container.querySelector('.backdrop-blur-md')).toBeInTheDocument();
    });
  });

  describe('Multiple sections', () => {
    it('debe mostrar múltiples secciones cuando hay varios tipos de datos', () => {
      const machine = createMockMachine({
        discovery_level: 4,
        scan_results: { ports: mockPorts },
        web_enumeration: {
          web_server: 'Apache',
          cms: 'WordPress',
          directories: [{ path: '/wp-admin', status: 200, description: 'Admin panel' }],
        },
        found_credentials: [{ ...mockCredential, service: 'ssh' }],
        vulnerabilities: [mockVulnerabilities[1]],
        possible_ssh_users: ['admin'],
        sudo_privileges: { user: 'admin', commands: ['vim'], canSudo: true },
        privesc_completed: false,
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Ports and Services')).toBeInTheDocument();
      expect(screen.getByText('Identified Directories')).toBeInTheDocument();
      expect(screen.getByText('Credentials')).toBeInTheDocument();
      expect(screen.getByText('Critical Vulnerabilities')).toBeInTheDocument();
      expect(screen.getByText('Possible SSH Users')).toBeInTheDocument();
      expect(screen.getByText('Possible Vulnerability')).toBeInTheDocument();
    });

    it('debe mostrar el título correcto cuando no hay secciones visibles', () => {
      const machine = createMockMachine({
        discovery_level: 0,
        scan_results: { ports: [] },
        web_enumeration: { web_server: '', cms: '', directories: [] },
      });
      render(<EnumerationPanel machine={machine} />);

      expect(screen.getByText('Target Enumeration')).toBeInTheDocument();
      expect(screen.getByText('target')).toBeInTheDocument();
    });
  });
});
