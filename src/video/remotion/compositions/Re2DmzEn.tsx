// ── video/remotion/compositions/Re2DmzEn.tsx ──────────────────
// English version of re2-05-dmz. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { TerminalWindow } from '../primitives/TerminalWindow';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: the concept ─────────────────────────────────────
// EN: separation 5.2 · firewall 10.7 · DMZ stands 13.6 · web
// servers 18.2 · databases 22.3 · trapped 26.0.
// Panel starts at 5.2s → RevealLine at offsets relative to panel: 13.0 / 17.1 / 20.8
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(5.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>PUBLIC UP FRONT, <span style={{ color: THEME.amber }}>PRIVATE BEHIND</span></>}
          subtitle="DMZ — Demilitarized Zone"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>🌍</span>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.red}70`, borderRadius: 12, padding: '16px 22px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.red, fontFamily: MONO }}>🔥 FIREWALL</div>
              <div style={{ fontSize: 12, color: THEME.muted, fontFamily: MONO }}>decides who gets in</div>
            </div>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.amber}70`, borderRadius: 12, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: THEME.amber, fontFamily: MONO }}>DMZ</div>
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: MONO }}>web · mail</div>
            </div>
            <span style={{ fontSize: 26, color: THEME.dim }}>⇄</span>
            <div style={{
              background: THEME.panel, border: `2px solid ${THEME.green}70`, borderRadius: 12, padding: '16px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>LAN</div>
              <div style={{ fontSize: 11, color: THEME.muted, fontFamily: MONO }}>db · PCs</div>
            </div>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 880, textAlign: 'left' }}>
            <RevealLine at={13.0} fps={fps} mark="🌐" color={THEME.amber}>public servers: web and mail live in the DMZ</RevealLine>
            <RevealLine at={17.1} fps={fps} mark="🔒" color={THEME.green}>databases and PCs: the protected LAN</RevealLine>
            <RevealLine at={20.8} fps={fps} mark="🎯" color={THEME.red}>if the web server gets hacked, they're trapped in the DMZ</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: both sides of the firewall ──────────────────────
// EN: reads every packet 0.0 · incoming 3.7 · DMZ ports 4.6 ·
// 80/443 6.3 · 25 mail 9.2 · LAN dropped 10.9 · outgoing 13.3 ·
// asymmetry 17.1 · command 20.0
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      BOTH SIDES OF THE <span style={{ color: THEME.red }}>FIREWALL</span>
    </div>
    <div style={{ display: 'flex', gap: 24, width: 960 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 8 }}>⬇ INCOMING</div>
        <RevealLine at={4.6} fps={fps} mark="▸" color={THEME.amber}>only allows the DMZ ports: 80/443, 25</RevealLine>
        <RevealLine at={10.9} fps={fps} mark="✗" color={THEME.red}>anything aimed at the LAN: dropped</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>⬆ OUTGOING</div>
        <RevealLine at={13.3} fps={fps} mark="▸" color={THEME.green}>the LAN and the DMZ reach the internet normally</RevealLine>
        <RevealLine at={17.1} fps={fps} mark="✓" color={THEME.green}>that asymmetry makes the architecture work</RevealLine>
      </div>
    </div>
    <TerminalWindow title="firewall:~$ iptables rules" width={720} delay={Math.round(20.0 * fps)}>
      <div style={{ fontSize: 12, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.green }}>iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to-destination 10.0.1.10</span>
        {'\n'}<span style={{ color: THEME.red }}>iptables -A FORWARD -i eth0 -p tcp --dport 3306 -j DROP</span>
      </div>
    </TerminalWindow>
  </AbsoluteFill>
);

// ── Scene 3: why it matters for pentesting + closing ────────
// EN: trapped/pivot 4.2 · first thing 9.5 · web server 14.8 · closing 20.5
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(20.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            PENTESTING: <span style={{ color: THEME.amber }}>PIVOT</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 840, textAlign: 'left' }}>
            <RevealLine at={4.2} fps={fps} mark="▸" color={THEME.cyan}>you land on the DMZ → you turn the public machine into a springboard</RevealLine>
            <RevealLine at={9.5} fps={fps} mark="▸" color={THEME.amber}>the first thing a pentester maps: where does the DMZ sit?</RevealLine>
            <RevealLine at={14.8} fps={fps} mark="🎯" color={THEME.red}>often a web server with the company's guts one click away</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DMZ = <span style={{ color: THEME.amber }}>CONTROLLED DNAT</span></>}
          subtitle="expose the minimum, protect the critical"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2DmzEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re2-05-dmz'];
  const starts = sceneStartFrames('re2-05-dmz', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re2-05-dmz/re2-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re2-05-dmz/re2-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re2-05-dmz/re2-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
