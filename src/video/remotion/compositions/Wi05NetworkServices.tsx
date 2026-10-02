// ── video/remotion/compositions/Wi05NetworkServices.tsx ───────────
// Video: servicios de red de Windows — SMB (445, shares, EternalBlue),
// RDP (3389, movimiento lateral) y WinRM (5985, PowerShell Remoting /
// Evil-WinRM). Cierre: usuario + contraseña = shell en el objetivo.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>LAS <span style={{ color: THEME.cyan }}>PUERTAS DE ENTRADA</span></>,
      subtitle: 'los servicios con los que Windows habla entre sí',
      smbTitle: '📁 SMB — 445',
      smbPoints: [
        { text: 'puerto 445: archivos e impresoras', at: 1.7 },
        { text: 'shares admin por defecto: C$, ADMIN$, IPC$', at: 5.7 },
        { text: 'shares personalizados: el objetivo clásico', at: 14.3 },
        { text: 'EternalBlue: toma Windows viejos sin credenciales', at: 20.5 },
      ],
    },
    s2: {
      rdpSubtitle: 'Remote Desktop Protocol: la pantalla del equipo remoto',
      rdpPoints: [
        { text: 'puerto 3389: escritorio remoto gráfico', at: 0.8 },
        { text: 'expuesto a internet = imán de fuerza bruta', at: 5.4 },
        { text: 'movimiento lateral: credenciales → próxima máquina', at: 8.7 },
        { text: 'pass-the-hash + Restricted Admin son reales', at: 16.0 },
      ],
    },
    s3: {
      winrmTitle: '⚡ WINRM — 5985',
      winrmPoints: [
        { text: 'puerto 5985: PowerShell Remoting', at: 0.7 },
        { text: 'con credenciales válidas → shell remota completa', at: 7.6 },
        { text: 'Evil-WinRM: usuario + contraseña → PowerShell interactivo', at: 11.2 },
      ],
      closeAt: 15.3,
      closeTitle: <>USUARIO + CONTRASEÑA = <span style={{ color: THEME.green }}>SHELL EN EL OBJETIVO</span></>,
      closeSubtitle: 'de lo primero que se prueba cuando conseguís credenciales',
    },
  },
  en: {
    s1: {
      title: <>THE <span style={{ color: THEME.cyan }}>WAYS IN</span></>,
      subtitle: 'the services Windows machines talk to each other with',
      smbTitle: '📁 SMB — 445',
      smbPoints: [
        { text: 'port 445: files and printers', at: 2.6 },
        { text: 'admin shares by default: C$, ADMIN$, IPC$', at: 6.1 },
        { text: 'custom shares: the classic target', at: 14.7 },
        { text: 'EternalBlue: takes old Windows without credentials', at: 21.7 },
      ],
    },
    s2: {
      rdpSubtitle: "Remote Desktop Protocol: the remote machine's screen",
      rdpPoints: [
        { text: 'port 3389: the graphical remote desktop', at: 0.7 },
        { text: 'exposed to the internet = a brute force magnet', at: 5.2 },
        { text: 'lateral movement: credentials → the next machine', at: 8.6 },
        { text: 'saved credentials + pass-the-hash with Restricted Admin are real', at: 12.7 },
      ],
    },
    s3: {
      winrmTitle: '⚡ WINRM — 5985',
      winrmPoints: [
        { text: 'port 5985: the channel for PowerShell Remoting', at: 0.7 },
        { text: 'with valid credentials → a full remote shell', at: 3.8 },
        { text: 'Evil-WinRM: username + password → interactive PowerShell', at: 9.7 },
      ],
      closeAt: 12.7,
      closeTitle: <>USERNAME + PASSWORD = <span style={{ color: THEME.green }}>SHELL ON THE TARGET</span></>,
      closeSubtitle: 'one of the first things you try when you get credentials',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: { s1: { panelAt: 3.1, terminalDelay: 5.7 }, s2: {}, s3: {} },
  en: { s1: { panelAt: 2.9, terminalDelay: 6.1 }, s2: {}, s3: {} },
};

const VID = 'windows-05-network-services';

// ── Scene 1: SMB ──────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 16 }}>
                {c.smbTitle}
              </div>
              {c.smbPoints.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="C:\\> net share" width={520} delay={Math.round(b.terminalDelay * fps)}>
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

// ── Scene 2: RDP ──────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '30px 36px', width: 900, textAlign: 'left' }}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 16 }}>
          🖥️ RDP — 3389
        </div>
        <div style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>
          {c.rdpSubtitle}
        </div>
        {c.rdpPoints.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: WinRM + cierre ───────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c }) => {
  const closeAt = Math.round(c.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 500, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 16 }}>
                {c.winrmTitle}
              </div>
              {c.winrmPoints.map(p => (
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
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Wi05NetworkServices: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: SMB */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: RDP */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: WinRM + cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
