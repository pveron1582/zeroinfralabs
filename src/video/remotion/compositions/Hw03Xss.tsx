// ── video/remotion/compositions/Hw03Xss.tsx ──────────────────────
// Video: XSS — inyectando scripts en el navegador.
// Clase 3 de Hacking Web (lección web-01). Guiones: voicebox-scripts/hw-03-*.txt
// Audios reales en public/videos/audio/hw-03-xss/ (2026-08-25).

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

// ── Escena 1: qué es XSS ─────────────────────────────────────────
// Habla: "input sin escapar" (4.43) · "prueba script" (14.21) · "si salta" (18.70)
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      XSS: <span style={{ color: THEME.red }}>CÓDIGO EN EL NAVEGADOR</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={4.5} fps={fps} mark="▸" color={THEME.cyan}>input sin escapar → se ejecuta</RevealLine>
      <RevealLine at={14.2} fps={fps} mark="▸" color={THEME.amber}>prueba: &lt;script&gt;alert(1)&lt;/script&gt;</RevealLine>
      <RevealLine at={18.7} fps={fps} mark="▸" color={THEME.green}>si salta el diálogo, la app es vulnerable</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: XSS reflejado en la URL ───────────────────────────
// Habla: "reflejado" (2.32) · "almacenado" (10.16) · "DOM" (18.07)
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      REFLEJADO EN LA <span style={{ color: THEME.green }}>URL</span>
    </div>
    <TerminalWindow title={"kali@attacker-01:~$ curl 'http://10.0.0.11/search?q=<script>alert(1)</script>'"} width={980} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>&lt;div class="result"&gt;Results for: </span>
        <span style={{ color: THEME.red }}>&lt;script&gt;alert(1)&lt;/script&gt;</span>
        <span style={{ color: THEME.dim }}>&lt;/div&gt;</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      <KeyCapsule label="reflejado" value="en la URL" accent={THEME.cyan} delay={Math.round(2.4 * fps)} size={20} />
      <KeyCapsule label="almacenado" value="en el server" accent={THEME.red} delay={Math.round(10.2 * fps)} size={20} />
      <KeyCapsule label="DOM" value="en el cliente" accent={THEME.green} delay={Math.round(18.1 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: impacto + defensa ──────────────────────────────────
// Habla: "lee cookies" (8.15) · "captura tecleos" (11.52) · "defensa" (13.48)
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      IMPACTO: <span style={{ color: THEME.red }}>SECUESTRO DE SESIÓN</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={8.2} fps={fps} mark="▸" color={THEME.amber}>lee cookies → roba el login</RevealLine>
      <RevealLine at={11.5} fps={fps} mark="▸" color={THEME.amber}>captura tecleos · redirige a phishing</RevealLine>
      <RevealLine at={13.5} fps={fps} mark="▸" color={THEME.green}>defensa: escapar la salida siempre</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Hw03Xss: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['hw-03-xss'];
  const starts = sceneStartFrames('hw-03-xss', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('hw-03-xss');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/hw-03-xss/hw-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/hw-03-xss/hw-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/hw-03-xss/hw-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
