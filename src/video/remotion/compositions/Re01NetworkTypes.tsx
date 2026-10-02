// ── video/remotion/compositions/Re01NetworkTypes.tsx ───────────────
// Video de la lección fundaments-01 (Fundamentos de redes): ¿qué es una
// red? Nodos, tamaños (PAN/LAN/MAN/WAN) y la VPN.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    nodes: ['💻 compu', '📱 celu', '🗄️ servidor', '🖨️ impresora'],
    s1: {
      title: <>¿QUÉ ES UNA <span style={{ color: THEME.cyan }}>RED</span>?</>,
      subtitle: 'dispositivos conectados para compartir',
      nodeHeading: <>CADA EQUIPO = <span style={{ color: THEME.green }}>UN NODO</span></>,
      cable: 'por cable: ethernet, fibra óptica',
      wireless: 'sin cable: wifi',
      share: 'existe para compartir: archivos, impresoras, internet',
    },
    s2: {
      heading: <>TIPOS POR <span style={{ color: THEME.amber }}>TAMAÑO</span></>,
      sizes: [
        { name: 'PAN', icon: '🎧', color: THEME.purple, desc: 'tu espacio personal (bluetooth)' },
        { name: 'LAN', icon: '🏠', color: THEME.green, desc: 'casa u oficina — switch + wifi' },
        { name: 'MAN', icon: '🏙️', color: THEME.amber, desc: 'ciudad o campus — une LANs' },
        { name: 'WAN', icon: '🌍', color: THEME.cyan, desc: 'ciudades y países — internet' },
      ],
      footer: <>la WAN más grande de todas = <span style={{ color: THEME.cyan }}>internet</span></>,
    },
    s3: {
      heading: <>LA <span style={{ color: THEME.purple }}>VPN</span>: UN TÚNEL, NO UNA RED FÍSICA</>,
      revealLines: [
        { mark: '🔒', color: THEME.purple, text: 'cifrado sobre internet: parecés estar adentro de otra red' },
        { mark: '▸', color: THEME.cyan, text: 'el empleado remoto entra a la oficina sin estar sentado ahí' },
      ],
      closeTitle: <>REGLA UNO: <span style={{ color: THEME.amber }}>CONOCÉ EL MAPA</span></>,
      closeSubtitle: 'después escaneás, después atacás',
    },
  },
  en: {
    nodes: ['💻 PC', '📱 phone', '🗄️ server', '🖨️ printer'],
    s1: {
      title: <>WHAT IS A <span style={{ color: THEME.cyan }}>NETWORK</span>?</>,
      subtitle: 'devices connected to share',
      nodeHeading: <>EVERY MACHINE = <span style={{ color: THEME.green }}>A NODE</span></>,
      cable: 'over cable: ethernet, fiber optic',
      wireless: 'wireless: wifi',
      share: 'exists to share: files, printers, internet access',
    },
    s2: {
      heading: <>TYPES BY <span style={{ color: THEME.amber }}>SIZE</span></>,
      sizes: [
        { name: 'PAN', icon: '🎧', color: THEME.purple, desc: 'your personal space (bluetooth)' },
        { name: 'LAN', icon: '🏠', color: THEME.green, desc: 'home or office — switch + wifi' },
        { name: 'MAN', icon: '🏙️', color: THEME.amber, desc: 'city or campus — joins LANs' },
        { name: 'WAN', icon: '🌍', color: THEME.cyan, desc: 'cities and countries — internet' },
      ],
      footer: <>the biggest WAN of all = <span style={{ color: THEME.cyan }}>the internet</span></>,
    },
    s3: {
      heading: <>THE <span style={{ color: THEME.purple }}>VPN</span>: A TUNNEL, NOT A PHYSICAL NETWORK</>,
      revealLines: [
        { mark: '🔒', color: THEME.purple, text: "encrypted over the internet: you look like you're inside another network" },
        { mark: '▸', color: THEME.cyan, text: 'the remote employee gets into the office without sitting there' },
        { mark: '▸', color: THEME.cyan, text: 'the pentester uses it to hide where their traffic comes from' },
      ],
      closeTitle: <>RULE ONE: <span style={{ color: THEME.amber }}>KNOW THE MAP</span></>,
      closeSubtitle: 'then you scan, then you attack',
    },
  },
};

// ── BEATS (seconds) ────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 5.0, cable: 2.0, wireless: 3.8, share: 5.4 },
    s2: { sizes: [2.2, 6.3, 7.7, 11.0] },
    s3: { closeAt: 14.2, reveal: [2.6, 7.0] },
  },
  en: {
    s1: { panelAt: 5.8, cable: 4.7, wireless: 7.4, share: 9.1 },
    s2: { sizes: [2.6, 7.6, 13.3, 16.1] },
    s3: { closeAt: 15.5, reveal: [2.9, 8.6, 12.1] },
  },
};

// ── Scene 1 ─────────────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY['es']['s1']; b: typeof BEATS['es']['s1']; nodes: string[] }> = ({ fps, c, b, nodes }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            {nodes.map(n => (
              <div key={n} style={{
                background: THEME.panel, border: `1px solid ${THEME.cyan}60`,
                borderRadius: 14, padding: '18px 24px', fontSize: 22, color: THEME.text, fontFamily: MONO,
              }}>{n}</div>
            ))}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            {c.nodeHeading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', textAlign: 'left', width: 760 }}>
            <RevealLine at={b.cable} fps={fps} mark="▸" color={THEME.cyan}>{c.cable}</RevealLine>
            <RevealLine at={b.wireless} fps={fps} mark="▸" color={THEME.cyan}>{c.wireless}</RevealLine>
            <RevealLine at={b.share} fps={fps} mark="✓" color={THEME.green}>{c.share}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2 ─────────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY['es']['s2']; b: typeof BEATS['es']['s2'] }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1140 }}>
      {c.sizes.map((s, i) => (
        <div key={s.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`,
          borderRadius: 16, padding: '24px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>{s.icon}</div>
          <RevealLine at={b.sizes[i]} fps={fps} mark="◆" color={s.color}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>{s.name}</span>
          </RevealLine>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginTop: 12, lineHeight: 1.5 }}>
            {s.desc}
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY['es']['s3']; b: typeof BEATS['es']['s3'] }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>💻</span>
            <div style={{ width: 420, height: 38, borderRadius: 19, border: `2px dashed ${THEME.purple}`, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.purple}40 0 10px, transparent 10px 20px)` }} />
            <span style={{ fontSize: 40 }}>🏢</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            {c.revealLines.map((rl, i) => (
              <RevealLine key={i} at={b.reveal[i]} fps={fps} mark={rl.mark} color={rl.color}>{rl.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Main ────────────────────────────────────────────────────────────
export const Re01NetworkTypes: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];
  const vid = 're-01-network-types';

  const [s1, s2, s3] = audioTimings(vid, lang);
  const starts = sceneStartFrames(vid, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio(vid);
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile(`${base}/re-01-network-types/re-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} nodes={c.nodes} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile(`${base}/re-01-network-types/re-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile(`${base}/re-01-network-types/re-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
