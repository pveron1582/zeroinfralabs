// ── video/remotion/compositions/Li05PermissionsEn.tsx ─────────────
// English version of li-05-permissions. Same visuals; beats re-measured
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
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// Colored permission character that lights up as the narrator reads it
const PermChar: React.FC<{ c: string; color: string; on: number; fps: number; size?: number }> = ({
  c,
  color,
  on,
  fps,
  size = 36,
}) => {
  const frame = useCurrentFrame();
  const t = frame - on;
  const active = t >= 0;
  const pop = spring({ frame: t, fps, config: { damping: 14 } });
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: 8,
        fontSize: size,
        fontWeight: 700,
        color: active ? color : THEME.dim,
        border: active ? `2px solid ${color}` : '2px solid transparent',
        background: active ? color + '1e' : 'transparent',
        transform: active ? `scale(${0.9 + 0.1 * pop})` : 'scale(1)',
        boxShadow: active ? `0 0 14px ${color}44` : 'none',
      }}
    >
      {c}
    </span>
  );
};

// ── Scene 1: that line of dashes and letters ──────────────────────
// EN: chars read 5.1-9.8 · "looks like noise" 10.3 · "unlock the door" 15.1
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const perm = '-rw-r--r--';
  const titleEnd = Math.round(2.2 * fps);
  const revealStart = Math.round((5.1 - 2.2) * fps);
  const cps = 4.5;
  const noiseAt = Math.round((10.3 - 2.2) * fps);
  const privAt = Math.round((15.1 - 2.2) * fps);

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="A BUNCH OF DASHES AND LETTERS?"
          subtitle="at the start of every file, when you list in long format"
          fontSize={38}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', fontFamily: MONO }}>
            {perm.split('').map((ch, i) => (
              <PermChar
                key={i}
                c={ch}
                color={i === 0 ? THEME.amber : i <= 3 ? THEME.green : i <= 6 ? THEME.cyan : THEME.red}
                on={revealStart + Math.round(i * (30 / cps))}
                fps={fps}
                size={44}
              />
            ))}
          </div>
          <RevealLine at={noiseAt} fps={fps} mark="▸" color={THEME.muted}>
            it looks like noise, but it's the system telling you who can do what with the file
          </RevealLine>
          <RevealLine at={privAt} fps={fps} mark="▲" color={THEME.red}>
            learning to read it unlocks the door to <b>privilege escalation</b>
          </RevealLine>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: type + rwx + octal ──────────────────────────────────
