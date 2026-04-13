// ── commands/builtin/sudo.ts ──────────────────────────────────────
// Simula el comando sudo con soporte para:
//   sudo -l              → lista permisos del sudoers
//   sudo <cmd>           → ejecuta comando como root (si autorizado)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.
// La validación de privesc debe hacerse en el laboratorio correspondiente.

import type { CommandContext, CommandResponse } from '../../types';

// Parsea el archivo /etc/sudoers de la máquina y extrae las reglas del usuario actual
function parseSudoers(sudoersContent: string, username: string): string[] {
  const lines = sudoersContent.split('\n');
  const rules: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') continue;
    if (trimmed.startsWith('Defaults') || trimmed.startsWith('root')) continue;
    if (trimmed.startsWith(username)) {
      rules.push(trimmed);
    }
  }

  return rules;
}

// Extrae el primer usuario no-root del sudoers
function getUsernameFromSudoers(sudoersContent: string): string {
  const lines = sudoersContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('Defaults') && !trimmed.startsWith('root')) {
      const match = trimmed.match(/^([a-zA-Z0-9_]+)\s+/);
      if (match) {
        return match[1];
      }
    }
  }
  return 'root';
}

// Verifica si un comando tiene permiso NOPASSWD en sudoers
function hasNopasswd(sudoersContent: string, username: string, cmd: string): boolean {
  const rules = parseSudoers(sudoersContent, username);
  return rules.some(r => {
    const lower = r.toLowerCase();
    // NOPASSWD:ALL o NOPASSWD:/path/to/cmd
    return lower.includes('nopasswd') && (lower.includes('all') || lower.includes(cmd.toLowerCase()));
  });
}

// Verifica si tiene permiso para ejecutar un comando (con o sin password)
function hasPermission(sudoersContent: string, username: string, cmd: string): boolean {
  const rules = parseSudoers(sudoersContent, username);
  return rules.some(r =>
    r.includes('ALL') || r.toLowerCase().includes(cmd.toLowerCase())
  );
}

export const cmd_sudo = {
  name: 'sudo',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    // Sin argumentos
    if (args.length === 0) {
      return {
        output: `usage: sudo [-AbEHnPS] [-C num] [-D directory] [-g group] [-h host] [-p prompt]
              [-R directory] [-T timeout] [-u user] [VAR=value] [-i | -s] [<command>]
  sudo -l [command]     list user's privileges or check a specific command`,
        isError: false,
      };
    }

    const hostname = machine.machine_info.hostname;
    const sudoersFile = machine.files?.find(f => f.path === '/etc/sudoers');

    if (!sudoersFile) {
      return {
        output: `sudo: unable to open /etc/sudoers: No such file or directory`,
        isError: true,
      };
    }

    const username = getUsernameFromSudoers(sudoersFile.content);

    // ── sudo -l ────────────────────────────────────────────────────
    if (args[0] === '-l') {
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
        output: `Matching Defaults entries for ${username} on ${hostname}:\n    env_reset, mail_badpass,\n    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\n\nUser ${username} may run the following commands on ${hostname}:\n${rulesFormatted}`,
        isError: false,
        sudoPrivileges: {
          machineId: machine.id,
          user: username,
          commands: rules,
          canSudo: true
        }
      };
    }

    // ── sudo <cmd> ────────────────────────────────────────────────────
    const requestedCmd = args[0];
    
    // Verificar permisos
    if (!hasPermission(sudoersFile.content, username, requestedCmd)) {
      return {
        output: `Sorry, user ${username} is not allowed to execute '${args.join(' ')}' as root on ${hostname}.\nThis incident will be reported.`,
        isError: true,
      };
    }

    // Verificar si requiere password (NOPASSWD)
    const cmdRequiresPassword = !hasNopasswd(sudoersFile.content, username, requestedCmd);
    
    // Comandos que abren shell como root (vim con !bash, su, bash)
    const joinedArgs = args.join(' ').toLowerCase();
    const isShellEscalation = (
      (requestedCmd === 'vim' && (joinedArgs.includes('!bash') || joinedArgs.includes('!sh'))) ||
      requestedCmd === 'su' ||
      requestedCmd === 'bash' ||
      requestedCmd === '/bin/bash'
    );

    if (isShellEscalation) {
      // Simulamos que el comando ejecuta y abre shell como root
      return {
        output: `\n# ${requestedCmd} abriendo shell como root...
root@${hostname}:/home/${username}# id
uid=0(root) gid=0(root) groups=0(root)
root@${hostname}:/home/${username}# whoami
root`,
        isError: false,
        // Estos campos son para que el laboratorio pueda detectar el privesc
        privescAttempted: true,
        privescTool: requestedCmd,
        privescViaSudo: true,
      };
    }

    // Comando genérico ejecutado como root
    return {
      output: `[sudo] Ejecutando '${args.join(' ')}' como root...`,
      isError: false,
    };
  },
};
