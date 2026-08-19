// ── video/remotion/compositions/Re01NetworkTypes.tsx ───────────────
// Video: ¿qué es una red? Nodos, tamaños (PAN/LAN/MAN/WAN) y la VPN.
// Lección redes-01 del Academy. Guiones: voicebox-scripts/re-01-*.txt
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

const NODES = ['💻 compu', '📱 celu', '🗄️ servidor', '🖨️ impresora'];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>¿QUÉ ES UNA <span style={{ color: THEME.cyan }}>RED</span>?</>}
          subtitle="dispositivos conectados para compartir"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            {NODES.map(n => (
              <div key={n} style={{
                background: THEME.panel, border: `1px solid ${THEME.cyan}60`,
                borderRadius: 14, padding: '18px 24px', fontSize: 22, color: THEME.text, fontFamily: MONO,
              }}>
                {n}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            CADA EQUIPO = <span style={{ color: THEME.green }}>UN NODO</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '22px 30px', textAlign: 'left', width: 760 }}>
            <RevealLine at={10.2} fps={fps} mark="▸" color={THEME.cyan}>por cable: ethernet, fibra óptica</RevealLine>
            <RevealLine at={12.5} fps={fps} mark="▸" color={THEME.cyan}>sin cable: wifi</RevealLine>
            <RevealLine at={14.7} fps={fps} mark="✓" color={THEME.green}>existe para compartir: archivos, impresoras, internet</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: tamaños PAN → LAN → MAN → WAN ────────────────────────
const SIZES = [
  { name: 'PAN', icon: '🎧', color: THEME.purple, desc: 'tu espacio personal (bluetooth)', at: 2.2 },
  { name: 'LAN', icon: '🏠', color: THEME.green, desc: 'casa u oficina — switch + wifi', at: 6.3 },
  { name: 'MAN', icon: '🏙️', color: THEME.amber, desc: 'ciudad o campus — une LANs', at: 7.7 },
  { name: 'WAN', icon: '🌍', color: THEME.cyan, desc: 'ciudades y países — internet', at: 11.0 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      TIPOS POR <span style={{ color: THEME.amber }}>TAMAÑO</span>
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1140 }}>
      {SIZES.map(s => (
        <div key={s.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`,
          borderRadius: 16, padding: '24px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 38, marginBottom: 10 }}>{s.icon}</div>
          <RevealLine at={s.at} fps={fps} mark="◆" color={s.color}>
            <span style={{ fontSize: 24, fontWeight: 800 }}>{s.name}</span>
          </RevealLine>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginTop: 12, lineHeight: 1.5 }}>
            {s.desc}
          </div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      la WAN más grande de todas = <span style={{ color: THEME.cyan }}>internet</span>
    </div>
  </AbsoluteFill>
);

// ── Escena 3: la VPN + cierre ──────────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(13.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            LA <span style={{ color: THEME.purple }}>VPN</span>: UN TÚNEL, NO UNA RED FÍSICA
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>💻</span>
            <div style={{ width: 420, height: 38, borderRadius: 19, border: `2px dashed ${THEME.purple}`, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.purple}40 0 10px, transparent 10px 20px)` }} />
            <span style={{ fontSize: 40 }}>🏢</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            <RevealLine at={4} fps={fps} mark="🔒" color={THEME.purple}>cifrado sobre internet: parecés estar adentro de otra red</RevealLine>
            <RevealLine at={7} fps={fps} mark="▸" color={THEME.cyan}>el empleado remoto entra a la oficina sin estar sentado ahí</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>REGLA UNO: <span style={{ color: THEME.amber }}>CONOCÉ EL MAPA</span></>}
          subtitle="después escaneás, después atacás"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re01NetworkTypes: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re-01-network-types'];
  const starts = sceneStartFrames('re-01-network-types', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re-01-network-types');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re-01-network-types/re-01-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re-01-network-types/re-01-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re-01-network-types/re-01-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
