// ── components/academy/LessonContent.tsx ───────────────────────────
// Renderiza cada tipo de paso de una lección del Academy.
// Diseño identico al landing: ver docs/ACADEMY_DESIGN.md.
// Los steps interactivos (quiz/matching/ejercicio) viven en lessonSteps.tsx.

import type { LessonStep } from '../../types';
import { FoxyNarrator } from './FoxyNarrator';
import { AcademyVideo } from './AcademyVideo';
import { NetworkHomeLab } from './NetworkHomeLab';
import { NetworkDMZLab } from './NetworkDMZLab';
import { NetworkMitmLab } from './NetworkMitmLab';
import { NetworkTopologyLab } from './NetworkTopologyLab';
import { QuizStep, MatchingStep, PracticalExerciseStep } from './lessonSteps';
import { useColors, FONT_MONO } from '../landing/constants';

function ContentStep({ step, isEs }: { step: Extract<LessonStep, { type: 'content' }>; isEs: boolean }) {
  const colors = useColors();
  // Render inline code: splits on `backticks` and highlights segments.
  const renderInline = (text: string) =>
    text.split('`').map((seg, i) =>
      i % 2 === 1
        ? (
          <code key={i} className="px-1.5 py-0.5 rounded text-[0.85em]" style={{ fontFamily: FONT_MONO, background: `${colors.emerald}14`, color: colors.emerald }}>
            {seg}
          </code>
        )
        : <span key={i}>{seg}</span>
    );

  return (
    <div>
      <h2 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
        {isEs ? step.titleEs : step.title}
      </h2>
      <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
        {renderInline(isEs ? step.bodyEs : step.body)}
      </p>
    </div>
  );
}

function TerminalDemoStep({ step, isEs }: { step: Extract<LessonStep, { type: 'terminal-demo' }>; isEs: boolean }) {
  const colors = useColors();
  return (
    <div>
      {/* Ventana de terminal: canvas oscuro propio, como en el landing */}
      <div className="rounded-xl overflow-hidden mb-3 border shadow-2xl" style={{ borderColor: '#1e293b' }}>
        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/95 border-b border-slate-800/80">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-2 text-[10px] text-slate-400" style={{ fontFamily: FONT_MONO }}>kali@attacker-01</span>
        </div>
        <div className="p-4 text-[12px] leading-relaxed" style={{ fontFamily: FONT_MONO, background: '#050a08' }}>
          <div className="text-emerald-400">$ {step.command}</div>
          <pre className="text-slate-400 mt-1 whitespace-pre-wrap">{step.output}</pre>
        </div>
      </div>
      <p className="text-sm leading-relaxed border-l-2 pl-3" style={{ borderColor: colors.emerald, color: colors.textMuted }}>
        {isEs ? step.explanationEs : step.explanation}
      </p>
    </div>
  );
}

function LabChallengeStep({ step, isEs }: { step: Extract<LessonStep, { type: 'lab-challenge' }>; isEs: boolean }) {
  const colors = useColors();
  return (
    <div className="p-5 rounded-xl" style={{ background: colors.sectionBg, border: `1px solid ${colors.border}` }}>
      <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.cyan }}>
        🧪 {isEs ? 'Práctica en el lab' : 'Lab practice'}
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: colors.text }}>
        {isEs ? step.missionObjectiveEs : step.missionObjective}
      </p>
      <a
        href={`/${isEs ? 'es' : 'en'}/scenario/${step.labId}`}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.03]"
        style={{ background: `linear-gradient(135deg, ${colors.cyan}, ${colors.emeraldDark})`, boxShadow: '0 8px 32px #10b98140' }}
      >
        {isEs ? 'Abrir el lab →' : 'Open the lab →'}
      </a>
      <p className="text-[10px] mt-2" style={{ color: colors.textMuted }}>
        {isEs ? 'El lab se abre completo. Volvé acá cuando termines las misiones indicadas.' : 'The lab opens in full. Come back here when you finish the indicated missions.'}
      </p>
    </div>
  );
}

function VideoStep({ step, isEs }: {
  step: Extract<LessonStep, { type: 'video' }>;
  isEs: boolean;
}) {
  const colors = useColors();
  return (
    <div>
      <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.cyan }}>
        🎬 {isEs ? 'Mira esto' : 'Watch this'}
      </div>
      <AcademyVideo
        src={step.src}
        poster={step.poster}
        durationSec={step.durationSec}
        caption={step.caption}
        captionEs={step.captionEs}
        isEs={isEs}
      />
    </div>
  );
}

function InteractiveDemoStep({ step, isEs }: {
  step: Extract<LessonStep, { type: 'interactive-demo' }>;
  isEs: boolean;
}) {
  const colors = useColors();
  return (
    <div>
      <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: colors.cyan }}>
        🧪 {isEs ? 'Simulador interactivo' : 'Interactive simulator'}
      </div>
      <p className="text-xs mb-3" style={{ color: colors.textMuted }}>
        {isEs ? step.instructionsEs : step.instructions}
      </p>
      {step.demoKind === 'network-home' && <NetworkHomeLab isEs={isEs} />}
      {step.demoKind === 'network-dmz' && <NetworkDMZLab isEs={isEs} />}
      {step.demoKind === 'network-mitm' && <NetworkMitmLab isEs={isEs} />}
      {step.demoKind === 'network-topology' && <NetworkTopologyLab isEs={isEs} />}
    </div>
  );
}

export function LessonContent({ step, isEs, lessonId, quizIdx, onQuizCorrect, onMatchSolved }: {
  step: LessonStep;
  isEs: boolean;
  lessonId: string;
  quizIdx?: number;
  onQuizCorrect: () => void;
  onMatchSolved?: () => void;
}) {
  switch (step.type) {
    case 'content':
      return <ContentStep step={step} isEs={isEs} />;
    case 'terminal-demo':
      return <TerminalDemoStep step={step} isEs={isEs} />;
    case 'lab-challenge':
      return <LabChallengeStep step={step} isEs={isEs} />;
    case 'quiz':
      return <QuizStep step={step} isEs={isEs} lessonId={lessonId} quizIdx={quizIdx ?? 0} onCorrect={onQuizCorrect} />;
    case 'practical-exercise':
      return <PracticalExerciseStep step={step} isEs={isEs} />;
    case 'foxy-narrator':
      return <FoxyNarrator messages={step.messages} isEs={isEs} />;
    case 'video':
      return <VideoStep step={step} isEs={isEs} />;
    case 'interactive-demo':
      return <InteractiveDemoStep step={step} isEs={isEs} />;
    case 'matching':
      return <MatchingStep step={step} isEs={isEs} onSolved={onMatchSolved ?? (() => {})} />;
  }
}
