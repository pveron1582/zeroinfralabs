// ── video/remotion/compositions/Sl02VariablesConditionals.tsx ────
// Video: variables, argumentos y condicionales.
// Clase 2 de Scripting/Bash (lección bash-02). Guiones: voicebox-scripts/{es,en}/bash/bash-02-*.txt
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

const VID = 'bash-02-variables-conditionals';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>VARIABLES, <span style={{ color: THEME.red }}>ARGUMENTOS Y CONDICIONALES</span></>,
      subtitle: 'un script que hace siempre lo mismo no sirve',
      capsuleLabel: 'la clave',
      capsuleValue: 'se adapta al objetivo',
      points: ['variables guardan datos', 'condicionales eligen el camino'],
    },
    s2: {
      title: <><span style={{ color: THEME.green }}>VARIABLES</span>: GUARDAR DATOS</>,
      terminalTitle: 'kali@attacker-01:~$',
      terminalLines: [
        { prompt: true, text: 'nombre=kali' },
        { prompt: true, text: 'echo "$nombre"' },
        { prompt: false, text: 'kali', color: 'amber' },
        { prompt: true, text: 'fecha=$(date)' },
        { prompt: true, text: 'echo "$fecha"' },
        { prompt: false, text: 'lun 25 ago 2026 23:59:00', color: 'amber' },
      ],
      capsule1: { label: 'sin espacios', value: 'nombre=kali' },
      capsule2: { label: 'capturar salida', value: 'fecha=$(date)' },
    },
    s3: {
      title: <>ARGUMENTOS Y <span style={{ color: THEME.green }}>CONDICIONALES</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano ping.sh',
      terminalLines: [
        { color: 'green', text: '#!/bin/bash' },
        { color: 'text', text: 'host=$1' },
        { color: 'mixed', parts: [
          { color: 'cyan', text: 'if' },
          { color: 'text', text: ' [ -z "$host" ]; ' },
          { color: 'cyan', text: 'then' },
        ]},
        { color: 'text', text: '  echo "Uso: ./ping.sh &lt;host&gt;"' },
        { color: 'cyan', text: 'else' },
        { color: 'text', text: '  ping -c 2 "$host"' },
        { color: 'cyan', text: 'fi' },
      ],
      capsule1: { label: '$1 $2 … $#', value: 'argumentos' },
      capsule2: { label: '-f / -d / -z', value: 'tests útiles' },
    },
  },
  en: {
    s1: {
      title: <>A SCRIPT THAT <span style={{ color: THEME.cyan }}>THINKS</span></>,
      subtitle: 'a script that always does the same thing is useless — it gets good when it adapts to the target',
      capsuleLabel: 'the key',
      capsuleValue: 'adapts to the target',
      points: ['variables store data · arguments receive input from outside', 'conditionals pick the path'],
    },
    s2: {
      title: <><span style={{ color: THEME.green }}>VARIABLES</span>: STORING DATA</>,
      terminalTitle: 'kali@attacker-01:~$',
      terminalLines: [
        { prompt: true, text: 'name=kali' },
        { prompt: true, text: 'echo "$name"' },
        { prompt: false, text: 'kali', color: 'amber' },
        { prompt: true, text: 'date=$(date)' },
        { prompt: true, text: 'echo "$date"' },
        { prompt: false, text: 'Mon Aug 25 2026 23:59:00', color: 'amber' },
      ],
      capsule1: { label: 'no spaces', value: 'name=kali' },
      capsule2: { label: 'capture output', value: 'date=$(date)' },
      extraReveal: 'double quotes expand the variable · single quotes print the literal text',
    },
    s3: {
      title: <>ARGUMENTS AND <span style={{ color: THEME.green }}>CONDITIONALS</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano ping.sh',
      terminalLines: [
        { color: 'green', text: '#!/bin/bash' },
        { color: 'text', text: 'host=$1' },
        { color: 'mixed', parts: [
          { color: 'cyan', text: 'if' },
          { color: 'text', text: ' [ -z "$host" ]; ' },
          { color: 'cyan', text: 'then' },
        ]},
        { color: 'text', text: '  echo "Usage: ./ping.sh &lt;host&gt;"' },
        { color: 'cyan', text: 'else' },
        { color: 'text', text: '  ping -c 2 "$host"' },
        { color: 'cyan', text: 'fi' },
      ],
      capsule1: { label: '$1 $2 … $#', value: 'arguments' },
      capsule2: { label: '-f / -d / -z', value: 'useful tests' },
      extraReveal: 'the spaces inside the brackets are mandatory',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 3, points: [7, 11] },
    s2: { terminalDelay: 2.5, capsule1Delay: 11, capsule2Delay: 16 },
    s3: { terminalDelay: 2.5, capsule1Delay: 11, capsule2Delay: 16 },
  },
  en: {
    s1: { capsuleDelay: 4.1, points: [10.9, 15.0] },
    s2: { terminalDelay: 2.2, capsule1Delay: 3.4, capsule2Delay: 23.2, extraRevealAt: 11.8 },
    s3: { terminalDelay: 1.2, capsule1Delay: 5.5, capsule2Delay: 21.3, extraRevealAt: 28.5 },
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
    <KeyCapsule label={c.capsuleLabel} value={c.capsuleValue} accent={THEME.cyan} delay={Math.round(b.capsuleDelay * fps)} size={24} />
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
            {line.prompt && <span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span>}
            <span style={{ color: THEME[(line.color || 'text') as keyof typeof THEME] }}>{line.text}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.amber} delay={Math.round(b.capsule1Delay * fps)} size={20} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={20} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={920} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            {'parts' in line ? (
              (line.parts ?? []).map((p: any, j: number) => (
                <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>
              ))
            ) : (
              <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={20} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={20} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.red}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Sl02VariablesConditionals: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
