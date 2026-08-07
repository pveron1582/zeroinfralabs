// ── commands/builtin/crontab.ts ─────────────────────────────────────
// Simulador de crontab (ROADMAP Fase 8.1). Lee/escribe tareas en
// /var/spool/cron/crontabs/<user>. `crontab -e` abre el editor (nano).

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import { canEditFile, canDeleteInDir } from '../../utils/permissions';
import { findFile, findDirEntry, defaultOwnership, buildNewFile } from '../../utils/fs';

const SPOOL_DIR = '/var/spool/cron/crontabs';
const TEMPLATE = `# Edit this file to introduce tasks to be run by cron.
# m h  dom mon dow   command
`;

function spoolPath(user: string): string {
  return `${SPOOL_DIR}/${user}`;
}

function ensureSpoolDirs(machine: CommandContext['machine']): boolean {
  const dirs = [
    { path: '/var/spool', mode: 0o755 },
    { path: '/var/spool/cron', mode: 0o755 },
    { path: SPOOL_DIR, mode: 0o700 },
  ];
  let changed = false;
  for (const d of dirs) {
    if (!findDirEntry(machine, d.path)) {
      machine.files.push({
        path: `${d.path}/.dir`, content: '', type: 'text',
        owner: 'root', group: 'root', mode: d.mode,
      });
      changed = true;
    }
  }
  return changed;
}

export const cmd_crontab = {
  name: 'crontab',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const machine = ctx.machine;
    const currentUser = getCurrentUser(machine);

    // ── Opción -u (solo root) ──
    let rest = [...args];
    let subject = currentUser.username;
    const uIdx = rest.indexOf('-u');
    if (uIdx !== -1) {
      if (!isRoot(currentUser)) {
        return { output: 'crontab: The -u option can only be used by the superuser.', isError: true };
      }
      subject = rest[uIdx + 1];
      if (!subject) return { output: 'crontab: option requires an argument -- u', isError: true };
      rest = rest.filter((_, i) => i !== uIdx && i !== uIdx + 1);
    }

    const action = rest.find(a => ['-l', '--list', '-e', '--edit', '-r', '--remove'].includes(a));

    if (!action) {
      return { output: 'crontab: usage: crontab [-u user] {-l | -e | -r}', isError: true };
    }

    // ── crontab -l ──
    if (action === '-l' || action === '--list') {
      const file = findFile(machine, spoolPath(subject));
      if (!file) {
        return { output: `no crontab for ${subject}`, isError: false };
      }
      return { output: file.content ?? '', isError: false };
    }

    // ── crontab -r ──
    if (action === '-r' || action === '--remove') {
      const file = findFile(machine, spoolPath(subject));
      if (!file) {
        return { output: `no crontab for ${subject}`, isError: false };
      }
      const parent = findDirEntry(machine, SPOOL_DIR);
      if (subject !== currentUser.username && !isRoot(currentUser)) {
        if (!parent || !canDeleteInDir(machine, parent, file, currentUser)) {
          return { output: 'crontab: Permission denied', isError: true };
        }
      }
      machine.files = machine.files.filter(f => f.path !== file.path);
      return { output: '', isError: false, filesChanged: [...machine.files] };
    }

    // ── crontab -e ──
    const dirsCreated = ensureSpoolDirs(machine);
    const path = spoolPath(subject);
    const existing = findFile(machine, path);
    const filesChanged = dirsCreated ? [...machine.files] : undefined;

    if (existing) {
      if (subject !== currentUser.username && !isRoot(currentUser) && !canEditFile(machine, existing, currentUser)) {
        return { output: 'crontab: Permission denied', isError: true };
      }
      return {
        output: '',
        nanoFile: {
          path,
          content: existing.content ?? '',
          existingSnapshot: {
            owner: existing.owner ?? 'root',
            group: existing.group ?? 'root',
            mode: existing.mode ?? 0o600,
          },
        },
        filesChanged,
      };
    }

    if (subject !== currentUser.username && !isRoot(currentUser)) {
      return { output: 'crontab: Permission denied', isError: true };
    }

    const ownership = defaultOwnership(machine, subject === 'root' ? { username: 'root', uid: 0, gid: 0, home: '/root', shell: '/bin/bash', groups: [0] } : currentUser, 0o600);
    const newFile = buildNewFile(path, TEMPLATE, 'text', ownership);
    machine.files.push(newFile);
    return {
      output: '',
      nanoFile: {
        path,
        content: TEMPLATE,
        existingSnapshot: { owner: ownership.owner, group: ownership.group, mode: ownership.mode },
      },
      filesChanged: [...machine.files],
    };
  }
};
