// ── video/remotion/compositions/Ps02VariablesConditionsEn.tsx ─
// English version of ps-02-variables-conditionals. Same visuals; beats
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

// ── Scene 1: your scripts' logic ──────────────────────────
// EN: dollar sign in front 2.2 · console in mind 7.5 · arrays 9.3 ·
// conditions 11.0 · same ideas as bash 13.6 · object-oriented 16.0.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      VARIABLES, <span style={{ color: THEME.red }}>ARRAYS AND CONDITIONS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      born with the console in mind — an object-oriented syntax
    </div>
    <KeyCapsule label="$name = 'kali'" value="variables always with $" accent={THEME.cyan} delay={Math.round(2.2 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={9.3} fps={fps} mark="▸" color={THEME.cyan}>arrays, hashtables and conditions build your scripts' logic</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={16.4} fps={fps} mark="▸" color={THEME.green}>the same ideas as in bash — but you'll see them over and over</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: arrays + hashtables + interpolation ────────
// EN: arrays store lists 0.6 · at sign parentheses 1.9 · 22 3.2 ·
// 443 4.1 · range 8.5 · hashtables 9.2 · key and value 10.2 ·
// interpolate 20.3.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      ARRAYS, HASHTABLES AND <span style={{ color: THEME.green }}>INTERPOLATION</span>
    </div>
    <TerminalWindow title="PS C:\> .\structures.ps1" width={940} delay={Math.round(0.6 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>$ports = @(22, 80, 445) </span><span style={{ color: THEME.dim }}>{`# explicit array @(...)`}</span>
        {'\n'}<span style={{ color: THEME.text }}>$range = 22..80 </span><span style={{ color: THEME.dim }}>{`             # quick numeric range`}</span>
        {'\n'}<span style={{ color: THEME.text }}>$server = @{`{ ip = "10.0.0.11"; port = 445 }`} </span><span style={{ color: THEME.dim }}>{`# hashtable key/value`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>$server.ip</span><span style={{ color: THEME.dim }}>              # 10.0.0.11 (direct property access)</span>
        {'\n'}<span style={{ color: THEME.green }}>"Connecting to $($server.ip) on port $($server.port)"</span>
        {'\n'}<span style={{ color: THEME.amber }}>Connecting to 10.0.0.11 on port 445</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="@(22, 80, 445) / 22..80" value="arrays and ranges" accent={THEME.cyan} delay={Math.round(1.9 * fps)} size={16} />
      <KeyCapsule label="@{ ip=... }" value="hashtable key:value" accent={THEME.green} delay={Math.round(9.2 * fps)} size={16} />
      <KeyCapsule label="$($obj.prop)" value="interpolation" accent={THEME.amber} delay={Math.round(20.3 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: if, elseif, else + word operators ──────────
// EN: conditions 0.0 · word style 4.3 · dash EQ 5.2 · dash NE 7.1 ·
// dash GT 9.1 · match 15.2 · like 17.1 · asterisk admin asterisk
// 20.8 · trademark 23.3.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      CONDITIONS AND <span style={{ color: THEME.cyan }}>WORD OPERATORS</span>
    </div>
    <TerminalWindow title="PS C:\> .\evaluate.ps1" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>$account = "CORP\admin_pablo"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> ($account </span><span style={{ color: THEME.green }}>-like</span><span style={{ color: THEME.amber }}> "*admin*"</span><span style={{ color: THEME.text }}>) {`{`}</span>
        {'\n'}<span style={{ color: THEME.text }}>    Write-Host "[+] Administrative account detected"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>{`}`} elseif</span><span style={{ color: THEME.text }}> ($account </span><span style={{ color: THEME.green }}>-eq</span><span style={{ color: THEME.amber }}> "CORP\guest"</span><span style={{ color: THEME.cyan }}> -or</span><span style={{ color: THEME.text }}> $account </span><span style={{ color: THEME.green }}>-match</span><span style={{ color: THEME.amber }}> "^test"</span><span style={{ color: THEME.text }}>) {`{`}</span>
        {'\n'}<span style={{ color: THEME.text }}>    Write-Host "[-] Restricted or temporary account"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>{`}`} else {`{`}</span>
        {'\n'}<span style={{ color: THEME.text }}>    Write-Host "[*] Standard domain user"</span>
        {'\n'}<span style={{ color: THEME.cyan }}>{`}`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="-eq / -ne / -gt / -lt" value="comparison" accent={THEME.cyan} delay={Math.round(5.2 * fps)} size={16} />
      <KeyCapsule label="-and / -or / -not" value="logical" accent={THEME.amber} delay={Math.round(12.5 * fps)} size={16} />
      <KeyCapsule label="-like / -match" value="wildcards and regex" accent={THEME.green} delay={Math.round(15.2 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={22.1} fps={fps} mark="▸" color={THEME.amber}>they're words, not symbols — that's the PowerShell trademark</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Ps02VariablesConditionsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ps-02-variables-conditionals'];
  const starts = sceneStartFrames('ps-02-variables-conditionals', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ps-02-variables-conditionals/ps-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ps-02-variables-conditionals/ps-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ps-02-variables-conditionals/ps-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
