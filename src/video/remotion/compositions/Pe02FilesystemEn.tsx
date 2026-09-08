// ── video/remotion/compositions/Pe02FilesystemEn.tsx ───────
// English version of pe-02-filesystem. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, SCENE_GAP, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TreeView } from '../primitives/TreeView';
import type { TreeItem } from '../primitives/TreeView';

const LINUX_TREE: TreeItem[] = [
  {
    label: '/',
    icon: '🌱',
    desc: 'the root: everything hangs from here',
    color: THEME.green,
    children: [
      { label: 'etc', icon: '⚙️', color: THEME.green, desc: 'configuration', children: [
        { label: 'passwd', icon: '🔑', color: THEME.green, desc: 'users' },
      ] },
      { label: 'home', icon: '👤', color: THEME.green, desc: 'users' },
      { label: 'root', icon: '👑', color: THEME.green, desc: "root's home" },
      { label: 'var', icon: '🗃️', color: THEME.green, children: [
        { label: 'www', icon: '🌐', color: THEME.green, desc: 'websites' },
        { label: 'log', icon: '📋', color: THEME.green, desc: 'logs' },
      ] },
      { label: 'tmp', icon: '⏳', color: THEME.green, desc: 'temp' },
    ],
  },
];

const WINDOWS_TREE: TreeItem[] = [
  {
    label: 'C:\\',
    icon: '💽',
    desc: 'the drive: another world, another root',
    color: THEME.cyan,
    children: [
      { label: 'Windows', icon: '🪟', color: THEME.cyan, desc: 'the OS', children: [
        { label: 'System32', icon: '⚙️', color: THEME.cyan, desc: 'core' },
        { label: 'Temp', icon: '⏳', color: THEME.cyan, desc: 'temp' },
      ] },
      { label: 'Users', icon: '👤', color: THEME.cyan, desc: 'users' },
      { label: 'Program Files', icon: '📦', color: THEME.cyan, desc: 'programs' },
      { label: 'inetpub', icon: '🌐', color: THEME.cyan, children: [
        { label: 'wwwroot', icon: '🗃️', color: THEME.cyan, desc: 'IIS web' },
      ] },
    ],
  },
];

// EN narration moments (scene-relative): Linux — root 3.2 · etc 5.7 ·
// home 8.8 · root 11.6 · var www 15.2 · var/log 16.3. Windows — one
// tree per drive 1.8 · Windows 4.7 · Users 8.3 · Program Files 10.1 ·
// inetpub/wwwroot 12.8-14.3 · System32 16.6.
const LINUX_HIGHLIGHTS = [
  { label: '/', at: 3.2 },
  { label: 'etc', at: 5.7 },
  { label: 'home', at: 8.8 },
  { label: 'root', at: 11.6 },
  { label: 'www', at: 15.2 },
  { label: 'log', at: 16.3 },
];
const WINDOWS_HIGHLIGHTS = [
  { label: 'C:\\', at: 1.8 },
  { label: 'Windows', at: 4.7 },
  { label: 'Users', at: 8.3 },
  { label: 'Program Files', at: 10.1 },
  { label: 'inetpub', at: 12.8 },
  { label: 'wwwroot', at: 14.3 },
  { label: 'System32', at: 16.6 },
];

interface HState {
  cur: string | null;
  highlighted: string[];
  startSec: number;
}

function highlightState(words: { label: string; at: number }[], t: number): HState {
  let cur: string | null = null;
  let lastAt = 0;
  for (const w of words) {
    if (t >= w.at) {
      cur = w.label;
      lastAt = w.at;
    }
  }
  const highlighted = cur === null ? [] : words.filter(w => w.at < lastAt).map(w => w.label);
  return { cur, highlighted, startSec: lastAt };
}

const NONE: HState = { cur: null, highlighted: [], startSec: 0 };

// ── Scene 4: closing — summary panel with paths per system ──
// EN: Linux /etc 3.5 · /home 4.5 · /var/w 6.1 · Windows C:\windows
// 8.6 · C:\users 9.6 · C:\inetpub 10.8.
const CLOSING_LINUX = [
  { path: '/etc', icon: '⚙️', desc: 'configuration', at: 3.5 },
  { path: '/home', icon: '👤', desc: 'users', at: 4.5 },
  { path: '/var/www', icon: '🌐', desc: 'websites', at: 6.1 },
];
const CLOSING_WINDOWS = [
  { path: 'C:\\Windows', icon: '🪟', desc: 'the system', at: 8.6 },
  { path: 'C:\\Users', icon: '👤', desc: 'profiles', at: 9.6 },
  { path: 'C:\\inetpub', icon: '🌐', desc: 'IIS web', at: 10.8 },
];

const ClosingPathCard: React.FC<{ path: string; icon: string; desc: string; at: number; color: string; fps: number }> = ({
  path, icon, desc, at, color, fps,
}) => {
  const frame = useCurrentFrame();
  const delay = Math.round(at * fps);
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const pop = interpolate(frame - delay, [0, 10], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity, transform: `scale(${pop})`, transformOrigin: 'left center' }}>
      <span style={{
        display: 'inline-block',
        padding: '7px 14px',
        borderRadius: 9,
        border: `1.5px solid ${color}`,
        background: color + '1f',
        boxShadow: `0 0 16px ${color}33`,
        fontSize: 23,
        color,
        fontWeight: 700,
        fontFamily: MONO,
      }}>
        {icon} {path}
      </span>
      <span style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginLeft: 12 }}>{desc}</span>
    </div>
  );
};

const ClosingScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
        <div style={{ opacity: titleIn, transform: `translateY(${(1 - Math.min(1, frame / 14)) * 18}px)` }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: THEME.text, fontFamily: MONO, lineHeight: 1.2 }}>
            WHEN YOU GET INTO A SYSTEM,
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginTop: 8 }}>
            KNOW WHERE TO LOOK
          </div>
        </div>

        <div style={{ display: 'flex', gap: 60, marginTop: 44 }}>
          {/* Linux column */}
          <div style={{ textAlign: 'left', minWidth: 300 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 18 }}>
              🐧 LINUX
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CLOSING_LINUX.map(c => (
                <ClosingPathCard key={c.path} {...c} color={THEME.green} fps={fps} />
              ))}
            </div>
          </div>

          {/* Windows column */}
          <div style={{ textAlign: 'left', minWidth: 300 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 18 }}>
              🪟 WINDOWS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CLOSING_WINDOWS.map(c => (
                <ClosingPathCard key={c.path} {...c} color={THEME.cyan} fps={fps} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 90, right: 90, textAlign: 'center', fontSize: 20, color: THEME.muted, fontFamily: MONO, opacity: titleIn }}>
        knowing each system's map means knowing exactly where the information will be
      </div>
    </AbsoluteFill>
  );
};

// ── Central scene (full Linux + Windows grows beside it) ─────
const MergedScene: React.FC<{ fps: number; s2: number }> = ({ fps, s2 }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const s3Start = s2 + SCENE_GAP;
  const s3Frame = Math.round(s3Start * fps);
  const transDur = 0.9;
  const p = interpolate(t, [s3Start, s3Start + transDur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const linuxW = interpolate(p, [0, 1], [100, 52]);
  const winW = interpolate(p, [0, 1], [0, 46]);
  const winOp = p;
  const winX = interpolate(p, [0, 1], [70, 0]);
  const dividerOp = p;
  const linuxFont = Math.round(interpolate(p, [0, 1], [21, 16]));
  const linuxHeader = Math.round(interpolate(p, [0, 1], [30, 24]));

  const inWin = t >= s3Start;
  const lh: HState = inWin
    ? { cur: null, highlighted: LINUX_HIGHLIGHTS.map(w => w.label), startSec: 0 }
    : highlightState(LINUX_HIGHLIGHTS, t);
  const wh: HState = inWin ? highlightState(WINDOWS_HIGHLIGHTS, t - s3Start) : NONE;

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', gap: 24, height: '100%', padding: '0 60px' }}>
        {/* Linux: stays on screen the whole time */}
        <div style={{ width: `${linuxW}%`, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: linuxHeader, color: THEME.green, fontWeight: 700, fontFamily: MONO, marginBottom: 22 }}>
            🐧 Linux
          </div>
          <TreeView
            items={LINUX_TREE}
            start={0}
            framesPerRow={10}
            fontSize={linuxFont}
            highlight={lh.cur}
            highlightStart={Math.round(lh.startSec * fps)}
            highlighted={lh.highlighted}
          />
        </div>

        {/* Divider */}
        <div style={{ width: 2, background: THEME.border, opacity: dividerOp, alignSelf: 'stretch' }} />

        {/* Windows: grows beside it, same scene */}
        <div style={{
          width: `${winW}%`, minWidth: 0, opacity: winOp, transform: `translateX(${winX}px)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 24, color: THEME.cyan, fontWeight: 700, fontFamily: MONO, marginBottom: 22 }}>
            🪟 Windows
          </div>
          <TreeView
            items={WINDOWS_TREE}
            start={s3Frame}
            framesPerRow={7}
            fontSize={16}
            highlight={wh.cur}
            highlightStart={Math.round((s3Start + wh.startSec) * fps)}
            highlighted={wh.highlighted}
          />
        </div>
      </div>

      {/* Footer: crosses from Linux's foot to Windows's */}
      <div style={{ position: 'absolute', bottom: 40, left: 90, right: 90, textAlign: 'center', fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
        <div style={{ opacity: 1 - p }}>
          A single tree from <span style={{ color: THEME.green }}>/</span> — everything has its place
        </div>
        <div style={{ opacity: p, marginTop: -24 }}>
          One tree per drive: <span style={{ color: THEME.cyan }}>C:\</span>, <span style={{ color: THEME.cyan }}>D:\</span>...
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Pe02FilesystemEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['pe-02-filesystem'];
  const starts = sceneStartFrames('pe-02-filesystem', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const mergedDur = Math.ceil((s2 + SCENE_GAP + s3) * fps);
  const s3Frame = Math.round((s2 + SCENE_GAP) * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: Title */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/pe-02-filesystem/pe-02-scene1.wav`)} />
        <TitleScene title="TWO WORLDS, TWO MAPS" subtitle="Linux and Windows organize everything differently" />
      </Sequence>

      {/* Central scene: Linux with highlights + Windows grows beside it */}
      <Sequence from={starts[1]} durationInFrames={mergedDur}>
        <Sequence from={0} durationInFrames={Math.ceil(s2 * fps)}>
          <Audio src={staticFile(`${base}/pe-02-filesystem/pe-02-scene2.wav`)} />
        </Sequence>
        <Sequence from={s3Frame} durationInFrames={dur3}>
          <Audio src={staticFile(`${base}/pe-02-filesystem/pe-02-scene3.wav`)} />
        </Sequence>
        <MergedScene fps={fps} s2={s2} />
      </Sequence>

      {/* Scene 4: Closing — summary panel with paths per system */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/pe-02-filesystem/pe-02-scene4.wav`)} />
        <ClosingScene fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
