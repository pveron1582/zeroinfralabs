// ── video/remotion/compositions/Li04CreateEditEn.tsx ──────────────
// English version of li-04-create-edit. Same visuals; beats re-measured
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

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: intro — 3 commands in order ────────────────────────────
// EN: mkdir 10.5 · touch 13.0 · nano 14.9 (relative to nested seq: title
// ends 3.3s → 7.2 / 9.7 / 11.6). "Let's see them" 15.6.
const ORDER_STEPS = [
  { n: '1', cmd: 'mkdir', what: 'you create the folder', c: THEME.cyan, at: 7.2 },
  { n: '2', cmd: 'touch', what: 'you create the file', c: THEME.amber, at: 9.7 },
  { n: '3', cmd: 'nano', what: 'you edit it', c: THEME.red, at: 11.6 },
];

const OrderChip: React.FC<{ step: typeof ORDER_STEPS[0]; fps: number }> = ({ step, fps }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(step.at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 12], [0, 1], { extrapolateLeft: 'clamp' }),
      transform: `translateY(${(1 - enter) * 20}px)`,
      display: 'flex', alignItems: 'center', gap: 14,
      background: THEME.panel, border: `2px solid ${step.c}50`, borderRadius: 12,
      padding: '18px 26px', fontFamily: MONO,
    }}>
      <span style={{ fontSize: 30, fontWeight: 800, color: step.c }}>{step.n}</span>
      <span style={{ fontSize: 26, color: THEME.text, fontWeight: 700 }}>{step.cmd}</span>
      <span style={{ fontSize: 17, color: THEME.muted }}>{step.what}</span>
    </div>
  );
};

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const titleEnd = Math.round(3.3 * fps);
  const outroAt = Math.round(12.3 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="BUILD YOUR WORKSPACE"
          subtitle="first rule: don't make a mess — work in a folder of your own"
          fontSize={40}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {ORDER_STEPS.map((s) => (
              <OrderChip key={s.n} step={s} fps={fps} />
            ))}
          </div>
          <OutroText at={outroAt} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

const OutroText: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      marginTop: 34, fontSize: 21, color: THEME.muted, fontFamily: MONO,
      opacity: interpolate(frame - at, [0, 12], [0, 1], { extrapolateLeft: 'clamp' }),
    }}>
      a very simple order — let's see them
    </div>
  );
};

// ── Scene 2: mkdir → touch → nano, step by step ────────────────────
// EN: mkdir 0.2 · touch 12.6 · nano 18.0 · Ctrl+O/X 23.2-28.7 · closing 29.0
const PIPELINE = [
  { n: '1', cmd: 'mkdir /tmp/trabajo', what: 'make directory — creates the folder', c: THEME.cyan, at: 0.2 },
  { n: '2', cmd: 'touch /tmp/trabajo/notas.txt', what: 'creates an empty file', c: THEME.amber, at: 12.6 },
  { n: '3', cmd: 'nano /tmp/trabajo/notas.txt', what: 'text editor inside the terminal', c: THEME.red, at: 18.0 },
];

