// ── video/remotion/compositions/Re04OsiLayersEn.tsx ────────────
// English version of re-04-osi-layers. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { PatchCord } from '../primitives/NetworkIcons';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: why layers? the postal analogy ───────────────────
// EN: postal mail 8.2 · write the letter 10.0 · post office 13.0 ·
// someone reads 17.7. Panel at 8.0s → relative: 2.0 / 5.0 / 9.7.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(8.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>WHY <span style={{ color: THEME.cyan }}>LAYERS</span>?</>}
          subtitle="each layer, one specific job"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            THE <span style={{ color: THEME.amber }}>POSTAL MAIL</span> ANALOGY
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[
              { icon: '✍️', label: 'you write the letter', sub: 'application layer', at: 2.0 },
              { icon: '📮', label: 'sorted and carried', sub: 'layers below', at: 5.0 },
              { icon: '📖', label: 'someone reads it', sub: 'at the destination', at: 9.7 },
            ].map((step, i) => (
              <React.Fragment key={step.sub}>
                {i > 0 && <span style={{ fontSize: 30, color: THEME.dim }}>→</span>}
                <div style={{
                  background: THEME.panel, border: `1px solid ${THEME.cyan}50`,
                  borderRadius: 14, padding: '20px 26px', textAlign: 'center', width: 240,
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{step.icon}</div>
                  <RevealLine at={step.at} fps={fps} mark="" color={THEME.cyan}>
                    <span style={{ fontSize: 17 }}>{step.label}</span>
                  </RevealLine>
                  <div style={{ fontSize: 12, color: THEME.dim, fontFamily: MONO, marginTop: 8 }}>{step.sub}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: the 7 OSI layers top to bottom ───────────────────
// EN: layer 7 at 1.4 · layer 6 at 8.4 · layer 5 at 12.9 · layer 4 at
// 16.9 · layer 3 at 22.3 · layer 2 at 26.3 · layer 1 at 30.5
const OSI_LAYERS = [
  { n: 7, name: 'APPLICATION', icon: '🌐', detail: 'HTTP · DNS · SSH', color: THEME.purple, at: 1.4 },
  { n: 6, name: 'PRESENTATION', icon: '🔐', detail: 'format · encryption', color: THEME.purple, at: 8.4 },
  { n: 5, name: 'SESSION', icon: '💬', detail: 'keeping the conversation open', color: THEME.cyan, at: 12.9 },
  { n: 4, name: 'TRANSPORT', icon: '📦', detail: 'TCP/UDP · ports', color: THEME.cyan, at: 16.9 },
  { n: 3, name: 'NETWORK', icon: '🧭', detail: 'IP · routes', color: THEME.green, at: 22.3 },
  { n: 2, name: 'DATA LINK', icon: '🔀', detail: 'MAC · ethernet (switch)', color: THEME.green, at: 26.3 },
  { n: 1, name: 'PHYSICAL', icon: <PatchCord width={52} />, detail: 'cables · fiber · wifi', color: THEME.amber, at: 30.5 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
      THE <span style={{ color: THEME.cyan }}>7 LAYERS</span> OF OSI
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: 560 }}>
      {OSI_LAYERS.map(l => (
        <div key={l.n} style={{
          display: 'flex', alignItems: 'center',
          background: THEME.panel, border: `1px solid ${l.color}50`,
          borderLeft: `5px solid ${l.color}`, borderRadius: 8, padding: '7px 16px',
        }}>
          <RevealLine at={l.at} fps={fps} mark="" color={l.color}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22, minWidth: 28, display: 'flex', alignItems: 'center' }}>{l.icon}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: l.color, fontFamily: MONO, minWidth: 26 }}>{l.n}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: THEME.text, fontFamily: MONO, minWidth: 140 }}>{l.name}</span>
              <span style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO }}>{l.detail}</span>
            </div>
          </RevealLine>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: TCP/IP merges into 4 + closing ──────────────────
// EN: TCP/IP 0.0 · four 2.5 · application 4.7 · transport 5.6 ·
// internet 6.4 · access 7.0 · golden rule 11.5
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(11.5 * fps);
  const TCP = [
    { name: 'APPLICATION', detail: 'HTTP · DNS · SSH', color: THEME.purple, at: 4.7 },
    { name: 'TRANSPORT', detail: 'TCP / UDP', color: THEME.cyan, at: 5.6 },
    { name: 'INTERNET', detail: 'IP', color: THEME.green, at: 6.4 },
    { name: 'NETWORK ACCESS', detail: 'ethernet / wifi', color: THEME.amber, at: 7.0 },
  ];
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            THE INTERNET RUNS ON <span style={{ color: THEME.green }}>TCP/IP</span>: 7 LAYERS → 4
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1140 }}>
            {TCP.map(l => (
              <div key={l.name} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${l.color}60`,
                borderTop: `5px solid ${l.color}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center',
              }}>
                <RevealLine at={l.at} fps={fps} mark="◆" color={l.color}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{l.name}</span>
                </RevealLine>
                <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{l.detail}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>"LAYER 2" AND "LAYER 3" = THE <span style={{ color: THEME.amber }}>OSI MODEL</span></>}
          subtitle="whenever you hear it in a lab"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re04OsiLayersEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re-04-osi-layers'];
  const starts = sceneStartFrames('re-04-osi-layers', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re-04-osi-layers/re-04-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re-04-osi-layers/re-04-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re-04-osi-layers/re-04-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
