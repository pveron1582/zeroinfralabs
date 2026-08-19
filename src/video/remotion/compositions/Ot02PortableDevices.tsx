// ── video/remotion/compositions/Ot02PortableDevices.tsx ─────────────
// Video: equipos portátiles y de electrónica — Android (kernel Linux),
// iOS (Unix encerrado) y Raspberry Pi (Debian para electrónica).
// Con audio de la voz "Miguel" (4 escenas, ~103s).
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

// ── Escena 1: tu teléfono también es un sistema ─────────────────────
const Scene1: React.FC = () => {
  return (
    <TitleScene
      title={<>TU TELÉFONO TAMBIÉN ES UN <span style={{ color: THEME.green }}>SISTEMA</span></>}
      subtitle="Android es Linux · iOS es Unix · la Pi es Linux pura"
    />
  );
};

// ── Escena 2: Android, Linux por dentro ─────────────────────────────
// Habla (voz Miguel): 'kernel Linux modificado' ~1.5 · 'la mayoría son
// Android' ~4 · 'adb shell: shell real' ~8.5 · 'sandbox / ART' ~13.5 ·
// 'sin root → Magisk / LineageOS' ~18.5
const ANDROID_POINTS = [
  { text: 'kernel Linux modificado', at: 1.5 },
  { text: 'la mayoría de los Linux del mundo son Android', at: 4 },
  { text: 'adb shell: shell Linux real', at: 8.5 },
  { text: 'apps sandboxeadas · ART', at: 13.5 },
  { text: 'sin root por defecto → Magisk / LineageOS', at: 18.5 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
        ANDROID: <span style={{ color: THEME.green }}>LINUX POR DENTRO</span>
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 560, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
          {ANDROID_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
        <TerminalWindow title="miguel@phone:~$" width={430} delay={Math.round(8.5 * fps)}>
          <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
            <span style={{ color: THEME.cyan }}>miguel@phone:/ $</span> adb shell
            {'\n'}<span style={{ color: THEME.green }}>miguel@phone:/ $</span> ls /sdcard/
            {'\n'}DCIM <span style={{ color: THEME.dim }}>Download</span> Photos
            {'\n'}<span style={{ color: THEME.green }}>miguel@phone:/ $</span> id
            {'\n'}uid=2000(shell) gid=2000(shell)
          </div>
        </TerminalWindow>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: iOS, Unix muy encerrado ───────────────────────────────
// Habla (voz Miguel): 'núcleo Darwin' ~2 · 'el más encerrado' ~6.8 ·
// 'sandbox + App Store' ~9.5 · 'jailbreak' ~17.5 · 'exploits raros,
// caros y secretos' ~22.5 · 'un iPhone sin parchear es un trofeo' ~25
const IOS_POINTS = [
  { text: 'núcleo Darwin · Unix por dentro', at: 2 },
  { text: 'el sistema más encerrado de todos', at: 6.8 },
  { text: 'sandbox + solo App Store', at: 9.5 },
  { text: 'jailbreak = romper la sandbox para root', at: 17.5 },
  { text: 'exploits raros, caros y secretos', at: 22.5 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const captionAt = Math.round(25 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            iOS: <span style={{ color: THEME.red }}>UNIX MUY ENCERRADO</span>
          </div>
          <div style={{ width: 700, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 26px', textAlign: 'left' }}>
            {IOS_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO }}>
            un iPhone sin parchear es un trofeo
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 4: Raspberry Pi + cierre ─────────────────────────────────
// Habla (voz Miguel): 'basado en Debian: apt/sudo' ~5.5 · 'pines GPIO'
// ~12.5 · 'Pi-hole / consolas / NAS' ~16.5 · 'pentesting: caja de
// ataque, honeypot, gadget USB' ~22 · 'el otro es el hardware' ~26
const PI_POINTS = [
  { text: 'basado en Debian: mismo apt, mismo sudo', at: 5.5 },
  { text: 'pines GPIO → sensores, LEDs, motores', at: 12.5 },
  { text: 'Pi-hole · consolas retro · NAS', at: 16.5 },
  { text: 'en pentesting: caja de ataque, honeypot, gadget USB', at: 22 },
];

const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(26 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            RASPBERRY PI: <span style={{ color: THEME.purple }}>LINUX PARA ELECTRÓNICA</span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <TerminalWindow title="pi@raspberrypi:~$" width={430} delay={Math.round(5.5 * fps)}>
              <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.green }}>pi@raspberrypi:~$</span> cat /etc/os-release
                {'\n'}PRETTY_NAME="Raspbian GNU/Linux 11 (bullseye)"
                {'\n'}ID_LIKE=<span style={{ color: THEME.cyan }}>debian</span>
              </div>
            </TerminalWindow>
            <div style={{ width: 480, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
              {PI_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>LO "OTRO" ES EL <span style={{ color: THEME.purple }}>HARDWARE</span>, NO EL SOFTWARE</>}
          subtitle="misma base Linux: ya sabés cómo usarla"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot02PortableDevices: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['ot-02-portable-devices'];
  const starts = sceneStartFrames('ot-02-portable-devices', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: tu teléfono también es un sistema */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/ot-02-portable-devices/ot-02-scene1.wav')} />
        <Scene1 />
      </Sequence>

      {/* Scene 2: Android */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/ot-02-portable-devices/ot-02-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: iOS */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/ot-02-portable-devices/ot-02-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: Raspberry Pi + cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/ot-02-portable-devices/ot-02-scene4.wav')} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};