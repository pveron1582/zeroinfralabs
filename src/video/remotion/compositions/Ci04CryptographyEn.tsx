// ── video/remotion/compositions/Ci04CryptographyEn.tsx ────────
// English version of ci-04-cryptography. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).
// EN audio available even though ES is still pending.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: what it is + encryption vs hash ─────────────────
// EN: two operations 5.5 · encrypt 6.8 · decrypt 9.8 · key is the
// secret 15.0 · reversible 22.3 · one way 25.8 · decrypted 28.4.
// Panel at 5.4s → rel: 1.4 / 2.5 / 6.9 / 16.9 / 20.4 / 23.0.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>COUSINS, <span style={{ color: THEME.cyan }}>NOT TWINS</span></>}
          subtitle="encryption and hashes: the base of cryptography"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            THE ALGORITHM IS PUBLIC · <span style={{ color: THEME.amber }}>THE KEY IS THE SECRET</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1060, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={1.4} fps={fps} mark="" color={THEME.cyan}>ENCRYPTION 🔄</RevealLine>
              </div>
              <RevealLine at={16.9} fps={fps} mark="▸" color={THEME.cyan}>reversible: with the key you recover the data</RevealLine>
              <RevealLine at={23.0} fps={fps} mark="▸" color={THEME.cyan}>"if it can be decrypted, it's encryption"</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={2.5} fps={fps} mark="" color={THEME.purple}>HASH 🧬</RevealLine>
              </div>
              <RevealLine at={20.4} fps={fps} mark="▸" color={THEME.purple}>one way: there's no way back</RevealLine>
              <RevealLine at={25.3} fps={fps} mark="▸" color={THEME.purple}>"if there's no way back, it's a hash"</RevealLine>
            </div>
          </div>
          <div style={{ width: 900, textAlign: 'left', marginTop: 18 }}>
            <RevealLine at={28.4} fps={fps} mark="▸" color={THEME.amber}>can be decrypted = encryption · no way back = hash</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: symmetric vs asymmetric ────────────────────────
// EN: two families 0.0 · symmetric 1.7 · shared key 2.9 · AES
// 6.2 · leaking 9.6 · asymmetric 11.0 · public 12.9 · private
// 15.1 · only the other decrypts 19.0 · slower 20.6 · HTTPS both
// 23.6. comboAt 23.6.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const comboAt = Math.round(23.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={comboAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            TWO <span style={{ color: THEME.green }}>FAMILIES</span>
          </div>
          <div style={{ display: 'flex', gap: 60, width: 1060, justifyContent: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>
                <RevealLine at={1.7} fps={fps} mark="" color={THEME.green}>SYMMETRIC</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                <KeyCapsule label="shared key" value="🔑" accent={THEME.green} delay={Math.round(2.9 * fps)} size={30} />
                <KeyCapsule label="encrypt and decrypt" value="🔓🔒" accent={THEME.green} delay={Math.round(4.2 * fps)} size={30} />
              </div>
              <RevealLine at={5.7} fps={fps} mark="▸" color={THEME.green}>fast, like AES</RevealLine>
              <RevealLine at={7.7} fps={fps} mark="⚠" color={THEME.amber}>both sides must agree on the key without it leaking</RevealLine>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 14 }}>
                <RevealLine at={11.0} fps={fps} mark="" color={THEME.cyan}>ASYMMETRIC</RevealLine>
              </div>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 12 }}>
                <KeyCapsule label="public · anyone" value="🔓" accent={THEME.cyan} delay={Math.round(12.9 * fps)} size={30} />
                <KeyCapsule label="private · owner only" value="🔒" accent={THEME.cyan} delay={Math.round(15.1 * fps)} size={30} />
              </div>
              <RevealLine at={17.5} fps={fps} mark="▸" color={THEME.cyan}>what one encrypts, only the other decrypts</RevealLine>
              <RevealLine at={20.6} fps={fps} mark="▸" color={THEME.cyan}>slower, but no shared secret</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={comboAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            HTTPS USES <span style={{ color: THEME.amber }}>BOTH</span>
          </div>
          <TerminalWindow title="🔒 https://example.com" width={780} delay={Math.round(2.0 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.cyan }}>ASYMMETRIC</span> → exchanges the key at the start
              {'\n'}<span style={{ color: THEME.green }}>SYMMETRIC</span>   → carries all the traffic afterward
              {'\n'}TLS 1.3 · AES + RSA/ECDHE
            </div>
          </TerminalWindow>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 3: where you see it + closing ────────────────────
// EN: HTTPS 2.2 · SSH 8.1 · VPN 11.4 · password storage 13.9 ·
// signatures 19.3 · cousins 25.8 · verify 30.9. closeAt 25.8.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(25.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            WHERE YOU SEE IT <span style={{ color: THEME.green }}>EVERY DAY</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, width: 900 }}>
            <RevealLine at={2.2} fps={fps} mark="🔒" color={THEME.cyan}>HTTPS: every padlock in the browser (AES + RSA)</RevealLine>
            <RevealLine at={8.1} fps={fps} mark="🗝️" color={THEME.purple}>SSH: your key pair authenticates</RevealLine>
            <RevealLine at={11.4} fps={fps} mark="🧅" color={THEME.amber}>VPN: encrypts the whole tunnel</RevealLine>
            <RevealLine at={13.9} fps={fps} mark="🧬" color={THEME.green}>passwords: hashes, not encryption</RevealLine>
            <RevealLine at={19.3} fps={fps} mark="✍️" color={THEME.red}>signatures: the private key signs, the public one proves it</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>ENCRYPTION = <span style={{ color: THEME.cyan }}>READ LATER</span> · HASH = <span style={{ color: THEME.purple }}>VERIFY</span></>}
          subtitle="cousins, not twins"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci04CryptographyEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ci-04-cryptography'];
  const starts = sceneStartFrames('ci-04-cryptography', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ci-04-cryptography/ci-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ci-04-cryptography/ci-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ci-04-cryptography/ci-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
