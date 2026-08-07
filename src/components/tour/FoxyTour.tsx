import { useEffect, useMemo, useState } from 'react';
import { FoxyFox } from './FoxyFox';
import { getTourSteps } from './tourSteps';
import type { Language } from '../../i18n/translations';

interface FoxyTourProps {
  open: boolean;
  isEs: boolean;
  onClose: () => void;
}

interface TargetRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const BUBBLE_W = 400;

export function FoxyTour({ open, isEs, onClose }: FoxyTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<TargetRect | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [closing, setClosing] = useState(false);
  const lang: Language = isEs ? 'es' : 'en';

  // Al reabrir el tour siempre comienza desde el primer paso
  useEffect(() => {
    if (open) {
      setStepIndex(0);
      setClosing(false);
    }
  }, [open]);

  // getTourSteps() depende del DOM: al abrirse el tour el escritorio ya
  // está montado y committeado, por eso se recalcula con `open`.
  const steps = useMemo(() => getTourSteps(), [open]);
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const isInteractive = !!step.interactive;

  // Recalcula el rectángulo del objetivo en cada paso
  useEffect(() => {
    if (!open) return;
    const measure = () => {
      if (!step.target) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.target);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ left: r.left, top: r.top, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open, stepIndex, step.target]);

  // Auto-avance en pasos interactivos:
  // - waitFor: avanza cuando el elemento aparece (ej: se abre una ventana)
  // - waitForHidden: avanza cuando el elemento desaparece (ej: se cierra el mapa)
  useEffect(() => {
    const waitFor = step.waitFor;
    const waitForHidden = step.waitForHidden;
    if (!open || (!waitFor && !waitForHidden)) return;
    let cancelled = false;
    let count = 0;
    let advanced = false;
    const check = () => {
      if (cancelled || advanced) return;
      const selector = waitFor || waitForHidden;
      const el = selector ? document.querySelector(selector) : null;
      const shouldAdvance = waitFor ? !!el : waitForHidden ? !el : false;
      if (shouldAdvance) {
        advanced = true;
        setTimeout(() => {
          if (!cancelled) setStepIndex(i => Math.min(i + 1, steps.length - 1));
        }, 250);
        return;
      }
      count += 1;
      // Cada ~1.2s anima la pista de "hacé clic"
      if (count % 8 === 0) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 600);
      }
    };
    const timer = setInterval(check, 150);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [open, step.waitFor, step.waitForHidden, stepIndex]);

  // Posición de la burbuja de diálogo
  const bubble = useMemo(() => {
    const width = Math.min(BUBBLE_W, window.innerWidth - 24);
    const h = 200;
    const margin = 16;
    if (!rect) {
      // Sin objetivo: centrada en el escritorio (vertical y horizontalmente).
      // Con align: 'right' se desplaza a la derecha (p. ej. el panel de
      // enumeración que todavía no existe al inicio del lab).
      const top = (window.innerHeight - h) / 2;
      const left = step.align === 'right'
        ? window.innerWidth - width - 48
        : (window.innerWidth - width) / 2;
      return {
        left,
        top,
        width,
        placement: 'bottom' as const,
        arrowLeft: '50%',
      };
    }
    const spaceBelow = window.innerHeight - rect.top - rect.height;
    const spaceAbove = rect.top;
    const spaceRight = window.innerWidth - rect.left - rect.width;
    const spaceLeft = rect.left;

    let placement: 'below' | 'above' | 'right' | 'left' = 'below';
    if (spaceBelow >= h + margin) placement = 'below';
    else if (spaceAbove >= h + margin) placement = 'above';
    else if (spaceRight >= width + margin) placement = 'right';
    else if (spaceLeft >= width + margin) placement = 'left';
    else placement = spaceBelow >= spaceAbove ? 'below' : 'above';

    let left = 0;
    let top = 0;
    if (placement === 'below') {
      top = rect.top + rect.height + 24;
      left = rect.left + rect.width / 2 - width / 2;
    } else if (placement === 'above') {
      top = rect.top - h - 24;
      left = rect.left + rect.width / 2 - width / 2;
    } else if (placement === 'right') {
      left = rect.left + rect.width + 24;
      top = rect.top + rect.height / 2 - h / 2;
    } else {
      left = rect.left - width - 24;
      top = rect.top + rect.height / 2 - h / 2;
    }

    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - h - 12));
    const arrowLeft = `${Math.min(90, Math.max(10, rect.left + rect.width / 2 - left))}px`;
    return { left, top, width, placement, arrowLeft };
  }, [rect, step.align]);

  const t = (es: string, en: string) => (isEs ? es : en);

  const goNext = () => {
    if (isLast) {
      close();
    } else {
      setStepIndex(i => i + 1);
    }
  };

  const goPrev = () => setStepIndex(i => Math.max(0, i - 1));

  const close = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 250);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none" aria-label={t('Guía con Foxy', 'Foxy tour')}>
      {/* Oscurecimiento: todo salvo el objetivo queda a oscuras */}
      {rect ? (
        <div
          className="pointer-events-none absolute"
          style={{
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
            borderRadius: 12,
            border: '2px solid #f59e0b',
            transition: 'all 0.3s ease',
            animation: 'foxyPulse 1.6s ease-in-out infinite',
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-black/70" style={{ animation: 'fadeIn 0.3s ease' }} />
      )}

      {/* Pista de "hacé clic" sobre el objetivo */}
      {showHint && rect && (
        <div
          className="pointer-events-none absolute text-amber-400 font-bold text-sm animate-bounce z-10"
          style={{ left: rect.left + rect.width / 2 - 60, top: rect.top - 32, width: 120, textAlign: 'center' }}
        >
          {t('¡Hacé clic!', 'Click here!')}
        </div>
      )}

      {/* Controles superiores */}
      {stepIndex > 0 && (
        <button
          onClick={close}
          className="pointer-events-auto absolute top-4 right-5 z-20 px-3 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
        >
          {t('Saltar', 'Skip')}
        </button>
      )}

      {/* Burbuja de diálogo con Foxy */}
      <div
        data-testid="foxy-bubble"
        className="pointer-events-auto absolute z-20 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-slate-900/95 backdrop-blur-md p-4 shadow-2xl"
        style={{
          left: bubble.left,
          top: bubble.top,
          width: bubble.width,
          animation: `${closing ? 'foxyClose' : 'foxyIn'} 0.25s ease`,
          opacity: closing ? 0 : 1,
        }}
      >
        <button
          onClick={close}
          aria-label={t('Salir de la guía', 'Exit guide')}
          title={t('Salir de la guía', 'Exit guide')}
          className="pointer-events-auto absolute top-2 right-2 z-20 flex items-center justify-center w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
        >
          ✕
        </button>
        {!rect && (
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              top: bubble.placement === 'above' ? -14 : undefined,
              bottom: bubble.placement === 'above' ? undefined : -14,
            }}
          />
        )}
        {rect && (bubble.placement === 'right' || bubble.placement === 'left') && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              right: bubble.placement === 'right' ? -14 : undefined,
              left: bubble.placement === 'left' ? -14 : undefined,
            }}
          />
        )}        <div className="flex-shrink-0 -mt-2 -ml-1">
          <FoxyFox size={64} />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <div className="text-sm font-bold text-amber-300 mb-1">{step.title[lang]}</div>
          <div className="text-[13px] leading-relaxed text-slate-200">{step.body[lang]}</div>

          <div className="flex flex-wrap items-center justify-between mt-4 gap-2">
            <div className="flex gap-1.5">
              {steps.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStepIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === stepIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'}`}
                  aria-label={`Paso ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && !isLast && (
                <button onClick={goPrev} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                  {t('Atrás', 'Back')}
                </button>
              )}
              <button
                onClick={goNext}
                disabled={isInteractive}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isInteractive
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : isLast
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                }`}
              >
                {isLast ? t('¡A trabajar!', 'Let\'s go!') : isInteractive ? t('Hacé clic', 'Click it') : t('Siguiente', 'Next')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes foxyPulse {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 3px rgba(245,158,11,0.6); }
          50% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 6px rgba(245,158,11,0.9); }
        }
        @keyframes foxyIn {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes foxyClose {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(10px) scale(0.96); }
        }
      `}</style>
    </div>
  );
}
