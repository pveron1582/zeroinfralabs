// ── video/remotion/compositions/Hw05PathTraversalLfi.tsx ─────────
// Video: Path Traversal & LFI — de leer archivos a ejecutar código.
// Clase 5 de Hacking Web (lección hackingweb-05). Guiones: voicebox-scripts/{es,en}/hackingweb/hackingweb-05-*.txt
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { RevealLine } from '../primitives/RevealLine';
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
      heading: <>PATH TRAVERSAL: <span style={{ color: THEME.red }}>ESCAPAR DE LA WEB</span></>,
      lines: [] as { text: string }[],
      terminalTitle: "kali@attacker-01:~$ curl 'http://10.0.0.11/?page=../../../../etc/passwd'",
      terminalLines: [
        'root:x:0:0:root:/root:/bin/bash',
        'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
        'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
      ],
      line: '../../ sube por el árbol hasta /etc/passwd',
    },
    s2: {
      heading: <>LFI: <span style={{ color: THEME.green }}>LEÉS EL CÓDIGO FUENTE</span></>,
      lines: [
        { text: 'include() trae el archivo, no solo lo muestra' },
        { text: 'php://filter/convert.base64-encode/resource=config.php' },
        { text: 'el config vuelve en base64: leés credenciales' },
      ],
    },
    s3: {
      heading: <>DE LFI A <span style={{ color: THEME.red }}>RCE: LOG POISONING</span></>,
      lines: [
        { text: 'metés PHP en el log: User-Agent: <?php system($_GET["cmd"]); ?>' },
        { text: 'incluís el log → el include lo ejecuta' },
        { text: 'defensa: nunca rutas de usuario en include/u open' },
      ],
    },
  },
  en: {
    s1: {
      heading: <>PATH TRAVERSAL: <span style={{ color: THEME.red }}>ESCAPING THE WEB FOLDER</span></>,
      lines: [
        { text: 'your input chooses which file to include → you control the file, and sometimes much more' },
        { text: 'path traversal lets you escape the web folder · LFI reads server files' },
        { text: 'an endpoint that serves files by name accepts dot dot slash to climb the tree' },
        { text: 'repeated four times + /etc/passwd: the server blindly joins the path and returns the accounts file' },
      ],
      terminalTitle: "kali@attacker-01:~$ curl 'http://10.0.0.11/?page=../../../../etc/passwd'",
      terminalLines: [
        'root:x:0:0:root:/root:/bin/bash',
        'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
        'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
      ],
      line: '',
    },
    s2: {
      heading: <>LFI: <span style={{ color: THEME.green }}>READING THE SOURCE CODE</span></>,
      lines: [
        { text: 'the app doesn\'t just return the file — it includes it with include in PHP' },
        { text: 'php://filter/convert.base64-encode/resource=config.php' },
        { text: 'the config never runs and comes back base64 encoded' },
        { text: 'that\'s how you read credentials, API keys, and the code\'s logic' },
        { text: 'the same payload, one step deeper — looking inside the application' },
      ],
    },
    s3: {
      heading: <>FROM LFI TO <span style={{ color: THEME.red }}>RCE: LOG POISONING</span></>,
      lines: [
        { text: 'if the server writes requests into a log and you can include that log — drop PHP into a line' },
        { text: 'User-Agent: <?php system($_GET["cmd"]); ?> lands in the access log' },
        { text: 'include it, call cmd=id → a file that should never have been code executes yours → shell' },
        { text: 'defend: never put user input into include/open paths · whitelist · least privilege' },
      ],
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { lines: [] as number[], terminalDelay: 2.5, line: 7.5 },
    s2: { lines: [8.6, 10.5, 22.4] },
    s3: { lines: [10.7, 18.1, 24.6] },
  },
  en: {
    s1: { lines: [3.3, 7.2, 17.9, 25.5], terminalDelay: 24.2, line: 0 },
    s2: { lines: [2.2, 10.4, 15.6, 19.4, 24.8] },
    s3: { lines: [2.0, 11.5, 19.8, 25.8] },
  },
};

const VID = 'hackingweb-05-path-traversal-lfi';

// ── Scene components ────────────────────────────────────────────────

// ES Scene 1: path traversal + /etc/passwd
const EsScene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={980} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.green }}>{c.terminalLines[0]}</span>
        {'\n'}<span style={{ color: THEME.dim }}>{c.terminalLines[1]}</span>
        {'\n'}<span style={{ color: THEME.dim }}>{c.terminalLines[2]}</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      <RevealLine at={b.line} fps={fps} mark="▸" color={THEME.amber}>{c.line}</RevealLine>
    </div>
  </AbsoluteFill>
);

// ES Scene 2: LFI con php://filter
const EsScene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : i === 1 ? THEME.amber : THEME.red}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// ES Scene 3: de LFI a RCE (log poisoning) + defensa
const EsScene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.amber : i === 1 ? THEME.red : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 1: path traversal
const EnScene1: React.FC<{ fps: number; c: typeof COPY.en.s1; b: typeof BEATS.en.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left', marginBottom: 18 }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i < 2 ? THEME.cyan : i === 2 ? THEME.amber : THEME.red}>{l.text}</RevealLine>
      ))}
    </div>
    <TerminalWindow title={c.terminalTitle} width={980} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
        <span style={{ color: THEME.green }}>{c.terminalLines[0]}</span>
        {'\n'}<span style={{ color: THEME.dim }}>{c.terminalLines[1]}</span>
        {'\n'}<span style={{ color: THEME.dim }}>{c.terminalLines[2]}</span>
      </div>
    </TerminalWindow>
  </AbsoluteFill>
);

// EN Scene 2: LFI with php://filter
const EnScene2: React.FC<{ fps: number; c: typeof COPY.en.s2; b: typeof BEATS.en.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : i === 1 ? THEME.amber : i === 2 ? THEME.cyan : i === 3 ? THEME.red : THEME.purple}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// EN Scene 3: LFI to RCE (log poisoning) + defense
const EnScene3: React.FC<{ fps: number; c: typeof COPY.en.s3; b: typeof BEATS.en.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ width: 1000, textAlign: 'left' }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark="▸" color={i === 0 ? THEME.amber : i === 1 ? THEME.cyan : i === 2 ? THEME.red : THEME.green}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Hw05PathTraversalLfi: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hackingweb-05-scene1.wav`)} />}
        {lang === 'es' ? <EsScene1 fps={fps} c={c.s1 as typeof COPY.es.s1} b={b.s1 as typeof BEATS.es.s1} /> : <EnScene1 fps={fps} c={c.s1 as typeof COPY.en.s1} b={b.s1 as typeof BEATS.en.s1} />}
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hackingweb-05-scene2.wav`)} />}
        {lang === 'es' ? <EsScene2 fps={fps} c={c.s2} b={b.s2} /> : <EnScene2 fps={fps} c={c.s2} b={b.s2} />}
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/hackingweb-05-scene3.wav`)} />}
        {lang === 'es' ? <EsScene3 fps={fps} c={c.s3} b={b.s3} /> : <EnScene3 fps={fps} c={c.s3} b={b.s3} />}
      </Sequence>
    </AbsoluteFill>
  );
};
