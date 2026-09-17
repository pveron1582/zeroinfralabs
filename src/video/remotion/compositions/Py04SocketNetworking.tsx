// ── video/remotion/compositions/Py04SocketNetworking.tsx ─────────
// Video: pentesting I — redes con socket (scanner de puertos).
// Clase 4 de Scripting/Python (lección python-04). Guiones: voicebox-scripts/py-04-*.txt
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

const VID = 'py-04-socket-networking';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>UN SCANNER <span style={{ color: THEME.red }}>DE PUERTOS</span> EN PYTHON</>,
      subtitle: 'El primer script de red de todo pentester: objetivo 10.0.0.11',
      capsuleLabel: 'conexión directa',
      capsuleValue: 'conectar es la base de todo',
      points: ['Escribís el script y descubrís qué puertos están abiertos', 'Entender sockets TCP/UDP te permite programar tus propias herramientas'],
    },
    s2: {
      title: <>BANNER GRABBING: <span style={{ color: THEME.green }}>IDENTIFICAR SERVICIOS</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 banner.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' socket' }] },
        { parts: [{ color: 'text', text: 's = socket.socket()' }] },
        { parts: [{ color: 'text', text: 's.connect((' }, { color: 'green', text: '"10.0.0.11"' }, { color: 'text', text: ', ' }, { color: 'amber', text: '21' }, { color: 'text', text: ')) ' }, { color: 'dim', text: '# Paso 1: Conectar al puerto' }] },
        { parts: [{ color: 'cyan', text: 'banner = s.recv(1024).decode()' }, { color: 'dim', text: '    # Paso 2: Leer el saludo/versión' }] },
        { parts: [{ color: 'text', text: 'print(f"[+] Banner: {banner.strip()}")' }] },
        { color: 'green', text: '[+] Banner: 220 ProFTPD 1.3.5 Server ready.' },
      ],
      capsule1: { label: 's.connect((host, port))', value: 'conectar socket' },
      capsule2: { label: 's.recv(1024)', value: 'leer banner' },
      capsule3: { label: 'servicio y versión', value: 'elegir exploit' },
    },
    s3: {
      title: <>ESCÁNER ROBUSTO CON <span style={{ color: THEME.cyan }}>TRY / EXCEPT</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 scan.py 10.0.0.11',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' socket, sys' }] },
        { parts: [{ color: 'text', text: 'host = sys.argv[1] ' }, { color: 'dim', text: '# Argumento del host objetivo' }] },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' p ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' [21, 22, 80, 445]:' }] },
        { parts: [{ color: 'cyan', text: '    try:' }] },
        { parts: [{ color: 'text', text: '        s = socket.socket(); s.settimeout(0.5) ' }, { color: 'dim', text: '# Velocidad sin bloqueos' }] },
        { parts: [{ color: 'text', text: '        if s.connect_ex((host, p)) == 0: print(f"[+] {host}:{p} ABIERTO")' }] },
        { parts: [{ color: 'text', text: '        s.close()' }] },
        { parts: [{ color: 'cyan', text: '    except:' }, { color: 'text', text: ' ' }, { color: 'dim', text: 'pass # El timeout no tumba toda la corrida' }] },
      ],
      capsule1: { label: 'sys.argv[1]', value: 'objetivo CLI' },
      capsule2: { label: 'settimeout(0.5)', value: 'alta velocidad' },
      capsule3: { label: 'try / except', value: 'herramienta real' },
      extraReveal: "one closed port doesn't bring down the whole run — that's the difference between a demo and a tool",
    },
  },
  en: {
    s1: {
      title: <>A <span style={{ color: THEME.red }}>PORT SCANNER</span> IN PYTHON</>,
      subtitle: 'now, for real — the lab target is waiting',
      capsuleLabel: 'connecting to a port',
      capsuleValue: 'the foundation of everything',
      points: ['write the script, run it, and see which doors it has open', 'the first network script every pentester builds'],
    },
    s2: {
      title: <>BANNER GRABBING: <span style={{ color: THEME.green }}>IDENTIFYING SERVICES</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 banner.py',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' socket' }] },
        { parts: [{ color: 'text', text: 's = socket.socket()' }] },
        { parts: [{ color: 'text', text: 's.connect((' }, { color: 'green', text: '"10.0.0.11"' }, { color: 'text', text: ', ' }, { color: 'amber', text: '21' }, { color: 'text', text: ')) ' }, { color: 'dim', text: '# Step 1: connect to the port' }] },
        { parts: [{ color: 'cyan', text: 'banner = s.recv(1024).decode()' }, { color: 'dim', text: '    # Step 2: read the greeting/version' }] },
        { parts: [{ color: 'text', text: 'print(f"[+] Banner: {banner.strip()}")' }] },
        { color: 'green', text: '[+] Banner: 220 ProFTPD 1.3.5 Server ready.' },
      ],
      capsule1: { label: 's.connect((host, port))', value: 'connect the socket' },
      capsule2: { label: 's.recv(1024)', value: 'read the banner' },
      capsule3: { label: 'service + version', value: 'pick an exploit' },
      extraReveal: 'FTP greets you, SSH sends its version — the data you\'re after',
    },
    s3: {
      title: <>A ROBUST SCANNER WITH <span style={{ color: THEME.cyan }}>TRY / EXCEPT</span></>,
      terminalTitle: 'kali@attacker-01:~$ python3 scan.py 10.0.0.11',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'import' }, { color: 'text', text: ' socket, sys' }] },
        { parts: [{ color: 'text', text: 'host = sys.argv[1] ' }, { color: 'dim', text: '# the target host argument' }] },
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' p ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' [21, 22, 80, 445]:' }] },
        { parts: [{ color: 'cyan', text: '    try:' }] },
        { parts: [{ color: 'text', text: '        s = socket.socket(); s.settimeout(0.5) ' }, { color: 'dim', text: '# dial in the speed' }] },
        { parts: [{ color: 'text', text: '        if s.connect_ex((host, p)) == 0: print(f"[+] {host}:{p} OPEN")' }] },
        { parts: [{ color: 'text', text: '        s.close()' }] },
        { parts: [{ color: 'cyan', text: '    except:' }, { color: 'text', text: ' ' }, { color: 'dim', text: 'pass # the timeout doesn\'t bring down the run' }] },
      ],
      capsule1: { label: 'sys.argv[1]', value: 'CLI target' },
      capsule2: { label: 'settimeout(0.5)', value: 'dial in the speed' },
      capsule3: { label: 'try / except', value: 'a real tool' },
      extraReveal: "one closed port doesn't bring down the whole run — that's the difference between a demo and a tool",
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5, 9] },
    s2: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 7.5, capsule3Delay: 11 },
    s3: { terminalDelay: 1.5, capsule1Delay: 3.5, capsule2Delay: 7.5, capsule3Delay: 11.5 },
  },
  en: {
    s1: { capsuleDelay: 16.1, points: [6.5, 10.9] },
    s2: { terminalDelay: 0.5, capsule1Delay: 0.5, capsule2Delay: 5.4, capsule3Delay: 13.3, extraRevealAt: 10.0 },
    s3: { terminalDelay: 1.6, capsule1Delay: 2.6, capsule2Delay: 10.2, capsule3Delay: 7.6, extraRevealAt: 13.3 },
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
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.red} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
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
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.green} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.green}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Py04SocketNetworking: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/py-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
