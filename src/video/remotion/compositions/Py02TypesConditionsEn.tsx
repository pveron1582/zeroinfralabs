// ── video/remotion/compositions/Py02TypesConditionsEn.tsx ─
// English version of py-02-types-conditions. Same visuals; beats
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

// ── Scene 1: few types, intuitive ────────────────────────
// EN: few types 0.6 · numbers 3.0 · dictionaries 5.4 · four and an
// if 6.3 · use the most 12.0.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      TYPES AND <span style={{ color: THEME.red }}>CONDITIONS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      numbers, text, lists, and dictionaries to model attacks
    </div>
    <KeyCapsule label="4 types and an if" value="model almost any pentest" accent={THEME.cyan} delay={Math.round(6.3 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={8.0} fps={fps} mark="▸" color={THEME.cyan}>with those four and an if, you can already model almost anything in a pentest</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={12.0} fps={fps} mark="▸" color={THEME.green}>the part of the language you'll use the most — worth having clear from the start</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: the four basic types + f-strings ───────────
// EN: four basic types 0.1 · quotes 1.9 · number 2.8 · square
// brackets 4.1 · braces 6.1 · brackets 9.0 · first port 10.7 ·
// F strings 16.2 · Len 21.0.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      THE FOUR <span style={{ color: THEME.green }}>BASIC TYPES</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 -i types.py" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>ip = </span><span style={{ color: THEME.green }}>"10.0.0.11"</span><span style={{ color: THEME.dim }}>{`                  # a text in quotes`}</span>
        {'\n'}<span style={{ color: THEME.text }}>port = </span><span style={{ color: THEME.amber }}>80</span><span style={{ color: THEME.dim }}>{`                   # a number`}</span>
        {'\n'}<span style={{ color: THEME.text }}>open_ports = [</span><span style={{ color: THEME.amber }}>22</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.amber }}>80</span><span style={{ color: THEME.text }}>, </span><span style={{ color: THEME.amber }}>445</span><span style={{ color: THEME.text }}>]</span><span style={{ color: THEME.dim }}>{`     # list in brackets -> open_ports[0]`}</span>
        {'\n'}<span style={{ color: THEME.text }}>server = {`{"os": "Linux", "web": "Apache"}`}</span><span style={{ color: THEME.dim }}>{` # dict in braces -> server["os"]`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>info = f"{'{'}ip{'}'}:{'{'}port{'}'} active"</span><span style={{ color: THEME.dim }}>{`       # f-string, variables in braces`}</span>
        {'\n'}<span style={{ color: THEME.dim }}>{`# len(open_ports) is 3  |  80 in open_ports is True`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="open_ports[0]" value="list index" accent={THEME.cyan} delay={Math.round(9.0 * fps)} size={16} />
      <KeyCapsule label='server["os"]' value="dict key" accent={THEME.green} delay={Math.round(11.7 * fps)} size={16} />
      <KeyCapsule label='f"{var}"' value="f-string" accent={THEME.amber} delay={Math.round(16.2 * fps)} size={16} />
      <KeyCapsule label="len() / in" value="size and membership" accent={THEME.purple} delay={Math.round(21.0 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: if, elif, else + int(input()) ─────────────
// EN: conditions 0.0 · colon 3.8 · indented block 5.4 · double
/// equals 9.6 · input returns text 16.6 · int 20.7.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      CONDITIONS: <span style={{ color: THEME.cyan }}>IF, ELIF, ELSE</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ python3 decision.py" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>port = </span><span style={{ color: THEME.green }}>int</span><span style={{ color: THEME.text }}>(</span><span style={{ color: THEME.green }}>input</span><span style={{ color: THEME.text }}>("Port to try: ")) </span><span style={{ color: THEME.dim }}>{`# input() gives str -> convert to int`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> port == </span><span style={{ color: THEME.amber }}>22</span><span style={{ color: THEME.cyan }}>:</span>
        {'\n'}<span style={{ color: THEME.text }}>    print("[+] Secure service: SSH") </span><span style={{ color: THEME.dim }}># indented block</span>
        {'\n'}<span style={{ color: THEME.cyan }}>elif</span><span style={{ color: THEME.text }}> port == </span><span style={{ color: THEME.amber }}>80</span><span style={{ color: THEME.cyan }}> or</span><span style={{ color: THEME.text }}> port == </span><span style={{ color: THEME.amber }}>443</span><span style={{ color: THEME.cyan }}>:</span>
        {'\n'}<span style={{ color: THEME.text }}>    print("[+] Active web service")</span>
        {'\n'}<span style={{ color: THEME.cyan }}>else:</span>
        {'\n'}<span style={{ color: THEME.text }}>    print("[-] Unlisted service")</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="if / elif / else:" value="colon + indented block" accent={THEME.cyan} delay={Math.round(3.8 * fps)} size={17} />
      <KeyCapsule label="== != < > and or not" value="comparisons" accent={THEME.green} delay={Math.round(7.8 * fps)} size={17} />
      <KeyCapsule label="int(input())" value="text to number" accent={THEME.amber} delay={Math.round(16.6 * fps)} size={17} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={22.4} fps={fps} mark="▸" color={THEME.amber}>that's the foundation of any script that decides something</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Py02TypesConditionsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['py-02-types-conditions'];
  const starts = sceneStartFrames('py-02-types-conditions', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/py-02-types-conditions/py-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/py-02-types-conditions/py-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/py-02-types-conditions/py-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
