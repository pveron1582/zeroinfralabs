// ── video/remotion/compositions/Py02TypesConditions.tsx ──────────
// Video: variables, tipos y condiciones.
// Clase 2 de Scripting/Python (lección python-02). Guiones: voicebox-scripts/py-02-*.txt
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

const VID = 'py-02-types-conditions';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>TIPOS Y <span style={{ color: THEME.red }}>CONDICIONES</span></>,
      subtitle: 'Números, textos, listas y diccionarios para modelar ataques',
      capsuleLabel: '4 tipos y un if',
      capsuleValue: 'modelás cualquier pentest',
      points: ['Estructuras claras para IPs, puertos y respuestas', 'La parte del lenguaje que más vas a usar en scripts'],
    },
    s2: {
      title: <>LOS CUATRO <span style={{ color: THEME.green }}>TIPOS BÁSICOS</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 -i tipos.py',
      terminalLines: [
        { parts: [{ color: 'text', text: 'texto = ' }, { color: 'green', text: '"10.0.0.11"' }, { color: 'dim', text: '            # str (texto entre comillas)' }] },
        { parts: [{ color: 'text', text: 'puerto = ' }, { color: 'amber', text: '80' }, { color: 'dim', text: '                   # int (número entero)' }] },
        { parts: [{ color: 'text', text: 'abiertos = [' }, { color: 'amber', text: '22' }, { color: 'text', text: ', ' }, { color: 'amber', text: '80' }, { color: 'text', text: ', ' }, { color: 'amber', text: '445' }, { color: 'text', text: ']' }, { color: 'dim', text: '         # list -> abiertos[0] es 22' }] },
        { parts: [{ color: 'text', text: 'servidor = {"os": "Linux", "web": "Apache"}' }, { color: 'dim', text: ' # dict -> servidor["os"]' }] },
        { parts: [{ color: 'cyan', text: 'info = f"{texto}:{puerto} activo"' }, { color: 'dim', text: '      # f-string con variables' }] },
        { color: 'dim', text: '# len(abiertos) es 3  |  80 in abiertos es True' },
      ],
      capsule1: { label: 'abiertos[0]', value: 'índice de lista' },
      capsule2: { label: 'servidor["os"]', value: 'clave de dict' },
      capsule3: { label: 'f"{var}"', value: 'f-string dinámico' },
      capsule4: { label: 'len() / in', value: 'tamaño y pertenencia' },
    },
    s3: {
      title: <>CONDICIONALES: <span style={{ color: THEME.cyan }}>IF, ELIF, ELSE</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 decision.py',
      terminalLines: [
        { parts: [{ color: 'text', text: 'puerto = ' }, { color: 'green', text: 'int' }, { color: 'text', text: '(' }, { color: 'green', text: 'input' }, { color: 'text', text: '("Puerto a probar: ")) ' }, { color: 'dim', text: '# input() da str -> convertí a int' }] },
        { parts: [{ color: 'cyan', text: 'if' }, { color: 'text', text: ' puerto == ' }, { color: 'amber', text: '22' }, { color: 'cyan', text: ':' }] },
        { parts: [{ color: 'text', text: '    print("[+] Servicio seguro: SSH") ' }, { color: 'dim', text: '# bloque indentado' }] },
        { parts: [{ color: 'cyan', text: 'elif' }, { color: 'text', text: ' puerto == ' }, { color: 'amber', text: '80' }, { color: 'cyan', text: ' or' }, { color: 'text', text: ' puerto == ' }, { color: 'amber', text: '443' }, { color: 'cyan', text: ':' }] },
        { parts: [{ color: 'text', text: '    print("[+] Servicio Web activo")' }] },
        { parts: [{ color: 'cyan', text: 'else:' }] },
        { parts: [{ color: 'text', text: '    print("[-] Servicio no catalogado")' }] },
      ],
      capsule1: { label: 'if / elif / else:', value: 'dos puntos y sangría' },
      capsule2: { label: '== != < > and or not', value: 'comparaciones' },
      capsule3: { label: 'int(input())', value: 'texto a número' },
      extraReveal: "that's the foundation of any script that decides something",
    },
  },
  en: {
    s1: {
      title: <>TYPES AND <span style={{ color: THEME.red }}>CONDITIONS</span></>,
      subtitle: 'numbers, text, lists, and dictionaries to model attacks',
      capsuleLabel: '4 types and an if',
      capsuleValue: 'model almost any pentest',
      points: ['with those four and an if, you can already model almost anything in a pentest', "the part of the language you'll use the most — worth having clear from the start"],
    },
    s2: {
      title: <>THE FOUR <span style={{ color: THEME.green }}>BASIC TYPES</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 -i types.py',
      terminalLines: [
        { parts: [{ color: 'text', text: 'ip = ' }, { color: 'green', text: '"10.0.0.11"' }, { color: 'dim', text: '                  # a text in quotes' }] },
        { parts: [{ color: 'text', text: 'port = ' }, { color: 'amber', text: '80' }, { color: 'dim', text: '                   # a number' }] },
        { parts: [{ color: 'text', text: 'open_ports = [' }, { color: 'amber', text: '22' }, { color: 'text', text: ', ' }, { color: 'amber', text: '80' }, { color: 'text', text: ', ' }, { color: 'amber', text: '445' }, { color: 'text', text: ']' }, { color: 'dim', text: '     # list in brackets -> open_ports[0]' }] },
        { parts: [{ color: 'text', text: 'server = {"os": "Linux", "web": "Apache"}' }, { color: 'dim', text: ' # dict in braces -> server["os"]' }] },
        { parts: [{ color: 'cyan', text: 'info = f"{ip}:{port} active"' }, { color: 'dim', text: '       # f-string, variables in braces' }] },
        { color: 'dim', text: '# len(open_ports) is 3  |  80 in open_ports is True' },
      ],
      capsule1: { label: 'open_ports[0]', value: 'list index' },
      capsule2: { label: 'server["os"]', value: 'dict key' },
      capsule3: { label: 'f"{var}"', value: 'f-string' },
      capsule4: { label: 'len() / in', value: 'size and membership' },
    },
    s3: {
      title: <>CONDITIONS: <span style={{ color: THEME.cyan }}>IF, ELIF, ELSE</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 decision.py',
      terminalLines: [
        { parts: [{ color: 'text', text: 'port = ' }, { color: 'green', text: 'int' }, { color: 'text', text: '(' }, { color: 'green', text: 'input' }, { color: 'text', text: '("Port to try: ")) ' }, { color: 'dim', text: '# input() gives str -> convert to int' }] },
        { parts: [{ color: 'cyan', text: 'if' }, { color: 'text', text: ' port == ' }, { color: 'amber', text: '22' }, { color: 'cyan', text: ':' }] },
        { parts: [{ color: 'text', text: '    print("[+] Secure service: SSH") ' }, { color: 'dim', text: '# indented block' }] },
        { parts: [{ color: 'cyan', text: 'elif' }, { color: 'text', text: ' port == ' }, { color: 'amber', text: '80' }, { color: 'cyan', text: ' or' }, { color: 'text', text: ' port == ' }, { color: 'amber', text: '443' }, { color: 'cyan', text: ':' }] },
        { parts: [{ color: 'text', text: '    print("[+] Active web service")' }] },
        { parts: [{ color: 'cyan', text: 'else:' }] },
        { parts: [{ color: 'text', text: '    print("[-] Unlisted service")' }] },
      ],
      capsule1: { label: 'if / elif / else:', value: 'colon + indented block' },
      capsule2: { label: '== != < > and or not', value: 'comparisons' },
      capsule3: { label: 'int(input())', value: 'text to number' },
      extraReveal: "that's the foundation of any script that decides something",
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5, 9] },
    s2: { terminalDelay: 1.5, capsule1Delay: 8, capsule2Delay: 11, capsule3Delay: 14, capsule4Delay: 17.5 },
    s3: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 9, capsule3Delay: 14 },
  },
  en: {
    s1: { capsuleDelay: 6.3, points: [8.0, 12.0] },
    s2: { terminalDelay: 0.5, capsule1Delay: 9.0, capsule2Delay: 11.7, capsule3Delay: 16.2, capsule4Delay: 21.0 },
    s3: { terminalDelay: 0.5, capsule1Delay: 3.8, capsule2Delay: 7.8, capsule3Delay: 16.6, extraRevealAt: 22.4 },
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
      <KeyCapsule label={c.capsule4.label} value={c.capsule4.value} accent={THEME.purple} delay={Math.round(b.capsule4Delay * fps)} size={16} />
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
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={17} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={17} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.amber} delay={Math.round(b.capsule3Delay * fps)} size={17} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Py02TypesConditions: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
