// ── components/admin/DebugPanel.tsx ─────────────────────────────
// Panel de debug flotante con pestañas Store / Machines / Missions

import type { Machine, Mission } from '../../types';

export type DebugTab = 'store' | 'machines' | 'missions';

interface Props {
  debugTab: DebugTab;
  setDebugTab: (t: DebugTab) => void;
  machines: Machine[];
  missions: Mission[];
  activeMachineId: string;
  getStoreSnapshot: () => Record<string, unknown>;
}

function StoreTab({ getStoreSnapshot }: { getStoreSnapshot: () => Record<string, unknown> }) {
  return (
    <pre style={{ color: '#10b981', whiteSpace: 'pre-wrap' }}>{JSON.stringify(getStoreSnapshot(), null, 2)}</pre>
  );
}

function MachinesTab({ machines, activeMachineId }: { machines: Machine[]; activeMachineId: string }) {
  return (
    <div style={{ color: '#e5e7eb' }}>
      {machines.map(m => (
        <div key={m.id} className="mb-3 p-2 rounded" style={{ background: '#000' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-cyan-400">{m.machine_info.hostname}</span>
            <span className="text-gray-500">({m.machine_info.ip})</span>
            <span className={`px-1 rounded text-[9px] ${m.id === activeMachineId ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
              {m.id === activeMachineId ? 'ACTIVE' : 'inactive'}
            </span>
          </div>
          <div className="text-gray-400">
            OS: {m.machine_info.os} | MAC: {m.machine_info.mac} | Type: {m.machine_info.type}
          </div>
          <div className="text-gray-400">
            discovery_level: {m.discovery_level} | status: {m.machine_info.status}
          </div>
          {m.scan_results?.ports && m.scan_results.ports.length > 0 && (
            <div className="mt-1 text-gray-500">
              Ports: {m.scan_results.ports.map(p => `${p.port}/${p.protocol}(${p.state})`).join(', ')}
            </div>
          )}
          {m.found_credentials && m.found_credentials.length > 0 && (
            <div className="mt-1 text-amber-500/80">
              Creds: {m.found_credentials.map(c => `${c.user}:${c.pass} [${c.service}]`).join(', ')}
            </div>
          )}
          {m.possible_ssh_users && m.possible_ssh_users.length > 0 && (
            <div className="mt-1 text-orange-400/80">
              SSH users: {m.possible_ssh_users.join(', ')}
            </div>
          )}
          {m.sudo_privileges && (
            <div className="mt-1 text-red-400/80">
              Sudo: {m.sudo_privileges.user} can run: {m.sudo_privileges.commands.join(', ')}
            </div>
          )}
          {m.files && m.files.length > 0 && (
            <div className="mt-1 text-blue-400/60">
              Files: {m.files.map(f => f.path).join(', ')}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MissionsTab({ missions }: { missions: Mission[] }) {
  return (
    <div style={{ color: '#e5e7eb' }}>
      {missions.map(m => (
        <div key={m.id} className="mb-2 p-2 rounded" style={{ background: '#000' }}>
          <div className="flex items-center gap-2">
            <span className="font-bold" style={{ color: m.status === 'completed' ? '#10b981' : m.status === 'active' ? '#f59e0b' : '#4b5563' }}>
              #{m.id}
            </span>
            <span className="text-gray-300">{m.title}</span>
            <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${
              m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
              m.status === 'active' ? 'bg-amber-500/10 text-amber-400' :
              'bg-gray-800 text-gray-600'
            }`}>
              {m.status}
            </span>
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">
            target: {m.targetMachineId} | level: {m.discoveryLevel}
            {m.validationCriteria && ` | validate: ${m.validationCriteria.type}${m.validationCriteria.port ? ' port=' + m.validationCriteria.port : ''}${m.validationCriteria.targetIp ? ' ip=' + m.validationCriteria.targetIp : ''}`}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DebugPanel({ debugTab, setDebugTab, machines, missions, activeMachineId, getStoreSnapshot }: Props) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col shadow-2xl"
      style={{ width: '440px', maxHeight: '60vh', background: '#0d1117', border: '1px solid #f59e0b40', borderRadius: '12px', overflow: 'hidden' }}>

      <div className="flex items-center justify-between px-3 py-2" style={{ background: '#1c2a2a', borderBottom: '1px solid #f59e0b20' }}>
        <span className="text-xs font-bold text-amber-400">🐞 DEBUG</span>
        <div className="flex items-center gap-1">
          {(['store', 'machines', 'missions'] as DebugTab[]).map(t => (
            <button key={t} onClick={() => setDebugTab(t)}
              className={`text-[10px] px-2 py-0.5 rounded ${debugTab === t ? 'bg-amber-500/20 text-amber-300' : 'text-gray-500 hover:text-gray-400'}`}>
              {t === 'store' ? 'Store' : t === 'machines' ? 'Machines' : 'Missions'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 text-[10px]" style={{ maxHeight: 'calc(60vh - 36px)' }}>
        {debugTab === 'store' && <StoreTab getStoreSnapshot={getStoreSnapshot} />}
        {debugTab === 'machines' && <MachinesTab machines={machines} activeMachineId={activeMachineId} />}
        {debugTab === 'missions' && <MissionsTab missions={missions} />}
      </div>
    </div>
  );
}
