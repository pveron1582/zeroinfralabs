// ── hooks/useNanoSave.ts ───────────────────────────────────────────
// Lógica de guardado del editor nano con validación de permisos.
// Extraído de useCommandRunner para separar la lógica de filesystem de la UI.

import type { Machine } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import { normalizePath, resolvePath } from '../utils/path';
import { getCurrentUser, ROOT_USER } from '../utils/users';
import { canEditFile, canCreateInDir } from '../utils/permissions';
import { findFile, findParentDir, defaultOwnership, buildNewFile } from '../utils/fs';

interface NanoFileState {
  path: string;
  content: string;
  readOnly?: boolean;
  elevated?: boolean;
  existingSnapshot?: { owner: string; group: string; mode: number };
}

interface NanoSaveResult {
  success: boolean;
  error?: string;
  savedPath?: string;
}

interface UseNanoSaveOptions {
  machine: Machine;
  currentDir: string;
}

export function useNanoSave({ machine, currentDir }: UseNanoSaveOptions) {
  /**
   * Guarda un archivo abierto en nano. Realiza checks de permisos,
   * preserva owner/group/mode del archivo existente, y llama a
   * addFileToMachine para persistir el cambio.
   */
  const handleNanoSave = (
    nanoFile: NanoFileState | null,
    content: string,
    filenameToSave?: string
  ): NanoSaveResult => {
    if (!nanoFile) return { success: false, error: 'No file open' };
    const rawPath = filenameToSave || nanoFile.path;
    if (!rawPath.trim()) return { success: false, error: 'No filename specified' };

    // `sudo <editor>` elevó la identidad a root: los checks de permisos y el
    // ownership usan root, así un archivo restringido (p.ej. /etc/passwd) que
    // el usuario solo puede leer SÍ puede editarse y guardarse.
    const elevated = nanoFile.elevated === true;
    const currentUserObj = elevated ? ROOT_USER : getCurrentUser(machine);
    const homeDir = currentUserObj.home;

    const fullPath = normalizePath(resolvePath(rawPath, currentDir || '/', homeDir));
    const cleanPath = fullPath.endsWith('/') && fullPath.length > 1 ? fullPath.slice(0, -1) : fullPath;

    const existing = findFile(machine, cleanPath);
    if (!existing) {
      const parentDir = findParentDir(machine, cleanPath);
      if (!parentDir) {
        return { success: false, error: `nano: '${rawPath}': No such file or directory` };
      }
      if (!canCreateInDir(machine, parentDir, currentUserObj)) {
        return { success: false, error: `nano: '${rawPath}': Permission denied` };
      }
    } else {
      if (!canEditFile(machine, existing, currentUserObj)) {
        return { success: false, error: `nano: '${rawPath}': Permission denied` };
      }
    }

    const ownership = nanoFile.existingSnapshot ?? defaultOwnership(machine, currentUserObj, 0o644);

    useScenarioStore.getState().addFileToMachine(machine.id, buildNewFile(cleanPath, content, 'text', ownership));
    return { success: true, savedPath: cleanPath };
  };

  return { handleNanoSave };
}
