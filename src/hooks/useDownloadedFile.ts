// ── hooks/useDownloadedFile.ts ─────────────────────────────────────
// Persiste en el filesystem del atacante los archivos descargados vía
// ftp/scp/wget/curl y añade una entrada al historial de la terminal.

import type { Machine, CommandResponse } from '../types';
import { useScenarioStore } from '../store/scenarioStore';
import type { HistoryEntry } from './processCommandResult';

interface UseDownloadedFileOptions {
  attackerMachineId: string;
  allMachines: Machine[];
  language: 'es' | 'en';
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
}

export function useDownloadedFile({ attackerMachineId, language, setHistory }: UseDownloadedFileOptions) {
  /**
   * Procesa el campo `downloadedFile` de un CommandResponse.
   * `getPrompt` se resuelve en el momento de añadir al historial.
   */
  const handleDownloadedFile = (result: CommandResponse, getPrompt: () => string) => {
    if (!('downloadedFile' in result) || !result.downloadedFile) return;
    const df = result.downloadedFile;

    let filePath = df.path;
    if (filePath.includes('nota.txt') || filePath.includes('note.txt')) {
      const fileName = filePath.split('/').pop() || '';
      filePath = `/root/${fileName}`;
    }

    useScenarioStore.getState().addFileToMachine(attackerMachineId, {
      path: filePath,
      content: df.content || '',
      type: df.type || 'text',
      ...(df.owner ? { owner: df.owner } : {}),
      ...(df.group ? { group: df.group } : {}),
      ...(df.mode !== undefined ? { mode: df.mode } : {}),
    });

    const fileName = filePath.split('/').pop();
    setHistory(prev => [...prev, {
      command: null,
      output: language === 'es' ? `Archivo descargado: ${fileName}` : `File downloaded: ${fileName}`,
      streaming: false,
      prompt: getPrompt(),
      timestamp: Date.now(),
    }]);
  };

  return { handleDownloadedFile };
}
