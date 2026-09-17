// ── video/remotion/compositions/Py03LoopsLibraries.tsx ───────────
// Video: bucles, funciones y librerías.
// Clase 3 de Scripting/Python (lección python-03). Guiones: voicebox-scripts/py-03-*.txt
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

const VID = 'py-03-loops-libraries';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>BUCLES, <span style={{ color: THEME.red }}>FUNCIONES Y LIBRERÍAS</span></>,
      subtitle: 'El 80% de tus herramientas de pentesting',
      capsuleLabel: 'sintaxis limpia',
      capsuleValue: 'se lee como pseudocódigo',
      points: ['Bucles sobre listas de IPs, puertos y diccionarios', 'Funciones para reutilizar e imports de librerías'],
    },
    s2: {
      title: <>LAS FORMAS DE <span style={{ color: THEME.green }}>ITERAR</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano bucles.py',
      terminalLines: [
        { color: 'dim', text: '# 1. Rango numérico (ej. escanear segmento de red)' },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' i ' }, { color: 'cyan', text: 'in' }, { color: 'green', text: ' range' }, { color: 'text', text: '(1, 255): ' }, { color: 'dim', text: 'print(f"192.168.1.{i}")' }] },
        { color: 'dim', text: '# 2. Lista de elementos' },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' p ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' [21, 22, 80, 445]: ' }, { color: 'dim', text: 'print(f"Puerto: {p}")' }] },
        { color: 'dim', text: '# 3. Leer archivo línea por línea (wordlist de contraseñas)' },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' linea ' }, { color: 'cyan', text: 'in' }, { color: 'green', text: ' open' }, { color: 'text', text: '("wordlist.txt"): ' }, { color: 'dim', text: 'probar(linea.strip())' }] },
        { color: 'dim', text: '# 4. Bucle continuo con break para salir' },
        { parts: [{ color: 'cyan', text: 'while' }, { color: 'amber', text: ' True' }, { color: 'text', text: ': respuesta = escuchar(); ' }, { color: 'cyan', text: 'if' }, { color: 'text', text: ' "OK" ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' respuesta: ' }, { color: 'red', text: 'break' }] },
      ],
      capsule1: { label: 'range(1, 255)', value: 'rango numérico' },
      capsule2: { label: 'for p in [...]', value: 'itera lista' },
      capsule3: { label: 'for l in open()', value: 'línea por línea' },
      capsule4: { label: 'while True / break', value: 'bucle infinito' },
    },
    s3: {
      title: <>DEFINIR FUNCIONES E <span style={{ color: THEME.cyan }}>IMPORTS</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano funciones.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' socket, sys, subprocess, time ' }, { color: 'dim', text: '# o from socket import socket' }] },
        '',
        { parts: [{ color: 'cyan', text: 'def' }, { color: 'green', text: ' escanear' }, { color: 'text', text: '(host, puerto): ' }, { color: 'dim', text: '# def nombre(parámetros):' }] },
        { parts: [{ color: 'text', text: '    print(f"[*] Conectando a {host}:{puerto}...") ' }, { color: 'dim', text: '# bloque indentado' }] },
        '',
        { parts: [{ color: 'green', text: 'escanear' }, { color: 'text', text: '("10.0.0.11", 80) ' }, { color: 'dim', text: '# llamada a la función con valores' }] },
      ],
      capsule1: { label: 'def func(args):', value: 'define función' },
      capsule2: { label: 'socket', value: 'TCP/UDP crudo' },
      capsule3: { label: 'sys', value: 'sys.argv argumentos' },
      capsule4: { label: 'subprocess / time', value: 'comandos y pausas' },
    },
  },
  en: {
    s1: {
      title: <>LOOPS, <span style={{ color: THEME.red }}>FUNCTIONS AND LIBRARIES</span></>,
      subtitle: '80% of your pentesting tools',
      capsuleLabel: 'clean syntax',
      capsuleValue: 'reads like pseudocode',
      points: ['loops over IPs and ports · functions so you don\'t repeat yourself', 'imports to bring in outside power — here you see the three pieces'],
    },
    s2: {
      title: <>WAYS TO <span style={{ color: THEME.green }}>ITERATE</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano loops.py',
      terminalLines: [
        { color: 'dim', text: '# 1. Numeric range (e.g. sweep a network segment)' },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' i ' }, { color: 'cyan', text: 'in' }, { color: 'green', text: ' range' }, { color: 'text', text: '(1, 255): ' }, { color: 'dim', text: 'print(f"192.168.1.{i}")' }] },
        { color: 'dim', text: '# 2. Over a list\'s elements' },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' p ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' [21, 22, 80, 445]: ' }, { color: 'dim', text: 'print(f"Port: {p}")' }] },
        { color: 'dim', text: '# 3. A file, line by line (a password wordlist)' },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' line ' }, { color: 'cyan', text: 'in' }, { color: 'green', text: ' open' }, { color: 'text', text: '("wordlist.txt"): ' }, { color: 'dim', text: 'try_it(line.strip())' }] },
        { color: 'dim', text: '# 4. An infinite loop with a break to get out' },
        { parts: [{ color: 'cyan', text: 'while' }, { color: 'amber', text: ' True' }, { color: 'text', text: ': res = listen(); ' }, { color: 'cyan', text: 'if' }, { color: 'text', text: ' "OK" ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' res: ' }, { color: 'red', text: 'break' }] },
      ],
      capsule1: { label: 'range(1, 255)', value: 'numeric range' },
      capsule2: { label: 'for p in [...]', value: 'iterate a list' },
      capsule3: { label: 'for l in open()', value: 'line by line' },
      capsule4: { label: 'while True / break', value: 'infinite loop' },
    },
    s3: {
      title: <>DEFINING FUNCTIONS AND <span style={{ color: THEME.cyan }}>IMPORTS</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano functions.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' socket, sys, subprocess, time ' }, { color: 'dim', text: '# or from socket import socket' }] },
        '',
        { parts: [{ color: 'cyan', text: 'def' }, { color: 'green', text: ' scan' }, { color: 'text', text: '(host, port): ' }, { color: 'dim', text: '# def name(parameters):' }] },
        { parts: [{ color: 'text', text: '    print(f"[*] Connecting to {host}:{port}...") ' }, { color: 'dim', text: '# indented block' }] },
        '',
        { parts: [{ color: 'green', text: 'scan' }, { color: 'text', text: '("10.0.0.11", 80) ' }, { color: 'dim', text: '# call it with the values' }] },
      ],
      capsule1: { label: 'def func(args):', value: 'define a function' },
      capsule2: { label: 'socket', value: 'raw TCP/UDP' },
      capsule3: { label: 'sys', value: 'sys.argv arguments' },
      capsule4: { label: 'subprocess / time', value: 'commands and pauses' },
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5, 9] },
    s2: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 8, capsule3Delay: 11, capsule4Delay: 14.5 },
    s3: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 12, capsule3Delay: 14.5, capsule4Delay: 17.5 },
  },
  en: {
    s1: { capsuleDelay: 14.4, points: [1.8, 6.2] },
    s2: { terminalDelay: 1.9, capsule1Delay: 3.4, capsule2Delay: 9.3, capsule3Delay: 13.5, capsule4Delay: 17.4 },
    s3: { terminalDelay: 11.1, capsule1Delay: 1.4, capsule2Delay: 18.1, capsule3Delay: 21.3, capsule4Delay: 22.9 },
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
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalLines)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.amber} delay={Math.round(b.capsule3Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule4.label} value={c.capsule4.value} accent={THEME.red} delay={Math.round(b.capsule4Delay * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalLines)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.amber} delay={Math.round(b.capsule3Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule4.label} value={c.capsule4.value} accent={THEME.purple} delay={Math.round(b.capsule4Delay * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Py03LoopsLibraries: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
