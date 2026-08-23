// ── video/remotion/compositions/Re02IpAddresses.tsx ────────────────
// Video: direcciones IP — formato, públicas vs privadas y NAT.
// Lección redes-02 del Academy. Guiones: voicebox-scripts/re-02-*.txt
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
import { KeyCapsule } from '../primitives/KeyCapsule';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: el formato de la IP ──────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>LA <span style={{ color: THEME.cyan }}>DIRECCIÓN IP</span></>}
          subtitle="la dirección postal de cada equipo"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {['192', '168', '1', '10'].map((part, i) => (
              <KeyCapsule key={part + i} label={`octeto ${i + 1} (0-255)`} value={part} accent={THEME.cyan} delay={2.2 + i * 0.8} size={40} />
            ))}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            4 NÚMEROS, DE <span style={{ color: THEME.amber }}>0 A 255</span>, SEPARADOS POR PUNTOS
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 760, textAlign: 'left' }}>
            <RevealLine at={0.4} fps={fps} mark="▸" color={THEME.cyan}>número único dentro de la red: a quién entregarle datos</RevealLine>
            <RevealLine at={5.8} fps={fps} mark="✗" color={THEME.red}>dos equipos con la misma IP = conflicto de IP</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: públicas vs privadas ─────────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      <span style={{ color: THEME.amber }}>PÚBLICAS</span> VS <span style={{ color: THEME.green }}>PRIVADAS</span>
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1120 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>🌍 PÚBLICA</div>
        <RevealLine at={1.5} fps={fps} mark="▸" color={THEME.amber}>única en todo internet</RevealLine>
        <RevealLine at={3.5} fps={fps} mark="▸" color={THEME.amber}>la asigna tu proveedor</RevealLine>
        <RevealLine at={5.5} fps={fps} mark="▸" color={THEME.amber}>cualquiera puede alcanzarla</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>🏠 PRIVADA</div>
        <RevealLine at={7.5} fps={fps} mark="▸" color={THEME.green}>interna de tu red</RevealLine>
        <RevealLine at={9} fps={fps} mark="▸" color={THEME.green}>intocable desde afuera</RevealLine>
        <RevealLine at={11} fps={fps} mark="▸" color={THEME.green}>rangos: 10.x · 172.16–31.x · 192.168.x</RevealLine>
      </div>
    </div>
    <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      tu casa: <span style={{ color: THEME.amber }}>pública afuera</span> → el router reparte <span style={{ color: THEME.green }}>privadas adentro</span>
    </div>
  </AbsoluteFill>
);

// ── Escena 3: NAT + ip addr ────────────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(14.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            <span style={{ color: THEME.cyan }}>NAT</span>: TODA TU CASA SALE CON UNA IP
          </div>
          <TerminalWindow title="kali@attacker-01:~$ ip addr" width={700} delay={Math.round(11 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>2: eth0: &lt;BROADCAST,MULTICAST,UP&gt;</span>
              {'\n'}    inet <span style={{ color: THEME.green }}>192.168.1.10</span>/24 scope global eth0
              {'\n'}<span style={{ color: THEME.dim }}>1: lo:</span>    inet <span style={{ color: THEME.cyan }}>127.0.0.1</span>/8 scope host lo
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 20, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            192.168.1.10 = privada · 127.0.0.1 = loopback (la máquina hablándose a sí misma)
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>EL ROUTER <span style={{ color: THEME.cyan }}>TRADUCE</span> TODO</>}
          subtitle="privadas adentro, una pública hacia afuera"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re02IpAddresses: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re-02-ip-addresses'];
  const starts = sceneStartFrames('re-02-ip-addresses', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re-02-ip-addresses');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re-02-ip-addresses/re-02-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re-02-ip-addresses/re-02-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re-02-ip-addresses/re-02-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
