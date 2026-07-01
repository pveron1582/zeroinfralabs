// ── commands/builtin/cd.ts ────────────────────────────────────────
// Cambia el directorio actual

import type { CommandContext, CommandResponse } from '../../types';

// Determina el usuario actual desde la máquina (misma lógica que useTerminalIdentity)
function getCurrentUser(machine: CommandContext['machine']): string {
  if (machine.id.includes('attacker')) return 'root';

  if (machine.found_credentials) {
    const rceCred = machine.found_credentials.find(c => c.service === 'reverse-shell');
    if (rceCred) return rceCred.user;
    if (machine.privesc_completed) return 'root';
    const sshCred = machine.found_credentials.find(c => c.service === 'ssh' && c.verified);
    if (sshCred) return sshCred.user;
    const verified = machine.found_credentials.find(c => c.verified);
    if (verified) return verified.user;
  }

  const sshPort = machine.scan_results?.ports?.find(p => p.service === 'ssh');
  if (sshPort?.credentials?.user) return sshPort.credentials.user;

  return 'user';
}

function isRoot(machine: CommandContext['machine']): boolean {
  return machine.id.includes('attacker') || getCurrentUser(machine) === 'root' || !!machine.privesc_completed;
}

export const cmd_cd = {
  name: 'cd',
  execute: (args: string[], { machine, currentDir, setCurrentDir }: CommandContext): CommandResponse => {
    const currentUser = getCurrentUser(machine);
    const isRootUser = isRoot(machine);
    const homeDir = isRootUser ? '/root' : `/home/${currentUser}`;

    // Si no hay archivos, no se puede navegar
    if (!machine.files || machine.files.length === 0) {
      return { output: `cd: ${homeDir}: No such file or directory`, isError: true };
    }

    const target = args[0] || homeDir;

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
      resolvedPath = normalizeDir(homeDir);
    } else if (target.startsWith('/')) {
      // Path absoluto
      resolvedPath = normalizeDir(target);
    } else if (target.startsWith('~')) {
      if (target === '~' || target === '~/') {
        resolvedPath = normalizeDir(homeDir);
      } else {
        resolvedPath = normalizeDir(homeDir + '/' + target.slice(2).replace(/^\//, ''));
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
    const knownDirs = ['/', '/home/', `/home/${currentUser}/`, '/home/kali/', '/etc/', '/var/', '/var/www/', '/var/www/html/', '/tmp/', '/root/', '/usr/', '/usr/bin/', '/usr/share/', '/usr/share/wordlists/', '/opt/'];
    
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
