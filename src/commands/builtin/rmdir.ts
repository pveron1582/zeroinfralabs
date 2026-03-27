// ── commands/builtin/rmdir.ts ───────────────────────────────────────
// Comando rmdir - Eliminar directorios vacíos

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_rmdir = {
  name: 'rmdir',
  description: 'Remove empty directories',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length === 0) {
      return {
        output: 'usage: rmdir [-p] directory...\n  -p  remove parent directories as needed',
        isError: true,
      };
    }

    let removeParents = false;
    let directories: string[] = [];

    // Parsear argumentos
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-p') {
        removeParents = true;
      } else if (arg.startsWith('-')) {
        return {
          output: `rmdir: invalid option -- '${arg.slice(1)}'\nTry 'rmdir --help' for more information.`,
          isError: true,
        };
      } else {
        directories.push(arg);
      }
    }

    if (directories.length === 0) {
      return {
        output: 'rmdir: missing operand\nTry \'rmdir --help\' for more information.',
        isError: true,
      };
    }

    // Verificar permisos (solo root puede eliminar en /var, /etc, etc.)
    const sshUser = (machine.found_credentials as any)?.user || 'user';
    const isRoot = sshUser === 'root' || machine.id === 'attacker-01';

    const results: string[] = [];

    for (const dir of directories) {
      try {
        // Determinar la ruta completa
        let fullPath: string;
        
        if (dir === '/') {
          results.push(`rmdir: failed to remove '${dir}': Invalid argument`);
          continue;
        } else if (dir.startsWith('/')) {
          // Path absoluto
          fullPath = dir.endsWith('/') ? dir : dir + '/';
        } else if (dir.startsWith('~')) {
          // Path relativo a home
          fullPath = '/home/' + sshUser + '/' + dir.slice(2).replace(/^\//, '');
          fullPath = fullPath.endsWith('/') ? fullPath : fullPath + '/';
        } else {
          // Path relativo al directorio actual
          const baseDir = currentDir || '/';
          fullPath = baseDir + dir;
          fullPath = fullPath.endsWith('/') ? fullPath : fullPath + '/';
        }

        // Normalizar el path (remover ./ y ../)
        const parts = fullPath.split('/').filter(Boolean);
        const normalized: string[] = [];
        for (const part of parts) {
          if (part === '..') {
            if (normalized.length > 0) {
              normalized.pop();
            }
          } else if (part !== '.') {
            normalized.push(part);
          }
        }
        fullPath = normalized.length === 0 ? '/' : '/' + normalized.join('/') + '/';

        // Verificar si el directorio existe
        const dirExists = machine.files.some(f => f.path === fullPath + '.dir');
        if (!dirExists) {
          results.push(`rmdir: failed to remove '${dir}': No such file or directory`);
          continue;
        }

        // Verificar permisos para directorios del sistema
        if (!isRoot) {
          const systemDirs = ['/bin', '/boot', '/dev', '/etc', '/lib', '/lib64', '/proc', '/root', '/sbin', '/srv', '/sys', '/usr', '/var'];
          const isSystemDir = systemDirs.some(sysDir => fullPath.startsWith(sysDir));
          if (isSystemDir && !fullPath.startsWith('/home') && !fullPath.startsWith('/tmp')) {
            results.push(`rmdir: failed to remove '${dir}': Permission denied`);
            continue;
          }
        }

        // Verificar si el directorio está vacío
        const filesInDir = machine.files.filter(f => 
          f.path.startsWith(fullPath) && f.path !== fullPath + '.dir'
        );
        
        if (filesInDir.length > 0) {
          results.push(`rmdir: failed to remove '${dir}': Directory not empty`);
          continue;
        }

        // Eliminar directorio(s)
        if (removeParents) {
          // Con -p: eliminar directorios padres si quedan vacíos
          const parts = fullPath.split('/').filter(p => p);
          const pathsToCheck: string[] = [];

          // Construir lista de paths a verificar (del más profundo al más superficial)
          for (let i = parts.length; i > 0; i--) {
            const currentPath = '/' + parts.slice(0, i).join('/') + '/';
            pathsToCheck.push(currentPath);
          }

          // Eliminar directorios en orden (del más profundo al más superficial)
          for (const pathToRemove of pathsToCheck) {
            // Verificar si este directorio existe y está vacío
            const dirIndex = machine.files.findIndex(f => f.path === pathToRemove + '.dir');
            if (dirIndex === -1) continue; // No existe, saltar

            // Verificar si hay archivos en este directorio (excluyendo el .dir del directorio mismo)
            // Buscar archivos que empiecen con este path pero que no sean el .dir del directorio
            const filesInDir = machine.files.filter(f => {
              // Es un archivo/directorio dentro de este directorio
              if (!f.path.startsWith(pathToRemove)) return false;
              // No contar el propio .dir del directorio
              if (f.path === pathToRemove + '.dir') return false;
              return true;
            });

            if (filesInDir.length === 0) {
              // El directorio está vacío, eliminarlo
              machine.files.splice(dirIndex, 1);
            } else {
              // Hay archivos, no podemos eliminar más padres
              break;
            }
          }
        } else {
          // Sin -p: solo eliminar el directorio especificado
          const index = machine.files.findIndex(f => f.path === fullPath + '.dir');
          if (index !== -1) {
            machine.files.splice(index, 1);
          }
        }

      } catch (error) {
        results.push(`rmdir: failed to remove '${dir}': ${error}`);
      }
    }

    return {
      output: results.length > 0 ? results.join('\n') : '',
      isError: results.length > 0,
    };
  },
};