// ── video/remotion/compositions/Wi01WindowsHistory.tsx ────────────
// Video: historia de Windows — orígenes (1985/MS-DOS, kernel NT),
// el modelo privativo y por qué el Windows legacy importa en pentesting.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <><span style={{ color: THEME.cyan }}>1985</span> · UNA INTERFAZ SOBRE MS-DOS</>,
      subtitle: 'Windows nació en Microsoft, fundada por Bill Gates y Paul Allen',
      timelineDesc: <>de una <span style={{ color: THEME.cyan }}>GUI sobre MS-DOS</span> al menú Inicio</>,
      footer: <>todos comparten el mismo núcleo: el <span style={{ color: THEME.cyan }}>kernel NT</span></>,
      ntLabel: 'kernel NT',
    },
    s2: {
      heading: <>PRIVATIVO <span style={{ color: THEME.dim }}>vs</span> <span style={{ color: THEME.green }}>LIBRE</span></>,
      windowsTitle: '🪟 WINDOWS — CERRADO',
      linuxTitle: '🐧 LINUX — ABIERTO',
      windowsClosed: [
        { text: 'código fuente cerrado', at: 3.0 },
        { text: 'no podés leerlo ni estudiarlo', at: 4.3 },
        { text: 'pagás una licencia de uso', at: 5.3 },
        { text: 'el código es de Microsoft', at: 7.1 },
      ],
      linuxOpen: [
        { text: 'podés leer cada línea', at: 10.7 },
        { text: 'gratis, modificable y compartible', at: 11.9 },
      ],
    },
    s3: {
      heading: <>EN REDES REALES TODAVÍA HAY <span style={{ color: THEME.cyan }}>WINDOWS VIEJO</span></>,
      footer: 'exploits clásicos que siguen funcionando',
      closeTitle: <span style={{ color: THEME.amber }}>LEGACY = PUERTA SIN LLAVE</span>,
      closeSubtitle: 'encontrar una máquina vieja es encontrar una entrada',
    },
  },
  en: {
    s1: {
      title: <><span style={{ color: THEME.cyan }}>1985</span> · AN INTERFACE ON TOP OF MS-DOS</>,
      subtitle: 'Windows was born at Microsoft, founded by Bill Gates and Paul Allen',
      timelineDesc: <>from a <span style={{ color: THEME.cyan }}>GUI over MS-DOS</span> to the Start menu</>,
      footer: <>they all share the same core: the <span style={{ color: THEME.cyan }}>NT kernel</span></>,
      ntLabel: 'NT kernel',
    },
    s2: {
      heading: <>PROPRIETARY <span style={{ color: THEME.dim }}>vs</span> <span style={{ color: THEME.green }}>FREE</span></>,
      windowsTitle: '🪟 WINDOWS — CLOSED',
      linuxTitle: '🐧 LINUX — OPEN',
      windowsClosed: [
        { text: 'the source code is closed', at: 4.6 },
        { text: "you can't read it or study it", at: 5.4 },
        { text: 'you buy a license to use it', at: 8.0 },
        { text: 'the code belongs to Microsoft', at: 10.1 },
      ],
      linuxOpen: [
        { text: 'you can read every line', at: 13.2 },
        { text: "you can't audit what the system does", at: 17.1 },
      ],
    },
    s3: {
      heading: <>REAL NETWORKS STILL RUN <span style={{ color: THEME.cyan }}>OLD WINDOWS</span></>,
      footer: 'classic exploits that still work',
      closeTitle: <span style={{ color: THEME.amber }}>LEGACY = AN UNLOCKED DOOR</span>,
      closeSubtitle: 'finding an old machine is finding a way in',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: {
      timelineAt: 6.5,
      timeline: [
        { year: '1975', label: 'Microsoft', delay: 0.0 },
        { year: '1985', label: 'Windows 1.0', delay: 0.5 },
        { year: '1995', label: 'Windows 95', delay: 8.1 },
        { year: '2001', label: 'Windows XP', delay: 12.7 },
        { year: '1993', label: 'kernel NT', delay: 18.2 },
      ],
    },
    s2: {},
    s3: {
      closeAt: 17.4,
      legacyChips: [
        { label: 'Windows 7', at: 4.2 },
        { label: 'Windows XP', at: 5.1 },
        { label: 'Server 2008', at: 5.8 },
      ],
      exploits: [
        { label: 'MS17-010', name: 'EternalBlue', at: 12.2 },
        { label: 'MS08-067', name: 'NetAPI32', at: 15.2 },
      ],
    },
  },
  en: {
    s1: {
      timelineAt: 7.4,
      timeline: [
        { year: '1975', label: 'Microsoft', delay: 0.0 },
        { year: '1985', label: 'Windows 1.0', delay: 1.0 },
        { year: '1995', label: 'Windows 95', delay: 8.2 },
        { year: '2001', label: 'Windows XP', delay: 13.1 },
        { year: '1993', label: 'NT kernel', delay: 17.1 },
      ],
    },
    s2: {},
    s3: {
      closeAt: 22.5,
      legacyChips: [
        { label: 'Windows 7', at: 5.5 },
        { label: 'Windows XP', at: 6.8 },
        { label: 'Server 2008', at: 7.9 },
      ],
      exploits: [
        { label: 'MS17-010', name: 'EternalBlue', at: 15.4 },
        { label: 'MS08-067', name: 'NetAPI32', at: 19.4 },
      ],
    },
  },
};

const VID = 'windows-01-windows-history';

// ── Scene 1: 1985, orígenes ────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const timelineAt = Math.round(b.timelineAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={timelineAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={timelineAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            {c.timelineDesc}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1040 }}>
            {b.timeline.map(t => (
              <KeyCapsule key={t.year} label={t.label} value={t.year} accent={THEME.cyan} delay={Math.round(t.delay * fps)} size={24} />
            ))}
          </div>
          <div style={{ marginTop: 34, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: el modelo privativo ──────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        {c.heading}
      </div>
      <div style={{ display: 'flex', gap: 26, width: 1060 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>{c.windowsTitle}</div>
          {c.windowsClosed.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>{c.linuxTitle}</div>
          {c.linuxOpen.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✓" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: por qué importa el Windows viejo ─────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900 }}>
            {b.legacyChips.map(chip => (
              <KeyCapsule key={chip.label} label="legacy" value={chip.label} accent={THEME.cyan} delay={Math.round(chip.at * fps)} size={20} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 26, marginTop: 40 }}>
            {b.exploits.map(e => (
              <KeyCapsule key={e.label} label={e.name} value={e.label} accent={THEME.amber} delay={Math.round(e.at * fps)} size={26} />
            ))}
          </div>
          <div style={{ marginTop: 30, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Wi01WindowsHistory: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: 1985, orígenes */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: el modelo privativo */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: por qué importa el Windows viejo */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
