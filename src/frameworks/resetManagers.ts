// ── frameworks/resetManagers.ts ────────────────────────────────────
// SSOT: reset de TODOS los managers globales de sesión (shells, red,
// procesos, paquetes, cron, mounts). Se ejecuta al ENTRAR a un escenario
// (selectScenario / AdminPanel.loadScenario / LabMiniTerminal) y en el
// bootstrap de useCommandRunner (primera terminal que monta con el
// marker limpio). Ningún punto debe reimplementar esta lista.

import { shellManager } from './shells/ShellManager';
import { resetProcessManager } from './process/processManager';
import { resetNetworkState } from './network/networkState';
import { resetPackageManager } from './packages/packageManager';
import { resetCron } from './cron/cronRunner';
import { resetMounts } from './fs/mounts';

export function resetScenarioManagers(): void {
  shellManager.reset();
  resetProcessManager();
  resetNetworkState();
  resetPackageManager();
  resetCron();
  resetMounts();
}

