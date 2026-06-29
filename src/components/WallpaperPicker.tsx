import React from 'react';
import { WALLPAPERS } from './desktopWallpapers';

interface WallpaperPickerProps {
  activeWallpaper: string;
  isEs: boolean;
  onSelectWallpaper: (id: string) => void;
}

export function WallpaperPicker({ activeWallpaper, isEs, onSelectWallpaper }: WallpaperPickerProps) {
  return (
    <div className="p-4 bg-slate-900/95 text-slate-200 h-full flex flex-col justify-between overflow-y-auto">
      <div className="text-xs text-slate-400 mb-3">
        {isEs ? 'Elige un estilo para el escritorio virtual:' : 'Choose a style for the virtual desktop:'}
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1 mb-2">
        {WALLPAPERS.map(wp => {
          const active = activeWallpaper === wp.id;
          return (
            <div key={wp.id}
              onClick={() => onSelectWallpaper(wp.id)}
              className={`flex flex-col items-center justify-between p-3 rounded-lg border cursor-pointer hover:scale-[1.03] transition-all duration-200 ${active ? 'border-emerald-500 bg-slate-800/80 shadow-lg shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}>
              <div className={`w-full h-24 rounded-md bg-gradient-to-br ${wp.previewGradient} border border-slate-800/80 shadow-inner flex items-center justify-center`}>
                {active && (
                  <span className="text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30">✓</span>
                )}
              </div>
              <span className="text-[11px] font-sans text-center mt-2.5 font-semibold tracking-wide text-slate-300">
                {isEs ? wp.nameEs : wp.nameEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
