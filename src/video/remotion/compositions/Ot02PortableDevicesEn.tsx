// ── video/remotion/compositions/Ot02PortableDevicesEn.tsx ──────
// English version of ot-02-portable-devices. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
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

// ── Scene 1: your phone is a system too ──────────────────────────
const Scene1: React.FC = () => {
  return (
    <TitleScene
      title={<>YOUR PHONE IS A <span style={{ color: THEME.green }}>SYSTEM</span> TOO</>}
      subtitle="Android is Linux · iOS is Unix · the Pi is pure Linux"
    />
  );
};

// ── Scene 2: Android, Linux inside ───────────────────────────────
// EN: kernel 0.0 · most devices 3.6 · adb shell 6.7 · sandboxed/ART
// 15.4 · no root 19.8 · Magisk 23.4 · pentesting matters 27.4
const ANDROID_POINTS = [
  { text: 'a modified Linux kernel', at: 0.0 },
  { text: 'most Linux devices in the world are Android', at: 3.6 },
  { text: 'adb shell: a real Linux shell', at: 6.7 },
  { text: 'apps sandboxed · they run inside ART', at: 15.4 },
  { text: 'no root by default → Magisk / LineageOS', at: 19.8 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
        ANDROID: <span style={{ color: THEME.green }}>LINUX INSIDE</span>
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 560, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
          {ANDROID_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
        <TerminalWindow title="miguel@phone:~$" width={430} delay={Math.round(6.7 * fps)}>
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

// ── Scene 3: iOS, very locked-down Unix ────────────────────────
// EN: Darwin 3.7 · most locked down 7.1 · sandbox 9.8 · App Store
// 12.2 · jailbreak 16.3 · exploits rare 20.3 · trophy 23.6
const IOS_POINTS = [
  { text: 'Darwin core · Unix inside', at: 3.7 },
  { text: 'the most locked-down system of all', at: 7.1 },
  { text: 'own sandbox + App Store only', at: 9.8 },
  { text: 'jailbreak = break the sandbox for root', at: 16.3 },
  { text: 'exploits are rare, expensive, and secret', at: 20.3 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const captionAt = Math.round(23.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            iOS: <span style={{ color: THEME.red }}>HEAVILY LOCKED-DOWN UNIX</span>
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
            an unpatched iPhone is a trophy
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 4: Raspberry Pi + closing ────────────────────────────
// EN: credit card 2.5 · Debian 5.2 · same apt 6.4 · know the Pi 8.8 ·
// electronics 12.4 · GPIO 13.6 · Pi-hole 19.3 · attack box 22.9 ·
// module's idea 27.5
const PI_POINTS = [
  { text: 'based on Debian: same apt, same sudo', at: 5.2 },
  { text: 'GPIO pins → sensors, LEDs, motors', at: 13.6 },
  { text: 'Pi-hole · retro consoles · NAS', at: 19.3 },
  { text: 'in pentesting: attack box, honeypot, USB gadget', at: 22.9 },
];

const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: "the other isn't the software, it's the hardware" at 27.5s
  const closeAt = Math.round(27.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            RASPBERRY PI: <span style={{ color: THEME.purple }}>LINUX FOR ELECTRONICS</span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <TerminalWindow title="pi@raspberrypi:~$" width={430} delay={Math.round(5.2 * fps)}>
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
          title={<>THE "OTHER" IS THE <span style={{ color: THEME.purple }}>HARDWARE</span>, NOT THE SOFTWARE</>}
          subtitle="same Linux base: you already know how to use it"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot02PortableDevicesEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['ot-02-portable-devices'];
  const starts = sceneStartFrames('ot-02-portable-devices', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: your phone is a system too */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ot-02-portable-devices/ot-02-scene1.wav`)} />
        <Scene1 />
      </Sequence>

      {/* Scene 2: Android */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ot-02-portable-devices/ot-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: iOS */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ot-02-portable-devices/ot-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: Raspberry Pi + closing */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/ot-02-portable-devices/ot-02-scene4.wav`)} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
