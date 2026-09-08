// ── video/remotion/compositions/Py03LoopsLibrariesEn.tsx ──
// English version of py-03-loops-libraries. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
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

// ── Scene 1: 80% of your scripts ─────────────────────────
// EN: 80% 0.0 · loops over IPs 1.8 · functions 3.9 · imports 6.2 ·
/// three pieces 8.5 · same ideas 10.5 · pseudocode 15.1.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      LOOPS, <span style={{ color: THEME.red }}>FUNCTIONS AND LIBRARIES</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      80% of your pentesting tools
    </div>
    <KeyCapsule label="clean syntax" value="reads like pseudocode" accent={THEME.cyan} delay={Math.round(14.4 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={1.8} fps={fps} mark="▸" color={THEME.cyan}>loops over IPs and ports · functions so you don't repeat yourself</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={6.2} fps={fps} mark="▸" color={THEME.green}>imports to bring in outside power — here you see the three pieces</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: 3 ways to for + while True ──────────────────
// EN: 3 ways 1.9 · with range 2.9 · numeric range 7.6 · with a
/// list 9.0 · elements 12.0 · a file 13.2 · line by line 15.3 ·
// while true 17.4 · break 19.7.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      WAYS TO <span style={{ color: THEME.green }}>ITERATE</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano loops.py" width={940} delay={Math.round(1.9 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}># 1. Numeric range (e.g. sweep a network segment)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> i </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.green }}> range</span><span style={{ color: THEME.text }}>(1, 255): </span><span style={{ color: THEME.dim }}>print(f"192.168.1.{'{'}i{'}'}")</span>
        {'\n'}<span style={{ color: THEME.dim }}># 2. Over a list's elements</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> p </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> [21, 22, 80, 445]: </span><span style={{ color: THEME.dim }}>print(f"Port: {'{'}p{'}'}")</span>
        {'\n'}<span style={{ color: THEME.dim }}># 3. A file, line by line (a password wordlist)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> line </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.green }}> open</span><span style={{ color: THEME.text }}>("wordlist.txt"): </span><span style={{ color: THEME.dim }}>try_it(line.strip())</span>
        {'\n'}<span style={{ color: THEME.dim }}># 4. An infinite loop with a break to get out</span>
        {'\n'}<span style={{ color: THEME.cyan }}>while</span><span style={{ color: THEME.amber }}> True</span><span style={{ color: THEME.text }}>: res = listen(); </span><span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> "OK" </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> res: </span><span style={{ color: THEME.red }}>break</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="range(1, 255)" value="numeric range" accent={THEME.cyan} delay={Math.round(3.4 * fps)} size={16} />
      <KeyCapsule label="for p in [...]" value="iterate a list" accent={THEME.green} delay={Math.round(9.3 * fps)} size={16} />
      <KeyCapsule label="for l in open()" value="line by line" accent={THEME.amber} delay={Math.round(13.5 * fps)} size={16} />
      <KeyCapsule label="while True / break" value="infinite loop" accent={THEME.red} delay={Math.round(17.4 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: def functions + essential imports ───────────
// EN: def 1.4 · scan 4.2 · indented block 7.3 · call it 8.9 ·
/// imports 11.1 · socket 12.8 · essentials 16.2 · sys 21.3 ·
// subprocess 22.9 · time 24.7.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      DEFINING FUNCTIONS AND <span style={{ color: THEME.cyan }}>IMPORTS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano functions.py" width={940} delay={Math.round(11.1 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> socket, sys, subprocess, time </span><span style={{ color: THEME.dim }}># or from socket import socket</span>
        {'\n'}
        {'\n'}<span style={{ color: THEME.cyan }}>def</span><span style={{ color: THEME.green }}> scan</span><span style={{ color: THEME.text }}>(host, port): </span><span style={{ color: THEME.dim }}># def name(parameters):</span>
        {'\n'}<span style={{ color: THEME.text }}>    print(f"[*] Connecting to {'{'}host{'}'}:{'{'}port{'}'}...") </span><span style={{ color: THEME.dim }}># indented block</span>
        {'\n'}
        {'\n'}<span style={{ color: THEME.green }}>scan</span><span style={{ color: THEME.text }}>("10.0.0.11", 80) </span><span style={{ color: THEME.dim }}># call it with the values</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="def func(args):" value="define a function" accent={THEME.cyan} delay={Math.round(1.4 * fps)} size={16} />
      <KeyCapsule label="socket" value="raw TCP/UDP" accent={THEME.green} delay={Math.round(18.1 * fps)} size={16} />
      <KeyCapsule label="sys" value="sys.argv arguments" accent={THEME.amber} delay={Math.round(21.3 * fps)} size={16} />
      <KeyCapsule label="subprocess / time" value="commands and pauses" accent={THEME.purple} delay={Math.round(22.9 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Py03LoopsLibrariesEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['py-03-loops-libraries'];
  const starts = sceneStartFrames('py-03-loops-libraries', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/py-03-loops-libraries/py-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/py-03-loops-libraries/py-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/py-03-loops-libraries/py-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
