// ── video/remotion/compositions/Li02ShellAnatomy.tsx ───────────────
// Video: el prompt y la anatomía de un comando. Remodelado con los
// audios nuevos (voz "Miguel"): cada símbolo del prompt y cada parte
// del comando aparecen sincronizados a la narración (silencedetect).
//
// Scene 1 (15.0s): qué es el prompt y qué significa
// Scene 2 (39.1s): descomposición kali@attacker-01:~$ → $ vs #
// Scene 3 (40.6s): comando, flags y argumento (nmap -sV -p- <ip>)
// Scene 4 (14.8s): cierre — la terminal es tu mapa

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
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
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

// ── Scene 1: ¿qué es el prompt? ─────────────────────────────────────
// Dentro de la Sequence anidada el frame es RELATIVO a titleEnd.
// La narración lista los 4 significados ~5.8s-8.5s, así que las cápsulas
// aparecen a los 1.5s, 2.4s, 3.3s y 4.2s de esa secuencia.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const titleEndS = 4.35;
  const titleEnd = Math.round(titleEndS * fps);
  const chips0 = Math.round((5.8 - titleEndS) * fps); // 1.45s relativo
  const gap = Math.round(0.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="EL PROMPT TE CUENTA TODO"
          subtitle="una línea que se repite antes de cada comando"
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
              # ¿garabato? no — cada símbolo significa algo
            </div>
          </TerminalWindow>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginTop: 30 }}>
            <KeyCapsule label="quién sos" value="usuario" accent={THEME.green} delay={chips0} />
            <KeyCapsule label="en qué máquina" value="máquina" accent={THEME.cyan} delay={chips0 + gap} />
            <KeyCapsule label="dónde estás" value="home" accent={THEME.amber} delay={chips0 + gap * 2} />
            <KeyCapsule label="cuánto poder" value="permisos" accent={THEME.purple} delay={chips0 + gap * 3} />
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: kali@attacker-01:~$ parte por parte ───────────────────
// El narrador presenta los símbolos en este orden (silencedetect):
//   usuario(4.0) → máquina(10.3) → home(14.4) → $(20.3) → #(25.6)
const S2_STEPS = [
  { key: 'kali', color: THEME.green, at: 4.0, label: 'usuario', text: 'kali — el usuario con el que estás conectado' },
  { key: 'machine', color: THEME.cyan, at: 10.3, label: 'máquina', text: 'attacker-01 — el equipo donde estás trabajando' },
  { key: 'home', color: THEME.amber, at: 14.4, label: 'home', text: '~ (después de los dos puntos) — tu carpeta personal' },
  { key: 'dollar', color: THEME.purple, at: 20.3, label: 'usuario común', text: '$ — permisos normales de un usuario común' },
  { key: 'hash', color: THEME.red, at: 25.6, label: 'root', text: '# — root, el administrador, control total' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const stepIndex = S2_STEPS.findIndex((s) => frame < Math.round(s.at * fps));
  const active = stepIndex === -1 ? S2_STEPS.length - 1 : stepIndex - 1;
  const showRoot = frame >= Math.round(S2_STEPS[4].at * fps);

  const prompt = showRoot
    ? [
        { v: 'kali', c: THEME.green, on: true, at: 4.0 },
        { v: '@', c: THEME.dim, on: false },
        { v: 'attacker-01', c: THEME.cyan, on: true, at: 10.3 },
        { v: ':', c: THEME.dim, on: false },
        { v: '~', c: THEME.amber, on: true, at: 14.4 },
        { v: '#', c: THEME.red, on: true, at: 25.6 },
      ]
    : [
        { v: 'kali', c: THEME.green, on: true, at: 4.0 },
        { v: '@', c: THEME.dim, on: false },
        { v: 'attacker-01', c: THEME.cyan, on: true, at: 10.3 },
        { v: ':', c: THEME.dim, on: false },
        { v: '~', c: THEME.amber, on: true, at: 14.4 },
        { v: '$', c: THEME.purple, on: true, at: 20.3 },
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
          <RevealLine at={28.5} fps={fps} mark="!" color={THEME.red}>
            con solo leer el prompt ya sabés quién sos y cuánto podés hacer
          </RevealLine>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: anatomía de un comando ─────────────────────────────────
const CMD_TOKENS = [
  { value: 'nmap', color: THEME.green, at: 3.0, label: 'comando' },
  { value: '-sV', color: THEME.cyan, at: 9.6, label: 'flag: versiones' },
  { value: '-p-', color: THEME.amber, at: 17.0, label: 'flag: todos los puertos' },
  { value: '192.168.1.11', color: THEME.purple, at: 23.5, label: 'argumento: objetivo' },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const patternAt = Math.round(29.8 * fps);
  const helpAt = Math.round(35.5 * fps);

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, textAlign: 'center' }}>
          LA ANATOMÍA DE UN COMANDO
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
            comando → flags → argumento: el patrón de todos los programas
          </div>
          <div style={{ opacity: interpolate(frame - helpAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
            ¿no recordás los flags? <span style={{ color: THEME.cyan, fontWeight: 700 }}>--help</span> te los lista
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: cierre ─────────────────────────────────────────────────
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const practiceAt = Math.round(10.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={practiceAt}>
        <TitleScene title="LA TERMINAL ES TU MAPA" subtitle="el prompt dice quién sos · los comandos, qué hay" fontSize={38} />
      </Sequence>
      <Sequence from={practiceAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, color: THEME.amber, fontFamily: MONO, maxWidth: 760, lineHeight: 1.5 }}>
            Y esto se practica: <span style={{ color: THEME.text }}>abrí una terminal y empezá a mirar cada símbolo con calma</span>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const Li02ShellAnatomy: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['li-02-shell'];
  const starts = sceneStartFrames('li-02-shell', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 40, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: ¿qué es el prompt? */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/li-02-shell/li-02-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: prompt descompuesto */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/li-02-shell/li-02-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: comando con flags */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/li-02-shell/li-02-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/li-02-shell/li-02-scene4.wav')} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};