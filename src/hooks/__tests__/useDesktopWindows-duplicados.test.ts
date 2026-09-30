// ── hooks/__tests__/useDesktopWindows-duplicados.test.ts ─────────
// Tests DIRECTOS de las ramas que `useDesktopWindows.test.ts` no alcanzaba
// (97,8 %): reapertura de ventanas singleton ya abiertas (selector de fondos,
// Burp y guía minimizados), `bringToFront` cuando la ventana ya está al
// frente, el fallback de `currentScenario`, los límites en inglés, `closeRdp`
// por máquina y `changeFontSize` sobre varias ventanas.
//
// Van en un archivo aparte porque el test principal ya tiene 559 líneas
// (el límite del proyecto es 300).
//
// Detalle de coverage: `zIndex: Math.max(0, ...windows.map(w => w.zIndex))`
// necesita que el desktop NO esté vacío para que el callback `w => w.zIndex`
// se ejecute — por eso casi todos los tests abren una terminal antes.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDesktopWindows } from '../useDesktopWindows';

const mockState = {
  showNotification: vi.fn(),
  currentScenario: { id: 'scenario-01', initialMachineId: 'attacker-01', category: 'General' } as { id: string; initialMachineId?: string; category: string } | null,
  missions: [],
  language: 'es',
  registerTerminal: vi.fn(),
  unregisterTerminal: vi.fn(),
  setTerminalMachine: vi.fn(),
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
  mockState.language = 'es';
  mockState.currentScenario = { id: 'scenario-01', initialMachineId: 'attacker-01', category: 'General' };
});

const renderDesktop = () => renderHook(() => useDesktopWindows());

describe('ventanas singleton ya abiertas', () => {
  it('el selector de fondos no se duplica y avisa si ya está abierto', () => {
    const { result } = renderDesktop();
    act(() => { result.current.addTerminal(); }); // desktop no vacío: cubre el map de zIndex
    act(() => { result.current.openWallpaperPicker(); });
    expect(result.current.windows).toHaveLength(2);
    expect(result.current.wallpaperWindows).toHaveLength(1);

    act(() => { result.current.openWallpaperPicker(); });
    expect(result.current.windows).toHaveLength(2);
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'El selector de fondos ya está abierto.',
    );
  });

  it('el aviso del selector de fondos usa el idioma de la store', () => {
    mockState.language = 'en';
    const { result } = renderDesktop();
    act(() => { result.current.addTerminal(); });
    act(() => { result.current.openWallpaperPicker(); });
    act(() => { result.current.openWallpaperPicker(); });
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Wallpaper picker is already open.',
    );
  });

  it('Burp Suite ya abierto y sin minimizar solo pasa al frente', () => {
    const { result } = renderDesktop();
    act(() => { result.current.addTerminal(); });
    act(() => { result.current.addBurp(); });
    const burpId = result.current.windows[1].id;
    expect(result.current.windows).toHaveLength(2);

    act(() => { result.current.addBurp(); });
    expect(result.current.windows).toHaveLength(2);
    expect(result.current.windows[1].id).toBe(burpId);
    expect(result.current.windows[1].minimized).toBe(false);
    expect(result.current.burpWindows).toHaveLength(1);
  });

  it('Burp Suite minimizado se restaura al volver a abrirlo', () => {
    const { result } = renderDesktop();
    act(() => { result.current.addTerminal(); });
    act(() => { result.current.addBurp(); });
    act(() => { result.current.minimizeWindow(result.current.windows[1].id); });
    expect(result.current.windows[1].minimized).toBe(true);

    act(() => { result.current.addBurp(); });
    expect(result.current.windows).toHaveLength(2);
    expect(result.current.windows[1].minimized).toBe(false);
  });

  it('la guía minimizada se restaura al volver a abrirla', () => {
    const { result } = renderDesktop();
    act(() => { result.current.addGuide(); });
    expect(result.current.guideWindows).toHaveLength(1);

    act(() => { result.current.minimizeWindow(result.current.windows[0].id); });
    act(() => { result.current.addGuide(); });
    expect(result.current.windows).toHaveLength(1);
    expect(result.current.windows[0].minimized).toBe(false);
  });
});

