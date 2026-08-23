import type { CommandContext, CommandResponse } from '../../types';
import { getCurrentUser, getGroups } from '../../utils/users';
import { cmd_nano } from './nano';

// Editores soportados: `sudo nano/vi/vim <file>` abre el editor como root.
// `vim -c "!bash"` NO entra acá — se detecta como escalada de shell antes.
const EDITOR_COMMANDS = ['nano', 'vi', 'vim'];

// Abre el editor con identidad root (elevatedEdit): puede leer y modificar
// archivos restringidos que el usuario solo puede leer.
function openEditorElevated(editorArgs: string[], context: CommandContext): CommandResponse {
  const editorResult = cmd_nano.execute(editorArgs, { ...context, elevatedEdit: true });
  if ('nanoFile' in editorResult && editorResult.nanoFile) {
    return {
      ...editorResult,
      nanoFile: { ...editorResult.nanoFile, readOnly: false, elevated: true },
    };
  }
  return editorResult;
}

function parseSudoers(sudoersContent: string, username: string, userGroupNames: string[]): string[] {
  const lines = sudoersContent.split('\n');
  const rules: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') continue;
    if (trimmed.startsWith('Defaults') || trimmed.startsWith('root')) continue;
    if (trimmed.startsWith(username + ' ') || trimmed.startsWith(username + '\t')) {
      rules.push(trimmed);
      continue;
    }
    // Reglas de grupo (%sudo, %wheel): aplican si el usuario es miembro del
    // grupo (miembro explícito en /etc/group o grupo primario por gid).
    // Como en sudo real: estar en el grupo SIN regla %grupo en sudoers
    // NO otorga privilegios.
    const groupMatch = trimmed.match(/^%([A-Za-z0-9_.-]+)/);
    if (groupMatch && userGroupNames.includes(groupMatch[1])) {
      rules.push(trimmed);
    }
  }

  return rules;
}

// Extrae la lista de comandos permitidos de una regla sudoers.
// `ALL=(ALL:ALL)` y `ALL=` son hosts/run-as — NO otorgan todos los comandos.
// Solo un `ALL` en la lista de comandos (p.ej. "(ALL:ALL) ALL" o
// "NOPASSWD: ALL") significa permiso total.
function parseAllowedCommands(rule: string): string[] {
  const stripped = rule.replace(/\([^)]*\)/g, '').trim();
  const colonIdx = stripped.indexOf(':');
  let cmdsPart = colonIdx === -1 ? stripped : stripped.slice(colonIdx + 1);
  cmdsPart = cmdsPart.replace(/NOPASSWD:/gi, '').replace(/PASSWD:/gi, '').trim();
  const eqIdx = cmdsPart.indexOf('=');
  if (eqIdx !== -1) cmdsPart = cmdsPart.slice(eqIdx + 1).trim();
  return cmdsPart.split(',').map(c => c.trim()).filter(Boolean);
}

