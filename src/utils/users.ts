// ── utils/users.ts ─────────────────────────────────────────────────
// Parseo de /etc/passwd y /etc/group, determinación de identidad actual

import type { Machine, User, Group } from '../types';

// Identidad root canónica. Usada por `sudo <editor>` (elevatedEdit) y por el
// fallback del attacker, para que los checks de permisos (canEditFile, etc.)
// devuelvan true sin depender del contenido de /etc/passwd.
export const ROOT_USER: User = {
  username: 'root',
  uid: 0,
  gid: 0,
  home: '/root',
  shell: '/bin/bash',
  groups: [0],
};

export function parsePasswd(content: string): User[] {
  const users: User[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(':');
    if (parts.length < 7) continue;
    const [username, , uidStr, gidStr, , home, shell] = parts;
    const uid = parseInt(uidStr, 10);
    const gid = parseInt(gidStr, 10);
    if (isNaN(uid) || isNaN(gid)) continue;
    users.push({ username, uid, gid, home, shell, groups: [gid] });
  }
  return users;
}

export function parseGroup(content: string): Group[] {
  const groups: Group[] = [];
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(':');
    if (parts.length < 4) continue;
    const [name, , gidStr, membersStr] = parts;
    const gid = parseInt(gidStr, 10);
    if (isNaN(gid)) continue;
    const members = membersStr ? membersStr.split(',').filter(Boolean) : [];
    groups.push({ name, gid, members });
  }
  return groups;
}

function findPasswdFile(machine: Machine): string | null {
  const passwd = machine.files?.find(f => f.path === '/etc/passwd');
  return passwd?.content ?? null;
}

function findGroupFile(machine: Machine): string | null {
  const group = machine.files?.find(f => f.path === '/etc/group');
  return group?.content ?? null;
}

export function getUsers(machine: Machine): User[] {
  const content = findPasswdFile(machine);
  if (!content) return [];
  return parsePasswd(content);
}

export function getUser(machine: Machine, username: string): User | null {
  return getUsers(machine).find(u => u.username === username) ?? null;
}

export function getGroups(machine: Machine): Group[] {
  const content = findGroupFile(machine);
  if (!content) return [];
  return parseGroup(content);
}

export function getGroup(machine: Machine, groupname: string): Group | null {
  return getGroups(machine).find(g => g.name === groupname) ?? null;
}

export function getPrimaryGroupName(machine: Machine, user: User): string {
  const group = getGroups(machine).find(g => g.gid === user.gid);
  return group?.name ?? user.gid.toString();
}

function buildSyntheticUser(username: string): User {
  return { username, uid: 1000, gid: 1000, home: `/home/${username}`, shell: '/bin/bash', groups: [1000] };
}

/** Resuelve un usuario por nombre: /etc/passwd o sintético si no existe. */
export function resolveUsername(machine: Machine, username: string): User {
  return getUser(machine, username) ?? buildSyntheticUser(username);
}

// ── Override de su_user por ejecución ─────────────────────────────
// El executor lo fija desde ctx.suUserOverride antes de correr un comando
// y lo restaura al terminar (aislamiento por terminal): cada ventana deriva
// su identidad del frame local, nunca del campo compartido machine.su_user.
// `undefined` ⇒ sin override ⇒ la regla `su_user` cae al modo legacy.
let executionSuUser: string | undefined;

export function setExecutionSuUser(suUser?: string): void {
  executionSuUser = suUser;
}

export function getExecutionSuUser(): string | undefined {
  return executionSuUser;
}

/** Usuario efectivo para UI/prompt/env: con `suUser` de frame resuelve ese
 *  nombre; sin él deriva de la máquina (legacy + credenciales verificadas). */
export function getUserWithSu(machine: Machine, suUser?: string): User {
  if (suUser !== undefined && machine.machine_info.family !== 'windows') {
    return resolveUsername(machine, suUser);
  }
  return getCurrentUser(machine);
}

interface IdentityRule {
  id: string;
  match: (machine: Machine, getUser: (m: Machine, u: string) => User | null) => User | null;
}

const IDENTITY_RULES: IdentityRule[] = [
  {
    // Windows: identidad declarada en machine.win (no hay /etc/passwd).
    // Administrators ⇒ uid 0 ⇒ bypass de permisos (mismo camino que root).
    // Un privesc completado (Potato, etc.) también eleva a admin.
    id: 'windows',
    match: (m) => {
      if (!m.win) return null;
      const isAdmin = m.win.isAdmin || !!m.privesc_completed;
      return {
        username: m.win.currentUser,
        uid: isAdmin ? 0 : 1000,
        gid: isAdmin ? 0 : 1000,
        home: `/C:/Users/${m.win.currentUser}`,
        shell: 'C:\\Windows\\System32\\cmd.exe',
        groups: isAdmin ? [0] : [1000],
      };
    },
  },
  {
    id: 'su_user',
    match: (m, getUser) => {
      const su = executionSuUser !== undefined ? executionSuUser : m.su_user;
      if (!su) return null;
      return getUser(m, su) ?? buildSyntheticUser(su);
    },
  },
  {
    id: 'attacker',
    match: (m, getUser) => {
      if (!m.id.includes('attacker')) return null;
      return getUser(m, 'root') ?? ROOT_USER;
    },
  },
  {
    id: 'privesc_completed',
    match: (m, getUser) => {
      if (!m.privesc_completed) return null;
      return getUser(m, 'root') ?? null;
    },
  },
  {
    id: 'reverse_shell_credential',
    match: (m, getUser) => {
      const cred = m.found_credentials?.find(c => c.service === 'reverse-shell');
      if (!cred) return null;
      return getUser(m, cred.user) ?? buildSyntheticUser(cred.user);
    },
  },
  {
    id: 'ssh_verified_credential',
    match: (m, getUser) => {
      const cred = m.found_credentials?.find(c => c.service === 'ssh' && c.verified);
      if (!cred) return null;
      return getUser(m, cred.user) ?? buildSyntheticUser(cred.user);
    },
  },
  {
    id: 'verified_credential',
    match: (m, getUser) => {
      const cred = m.found_credentials?.find(c => c.verified);
      if (!cred) return null;
      return getUser(m, cred.user) ?? buildSyntheticUser(cred.user);
    },
  },
  {
    id: 'ssh_port_credential',
    match: (m, getUser) => {
      const sshPort = m.scan_results?.ports?.find(p => p.service === 'ssh');
      if (!sshPort?.credentials?.user) return null;
      return getUser(m, sshPort.credentials.user) ?? buildSyntheticUser(sshPort.credentials.user);
    },
  },
];

const FALLBACK_USER: User = { username: 'user', uid: 1000, gid: 1000, home: '/home/user', shell: '/bin/bash', groups: [1000] };

export function getCurrentUser(machine: Machine): User {
  for (const rule of IDENTITY_RULES) {
    const result = rule.match(machine, getUser);
    if (result) return result;
  }
  return FALLBACK_USER;
}

/** Cwd inicial según la familia del SO: /root en Linux, home win en Windows. */
export function initialCwd(m: Machine): string {
  return m.machine_info.family === 'windows' ? getCurrentUser(m).home : '/root';
}

export function isRoot(user: User | null): boolean {
  return user?.uid === 0 || user?.username === 'root';
}
