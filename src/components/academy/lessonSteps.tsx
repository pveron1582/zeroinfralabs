// ── components/academy/lessonSteps.tsx ─────────────────────────────
// Steps interactivos del Academy (quiz, matching, ejercicio práctico),
// con el diseño del landing. Ver docs/ACADEMY_DESIGN.md.

import { useEffect, useRef, useState } from 'react';
import type { LessonStep } from '../../types';
import { useScenarioStore } from '../../store/scenarioStore';
import { FoxyAssistantBubble } from './FoxyAssistantBubble';
import { LabMiniTerminal } from './LabMiniTerminal';
import { useColors, FONT_SANS } from '../landing/constants';

export function QuizStep({ step, isEs, lessonId, quizIdx, onCorrect }: {
  step: Extract<LessonStep, { type: 'quiz' }>;
  isEs: boolean;
  lessonId: string;
  quizIdx: number;
  onCorrect: () => void;
}) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);
  const recordQuizResult = useScenarioStore(s => s.recordQuizResult);
  const answered = selected !== null;
  const isCorrect = selected === step.correctIndex;

  const pick = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    recordQuizResult(lessonId, quizIdx, idx === step.correctIndex);
    if (idx === step.correctIndex) onCorrect();
  };

  const optStyle = (idx: number): React.CSSProperties => {
    const base: React.CSSProperties = { background: colors.sectionBg, border: `1px solid ${colors.border}`, color: colors.text };
    if (!answered) return base;
    if (idx === step.correctIndex) return { background: `${colors.emerald}14`, border: `1px solid ${colors.emerald}60`, color: colors.emerald };
    if (idx === selected) return { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' };
    return { ...base, opacity: 0.45 };
  };

  return (
    <div style={{ fontFamily: FONT_SANS }}>
      <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ fontFamily: FONT_SANS, color: colors.emerald }}>
        ❓ {isEs ? 'Comprobá lo aprendido' : 'Check yourself'}
      </div>
      <p className="text-sm font-bold mb-4" style={{ color: colors.text }}>
        {isEs ? step.questionEs : step.question}
      </p>
      <div className="space-y-2">
        {step.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => pick(idx)}
            disabled={answered}
            className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
            style={{ ...optStyle(idx), cursor: answered ? 'default' : 'pointer' }}
          >
            {answered && idx === step.correctIndex && '✓ '}
            {answered && idx === selected && idx !== step.correctIndex && '✗ '}
            {isEs ? opt.es : opt.en}
          </button>
        ))}
      </div>
      {answered && (
        <p className="text-xs mt-3 font-semibold" style={{ color: isCorrect ? colors.emerald : '#f59e0b' }}>
          {isCorrect
            ? (isEs ? '¡Correcto!' : 'Correct!')
            : (isEs ? 'No exactamente — la respuesta correcta está marcada en verde.' : 'Not quite — the correct answer is marked green.')}
        </p>
      )}
    </div>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MatchingStep({ step, isEs, onSolved }: {
  step: Extract<LessonStep, { type: 'matching' }>;
  isEs: boolean;
  onSolved: () => void;
}) {
  const colors = useColors();
  // La columna derecha se muestra barajada: rightOrder[i] = índice original en la posición i.
  const [rightOrder, setRightOrder] = useState<number[]>(() => shuffleArray(step.pairs.map((_, i) => i)));
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<{ left: number; right: number } | null>(null);
  const flashTimer = useRef<number | null>(null);

  const solved = locked.size === step.pairs.length;

  useEffect(() => () => {
    if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
  }, []);

  const tryMatch = (rightIdx: number) => {
    if (selectedLeft === null || locked.has(selectedLeft) || locked.has(rightIdx)) return;
    if (selectedLeft === rightIdx) {
      const next = new Set(locked);
      next.add(selectedLeft);
      setLocked(next);
      setSelectedLeft(null);
      if (next.size === step.pairs.length) onSolved();
    } else {
      // Par incorrecto: flash rojo en AMBOS elementos y timer sin pisar al anterior.
      setWrongFlash({ left: selectedLeft, right: rightIdx });
      setSelectedLeft(null);
      if (flashTimer.current !== null) window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => {
        setWrongFlash(null);
        flashTimer.current = null;
      }, 650);
    }
  };

  const reset = () => {
    setLocked(new Set());
    setSelectedLeft(null);
    setWrongFlash(null);
    setRightOrder(shuffleArray(step.pairs.map((_, i) => i)));
  };

  const itemStyle = (isLocked: boolean, isSelected: boolean, isWrong: boolean): React.CSSProperties => {
    if (isLocked) return { background: `${colors.emerald}14`, border: `1px solid ${colors.emerald}60`, color: colors.emerald };
    if (isWrong) return { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444' };
    if (isSelected) return { background: `${colors.cyan}14`, border: `1px solid ${colors.cyan}60`, color: colors.cyan };
    return { background: colors.sectionBg, border: `1px solid ${colors.border}`, color: colors.text };
  };

  return (
    <div className="rounded-xl p-4" style={{ background: colors.sectionBg, border: `1px solid ${colors.border}`, fontFamily: FONT_SANS }}>
      <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: colors.cyan }}>
        🧩 {isEs ? 'Emparejá los pares' : 'Match the pairs'}
      </div>
      <p className="text-sm font-bold mb-1" style={{ color: colors.text }}>{isEs ? step.titleEs : step.title}</p>
      <p className="text-xs mb-4" style={{ color: colors.textMuted }}>{isEs ? step.instructionsEs : step.instructions}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Columna izquierda: términos */}
        <div className="space-y-2">
          {step.pairs.map((pair, idx) => (
            <button
              key={idx}
              data-testid={`match-left-${idx}`}
              onClick={() => { if (!locked.has(idx)) setSelectedLeft(selectedLeft === idx ? null : idx); }}
              disabled={locked.has(idx)}
              className="w-full text-left px-3 py-2 rounded-xl text-xs transition-all"
              style={{ ...itemStyle(locked.has(idx), selectedLeft === idx, wrongFlash?.left === idx), cursor: locked.has(idx) ? 'default' : 'pointer' }}
            >
              {locked.has(idx) && '✓ '}
              {isEs ? pair.leftEs : pair.left}
            </button>
          ))}
        </div>
        {/* Columna derecha: definiciones barajadas */}
        <div className="space-y-2">
          {rightOrder.map(orig => (
            <button
              key={orig}
              data-testid={`match-right-${orig}`}
              onClick={() => tryMatch(orig)}
              disabled={locked.has(orig)}
              className="w-full text-left px-3 py-2 rounded-xl text-xs transition-all"
              style={{ ...itemStyle(locked.has(orig), false, wrongFlash?.right === orig), cursor: locked.has(orig) ? 'default' : 'pointer' }}
            >
              {locked.has(orig) && '✓ '}
              {isEs ? step.pairs[orig].rightEs : step.pairs[orig].right}
            </button>
          ))}
        </div>
      </div>

      {selectedLeft !== null && !solved && (
        <p className="text-[11px] mt-3" style={{ color: colors.cyan }}>
          {isEs ? 'Ahora tocá su pareja de la derecha →' : 'Now tap its match on the right →'}
        </p>
      )}
      {solved && (
        <div className="mt-4 p-3 rounded-xl text-center text-sm font-bold"
          style={{ background: `${colors.emerald}14`, border: `1px solid ${colors.emerald}60`, color: colors.emerald }}>
          {isEs ? '¡Todo emparejado! Podés continuar.' : 'All matched! You can continue.'}
        </div>
      )}
      <div className="mt-3 flex justify-end">
        <button
          onClick={reset}
          className="text-[10px] px-2.5 py-1 rounded-lg transition-colors"
          style={{ border: `1px solid ${colors.border}`, color: colors.textMuted, cursor: 'pointer' }}
        >
          ↺ {isEs ? 'Reiniciar' : 'Reset'}
        </button>
      </div>
    </div>
  );
}

