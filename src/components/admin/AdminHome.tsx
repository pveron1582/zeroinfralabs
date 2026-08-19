// ── components/admin/AdminHome.tsx ──────────────────────────────
// Hub de bienvenida del panel de administración con tarjetas de secciones

import { useState, useEffect } from 'react';
import { MONO_FONT, ShieldIcon } from './shared';

interface SectionCard {
  id: string;
  icon: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  accent: string;
  available: boolean;
  badge?: { es: string; en: string };
}

export function AdminHome({ isEs, scenariosCount, onEnterSandbox, onEnterBuilder, onEnterLessons, onExit }: {
  isEs: boolean;
  scenariosCount: number;
  onEnterSandbox: () => void;
  onEnterBuilder: () => void;
  onEnterLessons: () => void;
  onExit: () => void;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const cards: SectionCard[] = [
    {
      id: 'sandbox',
      icon: '🖥️',
      titleEs: 'Sandbox / Debug',
      titleEn: 'Sandbox / Debug',
      descEs: `Cargá cualquiera de los ${scenariosCount} labs en modo prueba con el panel de debug en vivo.`,
      descEn: `Load any of the ${scenariosCount} labs in test mode with the live debug panel.`,
      accent: '#10b981',
      available: true,
    },
    {
      id: 'builder',
      icon: '🧩',
      titleEs: 'Lab Builder',
      titleEn: 'Lab Builder',
      descEs: 'Armá labs a medida con piezas: sitios web, credenciales y vulnerabilidades. Compartilos con otros.',
      descEn: 'Build custom labs from pieces: websites, credentials and vulnerabilities. Share them with others.',
      accent: '#06b6d4',
      available: true,
      badge: { es: 'Nuevo', en: 'New' },
    },
    {
      id: 'foxy',
      icon: '🦊',
      titleEs: 'Asistente Foxy',
      titleEn: 'Foxy Assistant',
      descEs: 'Configurá cómo Foxy ayuda a resolver las misiones: pistas, soluciones paso a paso y nivel de ayuda.',
      descEn: 'Configure how Foxy helps solve missions: hints, step-by-step solutions and help level.',
      accent: '#f59e0b',
      available: false,
      badge: { es: 'Próximamente', en: 'Coming soon' },
    },
    {
      id: 'lessons',
      icon: '📝',
      titleEs: 'Lesson Builder',
      titleEn: 'Lesson Builder',
      descEs: 'Creá y editá lecciones del Academy: textos, quizzes, ejercicios y videos. Exportá como .ts.',
      descEn: 'Create and edit Academy lessons: texts, quizzes, exercises and videos. Export as .ts.',
      accent: '#a78bfa',
      available: true,
      badge: { es: 'Nuevo', en: 'New' },
    },
    {
      id: 'analytics',
      icon: '📊',
      titleEs: 'Analíticas',
      titleEn: 'Analytics',
      descEs: 'Métricas de uso del simulador: labs más jugados, misiones abandonadas y tiempos promedio.',
      descEn: 'Simulator usage metrics: most played labs, abandoned missions and average times.',
      accent: '#a78bfa',
      available: false,
      badge: { es: 'Próximamente', en: 'Coming soon' },
    },
  ];

  const pad = (n: number) => String(n).padStart(2, '0');
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b1015', fontFamily: MONO_FONT }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #1c2a2a', background: '#0d1117' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10b981', boxShadow: '0 0 14px #10b98138' }}>
            <ShieldIcon />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-200">ZeroInfra Admin</div>
            <div className="text-[10px] text-gray-500">{isEs ? 'Centro de control' : 'Control center'}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-emerald-400 font-mono tabular-nums" aria-label={isEs ? 'hora actual' : 'current time'}>{clock}</span>
          <button onClick={onExit}
            className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-all"
            style={{ border: '1px solid #1c2a2a' }}>
            ← {isEs ? 'Salir' : 'Exit'}
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="px-6 pt-10 pb-6 max-w-5xl mx-auto w-full">
        <p className="text-emerald-400 text-xs font-mono mb-2">$ sudo zeroinfra --admin</p>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">
          {isEs ? 'Bienvenido al cuartel general' : 'Welcome to headquarters'}
        </h1>
        <p className="text-sm text-gray-500 max-w-xl">
          {isEs
            ? 'Desde acá probás labs, vas a poder crearlos con piezas reutilizables y configurar la ayuda de Foxy.'
            : 'From here you test labs, and soon you will be able to build them from reusable pieces and configure Foxy\'s help.'}
        </p>
      </div>

      {/* Cards */}
      <div className="px-6 pb-10 max-w-5xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => {
              if (!card.available) return;
              if (card.id === 'sandbox') onEnterSandbox();
              if (card.id === 'builder') onEnterBuilder();
              if (card.id === 'lessons') onEnterLessons();
            }}
            disabled={!card.available}
            className="text-left p-5 rounded-2xl transition-all relative group"
            style={{
              background: '#0d1117',
              border: `1px solid ${card.available ? card.accent + '40' : '#1c2a2a'}`,
              cursor: card.available ? 'pointer' : 'default',
              opacity: card.available ? 1 : 0.75,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl" role="img" aria-hidden>{card.icon}</span>
              {card.badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: card.accent + '18', color: card.accent, border: `1px solid ${card.accent}30` }}>
                  {isEs ? card.badge.es : card.badge.en}
                </span>
              )}
              {card.available && (
                <span className="text-[10px] px-2 py-0.5 rounded-full text-gray-500 group-hover:text-gray-300"
                  style={{ border: '1px solid #1c2a2a' }}>
                  {isEs ? 'Abrir →' : 'Open →'}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-gray-200 mb-1.5" style={{ color: card.available ? undefined : '#9ca3af' }}>
              {isEs ? card.titleEs : card.titleEn}
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isEs ? card.descEs : card.descEn}
            </p>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 text-center">
        <p className="text-[10px] text-gray-600">
          ZeroInfra Labs · {isEs ? 'Panel interno de desarrollo' : 'Internal development panel'} · v2
        </p>
      </div>
    </div>
  );
}
