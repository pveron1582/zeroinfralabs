// ── video/remotion/compositions/Ps01ObjectsPipelineEn.tsx ─
// English version of ps-01-objects-pipeline. Same visuals; beats
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

// ── Scene 1: objects, not text ────────────────────────────
// EN: PowerShell 3.8 · official shell 5.9 · one key difference
// 10.2 · passes objects 14.0 · changes everything 15.4 · properties
// 20.8.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      POWERSHELL: <span style={{ color: THEME.red }}>OBJECTS, NOT TEXT</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      the system's official shell — it ships with every modern Windows
    </div>
    <KeyCapsule label="the pipeline" value="passes objects, not text" accent={THEME.cyan} delay={Math.round(12.0 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={15.4} fps={fps} mark="▸" color={THEME.cyan}>that changes everything: no more parsing lines with grep and awk</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={20.8} fps={fps} mark="▸" color={THEME.green}>you manipulate objects with their properties directly</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: cmdlet pipeline ─────────────────────────────
// EN: cmdlets 1.4 · verb dash noun 3.4 · get process 5.5 · the pipe
// 8.6 · sort object 14.1 · where object 19.6 · select object 22.0 ·
// parse text 23.6.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      CMDLETS: <span style={{ color: THEME.green }}>VERB-DASH-NOUN</span>
    </div>
    <TerminalWindow title="PS C:\> Get-Process | Sort-Object CPU -Descending" width={960} delay={Math.round(1.4 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}>PS C:\&gt; </span><span style={{ color: THEME.cyan }}>Get-Process</span><span style={{ color: THEME.text }}> | </span><span style={{ color: THEME.cyan }}>Sort-Object</span><span style={{ color: THEME.text }}> CPU -Descending | </span><span style={{ color: THEME.cyan }}>Select-Object</span><span style={{ color: THEME.text }}> -First 3 Name, CPU</span>
        {'\n'}<span style={{ color: THEME.text }}>Name            CPU</span>
        {'\n'}<span style={{ color: THEME.dim }}>----            ---</span>
        {'\n'}<span style={{ color: THEME.amber }}>lsass          142.50</span>
        {'\n'}<span style={{ color: THEME.amber }}>svchost         98.12</span>
        {'\n'}<span style={{ color: THEME.green }}>powershell      45.60</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="Get-Process / Set-Item" value="Verb-Noun" accent={THEME.cyan} delay={Math.round(3.4 * fps)} size={16} />
      <KeyCapsule label="Sort-Object CPU" value="sorts by property" accent={THEME.amber} delay={Math.round(14.1 * fps)} size={16} />
      <KeyCapsule label="Where / Select-Object" value="filter and pick fields" accent={THEME.green} delay={Math.round(19.6 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={23.6} fps={fps} mark="▸" color={THEME.red}>in bash you'd parse text · here you manipulate objects directly</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: .ps1 scripts + execution policy ────────────
// EN: .ps1 1.0 · run them 3.6 · execution policy 10.0 · bypass
// 11.7 · powershell 13.4 · that flag 18.8 · their tools 23.5.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      <span style={{ color: THEME.cyan }}>.PS1</span> SCRIPTS AND EXECUTION POLICY
    </div>
    <TerminalWindow title="PS C:\> powershell -ep bypass -File .\recon.ps1" width={960} delay={Math.round(10.0 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}>PS C:\&gt; </span><span style={{ color: THEME.text }}>.\recon.ps1</span>
        {'\n'}<span style={{ color: THEME.red }}>File C:\recon.ps1 cannot be loaded because running scripts is disabled.</span>
        {'\n'}<span style={{ color: THEME.dim }}># Bypass the restriction for a pentest run:</span>
        {'\n'}<span style={{ color: THEME.dim }}>PS C:\&gt; </span><span style={{ color: THEME.green }}>powershell -ep bypass -File .\recon.ps1</span>
        {'\n'}<span style={{ color: THEME.green }}>[*] Script ran successfully with the user's privileges</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label=".\script.ps1" value="PowerShell script" accent={THEME.cyan} delay={Math.round(3.6 * fps)} size={16} />
      <KeyCapsule label="Execution Policy" value="blocks by default" accent={THEME.red} delay={Math.round(10.0 * fps)} size={16} />
      <KeyCapsule label="-ep bypass" value="the key pentest flag" accent={THEME.green} delay={Math.round(13.4 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={18.8} fps={fps} mark="▸" color={THEME.amber}>you'll see that flag constantly in pentest guides — the first thing attackers use to run their tools</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Ps01ObjectsPipelineEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ps-01-objects-pipeline'];
  const starts = sceneStartFrames('ps-01-objects-pipeline', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ps-01-objects-pipeline/ps-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ps-01-objects-pipeline/ps-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ps-01-objects-pipeline/ps-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
