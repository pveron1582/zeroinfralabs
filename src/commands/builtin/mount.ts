// ── commands/builtin/mount.ts ───────────────────────────────────────
// Simulador de mount / umount (ROADMAP Fase 9.1). Lista montajes
// actuales (root + /etc/fstab + montajes del usuario) y gestiona el
// montaje/desmontaje de dispositivos. Solo root.

import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import { getMounts, mountDevice, unmount, isMounted } from '../../frameworks/fs/mounts';

function formatMounts(machine: CommandContext['machine']): string {
  return getMounts(machine)
    .map(m => `${m.device} on ${m.mountpoint} type ${m.fs} (${m.options})`)
    .join('\n');
}

export const cmd_mount = {
  name: 'mount',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = getCurrentUser(ctx.machine);

    if (!isRoot(user)) {
      return { output: 'mount: only root can do that', isError: true };
    }

    // mount (sin args) → lista
    const positional = args.filter(a => !a.startsWith('-'));
    if (positional.length === 0) {
      return { output: formatMounts(ctx.machine), isError: false };
    }

    const [device, mountpoint] = positional;
    if (!device || !mountpoint) {
      return { output: 'mount: missing device or mount point', isError: true };
    }

    if (!mountpoint.startsWith('/')) {
      return { output: `mount: mount point '${mountpoint}' is not an absolute path`, isError: true };
    }

    if (isMounted(ctx.machine, mountpoint)) {
      return { output: `mount: ${mountpoint} is already mounted`, isError: true };
    }

    if (!mountDevice(ctx.machine, device, mountpoint)) {
      return { output: `mount: ${mountpoint}: mount point does not exist`, isError: true };
    }

    return { output: '', isError: false };
  }
};

export const cmd_umount = {
  name: 'umount',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = getCurrentUser(ctx.machine);

    if (!isRoot(user)) {
      return { output: 'umount: only root can do that', isError: true };
    }

    const mountpoint = args.find(a => a.startsWith('/'));
    if (!mountpoint) {
      return { output: 'umount: missing mount point', isError: true };
    }

    if (!isMounted(ctx.machine, mountpoint)) {
      return { output: `umount: ${mountpoint}: not mounted`, isError: true };
    }

    if (!unmount(ctx.machine, mountpoint)) {
      return { output: `umount: ${mountpoint}: cannot unmount system mount`, isError: true };
    }

    return { output: '', isError: false };
  }
};
