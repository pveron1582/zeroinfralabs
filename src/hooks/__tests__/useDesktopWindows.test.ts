import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDesktopWindows } from '../useDesktopWindows';

const mockState = {
  showNotification: vi.fn(),
  currentScenario: { id: 'scenario-01', initialMachineId: 'attacker-01', category: 'General' },
  missions: [],
  language: 'es',
};

vi.mock('../../store/scenarioStore', () => ({
  useScenarioStore: Object.assign(
    vi.fn((selector) => selector(mockState)),
    { getState: vi.fn(() => mockState) }
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDesktopWindows', () => {
  it('debe iniciar con una terminal, wallpaper neon-kali y menús cerrados', () => {
    const { result } = renderHook(() => useDesktopWindows());

    expect(result.current.windows).toHaveLength(1);
    expect(result.current.windows[0].id).toBe('term-initial');
    expect(result.current.windows[0].type).toBe('terminal');
    expect(result.current.windows[0].title).toBe('Terminal 1 - root@kali');
    expect(result.current.windows[0].minimized).toBe(false);
    expect(result.current.windows[0].zIndex).toBe(10);

    expect(result.current.activeWallpaper).toBe('neon-kali');
    expect(result.current.selectedWallpaper.id).toBe('neon-kali');
    expect(result.current.showAppMenu).toBe(false);
    expect(result.current.showSysMenu).toBe(false);
    expect(result.current.closingWindowIds).toEqual([]);
    expect(result.current.activeOpacitySliderId).toBeNull();
    expect(result.current.activeFontSliderId).toBeNull();
  });

  it('debe computar termWindows, browserWindows y wallpaperWindowscorrectamente', () => {
    const { result } = renderHook(() => useDesktopWindows());

    expect(result.current.termWindows).toHaveLength(1);
    expect(result.current.browserWindows).toHaveLength(0);
    expect(result.current.wallpaperWindows).toHaveLength(0);
  });

  it('debe tener topWindowId inicial como term-initial', () => {
    const { result } = renderHook(() => useDesktopWindows());
    expect(result.current.topWindowId).toBe('term-initial');
  });

  it('debe cargar wallpaper desde localStorage si existe', () => {
    localStorage.setItem('cyberops-desktop-wallpaper', 'matrix');
    const { result } = renderHook(() => useDesktopWindows());
    expect(result.current.activeWallpaper).toBe('matrix');
    expect(result.current.selectedWallpaper.id).toBe('matrix');
  });

  it('debe usar neon-kali si localStorage está vacío', () => {
    localStorage.removeItem('cyberops-desktop-wallpaper');
    const { result } = renderHook(() => useDesktopWindows());
    expect(result.current.activeWallpaper).toBe('neon-kali');
  });

  it('debe persistir wallpaper en localStorage al cambiarlo', () => {
    const { result } = renderHook(() => useDesktopWindows());
    act(() => { result.current.setActiveWallpaper('cybercity'); });
    expect(localStorage.getItem('cyberops-desktop-wallpaper')).toBe('cybercity');
  });

  it('debe actualizar selectedWallpaper al cambiar wallpaper', () => {
    const { result } = renderHook(() => useDesktopWindows());
    act(() => { result.current.setActiveWallpaper('deep-purple'); });
    expect(result.current.selectedWallpaper.id).toBe('deep-purple');
  });

  it('debe hacer fallback a WALLPAPERS[0] si el id es inválido', () => {
    localStorage.setItem('cyberops-desktop-wallpaper', 'nonexistent');
    const { result } = renderHook(() => useDesktopWindows());
    expect(result.current.selectedWallpaper.id).toBe('neon-kali');
  });

  describe('addTerminal', () => {
    it('debe agregar una nueva terminal con id incremental', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      expect(result.current.windows).toHaveLength(2);
      const added = result.current.windows[1];
      expect(added.type).toBe('terminal');
      expect(added.title).toBe('Terminal 2 - root@kali');
      expect(added.fontSize).toBe(13);
      expect(added.opacity).toBe(0.5);
    });

    it('debe asignar zIndex mayor a la nueva terminal', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      expect(result.current.windows[1].zIndex).toBeGreaterThan(result.current.windows[0].zIndex);
    });

    it('no debe permitir más de 5 terminales', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      act(() => { result.current.addTerminal(); });
      act(() => { result.current.addTerminal(); });
      act(() => { result.current.addTerminal(); });
      expect(result.current.windows).toHaveLength(5);
      act(() => { result.current.addTerminal(); });
      expect(result.current.windows).toHaveLength(5);
      expect(mockState.showNotification).toHaveBeenCalled();
    });
  });

  describe('addBrowser', () => {
    it('debe agregar una ventana Chrome', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addBrowser(); });
      expect(result.current.windows).toHaveLength(2);
      expect(result.current.windows[1].type).toBe('browser');
      expect(result.current.windows[1].title).toBe('Chrome 1');
    });

    it('no debe permitir más de 3 Chrome', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addBrowser(); });
      act(() => { result.current.addBrowser(); });
      act(() => { result.current.addBrowser(); });
      expect(result.current.windows).toHaveLength(4);
      act(() => { result.current.addBrowser(); });
      expect(result.current.windows).toHaveLength(4);
      expect(mockState.showNotification).toHaveBeenCalled();
    });
  });

  describe('openWallpaperPicker', () => {
    it('debe abrir ventana de configuración de fondo', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.openWallpaperPicker(); });
      expect(result.current.windows).toHaveLength(2);
      expect(result.current.windows[1].type).toBe('wallpaper');
    });

    it('no debe abrir si ya hay una ventana wallpaper abierta', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.openWallpaperPicker(); });
      act(() => { result.current.openWallpaperPicker(); });
      expect(result.current.windows).toHaveLength(2);
      expect(mockState.showNotification).toHaveBeenCalled();
    });
  });

  describe('closeWindow', () => {
    it('debe agregar a closingWindowIds y remover luego de 300ms', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.closeWindow('term-initial'); });
      expect(result.current.closingWindowIds).toContain('term-initial');
      act(() => { vi.advanceTimersByTime(300); });
      expect(result.current.windows).toHaveLength(0);
      expect(result.current.closingWindowIds).not.toContain('term-initial');
    });
  });

  describe('minimizeWindow / restoreWindow', () => {
    it('debe minimizar y restaurar una ventana', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.minimizeWindow('term-initial'); });
      expect(result.current.windows[0].minimized).toBe(true);
      act(() => { result.current.restoreWindow('term-initial'); });
      expect(result.current.windows[0].minimized).toBe(false);
    });
  });

  describe('bringToFront', () => {
    it('debe subir el zIndex de una ventana', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const originalZ = result.current.windows[0].zIndex;
      const higherZ = result.current.windows[1].zIndex;
      expect(higherZ).toBeGreaterThan(originalZ);
      act(() => { result.current.bringToFront(result.current.windows[0].id); });
      expect(result.current.windows[0].zIndex).toBeGreaterThan(higherZ);
    });
  });

  describe('toggleMaximize', () => {
    it('debe maximizar y restaurar una ventana', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const original = { x: result.current.windows[0].x, y: result.current.windows[0].y, w: result.current.windows[0].w, h: result.current.windows[0].h };
      act(() => { result.current.toggleMaximize('term-initial'); });
      expect(result.current.windows[0].maximized).toBe(true);
      expect(result.current.windows[0].x).toBe(8);
      expect(result.current.windows[0].y).toBe(8);
      act(() => { result.current.toggleMaximize('term-initial'); });
      expect(result.current.windows[0].maximized).toBe(false);
      expect(result.current.windows[0].x).toBe(original.x);
      expect(result.current.windows[0].y).toBe(original.y);
      expect(result.current.windows[0].w).toBe(original.w);
      expect(result.current.windows[0].h).toBe(original.h);
    });
  });

  describe('changeFontSize', () => {
    it('debe aumentar el tamaño de fuente', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.changeFontSize('term-initial', 2); });
      expect(result.current.windows[0].fontSize).toBe(15);
    });

    it('debe disminuir el tamaño de fuente', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.changeFontSize('term-initial', -2); });
      expect(result.current.windows[0].fontSize).toBe(11);
    });

    it('debe limitar a mínimo 10', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.changeFontSize('term-initial', -10); });
      expect(result.current.windows[0].fontSize).toBe(10);
    });

    it('debe limitar a máximo 20', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.changeFontSize('term-initial', 20); });
      expect(result.current.windows[0].fontSize).toBe(20);
    });
  });

  describe('topWindowId', () => {
    it('debe devolver undefined si todas las ventanas están minimizadas', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.minimizeWindow('term-initial'); });
      expect(result.current.topWindowId).toBeUndefined();
    });

    it('debe devolver la ventana no minimizada con mayor zIndex', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      act(() => { result.current.bringToFront(result.current.windows[0].id); });
      expect(result.current.topWindowId).toBe(result.current.windows[0].id);
    });
  });

  describe('startDrag', () => {
    it('debe ignorar click derecho (button !== 0)', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const e = { button: 2, target: document.createElement('div'), preventDefault: vi.fn(), clientX: 100, clientY: 100 } as any;
      act(() => { result.current.startDrag('term-initial', e); });
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('debe ignorar drag sobre botones', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const btn = document.createElement('button');
      const e = { button: 0, target: btn, preventDefault: vi.fn(), clientX: 100, clientY: 100 } as any;
      act(() => { result.current.startDrag('term-initial', e); });
      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('startResize', () => {
    it('debe ignorar resize de ventana inexistente', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const e = { preventDefault: vi.fn(), stopPropagation: vi.fn(), clientX: 100, clientY: 100 } as any;
      act(() => { result.current.startResize('nonexistent', e); });
      expect(e.preventDefault).toHaveBeenCalled();
    });
  });

  describe('clock effect', () => {
    it('debe actualizar el tiempo cada segundo', () => {
      vi.useFakeTimers();
      const before = new Date();
      const { result } = renderHook(() => useDesktopWindows());
      expect(result.current.time.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.time.getTime()).toBeGreaterThanOrEqual(before.getTime() + 500);
    });
  });

  describe('isEs', () => {
    it('debe ser true cuando language es "es"', () => {
      mockState.language = 'es';
      const { result } = renderHook(() => useDesktopWindows());
      expect(result.current.isEs).toBe(true);
    });

    it('debe ser false cuando language no es "es"', () => {
      mockState.language = 'en';
      const { result } = renderHook(() => useDesktopWindows());
      expect(result.current.isEs).toBe(false);
    });
  });
});
