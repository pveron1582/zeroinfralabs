// ── components/fakesites/casinoveo/__tests__/CasinoVeoSite.test.tsx ──
// Fake site del Lab 07: landing + login vulnerable a SQLi. El formulario
// usa el motor HTTP sintético, mismo que Burp/curl.
import { describe, it, expect, vi, afterEach } from 'vitest';
import type { Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CasinoVeoSite } from '../CasinoVeoSite';
import type { CommandResponse, Machine } from '../../../../types';

const createCasinoMachine = (): Machine => ({
  id: 'lab-scenario-07-casinoveo',
  machine_info: {
    hostname: 'casinoveo-web',
    ip: '192.168.50.11',
    mac: '08:00:27:B8:7F:2A',
    os: 'Ubuntu 20.04 LTS',
    status: 'up',
    type: 'server',
  },
  discovery_level: 2,
  scan_results: { ports: [{ port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'Apache httpd 2.4.52' }] },
  web_enumeration: {
    web_server: 'Apache/2.4.52',
    cms: 'CasinoVeo 2.0 - AI Image Generator (login vulnerable)',
    directories: [
      { path: '/', status: 200, description: 'Home page (CasinoVeo landing)' },
      { path: '/login', status: 200, description: 'Login form (VULNERABLE to SQLi)' },
      { path: '/admin', status: 403, description: 'Admin panel (restricted)' },
    ],
  },
  known_passwords: { root: 'BurpSQLi@2024!', admin: 'Admin@2024' },
  flags: { root: 'ZIL{INTERCEPT_AND_EXPLOIT}' },
  learning_steps: [],
  files: [],
});

function renderSite(currentUrl: string, overrides: Partial<Parameters<typeof CasinoVeoSite>[0]> = {}) {
  const props = {
    machine: createCasinoMachine(),
    currentUrl,
    onNavigate: vi.fn(),
    onReportVulnerability: vi.fn(),
    onCredentialsFound: vi.fn(),
    checkMissionCompletion: vi.fn(),
    ...overrides,
  };
  const utils = render(<CasinoVeoSite {...props} />);
  return { ...utils, ...props };
}

// Última transacción HTTP emitida vía checkMissionCompletion (variante 'http').
function lastHttpTx(fn: unknown): Extract<CommandResponse, { type: 'http' }> {
  const calls = (fn as Mock).mock.calls;
  return calls[calls.length - 1][0] as Extract<CommandResponse, { type: 'http' }>;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('CasinoVeoSite - landing', () => {
  it('debe renderizar la landing con branding CasinoVeo', () => {
    renderSite('http://192.168.50.11/');
    expect(screen.getByText('CasinoVeo')).toBeInTheDocument();
    expect(screen.getByText(/Casi-No-Veo v2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar a generar/i })).toBeInTheDocument();
  });

  it('debe navegar al login desde la landing', () => {
    const { onNavigate } = renderSite('http://192.168.50.11/');
    fireEvent.click(screen.getByRole('button', { name: /Ingresar a generar/i }));
    expect(onNavigate).toHaveBeenCalledWith('http://192.168.50.11/login');
  });
});

describe('CasinoVeoSite - login vulnerable', () => {
  it('debe renderizar el formulario de login', () => {
    renderSite('http://192.168.50.11/login');
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar a generar/i })).toBeInTheDocument();
  });

  it('comilla simple → error 500 con SQL syntax y metadata detected', () => {
    vi.useFakeTimers();
    const { onReportVulnerability, checkMissionCompletion } = renderSite('http://192.168.50.11/login');

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: "admin'" } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar a generar/i }));

    expect(screen.getByText(/Consultando la nube/i)).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(900); });

    expect(screen.getByText(/500 Internal Server Error/)).toBeInTheDocument();
    expect(screen.getByText(/SQL syntax/)).toBeInTheDocument();
    expect(onReportVulnerability).toHaveBeenCalledWith('lab-scenario-07-casinoveo', 'SQLi', 'detected');
    const result = lastHttpTx(checkMissionCompletion);
    expect(result.type).toBe('http');
    expect(result.foundVulnerability?.status).toBe('detected');
    expect(result.httpRequest.url).toBe('http://192.168.50.11/login');
  });

  it("payload ' OR '1'='1 → bypass (render desbloqueado) y metadata confirmed", () => {
    vi.useFakeTimers();
    const { onReportVulnerability, checkMissionCompletion } = renderSite('http://192.168.50.11/login');

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: "' OR '1'='1" } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar a generar/i }));

    act(() => { vi.advanceTimersByTime(900); });

    expect(screen.getByText(/Render desbloqueado/)).toBeInTheDocument();
    expect(screen.getByText(/Next Step: como buen profesional/i)).toBeInTheDocument();
    expect(onReportVulnerability).toHaveBeenCalledWith('lab-scenario-07-casinoveo', 'SQLi', 'confirmed');
    const result = lastHttpTx(checkMissionCompletion);
    expect(result.foundVulnerability?.status).toBe('confirmed');
  });

  it('credenciales normales → acceso denegado sin metadata', () => {
    vi.useFakeTimers();
    const { onReportVulnerability, checkMissionCompletion } = renderSite('http://192.168.50.11/login');

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar a generar/i }));

    act(() => { vi.advanceTimersByTime(900); });

    expect(screen.getByText(/Credenciales inválidas/i)).toBeInTheDocument();
    expect(onReportVulnerability).not.toHaveBeenCalled();
    const result = lastHttpTx(checkMissionCompletion);
    expect(result.foundVulnerability).toBeUndefined();
  });

  it('UNION SELECT → volcado de la tabla users con flag y credenciales MySQL', () => {
    vi.useFakeTimers();
    const { onCredentialsFound, checkMissionCompletion } = renderSite('http://192.168.50.11/login');

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: "' UNION SELECT * FROM users--" } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar a generar/i }));

    act(() => { vi.advanceTimersByTime(900); });

    expect(screen.getAllByText(/ZIL\{INTERCEPT_AND_EXPLOIT\}/).length).toBeGreaterThan(0);
    expect(onCredentialsFound).toHaveBeenCalledWith(
      'lab-scenario-07-casinoveo', 'root', 'BurpSQLi@2024!', '/var/lib/mysql/users.ibd', 'mysql'
    );
    const result = lastHttpTx(checkMissionCompletion);
    expect(result.foundCredentials?.service).toBe('mysql');
    expect(result.fileRead?.isFlag).toBe(true);
  });

  it('debe regresar al formulario con el botón Volver al login', () => {
    vi.useFakeTimers();
    renderSite('http://192.168.50.11/login');

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /Entrar a generar/i }));
    act(() => { vi.advanceTimersByTime(900); });

    fireEvent.click(screen.getByRole('button', { name: /Volver a intentar/i }));
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument();
  });
});

describe('CasinoVeoSite - admin', () => {
  it('debe mostrar 403 en /admin', () => {
    const { onNavigate } = renderSite('http://192.168.50.11/admin');
    expect(screen.getAllByText(/403 Forbidden/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /Ir al login/i }));
    expect(onNavigate).toHaveBeenCalledWith('http://192.168.50.11/login');
  });
});
