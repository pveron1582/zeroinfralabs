// ── commands/builtin/cd.ts ────────────────────────────────────────
// Cambia el directorio actual

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_cd = {
  name: 'cd',
  execute: (args: string[], { machine, currentDir, setCurrentDir }: CommandContext): CommandResponse => {
    const target = args[0] || '/home/user';
    
    // Si no hay archivos, no se puede navegar
    if (!machine.files || machine.files.length === 0) {
      return { output: `cd: ${target}: No such file or directory`, isError: true };
    }

    // Determinar si es usuario root
    const isRootUser = machine.id.includes('attacker') || 
      machine.found_credentials?.some(c => c.service === 'ssh' && c.verified && c.user === 'root') ||
      machine.privesc_completed;

    // Normalizar el directorio actual
    const normalizeDir = (dir: string): string => {
      if (!dir) return '/';
      return dir.endsWith('/') ? dir : dir + '/';
    };

    // Resolver el path objetivo
    let resolvedPath: string;
    
    if (target === '/') {
      resolvedPath = '/';
    } else if (target === '..') {
      // Subir un nivel
      const parts = currentDir.split('/').filter(Boolean);
      parts.pop();
      resolvedPath = parts.length === 0 ? '/' : '/' + parts.join('/') + '/';
    } else if (target === '~' || target === '') {
      // Home directory - depende del usuario
      resolvedPath = isRootUser ? '/root/' : '/home/user/';
    } else if (target.startsWith('/')) {
      // Path absoluto
      resolvedPath = normalizeDir(target);
    } else if (target.startsWith('~')) {
      // Para usuario root, ~/root no es válido - debe ser /root
      if (isRootUser && target === '~') {
        resolvedPath = '/root/';
      } else if (isRootUser && target.startsWith('~/')) {
        // ~/ algo para root va a /root/ algo, pero ~/root es invalido
        if (target.slice(2).replace(/^\//, '') === 'root') {
          return { output: `cd: ${target}: No such file or directory`, isError: true };
        }
        resolvedPath = '/root/' + target.slice(2).replace(/^\//, '');
        resolvedPath = normalizeDir(resolvedPath);
      } else {
        resolvedPath = '/home/user/' + target.slice(2).replace(/^\//, '');
        resolvedPath = normalizeDir(resolvedPath);
      }
    } else {
      // Path relativo al directorio actual
      resolvedPath = normalizeDir(currentDir + target);
    }

    // Normalizar el path (remover ./ y ../)
    const parts = resolvedPath.split('/').filter(Boolean);
    const normalized: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        normalized.pop();
      } else if (part !== '.') {
        normalized.push(part);
      }
    }
    resolvedPath = normalized.length === 0 ? '/' : '/' + normalized.join('/') + '/';

    // Verificar si el directorio existe (tiene archivos dentro o es un directorio conocido)
    const knownDirs = ['/', '/home/', '/home/user/', '/home/kali/', '/etc/', '/var/', '/var/www/', '/var/www/html/', '/tmp/', '/root/', '/usr/', '/usr/bin/', '/usr/share/', '/usr/share/wordlists/', '/opt/'];
    
    const hasFilesInDir = machine.files.some(f => {
      const filePath = f.path;
      return filePath.startsWith(resolvedPath) || filePath === resolvedPath.slice(0, -1);
    });

    if (!hasFilesInDir && !knownDirs.includes(resolvedPath)) {
      return { output: `cd: ${target}: No such file or directory`, isError: true };
    }

    // Actualizar el directorio actual
    if (setCurrentDir) {
      setCurrentDir(resolvedPath);
    }

    return { output: '' };
  }
};
