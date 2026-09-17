// ── video/remotion/compositions/Hw04SqlInjection.tsx ─────────────
// Video: SQL Injection — hablándole a la base de datos.
// Clase 4 de Hacking Web (lección web-02). Guiones: voicebox-scripts/hw-04-*.txt
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
      heading: <>SQL INJECTION: <span style={{ color: THEME.red }}>HABLARLE A LA BASE</span></>,
      lines: [
        { text: 'input pegado sin filtrar → comando SQL' },
        { text: 'leés, modificás o borrás tablas enteras' },
      ],
    },
    s2: {
      heading: <>BYPASS DE <span style={{ color: THEME.green }}>LOGIN</span></>,
      lines: [] as { text: string }[],
      terminalTitle: 'kali@attacker-01:~$ curl -d "username=admin\' OR \'1\'=\'1" --data-urlencode password=x http://10.0.0.11/login',
      terminalLines: [
        'HTTP/1.1 200 OK',
        'Welcome admin!',
      ],
      keycapsules: [
        { label: 'comillas cierran', value: 'el string', accent: THEME.amber },
        { label: "OR '1'='1'", value: 'siempre verdad', accent: THEME.red },
      ],
    },
    s3: {
      heading: <>IMPACTO: <span style={{ color: THEME.red }}>VOLCÁS LA BASE</span></>,
      lines: [
        { text: 'in-band: UNION, errores que filtran' },
        { text: 'blind: sí/no o demoras (time-based)' },
        { text: 'defensa: consultas parametrizadas' },
      ],
    },
  },
  en: {
    s1: {
      heading: <>SQL INJECTION: <span style={{ color: THEME.red }}>TALKING TO THE DATABASE</span></>,
      lines: [
        { text: 'unfiltered input pasted into a query → you speak SQL directly to the server' },
        { text: 'login or search fields → inject fragments that change the logic' },
        { text: 'the database treats your input as commands' },
        { text: 'read, modify, or delete entire tables — you\'re writing to the database' },
      ],
    },
    s2: {
      heading: <>LOGIN <span style={{ color: THEME.green }}>BYPASS</span></>,
      lines: [
        { text: 'a login query builds: select from users where username = \'…\' and password = \'…\'' },
        { text: 'send as the username: quote space OR space one equals one' },
        { text: 'the condition becomes always true → the first row, often admin' },
      ],
      terminalTitle: 'kali@attacker-01:~$ curl -d "username=admin\' OR \'1\'=\'1" --data-urlencode password=x http://10.0.0.11/login',
      terminalLines: [
        'HTTP/1.1 200 OK',
        'Welcome admin!',
      ],
      keycapsules: [
        { label: 'the quote closes', value: 'the string', accent: THEME.amber },
        { label: "OR '1'='1'", value: 'always true', accent: THEME.red },
      ],
    },
    s3: {
      heading: <>BEYOND THE LOGIN: <span style={{ color: THEME.red }}>DUMP EVERYTHING</span></>,
      lines: [
        { text: 'in band: read data with queries · UNION joins · error messages leak' },
        { text: 'blind: no visible output — yes/no questions or measured delays' },
        { text: 'impact: users, password hashes, secrets, full server access' },
        { text: 'defense: parameterized queries — input travels as data, never as SQL' },
      ],
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { lines: [10.0, 16.8] },
    s2: { lines: [] as number[], terminalDelay: 2.5, capsules: [8.0, 16.8] },
    s3: { lines: [8.6, 15.7, 26.5] },
  },
  en: {
    s1: { lines: [2.0, 10.2, 16.4, 18.7] },
    s2: { lines: [4.4, 9.1, 13.0], terminalDelay: 18.6, capsules: [24.3, 27.9] },
    s3: { lines: [2.4, 10.1, 16.1, 25.0] },
  },
};

const VID = 'hw-04-sql-injection';

// ── Scene components ────────────────────────────────────────────────

// ES Scene 1: qué es SQLi
const EsScene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : THEME.amber}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// ES Scene 2: bypass de login
const EsScene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={980} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
        {'\n'}<span style={{ color: THEME.green }}>{c.terminalLines[1]}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={22} />
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
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : i === 1 ? THEME.amber : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 1: what SQLi is
const EnScene1: React.FC<{ fps: number; c: typeof COPY.en.s1; b: typeof BEATS.en.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i < 2 ? THEME.cyan : i === 2 ? THEME.amber : THEME.red}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 2: login bypass
const EnScene2: React.FC<{ fps: number; c: typeof COPY.en.s2; b: typeof BEATS.en.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left', marginBottom: 18 }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.dim : i === 1 ? THEME.amber : THEME.red}>{l.text}</RevealLine>
      ))}
    </div>
    <TerminalWindow title={c.terminalTitle} width={980} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
        {'\n'}<span style={{ color: THEME.green }}>{c.terminalLines[1]}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={22} />
      ))}
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
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i < 2 ? THEME.cyan : i === 2 ? THEME.red : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Hw04SqlInjection: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-04-scene1.wav`)} />}
        {lang === 'es' ? <EsScene1 fps={fps} c={c.s1} b={b.s1} /> : <EnScene1 fps={fps} c={c.s1} b={b.s1} />}
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-04-scene2.wav`)} />}
        {lang === 'es' ? <EsScene2 fps={fps} c={c.s2 as typeof COPY.es.s2} b={b.s2 as typeof BEATS.es.s2} /> : <EnScene2 fps={fps} c={c.s2 as typeof COPY.en.s2} b={b.s2 as typeof BEATS.en.s2} />}
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-04-scene3.wav`)} />}
        {lang === 'es' ? <EsScene3 fps={fps} c={c.s3} b={b.s3} /> : <EnScene3 fps={fps} c={c.s3} b={b.s3} />}
      </Sequence>
    </AbsoluteFill>
  );
};
