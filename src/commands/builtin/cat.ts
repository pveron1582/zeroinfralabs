// ── commands/builtin/cat.ts ───────────────────────────────────────
// Muestra contenido de archivos

import type { CommandContext, CommandResponse } from '../../types';

// Helper para normalizar paths
function normalizePath(filePath: string): string {
  let normalized = filePath.replace(/^\.\//, '');
  if (normalized.endsWith('/')) {
    return normalized;
  }
  return normalized;
}

export const cmd_cat = {
  name: 'cat',
  execute: (args: string[], { machine, allMachines }: CommandContext): CommandResponse => {
    if (!args[0]) return { output: 'usage: cat <file>', isError: true };

    const requestedPath = normalizePath(args[0]);

    if (requestedPath.endsWith('/')) {
      return { output: `cat: ${args[0]}: Is a directory`, isError: true };
    }

    const file = machine.files?.find(f => {
      if (f.path === requestedPath) return true;
      if (f.path === args[0]) return true;
      if (f.path.endsWith('/' + requestedPath)) return true;
      if (f.path.endsWith('/' + args[0])) return true;
      return false;
    });

    if (!file) {
      return { output: `cat: ${args[0]}: No such file or directory`, isError: true };
    }

    // Detect mission completion based on file type
    let completedMissionId: number | undefined;
    const isPayload = file.path === '/root/payload.php';
    const isFlag = file.path === '/root/root.txt' || file.path === '/root/flag.txt' || file.path === '/root/flag2.txt' || file.path === '/home/admin/user.txt' || file.path === '/home/gonzalo/flag.txt' || file.path === '/var/www/html/flag.txt';
    const isNote = file.path.endsWith('note.txt') || file.path.endsWith('nota.txt');

    if (isNote && file.content.toLowerCase().includes('john')) {
      for (const m of allMachines) {
        const step = m.learning_steps.find(s => {
          const lTask = (s.task || '').toLowerCase();
          const lText = (s.text || '').toLowerCase();
          return (lTask.includes('read') || lTask.includes('leer'))
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
          const lHint2 = s.hints?.hint2?.en?.toLowerCase() || '';
          if (isPayload) {
            return (lTask.includes('payload') || lText.includes('payload') || lHint2.includes('payload'))
              && (lText.includes('cat') || lHint2.includes('cat'));
          }
          if (isFlag) {
            return lTask.includes('flag') || lTask.includes('capturar') || lText.includes('/root/root.txt') || lText.includes('/root/flag.txt') || lText.includes('/root/flag2.txt') || lText.includes('/home/gonzalo/flag.txt') || lText.includes('/var/www/html/flag.txt');
          }
          return false;
        });
        if (step) { completedMissionId = step.id; break; }
      }
    }

    return { output: file.content, completedMissionId };
  }
};
