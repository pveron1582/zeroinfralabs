// ── components/WindowsDesktop/apps/SecurityPanel.tsx ─────────────
// Panel "Seguridad de Windows" (W3). Tema claro Win10; preparado para
// enganchar el SIEM de la FASE C del roadmap de SOC.

import type { Machine } from '../../../types';
import { getCurrentUser } from '../../../utils/users';

interface Props {
  machine: Machine;
}

function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-200 last:border-0">
      <span
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
          ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}
        aria-hidden
      >
        {ok ? '✓' : '!'}
      </span>
      <div className="min-w-0">
        <p className="text-slate-900 text-xs font-medium">{label}</p>
        <p className="text-slate-600 text-[11px]">{detail}</p>
      </div>
      <span
        className={`ml-auto text-[10px] font-bold uppercase shrink-0 ${
          ok ? 'text-emerald-700' : 'text-amber-700'
        }`}
      >
        {ok ? 'Activo' : 'Atención'}
      </span>
    </div>
  );
}

export function SecurityPanel({ machine }: Props) {
  const user = getCurrentUser(machine);
  const isAdmin = machine.win?.isAdmin ?? user.uid === 0;
  const privesc = machine.privesc_completed ?? false;
  const creds = machine.found_credentials?.length ?? 0;

  return (
    <div className="h-full overflow-y-auto p-4 bg-white" data-testid="security-panel">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs">
          🛡
        </span>
        <div>
          <p className="text-slate-900 text-sm font-semibold">Seguridad de Windows</p>
          <p className="text-slate-600 text-[11px]">
            {machine.win?.computerName || machine.machine_info.hostname}
          </p>
        </div>
      </div>
      <StatusRow
        label="Firewall de Windows"
        ok={!privesc}
        detail={privesc ? 'Reglas alteradas tras la escalada' : 'Protección activa en todos los perfiles'}
      />
      <StatusRow
        label="Antivirus"
        ok={!privesc}
        detail={privesc ? 'Servicio detenido' : 'Defender: amenazas revisadas al día'}
      />
      <StatusRow
        label="Cuenta de usuario"
        ok={isAdmin}
        detail={isAdmin ? 'Sesión como Administrador' : `Sesión como ${user.username} (estándar)`}
      />
      <StatusRow
        label="Credenciales detectadas"
        ok={creds === 0}
        detail={creds > 0 ? `${creds} credencial(es) en la máquina` : 'Sin hallazgos recientes'}
      />
      <p className="mt-4 text-[10px] text-slate-500 leading-relaxed">
        Panel preparado para eventos del SIEM (roadmap SOC FASE C). Los hallazgos
        de winPEAS y la escalada con Potato se reflejan aquí.
      </p>
    </div>
  );
}
