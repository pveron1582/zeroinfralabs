// ── video/remotion/compositions/Py01PythonIntroEn.tsx ────
// English version of py-01-python-intro. Same visuals; beats
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

// ── Scene 1: the hacking language ─────────────────────────
// EN: rules hacking 1.4 · readable 3.9 · libraries 6.2 · most
// exploits 12.2 · first script 15.1 · favorite 18.9.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      PYTHON: <span style={{ color: THEME.red }}>THE HACKING LANGUAGE</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      readable, powerful, and libraries for almost everything
    </div>
    <KeyCapsule label="most public exploits" value="written in Python" accent={THEME.cyan} delay={Math.round(12.2 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={8.6} fps={fps} mark="▸" color={THEME.cyan}>libraries for networking, HTTP, exploitation</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={18.0} fps={fps} mark="▸" color={THEME.green}>this lesson shows you how to run your first script — and why it's the attacker's favorite</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: interpreted + one-liners + libraries ────────
// EN: interpreted 0.6 · python 3 and the file name 4.7 · dash C 8.8 ·
// one liner 10.6 · indentation 12.1 · lethal 15.5 · socket 17.6 ·
// requests 19.1 · subprocess 21.0 · scapy 22.8 · paramiko 24.0.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      INTERPRETED AND <span style={{ color: THEME.green }}>MODULAR</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$" width={940} delay={Math.round(4.7 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>python3 exploit.py</span>
        {'\n'}<span style={{ color: THEME.amber }}>[*] Running the script directly — no compilation step...</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>python3 -c "print('quick one-liner')"</span>
        {'\n'}<span style={{ color: THEME.green }}>quick one-liner</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={12.1} fps={fps} mark="▸" color={THEME.cyan}>indentation defines the blocks — no braces</RevealLine>
    </div>
    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="socket" value="TCP/UDP networking" accent={THEME.cyan} delay={Math.round(17.6 * fps)} size={16} />
      <KeyCapsule label="requests" value="web HTTP" accent={THEME.green} delay={Math.round(19.1 * fps)} size={16} />
      <KeyCapsule label="subprocess" value="OS commands" accent={THEME.amber} delay={Math.round(21.0 * fps)} size={16} />
      <KeyCapsule label="scapy" value="packets" accent={THEME.red} delay={Math.round(22.8 * fps)} size={16} />
      <KeyCapsule label="paramiko" value="remote SSH" accent={THEME.purple} delay={Math.round(24.0 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: print, comment, input ──────────────────────
// EN: three functions 1.3 · print 3.4 · comment 6.8 · input 8.9 ·
// base 14.6 · files better 19.2.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      THREE <span style={{ color: THEME.cyan }}>ESSENTIAL FUNCTIONS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 first_script.py" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}># a comment: documents what the code does</span>
        {'\n'}<span style={{ color: THEME.cyan }}>print</span><span style={{ color: THEME.text }}>("=== Host Recon ===")</span>
        {'\n'}<span style={{ color: THEME.text }}>target = </span><span style={{ color: THEME.green }}>input</span><span style={{ color: THEME.text }}>("Target IP: ")</span>
        {'\n'}<span style={{ color: THEME.cyan }}>print</span><span style={{ color: THEME.text }}>(f"[*] Scanning host: {'{'}target{'}'}")</span>
        {'\n'}<span style={{ color: THEME.amber }}>Target IP: 10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.green }}>[*] Scanning host: 10.0.0.11</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
      <KeyCapsule label='print("...")' value="prints" accent={THEME.cyan} delay={Math.round(3.4 * fps)} size={18} />
      <KeyCapsule label="# text" value="a comment" accent={THEME.amber} delay={Math.round(6.8 * fps)} size={18} />
      <KeyCapsule label='input("...")' value="asks the user" accent={THEME.green} delay={Math.round(8.9 * fps)} size={18} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={16.4} fps={fps} mark="▸" color={THEME.amber}>show, comment, ask — that's the base · one-liners for quick tests, files for real scripts</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Py01PythonIntroEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['py-01-python-intro'];
  const starts = sceneStartFrames('py-01-python-intro', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/py-01-python-intro/py-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/py-01-python-intro/py-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/py-01-python-intro/py-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
