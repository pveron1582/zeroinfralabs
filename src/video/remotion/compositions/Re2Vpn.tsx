// ── video/remotion/compositions/Re2Vpn.tsx ───────────────────────────
// Video: VPN — túneles cifrados que extienden la red.
// Lección network-09 del Academy (Redes II). Guiones: voicebox-scripts/re2-04-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-04-scene*.wav.

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

// ── Escena 1: qué es ───────────────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>UN <span style={{ color: THEME.purple }}>TÚNEL</span> SOBRE INTERNET</>}
          subtitle="VPN — Virtual Private Network"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            BUENOS AIRES ↔ <span style={{ color: THEME.purple }}>MADRID</span>: UNA SOLA RED
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>🏢</span>
            <div style={{ width: 440, height: 38, borderRadius: 19, border: `2px dashed ${THEME.purple}`, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.purple}40 0 10px, transparent 10px 20px)` }} />
            <span style={{ fontSize: 40 }}>🏢</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 820, textAlign: 'left' }}>
            <RevealLine at={3.62} fps={fps} mark="▸" color={THEME.purple}>virtual: no usa cables dedicados</RevealLine>
            <RevealLine at={5.03} fps={fps} mark="🔒" color={THEME.green}>privada: todo cifrado y autenticado</RevealLine>
            <RevealLine at={8.58} fps={fps} mark="💼" color={THEME.cyan}>el empleado remoto queda "sentado en la oficina"</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: los 3 trabajos + protocolos ──────────────────────────
const JOBS = [
  { name: 'CONFIDENCIALIDAD', icon: '🔒', color: THEME.green, desc: 'nadie ve tu tráfico en el camino' },
  { name: 'INTEGRIDAD', icon: '🛡️', color: THEME.cyan, desc: 'nadie altera los paquetes' },
  { name: 'AUTENTICIDAD', icon: '🔑', color: THEME.amber, desc: 'solo entran usuarios con credenciales' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      LOS <span style={{ color: THEME.purple }}>3 TRABAJOS</span> DE UNA VPN
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1000 }}>
      {JOBS.map((j, i) => {
        const at = [2.33, 6.79, 10.62][i];
        return (
        <div key={j.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${j.color}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>{j.icon}</div>
          <RevealLine at={at} fps={fps} mark="◆" color={j.color}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{j.name}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{j.desc}</div>
        </div>
        );
      })}
    </div>
    <div style={{ marginTop: 26, width: 940 }}>
      <div style={{ fontSize: 15, color: THEME.muted, fontFamily: MONO, marginBottom: 12 }}>LOS PROTOCOLOS:</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { n: 'IPsec', c: THEME.cyan, d: 'clásico · capa 3 · site-to-site' },
          { n: 'OpenVPN', c: THEME.green, d: 'flexible · UDP/TCP' },
          { n: 'WireGuard', c: THEME.amber, d: 'moderno · rápido' },
          { n: 'TLS VPN', c: THEME.purple, d: 'entra por el navegador' },
        ].map((p, i) => {
          const at = [17.63, 23.66, 27.63, 30.38][i];
          return (
          <RevealLine key={p.n} at={at} fps={fps} mark="" color={p.c}>
            <span style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: THEME.panel, border: `1px solid ${p.c}60`, borderRadius: 10, padding: '10px 18px',
            }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: p.c }}>{p.n}</span>
              <span style={{ fontSize: 11, color: THEME.muted }}>{p.d}</span>
            </span>
          </RevealLine>
          );
        })}
      </div>
    </div>
  </AbsoluteFill>
);

// ── Escena 3: qué protege y qué no + cierre ────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(28.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            PROTEGE EL <span style={{ color: THEME.green }}>CAMINO</span>, NO EL DESTINO
          </div>
          <div style={{ display: 'flex', gap: 24, width: 960 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>✓ SÍ</div>
              <RevealLine at={2.8} fps={fps} mark="▸" color={THEME.green}>WiFi abierto: nadie lee tu tráfico</RevealLine>
              <RevealLine at={5.5} fps={fps} mark="▸" color={THEME.green}>unir dos sedes en una LAN</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 8 }}>✗ NO</div>
              <RevealLine at={7.18} fps={fps} mark="▸" color={THEME.red}>máquina con debilidades en el otro extremo</RevealLine>
              <RevealLine at={10.0} fps={fps} mark="▸" color={THEME.red}>un servidor VPN con versión vieja</RevealLine>
            </div>
          </div>
          <div style={{ marginTop: 22, width: 900, textAlign: 'left' }}>
            <RevealLine at={13.99} fps={fps} mark="🎯" color={THEME.amber}>pentester: credencial de VPN comprometida = entrada directa a la red</RevealLine>
            <RevealLine at={23.34} fps={fps} mark="🛡️" color={THEME.green}>defensas: MFA · certificados de cliente · parcharlo</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>LA VPN ES <span style={{ color: THEME.purple }}>UN TRANSPORTE</span>, NO UNA VARITA</>}
          subtitle="cifra el camino · no perdona el destino débil"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2Vpn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re2-04-vpn'];
  const starts = sceneStartFrames('re2-04-vpn', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re2-04-vpn');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-04-vpn/re2-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-04-vpn/re2-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-04-vpn/re2-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};