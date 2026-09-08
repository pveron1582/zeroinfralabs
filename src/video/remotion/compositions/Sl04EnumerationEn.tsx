// ── video/remotion/compositions/Sl04EnumerationEn.tsx ──────
// English version of sl-04-enumeration. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { RevealLine } from '../primitives/RevealLine';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: the recon flow ───────────────────────────────
// EN: first actual case 1.9 · in seconds 5.2 · live hosts 8.7 ·
// services 12.2 · write it once 16.4 · builds first 20.4.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      ENUMERATION: <span style={{ color: THEME.red }}>THE FIRST REAL CASE</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={8.7} fps={fps} mark="1" color={THEME.cyan}>ping sweep → find the live hosts</RevealLine>
      <RevealLine at={10.2} fps={fps} mark="2" color={THEME.amber}>see which ports they have open and what services run behind them</RevealLine>
      <RevealLine at={16.4} fps={fps} mark="3" color={THEME.green}>write it once, run it against the whole network</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      gathers in seconds what would take you 10 minutes by hand — the script every pentester builds first
    </div>
  </AbsoluteFill>
);

// ── Scene 2: the four-step flow ───────────────────────────
// EN: four steps 0.7 · one 2.0 · two 4.9 · three 7.9 · four 12.3 ·
// curl -si 14.1 · headers 16.4 · summary 19.5 · report 21.8.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      RECON: <span style={{ color: THEME.green }}>THE FOUR-STEP FLOW</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={2.0} fps={fps} mark="1" color={THEME.cyan}>ping sweep → live hosts</RevealLine>
      <RevealLine at={4.9} fps={fps} mark="2" color={THEME.amber}>nmap → scan the one you care about</RevealLine>
      <RevealLine at={7.9} fps={fps} mark="3" color={THEME.green}>grep + awk → keep the important parts</RevealLine>
      <RevealLine at={12.3} fps={fps} mark="4" color={THEME.cyan}>curl -si → the headers</RevealLine>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano recon.sh" width={940} delay={Math.round(14.1 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.green }}>#!/bin/bash</span>
        {'\n'}<span style={{ color: THEME.text }}>host=$1</span>
        {'\n'}<span style={{ color: THEME.text }}>nmap -sV -oG /tmp/scan.txt "$host"</span>
        {'\n'}<span style={{ color: THEME.text }}>grep "open" /tmp/scan.txt | grep -oP "[0-9]+/tcp" | cut -d/ -f1</span>
        {'\n'}<span style={{ color: THEME.amber }}>Open ports:  21  22  80</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={19.5} fps={fps} mark="▸" color={THEME.amber}>chains the four steps, prints a clean summary — the one you later turn into your report</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: parsing tools ───────────────────────────────
// EN: parsing well 0.7 · nmap dash OG 2.1 · greppable 4.8 · awk
// 8.3 · curl dash SI 9.8 · x powered by 13.5 · grep dash OP 16.4 ·
// golden rule 20.9 · reusable 26.6.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      PARSE IT WELL: <span style={{ color: THEME.cyan }}>THE GOLDEN RULE</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={2.1} fps={fps} mark="▸" color={THEME.cyan}>nmap -oG: greppable format — one line per host, perfect for awk</RevealLine>
      <RevealLine at={9.8} fps={fps} mark="▸" color={THEME.amber}>curl -sI: Server and X-Powered-By reveal the running stack</RevealLine>
      <RevealLine at={16.4} fps={fps} mark="▸" color={THEME.green}>grep -oP + cut: extract just the port numbers</RevealLine>
      <RevealLine at={20.9} fps={fps} mark="★" color={THEME.amber}>scan once, save the output, parse it as many times as you want — reusable for every host</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Sl04EnumerationEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['sl-04-enumeration'];
  const starts = sceneStartFrames('sl-04-enumeration', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/sl-04-enumeration/sl-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/sl-04-enumeration/sl-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/sl-04-enumeration/sl-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
