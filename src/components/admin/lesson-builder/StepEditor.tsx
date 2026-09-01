// ── components/admin/lesson-builder/StepEditor.tsx ─────────────────
// Editor especializado por tipo de step.

import type { LessonStep } from '../../../types';

const inputCls = "w-full px-2 py-1 rounded bg-gray-900 text-gray-200 text-xs border outline-none focus:border-cyan-500/40";
const inputStyle = { borderColor: '#1c2a2a' } as const;

export function StepEditor({ step, onChange, isEs }: {
  step: LessonStep;
  onChange: (s: LessonStep) => void;
  isEs: boolean;
}) {
  switch (step.type) {
    case 'foxy-narrator':
      return (
        <div className="space-y-2">
          {step.messages.map((m, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 items-start">
              <textarea value={m.es} onChange={e => onChange({
                ...step,
                messages: step.messages.map((mm, ii) => ii === i ? { ...mm, es: e.target.value } : mm)
              })}
                placeholder="ES" rows={2} className={inputCls} style={inputStyle} />
              <textarea value={m.en} onChange={e => onChange({
                ...step,
                messages: step.messages.map((mm, ii) => ii === i ? { ...mm, en: e.target.value } : mm)
              })}
                placeholder="EN" rows={2} className={inputCls} style={inputStyle} />
            </div>
          ))}
          <button onClick={() => onChange({ ...step, messages: [...step.messages, { es: '', en: '' }] })}
            className="text-[10px] text-cyan-400 hover:underline">+ {isEs ? 'agregar mensaje' : 'add message'}</button>
        </div>
      );

    case 'content':
      return (
        <div className="space-y-2">
          <input value={step.title} onChange={e => onChange({ ...step, title: e.target.value })}
            placeholder="Title (EN)" className={inputCls} style={inputStyle} />
          <input value={step.titleEs} onChange={e => onChange({ ...step, titleEs: e.target.value })}
            placeholder="Título (ES)" className={inputCls} style={inputStyle} />
          <textarea value={step.body} onChange={e => onChange({ ...step, body: e.target.value })}
            placeholder="Body (EN) — usa `backticks` para código" rows={3} className={inputCls} style={inputStyle} />
          <textarea value={step.bodyEs} onChange={e => onChange({ ...step, bodyEs: e.target.value })}
            placeholder="Cuerpo (ES)" rows={3} className={inputCls} style={inputStyle} />
        </div>
      );

    case 'terminal-demo':
      return (
        <div className="space-y-2">
          <input value={step.command} onChange={e => onChange({ ...step, command: e.target.value })}
            placeholder={isEs ? 'Comando (ej: nmap -sV 192.168.1.11)' : 'Command'} className={inputCls} style={inputStyle} />
          <textarea value={step.output} onChange={e => onChange({ ...step, output: e.target.value })}
            placeholder={isEs ? 'Salida simulada' : 'Simulated output'} rows={3} className={inputCls} style={inputStyle} />
          <input value={step.explanation} onChange={e => onChange({ ...step, explanation: e.target.value })}
            placeholder="Explanation (EN)" className={inputCls} style={inputStyle} />
          <input value={step.explanationEs} onChange={e => onChange({ ...step, explanationEs: e.target.value })}
            placeholder="Explicación (ES)" className={inputCls} style={inputStyle} />
        </div>
      );

    case 'video':
      return (
        <div className="space-y-2">
          <input value={step.src} onChange={e => onChange({ ...step, src: e.target.value })}
            placeholder="/videos/es/nombre.mp4" className={inputCls} style={inputStyle} />
          <input type="number" value={step.durationSec} onChange={e => onChange({ ...step, durationSec: Number(e.target.value) })}
            placeholder="Duración (segundos)" className={inputCls} style={inputStyle} />
          <input value={step.caption || ''} onChange={e => onChange({ ...step, caption: e.target.value })}
            placeholder="Caption (EN)" className={inputCls} style={inputStyle} />
          <input value={step.captionEs || ''} onChange={e => onChange({ ...step, captionEs: e.target.value })}
            placeholder="Caption (ES)" className={inputCls} style={inputStyle} />
        </div>
      );

    case 'practical-exercise':
      return (
        <div className="space-y-2">
          <textarea value={step.task} onChange={e => onChange({ ...step, task: e.target.value })}
            placeholder="Task (EN)" rows={2} className={inputCls} style={inputStyle} />
          <textarea value={step.taskEs} onChange={e => onChange({ ...step, taskEs: e.target.value })}
            placeholder="Tarea (ES)" rows={2} className={inputCls} style={inputStyle} />
          <input value={step.hint} onChange={e => onChange({ ...step, hint: e.target.value })}
            placeholder="Hint (EN) — Foxy lo muestra si piden ayuda" className={inputCls} style={inputStyle} />
          <input value={step.hintEs} onChange={e => onChange({ ...step, hintEs: e.target.value })}
            placeholder="Pista (ES)" className={inputCls} style={inputStyle} />
          <input value={step.labId || ''} onChange={e => onChange({ ...step, labId: e.target.value || undefined })}
            placeholder="labId (ej: scenario-01)" className={inputCls} style={inputStyle} />
        </div>
      );

    case 'lab-challenge':
      return (
        <div className="space-y-2">
          <input value={step.labId} onChange={e => onChange({ ...step, labId: e.target.value })}
            placeholder="labId (ej: scenario-01)" className={inputCls} style={inputStyle} />
          <input value={step.missionObjective} onChange={e => onChange({ ...step, missionObjective: e.target.value })}
            placeholder="Objective (EN)" className={inputCls} style={inputStyle} />
          <input value={step.missionObjectiveEs} onChange={e => onChange({ ...step, missionObjectiveEs: e.target.value })}
            placeholder="Objetivo (ES)" className={inputCls} style={inputStyle} />
        </div>
      );

    case 'interactive-demo': {
      const kinds: { value: typeof step.demoKind; labelEs: string; labelEn: string }[] = [
        { value: 'network-home', labelEs: 'Red doméstica', labelEn: 'Home network' },
        { value: 'network-dmz', labelEs: 'Topología DMZ', labelEn: 'DMZ topology' },
        { value: 'network-mitm', labelEs: 'MITM / ARP spoof', labelEn: 'MITM / ARP spoof' },
        { value: 'network-topology', labelEs: 'Topologías y cables (Packet Tracer)', labelEn: 'Topologies & cables (Packet Tracer)' },
      ];
      return (
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="text-[10px] text-gray-500">Simulador</div>
            <select
              value={step.demoKind}
              onChange={e => onChange({ ...step, demoKind: e.target.value as typeof step.demoKind })}
              className={inputCls}
              style={inputStyle}
            >
              {kinds.map(k => (
                <option key={k.value} value={k.value}>
                  {isEs ? k.labelEs : k.labelEn}
                </option>
              ))}
            </select>
          </div>
          <textarea value={step.instructions} onChange={e => onChange({ ...step, instructions: e.target.value })}
            placeholder="Instructions (EN)" rows={2} className={inputCls} style={inputStyle} />
          <textarea value={step.instructionsEs} onChange={e => onChange({ ...step, instructionsEs: e.target.value })}
            placeholder="Instrucciones (ES)" rows={2} className={inputCls} style={inputStyle} />
        </div>
      );
    }

    case 'matching':
      return (
        <div className="space-y-2">
          <input value={step.title} onChange={e => onChange({ ...step, title: e.target.value })}
            placeholder="Title (EN)" className={inputCls} style={inputStyle} />
          <input value={step.titleEs} onChange={e => onChange({ ...step, titleEs: e.target.value })}
            placeholder="Título (ES)" className={inputCls} style={inputStyle} />
          <textarea value={step.instructions} onChange={e => onChange({ ...step, instructions: e.target.value })}
            placeholder="Instructions (EN)" rows={2} className={inputCls} style={inputStyle} />
          <textarea value={step.instructionsEs} onChange={e => onChange({ ...step, instructionsEs: e.target.value })}
            placeholder="Instrucciones (ES)" rows={2} className={inputCls} style={inputStyle} />
          <div className="text-[10px] text-gray-500">Pares (izquierda ↔ derecha)</div>
          {step.pairs.map((pair, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 items-center">
              <input value={pair.leftEs} onChange={e => onChange({
                ...step,
                pairs: step.pairs.map((p, ii) => ii === i ? { ...p, leftEs: e.target.value } : p)
              })}
                placeholder={`Término ${i + 1} (ES)`} className={inputCls} style={inputStyle} />
              <input value={pair.left} onChange={e => onChange({
                ...step,
                pairs: step.pairs.map((p, ii) => ii === i ? { ...p, left: e.target.value } : p)
              })}
                placeholder={`Term ${i + 1} (EN)`} className={inputCls} style={inputStyle} />
              <input value={pair.rightEs} onChange={e => onChange({
                ...step,
                pairs: step.pairs.map((p, ii) => ii === i ? { ...p, rightEs: e.target.value } : p)
              })}
                placeholder={`Definición (ES)`} className={inputCls} style={inputStyle} />
              <input value={pair.right} onChange={e => onChange({
                ...step,
                pairs: step.pairs.map((p, ii) => ii === i ? { ...p, right: e.target.value } : p)
              })}
                placeholder={`Definition (EN)`} className={inputCls} style={inputStyle} />
            </div>
          ))}
          <button onClick={() => onChange({ ...step, pairs: [...step.pairs, { left: '', leftEs: '', right: '', rightEs: '' }] })}
            className="text-[10px] text-cyan-400 hover:underline">+ {isEs ? 'agregar par' : 'add pair'}</button>
        </div>
      );

    case 'quiz':
      return (
        <div className="space-y-2">
          <input value={step.question} onChange={e => onChange({ ...step, question: e.target.value })}
            placeholder="Question (EN)" className={inputCls} style={inputStyle} />
          <input value={step.questionEs} onChange={e => onChange({ ...step, questionEs: e.target.value })}
            placeholder="Pregunta (ES)" className={inputCls} style={inputStyle} />
          {step.options.map((opt, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 items-center">
              <input value={opt.en} onChange={e => onChange({
                ...step,
                options: step.options.map((o, ii) => ii === i ? { ...o, en: e.target.value } : o)
              })}
                placeholder={`${isEs ? 'Opción' : 'Option'} ${i + 1} (EN)`} className={inputCls} style={inputStyle} />
              <input value={opt.es} onChange={e => onChange({
                ...step,
                options: step.options.map((o, ii) => ii === i ? { ...o, es: e.target.value } : o)
              })}
                placeholder="ES" className={inputCls} style={inputStyle} />
              <label className="flex items-center gap-1 text-[10px] text-gray-400">
                <input type="radio" checked={step.correctIndex === i} onChange={() => onChange({ ...step, correctIndex: i })} />
                {isEs ? 'Correcta' : 'Correct'}
              </label>
            </div>
          ))}
          <button onClick={() => onChange({ ...step, options: [...step.options, { es: '', en: '' }] })}
            className="text-[10px] text-cyan-400 hover:underline">+ {isEs ? 'agregar opción' : 'add option'}</button>
        </div>
      );
  }
}
