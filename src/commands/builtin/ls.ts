// ── commands/builtin/ls.ts ────────────────────────────────────────
// Comando ls: Lista archivos y directorios en el directorio actual
// Soporta flags -l (formato largo) y -a (archivos ocultos)
// Reconoce directorios marcados con archivos .dir

import type { CommandContext, CommandResponse } from '../../types';

// Genera tamaños de archivo determinísticos (no aleatorios)
// Usa un hash simple del path para generar un tamaño consistente
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
// Normaliza el path para que siempre termine con /
function getCurrentDir(path: string | undefined): string {
  if (!path) return '/';
  if (path === '/') return '/';
  // Asegurarse de que termine con /
  return path.endsWith('/') ? path : path + '/';
}

// Helper para extraer el nombre del archivo desde un path
// Retorna solo el nombre del archivo sin la ruta
function getBaseName(path: string): string {
  return path.split('/').filter(Boolean).pop() || path;
}

// Helper para verificar si un path es un directorio
// Verifica si existe un archivo .dir para este path o si contiene subdirectorios
function isDirectory(filePath: string, allFiles: { path: string }[]): boolean {
  // Verificar si existe un archivo .dir para este path
  const hasDirMarker = allFiles.some(f => f.path === filePath + '/.dir' || f.path === filePath + '.dir');
  if (hasDirMarker) return true;
  
  // Verificar si algún archivo está dentro de este directorio
  const normalizedPath = filePath.endsWith('/') ? filePath : filePath + '/';
  return allFiles.some(f => f.path.startsWith(normalizedPath) && f.path !== filePath);
}

export const cmd_ls = {
  name: 'ls',
  execute: (args: string[], { machine, currentDir }: CommandContext): CommandResponse => {
    if (!machine.files) machine.files = [];
    
    // Separar flags y directorio
    let showAll = false;
    let showLong = false;
    let targetDir = getCurrentDir(currentDir || '/');
    
    // Parsear argumentos correctamente
    args.forEach(arg => {
      if (arg.startsWith('-')) {
        // Es un flag - puede ser -l, -a, -la, -al, etc.
        if (arg.includes('a')) showAll = true;
        if (arg.includes('l')) showLong = true;
      } else {
        // Es un directorio
        targetDir = getCurrentDir(arg);
      }
    });
    
    // Si no se pasa argumento, usar el directorio actual
    if (!args[0]) {
      targetDir = getCurrentDir(currentDir || '/');
    }

    // Filtrar archivos en el directorio
    const items = new Map<string, { isDir: boolean; size: number }>();
    
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
          if (dir && dir !== '.dir') {
            // Filtrar archivos ocultos si no se usa -a
            if (!showAll && dir.startsWith('.')) return;
            const fullPath = targetDir + dir;
            if (!items.has(dir)) {
              items.set(dir, { isDir: true, size: 4096 });
            }
          }
        } else if (relativePath && relativePath !== '.dir') {
          // Es un archivo directo en este directorio
          // Verificar si es un marcador de directorio
          if (relativePath.endsWith('.dir')) {
            const dirName = relativePath.slice(0, -4);
            // Filtrar archivos ocultos si no se usa -a
            if (!showAll && dirName.startsWith('.')) return;
            if (!items.has(dirName)) {
              items.set(dirName, { isDir: true, size: 4096 });
            }
          } else {
            // Filtrar archivos ocultos si no se usa -a
            if (!showAll && relativePath.startsWith('.')) return;
            items.set(relativePath, { isDir: false, size: stableSize(targetDir + relativePath) });
          }
        }
      }
    });
    
    // Verificar directorios por marcadores .dir en el directorio actual
    machine.files.forEach(file => {
      const filePath = file.path;
      // Buscar archivos .dir que indiquen directorios
      if (filePath.endsWith('/.dir')) {
        const dirPath = filePath.slice(0, -5); // Quitar /.dir (5 chars, incluyendo la barra)
        const dirName = getBaseName(dirPath);
        const parentDir = dirPath.slice(0, dirPath.lastIndexOf('/') + 1);
        
        // Si el directorio padre coincide con el directorio objetivo
        if (parentDir === targetDir && dirName) {
          // Filtrar archivos ocultos si no se usa -a
          if (!showAll && dirName.startsWith('.')) return;
          if (!items.has(dirName)) {
            items.set(dirName, { isDir: true, size: 4096 });
          }
        }
      }
    });
    
    // Si no hay archivos en este directorio, devolver vacío o "total 0" según el modo
    if (items.size === 0) {
      if (showLong) return { output: 'total 0' };
      return { output: '' };
    }
    
    // Construir output según el modo
    if (showLong) {
      // Formato largo con permisos, propietario, tamaño, fecha
      let out = `total ${items.size * 4}\n`;
      Array.from(items.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([name, info]) => {
          if (info.isDir) {
            // Es directorio
            out += `drwxr-xr-x  2 root   root   ${info.size} Jan 01 00:00 ${name}/\n`;
          } else {
            // Es archivo
            out += `-rw-r--r--  1 admin  admin  ${info.size} Jan 01 00:00 ${name}\n`;
          }
        });
      return { output: out };
    } else {
      // Formato simple: solo nombres
      const names = Array.from(items.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, info]) => info.isDir ? `${name}/` : name);
      return { output: names.join('  ') };
    }
  }
};
