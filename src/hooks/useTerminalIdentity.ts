import { useMemo } from 'react';
import type { Machine } from '../types';
import { getCurrentUser } from '../utils/users';

export function useTerminalIdentity(machine: Machine) {
  const user = useMemo(() => getCurrentUser(machine), [machine]);
  const sshUser = user.username;
  const isRoot = user.uid === 0;
  const rceCred = useMemo(() =>
    Array.isArray(machine.found_credentials)
      ? machine.found_credentials.find(c => c.service === 'reverse-shell')
      : null,
    [machine.found_credentials]
  );

  return { sshUser, isRoot, rceCred };
}

export function getShortPath(dir: string, isRootUser: boolean = false): string {
  if (!dir || dir === '/') return '/';
  if (dir.startsWith('/root') && isRootUser) {
    return dir === '/root' ? '/root' : '/root' + dir.slice(5).replace(/\/$/, '');
  }
  if (dir.startsWith('/home/') || dir === '/home') {
    const homeRelative = dir.slice(6);
    if (!homeRelative || homeRelative === '') return '~';
    return '~/' + homeRelative.replace(/\/$/, '');
  }
  return dir.replace(/\/$/, '') || '/';
}
