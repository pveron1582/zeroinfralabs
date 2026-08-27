// ── utils/validators/filesystem.ts ───────────────────────────────
// Validadores de filesystem: lectura de archivos y descargas.

import type { CommandResponse, Mission, ValidationCriteria } from '../../types';
import { isFlagContent } from '../fileRead';

export function validateFileRead(
  _mission: Mission,
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const fileRead = 'fileRead' in result ? result.fileRead : undefined;
  if (!fileRead) return false;

  // NOTA: NO se exige que la lectura ocurra en mission.targetMachineId:
  // los labs permiten leer flags descargadas en la máquina atacante
  // (ej. lab06: cat del database_dump exfiltrado). El false positivo de
  // C2 se elimina aguas arriba: isFlag solo se marca por CONTENIDO con
  // formato ZIL/THM/FLAG{...} (ver utils/fileRead.ts).

  const fileType = conditions.fileType ?? 'any';

  switch (fileType) {
    case 'flag':
      return fileRead.isFlag === true;
    case 'payload':
      return fileRead.isPayload === true;
    case 'note':
      return fileRead.isNote === true;
    case 'any':
    default:
      return true;
  }
}

export function validateFileDownloaded(
  _mission: Mission,
  result: CommandResponse,
  conditions: Partial<ValidationCriteria>
): boolean {
  const downloadedFile = 'downloadedFile' in result ? result.downloadedFile : undefined;
  if (!downloadedFile) return false;

  const fileType = conditions.fileType ?? 'any';

  if (fileType === 'note') {
    const filename = downloadedFile.path.toLowerCase();
    return filename.includes('note') || filename.includes('nota');
  }

  if (fileType === 'flag') {
    // Igual criterio que fileRead: el contenido manda; el nombre solo
    // como fallback (archivos user.txt/root.txt sin formato FLAG{...}).
    return isFlagContent(downloadedFile.content) ||
      downloadedFile.path.toLowerCase().includes('flag');
  }

  return true;
}
