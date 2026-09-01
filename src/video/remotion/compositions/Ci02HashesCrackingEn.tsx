// ── video/remotion/compositions/Ci02HashesCrackingEn.tsx ─────
// English version of ci-02-hashes-cracking. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
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

// ── Scene 1: a hash is not encryption ────────────────────────
// EN: reversible 7.2 · one way 10.5 · stored as hashes 13.7 · real
// password 16.1. Panel at 2.8s → relative: 4.4 / 7.7 / 10.9 / 13.3.
const HASH_POINTS = [
  { text: 'encryption: reversible with the key', at: 4.4 },
  { text: "hash: a one-way fingerprint, you can't unhash it", at: 7.7 },
  { text: "the server stores the fingerprint, not the password", at: 10.9 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(2.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>HASH <span style={{ color: THEME.amber }}>≠</span> ENCRYPTION</>}
          subtitle="a password's fingerprint"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                🧬 ONE WAY, NOT TWO
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
                {'\n'}<span style={{ color: THEME.amber }}>$6$</span>rounds=656000$5s8VJ... <span style={{ color: THEME.dim }}>same fingerprint</span>
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: algorithms ─────────────────────────────────────
// EN: MD5/SHA1 broken 1.4 · SHA512 5.3 · $6$ 9.3 · bcrypt 12.0 ·
// resist 16.2 · slow is good 18.0
const ALGOS = [
  { label: 'broken, avoid', value: 'MD5 · SHA1', accent: THEME.red, at: 1.4 },
  { label: 'Linux standard ($6$)', value: 'SHA512', accent: THEME.green, at: 5.3 },
  { label: 'slow on purpose', value: 'bcrypt · argon2', accent: THEME.amber, at: 12.0 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 34 }}>
        THE ALGORITHM <span style={{ color: THEME.purple }}>DECIDES EVERYTHING</span>
      </div>
      <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 980 }}>
        {ALGOS.map(a => (
          <KeyCapsule key={a.value} label={a.label} value={a.value} accent={a.accent} delay={Math.round(a.at * fps)} size={26} />
        ))}
      </div>
      <div style={{ marginTop: 34, fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
        slow is good for passwords: <span style={{ color: THEME.amber }}>it resists brute force</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: john the ripper + closing ──────────────────────
// EN: get the hash 1.9 · John 4.3 · rockyou 7.1 · 14 million 8.4 ·
// weak fall 13.5. closeAt 13.5.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(13.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            GET THE HASH · <span style={{ color: THEME.amber }}>CRACK IT</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={760} delay={Math.round(4.3 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> john hash.txt --wordlist=rockyou.txt
              {'\n'}Loaded 1 password hash (sha512crypt)
              {'\n'}Press q to abort
              {'\n'}<span style={{ color: THEME.amber }}>password123      (admin)</span>
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 22, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            rockyou.txt: 14 million real leaked passwords
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>WEAK PASSWORD = <span style={{ color: THEME.red }}>SECONDS</span></>}
          subtitle="the hash is the fingerprint: get it and crack it"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci02HashesCrackingEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ci-02-hashes-cracking'];
  const starts = sceneStartFrames('ci-02-hashes-cracking', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ci-02-hashes-cracking/ci-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ci-02-hashes-cracking/ci-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ci-02-hashes-cracking/ci-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
