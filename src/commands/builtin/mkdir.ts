// ── commands/builtin/mkdir.ts ───────────────────────────────────────
// Comando mkdir - Crear directorios

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_mkdir = {
  name: 'mkdir',
  description: 'Create directories',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    const { currentDir, machine } = context;

    if (args.length === 0) {
      return {
        output: 'usage: mkdir [-p] directory_name...\n  -p  create parent directories as needed',
        isError: true,
      };
    }

    let createParents = false;
    let directories: string[] = [];

    // Parsear argumentos
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-p') {
        createParents = true;
      } else if (arg.startsWith('-')) {
        return {
          output: `mkdir: invalid option -- '${arg.slice(1)}'\nTry 'mkdir --help' for more information.`,
          isError: true,
        };
      } else {
        directories.push(arg);
      }
    }

    if (directories.length === 0) {
      return {
        output: 'mkdir: missing operand\nTry \'mkdir --help\' for more information.',
        isError: true,
      };
    }

    // Verificar permisos (solo root puede crear en /var, /etc, etc.)
    const sshUser = (machine.found_credentials as any)?.user || 'user';
    const isRoot = sshUser === 'root' || machine.id === 'attacker-01';

    const results: string[] = [];

    for (const dir of directories) {
      try {
        // Determinar la ruta completa
        let fullPath: string;
        
        if (dir === '/') {
          fullPath = '/';
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
            normalized.pop();
          } else if (part !== '.') {
            normalized.push(part);
          }
        }
        fullPath = normalized.length === 0 ? '/' : '/' + normalized.join('/') + '/';

        // Verificar si ya existe
        const dirExists = machine.files.some(f => f.path === fullPath + '.dir');
        if (dirExists) {
          results.push(`mkdir: cannot create directory '${dir}': File exists`);
          continue;
        }

        // Verificar permisos para directorios del sistema
        if (!isRoot) {
          const systemDirs = ['/bin', '/boot', '/dev', '/etc', '/lib', '/lib64', '/proc', '/root', '/sbin', '/srv', '/sys', '/usr', '/var'];
          const isSystemDir = systemDirs.some(sysDir => fullPath.startsWith(sysDir));
          if (isSystemDir && !fullPath.startsWith('/home') && !fullPath.startsWith('/tmp')) {
            results.push(`mkdir: cannot create directory '${dir}': Permission denied`);
            continue;
          }
        }

        // Crear directorio(s)
        if (createParents) {
          // Con -p: crear todos los directorios padres necesarios
          const parts = fullPath.split('/').filter(p => p);
          let currentPath = '';
          
          for (const part of parts) {
            currentPath += '/' + part;
            const parentPath = currentPath.slice(0, -part.length - 1) || '/';
            const parentItems = machine.files.filter(f => f.path.startsWith(parentPath));
            const dirExists = parentItems.some((f: any) => f.path === currentPath + '.dir');
            
            if (!dirExists) {
              // Agregar directorio al sistema de archivos
              machine.files.push({
                path: currentPath + '/.dir',
                content: '',
                type: 'text'
              });
            }
          }
        } else {
          // Sin -p: crear directorio final, los padres deben existir
          // Para paths relativos, no verificar padres (asumir directorio actual existe)
          // Para paths absolutos, sí verificar padres
          
          // Verificar si el directorio ya existe
          const dirExists = machine.files.some(f => f.path === fullPath + '.dir');
          if (dirExists) {
            results.push(`mkdir: cannot create directory '${dir}': File exists`);
            continue;
          }

          // Verificar permisos para directorios del sistema
          if (!isRoot) {
            const systemDirs = ['/bin', '/boot', '/dev', '/etc', '/lib', '/lib64', '/proc', '/root', '/sbin', '/srv', '/sys', '/usr', '/var'];
            const isSystemDir = systemDirs.some(sysDir => fullPath.startsWith(sysDir));
            if (isSystemDir && !fullPath.startsWith('/home') && !fullPath.startsWith('/tmp')) {
              results.push(`mkdir: cannot create directory '${dir}': Permission denied`);
              continue;
            }
          }

          // Verificar padres solo para paths absolutos
          if (dir.startsWith('/')) {
            // Path absoluto: verificar que todos los directorios padres existan
            const parts = fullPath.split('/').filter(p => p);
            let currentPath = '';
            
            // Verificar cada directorio padre
            for (let i = 0; i < parts.length - 1; i++) {
              currentPath += '/' + parts[i];
              // Asegurar que el path termine con / para verificar el directorio
              const checkPath = currentPath.endsWith('/') ? currentPath : currentPath + '/';
              const parentExists = machine.files.some(f => f.path === checkPath + '.dir');
              
              if (!parentExists) {
                results.push(`mkdir: cannot create directory '${dir}': No such file or directory`);
                continue;
              }
            }
          }
          // Para paths relativos, no verificar padres (asumir directorio actual existe)

          // Crear el directorio final
          machine.files.push({
            path: fullPath + '.dir',
            content: '',
            type: 'text'
          });
        }

      } catch (error) {
        results.push(`mkdir: cannot create directory '${dir}': ${error}`);
      }
    }

    return {
      output: results.length > 0 ? results.join('\n') : '',
      isError: results.length > 0,
    };
  },
};
