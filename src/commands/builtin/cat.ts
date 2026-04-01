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

    // Si es /root/root.txt o /root/payload.php, buscar la misión de inspeccionar/capturar
    // O si es note.txt/nota.txt (la nota del FTP), buscar la misión de leer nota
    let completedMissionId: number | undefined;
    const isPayload = file.path === '/root/payload.php';
    const isFlag = file.path === '/root/root.txt';
    const isNote = file.path.endsWith('note.txt') || file.path.endsWith('nota.txt');
    
    // Si es una nota y el contenido tiene "john", completar la misión de leer nota
    if (isNote && content.toLowerCase().includes('john')) {
      for (const m of allMachines) {
        const step = m.learning_steps.find(s => {
          const lTask = (s.task || '').toLowerCase();
          const lText = (s.text || '').toLowerCase();
          return (lTask.includes('read') || lTask.includes('leer') || lTask.includes('read note') || lTask.includes('leer nota'))
            && (lText.includes('cat') || lText.includes('nota') || lText.includes('note'));
        });
        if (step) { completedMissionId = step.id; break; }
      }
    }
    
    if (isPayload || isFlag) {
      for (const m of allMachines) {
        const step = m.learning_steps.find(s => {
          const lTask = s.task.toLowerCase();
          const lText = s.text.toLowerCase();
          if (isPayload) {
            return (lTask.includes('payload') || lText.includes('payload.php')) && lText.includes('cat');
          }
          if (isFlag) {
            return lTask.includes('flag') || lTask.includes('capturar') || lText.includes('/root/root.txt');
          }
          return false;
        });
        if (step) { completedMissionId = step.id; break; }
      }
    }

    return { output: content, completedMissionId };
  }
};
