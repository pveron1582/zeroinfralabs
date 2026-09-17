// ── video/remotion/compositions/Hw01WebProtocols.tsx ─────────────
// Video: protocolos web — HTTP, HTTPS y más.
// Clase 1 de Hacking Web (lección proto-02). Guiones: voicebox-scripts/hw-01-*.txt
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
      heading: <>LA WEB: <span style={{ color: THEME.red }}>EL CAMPO DE BATALLA</span></>,
      subtitle: 'HTTP y HTTPS son sus dos idiomas principales',
      httpLabel: 'HTTP',
      httpValue: 'puerto 80 · texto plano',
      lines: [
        { text: 'GET pide un recurso · POST envía datos' },
        { text: 'cabeceras y cookies llevan la sesión' },
      ],
      footer: '',
    },
    s2: {
      heading: <>A VER QUÉ <span style={{ color: THEME.green }}>CORRE EL SERVIDOR</span></>,
      terminalTitle: 'kali@attacker-01:~$ curl -I http://10.0.0.11',
      terminalLines: [
        'HTTP/1.1 200 OK',
        'Date: Mon, 10 Aug 2026 14:22:05 GMT',
        'Server: Apache/2.4.41 (Ubuntu)',
        'Content-Type: text/html',
      ],
      keycapsules: [
        { label: 'Server:', value: 'versión expuesta', accent: THEME.amber },
        { label: 'primer dato', value: 'elegir exploit', accent: THEME.green },
      ],
      lines: [],
      footer: '',
    },
    s3: {
      heading: <>HTTPS: <span style={{ color: THEME.green }}>CANAL CIFRADO</span>, APP EXPUESTA</>,
      lines: [
        { text: 'puerto 443 · TLS cifra el contenido' },
        { text: 'el cifrado protege el canal, no la app' },
        { text: 'WebSocket · WebDAV · REST/API · DNS' },
      ],
      footer: 'el DNS también puede filtrar datos en consultas',
    },
  },
  en: {
    s1: {
      heading: <>THE WEB: <span style={{ color: THEME.red }}>THE BIGGEST BATTLEFIELD</span></>,
      subtitle: 'HTTP and HTTPS are its two main languages',
      httpLabel: 'HTTP',
      httpValue: 'port 80 · plain text',
      lines: [
        { text: 'GET requests a resource · POST sends data' },
        { text: 'headers and cookies carry the sessions' },
        { text: 'the classic vulnerabilities live here: SQLi, XSS, command injection', mark: '⚠', color: THEME.red },
      ],
      footer: '',
    },
    s2: {
      heading: <>HTTPS: <span style={{ color: THEME.green }}>ENCRYPTED CHANNEL</span>, EXPOSED APP</>,
      terminalTitle: '',
      terminalLines: [] as string[],
      keycapsules: [] as { label: string; value: string; accent: string }[],
      lines: [
        { text: 'port 443 · wraps HTTP inside TLS' },
        { text: 'encryption protects the channel, not the application' },
        { text: 'injections still work — they travel inside legitimate traffic' },
        { text: 'lock the door, but the window stays open', mark: '✓', color: THEME.green },
      ],
      footer: '',
    },
    s3: {
      heading: <>THE PROTOCOLS <span style={{ color: THEME.green }}>DON'T END THERE</span></>,
      lines: [
        { text: 'WebSocket: persistent, two-way · chats, trading, dashboards' },
        { text: 'WebDAV: edits files over HTTP · sometimes forgotten, weak auth' },
        { text: 'REST/APIs: JSON over HTTP, the language of modern apps' },
        { text: 'DNS can also be an attack protocol: data inside DNS queries', mark: '⚠', color: THEME.red },
      ],
      footer: '',
      terminalTitle: 'kali@attacker-01:~$ curl -I http://10.0.0.11',
      terminalLines: [
        'HTTP/1.1 200 OK',
        'Date: Mon, 10 Aug 2026 14:22:05 GMT',
        'Server: Apache/2.4.41 (Ubuntu)',
        'Content-Type: text/html',
      ],
      keycapsules: [
        { label: 'Server:', value: 'version exposed', accent: THEME.amber },
        { label: 'first piece of data', value: 'pick an exploit', accent: THEME.green },
      ],
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { httpCapsule: 2.9, lines: [9.0, 13.5] as [number, number] },
    s2: { terminalDelay: 2.5, capsules: [13.7, 17.8] as [number, number] },
    s3: { lines: [1.9, 8.1, 17.1] as [number, number, number] },
  },
  en: {
    s1: { httpCapsule: 10.8, lines: [18.7, 22.8, 25.3] as [number, number, number] },
    s2: { lines: [0.0, 13.3, 16.7, 20.9] as [number, number, number, number] },
    s3: { lines: [2.2, 7.7, 13.3, 19.0] as [number, number, number, number], terminalDelay: 24.5, capsules: [27.4, 32.0] as [number, number] },
  },
};

