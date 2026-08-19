// ── video/remotion/compositions/Re1ProtocolsByLayer.tsx ───────────
// Video: protocolos por capa — los imprescindibles.
// Lección proto-01 del Academy (Redes I). Guiones: voicebox-scripts/re1-01-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-01-scene*.wav.

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

// ── Escena 1: qué es un protocolo ──────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.39 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>¿QUÉ ES UN <span style={{ color: THEME.cyan }}>PROTOCOLO</span>?</>}
          subtitle="un acuerdo sobre cómo comunicarse"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            LOS EQUIPOS NO HABLAN <span style={{ color: THEME.cyan }}>CUALQUIER IDIOMA</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', width: 820, textAlign: 'left' }}>
            <RevealLine at={0} fps={fps} mark="▸" color={THEME.cyan}>formato de los datos: cómo se escriben</RevealLine>
            <RevealLine at={2.62} fps={fps} mark="▸" color={THEME.cyan}>cómo se inicia y termina la conversación</RevealLine>
            <RevealLine at={6.4} fps={fps} mark="✗" color={THEME.red}>distintos protocolos = no se entienden</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: capa 2 y 3 — Ethernet, ARP, IP, ICMP ────────────────
const L2L3 = [
  { name: 'ETHERNET', layer: 'capa 2', color: THEME.cyan, desc: 'une equipos de la misma red por MAC' },
  { name: 'ARP', layer: 'capa 2/3', color: THEME.amber, desc: 'descubre la MAC que corresponde a una IP — lo explota ARP spoofing' },
  { name: 'IP', layer: 'capa 3', color: THEME.green, desc: 'direcciona y enruta paquetes entre redes' },
  { name: 'ICMP', layer: 'capa 3', color: THEME.purple, desc: 'diagnóstico y control — el protocolo del ping' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
      CAPA 2 Y CAPA 3: <span style={{ color: THEME.cyan }}>QUIÉN HACE QUÉ</span>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: 1000 }}>
      {L2L3.map((p, i) => {
        const at = [1.32, 5.68, 11.44, 15.13][i];
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

// ── Escena 3: capa 4 (TCP/UDP) + capa 7 + cierre ──────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(16.03 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            CAPA 4: <span style={{ color: THEME.green }}>TCP</span> VS <span style={{ color: THEME.amber }}>UDP</span>
          </div>
          <div style={{ display: 'flex', gap: 24, width: 900 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>TCP</div>
              <RevealLine at={0} fps={fps} mark="▸" color={THEME.green}>orientado a conexión</RevealLine>
              <RevealLine at={1.04} fps={fps} mark="▸" color={THEME.green}>garantiza: completo y en orden</RevealLine>
              <RevealLine at={2.75} fps={fps} mark="▸" color={THEME.green}>web · correo · SSH</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>UDP</div>
              <RevealLine at={8.71} fps={fps} mark="▸" color={THEME.amber}>sin conexión, rápido</RevealLine>
              <RevealLine at={10.86} fps={fps} mark="▸" color={THEME.amber}>no garantiza la entrega</RevealLine>
              <RevealLine at={12.42} fps={fps} mark="▸" color={THEME.amber}>streaming · juegos · DNS</RevealLine>
            </div>
          </div>
          <div style={{ marginTop: 22, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            capa 7: HTTP · DNS · SSH · SMTP — <span style={{ color: THEME.purple }}>todo lo que tocás en un lab</span>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>SABER LA CAPA = <span style={{ color: THEME.amber }}>SABER QUÉ HERRAMIENTA</span></>}
          subtitle="cada protocolo vive en su piso"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1ProtocolsByLayer: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re1-01-protocols-by-layer'];
  const starts = sceneStartFrames('re1-01-protocols-by-layer', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re1-01-protocols-by-layer');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-01-protocols-by-layer/re1-01-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-01-protocols-by-layer/re1-01-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-01-protocols-by-layer/re1-01-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
