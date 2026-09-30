// ── hooks/__tests__/useMobileWindows.test.ts ─────────────────────
// Test DIRECTO del hook de ventanas del workspace móvil: no existía ni un
// test (0 % de 93 statements) a pesar de ser el espejo de
// `useDesktopWindows`, que sí tenía 559 líneas de tests. Cubre los límites
// (5 terminales / 2 navegadores), los singleton de topología y enumeración,
// el cierre con `ensureActive`, el registro en la store y el cambio de
// máquina por terminal.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMobileWindows } from '../useMobileWindows';
import { shellManager } from '../../frameworks/shells/ShellManager';

const mockState = {
  showNotification: vi.fn(),
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

vi.mock('../../frameworks/shells/ShellManager', () => ({
  shellManager: { destroyOwner: vi.fn() },
}));

const renderMobile = () => {
  const onChangeMachine = vi.fn();
  const hook = renderHook(() => useMobileWindows({
    initialMachineId: 'attacker-01',
    onChangeMachine,
  }));
  return { ...hook, onChangeMachine };
};

beforeEach(() => {
  vi.clearAllMocks();
  mockState.language = 'es';
});

describe('estado inicial', () => {
  it('abre una terminal activa y la registra en la store', () => {
    const { result } = renderMobile();

    expect(result.current.windows).toHaveLength(1);
    expect(result.current.windows[0]).toMatchObject({
      type: 'terminal',
      title: 'Terminal 1',
      machineId: 'attacker-01',
      termNumber: 1,
    });
    expect(result.current.activeId).toBe(result.current.windows[0].id);
    expect(result.current.activeWindow).toEqual(result.current.windows[0]);
    expect(result.current.termCount).toBe(1);
    expect(result.current.browserCount).toBe(0);
    expect(mockState.registerTerminal).toHaveBeenCalledTimes(1);
    expect(mockState.registerTerminal).toHaveBeenCalledWith(
      result.current.windows[0].id, 1, 'attacker-01',
    );
  });

  it('activeWindow cae a la primera ventana si activeId quedó huérfano', () => {
    const { result } = renderMobile();
    act(() => { result.current.setActiveId('id-que-no-existe'); });
    expect(result.current.activeWindow).toEqual(result.current.windows[0]);
  });
});

describe('addTerminal', () => {
  it('agrega, activa y registra la nueva terminal', () => {
    const { result } = renderMobile();
    act(() => { result.current.addTerminal(); });

    expect(result.current.windows).toHaveLength(2);
    expect(result.current.windows[1].title).toBe('Terminal 2');
    expect(result.current.activeId).toBe(result.current.windows[1].id);
    expect(result.current.termCount).toBe(2);
    expect(mockState.registerTerminal).toHaveBeenLastCalledWith(
      result.current.windows[1].id, 2, 'attacker-01',
    );
  });

  it('tras cerrar, el próximo número reutiliza el máximo (no duplica títulos)', () => {
    const { result } = renderMobile();
    act(() => { result.current.addTerminal(); });
    act(() => { result.current.addTerminal(); });
    expect(result.current.windows.map(w => w.title)).toEqual([
      'Terminal 1', 'Terminal 2', 'Terminal 3',
    ]);

    const tercera = result.current.windows[2];
    act(() => { result.current.closeWindow(tercera.id); });
    act(() => { result.current.addTerminal(); });
    // reutiliza el 3 (maxNum + 1), no abre una "Terminal 4"
    expect(result.current.windows).toHaveLength(3);
    expect(result.current.windows[1].title).toBe('Terminal 2');
    expect(result.current.windows[2].title).toBe('Terminal 3');
  });

  it('el número de terminal ignora las ventanas que no son terminal', () => {
    const { result } = renderMobile();
    act(() => { result.current.addBrowser(); });
    act(() => { result.current.addTerminal(); });
    expect(result.current.windows[2]).toMatchObject({ title: 'Terminal 2', termNumber: 2 });
  });

  it('respeta el límite de 5 terminales y avisa en español', () => {
    const { result } = renderMobile();
    for (let i = 0; i < 4; i++) act(() => { result.current.addTerminal(); });
    expect(result.current.termCount).toBe(5);

    const antes = result.current.windows.length;
    act(() => { result.current.addTerminal(); });
    expect(result.current.windows).toHaveLength(antes);
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Límite de 5 terminales alcanzado.',
    );
  });

  it('el límite de 5 terminales avisa en inglés si la store está en en', () => {
    // Al límite no hay setState, así que el idioma se lee al renderizar:
    // hay que ponerlo antes de montar el hook.
    mockState.language = 'en';
    const { result } = renderMobile();
    for (let i = 0; i < 4; i++) act(() => { result.current.addTerminal(); });
    act(() => { result.current.addTerminal(); });
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Limit of 5 terminals reached.',
    );
  });
});

