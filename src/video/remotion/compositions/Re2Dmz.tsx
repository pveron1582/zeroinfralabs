// ── video/remotion/compositions/Re2Dmz.tsx ───────────────────────────
// Video: DMZ — separando lo público de lo privado.
// Lección networksII-05 del Academy (Redes II). Guiones: voicebox-scripts/re2-05-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-05-scene*.wav.
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
      title: <>LO PÚBLICO ADELANTE, <span style={{ color: THEME.amber }}>LO PRIVADO ATRÁS</span></>,
      subtitle: 'DMZ — Zona Desmilitarizada',
      firewallLabel: '🔥 FIREWALL',
      firewallDesc: 'decide quién entra',
      dmzLabel: 'DMZ',
      dmzDesc: 'web · correo',
      lanLabel: 'LAN',
      lanDesc: 'bd · PCs',
      points: [
        { at: 8.92, mark: '🌐', color: THEME.amber, text: 'servidores públicos: web y correo viven en la DMZ' },
        { at: 14.62, mark: '🔒', color: THEME.green, text: 'bases de datos y PCs: LAN protegida' },
        { at: 19.29, mark: '🎯', color: THEME.red, text: 'si hackean el web, quedan atrapados en la DMZ' },
      ],
    },
    s2: {
      heading: <>LAS DOS CARAS DEL <span style={{ color: THEME.red }}>FIREWALL</span></>,
      inLabel: '⬇ ENTRANTE',
      inPoints: [
        { at: 3.41, mark: '▸', color: THEME.amber, text: 'permite solo puertos de la DMZ: 80/443, 25' },
        { at: 9.79, mark: '✗', color: THEME.red, text: 'todo lo que apunte a la LAN: se descarta' },
      ],
      outLabel: '⬆ SALIENTE',
      outPoints: [
        { at: 11.63, mark: '▸', color: THEME.green, text: 'LAN y DMZ salen a internet normal' },
        { at: 12.51, mark: '✓', color: THEME.green, text: 'esa asimetría hace funcionar la arquitectura' },
      ],
      terminalDelay: 15.39,
    },
    s3: {
      heading: <>PENTESTING: <span style={{ color: THEME.amber }}>PIVOTAR</span></>,
      points: [
        { at: 5.03, mark: '▸', color: THEME.cyan, text: 'aterrizás en la DMZ → convertís la máquina pública en trampolín' },
        { at: 9.65, mark: '▸', color: THEME.amber, text: 'lo primero que mapea el pentester: ¿dónde está la DMZ?' },
        { at: 17.66, mark: '🎯', color: THEME.red, text: 'a menudo un web server con las entrañas a un clic' },
      ],
      closeTitle: <>DMZ = <span style={{ color: THEME.amber }}>DNAT CONTROLADO</span></>,
      closeSubtitle: 'exponer lo mínimo, proteger lo crítico',
    },
  },
  en: {
    s1: {
      title: <>PUBLIC UP FRONT, <span style={{ color: THEME.amber }}>PRIVATE BEHIND</span></>,
      subtitle: 'DMZ — Demilitarized Zone',
      firewallLabel: '🔥 FIREWALL',
      firewallDesc: 'decides who gets in',
      dmzLabel: 'DMZ',
      dmzDesc: 'web · mail',
      lanLabel: 'LAN',
      lanDesc: 'db · PCs',
      points: [
        { at: 13.0, mark: '🌐', color: THEME.amber, text: 'public servers: web and mail live in the DMZ' },
        { at: 17.1, mark: '🔒', color: THEME.green, text: 'databases and PCs: the protected LAN' },
        { at: 20.8, mark: '🎯', color: THEME.red, text: "if the web server gets hacked, they're trapped in the DMZ" },
      ],
    },
    s2: {
      heading: <>BOTH SIDES OF THE <span style={{ color: THEME.red }}>FIREWALL</span></>,
      inLabel: '⬇ INCOMING',
      inPoints: [
        { at: 4.6, mark: '▸', color: THEME.amber, text: 'only allows the DMZ ports: 80/443, 25' },
        { at: 10.9, mark: '✗', color: THEME.red, text: 'anything aimed at the LAN: dropped' },
      ],
      outLabel: '⬆ OUTGOING',
      outPoints: [
        { at: 13.3, mark: '▸', color: THEME.green, text: 'the LAN and the DMZ reach the internet normally' },
        { at: 17.1, mark: '✓', color: THEME.green, text: 'that asymmetry makes the architecture work' },
      ],
      terminalDelay: 20.0,
    },
    s3: {
      heading: <>PENTESTING: <span style={{ color: THEME.amber }}>PIVOT</span></>,
      points: [
        { at: 4.2, mark: '▸', color: THEME.cyan, text: 'you land on the DMZ → you turn the public machine into a springboard' },
        { at: 9.5, mark: '▸', color: THEME.amber, text: 'the first thing a pentester maps: where does the DMZ sit?' },
        { at: 14.8, mark: '🎯', color: THEME.red, text: "often a web server with the company's guts one click away" },
      ],
      closeTitle: <>DMZ = <span style={{ color: THEME.amber }}>CONTROLLED DNAT</span></>,
      closeSubtitle: 'expose the minimum, protect the critical',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 2.59 },
    s2: { closeAt: 20.89 },
    s3: { closeAt: 20.89 },
  },
  en: {
    s1: { panelAt: 5.2 },
    s2: { closeAt: 20.5 },
    s3: { closeAt: 20.5 },
  },
};

const VID = 're2-05-dmz';

// ── Escena 1: el concepto ──────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>🌍</span>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.red}70`, borderRadius: 12, padding: '16px 22px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.red, fontFamily: MONO }}>{c.firewallLabel}</div>
              <div style={{ fontSize: 12, color: THEME.muted, fontFamily: MONO }}>{c.firewallDesc}</div>
            </div>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.amber}70`, borderRadius: 12, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: THEME.amber, fontFamily: MONO }}>{c.dmzLabel}</div>
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: MONO }}>{c.dmzDesc}</div>
            </div>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.green}70`, borderRadius: 12, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>{c.lanLabel}</div>
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: MONO }}>{c.lanDesc}</div>
            </div>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 880, textAlign: 'left' }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: las dos caras del firewall ───────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b: _b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 24, width: 960 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 8 }}>{c.inLabel}</div>
        {c.inPoints.map((p, i) => (
          <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
        ))}
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>{c.outLabel}</div>
        {c.outPoints.map((p, i) => (
          <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
        ))}
      </div>
    </div>
    <TerminalWindow title="firewall:~$ iptables rules" width={720} delay={Math.round(c.terminalDelay * fps)}>
      <div style={{ fontSize: 12, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.green }}>iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 10.0.1.10</span>
        {'\n'}<span style={{ color: THEME.red }}>iptables -A FORWARD -i eth0 -p tcp --dport 3306 -j DROP</span>
      </div>
    </TerminalWindow>
  </AbsoluteFill>
);

// ── Escena 3: por qué importa para pentesting + cierre ─────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            {c.heading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 840, textAlign: 'left' }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
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
export const Re2Dmz: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
