// ── utils/fileRead.ts ──────────────────────────────────────────────
// Metadata compartida de lectura de archivos. `cat` la emite y los
// editores (nano, futuros vim/vi) la reutilizan: así leer flags/notas/
// payloads con cualquier herramienta valida la misión del laboratorio.

import type { Machine, FileEntry, FileReadData, PossibleUsersData } from '../types';

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

// Patrón canónico de flag (formato ZIL/THM/FLAG{...}). Único punto de
// verdad: lo usan cat/nano (metadata) y el validador de descargas.
export function isFlagContent(content: string): boolean {
  return /(?:ZIL|THM|FLAG)\{[^}]+\}/.test(content);
}

// Construye la metadata `fileRead` (+ possibleUsers) a partir del archivo
// ya resuelto (symlinks seguidos). Si el archivo no es flag/nota/payload y
// no menciona usuarios, igual devuelve fileRead (fileType 'any' valida).
export function buildFileReadMetadata(
  machine: Machine,
  allMachines: Machine[],
  resolved: FileEntry,
): { fileRead: FileReadData; possibleUsers?: PossibleUsersData } {
  const isNote = resolved.path.endsWith('note.txt') || resolved.path.endsWith('nota.txt');
  // Un flag se detecta SOLO por su contenido (formato ZIL/THM/FLAG{...}):
  // el nombre del archivo no basta, si no cualquier archivo llamado
  // "mi-flag.txt" completaría la misión de capturar la flag.
  const isFlag = isFlagContent(resolved.content);
  const isPayload = resolved.path.includes('payload');
  const mentionedUsers = extractMentionedUsers(resolved.content);

  return {
    fileRead: {
      path: resolved.path,
      machineId: machine.id,
      isNote,
      isFlag,
      isPayload,
      content: resolved.content,
    },
    ...(mentionedUsers.length > 0 && {
      possibleUsers: {
        // Si estamos en el atacante, los usuarios pertenecen a la máquina
        // objetivo del lab; si estamos en una máquina objetivo, a ella misma.
        machineId: (machine.id.includes('attacker') && allMachines)
          ? (allMachines.find(m => !m.id.includes('attacker'))?.id || machine.id)
          : machine.id,
        users: mentionedUsers,
      },
    }),
  };
}
