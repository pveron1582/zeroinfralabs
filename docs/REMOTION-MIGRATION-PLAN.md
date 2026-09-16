# Plan: Migración Piloto Remotion — Li05, Pe01, Re01

## Objetivo
Unificar 3 pares ES/EN en composiciones con `lang` prop, eliminando 3 archivos `*En.tsx`.

## Patrón arquitectónico

Cada composición unified exporta `React.FC<{ lang: 'es' | 'en' }>`. Internamente usa:

```tsx
const COPY = {
  es: { /* textos */ },
  en: { /* textos */ },
} as const;

const BEATS = {
  es: { /* timing values (seconds) */ },
  en: { /* timing values (seconds) */ },
} as const;
```

Los componentes Scene N reciben `copy` y `beats` como props (no importan por lang).

## Archivos a crear/modificar

| Acción | Archivo | LOC estimadas |
|--------|---------|---------------|
| REESCRIBIR | `Li05Permissions.tsx` | ~200 |
| REESCRIBIR | `Pe01PentestPhases.tsx` | ~100 |
| REESCRIBIR | `Re01NetworkTypes.tsx` | ~130 |
| ELIMINAR | `Li05PermissionsEn.tsx` | - |
| ELIMINAR | `Pe01PentestPhasesEn.tsx` | - |
| ELIMINAR | `Re01NetworkTypesEn.tsx` | - |
| MODIFICAR | `Root.tsx` | 118 → ~200 |

---

## 1. Li05Permissions.tsx (343+333 → ~200 LOC)

### COPY
```
Scene1: title, subtitle, noiseReveal, privReveal
Scene2: typeExplanation, legend, nums, key (text), groups[{owner}]
Scene3: heading, meaning, secondary, find
Scene4: heading, desc644, desc4755, bonus, smile
```

### BEATS (en segundos, el componente multiplica por fps)
```
Scene1: titleEnd, cps, noiseAt, privAt
Scene2: typeAt, groupsAt, legendAt, ownersAt, numsAt, sumAt, keyAt
Scene3: suidAt, meaningAt, secondaryOffset, findAt
Scene4: normalAt, suidAt, bonusAt, smileAt
```

### Diferencias exactas ES→EN
| Campo | ES | EN |
|-------|----|----|
| S1 title | `¿MUCHO GUIÓN Y LETRAS?` | `A BUNCH OF DASHES AND LETTERS?` |
| S1 subtitle | `al inicio de cada archivo...` | `at the start of every file...` |
| S1 noiseReveal | `parece ruido...` | `it looks like noise...` |
| S1 privReveal | `aprender a leerlo...` | `learning to read it...` |
| S1 titleEnd | `1.4` | `2.2` |
| S1 cps | `6` | `4.5` |
| S1 noiseAt | `9.2` | `10.3` |
| S1 privAt | `11.0` | `15.1` |
| S2 groups | `dueño/grupo/otros` | `owner/group/others` |
| S2 typeExplanation | `primer carácter = tipo...` | `first character = type...` |
| S2 legend | `r = lectura...` | `r = read...` |
| S2 nums | `cada letra vale...` | `each letter is worth...` |
| S2 key | `rw- = 4+2 = 6... de un vistazo` | `rw- = 4+2 = 6... at a glance` |
| S2 typeAt | `1.4` | `1.3` |
| S2 groupsAt | `4.5` | `9.4` |
| S2 legendAt | `8.2` | `13.6` |
| S2 ownersAt | `8.6` | `17.2` |
| S2 numsAt | `12.4` | `22.9` |
| S2 sumAt | `17.0` | `32.0` |
| S2 keyAt | `23.0` | `35.9` |
| S3 heading | `EL CASO QUE TE INTERESA...` | `THE CASE YOU CARE ABOUT...` |
| S3 meaning | `la s en el grupo... SUID...` | `the s in the owner's group... SUID...` |
| S3 secondary | `un usuario normal...` | `a regular user...` |
| S3 find | `buscar binarios...` | `hunting binaries...` |
| S3 suidAt | `2.9` | `4.8` |
| S3 meaningAt | `10.0` | `10.7` |
| S3 secondaryOffset | `2.5` | `3.0` |
| S3 findAt | `16.0` | `22.7` |
| S4 heading | `REPASEMOS CON NÚMEROS` | `LET'S REVIEW WITH NUMBERS` |
| S4 desc644 | `dueño: leer+escribir...` | `owner: read+write...` |
| S4 desc4755 | `el 4 al inicio = SUID...` | `the 4 up front = SUID...` |
| S4 bonus | `en un pentest...` | `on a pentest...` |
| S4 smile | `cuando lo veas...` | `when you see it...` |
| S4 normalAt | `1.5` | `1.8` |
| S4 suidAt | `8.5` | `10.6` |
| S4 bonusAt | `19.6` | `20.2` |
| S4 smileAt | `23.0` | `24.0` |

