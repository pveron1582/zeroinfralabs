// ── video/remotion/compositions/Ot04SocialEngineeringEn.tsx ────
// English version of ot-04-social-engineering. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
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

// ── Scene 1: educational disclaimer ─────────────────────────────
const Scene1: React.FC = () => {
  return (
    <TitleScene
      title={<span style={{ color: THEME.amber }}>EDUCATIONAL ONLY</span>}
      subtitle="understanding how attacks work serves to defend yourself, not to steal"
      fontSize={44}
    />
  );
};

// ── Scene 2: skimmers + access card cloners ────────────────────
// EN skimmer: placed over 1.8 · reads stripe 7.6 · camera/fake keypad
// 10.6 · clones 17.0 · EMV defense 19.3 · RFID/Mifare 29.3 · copy in
// seconds 34.8 · AES migration 40.6
const SKIMMER_POINTS = [
  { text: 'placed over the real reader (ATM, gas pump)', at: 1.8 },
  { text: 'reads the magnetic stripe when you swipe', at: 7.6 },
  { text: '+ hidden camera or fake keypad = number and PIN', at: 10.6 },
  { text: 'clones the stripe onto a blank card', at: 17.0 },
  { text: 'the EMV chip makes clones useless for paying', at: 19.3 },
];

const ACCESS_POINTS = [
  { text: 'old RFID: Mifare Classic, broken for years', at: 29.3 },
  { text: 'copy your badge in seconds, without touching it', at: 34.8 },
  { text: 'migrate to AES cards and phone credentials', at: 40.6 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
            💳 SKIMMERS AND CLONERS
          </div>
          {SKIMMER_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
            🪪 ACCESS CARDS
          </div>
          {ACCESS_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.cyan}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: social engineering techniques ─────────────────────
// EN: weakest link 6.5 · phishing 14.3 · vishing 17.9 · baiting
// 21.1 · pretexting 25.0 · tailgating 28.9 · firewall 32.5
const TECHNIQUES = [
  { name: 'PHISHING', desc: 'a fake email impersonating a trusted entity', at: 14.3 },
  { name: 'VISHING', desc: 'the same scam, over the phone', at: 17.9 },
  { name: 'BAITING', desc: 'a tempting USB or download hiding malware', at: 21.1 },
  { name: 'PRETEXTING', desc: 'a false scenario to make you hand over data', at: 25.0 },
  { name: 'TAILGATING', desc: 'walking in behind an employee through a secure door', at: 28.9 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: "No firewall blocks..." at 32.5s
  const closeAt = Math.round(32.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            SOCIAL ENGINEERING: <span style={{ color: THEME.red }}>HACKING THE HUMAN</span>
          </div>
          <div style={{ width: 900, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 28px', textAlign: 'left' }}>
            {TECHNIQUES.map(t => (
              <RevealLine key={t.name} at={t.at} fps={fps} mark="⚠" color={THEME.red}>
                <span style={{ fontWeight: 700, color: THEME.text }}>{t.name}</span>
                <span style={{ color: THEME.muted }}> — {t.desc}</span>
              </RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            no firewall blocks a <span style={{ color: THEME.red }}>friendly call</span> asking for your password
          </div>
          <div style={{ marginTop: 18, fontSize: 19, color: THEME.muted, fontFamily: MONO }}>
            that's what training and verification are for
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 4: closing — why a pentester needs this ──────────────
// EN: credential cloning 4.1 · USB drops 5.6 · vishing 7.0 · real
// attackers 10.1 · own module 13.6-14.9 · keep this 19.0
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: "For now, keep this" at 19.0s
  const closeAt = Math.round(19.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            A REAL PART OF <span style={{ color: THEME.cyan }}>PENTESTING</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="clone credentials" value="BADGE CLONING" accent={THEME.cyan} delay={Math.round(4.1 * fps)} size={18} />
            <KeyCapsule label="USB drops" value="USB DROPS" accent={THEME.amber} delay={Math.round(5.6 * fps)} size={18} />
            <KeyCapsule label="fake calls" value="VISHING" accent={THEME.red} delay={Math.round(7.0 * fps)} size={18} />
          </div>
          <RevealLine at={10.1} fps={fps} mark="▸" color={THEME.cyan}>that's how real attackers get in</RevealLine>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DESERVES <span style={{ color: THEME.amber }}>ITS OWN MODULE</span> IN ETHICAL HACKING</>}
          subtitle="hacking isn't just keyboards: doors, badges, cables, and conversations"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot04SocialEngineeringEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['ot-04-social-engineering'];
  const starts = sceneStartFrames('ot-04-social-engineering', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: disclaimer */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ot-04-social-engineering/ot-04-scene1.wav`)} />
        <Scene1 />
      </Sequence>

      {/* Scene 2: skimmers + cloners */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ot-04-social-engineering/ot-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: social engineering techniques */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ot-04-social-engineering/ot-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: closing */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/ot-04-social-engineering/ot-04-scene4.wav`)} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
