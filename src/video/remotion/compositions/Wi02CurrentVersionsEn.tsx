// ── video/remotion/compositions/Wi02CurrentVersionsEn.tsx ────────
// English version of wi-02-current-versions. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: Windows 10 ───────────────────────────────────────────
// EN: Win10 4.3 · 2015 version 5.2 · unified PCs 6.3 · support ends
// 9.2 · unpatched 13.0 · gold mine 16.4 · LTSC 18.4 (absolute).
// Card starts at 3.9s → relative: 0.4 / 2.5 / 5.3 / 9.1 / 12.5 / 14.5.
const WIN10_POINTS = [
  { text: '2015: unified PCs, tablets, and consoles', at: 1.3 },
  { text: 'support ends in October 2025', at: 5.3 },
  { text: 'millions of machines keep running unpatched', at: 9.1 },
  { text: 'LTSC: years on the same version (banks, industry)', at: 14.5 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const cardAt = Math.round(3.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardAt}>
        <TitleScene
          title={<><span style={{ color: THEME.cyan }}>THREE WINDOWS</span>, THREE ROLES</>}
          subtitle="what you'll run into at a company"
        />
      </Sequence>
      <Sequence from={cardAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '30px 36px', width: 860, textAlign: 'left' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 8 }}>
              🪟 WINDOWS 10
            </div>
            <div style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginBottom: 18 }}>
              the most widespread desktop version
            </div>
            {WIN10_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: Windows 11 and Windows Server ───────────────────────
// EN: TPM 6.5 · Secure Boot 8.8 · NT kernel 12.4 · AD 20.6 · IIS 21.9 ·
// DNS 22.8 · SMB 23.6 · Server Core 25.9
const WIN11_CHIPS = [
  { label: 'TPM 2.0', at: 6.5 },
  { label: 'Secure Boot', at: 8.8 },
  { label: 'NT kernel', at: 12.4 },
];
const SERVER_CHIPS = [
  { label: 'Active Directory', at: 20.6 },
  { label: 'IIS + DNS', at: 21.9 },
  { label: 'SMB shares', at: 23.6 },
  { label: 'Core: PowerShell + WinRM', at: 25.9 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 26, width: 1100 }}>
        {/* Windows 11 */}
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '28px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 8 }}>🪟 WINDOWS 11</div>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>the current one: strict hardware requirements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {WIN11_CHIPS.map(c => (
              <KeyCapsule key={c.label} label="hardens the machine" value={c.label} accent={THEME.cyan} delay={Math.round(c.at * fps)} size={18} />
            ))}
          </div>
        </div>
        {/* Windows Server */}
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '28px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 8 }}>🖥️ WINDOWS SERVER</div>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>the whole company's identity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SERVER_CHIPS.map(c => (
              <KeyCapsule key={c.label} label="corporate services" value={c.label} accent={THEME.amber} delay={Math.round(c.at * fps)} size={18} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: why it matters + closing ─────────────────────────────
// EN: workstations 5.4 · identity 8.1 · domain controller 10.4 ·
// "where to start" 14.9
const WHY_POINTS = [
  { text: 'Windows 10 and 11 are workstations', at: 5.4 },
  { text: "the servers hold the whole company's identity", at: 8.1 },
  { text: 'compromise a domain controller → the entire company', at: 10.4 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: "Knowing which Windows..." at 14.9s
  const closeAt = Math.round(14.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            WHY DOES IT MATTER TO YOU?
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 32px', width: 920, textAlign: 'left' }}>
            {WHY_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="⚠" color={THEME.amber}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>EVERY WINDOWS HAS ITS OWN <span style={{ color: THEME.cyan }}>PERSONALITY</span></>}
          subtitle="knowing which one you're looking at tells you where to start"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi02CurrentVersionsEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['wi-02-current-versions'];
  const starts = sceneStartFrames('wi-02-current-versions', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/wi-02-current-versions/wi-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/wi-02-current-versions/wi-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/wi-02-current-versions/wi-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
