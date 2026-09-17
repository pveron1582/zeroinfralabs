// ── video/remotion/compositions/Re04OsiLayers.tsx ──────────────────
// Video: modelo OSI (las 7 capas) vs TCP/IP (las 4 capas).
// Lección redes-04 del Academy. Guiones: voicebox-scripts/re-04-*.txt
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
import { PatchCord } from '../primitives/NetworkIcons';

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
      title: <>¿POR QUÉ <span style={{ color: THEME.cyan }}>CAPAS</span>?</>,
      subtitle: 'cada capa, un trabajo puntual',
      heading: <>LA ANALOGÍA DEL <span style={{ color: THEME.amber }}>CORREO POSTAL</span></>,
      steps: [
        { icon: '✍️', label: 'escribís la carta', sub: 'capa de aplicación' },
        { icon: '📮', label: 'clasifican y viaja', sub: 'capas inferiores' },
        { icon: '📖', label: 'alguien la lee', sub: 'en destino' },
      ],
    },
    s2: {
      heading: <>LAS <span style={{ color: THEME.cyan }}>7 CAPAS</span> DE OSI</>,
      layers: [
        { n: 7, name: 'APLICACIÓN', icon: '🌐', detail: 'HTTP · DNS · SSH' },
        { n: 6, name: 'PRESENTACIÓN', icon: '🔐', detail: 'formato · cifrado' },
        { n: 5, name: 'SESIÓN', icon: '💬', detail: 'mantener la conversación' },
        { n: 4, name: 'TRANSPORTE', icon: '📦', detail: 'TCP/UDP · puertos' },
        { n: 3, name: 'RED', icon: '🧭', detail: 'IP · rutas' },
        { n: 2, name: 'ENLACE', icon: '🔀', detail: 'MAC · ethernet (switch)' },
        { n: 1, name: 'FÍSICA', icon: <PatchCord width={52} />, detail: 'cables · fibra · wifi' },
      ],
    },
    s3: {
      heading: <>INTERNET CORRE CON <span style={{ color: THEME.green }}>TCP/IP</span>: 7 CAPAS → 4</>,
      tcpLayers: [
        { name: 'APLICACIÓN', detail: 'HTTP · DNS · SSH' },
        { name: 'TRANSPORTE', detail: 'TCP / UDP' },
        { name: 'INTERNET', detail: 'IP' },
        { name: 'ACCESO A RED', detail: 'ethernet / wifi' },
      ],
      closeTitle: <>"CAPA 2" Y "CAPA 3" = <span style={{ color: THEME.amber }}>MODELO OSI</span></>,
      closeSubtitle: 'siempre que lo escuches en un lab',
    },
  },
  en: {
    s1: {
      title: <>WHY <span style={{ color: THEME.cyan }}>LAYERS</span>?</>,
      subtitle: 'each layer, one specific job',
      heading: <>THE <span style={{ color: THEME.amber }}>POSTAL MAIL</span> ANALOGY</>,
      steps: [
        { icon: '✍️', label: 'you write the letter', sub: 'application layer' },
        { icon: '📮', label: 'sorted and carried', sub: 'layers below' },
        { icon: '📖', label: 'someone reads it', sub: 'at the destination' },
      ],
    },
    s2: {
      heading: <>THE <span style={{ color: THEME.cyan }}>7 LAYERS</span> OF OSI</>,
      layers: [
        { n: 7, name: 'APPLICATION', icon: '🌐', detail: 'HTTP · DNS · SSH' },
        { n: 6, name: 'PRESENTATION', icon: '🔐', detail: 'format · encryption' },
        { n: 5, name: 'SESSION', icon: '💬', detail: 'keeping the conversation open' },
        { n: 4, name: 'TRANSPORT', icon: '📦', detail: 'TCP/UDP · ports' },
        { n: 3, name: 'NETWORK', icon: '🧭', detail: 'IP · routes' },
        { n: 2, name: 'DATA LINK', icon: '🔀', detail: 'MAC · ethernet (switch)' },
        { n: 1, name: 'PHYSICAL', icon: <PatchCord width={52} />, detail: 'cables · fiber · wifi' },
      ],
    },
    s3: {
      heading: <>THE INTERNET RUNS ON <span style={{ color: THEME.green }}>TCP/IP</span>: 7 LAYERS → 4</>,
      tcpLayers: [
        { name: 'APPLICATION', detail: 'HTTP · DNS · SSH' },
        { name: 'TRANSPORT', detail: 'TCP / UDP' },
        { name: 'INTERNET', detail: 'IP' },
        { name: 'NETWORK ACCESS', detail: 'ethernet / wifi' },
      ],
      closeTitle: <>"LAYER 2" AND "LAYER 3" = THE <span style={{ color: THEME.amber }}>OSI MODEL</span></>,
      closeSubtitle: 'whenever you hear it in a lab',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 4.5, steps: [1.5, 3.5, 5] },
    s2: { layers: [1.2, 7.5, 9.3, 11, 12.5, 14.2, 18.5] },
    s3: { closeAt: 10.5, tcp: [2.9, 3.3, 3.7, 4] },
  },
  en: {
    s1: { panelAt: 8.0, steps: [2.0, 5.0, 9.7] },
    s2: { layers: [1.4, 8.4, 12.9, 16.9, 22.3, 26.3, 30.5] },
    s3: { closeAt: 11.5, tcp: [4.7, 5.6, 6.4, 7.0] },
  },
};

