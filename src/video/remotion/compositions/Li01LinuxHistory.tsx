// ── video/remotion/compositions/Li01LinuxHistory.tsx ───────────────
// Video: historia de Linux — nacimiento 1991, kernel + GNU/Linux,
// las 4 libertades del software libre y por qué es el SO del hacking.
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
import { TerminalWindow } from '../primitives/TerminalWindow';
import { Typewriter } from '../primitives/Typewriter';
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

const VID = 'linux-01-linux-history';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <><span style={{ color: THEME.amber }}>1991</span> · UN HOBBY EN FINLANDIA</>,
      subtitle: 'Linus Torvalds, un estudiante de 21 años en Helsinki',
      quote: "> I'm doing a (free) operating system\n  (just a hobby, won't be big or professional)",
      terminalTitle: 'newsgroup · comp.os.minix',
      footer: <><>ese hobby se convirtió en el <span style={{ color: THEME.green }}>kernel Linux</span> — hoy mueve internet</></>,
    },
    s2: {
      heading: <><>Linux es el <span style={{ color: THEME.green }}>kernel</span>: el corazón del sistema</></>,
      chips: ['memoria', 'procesos', 'drivers'],
      chipsDesc: 'gestiona memoria, procesos y el hardware',
      gnuSubtitle: 'pero un sistema operativo completo necesita mucho más:',
      gnuLabel: 'proyecto GNU',
      gnuTools: ['shell', 'comandos', 'compiladores'],
      gnuFooter: 'un kernel libre, con herramientas libres',
    },
    s3: {
      heading: <><>EL SOFTWARE LIBRE: <span style={{ color: THEME.amber }}>4 LIBERTADES</span></></>,
      freedoms: [
        { n: '0', name: 'EJECUTAR', desc: 'como quieras', accent: THEME.amber },
        { n: '1', name: 'ESTUDIAR', desc: 'leyendo el código', accent: THEME.cyan },
        { n: '2', name: 'REDISTRIBUIR', desc: 'copias y ayuda', accent: THEME.purple },
        { n: '3', name: 'MEJORAR', desc: 'y compartir cambios', accent: THEME.green },
      ],
      eyesTitle: <><><span style={{ color: THEME.green }}>miles de ojos</span> revisando el código</></>,
      eyesSubtitle: 'por eso Linux es tan sólido',
    },
    s4: {
      linuxPanelTitle: '🐧 LINUX — ABIERTO',
      linuxPoints: [
        { text: 'código fuente disponible' },
        { text: 'podés leerlo y estudiarlo' },
        { text: 'entenderlo por dentro' },
        { text: 'crear tus propias herramientas' },
      ],
      windowsPanelTitle: '🪟 WINDOWS — CERRADO',
      windowsPoints: [
        { text: 'código privativo' },
        { text: 'eso es mucho más difícil' },
        { text: 'no sabés qué hay adentro' },
      ],
      closeTitle: <span style={{ color: THEME.green }}>CON LINUX, NO HAY SECRETOS</span>,
      closeSubtitle: 'por eso es el sistema operativo del hacking',
    },
  },
  en: {
    s1: {
      title: <><span style={{ color: THEME.amber }}>1991</span> · A HOBBY IN FINLAND</>,
      subtitle: 'Linus Torvalds, a 21-year-old student in Helsinki',
      quote: "> I'm doing a (free) operating system\n  (just a hobby, won't be big or professional)",
      terminalTitle: 'newsgroup · comp.os.minix',
      footer: <><>that hobby became the <span style={{ color: THEME.green }}>Linux kernel</span> — today it runs the internet</></>,
    },
    s2: {
      heading: <><>Linux is the <span style={{ color: THEME.green }}>kernel</span>: the heart of the system</></>,
      chips: ['memory', 'processes', 'drivers'],
      chipsDesc: 'it manages memory, processes, and hardware',
      gnuSubtitle: 'but a complete operating system needs much more:',
      gnuLabel: 'GNU project',
      gnuTools: ['shell', 'commands', 'compilers'],
      gnuFooter: 'a free kernel, with free tools',
    },
    s3: {
      heading: <><>FREE SOFTWARE: <span style={{ color: THEME.amber }}>4 FREEDOMS</span></></>,
      freedoms: [
        { n: '0', name: 'RUN', desc: 'however you want', accent: THEME.amber },
        { n: '1', name: 'STUDY', desc: 'by reading the code', accent: THEME.cyan },
        { n: '2', name: 'REDISTRIBUTE', desc: 'copies and help', accent: THEME.purple },
        { n: '3', name: 'IMPROVE', desc: 'and share changes', accent: THEME.green },
      ],
      eyesTitle: <><><span style={{ color: THEME.green }}>thousands of eyes</span> reviewing the code</></>,
      eyesSubtitle: "that's why Linux is so solid",
    },
    s4: {
      linuxPanelTitle: '🐧 LINUX — OPEN',
      linuxPoints: [
        { text: 'the source code is available' },
        { text: 'you can read it and study it' },
        { text: 'understand it from the inside' },
        { text: 'build your own tools' },
      ],
      windowsPanelTitle: '🪟 WINDOWS — CLOSED',
      windowsPoints: [
        { text: 'proprietary code' },
        { text: "that's much harder" },
        { text: "you don't know what's inside" },
      ],
      closeTitle: <span style={{ color: THEME.green }}>WITH LINUX, THERE ARE NO SECRETS</span>,
      closeSubtitle: "that's why it's the hacking operating system",
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { quoteAt: 6.7 },
    s2: { gnuAt: 9.5 },
    s3: {
      freedomAt: [2.8, 6.7, 9.4, 11.7],
      eyesAt: 15.6,
    },
    s4: {
      linuxPoints: [1.4, 2.2, 4.8, 8.7],
      windowsPoints: [11.0, 12.3, 13.2],
      closeAt: 14.6,
    },
  },
  en: {
    s1: { quoteAt: 6.7 },
    s2: { gnuAt: 6.9 },
    s3: {
      freedomAt: [3.0, 6.5, 10.5, 13.4],
      eyesAt: 18.2,
    },
    s4: {
      linuxPoints: [2.1, 3.9, 6.8, 8.1],
      windowsPoints: [11.2, 12.0, 13.3],
      closeAt: 14.5,
    },
  },
};

