// ── video/remotion/compositions/Re1Services.tsx ─────────────────────
// Video: servicios de red comunes — SMB, FTP, SSH, VNC.
// Lección proto-02 del Academy (Redes I). Guiones: voicebox-scripts/re1-02-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-02-scene*.wav.

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

// ── Escena 1: SSH (22) — el serio ──────────────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.94 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>SERVICIOS QUE VAS A VER <span style={{ color: THEME.green }}>UNA Y OTRA VEZ</span></>}
          subtitle="SMB · FTP · SSH · VNC"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 16 }}>🔒 SSH — PUERTO 22</div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            <RevealLine at={0} fps={fps} mark="▸" color={THEME.green}>administración remota cifrada de punta a punta</RevealLine>
            <RevealLine at={3.13} fps={fps} mark="▸" color={THEME.red}>ataques: fuerza bruta y robo de claves</RevealLine>
            <RevealLine at={5.73} fps={fps} mark="✓" color={THEME.green}>22 abierto = empieza la adivinación de claves</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: FTP / SMB / VNC ─────────────────────────────────────
const OTHERS = [
  { name: 'FTP', port: '21', icon: '📁', color: THEME.amber, desc: 'transferencia de archivos en texto plano · login anónimo común · hoy SFTP' },
  { name: 'SMB', port: '445', icon: '🪟', color: THEME.red, desc: 'comparte archivos en Windows · EternalBlue (MS17-010) · si está abierto, buscá exploits' },
  { name: 'VNC', port: '5900', icon: '🖥️', color: THEME.cyan, desc: 'escritorio remoto gráfico · a veces sin contraseña · su primo Windows es RDP (3389)' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      LOS OTROS <span style={{ color: THEME.amber }}>TRES</span>
    </div>
    <div style={{ display: 'flex', gap: 22, width: 1120 }}>
      {OTHERS.map((s, i) => {
        const at = [0, 12.49, 22.9][i];
        return (
        <div key={s.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
          <RevealLine at={at} fps={fps} mark="◆" color={s.color}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{s.name}</span>
            <span style={{ fontSize: 13, color: THEME.dim, marginLeft: 8 }}>{s.port}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.6 }}>{s.desc}</div>
        </div>
        );
      })}
    </div>
  </AbsoluteFill>
);

// ── Escena 3: nmap -sV + cierre ───────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(18.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            UN HOST, <span style={{ color: THEME.cyan }}>CUATRO PISTAS</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$ nmap -sV 10.0.0.11" width={720} delay={Math.round(2.46 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.dim }}>21/tcp</span>   open  ftp   <span style={{ color: THEME.amber }}>vsFTPd 3.0.3</span>
              {'\n'}<span style={{ color: THEME.dim }}>22/tcp</span>   open  ssh   <span style={{ color: THEME.green }}>OpenSSH 8.2p1</span>
              {'\n'}<span style={{ color: THEME.dim }}>445/tcp</span>  open  smb   <span style={{ color: THEME.red }}>Samba 4.11.6</span>
              {'\n'}<span style={{ color: THEME.dim }}>5900/tcp</span> open  vnc   <span style={{ color: THEME.cyan }}>VNC 3.8</span>
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            cada versión es una pista para <span style={{ color: THEME.amber }}>buscar exploits</span>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>EL ESCANEO DE VERSIONES <span style={{ color: THEME.amber }}>NO ES OPCIONAL</span></>}
          subtitle="convierte puertos abiertos en vectores"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1Services: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['re1-02-services'];
  const starts = sceneStartFrames('re1-02-services', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const withAudio = hasAudio('re1-02-services');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-02-services/re1-02-scene1.wav')} />}
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-02-services/re1-02-scene2.wav')} />}
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile('videos/audio/re1-02-services/re1-02-scene3.wav')} />}
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
