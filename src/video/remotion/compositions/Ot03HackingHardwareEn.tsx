// ── video/remotion/compositions/Ot03HackingHardwareEn.tsx ──────
// English version of ot-03-hacking-hardware. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
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

// ── Scene 1: title + dual-use disclaimer ────────────────────────
// EN: physical devices 2.4 · Pineapple/Flipper/Ducky 8.5 · dual use
// 16.2. Cards at 8.5, disclaimer at 15.2.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const cardsAt = Math.round(8.5 * fps);
  const disAt = Math.round(15.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardsAt}>
        <TitleScene
          title={<>HACKING <span style={{ color: THEME.cyan }}>HARDWARE</span></>}
          subtitle="WiFi Pineapple · Flipper Zero · Rubber Ducky"
        />
      </Sequence>
      <Sequence from={cardsAt} durationInFrames={disAt - cardsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="networks" value="🍍 WiFi" accent={THEME.amber} size={24} />
            <KeyCapsule label="keyboards" value="⌨️ USB HID" accent={THEME.green} size={24} />
            <KeyCapsule label="radios and keys" value="🦄 Flipper" accent={THEME.cyan} size={24} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={disAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
            <span style={{ color: THEME.amber }}>dual use</span>: they're also the tool
            <br />defenders use to test their own equipment
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: WiFi Pineapple + USB HID injection ────────────────
// EN Pineapple: own network 1.7 · real network name 5.2 · connect on
// their own 10.6 · middle 13.6 · plugins 16.4 · Ducky: keyboard 21.6 ·
// types 26.2 · terminal 28.6 · Bash Bunny 32.4
const PINEAPPLE_POINTS = [
  { text: 'creates its own network', at: 1.7 },
  { text: 'broadcasts the name of a real network (coffee, airport)', at: 5.2 },
  { text: 'devices connect on their own', at: 10.6 },
  { text: 'sits in the middle seeing all the traffic', at: 13.6 },
  { text: 'plugins: cookies · inject pages · MITM', at: 16.4 },
];

const DUCKY_POINTS = [
  { text: 'Rubber Ducky: the PC sees it as a keyboard', at: 21.6 },
  { text: 'it types commands at full speed', at: 26.2 },
  { text: 'opens a terminal, downloads and runs the payload', at: 28.6 },
  { text: 'Bash Bunny: keyboard + network adapter + storage', at: 32.4 },
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
            ⌨️ USB HID INJECTION
          </div>
          {DUCKY_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: Flipper Zero + friends ────────────────────────────
// EN: RFID 4.3 · 433 MHz 7.0 · IR 13.1 · GPIO 14.9 · replay 17.1 ·
// "more" 22.8 · O.MG 24.0 · Proxmark3 29.6 · HackRF 33.7
const FLIPPER_CHIPS = [
  { label: 'access cards', value: 'RFID/NFC', at: 4.3 },
  { label: 'garage doors and remotes', value: '433 MHz', at: 7.0 },
  { label: 'TVs and cameras', value: 'IR', at: 13.1 },
  { label: 'electronics', value: 'GPIO', at: 14.9 },
  { label: 'replay a signal', value: 'REPLAY', at: 17.1 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const moreAt = Math.round(22.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={moreAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            FLIPPER ZERO: <span style={{ color: THEME.cyan }}>THE SWISS ARMY KNIFE</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {FLIPPER_CHIPS.map(c => (
              <KeyCapsule key={c.value} label={c.label} value={c.value} accent={THEME.cyan} delay={Math.round(c.at * fps)} size={20} />
            ))}
          </div>
          <RevealLine at={19.0} fps={fps} mark="▸" color={THEME.cyan}>test whether your garage door survives a replay attack</RevealLine>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={moreAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            AND MORE COMPANIONS:
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="USB cable with a hidden Wi-Fi implant" value="O.MG CABLE" accent={THEME.red} delay={Math.round(1.2 * fps)} size={20} />
            <KeyCapsule label="auditing access cards" value="PROXMARK3" accent={THEME.purple} delay={Math.round(6.8 * fps)} size={20} />
            <KeyCapsule label="radio 1 MHz - 6 GHz" value="HACKRF ONE" accent={THEME.amber} delay={Math.round(10.9 * fps)} size={20} />
          </div>
          <RevealLine at={12} fps={fps} mark="▸" color={THEME.amber}>they capture and replay radio signals</RevealLine>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 4: closing — all dual use ────────────────────────────
// EN: dual use 1.2 · attacker 2.3 · defender 4.7 · protect 7.4 ·
// "what matter" 12.9-16.3
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(12.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            IT'S ALL <span style={{ color: THEME.green }}>DUAL USE</span>
          </div>
          <div style={{ display: 'flex', gap: 18, marginTop: 26 }}>
            <KeyCapsule label="to break in" value="ATTACKER" accent={THEME.red} size={20} />
            <KeyCapsule label="to test defenses" value="DEFENDER" accent={THEME.green} size={20} />
          </div>
          <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            understanding how they get in protects you better
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>THE <span style={{ color: THEME.amber }}>TECHNIQUE</span> MATTERS MORE THAN THE GADGET</>}
          subtitle="the hardware is just the tool"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot03HackingHardwareEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['ot-03-hacking-hardware'];
  const starts = sceneStartFrames('ot-03-hacking-hardware', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: title + dual use */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ot-03-hacking-hardware/ot-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: Pineapple + USB HID */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ot-03-hacking-hardware/ot-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: Flipper + friends */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ot-03-hacking-hardware/ot-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: closing */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/ot-03-hacking-hardware/ot-03-scene4.wav`)} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
