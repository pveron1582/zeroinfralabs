// ── video/remotion/compositions/Hw02DomainsSubdirectoriesEn.tsx ─
// English version of hw-02-domains-subdirectories. Same visuals; beats
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

// ── Scene 1: URL anatomy ────────────────────────────────────
// EN: map it 1.9 · take a URL apart 14.3 · domain 23.2 · subdomain
// 28.7 · subdirectory 35.3.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      BEFORE SHOOTING: <span style={{ color: THEME.red }}>MAP IT</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={23.2} fps={fps} mark="▸" color={THEME.cyan}>domain: example.com (DNS points it at a server)</RevealLine>
      <RevealLine at={28.7} fps={fps} mark="▸" color={THEME.amber}>subdomain: blog. (can resolve to a different server, a different app)</RevealLine>
      <RevealLine at={35.3} fps={fps} mark="▸" color={THEME.green}>subdirectory: /panel/login (a path inside the same app)</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      terrain · different buildings · rooms
    </div>
  </AbsoluteFill>
);

// ── Scene 2: subdomains grow the surface + gobuster ───────
// EN: subdomains 3.7 · dev.example 5.9 · nobody remembers 11.9 ·
// subdirectories 16.7 · admin 19.3 · .git 23.2 · port scan 24.7 ·
// port 80 28.0 · gobuster 33.2 · 404 38.9.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      SUBDOMAINS GROW THE <span style={{ color: THEME.amber }}>ATTACK SURFACE</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left', marginBottom: 18 }}>
      <RevealLine at={3.7} fps={fps} mark="▸" color={THEME.amber}>dev.example.com, staging, old app — old versions, no auth, forgotten</RevealLine>
      <RevealLine at={16.7} fps={fps} mark="▸" color={THEME.red}>subdirectories hide the sensitive parts: admin, phpMyAdmin, backup.zip, .git</RevealLine>
      <RevealLine at={24.7} fps={fps} mark="▸" color={THEME.muted}>none of that shows up in a port scan — it all travels over port 80 or 443</RevealLine>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ gobuster dir -u http://10.0.0.11 -w common.txt" width={960} delay={Math.round(30.7 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>Gobuster v3.1.0</span>
        {'\n'}<span style={{ color: THEME.dim }}>[+] Url: http://10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.green }}>/admin     (Status: 301)</span>
        {'\n'}<span style={{ color: THEME.green }}>/backup    (Status: 200)</span>
        {'\n'}<span style={{ color: THEME.green }}>/uploads   (Status: 301)</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      ask the server directly: thousands of words as paths, keep what isn't a 404
    </div>
  </AbsoluteFill>
);

// ── Scene 3: fuzzing + status codes + defense ─────────────
// EN: fuzzing 0.3 · tools 5.9 · gobuster 6.8 · ffuf 9.5 · wordlist
// 14.9 · status code 16.4 · 200 17.9 · 301 19.2 · 403 22.5 · 404
// 26.1 · subdomain fuzzing 30.4 · defend 35.2.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      FUZZING: <span style={{ color: THEME.cyan }}>GUESSING AT SCALE</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={5.9} fps={fps} mark="▸" color={THEME.cyan}>tools: gobuster, ffuf (filters by size/status), dirb, dirsearch</RevealLine>
      <RevealLine at={17.9} fps={fps} mark="▸" color={THEME.green}>200 exists · 301/302 redirect</RevealLine>
      <RevealLine at={22.5} fps={fps} mark="▸" color={THEME.amber}>403 exists but forbids you (also matters!)</RevealLine>
      <RevealLine at={26.1} fps={fps} mark="▸" color={THEME.red}>404 doesn't exist</RevealLine>
      <RevealLine at={30.4} fps={fps} mark="▸" color={THEME.purple}>subdomain fuzzing: word.example.com against DNS</RevealLine>
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      defense: pull staging out of public DNS · protect admin panels · watch your logs
    </div>
  </AbsoluteFill>
);

export const Hw02DomainsSubdirectoriesEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['hw-02-domains-subdirectories'];
  const starts = sceneStartFrames('hw-02-domains-subdirectories', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/hw-02-domains-subdirectories/hw-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/hw-02-domains-subdirectories/hw-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/hw-02-domains-subdirectories/hw-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
