// ── video/remotion/compositions/Re05AddressingDns.tsx ──────────────
// Video: direccionamiento — IP, máscara, gateway y el DNS.
// Lección fundaments-05 del Academy. Guiones: voicebox-scripts/re-05-*.txt
// Audio real cargado (wavs Voicebox, ffprobe 2026-08-17). Los syncs internos
// (RevealLine/KeyCapsule/TitleScene) están alineados a silencedetect (-50dB).
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
      title: <>CONFIGURAR UNA RED: <span style={{ color: THEME.cyan }}>3 NÚMEROS</span></>,
      subtitle: 'IP + máscara + puerta de enlace',
      pieces: [
        { name: 'IP', icon: '🪪', desc: 'identidad del equipo en la red', ex: '192.168.1.10' },
        { name: 'MÁSCARA', icon: '📐', desc: 'qué parte es red, qué parte es equipo', ex: '255.255.255.0' },
        { name: 'GATEWAY', icon: '🌉', desc: 'la IP del router: el puente hacia afuera', ex: '192.168.1.1' },
      ],
    },
    s2: {
      heading: <>CLASES POR <span style={{ color: THEME.amber }}>TAMAÑO</span> DE RED</>,
      classes: [
        { name: 'CLASE A', rango: '1–126', desc: 'redes enormes · 10.x.x.x' },
        { name: 'CLASE B', rango: '128–191', desc: 'redes medianas · 172.16–31.x.x' },
        { name: 'CLASE C', rango: '192–223', desc: 'redes chicas · 192.168.x.x' },
      ],
      footer: <>hoy se usa <span style={{ color: THEME.cyan }}>CIDR</span>: 192.168.1.0/24 — pero las clases explican los rangos privados</>,
    },
    s3: {
      heading: <><span style={{ color: THEME.cyan }}>DNS</span>: LA AGENDA DE INTERNET</>,
      footer: 'si el DNS falla, "no anda la web" aunque tengas internet',
      closeTitle: <>CON IP, GATEWAY Y DNS: <span style={{ color: THEME.amber }}>LISTO PARA NAVEGAR</span></>,
      closeSubtitle: 'y para el pentester: enumerar DNS revela subdominios',
    },
  },
  en: {
    s1: {
      title: <>SETTING UP A NETWORK: <span style={{ color: THEME.cyan }}>3 NUMBERS</span></>,
      subtitle: 'IP + netmask + gateway',
      pieces: [
        { name: 'IP', icon: '🪪', desc: "the machine's identity on the network", ex: '192.168.1.10' },
        { name: 'NETMASK', icon: '📐', desc: 'which part is network, which part is machine', ex: '255.255.255.0' },
        { name: 'GATEWAY', icon: '🌉', desc: "the router's IP: the bridge to the outside", ex: '192.168.1.1' },
      ],
    },
    s2: {
      heading: <>CLASSES BY NETWORK <span style={{ color: THEME.amber }}>SIZE</span></>,
      classes: [
        { name: 'CLASS A', rango: '1–126', desc: 'huge networks · 10.x.x.x' },
        { name: 'CLASS B', rango: '128–191', desc: 'medium networks · 172.16–31.x.x' },
        { name: 'CLASS C', rango: '192–223', desc: 'small networks · 192.168.x.x' },
      ],
      footer: <>today it's <span style={{ color: THEME.cyan }}>CIDR</span>: 192.168.1.0/24 — but classes explain the private ranges</>,
    },
    s3: {
      heading: <><span style={{ color: THEME.cyan }}>DNS</span>: THE INTERNET'S CONTACT LIST</>,
      footer: 'if DNS fails, "the web is down" even if your internet works',
      closeTitle: <>WITH IP, GATEWAY AND DNS: <span style={{ color: THEME.amber }}>READY TO BROWSE</span></>,
      closeSubtitle: 'and for the pentester: enumerating DNS reveals subdomains',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 3, pieces: [0.1, 3, 6.5] },
    s2: { classes: [5, 6.5, 8] },
    s3: { closeAt: 12.7, terminalDelay: 3.5 },
  },
  en: {
    s1: { panelAt: 3.7, pieces: [0.2, 4.0, 10.5] },
    s2: { classes: [4.0, 6.0, 7.4] },
    s3: { closeAt: 14.3, terminalDelay: 4.5 },
  },
};

const PIECE_COLORS = [THEME.cyan, THEME.amber, THEME.green];
const CLASS_COLORS = [THEME.purple, THEME.cyan, THEME.green];
const CLASS_PREFIX = ['primer octeto ', 'first octet '];
const VID = 'fundaments-05-addressing-dns';

// ── Scene 1: las 3 piezas de la configuración ─────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1; lang: 'es' | 'en' }> = ({ fps, c, b, lang: _lang }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1140 }}>
            {c.pieces.map((p, i) => (
              <div key={p.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${PIECE_COLORS[i]}60`,
                borderRadius: 16, padding: '24px 22px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: PIECE_COLORS[i], fontFamily: MONO }}>{p.name}</div>
                <RevealLine at={b.pieces[i]} fps={fps} mark="▸" color={PIECE_COLORS[i]}>
                  <span style={{ fontSize: 14 }}>{p.desc}</span>
                </RevealLine>
                <div style={{ fontSize: 16, color: THEME.text, fontFamily: MONO, marginTop: 12 }}>{p.ex}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: clases + CIDR ────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2; lang: 'es' | 'en' }> = ({ fps, c, b, lang }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1140 }}>
      {c.classes.map((cl, i) => (
        <div key={cl.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${CLASS_COLORS[i]}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <RevealLine at={b.classes[i]} fps={fps} mark="◆" color={CLASS_COLORS[i]}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{cl.name}</span>
          </RevealLine>
          <div style={{ fontSize: 15, color: CLASS_COLORS[i], fontFamily: MONO, marginTop: 10 }}>{CLASS_PREFIX[lang === 'es' ? 0 : 1]}{cl.rango}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{cl.desc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 30, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: DNS + resolv.conf ────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <span style={{ fontSize: 26, color: THEME.text, fontFamily: MONO }}>google.com</span>
            <span style={{ fontSize: 26, color: THEME.dim }}>→</span>
            <span style={{ fontSize: 26, color: THEME.green, fontFamily: MONO }}>142.250.80.78</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={620} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}># /etc/resolv.conf</span>
              {'\n'}nameserver <span style={{ color: THEME.cyan }}>8.8.8.8</span>
              {'\n'}default via <span style={{ color: THEME.green }}>192.168.1.1</span> dev eth0
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 16, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
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
export const Re05AddressingDns: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} lang={lang} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} lang={lang} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
