// ── video/remotion/compositions/Wi05NetworkServicesEn.tsx ───────
// English version of wi-05-network-services. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: SMB ─────────────────────────────────────────────────
// EN (absolute): SMB 3.8 · port 445 5.5 · admin shares 9.0 · custom
// shares 17.6 · EternalBlue 24.6. Panel starts at 2.9s → relative:
// 0.9 / 2.6 / 6.1 / 14.7 / 21.7.
const SMB_POINTS = [
  { text: 'port 445: files and printers', at: 2.6 },
  { text: 'admin shares by default: C$, ADMIN$, IPC$', at: 6.1 },
  { text: 'custom shares: the classic target', at: 14.7 },
  { text: 'EternalBlue: takes old Windows without credentials', at: 21.7 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(2.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE <span style={{ color: THEME.cyan }}>WAYS IN</span></>}
          subtitle="the services Windows machines talk to each other with"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 16 }}>
                📁 SMB — 445
              </div>
              {SMB_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
              ))}
            </div>
            {/* delay relative to the panel: enters at 9.0s of scene, when the
                narration names the admin shares */}
            <TerminalWindow title="C:\\> net share" width={520} delay={Math.round(6.1 * fps)}>
              <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.6 }}>
                <span style={{ color: THEME.cyan }}>C$</span>     C:\          Default share
                {'\n'}<span style={{ color: THEME.cyan }}>ADMIN$</span>  C:\Windows   Remote Admin
                {'\n'}<span style={{ color: THEME.cyan }}>IPC$</span>                Remote IPC
                {'\n'}<span style={{ color: THEME.cyan }}>datos</span>   D:\datos
                {'\n'}<span style={{ color: THEME.cyan }}>publico</span>  E:\publico
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: RDP ─────────────────────────────────────────────────
// EN: RDP 0.7 · port 3389 2.9 · brute force 5.2 · lateral movement
// 8.6 · steal creds 12.7 · pass-the-hash 15.5
const RDP_POINTS = [
  { text: 'port 3389: the graphical remote desktop', at: 0.7 },
  { text: 'exposed to the internet = a brute force magnet', at: 5.2 },
  { text: 'lateral movement: credentials → the next machine', at: 8.6 },
  { text: 'saved credentials + pass-the-hash with Restricted Admin are real', at: 12.7 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '30px 36px', width: 900, textAlign: 'left' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 16 }}>
          🖥️ RDP — 3389
        </div>
        <div style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>
          Remote Desktop Protocol: the remote machine's screen
        </div>
        {RDP_POINTS.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: WinRM + closing ─────────────────────────────────────
// EN: WinRM 0.7 · channel 3.8 · valid creds 6.8 · Evil-WinRM 9.7 ·
// "username and password" 12.7 · "first things you try" 16.7
const WINRM_POINTS = [
  { text: 'port 5985: the channel for PowerShell Remoting', at: 0.7 },
  { text: 'with valid credentials → a full remote shell', at: 3.8 },
  { text: 'Evil-WinRM: username + password → interactive PowerShell', at: 9.7 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: "username and password" at ~12.7s
  const closeAt = Math.round(12.7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 16 }}>
                ⚡ WINRM — 5985
              </div>
              {WINRM_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="kali@attacker:~$ evil-winrm" width={520}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
                <span style={{ color: THEME.green }}>user</span> + <span style={{ color: THEME.green }}>pass</span>
                {'\n'}Info: Establishing connection...
                {'\n'}Info: Starting interactive PowerShell
                {'\n'}<span style={{ color: THEME.purple }}>*Evil-WinRM*</span>{' PS C:\\Users\\admin>'}
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>USERNAME + PASSWORD = <span style={{ color: THEME.green }}>SHELL ON THE TARGET</span></>}
          subtitle="one of the first things you try when you get credentials"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi05NetworkServicesEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['wi-05-network-services'];
  const starts = sceneStartFrames('wi-05-network-services', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: SMB */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/wi-05-network-services/wi-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: RDP */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/wi-05-network-services/wi-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: WinRM + closing */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/wi-05-network-services/wi-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
