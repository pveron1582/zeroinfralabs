// ── video/remotion/compositions/Ot04SocialEngineering.tsx ───────────
// Video: gadgets ofensivos e ingeniería social (solo educativo) —
// skimmers y clonadores de tarjetas, clonación de acceso RFID, y las
// técnicas clásicas de ingeniería social. Cierre: merece un módulo en
// Hacking Ético.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { KeyCapsule } from '../primitives/KeyCapsule';
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
      title: <span style={{ color: THEME.amber }}>SOLO EDUCATIVO</span>,
      subtitle: 'entender cómo atacan sirve para defenderte, no para robar',
    },
    s2: {
      skimmerHeading: '💳 SKIMMERS Y CLONADORES',
      accessHeading: '🪪 TARJETAS DE ACCESO',
      skimmerPoints: [
        { text: 'se coloca sobre el lector real (cajero, surtidor)', at: 2 },
        { text: 'lee la banda magnética al pasar la tarjeta', at: 7.5 },
        { text: '+ cámara o teclado falso = número y PIN', at: 11 },
        { text: 'clona la banda en una tarjeta en blanco', at: 14.5 },
        { text: 'chip EMV: el clon no sirve para pagar', at: 18 },
      ],
      accessPoints: [
        { text: 'RFID viejo: Mifare Classic con cifrado roto', at: 26 },
        { text: 'clon sin tocarla (lector / Flipper / Proxmark)', at: 34 },
        { text: 'migrar a AES y credenciales por celular', at: 39 },
      ],
    },
    s3: {
      heading: <>INGENIERÍA SOCIAL: <span style={{ color: THEME.red }}>ATACAR AL HUMANO</span></>,
      techniques: [
        { name: 'PHISHING', desc: 'mail falso de una entidad de confianza', at: 11 },
        { name: 'VISHING', desc: 'la misma estafa, por teléfono', at: 15 },
        { name: 'BAITING', desc: 'USB o descarga tentadora con malware', at: 18 },
        { name: 'PRETEXTING', desc: 'inventar una situación falsa para sacarte datos', at: 21 },
        { name: 'TAILGATING', desc: 'entrar detrás tuyo por la puerta segura', at: 25 },
      ],
      closeAt: 28,
      closeHeading: <>ningún firewall bloquea una <span style={{ color: THEME.red }}>llamada amable</span> pidiendo tu contraseña</>,
      closeFooter: 'lo hacen la capacitación y la verificación',
    },
    s4: {
      heading: <>PARTE REAL DEL <span style={{ color: THEME.cyan }}>PENTESTING</span></>,
      capsules: [
        { label: 'clonar credenciales', value: 'BADGE CLONING', accent: THEME.cyan, delayAt: 3 },
        { label: 'USB drops', value: 'USB DROPS', accent: THEME.amber, delayAt: 5 },
        { label: 'llamadas falsas', value: 'VISHING', accent: THEME.red, delayAt: 6.5 },
      ],
      revealText: 'así entran los atacantes reales',
      revealAt: 8,
      closeAt: 17.5,
      closeTitle: <>MERECE UN <span style={{ color: THEME.amber }}>MÓDULO ENTERO</span> EN HACKING ÉTICO</>,
      closeSubtitle: 'hackear no es solo teclado: puertas, credenciales, cables y conversaciones',
    },
  },
  en: {
    s1: {
      title: <span style={{ color: THEME.amber }}>EDUCATIONAL ONLY</span>,
      subtitle: 'understanding how attacks work serves to defend yourself, not to steal',
    },
    s2: {
      skimmerHeading: '💳 SKIMMERS AND CLONERS',
      accessHeading: '🪪 ACCESS CARDS',
      skimmerPoints: [
        { text: 'placed over the real reader (ATM, gas pump)', at: 1.8 },
        { text: 'reads the magnetic stripe when you swipe', at: 7.6 },
        { text: '+ hidden camera or fake keypad = number and PIN', at: 10.6 },
        { text: 'clones the stripe onto a blank card', at: 17.0 },
        { text: 'the EMV chip makes clones useless for paying', at: 19.3 },
      ],
      accessPoints: [
        { text: 'old RFID: Mifare Classic, broken for years', at: 29.3 },
        { text: 'copy your badge in seconds, without touching it', at: 34.8 },
        { text: 'migrate to AES cards and phone credentials', at: 40.6 },
      ],
    },
    s3: {
      heading: <>SOCIAL ENGINEERING: <span style={{ color: THEME.red }}>HACKING THE HUMAN</span></>,
      techniques: [
        { name: 'PHISHING', desc: 'a fake email impersonating a trusted entity', at: 14.3 },
        { name: 'VISHING', desc: 'the same scam, over the phone', at: 17.9 },
        { name: 'BAITING', desc: 'a tempting USB or download hiding malware', at: 21.1 },
        { name: 'PRETEXTING', desc: 'a false scenario to make you hand over data', at: 25.0 },
        { name: 'TAILGATING', desc: 'walking in behind an employee through a secure door', at: 28.9 },
      ],
      closeAt: 32.5,
      closeHeading: <>no firewall blocks a <span style={{ color: THEME.red }}>friendly call</span> asking for your password</>,
      closeFooter: "that's what training and verification are for",
    },
    s4: {
      heading: <>A REAL PART OF <span style={{ color: THEME.cyan }}>PENTESTING</span></>,
      capsules: [
        { label: 'clone credentials', value: 'BADGE CLONING', accent: THEME.cyan, delayAt: 4.1 },
        { label: 'USB drops', value: 'USB DROPS', accent: THEME.amber, delayAt: 5.6 },
        { label: 'fake calls', value: 'VISHING', accent: THEME.red, delayAt: 7.0 },
      ],
      revealText: "that's how real attackers get in",
      revealAt: 10.1,
      closeAt: 19.0,
      closeTitle: <>DESERVES <span style={{ color: THEME.amber }}>ITS OWN MODULE</span> IN ETHICAL HACKING</>,
      closeSubtitle: "hacking isn't just keyboards: doors, badges, cables, and conversations",
    },
  },
};

