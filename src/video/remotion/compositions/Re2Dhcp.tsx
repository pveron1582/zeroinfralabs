// ── video/remotion/compositions/Re2Dhcp.tsx ──────────────────────────
// Video: DHCP — el servicio que reparte las direcciones IP.
// Lección network-06 del Academy (Redes II). Guiones: voicebox-scripts/re2-01-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-01-scene*.wav.

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

// ── Escena 1: qué es y qué hace ────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(7.34 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>EL QUE <span style={{ color: THEME.cyan }}>REPARTE</span> LAS IP</>}
          subtitle="DHCP — Dynamic Host Configuration Protocol"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            TE DA <span style={{ color: THEME.cyan }}>TODO</span> AL CONECTARTE
          </div>
          <div style={{ display: 'flex', gap: 16, width: 980, justifyContent: 'center' }}>
            {[
              { label: 'IP', color: THEME.cyan },
              { label: 'MÁSCARA', color: THEME.green },
              { label: 'GATEWAY', color: THEME.amber },
              { label: 'DNS', color: THEME.purple },
            ].map((x) => (
              <div key={x.label} style={{
                background: THEME.panel, border: `1px solid ${x.color}60`, borderRadius: 14,
                padding: '20px 22px', textAlign: 'center', width: 200,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: x.color, fontFamily: MONO }}>
                  <RevealLine at={0} fps={fps} mark="" color={x.color}>{x.label}</RevealLine>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 860, textAlign: 'left', marginTop: 24 }}>
            <RevealLine at={3.87} fps={fps} mark="🔑" color={THEME.amber}>alquileres: te presta la IP y la renueva antes de vencer</RevealLine>
            <RevealLine at={9.7} fps={fps} mark="▸" color={THEME.cyan}>sin él: todo configurado a mano</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: DORA ─────────────────────────────────────────────────
const DORA = [
  { letter: 'D', name: 'DISCOVER', color: THEME.cyan, desc: 'el cliente grita al broadcast: ¿hay DHCP?' },
  { letter: 'O', name: 'OFFER', color: THEME.green, desc: 'el servidor ofrece una IP libre' },
  { letter: 'R', name: 'REQUEST', color: THEME.amber, desc: 'el cliente acepta esa oferta' },
  { letter: 'A', name: 'ACK', color: THEME.purple, desc: 'el servidor confirma y firma el alquiler' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      EL HANDSHAKE: <span style={{ color: THEME.cyan }}>DORA</span>
    </div>
    <div style={{ display: 'flex', gap: 16, width: 1120 }}>
      {DORA.map((d, i) => {
        const at = [6.39, 8.79, 13.38, 17.57][i];
        return (
        <div key={d.letter} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${d.color}60`, borderRadius: 16,
          padding: '20px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: d.color, fontFamily: MONO, marginBottom: 6 }}>
            <RevealLine at={at} fps={fps} mark="" color={d.color}>{d.letter}</RevealLine>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{d.name}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{d.desc}</div>
        </div>
        );
      })}
    </div>
    <div style={{ marginTop: 24, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      todo por UDP · puertos 67 y 68 · en segundos
    </div>
  </AbsoluteFill>
);

// ── Escena 3: estática vs DHCP + rogue DHCP + cierre ───────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(27.75 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
            DHCP NO AUTENTICA: <span style={{ color: THEME.red }}>ROGUE DHCP</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$ dhclient -v eth0" width={700} delay={Math.round(15.52 * fps)}>
            <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.cyan }}>DHCPDISCOVER</span> on eth0 to 255.255.255.255
              {'\n'}<span style={{ color: THEME.green }}>DHCPOFFER</span> of 192.168.1.34 from 192.168.1.1
              {'\n'}<span style={{ color: THEME.amber }}>DHCPREQUEST</span> for 192.168.1.34
              {'\n'}<span style={{ color: THEME.purple }}>DHCPACK</span> of 192.168.1.34
            </div>
          </TerminalWindow>
          <div style={{ width: 880, textAlign: 'left', marginTop: 16 }}>
            <RevealLine at={18.42} fps={fps} mark="🕳️" color={THEME.red}>un servidor falso reparte gateway/DNS maliciosos → MITM sin pelear por ARP</RevealLine>
            <RevealLine at={26.23} fps={fps} mark="🛡️" color={THEME.green}>defensa: DHCP snooping (solo puertos autorizados)</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DHCP = <span style={{ color: THEME.cyan }}>MAGIA</span> QUE HAY QUE VIGILAR</>}
          subtitle="reparte IPs · y a veces, a manos equivocadas"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2Dhcp: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re2-01-dhcp'];
  const starts = sceneStartFrames('re2-01-dhcp', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re2-01-dhcp');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-01-dhcp/re2-01-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-01-dhcp/re2-01-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-01-dhcp/re2-01-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};