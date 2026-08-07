import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useScenarioStore } from '../../store/scenarioStore';
import { AppContent } from '../AppContent';
import { SCENARIOS } from '../../laboratorios/laboratorios';
import { getTourSteps } from '../tour/tourSteps';
import { MemoryRouter } from 'react-router-dom';

describe('FoxyTour en AppContent real', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.removeItem('foxy-tour-shown');
    const state = useScenarioStore.getState();
    useScenarioStore.setState({
      ...state,
      view: 'workspace',
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map((m: any) => ({ ...m, discovery_level: 0 })),
      missions: SCENARIOS[0].missions,
      currentMissionId: 1,
      activeMachineId: SCENARIOS[0].initialMachineId,
      showMachineLoader: false,
      loadingMachine: null,
      language: 'es',
      uiMode: 'desktop',
      foxyTourOpen: false,
    });
  });

  it('abre el tour al entrar al workspace', () => {
    render(
      <MemoryRouter initialEntries={['/es/scenario/scenario-01']}>
        <AppContent />
      </MemoryRouter>
    );

    // Al estar en workspace (como monta ScenarioLauncher) se abre Foxy
    expect(screen.getByText(/¡Hola! Soy Foxy/)).toBeInTheDocument();
  });

  it('no reabre el tour al cerrarlo', async () => {
    render(
      <MemoryRouter initialEntries={['/es/scenario/scenario-01']}>
        <AppContent />
      </MemoryRouter>
    );

    // Avanzar un paso y cerrar con Saltar
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    await waitFor(() => expect(screen.queryByText(/¡Hola! Soy Foxy/)).not.toBeInTheDocument(), { timeout: 3000 });

    // Esperar un momento: el tour no debe volver a abrirse solo
    await new Promise(r => setTimeout(r, 300));
    expect(screen.queryByText(/¡Hola! Soy Foxy/)).not.toBeInTheDocument();
  });

  it('incluye el paso de Chrome en un escenario Web', async () => {
    render(
      <MemoryRouter initialEntries={['/es/scenario/scenario-01']}>
        <AppContent />
      </MemoryRouter>
    );

    // El tour se abre con el escritorio ya montado: esperamos intro
    await waitFor(() => expect(screen.getByText(/¡Hola! Soy Foxy/)).toBeInTheDocument(), { timeout: 3000 });

    // Recorremos la secuencia visible del tour (como en los unit tests)
    const steps = getTourSteps();
    expect(steps.map(s => s.id)).toContain('desktop-icon-browser');
    expect(steps.map(s => s.id)).toContain('browser-window');

    let reachedBrowser = false;
    for (let i = 0; i < steps.length - 1; i++) {
      const cur = steps[i];
      if (cur.id === 'desktop-icon-browser') {
        // Verificamos que el paso de Chrome está en la secuencia real
        expect(screen.getByText('Navegador Chrome')).toBeInTheDocument();
        reachedBrowser = true;
        break;
      }
      if (cur.interactive && cur.waitFor) {
        const attr = cur.waitFor.replace(/^\[data-tour="|"\]$/g, '');
        // En la app real la ventana se abre con el clic del usuario;
        // aquí la creamos para avanzar el auto-avance
        const el = document.createElement('div');
        el.setAttribute('data-tour', attr);
        document.body.appendChild(el);
        await waitFor(() => expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled(), { timeout: 5000 });
        continue;
      }
      fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    }
    expect(reachedBrowser).toBe(true);
  }, 30000);
});
