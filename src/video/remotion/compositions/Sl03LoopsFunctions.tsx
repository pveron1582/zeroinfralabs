// ── video/remotion/compositions/Sl03LoopsFunctions.tsx ───────────
// Video: bucles, funciones y filtros de texto.
// Clase 3 de Scripting/Bash (lección bash-03). Guiones: voicebox-scripts/{es,en}/bash/bash-03-*.txt
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

const VID = 'bash-03-loops-functions';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>BUCLES, <span style={{ color: THEME.red }}>FUNCIONES Y FILTROS</span></>,
      subtitle: 'el pentesting es repetir cosas a escala',
      capsuleLabel: '254 hosts · 1 wordlist',
      capsuleValue: 'en segundos',
      points: ['bucles repiten · funciones organizan', 'filtros se quedan con lo que importa'],
    },
    s2: {
      title: <>BUCLE FOR: <span style={{ color: THEME.green }}>BARRIDO EN PARALELO</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano sweep.sh',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' ip in $(seq 1 5); ' }, { color: 'cyan', text: 'do' }] },
        { color: 'text', text: '  ping -c 1 -W 1 10.0.0.$ip | grep "bytes from" | awk \'{print $4}\' ' },
        { color: 'red', text: '&', append: true },
        { color: 'cyan', text: 'done' },
        { color: 'cyan', text: 'wait' },
        { color: 'amber', text: '10.0.0.1:  10.0.0.11:  10.0.0.22:' },
      ],
      capsule1: { label: '&', value: 'en background' },
      capsule2: { label: 'wait', value: 'espera a todos' },
    },
    s3: {
      title: <>FUNCIONES Y <span style={{ color: THEME.green }}>FILTROS DE TEXTO</span></>,
      terminalTitle: 'kali@attacker-01:~$',
      terminalLines: [
        { color: 'text', text: 'escaneo() { nmap -sV "$1"; }' },
        { prompt: true, text: 'escaneo 10.0.0.11' },
        { prompt: true, text: 'grep "open" nmap.txt | awk \'{print $1}\'' },
        { color: 'amber', text: '21/tcp  22/tcp  80/tcp' },
      ],
      capsule1: { label: 'grep', value: 'filtra líneas' },
      capsule2: { label: 'awk', value: 'extrae columnas' },
      capsule3: { label: 'sed', value: 'reemplaza texto' },
    },
  },
  en: {
    s1: {
      title: <>LOOPS, <span style={{ color: THEME.red }}>FUNCTIONS AND FILTERS</span></>,
      subtitle: 'pentesting is repeating things at scale',
      capsuleLabel: '254 hosts · 1 wordlist',
      capsuleValue: 'in seconds',
      points: ['loops for repetition · functions for organization', 'text filters for keeping only what matters', 'a sweep that would take hours takes seconds'],
    },
    s2: {
      title: <>FOR LOOP: <span style={{ color: THEME.green }}>PARALLEL SWEEP</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano sweep.sh',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' ip in $(seq 1 254); ' }, { color: 'cyan', text: 'do' }] },
        { color: 'text', text: '  ping -c 1 -W 1 10.0.0.$ip | grep "bytes from" | awk \'{print $4}\' ' },
        { color: 'red', text: '&', append: true },
        { color: 'cyan', text: 'done' },
        { color: 'cyan', text: 'wait' },
        { color: 'amber', text: '10.0.0.1:  10.0.0.11:  10.0.0.22:' },
      ],
      capsule1: { label: '&', value: 'in the background' },
      capsule2: { label: 'wait', value: 'waits for all' },
      extraReveal: "in parallel — that's how sweeps fly",
    },
    s3: {
      title: <>FUNCTIONS AND <span style={{ color: THEME.green }}>TEXT FILTERS</span></>,
      terminalTitle: 'kali@attacker-01:~$',
      terminalLines: [
        { color: 'text', text: 'scan() { nmap -sV "$1"; }' },
        { prompt: true, text: 'scan 10.0.0.11' },
        { prompt: true, text: 'grep "open" nmap.txt | awk \'{print $1}\'' },
        { color: 'amber', text: '21/tcp  22/tcp  80/tcp' },
      ],
      capsule1: { label: 'grep', value: 'filters lines' },
      capsule2: { label: 'awk', value: 'extracts columns' },
      capsule3: { label: 'sed', value: 'replaces text' },
      extraReveal: 'you scan once and parse it as many times as you want',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 3, points: [7, 11] },
    s2: { terminalDelay: 2.5, capsule1Delay: 11, capsule2Delay: 16 },
    s3: { terminalDelay: 2.5, capsule1Delay: 11, capsule2Delay: 15, capsule3Delay: 19 },
  },
  en: {
    s1: { capsuleDelay: 2.4, points: [10.3, 14.2, 18.0] },
    s2: { terminalDelay: 2.7, capsule1Delay: 22.0, capsule2Delay: 13.8, extraRevealAt: 25.9 },
    s3: { terminalDelay: 0.5, capsule1Delay: 12.9, capsule2Delay: 14.6, capsule3Delay: 16.2, extraRevealAt: 28.1 },
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
      {c.points.map((point, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <RevealLine at={b.points[i]} fps={fps} mark="▸" color={THEME.cyan}>{point}</RevealLine>
        </React.Fragment>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 2 ─────────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            {'parts' in line ? (
              (line.parts ?? []).map((p: any, j: number) => (
                <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>
              ))
            ) : 'append' in line && line.append ? (
              <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
            ) : (
              <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.red} delay={Math.round(b.capsule1Delay * fps)} size={20} />
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
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            {line.prompt && <span style={{ color: THEME.dim }}>kali@attacker-01:~$ </span>}
            <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={20} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={20} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.green} delay={Math.round(b.capsule3Delay * fps)} size={20} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.cyan}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Sl03LoopsFunctions: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
