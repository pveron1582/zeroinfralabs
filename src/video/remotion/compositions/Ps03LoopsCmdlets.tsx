// ── video/remotion/compositions/Ps03LoopsCmdlets.tsx ─────────────
// Video: bucles, funciones y cmdlets útiles.
// Clase 3 de Scripting/PowerShell (lección powershell-03).
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

const CENTERED: React.CSSProperties = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' };
const VID = 'ps-03-loops-cmdlets';

const COPY = {
  es: {
    s1: {
      title: <>BUCLES, <span style={{ color: THEME.red }}>FUNCIONES Y CMDLETS</span></>,
      subtitle: 'Automatización de tareas de administración y vectores de ataque',
      capsuleLabel: 'potencia de objetos', capsuleValue: 'filtrar y transformar en el pipe',
      points: ['Cada elemento del pipeline es un objeto con propiedades', 'Las piezas fundamentales que más vas a usar en scripts'],
    },
    s2: {
      title: <>BUCLES Y <span style={{ color: THEME.green }}>$_ (OBJETO ACTUAL)</span></>,
      terminalTitle: 'PS C:\\> .\\bucles.ps1',
      terminalContent: [
        { color: 'dim', text: '# 1. Bucle foreach sobre una lista' },
        '\n',
        { parts: [{ color: 'cyan', text: 'foreach' }, { color: 'text', text: ' ($p ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' @(21, 22, 80, 445)) { ' }, { color: 'green', text: '"Puerto: $p"' }, { color: 'text', text: ' }' }] },
        '\n',
        { color: 'dim', text: '# 2. Pipeline ForEach-Object con $_ (la estrella)' },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-Process' }, { color: 'text', text: ' | ' }, { color: 'cyan', text: 'ForEach-Object' }, { color: 'text', text: ' { ' }, { color: 'amber', text: '$_.Name' }, { color: 'text', text: ' } ' }, { color: 'dim', text: '# extrae el nombre de cada proceso' }] },
        '\n',
        { color: 'dim', text: '# 3. For numérico y While con condición' },
        '\n',
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' ($i=1; $i -le 254; $i++) { ' }, { color: 'green', text: '"192.168.1.$i"' }, { color: 'text', text: ' }' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'while' }, { color: 'text', text: ' ($true) { $res = Escuchar(); ' }, { color: 'cyan', text: 'if' }, { color: 'text', text: ' ($res) { ' }, { color: 'red', text: 'break' }, { color: 'text', text: ' } }' }] },
      ],
      capsule1: { label: 'foreach ($x in $list)', value: 'itera colección' },
      capsule2: { label: 'ForEach-Object { $_ }', value: 'objeto actual en pipe' },
      capsule3: { label: 'for / while ($cond)', value: 'rangos y control' },
    },
    s3: {
      title: <>FUNCIONES Y <span style={{ color: THEME.cyan }}>CMDLETS ESENCIALES</span></>,
      terminalTitle: 'PS C:\\> .\\funciones.ps1',
      terminalContent: [
        { parts: [{ color: 'cyan', text: 'function' }, { color: 'green', text: ' Escanear' }, { color: 'text', text: ' {' }] },
        '\n',
        { parts: [{ color: 'cyan', text: '    param' }, { color: 'text', text: '($host, $puerto)' }] },
        '\n',
        { color: 'dim', text: '    # I/O: Get-Content lee | Out-File escribe | Add-Content agrega' },
        '\n',
        { color: 'dim', text: '    # HTTP y APIs: Invoke-WebRequest (iwr) y ConvertTo/From-Json' },
        '\n',
        { parts: [{ color: 'text', text: '    $api = ' }, { color: 'cyan', text: 'Invoke-WebRequest' }, { color: 'green', text: ' "http://$host/api"' }, { color: 'text', text: ' | ' }, { color: 'cyan', text: 'ConvertFrom-Json' }] },
        '\n',
        { color: 'text', text: '}' },
      ],
      capsule1: { label: 'function F { param() }', value: 'define funciones' },
      capsule2: { label: 'Get-Content / Out-File', value: 'lectura y escritura' },
      capsule3: { label: 'iwr / ConvertTo-Json', value: 'HTTP y serialización' },
    },
  },
  en: {
    s1: {
      title: <>LOOPS, <span style={{ color: THEME.red }}>FUNCTIONS AND CMDLETS</span></>,
      subtitle: 'automate almost any admin task — and attack tasks too',
      capsuleLabel: 'power of objects', capsuleValue: 'filter and transform in the pipe',
      points: ['every element of the pipeline is something with properties', 'the same idea as in bash — but you can filter and transform them'],
    },
    s2: {
      title: <>LOOPS AND <span style={{ color: THEME.green }}>$_ (THE CURRENT OBJECT)</span></>,
      terminalTitle: 'PS C:\\> .\\loops.ps1',
      terminalContent: [
        { color: 'dim', text: '# 1. foreach loop over a collection' },
        '\n',
        { parts: [{ color: 'cyan', text: 'foreach' }, { color: 'text', text: ' ($p ' }, { color: 'cyan', text: 'in' }, { color: 'text', text: ' @(21, 22, 80, 445)) { ' }, { color: 'green', text: '"Port: $p"' }, { color: 'text', text: ' }' }] },
        '\n',
        { color: 'dim', text: '# 2. Pipeline ForEach-Object with $_ (the star)' },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-Process' }, { color: 'text', text: ' | ' }, { color: 'cyan', text: 'ForEach-Object' }, { color: 'text', text: ' { ' }, { color: 'amber', text: '$_.Name' }, { color: 'text', text: ' } ' }, { color: 'dim', text: "# each process's name" }] },
        '\n',
        { color: 'dim', text: '# 3. Numeric for and a while with a condition' },
        '\n',
        { parts: [{ color: 'cyan', text: 'for' }, { color: 'text', text: ' ($i=1; $i -le 254; $i++) { ' }, { color: 'green', text: '"192.168.1.$i"' }, { color: 'text', text: ' }' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'while' }, { color: 'text', text: ' ($true) { $res = Listen(); ' }, { color: 'cyan', text: 'if' }, { color: 'text', text: ' ($res) { ' }, { color: 'red', text: 'break' }, { color: 'text', text: ' } }' }] },
      ],
      capsule1: { label: 'foreach ($x in $list)', value: 'iterates a collection' },
      capsule2: { label: 'ForEach-Object { $_ }', value: 'current object in the pipe' },
      capsule3: { label: 'for / while ($cond)', value: 'ranges and control' },
    },
    s3: {
      title: <>FUNCTIONS AND <span style={{ color: THEME.cyan }}>ESSENTIAL CMDLETS</span></>,
      terminalTitle: 'PS C:\\> .\\functions.ps1',
      terminalContent: [
        { parts: [{ color: 'cyan', text: 'function' }, { color: 'green', text: ' Scan' }, { color: 'text', text: ' {' }] },
        '\n',
        { parts: [{ color: 'cyan', text: '    param' }, { color: 'text', text: '($host, $port)' }] },
        '\n',
        { color: 'dim', text: '    # I/O: Get-Content reads | Out-File writes | Add-Content appends' },
        '\n',
        { color: 'dim', text: '    # HTTP and APIs: Invoke-WebRequest (iwr) and ConvertTo/From-Json' },
        '\n',
        { parts: [{ color: 'text', text: '    $api = ' }, { color: 'cyan', text: 'Invoke-WebRequest' }, { color: 'green', text: ' "http://$host/api"' }, { color: 'text', text: ' | ' }, { color: 'cyan', text: 'ConvertFrom-Json' }] },
        '\n',
        { color: 'text', text: '}' },
      ],
      capsule1: { label: 'function F { param() }', value: 'group logic' },
      capsule2: { label: 'Get-Content / Out-File', value: 'read and write' },
      capsule3: { label: 'iwr / ConvertTo-Json', value: 'HTTP and serialization — perfect for APIs' },
    },
  },
};