describe('bringToFront / changeFontSize', () => {
  it('la ventana que ya está al frente no cambia de zIndex', () => {
    const { result } = renderDesktop();
    act(() => { result.current.addTerminal(); });
    act(() => { result.current.addGuide(); });

    const [primera, segunda] = result.current.windows;
    expect(segunda.zIndex).toBeGreaterThan(primera.zIndex);

    // la de arriba: sin cambios (early return)
    const zTop = result.current.windows[1].zIndex;
    act(() => { result.current.bringToFront(result.current.windows[1].id); });
    expect(result.current.windows[1].zIndex).toBe(zTop);

    // la de abajo: sube por encima de la de arriba
    act(() => { result.current.bringToFront(result.current.windows[0].id); });
    expect(result.current.windows[0].zIndex).toBeGreaterThan(zTop);
  });

  it('changeFontSize solo toca la ventana objetivo', () => {
    const { result } = renderDesktop();
    act(() => { result.current.addTerminal(); });
    act(() => { result.current.addGuide(); });
    const [primera, segunda] = result.current.windows;

    act(() => { result.current.changeFontSize(primera.id, 1); });
    expect(result.current.windows[0].fontSize).toBe(primera.fontSize + 1);
    expect(result.current.windows[1].fontSize).toBe(segunda.fontSize);

    act(() => { result.current.changeFontSize(primera.id, 100); }); // tope 20
    expect(result.current.windows[0].fontSize).toBe(20);
  });
});

describe('escenario y RDP', () => {
  it('sin currentScenario en la store, addTerminal cae al id por defecto', () => {
    mockState.currentScenario = null;
    const { result } = renderDesktop();
    act(() => { result.current.addTerminal(); });

    expect(mockState.registerTerminal).toHaveBeenCalledWith(
      expect.any(String), 1, 'attacker-01',
    );
    expect(result.current.windows[0].title).toBe('Terminal 1 - root@kali');
  });

  it('closeRdp filtra por máquina y sin argumento cierra todas', () => {
    const { result } = renderDesktop();
    act(() => { result.current.openRdp('victim-01', 'Víctima'); });
    act(() => { result.current.openRdp('attacker-01', 'Atacante'); });
    expect(result.current.rdpWindows).toHaveLength(2);

    act(() => { result.current.closeRdp('victim-01'); });
    expect(result.current.rdpWindows).toHaveLength(1);
    expect(result.current.rdpWindows[0].machineId).toBe('attacker-01');

    act(() => { result.current.closeRdp(); });
    expect(result.current.rdpWindows).toHaveLength(0);
  });

  it('reabrir la misma máquina RDP restaura la ventana existente', () => {
    const { result } = renderDesktop();
    act(() => { result.current.openRdp('victim-01', 'Víctima'); });
    act(() => { result.current.minimizeWindow(result.current.windows[0].id); });
    act(() => { result.current.openRdp('victim-01', 'Otro título'); });

    expect(result.current.rdpWindows).toHaveLength(1);
    expect(result.current.windows[0].minimized).toBe(false);
    expect(result.current.windows[0].title).toBe('Víctima');
  });
});

describe('límites en el idioma de la store', () => {
  it('los límites de 5 terminales y 3 Chrome avisan en inglés', () => {
    mockState.language = 'en';
    const { result } = renderDesktop();

    // El desktop arranca vacío: hay que abrir las 5 para llegar al límite
    for (let i = 0; i < 5; i++) act(() => { result.current.addTerminal(); });
    expect(result.current.termWindows).toHaveLength(5);
    act(() => { result.current.addTerminal(); });
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Limit of 5 terminals reached.',
    );

    for (let i = 0; i < 3; i++) act(() => { result.current.addBrowser(); });
    expect(result.current.browserWindows).toHaveLength(3);
    act(() => { result.current.addBrowser(); });
    expect(result.current.browserWindows).toHaveLength(3);
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Limit of 3 Chrome windows reached.',
    );
  });
});
