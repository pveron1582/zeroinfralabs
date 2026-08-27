// ── store/slices/machineMutations.ts ─────────────────────────────
// Mutaciones puras sobre el array de máquinas del store. Cada función
// devuelve un NUEVO array (inmutable), listo para pasar a set() de Zustand.
// Extraídas de scenarioSlice.ts para mantener el slice <300 líneas.

import type { Machine, FileEntry } from '../../types';

export function updateMachine(
  machines: Machine[],
  machineId: string,
  fn: (m: Machine) => Machine
): Machine[] {
  return machines.map(m => (m.id === machineId ? fn(m) : m));
}

export function bumpDiscoveryLevel(m: Machine, minLevel: number): Machine {
  return { ...m, discovery_level: Math.max(m.discovery_level || 0, minLevel) };
}

export function addFoundCredential(
  machines: Machine[],
  machineId: string,
  cred: { file?: string; user: string; pass: string; verified: boolean; service?: string }
): Machine[] {
  return updateMachine(machines, machineId, m => {
    const existing = m.found_credentials || [];
    const filtered = cred.service ? existing.filter(c => c.service !== cred.service) : existing;
    return {
      ...bumpDiscoveryLevel(m, 3),
      found_credentials: [...filtered, { file: cred.file || '/etc/passwd', ...cred }],
    };
  });
}

export function verifyCredentials(
  machines: Machine[],
  machineId: string,
  service?: string
): Machine[] {
  return updateMachine(machines, machineId, m => {
    if (!m.found_credentials) return m;
    return {
      ...m,
      found_credentials: m.found_credentials.map(c =>
        (!service || c.service === service) ? { ...c, verified: true } : c
      ),
    };
  });
}

export function setPossibleUsers(
  machines: Machine[],
  machineId: string,
  users: string[]
): Machine[] {
  return updateMachine(machines, machineId, m => ({ ...m, possible_ssh_users: users }));
}

export function addFailedUser(
  machines: Machine[],
  machineId: string,
  user: string
): Machine[] {
  return updateMachine(machines, machineId, m => ({
    ...m,
    failed_ssh_users: [...(m.failed_ssh_users || []), user],
  }));
}

export function setSudoPrivileges(
  machines: Machine[],
  machineId: string,
  user: string,
  commands: string[],
  canSudo: boolean
): Machine[] {
  return updateMachine(machines, machineId, m => ({
    ...m,
    sudo_privileges: { user, commands, canSudo },
  }));
}

export function addFileToMachine(
  machines: Machine[],
  machineId: string,
  file: FileEntry
): Machine[] {
  return updateMachine(machines, machineId, m => {
    const filtered = (m.files || []).filter(f => f.path !== file.path);
    return { ...m, files: [...filtered, file] };
  });
}

export function setMachineFiles(
  machines: Machine[],
  machineId: string,
  files: FileEntry[]
): Machine[] {
  return updateMachine(machines, machineId, m => ({ ...m, files }));
}

export function setPrivescCompleted(
  machines: Machine[],
  machineId: string
): Machine[] {
  return updateMachine(machines, machineId, m =>
    bumpDiscoveryLevel({ ...m, privesc_completed: true }, 4)
  );
}

export function resetPrivescCompleted(
  machines: Machine[],
  machineId: string
): Machine[] {
  return updateMachine(machines, machineId, m => ({ ...m, privesc_completed: false }));
}

export function setSuUser(
  machines: Machine[],
  machineId: string,
  suUser?: string
): Machine[] {
  return updateMachine(machines, machineId, m => ({ ...m, su_user: suUser }));
}

export function addExploredDirectory(
  machines: Machine[],
  machineId: string,
  path: string
): Machine[] {
  return updateMachine(machines, machineId, m => {
    const dirs = m.web_enumeration?.directories || [];
    if (dirs.some(d => d.path === path)) return m;
    return {
      ...m,
      web_enumeration: {
        ...m.web_enumeration!,
        directories: [...dirs, { path, status: 200, description: 'Navegación' }],
      },
    };
  });
}

export function confirmRCE(
  machines: Machine[],
  machineId: string,
  user: string,
  method: string
): Machine[] {
  const targetMachine = machines.find(m => m.id === machineId);
  const alreadyHasRCE = targetMachine?.found_credentials?.some(c => c.service === 'reverse-shell');
  if (alreadyHasRCE) return machines;

  return updateMachine(machines, machineId, m => {
    const creds = m.found_credentials || [];
    if (creds.some(c => c.user === user && c.service === 'reverse-shell')) return m;
    return {
      ...m,
      found_credentials: [
        ...creds,
        { user, pass: 'vía shell', file: method, verified: true, service: 'reverse-shell' },
      ],
    };
  });
}

export function reportVulnerability(
  machines: Machine[],
  machineId: string,
  vulnId: string,
  status: 'detected' | 'confirmed'
): Machine[] {
  return updateMachine(machines, machineId, m => {
    const vulnerabilities = m.vulnerabilities || [];
    const existingIdx = vulnerabilities.findIndex(v => v.id === vulnId);

    if (existingIdx >= 0) {
      const updated = [...vulnerabilities];
      updated[existingIdx] = { ...updated[existingIdx], status };
      return { ...m, vulnerabilities: updated };
    }

    return {
      ...m,
      vulnerabilities: [...vulnerabilities, { id: vulnId, name: vulnId, status }],
    };
  });
}
