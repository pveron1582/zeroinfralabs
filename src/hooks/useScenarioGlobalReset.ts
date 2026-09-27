// ── hooks/useScenarioGlobalReset.ts ───────────────────────────────
// Reset GLOBAL una sola vez por escenario. Lo dispara la PRIMERA terminal
// que monta con el marker limpio. Las entradas de escenario
// (selectScenario / AdminPanel / LabMiniTerminal) resetean managers y
// limpian el marker; este effect es el fallback (bootstrap + defensa
// contra entradas que se olviden de limpiar) y además resetea sesiones de
// store + identidad con el contexto de la máquina. No se re-dispara al
// ganar máquinas nuevas (antes, `allMachines.length` en las deps mataba
// firewall/servicios/cron configurados justo después de un exploit).

import { useEffect } from 'react';
import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { resetScenarioManagers } from '../frameworks/resetManagers';
import { initialCwd } from '../utils/users';

export function useScenarioGlobalReset(scenarioId: string, machine: Machine) {
  useEffect(() => {
    const store = useScenarioStore.getState();
    if (store.globalResetDoneForScenario === scenarioId) return;
    store.markGlobalResetDone(scenarioId);
    store.setFtpSession(null);
    store.setSshSession(null);
    store.setRdpSession(null);
    resetScenarioManagers();
    store.resetIdentity({
      machineId: machine.id,
      suUser: machine.su_user,
      cwd: initialCwd(machine),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);
}
