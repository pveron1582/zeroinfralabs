// ── video/remotion/compositions/Py01PythonIntro.tsx ──────────────
// Video: qué es Python — el lenguaje del hacking.
// Clase 1 de Scripting/Python (lección python-01). Guiones: voicebox-scripts/py-01-*.txt
// Audios reales en public/videos/audio/py-01-python-intro/ (ffprobe 2026-08-26).

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

// ── Escena 1: el lenguaje del hacking ────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      PYTHON: <span style={{ color: THEME.red }}>EL LENGUAJE DEL HACKING</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      Legible, poderoso y estándar de facto en ciberseguridad
    </div>
    <KeyCapsule label="la mayoría" value="de exploits públicos" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5.5} fps={fps} mark="▸" color={THEME.cyan}>Librerías para redes, HTTP y explotación</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={10} fps={fps} mark="▸" color={THEME.green}>El lenguaje favorito de los atacantes y pentesters</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: interpretado + one-liners + librerías ───────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      INTERPRETADO Y <span style={{ color: THEME.green }}>MODULAR</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>python3 exploit.py</span>
        {'\n'}<span style={{ color: THEME.amber }}>[*] Ejecutando script directo sin compilar...</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>python3 -c "print('One-liner rápido')"</span>
        {'\n'}<span style={{ color: THEME.green }}>One-liner rápido</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="socket" value="redes TCP/UDP" accent={THEME.cyan} delay={Math.round(11 * fps)} size={16} />
      <KeyCapsule label="requests" value="HTTP web" accent={THEME.green} delay={Math.round(13.5 * fps)} size={16} />
      <KeyCapsule label="subprocess" value="comandos OS" accent={THEME.amber} delay={Math.round(16 * fps)} size={16} />
      <KeyCapsule label="scapy" value="paquetes" accent={THEME.red} delay={Math.round(18.5 * fps)} size={16} />
      <KeyCapsule label="paramiko" value="SSH remoto" accent={THEME.purple} delay={Math.round(20.5 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: print, comentario, input ───────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      TRES FUNCIONES <span style={{ color: THEME.cyan }}>ESENCIALES</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 primer_script.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}># 1. Comentario: documenta qué hace el código</span>
        {'\n'}<span style={{ color: THEME.cyan }}>print</span><span style={{ color: THEME.text }}>("=== Reconocimiento de Host ===")</span>
        {'\n'}<span style={{ color: THEME.text }}>target = </span><span style={{ color: THEME.green }}>input</span><span style={{ color: THEME.text }}>("IP objetivo: ")</span>
        {'\n'}<span style={{ color: THEME.cyan }}>print</span><span style={{ color: THEME.text }}>(f"[*] Escaneando host: {'{'}target{'}'}")</span>
        {'\n'}<span style={{ color: THEME.amber }}>IP objetivo: 10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.green }}>[*] Escaneando host: 10.0.0.11</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
      <KeyCapsule label='print("...")' value="mostrar salida" accent={THEME.cyan} delay={Math.round(4 * fps)} size={18} />
      <KeyCapsule label="# texto" value="comentarios" accent={THEME.amber} delay={Math.round(7.5 * fps)} size={18} />
      <KeyCapsule label='input("...")' value="preguntar al usuario" accent={THEME.green} delay={Math.round(11 * fps)} size={18} />
    </div>
  </AbsoluteFill>
);

export const Py01PythonIntro: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['py-01-python-intro'];
  const starts = sceneStartFrames('py-01-python-intro', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('py-01-python-intro');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/py-01-python-intro/py-01-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/py-01-python-intro/py-01-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/py-01-python-intro/py-01-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
