// ── video/remotion/compositions/Re1ProtocolsByLayer.tsx ───────────
// Video: protocolos por capa — los imprescindibles.
// Lección networksI-01 del Academy (Redes I). Guiones: voicebox-scripts/re1-01-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-01-scene*.wav.
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
    s1: {
      title: <>¿QUÉ ES UN <span style={{ color: THEME.cyan }}>PROTOCOLO</span>?</>,
      subtitle: 'un acuerdo sobre cómo comunicarse',
      heading: <>LOS EQUIPOS NO HABLAN <span style={{ color: THEME.cyan }}>CUALQUIER IDIOMA</span></>,
      points: [
        'formato de los datos: cómo se escriben',
        'cómo se inicia y termina la conversación',
        'distintos protocolos = no se entienden',
      ],
    },
    s2: {
      heading: <>CAPA 2 Y CAPA 3: <span style={{ color: THEME.cyan }}>QUIÉN HACE QUÉ</span></>,
      protocols: [
        { name: 'ETHERNET', layer: 'capa 2', desc: 'une equipos de la misma red por MAC' },
        { name: 'ARP', layer: 'capa 2/3', desc: 'descubre la MAC que corresponde a una IP — lo explota ARP spoofing' },
        { name: 'IP', layer: 'capa 3', desc: 'direcciona y enruta paquetes entre redes' },
        { name: 'ICMP', layer: 'capa 3', desc: 'diagnóstico y control — el protocolo del ping' },
      ],
    },
    s3: {
      heading: <>CAPA 4: <span style={{ color: THEME.green }}>TCP</span> VS <span style={{ color: THEME.amber }}>UDP</span></>,
      tcpPoints: ['orientado a conexión', 'garantiza: completo y en orden', 'web · correo · SSH'],
      udpPoints: ['sin conexión, rápido', 'no garantiza la entrega', 'streaming · juegos · DNS'],
      footer: <>capa 7: HTTP · DNS · SSH · SMTP — <span style={{ color: THEME.purple }}>todo lo que tocás en un lab</span></>,
      closeTitle: <>SABER LA CAPA = <span style={{ color: THEME.amber }}>SABER QUÉ HERRAMIENTA</span></>,
      closeSubtitle: 'cada protocolo vive en su piso',
    },
  },
  en: {
    s1: {
      title: <>WHAT IS A <span style={{ color: THEME.cyan }}>PROTOCOL</span>?</>,
      subtitle: 'an agreement on how to communicate',
      heading: <>MACHINES DON'T SPEAK <span style={{ color: THEME.cyan }}>JUST ANY LANGUAGE</span></>,
      points: [
        'the data format: how it\'s written',
        'how the conversation starts and ends',
        'different protocols = they don\'t understand each other',
      ],
    },
    s2: {
      heading: <>LAYER 2 AND LAYER 3: <span style={{ color: THEME.cyan }}>WHO DOES WHAT</span></>,
      protocols: [
        { name: 'ETHERNET', layer: 'layer 2', desc: 'connects machines on the same network by MAC' },
        { name: 'ARP', layer: 'layer 2/3', desc: 'discovers which MAC matches each IP — the one ARP spoofing exploits' },
        { name: 'IP', layer: 'layer 3', desc: 'addresses and routes packets between networks' },
        { name: 'ICMP', layer: 'layer 3', desc: 'diagnostics and control — the protocol ping uses' },
      ],
    },
    s3: {
      heading: <>LAYER 4: <span style={{ color: THEME.green }}>TCP</span> VS <span style={{ color: THEME.amber }}>UDP</span></>,
      tcpPoints: ['connection oriented', 'guarantees: complete and in order', 'web · email · SSH'],
      udpPoints: ['no connection, faster', 'doesn\'t guarantee delivery', 'streaming · games · DNS'],
      footer: <>layer 7: HTTP · DNS · SSH · SMTP — <span style={{ color: THEME.purple }}>everything you touch in a lab</span></>,
      closeTitle: <>KNOWING THE LAYER = <span style={{ color: THEME.amber }}>KNOWING THE TOOL</span></>,
      closeSubtitle: 'every protocol lives on its own floor',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 3.39, points: [2.62, 4.16, 8.28] },
    s2: { protocols: [1.32, 2.79, 5.68, 8.52] },
    s3: { closeAt: 18.51, tcp: [0, 1.04, 2.75], udp: [2.88, 8.71, 10.86] },
  },
  en: {
    s1: { panelAt: 3.9, points: [2.6, 4.6, 11.9] },
    s2: { protocols: [1.5, 6.3, 12.1, 16.1] },
    s3: { closeAt: 30.5, tcp: [2.7, 5.8, 8.7], udp: [12.3, 15.6, 17.6] },
  },
};

const PROTO_COLORS = [THEME.cyan, THEME.amber, THEME.green, THEME.purple];
const VID = 're1-01-protocols-by-layer';

// ── Escena 1: qué es un protocolo ──────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', width: 820, textAlign: 'left' }}>
            <RevealLine at={b.points[0]} fps={fps} mark="▸" color={THEME.cyan}>{c.points[0]}</RevealLine>
            <RevealLine at={b.points[1]} fps={fps} mark="▸" color={THEME.cyan}>{c.points[1]}</RevealLine>
            <RevealLine at={b.points[2]} fps={fps} mark="✗" color={THEME.red}>{c.points[2]}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: capa 2 y 3 ──────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
      {c.heading}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: 1000 }}>
      {c.protocols.map((p, i) => (
        <div key={p.name} style={{
          background: THEME.panel, border: `1px solid ${PROTO_COLORS[i]}60`,
          borderRadius: 16, padding: '20px 24px', textAlign: 'left',
        }}>
          <RevealLine at={b.protocols[i]} fps={fps} mark="◆" color={PROTO_COLORS[i]}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{p.name}</span>
            <span style={{ fontSize: 13, color: THEME.dim, marginLeft: 10 }}>{p.layer}</span>
          </RevealLine>
          <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{p.desc}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: capa 4 (TCP/UDP) + capa 7 + cierre ──────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 24, width: 900 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>TCP</div>
              {c.tcpPoints.map((p, i) => (
                <RevealLine key={i} at={b.tcp[i]} fps={fps} mark="▸" color={THEME.green}>{p}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>UDP</div>
              {c.udpPoints.map((p, i) => (
                <RevealLine key={i} at={b.udp[i]} fps={fps} mark="▸" color={THEME.amber}>{p}</RevealLine>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
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
export const Re1ProtocolsByLayer: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
