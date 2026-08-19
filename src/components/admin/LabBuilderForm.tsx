import type { MissionCriteriaType } from '../../types';
import type { BuilderState } from './LabBuilder';

type UpdateFn = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => void;

const inputStyle = { borderColor: '#1c2a2a' } as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="text-xs text-gray-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none focus:border-cyan-500/50"
      style={inputStyle}
    />
  );
}

const criteriaOptions: { value: MissionCriteriaType; es: string; en: string }[] = [
  { value: 'discoveredHosts', es: 'Descubrir hosts', en: 'Discover hosts' },
  { value: 'scanResults', es: 'Escanear puertos', en: 'Scan ports' },
  { value: 'foundDirectories', es: 'Encontrar directorios web', en: 'Find web directories' },
  { value: 'foundCredentials', es: 'Encontrar credenciales', en: 'Find credentials' },
  { value: 'ftpLogin', es: 'Login FTP', en: 'FTP login' },
  { value: 'sshLogin', es: 'Login SSH', en: 'SSH login' },
  { value: 'fileRead', es: 'Leer un archivo', en: 'Read a file' },
  { value: 'privesc', es: 'Escalar privilegios', en: 'Privilege escalation' },
  { value: 'ncListener', es: 'Levantar listener netcat', en: 'Start netcat listener' },
  { value: 'exploit', es: 'Ejecutar exploit', en: 'Run exploit' },
];

function Basic({ state, update, isEs }: { state: BuilderState; update: UpdateFn; isEs: boolean }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-200 mb-1">{isEs ? 'Datos básicos' : 'Basic info'}</h2>
      <p className="text-xs text-gray-500 mb-5">
        {isEs ? 'Nombre, descripción y metadata que verán los jugadores.' : 'Name, description and metadata players will see.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isEs ? 'Nombre (ES) *' : 'Name (ES) *'}>
          <TextInput value={state.nameEs} onChange={v => update('nameEs', v)} placeholder="Mi primer lab" />
        </Field>
        <Field label={isEs ? 'Nombre (EN) *' : 'Name (EN) *'}>
          <TextInput value={state.name} onChange={v => update('name', v)} placeholder="My first lab" />
        </Field>
      </div>
      <Field label={isEs ? 'Descripción (ES)' : 'Description (ES)'}>
        <textarea value={state.descriptionEs} onChange={e => update('descriptionEs', e.target.value)}
          rows={2} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none focus:border-cyan-500/50" style={inputStyle} />
      </Field>
      <Field label={isEs ? 'Descripción (EN)' : 'Description (EN)'}>
        <textarea value={state.description} onChange={e => update('description', e.target.value)}
          rows={2} className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none focus:border-cyan-500/50" style={inputStyle} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label={isEs ? 'Dificultad' : 'Difficulty'}>
          <select value={state.difficulty} onChange={e => update('difficulty', e.target.value as BuilderState['difficulty'])}
            className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none" style={inputStyle}>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </Field>
        <Field label={isEs ? 'Categoría' : 'Category'}>
          <select value={state.category} onChange={e => update('category', e.target.value as BuilderState['category'])}
            className="w-full px-3 py-2 rounded-lg text-sm bg-gray-900 text-gray-200 border outline-none" style={inputStyle}>
            <option value="Web">Web</option>
            <option value="Network">Network</option>
            <option value="Crypto">Crypto</option>
            <option value="Forensics">Forensics</option>
          </select>
        </Field>
        <Field label={isEs ? 'Rango de red' : 'Network range'}>
          <TextInput value={state.networkRange} onChange={v => update('networkRange', v)} placeholder="192.168.1.0/24" />
        </Field>
      </div>
    </div>
  );
}

