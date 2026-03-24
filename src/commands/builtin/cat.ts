// ── commands/builtin/cat.ts ───────────────────────────────────────
// Muestra contenido de archivos

import type { CommandContext, CommandResponse } from '../../types';

// Helper para normalizar paths
function normalizePath(filePath: string): string {
  // Remover ./ del inicio
  let normalized = filePath.replace(/^\.\//, '');
  // Si es un directorio (termina en /), error
  if (normalized.endsWith('/')) {
    return normalized;
  }
  return normalized;
}

export const cmd_cat = {
  name: 'cat',
  execute: (args: string[], { machine, listeningPort, allMachines }: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'uso: cat <archivo>', isError: true };

    const requestedPath = normalizePath(args[0]);

    // Si termina en /, es un directorio
    if (requestedPath.endsWith('/')) {
      return { output: `cat: ${args[0]}: Is a directory`, isError: true };
    }

    // Buscar el archivo
    const file = machine.files?.find(f => {
      // Búsqueda exacta
      if (f.path === requestedPath) return true;
      if (f.path === args[0]) return true;
      // Búsqueda por nombre (si el usuario solo proporciona el nombre)
      if (f.path.endsWith('/' + requestedPath)) return true;
      if (f.path.endsWith('/' + args[0])) return true;
      return false;
    });

    if (!file) {
      return { output: `cat: ${args[0]}: No such file or directory`, isError: true };
    }

    // Reemplazar LISTENER_PORT con el puerto real del listener si existe
    let content = file.content;
    if (listeningPort && file.path.includes('payload.php')) {
      content = content.replace(/LISTENER_PORT/g, String(listeningPort));
    }

    // Si es /root/root.txt, buscar la misión de capturar flag
    let completedMissionId: number | undefined;
    if (file.path === '/root/root.txt') {
      for (const m of allMachines) {
        const step = m.learning_steps.find(s =>
          s.task.toLowerCase().includes('flag') ||
          s.task.toLowerCase().includes('capturar') ||
          s.text.toLowerCase().includes('/root/root.txt')
        );
        if (step) { completedMissionId = step.id; break; }
      }
    }

    return { output: content, completedMissionId };
  }
};
