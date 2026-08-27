// ── video/remotion/compositions/Sl04Enumeration.tsx ──────────────
// Video: pentesting I — enumeración con bash.
// Clase 4 de Scripting/Bash (lección bash-04). Guiones: voicebox-scripts/sl-04-*.txt
// Audios reales en public/videos/audio/sl-04-enumeration/ (ffprobe 2026-08-26).

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

// ── Escena 1: el flujo de reconocimiento ─────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      ENUMERACIÓN: <span style={{ color: THEME.red }}>EL PRIMER CASO REAL</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={3} fps={fps} mark="1" color={THEME.cyan}>ping sweep → hosts vivos</RevealLine>
      <RevealLine at={7} fps={fps} mark="2" color={THEME.amber}>nmap → escaneás el interesante</RevealLine>
      <RevealLine at={11} fps={fps} mark="3" color={THEME.green}>grep/awk → parseás el resultado</RevealLine>
      <RevealLine at={15} fps={fps} mark="4" color={THEME.cyan}>curl -sI → revisás la web</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      en segundos, lo que a mano tardaría diez minutos
    </div>
  </AbsoluteFill>
);

// ── Escena 2: script de recon con nmap ───────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      RECON: <span style={{ color: THEME.green }}>ESCANEÁ UNA VEZ, PARSEÁ MUCHAS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano recon.sh" width={940} delay={Math.round(2.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.green }}>#!/bin/bash</span>
        {'\n'}<span style={{ color: THEME.text }}>host=$1</span>
        {'\n'}<span style={{ color: THEME.text }}>nmap -sV -oG /tmp/scan.txt "$host"</span>
        {'\n'}<span style={{ color: THEME.text }}>echo "Puertos abiertos:"</span>
        {'\n'}<span style={{ color: THEME.text }}>grep "open" /tmp/scan.txt | grep -oP "[0-9]+/tcp" | cut -d/ -f1</span>
        {'\n'}<span style={{ color: THEME.amber }}>Puertos abiertos:  21  22  80</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="nmap -oG" value="salida grepable" accent={THEME.cyan} delay={Math.round(11 * fps)} size={20} />
      <KeyCapsule label="grep + cut" value="solo los puertos" accent={THEME.green} delay={Math.round(16 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: herramientas de parseo ─────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      PARSEAR BIEN: <span style={{ color: THEME.cyan }}>LA REGLA DE ORO</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={3} fps={fps} mark="▸" color={THEME.cyan}>nmap -oG: una línea por host con sus puertos</RevealLine>
      <RevealLine at={8} fps={fps} mark="▸" color={THEME.amber}>curl -sI: Server y X-Powered-By revelan el stack</RevealLine>
      <RevealLine at={13} fps={fps} mark="▸" color={THEME.green}>grep -oP + cut: extraés solo los números de puerto</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      guardás la salida una vez, y la parseás todas las que quieras
    </div>
  </AbsoluteFill>
);

export const Sl04Enumeration: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['sl-04-enumeration'];
  const starts = sceneStartFrames('sl-04-enumeration', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('sl-04-enumeration');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-04-enumeration/sl-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-04-enumeration/sl-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/sl-04-enumeration/sl-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
