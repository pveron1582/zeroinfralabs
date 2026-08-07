// ── commands/tools/apt.ts ───────────────────────────────────────────
// Simulador de apt (ROADMAP Fase 7.1): apt update, apt install/remove,
// apt list --installed, apt search. Solo root puede modificar.
// Instalar un paquete agrega sus binarios al filesystem de la máquina.

import type { CommandContext, CommandResponse, FileEntry, Machine } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import { canCreateInDir } from '../../utils/permissions';
import { findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { applyUmask } from '../builtin/umask';
import {
  getPackage, installPackage, isInstalled, listInstalled, removePackage, searchPackages,
} from '../../frameworks/packages/packageManager';

const APT_HELP = `Usage: apt <command> [options]
  update                Update list of available packages
  install <pkg>         Install a package (adds its binaries)
  remove <pkg>          Remove a package
  list --installed      List installed packages
  search <term>         Search package descriptions
  -h, --help            Show this help

Examples:
  apt update
  apt install netcat-traditional
  apt list --installed
  apt search webserver`;

const APT_ROOT_REQUIRED = 'apt: This operation requires root privileges.';

export const cmd_apt = {
  name: 'apt',
  execute: (args: string[], { machine, currentDir, umask }: CommandContext): CommandResponse => {
    if (!args.length || args.includes('-h') || args.includes('--help')) {
      return { output: APT_HELP, isError: !args.length };
    }

    const [action, ...rest] = args;
    const user = getCurrentUser(machine);

    if (action === 'update') {
      if (!isRoot(user)) return { output: APT_ROOT_REQUIRED, isError: true };
      return {
        output: `Hit:1 http://http.kali.org/kali kali-rolling InRelease
Hit:2 http://http.kali.org/kali kali-rolling/non-free amd64 Packages
Hit:3 http://http.kali.org/kali kali-rolling/main amd64 Packages
Hit:4 http://http.kali.org/kali kali-rolling/contrib amd64 Packages
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
All packages are up to date.`,
      };
    }

    if (action === 'list') {
      const flag = rest[0];
      if (flag === '--installed' || flag === '-i') {
        return { output: listOutput(machine) };
      }
      return { output: 'apt: expected "list --installed".', isError: true };
    }

    if (action === 'search') {
      const term = rest[0];
      if (!term) return { output: 'apt: missing search term.', isError: true };
      const results = searchPackages(term);
      if (results.length === 0) return { output: `apt: no packages found matching '${term}'.` };
      return { output: results.map(p => `  ${p.name} - ${p.description}`).join('\n') };
    }

    if (action === 'install' || action === 'remove') {
      if (!isRoot(user)) return { output: APT_ROOT_REQUIRED, isError: true };
      const pkg = rest.find(a => !a.startsWith('-'));
      if (!pkg) return { output: `apt: missing package name for '${action}'.`, isError: true };

      if (action === 'remove') {
        if (!isInstalled(machine, pkg)) {
          return { output: `Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nE: Package '${pkg}' is not installed, so not removed`, isError: true };
        }
        removePackage(machine, pkg);
        return { output: `Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\n\nThe following packages will be REMOVED:\n  ${pkg}\n0 upgraded, 0 newly installed, 1 to remove and 0 not upgraded.\nAfter this operation, ${removeBinaries(machine, pkg)} disk space will be freed.\nRemoving ${pkg} (${getPackage(pkg)?.version || 'unknown'}) ...`, filesChanged: [...machine.files] };
      }

      // install
      const info = getPackage(pkg);
      if (!info) {
        return { output: `Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\nE: Unable to locate package ${pkg}`, isError: true };
      }
      if (isInstalled(machine, pkg)) {
        return { output: `Reading package lists... Done\nBuilding dependency tree... Done\nReading state information... Done\n${pkg} is already the newest version (${info.version}).\n0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.` };
      }

      installPackage(machine, pkg);
      const addResult = addBinaries(machine, currentDir, umask ?? 0o022, info.binaries);
      return {
        output: `Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
  ${pkg}
0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.
Need to download ${info.size} of archives.
After this operation, ${info.size} of additional disk space will be used.
Get:1 http://http.kali.org/kali kali-rolling/main amd64 ${pkg} ${info.version} [${info.size}]
Fetched ${info.size} in 1s (${info.size}/s)
Selecting previously unselected package ${pkg}.
(Reading database ... 310000 files and directories currently installed.)
Preparing to unpack .../${pkg}_${info.version}_amd64.deb ...
Unpacking ${pkg} (${info.version}) ...
Setting up ${pkg} (${info.version}) ...
${addResult.error ? '\n' + addResult.error : ''}`,
        filesChanged: [...machine.files],
      };
    }

    return { output: `apt: unrecognized command '${action}'\nTry "apt -h" for help.`, isError: true };
  }
};

// ── Helpers ──

function listOutput(machine: Machine): string {
  const pkgs = listInstalled(machine);
  let out = `Listing... Done\n`;
  pkgs.forEach(p => {
    out += `${p.name}/now ${p.version} ${p.architecture} [installed]\n`;
  });
  return out.trimEnd();
}

function addBinaries(
  machine: Machine,
  currentDir: string | undefined,
  umask: number,
  binaries: string[]
): { error?: string } {
  const user = getCurrentUser(machine);
  const currentDirClean = (currentDir || '/').replace(/\/$/, '');
  let error: string | undefined;
  for (const bin of binaries) {
    const fullPath = bin.startsWith('/') ? bin : `${currentDirClean}/${bin}`;
    if (machine.files.some(f => f.path === fullPath)) continue;
    const parentDir = findParentDir(machine, fullPath);
    if (!parentDir || !canCreateInDir(machine, parentDir, user)) {
      error = `apt: warning: unable to install binary '${fullPath}' (directory not writable)`;
      continue;
    }
    const ownership = defaultOwnership(machine, user, applyUmask(0o755, umask));
    const entry: FileEntry = buildNewFile(fullPath, `ELF 64-bit LSB executable, x86-64 (package binary)\n`, 'binary', ownership);
    machine.files.push(entry);
  }
  return error ? { error } : {};
}

function removeBinaries(machine: Machine, pkg: string): string {
  const info = getPackage(pkg);
  if (!info) return '0 B';
  const removed = info.binaries.filter(bin => machine.files.some(f => f.path === bin));
  machine.files = machine.files.filter(f => !removed.includes(f.path));
  return `${removed.length * 120} kB`;
}
