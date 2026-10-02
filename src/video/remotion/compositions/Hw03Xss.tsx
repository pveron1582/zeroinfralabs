// ── video/remotion/compositions/Hw03Xss.tsx ──────────────────────
// Video: XSS — inyectando scripts en el navegador.
// Clase 3 de Hacking Web (lección hackingweb-03). Guiones: voicebox-scripts/{es,en}/hackingweb/hackingweb-03-*.txt
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      heading: <>XSS: <span style={{ color: THEME.red }}>CÓDIGO EN EL NAVEGADOR</span></>,
      lines: [
        { text: 'input sin escapar → se ejecuta' },
        { text: 'prueba: <script>alert(1)</script>' },
        { text: 'si salta el diálogo, la app es vulnerable' },
      ],
    },
    s2: {
      heading: <>REFLEJADO EN LA <span style={{ color: THEME.green }}>URL</span></>,
      terminalTitle: "kali@attacker-01:~$ curl 'http://10.0.0.11/search?q=<script>alert(1)</script>'",
      terminalLines: [
        '<div class="result">Results for: ',
        '<script>alert(1)</script>',
        '</div>',
      ],
      keycapsules: [
        { label: 'reflejado', value: 'en la URL', accent: THEME.cyan },
        { label: 'almacenado', value: 'en el server', accent: THEME.red },
        { label: 'DOM', value: 'en el cliente', accent: THEME.green },
      ],
      footer: '',
    },
    s3: {
      heading: <>IMPACTO: <span style={{ color: THEME.red }}>SECUESTRO DE SESIÓN</span></>,
      lines: [
        { text: 'lee cookies → roba el login' },
        { text: 'captura tecleos · redirige a phishing' },
        { text: 'defensa: escapar la salida siempre' },
      ],
    },
  },
  en: {
    s1: {
      heading: <>XSS: <span style={{ color: THEME.red }}>CODE IN THE BROWSER</span></>,
      lines: [
        { text: 'not the server — it runs in the victim\'s browser' },
        { text: 'unescaped input → the browser reads it as code, not text' },
        { text: 'the classic test: <script>alert(1)</script>' },
        { text: 'if the dialogue pops inside your session, the app is vulnerable' },
      ],
    },
    s2: {
      heading: <>THREE <span style={{ color: THEME.green }}>FLAVORS</span></>,
      keycapsules: [
        { label: 'reflected', value: 'in the URL', accent: THEME.cyan },
        { label: 'stored', value: 'on the server', accent: THEME.red },
        { label: 'DOM-based', value: 'client-side', accent: THEME.green },
      ],
      terminalTitle: "kali@attacker-01:~$ curl 'http://10.0.0.11/search?q=<script>alert(1)</script>'",
      terminalLines: [
        '<div class="result">Results for: ',
        '<script>alert(1)</script>',
        '</div>',
      ],
      footer: 'when the victim opens the URL, the script becomes executable code in their browser, not text',
    },
    s3: {
      heading: <>IMPACT: <span style={{ color: THEME.red }}>SESSION HIJACKING</span></>,
      lines: [
        { text: 'reads cookies → hijacks the session, steals your login' },
        { text: 'captures keystrokes · screenshots · redirects to phishing · calls APIs' },
        { text: 'runs with the logged-in user\'s permissions: more privileges, more you get' },
        { text: 'defense: always escape the output, never trust user input as HTML' },
      ],
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { lines: [4.5, 14.2, 18.7] },
    s2: { terminalDelay: 2.5, capsules: [2.4, 10.2, 18.1] },
    s3: { lines: [8.2, 11.5, 13.5] },
  },
  en: {
    s1: { lines: [3.0, 8.0, 19.3, 22.3] },
    s2: { capsules: [2.9, 9.6, 17.8], terminalDelay: 24.3 },
    s3: { lines: [2.9, 6.9, 13.9, 22.1] },
  },
};

const VID = 'hackingweb-03-xss';

// ── Scene components ────────────────────────────────────────────────

// ES Scene 1: qué es XSS
const EsScene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : i === 1 ? THEME.amber : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// ES Scene 2: XSS reflejado en la URL
const EsScene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={980} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
        <span style={{ color: THEME.red }}>{c.terminalLines[1]}</span>
        <span style={{ color: THEME.dim }}>{c.terminalLines[2]}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 14, marginTop: 24 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={20} />
      ))}
    </div>
  </AbsoluteFill>
);

// ES Scene 3: impacto + defensa
const EsScene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i < 2 ? THEME.amber : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 1: what XSS is
const EnScene1: React.FC<{ fps: number; c: typeof COPY.en.s1; b: typeof BEATS.en.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i < 2 ? THEME.cyan : i === 2 ? THEME.amber : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 2: three flavors, reflected in the URL
const EnScene2: React.FC<{ fps: number; c: typeof COPY.en.s2; b: typeof BEATS.en.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={20} />
      ))}
    </div>
    <TerminalWindow title={c.terminalTitle} width={980} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
        <span style={{ color: THEME.red }}>{c.terminalLines[1]}</span>
        <span style={{ color: THEME.dim }}>{c.terminalLines[2]}</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 20, fontSize: 17, color: THEME.muted, fontFamily: MONO, width: 900 }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// EN Scene 3: impact + defense
const EnScene3: React.FC<{ fps: number; c: typeof COPY.en.s3; b: typeof BEATS.en.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i < 3 ? THEME.amber : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Hw03Xss: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hackingweb-03-scene1.wav`)} />}
        {lang === 'es' ? <EsScene1 fps={fps} c={c.s1} b={b.s1} /> : <EnScene1 fps={fps} c={c.s1} b={b.s1} />}
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hackingweb-03-scene2.wav`)} />}
        {lang === 'es' ? <EsScene2 fps={fps} c={c.s2 as typeof COPY.es.s2} b={b.s2 as typeof BEATS.es.s2} /> : <EnScene2 fps={fps} c={c.s2 as typeof COPY.en.s2} b={b.s2 as typeof BEATS.en.s2} />}
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hackingweb-03-scene3.wav`)} />}
        {lang === 'es' ? <EsScene3 fps={fps} c={c.s3} b={b.s3} /> : <EnScene3 fps={fps} c={c.s3} b={b.s3} />}
      </Sequence>
    </AbsoluteFill>
  );
};
