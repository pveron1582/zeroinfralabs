// ── utils/networkAlert.ts ───────────────────────────────────────────
// Detecta automáticamente cambios en la enumeración de máquinas
// y activa el parpadeo del botón "View Network" cuando hay novedades.

import type { Machine } from '../types';

/**
 * Snapshot del estado de enumeración de una máquina.
 * Se usa para comparar antes/después de cada cambio de estado.
 */
export interface EnumerationSnapshot {
  discoveryLevel: number;
  credentialsCount: number;
  verifiedCredentialsCount: number;
  directoriesCount: number;
  vulnerabilitiesCount: number;
  privescCompleted: boolean;
  possibleUsersCount: number;
}

/**
 * Crea un snapshot del estado de enumeración de todas las máquinas.
 */
export function createEnumerationSnapshot(machines: Machine[]): EnumerationSnapshot[] {
  return machines.map(m => ({
    discoveryLevel: m.discovery_level || 0,
    credentialsCount: (m.found_credentials || []).length,
    verifiedCredentialsCount: (m.found_credentials || []).filter(c => c.verified).length,
    directoriesCount: (m.web_enumeration?.directories || []).length,
    vulnerabilitiesCount: (m.vulnerabilities || []).length,
    privescCompleted: m.privesc_completed || false,
    possibleUsersCount: (m.possible_ssh_users || []).length,
  }));
}

/**
 * Compara dos snapshots y devuelve true si hubo algún cambio en la enumeración.
 */
export function hasEnumerationChanged(
  before: EnumerationSnapshot[],
  after: EnumerationSnapshot[]
): boolean {
  if (before.length !== after.length) return true;

  for (let i = 0; i < before.length; i++) {
    const b = before[i];
    const a = after[i];

    if (a.discoveryLevel > b.discoveryLevel) return true;
    if (a.credentialsCount > b.credentialsCount) return true;
    if (a.verifiedCredentialsCount > b.verifiedCredentialsCount) return true;
    if (a.directoriesCount > b.directoriesCount) return true;
    if (a.vulnerabilitiesCount > b.vulnerabilitiesCount) return true;
    if (a.privescCompleted && !b.privescCompleted) return true;
    if (a.possibleUsersCount > b.possibleUsersCount) return true;
  }

  return false;
}
