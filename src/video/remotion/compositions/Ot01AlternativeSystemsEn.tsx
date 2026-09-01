// ── video/remotion/compositions/Ot01AlternativeSystemsEn.tsx ────
// English version of ot-01-alternative-systems. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
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

// ── Scene 1: the third world of systems ──────────────────────────
// EN: Macs 5.2 · routers/firewalls 5.9 · Chromebooks 7.6 ·
// "run into them" 10.4. Cards at 5.0, caption at 10.4.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const cardsAt = Math.round(5.0 * fps);
  const captionAt = Math.round(10.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardsAt}>
        <TitleScene
          title={<>BEYOND LINUX AND WINDOWS: <span style={{ color: THEME.amber }}>THE THIRD WORLD</span></>}
          subtitle="macOS · the BSD family · ChromeOS"
        />
      </Sequence>
      <Sequence from={cardsAt} durationInFrames={captionAt - cardsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="Mac" value="macOS" accent={THEME.amber} size={26} />
            <KeyCapsule label="routers and firewalls" value="BSD" accent={THEME.cyan} size={26} />
            <KeyCapsule label="Chromebooks" value="ChromeOS" accent={THEME.green} size={26} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO, lineHeight: 1.6 }}>
            they're not the majority on servers,
            <br />but you'll run into them along the way
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: macOS, certified Unix ──────────────────────────────
// EN: certified Unix 1.9 · core from BSD 3.4 · zsh 5.6 · /Users 8.6 ·
// /etc /tmp /var 10.0 · launchd 16.6 · plist 19.8 · SIP 24.1
const MAC_POINTS = [
  { text: 'certified Unix · core from BSD', at: 1.9 },
  { text: 'default shell: zsh', at: 5.6 },
  { text: '/Users instead of /home', at: 8.6 },
  { text: '/etc, /tmp and /var exist just like Linux', at: 10.0 },
  { text: 'launchd instead of systemd', at: 16.6 },
  { text: 'configs are .plist files', at: 19.8 },
  { text: 'SIP + Gatekeeper limit what you touch', at: 24.1 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
        macOS: <span style={{ color: THEME.amber }}>CERTIFIED UNIX</span> with an Apple finish
      </div>
      <div style={{ fontSize: 20, color: THEME.muted, fontFamily: MONO, marginBottom: 20 }}>
        most commands work identically
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 560, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
          {MAC_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
          ))}
        </div>
        <TerminalWindow title="mac@laptop:~$" width={430}>
          <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
            <span style={{ color: THEME.green }}>mac@laptop:~$</span> uname -a
            {'\n'}Darwin <span style={{ color: THEME.dim }}>macOS 14.5</span> arm64
            {'\n'}
            {'\n'}<span style={{ color: THEME.green }}>mac@laptop:~$</span> ls /Users/
            {'\n'}miguel <span style={{ color: THEME.dim }}>shared</span>
          </div>
        </TerminalWindow>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: the BSD family ────────────────────────────────────
