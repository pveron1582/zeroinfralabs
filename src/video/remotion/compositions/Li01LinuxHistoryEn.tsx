// ── video/remotion/compositions/Li01LinuxHistoryEn.tsx ─────────────
// English version of li-01-linux-history. Same visuals as the Spanish
// composition; beats re-measured against the EN wavs (word-level
// transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { Typewriter } from '../primitives/Typewriter';
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

// ── Scene 1: 1991, a student's hobby ────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  // "I'm doing a free operating system" starts at 6.7s (EN transcription)
  const quoteAt = Math.round(6.7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={quoteAt}>
        <TitleScene
          title={<><span style={{ color: THEME.amber }}>1991</span> · A HOBBY IN FINLAND</>}
          subtitle="Linus Torvalds, a 21-year-old student in Helsinki"
        />
      </Sequence>
      <Sequence from={quoteAt}>
        <AbsoluteFill style={CENTERED}>
          <TerminalWindow title="newsgroup · comp.os.minix" width={880}>
            <Typewriter
              text="> I'm doing a (free) operating system\n  (just a hobby, won't be big or professional)"
              charsPerSecond={16}
              fontSize={20}
            />
          </TerminalWindow>
          <div style={{ marginTop: 30, fontSize: 21, color: THEME.muted, fontFamily: MONO }}>
            that hobby became the <span style={{ color: THEME.green }}>Linux kernel</span> — today it runs the internet
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: kernel + GNU = GNU/Linux ───────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  // "But a complete operating system needs much more" starts at 6.9s (EN)
  const gnuAt = Math.round(6.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={gnuAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
            Linux is the <span style={{ color: THEME.green }}>kernel</span>: the heart of the system
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {['memory', 'processes', 'drivers'].map(chip => (
              <div key={chip} style={{ padding: '12px 26px', fontSize: 20, color: THEME.cyan, fontFamily: MONO, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 10 }}>
                {chip}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 26, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            it manages memory, processes, and hardware
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={gnuAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            but a complete operating system needs much more:
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {['shell', 'commands', 'compilers'].map((tool, i) => (
              <KeyCapsule key={tool} label="GNU project" value={tool} accent={THEME.purple} delay={i * 8} size={20} />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 44 }}>
            <span style={{ fontSize: 66, fontWeight: 800, color: THEME.purple, fontFamily: MONO }}>GNU</span>
            <span style={{ fontSize: 66, color: THEME.dim, fontFamily: MONO }}>/</span>
            <span style={{ fontSize: 66, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>LINUX</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            a free kernel, with free tools
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 3: the 4 freedoms of free software ────────────────────────
const FREEDOMS = [
  { n: '0', name: 'RUN', desc: 'however you want', accent: THEME.amber },
  { n: '1', name: 'STUDY', desc: 'by reading the code', accent: THEME.cyan },
  { n: '2', name: 'REDISTRIBUTE', desc: 'copies and help', accent: THEME.purple },
  { n: '3', name: 'IMPROVE', desc: 'and share changes', accent: THEME.green },
];

// EN narration: "Freedom zero" ~3.0 · "one" ~6.5 · "two" ~10.5 · "three" ~13.4
const FREEDOM_AT = [3.0, 6.5, 10.5, 13.4];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // "Thousands of eyes" starts at 18.2s (EN transcription)
  const eyesAt = Math.round(18.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={eyesAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 40 }}>
            FREE SOFTWARE: <span style={{ color: THEME.amber }}>4 FREEDOMS</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {FREEDOMS.map((f, i) => (
              <div key={f.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <KeyCapsule label={f.name} value={f.n} accent={f.accent} delay={Math.round(FREEDOM_AT[i] * fps)} size={30} />
                <span style={{ fontSize: 15, color: THEME.muted, fontFamily: MONO }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={eyesAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 44, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            <span style={{ color: THEME.green }}>thousands of eyes</span> reviewing the code
          </div>
          <div style={{ marginTop: 20, fontSize: 22, color: THEME.muted, fontFamily: MONO }}>
            that's why Linux is so solid
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 4: why it's the hacking OS ────────────────────────────────
// EN narration: 'source code is available' ~2.1 · 'read it, study it' ~3.9 ·
// 'from the inside' ~6.8 · 'build your own tools' ~8.1 · Windows block
// starts ~10.2 ('closed' 11.2 · 'much harder' 12.0 · "what's inside" 13.3)
const LINUX_POINTS = [
  { text: 'the source code is available', at: 2.1 },
  { text: 'you can read it and study it', at: 3.9 },
  { text: 'understand it from the inside', at: 6.8 },
  { text: 'build your own tools', at: 8.1 },
];
const WINDOWS_POINTS = [
  { text: 'proprietary code', at: 11.2 },
  { text: "that's much harder", at: 12.0 },
  { text: "you don't know what's inside", at: 13.3 },
];

const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  // "With Linux, there are no secrets" starts at 14.5s (EN)
  const closeAt = Math.round(14.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 26, width: 1060 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>🐧 LINUX — OPEN</div>
              {LINUX_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="✓" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '28px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 14 }}>🪟 WINDOWS — CLOSED</div>
              {WINDOWS_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<span style={{ color: THEME.green }}>WITH LINUX, THERE ARE NO SECRETS</span>}
          subtitle="that's why it's the hacking operating system"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Li01LinuxHistoryEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['li-01-linux-history'];
  const starts = sceneStartFrames('li-01-linux-history', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/li-01-linux-history/li-01-linux-history-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/li-01-linux-history/li-01-linux-history-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/li-01-linux-history/li-01-linux-history-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>

      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/li-01-linux-history/li-01-linux-history-scene4.wav`)} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
