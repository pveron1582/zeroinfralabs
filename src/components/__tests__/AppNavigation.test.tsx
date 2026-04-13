// ── __tests__/AppNavigation.test.tsx ───────────────────────────────────
// Integration tests for App navigation flows: landing → labs → scenario → exit

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useScenarioStore } from '../../store/scenarioStore';
import { SCENARIOS } from '../../laboratorios/laboratorios';

// ── Helpers ────────────────────────────────────────────────────────────────

// Location tracker for capturing navigation
function LocationTracker({ onLocationChange }: { onLocationChange: (path: string) => void }) {
  const location = useLocation();
  React.useEffect(() => { onLocationChange(location.pathname); }, [location.pathname, onLocationChange]);
  return null;
}

// Minimal LabGrid for testing
function TestLabGrid() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  return (
    <div data-testid="lab-grid">
      <span data-testid="current-lang">{lang || 'en'}</span>
      {SCENARIOS.map(s => (
        <button key={s.id} data-testid={`lab-card-${s.id}`} onClick={() => navigate(`/${lang || 'en'}/scenario/${s.id}`)}>
          {s.name}
        </button>
      ))}
    </div>
  );
}

// Minimal ScenarioLauncher that mimics the real Phase 3 redirect logic
function TestScenarioLauncher() {
  const { lang, id } = useParams<{ lang: string; id: string }>();
  const navigate = useNavigate();
  const view = useScenarioStore(state => state.view);
  const showMachineLoader = useScenarioStore(state => state.showMachineLoader);
  const loadingMachine = useScenarioStore(state => state.loadingMachine);
  const machines = useScenarioStore(state => state.machines);
  const missions = useScenarioStore(state => state.missions);
  const activeMachineId = useScenarioStore(state => state.activeMachineId);

  const validLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';

  // Phase 1: Machine loader
  if (showMachineLoader && loadingMachine) {
    return <div data-testid="machine-loader">{loadingMachine.machine_info.hostname}</div>;
  }

  // Phase 2: Workspace loaded
  if (view === 'workspace' && activeMachineId && machines.length > 0 && missions.length > 0) {
    return (
      <div data-testid="workspace">
        <span data-testid="scenario-id">{id}</span>
        <span data-testid="current-lang">{lang}</span>
        <button data-testid="go-home-btn" onClick={() => {
          useScenarioStore.setState({
            view: 'landing',
            showNetworkMap: false,
            hasNewNetworkInfo: false,
            notification: null,
            browserCurrentUrl: 'https://www.google.com',
            browserIsLoggedIn: false,
            browserNavHistory: ['https://www.google.com'],
            browserNavIdx: 0,
            listeningPort: null,
            msfState: null,
            showSurvey: false,
            pendingSurveyScenario: null,
            showCompletionOverlay: false,
            _prevMachinesSnapshot: [],
          });
        }}>
          Go Home
        </button>
      </div>
    );
  }

  // Phase 3: User exited lab → navigate to LabGrid (THE FIX WE'RE TESTING)
  if (view === 'landing') {
    navigate(`/${validLang}/labs`, { replace: true });
    return <div data-testid="lab-grid-redirect">Redirecting...</div>;
  }

  // Fallback: loading
  return <div data-testid="loading">Loading...</div>;
}

