// ── video/remotion/compositions/Re1Vlans.tsx ───────────────────────
// Video: VLANs — segmentación por diseño.
// Lección proto-05 del Academy (Redes I). Guiones: voicebox-scripts/re1-05-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-05-scene*.wav.

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: qué es una VLAN ──────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(1.63 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>¿QUÉ ES UNA <span style={{ color: THEME.purple }}>VLAN</span>?</>}
          subtitle="una red lógica dentro de la física"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            {[
              { icon: '💰', name: 'CONTABILIDAD', color: THEME.cyan },
              { icon: '🖥️', name: 'SERVIDORES', color: THEME.green },
              { icon: '📹', name: 'CÁMARAS', color: THEME.amber },
              { icon: '📱', name: 'INVITADOS', color: THEME.purple },
            ].map((v) => (
              <div key={v.name} style={{
                background: THEME.panel, border: `1px solid ${v.color}60`, borderRadius: 14, padding: '18px 20px', textAlign: 'center', width: 180,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{v.icon}</div>
                <RevealLine at={0} fps={fps} mark="◆" color={v.color}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{v.name}</span>
                </RevealLine>
              </div>
            ))}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 840, textAlign: 'left' }}>
            <RevealLine at={7.16} fps={fps} mark="▸" color={THEME.purple}>grupo de puertos que se comporta como su propio switch</RevealLine>
            <RevealLine at={12.42} fps={fps} mark="✗" color={THEME.red}>sin un router que deje cruzar, no se hablan</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: segmentación + dominios de broadcast ──────────────────
const VLAN_PLANS = [
  { name: 'VLAN 10', desc: 'empleados', color: THEME.cyan },
  { name: 'VLAN 20', desc: 'servidores', color: THEME.green },
  { name: 'VLAN 30', desc: 'cámaras / IoT', color: THEME.amber },
  { name: 'VLAN 40', desc: 'invitados', color: THEME.purple },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      DECIDÍS EL MAPA <span style={{ color: THEME.cyan }}>ANTES</span> DE QUE PASE NADA
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1000 }}>
      {VLAN_PLANS.map((v, i) => {
        const at = [5.11, 7.74, 11.68, 14.07][i];
        return (
        <div key={v.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${v.color}60`,
          borderTop: `5px solid ${v.color}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center',
        }}>
          <RevealLine at={at} fps={fps} mark="◆" color={v.color}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{v.name}</span>
          </RevealLine>
          <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{v.desc}</div>
        </div>
        );
      })}
    </div>
    <div style={{ marginTop: 28, fontSize: 20, color: THEME.green, fontFamily: MONO, fontWeight: 800 }}>
      CADA BROADCAST SE QUEDA EN SU PROPIA VLAN
    </div>
    <div style={{ marginTop: 10, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      cien equipos por VLAN = cuatro dominios chicos, no uno gigante
    </div>
  </AbsoluteFill>
);

// ── Escena 3: el tag 802.1Q + trunk + seguridad + cierre ───────────
// Topología visual: switch central + cables de color por VLAN hacia los
// equipos (mismos colores de VLAN 10/20/30).
const NODES = [
  { label: 'PC', at: 9.5, color: THEME.cyan },
  { label: 'PC', at: 11, color: THEME.cyan },
  { label: 'SRV', at: 12.5, color: THEME.green },
  { label: 'CAM', at: 14, color: THEME.amber },
];

const SWITCH_W = 110;
const SWITCH_Y = 120;
const NODE_Y = 28;
const NODE_R = 26;
const W = NODES.length * 130 + SWITCH_W; // ancho del canvas

const VlanTopology: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame - Math.round(9 * fps), [0, 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const cx = W / 2;
  return (
    <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 12}px)`, display: 'flex', justifyContent: 'center' }}>
      <svg width={W} height={SWITCH_Y + NODE_R + 30} viewBox={`0 0 ${W} ${SWITCH_Y + NODE_R + 30}`}>
        {/* cables por VLAN al switch */}
        {NODES.map((d, i) => {
          const nx = i * 130 + 65;
          const t = interpolate(frame - Math.round(d.at * fps), [0, 10], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <React.Fragment key={i}>
              <line x1={nx} y1={NODE_Y + NODE_R} x2={nx + (cx - nx) * t} y2={NODE_Y + NODE_R + (SWITCH_Y - NODE_Y - NODE_R) * t}
                stroke={d.color} strokeWidth={4} strokeLinecap="round" />
              <circle cx={nx} cy={NODE_Y} r={NODE_R} fill={THEME.panel} stroke={d.color} strokeWidth={1.5} />
              <text x={nx} y={NODE_Y + 5} textAnchor="middle" fill={d.color} fontFamily={MONO} fontSize={13} fontWeight={800}>{d.label}</text>
            </React.Fragment>
          );
        })}
        {/* switch */}
        <rect x={cx - SWITCH_W / 2} y={SWITCH_Y} width={SWITCH_W} height={26} rx={6} fill={THEME.panel} stroke={THEME.text} strokeWidth={1.5} />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={cx - 46 + i * 13} y={SWITCH_Y + 9} width={8} height={8} rx={1} fill={THEME.purple} opacity={0.8} />
        ))}
        <text x={cx} y={SWITCH_Y + 40} textAnchor="middle" fill={THEME.muted} fontFamily={MONO} fontSize={13}>switch</text>
      </svg>
    </div>
  );
};

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(31.53 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 14 }}>
            EL <span style={{ color: THEME.purple }}>TAG 802.1Q</span>: 4 BYTES QUE DICEN EL PISO
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <TerminalWindow title="switch# show vlan brief" width={540} delay={Math.round(8.57 * fps)}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.amber }}>VLAN  Name        Status  Ports</span>
                {'\n'}<span style={{ color: THEME.dim }}>----  ----------  ------  ----------</span>
                {'\n'}<span style={{ color: THEME.cyan }}>10    EMPLEADOS   active  Fa0/1-8</span>
                {'\n'}<span style={{ color: THEME.green }}>20    SERVIDORES  active  Fa0/9-10</span>
                {'\n'}<span style={{ color: THEME.amber }}>30    CAMARAS     active  Fa0/11-16</span>
                {'\n'}<span style={{ color: THEME.red }}>40    INVITADOS   active  Fa0/17-24</span>
              </div>
            </TerminalWindow>
            <TerminalWindow title="switch# show interfaces trunk" width={540} delay={Math.round(9.4 * fps)}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.amber }}>Port   Mode  Encapsulation  Status     Native</span>
                {'\n'}<span style={{ color: THEME.green }}>Fa0/24 on    802.1q         trunking   1</span>
                {'\n'}
                {'\n'}<span style={{ color: THEME.amber }}>Port   Vlans allowed on trunk</span>
                {'\n'}<span style={{ color: THEME.green }}>Fa0/24 10,20,30</span>
              </div>
            </TerminalWindow>
          </div>
          <VlanTopology fps={fps} />
          <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RevealLine at={21.01} fps={fps} mark="🔒" color={THEME.green}>contención: el atacante queda en su propio segmento</RevealLine>
            <RevealLine at={30.6} fps={fps} mark="✗" color={THEME.red}>segmentación, no cifrado: el VLAN hopping intenta saltar</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>VLAN: <span style={{ color: THEME.purple }}>PAREDES</span> DENTRO DEL SWITCH</>}
          subtitle="sin mover un solo cable"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1Vlans: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re1-05-vlans'];
  const starts = sceneStartFrames('re1-05-vlans', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re1-05-vlans');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-05-vlans/re1-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-05-vlans/re1-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-05-vlans/re1-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
