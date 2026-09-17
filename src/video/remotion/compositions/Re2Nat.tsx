// ── video/remotion/compositions/Re2Nat.tsx ───────────────────────────
// Video: NAT — cómo toda tu red sale a internet con una sola IP.
// Lección network-07 del Academy (Redes II). Guiones: voicebox-scripts/re2-02-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-02-scene*.wav.
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
      title: <>TODA TU CASA, <span style={{ color: THEME.green }}>UNA SOLA IP</span></>,
      subtitle: 'eso es NAT — Network Address Translation',
      privateLabel: 'privada',
      publicLabel: 'única IP pública',
      points: [
        { at: 4.41, mark: '▸', color: THEME.cyan, text: 'las privadas no son ruteables en internet' },
        { at: 5.52, mark: '⇄', color: THEME.green, text: 'reescribe cada paquete al salir y al volver' },
      ],
    },
    s2: {
      heading: <>LA <span style={{ color: THEME.green }}>TABLA DE TRADUCCIÓN</span></>,
      internalLabel: 'PC interna',
      publicLabel: 'IP pública',
      points: [
        { at: 10.12, mark: '▸', color: THEME.cyan, text: 'la respuesta llega al puerto 40001 → la tabla dice "es de la .34"' },
        { at: 15.71, mark: '🚫', color: THEME.red, text: 'conexiones desde internet: no calzan → se descartan' },
        { at: 18.74, mark: '◆', color: THEME.amber, text: 'PAT: cada equipo interno usa un puerto de salida distinto' },
      ],
    },
    s3: {
      heading: <><span style={{ color: THEME.green }}>PROS</span> Y <span style={{ color: THEME.red }}>CONTRAS</span></>,
      prosLabel: '✓ AHORRA IPs',
      prosPoints: [
        { at: 4.53, mark: '▸', color: THEME.green, text: 'oculta tu topología interna' },
        { at: 8.51, mark: '▸', color: THEME.green, text: 'bloquea conexiones entrantes: firewall gratis' },
      ],
      consLabel: '✗ ROMPE EL MODELO',
      consPoints: [
        { at: 14.87, mark: '▸', color: THEME.red, text: 'complica FTP, VoIP, P2P' },
        { at: 19.19, mark: '▸', color: THEME.red, text: 'cada conexión consume una entrada de la tabla' },
      ],
      points: [
        { at: 20.84, mark: '🔓', color: THEME.amber, text: 'DNAT / port forwarding: abre un hueco hacia adentro' },
        { at: 25.2, mark: '▸', color: THEME.cyan, text: 'para el pentester: cada regla DNAT es lo que la red decidió exponer' },
      ],
      closeTitle: <>NAT: <span style={{ color: THEME.green }}>1 IP PÚBLICA</span>, TODOS ADENTRO</>,
      closeSubtitle: 'y cada DNAT, una puerta que alguien abrió',
    },
  },
  en: {
    s1: {
      title: <>YOUR WHOLE HOME, <span style={{ color: THEME.green }}>ONE SINGLE IP</span></>,
      subtitle: "that's NAT — Network Address Translation",
      privateLabel: 'private',
      publicLabel: 'single public IP',
      points: [
        { at: 13.9, mark: '▸', color: THEME.cyan, text: "private IPs aren't routable on the internet" },
        { at: 16.2, mark: '⇄', color: THEME.green, text: 'it rewrites every packet on the way out and the way back' },
      ],
    },
    s2: {
      heading: <>THE <span style={{ color: THEME.green }}>TRANSLATION TABLE</span></>,
      internalLabel: 'internal PC',
      publicLabel: 'public IP',
      points: [
        { at: 11.4, mark: '▸', color: THEME.cyan, text: 'this port equals that PC — the reply matches the table and goes inward' },
        { at: 20.2, mark: '🚫', color: THEME.red, text: 'connections from the internet: no match → dropped' },
        { at: 29.6, mark: '◆', color: THEME.amber, text: 'PAT: every internal machine uses a different outgoing port' },
      ],
    },
    s3: {
      heading: <><span style={{ color: THEME.green }}>PROS</span> AND <span style={{ color: THEME.red }}>CONS</span></>,
      prosLabel: '✓ SAVES IPs',
      prosPoints: [
        { at: 5.8, mark: '▸', color: THEME.green, text: 'hides your internal topology' },
        { at: 7.5, mark: '▸', color: THEME.green, text: 'blocks incoming connections: a free firewall' },
      ],
      consLabel: '✗ BREAKS THE MODEL',
      consPoints: [
        { at: 13.4, mark: '▸', color: THEME.red, text: 'complicates FTP, VoIP, P2P' },
        { at: 18.6, mark: '▸', color: THEME.red, text: 'every connection eats a table entry' },
      ],
      points: [
        { at: 22.6, mark: '🔓', color: THEME.amber, text: 'DNAT / port forwarding: opens a hole inward' },
        { at: 27.5, mark: '▸', color: THEME.cyan, text: 'for the pentester: every DNAT rule is what the network decided to expose' },
      ],
      closeTitle: <>NAT: <span style={{ color: THEME.green }}>1 PUBLIC IP</span>, EVERYONE INSIDE</>,
      closeSubtitle: 'and every DNAT, a door someone opened',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 2.09 },
    s2: { capsule1: 2.12, capsule2: 5.44 },
    s3: { closeAt: 28.27 },
  },
  en: {
    s1: { panelAt: 2.0 },
    s2: { capsule1: 4.7, capsule2: 9.2 },
    s3: { closeAt: 31.3 },
  },
};

const VID = 're2-02-nat';

// ── Escena 1: qué es NAT ───────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
            {['192.168.1.34', '192.168.1.20', '192.168.1.7'].map((ip) => (
              <KeyCapsule key={ip} label={c.privateLabel} value={ip} accent={THEME.cyan} delay={0} size={20} />
            ))}
          </div>
          <div style={{ fontSize: 34, color: THEME.green, marginBottom: 16 }}>↓ ROUTER · NAT ↓</div>
          <KeyCapsule label={c.publicLabel} value="203.0.113.7" accent={THEME.green} delay={0} size={30} />
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 800, textAlign: 'left', marginTop: 24 }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: la tabla de traducción + PAT ─────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 22 }}>
      <KeyCapsule label={c.internalLabel} value="192.168.1.34:51234" accent={THEME.cyan} delay={Math.round(b.capsule1 * fps)} size={19} />
      <span style={{ fontSize: 28, color: THEME.green }}>→</span>
      <KeyCapsule label={c.publicLabel} value="203.0.113.7:40001" accent={THEME.green} delay={Math.round(b.capsule2 * fps)} size={19} />
    </div>
    <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 880, textAlign: 'left' }}>
      {c.points.map((p, i) => (
        <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Escena 3: pros/contras + DNAT + cierre ─────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 24, width: 960 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>{c.prosLabel}</div>
              {c.prosPoints.map((p, i) => (
                <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 8 }}>{c.consLabel}</div>
              {c.consPoints.map((p, i) => (
                <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 22, width: 900, textAlign: 'left' }}>
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
export const Re2Nat: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
