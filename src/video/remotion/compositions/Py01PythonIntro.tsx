// ── video/remotion/compositions/Py01PythonIntro.tsx ──────────────
// Video: qué es Python — el lenguaje del hacking.
// Clase 1 de Scripting/Python (lección python-01). Guiones: voicebox-scripts/py-01-*.txt
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

const VID = 'py-01-python-intro';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>PYTHON: <span style={{ color: THEME.red }}>EL LENGUAJE DEL HACKING</span></>,
      subtitle: 'Legible, poderoso y estándar de facto en ciberseguridad',
      capsuleLabel: 'la mayoría',
      capsuleValue: 'de exploits públicos',
      points: ['Librerías para redes, HTTP y explotación', 'El lenguaje favorito de los atacantes y pentesters'],
    },
    s2: {
      title: <>INTERPRETADO Y <span style={{ color: THEME.green }}>MODULAR</span></>,
      terminalTitle: 'kali@attacker-01:~$',
      terminalLines: [
        { color: 'dim', text: 'kali@attacker-01:~$ python3 exploit.py' },
        { color: 'amber', text: '[*] Ejecutando script directo sin compilar...' },
        { color: 'dim', text: 'kali@attacker-01:~$ python3 -c "print(\'One-liner rápido\')"' },
        { color: 'green', text: 'One-liner rápido' },
      ],
      capsule1: { label: 'socket', value: 'redes TCP/UDP' },
      capsule2: { label: 'requests', value: 'HTTP web' },
      capsule3: { label: 'subprocess', value: 'comandos OS' },
      capsule4: { label: 'scapy', value: 'paquetes' },
      capsule5: { label: 'paramiko', value: 'SSH remoto' },
    },
    s3: {
      title: <>TRES FUNCIONES <span style={{ color: THEME.cyan }}>ESENCIALES</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 primer_script.py',
      terminalLines: [
        { color: 'dim', text: '# 1. Comentario: documenta qué hace el código' },
        { parts: [{ color: 'cyan', text: 'print' }, { color: 'text', text: '("=== Reconocimiento de Host ===")' }] },
        { parts: [{ color: 'text', text: 'target = ' }, { color: 'green', text: 'input' }, { color: 'text', text: '("IP objetivo: ")' }] },
        { parts: [{ color: 'cyan', text: 'print' }, { color: 'text', text: `(f"[*] Escaneando host: {target}")` }] },
        { color: 'amber', text: 'IP objetivo: 10.0.0.11' },
        { color: 'green', text: '[*] Escaneando host: 10.0.0.11' },
      ],
      capsule1: { label: 'print("...")', value: 'mostrar salida' },
      capsule2: { label: '# texto', value: 'comentarios' },
      capsule3: { label: 'input("...")', value: 'preguntar al usuario' },
      extraReveal: 'print, comment, ask — that\'s the base · one-liners for quick tests, files for real scripts',
    },
  },
  en: {
    s1: {
      title: <>PYTHON: <span style={{ color: THEME.red }}>THE HACKING LANGUAGE</span></>,
      subtitle: 'readable, powerful, and libraries for almost everything',
      capsuleLabel: 'most public exploits',
      capsuleValue: 'written in Python',
      points: ['libraries for networking, HTTP, exploitation', 'this lesson shows you how to run your first script — and why it\'s the attacker\'s favorite'],
    },
    s2: {
      title: <>INTERPRETED AND <span style={{ color: THEME.green }}>MODULAR</span></>,
      terminalTitle: 'kali@attacker-01:~$',
      terminalLines: [
        { color: 'dim', text: 'kali@attacker-01:~$ python3 exploit.py' },
        { color: 'amber', text: '[*] Running the script directly — no compilation step...' },
        { color: 'dim', text: 'kali@attacker-01:~$ python3 -c "print(\'quick one-liner\')"' },
        { color: 'green', text: 'quick one-liner' },
      ],
      capsule1: { label: 'socket', value: 'TCP/UDP networking' },
      capsule2: { label: 'requests', value: 'web HTTP' },
      capsule3: { label: 'subprocess', value: 'OS commands' },
      capsule4: { label: 'scapy', value: 'packets' },
      capsule5: { label: 'paramiko', value: 'remote SSH' },
      extraReveal: 'indentation defines the blocks — no braces',
    },
    s3: {
      title: <>THREE <span style={{ color: THEME.cyan }}>ESSENTIAL FUNCTIONS</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 first_script.py',
      terminalLines: [
        { color: 'dim', text: '# a comment: documents what the code does' },
        { parts: [{ color: 'cyan', text: 'print' }, { color: 'text', text: '("=== Host Recon ===")' }] },
        { parts: [{ color: 'text', text: 'target = ' }, { color: 'green', text: 'input' }, { color: 'text', text: '("Target IP: ")' }] },
        { parts: [{ color: 'cyan', text: 'print' }, { color: 'text', text: `(f"[*] Scanning host: {target}")` }] },
        { color: 'amber', text: 'Target IP: 10.0.0.11' },
        { color: 'green', text: '[*] Scanning host: 10.0.0.11' },
      ],
      capsule1: { label: 'print("...")', value: 'prints' },
      capsule2: { label: '# text', value: 'a comment' },
      capsule3: { label: 'input("...")', value: 'asks the user' },
      extraReveal: 'show, comment, ask — that\'s the base · one-liners for quick tests, files for real scripts',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5.5, 10] },
    s2: { terminalDelay: 1.5, capsule1Delay: 11, capsule2Delay: 13.5, capsule3Delay: 16, capsule4Delay: 18.5, capsule5Delay: 20.5 },
    s3: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 7.5, capsule3Delay: 11 },
  },
  en: {
    s1: { capsuleDelay: 12.2, points: [8.6, 18.0] },
    s2: { terminalDelay: 4.7, capsule1Delay: 17.6, capsule2Delay: 19.1, capsule3Delay: 21.0, capsule4Delay: 22.8, capsule5Delay: 24.0, extraRevealAt: 12.1 },
    s3: { terminalDelay: 0.5, capsule1Delay: 3.4, capsule2Delay: 6.8, capsule3Delay: 8.9, extraRevealAt: 16.4 },
  },
};

const renderTerminal = (lines: any[]) => lines.map((line, i) => {
  if (typeof line === 'string') return <React.Fragment key={i}>{line}</React.Fragment>;
  return (
    <React.Fragment key={i}>
      {i > 0 && '\n'}
      {'parts' in line
        ? line.parts.map((p: any, j: number) => <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>)
        : <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>}
    </React.Fragment>
  );
});

// ── Scene 1 ─────────────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      {c.title}
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      {c.subtitle}
    </div>
    <KeyCapsule label={c.capsuleLabel} value={c.capsuleValue} accent={THEME.cyan} delay={Math.round(b.capsuleDelay * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      {c.points.map((point, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={{ height: 10 }} />}
          <RevealLine at={b.points[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : THEME.green}>{point}</RevealLine>
        </React.Fragment>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 2 ─────────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>{renderTerminal(c.terminalLines)}</div>
    </TerminalWindow>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.cyan}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.amber} delay={Math.round(b.capsule3Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule4.label} value={c.capsule4.value} accent={THEME.red} delay={Math.round(b.capsule4Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule5.label} value={c.capsule5.value} accent={THEME.purple} delay={Math.round(b.capsule5Delay * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>{renderTerminal(c.terminalLines)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={18} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={18} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.green} delay={Math.round(b.capsule3Delay * fps)} size={18} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Py01PythonIntro: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
