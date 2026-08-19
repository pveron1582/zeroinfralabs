# DESIGN.md — Academy (Ciberseguridad)

La Academy usa **el mismo diseño que el landing / marketing pages** (hero oscuro + contenido claro, emerald accent, Inter). La propuesta "expediente táctico" (propuesta_diseno_v4.html) fue probada y descartada: no quedaba bien. No inventar un tercer lenguaje visual.

Los tokens ya existen: `src/components/landing/constants.ts` (`useColors()`, `FONT_SANS`, `FONT_MONO`). Los componentes compartidos también: `SiteHeader`, `PageHero`, `MarketingFooter`.

## Estructura de página (patrón de las páginas internas)

```
SiteHeader (activeNav="academy", sticky, backdrop-blur)
PageHero (banda oscura con eyebrow + título + subtítulo)
Contenido en secciones (bg colores.pageBg / sectionBg)
MarketingFooter
```

Así están armadas las páginas de labs (`LabGrid.tsx`) y blog: hero oscuro arriba, cuerpo abajo. La Academy debe verse igual.

## Color

Tokens de `constants.ts` — la app soporta tema claro/oscuro vía `useScenarioStore.theme`:

| Rol | Dark | Light |
|---|---|---|
| Accent principal | `#10b981` (emerald) | igual |
| Accent oscuro (gradientes) | `#047857` | igual |
| Accent secundario | `#0891b2` (cyan) | igual |
| Fondo hero | `#030712` | `#0f172a` |
| Fondo hero suave | `#0f172a` | `#1e293b` |
| Fondo de página | `#0a0e14` | `#ffffff` |
| Fondo de sección | `#0f172a` | `#f8fafc` |
| Fondo sección alt | `#11161f` | `#f1f5f9` |
| Texto | `#e2e8f0` | `#0f172a` |
| Texto muted | `#94a3b8` | `#64748b` |
| Bordes | `#1e293b` | `#e2e8f0` |
| Bordes oscuro | `#334155` | igual |

Regla: los acentos vivos son solo emerald y cyan, y se usan para estado/acción (CTAs, progreso activo, hover). El resto vive en la escala slate del tema.

## Hero / PageHero

- `linear-gradient(180deg, heroBg 0%, heroBgSoft 100%)`
- Grid de puntos: `radial-gradient(circle, #334155 1px, transparent 1px)`, `background-size: 28px 28px`, opacidad ~0.3
- Glow emerald superior: `radial-gradient(ellipse 60% 50% at 50% 0%, #10b98122 0%, transparent 65%)`
- **Eyebrow**: `text-xs font-semibold tracking-widest uppercase`, `text-emerald-400/90`, `FONT_MONO`
- **Título**: blanco, bold, 24px→40px (Inter), `line-height: 1.15`
- **Subtítulo**: `text-slate-300`, 14–16px

## Tipografía

- **UI y headings**: `FONT_SANS` = Inter (cargada en index.html vía Google Fonts)
- **Datos/code/metadata técnica**: `FONT_MONO` = `'Cascadia Code', 'Fira Code', 'Consolas', monospace`. Los terminales y demos de terminal viven en su propio canvas oscuro (`#050a08` / `#0a0f16`) — ahí el mono es obligatorio.
- No mezclar otras fuentes.

## Componentes y patrones

**Cards** (patrón `ScenarioCard` de la grilla de labs):
- `border-radius: 12px`, `border: 1px solid colors.border`, fondo `sectionBg` (light: blanco; dark: `#11161f`)
- Hover: `translateY(-4px)`, borde → `accent60`, sombra con tinte de accent: `0 12px 40px ${accent}18, 0 0 0 1px ${accent}15`
- Transition `all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Entrada: animación `cardIn` (definida en `src/index.css`) con delay escalonado `index * 90ms`
- Chips/badges de metadata: mono, xs, `background: ${accent}14`, `color: accent`, `border: 1px solid ${accent}25`

**Botones**:
- CTA primario: `linear-gradient(135deg, emerald, emeraldDark)`, `rounded-xl`, blanco bold, sombra `0 8px 32px #10b98140`, hover `scale-[1.03]`
- Secundario: borde `border-slate-600` (sobre oscuro) / `colors.border` (claro), texto slate, hover → emerald

**Progreso del Academy**:
- Barra fina o número con barra delgada, en emerald cuando está activo; track en `colors.border` / slate-700. Sin pills pesadas ni cajas con borde grueso; nada de gradientes multicolor por categoría.
- Estado de lección completada: emerald. Bloqueada: `textMuted` con candado/icono sutil, no otro color.

**Secciones**: alternar `pageBg` y `sectionBg` para separar bloques (como el landing). Padding vertical 56–80px, contenedores `max-w-2xl` a `max-w-5xl` centrados, `px-4 md:px-8`.

## Qué evitar

- Paletas paralelas propias de la Academy (la paleta expediente quedó descartada; no re-crear archivos de tema propios — usar `landing/constants.ts`).
- Fuentes decorativas tipo máquina de escribir fuera de los demos de terminal.
- Colores distintos por categoría de módulo (el color es para estado/acción, no para clasificar).
- Sombras y elevaciones genéricas de dashboard SaaS sin el tinte de accent.
- Ignorar el tema claro/oscuro: usar siempre los tokens de `useColors()`, no hex hardcodeados solo para dark.

## Referencias vivas

- `src/components/landing/constants.ts` — tokens de color y fuentes
- `src/components/landing/PageHero.tsx` — hero de páginas internas
- `src/components/landing/SiteHeader.tsx` / `MarketingFooter.tsx` — chrome compartido
- `src/components/labGrid/ScenarioCard.tsx` — patrón de card
- `src/components/LandingPage.tsx` — landing principal (hero, secciones alternadas, CTAs)
- `docs/propuesta_diseno_v4.html` — propuesta expediente descartada (histórico)
