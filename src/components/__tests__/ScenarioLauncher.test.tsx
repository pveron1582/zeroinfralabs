// ── __tests__/ScenarioLauncher.test.tsx ───────────────────────────
// Acceso por URL: los labs hidden (ej. scenario-07) cargan igual que
// los visibles; solo los inexistentes redirigen a /labs. El menú
// (LabGrid) sigue filtrando con VISIBLE_SCENARIOS.

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ScenarioLauncher } from '../ScenarioLauncher';
import { useScenarioStore } from '../../store/scenarioStore';
import { SCENARIOS, VISIBLE_SCENARIOS } from '../../laboratorios/laboratorios';

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
});