function Machine({ state, update, isEs }: { state: BuilderState; update: UpdateFn; isEs: boolean }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-200 mb-1">{isEs ? 'Máquina víctima' : 'Target machine'}</h2>
      <p className="text-xs text-gray-500 mb-5">
        {isEs ? 'Definí la identidad del objetivo. La IP se asigna sola dentro del rango.' : 'Define the target identity. The IP is auto-assigned within the range.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isEs ? 'Hostname *' : 'Hostname *'}>
          <TextInput value={state.hostname} onChange={v => update('hostname', v)} placeholder="target-server" />
        </Field>
        <Field label={isEs ? 'Sistema operativo' : 'Operating system'}>
          <div className="flex gap-2">
            {(['Linux', 'Windows'] as const).map(os => (
              <button key={os} type="button" onClick={() => update('os', os)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${state.os === os ? 'text-cyan-300 bg-cyan-500/10' : 'text-gray-500 bg-gray-900'}`}
                style={{ border: `1px solid ${state.os === os ? '#06b6d450' : '#1c2a2a'}` }}>
                {os === 'Linux' ? '🐧 Linux' : '🪟 Windows'}
              </button>
            ))}
          </div>
        </Field>
      </div>
      <div className="mt-4 p-4 rounded-xl text-xs text-gray-500" style={{ background: '#0d1117', border: '1px solid #1c2a2a' }}>
        <span className="text-cyan-400 font-bold">{isEs ? 'Vista previa de red:' : 'Network preview:'}</span>
        <div className="mt-2 font-mono">
          attacker-01 → {state.networkRange.replace('0/24', '10').replace('/24', '') || '192.168.1.10'} (Kali)
        </div>
        <div className="font-mono">
          {state.hostname || 'target-01'} → {isEs ? 'IP automática en' : 'Auto IP in'} {state.networkRange}
        </div>
      </div>
    </div>
  );
}

function Missions({ state, update, isEs }: { state: BuilderState; update: UpdateFn; isEs: boolean }) {
  const addMission = () => {
    update('missions', [...state.missions, {
      title: '', titleEs: '', description: '', descriptionEs: '',
      discoveryLevel: 1, hintLevel: 0,
      validationCriteria: { type: 'discoveredHosts' },
    }]);
  };

  const patchMission = (idx: number, patch: Partial<BuilderState['missions'][number]>) => {
    const missions = [...state.missions];
    missions[idx] = { ...missions[idx], ...patch };
    update('missions', missions);
  };

  const removeMission = (idx: number) => update('missions', state.missions.filter((_, i) => i !== idx));

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-200 mb-1">{isEs ? 'Misiones' : 'Missions'}</h2>
      <p className="text-xs text-gray-500 mb-5">
        {isEs ? 'Cada misión tiene un objetivo y un criterio que la valida automáticamente.' : 'Each mission has an objective and a criteria that validates it automatically.'}
      </p>

      {state.missions.length === 0 && (
        <div className="p-6 rounded-xl text-center text-xs text-gray-600 mb-4" style={{ border: '1px dashed #1c2a2a' }}>
          {isEs ? 'Todavía no hay misiones. Agregá la primera.' : 'No missions yet. Add the first one.'}
        </div>
      )}

      {state.missions.map((m, i) => (
        <div key={i} className="mb-3 p-4 rounded-xl" style={{ background: '#0d1117', border: '1px solid #1c2a2a' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
            <span className="text-xs text-gray-400">{isEs ? 'Misión' : 'Mission'} {i + 1}</span>
            <button onClick={() => removeMission(i)} className="ml-auto text-red-400 hover:text-red-300 text-xs">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput value={m.titleEs ?? ''} onChange={v => patchMission(i, { titleEs: v })} placeholder={isEs ? 'Título (ES)' : 'Title (ES)'} />
            <TextInput value={m.title} onChange={v => patchMission(i, { title: v })} placeholder={isEs ? 'Título (EN)' : 'Title (EN)'} />
          </div>
          <div className="mt-3">
            <select
              value={m.validationCriteria?.type || 'discoveredHosts'}
              onChange={e => patchMission(i, { validationCriteria: { type: e.target.value as MissionCriteriaType } })}
              className="w-full px-3 py-2 rounded-lg text-xs bg-gray-900 text-gray-300 border outline-none"
              style={inputStyle}>
              {criteriaOptions.map(c => (
                <option key={c.value} value={c.value}>{isEs ? c.es : c.en}</option>
              ))}
            </select>
          </div>
        </div>
      ))}

      <button onClick={addMission}
        className="text-xs px-3 py-2 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-all"
        style={{ border: '1px dashed #1c2a2a' }}>
        + {isEs ? 'Agregar misión' : 'Add mission'}
      </button>
    </div>
  );
}

function Review({ state, isEs }: { state: BuilderState; isEs: boolean }) {
  const rows = [
    { label: isEs ? 'Nombre' : 'Name', value: `${state.nameEs || '—'} / ${state.name || '—'}` },
    { label: isEs ? 'Dificultad' : 'Difficulty', value: `${state.difficulty} · ${state.category}` },
    { label: isEs ? 'Red' : 'Network', value: state.networkRange },
    { label: isEs ? 'Máquina' : 'Machine', value: `${state.hostname} (${state.os})` },
    { label: isEs ? 'Puertos' : 'Ports', value: state.ports.length ? state.ports.map(p => p.port).join(', ') : '—' },
    { label: isEs ? 'Sitio web' : 'Website', value: state.webSite },
    { label: isEs ? 'Credenciales' : 'Credentials', value: String(state.credentials.length) },
    { label: isEs ? 'Vulnerabilidades' : 'Vulnerabilities', value: state.vulnerabilities.length ? state.vulnerabilities.join(', ') : '—' },
    { label: isEs ? 'Misiones' : 'Missions', value: String(state.missions.length) },
  ];

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-200 mb-1">{isEs ? 'Revisión' : 'Review'}</h2>
      <p className="text-xs text-gray-500 mb-5">
        {isEs ? 'Resumen del lab antes de generarlo.' : 'Lab summary before generating it.'}
      </p>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1c2a2a' }}>
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center px-4 py-2.5 text-xs" style={{ background: i % 2 === 0 ? '#0d1117' : '#0b1015' }}>
            <span className="text-gray-500 w-36 flex-shrink-0">{r.label}</span>
            <span className="text-gray-200 font-mono">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 rounded-xl text-xs text-amber-400/90" style={{ background: '#f59e0b10', border: '1px solid #f59e0b30' }}>
        {isEs
          ? '⚠ Esto es solo la interfaz. La generación del Scenario y el botón Compartir llegan en la próxima iteración.'
          : '⚠ This is only the interface. Scenario generation and the Share button come in the next iteration.'}
      </div>
    </div>
  );
}

export const LabBuilderForm = { Basic, Machine, Missions, Review };
