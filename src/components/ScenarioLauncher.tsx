// ── components/ScenarioLauncher.tsx ─────────────────────────────────
// Scenario loading logic: machine loader animation → workspace

import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useScenarioStore } from '../store/scenarioStore';
import { SCENARIOS, TEST_SCENARIO } from '../laboratorios/laboratorios';
import { logger } from '../utils/logger';
import { DEFAULT_WALLPAPER } from './desktopWallpapers';
import { MachineLoader } from './MachineLoader';
import { LabGrid } from './LabGrid';
import { AppContent } from './AppContent';

function ScenarioLauncher() {
  const { lang, id } = useParams<{ lang: string; id: string }>();
  const navigate = useNavigate();
  const setLanguage = useScenarioStore(state => state.setLanguage);
  const showMachineLoader = useScenarioStore(state => state.showMachineLoader);
  const loadingMachine = useScenarioStore(state => state.loadingMachine);
  const view = useScenarioStore(state => state.view);
  const selectScenario = useScenarioStore(state => state.selectScenario);
  const machines = useScenarioStore(state => state.machines);
  const missions = useScenarioStore(state => state.missions);
  const activeMachineId = useScenarioStore(state => state.activeMachineId);
  const currentScenarioId = useScenarioStore(state => state.currentScenario?.id);

  const langRef = useRef<string | null>(null);
  const validLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
  if (langRef.current !== validLang) {
    langRef.current = validLang;
    setLanguage(validLang);
  }

  useEffect(() => {
    if (!validLang || !id) return;

    const scenario = SCENARIOS.find(s => s.id === id);
    if (!scenario) {
      navigate(`/${validLang}/labs`, { replace: true });
      return;
    }

    if (currentScenarioId === id && view === 'workspace') {
      return;
    }

    logger.debug(`[ScenarioLauncher] Loading scenario: ${id}, lang: ${validLang}`);
    selectScenario(scenario.id);
    // Deps intencionalmente acotadas: este efecto sincroniza ruta → escenario
    // y SOLO debe dispararse cuando cambia el id/lang de la URL. Agregar
    // currentScenarioId/view re-dispararía selectScenario al volver a la
    // landing y reabriría el loader de máquina (ver mejoras_glm.md P1-12).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validLang, id]);

  if (showMachineLoader && loadingMachine) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ ...DEFAULT_WALLPAPER.style, fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
        <MachineLoader
          machineName={loadingMachine.machine_info.hostname}
          machineIp={loadingMachine.machine_info.ip}
          machineOs={loadingMachine.machine_info.os}
          onComplete={() => {}}
          language={validLang}
        />
      </div>
    );
  }

  if (view === 'workspace' && activeMachineId && machines.length > 0 && missions.length > 0) {
    return <AppContent />;
  }

  if (view === 'landing') {
    const validNavLang = (lang === 'es' ? 'es' : 'en') as 'en' | 'es';
    navigate(`/${validNavLang}/labs`, { replace: true });
    return <LabGrid />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950"
      style={{ fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      <div className="text-emerald-400 font-mono text-sm animate-pulse">Loading lab...</div>
    </div>
  );
}

function ScenarioLauncherWrapper() {
  const location = useLocation();
  return <ScenarioLauncher key={location.key} />;
}

function TestLab() {
  const { selectScenario, setView } = useScenarioStore();

  useEffect(() => {
    localStorage.clear();
    logger.debug('Loading TEST_SCENARIO:', TEST_SCENARIO);
    logger.debug('TEST_SCENARIO category:', TEST_SCENARIO.category);
    setTimeout(() => {
      logger.debug('Selecting scenario:', TEST_SCENARIO.id);
      selectScenario(TEST_SCENARIO.id);
      setView('workspace');
    }, 100);
  }, [selectScenario, setView]);

  return <AppContent />;
}

export { ScenarioLauncherWrapper, ScenarioLauncher, TestLab };