const VID = 'ot-04-social-engineering';

// ── Escena 1: disclaimer educativo ──────────────────────────────────
const Scene1: React.FC<{ c: typeof COPY.es.s1 }> = ({ c }) => {
  return (
    <TitleScene
      title={c.title}
      subtitle={c.subtitle}
      fontSize={44}
    />
  );
};

// ── Escena 2: skimmers + clonadores de acceso ───────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
            {c.skimmerHeading}
          </div>
          {c.skimmerPoints.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
            {c.accessHeading}
          </div>
          {c.accessPoints.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.cyan}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: las técnicas de ingeniería social ─────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3 }> = ({ fps, c }) => {
  const closeAt = Math.round(c.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            {c.heading}
          </div>
          <div style={{ width: 900, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 28px', textAlign: 'left' }}>
            {c.techniques.map(t => (
              <RevealLine key={t.name} at={t.at} fps={fps} mark="⚠" color={THEME.red}>
                <span style={{ fontWeight: 700, color: THEME.text }}>{t.name}</span>
                <span style={{ color: THEME.muted }}> — {t.desc}</span>
              </RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            {c.closeHeading}
          </div>
          <div style={{ marginTop: 18, fontSize: 19, color: THEME.muted, fontFamily: MONO }}>
            {c.closeFooter}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 4: cierre — por qué un pentester necesita esto ───────────
const Scene4: React.FC<{ fps: number; c: typeof COPY.es.s4 }> = ({ fps, c }) => {
  const closeAt = Math.round(c.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {c.capsules.map(cap => (
              <KeyCapsule key={cap.value} label={cap.label} value={cap.value} accent={cap.accent} delay={Math.round(cap.delayAt * fps)} size={18} />
            ))}
          </div>
          <RevealLine at={c.revealAt} fps={fps} mark="▸" color={THEME.cyan}>{c.revealText}</RevealLine>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Ot04SocialEngineering: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];

  const [s1, s2, s3, s4] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: disclaimer */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-04-scene1.wav`)} />}
        <Scene1 c={c.s1} />
      </Sequence>

      {/* Scene 2: skimmers + clonadores */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} />
      </Sequence>

      {/* Scene 3: técnicas de ingeniería social */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} />
      </Sequence>

      {/* Scene 4: cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-04-scene4.wav`)} />}
        <Scene4 fps={fps} c={c.s4} />
      </Sequence>
    </AbsoluteFill>
  );
};