// ── Scene 1: 1991, el hobby de un estudiante ──────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const quoteAt = Math.round(b.quoteAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={quoteAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={quoteAt}>
        <AbsoluteFill style={CENTERED}>
          <TerminalWindow title={c.terminalTitle} width={880}>
            <Typewriter
              text={c.quote}
              charsPerSecond={16}
              fontSize={20}
            />
          </TerminalWindow>
          <div style={{ marginTop: 30, fontSize: 21, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: kernel + GNU = GNU/Linux ─────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  const gnuAt = Math.round(b.gnuAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={gnuAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {c.chips.map(chip => (
              <div key={chip} style={{ padding: '12px 26px', fontSize: 20, color: THEME.cyan, fontFamily: MONO, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 10 }}>
                {chip}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 26, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            {c.chipsDesc}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={gnuAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.gnuSubtitle}
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {c.gnuTools.map((tool, i) => (
              <KeyCapsule key={tool} label={c.gnuLabel} value={tool} accent={THEME.purple} delay={i * 8} size={20} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 44 }}>
            <span style={{ fontSize: 66, fontWeight: 800, color: THEME.purple, fontFamily: MONO }}>GNU</span>
            <span style={{ fontSize: 66, color: THEME.dim, fontFamily: MONO }}>/</span>
            <span style={{ fontSize: 66, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>LINUX</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            {c.gnuFooter}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 3: las 4 libertades del software libre ──────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const eyesAt = Math.round(b.eyesAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={eyesAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 40 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {c.freedoms.map((f, i) => (
              <div key={f.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <KeyCapsule label={f.name} value={f.n} accent={f.accent} delay={Math.round(b.freedomAt[i] * fps)} size={30} />
                <span style={{ fontSize: 15, color: THEME.muted, fontFamily: MONO }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={eyesAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 44, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            {c.eyesTitle}
          </div>
          <div style={{ marginTop: 20, fontSize: 22, color: THEME.muted, fontFamily: MONO }}>
            {c.eyesSubtitle}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 4: por qué es el SO del hacking ─────────────────────────
const Scene4: React.FC<{ fps: number; c: typeof COPY.es.s4; b: typeof BEATS.es.s4 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 26, width: 1060 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>{c.linuxPanelTitle}</div>
              {c.linuxPoints.map((p, i) => (
                <RevealLine key={p.text} at={b.linuxPoints[i]} fps={fps} mark="✓" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 14 }}>{c.windowsPanelTitle}</div>
              {c.windowsPoints.map((p, i) => (
                <RevealLine key={p.text} at={b.windowsPoints[i]} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
              ))}
            </div>
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
export const Li01LinuxHistory: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3, s4] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: 1991, el hobby */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: kernel + GNU/Linux */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: las 4 libertades */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>

      {/* Scene 4: por qué es el SO del hacking */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-01-scene4.wav`)} />}
        <Scene4 fps={fps} c={c.s4} b={b.s4} />
      </Sequence>
    </AbsoluteFill>
  );
};
