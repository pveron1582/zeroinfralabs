// ── video/remotion/compositions/Re01NetworkTypesEn.tsx ───────────
// English version of re-01-network-types. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

const NODES = ['💻 PC', '📱 phone', '🗄️ server', '🖨️ printer'];

// EN S1: nodes listed 6.0-9.2 · cable 10.5 · wireless 13.2 · share 14.9.
// Panel starts at 5.8s → relative: 0.2 / 4.7 / 7.4 / 9.1.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>WHAT IS A <span style={{ color: THEME.cyan }}>NETWORK</span>?</>}
          subtitle="devices connected to share"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            {NODES.map(n => (
              <div key={n} style={{
                background: THEME.panel, border: `1px solid ${THEME.cyan}60`,
                borderRadius: 14, padding: '18px 24px', fontSize: 22, color: THEME.text, fontFamily: MONO,
              }}>
                {n}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            EVERY MACHINE = <span style={{ color: THEME.green }}>A NODE</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', textAlign: 'left', width: 760 }}>
            <RevealLine at={4.7} fps={fps} mark="▸" color={THEME.cyan}>over cable: ethernet, fiber optic</RevealLine>
            <RevealLine at={7.4} fps={fps} mark="▸" color={THEME.cyan}>wireless: wifi</RevealLine>
            <RevealLine at={9.1} fps={fps} mark="✓" color={THEME.green}>exists to share: files, printers, internet access</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: sizes PAN → LAN → MAN → WAN ───────────────────────
// EN: PAN 2.6 · LAN 7.6 · MAN 13.3 · WAN 16.1
const SIZES = [
  { name: 'PAN', icon: '🎧', color: THEME.purple, desc: 'your personal space (bluetooth)', at: 2.6 },
  { name: 'LAN', icon: '🏠', color: THEME.green, desc: 'home or office — switch + wifi', at: 7.6 },
  { name: 'MAN', icon: '🏙️', color: THEME.amber, desc: 'city or campus — joins LANs', at: 13.3 },
  { name: 'WAN', icon: '🌍', color: THEME.cyan, desc: 'cities and countries — internet', at: 16.1 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      TYPES BY <span style={{ color: THEME.amber }}>SIZE</span>
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1140 }}>
      {SIZES.map(s => (
        <div key={s.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`,
          borderRadius: 16, padding: '24px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>{s.icon}</div>
          <RevealLine at={s.at} fps={fps} mark="◆" color={s.color}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>{s.name}</span>
          </RevealLine>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginTop: 12, lineHeight: 1.5 }}>
            {s.desc}
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      the biggest WAN of all = <span style={{ color: THEME.cyan }}>the internet</span>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: the VPN + closing ────────────────────────────────
// EN: tunnel 3.0 · remote employee 8.7 · hide traffic 12.1 · rule 1
// at 15.5
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(15.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            THE <span style={{ color: THEME.purple }}>VPN</span>: A TUNNEL, NOT A PHYSICAL NETWORK
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>💻</span>
            <div style={{ width: 420, height: 38, borderRadius: 19, border: `2px dashed ${THEME.purple}`, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.purple}40 0 10px, transparent 10px 20px)` }} />
            <span style={{ fontSize: 40 }}>🏢</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            <RevealLine at={2.9} fps={fps} mark="🔒" color={THEME.purple}>encrypted over the internet: you look like you're inside another network</RevealLine>
            <RevealLine at={8.6} fps={fps} mark="▸" color={THEME.cyan}>the remote employee gets into the office without sitting there</RevealLine>
            <RevealLine at={12.1} fps={fps} mark="▸" color={THEME.cyan}>the pentester uses it to hide where their traffic comes from</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>RULE ONE: <span style={{ color: THEME.amber }}>KNOW THE MAP</span></>}
          subtitle="then you scan, then you attack"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re01NetworkTypesEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re-01-network-types'];
  const starts = sceneStartFrames('re-01-network-types', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re-01-network-types/re-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re-01-network-types/re-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re-01-network-types/re-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
