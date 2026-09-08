// ── video/remotion/compositions/Sl03LoopsFunctionsEn.tsx ──
// English version of sl-03-loops-functions. Same visuals; beats
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

// ── Scene 1: repeating at scale ───────────────────────────
// EN: at scale 1.6 · 254 hosts 2.4 · by hand 8.1 · loops 10.3 ·
// functions 12.5 · text filters 14.2 · hours 18.0.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      LOOPS, <span style={{ color: THEME.red }}>FUNCTIONS AND FILTERS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      pentesting is repeating things at scale
    </div>
    <KeyCapsule label="254 hosts · 1 wordlist" value="in seconds" accent={THEME.cyan} delay={Math.round(2.4 * fps)} size={24} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={10.3} fps={fps} mark="▸" color={THEME.cyan}>loops for repetition · functions for organization</RevealLine>
      <br />
      <RevealLine at={14.2} fps={fps} mark="▸" color={THEME.cyan}>text filters for keeping only what matters</RevealLine>
      <br />
      <RevealLine at={18.0} fps={fps} mark="▸" color={THEME.amber}>a sweep that would take hours takes seconds</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: for loop + background ───────────────────────
// EN: for loop 0.0 · for ip in 3.5 · do ping 7.4 · done 8.9 ·
// while read 13.8 · less than sign 19.1 · ampersand 22.0 ·
// parallel 25.4.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      FOR LOOP: <span style={{ color: THEME.green }}>PARALLEL SWEEP</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano sweep.sh" width={940} delay={Math.round(2.7 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> ip in $(seq 1 254); </span><span style={{ color: THEME.cyan }}>do</span>
        {'\n'}<span style={{ color: THEME.text }}>{`  ping -c 1 -W 1 10.0.0.$ip | grep "bytes from" | awk '{print $4}' `}</span><span style={{ color: THEME.red }}>&amp;</span>
        {'\n'}<span style={{ color: THEME.cyan }}>done</span>
        {'\n'}<span style={{ color: THEME.cyan }}>wait</span>
        {'\n'}<span style={{ color: THEME.amber }}>10.0.0.1:  10.0.0.11:  10.0.0.22:</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="&" value="in the background" accent={THEME.red} delay={Math.round(22.0 * fps)} size={20} />
      <KeyCapsule label="wait" value="waits for all" accent={THEME.green} delay={Math.round(13.8 * fps)} size={20} />
    </div>
    <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={25.9} fps={fps} mark="▸" color={THEME.amber}>in parallel — that's how sweeps fly</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: functions + grep/awk/sed ───────────────────
// EN: function 0.1 · scan 3.0 · nmap inside 5.8 · call it 7.6 ·
// three filters 11.4 · grep 12.9 · awk 14.6 · sed 16.2 · classic
// example 18.0 · many times 28.1.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      FUNCTIONS AND <span style={{ color: THEME.green }}>TEXT FILTERS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.text }}>scan() {'{'} nmap -sV "$1"; {'}'}</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>scan 10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>{`grep "open" nmap.txt | awk '{print $1}'`}</span>
        {'\n'}<span style={{ color: THEME.amber }}>21/tcp  22/tcp  80/tcp</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      <KeyCapsule label="grep" value="filters lines" accent={THEME.cyan} delay={Math.round(12.9 * fps)} size={20} />
      <KeyCapsule label="awk" value="extracts columns" accent={THEME.amber} delay={Math.round(14.6 * fps)} size={20} />
      <KeyCapsule label="sed" value="replaces text" accent={THEME.green} delay={Math.round(16.2 * fps)} size={20} />
    </div>
    <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={28.1} fps={fps} mark="▸" color={THEME.cyan}>you scan once and parse it as many times as you want</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Sl03LoopsFunctionsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['sl-03-loops-functions'];
  const starts = sceneStartFrames('sl-03-loops-functions', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/sl-03-loops-functions/sl-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/sl-03-loops-functions/sl-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/sl-03-loops-functions/sl-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
