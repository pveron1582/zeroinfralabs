// ── video/remotion/compositions/Pe05ManInTheMiddleEn.tsx ────
// English version of pe-05-man-in-the-middle. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: what a MITM is ───────────────────────────────
// EN: middle 2.5 · MITM attack 8.3 · intermediary 10.2 · nobody
// suspects 17.7 · three things 19.4 · read 22.6 · modify 24.5 · cut
// off 26.1 · photocopying 29.9. Panel at 8.5s → rel: 1.7 / 8.9 /
// 11.2 / 14.1 / 16.0 / 17.6 / 21.4.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(8.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>SOMEONE IN THE <span style={{ color: THEME.red }}>MIDDLE</span></>}
          subtitle="a man in the middle attack, explained"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            THE CONNECTION STILL WORKS — <span style={{ color: THEME.amber }}>NOBODY SUSPECTS A THING</span>
          </div>
          <div style={{ display: 'flex', gap: 24, width: 1100, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={14.1} fps={fps} mark="" color={THEME.cyan}>READ</RevealLine>
              </div>
              <RevealLine at={1.7} fps={fps} mark="▸" color={THEME.cyan}>every message, read and forwarded like nothing happened</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={16.0} fps={fps} mark="" color={THEME.amber}>MODIFY</RevealLine>
              </div>
              <RevealLine at={16.0} fps={fps} mark="▸" color={THEME.amber}>the data, modified mid-flight</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={17.6} fps={fps} mark="" color={THEME.red}>CUT OFF</RevealLine>
              </div>
              <RevealLine at={17.6} fps={fps} mark="▸" color={THEME.red}>entirely — like photocopying someone's mail</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: ARP spoofing ─────────────────────────────────
// EN: ARP spoofing 4.1 · floods the victim 13.0 · attention 16.6 ·
// believes it 19.9 · forwards 24.1 · never drops 27.5 · arpspoof
// 29.1 · couple of commands 31.2 · bridge 35.2.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      THE CLASSIC PLAY: <span style={{ color: THEME.amber }}>ARP SPOOFING</span>
    </div>
    <TerminalWindow title="kali@attacker-01:~$ sudo arpspoof -i eth0 -t 192.168.1.11 192.168.1.1" width={900} delay={Math.round(4.1 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}># "the router's IP now points to my MAC"</span>
        {'\n'}<span style={{ color: THEME.green }}>kali@attacker-01:~$</span> echo 1 &gt; /proc/sys/net/ipv4/ip_forward
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 18, marginTop: 28 }}>
      <KeyCapsule label="ARP poisoning" value="fake replies" accent={THEME.amber} delay={Math.round(13.0 * fps)} size={24} />
      <KeyCapsule label="ip_forward = 1" value="invisible bridge" accent={THEME.green} delay={Math.round(24.1 * fps)} size={24} />
      <KeyCapsule label="the victim" value="never notices" accent={THEME.red} delay={Math.round(19.9 * fps)} size={24} />
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, width: 880 }}>
      one command poisons the victim's ARP table, the other turns your machine into the bridge everything flows through
    </div>
  </AbsoluteFill>
);

// ── Scene 3: detection + prevention + closing ─────────────
// EN: detect 0.0 · arp dash a 2.6 · same MAC 5.7 · intruder 8.1 ·
// static 10.6 · port security 12.1 · TLS 15.1 · noise 20.0 ·
// pentester 20.7 · harvest 25.8. closeAt 20.7.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(20.7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            HOW DO YOU <span style={{ color: THEME.red }}>DETECT</span> IT AND <span style={{ color: THEME.green }}>STOP</span> IT?
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1120, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={0.0} fps={fps} mark="" color={THEME.red}>DETECT</RevealLine>
              </div>
              <RevealLine at={2.6} fps={fps} mark="▸" color={THEME.red}>arp -a: two IPs, same MAC</RevealLine>
              <RevealLine at={8.1} fps={fps} mark="▸" color={THEME.red}>an intruder standing in the middle</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={10.3} fps={fps} mark="" color={THEME.amber}>PREVENT</RevealLine>
              </div>
              <RevealLine at={10.6} fps={fps} mark="▸" color={THEME.amber}>static ARP entries</RevealLine>
              <RevealLine at={12.1} fps={fps} mark="▸" color={THEME.amber}>port security: one MAC per port</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={15.1} fps={fps} mark="" color={THEME.green}>ENCRYPT</RevealLine>
              </div>
              <RevealLine at={15.1} fps={fps} mark="▸" color={THEME.green}>TLS everywhere</RevealLine>
              <RevealLine at={17.3} fps={fps} mark="▸" color={THEME.green}>they sniff your traffic, but they only see noise</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>MITM: FROM A FOOTHOLD TO A <span style={{ color: THEME.red }}>HARVEST</span></>}
          subtitle="passwords, cookies, and full sessions — one bridge away"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Pe05ManInTheMiddleEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['pe-05-man-in-the-middle'];
  const starts = sceneStartFrames('pe-05-man-in-the-middle', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/pe-05-man-in-the-middle/pe-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/pe-05-man-in-the-middle/pe-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/pe-05-man-in-the-middle/pe-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
