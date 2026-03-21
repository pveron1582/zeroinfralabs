// ── commands/builtin/ls.ts ────────────────────────────────────────
// Lista archivos en el directorio actual

import type { CommandContext, CommandResponse } from '../../types';

// Stable file sizes (deterministic, no Math.random)
const FILE_SIZE_SEED: Record<string, number> = {};
function stableSize(path: string): number {
  if (!FILE_SIZE_SEED[path]) {
    let h = 0;
    for (let i = 0; i < path.length; i++) h = ((h << 5) - h + path.charCodeAt(i)) | 0;
    FILE_SIZE_SEED[path] = Math.abs(h % 900) + 100;
  }
  return FILE_SIZE_SEED[path];
}

// Helper para extraer el directorio actual
function getCurrentDir(path: string | undefined): string {
  if (!path) return '/';
  if (path === '/') return '/';
  // Asegurarse de que termine con /
  return path.endsWith('/') ? path : path + '/';
}

// Helper para extraer el nombre del archivo desde un path
function getBaseName(path: string): string {
  return path.split('/').filter(Boolean).pop() || path;
}

export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], { machine }: CommandContext): CommandResponse => {
    if (!machine.files) machine.files = [];
    
    // Si no se pasa argumento, listar todos los archivos (comportamiento antiguo para compatibilidad)
    if (!args[0]) {
      if (!machine.files.length) return { output: 'total 0' };
      let out = `total ${machine.files.length * 4}\n`;
      machine.files.forEach(f => {
        const name = f.path.split('/').pop()!;
        out += `-rw-r--r-- 1 admin admin ${stableSize(f.path)} Jan 01 00:00 ${name}\n`;
      });
      return { output: out };
    }

    // Si se pasa un argumento (directorio), filtrar archivos en ese directorio
    const targetDir = getCurrentDir(args[0]);
    const items = new Set<string>();
    
    // Procesar los paths de los archivos para extraer directorios y archivos
    machine.files.forEach(file => {
      const filePath = file.path;
      
      // Si el archivo está en el directorio solicitado
      if (filePath.startsWith(targetDir)) {
        // Obtener la ruta relativa
        const relativePath = filePath.slice(targetDir.length);
        
        // Si contiene /, es un subdirectorio
        if (relativePath.includes('/')) {
          const dir = relativePath.split('/')[0];
          items.add(dir + '/');
        } else if (relativePath) {
          // Es un archivo directo en este directorio
          items.add(relativePath);
        }
      }
    });
    
    // Si no hay archivos en este directorio, devolver "total 0"
    if (items.size === 0) return { output: 'total 0' };
    
    // Construir output estilo Linux
    let out = `total ${items.size * 4}\n`;
    Array.from(items).sort().forEach(item => {
      if (item.endsWith('/')) {
        // Es directorio
        out += `drwxr-xr-x  2 root   root   4096 Jan 01 00:00 ${item}\n`;
      } else {
        // Es archivo
        out += `-rw-r--r--  1 admin  admin  ${stableSize(targetDir + item)} Jan 01 00:00 ${item}\n`;
      }
    });
    
    return { output: out };
  }
};
