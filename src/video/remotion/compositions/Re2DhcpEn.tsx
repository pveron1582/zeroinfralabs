// ── video/remotion/compositions/Re2DhcpEn.tsx ─────────────────
// English version of re2-01-dhcp. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
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

// ── Scene 1: what it is and what it does ──────────────────────
// EN: service 6.0 · DHCP 8.3 · IP 12.1 · netmask 12.9 · gateway
// 13.6 · DNS 14.3 · leases 15.3 · by hand 20.8. Panel at 8.2s →
// relative: 3.9 / 4.7 / 5.4 / 6.1 / 7.1 / 12.6.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(8.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE ONE THAT <span style={{ color: THEME.cyan }}>HANDS OUT</span> IPs</>}
          subtitle="DHCP — Dynamic Host Configuration Protocol"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            IT GIVES YOU <span style={{ color: THEME.cyan }}>EVERYTHING</span> ON CONNECT
          </div>
          <div style={{ display: 'flex', gap: 16, width: 980, justifyContent: 'center' }}>
            {[
              { label: 'IP', color: THEME.cyan, at: 3.9 },
              { label: 'NETMASK', color: THEME.green, at: 4.7 },
              { label: 'GATEWAY', color: THEME.amber, at: 5.4 },
              { label: 'DNS', color: THEME.purple, at: 6.1 },
            ].map((x) => (
              <div key={x.label} style={{
                background: THEME.panel, border: `1px solid ${x.color}60`, borderRadius: 14,
                padding: '20px 22px', textAlign: 'center', width: 200,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: x.color, fontFamily: MONO }}>
                  <RevealLine at={x.at} fps={fps} mark="" color={x.color}>{x.label}</RevealLine>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 860, textAlign: 'left', marginTop: 24 }}>
            <RevealLine at={7.1} fps={fps} mark="🔑" color={THEME.amber}>leases: it lends the IP and renews before it expires</RevealLine>
            <RevealLine at={12.6} fps={fps} mark="▸" color={THEME.cyan}>without it: everything configured by hand</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: DORA ─────────────────────────────────────────────
// EN: DORA 7.7 · Discover 8.5 · Offer 13.7 · Request 17.5 · Ack
// 21.5 · UDP 24.7 · ports 25.9-28.0
const DORA = [
  { letter: 'D', name: 'DISCOVER', color: THEME.cyan, desc: 'the client shouts to the broadcast: any DHCP here?' },
  { letter: 'O', name: 'OFFER', color: THEME.green, desc: 'the server answers by offering a free IP' },
  { letter: 'R', name: 'REQUEST', color: THEME.amber, desc: 'the client accepts and formally asks for that offer' },
  { letter: 'A', name: 'ACK', color: THEME.purple, desc: 'the server confirms and signs the lease' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      THE HANDSHAKE: <span style={{ color: THEME.cyan }}>DORA</span>
    </div>
    <div style={{ display: 'flex', gap: 16, width: 1120 }}>
      {DORA.map((d, i) => {
        const at = [8.5, 13.7, 17.5, 21.5][i];
        return (
        <div key={d.letter} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${d.color}60`, borderRadius: 16,
          padding: '20px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: d.color, fontFamily: MONO, marginBottom: 6 }}>
            <RevealLine at={at} fps={fps} mark="" color={d.color}>{d.letter}</RevealLine>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{d.name}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{d.desc}</div>
        </div>
        );
      })}
    </div>
    <div style={{ marginTop: 24, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      all over UDP · ports 67 and 68 · in seconds
    </div>
  </AbsoluteFill>
);

// ── Scene 3: static vs DHCP + rogue DHCP + closing ────────────
// EN: static 4.9 · servers 8.2 · doesn't scale 11.1 · DHCP 14.8 ·
// problem 19.2 · rogue 22.6 · traffic 29.5 · snooping 31.8
const TermRow: React.FC<{ at: number; fps: number; children: React.ReactNode }> = ({ at, fps, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - Math.round(at * fps), [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: o, whiteSpace: 'pre' }}>{children}</div>;
};

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const rogueAt = Math.round(19.2 * fps);
  const closeAt = Math.round(31.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill>
          {/* Part A: static vs DHCP — narrated before the attack */}
          <Sequence from={0} durationInFrames={rogueAt}>
            <AbsoluteFill style={CENTERED}>
              <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
                IF NOBODY ANSWERS → <span style={{ color: THEME.amber }}>STATIC IP</span> VS <span style={{ color: THEME.cyan }}>DHCP</span>
              </div>
              <div style={{ display: 'flex', gap: 20, width: 1040 }}>
                <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderTop: `5px solid ${THEME.amber}`, borderRadius: 12, padding: '22px 20px', textAlign: 'left' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>STATIC IP</div>
                  <RevealLine at={3.0} fps={fps} mark="▸" color={THEME.amber}>if nobody answers → configure by hand</RevealLine>
                  <RevealLine at={6.3} fps={fps} mark="▸" color={THEME.amber}>stable · predictable · servers / printers / routers</RevealLine>
                  <RevealLine at={11.1} fps={fps} mark="✗" color={THEME.red}>doesn't scale: 300 PCs written by hand</RevealLine>
                </div>
                <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderTop: `5px solid ${THEME.cyan}`, borderRadius: 12, padding: '22px 20px', textAlign: 'left' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 10 }}>DHCP</div>
                  <RevealLine at={14.8} fps={fps} mark="✓" color={THEME.cyan}>automatic · scales on its own</RevealLine>
                  <RevealLine at={17.5} fps={fps} mark="▸" color={THEME.cyan}>but it depends on a service</RevealLine>
                  <RevealLine at={19.2} fps={fps} mark="⚠️" color={THEME.red}>and here's the problem: it doesn't authenticate servers</RevealLine>
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
          {/* Part B: rogue DHCP */}
          <Sequence from={rogueAt}>
            <AbsoluteFill style={CENTERED}>
              <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
                DHCP DOESN'T AUTHENTICATE: <span style={{ color: THEME.red }}>ROGUE DHCP</span>
              </div>
              <TerminalWindow title="kali@attacker-01:~$ dhclient -v eth0" width={780} delay={0}>
                <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                  <TermRow at={0} fps={fps}><span style={{ color: THEME.cyan }}>DHCPDISCOVER</span> on eth0 to 255.255.255.255</TermRow>
                  <TermRow at={2.2} fps={fps}><span style={{ color: THEME.green }}>DHCPOFFER</span> of 192.168.1.34 from <span style={{ color: THEME.red }}>192.168.1.99 (rogue)</span></TermRow>
                  <TermRow at={3.0} fps={fps}><span style={{ color: THEME.amber }}>DHCPREQUEST</span> for 192.168.1.34</TermRow>
                  <TermRow at={3.8} fps={fps}><span style={{ color: THEME.purple }}>DHCPACK</span> of 192.168.1.34 from <span style={{ color: THEME.red }}>192.168.1.99</span></TermRow>
                  <TermRow at={4.6} fps={fps}><span style={{ color: THEME.dim }}>bound to 192.168.1.34 -- renewal in 3600 seconds</span></TermRow>
                  <TermRow at={5.2} fps={fps}><span style={{ color: THEME.dim }}>routers (gateway)   : <span style={{ color: THEME.red }}>192.168.1.99</span></span></TermRow>
                  <TermRow at={5.8} fps={fps}><span style={{ color: THEME.dim }}>dns nameservers     : <span style={{ color: THEME.red }}>192.168.1.99</span></span></TermRow>
                </div>
              </TerminalWindow>
              <div style={{ width: 880, textAlign: 'left', marginTop: 16 }}>
                <RevealLine at={4.6} fps={fps} mark="🕳️" color={THEME.red}>a rogue server hands out malicious gateway/DNS → MITM without fighting over ARP</RevealLine>
                <RevealLine at={8.4} fps={fps} mark="🛡️" color={THEME.green}>defense: DHCP snooping (authorized ports only)</RevealLine>
              </div>
            </AbsoluteFill>
          </Sequence>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DHCP = <span style={{ color: THEME.cyan }}>MAGIC</span> WORTH WATCHING</>}
          subtitle="hands out IPs · and sometimes, to the wrong hands"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2DhcpEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re2-01-dhcp'];
  const starts = sceneStartFrames('re2-01-dhcp', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re2-01-dhcp/re2-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re2-01-dhcp/re2-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re2-01-dhcp/re2-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
