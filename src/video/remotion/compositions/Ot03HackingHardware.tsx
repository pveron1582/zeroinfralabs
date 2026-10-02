// ── video/remotion/compositions/Ot03HackingHardware.tsx ─────────────
// Video: hardware de hacking — WiFi Pineapple (rogue AP), inyección USB HID
// (Rubber Ducky / Bash Bunny), Flipper Zero y compañía (O.MG, Proxmark3,
// HackRF One). Cierre: todo es de doble uso.
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
      title: <>HARDWARE DE <span style={{ color: THEME.cyan }}>HACKING</span></>,
      subtitle: 'WiFi Pineapple · Flipper Zero · Rubber Ducky',
      labelNetworks: 'redes',
      labelKeyboards: 'teclados',
      labelRadios: 'radios y llaves',
      disclaimer: (
        <>
          <span style={{ color: THEME.amber }}>doble uso</span>: también son la herramienta
          <br />con la que los defensores prueban su equipo
        </>
      ),
      cardsAt: 8.5,
      disAt: 13,
    },
    s2: {
      pineappleHeading: '🍍 WIFI PINEAPPLE',
      duckyHeading: '⌨️ INYECCIÓN USB HID',
      pineapplePoints: [
        { text: 'crea su propia red', at: 1.5 },
        { text: 'emite el nombre de una red real (café, aeropuerto)', at: 4 },
        { text: 'los dispositivos se conectan solos', at: 7.5 },
        { text: 'queda en el medio viendo todo el tráfico', at: 9.5 },
        { text: 'plugins: cookies · inyectar · MITM', at: 11.5 },
      ],
      duckyPoints: [
        { text: 'Rubber Ducky: la PC lo ve como teclado', at: 16.5 },
        { text: 'escribe comandos a toda velocidad', at: 19.5 },
        { text: 'abre terminal, descarga y ejecuta el payload', at: 21.5 },
        { text: 'Bash Bunny: teclado + placa de red + disco', at: 26.5 },
      ],
    },
    s3: {
      heading: <>FLIPPER ZERO: <span style={{ color: THEME.cyan }}>LA NAVAJA SUIZA</span></>,
      flipperChips: [
        { label: 'tarjetas de acceso', value: 'RFID/NFC', at: 2.5 },
        { label: 'portones y remotos', value: '433 MHz', at: 5 },
        { label: 'TVs y cámaras', value: 'IR', at: 10 },
        { label: 'electrónica', value: 'GPIO', at: 11.5 },
        { label: 'repetir señal', value: 'REPLAY', at: 14 },
      ],
      replayText: 'probás si tu portón aguanta un ataque de replay',
      replayAt: 13.5,
      moreHeading: 'Y MÁS COMPAÑEROS:',
      moreCapsules: [
        { label: 'cable USB con implante Wi-Fi', value: 'O.MG CABLE', accent: THEME.red, delayAt: 0.8 },
        { label: 'auditar tarjetas', value: 'PROXMARK3', accent: THEME.purple, delayAt: 5.5 },
        { label: 'radio 1 MHz - 6 GHz', value: 'HACKRF ONE', accent: THEME.amber, delayAt: 8.5 },
      ],
      radioText: 'graban y repiten señales de radio',
      radioAt: 11,
      moreAt: 20,
    },
    s4: {
      heading: <>TODO ES DE <span style={{ color: THEME.green }}>DOBLE USO</span></>,
      attackerLabel: 'entrar',
      attackerValue: 'ATACANTE',
      defenderLabel: 'probar defensas',
      defenderValue: 'DEFENSOR',
      footer: 'entendiendo cómo entran, te protegés mejor',
      closeAt: 11,
      closeTitle: <>LA TÉCNICA <span style={{ color: THEME.amber }}>IMPORTA MÁS</span> QUE EL GADGET</>,
      closeSubtitle: 'el hardware es solo la herramienta',
    },
  },
  en: {
    s1: {
      title: <>HACKING <span style={{ color: THEME.cyan }}>HARDWARE</span></>,
      subtitle: 'WiFi Pineapple · Flipper Zero · Rubber Ducky',
      labelNetworks: 'networks',
      labelKeyboards: 'keyboards',
      labelRadios: 'radios and keys',
      disclaimer: (
        <>
          <span style={{ color: THEME.amber }}>dual use</span>: they're also the tool
          <br />defenders use to test their own equipment
        </>
      ),
      cardsAt: 8.5,
      disAt: 15.2,
    },
    s2: {
      pineappleHeading: '🍍 WIFI PINEAPPLE',
      duckyHeading: '⌨️ USB HID INJECTION',
      pineapplePoints: [
        { text: 'creates its own network', at: 1.7 },
        { text: 'broadcasts the name of a real network (coffee, airport)', at: 5.2 },
        { text: 'devices connect on their own', at: 10.6 },
        { text: 'sits in the middle seeing all the traffic', at: 13.6 },
        { text: 'plugins: cookies · inject pages · MITM', at: 16.4 },
      ],
      duckyPoints: [
        { text: 'Rubber Ducky: the PC sees it as a keyboard', at: 21.6 },
        { text: 'it types commands at full speed', at: 26.2 },
        { text: 'opens a terminal, downloads and runs the payload', at: 28.6 },
        { text: 'Bash Bunny: keyboard + network adapter + storage', at: 32.4 },
      ],
    },
    s3: {
      heading: <>FLIPPER ZERO: <span style={{ color: THEME.cyan }}>THE SWISS ARMY KNIFE</span></>,
      flipperChips: [
        { label: 'access cards', value: 'RFID/NFC', at: 4.3 },
        { label: 'garage doors and remotes', value: '433 MHz', at: 7.0 },
        { label: 'TVs and cameras', value: 'IR', at: 13.1 },
        { label: 'electronics', value: 'GPIO', at: 14.9 },
        { label: 'replay a signal', value: 'REPLAY', at: 17.1 },
      ],
      replayText: 'test whether your garage door survives a replay attack',
      replayAt: 19.0,
      moreHeading: 'AND MORE COMPANIONS:',
      moreCapsules: [
        { label: 'USB cable with a hidden Wi-Fi implant', value: 'O.MG CABLE', accent: THEME.red, delayAt: 1.2 },
        { label: 'auditing access cards', value: 'PROXMARK3', accent: THEME.purple, delayAt: 6.8 },
        { label: 'radio 1 MHz - 6 GHz', value: 'HACKRF ONE', accent: THEME.amber, delayAt: 10.9 },
      ],
      radioText: 'they capture and replay radio signals',
      radioAt: 12,
      moreAt: 22.8,
    },
    s4: {
      heading: <>IT'S ALL <span style={{ color: THEME.green }}>DUAL USE</span></>,
      attackerLabel: 'to break in',
      attackerValue: 'ATTACKER',
      defenderLabel: 'to test defenses',
      defenderValue: 'DEFENDER',
      footer: 'understanding how they get in protects you better',
      closeAt: 12.9,
      closeTitle: <>THE <span style={{ color: THEME.amber }}>TECHNIQUE</span> MATTERS MORE THAN THE GADGET</>,
      closeSubtitle: 'the hardware is just the tool',
    },
  },
};