// EN: file type 1.3 · three groups 9.4 · r/w/x legend 13.6 · owner/group/
// others 17.2 · numbers 22.9 · rw-=6 32.0 · "at a glance" 35.9
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const frameAt = (s: number) => Math.round(s * fps);

  const groupsAt = frameAt(9.4);
  const legendAt = frameAt(13.6);
  const ownersAt = frameAt(17.2);
  const numsAt = frameAt(22.9);
  const sumAt = frameAt(32.0);
  const keyAt = frameAt(35.9);

  const groups = [
    { chars: 'rw-', octal: '6', color: THEME.green, owner: 'owner' },
    { chars: 'r--', octal: '4', color: THEME.cyan, owner: 'group' },
    { chars: 'r--', octal: '4', color: THEME.red, owner: 'others' },
  ];

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 22 }}>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', fontFamily: MONO }}>
          <PermChar c="-" color={THEME.amber} on={frameAt(1.3)} fps={fps} size={32} />
          <PermChar c="r" color={THEME.green} on={groupsAt} fps={fps} size={32} />
          <PermChar c="w" color={THEME.green} on={groupsAt} fps={fps} size={32} />
          <PermChar c="-" color={THEME.green} on={groupsAt} fps={fps} size={32} />
          <PermChar c="r" color={THEME.cyan} on={groupsAt + Math.round(0.4 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.cyan} on={groupsAt + Math.round(0.4 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.cyan} on={groupsAt + Math.round(0.4 * fps)} fps={fps} size={32} />
          <PermChar c="r" color={THEME.red} on={groupsAt + Math.round(0.8 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.red} on={groupsAt + Math.round(0.8 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.red} on={groupsAt + Math.round(0.8 * fps)} fps={fps} size={32} />
        </div>

        <div style={{ fontSize: 19, color: THEME.muted, fontFamily: MONO, opacity: interpolate(frame - groupsAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
          first character = <span style={{ color: THEME.amber, fontWeight: 700 }}>type</span> ({'-'} regular · <span style={{ color: THEME.cyan }}>d</span> directory) — then 3 groups of 3
        </div>

        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', justifyContent: 'center' }}>
          {groups.map((g, i) => {
            const t = frame - (ownersAt + Math.round(i * 1.6 * fps));
            const enter = spring({ frame: t, fps, config: { damping: 200 } });
            const octalT = frame - (sumAt + Math.round(i * 1.1 * fps));
            return (
              <div
                key={g.owner}
                style={{
                  opacity: interpolate(t, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
                  transform: `translateY(${(1 - enter) * 16}px)`,
                  background: THEME.panel, border: `2px solid ${g.color}50`, borderRadius: 12,
                  padding: '16px 20px', minWidth: 130, textAlign: 'center', fontFamily: MONO,
                }}
              >
                <div style={{ fontSize: 26, color: g.color, fontWeight: 700 }}>{g.chars}</div>
                <div style={{ fontSize: 13, color: THEME.muted, marginTop: 4 }}>{g.owner}</div>
                <div
                  style={{
                    marginTop: 8, fontSize: 22, color: THEME.amber, fontWeight: 800,
                    opacity: interpolate(octalT, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
                  }}
                >
                  {g.octal}
                </div>
              </div>
            );
          })}
        </div>

        <RevealLine at={legendAt} fps={fps} mark="▸" color={THEME.cyan}>
          r = read · w = write · x = execute
        </RevealLine>
        <RevealLine at={numsAt} fps={fps} mark="▸" color={THEME.red}>
          each letter is worth: r = 4 · w = 2 · x = 1 — add up each group
        </RevealLine>
        <RevealLine at={keyAt} fps={fps} mark="★" color={THEME.amber}>
          rw- = 4+2 = <b>6</b> · r-- = <b>4</b> → <span style={{ color: THEME.amber, fontWeight: 800 }}>644</span> at a glance
        </RevealLine>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: SUID ────────────────────────────────────────────────
// EN: "letter S instead of X" 4.8 · suid bit 7.0 · runs as owner 10.7 ·
// admin powers 17.5 · hunting 22.7
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const suidAt = Math.round(4.8 * fps);
  const meaningAt = Math.round(10.7 * fps);
  const findAt = Math.round(22.7 * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24, opacity: interpolate(frame - frame / 2, [0, 18], [0, 1], { extrapolateRight: 'clamp' }) }}>
          THE CASE YOU CARE ABOUT AS AN ATTACKER
        </div>
        <TerminalWindow title="ls -la /usr/bin/passwd" width={820}>
          <div style={{ fontFamily: MONO }}>
            <div style={{ fontSize: 22 }}>
              <PermChar c="-" color={THEME.amber} on={0} fps={fps} size={26} />
              <PermChar c="r" color={THEME.green} on={0} fps={fps} size={26} />
              <PermChar c="w" color={THEME.green} on={suidAt} fps={fps} size={26} />
              <PermChar c="s" color={THEME.red} on={suidAt} fps={fps} size={26} />
              <PermChar c="r" color={THEME.cyan} on={suidAt + Math.round(0.6 * fps)} fps={fps} size={26} />
              <PermChar c="-" color={THEME.cyan} on={suidAt + Math.round(0.6 * fps)} fps={fps} size={26} />
              <PermChar c="x" color={THEME.cyan} on={suidAt + Math.round(0.6 * fps)} fps={fps} size={26} />
              <PermChar c="r" color={THEME.red} on={suidAt + Math.round(1.2 * fps)} fps={fps} size={26} />
              <PermChar c="-" color={THEME.red} on={suidAt + Math.round(1.2 * fps)} fps={fps} size={26} />
              <PermChar c="x" color={THEME.red} on={suidAt + Math.round(1.2 * fps)} fps={fps} size={26} />
              <span style={{ color: THEME.text, marginLeft: 12 }}>root root /usr/bin/passwd</span>
            </div>
          </div>
        </TerminalWindow>

        <RevealLine at={meaningAt} fps={fps} mark="!" color={THEME.red}>
          the <span style={{ color: THEME.red, fontWeight: 700 }}>s</span> in the owner's group = the <b>SUID</b> bit: the binary runs as its owner (root)
        </RevealLine>
        <RevealLine at={meaningAt + 3.0} fps={fps} mark="▸" color={THEME.muted}>
          a regular user executes it, and it works with administrator powers
        </RevealLine>
        <RevealLine at={findAt} fps={fps} mark="▲" color={THEME.amber}>
          hunting binaries with that <b>s</b> = one step from privilege escalation
        </RevealLine>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: numeric review ─────────────────────────────────────
// EN: 644 1.8 · normal state 8.4 · 4755 10.6 · suid bit 14.5 ·
// "on a plate" 20.2 · smile 24.0
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const normalAt = Math.round(1.8 * fps);
  const suidAt = Math.round(10.6 * fps);
  const bonusAt = Math.round(20.2 * fps);
  const smileAt = Math.round(24.0 * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30, opacity: interpolate(frame - Math.round(0.4 * fps), [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          LET'S REVIEW WITH NUMBERS
        </div>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* 644 */}
          <div style={{
            opacity: interpolate(frame - normalAt, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
            background: THEME.panel, border: `2px solid ${THEME.green}50`, borderRadius: 12,
            padding: '24px 26px', textAlign: 'center', fontFamily: MONO,
          }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: THEME.green }}>644</div>
            <div style={{ fontSize: 15, color: THEME.muted, marginTop: 8 }}>
              owner: read+write · everyone else: read only
            </div>
          </div>

          {/* 4755 */}
          <div style={{
            opacity: interpolate(frame - suidAt, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
            background: THEME.panel, border: `2px solid ${THEME.red}66`, borderRadius: 12,
            padding: '24px 26px', textAlign: 'center', fontFamily: MONO,
            boxShadow: interpolate(frame - suidAt, [0, 40], [0, 1], { extrapolateRight: 'clamp' }) > 0 ? `0 0 30px ${THEME.red}33` : 'none',
          }}>
            <div style={{ fontSize: 44, fontWeight: 800 }}>
              <span style={{ color: THEME.red }}>4</span>
              <span style={{ color: THEME.text }}>755</span>
            </div>
            <div style={{ fontSize: 15, color: THEME.muted, marginTop: 8 }}>
              the <span style={{ color: THEME.red, fontWeight: 700 }}>4</span> up front = SUID → runs as root
            </div>
          </div>
        </div>

        <RevealLine at={bonusAt} fps={fps} mark="▲" color={THEME.amber}>
          on a pentest, finding <span style={{ color: THEME.red, fontWeight: 700 }}>4</span>xxx is privilege escalation served on a plate
        </RevealLine>
        <RevealLine at={smileAt} fps={fps} mark="★" color={THEME.green}>
          when you see it, smile: you already know how to read the system's mind
        </RevealLine>
      </div>
    </AbsoluteFill>
  );
};

export const Li05PermissionsEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['li-05-permissions'];
  const starts = sceneStartFrames('li-05-permissions', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>

      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene4.wav`)} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
