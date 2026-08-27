// ── video/remotion/compositions/Sl02VariablesConditionals.tsx ────
// Video: variables, argumentos y condicionales.
// Clase 2 de Scripting/Bash (lección bash-02). Guiones: voicebox-scripts/sl-02-*.txt
// Audios reales en public/videos/audio/sl-02-variables-conditionals/ (ffprobe 2026-08-26).

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

// ── Escena 1: un script que se adapta ────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      VARIABLES, <span style={{ color: THEME.red }}>ARGUMENTOS Y CONDICIONALES</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      un script que hace siempre lo mismo no sirve
    </div>
    <KeyCapsule label="la clave" value="se adapta al objetivo" accent={THEME.cyan} delay={Math.round(3 * fps)} size={24} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={7} fps={fps} mark="▸" color={THEME.cyan}>variables guardan datos</RevealLine>
      <br />
      <RevealLine at={11} fps={fps} mark="▸" color={THEME.cyan}>condicionales eligen el camino</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: variables ──────────────────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      <span style={{ color: THEME.green }}>VARIABLES</span>: GUARDAR DATOS
    </div>
    <TerminalWindow title="kali@attacker-01:~$" width={920} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>nombre=kali</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>echo "$nombre"</span>
        {'\n'}<span style={{ color: THEME.amber }}>kali</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>fecha=$(date)</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>echo "$fecha"</span>
        {'\n'}<span style={{ color: THEME.amber }}>lun 25 ago 2026 23:59:00</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label="sin espacios" value="nombre=kali" accent={THEME.amber} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="capturar salida" value="fecha=$(date)" accent={THEME.green} delay={Math.round(16 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: argumentos + condicional ───────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      ARGUMENTOS Y <span style={{ color: THEME.green }}>CONDICIONALES</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano ping.sh" width={920} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.green }}>#!/bin/bash</span>
        {'\n'}<span style={{ color: THEME.text }}>host=$1</span>
        {'\n'}<span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> [ -z "$host" ]; </span><span style={{ color: THEME.cyan }}>then</span>
        {'\n'}<span style={{ color: THEME.text }}>  echo "Uso: ./ping.sh &lt;host&gt;"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>else</span>
        {'\n'}<span style={{ color: THEME.text }}>  ping -c 2 "$host"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>fi</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      <KeyCapsule label="$1 $2 … $#" value="argumentos" accent={THEME.cyan} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="-f / -d / -z" value="tests útiles" accent={THEME.amber} delay={Math.round(16 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

export const Sl02VariablesConditionals: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['sl-02-variables-conditionals'];
  const starts = sceneStartFrames('sl-02-variables-conditionals', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('sl-02-variables-conditionals');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-02-variables-conditionals/sl-02-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-02-variables-conditionals/sl-02-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-02-variables-conditionals/sl-02-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