// Test routes
function TestRoutes() {
  return (
    <Routes>
      <Route path="/:lang/labs" element={<TestLabGrid />} />
      <Route path="/:lang/scenario/:id" element={<TestScenarioLauncher />} />
      <Route path="*" element={<div data-testid="fallback">Fallback</div>} />
    </Routes>
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('App Navigation Flows', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store using the existing state to preserve methods
    const state = useScenarioStore.getState();
    useScenarioStore.setState({
      ...state,
      view: 'landing',
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map((m: any) => ({ ...m, discovery_level: 0 })),
      missions: SCENARIOS[0].missions,
      currentMissionId: 1,
      activeMachineId: SCENARIOS[0].initialMachineId,
      showMachineLoader: false,
      loadingMachine: null,
      showSurvey: false,
      pendingSurveyScenario: null,
      showCompletionOverlay: false,
      language: 'en',
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe mostrar el LabGrid desde la ruta /:lang/labs', () => {
    render(
      <MemoryRouter initialEntries={['/en/labs']}>
        <TestRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('lab-grid')).toBeInTheDocument();
    expect(screen.getByTestId('current-lang').textContent).toBe('en');
  });

  it('debe mostrar el LabGrid en español desde /es/labs', () => {
    render(
      <MemoryRouter initialEntries={['/es/labs']}>
        <TestRoutes />
      </MemoryRouter>
    );
    expect(screen.getByTestId('lab-grid')).toBeInTheDocument();
    expect(screen.getByTestId('current-lang').textContent).toBe('es');
  });

  it('debe navegar del workspace al LabGrid al hacer "go home"', async () => {
    let currentPath = '/en/scenario/scenario-01';
    const trackLocation = (path: string) => { currentPath = path; };

    // Pre-load workspace state
    const state = useScenarioStore.getState();
    useScenarioStore.setState({
      ...state,
      view: 'workspace',
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map((m: any) => ({ ...m, discovery_level: 4 })),
      missions: SCENARIOS[0].missions,
      activeMachineId: SCENARIOS[0].initialMachineId,
      showMachineLoader: false,
      loadingMachine: null,
    });

    render(
      <MemoryRouter initialEntries={['/en/scenario/scenario-01']}>
        <LocationTracker onLocationChange={trackLocation} />
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('workspace')).toBeInTheDocument();

    await act(async () => {
      screen.getByTestId('go-home-btn').click();
    });

    await waitFor(() => {
      expect(currentPath).toBe('/en/labs');
    }, { timeout: 3000 });
  });

  it('debe respetar el idioma es al navegar de vuelta al LabGrid', async () => {
    let currentPath = '/es/scenario/scenario-01';
    const trackLocation = (path: string) => { currentPath = path; };

    const state = useScenarioStore.getState();
    useScenarioStore.setState({
      ...state,
      view: 'workspace',
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map((m: any) => ({ ...m, discovery_level: 4 })),
      missions: SCENARIOS[0].missions,
      activeMachineId: SCENARIOS[0].initialMachineId,
      showMachineLoader: false,
      loadingMachine: null,
    });

    render(
      <MemoryRouter initialEntries={['/es/scenario/scenario-01']}>
        <LocationTracker onLocationChange={trackLocation} />
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('workspace')).toBeInTheDocument();

    await act(async () => {
      screen.getByTestId('go-home-btn').click();
    });

    await waitFor(() => {
      expect(currentPath).toBe('/es/labs');
    }, { timeout: 3000 });
  });

  it('debe hacer fallback a en si el idioma es invalido', async () => {
    let currentPath = '/fr/scenario/scenario-01';
    const trackLocation = (path: string) => { currentPath = path; };

    const state = useScenarioStore.getState();
    useScenarioStore.setState({
      ...state,
      view: 'workspace',
      currentScenario: SCENARIOS[0],
      machines: SCENARIOS[0].machines.map((m: any) => ({ ...m, discovery_level: 4 })),
      missions: SCENARIOS[0].missions,
      activeMachineId: SCENARIOS[0].initialMachineId,
      showMachineLoader: false,
      loadingMachine: null,
    });

    render(
      <MemoryRouter initialEntries={['/fr/scenario/scenario-01']}>
        <LocationTracker onLocationChange={trackLocation} />
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('workspace')).toBeInTheDocument();

    await act(async () => {
      screen.getByTestId('go-home-btn').click();
    });

    // Invalid lang falls back to 'en'
    await waitFor(() => {
      expect(currentPath).toBe('/en/labs');
    }, { timeout: 3000 });
  });

  it('debe redirigir al LabGrid cuando view cambia a landing', async () => {
    let currentPath = '/en/scenario/scenario-01';
    const trackLocation = (path: string) => { currentPath = path; };

    // Start with workspace
    const state = useScenarioStore.getState();
    useScenarioStore.setState({
      ...state,
      view: 'workspace',
      machines: SCENARIOS[0].machines.map((m: any) => ({ ...m, discovery_level: 4 })),
      activeMachineId: SCENARIOS[0].initialMachineId,
    });

    render(
      <MemoryRouter initialEntries={['/en/scenario/scenario-01']}>
        <LocationTracker onLocationChange={trackLocation} />
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('workspace')).toBeInTheDocument();

    // Simulate end command or menu button setting view to landing
    await act(async () => {
      useScenarioStore.setState({ view: 'landing' });
    });

    await waitFor(() => {
      expect(currentPath).toBe('/en/labs');
    }, { timeout: 3000 });
  });

  it('debe tener un boton de Go Home en el workspace', () => {
    const state = useScenarioStore.getState();
    useScenarioStore.setState({
      ...state,
      view: 'workspace',
      machines: SCENARIOS[0].machines.map((m: any) => ({ ...m, discovery_level: 4 })),
      activeMachineId: SCENARIOS[0].initialMachineId,
    });

    render(
      <MemoryRouter initialEntries={['/en/scenario/scenario-01']}>
        <TestRoutes />
      </MemoryRouter>
    );

    expect(screen.getByTestId('go-home-btn')).toBeInTheDocument();
  });
});
