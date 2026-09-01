// ── video/remotion/compositions/Hw01WebProtocolsEn.tsx ──────
// English version of hw-01-web-protocols. Same visuals; beats
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

// ── Scene 1: the web as battlefield + HTTP ───────────────────
// EN: HTTP 2.5 · port 80 10.8 · plain text 13.3 · get/post 18.7 ·
// headers/cookies 22.8 · vulnerabilities 25.3 · SQLi 27.4.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      THE WEB: <span style={{ color: THEME.red }}>THE BIGGEST BATTLEFIELD</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      HTTP and HTTPS are its two main languages
    </div>
    <KeyCapsule label="HTTP" value="port 80 · plain text" accent={THEME.cyan} delay={Math.round(10.8 * fps)} size={26} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={18.7} fps={fps} mark="▸" color={THEME.cyan}>GET requests a resource · POST sends data</RevealLine>
      <br />
      <RevealLine at={22.8} fps={fps} mark="▸" color={THEME.cyan}>headers and cookies carry the sessions</RevealLine>
      <br />
      <RevealLine at={25.3} fps={fps} mark="⚠" color={THEME.red}>the classic vulnerabilities live here: SQLi, XSS, command injection</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: HTTPS — channel protected, app exposed ────────
// EN: HTTPS port 443 0.0-2.4 · wraps in TLS 4.3 · channel 13.3 ·
// injections still work 16.7 · window open 20.9.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      HTTPS: <span style={{ color: THEME.green }}>ENCRYPTED CHANNEL</span>, EXPOSED APP
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={0.0} fps={fps} mark="▸" color={THEME.green}>port 443 · wraps HTTP inside TLS</RevealLine>
      <RevealLine at={13.3} fps={fps} mark="▸" color={THEME.amber}>encryption protects the channel, not the application</RevealLine>
      <RevealLine at={16.7} fps={fps} mark="▸" color={THEME.red}>injections still work — they travel inside legitimate traffic</RevealLine>
      <RevealLine at={20.9} fps={fps} mark="✓" color={THEME.green}>lock the door, but the window stays open</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: other protocols + curl -I ──────────────────────
// EN: WebSocket 2.2 · WebDAV 7.7 · REST 13.3 · DNS exfil 19.0 ·
// curl -i 24.5 · headers 27.4 · first piece 32.0.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      THE PROTOCOLS <span style={{ color: THEME.green }}>DON'T END THERE</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={2.2} fps={fps} mark="▸" color={THEME.cyan}>WebSocket: persistent, two-way · chats, trading, dashboards</RevealLine>
      <RevealLine at={7.7} fps={fps} mark="▸" color={THEME.cyan}>WebDAV: edits files over HTTP · sometimes forgotten, weak auth</RevealLine>
      <RevealLine at={13.3} fps={fps} mark="▸" color={THEME.cyan}>REST/APIs: JSON over HTTP, the language of modern apps</RevealLine>
      <RevealLine at={19.0} fps={fps} mark="⚠" color={THEME.red}>DNS can also be an attack protocol: data inside DNS queries</RevealLine>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ curl -I http://10.0.0.11" width={920} delay={Math.round(24.5 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>HTTP/1.1 200 OK</span>
        {'\n'}<span style={{ color: THEME.dim }}>Date: Mon, 10 Aug 2026 14:22:05 GMT</span>
        {'\n'}<span style={{ color: THEME.green }}>Server: Apache/2.4.41 (Ubuntu)</span>
        {'\n'}<span style={{ color: THEME.dim }}>Content-Type: text/html</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label="Server:" value="version exposed" accent={THEME.amber} delay={Math.round(27.4 * fps)} size={22} />
      <KeyCapsule label="first piece of data" value="pick an exploit" accent={THEME.green} delay={Math.round(32.0 * fps)} size={22} />
    </div>
  </AbsoluteFill>
);

export const Hw01WebProtocolsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['hw-01-web-protocols'];
  const starts = sceneStartFrames('hw-01-web-protocols', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/hw-01-web-protocols/hw-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/hw-01-web-protocols/hw-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/hw-01-web-protocols/hw-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
