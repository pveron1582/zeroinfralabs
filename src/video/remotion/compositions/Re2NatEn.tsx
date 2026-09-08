// ── video/remotion/compositions/Re2NatEn.tsx ─────────────────
// English version of re2-02-nat. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: what NAT is ──────────────────────────────────────
// EN: single IP 6.4 · NAT 8.4 · rewrites 9.5 · not routable 15.9 ·
// swaps 18.2 · way out 20.5 · back 21.3. Panel at 2.0s → relative:
// 4.4 / 7.5 / 13.9 / 16.2 / 18.5 / 19.3.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(2.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>YOUR WHOLE HOME, <span style={{ color: THEME.green }}>ONE SINGLE IP</span></>}
          subtitle="that's NAT — Network Address Translation"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 26 }}>
            {['192.168.1.34', '192.168.1.20', '192.168.1.7'].map((ip) => (
              <KeyCapsule key={ip} label="private" value={ip} accent={THEME.cyan} delay={0} size={20} />
            ))}
          </div>
          <div style={{ fontSize: 34, color: THEME.green, marginBottom: 16 }}>↓ ROUTER · NAT ↓</div>
          <KeyCapsule label="single public IP" value="203.0.113.7" accent={THEME.green} delay={0} size={30} />
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 800, textAlign: 'left', marginTop: 24 }}>
            <RevealLine at={13.9} fps={fps} mark="▸" color={THEME.cyan}>private IPs aren't routable on the internet</RevealLine>
            <RevealLine at={16.2} fps={fps} mark="⇄" color={THEME.green}>it rewrites every packet on the way out and the way back</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: the translation table + PAT ─────────────────────
// EN: table 2.8 · PC opens 4.7 · new port 9.2 · this port 11.4 ·
// server replies 13.3 · key idea 17.3 · dropped 23.0 · PAT 29.6
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      THE <span style={{ color: THEME.green }}>TRANSLATION TABLE</span>
    </div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 22 }}>
      <KeyCapsule label="internal PC" value="192.168.1.34:51234" accent={THEME.cyan} delay={Math.round(4.7 * fps)} size={19} />
      <span style={{ fontSize: 28, color: THEME.green }}>→</span>
      <KeyCapsule label="public IP" value="203.0.113.7:40001" accent={THEME.green} delay={Math.round(9.2 * fps)} size={19} />
    </div>
    <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 880, textAlign: 'left' }}>
      <RevealLine at={11.4} fps={fps} mark="▸" color={THEME.cyan}>this port equals that PC — the reply matches the table and goes inward</RevealLine>
      <RevealLine at={20.2} fps={fps} mark="🚫" color={THEME.red}>connections from the internet: no match → dropped</RevealLine>
      <RevealLine at={29.6} fps={fps} mark="◆" color={THEME.amber}>PAT: every internal machine uses a different outgoing port</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: pros/cons + DNAT + closing ──────────────────────
// EN: saves IPs 2.2 · hides topology 5.8 · blocks incoming 7.5 ·
// breaks 11.3 · complicates 13.4 · table entry 18.6 · DNAT 22.6 ·
// hole in the wall 27.5 · scanning 31.3
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(31.3 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            <span style={{ color: THEME.green }}>PROS</span> AND <span style={{ color: THEME.red }}>CONS</span>
          </div>
          <div style={{ display: 'flex', gap: 24, width: 960 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>✓ SAVES IPs</div>
              <RevealLine at={5.8} fps={fps} mark="▸" color={THEME.green}>hides your internal topology</RevealLine>
              <RevealLine at={7.5} fps={fps} mark="▸" color={THEME.green}>blocks incoming connections: a free firewall</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 8 }}>✗ BREAKS THE MODEL</div>
              <RevealLine at={13.4} fps={fps} mark="▸" color={THEME.red}>complicates FTP, VoIP, P2P</RevealLine>
              <RevealLine at={18.6} fps={fps} mark="▸" color={THEME.red}>every connection eats a table entry</RevealLine>
            </div>
          </div>
          <div style={{ marginTop: 22, width: 900, textAlign: 'left' }}>
            <RevealLine at={22.6} fps={fps} mark="🔓" color={THEME.amber}>DNAT / port forwarding: opens a hole inward</RevealLine>
            <RevealLine at={27.5} fps={fps} mark="▸" color={THEME.cyan}>for the pentester: every DNAT rule is what the network decided to expose</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>NAT: <span style={{ color: THEME.green }}>1 PUBLIC IP</span>, EVERYONE INSIDE</>}
          subtitle="and every DNAT, a door someone opened"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2NatEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re2-02-nat'];
  const starts = sceneStartFrames('re2-02-nat', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re2-02-nat/re2-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re2-02-nat/re2-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re2-02-nat/re2-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
