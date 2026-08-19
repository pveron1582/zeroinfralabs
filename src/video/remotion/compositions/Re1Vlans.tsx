// ── video/remotion/compositions/Re1Vlans.tsx ───────────────────────
// Video: VLANs — segmentación por diseño.
// Lección proto-05 del Academy (Redes I). Guiones: voicebox-scripts/re1-05-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-05-scene*.wav.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
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
              { icon: '🖨️', name: 'CONTABILIDAD', color: THEME.cyan },
              { icon: '🛡️', name: 'SERVIDORES', color: THEME.green },
              { icon: '📷', name: 'CÁMARAS', color: THEME.amber },
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
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(31.53 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            EL <span style={{ color: THEME.purple }}>TAG 802.1Q</span>: 4 BYTES QUE DICEN EL PISO
          </div>
          <TerminalWindow title="switch# show vlan brief" width={680} delay={Math.round(8.57 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.dim }}>10</span>   EMPLEADOS     Fa0/1-8
              {'\n'}<span style={{ color: THEME.dim }}>20</span>   SERVIDORES    Fa0/9-10
              {'\n'}<span style={{ color: THEME.dim }}>30</span>   CAMARAS       Fa0/11-16
              {'\n'}Port     Mode     Vlans allowed on trunk
              {'\n'}<span style={{ color: THEME.green }}>Fa0/24   trunk    10,20,30 (802.1Q)</span>
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 18, width: 860, textAlign: 'left' }}>
            <RevealLine at={15.73} fps={fps} mark="🔒" color={THEME.green}>contención: el atacante queda en su propio segmento</RevealLine>
            <RevealLine at={28.71} fps={fps} mark="✗" color={THEME.red}>segmentación, no cifrado: el VLAN hopping intenta saltar</RevealLine>
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
