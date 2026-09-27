// ── components/appContent/MobileHelpDrawer.tsx ────────────────────
// Drawer lateral de ayuda (guía del laboratorio) con animación y
// gesto `inert` para no dejar foco atrapado tras cerrarse.

import { useEffect, useRef } from 'react';
import { MissionPanel } from '../MissionPanel';
import type { Machine, Mission } from '../../types';

export type MobileHelpWindowType = 'browser' | 'network' | 'enumeration';

interface MobileHelpDrawerProps {
  open: boolean;
  isEs: boolean;
  missions: Mission[];
  allMachines: Machine[];
  networkRange: string;
  onExit: () => void;
  onClose: () => void;
  onOpenWindow: (type: MobileHelpWindowType) => void;
}

export function MobileHelpDrawer({ open, isEs, missions, allMachines, networkRange, onExit, onClose, onOpenWindow }: MobileHelpDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Cuando el drawer se cierra, el foco no puede quedar dentro de un
  // contenedor con aria-hidden="true" (Chrome lo bloquea y avisa en consola).
  // `inert` saca a los descendientes del orden de tabulación manteniendo
  // la animación de translate-x.
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    const node = el as unknown as { inert: boolean };
    if (!open) {
      if (el.contains(document.activeElement)) {
        (document.activeElement as HTMLElement)?.blur?.();
      }
      node.inert = true;
    } else {
      node.inert = false;
    }
  }, [open]);

  return (
    <div ref={drawerRef} className={`absolute inset-0 z-30 flex flex-col bg-gray-900 transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}`} aria-hidden={!open}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900 flex-shrink-0">
        <span className="text-sm font-bold text-white">{isEs ? 'Guía del laboratorio' : 'Lab guide'}</span>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 flex items-center justify-center">×</button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto flex justify-center">
        <div className="w-full max-w-sm [&>div]:w-full [&>div]:max-w-none [&>div]:border-l-0 [&>div]:mx-auto">
          <MissionPanel
            missions={missions}
            allMachines={allMachines}
            networkRange={networkRange}
            onOpenBrowser={() => onOpenWindow('browser')}
            onOpenNetworkMap={() => onOpenWindow('network')}
            onOpenEnumeration={() => onOpenWindow('enumeration')}
            onExit={onExit}
          />
        </div>
      </div>
    </div>
  );
}
