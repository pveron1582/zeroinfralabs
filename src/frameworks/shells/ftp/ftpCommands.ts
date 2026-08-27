// ── shells/ftp/ftpCommands.ts ────────────────────────────────────
// Comandos FTP disponibles una vez logueado (ls/dir, get, help, quit).
// Extraídos de FtpSession.ts para mantener el shell <300 líneas.

import type { ShellContext, ShellResult } from '../ShellSession';
import { canRead } from '../../../utils/permissions';
import { getCurrentUser } from '../../../utils/users';
import { defaultOwnership } from '../../../utils/fs';
import { applyUmask } from '../../../commands/builtin/umask';
import type { FtpState } from './FtpSession';

export interface FtpCommandResult {
  result: ShellResult;
  newState: FtpState;
}

/**
 * Ejecuta un comando FTP con la sesión ya logueada.
 * Devuelve el resultado + el estado siguiente (la mayoría no cambia el estado).
 */
export function runFtpCommand(
  input: string,
  state: FtpState,
  ctx: ShellContext
): FtpCommandResult {
  const trimmedInput = input.trim();
  const parts = trimmedInput.split(/\s+/);
  const cmd = parts[0]?.toLowerCase() || '';
  const target = ctx.allMachines.find(m => m.id === state.targetId);

  if (!target) {
    return {
      result: { output: `Connection lost.`, isError: true, closeSession: true },
      newState: state,
    };
  }

  switch (cmd) {
    case 'ls':
    case 'dir': {
      const ftpFiles = target.files?.filter(f =>
        f.path.startsWith('/srv/ftp/')
      ) || [];

      if (ftpFiles.length === 0) {
        return { result: { output: '' }, newState: state };
      }

      const fileList = ftpFiles.map(f => {
        const filename = f.path.replace('/srv/ftp/', '');
        return `-rw-r--r-- 1 ftp ftp ${f.content.length} Jan 01 00:00 ${filename}`;
      }).join('\n');

      return { result: { output: fileList }, newState: state };
    }

    case 'get': {
      const filename = parts[1];

      if (!filename) {
        return {
          result: { output: `usage: get remote-file [local-file]` },
          newState: state,
        };
      }

      const targetFile = target.files?.find(
        f => f.path === `/srv/ftp/${filename}`
      );

      if (!targetFile) {
        return {
          result: { output: `local: ${filename}: No such file or directory` },
          newState: state,
        };
      }

      // Permiso FTP: el usuario logueado solo puede leer archivos que tenga
      // permisos para leer. Si el archivo remoto no tiene `r` para ese user, falla.
      const ftpUser = { username: state.username || 'anonymous', uid: 65534, gid: 65534, home: '/srv/ftp', shell: '/bin/nologin', groups: [65534] };
      if (!canRead(target, targetFile, ftpUser)) {
        return {
          result: { output: `550 Failed to open file: Permission denied` },
          newState: state,
        };
      }

      const downloadPath = `/root/${filename}`;

      // Asignar owner/group/mode del usuario atacante (kali)
      const attacker = ctx.machine;
      const localUser = getCurrentUser(attacker);
      const ownership = defaultOwnership(attacker, localUser, applyUmask(0o644, ctx.umask ?? 0o022));

      return {
        result: {
          output:
            `local: ${filename} remote: ${filename}\n` +
            `200 PORT command successful.\n` +
            `150 Opening BINARY mode data connection for ${filename} (${targetFile.content.length} bytes).\n` +
            `226 Transfer complete.\nFile saved to: ${downloadPath}`,
          downloadedFile: {
            path: downloadPath,
            content: targetFile.content,
            type: targetFile.type,
            owner: ownership.owner,
            group: ownership.group,
            mode: ownership.mode,
          },
        },
        newState: state,
      };
    }

    case 'help':
    case '?':
      return {
        result: {
          output:
            `Commands available:\n` +
            `  ls, dir       List files\n` +
            `  get           Download file\n` +
            `  help, ?       Show help\n` +
            `  quit, bye    Exit FTP`,
        },
        newState: state,
      };

    case 'bye':
    case 'quit':
    case 'exit':
      return {
        result: { output: `221 Goodbye.`, closeSession: true },
        newState: { ...state, connected: false, loggedIn: false },
      };

    default:
      if (cmd) {
        return {
          result: { output: `?Invalid command` },
          newState: state,
        };
      }

      return { result: { output: '' }, newState: state };
  }
}