describe('addBrowser', () => {
  it('agrega navegadores con título Chrome N y respeta el límite de 2', () => {
    const { result } = renderMobile();
    act(() => { result.current.addBrowser(); });
    act(() => { result.current.addBrowser(); });

    expect(result.current.browserCount).toBe(2);
    expect(result.current.windows.filter(w => w.type === 'browser').map(w => w.title))
      .toEqual(['Chrome 1', 'Chrome 2']);
    expect(mockState.registerTerminal).toHaveBeenCalledTimes(1); // solo la inicial

    act(() => { result.current.addBrowser(); });
    expect(result.current.browserCount).toBe(2);
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Límite de 2 navegadores alcanzado.',
    );
  });

  it('el límite de navegadores avisa en inglés si la store está en en', () => {
    mockState.language = 'en';
    const { result } = renderMobile();
    act(() => { result.current.addBrowser(); });
    act(() => { result.current.addBrowser(); });
    act(() => { result.current.addBrowser(); });
    expect(result.current.browserCount).toBe(2);
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Limit of 2 browsers reached.',
    );
  });
});

describe('ventanas singleton (topología / enumeración)', () => {
  it('las crea una sola vez y la segunda llamada solo las activa', () => {
    const { result } = renderMobile();
    act(() => { result.current.addNetwork(); });
    expect(result.current.windows).toHaveLength(2);
    expect(result.current.windows[1]).toMatchObject({ type: 'network', title: 'Topología' });
    expect(result.current.activeId).toBe(result.current.windows[1].id);

    const cantidad = result.current.windows.length;
    act(() => { result.current.addNetwork(); });
    expect(result.current.windows).toHaveLength(cantidad);
    expect(result.current.activeId).toBe(result.current.windows[1].id);

    act(() => { result.current.addEnumeration(); });
    expect(result.current.windows).toHaveLength(cantidad + 1);
    expect(result.current.windows[2]).toMatchObject({ type: 'enumeration', title: 'Enumeración' });

    act(() => { result.current.addEnumeration(); });
    expect(result.current.windows).toHaveLength(cantidad + 1);
    expect(result.current.activeId).toBe(result.current.windows[2].id);
  });
});

describe('closeWindow', () => {
  it('no cierra si es la única ventana y avisa', () => {
    const { result } = renderMobile();
    act(() => { result.current.closeWindow(result.current.windows[0].id); });

    expect(result.current.windows).toHaveLength(1);
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'Debe quedar al menos una ventana.',
    );
    expect(mockState.unregisterTerminal).not.toHaveBeenCalled();
    expect(shellManager.destroyOwner).not.toHaveBeenCalled();
  });

  it('el aviso de "al menos una ventana" respeta el idioma', () => {
    mockState.language = 'en';
    const { result } = renderMobile();
    act(() => { result.current.closeWindow(result.current.windows[0].id); });
    expect(result.current.windows).toHaveLength(1);
    expect(mockState.showNotification).toHaveBeenLastCalledWith(
      'At least one window must remain.',
    );
  });

  it('al cerrar la activa destruye su shell, se da de baja y activa otra', () => {
    const { result } = renderMobile();
    act(() => { result.current.addTerminal(); });
    const activa = result.current.activeId;
    const primera = result.current.windows[0].id;

    act(() => { result.current.closeWindow(activa); });
    expect(result.current.windows).toHaveLength(1);
    expect(shellManager.destroyOwner).toHaveBeenCalledWith(activa);
    expect(mockState.unregisterTerminal).toHaveBeenCalledWith(activa);
    expect(result.current.activeId).toBe(primera);
  });

  it('al cerrar una que no está activa el activeId no se mueve y no toca shells', () => {
    const { result } = renderMobile();
    act(() => { result.current.addBrowser(); });
    const browserId = result.current.activeId; // la recién abierta queda activa
    act(() => { result.current.setActiveId(result.current.windows[0].id); });

    act(() => { result.current.closeWindow(browserId); });
    expect(result.current.windows).toHaveLength(1);
    expect(result.current.activeId).toBe(result.current.windows[0].id);
    expect(shellManager.destroyOwner).not.toHaveBeenCalled();
    expect(mockState.unregisterTerminal).toHaveBeenCalledWith(browserId);
  });
});

describe('selectWindow / handleTerminalChangeMachine', () => {
  it('seleccionar una terminal notifica su máquina; un navegador, no', () => {
    const { result, onChangeMachine } = renderMobile();
    act(() => { result.current.addBrowser(); });

    act(() => { result.current.selectWindow(result.current.windows[0].id); });
    expect(onChangeMachine).toHaveBeenLastCalledWith('attacker-01');

    onChangeMachine.mockClear();
    act(() => { result.current.selectWindow(result.current.windows[1].id); });
    expect(onChangeMachine).not.toHaveBeenCalled();
  });

  it('cambiar la máquina de una terminal actualiza ventana, store y callback', () => {
    const { result, onChangeMachine } = renderMobile();
    const id = result.current.windows[0].id;

    act(() => { result.current.handleTerminalChangeMachine(id, 'victim-01'); });

    expect(result.current.windows[0].machineId).toBe('victim-01');
    expect(mockState.setTerminalMachine).toHaveBeenCalledWith(id, 'victim-01');
    expect(onChangeMachine).toHaveBeenCalledWith('victim-01');

    // La ventana que no coincide con el id queda intacta
    act(() => { result.current.addTerminal(); });
    act(() => { result.current.handleTerminalChangeMachine('id-otro', 'x-01'); });
    expect(result.current.windows[1].machineId).toBe('attacker-01');
  });
});
