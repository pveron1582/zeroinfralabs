import { useState } from 'react';
import type { Port, Mission } from '../../types';
import { LabBuilderForm } from './LabBuilderForm';
import { LabBuilderPieces, defaultPieces } from './LabBuilderPieces';
import { LabBuilderPreview } from './LabBuilderPreview';

export interface BuilderState {
  // Paso 1: Básico
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Web' | 'Network' | 'Crypto' | 'Forensics';
  networkRange: string;
  // Paso 2: Máquina
  hostname: string;
  os: 'Linux' | 'Windows';
  // Paso 3: Piezas
  ports: Port[];
  webSite: 'none' | 'wordpress' | 'sqli' | 'lfi' | 'consultancy';
  credentials: { user: string; pass: string; service: string }[];
  vulnerabilities: string[];
  // Paso 4: Misiones
  missions: Omit<Mission, 'id' | 'status' | 'targetMachineId'>[];
}

const initialState: BuilderState = {
  name: '',
  nameEs: '',
  description: '',
  descriptionEs: '',
  difficulty: 'Easy',
  category: 'Web',
  networkRange: '192.168.1.0/24',
  hostname: 'target-server',
  os: 'Linux',
  ports: defaultPieces.filter(p => p.enabled).map(p => p.port),
  webSite: 'none',
  credentials: [],
  vulnerabilities: [],
  missions: [],
};

const STEPS = [
  { id: 'basic', labelEs: 'Básico', labelEn: 'Basic' },
  { id: 'machine', labelEs: 'Máquina', labelEn: 'Machine' },
  { id: 'pieces', labelEs: 'Piezas', labelEn: 'Pieces' },
  { id: 'missions', labelEs: 'Misiones', labelEn: 'Missions' },
  { id: 'review', labelEs: 'Revisar', labelEn: 'Review' },
] as const;

export function LabBuilder({ isEs, onBack }: { isEs: boolean; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<BuilderState>(initialState);
  const [showPreview, setShowPreview] = useState(false);

  const update = <K extends keyof BuilderState>(key: K, value: BuilderState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) return state.name.length > 0 && state.nameEs.length > 0;
    if (step === 1) return state.hostname.length > 0;
    return true;
  };

  const next = () => { if (canNext() && step < STEPS.length - 1) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b1015', fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #1c2a2a', background: '#0d1117' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            ← {isEs ? 'Volver al Panel' : 'Back to Panel'}
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-sm font-bold text-gray-200">🧩 Lab Builder</span>
        </div>
        <button onClick={() => setShowPreview(!showPreview)}
          className="text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: showPreview ? '#06b6d420' : 'transparent', color: showPreview ? '#06b6d4' : '#6b7280', border: '1px solid #1c2a2a' }}>
          {isEs ? 'Vista previa JSON' : 'JSON Preview'}
        </button>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-1 py-4" style={{ borderBottom: '1px solid #1c2a2a' }}>
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <button onClick={() => setStep(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                i === step ? 'text-cyan-400 bg-cyan-400/10' : i < step ? 'text-emerald-400' : 'text-gray-500'
              }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                i === step ? 'bg-cyan-400 text-black' : i < step ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
              }`}>
                {i < step ? '✓' : i + 1}
              </span>
              {isEs ? s.labelEs : s.labelEn}
            </button>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-700 mx-1" />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 max-w-4xl mx-auto w-full">
        {step === 0 && <LabBuilderForm.Basic state={state} update={update} isEs={isEs} />}
        {step === 1 && <LabBuilderForm.Machine state={state} update={update} isEs={isEs} />}
        {step === 2 && <LabBuilderPieces state={state} update={update} isEs={isEs} />}
        {step === 3 && <LabBuilderForm.Missions state={state} update={update} isEs={isEs} />}
        {step === 4 && <LabBuilderForm.Review state={state} isEs={isEs} />}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid #1c2a2a', background: '#0d1117' }}>
        <button onClick={prev} disabled={step === 0}
          className={`text-xs px-4 py-2 rounded-lg transition-all ${step === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-gray-200'}`}
          style={{ border: '1px solid #1c2a2a' }}>
          ← {isEs ? 'Anterior' : 'Previous'}
        </button>
        <span className="text-xs text-gray-600">
          {isEs ? `Paso ${step + 1} de ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`}
        </span>
        <button onClick={next} disabled={!canNext() || step === STEPS.length - 1}
          className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${!canNext() || step === STEPS.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
          style={{ background: !canNext() || step === STEPS.length - 1 ? '#1c2a2a' : '#06b6d4', color: '#fff', border: '1px solid #1c2a2a' }}>
          {isEs ? 'Siguiente →' : 'Next →'}
        </button>
      </div>

      {/* Preview modal */}
      {showPreview && <LabBuilderPreview state={state} onClose={() => setShowPreview(false)} isEs={isEs} />}
    </div>
  );
}
