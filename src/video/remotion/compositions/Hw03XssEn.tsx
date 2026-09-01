// ── video/remotion/compositions/Hw03XssEn.tsx ────────────────
// English version of hw-03-xss. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

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

// ── Scene 1: what XSS is ──────────────────────────────────
// EN: browser not server 0.0 · unescaped 10.8 · classic test
// 19.3 · dialogue 22.3 · search box 26.0.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      XSS: <span style={{ color: THEME.red }}>CODE IN THE BROWSER</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={3.0} fps={fps} mark="▸" color={THEME.cyan}>not the server — it runs in the victim's browser</RevealLine>
      <RevealLine at={8.0} fps={fps} mark="▸" color={THEME.cyan}>unescaped input → the browser reads it as code, not text</RevealLine>
      <RevealLine at={19.3} fps={fps} mark="▸" color={THEME.amber}>the classic test: &lt;script&gt;alert(1)&lt;/script&gt;</RevealLine>
      <RevealLine at={22.3} fps={fps} mark="▸" color={THEME.green}>if the dialogue pops inside your session, the app is vulnerable</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: three flavors, reflected in the URL ──────────
// EN: three flavors 1.7 · reflected 2.9 · stored 9.6 · DOM 17.8 ·
// curl 24.3 · executable code 32.7.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      THREE <span style={{ color: THEME.green }}>FLAVORS</span>
    </div>
    <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
      <KeyCapsule label="reflected" value="in the URL" accent={THEME.cyan} delay={Math.round(2.9 * fps)} size={20} />
      <KeyCapsule label="stored" value="on the server" accent={THEME.red} delay={Math.round(9.6 * fps)} size={20} />
      <KeyCapsule label="DOM-based" value="client-side" accent={THEME.green} delay={Math.round(17.8 * fps)} size={20} />
    </div>
    <TerminalWindow title={"kali@attacker-01:~$ curl 'http://10.0.0.11/search?q=<script>alert(1)</script>'"} width={980} delay={Math.round(24.3 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>&lt;div class="result"&gt;Results for: </span>
        <span style={{ color: THEME.red }}>&lt;script&gt;alert(1)&lt;/script&gt;</span>
        <span style={{ color: THEME.dim }}>&lt;/div&gt;</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 20, fontSize: 17, color: THEME.muted, fontFamily: MONO, width: 900 }}>
      when the victim opens the URL, the script becomes <span style={{ color: THEME.red }}>executable code</span> in their browser, not text
    </div>
  </AbsoluteFill>
);

// ── Scene 3: impact + defense ─────────────────────────────
// EN: read cookies 2.9 · keystrokes 6.9 · screenshots 8.5 ·
// phishing 9.9 · permissions 13.9 · gateway 18.6 · defense 22.1 ·
// text 27.6.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      IMPACT: <span style={{ color: THEME.red }}>SESSION HIJACKING</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={2.9} fps={fps} mark="▸" color={THEME.amber}>reads cookies → hijacks the session, steals your login</RevealLine>
      <RevealLine at={6.9} fps={fps} mark="▸" color={THEME.amber}>captures keystrokes · screenshots · redirects to phishing · calls APIs</RevealLine>
      <RevealLine at={13.9} fps={fps} mark="▸" color={THEME.amber}>runs with the logged-in user's permissions: more privileges, more you get</RevealLine>
      <RevealLine at={22.1} fps={fps} mark="▸" color={THEME.green}>defense: always escape the output, never trust user input as HTML</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Hw03XssEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['hw-03-xss'];
  const starts = sceneStartFrames('hw-03-xss', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/hw-03-xss/hw-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/hw-03-xss/hw-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/hw-03-xss/hw-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
