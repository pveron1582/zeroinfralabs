// ── video/remotion/compositions/Re03DevicesTopologiesEn.tsx ────
// English version of re-03-devices-topologies. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { RouterDisc } from '../primitives/NetworkIcons';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: hub / switch / router by layer ───────────────────
// EN: hub 2.5 · switch 11.8 · router 18.9. Panel at 2.4s →
// relative: 0.1 / 9.4 / 16.5.
const DEVICES: { name: string; icon: React.ReactNode; layer: string; color: string; desc: string; at: number }[] = [
  { name: 'HUB', icon: '🔌', layer: 'layer 1', color: THEME.dim, desc: 'repeats everything to everyone — obsolete, old textbooks only', at: 0.1 },
  { name: 'SWITCH', icon: '🔀', layer: 'layer 2', color: THEME.cyan, desc: 'learns which MAC lives on each port, delivers only to the destination', at: 9.4 },
  { name: 'ROUTER', icon: <RouterDisc width={54} />, layer: 'layer 3', color: THEME.green, desc: 'joins networks, does NAT, hands out IPs (DHCP)', at: 16.5 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(2.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE LAN'S 3 <span style={{ color: THEME.cyan }}>MAIN CHARACTERS</span></>}
          subtitle="hub · switch · router"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1140 }}>
            {DEVICES.map(d => (
              <div key={d.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${d.color}60`,
                borderRadius: 16, padding: '24px 22px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{d.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: d.color, fontFamily: MONO }}>{d.name}</div>
                <RevealLine at={d.at} fps={fps} mark="◆" color={d.color}>{d.layer}</RevealLine>
                <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 12, lineHeight: 1.55 }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: topologies with mini-diagrams ───────────────────
// EN: bus 3.5 · star 8.6 · ring 17.1 · mesh 19.9
const TOPOS = [
  { name: 'BUS', color: THEME.amber, shape: 'bus', desc: 'one cable shared by everyone · if it breaks, everything drops', at: 3.5 },
  { name: 'STAR', color: THEME.green, shape: 'estrella', desc: 'everything to the center (switch) · the most used today', at: 8.6 },
  { name: 'RING', color: THEME.cyan, shape: 'anillo', desc: 'data travels around in one direction', at: 17.1 },
  { name: 'MESH', color: THEME.purple, shape: 'malla', desc: 'resilient but expensive · the internet backbone', at: 19.9 },
];

const TopoShape: React.FC<{ shape: string; color: string }> = ({ shape, color }) => {
  const line = { stroke: color, strokeWidth: 2, fill: 'none' };
  const node = (x: number, y: number, r = 3.5) => <circle cx={x} cy={y} r={r} fill={color} />;
  switch (shape) {
    case 'bus':
      return (
        <svg width={150} height={40} viewBox="0 0 150 40">
          <line x1={10} y1={20} x2={140} y2={20} {...line} />
          {node(35, 20)}
          {node(75, 20)}
          {node(115, 20)}
        </svg>
      );
    case 'estrella': {
      const cx = 75, cy = 45, R = 34;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
      });
      return (
        <svg width={150} height={90} viewBox="0 0 150 90">
          {pts.map((p, i) => <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} {...line} />)}
          {node(cx, cy, 4.5)}
          {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />)}
        </svg>
      );
    }
    case 'anillo': {
      const cx = 75, cy = 45, R = 30;
      const pts = Array.from({ length: 5 }, (_, i) => {
        const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
        return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
      });
      return (
        <svg width={150} height={90} viewBox="0 0 150 90">
          <circle cx={cx} cy={cy} r={R} {...line} strokeWidth={3} />
          {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />)}
        </svg>
      );
    }
    case 'malla':
      return (
        <svg width={150} height={90} viewBox="0 0 150 90">
          <line x1={75} y1={14} x2={75} y2={34} {...line} />
          <line x1={38} y1={34} x2={112} y2={34} {...line} />
          <line x1={38} y1={34} x2={38} y2={56} {...line} />
          <line x1={75} y1={34} x2={75} y2={56} {...line} />
          <line x1={112} y1={34} x2={112} y2={56} {...line} />
          {node(75, 10, 4.5)}
          {node(38, 62)}
          {node(75, 62)}
          {node(112, 62)}
        </svg>
      );
    default:
      return null;
  }
};

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      NETWORKS ARE DRAWN: <span style={{ color: THEME.amber }}>TOPOLOGIES</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: 980 }}>
      {TOPOS.map(t => (
        <div key={t.name} style={{
          background: THEME.panel, border: `1px solid ${t.color}60`,
          borderRadius: 16, padding: '18px 22px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <TopoShape shape={t.shape} color={t.color} />
          <div style={{ flex: 1 }}>
            <RevealLine at={t.at} fps={fps} mark="◆" color={t.color}>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{t.name}</span>
            </RevealLine>
            <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 8 }}>{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: why it matters + closing ─────────────────────────
// EN: scan 1.7 · crosses routers 4.5 · knowing where 8.3
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(8.3 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            PENTESTING: <span style={{ color: THEME.cyan }}>WHERE ARE YOU STANDING?</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', width: 860, textAlign: 'left' }}>
            <RevealLine at={1.7} fps={fps} mark="▸" color={THEME.cyan}>scanning the network = asking the switch who's connected</RevealLine>
            <RevealLine at={4.5} fps={fps} mark="▸" color={THEME.amber}>attacking outside your LAN = the traffic crosses routers</RevealLine>
            <RevealLine at={8.3} fps={fps} mark="✓" color={THEME.green}>your position in the topology defines what you can see</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>KNOW YOUR NETWORK'S <span style={{ color: THEME.amber }}>SHAPE</span></>}
          subtitle="so you know what you can see"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re03DevicesTopologiesEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re-03-devices-topologies'];
  const starts = sceneStartFrames('re-03-devices-topologies', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re-03-devices-topologies/re-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re-03-devices-topologies/re-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re-03-devices-topologies/re-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
