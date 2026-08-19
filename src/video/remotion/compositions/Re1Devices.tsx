// ── video/remotion/compositions/Re1Devices.tsx ──────────────────────
// Video: dispositivos esenciales — hub, switch y router (+ cables + AP).
// Lección proto-04 del Academy (Redes I). Guiones: voicebox-scripts/re1-04-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-04-scene*.wav.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
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

// ── Escena 1: el hub — el fósil (capa 1) ──────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6.1 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>EL <span style={{ color: THEME.dim }}>HUB</span>: EL FÓSIL</>}
          subtitle="capa 1 — repite todo a todos"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 49, marginBottom: 18 }}>🔌</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.dim, fontFamily: MONO, marginBottom: 20 }}>
            CAPA 1 · UNA SOLA FUNCIÓN
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            <RevealLine at={1.95} fps={fps} mark="▸" color={THEME.red}>repite todo lo que recibe a TODOS los puertos</RevealLine>
            <RevealLine at={4.5} fps={fps} mark="✗" color={THEME.red}>no entiende MAC ni toma decisiones</RevealLine>
            <RevealLine at={7.04} fps={fps} mark="✓" color={THEME.amber}>con hubs, sniffear era trivial</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: switch (capa 2) VS router (capa 3) ──────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      SWITCH VS ROUTER
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1080 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>🖧 SWITCH · CAPA 2</div>
        <RevealLine at={1.71} fps={fps} mark="▸" color={THEME.cyan}>aprende qué MAC vive en cada puerto</RevealLine>
        <RevealLine at={3.1} fps={fps} mark="▸" color={THEME.cyan}>entrega solo al destino</RevealLine>
        <RevealLine at={7.91} fps={fps} mark="▸" color={THEME.cyan}>VLANs, monitoreo, seguridad de puertos</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>📡 ROUTER · CAPA 3</div>
        <RevealLine at={10.83} fps={fps} mark="▸" color={THEME.green}>conecta redes distintas por IP</RevealLine>
        <RevealLine at={13.16} fps={fps} mark="▸" color={THEME.green}>tabla de rutas: estática o dinámica (OSPF, BGP)</RevealLine>
        <RevealLine at={17.06} fps={fps} mark="▸" color={THEME.green}>NAT + DHCP + puertos WAN y LAN</RevealLine>
      </div>
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.amber, fontFamily: MONO, fontWeight: 700 }}>
      el switch une UNA red · el router une redes ENTRE SÍ
    </div>
  </AbsoluteFill>
);

// ── Escena 3: el cableado + AP + cierre ────────────────────────────
const MEDIA = [
  { name: 'COBRE', icon: '🔌', color: THEME.amber, desc: 'UTP/RJ45 · barato y universal · hasta ~100 m' },
  { name: 'FIBRA', icon: '💡', color: THEME.cyan, desc: 'luz en vez de electricidad · velocidad y distancia' },
  { name: 'WIFI (AP)', icon: '📶', color: THEME.green, desc: 'sin cables · laptops y celulares' },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(14.59 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            Y EL <span style={{ color: THEME.cyan }}>CABLEADO</span>
          </div>
          <div style={{ display: 'flex', gap: 22, width: 1000 }}>
{MEDIA.map((m, i) => {
        const at = [2.09, 5.9, 10.77][i];
        return (
        <div key={m.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${m.color}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>{m.icon}</div>
          <RevealLine at={at} fps={fps} mark="◆" color={m.color}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{m.name}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{m.desc}</div>
        </div>
        );
      })}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>EL SWITCH UNE LA LAN, <span style={{ color: THEME.amber }}>EL ROUTER LA SACA</span></>}
          subtitle="y el access point abre la puerta sin cables"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1Devices: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re1-04-devices'];
  const starts = sceneStartFrames('re1-04-devices', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re1-04-devices');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-04-devices/re1-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-04-devices/re1-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-04-devices/re1-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
