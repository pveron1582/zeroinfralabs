// ── components/appContent/__tests__/WorkspaceTopBar.test.tsx ──────
// P1 3.6: `appContent/` (el shell del workspace, 1021 LOC) no tenía UN test.
// La barra superior decide qué tabs se ven según `uiMode` y
// `scenarioCategory`, y tiene dos salidas distintas (volver al home vs
// apagar). Todo eso era terreno sin red.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkspaceTopBar } from '../WorkspaceTopBar';

function renderBar(overrides: Partial<React.ComponentProps<typeof WorkspaceTopBar>> = {}) {
  const props = {
    scenarioName: 'Web Server',
    uiMode: 'classic',
    scenarioCategory: 'Web',
    activeApp: 'terminal',
    onGoHome: vi.fn(),
    onSetActiveApp: vi.fn(),
    onRefreshBrowser: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<WorkspaceTopBar {...props} />) };
}

describe('WorkspaceTopBar', () => {
  it('muestra el nombre del escenario y los tabs del modo clásico', () => {
    renderBar();
    expect(screen.getByText('Web Server')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByText('Chrome')).toBeInTheDocument();
    expect(screen.getByText('Burp')).toBeInTheDocument();
  });

  it('el tab de Terminal llama a onSetActiveApp', () => {
    const { props } = renderBar({ activeApp: 'browser' });
    fireEvent.click(screen.getByText('Terminal'));
    expect(props.onSetActiveApp).toHaveBeenCalledWith('terminal');
  });

  it('Chrome refresca el navegador Y activa la app (si no, queda en la vista anterior)', () => {
    const { props } = renderBar();
    fireEvent.click(screen.getByText('Chrome'));
    expect(props.onRefreshBrowser).toHaveBeenCalledTimes(1);
    expect(props.onSetActiveApp).toHaveBeenCalledWith('browser');
  });

  it('Burp solo cambia de app, no refresca el navegador', () => {
    const { props } = renderBar();
    fireEvent.click(screen.getByText('Burp'));
    expect(props.onSetActiveApp).toHaveBeenCalledWith('burpsuite');
    expect(props.onRefreshBrowser).not.toHaveBeenCalled();
  });

  it('oculta los tabs en uiMode distinto de classic (escritorio Windows/RDP)', () => {
    renderBar({ uiMode: 'windows-desktop', rdpActive: true });
    expect(screen.queryByText('Terminal')).not.toBeInTheDocument();
    expect(screen.queryByText('Chrome')).not.toBeInTheDocument();
    // El badge RDP sigue visible: es la única señal de que estás en la víctima.
    expect(screen.getByTestId('rdp-badge')).toBeInTheDocument();
  });

  it('sin tabs de browser/burps en escenarios que no son Web', () => {
    renderBar({ scenarioCategory: 'Active Directory' });
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.queryByText('Chrome')).not.toBeInTheDocument();
    expect(screen.queryByText('Burp')).not.toBeInTheDocument();
  });

  it('muestra el badge RDP también con uiMode classic si la sesión está activa', () => {
    renderBar({ rdpActive: true });
    expect(screen.getByTestId('rdp-badge')).toBeInTheDocument();
  });

  it('el botón ZI Labs vuelve al home si no hay onExit', () => {
    const { props } = renderBar();
    fireEvent.click(screen.getByText('ZI Labs'));
    expect(props.onGoHome).toHaveBeenCalledTimes(1);
  });

  it('con onExit (apagar) el botón llama a onExit y NO al home', () => {
    const { props } = renderBar({ onExit: vi.fn() });
    fireEvent.click(screen.getByText('ZI Labs'));
    expect(props.onExit).toHaveBeenCalledTimes(1);
    expect(props.onGoHome).not.toHaveBeenCalled();
  });

  it('modo compacto: solo nombre del escenario y botón de apagar, sin tabs', () => {
    const onExit = vi.fn();
    renderBar({ compact: true, onExit });
    expect(screen.getByText('Web Server')).toBeInTheDocument();
    expect(screen.queryByText('Terminal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /apagar|power off/i }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('modo compacto sin onExit no renderiza el botón de apagar', () => {
    renderBar({ compact: true });
    expect(screen.queryByRole('button', { name: /apagar|power off/i })).not.toBeInTheDocument();
  });
});
