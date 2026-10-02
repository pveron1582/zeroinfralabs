// ── video/remotion/compositions/Re1Ports.tsx ───────────────────────
// Video: puertos — qué son, cuántos hay y los que hay que conocer.
// Lección networksI-02 del Academy (Redes I). Guiones: voicebox-scripts/re1-03-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re1-03-scene*.wav.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';

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
      title: <>¿QUÉ ES UN <span style={{ color: THEME.cyan }}>PUERTO</span>?</>,
      subtitle: 'un número entre 0 y 65535',
      machineLabel: 'máquina',
      serviceLabel: 'servicio',
      heading: <>IP = QUÉ MÁQUINA · PUERTO = <span style={{ color: THEME.green }}>QUÉ SERVICIO</span></>,
      points: [
        'el SO lee el puerto y entrega al programa correcto',
        'socket = IP:puerto',
      ],
    },
    s2: {
      heading: <>65.536 PUERTOS EN <span style={{ color: THEME.cyan }}>3 RANGOS</span></>,
      ranges: [
        { name: 'BIEN CONOCIDOS', rango: '0–1023', desc: 'reservados para los clásicos (HTTP, SSH, DNS, FTP)' },
        { name: 'REGISTRADOS', rango: '1024–49151', desc: 'servicios de usuario, como MySQL en el 3306' },
        { name: 'DINÁMICOS', rango: '49152–65535', desc: 'efímeros, los asigna el SO a conexiones salientes' },
      ],
    },
    s3: {
      heading: <>LOS QUE VAS A VER <span style={{ color: THEME.green }}>SIEMPRE</span></>,
      closeTitle: <>UNO DE ESTOS ABIERTO = <span style={{ color: THEME.amber }}>YA SABÉS QUÉ CORRER</span></>,
      closeSubtitle: 'el escaneo te abre el mapa',
    },
  },
  en: {
    s1: {
      title: <>WHAT IS A <span style={{ color: THEME.cyan }}>PORT</span>?</>,
      subtitle: 'a number between 0 and 65535',
      machineLabel: 'machine',
      serviceLabel: 'service',
      heading: <>IP = WHICH MACHINE · PORT = <span style={{ color: THEME.green }}>WHICH SERVICE</span></>,
      points: [
        'the OS reads the port and hands the packet to the right program',
        'socket = IP:port',
      ],
    },
    s2: {
      heading: <>65,536 PORTS IN <span style={{ color: THEME.cyan }}>3 RANGES</span></>,
      ranges: [
        { name: 'WELL KNOWN', rango: '0–1023', desc: 'reserved for the classics (HTTP, SSH, DNS, FTP)' },
        { name: 'REGISTERED', rango: '1024–49151', desc: 'user services, like MySQL on 3306' },
        { name: 'EPHEMERAL', rango: '49152–65535', desc: 'dynamic, assigned by the OS to outgoing connections' },
      ],
    },
    s3: {
      heading: <>THE ONES YOU'LL SEE <span style={{ color: THEME.green }}>EVERY TIME</span></>,
      closeTitle: <>ONE OF THESE OPEN = <span style={{ color: THEME.amber }}>YOU KNOW WHAT TO RUN</span></>,
      closeSubtitle: 'the scan opens the map for you',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 9.22, serviceDelay: 1.41, points: [3.68, 5.2] },
    s2: { ranges: [16.21, 18.94, 20.54] },
    s3: { closeAt: 27.01, chips: [2.11, 2.8, 3.37, 5.23, 5.7, 6.37, 7.2, 9.45, 11.02, 13.63, 17.47, 19.8, 21.99] },
  },
  en: {
    s1: { panelAt: 10.5, serviceDelay: 6.4, points: [4.9, 4.9] },
    s2: { ranges: [23.0, 27.6, 32.2] },
    s3: { closeAt: 26.0, chips: [2.3, 3.9, 5.3, 8.8, 10.3, 11.5, 12.7, 13.8, 15.3, 17.2, 18.8, 21.2, 23.0] },
  },
};

const RANGE_COLORS = [THEME.green, THEME.cyan, THEME.amber];
const CLASSICS = [
  { p: '21', s: 'FTP', c: THEME.cyan },
  { p: '22', s: 'SSH', c: THEME.green },
  { p: '23', s: 'TELNET', c: THEME.red },
  { p: '25', s: 'SMTP', c: THEME.purple },
  { p: '53', s: 'DNS', c: THEME.amber },
  { p: '80', s: 'HTTP', c: THEME.cyan },
  { p: '110', s: 'POP3', c: THEME.cyan },
  { p: '143', s: 'IMAP', c: THEME.cyan },
  { p: '443', s: 'HTTPS', c: THEME.green },
  { p: '445', s: 'SMB', c: THEME.red },
  { p: '3306', s: 'MYSQL', c: THEME.amber },
  { p: '3389', s: 'RDP', c: THEME.purple },
  { p: '8080', s: 'HTTP ALT', c: THEME.cyan },
];
const VID = 're1-03-ports';

// ── Scene 1: qué es un puerto ─────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 26 }}>
            <KeyCapsule label={c.machineLabel} value="192.168.1.11" accent={THEME.cyan} delay={0} size={26} />
            <span style={{ fontSize: 32, color: THEME.dim, fontFamily: MONO }}>:</span>
            <KeyCapsule label={c.serviceLabel} value="22" accent={THEME.green} delay={Math.round(b.serviceDelay * fps)} size={26} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            {c.heading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 760, textAlign: 'left' }}>
            <RevealLine at={b.points[0]} fps={fps} mark="▸" color={THEME.cyan}>{c.points[0]}</RevealLine>
            <RevealLine at={b.points[1]} fps={fps} mark="✓" color={THEME.green}>{c.points[1]}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: por qué existen + los 3 rangos ───────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 22, width: 1120 }}>
      {c.ranges.map((r, i) => (
        <div key={r.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${RANGE_COLORS[i]}60`,
          borderTop: `5px solid ${RANGE_COLORS[i]}`, borderRadius: 12, padding: '22px 20px', textAlign: 'center',
        }}>
          <RevealLine at={b.ranges[i]} fps={fps} mark="◆" color={RANGE_COLORS[i]}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{r.name}</span>
          </RevealLine>
          <div style={{ fontSize: 22, color: RANGE_COLORS[i], fontFamily: MONO, marginTop: 8 }}>{r.rango}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{r.desc}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: los puertos que hay que conocer + cierre ──────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 980, justifyContent: 'center' }}>
            {CLASSICS.map((x, i) => (
              <RevealLine key={x.p + x.s} at={b.chips[i]} fps={fps} mark="" color={x.c}>
                <span style={{
                  display: 'inline-flex', alignItems: 'baseline', gap: 10,
                  background: THEME.panel, border: `1px solid ${x.c}60`, borderRadius: 10, padding: '8px 14px',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: x.c }}>{x.p}</span>
                  <span style={{ fontSize: 14, color: THEME.muted }}>{x.s}</span>
                </span>
              </RevealLine>
            ))}
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
export const Re1Ports: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re1-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
