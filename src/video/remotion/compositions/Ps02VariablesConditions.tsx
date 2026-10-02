// ── video/remotion/compositions/Ps02VariablesConditions.tsx ──────
// Video: variables, arrays y condiciones.
// Clase 2 de Scripting/PowerShell (lección powershell-02). Guiones: voicebox-scripts/{es,en}/powershell/powershell-02-*.txt
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
  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center',
};

const VID = 'powershell-02-variables-conditionals';

const COPY = {
  es: {
    s1: {
      title: <>VARIABLES, <span style={{ color: THEME.red }}>ARRAYS Y CONDICIONES</span></>,
      subtitle: 'Sintaxis orientada a objetos nacida directamente para la consola',
      capsuleLabel: "$nombre = 'kali'",
      capsuleValue: 'variables siempre con $',
      points: ['Arrays y Hashtables para modelar objetivos y credenciales', 'Condicionales potentes para bifurcar la ejecución'],
    },
    s2: {
      title: <>ARRAYS, HASHTABLES E <span style={{ color: THEME.green }}>INTERPOLACIÓN</span></>,
      terminalTitle: 'PS C:\\> .\\estructuras.ps1',
      terminalContent: [
        { color: 'text', text: '$puertos = @(22, 80, 445) ' },
        { color: 'dim', text: '# array explícito @(...)' },
        '\n',
        { color: 'text', text: '$rango = 22..80 ' },
        { color: 'dim', text: '            # rango numérico rápido' },
        '\n',
        { color: 'text', text: '$servidor = @{ ip = "10.0.0.11"; port = 445 } ' },
        { color: 'dim', text: '# hashtable clave/valor' },
        '\n',
        { parts: [{ color: 'cyan', text: '$servidor.ip' }, { color: 'dim', text: '              # 10.0.0.11 (acceso directo a propiedad)' }] },
        '\n',
        { color: 'green', text: '"Conectando a $($servidor.ip) en puerto $($servidor.port)"' },
        '\n',
        { color: 'amber', text: 'Conectando a 10.0.0.11 en puerto 445' },
      ],
      capsule1: { label: '@(22, 80, 445) / 22..80', value: 'arrays y rangos' },
      capsule2: { label: '@{ ip=... }', value: 'hashtable clave:valor' },
      capsule3: { label: '$($obj.prop)', value: 'interpolación' },
    },
    s3: {
      title: <>CONDICIONES Y <span style={{ color: THEME.cyan }}>OPERADORES PALABRA</span></>,
      terminalTitle: 'PS C:\\> .\\evaluar.ps1',
      terminalContent: [
        { color: 'text', text: '$cuenta = "CORP\\admin_pablo"' },
        '\n',
        { parts: [{ color: 'cyan', text: 'if' }, { color: 'text', text: ' ($cuenta ' }, { color: 'green', text: '-like' }, { color: 'amber', text: ' "*admin*"' }, { color: 'text', text: ') {' }] },
        { color: 'text', text: '    Write-Host "[+] Cuenta administrativa detectada"' },
        '\n',
        { parts: [{ color: 'cyan', text: '} elseif' }, { color: 'text', text: ' ($cuenta ' }, { color: 'green', text: '-eq' }, { color: 'amber', text: ' "CORP\\guest"' }, { color: 'cyan', text: ' -or' }, { color: 'text', text: ' $cuenta ' }, { color: 'green', text: '-match' }, { color: 'amber', text: ' "^test"' }, { color: 'text', text: ') {' }] },
        { color: 'text', text: '    Write-Host "[-] Cuenta restringida o temporal"' },
        '\n',
        { parts: [{ color: 'cyan', text: '} else {' }] },
        { color: 'text', text: '    Write-Host "[*] Usuario de dominio estándar"' },
        '\n',
        { color: 'cyan', text: '}' },
      ],
      capsule1: { label: '-eq / -ne / -gt / -lt', value: 'comparación' },
      capsule2: { label: '-and / -or / -not', value: 'lógicos' },
      capsule3: { label: '-like / -match', value: 'comodines y regex' },
    },
  },
  en: {
    s1: {
      title: <>VARIABLES, <span style={{ color: THEME.red }}>ARRAYS AND CONDITIONS</span></>,
      subtitle: 'born with the console in mind — an object-oriented syntax',
      capsuleLabel: "$name = 'kali'",
      capsuleValue: 'variables always with $',
      points: ["arrays, hashtables and conditions build your scripts' logic", 'the same ideas as in bash — but you can filter and transform them'],
    },
    s2: {
      title: <>ARRAYS, HASHTABLES AND <span style={{ color: THEME.green }}>INTERPOLATION</span></>,
      terminalTitle: 'PS C:\\> .\\structures.ps1',
      terminalContent: [
        { color: 'text', text: '$ports = @(22, 80, 445) ' },
        { color: 'dim', text: '# explicit array @(...)' },
        '\n',
        { color: 'text', text: '$range = 22..80 ' },
        { color: 'dim', text: '             # quick numeric range' },
        '\n',
        { color: 'text', text: '$server = @{ ip = "10.0.0.11"; port = 445 } ' },
        { color: 'dim', text: '# hashtable key/value' },
        '\n',
        { parts: [{ color: 'cyan', text: '$server.ip' }, { color: 'dim', text: '              # 10.0.0.11 (direct property access)' }] },
        '\n',
        { color: 'green', text: '"Connecting to $($server.ip) on port $($server.port)"' },
        '\n',
        { color: 'amber', text: 'Connecting to 10.0.0.11 on port 445' },
      ],
      capsule1: { label: '@(22, 80, 445) / 22..80', value: 'arrays and ranges' },
      capsule2: { label: '@{ ip=... }', value: 'hashtable key:value' },
      capsule3: { label: '$($obj.prop)', value: 'interpolation' },
    },
    s3: {
      title: <>CONDITIONS AND <span style={{ color: THEME.cyan }}>WORD OPERATORS</span></>,
      terminalTitle: 'PS C:\\> .\\evaluate.ps1',
      terminalContent: [
        { color: 'text', text: '$account = "CORP\\admin_pablo"' },
        '\n',
        { parts: [{ color: 'cyan', text: 'if' }, { color: 'text', text: ' ($account ' }, { color: 'green', text: '-like' }, { color: 'amber', text: ' "*admin*"' }, { color: 'text', text: ') {' }] },
        { color: 'text', text: '    Write-Host "[+] Administrative account detected"' },
        '\n',
        { parts: [{ color: 'cyan', text: '} elseif' }, { color: 'text', text: ' ($account ' }, { color: 'green', text: '-eq' }, { color: 'amber', text: ' "CORP\\guest"' }, { color: 'cyan', text: ' -or' }, { color: 'text', text: ' $account ' }, { color: 'green', text: '-match' }, { color: 'amber', text: ' "^test"' }, { color: 'text', text: ') {' }] },
        { color: 'text', text: '    Write-Host "[-] Restricted or temporary account"' },
        '\n',
        { parts: [{ color: 'cyan', text: '} else {' }] },
        { color: 'text', text: '    Write-Host "[*] Standard domain user"' },
        '\n',
        { color: 'cyan', text: '}' },
      ],
      capsule1: { label: '-eq / -ne / -gt / -lt', value: 'comparison' },
      capsule2: { label: '-and / -or / -not', value: 'logical' },
      capsule3: { label: '-like / -match', value: 'wildcards and regex' },
      extraReveal: "they're words, not symbols — that's the PowerShell trademark",
    },
  },
};

