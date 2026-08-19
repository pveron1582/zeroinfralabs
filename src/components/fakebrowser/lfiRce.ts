// ── components/fakebrowser/lfiRce.ts ─────────────────────────────────
// Lógica del lab LFI (escenario 04) dentro del navegador: disparo de la
// reverse shell al visitar payload.php y manejo de subidas de archivos.
// Extraída de FakeBrowser.tsx para mantener el componente bajo 300 líneas.

import { useEffect, useRef, useCallback } from 'react';
import type { Machine, FileEntry } from '../../types';
import { useScenarioStore } from '../../store/scenarioStore';
import { findDirEntry, defaultOwnership, buildNewFile } from '../../utils/fs';
import { getUser } from '../../utils/users';

export function useLfiRceEffect(
  allMachines: Machine[],
  lfiMachine: Machine | undefined,
  currentUrl: string,
  onReportVulnerability?: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void,
) {
  const rceCompletedRef = useRef(false);
  const confirmRCE = useScenarioStore(state => state.confirmRCE);
  const listeningPort = useScenarioStore(state => state.listeningPort);
  const setBlockingCommand = useScenarioStore(state => state.setBlockingCommand);

  useEffect(() => {
    if (!lfiMachine) return;
    if (rceCompletedRef.current) return;
    if (!currentUrl.includes(lfiMachine.machine_info.ip)) return;
    const fullPath = currentUrl.replace(`http://${lfiMachine.machine_info.ip}`, '');
    // Only payload.php triggers RCE; any other file won't consume the listener
    const isPayloadPage = fullPath.includes('payload.php') && (fullPath.includes('?page=uploads/') || fullPath.includes('?page=files/'));
    if (!isPayloadPage) return;
    if (!listeningPort) return;
    rceCompletedRef.current = true;
    setBlockingCommand({
      message: '[*] Connection received from ' + lfiMachine.machine_info.ip + ' : shell opened!',
      listeningPort: 4444,
      connected: true
    });
    confirmRCE(lfiMachine.id, 'www-data', '/var/www/html/uploads/payload.php');
    onReportVulnerability?.(lfiMachine.id, 'LFI', 'confirmed');
  }, [currentUrl, lfiMachine, setBlockingCommand, listeningPort, confirmRCE, onReportVulnerability]);

  useEffect(() => {
    rceCompletedRef.current = false;
  }, [allMachines]);
}

interface LfiUploadDeps {
  lfiMachine: Machine | undefined;
  allMachines: Machine[];
  addFileToMachine: (machineId: string, file: FileEntry) => void;
  onMissionComplete: (id: number) => void;
  confirmRCE: (machineId: string, user: string, file: string) => void;
  onReportVulnerability?: (machineId: string, vulnId: string, status: 'detected' | 'confirmed') => void;
}

export function useLfiUploadHandler({ lfiMachine, allMachines, addFileToMachine, onMissionComplete, confirmRCE, onReportVulnerability }: LfiUploadDeps) {
  return useCallback((fileName: string) => {
    if (fileName === 'reverse_shell_triggered' || fileName === 'CHECKPOINT_RCE') {
      onMissionComplete(5);
      if (lfiMachine) {
        confirmRCE(lfiMachine.id, 'www-data', '/var/www/html/uploads/payload.php');
        onReportVulnerability?.(lfiMachine.id, 'LFI', 'confirmed');
      }
      return;
    }
    if (lfiMachine) {
      const attackerMachine = allMachines.find(m => m.machine_info?.type === 'workstation' && m.machine_info?.os?.includes('Kali'));
      const originalFile = attackerMachine?.files?.find(f => f.path.endsWith('/' + fileName) || f.path === fileName);
      if (originalFile) {
        const uploadsDirPath = '/var/www/html/uploads';
        const wwwDataUser = getUser(lfiMachine, 'www-data') ?? { username: 'www-data', uid: 33, gid: 33, home: '/var/www', shell: '/usr/sbin/nologin', groups: [33] };
        if (!findDirEntry(lfiMachine, uploadsDirPath)) {
          addFileToMachine(lfiMachine.id, buildNewFile(uploadsDirPath + '/.dir', '', 'text', defaultOwnership(lfiMachine, wwwDataUser, 0o755)));
        }
        addFileToMachine(lfiMachine.id, buildNewFile(`/var/www/html/uploads/${fileName}`, originalFile.content, originalFile.type as 'text' | 'binary' | 'hash' | 'symlink', defaultOwnership(lfiMachine, wwwDataUser, 0o644)));
      }
    }
  }, [lfiMachine, allMachines, addFileToMachine, onMissionComplete, confirmRCE, onReportVulnerability]);
}
