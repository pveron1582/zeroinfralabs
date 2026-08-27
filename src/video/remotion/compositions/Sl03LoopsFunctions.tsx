// ── video/remotion/compositions/Sl03LoopsFunctions.tsx ───────────
// Video: bucles, funciones y filtros de texto.
// Clase 3 de Scripting/Bash (lección bash-03). Guiones: voicebox-scripts/sl-03-*.txt
// Audios reales en public/videos/audio/sl-03-loops-functions/ (ffprobe 2026-08-26).

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

// ── Escena 1: repetir a escala ───────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      BUCLES, <span style={{ color: THEME.red }}>FUNCIONES Y FILTROS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      el pentesting es repetir cosas a escala
    </div>
    <KeyCapsule label="254 hosts · 1 wordlist" value="en segundos" accent={THEME.cyan} delay={Math.round(3 * fps)} size={24} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={7} fps={fps} mark="▸" color={THEME.cyan}>bucles repiten · funciones organizan</RevealLine>
      <br />
      <RevealLine at={11} fps={fps} mark="▸" color={THEME.cyan}>filtros se quedan con lo que importa</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: bucle for + background ─────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      BUCLE FOR: <span style={{ color: THEME.green }}>BARRIDO EN PARALELO</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano sweep.sh" width={940} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> ip in $(seq 1 5); </span><span style={{ color: THEME.cyan }}>do</span>
        {'\n'}<span style={{ color: THEME.text }}>{`  ping -c 1 -W 1 10.0.0.$ip | grep "bytes from" | awk '{print $4}' `}</span><span style={{ color: THEME.red }}>&amp;</span>
        {'\n'}<span style={{ color: THEME.cyan }}>done</span>
        {'\n'}<span style={{ color: THEME.cyan }}>wait</span>
        {'\n'}<span style={{ color: THEME.amber }}>10.0.0.1:  10.0.0.11:  10.0.0.22:</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="&" value="en background" accent={THEME.red} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="wait" value="espera a todos" accent={THEME.green} delay={Math.round(16 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: funciones + grep/awk/sed ───────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      FUNCIONES Y <span style={{ color: THEME.green }}>FILTROS DE TEXTO</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$" width={940} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.text }}>escaneo() {'{'} nmap -sV "$1"; {'}'}</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>escaneo 10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>{`grep "open" nmap.txt | awk '{print $1}'`}</span>
        {'\n'}<span style={{ color: THEME.amber }}>21/tcp  22/tcp  80/tcp</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      <KeyCapsule label="grep" value="filtra líneas" accent={THEME.cyan} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="awk" value="extrae columnas" accent={THEME.amber} delay={Math.round(15 * fps)} size={20} />
      <KeyCapsule label="sed" value="reemplaza texto" accent={THEME.green} delay={Math.round(19 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

export const Sl03LoopsFunctions: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['sl-03-loops-functions'];
  const starts = sceneStartFrames('sl-03-loops-functions', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('sl-03-loops-functions');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-03-loops-functions/sl-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-03-loops-functions/sl-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-03-loops-functions/sl-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
