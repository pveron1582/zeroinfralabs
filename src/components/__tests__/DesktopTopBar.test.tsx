import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DesktopTopBar } from '../DesktopTopBar';
import type { DesktopWindow } from '../../hooks/useDesktopWindows';

describe('DesktopTopBar', () => {
  const defaultProps = {
    windows: [],
    termWindows: [],
    browserWindows: [],
    wallpaperWindows: [],
    topWindowId: undefined,
    showAppMenu: false,
    showSysMenu: false,
    time: new Date('2026-06-20T20:00:00Z'),
    isEs: true,
    currentScenarioCategory: 'General',
    onToggleAppMenu: vi.fn(),
    onToggleSysMenu: vi.fn(),
    onCloseAppMenu: vi.fn(),
    onCloseSysMenu: vi.fn(),
    onAddTerminal: vi.fn(),
    onAddBrowser: vi.fn(),
    onOpenWallpaperPicker: vi.fn(),
    onMinimizeWindow: vi.fn(),
    onRestoreWindow: vi.fn(),
    onBringToFront: vi.fn(),
    onGoHome: vi.fn(),
    onShowAbout: vi.fn(),
  };

  it('debe renderizar la hora correctamente en español', () => {
    const time = new Date('2026-06-20T15:30:45Z');
    render(<DesktopTopBar {...defaultProps} time={time} isEs={true} />);
    // Debería mostrar la hora en formato HH:MM:SS
    // Dependiendo del huso horario de la máquina del usuario o timezone de Node, localTimeString puede variar,
    // pero la cadena contiene "15" o "30" o "45" de alguna forma.
    // Vamos a buscar un formato de reloj.
    const timeText = time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    expect(screen.getByText(timeText)).toBeInTheDocument();
  });

  it('debe abrir y alternar el menú de aplicaciones al hacer clic en Aplicaciones', () => {
    const onToggleAppMenu = vi.fn();
    render(<DesktopTopBar {...defaultProps} onToggleAppMenu={onToggleAppMenu} isEs={true} />);

    const appBtn = screen.getByText('Aplicaciones');
    fireEvent.click(appBtn);

    expect(onToggleAppMenu).toHaveBeenCalled();
  });

  it('debe abrir y alternar el menú de aplicaciones al hacer clic en Applications en inglés', () => {
    const onToggleAppMenu = vi.fn();
    render(<DesktopTopBar {...defaultProps} onToggleAppMenu={onToggleAppMenu} isEs={false} />);

    const appBtn = screen.getByText('Applications');
    fireEvent.click(appBtn);

    expect(onToggleAppMenu).toHaveBeenCalled();
  });

  it('debe mostrar las opciones del menú de aplicaciones cuando showAppMenu es true', () => {
    const onAddTerminal = vi.fn();
    const onOpenWallpaperPicker = vi.fn();
    const onShowAbout = vi.fn();
    const onCloseAppMenu = vi.fn();

    render(
      <DesktopTopBar
        {...defaultProps}
        showAppMenu={true}
        onAddTerminal={onAddTerminal}
        onOpenWallpaperPicker={onOpenWallpaperPicker}
        onShowAbout={onShowAbout}
        onCloseAppMenu={onCloseAppMenu}
        isEs={true}
      />
    );

    // Opciones del menú
    const termBtn = screen.getByText('Abrir Terminal');
    const wallBtn = screen.getByText('Cambiar Fondo');
    const aboutBtn = screen.getByText('Acerca de Kali');

    fireEvent.click(termBtn);
    expect(onAddTerminal).toHaveBeenCalled();
    expect(onCloseAppMenu).toHaveBeenCalled();

    fireEvent.click(wallBtn);
    expect(onOpenWallpaperPicker).toHaveBeenCalled();

    fireEvent.click(aboutBtn);
    expect(onShowAbout).toHaveBeenCalled();
  });

  it('debe mostrar el botón de Chrome en el menú de aplicaciones solo si la categoría es Web', () => {
    const onAddBrowser = vi.fn();
    const onCloseAppMenu = vi.fn();

    const { rerender } = render(
      <DesktopTopBar
        {...defaultProps}
        showAppMenu={true}
        currentScenarioCategory="General"
        onAddBrowser={onAddBrowser}
        onCloseAppMenu={onCloseAppMenu}
      />
    );

    expect(screen.queryByText('Chrome')).not.toBeInTheDocument();

    rerender(
      <DesktopTopBar
        {...defaultProps}
        showAppMenu={true}
        currentScenarioCategory="Web"
        onAddBrowser={onAddBrowser}
        onCloseAppMenu={onCloseAppMenu}
      />
    );

    const chromeBtn = screen.getByText('Chrome');
    fireEvent.click(chromeBtn);
    expect(onAddBrowser).toHaveBeenCalled();
    expect(onCloseAppMenu).toHaveBeenCalled();
  });

  it('debe mostrar el menú de sistema cuando showSysMenu es true', () => {
    const onGoHome = vi.fn();
    const onCloseSysMenu = vi.fn();

    render(
      <DesktopTopBar
        {...defaultProps}
        showSysMenu={true}
        onGoHome={onGoHome}
        onCloseSysMenu={onCloseSysMenu}
        isEs={true}
      />
    );

    const exitBtn = screen.getByText('Salir del Lab');
    fireEvent.click(exitBtn);

    expect(onGoHome).toHaveBeenCalled();
    expect(onCloseSysMenu).toHaveBeenCalled();
  });

  it('debe mostrar botones para las ventanas abiertas (Terminal, Browser, Wallpaper)', () => {
    const onMinimizeWindow = vi.fn();
    const onRestoreWindow = vi.fn();
    const onBringToFront = vi.fn();

    const termWindow: DesktopWindow = {
      id: 'term-1',
      title: 'Terminal 1',
      type: 'terminal',
      minimized: false,
      maximized: false,
      zIndex: 10,
      width: 600,
      height: 400,
      x: 10,
      y: 10,
    };

    const browserWindow: DesktopWindow = {
      id: 'browser-1',
      title: 'Fake Browser',
      type: 'browser',
      minimized: true,
      maximized: false,
      zIndex: 5,
      width: 800,
      height: 600,
      x: 50,
      y: 50,
    };

    const wallpaperWindow: DesktopWindow = {
      id: 'wall-1',
      title: 'Wallpapers',
      type: 'wallpapers',
      minimized: false,
      maximized: false,
      zIndex: 12,
      width: 400,
      height: 300,
      x: 100,
      y: 100,
    };

    render(
      <DesktopTopBar
        {...defaultProps}
        termWindows={[termWindow]}
        browserWindows={[browserWindow]}
        wallpaperWindows={[wallpaperWindow]}
        topWindowId="wall-1"
        onMinimizeWindow={onMinimizeWindow}
        onRestoreWindow={onRestoreWindow}
        onBringToFront={onBringToFront}
      />
    );

    // Debe mostrar los nombres de las ventanas
    const termBtn = screen.getByText('Terminal 1');
    const browserBtn = screen.getByText('Fake Browser');
    const wallBtn = screen.getByText('Wallpapers');

    expect(termBtn).toBeInTheDocument();
    expect(browserBtn).toBeInTheDocument();
    expect(wallBtn).toBeInTheDocument();

    // Al hacer clic en una ventana activa (Terminal 1 es activa pero no top, espera, topWindowId es wall-1)
    // Terminal 1 no está minimizada. Al hacer clic, como no es la top (topWindowId="wall-1"), ¿qué hace?
    // En el código:
    // onClick={() => { if (tw.minimized) { onRestoreWindow(tw.id); onBringToFront(tw.id); } else { onMinimizeWindow(tw.id); } }}
    // Si no está minimizada, llama a onMinimizeWindow.
    fireEvent.click(termBtn);
    expect(onMinimizeWindow).toHaveBeenCalledWith('term-1');

    // Browser está minimizado, al hacer clic llama a onRestoreWindow y onBringToFront
    fireEvent.click(browserBtn);
    expect(onRestoreWindow).toHaveBeenCalledWith('browser-1');
    expect(onBringToFront).toHaveBeenCalledWith('browser-1');
  });

  it('debe alternar el menú de sistema al hacer clic en el botón de apagado', () => {
    const onToggleSysMenu = vi.fn();
    const { container } = render(
      <DesktopTopBar
        {...defaultProps}
        showSysMenu={false}
        onToggleSysMenu={onToggleSysMenu}
      />
    );

    // El botón del menú de sistema es el que tiene el SVG con el icono de apagado
    // Buscamos el botón de apagado a través del path de su SVG
    const sysBtn = container.querySelector('path[d^="M18.36"]')?.closest('button');
    expect(sysBtn).toBeInTheDocument();
    fireEvent.click(sysBtn!);

    expect(onToggleSysMenu).toHaveBeenCalled();
  });

  it('debe interactuar correctamente con ventanas de fondos de pantalla minimizadas', () => {
    const onMinimizeWindow = vi.fn();
    const onRestoreWindow = vi.fn();
    const onBringToFront = vi.fn();

    const wallpaperWindow: DesktopWindow = {
      id: 'wall-1',
      title: 'Wallpapers',
      type: 'wallpapers',
      minimized: true,
      maximized: false,
      zIndex: 12,
      width: 400,
      height: 300,
      x: 100,
      y: 100,
    };

    render(
      <DesktopTopBar
        {...defaultProps}
        wallpaperWindows={[wallpaperWindow]}
        onMinimizeWindow={onMinimizeWindow}
        onRestoreWindow={onRestoreWindow}
        onBringToFront={onBringToFront}
      />
    );

    const wallBtn = screen.getByText('Wallpapers');
    fireEvent.click(wallBtn);

    expect(onRestoreWindow).toHaveBeenCalledWith('wall-1');
    expect(onBringToFront).toHaveBeenCalledWith('wall-1');
  });
});
