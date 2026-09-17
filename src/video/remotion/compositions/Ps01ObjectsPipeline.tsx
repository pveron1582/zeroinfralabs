// ── video/remotion/compositions/Ps01ObjectsPipeline.tsx ──────────
// Video: qué es PowerShell — objetos, no texto.
// Clase 1 de Scripting/PowerShell (lección powershell-01). Guiones: voicebox-scripts/ps-01-*.txt
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

const VID = 'ps-01-objects-pipeline';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>POWERSHELL: <span style={{ color: THEME.red }}>OBJETOS, NO TEXTO</span></>,
      subtitle: 'La shell oficial de Windows y el lenguaje estándar de post-explotación',
      capsuleLabel: 'el pipeline',
      capsuleValue: 'pasa objetos con propiedades',
      points: ['En vez de parsear líneas con grep/awk, accedes a campos', 'Manipulación directa de procesos, servicios y registros'],
    },
    s2: {
      title: <>CMDLETS: <span style={{ color: THEME.green }}>VERBO-SUSTANTIVO</span></>,
      terminalTitle: 'PS C:\\> Get-Process | Sort-Object CPU -Descending',
      terminalContent: [
        { parts: [{ color: 'dim', text: 'PS C:\\> ' }, { color: 'cyan', text: 'Get-Process' }, { color: 'text', text: ' | ' }, { color: 'cyan', text: 'Sort-Object' }, { color: 'text', text: ' CPU -Descending | ' }, { color: 'cyan', text: 'Select-Object' }, { color: 'text', text: ' -First 3 Name, CPU' }] },
        { color: 'text', text: 'Name            CPU' },
        { color: 'dim', text: '----            ---' },
        { color: 'amber', text: 'lsass          142.50' },
        { color: 'amber', text: 'svchost         98.12' },
        { color: 'green', text: 'powershell      45.60' },
      ],
      capsule1: { label: 'Get-Process / Get-Service', value: 'Verbo-Sustantivo' },
      capsule2: { label: 'Sort-Object CPU', value: 'ordena por propiedad' },
      capsule3: { label: 'Where / Select-Object', value: 'filtra y proyecta' },
    },
    s3: {
      title: <>SCRIPTS <span style={{ color: THEME.cyan }}>.PS1</span> Y EXECUTION POLICY</>,
      terminalTitle: 'PS C:\\> powershell -ep bypass -File .\\recon.ps1',
      terminalContent: [
        { parts: [{ color: 'dim', text: 'PS C:\\> ' }, { color: 'text', text: '.\\recon.ps1' }] },
        { color: 'red', text: 'File C:\\recon.ps1 cannot be loaded because running scripts is disabled.' },
        { color: 'dim', text: '# Saltear restricción en ejecución de pentest:' },
        { parts: [{ color: 'dim', text: 'PS C:\\> ' }, { color: 'green', text: 'powershell -ep bypass -File .\\recon.ps1' }] },
        { color: 'green', text: '[*] Script ejecutado exitosamente con privilegios del usuario' },
      ],
      capsule1: { label: '.\\script.ps1', value: 'script de PowerShell' },
      capsule2: { label: 'Execution Policy', value: 'bloqueo por defecto' },
      capsule3: { label: '-ep bypass', value: 'flag clave en pentest' },
    },
  },
  en: {
    s1: {
      title: <>POWERSHELL: <span style={{ color: THEME.red }}>OBJECTS, NOT TEXT</span></>,
      subtitle: "the system's official shell — it ships with every modern Windows",
      capsuleLabel: 'the pipeline',
      capsuleValue: 'passes objects, not text',
      points: ['that changes everything: no more parsing lines with grep and awk', 'you manipulate objects with their properties directly'],
    },
    s2: {
      title: <>CMDLETS: <span style={{ color: THEME.green }}>VERB-DASH-NOUN</span></>,
      terminalTitle: 'PS C:\\> Get-Process | Sort-Object CPU -Descending',
      terminalContent: [
        { parts: [{ color: 'dim', text: 'PS C:\\> ' }, { color: 'cyan', text: 'Get-Process' }, { color: 'text', text: ' | ' }, { color: 'cyan', text: 'Sort-Object' }, { color: 'text', text: ' CPU -Descending | ' }, { color: 'cyan', text: 'Select-Object' }, { color: 'text', text: ' -First 3 Name, CPU' }] },
        { color: 'text', text: 'Name            CPU' },
        { color: 'dim', text: '----            ---' },
        { color: 'amber', text: 'lsass          142.50' },
        { color: 'amber', text: 'svchost         98.12' },
        { color: 'green', text: 'powershell      45.60' },
      ],
      capsule1: { label: 'Get-Process / Set-Item', value: 'Verb-Noun' },
      capsule2: { label: 'Sort-Object CPU', value: 'sorts by property' },
      capsule3: { label: 'Where / Select-Object', value: 'filter and pick fields' },
      extraReveal: "in bash you'd parse text · here you manipulate objects directly",
    },
    s3: {
      title: <><span style={{ color: THEME.cyan }}>.PS1</span> SCRIPTS AND EXECUTION POLICY</>,
      terminalTitle: 'PS C:\\> powershell -ep bypass -File .\\recon.ps1',
      terminalContent: [
        { parts: [{ color: 'dim', text: 'PS C:\\> ' }, { color: 'text', text: '.\\recon.ps1' }] },
        { color: 'red', text: 'File C:\\recon.ps1 cannot be loaded because running scripts is disabled.' },
        { color: 'dim', text: '# Bypass the restriction for a pentest run:' },
        { parts: [{ color: 'dim', text: 'PS C:\\> ' }, { color: 'green', text: 'powershell -ep bypass -File .\\recon.ps1' }] },
        { color: 'green', text: '[*] Script ran successfully with the user\'s privileges' },
      ],
      capsule1: { label: '.\\script.ps1', value: 'PowerShell script' },
      capsule2: { label: 'Execution Policy', value: 'blocks by default' },
      capsule3: { label: '-ep bypass', value: 'the key pentest flag' },
      extraReveal: "you'll see that flag constantly in pentest guides — the first thing attackers use to run their tools",
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 2.5, points: [5.5, 10] },
    s2: { terminalDelay: 1.5, capsule1Delay: 4, capsule2Delay: 9, capsule3Delay: 14 },
    s3: { terminalDelay: 1.5, capsule1Delay: 3.5, capsule2Delay: 7.5, capsule3Delay: 12 },
  },
  en: {
    s1: { capsuleDelay: 12.0, points: [15.4, 20.8] },
    s2: { terminalDelay: 1.4, capsule1Delay: 3.4, capsule2Delay: 14.1, capsule3Delay: 19.6, extraRevealAt: 23.6 },
    s3: { terminalDelay: 10.0, capsule1Delay: 3.6, capsule2Delay: 10.0, capsule3Delay: 13.4, extraRevealAt: 18.8 },
  },
};

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
    <TerminalWindow title={c.terminalTitle} width={960} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        {c.terminalContent.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            {'parts' in line ? (
              line.parts!.map((p: { color: string; text: string }, j: number) => (
                <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>
              ))
            ) : (
              <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.green} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.red}>{(c as any).extraReveal}</RevealLine>
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
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.65 }}>
        {c.terminalContent.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            {'parts' in line ? (
              line.parts!.map((p: { color: string; text: string }, j: number) => (
                <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>
              ))
            ) : (
              <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.red} delay={Math.round(b.capsule2Delay * fps)} size={16} />
      <KeyCapsule label={c.capsule3.label} value={c.capsule3.value} accent={THEME.green} delay={Math.round(b.capsule3Delay * fps)} size={16} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 14, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Ps01ObjectsPipeline: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ps-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
