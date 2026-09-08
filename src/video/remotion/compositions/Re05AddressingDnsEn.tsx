// ── video/remotion/compositions/Re05AddressingDnsEn.tsx ───────
// English version of re-05-addressing-dns. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).

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

// ── Scene 1: the 3 pieces of the configuration ─────────────────
// EN: three numbers 2.7 · IP address 3.9 · netmask 7.7 · gateway
// 14.2. Panel at 3.7s → relative: 0.2 / 4.0 / 10.5.
const PIECES = [
  { name: 'IP', icon: '🪪', color: THEME.cyan, desc: "the machine's identity on the network", ex: '192.168.1.10', at: 0.2 },
  { name: 'NETMASK', icon: '📐', color: THEME.amber, desc: 'which part is network, which part is machine', ex: '255.255.255.0', at: 4.0 },
  { name: 'GATEWAY', icon: '🌉', color: THEME.green, desc: "the router's IP: the bridge to the outside", ex: '192.168.1.1', at: 10.5 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.7 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>SETTING UP A NETWORK: <span style={{ color: THEME.cyan }}>3 NUMBERS</span></>}
          subtitle="IP + netmask + gateway"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1140 }}>
            {PIECES.map(p => (
              <div key={p.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${p.color}60`,
                borderRadius: 16, padding: '24px 22px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: p.color, fontFamily: MONO }}>{p.name}</div>
                <RevealLine at={p.at} fps={fps} mark="▸" color={p.color}>
                  <span style={{ fontSize: 14 }}>{p.desc}</span>
                </RevealLine>
                <div style={{ fontSize: 16, color: THEME.text, fontFamily: MONO, marginTop: 12 }}>{p.ex}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: classes + CIDR ───────────────────────────────────
// EN: classes 2.3 · class A 4.0 · B 6.0 · C 7.4 · CIDR 11.4
const CLASSES = [
  { name: 'CLASS A', color: THEME.purple, rango: '1–126', desc: 'huge networks · 10.x.x.x', at: 4.0 },
  { name: 'CLASS B', color: THEME.cyan, rango: '128–191', desc: 'medium networks · 172.16–31.x.x', at: 6.0 },
  { name: 'CLASS C', color: THEME.green, rango: '192–223', desc: 'small networks · 192.168.x.x', at: 7.4 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      CLASSES BY NETWORK <span style={{ color: THEME.amber }}>SIZE</span>
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1140 }}>
      {CLASSES.map(c => (
        <div key={c.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${c.color}60`,
          borderRadius: 16, padding: '22px 20px', textAlign: 'center',
        }}>
          <RevealLine at={c.at} fps={fps} mark="◆" color={c.color}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{c.name}</span>
          </RevealLine>
          <div style={{ fontSize: 15, color: c.color, fontFamily: MONO, marginTop: 10 }}>first octet {c.rango}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{c.desc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 30, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      today it's <span style={{ color: THEME.cyan }}>CIDR</span>: 192.168.1.0/24 — but classes explain the private ranges
    </div>
  </AbsoluteFill>
);

// ── Scene 3: DNS + resolv.conf ────────────────────────────────
// EN: DNS 4.5 · contact list 8.6 · DNS fails 10.5 · enumerating
// 14.3. Terminal at 4.5s.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(14.3 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            <span style={{ color: THEME.cyan }}>DNS</span>: THE INTERNET'S CONTACT LIST
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
            <span style={{ fontSize: 26, color: THEME.text, fontFamily: MONO }}>google.com</span>
            <span style={{ fontSize: 26, color: THEME.dim }}>→</span>
            <span style={{ fontSize: 26, color: THEME.green, fontFamily: MONO }}>142.250.80.78</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={620} delay={Math.round(4.5 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}># /etc/resolv.conf</span>
              {'\n'}nameserver <span style={{ color: THEME.cyan }}>8.8.8.8</span>
              {'\n'}default via <span style={{ color: THEME.green }}>192.168.1.1</span> dev eth0
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 16, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
            if DNS fails, "the web is down" even if your internet works
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>WITH IP, GATEWAY AND DNS: <span style={{ color: THEME.amber }}>READY TO BROWSE</span></>}
          subtitle="and for the pentester: enumerating DNS reveals subdomains"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re05AddressingDnsEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re-05-addressing-dns'];
  const starts = sceneStartFrames('re-05-addressing-dns', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re-05-addressing-dns/re-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re-05-addressing-dns/re-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re-05-addressing-dns/re-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
