// ── components/admin/LessonBuilder.tsx ────────────────────────────
// Wizard para crear/editar lecciones del Academy.
// Mismo patrón que LabBuilder: pasos, tipos, preview JSON, export como .ts

import { useState } from 'react';
import type { LessonStep, AcademyPathId } from '../../types';
import { StepEditor } from './lesson-builder/StepEditor';
import { LessonPreviewLive } from './lesson-builder/LessonPreviewLive';
import { generateLessonTs } from './lesson-builder/generateLessonTs';

export interface LessonDraft {
  id: string;
  pathId: AcademyPathId;
  order: number;
  title: string;
  titleEs: string;
  readingMinutes: number;
  labRef?: string;
  steps: LessonStep[];
}

const STEP_TYPES: { type: LessonStep['type']; icon: string; labelEs: string; labelEn: string }[] = [
  { type: 'foxy-narrator', icon: '🦊', labelEs: 'Foxy narra', labelEn: 'Foxy narrates' },
  { type: 'content', icon: '📄', labelEs: 'Contenido', labelEn: 'Content' },
  { type: 'terminal-demo', icon: '💻', labelEs: 'Demo terminal', labelEn: 'Terminal demo' },
  { type: 'video', icon: '🎬', labelEs: 'Video', labelEn: 'Video' },
  { type: 'practical-exercise', icon: '🎯', labelEs: 'Ejercicio', labelEn: 'Exercise' },
  { type: 'lab-challenge', icon: '🧪', labelEs: 'Lab challenge', labelEn: 'Lab challenge' },
  { type: 'interactive-demo', icon: '🎮', labelEs: 'Simulador', labelEn: 'Simulator' },
  { type: 'matching', icon: '🧩', labelEs: 'Emparejar', labelEn: 'Matching' },
  { type: 'quiz', icon: '❓', labelEs: 'Quiz', labelEn: 'Quiz' },
];

function defaultStep(type: LessonStep['type']): LessonStep {
  switch (type) {
    case 'foxy-narrator':
      return { type: 'foxy-narrator', messages: [{ es: '', en: '' }] };
    case 'content':
      return { type: 'content', title: '', titleEs: '', body: '', bodyEs: '' };
    case 'terminal-demo':
      return { type: 'terminal-demo', command: '', output: '', explanation: '', explanationEs: '' };
    case 'video':
      return { type: 'video', src: '', durationSec: 20, caption: '', captionEs: '' };
    case 'practical-exercise':
      return { type: 'practical-exercise', task: '', taskEs: '', hint: '', hintEs: '', labId: '' };
    case 'lab-challenge':
      return { type: 'lab-challenge', labId: '', missionObjective: '', missionObjectiveEs: '' };
    case 'interactive-demo':
      return { type: 'interactive-demo', demoKind: 'network-home', instructions: '', instructionsEs: '' };
    case 'matching':
      return { type: 'matching', title: '', titleEs: '', instructions: '', instructionsEs: '', pairs: [{ left: '', leftEs: '', right: '', rightEs: '' }] };
    case 'quiz':
      return { type: 'quiz', question: '', questionEs: '', options: [{ es: '', en: '' }], correctIndex: 0 };
    default: {
      const _exhaustive: never = type;
      throw new Error(`Tipo de step desconocido: ${_exhaustive}`);
    }
  }
}

