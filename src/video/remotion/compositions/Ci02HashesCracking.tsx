// ── video/remotion/compositions/Ci02HashesCracking.tsx ─────────────
// Video: hashes vs cifrado, algoritmos (MD5/SHA1 rotos, SHA512 $6$,
// bcrypt/argon2 lentos a propósito) y cracking con john + rockyou.
// Con audio de la voz "Miguel" (3 escenas, ~47s).
// ⚠️ TIMINGS ESTIMADOS: se reemplazan con los reales (ffprobe) cuando el
// autor pase los wavs; los syncs internos (RevealLine/KeyCapsule) también.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
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

// ── Escena 1: hash no es cifrado ───────────────────────────────────
const HASH_POINTS = [
  { text: 'cifrado: reversible con la clave', at: 8.5 },
  { text: 'hash: huella de un solo sentido, no se deshashea', at: 12.0 },
  { text: 'el servidor guarda la huella, no la contraseña', at: 15.0 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>HASH <span style={{ color: THEME.amber }}>≠</span> CIFRADO</>}
          subtitle="la huella digital de una contraseña"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                🧬 UNA VÍA, NO DOS
              </div>
              {HASH_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="kali@attacker-01:~$" width={520}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
                <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> echo -n "password123" | sha512sum
                {'\n'}<span style={{ color: THEME.amber }}>$6$</span>rounds=656000$5s8VJ... <span style={{ color: THEME.dim }}>^</span>
                {'\n\n'}<span style={{ color: THEME.green }}>kali@attacker-01:~$</span> echo -n "password123" | sha512sum
                {'\n'}<span style={{ color: THEME.amber }}>$6$</span>rounds=656000$5s8VJ... <span style={{ color: THEME.dim }}>misma huella</span>
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: algoritmos ───────────────────────────────────────────
const ALGOS = [
  { label: 'rotos, evitar', value: 'MD5 · SHA1', accent: THEME.red, at: 2.5 },
  { label: 'estándar de Linux ($6$)', value: 'SHA512', accent: THEME.green, at: 7.0 },
  { label: 'lentos a propósito', value: 'bcrypt · argon2', accent: THEME.amber, at: 11.5 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
        EL ALGORITMO <span style={{ color: THEME.purple }}>DECIDE TODO</span>
      </div>
      <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 980 }}>
        {ALGOS.map(a => (
          <KeyCapsule key={a.value} label={a.label} value={a.value} accent={a.accent} delay={Math.round(a.at * fps)} size={26} />
        ))}
      </div>
      <div style={{ marginTop: 34, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
        lento es bueno para contraseñas: <span style={{ color: THEME.amber }}>resiste fuerza bruta</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: john the ripper + cierre ─────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(11 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            CONSEGUÍ EL HASH · <span style={{ color: THEME.amber }}>CRACKEALO</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={760} delay={Math.round(3 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> john hash.txt --wordlist=rockyou.txt
              {'\n'}Loaded 1 password hash (sha512crypt)
              {'\n'}Press q to abort
              {'\n'}<span style={{ color: THEME.amber }}>password123      (admin)</span>
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 22, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            rockyou.txt: 14 millones de contraseñas reales filtradas
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>CONTRASEÑA DÉBIL = <span style={{ color: THEME.red }}>SEGUNDOS</span></>}
          subtitle="el hash es tu huella: conseguilo y crackealo"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci02HashesCracking: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['ci-02-hashes-cracking'];
  const starts = sceneStartFrames('ci-02-hashes-cracking', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: hash no es cifrado */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/ci-02-hashes-cracking/ci-02-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: algoritmos */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/ci-02-hashes-cracking/ci-02-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: john + cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/ci-02-hashes-cracking/ci-02-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
