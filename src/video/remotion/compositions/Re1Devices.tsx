// ── video/remotion/compositions/Re1Devices.tsx ──────────────────────
// Video: dispositivos esenciales — hub, switch y router (+ cables + AP).
// Lección networksI-04 del Academy (Redes I). Guiones: voicebox-scripts/{es,en}/networksI/networksI-04-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/{es,en}/networksI/networksI-04-scene*.wav.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>EL <span style={{ color: THEME.dim }}>HUB</span>: EL FÓSIL</>,
      subtitle: 'capa 1 — repite todo a todos',
      heading: 'CAPA 1 · UNA SOLA FUNCIÓN',
      points: [
        'repite todo lo que recibe a TODOS los puertos',
        'no entiende MAC ni toma decisiones',
        'con hubs, sniffear era trivial',
      ],
    },
    s2: {
      heading: 'SWITCH VS ROUTER',
      switchTitle: '🔀 SWITCH · CAPA 2',
      switchPoints: ['aprende qué MAC vive en cada puerto', 'entrega solo al destino', 'VLANs, monitoreo, seguridad de puertos'],
      routerTitle: <><RouterDisc /> ROUTER · CAPA 3</>,
      routerPoints: ['conecta redes distintas por IP', 'tabla de rutas: estática o dinámica (OSPF, BGP)', 'NAT + DHCP + puertos WAN y LAN'],
      footer: 'el switch une UNA red · el router une redes ENTRE SÍ',
    },
    s3: {
      heading: <>Y EL <span style={{ color: THEME.cyan }}>CABLEADO</span></>,
      media: [
        { name: 'COBRE', desc: 'UTP/RJ45 · barato y universal · hasta ~100 m', visual: <PatchCord width={210} color="#c97a3d" /> },
        { name: 'FIBRA', desc: 'luz en vez de electricidad · velocidad y distancia', visual: <FiberCable /> },
        { name: 'WIFI (AP)', desc: 'sin cables · laptops y celulares', visual: <span style={{ fontSize: 34 }}>📶</span> },
      ],
      closeTitle: <>EL SWITCH UNE LA LAN, <span style={{ color: THEME.amber }}>EL ROUTER LA SACA</span></>,
      closeSubtitle: 'y el access point abre la puerta sin cables',
    },
  },
  en: {
    s1: {
      title: <>THE <span style={{ color: THEME.dim }}>HUB</span>: THE FOSSIL</>,
      subtitle: 'layer 1 — repeats everything to everyone',
      heading: 'LAYER 1 · ONE SINGLE JOB',
      points: [
        'repeats everything it receives to EVERY port',
        "doesn't understand MACs and makes no decisions",
        'with hubs, sniffing was trivial',
      ],
    },
    s2: {
      heading: 'SWITCH VS ROUTER',
      switchTitle: '🔀 SWITCH · LAYER 2',
      switchPoints: ['learns which MAC lives on each port', 'delivers only to the destination', 'VLANs, monitoring, port security'],
      routerTitle: <><RouterDisc /> ROUTER · LAYER 3</>,
      routerPoints: ['connects different networks by IP', 'routing table decides where each packet goes', 'NAT + DHCP + WAN and LAN ports'],
      footer: 'the switch joins ONE network · the router joins networks TO EACH OTHER',
    },
    s3: {
      heading: <>AND THE <span style={{ color: THEME.cyan }}>CABLING</span></>,
      media: [
        { name: 'COPPER', desc: 'UTP/RJ45 · cheap and universal · up to ~100 m', visual: <PatchCord width={210} color="#c97a3d" /> },
        { name: 'FIBER', desc: 'light instead of electricity · speed and distance', visual: <FiberCable /> },
        { name: 'WIFI (AP)', desc: 'no cables · laptops and phones', visual: <span style={{ fontSize: 34 }}>📶</span> },
      ],
      closeTitle: <>THE SWITCH JOINS THE LAN, <span style={{ color: THEME.amber }}>THE ROUTER GETS IT OUT</span></>,
      closeSubtitle: 'and the access point opens the door without cables',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 6.1, points: [1.75, 4.5, 7.04] },
    s2: { switchAt: [1.71, 3.1, 7.91], routerAt: [10.83, 13.16, 17.06] },
    s3: { closeAt: 22.7, media: [2.09, 5.9, 10.77] },
  },
  en: {
    s1: { panelAt: 10.0, points: [3.6, 6.8, 10.5] },
    s2: { switchAt: [5.1, 7.7, 13.4], routerAt: [20.1, 24.9, 27.8] },
    s3: { closeAt: 23.5, media: [2.9, 10.7, 17.5] },
  },
};

const MEDIA_COLORS = [THEME.amber, THEME.cyan, THEME.green];
const VID = 'networksI-04-devices';

// ── Scene 1: el hub ──────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 49, marginBottom: 18 }}>🔌</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.dim, fontFamily: MONO, marginBottom: 20 }}>
            {c.heading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            <RevealLine at={b.points[0]} fps={fps} mark="▸" color={THEME.red}>{c.points[0]}</RevealLine>
            <RevealLine at={b.points[1]} fps={fps} mark="✗" color={THEME.red}>{c.points[1]}</RevealLine>
            <RevealLine at={b.points[2]} fps={fps} mark="✓" color={THEME.amber}>{c.points[2]}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: switch VS router ─────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1080 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>{c.switchTitle}</div>
        {c.switchPoints.map((p, i) => (
          <RevealLine key={i} at={b.switchAt[i]} fps={fps} mark="▸" color={THEME.cyan}>{p}</RevealLine>
        ))}
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>{c.routerTitle}</div>
        {c.routerPoints.map((p, i) => (
          <RevealLine key={i} at={b.routerAt[i]} fps={fps} mark="▸" color={THEME.green}>{p}</RevealLine>
        ))}
      </div>
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.amber, fontFamily: MONO, fontWeight: 700 }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: el cableado + AP + cierre ────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 22, width: 1000 }}>
            {c.media.map((m, i) => (
              <div key={m.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${MEDIA_COLORS[i]}60`,
                borderRadius: 16, padding: '22px 20px', textAlign: 'center',
              }}>
                <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{m.visual}</div>
                <RevealLine at={b.media[i]} fps={fps} mark="◆" color={MEDIA_COLORS[i]}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>{m.name}</span>
                </RevealLine>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{m.desc}</div>
              </div>
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

// ── Componente principal ────────────────────────────────────────────
export const Re1Devices: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksI-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksI-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksI-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
