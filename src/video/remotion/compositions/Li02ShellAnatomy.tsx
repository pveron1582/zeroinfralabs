// ── video/remotion/compositions/Li02ShellAnatomy.tsx ───────────────
// Video: el prompt y la anatomía de un comando. Versión unificada
// ES/EN con `lang` prop. Timings por silencedetect.

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
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── Token del prompt con highlight activo ───────────────────────────
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: 'EL PROMPT TE CUENTA TODO',
      subtitle: 'una línea que se repite antes de cada comando',
      comment: '# ¿garabato? no — cada símbolo significa algo',
      chips: [
        { label: 'quién sos', value: 'usuario', accent: THEME.green },
        { label: 'en qué máquina', value: 'máquina', accent: THEME.cyan },
        { label: 'dónde estás', value: 'home', accent: THEME.amber },
        { label: 'cuánto poder', value: 'permisos', accent: THEME.purple },
      ],
    },
    s2: {
      steps: [
        { key: 'kali', color: THEME.green, label: 'usuario', text: 'kali — el usuario con el que estás conectado' },
        { key: 'machine', color: THEME.cyan, label: 'máquina', text: 'attacker-01 — el equipo donde estás trabajando' },
        { key: 'home', color: THEME.amber, label: 'home', text: '~ (después de los dos puntos) — tu carpeta personal' },
        { key: 'dollar', color: THEME.purple, label: 'usuario común', text: '$ — permisos normales de un usuario común' },
        { key: 'hash', color: THEME.red, label: 'root', text: '# — root, el administrador, control total' },
      ],
      rootReveal: 'con solo leer el prompt ya sabés quién sos y cuánto podés hacer',
    },
    s3: {
      heading: 'LA ANATOMÍA DE UN COMANDO',
      tokens: [
        { value: 'nmap', color: THEME.green, label: 'comando' },
        { value: '-sV', color: THEME.cyan, label: 'flag: versiones' },
        { value: '-p-', color: THEME.amber, label: 'flag: todos los puertos' },
        { value: '192.168.1.11', color: THEME.purple, label: 'argumento: objetivo' },
      ],
      pattern: 'comando → flags → argumento: el patrón de todos los programas',
      help: <>¿no recordás los flags? <span style={{ color: THEME.cyan, fontWeight: 700 }}>--help</span> te los lista</>,
    },
    s4: {
      title: 'LA TERMINAL ES TU MAPA',
      subtitle: 'el prompt dice quién sos · los comandos, qué hay',
      practice: 'Y esto se practica: abrí una terminal y empezá a mirar cada símbolo con calma',
    },
  },
  en: {
    s1: {
      title: 'THE PROMPT TELLS YOU EVERYTHING',
      subtitle: 'a line that repeats before every command',
      comment: '# scribbles? no — every symbol means something',
      chips: [
        { label: 'who you are', value: 'user', accent: THEME.green },
        { label: 'which machine', value: 'machine', accent: THEME.cyan },
        { label: 'where you are', value: 'home', accent: THEME.amber },
        { label: 'how much power', value: 'privileges', accent: THEME.purple },
      ],
    },
    s2: {
      steps: [
        { key: 'kali', color: THEME.green, label: 'user', text: 'kali — the user you are logged in as' },
        { key: 'machine', color: THEME.cyan, label: 'machine', text: 'attacker-01 — the computer you are working on' },
        { key: 'home', color: THEME.amber, label: 'home', text: '~ (after the colon) — your personal folder' },
        { key: 'dollar', color: THEME.purple, label: 'regular user', text: '$ — a regular user, normal privileges' },
        { key: 'hash', color: THEME.red, label: 'root', text: '# — root, the administrator, full control' },
      ],
      rootReveal: 'just by reading the prompt you already know who you are and how much you can do',
    },
    s3: {
      heading: 'THE ANATOMY OF A COMMAND',
      tokens: [
        { value: 'nmap', color: THEME.green, label: 'command' },
        { value: '-sV', color: THEME.cyan, label: 'flag: versions' },
        { value: '-p-', color: THEME.amber, label: 'flag: all ports' },
        { value: '192.168.1.11', color: THEME.purple, label: 'argument: target' },
      ],
      pattern: 'command → flags → argument: the pattern of every program',
      help: <>forgot the flags? <span style={{ color: THEME.cyan, fontWeight: 700 }}>--help</span> lists them for you</>,
    },
    s4: {
      title: 'THE TERMINAL IS YOUR MAP',
      subtitle: "the prompt says who you are · the commands, what's there",
      practice: 'And this takes practice: open a terminal and start looking at each symbol, slowly',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { chipsAt: 5.8, gap: 0.9 },
    s2: {
      stepAt: [4.0, 10.3, 14.4, 20.3, 25.6],
      rootRevealAt: 28.5,
    },
    s3: {
      tokenAt: [3.0, 9.6, 17.0, 23.5],
      patternAt: 29.8,
      helpAt: 35.5,
    },
    s4: { practiceAt: 10.0 },
  },
  en: {
    s1: { chipsAt: 9.5, gap: 0.9 },
    s2: {
      stepAt: [8.7, 13.9, 18.4, 25.8, 31.0],
      rootRevealAt: 37.7,
    },
    s3: {
      tokenAt: [3.4, 21.6, 25.6, 31.5],
      patternAt: 35.9,
      helpAt: 40.6,
    },
    s4: { practiceAt: 11.0 },
  },
};

