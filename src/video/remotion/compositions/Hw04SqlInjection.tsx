// ── video/remotion/compositions/Hw04SqlInjection.tsx ─────────────
// Video: SQL Injection — hablándole a la base de datos.
// Clase 4 de Hacking Web (lección web-02). Guiones: voicebox-scripts/hw-04-*.txt
// Audios reales en public/videos/audio-es/hw-04-sql-injection/ (2026-08-25).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: qué es SQLi ────────────────────────────────────────
// Habla: "input pegado" (10.00) · "lees modificas" (16.80)
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      SQL INJECTION: <span style={{ color: THEME.red }}>HABLARLE A LA BASE</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={10.0} fps={fps} mark="▸" color={THEME.cyan}>input pegado sin filtrar → comando SQL</RevealLine>
      <RevealLine at={16.8} fps={fps} mark="▸" color={THEME.amber}>leés, modificás o borrás tablas enteras</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: bypass de login ────────────────────────────────────
// Habla: "comillas cierran" (8.04) · "OR 1=1" (16.75)
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      BYPASS DE <span style={{ color: THEME.green }}>LOGIN</span>
    </div>
    <TerminalWindow title={"kali@attacker-01:~$ curl -d \"username=admin' OR '1'='1\" --data-urlencode password=x http://10.0.0.11/login"} width={980} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>HTTP/1.1 200 OK</span>
        {'\n'}<span style={{ color: THEME.green }}>Welcome admin!</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="comillas cierran" value="el string" accent={THEME.amber} delay={Math.round(8.0 * fps)} size={22} />
      <KeyCapsule label="OR '1'='1'" value="siempre verdad" accent={THEME.red} delay={Math.round(16.8 * fps)} size={22} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: impacto + defensa ──────────────────────────────────
// Habla: "in-band" (8.63) · "blind" (15.73) · "defensa" (26.46)
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      IMPACTO: <span style={{ color: THEME.red }}>VOLCÁS LA BASE</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={8.6} fps={fps} mark="▸" color={THEME.cyan}>in-band: UNION, errores que filtran</RevealLine>
      <RevealLine at={15.7} fps={fps} mark="▸" color={THEME.amber}>blind: sí/no o demoras (time-based)</RevealLine>
      <RevealLine at={26.5} fps={fps} mark="▸" color={THEME.green}>defensa: consultas parametrizadas</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Hw04SqlInjection: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['hw-04-sql-injection'];
  const starts = sceneStartFrames('hw-04-sql-injection', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('hw-04-sql-injection');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-04-sql-injection/hw-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-04-sql-injection/hw-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-04-sql-injection/hw-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
