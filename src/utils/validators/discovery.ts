// ── utils/validators/discovery.ts ────────────────────────────────
// Validadores de reconocimiento: hosts descubiertos y puertos escaneados.

import type { CommandResponse, ValidationCriteria } from '../../types';

export function validateDiscoveredHosts(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const hosts = 'discoveredHosts' in result ? result.discoveredHosts : undefined;
  if (!hosts || hosts.length === 0) {
    return false;
  }

  const minHosts = conditions.minHosts ?? 1;
  if (hosts.length < minHosts) {
    return false;
  }

  // Check target IP if specified
  if (conditions.targetIp) {
    return hosts.some(h => h.ip === conditions.targetIp);
  }

  return true;
}

export function validateScanResults(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const scanResults = 'scanResults' in result ? result.scanResults : undefined;
  if (!scanResults) return false;

  // Check specific port
  if (conditions.port) {
    return scanResults.ports.some(p => p.port === conditions.port);
  }

  // Check target IP
  if (conditions.targetIp) {
    return scanResults.targetIp === conditions.targetIp;
  }

  // Any scan results count
  return scanResults.ports.length > 0;
}

export function validateFoundDirectories(
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const foundDirectories = 'foundDirectories' in result ? result.foundDirectories : undefined;
  if (!foundDirectories) return false;

  // Check specific directories found
  if (conditions.directories && conditions.directories.length > 0) {
    return conditions.directories.every(dir =>
      foundDirectories.directories.some(d => d.path === dir || d.path.includes(dir))
    );
  }

  // Any directories count
  return foundDirectories.directories.length > 0;
}
