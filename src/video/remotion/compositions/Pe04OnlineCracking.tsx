// ── video/remotion/compositions/Pe04OnlineCracking.tsx ─────────────
// Video: cracking online — hydra, medusa y ncrack.
// Lección hacking-06, clase 4 de Pentesting. Guiones: voicebox-scripts/pe-04-*.txt
// Audios reales en public/videos/audio/pe-04-online-cracking/ (2026-08-25).

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

// ── Escena 1: qué es el cracking online ────────────────────────────
// Narración (29.8s): escenario → servicio vivo SSH/FTP/web (~4-10s) →
// probar combinaciones (~10-16s) → lento y ruidoso, logs, lockout (~16-26s).
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>ATACÁS EL SERVICIO VIVO: <span style={{ color: THEME.red }}>CRACKING ONLINE</span></>}
          subtitle="probando usuario y clave contra el servidor"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            SIN HASH: <span style={{ color: THEME.red }}>NO TENÉS LA HUELLA</span>, TENÉS LA PUERTA
          </div>
          <div style={{ display: 'flex', gap: 24, width: 1120, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={7} fps={fps} mark="" color={THEME.red}>CÓMO FUNCIONA</RevealLine>
              </div>
              <RevealLine at={11.5} fps={fps} mark="▸" color={THEME.red}>probás combinaciones una tras otra</RevealLine>
              <RevealLine at={13.5} fps={fps} mark="▸" color={THEME.red}>SSH, FTP, HTTP, SMB…</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={17.5} fps={fps} mark="" color={THEME.amber}>EL COSTO</RevealLine>
              </div>
              <RevealLine at={19} fps={fps} mark="▸" color={THEME.amber}>más lento que el offline</RevealLine>
              <RevealLine at={21.5} fps={fps} mark="▸" color={THEME.amber}>deja logs · riesgo de lockout</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: hydra ────────────────────────────────────────────────
// Narración (28.3s): hydra la más famosa (~0-8s) → usuario/lista/servicio
// en paralelo (~8-16s) → ataque típico admin + rockyou (~17-25s) → el truco.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      <span style={{ color: THEME.red }}>HYDRA</span>: LA MÁS FAMOSA
    </div>
    <TerminalWindow title="kali@attacker-01:~$ hydra -l admin -P rockyou.txt ssh://192.168.1.11" width={820} delay={Math.round(3 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>[22][ssh] host: 192.168.1.11 login: admin password: password123</span>
        {'\n'}<span style={{ color: THEME.green }}>[22][ssh] host: 192.168.1.11   login: admin   password: password123</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 20, width: 1060, marginTop: 28, justifyContent: 'center' }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
        <RevealLine at={8} fps={fps} mark="▸" color={THEME.red}>usuario o lista de usuarios</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
        <RevealLine at={11} fps={fps} mark="▸" color={THEME.amber}>lista de contraseñas + servicio</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
        <RevealLine at={13.5} fps={fps} mark="▸" color={THEME.cyan}>prueba todas las combinaciones en paralelo</RevealLine>
      </div>
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      si la clave está en la lista, <span style={{ color: THEME.red }}>la encuentra</span> — probá antes los usuarios que enumeraste
    </div>
  </AbsoluteFill>
);

// ── Escena 3: medusa + ncrack + cierre ─────────────────────────────
// Narración (30.9s): hydra no está sola (~0-6s) → medusa (~6-9s) → ncrack
// familia Nmap (~9-15s) → el límite es la red (~15-25s) → autorización (~26s+).
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(26 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            HYDRA NO ESTÁ SOLA: <span style={{ color: THEME.purple }}>MEDUSA</span> Y <span style={{ color: THEME.green }}>NCRACK</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1120, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={6.6} fps={fps} mark="" color={THEME.purple}>MEDUSA</RevealLine>
              </div>
              <RevealLine at={7.6} fps={fps} mark="▸" color={THEME.purple}>más liviana</RevealLine>
              <RevealLine at={8.4} fps={fps} mark="▸" color={THEME.purple}>muchos servicios</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={9.2} fps={fps} mark="" color={THEME.green}>NCRACK</RevealLine>
              </div>
              <RevealLine at={11.5} fps={fps} mark="▸" color={THEME.green}>de la familia Nmap</RevealLine>
              <RevealLine at={13} fps={fps} mark="▸" color={THEME.green}>se integra con el escaneo</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={15.5} fps={fps} mark="" color={THEME.amber}>EL LÍMITE</RevealLine>
              </div>
              <RevealLine at={17.5} fps={fps} mark="▸" color={THEME.amber}>la red, no tu CPU</RevealLine>
              <RevealLine at={21} fps={fps} mark="▸" color={THEME.amber}>cada intento es una conexión real</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>FUERZA BRUTA: <span style={{ color: THEME.red }}>RUIDOSA</span> PERO EFECTIVA</>}
          subtitle="en el lab y con permiso escrito, siempre"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Pe04OnlineCracking: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['pe-04-online-cracking'];
  const starts = sceneStartFrames('pe-04-online-cracking', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('pe-04-online-cracking');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/pe-04-online-cracking/pe-04-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/pe-04-online-cracking/pe-04-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/pe-04-online-cracking/pe-04-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};