const BEATS = {
  es: { s1: { capsuleDelay: 2.5, points: [5, 9] }, s2: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 8.5, capsule3Delay: 14 }, s3: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 8, capsule3Delay: 13 } },
  en: { s1: { capsuleDelay: 11.7, points: [13.4, 16.1] }, s2: { terminalDelay: 0.5, capsule1Delay: 1.0, capsule2Delay: 10.4, capsule3Delay: 20.8 }, s3: { terminalDelay: 1.9, capsule1Delay: 0.5, capsule2Delay: 8.8, capsule3Delay: 13.9 } },
};

const renderTerminal = (lines: any[]) => lines.map((line, i) => {
  if (typeof line === 'string') return <React.Fragment key={i}>{line}</React.Fragment>;
  return (
    <React.Fragment key={i}>
      {i > 0 && line !== '\n' && '\n'}
      {line === '\n' ? '\n' : 'parts' in line
        ? line.parts.map((p: any, j: number) => <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>)
        : <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>}
    </React.Fragment>
  );
});

const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 32, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>{c.title}</div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>{c.subtitle}</div>
    <KeyCapsule label={c.capsuleLabel} value={c.capsuleValue} accent={THEME.cyan} delay={Math.round(b.capsuleDelay * fps)} size={24} />
    <div style={{ marginTop: 24, fontSize: 17, color: THEME.muted, fontFamily: MONO, textAlign: 'left', width: 780 }}>
      {c.points.map((p, i) => (<React.Fragment key={i}>{i > 0 && <div style={{ height: 10 }} />}<RevealLine at={b.points[i]} fps={fps} mark="▸" color={i === 0 ? THEME.cyan : THEME.green}>{p}</RevealLine></React.Fragment>))}
    </div>
  </AbsoluteFill>
);

const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>{c.title}</div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalContent)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
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
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.purple} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps03LoopsCmdlets: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang]; const b = BEATS[lang];
  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps); const dur2 = Math.ceil(s2 * fps); const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);
  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>{hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-03-scene1.wav`)} />}<Scene1 fps={fps} c={c.s1} b={b.s1} /></Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>{hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-03-scene2.wav`)} />}<Scene2 fps={fps} c={c.s2} b={b.s2} /></Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>{hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-03-scene3.wav`)} />}<Scene3 fps={fps} c={c.s3} b={b.s3} /></Sequence>
    </AbsoluteFill>
  );
};
