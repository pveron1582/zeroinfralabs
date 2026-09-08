// ── video/remotion/compositions/Re2VpnEn.tsx ──────────────────
// English version of re2-04-vpn. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: what it is ──────────────────────────────────────
// EN: work as one 6.7 · coffee shop 9.1 · VPN 13.4 · tunnel 14.8 ·
// virtual 19.0 · private 21.9. Panel at 6.6s → relative: 6.8 / 8.2 /
// 12.4 / 15.3.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>A <span style={{ color: THEME.purple }}>TUNNEL</span> OVER THE INTERNET</>}
          subtitle="VPN — Virtual Private Network"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            BUENOS AIRES ↔ <span style={{ color: THEME.purple }}>MADRID</span>: ONE SINGLE NETWORK
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
            <span style={{ fontSize: 40 }}>🏢</span>
            <div style={{ width: 440, height: 38, borderRadius: 19, border: `2px dashed ${THEME.purple}`, backgroundImage: `repeating-linear-gradient(90deg, ${THEME.purple}40 0 10px, transparent 10px 20px)` }} />
            <span style={{ fontSize: 40 }}>🏢</span>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 820, textAlign: 'left' }}>
            <RevealLine at={12.4} fps={fps} mark="▸" color={THEME.purple}>virtual: it uses no dedicated cables</RevealLine>
            <RevealLine at={15.3} fps={fps} mark="🔒" color={THEME.green}>private: everything traveling inside is encrypted and authenticated</RevealLine>
            <RevealLine at={2.5} fps={fps} mark="💼" color={THEME.cyan}>the coffee-shop employee is "sitting at the office"</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: the 3 jobs + protocols ──────────────────────────
// EN: three properties 1.2 · confidentiality 4.1 · integrity 9.9 ·
// authenticity 14.7 · site-to-site 20.2 · IPsec 26.8 · OpenVPN
// 29.5 · WireGuard 32.3 · TLS VPN 34.7
const JOBS = [
  { name: 'CONFIDENTIALITY', icon: '🔒', color: THEME.green, desc: 'nobody reads your traffic on the path' },
  { name: 'INTEGRITY', icon: '🛡️', color: THEME.cyan, desc: 'nobody alters the packets' },
  { name: 'AUTHENTICITY', icon: '🔑', color: THEME.amber, desc: 'only users with credentials get in' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      THE <span style={{ color: THEME.purple }}>3 JOBS</span> OF A VPN
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1000 }}>
      {JOBS.map((j, i) => {
        const at = [4.1, 9.9, 14.7][i];
        return (
        <div key={j.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${j.color}60`, borderRadius: 16, padding: '22px 18px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>{j.icon}</div>
          <RevealLine at={at} fps={fps} mark="◆" color={j.color}>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{j.name}</span>
          </RevealLine>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{j.desc}</div>
        </div>
        );
      })}
    </div>
    <div style={{ marginTop: 26, width: 940 }}>
      <div style={{ fontSize: 15, color: THEME.muted, fontFamily: MONO, marginBottom: 12 }}>THE PROTOCOLS:</div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { n: 'IPsec', c: THEME.cyan, d: 'classic · layer 3 · site-to-site' },
          { n: 'OpenVPN', c: THEME.green, d: 'flexible · UDP/TCP' },
          { n: 'WireGuard', c: THEME.amber, d: 'modern · fast' },
          { n: 'TLS VPN', c: THEME.purple, d: 'gets in through the browser' },
        ].map((p, i) => {
          const at = [26.8, 29.5, 32.3, 34.7][i];
          return (
          <RevealLine key={p.n} at={at} fps={fps} mark="" color={p.c}>
            <span style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: THEME.panel, border: `1px solid ${p.c}60`, borderRadius: 10, padding: '10px 18px',
            }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: p.c }}>{p.n}</span>
              <span style={{ fontSize: 11, color: THEME.muted }}>{p.d}</span>
            </span>
          </RevealLine>
          );
        })}
      </div>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: what it protects and what it doesn't + closing ─
// EN: encrypts the path 3.4 · open wifi 4.9 · doesn't protect 8.0 ·
// other end 9.2 · pentester 16.7 · defenses 23.5
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(23.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            IT PROTECTS THE <span style={{ color: THEME.green }}>PATH</span>, NOT THE DESTINATION
          </div>
          <div style={{ display: 'flex', gap: 24, width: 960 }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 8 }}>✓ YES</div>
              <RevealLine at={4.9} fps={fps} mark="▸" color={THEME.green}>open WiFi: nobody reads your traffic</RevealLine>
              <RevealLine at={2.5} fps={fps} mark="▸" color={THEME.green}>joins two offices into one LAN</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 18px', textAlign: 'left' }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 8 }}>✗ NO</div>
              <RevealLine at={8.0} fps={fps} mark="▸" color={THEME.red}>a machine with weaknesses at the other end</RevealLine>
              <RevealLine at={10.8} fps={fps} mark="▸" color={THEME.red}>a VPN server running an old version</RevealLine>
            </div>
          </div>
          <div style={{ marginTop: 22, width: 900, textAlign: 'left' }}>
            <RevealLine at={16.7} fps={fps} mark="🎯" color={THEME.amber}>pentester: a compromised VPN credential = a straight entry into the network</RevealLine>
            <RevealLine at={23.5} fps={fps} mark="🛡️" color={THEME.green}>defenses: MFA · client certificates · keep it patched</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>A VPN IS <span style={{ color: THEME.purple }}>TRANSPORT</span>, NOT A MAGIC WAND</>}
          subtitle="it encrypts the path · it doesn't forgive a weak destination"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2VpnEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re2-04-vpn'];
  const starts = sceneStartFrames('re2-04-vpn', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re2-04-vpn/re2-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re2-04-vpn/re2-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re2-04-vpn/re2-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
