// ── hooks/useTerminalIdentity.ts ───────────────────────────────────────
import { useMemo } from 'react';
import type { Machine } from '../types';

export function useTerminalIdentity(machine: Machine) {
  const rceCred = useMemo(() =>
    Array.isArray(machine.found_credentials)
      ? machine.found_credentials.find(c => c.service === 'reverse-shell')
      : null,
    [machine.found_credentials]
  );

  const sshUser = useMemo(() => {
    if (machine.id.includes('attacker')) return 'root';
    if (rceCred) return rceCred.user;
    if (machine.privesc_completed) return 'root';

    if (machine.found_credentials) {
      const sshCred = machine.found_credentials.find(c => c.service === 'ssh' && c.verified);
      if (sshCred) return sshCred.user;
      const verified = machine.found_credentials.find(c => c.verified);
      if (verified) return verified.user;
    }

    const sshPort = machine.scan_results?.ports?.find(p => p.service === 'ssh');
    if (sshPort?.credentials?.user) return sshPort.credentials.user;
    return 'user';
  }, [machine, rceCred]);

  const isRoot = sshUser === 'root' || machine.id === 'attacker-01';

  return { sshUser, isRoot, rceCred };
}

export function getShortPath(dir: string): string {
  if (!dir || dir === '/') return '/';
  if (dir.startsWith('/home/') || dir === '/home') {
    const homeRelative = dir.slice(6);
    if (!homeRelative || homeRelative === '') return '~';
    return '~/' + homeRelative.replace(/\/$/, '');
  }
  return dir.replace(/\/$/, '') || '/';
}
