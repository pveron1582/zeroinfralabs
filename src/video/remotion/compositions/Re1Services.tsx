// ── video/remotion/compositions/Re1Services.tsx ─────────────────────
// Video: servicios de red comunes — SMB, FTP, SSH, VNC.
// Lección networksI-03 del Academy (Redes I). Guiones: voicebox-scripts/re1-02-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-02-scene*.wav.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>SERVICIOS QUE VAS A VER <span style={{ color: THEME.green }}>UNA Y OTRA VEZ</span></>,
      subtitle: 'SMB · FTP · SSH · VNC',
      heading: '🔒 SSH — PUERTO 22',
      points: [
        'administración remota cifrada de punta a punta',
        'ataques: fuerza bruta y robo de claves',
        '22 abierto = empieza la adivinación de claves',
      ],
    },
    s2: {
      heading: <>LOS OTROS <span style={{ color: THEME.amber }}>TRES</span></>,
      services: [
        { name: 'FTP', port: '21', icon: '📁', desc: 'transferencia de archivos en texto plano · login anónimo común · hoy SFTP' },
        { name: 'SMB', port: '445', icon: '🪟', desc: 'comparte archivos en Windows · EternalBlue (MS17-010) · si está abierto, buscá exploits' },
        { name: 'VNC', port: '5900', icon: '🖥️', desc: 'escritorio remoto gráfico · a veces sin contraseña · su primo Windows es RDP (3389)' },
      ],
    },
    s3: {
      heading: <>UN HOST, <span style={{ color: THEME.cyan }}>CUATRO PISTAS</span></>,
      footer: 'cada versión es una pista para buscar exploits',
      closeTitle: <>EL ESCANEO DE VERSIONES <span style={{ color: THEME.amber }}>NO ES OPCIONAL</span></>,
      closeSubtitle: 'convierte puertos abiertos en vectores',
    },
  },
  en: {
    s1: {
      title: <>SERVICES YOU'LL SEE <span style={{ color: THEME.green }}>OVER AND OVER</span></>,
      subtitle: 'SMB · FTP · SSH · VNC',
      heading: '🔒 SSH — PORT 22',
      points: [
        'secure remote administration, encrypted end to end',
        'typical attacks: brute force and key theft',
        '22 open = password guessing begins',
      ],
    },
    s2: {
      heading: <>THE OTHER <span style={{ color: THEME.amber }}>THREE</span></>,
      services: [
        { name: 'FTP', port: '21', icon: '📁', desc: 'file transfer in plain text · anonymous login common · today SFTP' },
        { name: 'SMB', port: '445', icon: '🪟', desc: 'Windows file sharing · EternalBlue (MS17-010) · if open, hunt for exploits' },
        { name: 'VNC', port: '5900', icon: '🖥️', desc: 'graphical remote desktop · sometimes with no password · its Windows cousin is RDP (3389)' },
      ],
    },
    s3: {
      heading: <>ONE HOST, <span style={{ color: THEME.cyan }}>FOUR LEADS</span></>,
      footer: 'every version string is a lead for finding exploits',
      closeTitle: <>VERSION SCANNING <span style={{ color: THEME.amber }}>IS NOT OPTIONAL</span></>,
      closeSubtitle: 'it turns open ports into attack vectors',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 3.94, points: [3.13, 5.73, 8.07] },
    s2: { services: [0, 8.57, 16.22] },
    s3: { closeAt: 15.57, terminalDelay: 2.46 },
  },
  en: {
    s1: { panelAt: 5.9, points: [4.3, 7.1, 9.8] },
    s2: { services: [0.0, 14.5, 24.5] },
    s3: { closeAt: 22.1, terminalDelay: 3.2 },
  },
};

const SVC_COLORS = [THEME.amber, THEME.red, THEME.cyan];
const VID = 're1-02-services';

// ── Scene 1: SSH ──────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 16 }}>{c.heading}</div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 28px', width: 820, textAlign: 'left' }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={b.points[i]} fps={fps} mark={i === 2 ? '✓' : '▸'} color={i === 1 ? THEME.red : THEME.green}>{p}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: FTP / SMB / VNC ─────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 22, width: 1120 }}>
      {c.services.map((s, i) => (
        <div key={s.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${SVC_COLORS[i]}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
          <RevealLine at={b.services[i]} fps={fps} mark="◆" color={SVC_COLORS[i]}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{s.name}</span>
            <span style={{ fontSize: 13, color: THEME.dim, marginLeft: 8 }}>{s.port}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.6 }}>{s.desc}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: nmap -sV + cierre ───────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            {c.heading}
          </div>
          <TerminalWindow title="kali@attacker-01:~$ nmap -sV 10.0.0.11" width={720} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.dim }}>21/tcp</span>   open  ftp   <span style={{ color: THEME.amber }}>vsFTPd 3.0.3</span>
              {'\n'}<span style={{ color: THEME.dim }}>22/tcp</span>   open  ssh   <span style={{ color: THEME.green }}>OpenSSH 8.2p1</span>
              {'\n'}<span style={{ color: THEME.dim }}>445/tcp</span>  open  smb   <span style={{ color: THEME.red }}>Samba 4.11.6</span>
              {'\n'}<span style={{ color: THEME.dim }}>5900/tcp</span> open  vnc   <span style={{ color: THEME.cyan }}>VNC 3.8</span>
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 18, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
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
export const Re1Services: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