const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5, 9] },
    s2: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 10, capsule3Delay: 15 },
    s3: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 9, capsule3Delay: 14 },
  },
  en: {
    s1: { capsuleDelay: 2.2, points: [9.3, 16.4] },
    s2: { terminalDelay: 0.6, capsule1Delay: 1.9, capsule2Delay: 9.2, capsule3Delay: 20.3 },
    s3: { terminalDelay: 0.5, capsule1Delay: 5.2, capsule2Delay: 12.5, capsule3Delay: 15.2, extraRevealAt: 22.1 },
  },
};

const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>{c.title}</div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>{c.subtitle}</div>
    <KeyCapsule label={c.capsuleLabel} value={c.capsuleValue} accent={THEME.cyan} delay={Math.round(b.capsuleDelay * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      {c.points.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div style={{ height: 10 }} />}
          <RevealLine at={b.points[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : THEME.green}>{p}</RevealLine>
        </React.Fragment>
      ))}
    </div>
  </AbsoluteFill>
);

const renderTerminal = (lines: any[]) => lines.map((line, i) => {
  if (typeof line === 'string') return <React.Fragment key={i}>{line}</React.Fragment>;
  return (
    <React.Fragment key={i}>
      {i > 0 && line !== '\n' && '\n'}
      {line === '\n' ? '\n' : 'parts' in line
        ? line.parts.map((p: { color: string; text: string }, j: number) => <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>)
        : <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>}
    </React.Fragment>
  );
});

const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>{c.title}</div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalContent)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.amber} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>{c.title}</div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalContent)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.green} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

export const Ps02VariablesConditions: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/powershell-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/powershell-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/powershell-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
