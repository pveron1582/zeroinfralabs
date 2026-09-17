// ── video/remotion/compositions/Hw02DomainsSubdirectories.tsx ─────
// Video: dominios, subdominios y subdirectorios — mapeando el objetivo.
// Clase 2 de Hacking Web (lección web-04). Guiones: voicebox-scripts/hw-02-*.txt
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
      heading: <>ANTES DE DISPARAR: <span style={{ color: THEME.red }}>MAPEAR</span></>,
      lines: [
        { text: 'dominio: ejemplo.com (lo apunta el DNS)', color: THEME.cyan },
        { text: 'subdominio: blog. (otro servidor)', color: THEME.amber },
        { text: 'subdirectorio: /panel/login (misma app)', color: THEME.green },
      ],
      footer: 'terreno · edificios distintos · habitaciones',
    },
    s2: {
      heading: <>FUZZING DE RUTAS CON <span style={{ color: THEME.green }}>GOBUSTER</span></>,
      lines: [] as { text: string }[],
      terminalTitle: 'kali@attacker-01:~$ gobuster dir -u http://10.0.0.11 -w common.txt',
      terminalLines: [
        'Gobuster v3.1.0',
        '[+] Url: http://10.0.0.11',
        '/admin     (Status: 301)',
        '/backup    (Status: 200)',
        '/uploads   (Status: 301)',
      ],
      keycapsules: [
        { label: 'subdominios', value: 'agrandan superficie', accent: THEME.amber },
        { label: 'subdirectorios', value: 'esconden lo sensible', accent: THEME.red },
      ],
      footer: '',
    },
    s3: {
      heading: <>FUZZING: <span style={{ color: THEME.cyan }}>ADIVINAR A ESCALA</span></>,
      lines: [
        { text: '200 existe · 301/302 redirige', color: THEME.green },
        { text: '403 existe pero prohíbe (¡interesa!)', color: THEME.amber },
        { text: '404 no existe', color: THEME.red },
      ],
      footer: 'defensa: sacá staging del DNS · protegé admin · mira tus logs',
    },
  },
  en: {
    s1: {
      heading: <>BEFORE SHOOTING: <span style={{ color: THEME.red }}>MAP IT</span></>,
      lines: [
        { text: 'domain: example.com (DNS points it at a server)', color: THEME.cyan },
        { text: 'subdomain: blog. (can resolve to a different server, a different app)', color: THEME.amber },
        { text: 'subdirectory: /panel/login (a path inside the same app)', color: THEME.green },
      ],
      footer: 'terrain · different buildings · rooms',
    },
    s2: {
      heading: <>SUBDOMAINS GROW THE <span style={{ color: THEME.amber }}>ATTACK SURFACE</span></>,
      lines: [
        { text: 'dev.example.com, staging, old app — old versions, no auth, forgotten' },
        { text: 'subdirectories hide the sensitive parts: admin, phpMyAdmin, backup.zip, .git' },
        { text: 'none of that shows up in a port scan — it all travels over port 80 or 443' },
      ],
      terminalTitle: 'kali@attacker-01:~$ gobuster dir -u http://10.0.0.11 -w common.txt',
      terminalLines: [
        'Gobuster v3.1.0',
        '[+] Url: http://10.0.0.11',
        '/admin     (Status: 301)',
        '/backup    (Status: 200)',
        '/uploads   (Status: 301)',
      ],
      keycapsules: [] as { label: string; value: string; accent: string }[],
      footer: 'ask the server directly: thousands of words as paths, keep what isn\'t a 404',
    },
    s3: {
      heading: <>FUZZING: <span style={{ color: THEME.cyan }}>GUESSING AT SCALE</span></>,
      lines: [
        { text: 'tools: gobuster, ffuf (filters by size/status), dirb, dirsearch', color: THEME.cyan },
        { text: '200 exists · 301/302 redirect', color: THEME.green },
        { text: '403 exists but forbids you (also matters!)', color: THEME.amber },
        { text: '404 doesn\'t exist', color: THEME.red },
        { text: 'subdomain fuzzing: word.example.com against DNS', color: THEME.purple },
      ],
      footer: 'defense: pull staging out of public DNS · protect admin panels · watch your logs',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { lines: [7.0, 13.7, 21.1] },
    s2: { lines: [] as number[], terminalDelay: 2.5, capsules: [16.2, 21.6] },
    s3: { lines: [9.5, 16.3, 23.0] },
  },
  en: {
    s1: { lines: [23.2, 28.7, 35.3] },
    s2: { lines: [3.7, 16.7, 24.7], terminalDelay: 30.7, capsules: [] as number[] },
    s3: { lines: [5.9, 17.9, 22.5, 26.1, 30.4] },
  },
};

const VID = 'hw-02-domains-subdirectories';

// ── Scene components ────────────────────────────────────────────────

// ES Scene 1: anatomía de una URL
const EsScene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={l.color}>{l.text}</RevealLine>
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ES Scene 2: gobuster dir
const EsScene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={960} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            <span style={{ color: i >= 2 ? THEME.green : THEME.dim }}>{line}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={22} />
      ))}
    </div>
  </AbsoluteFill>
);

// ES Scene 3: fuzzing + códigos de estado + defensa
const EsScene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={l.color}>{l.text}</RevealLine>
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// EN Scene 1: URL anatomy
const EnScene1: React.FC<{ fps: number; c: typeof COPY.en.s1; b: typeof BEATS.en.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={l.color}>{l.text}</RevealLine>
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// EN Scene 2: subdomains grow the surface + gobuster
const EnScene2: React.FC<{ fps: number; c: typeof COPY.en.s2; b: typeof BEATS.en.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left', marginBottom: 18 }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.amber : i === 1 ? THEME.red : THEME.muted}>{l.text}</RevealLine>
      ))}
    </div>
    <TerminalWindow title={c.terminalTitle} width={960} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            <span style={{ color: i >= 2 ? THEME.green : THEME.dim }}>{line}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// EN Scene 3: fuzzing + status codes + defense
const EnScene3: React.FC<{ fps: number; c: typeof COPY.en.s3; b: typeof BEATS.en.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={l.color ?? THEME.cyan}>{l.text}</RevealLine>
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Hw02DomainsSubdirectories: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-02-scene1.wav`)} />}
        {lang === 'es' ? <EsScene1 fps={fps} c={c.s1} b={b.s1} /> : <EnScene1 fps={fps} c={c.s1} b={b.s1} />}
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-02-scene2.wav`)} />}
        {lang === 'es' ? <EsScene2 fps={fps} c={c.s2 as typeof COPY.es.s2} b={b.s2 as typeof BEATS.es.s2} /> : <EnScene2 fps={fps} c={c.s2 as typeof COPY.en.s2} b={b.s2 as typeof BEATS.en.s2} />}
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-02-scene3.wav`)} />}
        {lang === 'es' ? <EsScene3 fps={fps} c={c.s3 as typeof COPY.es.s3} b={b.s3 as typeof BEATS.es.s3} /> : <EnScene3 fps={fps} c={c.s3 as typeof COPY.en.s3} b={b.s3 as typeof BEATS.en.s3} />}
      </Sequence>
    </AbsoluteFill>
  );
};
