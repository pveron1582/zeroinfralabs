// ── video/remotion/compositions/Re2Nat.tsx ───────────────────────────
// Video: NAT — cómo toda tu red sale a internet con una sola IP.
// Lección network-07 del Academy (Redes II). Guiones: voicebox-scripts/re2-02-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-02-scene*.wav.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: qué es NAT ───────────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(2.09 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>TODA TU CASA, <span style={{ color: THEME.green }}>UNA SOLA IP</span></>}
          subtitle="eso es NAT — Network Address Translation"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
            {['192.168.1.34', '192.168.1.20', '192.168.1.7'].map((ip) => (
              <KeyCapsule key={ip} label="privada" value={ip} accent={THEME.cyan} delay={0} size={20} />
            ))}
          </div>
          <div style={{ fontSize: 34, color: THEME.green, marginBottom: 16 }}>↓ ROUTER · NAT ↓</div>
          <KeyCapsule label="única IP pública" value="203.0.113.7" accent={THEME.green} delay={0} size={30} />
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 800, textAlign: 'left', marginTop: 24 }}>
            <RevealLine at={4.41} fps={fps} mark="▸" color={THEME.cyan}>las privadas no son ruteables en internet</RevealLine>
            <RevealLine at={5.52} fps={fps} mark="⇄" color={THEME.green}>reescribe cada paquete al salir y al volver</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: la tabla de traducción + PAT ─────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      LA <span style={{ color: THEME.green }}>TABLA DE TRADUCCIÓN</span>
    </div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 22 }}>
      <KeyCapsule label="PC interna" value="192.168.1.34:51234" accent={THEME.cyan} delay={Math.round(2.12 * fps)} size={19} />
      <span style={{ fontSize: 28, color: THEME.green }}>→</span>
      <KeyCapsule label="IP pública" value="203.0.113.7:40001" accent={THEME.green} delay={Math.round(5.44 * fps)} size={19} />
    </div>
    <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 880, textAlign: 'left' }}>
      <RevealLine at={10.12} fps={fps} mark="▸" color={THEME.cyan}>la respuesta llega al puerto 40001 → la tabla dice "es de la .34"</RevealLine>
      <RevealLine at={15.71} fps={fps} mark="🚫" color={THEME.red}>conexiones desde internet: no calzan → se descartan</RevealLine>
      <RevealLine at={18.74} fps={fps} mark="◆" color={THEME.amber}>PAT: cada equipo interno usa un puerto de salida distinto</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Escena 3: pros/contras + DNAT + cierre ─────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(28.27 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            <span style={{ color: THEME.green }}>PROS</span> Y <span style={{ color: THEME.red }}>CONTRAS</span>
          </div>
          <div style={{ display: 'flex', gap: 24, width: 960 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>✓ AHORRA IPs</div>
              <RevealLine at={4.53} fps={fps} mark="▸" color={THEME.green}>oculta tu topología interna</RevealLine>
              <RevealLine at={8.51} fps={fps} mark="▸" color={THEME.green}>bloquea conexiones entrantes: firewall gratis</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 8 }}>✗ ROMPE EL MODELO</div>
              <RevealLine at={14.87} fps={fps} mark="▸" color={THEME.red}>complica FTP, VoIP, P2P</RevealLine>
              <RevealLine at={19.19} fps={fps} mark="▸" color={THEME.red}>cada conexión consume una entrada de la tabla</RevealLine>
            </div>
          </div>
          <div style={{ marginTop: 22, width: 900, textAlign: 'left' }}>
            <RevealLine at={20.84} fps={fps} mark="🔓" color={THEME.amber}>DNAT / port forwarding: abre un hueco hacia adentro</RevealLine>
            <RevealLine at={25.2} fps={fps} mark="▸" color={THEME.cyan}>para el pentester: cada regla DNAT es lo que la red decidió exponer</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>NAT: <span style={{ color: THEME.green }}>1 IP PÚBLICA</span>, TODOS ADENTRO</>}
          subtitle="y cada DNAT, una puerta que alguien abrió"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2Nat: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re2-02-nat'];
  const starts = sceneStartFrames('re2-02-nat', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re2-02-nat');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-02-nat/re2-02-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-02-nat/re2-02-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-02-nat/re2-02-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};