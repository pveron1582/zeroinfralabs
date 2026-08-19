// ── components/academy/AcademyAnnouncement.tsx ─────────────────────
// Ventana de anuncio de la Academy al ingresar al landing.
// Estética: diseño moderno tipo SaaS matching Landing Page (Inter font,
// glassmorphism dark slate, bordes sutiles, glow esmeralda, badges limpios).
//
// IMAGEN: si existe `public/academy-announcement.png` se muestra en el
// contenedor dedicado; si no, muestra un placeholder elegante con Foxy.

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../i18n/translations';
import { FoxyAcademyIllustration } from './FoxyAcademyIllustration';
import { FONT_SANS, FONT_MONO } from '../landing/constants';

const MODULES = [
  { icon: '🐧', es: 'Linux', en: 'Linux' },
  { icon: '🪟', es: 'Windows', en: 'Windows' },
  { icon: '🌐', es: 'Redes', en: 'Networking' },
  { icon: '🛡️', es: 'Ciberseguridad', en: 'Security' },
  { icon: '⚔️', es: 'Pentesting', en: 'Pentesting' },
  { icon: '💻', es: 'Scripting', en: 'Scripting' },
];

export function AcademyAnnouncement() {
  const language = useLanguage();
  const isEs = language === 'es';
  const [visible, setVisible] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Aparece suavemente tras cargar el hero del landing
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible) return null;

  const academyLink = `/${language}/academy`;
  const close = () => setVisible(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      style={{ fontFamily: FONT_SANS }}
    >
      {/* Backdrop con blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isEs ? 'Anuncio de la Academy' : 'Academy announcement'}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl shadow-black/80 backdrop-blur-xl z-10 animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(16, 185, 129, 0.15)',
        }}
      >
        {/* Glow de fondo superior */}
        <div
          className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Botón de cerrar superior */}
        <button
          onClick={close}
          aria-label={isEs ? 'Cerrar anuncio' : 'Close announcement'}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 transition-all shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Espacio dedicado para la imagen / ilustración */}
          <div className="md:col-span-5 relative min-h-[220px] md:min-h-full bg-slate-950/90 border-b md:border-b-0 md:border-r border-slate-800/80 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
            {!imgFailed ? (
              <img
                src="/academy-announcement.png"
                alt="ZeroInfra Academy"
                className="w-full h-full object-cover rounded-xl shadow-lg border border-slate-700/50 relative z-10"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <FoxyAcademyIllustration isEs={isEs} />
            )}
          </div>

          {/* Contenido descriptivo estilo Landing */}
          <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Badge "NUEVO" */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  style={{ fontFamily: FONT_MONO }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isEs ? 'NUEVA SECCIÓN' : 'NEW FEATURE'}
                </span>
              </div>

              {/* Título principal */}
              <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight mb-2">
                🎓 Academy
              </h2>

              {/* Subtítulo */}
              <p className="text-sm font-medium text-slate-300 mb-3 leading-snug">
                {isEs
                  ? 'Aprende los fundamentos paso a paso antes de entrar a los laboratorios.'
                  : 'Learn the core fundamentals step-by-step before diving into the labs.'}
              </p>

              {/* Descripción */}
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {isEs
                  ? 'Lecciones interactivas con mini terminales en vivo, simuladores visuales de red y cuestionarios prácticos para aprender desde cero.'
                  : 'Interactive lessons with embedded mini terminals, live network visualizers, and hands-on quizzes to start from ground zero.'}
              </p>

              {/* Módulos / Tags */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {MODULES.map((m) => (
                  <span
                    key={m.icon}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/60 shadow-sm"
                  >
                    {m.icon} {isEs ? m.es : m.en}
                  </span>
                ))}
              </div>
            </div>

            {/* Botones de acción (CTAs) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-slate-800/80">
              <Link
                to={academyLink}
                onClick={close}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #047857)',
                  boxShadow: '0 6px 20px -4px rgba(16, 185, 129, 0.4)',
                }}
              >
                {isEs ? 'Ir a la Academy' : 'Go to Academy'}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <button
                onClick={close}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 transition-colors"
              >
                {isEs ? 'Ahora no' : 'Not now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

