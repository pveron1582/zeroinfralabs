// ── video/remotion/compositions/Re2Vpn.tsx ───────────────────────────
// Video: VPN — túneles cifrados que extienden la red.
// Lección networksII-04 del Academy (Redes II). Guiones: voicebox-scripts/{es,en}/networksII/networksII-04-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/{es,en}/networksII/networksII-04-scene*.wav.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
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
      title: <>UN <span style={{ color: THEME.purple }}>TÚNEL</span> SOBRE INTERNET</>,
      subtitle: 'VPN — Virtual Private Network',
      heading: <>BUENOS AIRES ↔ <span style={{ color: THEME.purple }}>MADRID</span>: UNA SOLA RED</>,
      points: [
        { at: 3.62, mark: '▸', color: THEME.purple, text: 'virtual: no usa cables dedicados' },
        { at: 5.03, mark: '🔒', color: THEME.green, text: 'privada: todo cifrado y autenticado' },
        { at: 8.58, mark: '💼', color: THEME.cyan, text: 'el empleado remoto queda "sentado en la oficina"' },
      ],
    },
    s2: {
      heading: <>LOS <span style={{ color: THEME.purple }}>3 TRABAJOS</span> DE UNA VPN</>,
      jobs: [
        { name: 'CONFIDENCIALIDAD', icon: '🔒', color: THEME.green, desc: 'nadie ve tu tráfico en el camino' },
        { name: 'INTEGRIDAD', icon: '🛡️', color: THEME.cyan, desc: 'nadie altera los paquetes' },
        { name: 'AUTENTICIDAD', icon: '🔑', color: THEME.amber, desc: 'solo entran usuarios con credenciales' },
      ],
      jobAt: [2.33, 6.79, 10.62],
      protocolsLabel: 'LOS PROTOCOLOS:',
      protocols: [
        { n: 'IPsec', c: THEME.cyan, d: 'clásico · capa 3 · site-to-site' },
        { n: 'OpenVPN', c: THEME.green, d: 'flexible · UDP/TCP' },
        { n: 'WireGuard', c: THEME.amber, d: 'moderno · rápido' },
        { n: 'TLS VPN', c: THEME.purple, d: 'entra por el navegador' },
      ],
      protoAt: [17.63, 23.66, 27.63, 30.38],
    },
    s3: {
      heading: <>PROTEGE EL <span style={{ color: THEME.green }}>CAMINO</span>, NO EL DESTINO</>,
      yesLabel: '✓ SÍ',
      yesPoints: [
        { at: 2.8, mark: '▸', color: THEME.green, text: 'WiFi abierto: nadie lee tu tráfico' },
        { at: 5.5, mark: '▸', color: THEME.green, text: 'unir dos sedes en una LAN' },
      ],
      noLabel: '✗ NO',
      noPoints: [
        { at: 7.18, mark: '▸', color: THEME.red, text: 'máquina con debilidades en el otro extremo' },
        { at: 10.0, mark: '▸', color: THEME.red, text: 'un servidor VPN con versión vieja' },
      ],
      points: [
        { at: 13.99, mark: '🎯', color: THEME.amber, text: 'pentester: credencial de VPN comprometida = entrada directa a la red' },
        { at: 23.34, mark: '🛡️', color: THEME.green, text: 'defensas: MFA · certificados de cliente · parcharlo' },
      ],
      closeTitle: <>LA VPN ES <span style={{ color: THEME.purple }}>UN TRANSPORTE</span>, NO UNA VARITA</>,
      closeSubtitle: 'cifra el camino · no perdona el destino débil',
    },
  },
  en: {
    s1: {
      title: <>A <span style={{ color: THEME.purple }}>TUNNEL</span> OVER THE INTERNET</>,
      subtitle: 'VPN — Virtual Private Network',
      heading: <>BUENOS AIRES ↔ <span style={{ color: THEME.purple }}>MADRID</span>: ONE SINGLE NETWORK</>,
      points: [
        { at: 12.4, mark: '▸', color: THEME.purple, text: 'virtual: it uses no dedicated cables' },
        { at: 15.3, mark: '🔒', color: THEME.green, text: 'private: everything traveling inside is encrypted and authenticated' },
        { at: 2.5, mark: '💼', color: THEME.cyan, text: 'the coffee-shop employee is "sitting at the office"' },
      ],
    },
    s2: {
      heading: <>THE <span style={{ color: THEME.purple }}>3 JOBS</span> OF A VPN</>,
      jobs: [
        { name: 'CONFIDENTIALITY', icon: '🔒', color: THEME.green, desc: 'nobody reads your traffic on the path' },
        { name: 'INTEGRITY', icon: '🛡️', color: THEME.cyan, desc: 'nobody alters the packets' },
        { name: 'AUTHENTICITY', icon: '🔑', color: THEME.amber, desc: 'only users with credentials get in' },
      ],
      jobAt: [4.1, 9.9, 14.7],
      protocolsLabel: 'THE PROTOCOLS:',
      protocols: [
        { n: 'IPsec', c: THEME.cyan, d: 'classic · layer 3 · site-to-site' },
        { n: 'OpenVPN', c: THEME.green, d: 'flexible · UDP/TCP' },
        { n: 'WireGuard', c: THEME.amber, d: 'modern · fast' },
        { n: 'TLS VPN', c: THEME.purple, d: 'gets in through the browser' },
      ],
      protoAt: [26.8, 29.5, 32.3, 34.7],
    },
    s3: {
      heading: <>IT PROTECTS THE <span style={{ color: THEME.green }}>PATH</span>, NOT THE DESTINATION</>,
      yesLabel: '✓ YES',
      yesPoints: [
        { at: 4.9, mark: '▸', color: THEME.green, text: 'open WiFi: nobody reads your traffic' },
        { at: 2.5, mark: '▸', color: THEME.green, text: 'joins two offices into one LAN' },
      ],
      noLabel: '✗ NO',
      noPoints: [
        { at: 8.0, mark: '▸', color: THEME.red, text: 'a machine with weaknesses at the other end' },
        { at: 10.8, mark: '▸', color: THEME.red, text: 'a VPN server running an old version' },
      ],
      points: [
        { at: 16.7, mark: '🎯', color: THEME.amber, text: 'pentester: a compromised VPN credential = a straight entry into the network' },
        { at: 23.5, mark: '🛡️', color: THEME.green, text: 'defenses: MFA · client certificates · keep it patched' },
      ],
      closeTitle: <>A VPN IS <span style={{ color: THEME.purple }}>TRANSPORT</span>, NOT A MAGIC WAND</>,
      closeSubtitle: "it encrypts the path · it doesn't forgive a weak destination",
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 6.8 },
    s2: { closeAt: 28.2 },
    s3: { closeAt: 28.2 },
  },
  en: {
    s1: { panelAt: 6.6 },
    s2: { closeAt: 23.5 },
    s3: { closeAt: 23.5 },
  },
};

