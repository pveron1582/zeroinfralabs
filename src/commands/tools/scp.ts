// ── commands/tools/scp.ts ─────────────────────────────────────────
// scp (Tier 1): copia archivos locales ↕ máquinas virtuales vía SSH.
// Requiere que el target tenga ssh/22/tcp abierto y credenciales en
// found_credentials verificadas (como los labs); soporte user@host:path.

import type { CommandContext, CommandResponse } from '../../types';
import { findFile, findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { normalizePath, resolvePath } from '../../utils/path';
import { canCreateInDir, canEditFile, canRead } from '../../utils/permissions';
import { getCurrentUser, getUser, ROOT_USER } from '../../utils/users';
import { effectivePortState } from '../../frameworks/network/networkState';
import { applyUmask } from '../builtin/umask';

const SCP_HELP = `Usage: scp [-v] SOURCE TARGET
Copy files over SSH.

  -v      Verbose

Examples:
  scp local.txt user@192.168.1.10:/tmp/remote.txt
  scp user@192.168.1.10:/etc/passwd ./loot.txt

Notes:
  Needs the target to have ssh/22 open and the user+pass in your
  verified inventory (use 'last'/'history' to recall).`;

function parseRemote(s: string): { user: string; host: string; path: string } | null {
  const m = s.match(/^([a-zA-Z_][a-zA-Z0-9_-]*|\*?)@?([^:\s]+):(.+)$/);
  if (!m) return null;
  return { user: m[1] || 'root', host: m[2], path: m[3] };
}

export const cmd_scp = {
  name: 'scp',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.includes('-h') || args.includes('--help')) return { output: SCP_HELP };
    const flags = args.filter(a => a.startsWith('-'));
    const pos = args.filter(a => !a.startsWith('-'));
    if (pos.length < 2) return { output: 'usage: scp [-v] source target\nTry \'scp --help\' for more information.', isError: true };
    const src = pos[0];
    const dst = pos[1];
    const verbose = flags.includes('-v');
    const srcRemote = parseRemote(src);
    const dstRemote = parseRemote(dst);

    if (srcRemote && dstRemote) {
      return { output: 'scp: remote-to-remote not supported in this simulator', isError: true };
    }
    if (!srcRemote && !dstRemote) {
      return { output: 'scp: one side must be a remote host (user@ip:path)', isError: true };
    }

    const remote = (srcRemote || dstRemote)!;
    const target = ctx.allMachines.find(m => m.machine_info.ip === remote.host || m.machine_info.hostname === remote.host);
    if (!target) return { output: `ssh: Could not resolve hostname ${remote.host}: Name or service not known`, isError: true };
    const sshPort = target.scan_results.ports.find(p => p.port === 22 || /ssh/i.test(p.service));
    if (!sshPort || effectivePortState(target, sshPort) !== 'open') {
      return { output: `ssh: connect to host ${remote.host} port 22: No route to host`, isError: true };
    }
    const creds = ctx.allMachines.some(m =>
      (m.found_credentials ?? []).some(c => c.user === remote.user && m.id === target.id)
    );
    if (!creds) {
      // Sin credenciales conocidas: autenticación interactiva no soportada
      return { output: `${remote.user}@${remote.host}'s password: \nPermission denied, please try again.\n${remote.user}@${remote.host}: Permission denied (publickey,password).`, isError: true };
    }
    const log = verbose ? `Executing: cp --verbose ${src.includes('@') ? 'pull' : 'push'} ${remote.user}@${remote.host}:${remote.path}\n` : '';
    const localUser = getCurrentUser(ctx.machine);
    const localHome = localUser.home ?? '/';
    const remoteUserObj = getUser(target, remote.user) ?? (remote.user === 'root' ? ROOT_USER : {
      username: remote.user, uid: 1000, gid: 1000,
      home: `/home/${remote.user}`, shell: '/bin/bash', groups: [1000],
    });
    const remoteHome = remoteUserObj.home ?? `/home/${remote.user}`;
    const clean = (p: string) => (p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p);

    // Upload: local file → remote path (simulado en el FS del target)
    if (!srcRemote && dstRemote) {
      const cleanSrc = clean(normalizePath(resolvePath(src, ctx.currentDir || '/', localHome)));
      const f = findFile(ctx.machine, cleanSrc);
      if (!f) return { output: `${src}: No such file or directory`, isError: true };
      if (f.path.endsWith('/.dir')) return { output: `${src}: Is a directory`, isError: true };
      if (!canRead(ctx.machine, f, localUser)) {
        return { output: `${src}: Permission denied`, isError: true };
      }
      const remoteIsDir = remote.path.endsWith('/');
      const remoteBase = remoteIsDir
        ? clean(normalizePath(resolvePath(remote.path, '/', remoteHome))) + '/'
        : clean(normalizePath(resolvePath(remote.path, '/', remoteHome)));
      const fname = remoteIsDir ? cleanSrc.split('/').pop()! : remoteBase.split('/').pop()!;
      const full = remoteIsDir ? remoteBase + fname : remoteBase;
      const parent = findParentDir(target, full);
      const existing = findFile(target, full);
      if (existing) {
        if (!canEditFile(target, existing, remoteUserObj)) {
          return { output: `scp: ${remote.path}: Permission denied`, isError: true };
        }
      } else {
        if (!parent) return { output: `scp: ${remote.path}: No such file or directory`, isError: true };
        if (!canCreateInDir(target, parent, remoteUserObj)) {
          return { output: `scp: ${remote.path}: Permission denied`, isError: true };
        }
      }
      const ownership = existing
        ? { owner: existing.owner ?? remoteUserObj.username, group: existing.group ?? remoteUserObj.username, mode: existing.mode ?? 0o644 }
        : defaultOwnership(target, remoteUserObj, applyUmask(0o644, ctx.umask ?? 0o022));
      const entry = buildNewFile(full, f.content ?? '', 'text', ownership);
      target.files = [...target.files.filter(x => x.path !== full), entry];
      return { output: `${log}'./${cleanSrc.split('/').pop()}' -> '${full}'`, isError: false };
    }

    // Download: remote file → local
    if (srcRemote && !dstRemote) {
      const cleanRemote = clean(normalizePath(resolvePath(remote.path, '/', remoteHome)));
      const f = findFile(target, cleanRemote);
      if (!f) return { output: `scp: ${remote.path}: No such file or directory`, isError: true };
      if (f.path.endsWith('/.dir')) return { output: `scp: ${remote.path}: Is a directory`, isError: true };
      if (!canRead(target, f, remoteUserObj)) {
        return { output: `scp: ${remote.path}: Permission denied`, isError: true };
      }
      const dstIsDir = dst === '.' || dst.endsWith('/');
      const dstBase = dst === '.' ? (ctx.currentDir || '/') : dst;
      const resolvedBase = dstIsDir
        ? normalizePath(resolvePath(dstBase, ctx.currentDir || '/', localHome))
        : clean(normalizePath(resolvePath(dstBase, ctx.currentDir || '/', localHome)));
      const fname = dstIsDir ? cleanRemote.split('/').pop()! : resolvedBase.split('/').pop()!;
      const full = dstIsDir ? resolvedBase + fname : resolvedBase;
      const parent = findParentDir(ctx.machine, full);
      const existing = findFile(ctx.machine, full);
      if (existing) {
        if (!canEditFile(ctx.machine, existing, localUser)) {
          return { output: `scp: ${dst}: Permission denied`, isError: true };
        }
      } else {
        if (!parent) return { output: `scp: ${dst}: No such file or directory`, isError: true };
        if (!canCreateInDir(ctx.machine, parent, localUser)) {
          return { output: `scp: ${dst}: Permission denied`, isError: true };
        }
      }
      const ownership = existing
        ? { owner: existing.owner ?? localUser.username, group: existing.group ?? localUser.username, mode: existing.mode ?? applyUmask(0o644, ctx.umask ?? 0o022) }
        : defaultOwnership(ctx.machine, localUser, applyUmask(0o644, ctx.umask ?? 0o022));
      const entry = buildNewFile(full, f.content ?? '', 'text', ownership);
      ctx.machine.files = [...ctx.machine.files.filter(x => x.path !== full), entry];
      return { output: `${log}'${remote.path}' -> '${full}'`, isError: false, filesChanged: [...ctx.machine.files], downloadedFile: entry };
    }
    return { output: 'scp: unsupported copy direction', isError: true };
  },
};