const VID = 'others-03-hacking-hardware';

// ── Escena 1: título + disclaimer de doble uso ──────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1 }> = ({ fps, c }) => {
  const cardsAt = Math.round(c.cardsAt * fps);
  const disAt = Math.round(c.disAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardsAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={cardsAt} durationInFrames={disAt - cardsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label={c.labelNetworks} value="🍍 WiFi" accent={THEME.amber} size={24} />
            <KeyCapsule label={c.labelKeyboards} value="⌨️ USB HID" accent={THEME.green} size={24} />
            <KeyCapsule label={c.labelRadios} value="🦄 Flipper" accent={THEME.cyan} size={24} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={disAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            {c.disclaimer}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: WiFi Pineapple + inyección USB HID ────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
            {c.pineappleHeading}
          </div>
          {c.pineapplePoints.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '24px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>
            {c.duckyHeading}
          </div>
          {c.duckyPoints.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: Flipper Zero + compañía ───────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3 }> = ({ fps, c }) => {
  const moreAt = Math.round(c.moreAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={moreAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {c.flipperChips.map(ch => (
              <KeyCapsule key={ch.value} label={ch.label} value={ch.value} accent={THEME.cyan} delay={Math.round(ch.at * fps)} size={20} />
            ))}
          </div>
          <RevealLine at={c.replayAt} fps={fps} mark="▸" color={THEME.cyan}>{c.replayText}</RevealLine>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={moreAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            {c.moreHeading}
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {c.moreCapsules.map(cap => (
              <KeyCapsule key={cap.value} label={cap.label} value={cap.value} accent={cap.accent} delay={Math.round(cap.delayAt * fps)} size={20} />
            ))}
          </div>
          <RevealLine at={c.radioAt} fps={fps} mark="▸" color={THEME.amber}>{c.radioText}</RevealLine>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 4: cierre — todo es de doble uso ─────────────────────────
const Scene4: React.FC<{ fps: number; c: typeof COPY.es.s4 }> = ({ fps, c }) => {
  const closeAt = Math.round(c.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 26 }}>
            <KeyCapsule label={c.attackerLabel} value={c.attackerValue} accent={THEME.red} size={20} />
            <KeyCapsule label={c.defenderLabel} value={c.defenderValue} accent={THEME.green} size={20} />
          </div>
          <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
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
export const Ot03HackingHardware: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: título + doble uso */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} />
      </Sequence>

      {/* Scene 2: Pineapple + USB HID */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} />
      </Sequence>

      {/* Scene 3: Flipper + compañía */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} />
      </Sequence>

      {/* Scene 4: cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-03-scene4.wav`)} />}
        <Scene4 fps={fps} c={c.s4} />
      </Sequence>
    </AbsoluteFill>
  );
};
