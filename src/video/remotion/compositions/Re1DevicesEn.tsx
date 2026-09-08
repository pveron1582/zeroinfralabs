// ── video/remotion/compositions/Re1DevicesEn.tsx ─────────────
// English version of re1-04-devices. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { FiberCable, PatchCord, RouterDisc } from '../primitives/NetworkIcons';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: the hub — the fossil (layer 1) ───────────────────
// EN: hub works 10.1 · repeats 13.6 · no decisions 16.8 · sniffing
// trivial 20.5. Panel at 10.0s → relative: 0.1 / 3.6 / 6.8 / 10.5.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(10.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE <span style={{ color: THEME.dim }}>HUB</span>: THE FOSSIL</>}
          subtitle="layer 1 — repeats everything to everyone"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 49, marginBottom: 18 }}>🔌</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.dim, fontFamily: MONO, marginBottom: 20 }}>
            LAYER 1 · ONE SINGLE JOB
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            <RevealLine at={3.6} fps={fps} mark="▸" color={THEME.red}>repeats everything it receives to EVERY port</RevealLine>
            <RevealLine at={6.8} fps={fps} mark="✗" color={THEME.red}>doesn't understand MACs and makes no decisions</RevealLine>
            <RevealLine at={10.5} fps={fps} mark="✓" color={THEME.amber}>with hubs, sniffing was trivial</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: switch (layer 2) VS router (layer 3) ─────────────
// EN: switch 0.0 · learns MAC 5.1 · destination 7.7 · VLANs 13.4 ·
// port security 16.4 · router 20.1 · IP 22.0 · routing table 24.9 ·
// key difference 27.8
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      SWITCH VS ROUTER
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1080 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>🔀 SWITCH · LAYER 2</div>
        <RevealLine at={5.1} fps={fps} mark="▸" color={THEME.cyan}>learns which MAC lives on each port</RevealLine>
        <RevealLine at={7.7} fps={fps} mark="▸" color={THEME.cyan}>delivers only to the destination</RevealLine>
        <RevealLine at={13.4} fps={fps} mark="▸" color={THEME.cyan}>VLANs, monitoring, port security</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><RouterDisc /> ROUTER · LAYER 3</div>
        <RevealLine at={20.1} fps={fps} mark="▸" color={THEME.green}>connects different networks by IP</RevealLine>
        <RevealLine at={24.9} fps={fps} mark="▸" color={THEME.green}>routing table decides where each packet goes</RevealLine>
        <RevealLine at={27.8} fps={fps} mark="▸" color={THEME.green}>NAT + DHCP + WAN and LAN ports</RevealLine>
      </div>
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.amber, fontFamily: MONO, fontWeight: 700 }}>
      the switch joins ONE network · the router joins networks TO EACH OTHER
    </div>
  </AbsoluteFill>
);

// ── Scene 3: cabling + AP + closing ──────────────────────────
// EN: copper 2.9 · fiber 10.7 · access point 17.5 · pentester 23.5.
// Panel close at 23.5s.
const COPPER = '#c97a3d';

const MEDIA: {
  name: string; color: string; desc: string; at: number; visual: React.ReactNode;
}[] = [
  { name: 'COPPER', color: THEME.amber, desc: 'UTP/RJ45 · cheap and universal · up to ~100 m', at: 2.9, visual: <PatchCord width={210} color={COPPER} /> },
  { name: 'FIBER', color: THEME.cyan, desc: 'light instead of electricity · speed and distance', at: 10.7, visual: <FiberCable /> },
  { name: 'WIFI (AP)', color: THEME.green, desc: 'no cables · laptops and phones', at: 17.5, visual: <span style={{ fontSize: 34 }}>📶</span> },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(23.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            AND THE <span style={{ color: THEME.cyan }}>CABLING</span>
          </div>
          <div style={{ display: 'flex', gap: 22, width: 1000 }}>
{MEDIA.map((m) => (
        <div key={m.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${m.color}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{m.visual}</div>
          <RevealLine at={m.at} fps={fps} mark="◆" color={m.color}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{m.name}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{m.desc}</div>
        </div>
      ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>THE SWITCH JOINS THE LAN, <span style={{ color: THEME.amber }}>THE ROUTER GETS IT OUT</span></>}
          subtitle="and the access point opens the door without cables"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1DevicesEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re1-04-devices'];
  const starts = sceneStartFrames('re1-04-devices', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re1-04-devices/re1-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re1-04-devices/re1-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re1-04-devices/re1-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
