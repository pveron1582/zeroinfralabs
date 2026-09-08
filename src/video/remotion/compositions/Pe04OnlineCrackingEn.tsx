// ── video/remotion/compositions/Pe04OnlineCrackingEn.tsx ────
// English version of pe-04-online-cracking. Same visuals; beats
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

// ── Scene 1: what online cracking is ───────────────────────
// EN: don't have the hash 2.5 · live service 4.1 · SSH 8.0 · one
// after another 11.1 · slower 17.4 · leaves logs 21.6 · lockout
// 23.2 · no other option 27.8.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.8 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>NO HASH IN HAND: <span style={{ color: THEME.red }}>ONLINE CRACKING</span></>}
          subtitle="against a live service — slower, noisier, real"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            A LIVE SERVICE: <span style={{ color: THEME.red }}>SSH · FTP · WEB LOGIN</span>
          </div>
          <div style={{ display: 'flex', gap: 24, width: 1100, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={1.0} fps={fps} mark="" color={THEME.red}>HOW IT WORKS</RevealLine>
              </div>
              <RevealLine at={7.3} fps={fps} mark="▸" color={THEME.red}>try combinations one after another against the server</RevealLine>
              <RevealLine at={9.9} fps={fps} mark="▸" color={THEME.red}>SSH, FTP, HTTP, SMB…</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={13.6} fps={fps} mark="" color={THEME.amber}>THE COST</RevealLine>
              </div>
              <RevealLine at={17.0} fps={fps} mark="▸" color={THEME.amber}>slower and noisier than offline</RevealLine>
              <RevealLine at={19.4} fps={fps} mark="▸" color={THEME.amber}>every attempt travels and leaves logs · lockout risk</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: hydra ────────────────────────────────────────
// EN: hydra 0.0 · user/list 3.5 · passwords 6.3 · service 7.7 ·
// parallel 10.4 · SSH 12.1 · rockyou 21.1 · finds it 25.4 · trick
// 26.5.
const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      <span style={{ color: THEME.red }}>HYDRA</span>: THE MOST FAMOUS
    </div>
    <TerminalWindow title="kali@attacker-01:~$ hydra -l admin -P rockyou.txt ssh://192.168.1.11" width={820} delay={Math.round(0.5 * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>[DATA] 1 task, 14344392 total tries</span>
        {'\n'}[ssh] host: 192.168.1.11  login: admin  <span style={{ color: THEME.green }}>password: password123</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 26, width: 880 }}>
      <RevealLine at={3.5} fps={fps} mark="▸" color={THEME.red}>give it the username or a list of users</RevealLine>
      <RevealLine at={6.3} fps={fps} mark="▸" color={THEME.amber}>a list of passwords + the service to attack</RevealLine>
      <RevealLine at={10.4} fps={fps} mark="▸" color={THEME.cyan}>it tries every combination in parallel</RevealLine>
      <RevealLine at={26.5} fps={fps} mark="✓" color={THEME.green}>the trick: good lists + the users you already enumerated first</RevealLine>
    </div>
  </AbsoluteFill>
);

// ── Scene 3: medusa + ncrack + closing ───────────────────
// EN: hydra isn't alone 0.0 · medusa 2.0 · lighter 4.9 · ncrack
// 7.5 · Nmap family 8.4 · key difference 15.3 · network sets the
// limit 17.3 · real connection 21.0 · authorization 25.6 · crime
// 27.3. closeAt 25.6.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(25.6 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            HYDRA ISN'T ALONE: <span style={{ color: THEME.purple }}>MEDUSA</span> AND <span style={{ color: THEME.green }}>NCRACK</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1120, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={2.0} fps={fps} mark="" color={THEME.purple}>MEDUSA</RevealLine>
              </div>
              <RevealLine at={4.9} fps={fps} mark="▸" color={THEME.purple}>lighter</RevealLine>
              <RevealLine at={5.5} fps={fps} mark="▸" color={THEME.purple}>support for many services</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={7.5} fps={fps} mark="" color={THEME.green}>NCRACK</RevealLine>
              </div>
              <RevealLine at={8.4} fps={fps} mark="▸" color={THEME.green}>the Nmap family's version</RevealLine>
              <RevealLine at={10.1} fps={fps} mark="▸" color={THEME.green}>integrates with your scans</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={15.3} fps={fps} mark="" color={THEME.amber}>THE LIMIT</RevealLine>
              </div>
              <RevealLine at={17.3} fps={fps} mark="▸" color={THEME.amber}>the network and the service, not your CPU</RevealLine>
              <RevealLine at={21.0} fps={fps} mark="▸" color={THEME.amber}>every attempt is a real connection</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>BRUTE FORCE: <span style={{ color: THEME.red }}>NOISY</span> BUT EFFECTIVE</>}
          subtitle="always, always, with authorization — otherwise it's a crime"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Pe04OnlineCrackingEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['pe-04-online-cracking'];
  const starts = sceneStartFrames('pe-04-online-cracking', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/pe-04-online-cracking/pe-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/pe-04-online-cracking/pe-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/pe-04-online-cracking/pe-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
