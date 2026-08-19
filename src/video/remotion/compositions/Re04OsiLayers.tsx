// ── video/remotion/compositions/Re04OsiLayers.tsx ──────────────────
// Video: modelo OSI (las 7 capas) vs TCP/IP (las 4 capas).
// Lección redes-04 del Academy. Guiones: voicebox-scripts/re-04-*.txt
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

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: ¿por qué capas? analogía del correo ──────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>¿POR QUÉ <span style={{ color: THEME.cyan }}>CAPAS</span>?</>}
          subtitle="cada capa, un trabajo puntual"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            LA ANALOGÍA DEL <span style={{ color: THEME.amber }}>CORREO POSTAL</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[
              { icon: '✍️', label: 'escribís la carta', sub: 'capa de aplicación', at: 8 },
              { icon: '📮', label: 'clasifican y viaja', sub: 'capas inferiores', at: 10.5 },
              { icon: '📖', label: 'alguien la lee', sub: 'en destino', at: 14 },
            ].map((step, i) => (
              <React.Fragment key={step.sub}>
                {i > 0 && <span style={{ fontSize: 30, color: THEME.dim }}>→</span>}
                <div style={{
                  background: THEME.panel, border: `1px solid ${THEME.cyan}50`,
                  borderRadius: 14, padding: '20px 26px', textAlign: 'center', width: 240,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{step.icon}</div>
                  <RevealLine at={step.at} fps={fps} mark="" color={THEME.cyan}>
                    <span style={{ fontSize: 17 }}>{step.label}</span>
                  </RevealLine>
                  <div style={{ fontSize: 12, color: THEME.dim, fontFamily: MONO, marginTop: 8 }}>{step.sub}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: las 7 capas OSI de arriba a abajo ────────────────────
const OSI_LAYERS = [
  { n: 7, name: 'APLICACIÓN', detail: 'HTTP · DNS · SSH', color: THEME.purple, at: 1.2 },
  { n: 6, name: 'PRESENTACIÓN', detail: 'formato · cifrado', color: THEME.purple, at: 7.5 },
  { n: 5, name: 'SESIÓN', detail: 'mantener la conversación', color: THEME.cyan, at: 9.3 },
  { n: 4, name: 'TRANSPORTE', detail: 'TCP/UDP · puertos', color: THEME.cyan, at: 11 },
  { n: 3, name: 'RED', detail: 'IP · rutas', color: THEME.green, at: 14.1 },
  { n: 2, name: 'ENLACE', detail: 'MAC · ethernet (switch)', color: THEME.green, at: 18.4 },
  { n: 1, name: 'FÍSICA', detail: 'cables · fibra · wifi', color: THEME.amber, at: 21.2 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      LAS <span style={{ color: THEME.cyan }}>7 CAPAS</span> DE OSI
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 860 }}>
      {OSI_LAYERS.map(l => (
        <div key={l.n} style={{
          display: 'flex', alignItems: 'center', gap: 18,
          background: THEME.panel, border: `1px solid ${l.color}50`,
          borderLeft: `6px solid ${l.color}`, borderRadius: 8, padding: '10px 20px',
          opacity: undefined,
        }}>
          <RevealLine at={l.at} fps={fps} mark="" color={l.color}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, width: '100%' }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: l.color, fontFamily: MONO, minWidth: 30 }}>{l.n}</span>
              <span style={{ fontSize: 19, fontWeight: 700, color: THEME.text, fontFamily: MONO, minWidth: 190 }}>{l.name}</span>
              <span style={{ fontSize: 15, color: THEME.muted, fontFamily: MONO }}>{l.detail}</span>
            </div>
          </RevealLine>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Escena 3: TCP/IP junta todo en 4 + cierre ──────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(10.5 * fps);
  const TCP = [
    { name: 'APLICACIÓN', detail: 'HTTP · DNS · SSH', color: THEME.purple, at: 1 },
    { name: 'TRANSPORTE', detail: 'TCP / UDP', color: THEME.cyan, at: 2 },
    { name: 'INTERNET', detail: 'IP', color: THEME.green, at: 3 },
    { name: 'ACCESO A RED', detail: 'ethernet / wifi', color: THEME.amber, at: 3.7 },
  ];
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            INTERNET CORRE CON <span style={{ color: THEME.green }}>TCP/IP</span>: 7 CAPAS → 4
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1140 }}>
            {TCP.map(l => (
              <div key={l.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${l.color}60`,
                borderTop: `5px solid ${l.color}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center',
              }}>
                <RevealLine at={l.at} fps={fps} mark="◆" color={l.color}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{l.name}</span>
                </RevealLine>
                <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{l.detail}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>"CAPA 2" Y "CAPA 3" = <span style={{ color: THEME.amber }}>MODELO OSI</span></>}
          subtitle="siempre que lo escuches en un lab"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re04OsiLayers: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re-04-osi-layers'];
  const starts = sceneStartFrames('re-04-osi-layers', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re-04-osi-layers');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re-04-osi-layers/re-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re-04-osi-layers/re-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re-04-osi-layers/re-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
