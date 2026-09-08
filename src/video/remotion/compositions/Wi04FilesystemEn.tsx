// ── video/remotion/compositions/Wi04FilesystemEn.tsx ─────────────
// English version of wi-04-filesystem. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TreeView } from '../primitives/TreeView';
import type { TreeItem } from '../primitives/TreeView';
import { KeyCapsule } from '../primitives/KeyCapsule';
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

// ── Scene 1: the map of C:\ ──────────────────────────────────────
const C_TREE: TreeItem[] = [
  {
    label: 'C:\\',
    icon: '💽',
    color: THEME.cyan,
    desc: 'every drive is its own tree',
    children: [
      { label: 'Windows', icon: '🪟', color: THEME.cyan, children: [
        { label: 'System32', icon: '⚙️', color: THEME.cyan, desc: 'the OS core' },
        { label: 'Temp', icon: '⏳', color: THEME.cyan, desc: 'writable by everyone' },
      ] },
      { label: 'Users', icon: '👤', color: THEME.cyan, desc: 'profiles: Desktop, Documents, Downloads' },
      { label: 'Program Files', icon: '📦', color: THEME.cyan, desc: 'applications' },
      { label: 'ProgramData', icon: '🗃️', color: THEME.cyan, desc: 'app data' },
      { label: 'inetpub', icon: '🌐', color: THEME.cyan, children: [
        { label: 'wwwroot', icon: '🗃️', color: THEME.cyan, desc: 'IIS web root' },
      ] },
    ],
  },
];

// EN narration moments (seconds, scene-relative): C:\ 5.7 · Windows
// 7.9 · System32 8.0 · Temp 10.3 · Users 13.5 · Program Files 17.8 ·
// inetpub 20.6 · wwwroot 23.0
const TREE_HIGHLIGHTS: Array<{ label: string; at: number }> = [
  { label: 'C:\\', at: 5.7 },
  { label: 'Windows', at: 7.9 },
  { label: 'System32', at: 8.0 },
  { label: 'Temp', at: 10.3 },
  { label: 'Users', at: 13.5 },
  { label: 'Program Files', at: 17.8 },
  { label: 'inetpub', at: 20.6 },
  { label: 'wwwroot', at: 23.0 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  // the tree appears when the narration reaches "the star is C colon" (5.7s)
  const treeAt = Math.round(5.7 * fps);
  const t = frame / fps;
  const active = TREE_HIGHLIGHTS.find(h => t >= h.at && t < h.at + 1.6);
  const highlight = active ? active.label : null;
  const highlighted = TREE_HIGHLIGHTS.filter(h => t >= h.at + 1.6).map(h => h.label);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={treeAt}>
        <TitleScene
          title={<><span style={{ color: THEME.cyan }}>THE MAP</span> OF WINDOWS</>}
          subtitle="one drive, one tree of its own"
        />
      </Sequence>
      <Sequence from={treeAt}>
        <AbsoluteFill style={CENTERED}>
          <TreeView
            items={C_TREE}
            start={0}
            framesPerRow={7}
            fontSize={16}
            highlight={highlight}
            highlightStart={Math.max(0, Math.round((active ? active.at : 0) * fps) - treeAt)}
            highlighted={highlighted}
          />
          <div style={{ marginTop: 26, fontSize: 19, color: THEME.muted, fontFamily: MONO,
            opacity: interpolate(frame - Math.round(26.0 * fps), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            <span style={{ color: THEME.cyan }}>ACLs</span> only exist on NTFS — FAT32 drives have no file permissions
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: SAM, accounts and groups ────────────────────────────
// EN: SAM 0.0 · System32/config 3.0 · locked/shadow copy 5.3 ·
// accounts 12.4-16.1 · groups 19.0 · net user 24.7
const SAM_POINTS = [
  { text: 'local passwords live in the SAM hive', at: 0.0 },
  { text: 'System32\\config — locked while Windows runs', at: 2.3 },
  { text: 'you get it offline or with a volume shadow copy', at: 5.3 },
];
const ACCOUNTS = [
  { label: 'Administrator', at: 13.0 },
  { label: 'standard users', at: 14.0 },
  { label: 'Guest', at: 15.0 },
  { label: 'SYSTEM = root', at: 15.4 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const fade = (at: number) =>
    interpolate(frame - Math.round(at * fps), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '24px 30px', width: 940, textAlign: 'left', marginBottom: 26 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>🔑 THE SAM HIVE</div>
        {SAM_POINTS.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
        ))}
      </div>
      <div style={{ fontSize: 20, color: THEME.muted, fontFamily: MONO, marginBottom: 16, opacity: fade(10.3) }}>
        there's no single root: there are several accounts
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 980 }}>
        {ACCOUNTS.map(a => (
          <KeyCapsule key={a.label} label="account" value={a.label} accent={THEME.cyan} delay={Math.round(a.at * fps)} size={17} />
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, opacity: fade(19.0) }}>
        key groups: Administrators · Users · Remote Desktop Users · Everyone
      </div>
      <div style={{ marginTop: 24, opacity: fade(24.7) }}>
        <TerminalWindow title="C:\\> net user / net localgroup" width={900}>
          <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.6 }}>
            {'C:\\>'} <span style={{ color: THEME.amber }}>net user</span>{'\n'}
            Administrator   Guest   ana{'\n'}
            {'C:\\>'} <span style={{ color: THEME.amber }}>net localgroup</span>{'\n'}
            Administrators  Users  Remote Desktop Users  Everyone
          </div>
        </TerminalWindow>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: NTFS permissions + where the juicy stuff lives ──────
// EN: ACLs 0.0 · full control 5.6 · owner+inheritance 9.6 · icacls
// 13.4 · juicy stuff 15.6 · SAM/registry 17.5 · Documents 22.1 ·
// SMB share 23.6
const ACL_POINTS = [
  { text: 'permissions are called ACLs: who can do what', at: 0.0 },
  { text: 'full control · modify · read and execute · read', at: 5.6 },
  { text: 'an owner + inheritance from parent folders', at: 9.6 },
];
// `at` is relative to the "juicy stuff" sub-sequence (starts at `lootAt` 15.6s).
// In scene time they land at 17.5 / 22.1 / 23.6s (EN transcription).
const LOOT_POINTS = [
  { text: 'the SAM and the registry sometimes store passwords in plain text', at: 1.9 },
  { text: 'Documents and Desktop: what the user actually touches', at: 6.5 },
  { text: 'an SMB share = a second layer of permissions on top of the ACLs', at: 8.0 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // "Where does the juicy stuff live?" is said at ~15.6s (EN transcription)
  const lootAt = Math.round(15.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={lootAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '26px 32px', width: 940, textAlign: 'left' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>🧾 NTFS PERMISSIONS (ACLs)</div>
            {ACL_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
            ))}
            <div style={{ marginTop: 12, fontSize: 17, color: THEME.muted, fontFamily: MONO, opacity: 1 }}>
              you view and change them with <span style={{ color: THEME.cyan }}>icacls</span>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={lootAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            WHERE DOES <span style={{ color: THEME.amber }}>THE JUICY STUFF</span> LIVE?
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 32px', width: 940, textAlign: 'left' }}>
            {LOOT_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="💎" color={THEME.amber}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi04FilesystemEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['wi-04-filesystem'];
  const starts = sceneStartFrames('wi-04-filesystem', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: the map of C:\ */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/wi-04-filesystem/wi-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: SAM, accounts and groups */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/wi-04-filesystem/wi-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: NTFS permissions + juicy stuff */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/wi-04-filesystem/wi-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