const VID = 'linux-02-shell';

// ── Scene 1: ¿qué es el prompt? ─────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const titleEndS = 4.35;
  const titleEnd = Math.round(titleEndS * fps);
  const chips0 = Math.round((b.chipsAt - titleEndS) * fps);
  const gap = Math.round(b.gap * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene title={c.title} subtitle={c.subtitle} fontSize={44} />
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
              {c.comment}
            </div>
          </TerminalWindow>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginTop: 30 }}>
            {c.chips.map((ch, i) => (
              <KeyCapsule key={i} label={ch.label} value={ch.value} accent={ch.accent} delay={chips0 + gap * i} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: kali@attacker-01:~$ parte por parte ───────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const stepIndex = c.steps.findIndex((_, i) => frame < Math.round(b.stepAt[i] * fps));
  const active = stepIndex === -1 ? c.steps.length - 1 : stepIndex - 1;
  const showRoot = frame >= Math.round(b.stepAt[4] * fps);

  const prompt = showRoot
    ? [
        { v: 'kali', c: c.steps[0].color, on: true, at: b.stepAt[0] },
        { v: '@', c: THEME.dim, on: false },
        { v: 'attacker-01', c: c.steps[1].color, on: true, at: b.stepAt[1] },
        { v: ':', c: THEME.dim, on: false },
        { v: '~', c: c.steps[2].color, on: true, at: b.stepAt[2] },
        { v: '#', c: c.steps[4].color, on: true, at: b.stepAt[4] },
      ]
    : [
        { v: 'kali', c: c.steps[0].color, on: true, at: b.stepAt[0] },
        { v: '@', c: THEME.dim, on: false },
        { v: 'attacker-01', c: c.steps[1].color, on: true, at: b.stepAt[1] },
        { v: ':', c: THEME.dim, on: false },
        { v: '~', c: c.steps[2].color, on: true, at: b.stepAt[2] },
        { v: '$', c: c.steps[3].color, on: true, at: b.stepAt[3] },
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
          {c.steps.map((s) => (
            <KeyCapsule key={s.key} label={s.label} value={s.key === 'hash' ? '#' : s.key === 'dollar' ? '$' : s.key === 'home' ? '~' : s.key === 'machine' ? 'attacker-01' : 'kali'} accent={s.color} delay={Math.round(b.stepAt[c.steps.indexOf(s)] * fps)} />
          ))}
        </div>

        <RevealLine at={b.stepAt[Math.max(0, active)]} fps={fps} mark="▸" color={c.steps[Math.max(0, active)].color}>
          {c.steps[Math.max(0, active)].text}
        </RevealLine>

        {showRoot && (
          <RevealLine at={b.rootRevealAt} fps={fps} mark="!" color={THEME.red}>
            {c.rootReveal}
          </RevealLine>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: anatomía de un comando ─────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const patternAt = Math.round(b.patternAt * fps);
  const helpAt = Math.round(b.helpAt * fps);

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, textAlign: 'center' }}>
          {c.heading}
        </div>
        <TerminalWindow title="zsh — kali@attacker-01:~$" width={900}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 30, flexWrap: 'wrap', fontFamily: MONO }}>
            {c.tokens.map((tk) => (
              <PromptToken key={tk.value} value={tk.value} color={tk.color} active={true} fontSize={30} at={b.tokenAt[c.tokens.indexOf(tk)]} fps={fps} />
            ))}
            <span style={{ color: THEME.dim, fontSize: 22 }}>▌</span>
          </div>
        </TerminalWindow>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {c.tokens.map((tk) => (
            <KeyCapsule key={tk.value} label="" value={tk.label} accent={tk.color} delay={Math.round(b.tokenAt[c.tokens.indexOf(tk)] * fps)} size={16} />
          ))}
        </div>

        <div style={{ fontSize: 19, color: THEME.muted, fontFamily: MONO, textAlign: 'center' }}>
          <div style={{ opacity: interpolate(frame - patternAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
            {c.pattern}
          </div>
          <div style={{ opacity: interpolate(frame - helpAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
            {c.help}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: cierre ─────────────────────────────────────────────────
const Scene4: React.FC<{ fps: number; c: typeof COPY.es.s4; b: typeof BEATS.es.s4 }> = ({ fps, c, b }) => {
  const practiceAt = Math.round(b.practiceAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={practiceAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} fontSize={38} />
      </Sequence>
      <Sequence from={practiceAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.amber, fontFamily: MONO, maxWidth: 760, lineHeight: 1.5 }}>
            {c.practice}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Li02ShellAnatomy: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3, s4] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 40, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: ¿qué es el prompt? */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: prompt descompuesto */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: comando con flags */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>

      {/* Scene 4: cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/linux-02-scene4.wav`)} />}
        <Scene4 fps={fps} c={c.s4} b={b.s4} />
      </Sequence>
    </AbsoluteFill>
  );
};
