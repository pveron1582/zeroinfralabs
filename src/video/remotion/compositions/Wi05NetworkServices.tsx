// ── video/remotion/compositions/Wi05NetworkServices.tsx ───────────
// Video: servicios de red de Windows — SMB (445, shares, EternalBlue),
// RDP (3389, movimiento lateral) y WinRM (5985, PowerShell Remoting /
// Evil-WinRM). Cierre: usuario + contraseña = shell en el objetivo.
// Con audio de la voz "Miguel" (3 escenas, ~77s).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Escena 1: SMB ──────────────────────────────────────────────────
// `at` re-medidos con transcripción word-level sobre wi-05-scene1.wav
// (audio del 2026-08-27). Son relativos a la sub-secuencia del panel
// (arranca en `panelAt` 3.1s): quedan en 4.8 / 8.8 / 17.4 / 23.6s de escena.
const SMB_POINTS = [
  { text: 'puerto 445: archivos e impresoras', at: 1.7 },
  { text: 'shares admin por defecto: C$, ADMIN$, IPC$', at: 5.7 },
  { text: 'shares personalizados: el objetivo clásico', at: 14.3 },
  { text: 'EternalBlue: toma Windows viejos sin credenciales', at: 20.5 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.1 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>LAS <span style={{ color: THEME.cyan }}>PUERTAS DE ENTRADA</span></>}
          subtitle="los servicios con los que Windows habla entre sí"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 16 }}>
                📁 SMB — 445
              </div>
              {SMB_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
              ))}
            </div>
            {/* delay relativo al panel (arranca a 3.1s de escena): entra a
                8.8s de escena, cuando la narración menciona los shares admin */}
            <TerminalWindow title="C:\\> net share" width={520} delay={Math.round(5.7 * fps)}>
              <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.6 }}>
                <span style={{ color: THEME.cyan }}>C$</span>     C:\          Default share
                {'\n'}<span style={{ color: THEME.cyan }}>ADMIN$</span>  C:\Windows   Remote Admin
                {'\n'}<span style={{ color: THEME.cyan }}>IPC$</span>                Remote IPC
                {'\n'}<span style={{ color: THEME.cyan }}>datos</span>   D:\datos
                {'\n'}<span style={{ color: THEME.cyan }}>publico</span>  E:\publico
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: RDP ──────────────────────────────────────────────────
// `at` re-medidos con transcripción word-level sobre wi-05-scene2.wav.
const RDP_POINTS = [
  { text: 'puerto 3389: escritorio remoto gráfico', at: 0.8 },
  { text: 'expuesto a internet = imán de fuerza bruta', at: 5.4 },
  { text: 'movimiento lateral: credenciales → próxima máquina', at: 8.7 },
  { text: 'pass-the-hash + Restricted Admin son reales', at: 16.0 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '30px 36px', width: 900, textAlign: 'left' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 16 }}>
          🖥️ RDP — 3389
        </div>
        <div style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>
          Remote Desktop Protocol: la pantalla del equipo remoto
        </div>
        {RDP_POINTS.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: WinRM + cierre ───────────────────────────────────────
// `at` re-medidos con transcripción word-level sobre wi-05-scene3.wav.
const WINRM_POINTS = [
  { text: 'puerto 5985: PowerShell Remoting', at: 0.7 },
  { text: 'con credenciales válidas → shell remota completa', at: 7.6 },
  { text: 'Evil-WinRM: usuario + contraseña → PowerShell interactivo', at: 11.2 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // la narración dice "usuario y contraseña..." a los ~15.2s (transcripción)
  const closeAt = Math.round(15.3 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 16 }}>
                ⚡ WINRM — 5985
              </div>
              {WINRM_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="kali@attacker:~$ evil-winrm" width={520}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
                <span style={{ color: THEME.green }}>user</span> + <span style={{ color: THEME.green }}>pass</span>
                {'\n'}Info: Establishing connection...
                {'\n'}Info: Starting interactive PowerShell
                {'\n'}<span style={{ color: THEME.purple }}>*Evil-WinRM*</span>{' PS C:\\Users\\admin>'}
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>USUARIO + CONTRASEÑA = <span style={{ color: THEME.green }}>SHELL EN EL OBJETIVO</span></>}
          subtitle="de lo primero que se prueba cuando conseguís credenciales"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi05NetworkServices: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['wi-05-network-services'];
  const starts = sceneStartFrames('wi-05-network-services', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: SMB */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio-es/wi-05-network-services/wi-05-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: RDP */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio-es/wi-05-network-services/wi-05-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: WinRM + cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio-es/wi-05-network-services/wi-05-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
