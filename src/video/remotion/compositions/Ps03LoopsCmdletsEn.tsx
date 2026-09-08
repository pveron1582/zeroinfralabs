// ── video/remotion/compositions/Ps03LoopsCmdletsEn.tsx ─────
// English version of ps-03-loops-cmdlets. Same visuals; beats
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

// ── Scene 1: automating almost anything ───────────────────
// EN: loops 0.2 · cmdlets 2.0 · attack task too 5.8 · same as
// bash 10.2 · power of objects 11.7 · properties 15.4.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      LOOPS, <span style={{ color: THEME.red }}>FUNCTIONS AND CMDLETS</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      automate almost any admin task — and attack tasks too
    </div>
    <KeyCapsule label="power of objects" value="filter and transform in the pipe" accent={THEME.cyan} delay={Math.round(11.7 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={13.4} fps={fps} mark="▸" color={THEME.cyan}>every element of the pipeline is something with properties</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={16.1} fps={fps} mark="▸" color={THEME.green}>the same idea as in bash — but you can filter and transform them</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: foreach, ForEach-Object with $_, for, while ──
// EN: foreach 0.1 · collection 1.0 · foreach object 7.4 · dollar
// underscore 10.4 · current object 12.2 · name 17.0 · numeric ranges
// 21.5.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      LOOPS AND <span style={{ color: THEME.green }}>$_ (THE CURRENT OBJECT)</span>
    </div>
    <TerminalWindow title="PS C:\> .\loops.ps1" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}># 1. foreach loop over a collection</span>
        {'\n'}<span style={{ color: THEME.cyan }}>foreach</span><span style={{ color: THEME.text }}> ($p </span><span style={{ color: THEME.cyan }}>in</span><span style={{ color: THEME.text }}> @(21, 22, 80, 445)) {`{`} </span><span style={{ color: THEME.green }}>"Port: $p"</span><span style={{ color: THEME.text }}> {`}`}</span>
        {'\n'}<span style={{ color: THEME.dim }}># 2. Pipeline ForEach-Object with $_ (the star)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-Process</span><span style={{ color: THEME.text }}> | </span><span style={{ color: THEME.cyan }}>ForEach-Object</span><span style={{ color: THEME.text }}> {`{`} </span><span style={{ color: THEME.amber }}>$_.Name</span><span style={{ color: THEME.text }}> {`}`} </span><span style={{ color: THEME.dim }}># each process's name</span>
        {'\n'}<span style={{ color: THEME.dim }}># 3. Numeric for and a while with a condition</span>
        {'\n'}<span style={{ color: THEME.cyan }}>for</span><span style={{ color: THEME.text }}> ($i=1; $i -le 254; $i++) {`{`} </span><span style={{ color: THEME.green }}>"192.168.1.$i"</span><span style={{ color: THEME.text }}> {`}`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>while</span><span style={{ color: THEME.text }}> ($true) {`{`} $res = Listen(); </span><span style={{ color: THEME.cyan }}>if</span><span style={{ color: THEME.text }}> ($res) {`{`} </span><span style={{ color: THEME.red }}>break</span><span style={{ color: THEME.text }}> {`}`} {`}`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="foreach ($x in $list)" value="iterates a collection" accent={THEME.cyan} delay={Math.round(1.0 * fps)} size={16} />
      <KeyCapsule label="ForEach-Object { $_ }" value="current object in the pipe" accent={THEME.green} delay={Math.round(10.4 * fps)} size={16} />
      <KeyCapsule label="for / while ($cond)" value="ranges and control" accent={THEME.amber} delay={Math.round(20.8 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: functions + I/O + Web/JSON ─────────────────
// EN: function 0.1 · scan 2.3 · cmdlets 7.7 · get content 8.8 ·
/// out file 10.6 · invoke web request 13.9 · JSON 20.0 · APIs 23.7.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      FUNCTIONS AND <span style={{ color: THEME.cyan }}>ESSENTIAL CMDLETS</span>
    </div>
    <TerminalWindow title="PS C:\> .\functions.ps1" width={940} delay={Math.round(1.9 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>function</span><span style={{ color: THEME.green }}> Scan</span><span style={{ color: THEME.text }}> {`{`}</span>
        {'\n'}<span style={{ color: THEME.cyan }}>    param</span><span style={{ color: THEME.text }}>($host, $port)</span>
        {'\n'}<span style={{ color: THEME.dim }}>    # I/O: Get-Content reads | Out-File writes | Add-Content appends</span>
        {'\n'}<span style={{ color: THEME.dim }}>    # HTTP and APIs: Invoke-WebRequest (iwr) and ConvertTo/From-Json</span>
        {'\n'}<span style={{ color: THEME.text }}>    $api = </span><span style={{ color: THEME.cyan }}>Invoke-WebRequest</span><span style={{ color: THEME.green }}> "http://$host/api"</span><span style={{ color: THEME.text }}> | </span><span style={{ color: THEME.cyan }}>ConvertFrom-Json</span>
        {'\n'}<span style={{ color: THEME.text }}>{`}`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="function F { param() }" value="group logic" accent={THEME.cyan} delay={Math.round(0.5 * fps)} size={16} />
      <KeyCapsule label="Get-Content / Out-File" value="read and write" accent={THEME.green} delay={Math.round(8.8 * fps)} size={16} />
      <KeyCapsule label="iwr / ConvertTo-Json" value="HTTP and serialization — perfect for APIs" accent={THEME.purple} delay={Math.round(13.9 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps03LoopsCmdletsEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ps-03-loops-cmdlets'];
  const starts = sceneStartFrames('ps-03-loops-cmdlets', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ps-03-loops-cmdlets/ps-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ps-03-loops-cmdlets/ps-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ps-03-loops-cmdlets/ps-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
