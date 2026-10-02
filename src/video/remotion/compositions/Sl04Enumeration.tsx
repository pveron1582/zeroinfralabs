// ── video/remotion/compositions/Sl04Enumeration.tsx ──────────────
// Video: pentesting I — enumeración con bash.
// Clase 4 de Scripting/Bash (lección bash-04). Guiones: voicebox-scripts/{es,en}/bash/bash-04-*.txt
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

const VID = 'bash-04-enumeration';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>ENUMERACIÓN: <span style={{ color: THEME.red }}>EL PRIMER CASO REAL</span></>,
      steps: [
        { mark: '1', color: THEME.cyan, text: 'ping sweep → hosts vivos' },
        { mark: '2', color: THEME.amber, text: 'nmap → escaneás el interesante' },
        { mark: '3', color: THEME.green, text: 'grep/awk → parseás el resultado' },
        { mark: '4', color: THEME.cyan, text: 'curl -sI → revisás la web' },
      ],
      footer: 'en segundos, lo que a mano tardaría diez minutos',
    },
    s2: {
      title: <>RECON: <span style={{ color: THEME.green }}>ESCANEÁ UNA VEZ, PARSEÁ MUCHAS</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano recon.sh',
      terminalLines: [
        { color: 'green', text: '#!/bin/bash' },
        { color: 'text', text: 'host=$1' },
        { color: 'text', text: 'nmap -sV -oG /tmp/scan.txt "$host"' },
        { color: 'text', text: 'echo "Puertos abiertos:"' },
        { color: 'text', text: 'grep "open" /tmp/scan.txt | grep -oP "[0-9]+/tcp" | cut -d/ -f1' },
        { color: 'amber', text: 'Puertos abiertos:  21  22  80' },
      ],
      capsule1: { label: 'nmap -oG', value: 'salida grepable' },
      capsule2: { label: 'grep + cut', value: 'solo los puertos' },
    },
    s3: {
      title: <>PARSEAR BIEN: <span style={{ color: THEME.cyan }}>LA REGLA DE ORO</span></>,
      points: [
        { color: THEME.cyan, text: 'nmap -oG: una línea por host con sus puertos' },
        { color: THEME.amber, text: 'curl -sI: Server y X-Powered-By revelan el stack' },
        { color: THEME.green, text: 'grep -oP + cut: extraés solo los números de puerto' },
      ],
      footer: 'guardás la salida una vez, y la parseás todas las que quieras',
    },
  },
  en: {
    s1: {
      title: <>ENUMERATION: <span style={{ color: THEME.red }}>THE FIRST REAL CASE</span></>,
      steps: [
        { mark: '1', color: THEME.cyan, text: 'ping sweep → find the live hosts' },
        { mark: '2', color: THEME.amber, text: 'see which ports they have open and what services run behind them' },
        { mark: '3', color: THEME.green, text: 'write it once, run it against the whole network' },
      ],
      footer: 'gathers in seconds what would take you 10 minutes by hand — the script every pentester builds first',
    },
    s2: {
      title: <>RECON: <span style={{ color: THEME.green }}>THE FOUR-STEP FLOW</span></>,
      isFourStep: true,
      fourStepLines: [
        { mark: '1', color: THEME.cyan, text: 'ping sweep → live hosts' },
        { mark: '2', color: THEME.amber, text: 'nmap → scan the one you care about' },
        { mark: '3', color: THEME.green, text: 'grep + awk → keep the important parts' },
        { mark: '4', color: THEME.cyan, text: 'curl -si → the headers' },
      ],
      terminalTitle: 'kali@attacker-01:~$ nano recon.sh',
      terminalLines: [
        { color: 'green', text: '#!/bin/bash' },
        { color: 'text', text: 'host=$1' },
        { color: 'text', text: 'nmap -sV -oG /tmp/scan.txt "$host"' },
        { color: 'text', text: 'grep "open" /tmp/scan.txt | grep -oP "[0-9]+/tcp" | cut -d/ -f1' },
        { color: 'amber', text: 'Open ports:  21  22  80' },
      ],
      extraReveal: 'chains the four steps, prints a clean summary — the one you later turn into your report',
    },
    s3: {
      title: <>PARSE IT WELL: <span style={{ color: THEME.cyan }}>THE GOLDEN RULE</span></>,
      points: [
        { color: THEME.cyan, text: 'nmap -oG: greppable format — one line per host, perfect for awk' },
        { color: THEME.amber, text: 'curl -sI: Server and X-Powered-By reveal the running stack' },
        { color: THEME.green, text: 'grep -oP + cut: extract just the port numbers' },
        { mark: '★', color: THEME.amber, text: 'scan once, save the output, parse it as many times as you want — reusable for every host' },
      ],
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { points: [3, 7, 11, 15] },
    s2: { terminalDelay: 2.5, capsule1Delay: 11, capsule2Delay: 16 },
    s3: { points: [3, 8, 13] },
  },
  en: {
    s1: { points: [8.7, 10.2, 16.4] },
    s2: { fourStepPoints: [2.0, 4.9, 7.9, 12.3], terminalDelay: 14.1, extraRevealAt: 19.5 },
    s3: { points: [2.1, 9.8, 16.4, 20.9] },
  },
};

// ── Scene 1 ─────────────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.title}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.steps.map((step, i) => (
        <RevealLine key={i} at={b.points[i]} fps={fps} mark={step.mark} color={step.color}>{step.text}</RevealLine>
      ))}
    </div>
    <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Scene 2 ─────────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.title}
    </div>
    {'isFourStep' in c && c.isFourStep ? (
      <>
        <div style={{ width: 980, textAlign: 'left' }}>
          {(c as any).fourStepLines.map((step: any, i: number) => (
            <RevealLine key={i} at={(b as any).fourStepPoints[i]} fps={fps} mark={step.mark} color={step.color}>{step.text}</RevealLine>
          ))}
        </div>
        <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round((b as any).terminalDelay * fps)}>
          <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
            {c.terminalLines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && '\n'}
                <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
              </React.Fragment>
            ))}
          </div>
        </TerminalWindow>
        {'extraReveal' in c && (
          <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
            <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
          </div>
        )}
      </>
    ) : (
      <>
        <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
          <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
            {c.terminalLines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && '\n'}
                <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
              </React.Fragment>
            ))}
          </div>
        </TerminalWindow>
        <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
          <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.cyan} delay={Math.round(b.capsule1Delay * fps)} size={20} />
          <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.green} delay={Math.round(b.capsule2Delay * fps)} size={20} />
        </div>
      </>
    )}
  </AbsoluteFill>
);

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.title}
    </div>
    <div style={{ width: 980, textAlign: 'left' }}>
      {c.points.map((point, i) => (
        <RevealLine key={i} at={b.points[i]} fps={fps} mark={'mark' in point ? (point as { mark: string }).mark : '▸'} color={(point as { color: string }).color}>{point.text}</RevealLine>
      ))}
    </div>
    {'footer' in c && (
      <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
        {c.footer}
      </div>
    )}
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Sl04Enumeration: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2 as typeof COPY.es.s2} b={b.s2 as typeof BEATS.es.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/bash-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3 as typeof COPY.es.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