export function LessonBuilder({ onBack, isEs }: { onBack: () => void; isEs: boolean }) {
  const [draft, setDraft] = useState<LessonDraft>({
    id: 'mi-leccion',
    pathId: 'os',
    order: 1,
    title: '',
    titleEs: '',
    readingMinutes: 8,
    steps: [defaultStep('foxy-narrator')],
  });
  const [showJson, setShowJson] = useState(false);

  const update = <K extends keyof LessonDraft>(key: K, value: LessonDraft[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const addStep = (type: LessonStep['type']) =>
    update('steps', [...draft.steps, defaultStep(type)]);

  const updateStep = (idx: number, step: LessonStep) => {
    const steps = [...draft.steps];
    steps[idx] = step;
    update('steps', steps);
  };

  const removeStep = (idx: number) =>
    update('steps', draft.steps.filter((_, i) => i !== idx));

  const moveStep = (idx: number, dir: -1 | 1) => {
    const steps = [...draft.steps];
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    [steps[idx], steps[target]] = [steps[target], steps[idx]];
    update('steps', steps);
  };

  const downloadTs = () => {
    const ts = generateLessonTs(draft);
    const blob = new Blob([ts], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.id}.lesson.ts`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b1015', fontFamily: "'Cascadia Code','Fira Code','Consolas',monospace" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #1c2a2a', background: '#0d1117' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm">
            ← {isEs ? 'Panel' : 'Panel'}
          </button>
          <div className="w-px h-4 bg-gray-700" />
          <span className="text-sm font-bold text-gray-200">📝 Lesson Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowJson(!showJson)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ border: '1px solid #1c2a2a', color: showJson ? '#06b6d4' : '#6b7280', background: showJson ? '#06b6d420' : 'transparent' }}>
            {isEs ? 'JSON' : 'JSON'}
          </button>
          <button onClick={downloadTs}
            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all hover:brightness-110"
            style={{ background: '#06b6d4', color: '#04121a' }}>
            {isEs ? '⬇ Descargar .ts' : '⬇ Download .ts'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Izquierda: editor */}
        <div className="space-y-6">
          {/* Metadata */}
          <section className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #1c2a2a' }}>
            <h3 className="text-sm font-bold text-cyan-400 mb-3">{isEs ? 'Datos de la lección' : 'Lesson metadata'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field isEs={isEs} label="ID (único, sin espacios)">
                <input value={draft.id} onChange={e => update('id', e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-gray-900 text-gray-200 text-xs border outline-none"
                  style={{ borderColor: '#1c2a2a' }} placeholder="mi-leccion" />
              </Field>
              <Field isEs={isEs} label={isEs ? 'Ruta (path)' : 'Path'}>
                <select value={draft.pathId} onChange={e => update('pathId', e.target.value as AcademyPathId)}
                  className="w-full px-2 py-1.5 rounded bg-gray-900 text-gray-200 text-xs border outline-none"
                  style={{ borderColor: '#1c2a2a' }}>
                  <option value="os">Sistemas Operativos</option>
                  <option value="redes">Fundamentos de redes</option>
                  <option value="protocolos">Redes I</option>
                  <option value="protocolos-ii">Redes II</option>
                  <option value="ciberseguridad">Ciberseguridad</option>
                  <option value="hacking">Pentesting</option>
                </select>
              </Field>
              <Field isEs={isEs} label={isEs ? 'Título (EN)' : 'Title (EN)'}>
                <input value={draft.title} onChange={e => update('title', e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-gray-900 text-gray-200 text-xs border outline-none"
                  style={{ borderColor: '#1c2a2a' }} />
              </Field>
              <Field isEs={isEs} label={isEs ? 'Título (ES)' : 'Title (ES)'}>
                <input value={draft.titleEs} onChange={e => update('titleEs', e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-gray-900 text-gray-200 text-xs border outline-none"
                  style={{ borderColor: '#1c2a2a' }} />
              </Field>
              <Field isEs={isEs} label={isEs ? 'Minutos de lectura' : 'Reading minutes'}>
                <input type="number" value={draft.readingMinutes} onChange={e => update('readingMinutes', Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded bg-gray-900 text-gray-200 text-xs border outline-none"
                  style={{ borderColor: '#1c2a2a' }} />
              </Field>
              <Field isEs={isEs} label={isEs ? 'Lab vinculado (opcional)' : 'Linked lab (optional)'}>
                <input value={draft.labRef || ''} onChange={e => update('labRef', e.target.value || undefined)}
                  className="w-full px-2 py-1.5 rounded bg-gray-900 text-gray-200 text-xs border outline-none"
                  style={{ borderColor: '#1c2a2a' }} placeholder="scenario-01" />
              </Field>
            </div>
          </section>

          {/* Steps */}
          <section className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #1c2a2a' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-cyan-400">{isEs ? 'Pasos de la lección' : 'Lesson steps'}</h3>
              <span className="text-xs text-gray-500">{draft.steps.length} {isEs ? 'pasos' : 'steps'}</span>
            </div>

            <div className="space-y-3">
              {draft.steps.map((step, idx) => (
                <div key={idx} className="rounded-lg p-3" style={{ background: '#050a08', border: '1px solid #1c2a2a' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                    <span className="text-xs font-bold" style={{ color: '#06b6d4' }}>
                      {STEP_TYPES.find(t => t.type === step.type)?.icon} {step.type}
                    </span>
                    <div className="ml-auto flex gap-1">
                      <button onClick={() => moveStep(idx, -1)} disabled={idx === 0}
                        className="text-[10px] px-1.5 py-0.5 rounded text-gray-400 hover:text-gray-200 disabled:opacity-30"
                        style={{ border: '1px solid #1c2a2a' }}>↑</button>
                      <button onClick={() => moveStep(idx, 1)} disabled={idx === draft.steps.length - 1}
                        className="text-[10px] px-1.5 py-0.5 rounded text-gray-400 hover:text-gray-200 disabled:opacity-30"
                        style={{ border: '1px solid #1c2a2a' }}>↓</button>
                      <button onClick={() => removeStep(idx)}
                        className="text-[10px] px-1.5 py-0.5 rounded text-red-400 hover:text-red-300"
                        style={{ border: '1px solid #1c2a2a' }}>✕</button>
                    </div>
                  </div>
                  <StepEditor step={step} onChange={(s) => updateStep(idx, s)} isEs={isEs} />
                </div>
              ))}
            </div>

            {/* Agregar step */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STEP_TYPES.map(t => (
                <button key={t.type} onClick={() => addStep(t.type)}
                  className="px-2 py-1.5 rounded-lg text-xs transition-all hover:brightness-110 flex items-center gap-1.5"
                  style={{ border: '1px dashed #1c2a2a', color: '#9ca3af' }}>
                  <span>{t.icon}</span> {isEs ? t.labelEs : t.labelEn}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Derecha: preview */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-cyan-400">{isEs ? 'Vista previa' : 'Preview'}</h3>
          {showJson ? (
            <pre className="text-[11px] text-emerald-300 rounded-xl p-4 overflow-auto max-h-[80vh]" style={{ background: '#050a08', border: '1px solid #1c2a2a' }}>
              {JSON.stringify(draft, null, 2)}
            </pre>
          ) : (
            <LessonPreviewLive draft={draft} isEs={isEs} />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode; isEs?: boolean }) {
  return (
    <label className="block">
      <span className="text-[10px] text-gray-500 block mb-1">{label}</span>
      {children}
    </label>
  );
}
