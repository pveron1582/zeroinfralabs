// ── video/remotion/compositions/Hw02DomainsSubdirectories.tsx ─────
// Video: dominios, subdominios y subdirectorios — mapeando el objetivo.
// Clase 2 de Hacking Web (lección web-04). Guiones: voicebox-scripts/hw-02-*.txt
// Audios reales en public/videos/audio-es/hw-02-domains-subdirectories/ (2026-08-25).

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

// ── Escena 1: anatomía de una URL ────────────────────────────────
// Habla: "dominio" (7.02) · "subdominio" (13.67) · "subdirectorio" (21.07)
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      ANTES DE DISPARAR: <span style={{ color: THEME.red }}>MAPEAR</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={7.0} fps={fps} mark="▸" color={THEME.cyan}>dominio: ejemplo.com (lo apunta el DNS)</RevealLine>
      <RevealLine at={13.7} fps={fps} mark="▸" color={THEME.amber}>subdominio: blog. (otro servidor)</RevealLine>
      <RevealLine at={21.1} fps={fps} mark="▸" color={THEME.green}>subdirectorio: /panel/login (misma app)</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      terreno · edificios distintos · habitaciones
    </div>
  </AbsoluteFill>
);

// ── Escena 2: gobuster dir ───────────────────────────────────────
// Habla: intro (0-2.5) · "subdominios" (16.18) · "subdirectorios" (21.60)
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      FUZZING DE RUTAS CON <span style={{ color: THEME.green }}>GOBUSTER</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ gobuster dir -u http://10.0.0.11 -w common.txt" width={960} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>Gobuster v3.1.0</span>
        {'\n'}<span style={{ color: THEME.dim }}>[+] Url: http://10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.green }}>/admin     (Status: 301)</span>
        {'\n'}<span style={{ color: THEME.green }}>/backup    (Status: 200)</span>
        {'\n'}<span style={{ color: THEME.green }}>/uploads   (Status: 301)</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="subdominios" value="agrandan superficie" accent={THEME.amber} delay={Math.round(16.2 * fps)} size={22} />
      <KeyCapsule label="subdirectorios" value="esconden lo sensible" accent={THEME.red} delay={Math.round(21.6 * fps)} size={22} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: fuzzing + códigos de estado + defensa ──────────────
// Habla: "200 existe" (9.54) · "403 prohíbe" (16.26) · "404 no" (22.99)
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      FUZZING: <span style={{ color: THEME.cyan }}>ADIVINAR A ESCALA</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={9.5} fps={fps} mark="▸" color={THEME.green}>200 existe · 301/302 redirige</RevealLine>
      <RevealLine at={16.3} fps={fps} mark="▸" color={THEME.amber}>403 existe pero prohíbe (¡interesa!)</RevealLine>
      <RevealLine at={23.0} fps={fps} mark="▸" color={THEME.red}>404 no existe</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      defensa: sacá staging del DNS · protegé admin · mira tus logs
    </div>
  </AbsoluteFill>
);

export const Hw02DomainsSubdirectories: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['hw-02-domains-subdirectories'];
  const starts = sceneStartFrames('hw-02-domains-subdirectories', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('hw-02-domains-subdirectories');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-02-domains-subdirectories/hw-02-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-02-domains-subdirectories/hw-02-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio-es/hw-02-domains-subdirectories/hw-02-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