const OSI_COLORS = [THEME.purple, THEME.purple, THEME.cyan, THEME.cyan, THEME.green, THEME.green, THEME.amber];
const TCP_COLORS = [THEME.purple, THEME.cyan, THEME.green, THEME.amber];

const VID = 're-04-osi-layers';

// ── Escena 1: ¿por qué capas? analogía del correo ──────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {c.steps.map((step, i) => (
              <React.Fragment key={step.sub}>
                {i > 0 && <span style={{ fontSize: 30, color: THEME.dim }}>→</span>}
                <div style={{
                  background: THEME.panel, border: `1px solid ${THEME.cyan}50`,
                  borderRadius: 14, padding: '20px 26px', textAlign: 'center', width: 240,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{step.icon}</div>
                  <RevealLine at={b.steps[i]} fps={fps} mark="" color={THEME.cyan}>
                    <span style={{ fontSize: 17 }}>{step.label}</span>
                  </RevealLine>
                  <div style={{ fontSize: 12, color: THEME.dim, fontFamily: MONO, marginTop: 8 }}>{step.sub}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: las 7 capas OSI de arriba a abajo ────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: 560 }}>
      {c.layers.map((l, i) => (
        <div key={l.n} style={{
          display: 'flex', alignItems: 'center',
          background: THEME.panel, border: `1px solid ${OSI_COLORS[i]}50`,
          borderLeft: `5px solid ${OSI_COLORS[i]}`, borderRadius: 8, padding: '7px 16px',
        }}>
          <RevealLine at={b.layers[i]} fps={fps} mark="" color={OSI_COLORS[i]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22, minWidth: 28, display: 'flex', alignItems: 'center' }}>{l.icon}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: OSI_COLORS[i], fontFamily: MONO, minWidth: 26 }}>{l.n}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: THEME.text, fontFamily: MONO, minWidth: 140 }}>{l.name}</span>
              <span style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO }}>{l.detail}</span>
            </div>
          </RevealLine>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: TCP/IP junta todo en 4 + cierre ──────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1140 }}>
            {c.tcpLayers.map((l, i) => (
              <div key={l.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${TCP_COLORS[i]}60`,
                borderTop: `5px solid ${TCP_COLORS[i]}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center',
              }}>
                <RevealLine at={b.tcp[i]} fps={fps} mark="◆" color={TCP_COLORS[i]}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{l.name}</span>
                </RevealLine>
                <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{l.detail}</div>
              </div>
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
export const Re04OsiLayers: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
