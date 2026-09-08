// ── video/remotion/compositions/Re02IpAddressesEn.tsx ──────────
// English version of re-02-ip-addresses. Same visuals; beats
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

// ── Scene 1: the IP format ──────────────────────────────────────
// EN: format 7.0 · four numbers 7.6 · 0-255 8.6 · example 11.2 ·
// conflict 15.0/19.5. Panel at 6.9s → relative: 0.1 / 0.7 / 4.3 / 8.1.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE <span style={{ color: THEME.cyan }}>IP ADDRESS</span></>}
          subtitle="every machine's mailing address"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {['192', '168', '1', '10'].map((part, i) => (
              <KeyCapsule key={part + i} label={`octet ${i + 1} (0-255)`} value={part} accent={THEME.cyan} delay={4.3 + i * 0.8} size={40} />
            ))}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            4 NUMBERS, FROM <span style={{ color: THEME.amber }}>0 TO 255</span>, SEPARATED BY DOTS
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 760, textAlign: 'left' }}>
            <RevealLine at={0.1} fps={fps} mark="▸" color={THEME.cyan}>a unique number on the network: who data gets delivered to</RevealLine>
            <RevealLine at={8.1} fps={fps} mark="✗" color={THEME.red}>two machines with the same IP = an IP conflict</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: public vs private ─────────────────────────────────
// EN: two kinds 0.2 · public 2.0 · unique 2.8 · provider 4.9 · reach
// 7.0 · private 8.8 · internal 9.5 · can't be touched 10.9 · ranges
// 12.8 · home router 22.1
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      <span style={{ color: THEME.amber }}>PUBLIC</span> VS <span style={{ color: THEME.green }}>PRIVATE</span>
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1120 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>🌍 PUBLIC</div>
        <RevealLine at={2.0} fps={fps} mark="▸" color={THEME.amber}>unique across the whole internet</RevealLine>
        <RevealLine at={4.9} fps={fps} mark="▸" color={THEME.amber}>your provider assigns them</RevealLine>
        <RevealLine at={7.0} fps={fps} mark="▸" color={THEME.amber}>any machine in the world can reach them</RevealLine>
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>🏠 PRIVATE</div>
        <RevealLine at={8.8} fps={fps} mark="▸" color={THEME.green}>internal to your network</RevealLine>
        <RevealLine at={10.9} fps={fps} mark="▸" color={THEME.green}>can't be touched from outside</RevealLine>
        <RevealLine at={12.8} fps={fps} mark="▸" color={THEME.green}>ranges: 10.x · 172.16–31.x · 192.168.x</RevealLine>
      </div>
    </div>
    <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      at home: <span style={{ color: THEME.amber }}>public facing out</span> → the router hands out <span style={{ color: THEME.green }}>private ones inward</span>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: NAT + ip addr ─────────────────────────────────────
// EN: NAT 3.4 · translates 7.0 · single IP 9.3 · single home 10.8 ·
// lab ip addr 13.8. Terminal at 13.8s.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(20.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            <span style={{ color: THEME.cyan }}>NAT</span>: YOUR WHOLE HOME ON ONE IP
          </div>
          <TerminalWindow title="kali@attacker-01:~$ ip addr" width={700} delay={Math.round(13.8 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>2: eth0: &lt;BROADCAST,MULTICAST,UP&gt;</span>
              {'\n'}    inet <span style={{ color: THEME.green }}>192.168.1.10</span>/24 scope global eth0
              {'\n'}<span style={{ color: THEME.dim }}>1: lo:</span>    inet <span style={{ color: THEME.cyan }}>127.0.0.1</span>/8 scope host lo
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 20, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            192.168.1.10 = private · 127.0.0.1 = loopback (the machine talking to itself)
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>THE ROUTER <span style={{ color: THEME.cyan }}>TRANSLATES</span> EVERYTHING</>}
          subtitle="private inside, one public outside"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re02IpAddressesEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re-02-ip-addresses'];
  const starts = sceneStartFrames('re-02-ip-addresses', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re-02-ip-addresses/re-02-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re-02-ip-addresses/re-02-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re-02-ip-addresses/re-02-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
