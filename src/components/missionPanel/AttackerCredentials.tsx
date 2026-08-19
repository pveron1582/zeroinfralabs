// ── components/missionPanel/AttackerCredentials.tsx ──────────────
// Caja de credenciales disponibles en la máquina atacante

import type { Machine } from '../../types';
import { useLanguage } from '../../i18n/translations';

export function AttackerCredentials({ allMachines }: { allMachines: Machine[] }) {
  const language = useLanguage();
  const attacker = allMachines.find(m => m.id.includes('attacker'));
  const creds = attacker?.known_passwords ?? {};
  const entries = Object.entries(creds);
  if (entries.length === 0) return null;

  return (
    <div className="px-4 pt-3 border-b border-gray-800" data-tour="attacker-creds">
      <div className="rounded-lg border border-gray-700/60 bg-gray-800/40 p-3">
        <div className="flex items-center gap-2 mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-400">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            {language === 'es' ? 'Credenciales atacante' : 'Attacker credentials'}
          </span>
        </div>
        <div className="space-y-1">
          {entries.map(([user, pass]) => (
            <div key={user} className="flex items-center justify-between font-mono text-xs">
              <span className="text-gray-400">{user}</span>
              <span className="text-emerald-300">{pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
