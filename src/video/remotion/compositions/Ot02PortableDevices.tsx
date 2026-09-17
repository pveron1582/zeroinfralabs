// ── video/remotion/compositions/Ot02PortableDevices.tsx ─────────────
// Video: equipos portátiles y de electrónica — Android (kernel Linux),
// iOS (Unix encerrado) y Raspberry Pi (Debian para electrónica).
// Versión unificada ES/EN con `lang` prop.

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
const COPY = {
  es: {
    s1: {
      title: <>TU TELÉFONO TAMBIÉN ES UN <span style={{ color: THEME.green }}>SISTEMA</span></>,
      subtitle: 'Android es Linux · iOS es Unix · la Pi es Linux pura',
    },
    s2: {
      heading: <>ANDROID: <span style={{ color: THEME.green }}>LINUX POR DENTRO</span></>,
      androidPoints: [
        { text: 'kernel Linux modificado', at: 1.5 },
        { text: 'la mayoría de los Linux del mundo son Android', at: 4 },
        { text: 'adb shell: shell Linux real', at: 8.5 },
        { text: 'apps sandboxeadas · ART', at: 13.5 },
        { text: 'sin root por defecto → Magisk / LineageOS', at: 18.5 },
      ],
    },
    s3: {
      heading: <>iOS: <span style={{ color: THEME.red }}>UNIX MUY ENCERRADO</span></>,
      iosPoints: [
        { text: 'núcleo Darwin · Unix por dentro', at: 2 },
        { text: 'el sistema más encerrado de todos', at: 6.8 },
        { text: 'sandbox + solo App Store', at: 9.5 },
        { text: 'jailbreak = romper la sandbox para root', at: 17.5 },
        { text: 'exploits raros, caros y secretos', at: 22.5 },
      ],
      caption: 'un iPhone sin parchear es un trofeo',
      captionAt: 25,
    },
    s4: {
      heading: <>RASPBERRY PI: <span style={{ color: THEME.purple }}>LINUX PARA ELECTRÓNICA</span></>,
      piPoints: [
        { text: 'basado en Debian: mismo apt, mismo sudo', at: 5.5 },
        { text: 'pines GPIO → sensores, LEDs, motores', at: 12.5 },
        { text: 'Pi-hole · consolas retro · NAS', at: 16.5 },
        { text: 'en pentesting: caja de ataque, honeypot, gadget USB', at: 22 },
      ],
      terminalDelay: 5.5,
      closeAt: 26,
      closeTitle: <>LO "OTRO" ES EL <span style={{ color: THEME.purple }}>HARDWARE</span>, NO EL SOFTWARE</>,
      closeSubtitle: 'misma base Linux: ya sabés cómo usarla',
    },
  },
  en: {
    s1: {
      title: <>YOUR PHONE IS A <span style={{ color: THEME.green }}>SYSTEM</span> TOO</>,
      subtitle: 'Android is Linux · iOS is Unix · the Pi is pure Linux',
    },
    s2: {
      heading: <>ANDROID: <span style={{ color: THEME.green }}>LINUX INSIDE</span></>,
      androidPoints: [
        { text: 'a modified Linux kernel', at: 0.0 },
        { text: 'most Linux devices in the world are Android', at: 3.6 },
        { text: 'adb shell: a real Linux shell', at: 6.7 },
        { text: 'apps sandboxed · they run inside ART', at: 15.4 },
        { text: 'no root by default → Magisk / LineageOS', at: 19.8 },
      ],
    },
    s3: {
      heading: <>iOS: <span style={{ color: THEME.red }}>HEAVILY LOCKED-DOWN UNIX</span></>,
      iosPoints: [
        { text: 'Darwin core · Unix inside', at: 3.7 },
        { text: 'the most locked-down system of all', at: 7.1 },
        { text: 'own sandbox + App Store only', at: 9.8 },
        { text: 'jailbreak = break the sandbox for root', at: 16.3 },
        { text: 'exploits are rare, expensive, and secret', at: 20.3 },
      ],
      caption: 'an unpatched iPhone is a trophy',
      captionAt: 23.6,
    },
    s4: {
      heading: <>RASPBERRY PI: <span style={{ color: THEME.purple }}>LINUX FOR ELECTRONICS</span></>,
      piPoints: [
        { text: 'based on Debian: same apt, same sudo', at: 5.2 },
        { text: 'GPIO pins → sensors, LEDs, motors', at: 13.6 },
        { text: 'Pi-hole · retro consoles · NAS', at: 19.3 },
        { text: 'in pentesting: attack box, honeypot, USB gadget', at: 22.9 },
      ],
      terminalDelay: 5.2,
      closeAt: 27.5,
      closeTitle: <>THE "OTHER" IS THE <span style={{ color: THEME.purple }}>HARDWARE</span>, NOT THE SOFTWARE</>,
      closeSubtitle: 'same Linux base: you already know how to use it',
    },
  },
};

const VID = 'ot-02-portable-devices';

// ── Escena 1: tu teléfono también es un sistema ─────────────────────
const Scene1: React.FC<{ c: typeof COPY.es.s1 }> = ({ c }) => {
  return (
    <TitleScene title={c.title} subtitle={c.subtitle} />
  );
};

// ── Escena 2: Android, Linux por dentro ─────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
        {c.heading}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 560, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
          {c.androidPoints.map(p => (
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
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3 }> = ({ fps, c }) => {
  const captionAt = Math.round(c.captionAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            {c.heading}
          </div>
          <div style={{ width: 700, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '24px 26px', textAlign: 'left' }}>
            {c.iosPoints.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="✗" color={THEME.red}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO }}>
            {c.caption}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 4: Raspberry Pi + cierre ─────────────────────────────────
const Scene4: React.FC<{ fps: number; c: typeof COPY.es.s4 }> = ({ fps, c }) => {
  const closeAt = Math.round(c.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <TerminalWindow title="pi@raspberrypi:~$" width={430} delay={Math.round(c.terminalDelay * fps)}>
              <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.green }}>pi@raspberrypi:~$</span> cat /etc/os-release
                {'\n'}PRETTY_NAME="Raspbian GNU/Linux 11 (bullseye)"
                {'\n'}ID_LIKE=<span style={{ color: THEME.cyan }}>debian</span>
              </div>
            </TerminalWindow>
            <div style={{ width: 480, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
              {c.piPoints.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
              ))}
            </div>
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
export const Ot02PortableDevices: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: tu teléfono también es un sistema */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-02-scene1.wav`)} />}
        <Scene1 c={c.s1} />
      </Sequence>

      {/* Scene 2: Android */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} />
      </Sequence>

      {/* Scene 3: iOS */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} />
      </Sequence>

      {/* Scene 4: Raspberry Pi + cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/ot-02-scene4.wav`)} />}
        <Scene4 fps={fps} c={c.s4} />
      </Sequence>
    </AbsoluteFill>
  );
};
