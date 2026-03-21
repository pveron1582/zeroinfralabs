// ── commands/builtin/sudo.ts ──────────────────────────────────────
// Simula el comando sudo con soporte para:
//   sudo -l              → lista permisos del sudoers
//   sudo vim -c '!bash'  → escalada de privilegios (completa misión)
//   sudo <cmd>           → respuesta genérica

import type { CommandContext, CommandResponse } from '../../types';

// Parsea el archivo /etc/sudoers de la máquina y extrae las reglas del usuario actual
function parseSudoers(sudoersContent: string, username: string): string[] {
  const lines = sudoersContent.split('\n');
  const rules: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Ignorar comentarios y líneas vacías
    if (trimmed.startsWith('#') || trimmed === '') continue;
    // Ignorar Defaults y root
    if (trimmed.startsWith('Defaults') || trimmed.startsWith('root')) continue;
    // Buscar líneas que contengan el username
    if (trimmed.startsWith(username)) {
      rules.push(trimmed);
    }
  }

  return rules;
}

// Detecta si el comando es una escalada via vim
function isVimPrivesc(args: string[]): boolean {
  // Acepta variantes: sudo vim -c '!bash', sudo vim -c "!bash", sudo vim -c !bash
  const joined = args.join(' ').toLowerCase();
  return (
    args[0] === 'vim' &&
    (joined.includes('!bash') || joined.includes('!sh') || joined.includes('!/bin/bash'))
  );
}

// Detecta si el comando es sudo su o sudo bash (también válidos para escalar)
function isDirectRoot(args: string[]): boolean {
  return (
    args[0] === 'su' ||
    args[0] === 'bash' ||
    args[0] === '/bin/bash' ||
    (args[0] === 'su' && args[1] === '-')
  );
}

export const cmd_sudo = {
  name: 'sudo',
  execute: (args: string[], { machine, currentMissionId }: CommandContext): CommandResponse => {
    // Sin argumentos
    if (args.length === 0) {
      return {
        output: `usage: sudo [-AbEHnPS] [-C num] [-D directory] [-g group] [-h host] [-p prompt]
              [-R directory] [-T timeout] [-u user] [VAR=value] [-i | -s] [<command>]
  sudo -l [command]     list user's privileges or check a specific command`,
        isError: false,
      };
    }

    // ── sudo -l ────────────────────────────────────────────────────
    if (args[0] === '-l') {
      const username = machine.id.includes('attacker') ? 'root' : 'developer';
      const hostname = machine.machine_info.hostname;
      const ip = machine.machine_info.ip;

      // Buscar sudoers en los archivos de la máquina activa
      const sudoersFile = machine.files?.find(f => f.path === '/etc/sudoers');

      if (!sudoersFile) {
        return {
          output: `sudo: unable to open /etc/sudoers: No such file or directory`,
          isError: true,
        };
      }

      const rules = parseSudoers(sudoersFile.content, username);

      if (rules.length === 0) {
        return {
          output: `Matching Defaults entries for ${username} on ${hostname}:\n    env_reset, mail_badpass,\n    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\n\nUser ${username} may not run sudo on ${hostname}.`,
          isError: false,
        };
      }

      // Formatear output al estilo real de sudo -l
      const rulesFormatted = rules
        .map(rule => {
          // Extraer la parte de comandos (después del primer ALL=(ALL))
          const match = rule.match(/NOPASSWD:\s*(.+)/i);
          if (match) {
            return `    (ALL) NOPASSWD: ${match[1].trim()}`;
          }
          const matchAll = rule.match(/ALL=\(ALL(?::ALL)?\)\s+(.+)/i);
          if (matchAll) {
            return `    (ALL : ALL) ${matchAll[1].trim()}`;
          }
          return `    ${rule}`;
        })
        .join('\n');

      return {
        output: `Matching Defaults entries for ${username} on ${hostname}:\n    env_reset, mail_badpass,\n    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\n\nUser ${username} may run the following commands on ${hostname} (${ip}):\n${rulesFormatted}`,
        completedMissionId: currentMissionId === 4 ? 4 : undefined,
        isError: false,
      };
    }

    // ── sudo vim -c '!bash' → escalada de privilegios ──────────────
    if (isVimPrivesc(args)) {
      return {
        output: `\n# vim abriendo shell como root...
root@${machine.machine_info.hostname}:/home/developer# id
uid=0(root) gid=0(root) groups=0(root)
root@${machine.machine_info.hostname}:/home/developer# whoami
root`,
        completedMissionId: currentMissionId === 5 ? 5 : undefined,
        newMachineId: undefined, // La sesión ya está en la víctima, solo cambia el usuario
        isError: false,
      };
    }

    // ── sudo su / sudo bash → también válidos ──────────────────────
    if (isDirectRoot(args)) {
      const sudoersFile = machine.files?.find(f => f.path === '/etc/sudoers');
      const username = 'developer';
      const hasNopasswd = sudoersFile?.content.includes('NOPASSWD');

      if (!hasNopasswd) {
        return {
          output: `[sudo] password for ${username}: \nSorry, user ${username} is not allowed to execute '${args.join(' ')}' as root on ${machine.machine_info.hostname}.`,
          isError: true,
        };
      }

      return {
        output: `root@${machine.machine_info.hostname}:/home/developer# `,
        completedMissionId: currentMissionId === 5 ? 5 : undefined,
        isError: false,
      };
    }

    // ── sudo <otro comando> ────────────────────────────────────────
    // Verificar si tiene permisos en sudoers para ese comando
    const sudoersFile = machine.files?.find(f => f.path === '/etc/sudoers');
    const requestedCmd = args[0];

    if (sudoersFile) {
      const username = 'developer';
      const rules = parseSudoers(sudoersFile.content, username);
      const hasPermission = rules.some(r =>
        r.includes('ALL') || r.toLowerCase().includes(requestedCmd.toLowerCase())
      );

      if (!hasPermission) {
        return {
          output: `Sorry, user developer is not allowed to execute '${args.join(' ')}' as root on ${machine.machine_info.hostname}.\nThis incident will be reported.`,
          isError: true,
        };
      }
    }

    // Comando genérico permitido por sudo
    return {
      output: `[sudo] Ejecutando ${args.join(' ')} como root...`,
      isError: false,
    };
  },
};
