// ── video/remotion/compositions/Hw04SqlInjectionEn.tsx ──────
// English version of hw-04-sql-injection. Same visuals; beats
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

// ── Scene 1: what SQLi is ──────────────────────────────────
// EN: pasting unfiltered input 2.0 · speaking SQL 5.6 · login or
// search field 10.2 · commands 16.4 · read/modify/delete 18.7 ·
// writing to the database 23.7.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      SQL INJECTION: <span style={{ color: THEME.red }}>TALKING TO THE DATABASE</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      <RevealLine at={2.0} fps={fps} mark="▸" color={THEME.cyan}>unfiltered input pasted into a query → you speak SQL directly to the server</RevealLine>
      <RevealLine at={10.2} fps={fps} mark="▸" color={THEME.cyan}>login or search fields → inject fragments that change the logic</RevealLine>
      <RevealLine at={16.4} fps={fps} mark="▸" color={THEME.amber}>the database treats your input as commands</RevealLine>
      <RevealLine at={18.7} fps={fps} mark="▸" color={THEME.red}>read, modify, or delete entire tables — you're writing to the database</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: login bypass ─────────────────────────────────
// EN: skipping the login 1.2 · select from users 4.4 · quote
// space or space one equals one 9.1 · always true 13.0 · admin
// 17.3 · curl 18.6 · tautology 27.9 · without knowing 30.2.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      LOGIN <span style={{ color: THEME.green }}>BYPASS</span>
    </div>
    <div style={{ width: 1000, textAlign: 'left', marginBottom: 18 }}>
      <RevealLine at={4.4} fps={fps} mark="▸" color={THEME.dim}>a login query builds: select from users where username = '…' and password = '…'</RevealLine>
      <RevealLine at={9.1} fps={fps} mark="▸" color={THEME.amber}>send as the username: quote space OR space one equals one</RevealLine>
      <RevealLine at={13.0} fps={fps} mark="▸" color={THEME.red}>the condition becomes always true → the first row, often admin</RevealLine>
    </div>
    <TerminalWindow title={"kali@attacker-01:~$ curl -d \"username=admin' OR '1'='1\" --data-urlencode password=x http://10.0.0.11/login"} width={980} delay={Math.round(18.6 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>HTTP/1.1 200 OK</span>
        {'\n'}<span style={{ color: THEME.green }}>Welcome admin!</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="the quote closes" value="the string" accent={THEME.amber} delay={Math.round(24.3 * fps)} size={22} />
      <KeyCapsule label="OR '1'='1'" value="always true" accent={THEME.red} delay={Math.round(27.9 * fps)} size={22} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: impact + defense ─────────────────────────────
// EN: in band 2.4 · union 6.5 · error messages 7.8 · blind 10.1 ·
// yes or no 12.7 · delays 14.7 · impact 16.1 · hashes 18.2 ·
// full server access 21.2 · parameterized 28.3 · never as SQL 33.0.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      BEYOND THE LOGIN: <span style={{ color: THEME.red }}>DUMP EVERYTHING</span>
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      <RevealLine at={2.4} fps={fps} mark="▸" color={THEME.cyan}>in band: read data with queries · UNION joins · error messages leak</RevealLine>
      <RevealLine at={10.1} fps={fps} mark="▸" color={THEME.amber}>blind: no visible output — yes/no questions or measured delays</RevealLine>
      <RevealLine at={16.1} fps={fps} mark="▸" color={THEME.red}>impact: users, password hashes, secrets, full server access</RevealLine>
      <RevealLine at={25.0} fps={fps} mark="▸" color={THEME.green}>defense: parameterized queries — input travels as data, never as SQL</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Hw04SqlInjectionEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['hw-04-sql-injection'];
  const starts = sceneStartFrames('hw-04-sql-injection', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/hw-04-sql-injection/hw-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/hw-04-sql-injection/hw-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/hw-04-sql-injection/hw-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