const StepCard: React.FC<{ step: typeof PIPELINE[0]; fps: number }> = ({ step, fps }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(step.at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 12], [0, 1], { extrapolateLeft: 'clamp' }),
      transform: `translateX(${(1 - enter) * 24}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      background: THEME.panel, border: `2px solid ${step.c}50`, borderRadius: 12,
      padding: '22px 24px', minWidth: 250, fontFamily: MONO,
    }}>
      <div style={{ fontSize: 38, fontWeight: 800, color: step.c }}>{step.n}</div>
      <div style={{ fontSize: 18, color: THEME.text, fontWeight: 700 }}>{step.cmd}</div>
      <div style={{ fontSize: 14, color: THEME.muted }}>{step.what}</div>
    </div>
  );
};

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const ctrlAt = Math.round(23.2 * fps);
  const closeAt = Math.round(29.0 * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 36 }}>
          FOLDER → FILE → EDITOR
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PIPELINE.map((s) => (
            <StepCard key={s.n} step={s} fps={fps} />
          ))}
        </div>

        <div style={{ marginTop: 30, fontSize: 20, color: THEME.cyan, fontFamily: MONO, opacity: interpolate(frame - ctrlAt, [0, 15], [0, 1], { extrapolateLeft: 'clamp' }) }}>
          in nano: <span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+O</span> save ·{' '}
          <span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+X</span> exit
        </div>

        <div style={{ marginTop: 26, fontSize: 19, color: THEME.muted, fontFamily: MONO, opacity: interpolate(frame - closeAt, [0, 15], [0, 1], { extrapolateLeft: 'clamp' }) }}>
          folder, file, editor — leave notes and scripts on any system
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: where you can create ──────────────────────────────────
// EN: /tmp 4.4 · home 10.3 · /etc 13.1 · root 16.5 · reject 19.1 ·
// attackers 22.9
const LOCATIONS = [
  { path: '/tmp', allowed: true, label: 'always — the temporary folder', c: THEME.cyan, at: 4.4 },
  { path: '/home/tu_usuario', allowed: true, label: 'your home', c: THEME.green, at: 10.3 },
  { path: '/etc', allowed: false, label: 'root only — system config', c: THEME.red, at: 13.1 },
];

const LocationChip: React.FC<{ loc: typeof LOCATIONS[0]; fps: number }> = ({ loc, fps }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(loc.at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 15], [0, 1], { extrapolateLeft: 'clamp' }),
      transform: `translateY(${(1 - enter) * 16}px)`,
      background: THEME.panel, border: `2px solid ${loc.c}50`, borderRadius: 12,
      padding: '24px 22px', minWidth: 210, textAlign: 'center', fontFamily: MONO,
    }}>
      <div style={{ fontSize: 22, color: loc.c, fontWeight: 700 }}>{loc.path}</div>
      {/* Explicit color: without it the glyph inherits the browser default
          (black) and goes invisible over the dark THEME.panel. */}
      <div style={{ fontSize: 34, margin: '10px 0', fontWeight: 800, color: loc.allowed ? THEME.green : THEME.red }}>
        {loc.allowed ? '✓' : '✗'}
      </div>
      <div style={{ fontSize: 13, color: THEME.muted }}>{loc.label}</div>
    </div>
  );
};

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const introAt = Math.round(0.3 * fps);
  const warningAt = Math.round(19.1 * fps);
  const attackerAt = Math.round(22.9 * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16, opacity: interpolate(frame - introAt, [0, 15], [0, 1], { extrapolateLeft: 'clamp' }) }}>
          NOT EVERY FOLDER LETS YOU WRITE
        </div>
        <div style={{ fontSize: 19, color: THEME.muted, fontFamily: MONO, marginBottom: 32, opacity: interpolate(frame - introAt, [0, 15], [0, 1], { extrapolateLeft: 'clamp' }) }}>
          you have to look at the permissions
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {LOCATIONS.map((l) => (
            <LocationChip key={l.path} loc={l} fps={fps} />
          ))}
        </div>

        <div style={{ marginTop: 30, fontSize: 19, color: THEME.red, fontFamily: MONO, opacity: interpolate(frame - warningAt, [0, 15], [0, 1], { extrapolateLeft: 'clamp' }) }}>
          in /etc as a regular user → the system rejects you (Permission denied)
        </div>
        <div style={{ marginTop: 24, fontSize: 20, color: THEME.cyan, fontFamily: MONO, opacity: interpolate(frame - attackerAt, [0, 15], [0, 1], { extrapolateLeft: 'clamp' }) }}>
          that's why attackers work from <span style={{ color: THEME.text, fontWeight: 700 }}>/tmp</span>: the one place they can always write without asking permission
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Li04CreateEditEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['li-04-create-edit'];
  const starts = sceneStartFrames('li-04-create-edit', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/li-04-create-edit/li-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/li-04-create-edit/li-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/li-04-create-edit/li-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
