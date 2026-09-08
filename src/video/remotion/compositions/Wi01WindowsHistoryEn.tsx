// ── video/remotion/compositions/Wi01WindowsHistoryEn.tsx ─────────
// English version of wi-01-windows-history. Same visuals; beats
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

// ── Scene 1: 1985, an interface on top of MS-DOS ────────────────────
// EN: Microsoft 3.4 · Windows 1.0 8.4 · Windows 95 15.6 · XP 20.5 ·
// NT kernel 24.5 (absolute). Timeline starts at 7.4s (after founders),
// so delays are relative: 0 / 1.0 / 8.2 / 13.1 / 17.1.
const TIMELINE = [
  { year: '1975', label: 'Microsoft', delay: 0.0 },
  { year: '1985', label: 'Windows 1.0', delay: 1.0 },
  { year: '1995', label: 'Windows 95', delay: 8.2 },
  { year: '2001', label: 'Windows XP', delay: 13.1 },
  { year: '1993', label: 'NT kernel', delay: 17.1 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: founders end ~7.4s, then "Windows 1.0 was a graphical interface"
  const timelineAt = Math.round(7.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={timelineAt}>
        <TitleScene
          title={<><span style={{ color: THEME.cyan }}>1985</span> · AN INTERFACE ON TOP OF MS-DOS</>}
          subtitle="Windows was born at Microsoft, founded by Bill Gates and Paul Allen"
        />
      </Sequence>
      <Sequence from={timelineAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            from a <span style={{ color: THEME.cyan }}>GUI over MS-DOS</span> to the Start menu
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1040 }}>
            {TIMELINE.map(t => (
              <KeyCapsule key={t.year} label={t.label} value={t.year} accent={THEME.cyan} delay={Math.round(t.delay * fps)} size={24} />
            ))}
          </div>
          <div style={{ marginTop: 34, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            they all share the same core: the <span style={{ color: THEME.cyan }}>NT kernel</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: the proprietary model ──────────────────────────────────
// EN: closed 4.6 · can't read 5.4 · license 8.0 · Microsoft's 10.1 ·
// Linux every line 13.2 · (audit line 17.1)
const WINDOWS_CLOSED = [
  { text: 'the source code is closed', at: 4.6 },
  { text: "you can't read it or study it", at: 5.4 },
  { text: 'you buy a license to use it', at: 8.0 },
  { text: 'the code belongs to Microsoft', at: 10.1 },
];
const LINUX_OPEN = [
  { text: 'you can read every line', at: 13.2 },
  { text: "you can't audit what the system does", at: 17.1 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        PROPRIETARY <span style={{ color: THEME.dim }}>vs</span> <span style={{ color: THEME.green }}>FREE</span>
      </div>
      <div style={{ display: 'flex', gap: 26, width: 1060 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>🪟 WINDOWS — CLOSED</div>
          {WINDOWS_CLOSED.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>🐧 LINUX — OPEN</div>
          {LINUX_OPEN.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✓" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: why old Windows matters ───────────────────────────────
// EN: Win7 5.5 · XP 6.8 · Server 7.9 · MS17-010 15.4 · EternalBlue 18.2 ·
// MS08-067 19.4-20.9 · unlocked door 22.5
const LEGACY_CHIPS = [
  { label: 'Windows 7', at: 5.5 },
  { label: 'Windows XP', at: 6.8 },
  { label: 'Server 2008', at: 7.9 },
];
const EXPLOITS = [
  { label: 'MS17-010', name: 'EternalBlue', at: 15.4 },
  { label: 'MS08-067', name: 'NetAPI32', at: 19.4 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: "For a pentester..." at 22.5s
  const closeAt = Math.round(22.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            REAL NETWORKS STILL RUN <span style={{ color: THEME.cyan }}>OLD WINDOWS</span>
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 900 }}>
            {LEGACY_CHIPS.map(c => (
              <KeyCapsule key={c.label} label="legacy" value={c.label} accent={THEME.cyan} delay={Math.round(c.at * fps)} size={20} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 26, marginTop: 40 }}>
            {EXPLOITS.map(e => (
              <KeyCapsule key={e.label} label={e.name} value={e.label} accent={THEME.amber} delay={Math.round(e.at * fps)} size={26} />
            ))}
          </div>
          <div style={{ marginTop: 30, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            classic exploits that still work
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<span style={{ color: THEME.amber }}>LEGACY = AN UNLOCKED DOOR</span>}
          subtitle="finding an old machine is finding a way in"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi01WindowsHistoryEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['wi-01-windows-history'];
  const starts = sceneStartFrames('wi-01-windows-history', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/wi-01-windows-history/wi-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/wi-01-windows-history/wi-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/wi-01-windows-history/wi-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
