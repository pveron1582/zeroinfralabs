// ── video/remotion/compositions/Sl01BashIntro.tsx ────────────────
// Video: qué es bash — la shell que se volvió lenguaje.
// Clase 1 de Scripting/Bash (lección bash-01). Guiones: voicebox-scripts/sl-01-*.txt
// Audios reales en public/videos/audio/sl-01-bash-intro/ (ffprobe 2026-08-26).

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

// ── Escena 1: bash, el lenguaje nativo de la terminal ────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      BASH: <span style={{ color: THEME.red }}>LA SHELL QUE SE VOLVIÓ LENGUAJE</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      antes de escribir exploits, vas a escribir scripts
    </div>
    <KeyCapsule label="bash" value="shell + lenguaje" accent={THEME.cyan} delay={Math.round(3 * fps)} size={26} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={7} fps={fps} mark="▸" color={THEME.cyan}>está en todos lados, no instalás nada</RevealLine>
      <br />
      <RevealLine at={11} fps={fps} mark="▸" color={THEME.cyan}>automatiza lo que harías a mano</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: tu primer script ───────────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      TU <span style={{ color: THEME.green }}>PRIMER SCRIPT</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano primer.sh" width={920} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.green }}>#!/bin/bash</span>
        {'\n'}<span style={{ color: THEME.text }}>echo "Hola, soy un script de pentesting"</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ chmod +x primer.sh</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ ./primer.sh</span>
        {'\n'}<span style={{ color: THEME.amber }}>Hola, soy un script de pentesting</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label="shebang" value="#!/bin/bash" accent={THEME.green} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="salida" value="se ejecuta en orden" accent={THEME.amber} delay={Math.round(16 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: tres pasos, tres conceptos ─────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      TRES PASOS, <span style={{ color: THEME.cyan }}>TRES CONCEPTOS</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={3} fps={fps} mark="1" color={THEME.cyan}>nano → escribís el shebang y tus comandos</RevealLine>
      <RevealLine at={8} fps={fps} mark="2" color={THEME.amber}>chmod +x → permiso de ejecución</RevealLine>
      <RevealLine at={13} fps={fps} mark="3" color={THEME.green}>./script.sh → lo ejecutás</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      en el lab trabajá desde /tmp, que es escribible por todos
    </div>
  </AbsoluteFill>
);

export const Sl01BashIntro: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['sl-01-bash-intro'];
  const starts = sceneStartFrames('sl-01-bash-intro', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('sl-01-bash-intro');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-01-bash-intro/sl-01-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-01-bash-intro/sl-01-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-01-bash-intro/sl-01-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