const VID = 'hw-01-web-protocols';

// ── Scene components ────────────────────────────────────────────────

// ES Scene 1: la web como campo de batalla + HTTP
const EsScene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      {c.subtitle}
    </div>
    <KeyCapsule label={c.httpLabel} value={c.httpValue} accent={THEME.cyan} delay={Math.round(b.httpCapsule * fps)} size={26} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.lines.map((l, i) => (
        <React.Fragment key={i}>
          <RevealLine at={b.lines[i]} fps={fps} mark="▸" color={THEME.cyan}>{l.text}</RevealLine>
          {i < c.lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  </AbsoluteFill>
);

// ES Scene 2: curl -I al servidor
const EsScene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={920} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            <span style={{ color: i === 2 ? THEME.green : THEME.dim }}>{line}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={22} />
      ))}
    </div>
  </AbsoluteFill>
);

// ES Scene 3: HTTPS + otros protocolos
const EsScene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.green : i === 1 ? THEME.amber : THEME.cyan}>{l.text}</RevealLine>
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// EN Scene 1: the web as battlefield + HTTP
const EnScene1: React.FC<{ fps: number; c: typeof COPY.en.s1; b: typeof BEATS.en.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      {c.subtitle}
    </div>
    <KeyCapsule label={c.httpLabel} value={c.httpValue} accent={THEME.cyan} delay={Math.round(b.httpCapsule * fps)} size={26} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.lines.map((l, i) => (
        <React.Fragment key={i}>
          <RevealLine at={b.lines[i]} fps={fps} mark={l.mark ?? '▸'} color={l.color ?? THEME.cyan}>{l.text}</RevealLine>
          {i < c.lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 2: HTTPS — channel protected, app exposed
const EnScene2: React.FC<{ fps: number; c: typeof COPY.en.s2; b: typeof BEATS.en.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark={l.mark ?? '▸'} color={l.color ?? (i === 0 ? THEME.green : i === 1 ? THEME.amber : THEME.red)}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 3: other protocols + curl -I
const EnScene3: React.FC<{ fps: number; c: typeof COPY.en.s3; b: typeof BEATS.en.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark={l.mark ?? '▸'} color={l.color ?? THEME.cyan}>{l.text}</RevealLine>
      ))}
    </div>
    <TerminalWindow title={c.terminalTitle} width={920} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            <span style={{ color: i === 2 ? THEME.green : THEME.dim }}>{line}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={22} />
      ))}
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Hw01WebProtocols: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-01-scene1.wav`)} />}
        {lang === 'es' ? <EsScene1 fps={fps} c={c.s1 as typeof COPY.es.s1} b={b.s1 as typeof BEATS.es.s1} /> : <EnScene1 fps={fps} c={c.s1 as typeof COPY.en.s1} b={b.s1 as typeof BEATS.en.s1} />}
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-01-scene2.wav`)} />}
        {lang === 'es' ? <EsScene2 fps={fps} c={c.s2 as typeof COPY.es.s2} b={b.s2 as typeof BEATS.es.s2} /> : <EnScene2 fps={fps} c={c.s2 as typeof COPY.en.s2} b={b.s2 as typeof BEATS.en.s2} />}
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hw-01-scene3.wav`)} />}
        {lang === 'es' ? <EsScene3 fps={fps} c={c.s3 as typeof COPY.es.s3} b={b.s3 as typeof BEATS.es.s3} /> : <EnScene3 fps={fps} c={c.s3 as typeof COPY.en.s3} b={b.s3 as typeof BEATS.en.s3} />}
      </Sequence>
    </AbsoluteFill>
  );
};
