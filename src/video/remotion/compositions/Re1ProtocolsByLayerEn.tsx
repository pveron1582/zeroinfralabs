// ── video/remotion/compositions/Re1ProtocolsByLayerEn.tsx ────
// English version of re1-01-protocols-by-layer. Same visuals; beats
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

// ── Scene 1: what is a protocol ────────────────────────────────
// EN: protocols 2.2 · agreement 4.0 · data format 6.5 · conversation
// starts/ends 8.5 · errors 10.2 · different languages 15.8. Panel at
// 3.9s → relative: 0.3 / 2.6 / 4.6 / 6.3.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>WHAT IS A <span style={{ color: THEME.cyan }}>PROTOCOL</span>?</>}
          subtitle="an agreement on how to communicate"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            MACHINES DON'T SPEAK <span style={{ color: THEME.cyan }}>JUST ANY LANGUAGE</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', width: 820, textAlign: 'left' }}>
            <RevealLine at={2.6} fps={fps} mark="▸" color={THEME.cyan}>the data format: how it's written</RevealLine>
            <RevealLine at={4.6} fps={fps} mark="▸" color={THEME.cyan}>how the conversation starts and ends</RevealLine>
            <RevealLine at={11.9} fps={fps} mark="✗" color={THEME.red}>different protocols = they don't understand each other</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: layers 2 and 3 — Ethernet, ARP, IP, ICMP ─────────
// EN: Ethernet 1.5 · ARP 6.3 · IP 12.1 · ICMP 16.1
const L2L3 = [
  { name: 'ETHERNET', layer: 'layer 2', color: THEME.cyan, desc: 'connects machines on the same network by MAC' },
  { name: 'ARP', layer: 'layer 2/3', color: THEME.amber, desc: 'discovers which MAC matches each IP — the one ARP spoofing exploits' },
  { name: 'IP', layer: 'layer 3', color: THEME.green, desc: 'addresses and routes packets between networks' },
  { name: 'ICMP', layer: 'layer 3', color: THEME.purple, desc: 'diagnostics and control — the protocol ping uses' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
      LAYER 2 AND LAYER 3: <span style={{ color: THEME.cyan }}>WHO DOES WHAT</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: 1000 }}>
      {L2L3.map((p, i) => {
        const at = [1.5, 6.3, 12.1, 16.1][i];
        return (
        <div key={p.name} style={{
          background: THEME.panel, border: `1px solid ${p.color}60`,
          borderRadius: 16, padding: '20px 24px', textAlign: 'left',
        }}>
          <RevealLine at={at} fps={fps} mark="◆" color={p.color}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{p.name}</span>
            <span style={{ fontSize: 13, color: THEME.dim, marginLeft: 10 }}>{p.layer}</span>
          </RevealLine>
          <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{p.desc}</div>
        </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: layer 4 (TCP/UDP) + layer 7 + closing ─────────────
// EN: TCP 1.5 · session 4.3 · in order 8.0 · web 8.7 · UDP 12.3 ·
// faster 14.4 · streaming 17.6 · layer 7 20.5 · HTTP 25.7 ·
// "which tool" 30.5
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(30.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            LAYER 4: <span style={{ color: THEME.green }}>TCP</span> VS <span style={{ color: THEME.amber }}>UDP</span>
          </div>
          <div style={{ display: 'flex', gap: 24, width: 900 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>TCP</div>
              <RevealLine at={2.7} fps={fps} mark="▸" color={THEME.green}>connection oriented</RevealLine>
              <RevealLine at={5.8} fps={fps} mark="▸" color={THEME.green}>guarantees: complete and in order</RevealLine>
              <RevealLine at={8.7} fps={fps} mark="▸" color={THEME.green}>web · email · SSH</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>UDP</div>
              <RevealLine at={12.3} fps={fps} mark="▸" color={THEME.amber}>no connection, faster</RevealLine>
              <RevealLine at={15.6} fps={fps} mark="▸" color={THEME.amber}>doesn't guarantee delivery</RevealLine>
              <RevealLine at={17.6} fps={fps} mark="▸" color={THEME.amber}>streaming · games · DNS</RevealLine>
            </div>
          </div>
          <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            layer 7: HTTP · DNS · SSH · SMTP — <span style={{ color: THEME.purple }}>everything you touch in a lab</span>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>KNOWING THE LAYER = <span style={{ color: THEME.amber }}>KNOWING THE TOOL</span></>}
          subtitle="every protocol lives on its own floor"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1ProtocolsByLayerEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re1-01-protocols-by-layer'];
  const starts = sceneStartFrames('re1-01-protocols-by-layer', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re1-01-protocols-by-layer/re1-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re1-01-protocols-by-layer/re1-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re1-01-protocols-by-layer/re1-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
