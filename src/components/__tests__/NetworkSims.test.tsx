// ── components/__tests__/NetworkSims.test.tsx ──────────────────────
// Tests de los simuladores de red: NetworkHomeLab (network-03),
// NetworkDMZLab (network-04), NetworkMitmLab (network-05) y
// NetworkTopologyLab (proto-07).
// Se usan los motores drag&drop del NetworkSimCore via testerids handle-*.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NetworkHomeLab } from '../academy/NetworkHomeLab';
import { NetworkDMZLab } from '../academy/NetworkDMZLab';
import { NetworkMitmLab } from '../academy/NetworkMitmLab';
import { NetworkTopologyLab } from '../academy/NetworkTopologyLab';

const connect = (a: string, b: string) => {
  fireEvent.mouseDown(screen.getByTestId(`handle-${a}`), { clientX: 10, clientY: 10 });
  fireEvent.mouseUp(screen.getByTestId(`handle-${b}`), { clientX: 20, clientY: 20 });
};

describe('NetworkHomeLab', () => {
  beforeEach(() => { render(<NetworkHomeLab isEs />); });

  it('renderiza los 7 nodos con badge "sin conexión"', () => {
    expect(screen.getByTestId('node-pc')).toBeInTheDocument();
    expect(screen.getByTestId('node-internet')).toBeInTheDocument();
    expect(screen.getAllByText(/○ sin conexión/).length).toBe(6); // todos menos internet
  });

  it('rechaza una conexión ilegal (PC directo a router)', () => {
    connect('pc', 'router');
    expect(screen.getByText(/No podés conectar PC directamente a Router/)).toBeInTheDocument();
    expect(screen.getByText(/Seguí la topología/)).toBeInTheDocument();
  });

  it('GANAR: cables completos + firewall ON muestra éxito', () => {
    connect('pc', 'switch');
    connect('laptop', 'switch');
    connect('server', 'switch');
    connect('switch', 'router');
    connect('router', 'firewall');
    connect('firewall', 'internet');
    expect(screen.getByText(/¡Toda la red tiene internet y el firewall protege el perímetro!/)).toBeInTheDocument();
    expect(screen.getByText('Con internet: 3/3')).toBeInTheDocument();
  });

  it('la red completa con firewall OFF advierte que está expuesta', () => {
    connect('pc', 'switch');
    connect('laptop', 'switch');
    connect('server', 'switch');
    connect('switch', 'router');
    connect('router', 'firewall');
    connect('firewall', 'internet');
    // apagar el firewall
    fireEvent.click(screen.getByRole('button', { name: 'ON' }));
    expect(screen.getByText(/la red está expuesta. Activá el firewall/)).toBeInTheDocument();
    expect(screen.queryByText(/protege el perímetro!/)).not.toBeInTheDocument();
  });
});

describe('NetworkDMZLab', () => {
  beforeEach(() => { render(<NetworkDMZLab isEs />); });

  it('renderiza las zonas DMZ y LAN', () => {
    expect(screen.getByText(/ZONA DESMILITARIZADA/)).toBeInTheDocument();
    expect(screen.getByText(/RED INTERNA PRIVADA/)).toBeInTheDocument();
  });

  it('gana cuando internet + los 4 servidores cuelgan del firewall', () => {
    connect('internet', 'firewall');
    connect('firewall', 'web');
    connect('firewall', 'mail');
    connect('firewall', 'pc');
    connect('firewall', 'db');
    expect(screen.getByText(/¡Topología DMZ perfecta!/)).toBeInTheDocument();
    // DMZ públicos (2: web y mail) vs LAN protegidos (2: pc y db)
    expect(screen.getAllByText(/⚡ público/).length).toBe(2);
    expect(screen.getAllByText(/🛡️ protegido \+ internet/).length).toBe(2);
    expect(screen.getByText('DMZ (pública): 2/2')).toBeInTheDocument();
    expect(screen.getByText('LAN (protegida): 2/2')).toBeInTheDocument();
  });

  it('sin servidores el firewall con internet avisa que falta colgar servicios', () => {
    connect('internet', 'firewall');
    expect(screen.getByText(/todavía no hay servidores conectados/)).toBeInTheDocument();
  });
});

describe('NetworkMitmLab', () => {
  beforeEach(() => { render(<NetworkMitmLab isEs />); });

  it('el ARP spoof exige que el atacante esté en la LAN', () => {
    connect('internet', 'router');
    connect('router', 'switch');
    connect('switch', 'victim');
    // activar spoof (botón OFF → ON) sin atacante en la LAN
    fireEvent.click(screen.getByRole('button', { name: 'OFF' }));
    expect(screen.getByText(/El atacante no está en la LAN/)).toBeInTheDocument();
  });

  it('GANAR: víctima online + atacante en la LAN + spoof ON = MITM', () => {
    connect('internet', 'router');
    connect('router', 'switch');
    connect('switch', 'victim');
    connect('switch', 'attacker');
    // sin spoof: la víctima navega normal
    expect(screen.getByTestId('node-victim')).toBeInTheDocument();
    expect(screen.getByText('Víctima: ✅ navega')).toBeInTheDocument();
    // activar el ARP spoof (botón OFF → ON)
    fireEvent.click(screen.getByRole('button', { name: 'OFF' }));
    expect(screen.getByText(/⚠️ vía atacante/)).toBeInTheDocument();
    expect(screen.getByText(/¡Man-in-the-Middle logrado!/)).toBeInTheDocument();
    expect(screen.getByText('Víctima: ⚠️ interceptada')).toBeInTheDocument();
  });
});

describe('NetworkTopologyLab', () => {
  beforeEach(() => { render(<NetworkTopologyLab isEs />); });

  const choose = (type: string) => fireEvent.click(screen.getByTestId(`cable-${type}`));

  it('renderiza los 8 nodos y el selector con los 3 tipos de cable', () => {
    for (const id of ['internet', 'router', 'switch', 'ap', 'pc', 'laptop', 'server', 'phone']) {
      expect(screen.getByTestId(`node-${id}`)).toBeInTheDocument();
    }
    expect(screen.getByTestId('cable-copper')).toBeInTheDocument();
    expect(screen.getByTestId('cable-fiber')).toBeInTheDocument();
    expect(screen.getByTestId('cable-wifi')).toBeInTheDocument();
  });

  it('rechaza el cable equivocado (PC con fibra → mensaje educativo)', () => {
    choose('fiber');
    connect('pc', 'switch');
    expect(screen.getByText(/va con cable de cobre/)).toBeInTheDocument();
  });

  it('el celular solo acepta WiFi: intentarlo con cobre falla', () => {
    choose('copper');
    connect('phone', 'ap');
    expect(screen.getByText(/no tiene puerto de red/)).toBeInTheDocument();
  });

  it('GANAR: todo cableado con su tipo correcto = todos online', () => {
    choose('copper');
    connect('internet', 'router');
    connect('router', 'switch');
    connect('switch', 'ap');
    connect('pc', 'switch');
    connect('laptop', 'switch');
    choose('fiber');
    connect('server', 'switch');
    choose('wifi');
    connect('laptop', 'ap');
    connect('phone', 'ap');
    expect(screen.getByText(/¡Topología perfecta!/)).toBeInTheDocument();
    expect(screen.getByText('Con internet: 4/4')).toBeInTheDocument();
  });
});