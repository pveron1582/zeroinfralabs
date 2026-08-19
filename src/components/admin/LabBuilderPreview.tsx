import type { BuilderState } from './LabBuilder';

function buildPreviewJson(state: BuilderState) {
  return {
    id: state.nameEs
      ? state.nameEs.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : 'custom-lab',
    name: state.name,
    nameEs: state.nameEs,
    description: state.description,
    descriptionEs: state.descriptionEs,
    difficulty: state.difficulty,
    category: state.category,
    network_range: state.networkRange,
    targetMachine: {
      hostname: state.hostname,
      os: state.os,
      ports: state.ports,
      webSite: state.webSite,
      credentials: state.credentials,
      vulnerabilities: state.vulnerabilities,
    },
    missions: state.missions.map((m, i) => ({
      id: i + 1,
      title: m.title,
      titleEs: m.titleEs,
      validationCriteria: m.validationCriteria,
    })),
  };
}

export function LabBuilderPreview({ state, onClose, isEs }: {
  state: BuilderState;
  onClose: () => void;
  isEs: boolean;
}) {
  const json = JSON.stringify(buildPreviewJson(state), null, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ background: '#0d1117', border: '1px solid #06b6d440' }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1c2a2a' }}>
          <span className="text-sm font-bold text-cyan-400">
            {isEs ? 'Vista previa del lab (JSON)' : 'Lab preview (JSON)'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(json)}
              className="text-xs px-3 py-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all"
              style={{ border: '1px solid #1c2a2a' }}>
              {isEs ? 'Copiar' : 'Copy'}
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-sm px-2">✕</button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto p-4 text-[11px] text-emerald-300/90" style={{ whiteSpace: 'pre-wrap' }}>
          {json}
        </pre>
      </div>
    </div>
  );
}
