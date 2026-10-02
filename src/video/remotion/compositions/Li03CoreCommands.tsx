// ── video/remotion/compositions/Li03CoreCommands.tsx ───────────────
// Video: los 4 comandos base (pwd, id, ls, echo). Versión unificada
// ES/EN con `lang` prop. Timings por silencedetect.

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
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: 'TUS 4 COMANDOS DE TODOS LOS DÍAS',
      subtitle: 'cada uno responde una pregunta — dónde estoy, quién soy…',
      outro: 'te los muestro uno por uno en la terminal',
      cmdQuestions: [
        { cmd: 'pwd', q: '¿dónde estoy?', c: THEME.cyan },
        { cmd: 'id', q: '¿quién soy?', c: THEME.green },
        { cmd: 'ls', q: '¿qué hay acá?', c: THEME.amber },
        { cmd: 'echo', q: '¿cómo escribo?', c: THEME.purple },
      ],
    },
    s2: {
      heading: 'LA BASE PARA MANEJAR ARCHIVOS',
      footer: 'esa es la base para manejar archivos y notas en cualquier sistema',
      sessions: [
        { label: '¿dónde estoy? — pwd', cmd: 'pwd', output: ['/home/kali'], at: 1.0, accent: THEME.cyan },
        { label: '¿quién soy? — id', cmd: 'id', output: ['uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)'], at: 7.0, accent: THEME.green },
        { label: '¿qué hay acá? — ls / ls -la', cmd: 'ls -la', output: ['-rw-r--r--  kali kali  notas.txt', 'drwxr-xr-x  kali kali  Documents'], at: 14.5, accent: THEME.amber },
        { label: 'escribir y leer — echo + cat', cmd: "echo 'hola' > /tmp/test.txt && cat /tmp/test.txt", output: ['hola'], at: 23.0, accent: THEME.purple },
      ],
    },
    s3: {
      heading: 'LO QUE LOS ATACANTES LEEN PRIMERO',
      footer: 'en un sistema ajeno, el historial te dice qué hizo el usuario y qué rutas existen — es leerle la mente',
    },
  },
  en: {
    s1: {
      title: 'YOUR 4 EVERYDAY COMMANDS',
      subtitle: 'each one answers a question — where am I, who am I…',
      outro: 'let me show you them one by one',
      cmdQuestions: [
        { cmd: 'pwd', q: 'where am I?', c: THEME.cyan },
        { cmd: 'id', q: 'who am I?', c: THEME.green },
        { cmd: 'ls', q: "what's in here?", c: THEME.amber },
        { cmd: 'echo', q: 'how do I write?', c: THEME.purple },
      ],
    },
    s2: {
      heading: 'THE FOUNDATION FOR MANAGING FILES',
      footer: "that's the foundation for managing files and notes on any system",
      sessions: [
        { label: 'where am I? — pwd', cmd: 'pwd', output: ['/home/kali'], at: 0.9, accent: THEME.cyan },
        { label: 'who am I? — id', cmd: 'id', output: ['uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)'], at: 11.7, accent: THEME.green },
        { label: "what's in here? — ls / ls -la", cmd: 'ls -la', output: ['-rw-r--r--  kali kali  notas.txt', 'drwxr-xr-x  kali kali  Documents'], at: 22.4, accent: THEME.amber },
        { label: 'write and read — echo + cat', cmd: "echo 'hola' > /tmp/test.txt && cat /tmp/test.txt", output: ['hola'], at: 31.5, accent: THEME.purple },
      ],
    },
    s3: {
      heading: 'WHAT ATTACKERS READ FIRST',
      footer: "on someone else's system, the history tells you what the user did and which paths exist — it's reading their mind",
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { titleEndS: 5.7, firstChipOffset: 0.5, chipInterval: 1.6, outroDelay: 5.2 },
    s2: { keyAt: 33.3 },
    s3: { t1: 6.5, t2: 11.0, historyInterval: 1.1 },
  },
  en: {
    s1: { titleEndS: 3.8, firstChipOffset: 5.7, chipInterval: 1.1, outroDelay: 4.6 },
    s2: { keyAt: 37.8 },
    s3: { t1: 6.0, t2: 13.0, historyInterval: 1.1 },
  },
};

const VID = 'linux-03-commands';

const HISTORY = [
  'ssh root@192.168.1.11',
  'ls -la /etc',
  'cat /etc/passwd',
  'sudo -l',
  'nmap -sV 192.168.1.11',
];

// ── Scene 1: 4 comandos, 4 preguntas ────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const titleEnd = Math.round(b.titleEndS * fps);
  const firstChip = Math.round(b.firstChipOffset * fps);
  const endNoteA = firstChip + Math.round(b.outroDelay * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title={c.title}
          subtitle={c.subtitle}
          fontSize={40}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
            {c.cmdQuestions.map((cq, i) => (
              <div key={cq.cmd} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <KeyCapsule label={cq.q} value={cq.cmd} accent={cq.c} delay={firstChip + Math.round(i * b.chipInterval * fps)} size={28} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, fontSize: 22, color: THEME.muted, fontFamily: MONO, opacity: interpolate(useCurrentFrame() - endNoteA, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
            {c.outro}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: los 4 comandos en acción ───────────────────────────────
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

const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const keyAt = Math.round(b.keyAt * fps);
  const sessions = c.sessions as Session[];

  const activeIdx = sessions.reduceRight((acc, s, i) => (frame >= Math.round(s.at * fps) ? i : acc), 0);

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
          {c.heading}
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
          {c.footer}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: .bash_history ──────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const t1 = Math.round(b.t1 * fps);
  const t2 = Math.round(b.t2 * fps);
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        {c.heading}
      </div>
      <TerminalWindow title="~/.bash_history" width={780}>
        {HISTORY.map((line, i) => (
          <div
            key={i}
            style={{
              fontSize: 18, color: i === 0 ? THEME.red : THEME.text, fontFamily: MONO,
              opacity: interpolate(frame - (t1 + Math.round(i * b.historyInterval * fps)), [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            $ {line}
          </div>
        ))}
      </TerminalWindow>
      <div style={{ marginTop: 30, fontSize: 21, color: THEME.muted, fontFamily: MONO, maxWidth: 720, lineHeight: 1.5, opacity: interpolate(useCurrentFrame() - t2, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
        {c.footer}
      </div>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Li03CoreCommands: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: intro */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: los 4 comandos */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: .bash_history */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
