// ── video/remotion/compositions/Li02ShellAnatomyEn.tsx ─────────────
// English version of li-02-shell. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
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

// ── Prompt token with active highlight ──────────────────────────────
const PromptToken: React.FC<{
  value: string;
  color: string;
  active: boolean;
  fontSize: number;
  at?: number;
  fps?: number;
}> = ({ value, color, active, fontSize, at, fps }) => {
  const frame = useCurrentFrame();
  const t = at !== undefined && fps !== undefined ? frame - Math.round(at * fps) : frame;
  const isOn = !active || t >= 0;
  const pop = spring({ frame: t, fps: fps || 30, config: { damping: 12 } });
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        borderRadius: 8,
        fontSize,
        fontWeight: 700,
        color,
        border: active && isOn ? `2px solid ${color}` : '2px solid transparent',
        background: active && isOn ? color + '22' : 'transparent',
        transform: active && isOn ? `scale(${0.86 + 0.14 * pop})` : 'scale(1)',
        transformOrigin: 'left center',
        boxShadow: active && isOn ? `0 0 18px ${color}55` : 'none',
      }}
    >
      {value}
    </span>
  );
};

// ── Scene 1: what is the prompt? ────────────────────────────────────
// EN narration lists the 4 meanings at 9.6-12.9s (absolute). Title
// ends at 4.35s, so chips start ~5.2s into the nested sequence.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const titleEndS = 4.35;
  const titleEnd = Math.round(titleEndS * fps);
  const chips0 = Math.round((9.5 - titleEndS) * fps);
  const gap = Math.round(0.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="THE PROMPT TELLS YOU EVERYTHING"
          subtitle="a line that repeats before every command"
          fontSize={44}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <TerminalWindow title="zsh — kali@attacker-01:~$" width={820}>
            <div style={{ fontSize: 26, fontFamily: MONO }}>
              <span style={{ color: THEME.green, fontWeight: 700 }}>kali</span>
              <span style={{ color: THEME.dim }}>@</span>
              <span style={{ color: THEME.cyan, fontWeight: 700 }}>attacker-01</span>
              <span style={{ color: THEME.dim }}>:</span>
              <span style={{ color: THEME.amber, fontWeight: 700 }}>~</span>
              <span style={{ color: THEME.purple, fontWeight: 700 }}>$</span>{' '}
              <span style={{ color: THEME.dim, fontSize: 16 }}>▌</span>
            </div>
            <div style={{ marginTop: 12, fontSize: 15, color: THEME.dim }}>
              # scribbles? no — every symbol means something
            </div>
          </TerminalWindow>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginTop: 30 }}>
            <KeyCapsule label="who you are" value="user" accent={THEME.green} delay={chips0} />
            <KeyCapsule label="which machine" value="machine" accent={THEME.cyan} delay={chips0 + gap} />
            <KeyCapsule label="where you are" value="home" accent={THEME.amber} delay={chips0 + gap * 2} />
            <KeyCapsule label="how much power" value="privileges" accent={THEME.purple} delay={chips0 + gap * 3} />
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: kali@attacker-01:~$ piece by piece ────────────────────
// EN narration order: user(8.7) → machine(13.9) → home(18.4) → $(25.8) → #(31.0)
const S2_STEPS = [
  { key: 'kali', color: THEME.green, at: 8.7, label: 'user', text: 'kali — the user you are logged in as' },
  { key: 'machine', color: THEME.cyan, at: 13.9, label: 'machine', text: 'attacker-01 — the computer you are working on' },
  { key: 'home', color: THEME.amber, at: 18.4, label: 'home', text: '~ (after the colon) — your personal folder' },
  { key: 'dollar', color: THEME.purple, at: 25.8, label: 'regular user', text: '$ — a regular user, normal privileges' },
  { key: 'hash', color: THEME.red, at: 31.0, label: 'root', text: '# — root, the administrator, full control' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const stepIndex = S2_STEPS.findIndex((s) => frame < Math.round(s.at * fps));
  const active = stepIndex === -1 ? S2_STEPS.length - 1 : stepIndex - 1;
  const showRoot = frame >= Math.round(S2_STEPS[4].at * fps);

  const prompt = showRoot
    ? [
        { v: 'kali', c: THEME.green, on: true, at: 8.7 },
        { v: '@', c: THEME.dim, on: false },
        { v: 'attacker-01', c: THEME.cyan, on: true, at: 13.9 },
        { v: ':', c: THEME.dim, on: false },
        { v: '~', c: THEME.amber, on: true, at: 18.4 },
        { v: '#', c: THEME.red, on: true, at: 31.0 },
      ]
    : [
        { v: 'kali', c: THEME.green, on: true, at: 8.7 },
        { v: '@', c: THEME.dim, on: false },
        { v: 'attacker-01', c: THEME.cyan, on: true, at: 13.9 },
        { v: ':', c: THEME.dim, on: false },
        { v: '~', c: THEME.amber, on: true, at: 18.4 },
        { v: '$', c: THEME.purple, on: true, at: 25.8 },
      ];

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 26 }}>
        <TerminalWindow title="zsh — kali@attacker-01:~$" width={880}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 40, fontFamily: MONO, flexWrap: 'wrap' }}>
            {prompt.map((tk, i) => (
              <PromptToken key={i} value={tk.v} color={tk.c} active={tk.on} fontSize={40} at={tk.at} fps={fps} />
            ))}
          </div>
        </TerminalWindow>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {S2_STEPS.map((s) => (
            <KeyCapsule key={s.key} label={s.label} value={s.key === 'hash' ? '#' : s.key === 'dollar' ? '$' : s.key === 'home' ? '~' : s.key === 'machine' ? 'attacker-01' : 'kali'} accent={s.color} delay={Math.round(s.at * fps)} />
          ))}
        </div>

        <RevealLine at={S2_STEPS[Math.max(0, active)].at} fps={fps} mark="▸" color={S2_STEPS[Math.max(0, active)].color}>
          {S2_STEPS[Math.max(0, active)].text}
        </RevealLine>

        {showRoot && (
          <RevealLine at={37.7} fps={fps} mark="!" color={THEME.red}>
            just by reading the prompt you already know who you are and how much you can do
          </RevealLine>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: anatomy of a command ───────────────────────────────────
// EN: nmap(3.4) · -sV(21.6) · -p-(25.6) · IP(31.5) · pattern(35.9) · help(40.6)
const CMD_TOKENS = [
  { value: 'nmap', color: THEME.green, at: 3.4, label: 'command' },
  { value: '-sV', color: THEME.cyan, at: 21.6, label: 'flag: versions' },
  { value: '-p-', color: THEME.amber, at: 25.6, label: 'flag: all ports' },
  { value: '192.168.1.11', color: THEME.purple, at: 31.5, label: 'argument: target' },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const patternAt = Math.round(35.9 * fps);
  const helpAt = Math.round(40.6 * fps);

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, textAlign: 'center' }}>
          THE ANATOMY OF A COMMAND
        </div>
        <TerminalWindow title="zsh — kali@attacker-01:~$" width={900}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 30, flexWrap: 'wrap', fontFamily: MONO }}>
            {CMD_TOKENS.map((tk) => (
              <PromptToken key={tk.value} value={tk.value} color={tk.color} active={true} fontSize={30} at={tk.at} fps={fps} />
            ))}
            <span style={{ color: THEME.dim, fontSize: 22 }}>▌</span>
          </div>
        </TerminalWindow>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {CMD_TOKENS.map((tk) => (
            <KeyCapsule key={tk.value} label="" value={tk.label} accent={tk.color} delay={Math.round(tk.at * fps)} size={16} />
          ))}
        </div>

        <div style={{ fontSize: 19, color: THEME.muted, fontFamily: MONO, textAlign: 'center' }}>
          <div style={{ opacity: interpolate(frame - patternAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
            command → flags → argument: the pattern of every program
          </div>
          <div style={{ opacity: interpolate(frame - helpAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
            forgot the flags? <span style={{ color: THEME.cyan, fontWeight: 700 }}>--help</span> lists them for you
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: closing ────────────────────────────────────────────────
// EN: "And this takes practice" at 11.0s
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const practiceAt = Math.round(11.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={practiceAt}>
        <TitleScene title="THE TERMINAL IS YOUR MAP" subtitle="the prompt says who you are · the commands, what's there" fontSize={38} />
      </Sequence>
      <Sequence from={practiceAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.amber, fontFamily: MONO, maxWidth: 760, lineHeight: 1.5 }}>
            And this takes practice: <span style={{ color: THEME.text }}>open a terminal and start looking at each symbol, slowly</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const Li02ShellAnatomyEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['li-02-shell'];
  const starts = sceneStartFrames('li-02-shell', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 40, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/li-02-shell/li-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/li-02-shell/li-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/li-02-shell/li-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>

      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/li-02-shell/li-02-scene4.wav`)} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
