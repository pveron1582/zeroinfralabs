// Dark hero band for inner marketing pages (labs, blog)

import { useColors, FONT_MONO, FONT_SANS } from './constants';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Etiqueta corta junto al eyebrow (ej: "Beta") para marcar secciones en fase inicial */
  badge?: string;
}

export function PageHero({ eyebrow, title, subtitle, badge }: PageHeroProps) {
  const colors = useColors();
  return (
    <section className="relative overflow-hidden px-4 md:px-8 pt-12 pb-10 md:pt-14 md:pb-12 text-center"
      style={{ background: `linear-gradient(180deg, ${colors.heroBg} 0%, ${colors.heroBgSoft} 100%)`, fontFamily: FONT_SANS }}>
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, #10b98122 0%, transparent 65%)' }} />
      <div className="relative max-w-2xl mx-auto">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-emerald-400/90" style={{ fontFamily: FONT_MONO }}>
            {eyebrow}
            {badge && (
              <span
                data-testid="hero-badge"
                className="ml-2 inline-block align-middle rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider normal-case"
                style={{
                  fontFamily: FONT_MONO,
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#7dd3fc',
                  border: '1px solid rgba(56, 189, 248, 0.45)',
                }}
              >
                {badge}
              </span>
            )}
          </p>
        )}
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-3" style={{ lineHeight: 1.15 }}>{title}</h1>
        {subtitle && <p className="text-sm md:text-base text-slate-300 leading-relaxed">{subtitle}</p>}
      </div>
    </section>
  );
}