const VID = 'networksII-04-vpn';

// ── Escena 1: qué es ───────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>🏢</span>
            <div style={{ width: 440, height: 38, borderRadius: 19, border: `2px dashed ${THEME.purple}`, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.purple}40 0 10px, transparent 10px 20px)` }} />
            <span style={{ fontSize: 40 }}>🏢</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 820, textAlign: 'left' }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: los 3 trabajos + protocolos ──────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2 }> = ({ fps, c }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1000 }}>
      {c.jobs.map((j, i) => (
        <div key={j.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${j.color}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>{j.icon}</div>
          <RevealLine at={c.jobAt[i]} fps={fps} mark="◆" color={j.color}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{j.name}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{j.desc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 26, width: 940 }}>
      <div style={{ fontSize: 15, color: THEME.muted, fontFamily: MONO, marginBottom: 12 }}>{c.protocolsLabel}</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {c.protocols.map((p, i) => (
          <RevealLine key={p.n} at={c.protoAt[i]} fps={fps} mark="" color={p.c}>
            <span style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: THEME.panel, border: `1px solid ${p.c}60`, borderRadius: 10, padding: '10px 18px',
            }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: p.c }}>{p.n}</span>
              <span style={{ fontSize: 11, color: THEME.muted }}>{p.d}</span>
            </span>
          </RevealLine>
        ))}
      </div>
    </div>
  </AbsoluteFill>
);

// ── Escena 3: qué protege y qué no + cierre ────────────────────────
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
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>{c.yesLabel}</div>
              {c.yesPoints.map((p, i) => (
                <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 8 }}>{c.noLabel}</div>
              {c.noPoints.map((p, i) => (
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
export const Re2Vpn: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksII-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksII-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/networksII-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