### Import changes
- `AUDIO_TIMINGS` → `audioTimings` (función que despacha por lang)
- Agregar `audioBase` para paths de audio
- `sceneStartFrames(id, fps)` → `sceneStartFrames(id, fps, lang)`

### Audio path
- ES: `staticFile('videos/audio-es/li-05-permissions/li-05-scene1.wav')`
- EN: `staticFile(audioBase('en') + '/li-05-permissions/li-05-scene1.wav')`
- Unified: `` staticFile(`${audioBase(lang)}/li-05-permissions/li-05-scene1.wav`) ``

---

## 2. Pe01PentestPhases.tsx (121+125 → ~100 LOC)

### Diferencia clave
ES usa `bullets: string[]` con timing computado (`1.8 + i * 3.4`). EN usa `bullets: [string, number][]` con timing embebido.

### Solución: normalizar a `{text: string, at: number}[]`
```tsx
const COPY = {
  es: {
    title: 'LAS 5 FASES DEL PENTESTING',
    subtitle: 'el método, no el caos...',
    progressLabel: (n: number) => `FASE ${n} DE 5`,
    phases: [
      { name: 'RECONOCIMIENTO', cmd: 'whois ejemplo.com',
        bullets: [
          { text: 'reunir info sin tocar el objetivo', at: 1.8 },
          { text: 'dominios · IPs · tecnologías · personas', at: 5.2 },
          { text: 'todo lo público: OSINT', at: 8.6 },
        ]},
      // ... 4 más
    ],
  },
  en: {
    title: 'THE 5 PHASES OF PENTESTING',
    subtitle: 'method, not chaos...',
    progressLabel: (n: number) => `PHASE ${n} OF 5`,
    phases: [
      { name: 'RECONNAISSANCE', cmd: 'whois example.com',
        bullets: [
          { text: 'gather every piece of information...', at: 2.4 },
          { text: 'domains · IPs · technologies · employees', at: 8.3 },
          { text: 'everything public — no exploits yet...', at: 13.0 },
        ]},
      // ... 4 más
    ],
  },
} as const;
```

### ES bullet timings (computados → extraídos)
- Phase 1: `1.8, 5.2, 8.6` (formula: `1.8 + i * 3.4`)
- Phase 2: `1.8, 5.2, 8.6` (misma fórmula)
- Phase 3: `1.8, 5.2, 8.6`
- Phase 4: `1.8, 5.2, 8.6`
- Phase 5: `1.8, 5.2, 8.6`

### EN bullet timings (de PHASES directamente)
- Phase 1: `2.4, 8.3, 13.0`
- Phase 2: `2.5, 6.9, 11.0`
- Phase 3: `2.3, 7.3, 11.7`
- Phase 4: `5.1, 7.3, 13.1`
- Phase 5: `4.5, 8.7, 10.6`

### PhaseScene component
```tsx
const PhaseScene: React.FC<{ phase: PhaseData; fps: number; label: string }> = ({ phase, fps, label }) => (
  <AbsoluteFill>
    <div>{label}</div>
    {/* progress bars */}
    <div>{phase.icon} {phase.name}</div>
    {phase.bullets.map(b => (
      <RevealLine key={b.text} at={b.at} fps={fps}>{b.text}</RevealLine>
    ))}
    <div>$ {phase.cmd}</div>
  </AbsoluteFill>
);
```

---

## 3. Re01NetworkTypes.tsx (159+163 → ~130 LOC)

### Diferencias
- EN Scene3 tiene 3 RevealLines vs ES 2 (extra: "pentester uses it to hide...")
- ES usa `hasAudio()` guard, EN no
- `NODES` labels diferentes
- `SIZES` desc y at diferentes
- Scene1 panelAt, revealLine at diferentes
- Scene3 closeAt diferente

