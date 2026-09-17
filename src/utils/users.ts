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

interface IdentityRule {
  id: string;
  match: (machine: Machine, getUser: (m: Machine, u: string) => User | null) => User | null;
}

const IDENTITY_RULES: IdentityRule[] = [
  {
    id: 'su_user',
    match: (m, getUser) => {
      if (!m.su_user) return null;
      return getUser(m, m.su_user) ?? buildSyntheticUser(m.su_user);
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

export function isRoot(user: User | null): boolean {
  return user?.uid === 0 || user?.username === 'root';
}
