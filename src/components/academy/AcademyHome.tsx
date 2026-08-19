// ── components/academy/AcademyHome.tsx ─────────────────────────────
// Portada del Academy: mismo diseño que el landing / páginas internas
// (SiteHeader + PageHero + secciones con cards). Ver docs/ACADEMY_DESIGN.md.

import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useScenarioStore } from '../../store/scenarioStore';
import { ACADEMY_PATHS } from '../../academy/paths';
import type { Lesson } from '../../types';
import { SiteHeader } from '../landing/SiteHeader';
import { PageHero } from '../landing/PageHero';
import { MarketingFooter } from '../landing/MarketingFooter';
import { useColors, FONT_MONO, FONT_SANS } from '../landing/constants';

function ModuleCard({ title, description, icon, moduleId, index, done, total, isEs, to }: {
  title: string;
  description: string;
  icon: string;
  moduleId: string;
  index: number;
  done: number;
  total: number;
  isEs: boolean;
  to: string;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = useColors();
  const accent = colors.emerald;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <Link
      key={moduleId}
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex items-center gap-4 rounded-xl p-4 select-none cursor-pointer"
      style={{
        background: colors.sectionBg,
        border: `1px solid ${hovered ? `${accent}60` : colors.border}`,
        boxShadow: hovered ? `0 12px 40px ${accent}18, 0 0 0 1px ${accent}15` : '0 1px 3px rgba(15,23,42,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        animationDelay: `${index * 90}ms`,
        animation: 'fadeInEntry 0.4s ease-out both',
      }}
    >
      <span className="text-2xl shrink-0" aria-hidden>{icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold leading-snug group-hover:text-emerald-400 transition-colors" style={{ color: colors.text }}>
          {title}
        </h3>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: colors.textMuted }}>
          {description}
        </p>
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: colors.border }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: accent }} />
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="text-xs font-bold" style={{ fontFamily: FONT_MONO, color: done > 0 ? accent : colors.textMuted }}>
          {done}/{total}
        </span>
        <div className="text-[10px]" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
          {isEs ? 'lecciones' : 'lessons'}
        </div>
      </div>
    </Link>
  );
}

function GroupTitle({ icon, title, count, isEs }: { icon: string; title: string; count: number; isEs: boolean }) {
  const colors = useColors();
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="text-xl" aria-hidden>{icon}</span>
      <h2 className="text-lg md:text-xl font-bold" style={{ color: colors.text }}>{title}</h2>
      <span className="text-xs" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
        {count} {isEs ? (count === 1 ? 'módulo' : 'módulos') : count === 1 ? 'module' : 'modules'}
      </span>
    </div>
  );
}

