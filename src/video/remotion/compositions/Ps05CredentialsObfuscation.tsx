// ── video/remotion/compositions/Ps05CredentialsObfuscation.tsx ───
// Video: pentesting II — credenciales, ofuscación y exfiltración.
// Clase 5 de Scripting/PowerShell (lección powershell-05). Guiones: voicebox-scripts/ps-05-*.txt
// Audios reales en public/videos/audio/ps-05-credentials-obfuscation/ (ffprobe 2026-08-26).

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

// ── Escena 1: el favorito de la post-explotación ─────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      CREDENCIALES Y <span style={{ color: THEME.red }}>OFUSCACIÓN</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      Acceso a memoria, extracción de credenciales y evasión de controles
    </div>
    <KeyCapsule label="credenciales en RAM" value="viven en el proceso LSASS" accent={THEME.cyan} delay={Math.round(2.5 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={5} fps={fps} mark="▸" color={THEME.cyan}>Toca memoria, credenciales y red — el entorno más potente</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>Las contraseñas y hashes son el botín principal en Windows</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 2: LSASS + Mimikatz + Rubeus ───────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      <span style={{ color: THEME.red }}>LSASS.EXE</span>: EXTRACCIÓN DE CREDENCIALES
    </div>
    <TerminalWindow title="PS C:\> Invoke-Mimikatz" width={940} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>Invoke-Mimikatz</span><span style={{ color: THEME.text }}> -Command </span><span style={{ color: THEME.green }}>'"sekurlsa::logonpasswords"'</span>
        {'\n'}<span style={{ color: THEME.dim }}># Vuelca contraseñas en claro, hashes NTLM y tickets Kerberos:</span>
        {'\n'}<span style={{ color: THEME.amber }}>Authentication Id : 0 ; 1234567</span>
        {'\n'}<span style={{ color: THEME.text }}>User Name         : Administrator</span>
        {'\n'}<span style={{ color: THEME.green }}>* NTLM            : 8846f7eaee8fb117ad06bdd830b7586c</span>
        {'\n'}<span style={{ color: THEME.dim }}>{`# Detección por AV/EDR -> variantes modernas como Rubeus`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="LSASS.exe" value="memoria de sesión" accent={THEME.red} delay={Math.round(3.5 * fps)} size={16} />
      <KeyCapsule label="Invoke-Mimikatz" value="hashes NTLM / Kerberos" accent={THEME.amber} delay={Math.round(8 * fps)} size={16} />
      <KeyCapsule label="Rubeus / EDR" value="variantes modernas" accent={THEME.cyan} delay={Math.round(13 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Escena 3: AMSI + ofuscación base64 ───────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      OFUSCACIÓN: <span style={{ color: THEME.green }}>AMSI Y -EncodedCommand</span>
    </div>
    <TerminalWindow title="PS C:\> powershell -EncodedCommand $enc" width={960} delay={Math.round(1.5 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>$cmd = "whoami /priv"</span>
        {'\n'}<span style={{ color: THEME.text }}>$bytes = [Text.Encoding]::Unicode.GetBytes($cmd)</span>
        {'\n'}<span style={{ color: THEME.text }}>$enc = [Convert]::ToBase64String($bytes) </span><span style={{ color: THEME.dim }}># Base64 UTF-16LE</span>
        {'\n'}<span style={{ color: THEME.dim }}># Ejecutar payload ofuscado sin disparar firmas básicas:</span>
        {'\n'}<span style={{ color: THEME.cyan }}>powershell -NoProfile -EncodedCommand $enc</span>
        {'\n'}<span style={{ color: THEME.amber }}>SeDebugPrivilege            Enabled</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="AMSI" value="escaneo de scripts" accent={THEME.red} delay={Math.round(3.5 * fps)} size={16} />
      <KeyCapsule label="-EncodedCommand" value="Base64 unicode" accent={THEME.green} delay={Math.round(8.5 * fps)} size={16} />
      <KeyCapsule label="ScriptBlock Logging" value="monitoreo de logs" accent={THEME.amber} delay={Math.round(14 * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps05CredentialsObfuscation: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS['ps-05-credentials-obfuscation'];
  const starts = sceneStartFrames('ps-05-credentials-obfuscation', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('ps-05-credentials-obfuscation');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-05-credentials-obfuscation/ps-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-05-credentials-obfuscation/ps-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/ps-05-credentials-obfuscation/ps-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
