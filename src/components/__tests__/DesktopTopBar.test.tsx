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
    guideWindows: [],
    burpWindows: [],
    topWindowId: undefined,
    showAppMenu: false,
    time: new Date('2026-06-20T20:00:00Z'),
    isEs: true,
    currentScenarioCategory: 'General',
    onToggleAppMenu: vi.fn(),
    onCloseAppMenu: vi.fn(),
    onAddTerminal: vi.fn(),
    onAddBrowser: vi.fn(),
    onOpenGuide: vi.fn(),
    onOpenWallpaperPicker: vi.fn(),
    onAddBurp: vi.fn(),
    onMinimizeWindow: vi.fn(),
    onRestoreWindow: vi.fn(),
    onBringToFront: vi.fn(),
    onRequestExit: vi.fn(),
    onShowAbout: vi.fn(),
  };

  it('debe renderizar la hora correctamente en español', () => {
    const time = new Date('2026-06-20T15:30:45Z');
    render(<DesktopTopBar {...defaultProps} time={time} isEs={true} />);
    // Debería mostrar la hora en formato HH:MM (sin segundos)
    // Dependiendo del huso horario de la máquina del usuario o timezone de Node, localTimeString puede variar,
    // pero la cadena contiene "15" o "30" de alguna forma.
    // Vamos a buscar un formato de reloj.
    const timeText = time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    expect(screen.getByText(timeText)).toBeInTheDocument();
  });

  it('debe mostrar el reloj fijo a la derecha, justo antes del botón de apagado, sin segundos', () => {
    const time = new Date('2026-06-20T15:30:45Z');
    render(<DesktopTopBar {...defaultProps} time={time} isEs={true} />);

    const timeText = time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const clockEl = screen.getByText(timeText);
    const powerBtn = screen.getByTitle('Apagar');

    // El reloj debe estar inmediatamente antes del botón de apagado
    expect(powerBtn.previousElementSibling).toBe(clockEl);
    // Formato HH:MM → solo 2 partes separadas por ':'
    expect(timeText.split(':')).toHaveLength(2);
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
    const guideBtn = screen.getByText('Ver Manual de uso');
    const aboutBtn = screen.getByText('Acerca de Kali');

    fireEvent.click(termBtn);
    expect(onAddTerminal).toHaveBeenCalled();
    expect(onCloseAppMenu).toHaveBeenCalled();

    fireEvent.click(wallBtn);
    expect(onOpenWallpaperPicker).toHaveBeenCalled();

    fireEvent.click(guideBtn);
    expect(defaultProps.onOpenGuide).toHaveBeenCalled();

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

  it('debe mostrar el botón de Burp Suite en el menú de aplicaciones solo si la categoría es Web', () => {
    const onAddBurp = vi.fn();
    const onCloseAppMenu = vi.fn();

    const { rerender } = render(
      <DesktopTopBar
        {...defaultProps}
        showAppMenu={true}
        currentScenarioCategory="General"
        onAddBurp={onAddBurp}
        onCloseAppMenu={onCloseAppMenu}
      />
    );

    expect(screen.queryByText('Burp Suite')).not.toBeInTheDocument();

    rerender(
      <DesktopTopBar
        {...defaultProps}
        showAppMenu={true}
        currentScenarioCategory="Web"
        onAddBurp={onAddBurp}
        onCloseAppMenu={onCloseAppMenu}
      />
    );

    const burpBtn = screen.getByText('Burp Suite');
    fireEvent.click(burpBtn);
    expect(onAddBurp).toHaveBeenCalled();
    expect(onCloseAppMenu).toHaveBeenCalled();
  });

  it('debe mostrar el botón de la ventana Burp Suite en la barra cuando está abierta', () => {
    const onRestoreWindow = vi.fn();
    const onBringToFront = vi.fn();

    const burpWindow: DesktopWindow = {
      id: 'burp-1',
      title: 'Burp Suite',
      type: 'burpsuite',
      minimized: true,
      maximized: false,
      zIndex: 12,
      x: 10, y: 10, w: 800, h: 500, opacity: 1, fontSize: 13,
    };

    render(
      <DesktopTopBar
        {...defaultProps}
        burpWindows={[burpWindow]}
        onRestoreWindow={onRestoreWindow}
        onBringToFront={onBringToFront}
      />
    );

    const btn = screen.getByText('Burp Suite');
    fireEvent.click(btn);
    expect(onRestoreWindow).toHaveBeenCalledWith('burp-1');
    expect(onBringToFront).toHaveBeenCalledWith('burp-1');
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
      opacity: 100,
      fontSize: 14,
      w: 600,
      h: 400,
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
      opacity: 100,
      fontSize: 14,
      w: 800,
      h: 600,
      x: 50,
      y: 50,
    };

    const wallpaperWindow: DesktopWindow = {
      id: 'wall-1',
      title: 'Wallpapers',
      type: 'wallpaper',
      minimized: false,
      maximized: false,
      zIndex: 12,
      opacity: 100,
      fontSize: 14,
      w: 400,
      h: 300,
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

    // Terminal 1 no está minimizada pero no es la top (topWindowId="wall-1") → traer al frente
    fireEvent.click(termBtn);
    expect(onBringToFront).toHaveBeenCalledWith('term-1');

    // Browser está minimizado, al hacer clic llama a onRestoreWindow y onBringToFront
    fireEvent.click(browserBtn);
    expect(onRestoreWindow).toHaveBeenCalledWith('browser-1');
    expect(onBringToFront).toHaveBeenCalledWith('browser-1');
  });

  it('debe llamar onRequestExit al hacer clic en el botón de apagado', () => {
    const onRequestExit = vi.fn();
    render(<DesktopTopBar {...defaultProps} onRequestExit={onRequestExit} isEs={true} />);

    const powerBtn = screen.getByTitle('Apagar');
    fireEvent.click(powerBtn);

    expect(onRequestExit).toHaveBeenCalled();
  });

  it('debe interactuar correctamente con ventanas de fondos de pantalla minimizadas', () => {
    const onMinimizeWindow = vi.fn();
    const onRestoreWindow = vi.fn();
    const onBringToFront = vi.fn();

    const wallpaperWindow: DesktopWindow = {
      id: 'wall-1',
      title: 'Wallpapers',
      type: 'wallpaper',
      minimized: true,
      maximized: false,
      zIndex: 12,
      opacity: 100,
      fontSize: 14,
      w: 400,
      h: 300,
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

  it('debe mostrar y manejar el botón del Manual en la barra de tareas', () => {
    const onMinimizeWindow = vi.fn();
    const onRestoreWindow = vi.fn();
    const onBringToFront = vi.fn();

    const guideWindow: DesktopWindow = {
      id: 'guide-1',
      title: 'Manual de uso - manual.pdf',
      type: 'guide',
      minimized: true,
      maximized: false,
      zIndex: 12,
      opacity: 100,
      fontSize: 14,
      w: 640,
      h: 520,
      x: 100,
      y: 100,
    };

    render(
      <DesktopTopBar
        {...defaultProps}
        guideWindows={[guideWindow]}
        onMinimizeWindow={onMinimizeWindow}
        onRestoreWindow={onRestoreWindow}
        onBringToFront={onBringToFront}
      />
    );

    const guideBtn = screen.getByText('Manual');
    expect(guideBtn).toBeInTheDocument();

    fireEvent.click(guideBtn);
    expect(onRestoreWindow).toHaveBeenCalledWith('guide-1');
    expect(onBringToFront).toHaveBeenCalledWith('guide-1');
  });
});
