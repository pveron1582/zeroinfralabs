// ── __tests__/ScenarioLauncher.test.tsx ───────────────────────────
// Acceso por URL: los labs hidden (ej. scenario-07) cargan igual que
// los visibles; solo los inexistentes redirigen a /labs. El menú
// (LabGrid) sigue filtrando con VISIBLE_SCENARIOS.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ScenarioLauncher } from '../ScenarioLauncher';
import { useScenarioStore } from '../../store/scenarioStore';
import { SCENARIOS, VISIBLE_SCENARIOS, VISIBLE_SCENARIOS_META } from '../../laboratorios/laboratorios';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:lang/scenario/:id" element={<ScenarioLauncher />} />
        <Route path="/:lang/labs" element={<div data-testid="lab-grid">LabGrid</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ScenarioLauncher — acceso por URL', () => {
  beforeEach(() => {
    localStorage.clear();
    // Merge (sin `true`) para no pisar las acciones del store.
    useScenarioStore.setState({
      view: 'landing',
      showMachineLoader: false,
      loadingMachine: null,
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map(m => ({ ...m, discovery_level: 0 })),
      missions: SCENARIOS[0].missions,
      currentMissionId: 1,
      activeMachineId: SCENARIOS[0].initialMachineId,
      language: 'en',
    });
  });

  it('scenario-07 sigue hidden en el menú pero está en SCENARIOS', () => {
    const lab07 = SCENARIOS.find(s => s.id === 'scenario-07');
    expect(lab07).toBeDefined();
    expect(lab07?.hidden).toBe(true);
    expect(VISIBLE_SCENARIOS.some(s => s.id === 'scenario-07')).toBe(false);
  });

  it('scenario-08 también es hidden: el menú muestra solo los labs 01-06', () => {
    const lab08 = SCENARIOS.find(s => s.id === 'scenario-08');
    expect(lab08).toBeDefined();
    expect(lab08?.hidden).toBe(true);
    expect(VISIBLE_SCENARIOS.map(s => s.id)).toEqual([
      'scenario-01', 'scenario-02', 'scenario-03',
      'scenario-04', 'scenario-05', 'scenario-06',
    ]);
  });

  it('VISIBLE_SCENARIOS_META queda alineado con VISIBLE_SCENARIOS', () => {
    // El preview de la landing indexa el META por posición: si se desalinea,
    // cada tarjeta muestra la descripción/accento de otro lab. Los labs 03/04
    // arman su META sin `id` (vienen de plantillas), por eso el id es opcional.
    expect(VISIBLE_SCENARIOS_META.length).toBe(VISIBLE_SCENARIOS.length);
    VISIBLE_SCENARIOS.forEach((s, i) => {
      const metaId = VISIBLE_SCENARIOS_META[i].id;
      if (metaId !== undefined) expect(metaId, `meta[${i}]`).toBe(s.id);
    });
  });

  it('debe cargar scenario-08 por URL directa (lab oculto accesible)', async () => {
    const lab08 = SCENARIOS.find(s => s.id === 'scenario-08')!;
    renderAt('/es/scenario/scenario-08');
    await waitFor(() => {
      expect(screen.queryByTestId('lab-grid')).not.toBeInTheDocument();
      const st = useScenarioStore.getState();
      expect(st.showMachineLoader).toBe(true);
      expect(st.loadingMachine?.id).toBe(lab08.machines[0].id);
    });
  });

  it('debe cargar scenario-07 por URL directa (lab oculto accesible)', async () => {
    const lab07 = SCENARIOS.find(s => s.id === 'scenario-07')!;
    renderAt('/es/scenario/scenario-07');
    // No redirige a LabGrid; síncrono queda el loader con machines[0] del lab 07.
    // (currentScenario se aplica recién en el setTimeout de selectScenario.)
    await waitFor(() => {
      expect(screen.queryByTestId('lab-grid')).not.toBeInTheDocument();
      const st = useScenarioStore.getState();
      expect(st.showMachineLoader).toBe(true);
      expect(st.loadingMachine?.id).toBe(lab07.machines[0].id);
      expect(st.loadingMachine?.machine_info.ip).toBe(lab07.machines[0].machine_info.ip);
    });
  });

  it('debe cargar un lab visible por URL (scenario-01)', async () => {
    const lab01 = SCENARIOS.find(s => s.id === 'scenario-01')!;
    renderAt('/en/scenario/scenario-01');
    await waitFor(() => {
      expect(screen.queryByTestId('lab-grid')).not.toBeInTheDocument();
      const st = useScenarioStore.getState();
      expect(st.showMachineLoader).toBe(true);
      expect(st.loadingMachine?.id).toBe(lab01.machines[0].id);
    });
  });

  it('un id inexistente redirige a /labs', async () => {
    renderAt('/en/scenario/scenario-99');
    await waitFor(() => {
      expect(screen.getByTestId('lab-grid')).toBeInTheDocument();
    });
  });

  it('al salir del lab vuelve a /labs (la URL no queda en el escenario)', async () => {
    // El launcher renderiza el LabGrid inline cuando view === 'landing':
    // sin navegar, el usuario ve la grilla con la URL del lab en la barra
    // de direcciones. Este test falla si la navegación no ocurre.
    const lab01 = SCENARIOS.find(s => s.id === 'scenario-01')!;
    useScenarioStore.setState({
      view: 'workspace',
      showMachineLoader: false,
      loadingMachine: null,
      currentScenario: lab01,
      machines: lab01.machines.map(m => ({ ...m, discovery_level: 0 })),
      missions: lab01.missions,
      currentMissionId: 1,
      activeMachineId: lab01.initialMachineId,
      language: 'es',
    });
    renderAt('/es/scenario/scenario-01');
    // Ya estaba en workspace: el launcher no vuelve a arrancar el loader.
    expect(useScenarioStore.getState().view).toBe('workspace');

    // Botón "Salir" / comando `exit` → resetWorkspace → view 'landing'.
    act(() => { useScenarioStore.getState().resetWorkspace(); });

    await waitFor(() => {
      expect(screen.getByTestId('lab-grid')).toBeInTheDocument();
    });
  });
});
