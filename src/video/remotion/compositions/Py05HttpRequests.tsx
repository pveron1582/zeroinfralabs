// ── video/remotion/compositions/Py05HttpRequests.tsx ─────────────
// Video: pentesting II — HTTP con requests.
// Clase 5 de Scripting/Python (lección python-05). Guiones: voicebox-scripts/py-05-*.txt
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

const VID = 'py-05-http-requests';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>HTTP CON <span style={{ color: THEME.red }}>REQUESTS</span></>,
      subtitle: 'La web es el blanco número uno: automatizá tus ataques',
      capsuleLabel: 'automatización web',
      capsuleValue: 'logins, rutas y payloads',
      points: ['Probar credenciales, fuzzing de directorios y APIs', 'Combina bucles, condiciones y peticiones HTTP en un solo script'],
    },
    s2: {
      title: <>HTTP EN <span style={{ color: THEME.green }}>TRES LÍNEAS</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 -i http_test.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' requests' }] },
        { parts: [{ color: 'text', text: 'r = requests.get(' }, { color: 'green', text: '"http://10.0.0.11"' }, { color: 'text', text: ') ' }, { color: 'dim', text: '# Envía GET y guarda respuesta' }] },
        { parts: [{ color: 'cyan', text: 'r.status_code' }, { color: 'dim', text: '        # 200 (código HTTP)' }] },
        { parts: [{ color: 'cyan', text: 'r.headers["Server"]' }, { color: 'dim', text: '  # Apache/2.4.41 (cabeceras)' }] },
        { parts: [{ color: 'cyan', text: 'r.text' }, { color: 'dim', text: '               # el cuerpo HTML de la página' }] },
        { color: 'dim', text: '# requests.post(url, data={...}) envía formularios' },
        { color: 'dim', text: '# s = requests.Session() mantiene cookies entre peticiones' },
      ],
      capsule1: { label: 'r.status_code / r.text', value: 'código y cuerpo' },
      capsule2: { label: 'requests.post', value: 'envía datos/login' },
      capsule3: { label: 'requests.Session()', value: 'persiste cookies' },
    },
    s3: {
      title: <>FUERZA BRUTA: <span style={{ color: THEME.cyan }}>DECIDIR POR LA RESPUESTA</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 brute.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' pwd ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' [' }, { color: 'green', text: '"123456"' }, { color: 'text', text: ', ' }, { color: 'green', text: '"admin"' }, { color: 'text', text: ', ' }, { color: 'green', text: '"toor"' }, { color: 'text', text: ', ' }, { color: 'green', text: '"secret"' }, { color: 'text', text: ']:' }] },
        { parts: [{ color: 'text', text: '    r = requests.post(url, data={"user": "admin", "pass": pwd})' }] },
        { parts: [{ color: 'cyan', text: '    if ' }, { color: 'green', text: '"bienvenido" ' }, { color: 'cyan', text: 'in ' }, { color: 'text', text: 'r.text.lower() ' }, { color: 'cyan', text: 'or ' }, { color: 'text', text: 'r.status_code == ' }, { color: 'amber', text: '302' }, { color: 'cyan', text: ':' }] },
        { parts: [{ color: 'text', text: '        print(f"[+] Credencial válida: admin:{pwd}")' }] },
        { parts: [{ color: 'cyan', text: '        break' }] },
        { color: 'dim', text: '[-] admin:123456 -> Falló  [-] admin:admin -> Falló' },
        { color: 'green', text: '[+] Credencial válida: admin:toor' },
      ],
      capsule1: { label: '"bienvenido" in r.text', value: 'detectar éxito' },
      capsule2: { label: 'status_code == 302', value: 'detectar redirect' },
      capsule3: { label: 'wordlist real', value: 'brute-forcer / fuzzer' },
    },
  },
  en: {
    s1: {
      title: <>HTTP WITH <span style={{ color: THEME.red }}>REQUESTS</span></>,
      subtitle: 'the web is target number one — automate your attacks',
      capsuleLabel: 'web automation',
      capsuleValue: 'logins, paths, payloads',
      points: ['the perfect close for the module — it brings together everything you saw', 'loops to repeat, conditions to decide, and a library that does the network\'s heavy lifting'],
    },
    s2: {
      title: <>HTTP IN <span style={{ color: THEME.green }}>THREE LINES</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 -i http_test.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' requests' }] },
        { parts: [{ color: 'text', text: 'r = requests.get(' }, { color: 'green', text: '"http://10.0.0.11"' }, { color: 'text', text: ') ' }, { color: 'dim', text: '# send the GET, keep the response' }] },
        { parts: [{ color: 'cyan', text: 'r.status_code' }, { color: 'dim', text: '        # 200 (the HTTP code)' }] },
        { parts: [{ color: 'cyan', text: 'r.headers["Server"]' }, { color: 'dim', text: '  # Apache/2.4.41 (the headers)' }] },
        { parts: [{ color: 'cyan', text: 'r.text' }, { color: 'dim', text: '               # the page\'s HTML body' }] },
        { color: 'dim', text: '# requests.post(url, data={...}) sends form data' },
        { color: 'dim', text: '# s = requests.Session() keeps cookies — like a browser that stays logged in' },
      ],
      capsule1: { label: 'r.status_code / r.text', value: 'code and body' },
      capsule2: { label: 'requests.post', value: 'sends data/logins' },
      capsule3: { label: 'requests.Session()', value: 'keeps cookies' },
    },
    s3: {
      title: <>BRUTE FORCE: <span style={{ color: THEME.cyan }}>DECIDE BY THE RESPONSE</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 brute.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' pwd ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' [' }, { color: 'green', text: '"123456"' }, { color: 'text', text: ', ' }, { color: 'green', text: '"admin"' }, { color: 'text', text: ', ' }, { color: 'green', text: '"toor"' }, { color: 'text', text: ', ' }, { color: 'green', text: '"secret"' }, { color: 'text', text: ']:' }] },
        { parts: [{ color: 'text', text: '    r = requests.post(url, data={"user": "admin", "pass": pwd})' }] },
        { parts: [{ color: 'cyan', text: '    if ' }, { color: 'green', text: '"welcome" ' }, { color: 'cyan', text: 'in ' }, { color: 'text', text: 'r.text.lower() ' }, { color: 'cyan', text: 'or ' }, { color: 'text', text: 'r.status_code == ' }, { color: 'amber', text: '302' }, { color: 'cyan', text: ':' }] },
        { parts: [{ color: 'text', text: '        print(f"[+] Valid credential: admin:{pwd}")' }] },
        { parts: [{ color: 'cyan', text: '        break' }] },
        { color: 'dim', text: '[-] admin:123456 -> failed  [-] admin:admin -> failed' },
        { color: 'green', text: '[+] Valid credential: admin:toor' },
      ],
      capsule1: { label: '"welcome" in r.text', value: 'detect success' },
      capsule2: { label: 'status_code == 302', value: 'detect a redirect' },
      capsule3: { label: 'real wordlist', value: 'brute-forcer / fuzzer' },
      extraReveal: 'the same pattern works for discovering directories with GET and status codes',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5, 9] },
    s2: { terminalDelay: 1.5, capsule1Delay: 6, capsule2Delay: 10, capsule3Delay: 14 },
    s3: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 8, capsule3Delay: 13 },
  },
  en: {
    s1: { capsuleDelay: 4.1, points: [10.1, 14.1] },
    s2: { terminalDelay: 3.8, capsule1Delay: 10.0, capsule2Delay: 16.2, capsule3Delay: 17.8 },
    s3: { terminalDelay: 1.7, capsule1Delay: 8.3, capsule2Delay: 9.6, capsule3Delay: 21.3, extraRevealAt: 18.7 },
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
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.amber} delay={Math.round(b.capsule3Delay * fps)} size={16} />
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
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.green} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.cyan} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.red} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Py05HttpRequests: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