function hasPermission(rules: string[], cmd: string): boolean {
  const cmdBase = cmd.toLowerCase().replace(/^\/usr\/(s?bin)\//, '');
  return rules.some(rule => {
    const allowed = parseAllowedCommands(rule).map(c => c.toLowerCase());
    if (allowed.includes('all')) return true;
    return allowed.some(a =>
      a === cmd.toLowerCase() || a === cmdBase || a.endsWith('/' + cmdBase),
    );
  });
}

// ¿El comando está concedido por una regla NOPASSWD? Solo así sudo no pedirá
// la password del usuario invocante al escalar.
function hasNopasswd(rules: string[], cmd: string): boolean {
  return rules.some(rule => {
    if (!hasPermission([rule], cmd)) return false;
    return /NOPASSWD/i.test(rule);
  });
}

export const cmd_sudo = {
  name: 'sudo',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { machine } = context;
    if (args.length === 0) {
      return {
        output: `usage: sudo [-AbEHnPS] [-C num] [-D directory] [-g group] [-h host] [-p prompt]
              [-R directory] [-T timeout] [-u user] [VAR=value] [-i | -s] [<command>]
  sudo -l [command]     list user's privileges or check a specific command`,
        isError: false,
      };
    }

    const currentUser = getCurrentUser(machine);
    const username = currentUser.username;
    const isRoot = currentUser.uid === 0;
    const hostname = machine.machine_info.hostname;

    // Root doesn't need sudo
    if (isRoot) {
      if (args[0] === '-i' || args[0] === '-s') {
        return { output: 'sudo: already root', isError: false };
      }
      // Root también puede consultar sus privilegios con sudo -l.
      if (args[0] === '-l') {
        return {
          output: `Matching Defaults entries for root on ${hostname}:\n    env_reset, mail_badpass,\n    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin\n\nUser root may run the following commands on ${hostname}:\n    (ALL : ALL) ALL`,
          type: 'sudo',
          isError: false,
          sudoPrivileges: {
            machineId: machine.id,
            user: 'root',
            commands: ['(ALL : ALL) ALL'],
            canSudo: true,
          },
        };
      }
      // Root ejecutando un editor: `sudo nano <file>` abre el editor igualmente.
      if (EDITOR_COMMANDS.includes(args[0])) {
        return openEditorElevated(args.slice(1), context);
      }
      return {
        output: `root@${hostname}# ${args.join(' ')}`,
        isError: false,
      };
    }

    const sudoersFile = machine.files?.find(f => f.path === '/etc/sudoers');
    if (!sudoersFile) {
      return {
        output: `sudo: unable to open /etc/sudoers: No such file or directory`,
        isError: true,
      };
    }

    // Grupos del usuario (miembro explícito o grupo primario): necesarios
    // para resolver reglas %grupo del sudoers.
    const groups = getGroups(machine);
    const userGroupNames = groups
      .filter(g => g.members.includes(username) || g.gid === currentUser.gid)
      .map(g => g.name);

    const rules = parseSudoers(sudoersFile.content, username, userGroupNames);

    if (rules.length === 0) {
      return {
        output: `${username} is not in the sudoers file.  This incident will be reported.`,
        isError: true,
      };
    }

    // ── sudo -l ────────────────────────────────────────────────────
    if (args[0] === '-l') {
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
        type: 'sudo',
        isError: false,
        sudoPrivileges: {
          machineId: machine.id,
          user: username,
          commands: rules,
          canSudo: true
        }
      };
    }

    // ── sudo -i / sudo -s ───────────────────────────────────────────
    // Abren una shell root pidiendo SIEMPRE la password de root, sin
    // importar el usuario ni el sudoers. Al validarla, el CommandRunner
    // aplica el privesc y el prompt pasa a root@...# sin output extra.
    // `-s` deja la shell en /root; `-i` mantiene el directorio actual.
    if (args[0] === '-i' || args[0] === '-s') {
      return {
        output: '',
        isError: false,
        requiresPassword: true,
        suTarget: 'root',
        sudoEscalation: true,
        sudoCwd: args[0] === '-s' ? '/root' : undefined,
      };
    }

    // ── sudo <cmd> ────────────────────────────────────────────────────
    const requestedCmd = args[0];
    
    // Verificar permisos
    if (!hasPermission(rules, requestedCmd)) {
      return {
        output: `Sorry, user ${username} is not allowed to execute '${args.join(' ')}' as root on ${hostname}.\nThis incident will be reported.`,
        isError: true,
      };
    }

    // Comandos que abren shell como root (vim con !bash, su, bash)
    const joinedArgs = args.join(' ').toLowerCase();
    const isShellEscalation = (
      (requestedCmd === 'vim' && (joinedArgs.includes('!bash') || joinedArgs.includes('!sh'))) ||
      requestedCmd === 'su' ||
      requestedCmd === 'bash' ||
      requestedCmd === '/bin/bash'
    );

    if (isShellEscalation) {
      // Salvo que la regla sudoers sea NOPASSWD, sudo pide la password del
      // usuario INVOCANTE (como el `su` corregido) antes de abrir la shell
      // root. El CommandRunner la valida contra known_passwords y, si es
      // correcta, aplica el privesc (setPrivescCompleted + setSuUser('root')).
      if (!hasNopasswd(rules, requestedCmd)) {
        return {
          output: `[sudo] password for ${username}: `,
          isError: false,
          requiresPassword: true,
          suTarget: username,
          sudoEscalation: true,
        };
      }

      // Simulamos que el comando ejecuta y abre shell como root
      return {
        output: `\n# ${requestedCmd} abriendo shell como root...
root@${hostname}:/home/${username}# id
uid=0(root) gid=0(root) groups=0(root)
root@${hostname}:/home/${username}# whoami
root`,
        type: 'sudo',
        isError: false,
        // Estos campos son para que el laboratorio pueda detectar el privesc
        privescAttempted: true,
        privescTool: requestedCmd,
        privescViaSudo: true,
        // Marca la escalada como completada: Terminal.tsx escucha este campo
        // y llama a setPrivescCompleted, que pone privesc_completed=true en
        // la máquina. useTerminalIdentity entonces devuelve 'root' y el prompt
        // pasa de john@...$ a root@...#.
        privescCompleted: machine.id,
      };
    }

    // ── sudo <editor> (nano/vi/vim) ──────────────────────────────────
    // Corre el editor como root: puede abrir y modificar archivos restringidos
    // (p.ej. /etc/passwd) que el usuario solo puede leer. El save se hace con
    // identidad root (elevated). `vim -c "!bash"` ya fue manejado arriba.
    if (EDITOR_COMMANDS.includes(requestedCmd)) {
      return openEditorElevated(args.slice(1), context);
    }

    // Comando genérico ejecutado como root
    return {
      output: `[sudo] Ejecutando '${args.join(' ')}' como root...`,
      isError: false,
    };
  },
};