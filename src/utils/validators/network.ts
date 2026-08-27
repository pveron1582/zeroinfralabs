// ── utils/validators/network.ts ──────────────────────────────────
// Validadores de red: transacciones HTTP (Burp Suite) y acciones del
// navegador simulado (FakeBrowser).

import type { CommandResponse, Mission, ValidationCriteria } from '../../types';

export function validateHttpRequest(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const httpRequest = 'httpRequest' in result ? result.httpRequest : undefined;
  if (!httpRequest) return false;

  if (conditions.url && !httpRequest.url.includes(conditions.url)) {
    return false;
  }

  return true;
}

export function validateBrowserAction(
  result: CommandResponse,
  mission: Mission,
  conditions: Partial<ValidationCriteria>
): boolean {
  const browserAction = 'browserAction' in result ? result.browserAction : undefined;
  if (!browserAction) return false;

  // La acción debe ocurrir en el sitio de la máquina objetivo de la misión.
  // El emisor (FakeBrowser) resuelve la máquina por IP; si no pudo resolverla
  // o no es la objetivo, la acción no valida.
  if (!browserAction.machineId || browserAction.machineId !== mission.targetMachineId) {
    return false;
  }

  if (conditions.action && browserAction.action !== conditions.action) {
    return false;
  }

  if (conditions.url && !browserAction.url.includes(conditions.url)) {
    return false;
  }

  return true;
}