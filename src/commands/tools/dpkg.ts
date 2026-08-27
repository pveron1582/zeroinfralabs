// ── commands/tools/dpkg.ts ──────────────────────────────────────────
// Simulador de dpkg (ROADMAP Fase 7.2): dpkg -l lista paquetes,
// dpkg -i instala un .deb local (archivo en el filesystem).

import type { CommandContext, CommandResponse, FileEntry, Machine } from '../../types';
import { getCurrentUser, isRoot } from '../../utils/users';
import { canCreateInDir } from '../../utils/permissions';
import { findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { applyUmask } from '../builtin/umask';
import {
  getPackage, installPackage, listInstalled,
} from '../../frameworks/packages/packageManager';

const DPKG_HELP = `Usage: dpkg <command> [options]
  -l, --list           List installed packages
  -i, --install <file.deb>  Install a local .deb package
  -h, --help           Show this help

Examples:
  dpkg -l
  dpkg -i /tmp/nmap.deb`;

const DPKG_ROOT_REQUIRED = 'dpkg: requested operation requires superuser privilege';

export const cmd_dpkg = {
  name: 'dpkg',
  execute: (args: string[], { machine, currentDir, umask }: CommandContext): CommandResponse => {
    if (!args.length || args.includes('-h') || args.includes('--help')) {
      return { output: DPKG_HELP, isError: !args.length };
    }

    const flag = args[0];
    if (flag === '-l' || flag === '--list') {
      return { output: listOutput(machine) };
    }

    if (flag === '-i' || flag === '--install') {
      const fileArg = args[1];
      if (!fileArg) return { output: 'dpkg: missing archive filename.', isError: true };
      if (!isRoot(getCurrentUser(machine))) return { output: DPKG_ROOT_REQUIRED, isError: true };

      const fullPath = fileArg.startsWith('/') ? fileArg : (currentDir?.replace(/\/$/, '') || '') + '/' + fileArg;
      const deb = machine.files.find(f => f.path === fullPath);
      if (!deb) {
        return { output: `dpkg: error: cannot access archive '${fileArg}': No such file or directory`, isError: true };
      }

      const parsed = parseDeb(deb.content);
      if (!parsed) {
        return { output: `dpkg: error processing archive ${fileArg} (--install):\n package is missing a valid 'Package' field`, isError: true };
      }

      const { name, version } = parsed;
      const info = getPackage(name);
      if (info) {
        installPackage(machine, name);
        const ownership = defaultOwnership(machine, getCurrentUser(machine), applyUmask(0o755, umask ?? 0o022));
        const newEntries: FileEntry[] = [];
        for (const bin of info.binaries) {
          if (machine.files.some(f => f.path === bin)) continue;
          const parentDir = findParentDir(machine, bin);
          if (!parentDir || !canCreateInDir(machine, parentDir, getCurrentUser(machine))) continue;
          newEntries.push(buildNewFile(bin, `ELF 64-bit LSB executable, x86-64 (package binary)\n`, 'binary', ownership));
        }
        return {
          output: `(Reading database ... 310000 files and directories currently installed.)\nPreparing to unpack ${fileArg} ...\nUnpacking ${name} (${version}) ...\nSetting up ${name} (${version}) ...`,
          filesChanged: [...machine.files, ...newEntries],
        };
      }

      // Paquete desconocido en la DB: lo registramos igualmente (sin binarios)
      installPackage(machine, name);
      return {
        output: `(Reading database ... 310000 files and directories currently installed.)\nPreparing to unpack ${fileArg} ...\nUnpacking ${name} (${version}) ...\nSetting up ${name} (${version}) ...`,
        filesChanged: [...machine.files],
      };
    }

    return { output: `dpkg: unrecognized option '${flag}'\nTry "dpkg -h" for help.`, isError: true };
  }
};

// ── Helpers ──

function parseDeb(content: string): { name: string; version: string } | null {
  const nameMatch = content.match(/^Package:\s*(\S+)/m);
  const versionMatch = content.match(/^Version:\s*(\S+)/m);
  if (!nameMatch) return null;
  return { name: nameMatch[1], version: versionMatch?.[1] ?? '1.0' };
}

function listOutput(machine: Machine): string {
  const pkgs = listInstalled(machine);
  let out = `Desired=Unknown/Install/Remove/Purge/Hold
| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend
|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)
||/ Name           Version      Architecture Description
+++-==============-============-============-=================================
`;
  pkgs.forEach(p => {
    out += `ii  ${p.name.padEnd(13)} ${p.version.padEnd(12)} ${p.architecture.padEnd(12)} ${p.description}\n`;
  });
  return out.trimEnd();
}
