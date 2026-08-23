// ── video/remotion/compositions/Re03DevicesTopologies.tsx ──────────
// Video: los 3 dispositivos de la LAN (hub/switch/router) + topologías.
// Lección redes-03 del Academy. Guiones: voicebox-scripts/re-03-*.txt
// Audio real cargado (wavs Voicebox, ffprobe 2026-08-17). Los syncs internos
// (RevealLine/KeyCapsule/TitleScene) están alineados a silencedetect (-50dB).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
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

// ── Escena 1: hub / switch / router por capa ───────────────────────
const DEVICES: { name: string; icon: React.ReactNode; layer: string; color: string; desc: string; at: number }[] = [
  { name: 'HUB', icon: '🔌', layer: 'capa 1', color: THEME.dim, desc: 'repite todo a todos — obsoleto, solo en textos viejos', at: 0.3 },
  { name: 'SWITCH', icon: '🔀', layer: 'capa 2', color: THEME.cyan, desc: 'aprende MACs por puerto, entrega solo al destino', at: 3.5 },
  { name: 'ROUTER', icon: <RouterDisc width={54} />, layer: 'capa 3', color: THEME.green, desc: 'une redes, hace NAT, reparte IPs (DHCP)', at: 7.2 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>LOS 3 <span style={{ color: THEME.cyan }}>PROTAGONISTAS</span> DE LA LAN</>}
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

// ── Escena 2: topologías con mini-diagramas ────────────────────────
const TOPOS = [
  { name: 'BUS', color: THEME.amber, shape: 'bus', desc: 'un cable compartido · si se corta cae todo', at: 2 },
  { name: 'ESTRELLA', color: THEME.green, shape: 'estrella', desc: 'todo al centro (switch) · la más usada hoy', at: 5.8 },
  { name: 'ANILLO', color: THEME.cyan, shape: 'anillo', desc: 'los datos giran en un solo sentido', at: 10 },
  { name: 'MALLA', color: THEME.purple, shape: 'malla', desc: 'resistente pero cara · la base de internet', at: 11.3 },
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
      LAS REDES SE DIBUJAN: <span style={{ color: THEME.amber }}>TOPOLOGÍAS</span>
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

// ── Escena 3: por qué importa + cierre ─────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(11 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            PENTESTING: <span style={{ color: THEME.cyan }}>¿DÓNDE ESTÁS PARADO?</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', width: 860, textAlign: 'left' }}>
            <RevealLine at={2.5} fps={fps} mark="▸" color={THEME.cyan}>escanear la red = preguntarle al switch quién está conectado</RevealLine>
            <RevealLine at={5.5} fps={fps} mark="▸" color={THEME.amber}>atacar fuera de tu LAN = el tráfico cruza routers</RevealLine>
            <RevealLine at={9} fps={fps} mark="✓" color={THEME.green}>tu posición en la topología define qué ves y qué no</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>CONOCÉ LA <span style={{ color: THEME.amber }}>FORMA</span> DE TU RED</>}
          subtitle="para saber qué podés ver"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re03DevicesTopologies: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re-03-devices-topologies'];
  const starts = sceneStartFrames('re-03-devices-topologies', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re-03-devices-topologies');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re-03-devices-topologies/re-03-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re-03-devices-topologies/re-03-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re-03-devices-topologies/re-03-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
