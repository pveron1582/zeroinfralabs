// ── video/remotion/compositions/Re03DevicesTopologies.tsx ──────────
// Video: los 3 dispositivos de la LAN (hub/switch/router) + topologías.
// Lección fundaments-03 del Academy. Guiones: voicebox-scripts/re-03-*.txt
// Audio real cargado (wavs Voicebox, ffprobe 2026-08-17). Los syncs internos
// (RevealLine/KeyCapsule/TitleScene) están alineados a silencedetect (-50dB).
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>LOS 3 <span style={{ color: THEME.cyan }}>PROTAGONISTAS</span> DE LA LAN</>,
      subtitle: 'hub · switch · router',
      devices: [
        { name: 'HUB', icon: '🔌', layer: 'capa 1', desc: 'repite todo a todos — obsoleto, solo en textos viejos' },
        { name: 'SWITCH', icon: '🔀', layer: 'capa 2', desc: 'aprende MACs por puerto, entrega solo al destino' },
        { name: 'ROUTER', icon: <RouterDisc width={54} />, layer: 'capa 3', desc: 'une redes, hace NAT, reparte IPs (DHCP)' },
      ],
    },
    s2: {
      heading: <>LAS REDES SE DIBUJAN: <span style={{ color: THEME.amber }}>TOPOLOGÍAS</span></>,
      topos: [
        { name: 'BUS', desc: 'un cable compartido · si se corta cae todo' },
        { name: 'ESTRELLA', desc: 'todo al centro (switch) · la más usada hoy' },
        { name: 'ANILLO', desc: 'los datos giran en un solo sentido' },
        { name: 'MALLA', desc: 'resistente pero cara · la base de internet' },
      ],
    },
    s3: {
      heading: <>PENTESTING: <span style={{ color: THEME.cyan }}>¿DÓNDE ESTÁS PARADO?</span></>,
      points: [
        'escanear la red = preguntarle al switch quién está conectado',
        'atacar fuera de tu LAN = el tráfico cruza routers',
        'tu posición en la topología define qué ves y qué no',
      ],
      closeTitle: <>CONOCÉ LA <span style={{ color: THEME.amber }}>FORMA</span> DE TU RED</>,
      closeSubtitle: 'para saber qué podés ver',
    },
  },
  en: {
    s1: {
      title: <>THE LAN'S 3 <span style={{ color: THEME.cyan }}>MAIN CHARACTERS</span></>,
      subtitle: 'hub · switch · router',
      devices: [
        { name: 'HUB', icon: '🔌', layer: 'layer 1', desc: 'repeats everything to everyone — obsolete, old textbooks only' },
        { name: 'SWITCH', icon: '🔀', layer: 'layer 2', desc: 'learns which MAC lives on each port, delivers only to the destination' },
        { name: 'ROUTER', icon: <RouterDisc width={54} />, layer: 'layer 3', desc: 'joins networks, does NAT, hands out IPs (DHCP)' },
      ],
    },
    s2: {
      heading: <>NETWORKS ARE DRAWN: <span style={{ color: THEME.amber }}>TOPOLOGIES</span></>,
      topos: [
        { name: 'BUS', desc: 'one cable shared by everyone · if it breaks, everything drops' },
        { name: 'STAR', desc: 'everything to the center (switch) · the most used today' },
        { name: 'RING', desc: 'data travels around in one direction' },
        { name: 'MESH', desc: 'resilient but expensive · the internet backbone' },
      ],
    },
    s3: {
      heading: <>PENTESTING: <span style={{ color: THEME.cyan }}>WHERE ARE YOU STANDING?</span></>,
      points: [
        'scanning the network = asking the switch who\'s connected',
        'attacking outside your LAN = the traffic crosses routers',
        'your position in the topology defines what you can see',
      ],
      closeTitle: <>KNOW YOUR NETWORK'S <span style={{ color: THEME.amber }}>SHAPE</span></>,
      closeSubtitle: 'so you know what you can see',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 5, devices: [0.3, 3.5, 7.2] },
    s2: { topos: [2, 5.8, 10, 11.3] },
    s3: { closeAt: 11, points: [2.5, 5.5, 9] },
  },
  en: {
    s1: { panelAt: 2.4, devices: [0.1, 9.4, 16.5] },
    s2: { topos: [3.5, 8.6, 17.1, 19.9] },
    s3: { closeAt: 8.3, points: [1.7, 4.5, 8.3] },
  },
};

const VID = 'fundaments-03-devices-topologies';

const TOPO_COLORS = [THEME.amber, THEME.green, THEME.cyan, THEME.purple];
const TOPO_SHAPES = ['bus', 'estrella', 'anillo', 'malla'];

const TopoShape: React.FC<{ shape: string; color: string }> = ({ shape, color }) => {
  const line = { stroke: color, strokeWidth: 2, fill: 'none' };
  const node = (x: number, y: number, r = 3.5) => <circle cx={x} cy={y} r={r} fill={color} />;
  switch (shape) {
    case 'bus':
      return (
        <svg width={150} height={40} viewBox="0 0 150 40">
          <line x1={10} y1={20} x2={140} y2={20} {...line} />
          {node(35, 20)}{node(75, 20)}{node(115, 20)}
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
          {node(75, 10, 4.5)}{node(38, 62)}{node(75, 62)}{node(112, 62)}
        </svg>
      );
    default:
      return null;
  }
};

// ── Scene 1: hub / switch / router por capa ───────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1140 }}>
            {c.devices.map((d, i) => (
              <div key={d.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${[THEME.dim, THEME.cyan, THEME.green][i]}60`,
                borderRadius: 16, padding: '24px 22px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 40, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{d.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: [THEME.dim, THEME.cyan, THEME.green][i], fontFamily: MONO }}>{d.name}</div>
                <RevealLine at={b.devices[i]} fps={fps} mark="◆" color={[THEME.dim, THEME.cyan, THEME.green][i]}>{d.layer}</RevealLine>
                <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 12, lineHeight: 1.55 }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: topologías con mini-diagramas ────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      {c.heading}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: 980 }}>
      {c.topos.map((t, i) => (
        <div key={t.name} style={{
          background: THEME.panel, border: `1px solid ${TOPO_COLORS[i]}60`,
          borderRadius: 16, padding: '18px 22px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <TopoShape shape={TOPO_SHAPES[i]} color={TOPO_COLORS[i]} />
          <div style={{ flex: 1 }}>
            <RevealLine at={b.topos[i]} fps={fps} mark="◆" color={TOPO_COLORS[i]}>
              <span style={{ fontSize: 20, fontWeight: 800 }}>{t.name}</span>
            </RevealLine>
            <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 8 }}>{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: por qué importa + cierre ─────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', width: 860, textAlign: 'left' }}>
            <RevealLine at={b.points[0]} fps={fps} mark="▸" color={THEME.cyan}>{c.points[0]}</RevealLine>
            <RevealLine at={b.points[1]} fps={fps} mark="▸" color={THEME.amber}>{c.points[1]}</RevealLine>
            <RevealLine at={b.points[2]} fps={fps} mark="✓" color={THEME.green}>{c.points[2]}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Re03DevicesTopologies: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/fundaments-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/fundaments-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/fundaments-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
