// ── video/remotion/compositions/Li03CoreCommands.tsx ───────────────
// Video: los 4 comandos base (pwd, id, ls, echo). Remodelado con los
// audios nuevos: cada comando aparece en su propia terminal cuando la
// narración lo explica (silencedetect), con el output mostrado en vivo.
//
// Scene 1 (12.7s): intro — 4 comandos, 4 preguntas
// Scene 2 (36.7s): pwd → id → ls/ls -la → echo + cat
// Scene 3 (14.3s): .bash_history — lo que los atacantes leen primero

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
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
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

// ── Scene 1: 4 comandos, 4 preguntas ────────────────────────────────
const CMD_QUESTIONS = [
  { cmd: 'pwd', q: '¿dónde estoy?', c: THEME.cyan },
  { cmd: 'id', q: '¿quién soy?', c: THEME.green },
  { cmd: 'ls', q: '¿qué hay acá?', c: THEME.amber },
  { cmd: 'echo', q: '¿cómo escribo?', c: THEME.purple },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  // OJO: dentro de la Sequence anidada el frame arranca en 0 al llegar a
  // titleEnd, así que los delays de los KeyCapsule van RELATIVOS a ese
  // momento (igual que los usados en Li01).
  const titleEndS = 5.7;
  const titleEnd = Math.round(titleEndS * fps);
  const firstChip = Math.round((6.2 - titleEndS) * fps); // 6.2s absolutos de la escena
  const endNoteA = firstChip + Math.round(5.2 * fps); // ~8s dentro de la secuencia
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="TUS 4 COMANDOS DE TODOS LOS DÍAS"
          subtitle="cada uno responde una pregunta — dónde estoy, quién soy…"
          fontSize={40}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CMD_QUESTIONS.map((c, i) => (
              <div key={c.cmd} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <KeyCapsule label={c.q} value={c.cmd} accent={c.c} delay={firstChip + Math.round(i * 1.6 * fps)} size={28} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, fontSize: 22, color: THEME.muted, fontFamily: MONO, opacity: interpolate(useCurrentFrame() - endNoteA, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
            te los muestro uno por uno en la terminal
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: los 4 comandos en acción ───────────────────────────────
// Las 4 sesiones se APILAN en una sola terminal (como el diseño
// original): cada bloque aparece cuando la narración lo explica y
// queda visible. pwd(1s) → id(7s) → ls(14.5s) → echo+cat(23s).
interface Session {
  cmd: string;
  output: string[];
  label: string;
  at: number; // segundo en que el narrador lo explica
  accent: string;
}

// Bloque apilado: etiqueta + prompt + comando tipeado + output
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
  const keyAt = Math.round(33.3 * fps);

  const sessions: Session[] = [
    { label: '¿dónde estoy? — pwd', cmd: 'pwd', output: ['/home/kali'], at: 1.0, accent: THEME.cyan },
    {
      label: '¿quién soy? — id',
      cmd: 'id',
      output: ['uid=1000(kali) gid=1000(kali) groups=1000(kali),27(sudo)'],
      at: 7.0,
      accent: THEME.green,
    },
    {
      label: '¿qué hay acá? — ls / ls -la',
      cmd: 'ls -la',
      output: ['-rw-r--r--  kali kali  notas.txt', 'drwxr-xr-x  kali kali  Documents'],
      at: 14.5,
      accent: THEME.amber,
    },
    {
      label: 'escribir y leer — echo + cat',
      cmd: "echo 'hola' > /tmp/test.txt && cat /tmp/test.txt",
      output: ['hola'],
      at: 23.0,
      accent: THEME.purple,
    },
  ];

  // comando activo según la narración (para el marcador ▸)
  const activeIdx = sessions.reduceRight((acc, s, i) => (frame >= Math.round(s.at * fps) ? i : acc), 0);

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 12 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
          LA BASE PARA MANEJAR ARCHIVOS
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
          esa es la base para manejar archivos y notas en cualquier sistema
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: .bash_history ──────────────────────────────────────────
const HISTORY = [
  'ssh root@192.168.1.11',
  'ls -la /etc',
  'cat /etc/passwd',
  'sudo -l',
  'nmap -sV 192.168.1.11',
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const t1 = Math.round(6.5 * fps);
  const t2 = Math.round(11.0 * fps);
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        LO QUE LOS ATACANTES LEEN PRIMERO
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
        en un sistema ajeno, el historial te dice qué hizo el usuario y qué rutas existen — es leerle la mente
      </div>
    </AbsoluteFill>
  );
};

export const Li03CoreCommands: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['li-03-commands'];
  const starts = sceneStartFrames('li-03-commands', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: intro */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/li-03-commands/li-03-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: los 4 comandos */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/li-03-commands/li-03-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: .bash_history */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/li-03-commands/li-03-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};