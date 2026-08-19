// ── video/remotion/compositions/Wi01WindowsHistory.tsx ────────────
// Video: historia de Windows — orígenes (1985/MS-DOS, kernel NT),
// el modelo privativo y por qué el Windows legacy importa en pentesting.
// Con audio de la voz "Miguel" (3 escenas, ~76s).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
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

// ── Escena 1: 1985, una interfaz sobre MS-DOS ──────────────────────
// `delay` = segundos (relativos a la sub-secuencia de la línea de tiempo,
// que arranca en `timelineAt` 6.5s) en que la narración menciona cada hito.
// Son relativos a la sub-secuencia por eso NO se suma `timelineAt` aquí.
// (medido con silencedetect -50dB sobre wi-01-scene1.wav).
const TIMELINE = [
  { year: '1975', label: 'Microsoft', delay: 0.0 },
  { year: '1985', label: 'Windows 1.0', delay: 0.5 },
  { year: '1995', label: 'Windows 95', delay: 8.1 },
  { year: '2001', label: 'Windows XP', delay: 12.7 },
  { year: '1993', label: 'kernel NT', delay: 18.2 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  // la línea de tiempo arranca ~6.5s, cuando termina la fundación
  // ("Bill Gates y Paul Allen") y la narración pasa a Windows 1.0 / MS-DOS
  const timelineAt = Math.round(6.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={timelineAt}>
        <TitleScene
          title={<><span style={{ color: THEME.cyan }}>1985</span> · UNA INTERFAZ SOBRE MS-DOS</>}
          subtitle="Windows nació en Microsoft, fundada por Bill Gates y Paul Allen"
        />
      </Sequence>
      <Sequence from={timelineAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            de una <span style={{ color: THEME.cyan }}>GUI sobre MS-DOS</span> al menú Inicio
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1040 }}>
            {TIMELINE.map(t => (
              <KeyCapsule key={t.year} label={t.label} value={t.year} accent={THEME.cyan} delay={Math.round(t.delay * fps)} size={24} />
            ))}
          </div>
          <div style={{ marginTop: 34, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            todos comparten el mismo núcleo: el <span style={{ color: THEME.cyan }}>kernel NT</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: el modelo privativo ──────────────────────────────────
// Windows (columna cian, cerrado) vs Linux (columna verde, abierto).
// Sync a los segmentos de habla medidos con silencedetect (-50dB).
const WINDOWS_CLOSED = [
  { text: 'código fuente cerrado', at: 3.0 },
  { text: 'no podés leerlo ni estudiarlo', at: 4.3 },
  { text: 'pagás una licencia de uso', at: 5.3 },
  { text: 'el código es de Microsoft', at: 7.1 },
];
const LINUX_OPEN = [
  { text: 'podés leer cada línea', at: 10.7 },
  { text: 'gratis, modificable y compartible', at: 11.9 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        PRIVATIVO <span style={{ color: THEME.dim }}>vs</span> <span style={{ color: THEME.green }}>LIBRE</span>
      </div>
      <div style={{ display: 'flex', gap: 26, width: 1060 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>🪟 WINDOWS — CERRADO</div>
          {WINDOWS_CLOSED.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>🐧 LINUX — ABIERTO</div>
          {LINUX_OPEN.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✓" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: por qué importa el Windows viejo ─────────────────────
const LEGACY_CHIPS = [
  { label: 'Windows 7', at: 4.2 },
  { label: 'Windows XP', at: 5.1 },
  { label: 'Server 2008', at: 5.8 },
];
const EXPLOITS = [
  { label: 'MS17-010', name: 'EternalBlue', at: 12.2 },
  { label: 'MS08-067', name: 'NetAPI32', at: 15.2 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(17.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            EN REDES REALES TODAVÍA HAY <span style={{ color: THEME.cyan }}>WINDOWS VIEJO</span>
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900 }}>
            {LEGACY_CHIPS.map(c => (
              <KeyCapsule key={c.label} label="legacy" value={c.label} accent={THEME.cyan} delay={Math.round(c.at * fps)} size={20} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 26, marginTop: 40 }}>
            {EXPLOITS.map(e => (
              <KeyCapsule key={e.label} label={e.name} value={e.label} accent={THEME.amber} delay={Math.round(e.at * fps)} size={26} />
            ))}
          </div>
          <div style={{ marginTop: 30, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            exploits clásicos que siguen funcionando
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<span style={{ color: THEME.amber }}>LEGACY = PUERTA SIN LLAVE</span>}
          subtitle="encontrar una máquina vieja es encontrar una entrada"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi01WindowsHistory: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['wi-01-windows-history'];
  const starts = sceneStartFrames('wi-01-windows-history', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: 1985, orígenes */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/wi-01-windows-history/wi-01-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: el modelo privativo */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/wi-01-windows-history/wi-01-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: por qué importa el Windows viejo */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/wi-01-windows-history/wi-01-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
