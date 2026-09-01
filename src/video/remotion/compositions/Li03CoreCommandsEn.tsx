// ── video/remotion/compositions/Li03CoreCommandsEn.tsx ────────────
// English version of li-03-commands. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { Typewriter } from '../primitives/Typewriter';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: 4 commands, 4 questions ────────────────────────────────
// EN: commands named at 4.1/5.1/5.7/6.4; questions 9.7-13.3; closing 14.1
const CMD_QUESTIONS = [
  { cmd: 'pwd', q: 'where am I?', c: THEME.cyan },
  { cmd: 'id', q: 'who am I?', c: THEME.green },
  { cmd: 'ls', q: "what's in here?", c: THEME.amber },
  { cmd: 'echo', q: 'how do I write?', c: THEME.purple },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const titleEndS = 3.8;
  const titleEnd = Math.round(titleEndS * fps);
  const firstChip = Math.round((9.5 - titleEndS) * fps); // questions start ~9.5s
  const endNoteA = firstChip + Math.round(4.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="YOUR 4 EVERYDAY COMMANDS"
          subtitle="each one answers a question — where am I, who am I…"
          fontSize={40}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CMD_QUESTIONS.map((c, i) => (
              <div key={c.cmd} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <KeyCapsule label={c.q} value={c.cmd} accent={c.c} delay={firstChip + Math.round(i * 1.1 * fps)} size={28} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, fontSize: 22, color: THEME.muted, fontFamily: MONO, opacity: interpolate(useCurrentFrame() - endNoteA, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
            let me show you them one by one
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: the 4 commands in action ──────────────────────────────
// EN: pwd(0.9) → id(11.7) → ls(22.4) → echo+cat(31.5) · closing 37.8
interface Session {
  cmd: string;
  output: string[];
  label: string;
  at: number;
  accent: string;
}

const SessionBlock: React.FC<{ session: Session; frame: number; fps: number; active: boolean }> = ({
  session,
  frame,
  fps,
  active,
}) => {
  const atFrame = Math.round(session.at * fps);
  const t = frame - atFrame;
  if (t < 0) return null;
  const fade = interpolate(t, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const outTime = session.at + (session.cmd.length / 16) + 0.3;
  const outAtFrame = Math.round(outTime * fps);

  return (
    <div style={{ marginBottom: 16, opacity: fade, fontFamily: MONO }}>
      <div
        style={{
          fontSize: 12,
          color: active ? session.accent : THEME.dim,
          fontWeight: active ? 700 : 400,
          marginBottom: 3,
        }}
      >
        {active ? '▸ ' : '  '}
        {session.label}
      </div>
      <div style={{ fontSize: 20 }}>
        <span style={{ color: THEME.green, fontWeight: 700 }}>$</span>{' '}
        <Typewriter text={session.cmd} start={atFrame} charsPerSecond={16} />
      </div>
      {session.output.map((line, i) => (
        <div
          key={i}
          style={{
            fontSize: 16,
            color: session.accent,
            opacity: interpolate(frame - (outAtFrame + i * 5), [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const keyAt = Math.round(37.8 * fps);

  const sessions: Session[] = [
    { label: 'where am I? — pwd', cmd: 'pwd', output: ['/home/kali'], at: 0.9, accent: THEME.cyan },
    {
      label: 'who am I? — id',
      cmd: 'id',
      output: ['uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)'],
      at: 11.7,
      accent: THEME.green,
    },
    {
      label: "what's in here? — ls / ls -la",
      cmd: 'ls -la',
      output: ['-rw-r--r--  kali kali  notas.txt', 'drwxr-xr-x  kali kali  Documents'],
      at: 22.4,
      accent: THEME.amber,
    },
    {
      label: 'write and read — echo + cat',
      cmd: "echo 'hola' > /tmp/test.txt && cat /tmp/test.txt",
      output: ['hola'],
      at: 31.5,
      accent: THEME.purple,
    },
  ];

  const activeIdx = sessions.reduceRight((acc, s, i) => (frame >= Math.round(s.at * fps) ? i : acc), 0);

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
          THE FOUNDATION FOR MANAGING FILES
        </div>
        <TerminalWindow title="zsh — kali@attacker-01:~$" width={840}>
          {sessions.map((s, i) => (
            <SessionBlock key={s.label} session={s} frame={frame} fps={fps} active={i === activeIdx} />
          ))}
        </TerminalWindow>
        <div
          style={{
            fontSize: 19,
            color: THEME.muted,
            fontFamily: MONO,
            opacity: interpolate(frame - keyAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          that's the foundation for managing files and notes on any system
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: .bash_history ────────────────────────────────────────
// EN: file named at 2.7; "everything you've typed" 4.6; "on someone else's
// system" 7.4; what-it-tells list 10-13; "reading the person's mind" 14.0
const HISTORY = [
  'ssh root@192.168.1.11',
  'ls -la /etc',
  'cat /etc/passwd',
  'sudo -l',
  'nmap -sV 192.168.1.11',
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const t1 = Math.round(6.0 * fps);
  const t2 = Math.round(13.0 * fps);
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        WHAT ATTACKERS READ FIRST
      </div>
      <TerminalWindow title="~/.bash_history" width={780}>
        {HISTORY.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: 18, color: i === 0 ? THEME.red : THEME.text, fontFamily: MONO,
              opacity: interpolate(frame - (t1 + Math.round(i * 1.1 * fps)), [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            $ {line}
          </div>
        ))}
      </TerminalWindow>
      <div style={{ marginTop: 30, fontSize: 21, color: THEME.muted, fontFamily: MONO, maxWidth: 720, lineHeight: 1.5, opacity: interpolate(useCurrentFrame() - t2, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
        on someone else's system, the history tells you what the user did and which paths exist — it's reading their mind
      </div>
    </AbsoluteFill>
  );
};

export const Li03CoreCommandsEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['li-03-commands'];
  const starts = sceneStartFrames('li-03-commands', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/li-03-commands/li-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/li-03-commands/li-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/li-03-commands/li-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
