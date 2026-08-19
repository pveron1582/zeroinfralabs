// ── commands/suid.ts ─────────────────────────────────────────────
// Detección de binarios con bits SUID/SGID y cálculo del usuario efectivo

import type { User } from '../types';
import { hasSuid, hasSgid } from '../utils/permissions';

type MachineLike = { files: Array<{ path: string; mode?: number; owner?: string; group?: string }> };

/**
 * Find a binary file in the machine's filesystem by command name.
 * Checks common binary paths: /bin/<cmd>, /usr/bin/<cmd>, /usr/sbin/<cmd>, /sbin/<cmd>
 */
export function findBinaryFile(machine: MachineLike, cmdName: string) {
  const binaryPaths = [
    `/bin/${cmdName}`,
    `/usr/bin/${cmdName}`,
    `/usr/sbin/${cmdName}`,
    `/sbin/${cmdName}`,
    `/usr/local/bin/${cmdName}`,
  ];
  for (const bp of binaryPaths) {
    const file = machine.files.find(f => f.path === bp);
    if (file) return file;
  }
  return null;
}

/**
 * Check if a binary has SUID/SGID bits and return the effective user to run as.
 * Returns null if no special bits, or a User object to use as effective identity.
 */
export function getSuidEffectiveUser(
  machine: MachineLike,
  cmdName: string,
  currentUser: User
): { effectiveUser: User; isSuid: boolean; isSgid: boolean } | null {
  const binary = findBinaryFile(machine, cmdName);
  if (!binary) return null;

  const mode = binary.mode ?? 0o755;
  const isSuid = hasSuid(mode);
  const isSgid = hasSgid(mode);

  if (!isSuid && !isSgid) return null;

  const owner = binary.owner ?? 'root';

  if (isSuid) {
    return {
      effectiveUser: { username: owner, uid: owner === 'root' ? 0 : 1000, gid: 0, home: `/home/${owner}`, shell: '/bin/bash', groups: [0] },
      isSuid: true,
      isSgid: false,
    };
  }

  // For SGID: run with the file's group (keep same user but change gid)
  return {
    effectiveUser: currentUser,
    isSuid: false,
    isSgid: true,
  };
}
