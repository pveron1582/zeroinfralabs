// ── video/remotion/compositions/Ci02HashesCracking.tsx ─────────────
// Video: hashes vs cifrado, algoritmos (MD5/SHA1 rotos, SHA512 $6$,
// bcrypt/argon2 lentos a propósito) y cracking con john + rockyou.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── COPY ────────────────────────────────────────────────────────────
const HASH_POINTS_ES = [
  { text: 'cifrado: reversible con la clave' },
  { text: 'hash: huella de un solo sentido, no se deshashea' },
  { text: 'el servidor guarda la huella, no la contraseña' },
];
const HASH_POINTS_EN = [
  { text: 'encryption: reversible with the key' },
  { text: "hash: a one-way fingerprint, you can't unhash it" },
  { text: "the server stores the fingerprint, not the password" },
];

const ALGOS_ES = [
  { label: 'rotos, evitar', value: 'MD5 · SHA1', accent: THEME.red },
  { label: 'estándar de Linux ($6$)', value: 'SHA512', accent: THEME.green },
  { label: 'lentos a propósito', value: 'bcrypt · argon2', accent: THEME.amber },
];
const ALGOS_EN = [
  { label: 'broken, avoid', value: 'MD5 · SHA1', accent: THEME.red },
  { label: 'Linux standard ($6$)', value: 'SHA512', accent: THEME.green },
  { label: 'slow on purpose', value: 'bcrypt · argon2', accent: THEME.amber },
];

const COPY = {
  es: {
    s1: {
      title: <>HASH <span style={{ color: THEME.amber }}>≠</span> CIFRADO</>,
      subtitle: 'la huella digital de una contraseña',
      heading: '🧬 UNA VÍA, NO DOS',
      hashPoints: HASH_POINTS_ES,
      sameFingerprint: 'misma huella',
    },
    s2: {
      heading: 'EL ALGORITMO <span style={{ color: THEME.purple }}>DECIDE TODO</span>',
      algos: ALGOS_ES,
      footer: <>lento es bueno para contraseñas: <span style={{ color: THEME.amber }}>resiste fuerza bruta</span></>,
    },
    s3: {
      heading: <>CONSEGUÍ EL HASH · <span style={{ color: THEME.amber }}>CRACKEALO</span></>,
      closeTitle: <>CONTRASEÑA DÉBIL = <span style={{ color: THEME.red }}>SEGUNDOS</span></>,
      closeSubtitle: 'el hash es tu huella: conseguilo y crackealo',
      footer: 'rockyou.txt: 14 millones de contraseñas reales filtradas',
    },
  },
  en: {
    s1: {
      title: <>HASH <span style={{ color: THEME.amber }}>≠</span> ENCRYPTION</>,
      subtitle: "a password's fingerprint",
      heading: '🧬 ONE WAY, NOT TWO',
      hashPoints: HASH_POINTS_EN,
      sameFingerprint: 'same fingerprint',
    },
    s2: {
      heading: 'THE ALGORITHM <span style={{ color: THEME.purple }}>DECIDES EVERYTHING</span>',
      algos: ALGOS_EN,
      footer: <>slow is good for passwords: <span style={{ color: THEME.amber }}>it resists brute force</span></>,
    },
    s3: {
      heading: <>GET THE HASH · <span style={{ color: THEME.amber }}>CRACK IT</span></>,
      closeTitle: <>WEAK PASSWORD = <span style={{ color: THEME.red }}>SECONDS</span></>,
      closeSubtitle: 'the hash is the fingerprint: get it and crack it',
      footer: 'rockyou.txt: 14 million real leaked passwords',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { panelAt: 4, points: [8.5, 12.0, 15.0] },
    s2: { algos: [2.5, 7.0, 11.5] },
    s3: { closeAt: 11, terminalDelay: 3 },
  },
  en: {
    s1: { panelAt: 2.8, points: [4.4, 7.7, 10.9] },
    s2: { algos: [1.4, 5.3, 12.0] },
    s3: { closeAt: 13.5, terminalDelay: 4.3 },
  },
};

const VID = 'cyber-02-hashes-cracking';

// ── Scene 1: hash no es cifrado ─────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                {c.heading}
              </div>
              {c.hashPoints.map((p, i) => (
                <RevealLine key={i} at={b.points[i]} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="kali@attacker-01:~$" width={520}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
                <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> echo -n "password123" | sha512sum
                {'\n'}<span style={{ color: THEME.amber }}>$6$</span>rounds=656000$5s8VJ... <span style={{ color: THEME.dim }}>^</span>
                {'\n\n'}<span style={{ color: THEME.green }}>kali@attacker-01:~$</span> echo -n "password123" | sha512sum
                {'\n'}<span style={{ color: THEME.amber }}>$6$</span>rounds=656000$5s8VJ... <span style={{ color: THEME.dim }}>{c.sameFingerprint}</span>
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: algoritmos ─────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
      <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 980 }}>
        {c.algos.map((a, i) => (
          <KeyCapsule key={a.value} label={a.label} value={a.value} accent={a.accent} delay={Math.round(b.algos[i] * fps)} size={26} />
        ))}
      </div>
      <div style={{ marginTop: 34, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
        {c.footer}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: john the ripper + cierre ───────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={760} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> john hash.txt --wordlist=rockyou.txt
              {'\n'}Loaded 1 password hash (sha512crypt)
              {'\n'}Press q to abort
              {'\n'}<span style={{ color: THEME.amber }}>password123      (admin)</span>
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 22, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Ci02HashesCracking: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: hash no es cifrado */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/cyber-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: algoritmos */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/cyber-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: john + cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/cyber-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