export function PracticalExerciseStep({ step, isEs }: {
  step: Extract<LessonStep, { type: 'practical-exercise' }>;
  isEs: boolean;
}) {
  const colors = useColors();
  return (
    <div style={{ fontFamily: FONT_SANS }}>
      {/* Banner consigna — sin hint (eso va en Foxy flotante) */}
      <div className="rounded-xl p-4 mb-4" style={{ background: colors.sectionBg, border: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: colors.cyan }}>
            🎯 {isEs ? 'Ejercicio práctico' : 'Practical exercise'}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
          {isEs ? step.taskEs : step.task}
        </p>
        <p className="text-[11px] mt-3" style={{ color: colors.textMuted }}>
          {isEs
            ? '🦊 Foxy está abajo a la derecha — haz click si necesitas ayuda.'
            : '🦊 Foxy is at bottom-right — click if you need help.'}
        </p>
      </div>

      {/* Terminal del lab inline, debajo de la consigna */}
      {step.labId && <LabMiniTerminal labId={step.labId} isEs={isEs} />}

      {/* Foxy flotante con la pista */}
      <FoxyAssistantBubble
        task={step.task}
        taskEs={step.taskEs}
        hint={step.hint}
        hintEs={step.hintEs}
        isEs={isEs}
      />
    </div>
  );
}
