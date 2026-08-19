// ── video/remotion/compositions/Re2Dmz.tsx ───────────────────────────
// Video: DMZ — separando lo público de lo privado.
// Lección network-04 del Academy (Redes II). Guiones: voicebox-scripts/re2-05-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-05-scene*.wav.

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

// ── Escena 1: el concepto ──────────────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(2.59 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>LO PÚBLICO ADELANTE, <span style={{ color: THEME.amber }}>LO PRIVADO ATRÁS</span></>}
          subtitle="DMZ — Zona Desmilitarizada"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>🌍</span>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.red}70`, borderRadius: 12, padding: '16px 22px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.red, fontFamily: MONO }}>🔥 FIREWALL</div>
              <div style={{ fontSize: 12, color: THEME.muted, fontFamily: MONO }}>decide quién entra</div>
            </div>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.amber}70`, borderRadius: 12, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: THEME.amber, fontFamily: MONO }}>DMZ</div>
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: MONO }}>web · correo</div>
            </div>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.green}70`, borderRadius: 12, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>LAN</div>
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: MONO }}>bd · PCs</div>
            </div>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 880, textAlign: 'left' }}>
            <RevealLine at={8.92} fps={fps} mark="🌐" color={THEME.amber}>servidores públicos: web y correo viven en la DMZ</RevealLine>
            <RevealLine at={14.62} fps={fps} mark="🔒" color={THEME.green}>bases de datos y PCs: LAN protegida</RevealLine>
            <RevealLine at={19.29} fps={fps} mark="🎯" color={THEME.red}>si hackean el web, quedan atrapados en la DMZ</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: las dos caras del firewall ───────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      LAS DOS CARAS DEL <span style={{ color: THEME.red }}>FIREWALL</span>
    </div>
    <div style={{ display: 'flex', gap: 24, width: 960 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 8 }}>⬇ ENTRANTE</div>
        <RevealLine at={3.41} fps={fps} mark="▸" color={THEME.amber}>permite solo puertos de la DMZ: 80/443, 25</RevealLine>
        <RevealLine at={9.79} fps={fps} mark="✗" color={THEME.red}>todo lo que apunte a la LAN: se descarta</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>⬆ SALIENTE</div>
        <RevealLine at={11.63} fps={fps} mark="▸" color={THEME.green}>LAN y DMZ salen a internet normal</RevealLine>
        <RevealLine at={12.51} fps={fps} mark="✓" color={THEME.green}>esa asimetría hace funcionar la arquitectura</RevealLine>
      </div>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ iptables -t nat" width={680} delay={Math.round(15.39 * fps)}>
      <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.green }}>--dport 80  -j DNAT --to 10.0.1.10</span>   <span style={{ color: THEME.dim }}># web → DMZ</span>
        {'\n'}<span style={{ color: THEME.red }}>--dport 3306 -j DROP</span>             <span style={{ color: THEME.dim }}># MySQL → protegida</span>
      </div>
    </TerminalWindow>
  </AbsoluteFill>
);

// ── Escena 3: por qué importa para pentesting + cierre ─────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(20.89 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            PENTESTING: <span style={{ color: THEME.amber }}>PIVOTAR</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 840, textAlign: 'left' }}>
            <RevealLine at={5.03} fps={fps} mark="▸" color={THEME.cyan}>aterrizás en la DMZ → convertís la máquina pública en trampolín</RevealLine>
            <RevealLine at={9.65} fps={fps} mark="▸" color={THEME.amber}>lo primero que mapea el pentester: ¿dónde está la DMZ?</RevealLine>
            <RevealLine at={17.66} fps={fps} mark="🎯" color={THEME.red}>a menudo un web server con las entrañas a un clic</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DMZ = <span style={{ color: THEME.amber }}>DNAT CONTROLADO</span></>}
          subtitle="exponer lo mínimo, proteger lo crítico"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2Dmz: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re2-05-dmz'];
  const starts = sceneStartFrames('re2-05-dmz', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re2-05-dmz');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-05-dmz/re2-05-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-05-dmz/re2-05-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re2-05-dmz/re2-05-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};