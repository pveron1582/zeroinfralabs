// ── fakesites/__tests__/SquirrelMailSite.test.tsx ─────────────────
// Webmail del lab 08: la versión 1.4.22 es la pista que el alumno necesita
// para elegir el módulo de Metasploit, y el login habilita la bandeja.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SquirrelMailSite } from '../squirrelmail/SquirrelMailSite';
import type { Machine } from '../../../types';

const machine: Machine = {
  id: 'lab-scenario-08-win',
  machine_info: {
    hostname: 'WEBMAIL-SRV', ip: '192.168.60.10', mac: '00:00:00:00:00:00',
    os: 'Windows Server 2019 Standard', status: 'up', type: 'server', family: 'windows',
  },
  discovery_level: 0,
  scan_results: { ports: [] },
  web_enumeration: { web_server: 'apache', cms: 'squirrelmail', directories: [] },
  learning_steps: [],
  files: [],
};

function renderSite(currentUrl = 'http://192.168.60.10/webmail/src/login.php', loggedIn = false) {
  const onNavigate = vi.fn();
  const utils = render(
    <SquirrelMailSite
      machine={machine}
      currentUrl={currentUrl}
      browserIsLoggedIn={loggedIn}
      onNavigate={onNavigate}
    />,
  );
  return { onNavigate, ...utils };
}

describe('SquirrelMailSite', () => {
  it('muestra la versión 1.4.22 en la página de login', () => {
    renderSite();
    expect(screen.getByText(/SquirrelMail 1\.4\.22/)).toBeInTheDocument();
    expect(screen.getByText(/WEBMAIL-SRV/)).toBeInTheDocument();
  });

  it('el login abre la bandeja de entrada', () => {
    const { onNavigate } = renderSite();
    fireEvent.change(screen.getByPlaceholderText('usuario@corp.local'), { target: { value: 'soporte' } });
    fireEvent.change(screen.getByPlaceholderText('tu clave'), { target: { value: 'x' } });
    fireEvent.click(screen.getByText('Entrar'));
    expect(onNavigate).toHaveBeenCalledWith('http://192.168.60.10/webmail/src/inbox.php');
    // La bandeja tiene los correos de la máquina
    expect(screen.getByText(/Credenciales del acceso remoto/)).toBeInTheDocument();
  });

  it('con sesión iniciada, Redactar muestra el compose con la identidad de email', () => {
    renderSite('http://192.168.60.10/webmail/src/compose.php', true);
    expect(screen.getByText('Redactar')).toBeInTheDocument();
    expect(screen.getByText(/Tu dirección de email/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Cuerpo del mensaje…')).toBeInTheDocument();
  });
});
