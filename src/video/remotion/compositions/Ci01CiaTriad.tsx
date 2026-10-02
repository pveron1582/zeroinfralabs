// ── video/remotion/compositions/Ci01CiaTriad.tsx ───────────────────
// Video: la triada CID — confidencialidad, integridad y disponibilidad
// con ataques reales por cada pata y el ángulo del pentester.
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
const PILLARS_ES = [
  { name: 'CONFIDENCIALIDAD', icon: '🔒', color: THEME.cyan, points: ['solo ojos autorizados leen el dato', 'robar datos = romperla'] },
  { name: 'INTEGRIDAD', icon: '🧾', color: THEME.amber, points: ['el dato no se modifica en silencio', 'tocar logs = romperla'] },
  { name: 'DISPONIBILIDAD', icon: '✅', color: THEME.green, points: ['el sistema funciona cuando se lo necesita', 'DDoS = romperla'] },
];
const PILLARS_EN = [
  { name: 'CONFIDENTIALITY', icon: '🔒', color: THEME.cyan, points: ['only authorized eyes read the data', 'stealing data = breaking it'] },
  { name: 'INTEGRITY', icon: '🧾', color: THEME.amber, points: ["the data doesn't get modified in silence", 'touching logs = breaking it'] },
  { name: 'AVAILABILITY', icon: '✅', color: THEME.green, points: ['the system works when you need it', 'DDoS = breaking it'] },
];

const ATTACKS_ES = [
  { name: 'CONFIDENCIALIDAD', color: THEME.cyan, attacks: ['robar /etc/shadow', 'SQLi volcando la base'] },
  { name: 'INTEGRIDAD', color: THEME.amber, attacks: ['defacear la web', 'tocar logs para cubrirte'] },
  { name: 'DISPONIBILIDAD', color: THEME.green, attacks: ['DDoS tumba el servicio', 'ransomware pide rescate'] },
];
const ATTACKS_EN = [
  { name: 'CONFIDENTIALITY', color: THEME.cyan, attacks: ['stealing a password file', 'SQL injection dumping the database'] },
  { name: 'INTEGRITY', color: THEME.amber, attacks: ['defacing a web page', 'touching the logs to cover your tracks'] },
  { name: 'AVAILABILITY', color: THEME.green, attacks: ['a DDoS takes down a service', 'ransomware locks everything'] },
];

const COPY = {
  es: {
    s1: {
      title: <>LA TRIADA <span style={{ color: THEME.cyan }}>CID</span></>,
      subtitle: 'confidencialidad · integridad · disponibilidad',
      pillars: PILLARS_ES,
    },
    s2: {
      heading: 'CADA ATAQUE ROMPE <span style={{ color: THEME.red }}>UNA PATA</span>',
      attacks: ATTACKS_ES,
    },
    s3: {
      heading: <>LO QUE MÁS VALE ES LA <span style={{ color: THEME.cyan }}>INFORMACIÓN</span></>,
      footer: 'leerlo rompe la confidencialidad: el atacante crackea offline, sin alertas',
      closeTitle: <>ENUMERÁ: <span style={{ color: THEME.amber }}>¿CUÁL PATA TE CONVIENE ATACAR?</span></>,
      closeSubtitle: 'y cuando defendés: ¿cuál no podés perder?',
    },
  },
  en: {
    s1: {
      title: <>THE <span style={{ color: THEME.cyan }}>CIA</span> TRIAD</>,
      subtitle: 'confidentiality · integrity · availability',
      pillars: PILLARS_EN,
    },
    s2: {
      heading: 'EVERY ATTACK BREAKS <span style={{ color: THEME.red }}>ONE LEG</span>',
      attacks: ATTACKS_EN,
    },
    s3: {
      heading: <>WHAT'S WORTH THE MOST IS <span style={{ color: THEME.cyan }}>THE INFORMATION</span></>,
      footer: 'reading it breaks confidentiality: the attacker cracks it offline, no alerts',
      closeTitle: <>ENUMERATE: <span style={{ color: THEME.amber }}>WHICH LEG PAYS OFF TO ATTACK?</span></>,
      closeSubtitle: "and when you're defending: which one can't you afford to lose?",
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { panelAt: 4, pillarPoints: [[6, 9.5], [6, 9.5], [6, 9.5]] as [number, number][] },
    s2: { attackPoints: [[3, 7], [3, 7], [3, 7]] as [number, number][] },
    s3: { closeAt: 11, terminalDelay: 3 },
  },
  en: {
    s1: { panelAt: 3.2, pillarPoints: [[6.8, 9.9], [11.4, 14.4], [14.1, 18.1]] as [number, number][] },
    s2: { attackPoints: [[4.1, 6.1], [9.7, 11.0], [14.2, 16.2]] as [number, number][] },
    s3: { closeAt: 9.9, terminalDelay: 5.4 },
  },
};

const VID = 'cyber-01-cia-triad';

// ── Scene 1: las tres patas de la triada ────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1120 }}>
            {c.pillars.map((p, pi) => (
              <div
                key={p.name}
                style={{
                  flex: 1,
                  background: THEME.panel,
                  border: `1px solid ${p.color}60`,
                  borderRadius: 16,
                  padding: '26px 22px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: p.color, fontFamily: MONO, marginBottom: 12 }}>
                  {p.icon} {p.name}
                </div>
                {p.points.map((pt, ti) => (
                    <RevealLine key={ti} at={b.pillarPoints[pi][ti]} fps={fps} mark="▸" color={p.color}>{pt}</RevealLine>
                ))}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: ataques reales por cada pata ─────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        {c.attacks.map((a, ai) => (
          <div
            key={a.name}
            style={{
              flex: 1,
              background: THEME.panel,
              border: `1px solid ${a.color}60`,
              borderRadius: 16,
              padding: '26px 22px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: a.color, fontFamily: MONO, marginBottom: 12 }}>
              {a.name}
            </div>
            {a.attacks.map((at, ti) => (
              <RevealLine key={ti} at={b.attackPoints[ai][ti]} fps={fps} mark="✗" color={THEME.red}>{at}</RevealLine>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: cierre — el ángulo del pentester ──────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.heading}
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={680} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> cat /etc/shadow | head -2
              {'\n'}root:$6$rounds=656000$abcdef$<span style={{ color: THEME.dim }}>...</span>:19100:0:99999:7:::
              {'\n'}admin:$6$rounds=656000$ghijkl$<span style={{ color: THEME.dim }}>...</span>:19100:0:99999:7:::
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 22, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
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
export const Ci01CiaTriad: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: la triada */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/cyber-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: ataques reales */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/cyber-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/cyber-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
