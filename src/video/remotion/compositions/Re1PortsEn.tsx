// ── video/remotion/compositions/Re1PortsEn.tsx ────────────────
// English version of re1-03-ports. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: what is a port ───────────────────────────────────
// EN: port is a number 3.2 · IP says 10.7 · socket 15.4 · example
// 16.9 · first thing 23.1. Panel at 10.5s → relative: 0.2 / 4.9.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(10.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>WHAT IS A <span style={{ color: THEME.cyan }}>PORT</span>?</>}
          subtitle="a number between 0 and 65535"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 26 }}>
            <KeyCapsule label="machine" value="192.168.1.11" accent={THEME.cyan} delay={0} size={26} />
            <span style={{ fontSize: 32, color: THEME.dim, fontFamily: MONO }}>:</span>
            <KeyCapsule label="service" value="22" accent={THEME.green} delay={Math.round(6.4 * fps)} size={26} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            IP = WHICH MACHINE · PORT = <span style={{ color: THEME.green }}>WHICH SERVICE</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 760, textAlign: 'left' }}>
            <RevealLine at={4.9} fps={fps} mark="▸" color={THEME.cyan}>the OS reads the port and hands the packet to the right program</RevealLine>
            <RevealLine at={4.9} fps={fps} mark="✓" color={THEME.green}>socket = IP:port</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: why they exist + the 3 ranges ────────────────────
// EN: many services 4.0 · right program 13.1 · well-known 23.0 ·
// registered 27.6 · ephemeral 32.2
const RANGES = [
  { name: 'WELL KNOWN', rango: '0–1023', color: THEME.green, desc: 'reserved for the classics (HTTP, SSH, DNS, FTP)' },
  { name: 'REGISTERED', rango: '1024–49151', color: THEME.cyan, desc: 'user services, like MySQL on 3306' },
  { name: 'EPHEMERAL', rango: '49152–65535', color: THEME.amber, desc: 'dynamic, assigned by the OS to outgoing connections' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      65,536 PORTS IN <span style={{ color: THEME.cyan }}>3 RANGES</span>
    </div>
    <div style={{ display: 'flex', gap: 22, width: 1120 }}>
      {RANGES.map((r, i) => {
        const at = [23.0, 27.6, 32.2][i];
        return (
        <div key={r.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${r.color}60`,
          borderTop: `5px solid ${r.color}`, borderRadius: 12, padding: '22px 20px', textAlign: 'center',
        }}>
          <RevealLine at={at} fps={fps} mark="◆" color={r.color}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{r.name}</span>
          </RevealLine>
          <div style={{ fontSize: 22, color: r.color, fontFamily: MONO, marginTop: 8 }}>{r.rango}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{r.desc}</div>
        </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: the ports you must know + closing ───────────────
// EN (absolute): 21@2.3 · 22@3.9 · 23@5.3 · 25@8.8 · 53@10.3 ·
// 80@11.5 · 110@12.7 · 143@13.8 · 443@15.3 · 445@17.2 · 3306@18.8 ·
// 3389@21.2 · 8080@23.0 · "next command" 26.0
const CLASSICS = [
  { p: '21', s: 'FTP', c: THEME.cyan },
  { p: '22', s: 'SSH', c: THEME.green },
  { p: '23', s: 'TELNET', c: THEME.red },
  { p: '25', s: 'SMTP', c: THEME.purple },
  { p: '53', s: 'DNS', c: THEME.amber },
  { p: '80', s: 'HTTP', c: THEME.cyan },
  { p: '110', s: 'POP3', c: THEME.cyan },
  { p: '143', s: 'IMAP', c: THEME.cyan },
  { p: '443', s: 'HTTPS', c: THEME.green },
  { p: '445', s: 'SMB', c: THEME.red },
  { p: '3306', s: 'MYSQL', c: THEME.amber },
  { p: '3389', s: 'RDP', c: THEME.purple },
  { p: '8080', s: 'HTTP ALT', c: THEME.cyan },
];

const CHIP_AT = [2.3, 3.9, 5.3, 8.8, 10.3, 11.5, 12.7, 13.8, 15.3, 17.2, 18.8, 21.2, 23.0];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(26.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            THE ONES YOU'LL SEE <span style={{ color: THEME.green }}>EVERY TIME</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 980, justifyContent: 'center' }}>
            {CLASSICS.map((x, i) => (
              <RevealLine key={x.p + x.s} at={CHIP_AT[i]} fps={fps} mark="" color={x.c}>
                <span style={{
                  display: 'inline-flex', alignItems: 'baseline', gap: 10,
                  background: THEME.panel, border: `1px solid ${x.c}60`, borderRadius: 10, padding: '8px 14px',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: x.c }}>{x.p}</span>
                  <span style={{ fontSize: 14, color: THEME.muted }}>{x.s}</span>
                </span>
              </RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>ONE OF THESE OPEN = <span style={{ color: THEME.amber }}>YOU KNOW WHAT TO RUN</span></>}
          subtitle="the scan opens the map for you"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1PortsEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re1-03-ports'];
  const starts = sceneStartFrames('re1-03-ports', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re1-03-ports/re1-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re1-03-ports/re1-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re1-03-ports/re1-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
