import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDesktopWindows } from '../useDesktopWindows';
import { WALLPAPERS, DEFAULT_WALLPAPER_ID } from '../../components/desktopWallpapers';

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

// Helper: agrega una terminal y un manual, devolviendo sus ids
function openDefaultWindows(result: { current: ReturnType<typeof useDesktopWindows> }) {
  let termId = '';
  let guideId = '';
  act(() => { result.current.addTerminal(); });
  termId = result.current.windows[0].id;
  act(() => { result.current.addGuide(); });
  guideId = result.current.windows[1].id;
  return { termId, guideId };
}

describe('useDesktopWindows', () => {
  it('debe iniciar sin ventanas, solo iconos del escritorio y wallpaper por defecto', () => {
    const { result } = renderHook(() => useDesktopWindows());

    expect(result.current.windows).toHaveLength(0);
    expect(result.current.termWindows).toHaveLength(0);
    expect(result.current.guideWindows).toHaveLength(0);

    expect(result.current.activeWallpaper).toBe(DEFAULT_WALLPAPER_ID);
    expect(result.current.selectedWallpaper.id).toBe(DEFAULT_WALLPAPER_ID);
    expect(result.current.showAppMenu).toBe(false);
    expect(result.current.showSysMenu).toBe(false);
    expect(result.current.closingWindowIds).toEqual([]);
    expect(result.current.activeSettingsId).toBeNull();
  });

  it('debe computar termWindows, browserWindows, wallpaperWindows y guideWindows correctamente', () => {
    const { result } = renderHook(() => useDesktopWindows());
    openDefaultWindows(result);

    expect(result.current.termWindows).toHaveLength(1);
    expect(result.current.browserWindows).toHaveLength(0);
    expect(result.current.wallpaperWindows).toHaveLength(0);
    expect(result.current.guideWindows).toHaveLength(1);
  });

  it('debe tener topWindowId como la última ventana abierta', () => {
    const { result } = renderHook(() => useDesktopWindows());
    openDefaultWindows(result);
    expect(result.current.topWindowId).toBe(result.current.windows[1].id);
  });

  it('debe cargar wallpaper desde localStorage si existe', () => {
    localStorage.setItem('cyberops-desktop-wallpaper', WALLPAPERS[1].id);
    const { result } = renderHook(() => useDesktopWindows());
    expect(result.current.activeWallpaper).toBe(WALLPAPERS[1].id);
    expect(result.current.selectedWallpaper.id).toBe(WALLPAPERS[1].id);
  });

  it('debe usar el wallpaper por defecto si localStorage está vacío', () => {
    localStorage.removeItem('cyberops-desktop-wallpaper');
    const { result } = renderHook(() => useDesktopWindows());
    expect(result.current.activeWallpaper).toBe(DEFAULT_WALLPAPER_ID);
  });

  it('debe persistir wallpaper en localStorage al cambiarlo', () => {
    const { result } = renderHook(() => useDesktopWindows());
    act(() => { result.current.setActiveWallpaper(WALLPAPERS[1].id); });
    expect(localStorage.getItem('cyberops-desktop-wallpaper')).toBe(WALLPAPERS[1].id);
  });

  it('debe actualizar selectedWallpaper al cambiar wallpaper', () => {
    const { result } = renderHook(() => useDesktopWindows());
    act(() => { result.current.setActiveWallpaper(WALLPAPERS[2].id); });
    expect(result.current.selectedWallpaper.id).toBe(WALLPAPERS[2].id);
  });

  it('debe hacer fallback a WALLPAPERS[0] si el id es inválido', () => {
    localStorage.setItem('cyberops-desktop-wallpaper', 'nonexistent');
    const { result } = renderHook(() => useDesktopWindows());
    expect(result.current.selectedWallpaper.id).toBe(WALLPAPERS[0].id);
  });

  describe('addTerminal', () => {
    it('debe abrir la primera terminal al hacer clic en el icono', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      expect(result.current.windows).toHaveLength(1);
      const added = result.current.windows[0];
      expect(added.type).toBe('terminal');
      expect(added.title).toBe('Terminal 1 - root@kali');
      expect(added.fontSize).toBe(15);
      expect(added.opacity).toBe(0.92);
      expect(added.minimized).toBe(false);
    });

    it('debe asignar zIndex mayor a la nueva terminal', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const first = result.current.windows[0];
      act(() => { result.current.addTerminal(); });
      const added = result.current.windows[1];
      expect(added.zIndex).toBeGreaterThan(first.zIndex);
    });

    it('no debe permitir más de 5 terminales', () => {
      const { result } = renderHook(() => useDesktopWindows());
      for (let i = 0; i < 5; i++) act(() => { result.current.addTerminal(); });
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
      expect(result.current.windows).toHaveLength(1);
      const added = result.current.windows.find(w => w.type === 'browser')!;
      expect(added.type).toBe('browser');
      expect(added.title).toBe('Chrome 1');
    });

    it('no debe permitir más de 3 Chrome', () => {
      const { result } = renderHook(() => useDesktopWindows());
      for (let i = 0; i < 3; i++) act(() => { result.current.addBrowser(); });
      expect(result.current.windows).toHaveLength(3);
      act(() => { result.current.addBrowser(); });
      expect(result.current.windows).toHaveLength(3);
      expect(mockState.showNotification).toHaveBeenCalled();
    });
  });

  describe('openWallpaperPicker', () => {
    it('debe abrir ventana de configuración de fondo', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.openWallpaperPicker(); });
      expect(result.current.windows).toHaveLength(1);
      const added = result.current.windows.find(w => w.type === 'wallpaper')!;
      expect(added.type).toBe('wallpaper');
    });

    it('no debe abrir si ya hay una ventana wallpaper abierta', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.openWallpaperPicker(); });
      act(() => { result.current.openWallpaperPicker(); });
      expect(result.current.windows).toHaveLength(1);
      expect(mockState.showNotification).toHaveBeenCalled();
    });
  });

  describe('addGuide', () => {
    it('debe abrir el manual al hacer clic en su icono', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addGuide(); });
      expect(result.current.guideWindows).toHaveLength(1);
      expect(result.current.windows[0].type).toBe('guide');
      expect(result.current.windows[0].minimized).toBe(false);
    });

    it('debe reabrir el manual si fue cerrado', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addGuide(); });
      const guideId = result.current.windows[0].id;
      act(() => { result.current.closeWindow(guideId); });
      act(() => { vi.advanceTimersByTime(300); });
      expect(result.current.windows).toHaveLength(0);
      act(() => { result.current.addGuide(); });
      expect(result.current.guideWindows).toHaveLength(1);
    });

    it('no debe duplicar el manual si ya está abierto', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addGuide(); });
      act(() => { result.current.addGuide(); });
      expect(result.current.windows).toHaveLength(1);
    });

    it('debe titular el manual con el archivo en inglés cuando el idioma es en', () => {
      mockState.language = 'en';
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addGuide(); });
      expect(result.current.guideWindows[0].title).toBe('User Manual - manual-en.pdf');
    });
  });

  describe('addBurp', () => {
    it('debe abrir una ventana de Burp Suite', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addBurp(); });
      expect(result.current.burpWindows).toHaveLength(1);
      expect(result.current.windows[0].type).toBe('burpsuite');
      expect(result.current.windows[0].title).toBe('Burp Suite');
      expect(result.current.windows[0].minimized).toBe(false);
    });

    it('no debe duplicar Burp si ya está abierto', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addBurp(); });
      act(() => { result.current.addBurp(); });
      expect(result.current.burpWindows).toHaveLength(1);
    });

    it('debe restaurar y traer al frente la ventana Burp minimizada al reabrirla', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addBurp(); });
      const burpId = result.current.windows[0].id;
      act(() => { result.current.minimizeWindow(burpId); });
      act(() => { result.current.addTerminal(); });
      act(() => { result.current.addBurp(); });
      expect(result.current.burpWindows).toHaveLength(1);
      expect(result.current.burpWindows[0].minimized).toBe(false);
      const maxZ = Math.max(...result.current.windows.map(w => w.zIndex));
      expect(result.current.burpWindows[0].zIndex).toBe(maxZ);
    });
  });

  describe('closeWindow', () => {
    it('debe agregar a closingWindowIds y remover luego de 300ms', async () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const termId = result.current.windows[0].id;
      act(() => { result.current.closeWindow(termId); });
      expect(result.current.closingWindowIds).toContain(termId);
      act(() => { vi.advanceTimersByTime(300); });
      expect(result.current.windows).toHaveLength(0);
      expect(result.current.closingWindowIds).not.toContain(termId);
    });
  });

  describe('minimizeWindow / restoreWindow', () => {
    it('debe minimizar y restaurar una ventana', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const { termId } = openDefaultWindows(result);
      act(() => { result.current.minimizeWindow(termId); });
      expect(result.current.windows[0].minimized).toBe(true);
      act(() => { result.current.restoreWindow(termId); });
      expect(result.current.windows[0].minimized).toBe(false);
    });
  });

  describe('bringToFront', () => {
    it('debe subir el zIndex de una ventana', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const originalZ = result.current.windows[0].zIndex;
      act(() => { result.current.addTerminal(); });
      const added = result.current.windows[1];
      const higherZ = added.zIndex;
      expect(higherZ).toBeGreaterThan(originalZ);
      act(() => { result.current.bringToFront(result.current.windows[0].id); });
      expect(result.current.windows[0].zIndex).toBeGreaterThan(higherZ);
    });
  });

  describe('toggleMaximize', () => {
    it('debe maximizar y restaurar una ventana', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const id = result.current.windows[0].id;
      const original = { x: result.current.windows[0].x, y: result.current.windows[0].y, w: result.current.windows[0].w, h: result.current.windows[0].h };
      act(() => { result.current.toggleMaximize(id); });
      expect(result.current.windows[0].maximized).toBe(true);
      expect(result.current.windows[0].x).toBe(8);
      expect(result.current.windows[0].y).toBe(8);
      act(() => { result.current.toggleMaximize(id); });
      expect(result.current.windows[0].maximized).toBe(false);
      expect(result.current.windows[0].x).toBe(original.x);
      expect(result.current.windows[0].y).toBe(original.y);
      expect(result.current.windows[0].w).toBe(original.w);
      expect(result.current.windows[0].h).toBe(original.h);
    });
  });

  describe('changeFontSize', () => {
    function setupTerm(result: { current: ReturnType<typeof useDesktopWindows> }) {
      act(() => { result.current.addTerminal(); });
      return result.current.windows[0].id;
    }

    it('debe aumentar el tamaño de fuente', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const id = setupTerm(result);
      act(() => { result.current.changeFontSize(id, 2); });
      expect(result.current.windows[0].fontSize).toBe(17);
    });

    it('debe disminuir el tamaño de fuente', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const id = setupTerm(result);
      act(() => { result.current.changeFontSize(id, -2); });
      expect(result.current.windows[0].fontSize).toBe(13);
    });

    it('debe limitar a mínimo 10', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const id = setupTerm(result);
      act(() => { result.current.changeFontSize(id, -10); });
      expect(result.current.windows[0].fontSize).toBe(10);
    });

    it('debe limitar a máximo 20', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const id = setupTerm(result);
      act(() => { result.current.changeFontSize(id, 20); });
      expect(result.current.windows[0].fontSize).toBe(20);
    });
  });

  describe('topWindowId', () => {
    it('debe devolver undefined si no hay ventanas', () => {
      const { result } = renderHook(() => useDesktopWindows());
      expect(result.current.topWindowId).toBeUndefined();
    });

    it('debe devolver undefined si todas las ventanas están minimizadas', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const { termId, guideId } = openDefaultWindows(result);
      act(() => { result.current.minimizeWindow(termId); });
      act(() => { result.current.minimizeWindow(guideId); });
      expect(result.current.topWindowId).toBeUndefined();
    });

    it('debe devolver la ventana no minimizada con mayor zIndex', () => {
      const { result } = renderHook(() => useDesktopWindows());
      openDefaultWindows(result);
      act(() => { result.current.bringToFront(result.current.windows[0].id); });
      expect(result.current.topWindowId).toBe(result.current.windows[0].id);
    });
  });

  describe('startDrag', () => {
    it('debe ignorar click derecho (button !== 0)', () => {
      const { result } = renderHook(() => useDesktopWindows());
      openDefaultWindows(result);
      const e = { button: 2, target: document.createElement('div'), preventDefault: vi.fn(), clientX: 100, clientY: 100 } as any;
      act(() => { result.current.startDrag(result.current.windows[0].id, e); });
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('debe ignorar drag sobre botones', () => {
      const { result } = renderHook(() => useDesktopWindows());
      openDefaultWindows(result);
      const btn = document.createElement('button');
      const e = { button: 0, target: btn, preventDefault: vi.fn(), clientX: 100, clientY: 100 } as any;
      act(() => { result.current.startDrag(result.current.windows[0].id, e); });
      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('debe mover la ventana libremente dentro de los límites del escritorio', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      const e = { button: 0, target: document.createElement('div'), preventDefault: vi.fn(), clientX: 200, clientY: 100 } as any;
      act(() => { result.current.startDrag(w0.id, e); });
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: 350, clientY: 250 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].x).toBe(w0.x + 150);
      expect(result.current.windows[0].y).toBe(w0.y + 150);
    });

    it('debe limitar el arrastre para que la ventana no suba por encima de la barra de tareas', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      const e = { button: 0, target: document.createElement('div'), preventDefault: vi.fn(), clientX: 200, clientY: 100 } as any;
      act(() => { result.current.startDrag(w0.id, e); });
      // Arrastrar muy arriba: y debe quedar clavada en 0 (tope con la barra)
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: 300, clientY: -300 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].y).toBe(0);
    });

    it('debe mantener visible parte de la ventana al arrastrarla fuera por el borde izquierdo', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      const e = { button: 0, target: document.createElement('div'), preventDefault: vi.fn(), clientX: 200, clientY: 100 } as any;
      act(() => { result.current.startDrag(w0.id, e); });
      // Arrastrar muy a la izquierda: deben quedar 80px visibles para poder agarrarla
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: -3000, clientY: 100 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].x).toBe(-w0.w + 80);
    });
  });

  describe('startResize', () => {
    it('debe ignorar resize de ventana inexistente', () => {
      const { result } = renderHook(() => useDesktopWindows());
      const e = { preventDefault: vi.fn(), stopPropagation: vi.fn(), clientX: 100, clientY: 100 } as any;
      act(() => { result.current.startResize('nonexistent', e); });
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('debe redimensionar por el borde derecho (e)', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      const e = { preventDefault: vi.fn(), stopPropagation: vi.fn(), button: 0, clientX: w0.x + w0.w, clientY: w0.y + 10 } as any;
      act(() => { result.current.startResize(w0.id, e, 'e'); });
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: w0.x + w0.w + 50, clientY: w0.y + 10 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].w).toBe(w0.w + 50);
    });

    it('debe redimensionar por el borde izquierdo (w) manteniendo el borde derecho', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      const e = { preventDefault: vi.fn(), stopPropagation: vi.fn(), button: 0, clientX: w0.x, clientY: w0.y + 10 } as any;
      act(() => { result.current.startResize(w0.id, e, 'w'); });
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: w0.x - 40, clientY: w0.y + 10 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].x).toBe(w0.x - 40);
      expect(result.current.windows[0].w).toBe(w0.w + 40);
    });

    it('debe redimensionar por el borde superior (n) manteniendo el borde inferior', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      const e = { preventDefault: vi.fn(), stopPropagation: vi.fn(), button: 0, clientX: w0.x + 10, clientY: w0.y } as any;
      act(() => { result.current.startResize(w0.id, e, 'n'); });
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: w0.x + 10, clientY: w0.y + 30 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].y).toBe(w0.y + 30);
      expect(result.current.windows[0].h).toBe(w0.h - 30);
    });

    it('debe limitar el borde superior para que no suba por encima de la barra de tareas', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      // Colocar la ventana pegada al tope del escritorio
      act(() => { result.current.setWindows([{ ...w0, y: 0 }]); });
      const e = { preventDefault: vi.fn(), stopPropagation: vi.fn(), button: 0, clientX: w0.x + 10, clientY: w0.y } as any;
      act(() => { result.current.startResize(result.current.windows[0].id, e, 'n'); });
      // Intentar estirar la ventana hacia arriba: y debe quedar en 0
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: w0.x + 10, clientY: -200 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].y).toBe(0);
    });

    it('debe redimensionar por el borde inferior (s)', () => {
      const { result } = renderHook(() => useDesktopWindows());
      act(() => { result.current.addTerminal(); });
      const w0 = result.current.windows[0];
      const e = { preventDefault: vi.fn(), stopPropagation: vi.fn(), button: 0, clientX: w0.x + 10, clientY: w0.y + w0.h } as any;
      act(() => { result.current.startResize(w0.id, e, 's'); });
      act(() => { window.dispatchEvent(new PointerEvent('pointermove', { clientX: w0.x + 10, clientY: w0.y + w0.h + 40 })); });
      act(() => { window.dispatchEvent(new PointerEvent('pointerup')); });
      expect(result.current.windows[0].h).toBe(w0.h + 40);
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
