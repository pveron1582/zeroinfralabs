// ── video/remotion/compositions/Ot04SocialEngineering.tsx ───────────
// Video: gadgets ofensivos e ingeniería social (solo educativo) —
// skimmers y clonadores de tarjetas, clonación de acceso RFID, y las
// técnicas clásicas de ingeniería social. Cierre: merece un módulo en
// Hacking Ético.
// Con audio de la voz "Miguel" (4 escenas, ~121s).
// Syncs internos alineados a los segmentos de habla medidos con
// silencedetect (-50dB) sobre los wavs reales (2026-08-15).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
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

// ── Escena 1: disclaimer educativo ──────────────────────────────────
const Scene1: React.FC = () => {
  return (
    <TitleScene
      title={<span style={{ color: THEME.amber }}>SOLO EDUCATIVO</span>}
      subtitle="entender cómo atacan sirve para defenderte, no para robar"
      fontSize={44}
    />
  );
};

// ── Escena 2: skimmers + clonadores de acceso ───────────────────────
// Habla (voz Miguel): 'se coloca sobre el lector real' ~2 · 'lee la
// banda' ~7.5 · 'cámara o teclado falso: PIN' ~11 · 'clona la banda'
// ~14.5 · 'chip EMV' ~18 · 'Mifare Classic con cifrado roto' ~26 ·
// 'clon sin tocarla' ~34 · 'migrar a AES y por celular' ~39
const SKIMMER_POINTS = [
  { text: 'se coloca sobre el lector real (cajero, surtidor)', at: 2 },
  { text: 'lee la banda magnética al pasar la tarjeta', at: 7.5 },
  { text: '+ cámara o teclado falso = número y PIN', at: 11 },
  { text: 'clona la banda en una tarjeta en blanco', at: 14.5 },
  { text: 'chip EMV: el clon no sirve para pagar', at: 18 },
];

const ACCESS_POINTS = [
  { text: 'RFID viejo: Mifare Classic con cifrado roto', at: 26 },
  { text: 'clon sin tocarla (lector / Flipper / Proxmark)', at: 34 },
  { text: 'migrar a AES y credenciales por celular', at: 39 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
            💳 SKIMMERS Y CLONADORES
          </div>
          {SKIMMER_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
            🪪 TARJETAS DE ACCESO
          </div>
          {ACCESS_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.cyan}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: las técnicas de ingeniería social ─────────────────────
// Habla (voz Miguel): 'phishing' ~11 · 'vishing' ~15 · 'baiting' ~18 ·
// 'pretexting' ~21 · 'tailgating' ~25 · 'ningún firewall bloquea' ~28
const TECHNIQUES = [
  { name: 'PHISHING', desc: 'mail falso de una entidad de confianza', at: 11 },
  { name: 'VISHING', desc: 'la misma estafa, por teléfono', at: 15 },
  { name: 'BAITING', desc: 'USB o descarga tentadora con malware', at: 18 },
  { name: 'PRETEXTING', desc: 'inventar una situación falsa para sacarte datos', at: 21 },
  { name: 'TAILGATING', desc: 'entrar detrás tuyo por la puerta segura', at: 25 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(28 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            INGENIERÍA SOCIAL: <span style={{ color: THEME.red }}>ATACAR AL HUMANO</span>
          </div>
          <div style={{ width: 900, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 28px', textAlign: 'left' }}>
            {TECHNIQUES.map(t => (
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
            ningún firewall bloquea una <span style={{ color: THEME.red }}>llamada amable</span> pidiendo tu contraseña
          </div>
          <div style={{ marginTop: 18, fontSize: 19, color: THEME.muted, fontFamily: MONO }}>
            lo hacen la capacitación y la verificación
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 4: cierre — por qué un pentester necesita esto ───────────
// Habla (voz Miguel): 'clonación / USB drops / vishing' ~3-6.5 ·
// 'así entran los atacantes reales' ~8 · 'merece un módulo entero' ~17.5
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(17.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            PARTE REAL DEL <span style={{ color: THEME.cyan }}>PENTESTING</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="clonar credenciales" value="BADGE CLONING" accent={THEME.cyan} delay={Math.round(3 * fps)} size={18} />
            <KeyCapsule label="USB drops" value="USB DROPS" accent={THEME.amber} delay={Math.round(5 * fps)} size={18} />
            <KeyCapsule label="llamadas falsas" value="VISHING" accent={THEME.red} delay={Math.round(6.5 * fps)} size={18} />
          </div>
          <RevealLine at={8} fps={fps} mark="▸" color={THEME.cyan}>así entran los atacantes reales</RevealLine>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>MERECE UN <span style={{ color: THEME.amber }}>MÓDULO ENTERO</span> EN HACKING ÉTICO</>}
          subtitle="hackear no es solo teclado: puertas, credenciales, cables y conversaciones"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot04SocialEngineering: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['ot-04-social-engineering'];
  const starts = sceneStartFrames('ot-04-social-engineering', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: disclaimer */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/ot-04-social-engineering/ot-04-scene1.wav')} />
        <Scene1 />
      </Sequence>

      {/* Scene 2: skimmers + clonadores */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/ot-04-social-engineering/ot-04-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: técnicas de ingeniería social */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/ot-04-social-engineering/ot-04-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/ot-04-social-engineering/ot-04-scene4.wav')} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};