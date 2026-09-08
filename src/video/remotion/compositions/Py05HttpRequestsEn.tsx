// ── video/remotion/compositions/Py05HttpRequestsEn.tsx ──
// English version of py-05-http-requests. Same visuals; beats
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

// ── Scene 1: the web, target number one ───────────────────
// EN: target number one 0.2 · requests library 2.2 · HTTP attacks
// 4.1 · logins 5.8 · payloads 8.4 · perfect close 10.1 · heavy
// lifting 18.1.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      HTTP WITH <span style={{ color: THEME.red }}>REQUESTS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      the web is target number one — automate your attacks
    </div>
    <KeyCapsule label="web automation" value="logins, paths, payloads" accent={THEME.cyan} delay={Math.round(4.1 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={10.1} fps={fps} mark="▸" color={THEME.cyan}>the perfect close for the module — it brings together everything you saw</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={14.1} fps={fps} mark="▸" color={THEME.green}>loops to repeat, conditions to decide, and a library that does the network's heavy lifting</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: requests in three lines ─────────────────────
// EN: three lines 2.5 · r equals requests get 3.8 · status code
// 10.0 · headers 12.3 · body 14.3 · post sends 16.2 · session 17.8 ·
// stays logged in 21.0.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      HTTP IN <span style={{ color: THEME.green }}>THREE LINES</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 -i http_test.py" width={940} delay={Math.round(3.8 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>import</span><span style={{ color: THEME.text }}> requests</span>
        {'\n'}<span style={{ color: THEME.text }}>r = requests.get(</span><span style={{ color: THEME.green }}>"http://10.0.0.11"</span><span style={{ color: THEME.text }}>) </span><span style={{ color: THEME.dim }}># send the GET, keep the response</span>
        {'\n'}<span style={{ color: THEME.cyan }}>r.status_code</span><span style={{ color: THEME.dim }}>        # 200 (the HTTP code)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>r.headers["Server"]</span><span style={{ color: THEME.dim }}>  # Apache/2.4.41 (the headers)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>r.text</span><span style={{ color: THEME.dim }}>               # the page's HTML body</span>
        {'\n'}<span style={{ color: THEME.dim }}># requests.post(url, data={'{...}'}) sends form data</span>
        {'\n'}<span style={{ color: THEME.dim }}># s = requests.Session() keeps cookies — like a browser that stays logged in</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="r.status_code / r.text" value="code and body" accent={THEME.cyan} delay={Math.round(10.0 * fps)} size={16} />
      <KeyCapsule label="requests.post" value="sends data/logins" accent={THEME.green} delay={Math.round(16.2 * fps)} size={16} />
      <KeyCapsule label="requests.Session()" value="keeps cookies" accent={THEME.amber} delay={Math.round(17.8 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: login brute force and fuzzing ──────────────
// EN: pattern 0.2 · word list 1.7 · decide on the response 4.9 ·
/// welcome 8.3 · success 10.4 · break 16.8 · directories 18.7 ·
// brute forcer 21.3.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      BRUTE FORCE: <span style={{ color: THEME.cyan }}>DECIDE BY THE RESPONSE</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 brute.py" width={940} delay={Math.round(1.7 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> pwd </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> [</span><span style={{ color: THEME.green }}>"123456"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.green }}>"admin"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.green }}>"toor"</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.green }}>"secret"</span><span style={{ color: THEME.text }}>]:</span>
        {'\n'}<span style={{ color: THEME.text }}>    r = requests.post(url, data={'{'}"user": "admin", "pass": pwd{'}'})</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    if </span><span style={{ color: THEME.green }}>"welcome" </span><span style={{ color: THEME.cyan }}>in </span><span style={{ color: THEME.text }}>r.text.lower() </span><span style={{ color: THEME.cyan }}>or </span><span style={{ color: THEME.text }}>r.status_code == </span><span style={{ color: THEME.amber }}>302</span><span style={{ color: THEME.cyan }}>:</span>
        {'\n'}<span style={{ color: THEME.text }}>        print(f"[+] Valid credential: admin:{'{'}pwd{'}'}")</span>
        {'\n'}<span style={{ color: THEME.cyan }}>        break</span>
        {'\n'}<span style={{ color: THEME.dim }}>{`[-] admin:123456 -> failed  [-] admin:admin -> failed`}</span>
        {'\n'}<span style={{ color: THEME.green }}>[+] Valid credential: admin:toor</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label='"welcome" in r.text' value="detect success" accent={THEME.green} delay={Math.round(8.3 * fps)} size={16} />
      <KeyCapsule label="status_code == 302" value="detect a redirect" accent={THEME.cyan} delay={Math.round(9.6 * fps)} size={16} />
      <KeyCapsule label="real wordlist" value="brute-forcer / fuzzer" accent={THEME.red} delay={Math.round(21.3 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={18.7} fps={fps} mark="▸" color={THEME.amber}>the same pattern works for discovering directories with GET and status codes</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Py05HttpRequestsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['py-05-http-requests'];
  const starts = sceneStartFrames('py-05-http-requests', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/py-05-http-requests/py-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/py-05-http-requests/py-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/py-05-http-requests/py-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
