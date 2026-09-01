// ── video/remotion/compositions/Ci03InformationGatheringEn.tsx ─
// English version of ci-03-information-gathering. Same visuals;
// beats re-measured against the EN wavs (word-level transcription,
// 2026-08-30). EN audio is available even though ES is still pending.

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

// ── Scene 1: what it is + passive vs active ──────────────────
// EN: gathers 1.8 · more you know 10.9 · two modes 17.4 · passive
// 18.4 · OSINT 19.5 · active 24.1 · DNS queries 26.8 · no trace
// 29.3. Panel at 14.4s → relative: 0 / 1.0 / 2.1 / 7.4 / 12.4.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(14.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>KNOW BEFORE YOU <span style={{ color: THEME.cyan }}>TOUCH</span></>}
          subtitle="Information gathering — phase 1 of pentesting"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            TWO MODES: <span style={{ color: THEME.green }}>PASSIVE</span> AND <span style={{ color: THEME.amber }}>ACTIVE</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={4.0} fps={fps} mark="" color={THEME.green}>PASSIVE · OSINT</RevealLine>
              </div>
              <RevealLine at={6.7} fps={fps} mark="◻" color={THEME.green}>you only observe public data</RevealLine>
              <RevealLine at={8.7} fps={fps} mark="◻" color={THEME.green}>without touching the target</RevealLine>
              <RevealLine at={15.6} fps={fps} mark="▸" color={THEME.green}>leaves no trace</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={9.7} fps={fps} mark="" color={THEME.amber}>ACTIVE</RevealLine>
              </div>
              <RevealLine at={11.7} fps={fps} mark="◻" color={THEME.amber}>you talk to the machine: DNS, ports, banners</RevealLine>
              <RevealLine at={13.7} fps={fps} mark="◻" color={THEME.amber}>scans, fingerprints</RevealLine>
              <RevealLine at={17.7} fps={fps} mark="⚠" color={THEME.amber}>leaves logs</RevealLine>
            </div>
          </div>
          <div style={{ width: 900, textAlign: 'left', marginTop: 20 }}>
            <RevealLine at={0.1} fps={fps} mark="▸" color={THEME.cyan}>the more you know beforehand, the less brute force you need later</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: legality ───────────────────────────────────────
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
        IS IT <span style={{ color: THEME.green }}>LEGAL</span>?
      </div>
      <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>
            <RevealLine at={3.8} fps={fps} mark="✓" color={THEME.green}>passive OSINT on public data</RevealLine>
          </div>
          <RevealLine at={6.2} fps={fps} mark="▸" color={THEME.green}>anyone can read a website or a WHOIS record</RevealLine>
          <RevealLine at={7.2} fps={fps} mark="▸" color={THEME.green}>generally, it is legal</RevealLine>
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.red, fontFamily: MONO }}>
            <RevealLine at={11.6} fps={fps} mark="✗" color={THEME.red}>unauthorized active scanning</RevealLine>
          </div>
          <RevealLine at={15.0} fps={fps} mark="▸" color={THEME.red}>scanning, exploiting: NOT legal</RevealLine>
          <RevealLine at={18.8} fps={fps} mark="▸" color={THEME.red}>requires written permission (rules of engagement)</RevealLine>
        </div>
      </div>
      <div style={{ marginTop: 18, fontSize: 17, color: THEME.muted, fontFamily: MONO }}>
        using that data against a system that isn't yours = <span style={{ color: THEME.red }}>a crime</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: funnel + tools + closing ──────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const funnelAt = Math.round(1.2 * fps);
  const toolsAt = Math.round(7 * fps);
  const closeAt = Math.round(29.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={funnelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            THE METHODOLOGY: A <span style={{ color: THEME.cyan }}>FUNNEL</span>
          </div>
          <div style={{ display: 'flex', gap: 16, width: 1040 }}>
            {[
              { n: '1', name: 'FOOTPRINTING', desc: 'map: domains, IP ranges, emails, technology', color: THEME.green },
              { n: '2', name: 'ENUMERATION', desc: 'DNS, subdomains, ports, services', color: THEME.cyan },
              { n: '3', name: 'FINGERPRINTING', desc: 'Apache 2.4.41, WP 6.2 → exploit', color: THEME.amber },
            ].map((s, i) => (
              <div key={s.n} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`, borderRadius: 16,
                padding: '18px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: s.color, fontFamily: MONO, marginBottom: 4 }}>
                  <RevealLine at={0.4 + i * 0.6} fps={fps} mark="" color={s.color}>{s.n}</RevealLine>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{s.name}</div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, fontSize: 17, color: THEME.muted, fontFamily: MONO }}>
            from "the whole internet" to <span style={{ color: THEME.red }}>a single vulnerable service</span>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={funnelAt} durationInFrames={toolsAt - funnelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO, marginBottom: 14 }}>
            every tool narrows the map one more step
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={toolsAt} durationInFrames={closeAt - toolsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
            THE <span style={{ color: THEME.cyan }}>TOOLBOX</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={820} delay={Math.round(2 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.green }}>whois</span> example.com         <span style={{ color: THEME.dim }}># domain owner</span>
              {'\n'}<span style={{ color: THEME.green }}>dig</span> example.com ANY   <span style={{ color: THEME.dim }}># IP and DNS records</span>
              {'\n'}<span style={{ color: THEME.green }}>nmap</span> -sV 192.168.1.11 <span style={{ color: THEME.dim }}># fingerprinting</span>
              {'\n'}<span style={{ color: THEME.green }}>gobuster</span> dir -u http://... <span style={{ color: THEME.dim }}># directories</span>
              {'\n'}<span style={{ color: THEME.green }}>curl</span> -I http://...    <span style={{ color: THEME.dim }}># banners</span>
            </div>
          </TerminalWindow>
          <div style={{ width: 900, textAlign: 'left', marginTop: 18 }}>
            <RevealLine at={2.5} fps={fps} mark="◻" color={THEME.purple}>passive: whois, dig, Google dorking, Shodan, theHarvester</RevealLine>
            <RevealLine at={5} fps={fps} mark="◻" color={THEME.cyan}>active: nmap, gobuster, curl</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>INFORMATION = <span style={{ color: THEME.cyan }}>A SUPERPOWER</span></>}
          subtitle="the best tool is the one that gives you the version"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci03InformationGatheringEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ci-03-information-gathering'];
  const starts = sceneStartFrames('ci-03-information-gathering', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ci-03-information-gathering/ci-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ci-03-information-gathering/ci-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ci-03-information-gathering/ci-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
