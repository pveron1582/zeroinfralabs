// ── components/admin/lesson-builder/LessonPreviewLive.tsx ──────────
// Preview del Academy aplicado al draft de la lección.

import { useState } from 'react';
import type { Lesson } from '../../../types';
import type { LessonDraft } from '../LessonBuilder';
import { LessonContent } from '../../academy/LessonContent';

const MONO_FONT = "'Cascadia Code','Fira Code','Consolas',monospace";

export function LessonPreviewLive({ draft, isEs }: {
  draft: LessonDraft;
  isEs: boolean;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [matchSolved, setMatchSolved] = useState(false);

  // Convertir draft → Lesson (necesario para LessonContent)
  const lesson: Lesson = {
    id: draft.id,
    pathId: draft.pathId,
    order: draft.order,
    title: draft.title || '(sin título)',
    titleEs: draft.titleEs || draft.title || '(sin título)',
    readingMinutes: draft.readingMinutes,
    steps: draft.steps,
    labRef: draft.labRef,
  };

  const step = lesson.steps[stepIdx];
  if (!step) return <div className="text-gray-500 text-xs">ningún paso</div>;

  const totalSteps = lesson.steps.length;

  return (
    <div className="rounded-xl p-5" style={{ background: '#050a08', border: '1px solid #06b6d430', fontFamily: MONO_FONT }}>
      {/* Mini-header estilo Academy */}
      <div className="mb-4 pb-3 border-b" style={{ borderColor: '#1c2a2a' }}>
        <div className="text-[10px] text-gray-500 mb-1">{isEs ? 'PREVIEW DE LECCIÓN' : 'LESSON PREVIEW'}</div>
        <div className="text-sm font-bold text-gray-100">{isEs ? lesson.titleEs : lesson.title}</div>
        <div className="text-[10px] text-gray-500 mt-1">
          Paso {stepIdx + 1} / {totalSteps} · {lesson.readingMinutes} min
        </div>
      </div>

      {/* Step content */}
      <LessonContent
        step={step}
        isEs={isEs}
        lessonId={lesson.id}
        quizIdx={0}
        onQuizCorrect={() => setQuizAnswered(true)}
        onMatchSolved={() => setMatchSolved(true)}
      />

      {/* Mini-nav */}
      <div className="flex items-center justify-between mt-5 pt-3 border-t" style={{ borderColor: '#1c2a2a' }}>
        <button
          onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
          disabled={stepIdx === 0}
          className="text-[10px] px-2 py-1 rounded text-gray-400 hover:text-gray-200 disabled:opacity-30"
          style={{ border: '1px solid #1c2a2a' }}>
          ←
        </button>
        <div className="flex gap-1">
          {lesson.steps.map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full"
              style={{ background: i === stepIdx ? '#06b6d4' : i < stepIdx ? '#10b981' : '#1c2a2a' }} />
          ))}
        </div>
        <button
          onClick={() => { setStepIdx(Math.min(totalSteps - 1, stepIdx + 1)); setQuizAnswered(false); setMatchSolved(false); }}
          disabled={stepIdx === totalSteps - 1 || (step.type === 'quiz' && !quizAnswered) || (step.type === 'matching' && !matchSolved)}
          className="text-[10px] px-2 py-1 rounded font-bold text-cyan-300 hover:bg-cyan-400/10 disabled:opacity-30"
          style={{ border: '1px solid #06b6d440' }}>
          →
        </button>
      </div>
    </div>
  );
}
