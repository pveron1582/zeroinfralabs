// ── video/remotion/compositions/Sl02VariablesConditionalsEn.tsx ─
// English version of sl-02-variables-conditionals. Same visuals; beats
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

// ── Scene 1: a script that thinks ──────────────────────────
// EN: useless 2.2 · adapts 4.1 · three pieces 9.9 · variables 10.9 ·
// arguments 12.7 · conditionals 15.0 · tool that thinks 21.3.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      A SCRIPT THAT <span style={{ color: THEME.cyan }}>THINKS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      a script that always does the same thing is useless — it gets good when it adapts to the target
    </div>
    <KeyCapsule label="the key" value="adapts to the target" accent={THEME.cyan} delay={Math.round(4.1 * fps)} size={24} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={10.9} fps={fps} mark="▸" color={THEME.cyan}>variables store data · arguments receive input from outside</RevealLine>
      <br />
      <RevealLine at={15.0} fps={fps} mark="▸" color={THEME.cyan}>conditionals pick the path</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: variables ────────────────────────────────────
// EN: no spaces 3.4 · dollar sign 8.4 · double quotes expand 11.8 ·
// prints 15.6 · single quotes 16.8 · dollar parentheses 23.2 ·
// date 26.3.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      <span style={{ color: THEME.green }}>VARIABLES</span>: STORING DATA
    </div>
    <TerminalWindow title="kali@attacker-01:~$" width={920} delay={Math.round(2.2 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>name=kali</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>echo "$name"</span>
        {'\n'}<span style={{ color: THEME.amber }}>kali</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>date=$(date)</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span><span style={{ color: THEME.text }}>echo "$date"</span>
        {'\n'}<span style={{ color: THEME.amber }}>Mon Aug 25 2026 23:59:00</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label="no spaces" value="name=kali" accent={THEME.amber} delay={Math.round(3.4 * fps)} size={20} />
      <KeyCapsule label="capture output" value="date=$(date)" accent={THEME.green} delay={Math.round(23.2 * fps)} size={20} />
    </div>
    <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={11.8} fps={fps} mark="▸" color={THEME.amber}>double quotes expand the variable · single quotes print the literal text</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: arguments + conditional ────────────────────
// EN: arguments 1.2 · dollar zero 3.1 · dollar one 5.5 · hash 8.2 ·
// conditionals 10.7 · if bracket 12.7 · usage 18.6 · tests 21.3 ·
// dash f 22.2 · mandatory 28.5.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      ARGUMENTS AND <span style={{ color: THEME.green }}>CONDITIONALS</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano ping.sh" width={920} delay={Math.round(1.2 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.green }}>#!/bin/bash</span>
        {'\n'}<span style={{ color: THEME.text }}>host=$1</span>
        {'\n'}<span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> [ -z "$host" ]; </span><span style={{ color: THEME.cyan }}>then</span>
        {'\n'}<span style={{ color: THEME.text }}>  echo "Usage: ./ping.sh &lt;host&gt;"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>else</span>
        {'\n'}<span style={{ color: THEME.text }}>  ping -c 2 "$host"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>fi</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      <KeyCapsule label="$1 $2 … $#" value="arguments" accent={THEME.cyan} delay={Math.round(5.5 * fps)} size={20} />
      <KeyCapsule label="-f / -d / -z" value="useful tests" accent={THEME.amber} delay={Math.round(21.3 * fps)} size={20} />
    </div>
    <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={28.5} fps={fps} mark="▸" color={THEME.red}>the spaces inside the brackets are mandatory</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Sl02VariablesConditionalsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['sl-02-variables-conditionals'];
  const starts = sceneStartFrames('sl-02-variables-conditionals', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/sl-02-variables-conditionals/sl-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/sl-02-variables-conditionals/sl-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/sl-02-variables-conditionals/sl-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