// EN: 70s Berkeley 2.5 · FreeBSD 6.0 · OpenBSD 9.7 · NetBSD 14.7 ·
// routers 17.8 · pfSense 19.6 · same philosophy 24.9 · license 28.6
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const bsdRows = [
    { v: 'FreeBSD', d: 'servers and appliances', at: 6.0, color: THEME.cyan },
    { v: 'OpenBSD', d: 'the most audited', at: 9.7, color: THEME.amber },
    { v: 'NetBSD', d: 'portable to everything', at: 14.7, color: THEME.purple },
  ];
  const placeRows = [
    { v: 'routers', d: null, at: 17.8 },
    { v: 'firewalls', d: 'pfSense · OPNSense', at: 19.0 },
    { v: 'appliances', d: 'VPN', at: 22.2 },
    { v: 'NAS', d: null, at: 23.9 },
  ];
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
        THE <span style={{ color: THEME.cyan }}>BSD</span> FAMILY: Berkeley's Unix
      </div>
      <div style={{ display: 'flex', gap: 22, width: 1080 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}`, fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, textAlign: 'left' }}>
            VERSION
          </div>
          <div style={{ padding: '16px 20px' }}>
            {bsdRows.map(r => (
              <RevealLine key={r.v} at={r.at} fps={fps} mark="▸" color={r.color}>
                <span style={{ fontWeight: 700 }}>{r.v}</span>
                <span style={{ color: THEME.muted }}> — {r.d}</span>
              </RevealLine>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}`, fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, textAlign: 'left' }}>
            YOU'LL FIND IT IN
          </div>
          <div style={{ padding: '16px 20px' }}>
            {placeRows.map(r => (
              <RevealLine key={r.v} at={r.at} fps={fps} mark="▸" color={THEME.cyan}>
                <span style={{ fontWeight: 700 }}>{r.v}</span>
                {r.d && <span style={{ color: THEME.muted }}> — {r.d}</span>}
              </RevealLine>
            ))}
          </div>
        </div>
      </div>
      <RevealLine at={24.9} fps={fps} mark="▸" color={THEME.text}>same philosophy as Linux: terminal, permissions, files</RevealLine>
      <RevealLine at={28.6} fps={fps} mark="▸" color={THEME.green}>more permissive license: take the code, don't share your changes</RevealLine>
    </AbsoluteFill>
  );
};

// ── Scene 4: ChromeOS + closing ─────────────────────────────────
// EN: Linux kernel 3.2 · cloud 7.3 · variants 9.4 · container 16.5 ·
// matters 20.8 · uname 26.3/27.3 · FreeBSD 28.2 · Darwin 31.6 ·
// Linux 33.0 · "Unix family" 36.3
const CHROME_POINTS = [
  { text: 'Linux kernel · Chrome as the whole interface', at: 3.2 },
  { text: 'everything lives in the cloud', at: 7.3 },
  { text: 'variants: ChromiumOS, Flex, Android apps inside', at: 9.4 },
  { text: 'a real Linux container with terminal and apt', at: 16.5 },
];

const CmdBlock: React.FC<{ at: number; fps: number; children: React.ReactNode }> = ({ at, fps, children }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      transform: `translateY(${(1 - enter) * 8}px)`,
      whiteSpace: 'pre',
      lineHeight: 1.8,
    }}>
      {children}
    </div>
  );
};

const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  // EN: "Three systems, three answers" at 34.2s
  const closeAt = Math.round(34.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            ChromeOS: <span style={{ color: THEME.green }}>THE BROWSER AS A SYSTEM</span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 540, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
              {CHROME_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="uname -s on three systems" width={480} delay={Math.round(24.5 * fps)}>
              <div style={{ fontSize: 17 }}>
                <CmdBlock at={27.3} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}># on FreeBSD</span>
                  {'\n'}<span style={{ color: THEME.cyan, fontWeight: 700 }}>FreeBSD</span>
                </CmdBlock>
                <CmdBlock at={29.4} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}># on macOS</span>
                  {'\n'}<span style={{ color: THEME.amber, fontWeight: 700 }}>Darwin</span>
                </CmdBlock>
                <CmdBlock at={31.6} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}># on ChromeOS</span>
                  {'\n'}<span style={{ color: THEME.green, fontWeight: 700 }}>Linux</span>
                </CmdBlock>
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>THREE ANSWERS, <span style={{ color: THEME.cyan }}>ONE FAMILY</span></>}
          subtitle="all from the Unix family"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot01AlternativeSystemsEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS_EN['ot-01-alternative-systems'];
  const starts = sceneStartFrames('ot-01-alternative-systems', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: the third world */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ot-01-alternative-systems/ot-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: macOS */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ot-01-alternative-systems/ot-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: BSD */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ot-01-alternative-systems/ot-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: ChromeOS + closing */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/ot-01-alternative-systems/ot-01-scene4.wav`)} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
