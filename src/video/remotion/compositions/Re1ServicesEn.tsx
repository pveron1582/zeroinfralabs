// ── video/remotion/compositions/Re1ServicesEn.tsx ─────────────
// English version of re1-02-services. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: SSH (22) — the serious one ───────────────────────
// EN: SSH 6.3 · encrypted 10.2 · attacks 13.0 · 22 open 15.7. Panel
// at 5.9s → relative: 0.4 / 4.3 / 7.1 / 9.8.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>SERVICES YOU'LL SEE <span style={{ color: THEME.green }}>OVER AND OVER</span></>}
          subtitle="SMB · FTP · SSH · VNC"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 16 }}>🔒 SSH — PORT 22</div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            <RevealLine at={4.3} fps={fps} mark="▸" color={THEME.green}>secure remote administration, encrypted end to end</RevealLine>
            <RevealLine at={7.1} fps={fps} mark="▸" color={THEME.red}>typical attacks: brute force and key theft</RevealLine>
            <RevealLine at={9.8} fps={fps} mark="✓" color={THEME.green}>22 open = password guessing begins</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: FTP / SMB / VNC ─────────────────────────────────
// EN: FTP 0.0 · SMB 14.5 · VNC 24.5
const OTHERS = [
  { name: 'FTP', port: '21', icon: '📁', color: THEME.amber, desc: 'file transfer in plain text · anonymous login common · today SFTP' },
  { name: 'SMB', port: '445', icon: '🪟', color: THEME.red, desc: 'Windows file sharing · EternalBlue (MS17-010) · if open, hunt for exploits' },
  { name: 'VNC', port: '5900', icon: '🖥️', color: THEME.cyan, desc: 'graphical remote desktop · sometimes with no password · its Windows cousin is RDP (3389)' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      THE OTHER <span style={{ color: THEME.amber }}>THREE</span>
    </div>
    <div style={{ display: 'flex', gap: 22, width: 1120 }}>
      {OTHERS.map((s, i) => {
        const at = [0.0, 14.5, 24.5][i];
        return (
        <div key={s.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
          <RevealLine at={at} fps={fps} mark="◆" color={s.color}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{s.name}</span>
            <span style={{ fontSize: 13, color: THEME.dim, marginLeft: 8 }}>{s.port}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.6 }}>{s.desc}</div>
        </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: nmap -sV + closing ─────────────────────────────
// EN: scan 3.2 · 21 vsftpd 8.2 · 22 OpenSSH 10.5 · 445 Samba 12.6 ·
// 5900 VNC 14.5 · leads 16.8 · optional 19.8-20.2 · vectors 22.1
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(22.1 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            ONE HOST, <span style={{ color: THEME.cyan }}>FOUR LEADS</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$ nmap -sV 10.0.0.11" width={720} delay={Math.round(3.2 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.dim }}>21/tcp</span>   open  ftp   <span style={{ color: THEME.amber }}>vsFTPd 3.0.3</span>
              {'\n'}<span style={{ color: THEME.dim }}>22/tcp</span>   open  ssh   <span style={{ color: THEME.green }}>OpenSSH 8.2p1</span>
              {'\n'}<span style={{ color: THEME.dim }}>445/tcp</span>  open  smb   <span style={{ color: THEME.red }}>Samba 4.11.6</span>
              {'\n'}<span style={{ color: THEME.dim }}>5900/tcp</span> open  vnc   <span style={{ color: THEME.cyan }}>VNC 3.8</span>
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            every version string is a lead for <span style={{ color: THEME.amber }}>finding exploits</span>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>VERSION SCANNING <span style={{ color: THEME.amber }}>IS NOT OPTIONAL</span></>}
          subtitle="it turns open ports into attack vectors"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1ServicesEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re1-02-services'];
  const starts = sceneStartFrames('re1-02-services', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re1-02-services/re1-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re1-02-services/re1-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re1-02-services/re1-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
