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

export function getCurrentUser(machine: Machine): User {
  if (machine.su_user) {
    const user = getUser(machine, machine.su_user);
    if (user) return user;
    return { username: machine.su_user, uid: 1000, gid: 1000, home: `/home/${machine.su_user}`, shell: '/bin/bash', groups: [1000] };
  }

  if (machine.id.includes('attacker')) {
    const root = getUser(machine, 'root');
    if (root) return root;
    return ROOT_USER;
  }

  if (machine.privesc_completed) {
    const root = getUser(machine, 'root');
    if (root) return root;
  }

  const rceCred = machine.found_credentials?.find(c => c.service === 'reverse-shell');
  if (rceCred) {
    const user = getUser(machine, rceCred.user);
    if (user) return user;
    return { username: rceCred.user, uid: 1000, gid: 1000, home: `/home/${rceCred.user}`, shell: '/bin/bash', groups: [1000] };
  }

  if (machine.found_credentials) {
    const sshCred = machine.found_credentials.find(c => c.service === 'ssh' && c.verified);
    if (sshCred) {
      const user = getUser(machine, sshCred.user);
      if (user) return user;
      return { username: sshCred.user, uid: 1000, gid: 1000, home: `/home/${sshCred.user}`, shell: '/bin/bash', groups: [1000] };
    }
    const verified = machine.found_credentials.find(c => c.verified);
    if (verified) {
      const user = getUser(machine, verified.user);
      if (user) return user;
      return { username: verified.user, uid: 1000, gid: 1000, home: `/home/${verified.user}`, shell: '/bin/bash', groups: [1000] };
    }
  }

  const sshPort = machine.scan_results?.ports?.find(p => p.service === 'ssh');
  if (sshPort?.credentials?.user) {
    const user = getUser(machine, sshPort.credentials.user);
    if (user) return user;
    return { username: sshPort.credentials.user, uid: 1000, gid: 1000, home: `/home/${sshPort.credentials.user}`, shell: '/bin/bash', groups: [1000] };
  }

  return { username: 'user', uid: 1000, gid: 1000, home: '/home/user', shell: '/bin/bash', groups: [1000] };
}

export function isRoot(user: User | null): boolean {
  return user?.uid === 0 || user?.username === 'root';
}
