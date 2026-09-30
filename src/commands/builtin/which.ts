// ── commands/builtin/which.ts ──────────────────────────────────────
// Simulador de which - localiza ejecutables
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
//
// Los paths se DERIVAN del registro de comandos (`commands/names.ts`, que
// `commandNames.test.ts` mantiene sincronizado con el COMMANDS Map): antes
// eran 127 literales '/bin/x': '/usr/bin/x' maintained a mano, sin ningún
// test, que ya mentía en las dos direcciones —11 comandos del registro sin
// path (`which chmod` no encontraba nada) y 19 paths de comandos que el
// simulador no tiene (`which john` / `which bash` daban una ruta).
//
// Aquí solo se declara la REGLA (qué directorio usa cada familia); agregar un
// comando nuevo al registro lo hace resoluble sin tocar este archivo.

import type { CommandContext, CommandResponse } from '../../types';
import { COMMAND_NAMES } from '../names';
import { isInstalled } from '../../frameworks/packages/packageManager';

/** Directorio por defecto: en Debian/Ubuntu casi todo cae en /usr/bin. */
const DEFAULT_DIR = '/usr/bin';

/** Comandos que viven en /bin (coreutils y compañía). */
const BIN_COMMANDS: ReadonlySet<string> = new Set([
  'cat', 'cd', 'chgrp', 'chmod', 'chown', 'cp', 'dash', 'date', 'df', 'du',
  'echo', 'exit', 'grep', 'hostname', 'kill', 'ln', 'ls', 'mkdir', 'more',
  'mv', 'nc', 'ping', 'ps', 'pwd', 'rm', 'rmdir', 'sed', 'sleep', 'su',
  'uname', 'w',
]);

/** Comandos de administración del sistema en /sbin. */
const SBIN_COMMANDS: ReadonlySet<string> = new Set([
  'ifconfig', 'ip', 'journalctl', 'service',
]);

/** Y en /usr/sbin (paquetes de iptables/firewall). */
const USR_SBIN_COMMANDS: ReadonlySet<string> = new Set([
  'iptables', 'ufw',
]);

/** Paquete que provee el comando, cuando el gate de "instalado" aplica. */
const CMD_TO_PACKAGE: Record<string, string> = {
  nmap: 'nmap',
  hydra: 'hydra',
  gobuster: 'gobuster',
  curl: 'curl',
  wget: 'wget',
  python3: 'python3',
  python: 'python3',
  vim: 'vim',
  vi: 'vim',
  nano: 'nano',
  iptables: 'iptables',
  ufw: 'ufw',
  ifconfig: 'net-tools',
  netstat: 'net-tools',
  ip: 'iproute2',
  ss: 'iproute2',
  hashcat: 'hashcat',
  msfconsole: 'metasploit-framework',
  ssh: 'openssh-client',
  scp: 'openssh-client',
  nc: 'netcat-traditional',
};

const REGISTRY: ReadonlySet<string> = new Set(COMMAND_NAMES);

/**
 * Ruta del ejecutable, o undefined si el simulador no tiene ese comando.
 * Exportada para el test de sincronía con el registro.
 */
export function whichPathFor(cmd: string): string | undefined {
  const name = cmd.toLowerCase();
  if (!REGISTRY.has(name)) return undefined;
  if (BIN_COMMANDS.has(name)) return `/bin/${name}`;
  if (SBIN_COMMANDS.has(name)) return `/sbin/${name}`;
  if (USR_SBIN_COMMANDS.has(name)) return `/usr/sbin/${name}`;
  return `${DEFAULT_DIR}/${name}`;
}

export const cmd_which = {
  name: 'which',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    if (args.length === 0) {
      return { output: '', isError: false };
    }

    const showAll = args.includes('-a') || args.includes('--all');
    void showAll;

    let output = '';
    const notFound: string[] = [];

    for (const cmd of args) {
      if (cmd.startsWith('-')) {
        continue;
      }
      const key = cmd.toLowerCase();
      const path = whichPathFor(key);
      if (path) {
        const pkg = CMD_TO_PACKAGE[key];
        if (pkg && ctx.machine?.id && !isInstalled(ctx.machine, pkg)) {
          notFound.push(cmd);
          continue;
        }
        if (output) output += '\n';
        output += path;
      } else {
        notFound.push(cmd);
      }
    }

    if (notFound.length > 0 && output === '') {
      return { output: '' };
    }

    return { output };
  }
};
