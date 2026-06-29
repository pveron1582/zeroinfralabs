// ── commands/builtin/cat.ts ───────────────────────────────────────
// Muestra contenido de archivos
// Solo lee archivos y reporta metadata para que el laboratorio valide.

import type { CommandContext, CommandResponse } from '../../types';

// Helper para normalizar paths
function normalizePath(filePath: string): string {
  let normalized = filePath.replace(/^\.\//, '');
  if (normalized.endsWith('/')) {
    return normalized;
  }
  return normalized;
}

// Detecta usuarios mencionados en el contenido
function extractMentionedUsers(content: string): string[] {
  const users = new Set<string>();
  const patterns = [
    // Restringido con límites de palabra para evitar falsos positivos
    /\b(?:Para|To|user|username|login|usuario|credenciales)\b\s*[:=]?\s*([a-zA-Z0-9_]+)/gi,
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const user = match[1];
      // Filtrar palabras comunes que podrían ser falsos positivos y nombres demasiado cortos o largos
      if (user && user.length >= 3 && !['root', 'esta', 'equipo', 'seguridad', 'equipo'].includes(user.toLowerCase())) {
        users.add(user);
      }
    }
  }

  return Array.from(users);
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

    // Extraer usuarios mencionados (para que el lab detecte credenciales)
    const mentionedUsers = extractMentionedUsers(file.content);
    
    // Detectar tipo de archivo para que el lab valide
    const isNote = file.path.endsWith('note.txt') || file.path.endsWith('nota.txt');
    const isFlag = file.path.includes('flag') || file.path.includes('root.txt') || file.path.includes('user.txt');
    const isPayload = file.path.includes('payload');

    return {
      output: file.content,
      // Metadata para que el laboratorio valide
      fileRead: {
        path: file.path,
        isNote,
        isFlag,
        isPayload,
        content: file.content,
      },
      // Usuarios mencionados en el archivo. El consumidor es Terminal.tsx,
      // que llama a setPossibleUsers(machineId, users) y los refleja en
      // Machine.possible_ssh_users (visible en EnumerationPanel).
      ...(mentionedUsers.length > 0 && {
        possibleUsers: {
          // Si estamos en el atacante, los usuarios pertenecen a la máquina objetivo del lab
          // Si estamos en una máquina objetivo, los usuarios pertenecen a ella misma
          machineId: (machine.id.includes('attacker') && allMachines)
            ? (allMachines.find(m => !m.id.includes('attacker'))?.id || machine.id)
            : machine.id,
          users: mentionedUsers,
        }
      }),
    };
  }
};
