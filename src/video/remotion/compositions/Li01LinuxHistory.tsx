// ── video/remotion/compositions/Li01LinuxHistory.tsx ───────────────
// Video: historia de Linux — nacimiento 1991, kernel + GNU/Linux,
// las 4 libertades del software libre y por qué es el SO del hacking.
// Con audio de la voz "Miguel" (4 escenas, ~75s).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
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

// ── Escena 1: 1991, el hobby de un estudiante ──────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  // la cita del foro arranca ~6.7s (silence 6.20-6.66) — la ventana aparece justo al narrarla
  const quoteAt = Math.round(6.7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={quoteAt}>
        <TitleScene
          title={<><span style={{ color: THEME.amber }}>1991</span> · UN HOBBY EN FINLANDIA</>}
          subtitle="Linus Torvalds, un estudiante de 21 años en Helsinki"
        />
      </Sequence>
      <Sequence from={quoteAt}>
        <AbsoluteFill style={CENTERED}>
          <TerminalWindow title="newsgroup · comp.os.minix" width={880}>
            <Typewriter
              text="> I'm doing a (free) operating system\n  (just a hobby, won't be big or professional)"
              charsPerSecond={16}
              fontSize={20}
            />
          </TerminalWindow>
          <div style={{ marginTop: 30, fontSize: 21, color: THEME.muted, fontFamily: MONO }}>
            ese hobby se convirtió en el <span style={{ color: THEME.green }}>kernel Linux</span> — hoy mueve internet
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: kernel + GNU = GNU/Linux ─────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  // la frase del kernel termina ~9.5s (silence 8.99-9.49) — GNU entra cuando el narrador lo explica
  const gnuAt = Math.round(9.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={gnuAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            Linux es el <span style={{ color: THEME.green }}>kernel</span>: el corazón del sistema
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['memoria', 'procesos', 'drivers'].map(chip => (
              <div key={chip} style={{ padding: '12px 26px', fontSize: 20, color: THEME.cyan, fontFamily: MONO, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 10 }}>
                {chip}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 26, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            gestiona memoria, procesos y el hardware
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={gnuAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            pero un sistema operativo completo necesita mucho más:
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {['shell', 'comandos', 'compiladores'].map((tool, i) => (
              <KeyCapsule key={tool} label="proyecto GNU" value={tool} accent={THEME.purple} delay={i * 8} size={20} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 44 }}>
            <span style={{ fontSize: 66, fontWeight: 800, color: THEME.purple, fontFamily: MONO }}>GNU</span>
            <span style={{ fontSize: 66, color: THEME.dim, fontFamily: MONO }}>/</span>
            <span style={{ fontSize: 66, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>LINUX</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            un kernel libre, con herramientas libres
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 3: las 4 libertades del software libre ──────────────────
const FREEDOMS = [
  { n: '0', name: 'EJECUTAR', desc: 'como quieras', accent: THEME.amber },
  { n: '1', name: 'ESTUDIAR', desc: 'leyendo el código', accent: THEME.cyan },
  { n: '2', name: 'REDISTRIBUIR', desc: 'copias y ayuda', accent: THEME.purple },
  { n: '3', name: 'MEJORAR', desc: 'y compartir cambios', accent: THEME.green },
];

// Momento (s) en que el narrador nombra cada libertad, medido con silencedetect:
// 0→2.8s intro · 'Libertad cero' ~2.8 · 'uno' ~6.7 · 'dos' ~9.4 · 'tres' ~11.7
const FREEDOM_AT = [2.8, 6.7, 9.4, 11.7];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // la frase final "miles de ojos" arranca ~15.7s (silence 15.35-15.72) — antes de eso se narran las 4
  const eyesAt = Math.round(15.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={eyesAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 40 }}>
            EL SOFTWARE LIBRE: <span style={{ color: THEME.amber }}>4 LIBERTADES</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {FREEDOMS.map((f, i) => (
              <div key={f.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <KeyCapsule label={f.name} value={f.n} accent={f.accent} delay={Math.round(FREEDOM_AT[i] * fps)} size={30} />
                <span style={{ fontSize: 15, color: THEME.muted, fontFamily: MONO }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={eyesAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 44, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            <span style={{ color: THEME.green }}>miles de ojos</span> revisando el código
          </div>
          <div style={{ marginTop: 20, fontSize: 22, color: THEME.muted, fontFamily: MONO }}>
            por eso Linux es tan sólido
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 4: por qué es el SO del hacking ─────────────────────────
// Cada línea aparece cuando el narrador la menciona (silencedetect, voz Miguel):
// Linux: 'código fuente disponible' ~1.4 · 'leerlo y estudiarlo' ~2.2 · 'por dentro' ~4.8 · 'herramientas' ~8.7
// Windows (arranca ~10.9): 'cerrado' ~11.0 · 'mucho más difícil' ~12.3 · 'no sabés qué hay adentro' ~13.2
const LINUX_POINTS = [
  { text: 'código fuente disponible', at: 1.4 },
  { text: 'podés leerlo y estudiarlo', at: 2.2 },
  { text: 'entenderlo por dentro', at: 4.8 },
  { text: 'crear tus propias herramientas', at: 8.7 },
];
const WINDOWS_POINTS = [
  { text: 'código privativo', at: 11.0 },
  { text: 'eso es mucho más difícil', at: 12.3 },
  { text: 'no sabés qué hay adentro', at: 13.2 },
];

const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  // "Con Linux, no hay secretos" arranca ~14.7s (silence 14.29-14.67) — los paneles explican todo antes
  const closeAt = Math.round(14.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 26, width: 1060 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>🐧 LINUX — ABIERTO</div>
              {LINUX_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="✓" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 14 }}>🪟 WINDOWS — CERRADO</div>
              {WINDOWS_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<span style={{ color: THEME.green }}>CON LINUX, NO HAY SECRETOS</span>}
          subtitle="por eso es el sistema operativo del hacking"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Li01LinuxHistory: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['li-01-linux-history'];
  const starts = sceneStartFrames('li-01-linux-history', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: 1991, el hobby */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/li-01-linux-history/li-01-linux-history-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: kernel + GNU/Linux */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/li-01-linux-history/li-01-linux-history-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: las 4 libertades */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/li-01-linux-history/li-01-linux-history-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: por qué es el SO del hacking */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/li-01-linux-history/li-01-linux-history-scene4.wav')} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
