// ── video/remotion/compositions/Sl01BashIntro.tsx ────────────────
// Video: qué es bash — la shell que se volvió lenguaje.
// Clase 1 de Scripting/Bash (lección bash-01). Guiones: voicebox-scripts/sl-01-*.txt
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

const VID = 'sl-01-bash-intro';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>BASH: <span style={{ color: THEME.red }}>LA SHELL QUE SE VOLVIÓ LENGUAJE</span></>,
      subtitle: 'antes de escribir exploits, vas a escribir scripts',
      bashLabel: 'shell + lenguaje',
      points: ['está en todos lados, no instalás nada', 'automatiza lo que harías a mano'],
    },
    s2: {
      title: <>TU <span style={{ color: THEME.green }}>PRIMER SCRIPT</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano primer.sh',
      terminalLines: [
        { type: 'green' as const, text: '#!/bin/bash' },
        { type: 'text' as const, text: 'echo "Hola, soy un script de pentesting"' },
        { type: 'dim' as const, text: 'kali@attacker-01:~$ chmod +x primer.sh' },
        { type: 'dim' as const, text: 'kali@attacker-01:~$ ./primer.sh' },
        { type: 'amber' as const, text: 'Hola, soy un script de pentesting' },
      ],
      shebang: { label: 'shebang', value: '#!/bin/bash' },
      salida: { label: 'salida', value: 'se ejecuta en orden' },
    },
    s3: {
      title: <>TRES PASOS, <span style={{ color: THEME.cyan }}>TRES CONCEPTOS</span></>,
      steps: [
        { mark: '1', color: THEME.cyan, text: 'nano → escribís el shebang y tus comandos' },
        { mark: '2', color: THEME.amber, text: 'chmod +x → permiso de ejecución' },
        { mark: '3', color: THEME.green, text: './script.sh → lo ejecutás' },
      ],
      footer: 'en el lab trabajá desde /tmp, que es escribible por todos',
    },
  },
  en: {
    s1: {
      title: <>BASH: <span style={{ color: THEME.red }}>THE SHELL THAT BECAME A LANGUAGE</span></>,
      subtitle: "before writing exploits, you'll write scripts",
      bashLabel: 'shell + language',
      points: ['the one you already have open every time you drop into a console', "it's everywhere, nothing to install, it automates what you do by hand"],
    },
    s2: {
      title: <>YOUR <span style={{ color: THEME.green }}>FIRST SCRIPT</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano first.sh',
      terminalLines: [
        { type: 'green' as const, text: '#!/bin/bash' },
        { type: 'text' as const, text: "echo \"Hi, I'm a pentesting script\"" },
        { type: 'dim' as const, text: 'kali@attacker-01:~$ chmod +x first.sh' },
        { type: 'dim' as const, text: 'kali@attacker-01:~$ ./first.sh' },
        { type: 'amber' as const, text: "Hi, I'm a pentesting script" },
      ],
      shebang: { label: 'shebang', value: '#!/bin/bash' },
      salida: { label: 'commands', value: 'run top to bottom' },
    },
    s3: {
      title: <>THREE STEPS, <span style={{ color: THEME.cyan }}>THREE CONCEPTS</span></>,
      steps: [
        { mark: '1', color: THEME.cyan, text: 'nano → write the shebang and your commands' },
        { mark: '2', color: THEME.amber, text: 'chmod +x → execute permission' },
        { mark: '3', color: THEME.green, text: './script.sh → run it (e.g. ./script.sh)' },
      ],
      footer: 'in the lab you work from /tmp — writable by everyone · shebang, permission, execution',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 3, points: [7, 11] },
    s2: { terminalDelay: 2.5, shebangDelay: 11, salidaDelay: 16 },
    s3: { points: [3, 8, 13] },
  },
  en: {
    s1: { capsuleDelay: 3.2, points: [12.1, 22.0] },
    s2: { terminalDelay: 6.7, shebangDelay: 13.5, salidaDelay: 9.8 },
    s3: { points: [3.1, 7.1, 11.0] },
  },
};

// ── Scene 1 ─────────────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.title}
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      {c.subtitle}
    </div>
    <KeyCapsule label="bash" value={c.bashLabel} accent={THEME.cyan} delay={Math.round(b.capsuleDelay * fps)} size={26} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={b.points[0]} fps={fps} mark="▸" color={THEME.cyan}>{c.points[0]}</RevealLine>
      <br />
      <RevealLine at={b.points[1]} fps={fps} mark="▸" color={THEME.cyan}>{c.points[1]}</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 2 ─────────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={920} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            <span style={{ color: THEME[line.type] }}>{line.text}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label={c.shebang.label} value={c.shebang.value} accent={THEME.green} delay={Math.round(b.shebangDelay * fps)} size={20} />
      <KeyCapsule label={c.salida.label} value={c.salida.value} accent={THEME.amber} delay={Math.round(b.salidaDelay * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.title}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.steps.map((step, i) => (
        <RevealLine key={i} at={b.points[i]} fps={fps} mark={step.mark} color={step.color}>{step.text}</RevealLine>
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Sl01BashIntro: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/sl-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/sl-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/sl-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
