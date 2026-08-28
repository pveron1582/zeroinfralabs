// ── components/academy/AcademyPath.tsx ─────────────────────────────
// Página de módulo (path o subsección) con el diseño del landing.
// Ver docs/ACADEMY_DESIGN.md.

import { Link, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useScenarioStore } from '../../store/scenarioStore';
import { getPath } from '../../academy';
import type { Lesson, AcademySubSection, ModuleIllustrationKey } from '../../types';
import { PageHero } from '../landing/PageHero';
import { useColors, FONT_MONO, FONT_SANS } from '../landing/constants';
import { ModuleIllustration } from './ModuleIllustration';

function LessonRow({ lesson, pathId, lang, isEs, completed }: {
  lesson: Lesson;
  pathId: string;
  lang: string;
  isEs: boolean;
  completed: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = useColors();
  const accent = colors.emerald;

  return (
    <Link
      to={`/${lang}/academy/${pathId}/${lesson.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex items-center gap-4 rounded-xl p-4 select-none cursor-pointer"
      style={{
        background: colors.sectionBg,
        border: `1px solid ${hovered ? `${accent}60` : colors.border}`,
        boxShadow: hovered ? `0 12px 40px ${accent}18, 0 0 0 1px ${accent}15` : '0 1px 3px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animationDelay: `${lesson.order * 90}ms`,
        animation: 'fadeInEntry 0.4s ease-out both',
      }}
    >
      <span
        className="text-xs font-bold px-2 py-1 rounded shrink-0"
        style={{
          fontFamily: FONT_MONO,
          background: completed ? `${accent}14` : colors.sectionAlt,
          color: completed ? accent : colors.textMuted,
          border: `1px solid ${completed ? `${accent}30` : colors.border}`,
        }}
      >
        {completed ? '✓' : String(lesson.order).padStart(2, '0')}
      </span>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold leading-snug group-hover:text-emerald-400 transition-colors" style={{ color: colors.text }}>
          {isEs ? lesson.titleEs : lesson.title}
        </h3>
        <p className="text-xs mt-0.5" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
          {lesson.readingMinutes} min · {lesson.steps.length} {isEs ? 'pasos' : 'steps'}
          {lesson.labRef && ` · ${isEs ? 'con práctica en lab' : 'with lab practice'}`}
        </p>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0"
        stroke={hovered ? accent : colors.textMuted} strokeWidth="2.5"
        style={{ transform: hovered ? 'translateX(2px)' : 'none', transition: 'transform 0.2s' }}>
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    </Link>
  );
}

export function AcademyPathPage() {
  const { lang, pathId, subId } = useParams<{ lang: string; pathId: string; subId?: string }>();
  const isEs = lang === 'es';
  const colors = useColors();
  const path = pathId ? getPath(pathId) : undefined;
  const { completedLessons } = useScenarioStore(useShallow(s => ({
    completedLessons: s.completedLessons,
  })));

  if (!path) return <Navigate to={`/${lang}/academy`} replace />;

  const subSections: AcademySubSection[] = path.subSections ?? [];

  // Sin sidebar: si el path tiene subsecciones, la ruta SIEMPRE es /module/:subId.
  if (subSections.length > 0) {
    const validSub = subId && subSections.some(s => s.id === subId);
    if (!validSub) return <Navigate to={`/${lang}/academy/${path.id}/module/${subSections[0].id}`} replace />;
  }

  const currentSub = subId ? subSections.find(s => s.id === subId) : undefined;
  const lessonsToShow = currentSub?.lessons ?? path.lessons;

  // Ilustración del módulo activo (path o subsección)
  const illustrationKey: ModuleIllustrationKey | undefined = currentSub?.illustration ?? path.illustration;
  const illustrationTitle = isEs ? (currentSub?.titleEs ?? path.titleEs) : (currentSub?.title ?? path.title);

  // Progreso global del path: todas las lecciones
  const allLessons = subSections.length > 0 ? subSections.flatMap(s => s.lessons) : path.lessons;
  const done = allLessons.filter(l => completedLessons.includes(l.id)).length;
  const total = allLessons.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.pageBg, fontFamily: FONT_SANS }}>
      <PageHero
        eyebrow={isEs ? 'Academia · Ciberseguridad' : 'Cybersecurity Academy'}
        title={isEs ? (currentSub?.titleEs ?? path.titleEs) : (currentSub?.title ?? path.title)}
        subtitle={isEs ? path.descriptionEs : path.description}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto relative px-4 md:px-8 py-10 md:py-12">
        {/* Contenido centrado como antes (880px) */}
        <div className="mx-auto w-full max-w-[880px]">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <Link
              to={`/${lang}/academy`}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors text-emerald-400 hover:text-emerald-300"
              style={{ color: colors.emerald }}
            >
              ← {isEs ? 'Todos los módulos' : 'All modules'}
            </Link>
            {/* Progreso del módulo */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-2.5"
              style={{ background: colors.sectionBg, border: `1px solid ${colors.border}` }}>
              <span className="text-xs" style={{ color: colors.textMuted }}>
                {done} {isEs ? 'de' : 'of'} {total} {isEs ? 'lecciones completadas' : 'lessons completed'}
              </span>
              <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ background: colors.border }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: colors.emerald }} />
              </div>
              <span className="text-xs font-bold" style={{ fontFamily: FONT_MONO, color: done > 0 ? colors.emerald : colors.textMuted }}>
                {pct}%
              </span>
            </div>
          </div>

          {/* Lista de lecciones del módulo activo */}
          <div className="space-y-3">
            {lessonsToShow.map(lesson => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                pathId={path.id}
                lang={lang || 'es'}
                isEs={isEs}
                completed={completedLessons.includes(lesson.id)}
              />
            ))}
          </div>
        </div>

        {/* Ilustración fija a la izquierda del contenido centrado (no empuja los bloques) */}
        {illustrationKey && (
          <div
            className="hidden xl:block absolute top-8 w-[220px]"
            style={{ left: 'calc(50% - 440px - 250px)' }}
          >
            <ModuleIllustration
              module={illustrationKey}
              title={illustrationTitle}
              accent={path.accentColor}
              isEs={isEs}
            />
          </div>
        )}
      </main>
    </div>
  );
}
