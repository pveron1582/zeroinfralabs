// ── components/WindowsDesktop/apps/SystemProps.tsx ───────────────
// Propiedades del sistema: systeminfo gráfico (W3). Tema claro Win10.

import type { Machine } from '../../../types';
import { getCurrentUser } from '../../../utils/users';

interface Props {
  machine: Machine;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="w-40 shrink-0 text-slate-600 text-xs font-medium">{label}</span>
      <span className="text-slate-900 text-xs font-mono break-all">{value}</span>
    </div>
  );
}

export function SystemProps({ machine }: Props) {
  const user = getCurrentUser(machine);
  const host = machine.win?.computerName || machine.machine_info.hostname;
  const isAdmin = machine.win?.isAdmin ?? user.uid === 0;

  return (
    <div className="h-full overflow-y-auto p-4 bg-white" data-testid="system-props">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
        <div className="w-10 h-10 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-lg">
          🖥
        </div>
        <div>
          <p className="text-slate-900 font-semibold text-sm">{host}</p>
          <p className="text-slate-600 text-xs">{machine.machine_info.os}</p>
        </div>
      </div>
      <Row label="Nombre de host" value={host} />
      <Row label="Sistema operativo" value={machine.machine_info.os} />
      <Row label="Dirección IP" value={machine.machine_info.ip} />
      <Row label="MAC" value={machine.machine_info.mac} />
      <Row label="Usuario" value={user.username} />
      <Row label="Tipo de cuenta" value={isAdmin ? 'Administrador' : 'Usuario estándar'} />
      <Row label="Dominio" value={machine.win?.domain ?? 'WORKGROUP'} />
      <Row label="Memoria instalada" value="4,00 GB" />
      <Row label="Tipo de sistema" value="Sistema operativo de 64 bits" />
    </div>
  );
}
