// ── video/remotion/compositions/Pe03OfflineCrackingEn.tsx ──
// English version of pe-03-offline-cracking. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
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

// ── Scene 1: what offline cracking is ───────────────────────
// EN: offline 3.0 · the hash 6.9 · own machine 11.0 · no attempts
// 14.7 · no alarms 17.1 · time 18.9 · weak 22.6 · years 24.6 · your
// job 26.7. Panel at 5.8s → rel: 1.1 / 5.2 / 8.9 / 11.3 / 13.1 /
// 16.8 / 18.8 / 20.9.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>YOU HAVE THE HASH: <span style={{ color: THEME.cyan }}>OFFLINE CRACKING</span></>}
          subtitle="on your machine, at your pace, no alerts"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            THE SCENARIO: <span style={{ color: THEME.green }}>YOU HAVE THE HASH</span>, NOT THE SERVER
          </div>
          <div style={{ display: 'flex', gap: 24, width: 1100, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={5.2} fps={fps} mark="" color={THEME.cyan}>ON YOUR OWN MACHINE</RevealLine>
              </div>
              <RevealLine at={8.9} fps={fps} mark="▸" color={THEME.cyan}>no failed attempts being counted</RevealLine>
              <RevealLine at={11.3} fps={fps} mark="▸" color={THEME.cyan}>no blocks, no alarms going off</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={13.1} fps={fps} mark="" color={THEME.amber}>THE LIMIT IS TIME</RevealLine>
              </div>
              <RevealLine at={16.8} fps={fps} mark="▸" color={THEME.amber}>a weak hash falls in seconds</RevealLine>
              <RevealLine at={18.8} fps={fps} mark="▸" color={THEME.amber}>a strong one can take years</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: john + rockyou ────────────────────────────────
// EN: John the Ripper 0.0 · wordlist 10.1 · rockyou 14.2 · 14
// million 16.2 · 2009 leak 18.6 · always fall 20.3.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      <span style={{ color: THEME.green }}>JOHN THE RIPPER</span>: THE CLASSIC
    </div>
    <TerminalWindow title="kali@attacker-01:~$ john hash.txt --wordlist=rockyou.txt" width={760} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>Loaded 1 password hash (sha512crypt)</span>
        {'\n'}password123 <span style={{ color: THEME.green }}>  (admin)</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
      <KeyCapsule label="wordlist" value="rockyou" accent={THEME.amber} delay={Math.round(10.1 * fps)} size={24} />
      <KeyCapsule label="real leaked passwords" value="14M+" accent={THEME.green} delay={Math.round(16.2 * fps)} size={24} />
      <KeyCapsule label="2009 leak" value="exposed" accent={THEME.cyan} delay={Math.round(18.6 * fps)} size={24} />
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, width: 880 }}>
      weak passwords always fall: <span style={{ color: THEME.green }}>they're already on the list</span>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: hashcat (GPU + rules) + closing ───────────────
// EN: stronger 0.3 · hashcat 6.3 · graphics card 9.7 · parallel
// cores 11.8 · per second 15.0 · mutation rules 16.9 · variants
// 20.5 · golden rule 24.5. closeAt 24.5.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(24.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            WHEN JOHN FALLS SHORT: <span style={{ color: THEME.red }}>HASHCAT</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$ hashcat -m 1800 -a 0 hash.txt rockyou.txt" width={820} delay={Math.round(6.3 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>Hash-mode 1800 (sha512crypt + salt)</span>
              {'\n'}Session..........: hashcat
              {'\n'}Speed.DEV.#1....: <span style={{ color: THEME.green }}>1234.5 kH/s</span> (GPU)
              {'\n'}password123:admin
            </div>
          </TerminalWindow>
          <div style={{ display: 'flex', gap: 20, width: 1040, marginTop: 26, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
              <RevealLine at={9.7} fps={fps} mark="▸" color={THEME.red}>runs on the GPU: thousands of parallel cores</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
              <RevealLine at={16.9} fps={fps} mark="▸" color={THEME.amber}>mutation rules: word → word1, Word</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
              <RevealLine at={20.5} fps={fps} mark="▸" color={THEME.cyan}>numbers at the end, capitals at the start</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>THE <span style={{ color: THEME.amber }}>WORDLIST</span> IS HALF THE GAME</>}
          subtitle="the GPU gives you speed · the list gives you the result"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Pe03OfflineCrackingEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['pe-03-offline-cracking'];
  const starts = sceneStartFrames('pe-03-offline-cracking', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/pe-03-offline-cracking/pe-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/pe-03-offline-cracking/pe-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/pe-03-offline-cracking/pe-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