### COPY
```tsx
const COPY = {
  es: {
    nodes: ['💻 compu', '📱 celu', '🗄️ servidor', '🖨️ impresora'],
    s1: { title: <>¿QUÉ ES UNA <span>RED</span>?</>, subtitle: '...', nodeHeading: '...', cable: '...', wireless: '...', share: '...' },
    s2: { heading: 'TIPOS POR TAMAÑO', sizes: [{desc: '...'}], footer: '...' },
    s3: { heading: 'LA VPN...', tunnel: [...], revealLines: [{text: '...'}, {text: '...'}], closeTitle: <>...</>, closeSubtitle: '...' },
  },
  en: {
    nodes: ['💻 PC', '📱 phone', '🗄️ server', '🖨️ printer'],
    s1: { title: <>WHAT IS A <span>NETWORK</span>?</>, ... },
    s2: { heading: 'TYPES BY SIZE', sizes: [{desc: '...'}], footer: '...' },
    s3: { heading: 'THE VPN...', revealLines: [{text: '...'}, {text: '...'}, {text: '...'}], closeTitle: <>...</>, closeSubtitle: '...' },
  },
};
```

### BEATS
```tsx
const BEATS = {
  es: {
    s1: { panelAt: 5.0, cable: 2.0, wireless: 3.8, share: 5.4 },
    s2: { sizes: [2.2, 6.3, 7.7, 11.0] },
    s3: { closeAt: 14.2, reveal: [2.6, 7.0] },
  },
  en: {
    s1: { panelAt: 5.8, cable: 4.7, wireless: 7.4, share: 9.1 },
    s2: { sizes: [2.6, 7.6, 13.3, 16.1] },
    s3: { closeAt: 15.5, reveal: [2.9, 8.6, 12.1] },
  },
};
```

### Conditional extra RevealLine
```tsx
{c.s3.revealLines.map((rl, i) => (
  <RevealLine key={i} at={b.s3.reveal[i]} fps={fps} mark={i === 0 ? '🔒' : '▸'}>
    {rl}
  </RevealLine>
))}
```

### hasAudio
```tsx
const withAudio = hasAudio('re-01-network-types');
// ...
{withAudio && <Audio src={staticFile(`${audioBase(lang)}/...`)} />}
```

---

## 4. Root.tsx (1083 → ~200 LOC)

### Data array
```tsx
import { Li05Permissions } from './compositions/Li05Permissions';
import { Pe01PentestPhases } from './compositions/Pe01PentestPhases';
import { Re01NetworkTypes } from './compositions/Re01NetworkTypes';
// ... imports de las 59 composiciones (solo ES, que ahora son unificadas)

const COMPOSITIONS = [
  { id: 'li-05-permissions', Component: Li05Permissions },
  { id: 'pe-01-pentest-phases', Component: Pe01PentestPhases },
  { id: 're-01-network-types', Component: Re01NetworkTypes },
  // ... 56 más
];

export const RemotionRoot: React.FC = () => (
  <>
    {COMPOSITIONS.flatMap(({ id, Component }) => [
      <Composition key={id} id={id}
        component={<Component lang="es" />}
        durationInFrames={totalDurationFrames(id, FPS)}
        fps={FPS} width={1280} height={720} />,
      <Composition key={`${id}-en`} id={`${id}-en`}
        component={<Component lang="en" />}
        durationInFrames={totalDurationFrames(id, FPS, 'en')}
        fps={FPS} width={1280} height={720} />,
    ])}
  </>
);
```

---

## 5. Verificación

1. **Build**: `pnpm build` debe pasar sin errores de TypeScript
2. **Root.tsx**: Verificar que se generan 118 composiciones (59 × 2 idiomas)
3. **Spot-check**: Renderizar frame 100/500 de Li05 ES y comparar visualmente con el original

---

## 6. Orden de ejecución

1. Crear `Li05Permissions.tsx` unificado
2. Eliminar `Li05PermissionsEn.tsx`
3. Crear `Pe01PentestPhases.tsx` unificado
4. Eliminar `Pe01PentestPhasesEn.tsx`
5. Crear `Re01NetworkTypes.tsx` unificado
6. Eliminar `Re01NetworkTypesEn.tsx`
7. Actualizar `Root.tsx` con data array (solo para estos 3 por ahora, mantener resto como imports directos)
8. Verificar TypeScript build
9. Commit
