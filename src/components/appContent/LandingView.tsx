// ── components/appContent/LandingView.tsx ───────────────────────
// Vistas mostradas mientras view === 'landing': loader de máquina o "Loading..."

import type { Machine } from '../../types';
import { MachineLoader } from '../MachineLoader';
import { DEFAULT_WALLPAPER } from '../desktopWallpapers';

const MONO = "'Cascadia Code','Fira Code','Consolas',monospace";

interface Props {
  showMachineLoader: boolean;
  loadingMachine: Machine | null;
  language: 'en' | 'es';
}

export function LandingView({ showMachineLoader, loadingMachine, language }: Props) {
  if (showMachineLoader && loadingMachine) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ ...DEFAULT_WALLPAPER.style, fontFamily: MONO }}>
        <MachineLoader
          machineName={loadingMachine.machine_info.hostname}
          machineIp={loadingMachine.machine_info.ip}
          machineOs={loadingMachine.machine_info.os}
          onComplete={() => {}}
          language={language}
        />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ ...DEFAULT_WALLPAPER.style, fontFamily: MONO }}>
      <div className="text-emerald-400 font-mono text-sm animate-pulse">Loading...</div>
    </div>
  );
}
