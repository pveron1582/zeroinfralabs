// ── video/remotion/compositions/Ot03HackingHardware.tsx ─────────────
// Video: hardware de hacking — WiFi Pineapple (rogue AP), inyección USB HID
// (Rubber Ducky / Bash Bunny), Flipper Zero y compañía (O.MG, Proxmark3,
// HackRF One). Cierre: todo es de doble uso.
// Con audio de la voz "Miguel" (4 escenas, ~107s).
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

// ── Escena 1: título + disclaimer de doble uso ──────────────────────
// Habla (voz Miguel): 'no todo ataque sale de un teclado' ~0 ·
// 'dispositivos físicos' ~3 · 'Pineapple / Flipper / Ducky' ~8.5 ·
// 'todo es de doble uso' ~13
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const cardsAt = Math.round(8.5 * fps);
  const disAt = Math.round(13 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardsAt}>
        <TitleScene
          title={<>HARDWARE DE <span style={{ color: THEME.cyan }}>HACKING</span></>}
          subtitle="WiFi Pineapple · Flipper Zero · Rubber Ducky"
        />
      </Sequence>
      <Sequence from={cardsAt} durationInFrames={disAt - cardsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="redes" value="🍍 WiFi" accent={THEME.amber} size={24} />
            <KeyCapsule label="teclados" value="⌨️ USB HID" accent={THEME.green} size={24} />
            <KeyCapsule label="radios y llaves" value="🦄 Flipper" accent={THEME.cyan} size={24} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={disAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            <span style={{ color: THEME.amber }}>doble uso</span>: también son la herramienta
            <br />con la que los defensores prueban su equipo
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: WiFi Pineapple + inyección USB HID ────────────────────
// Habla (voz Miguel): Pineapple: 'crea su propia red' ~1.5 · 'emite el
// nombre de una red real' ~4 · 'se conectan solos' ~7.5 · 'queda en el
// medio' ~9.5 · 'plugins: cookies / inyectar / MITM' ~11.5 ·
// Ducky: 'la PC lo ve como teclado' ~16.5 · 'escribe a toda velocidad'
// ~19.5 · 'abre terminal y ejecuta' ~21.5 · 'Bash Bunny' ~26.5
const PINEAPPLE_POINTS = [
  { text: 'crea su propia red', at: 1.5 },
  { text: 'emite el nombre de una red real (café, aeropuerto)', at: 4 },
  { text: 'los dispositivos se conectan solos', at: 7.5 },
  { text: 'queda en el medio viendo todo el tráfico', at: 9.5 },
  { text: 'plugins: cookies · inyectar · MITM', at: 11.5 },
];

const DUCKY_POINTS = [
  { text: 'Rubber Ducky: la PC lo ve como teclado', at: 16.5 },
  { text: 'escribe comandos a toda velocidad', at: 19.5 },
  { text: 'abre terminal, descarga y ejecuta el payload', at: 21.5 },
  { text: 'Bash Bunny: teclado + placa de red + disco', at: 26.5 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
            🍍 WIFI PINEAPPLE
          </div>
          {PINEAPPLE_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>
            ⌨️ INYECCIÓN USB HID
          </div>
          {DUCKY_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: Flipper Zero + compañía ───────────────────────────────
// Habla (voz Miguel): 'RFID/NFC' ~2.5 · '433 MHz' ~5 · 'IR' ~10 ·
// 'GPIO' ~11.5 · 'replay' ~14 · 'O.MG Cable' ~20.5 · 'Proxmark3' ~26 ·
// 'HackRF One' ~29 · 'graban y repiten señales' ~31
const FLIPPER_CHIPS = [
  { label: 'tarjetas de acceso', value: 'RFID/NFC', at: 2.5 },
  { label: 'portones y remotos', value: '433 MHz', at: 5 },
  { label: 'TVs y cámaras', value: 'IR', at: 10 },
  { label: 'electrónica', value: 'GPIO', at: 11.5 },
  { label: 'repetir señal', value: 'REPLAY', at: 14 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const moreAt = Math.round(20 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={moreAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            FLIPPER ZERO: <span style={{ color: THEME.cyan }}>LA NAVAJA SUIZA</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {FLIPPER_CHIPS.map(c => (
              <KeyCapsule key={c.value} label={c.label} value={c.value} accent={THEME.cyan} delay={Math.round(c.at * fps)} size={20} />
            ))}
          </div>
          <RevealLine at={13.5} fps={fps} mark="▸" color={THEME.cyan}>probás si tu portón aguanta un ataque de replay</RevealLine>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={moreAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            Y MÁS COMPAÑEROS:
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="cable USB con implante Wi-Fi" value="O.MG CABLE" accent={THEME.red} delay={Math.round(0.8 * fps)} size={20} />
            <KeyCapsule label="auditar tarjetas" value="PROXMARK3" accent={THEME.purple} delay={Math.round(5.5 * fps)} size={20} />
            <KeyCapsule label="radio 1 MHz - 6 GHz" value="HACKRF ONE" accent={THEME.amber} delay={Math.round(8.5 * fps)} size={20} />
          </div>
          <RevealLine at={11} fps={fps} mark="▸" color={THEME.amber}>graban y repiten señales de radio</RevealLine>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 4: cierre — todo es de doble uso ─────────────────────────
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(11 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            TODO ES DE <span style={{ color: THEME.green }}>DOBLE USO</span>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 26 }}>
            <KeyCapsule label="entrar" value="ATACANTE" accent={THEME.red} size={20} />
            <KeyCapsule label="probar defensas" value="DEFENSOR" accent={THEME.green} size={20} />
          </div>
          <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            entendiendo cómo entran, te protegés mejor
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>LA TÉCNICA <span style={{ color: THEME.amber }}>IMPORTA MÁS</span> QUE EL GADGET</>}
          subtitle="el hardware es solo la herramienta"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot03HackingHardware: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['ot-03-hacking-hardware'];
  const starts = sceneStartFrames('ot-03-hacking-hardware', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: título + doble uso */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/ot-03-hacking-hardware/ot-03-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: Pineapple + USB HID */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/ot-03-hacking-hardware/ot-03-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: Flipper + compañía */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/ot-03-hacking-hardware/ot-03-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/ot-03-hacking-hardware/ot-03-scene4.wav')} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};