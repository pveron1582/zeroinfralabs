// ── components/academy/LessonViewer.tsx ────────────────────────────
// Lector de lección: stepper con navegación y botón "completar".
// Diseño identico al landing: hero oscuro + cuerpo claro. Ver ACADEMY_DESIGN.md.

import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useScenarioStore } from '../../store/scenarioStore';
import { getPath, getLesson, getSubIdForLesson } from '../../academy';
import { SiteHeader } from '../landing/SiteHeader';
import { LessonContent } from './LessonContent';
import { useColors, FONT_MONO, FONT_SANS } from '../landing/constants';

export function LessonViewer() {
  const { lang, pathId, lessonId } = useParams<{ lang: string; pathId: string; lessonId: string }>();
  const isEs = lang === 'es';
  const colors = useColors();
  const navigate = useNavigate();
  const path = pathId ? getPath(pathId) : undefined;
  const lesson = pathId && lessonId ? getLesson(pathId, lessonId) : undefined;

  const { completedLessons, markLessonCompleted } = useScenarioStore(useShallow(s => ({
    completedLessons: s.completedLessons,
    markLessonCompleted: s.markLessonCompleted,
  })));

  const [stepIdx, setStepIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [matchSolved, setMatchSolved] = useState(false);

  if (!path || !lesson) return <Navigate to={`/${lang}/academy`} replace />;

  // Destino de "salir de la lección": la subsección del path si existe (module/x), si no el path.
  // Antes se usaba lesson.labRef (id de scenario, no de módulo) → devolvía a /academy/os.
  const subId = getSubIdForLesson(path.id, lesson.id);
  const backTarget = `/${lang}/academy/${path.id}${subId ? `/module/${subId}` : ''}`;

  const step = lesson.steps[stepIdx];
  const isLast = stepIdx === lesson.steps.length - 1;
  const alreadyCompleted = completedLessons.includes(lesson.id);
  // Los quizzes y los ejercicios de emparejar bloquean el avance hasta resolverse.
  const blockedByQuiz = (step.type === 'quiz' && !quizAnswered) || (step.type === 'matching' && !matchSolved);

  const goNext = () => {
    if (isLast) {
      markLessonCompleted(lesson.id);
      // Vuelve a la subsección del path (module/x) si la tiene, si no al path
      navigate(backTarget);
      return;
    }
    setStepIdx(stepIdx + 1);
    setQuizAnswered(false);
    setMatchSolved(false);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.pageBg, fontFamily: FONT_SANS }}>
      <SiteHeader activeNav="academy" />

      {/* Hero compacto de la lección */}
      <section className="relative overflow-hidden px-4 md:px-8 pt-8 pb-8 text-center"
        style={{ background: `linear-gradient(180deg, ${colors.heroBg} 0%, ${colors.heroBgSoft} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, #10b98122 0%, transparent 65%)' }} />
        <div className="relative max-w-2xl mx-auto">
          <Link to={backTarget} className="text-xs font-semibold tracking-widest uppercase text-emerald-400/90 hover:text-emerald-300 transition-colors" style={{ fontFamily: FONT_MONO }}>
            ← {isEs ? path.titleEs : path.title}
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-3 mb-2" style={{ lineHeight: 1.15 }}>
            {isEs ? lesson.titleEs : lesson.title}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            {lesson.readingMinutes} min · {isEs ? 'Paso' : 'Step'} {stepIdx + 1} {isEs ? 'de' : 'of'} {lesson.steps.length}
            {alreadyCompleted && (
              <span className="ml-3 inline-flex items-center gap-1 text-emerald-400 font-semibold">
                ✓ {isEs ? 'Completada' : 'Completed'}
              </span>
            )}
          </p>
          {/* Progreso de la lección */}
          <div className="mt-4 max-w-xs mx-auto h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148,163,184,0.25)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${((stepIdx + 1) / lesson.steps.length) * 100}%`, background: colors.emerald }} />
          </div>
        </div>
      </section>

      {/* Cuerpo de la lección */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="mb-8" data-testid="lesson-step">
          <LessonContent
            step={step}
            isEs={isEs}
            lessonId={lesson.id}
            quizIdx={lesson.steps.slice(0, stepIdx + 1).filter(s => s.type === 'quiz').length - 1}
            onQuizCorrect={() => setQuizAnswered(true)}
            onMatchSolved={() => setMatchSolved(true)}
          />
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between gap-4 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={() => { setStepIdx(Math.max(0, stepIdx - 1)); setQuizAnswered(false); setMatchSolved(false); }}
            disabled={stepIdx === 0}
            className="text-xs px-4 py-2.5 rounded-xl font-semibold transition-colors"
            style={{
              border: `1px solid ${colors.border}`,
              color: stepIdx === 0 ? colors.textMuted : colors.text,
              opacity: stepIdx === 0 ? 0.4 : 1,
              cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
              background: colors.sectionBg,
            }}
          >
            ← {isEs ? 'Anterior' : 'Previous'}
          </button>
          <div className="flex gap-1.5">
            {lesson.steps.map((_, i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full"
                style={{ background: i === stepIdx ? colors.emerald : i < stepIdx ? colors.cyan : colors.border }} />
            ))}
          </div>
          <button
            onClick={goNext}
            disabled={blockedByQuiz}
            className="text-xs px-4 py-2.5 rounded-xl font-bold text-white transition-all"
            style={{
              background: blockedByQuiz ? colors.border : `linear-gradient(135deg, ${colors.emerald}, ${colors.emeraldDark})`,
              color: blockedByQuiz ? colors.textMuted : '#ffffff',
              boxShadow: blockedByQuiz ? 'none' : '0 8px 32px #10b98140',
              cursor: blockedByQuiz ? 'not-allowed' : 'pointer',
            }}
          >
            {isLast
              ? (isEs ? 'Completar lección ✓' : 'Complete lesson ✓')
              : (isEs ? 'Siguiente →' : 'Next →')}
          </button>
        </div>
      </main>
    </div>
  );
}
