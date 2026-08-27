// ── video/remotion/compositions/Py03LoopsLibraries.tsx ───────────
// Video: bucles, funciones y librerías.
// Clase 3 de Scripting/Python (lección python-03). Guiones: voicebox-scripts/py-03-*.txt
// Audios reales en public/videos/audio/py-03-loops-libraries/ (ffprobe 2026-08-26).

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

// ── Escena 1: el 80% de tus scripts ──────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      BUCLES, <span style={{ color: THEME.red }}>FUNCIONES Y LIBRERÍAS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      El 80% de tus herramientas de pentesting
    </div>
    <KeyCapsule label="sintaxis limpia" value="se lee como pseudocódigo" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Bucles sobre listas de IPs, puertos y diccionarios</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>Funciones para reutilizar e imports de librerías</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: 3 formas de for + while True ───────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      LAS FORMAS DE <span style={{ color: THEME.green }}>ITERAR</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano bucles.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}># 1. Rango numérico (ej. escanear segmento de red)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> i </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.green }}> range</span><span style={{ color: THEME.text }}>(1, 255): </span><span style={{ color: THEME.dim }}>print(f"192.168.1.{'{'}i{'}'}")</span>
        {'\n'}<span style={{ color: THEME.dim }}># 2. Lista de elementos</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> p </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> [21, 22, 80, 445]: </span><span style={{ color: THEME.dim }}>print(f"Puerto: {'{'}p{'}'}")</span>
        {'\n'}<span style={{ color: THEME.dim }}># 3. Leer archivo línea por línea (wordlist de contraseñas)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> linea </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.green }}> open</span><span style={{ color: THEME.text }}>("wordlist.txt"): </span><span style={{ color: THEME.dim }}>probar(linea.strip())</span>
        {'\n'}<span style={{ color: THEME.dim }}># 4. Bucle continuo con break para salir</span>
        {'\n'}<span style={{ color: THEME.cyan }}>while</span><span style={{ color: THEME.amber }}> True</span><span style={{ color: THEME.text }}>: respuesta = escuchar(); </span><span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> "OK" </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> respuesta: </span><span style={{ color: THEME.red }}>break</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="range(1, 255)" value="rango numérico" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="for p in [...]" value="itera lista" accent={THEME.green} delay={Math.round(8 * fps)} size={16} />
      <KeyCapsule label="for l in open()" value="línea por línea" accent={THEME.amber} delay={Math.round(11 * fps)} size={16} />
      <KeyCapsule label="while True / break" value="bucle infinito" accent={THEME.red} delay={Math.round(14.5 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: def funciones + imports esenciales ─────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      DEFINIR FUNCIONES E <span style={{ color: THEME.cyan }}>IMPORTS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano funciones.py" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> socket, sys, subprocess, time </span><span style={{ color: THEME.dim }}># o from socket import socket</span>
        {'\n'}
        {'\n'}<span style={{ color: THEME.cyan }}>def</span><span style={{ color: THEME.green }}> escanear</span><span style={{ color: THEME.text }}>(host, puerto): </span><span style={{ color: THEME.dim }}># def nombre(parámetros):</span>
        {'\n'}<span style={{ color: THEME.text }}>    print(f"[*] Conectando a {'{'}host{'}'}:{'{'}puerto{'}'}...") </span><span style={{ color: THEME.dim }}># bloque indentado</span>
        {'\n'}
        {'\n'}<span style={{ color: THEME.green }}>escanear</span><span style={{ color: THEME.text }}>("10.0.0.11", 80) </span><span style={{ color: THEME.dim }}># llamada a la función con valores</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="def func(args):" value="define función" accent={THEME.cyan} delay={Math.round(4 * fps)} size={16} />
      <KeyCapsule label="socket" value="TCP/UDP crudo" accent={THEME.green} delay={Math.round(12 * fps)} size={16} />
      <KeyCapsule label="sys" value="sys.argv argumentos" accent={THEME.amber} delay={Math.round(14.5 * fps)} size={16} />
      <KeyCapsule label="subprocess / time" value="comandos y pausas" accent={THEME.purple} delay={Math.round(17.5 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Py03LoopsLibraries: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['py-03-loops-libraries'];
  const starts = sceneStartFrames('py-03-loops-libraries', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('py-03-loops-libraries');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/py-03-loops-libraries/py-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/py-03-loops-libraries/py-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/py-03-loops-libraries/py-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
