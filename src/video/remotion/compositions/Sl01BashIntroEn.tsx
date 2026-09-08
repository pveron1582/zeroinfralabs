// ── video/remotion/compositions/Sl01BashIntroEn.tsx ────────
// English version of sl-01-bash-intro. Same visuals; beats
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

// ── Scene 1: bash, the terminal's native language ──────────
// EN: scripts 2.0 · native language 3.6 · pentesting tools
// 7.1 · already open 12.1 · everywhere 22.0 · automate 24.8.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      BASH: <span style={{ color: THEME.red }}>THE SHELL THAT BECAME A LANGUAGE</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      before writing exploits, you'll write scripts
    </div>
    <KeyCapsule label="bash" value="shell + language" accent={THEME.cyan} delay={Math.round(3.2 * fps)} size={26} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={12.1} fps={fps} mark="▸" color={THEME.cyan}>the one you already have open every time you drop into a console</RevealLine>
      <br />
      <RevealLine at={22.0} fps={fps} mark="▸" color={THEME.cyan}>it's everywhere, nothing to install, it automates what you do by hand</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: your first script ────────────────────────────
// EN: two things 0.5 · the shell 1.8 · scripting language 5.3 ·
// plain text file 6.7 · top to bottom 9.8 · shebang 13.5 ·
// interpreter 17.6 · without it 19.7.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      YOUR <span style={{ color: THEME.green }}>FIRST SCRIPT</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano first.sh" width={920} delay={Math.round(6.7 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.green }}>#!/bin/bash</span>
        {'\n'}<span style={{ color: THEME.text }}>echo "Hi, I'm a pentesting script"</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ chmod +x first.sh</span>
        {'\n'}<span style={{ color: THEME.dim }}>kali@attacker-01:~$ ./first.sh</span>
        {'\n'}<span style={{ color: THEME.amber }}>Hi, I'm a pentesting script</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label="shebang" value="#!/bin/bash" accent={THEME.green} delay={Math.round(13.5 * fps)} size={20} />
      <KeyCapsule label="commands" value="run top to bottom" accent={THEME.amber} delay={Math.round(9.8 * fps)} size={20} />
    </div>
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={19.7} fps={fps} mark="▸" color={THEME.red}>without it, the system doesn't know what to run your script with</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: three steps, three concepts ─────────────────
// EN: three steps 1.0 · nano 3.1 · chmod 7.1 · dot slash 11.0 ·
// script.sh 14.3 · from /tmp 17.7 · shebang 22.0.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      THREE STEPS, <span style={{ color: THEME.cyan }}>THREE CONCEPTS</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={3.1} fps={fps} mark="1" color={THEME.cyan}>nano → write the shebang and your commands</RevealLine>
      <RevealLine at={7.1} fps={fps} mark="2" color={THEME.amber}>chmod +x → execute permission</RevealLine>
      <RevealLine at={11.0} fps={fps} mark="3" color={THEME.green}>./script.sh → run it (e.g. ./script.sh)</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      in the lab you work from /tmp — writable by everyone · shebang, permission, execution
    </div>
  </AbsoluteFill>
);

export const Sl01BashIntroEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['sl-01-bash-intro'];
  const starts = sceneStartFrames('sl-01-bash-intro', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/sl-01-bash-intro/sl-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/sl-01-bash-intro/sl-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/sl-01-bash-intro/sl-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