export function AcademyHome() {
  const { lang } = useParams<{ lang: string }>();
  const isEs = lang === 'es';
  const colors = useColors();
  const { completedLessons } = useScenarioStore(useShallow(s => ({
    completedLessons: s.completedLessons,
  })));

  const osPath = ACADEMY_PATHS.find(p => p.id === 'os')!;
  const ciberPath = ACADEMY_PATHS.find(p => p.id === 'ciberseguridad')!;
  const pentestPath = ACADEMY_PATHS.find(p => p.id === 'hacking')!;
  const hackingWebPath = ACADEMY_PATHS.find(p => p.id === 'hacking-web')!;
  const scriptingPath = ACADEMY_PATHS.find(p => p.id === 'scripting')!;
  // Los 3 paths de redes: fundamentos → protocolos → avanzado
  const networkPaths = ACADEMY_PATHS.filter(p => ['redes', 'protocolos', 'protocolos-ii'].includes(p.id));

  const doneOf = (lessons: Lesson[]) => lessons.filter(l => completedLessons.includes(l.id)).length;
  const totalAll = ACADEMY_PATHS.reduce((acc, p) => acc + p.lessons.length, 0);
  const doneAll = completedLessons.length;
  const pct = totalAll === 0 ? 0 : Math.round((doneAll / totalAll) * 100);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: colors.pageBg, fontFamily: FONT_SANS }}>
      <SiteHeader activeNav="academy" />

      <PageHero
        eyebrow={isEs ? 'Academia · Ciberseguridad' : 'Cybersecurity Academy'}
        title={isEs ? 'Aprendé antes de entrar al lab' : 'Learn before entering the lab'}
        subtitle={isEs
          ? 'Cada módulo tiene lecciones cortas con ejemplos reales del simulador y práctica guiada.'
          : 'Each module has short lessons with real simulator examples and guided practice.'}
      />

      <main className="flex-1 w-full max-w-[880px] mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Progreso general */}
        <section
          data-testid="overall-progress"
          className="mb-12 rounded-xl p-5"
          style={{ background: colors.sectionBg, border: `1px solid ${colors.border}` }}
        >
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
                {isEs ? 'Tu progreso general' : 'Your overall progress'}
              </div>
              <div className="text-4xl font-bold" style={{ color: colors.text }}>
                {pct}<span style={{ color: colors.emerald }}>%</span>
              </div>
            </div>
            <div className="text-right min-w-[220px]">
              <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: colors.border }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${colors.emerald}, ${colors.cyan})` }} />
              </div>
              <div className="text-xs" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
                {doneAll}/{totalAll} {isEs ? 'lecciones' : 'lessons'}
              </div>
            </div>
          </div>
        </section>

        {/* SISTEMAS OPERATIVOS */}
        <section className="mb-12">
          <GroupTitle icon="🐧" title={isEs ? 'Sistemas Operativos' : 'Operating Systems'} count={osPath.subSections!.length} isEs={isEs} />
          <div className="space-y-3">
            {osPath.subSections!.map((sub, i) => (
              <ModuleCard
                key={sub.id}
                title={isEs ? sub.titleEs : sub.title}
                description={isEs ? osPath.descriptionEs : osPath.description}
                icon={sub.icon}
                moduleId={sub.id}
                index={i}
                done={doneOf(sub.lessons)}
                total={sub.lessons.length}
                isEs={isEs}
                to={`/${lang}/academy/os/module/${sub.id}`}
              />
            ))}
          </div>
        </section>

        {/* REDES */}
        <section className="mb-12">
          <GroupTitle icon="🌐" title={isEs ? 'Redes' : 'Networking'} count={networkPaths.length} isEs={isEs} />
          <div className="space-y-3">
            {networkPaths.map((p, i) => (
              <ModuleCard
                key={p.id}
                title={isEs ? p.titleEs : p.title}
                description={isEs ? p.descriptionEs : p.description}
                icon={p.icon}
                moduleId={p.id}
                index={i}
                done={doneOf(p.lessons)}
                total={p.lessons.length}
                isEs={isEs}
                to={`/${lang}/academy/${p.id}`}
              />
            ))}
          </div>
        </section>

        {/* HACKING ÉTICO */}
        <section>
          <GroupTitle icon="⚔️" title={isEs ? 'Hacking Ético' : 'Ethical Hacking'} count={3 + scriptingPath.subSections!.length} isEs={isEs} />
          <div className="space-y-3">
            <ModuleCard
              title={isEs ? ciberPath.titleEs : ciberPath.title}
              description={isEs ? ciberPath.descriptionEs : ciberPath.description}
              icon="🛡️"
              moduleId="ciberseguridad"
              index={0}
              done={doneOf(ciberPath.lessons)}
              total={ciberPath.lessons.length}
              isEs={isEs}
              to={`/${lang}/academy/ciberseguridad`}
            />
            <ModuleCard
              title={isEs ? pentestPath.titleEs : pentestPath.title}
              description={isEs ? pentestPath.descriptionEs : pentestPath.description}
              icon="⚔️"
              moduleId="hacking"
              index={1}
              done={doneOf(pentestPath.lessons)}
              total={pentestPath.lessons.length}
              isEs={isEs}
              to={`/${lang}/academy/hacking`}
            />
            <ModuleCard
              title={isEs ? hackingWebPath.titleEs : hackingWebPath.title}
              description={isEs ? hackingWebPath.descriptionEs : hackingWebPath.description}
              icon="🕸️"
              moduleId="hacking-web"
              index={2}
              done={doneOf(hackingWebPath.lessons)}
              total={hackingWebPath.lessons.length}
              isEs={isEs}
              to={`/${lang}/academy/hacking-web`}
            />
            <div className="pt-2 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: FONT_MONO, color: colors.textMuted }}>
              <span aria-hidden>💻 </span><span>{isEs ? 'Scripting para pentesting' : 'Pentesting Scripting'}</span>
            </div>
            {scriptingPath.subSections!.map((sub, i) => (
              <ModuleCard
                key={sub.id}
                title={isEs ? sub.titleEs : sub.title}
                description={isEs ? scriptingPath.descriptionEs : scriptingPath.description}
                icon={sub.icon}
                moduleId={sub.id}
                index={i + 3}
                done={doneOf(sub.lessons)}
                total={sub.lessons.length}
                isEs={isEs}
                to={`/${lang}/academy/scripting/module/${sub.id}`}
              />
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
