// ── video/remotion/compositions/Re1VlansEn.tsx ────────────────
// English version of re1-05-vlans. Same visuals; beats re-measured
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

// ── Scene 1: what is a VLAN ───────────────────────────────────
// EN: printer 3.5 · manager 4.3 · cameras 5.1 · guests 5.8 · VLAN 9.3 ·
// own switch 13.0 · can't talk 17.9. Panel at 3.4s → relative: 0.1 /
// 0.9 / 1.7 / 2.4 / 5.9 / 9.6 / 14.5.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>WHAT IS A <span style={{ color: THEME.purple }}>VLAN</span>?</>}
          subtitle="a logical network on top of the physical one"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            {[
              { icon: '💰', name: 'ACCOUNTING', color: THEME.cyan },
              { icon: '🖥️', name: 'SERVERS', color: THEME.green },
              { icon: '📹', name: 'CAMERAS', color: THEME.amber },
              { icon: '📱', name: 'GUESTS', color: THEME.purple },
            ].map((v, i) => (
              <div key={v.name} style={{
                background: THEME.panel, border: `1px solid ${v.color}60`, borderRadius: 14, padding: '18px 20px', textAlign: 'center', width: 180,
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{v.icon}</div>
                <RevealLine at={i === 0 ? 0.1 : i === 1 ? 0.9 : i === 2 ? 1.7 : 2.4} fps={fps} mark="◆" color={v.color}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{v.name}</span>
                </RevealLine>
              </div>
            ))}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 840, textAlign: 'left' }}>
            <RevealLine at={9.6} fps={fps} mark="▸" color={THEME.purple}>a group of ports that behaves like its own switch</RevealLine>
            <RevealLine at={14.5} fps={fps} mark="✗" color={THEME.red}>without a router letting traffic cross, they can't talk</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: segmentation + broadcast domains ─────────────────
// EN: flat LAN 0.0 · decide map 6.8 · employees 9.7 · servers 10.9 ·
// cameras 12.0 · guests 13.8 · broadcast 17.5 · shows 25.5
const VLAN_PLANS = [
  { name: 'VLAN 10', desc: 'employees', color: THEME.cyan },
  { name: 'VLAN 20', desc: 'servers', color: THEME.green },
  { name: 'VLAN 30', desc: 'cameras / IoT', color: THEME.amber },
  { name: 'VLAN 40', desc: 'guests', color: THEME.purple },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      YOU DECIDE THE MAP <span style={{ color: THEME.cyan }}>BEFORE</span> ANYTHING HAPPENS
    </div>
    <div style={{ display: 'flex', gap: 20, width: 1000 }}>
      {VLAN_PLANS.map((v, i) => {
        const at = [9.7, 10.9, 12.0, 13.8][i];
        return (
        <div key={v.name} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${v.color}60`,
          borderTop: `5px solid ${v.color}`, borderRadius: 12, padding: '20px 16px', textAlign: 'center',
        }}>
          <RevealLine at={at} fps={fps} mark="◆" color={v.color}>
            <span style={{ fontSize: 18, fontWeight: 800 }}>{v.name}</span>
          </RevealLine>
          <div style={{ fontSize: 14, color: THEME.muted, fontFamily: MONO, marginTop: 10 }}>{v.desc}</div>
        </div>
        );
      })}
    </div>
    <div style={{ marginTop: 28, fontSize: 20, color: THEME.green, fontFamily: MONO, fontWeight: 800 }}>
      EVERY BROADCAST STAYS INSIDE ITS OWN VLAN
    </div>
    <div style={{ marginTop: 10, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      a hundred machines per VLAN = four small domains, not one giant one
    </div>
  </AbsoluteFill>
);

// ── Scene 3: the 802.1Q tag + trunk + security + closing ─────
// EN: tag 3.4 · 802.1Q 4.5 · four bytes 6.9 · access mode 10.8 ·
// trunk 15.2 · two buildings 18.8 · shrink surface 21.8 · contain
// 24.1 · ARP dies 26.4 · not encryption 31.2 · hopping 34.6
const NODES = [
  { label: 'PC', at: 12.5, color: THEME.cyan },
  { label: 'PC', at: 14.5, color: THEME.cyan },
  { label: 'SRV', at: 17.0, color: THEME.green },
  { label: 'CAM', at: 19.5, color: THEME.amber },
];

const SWITCH_W = 110;
const SWITCH_Y = 120;
const NODE_Y = 28;
const NODE_R = 26;
const W = NODES.length * 130 + SWITCH_W;

const VlanTopology: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame - Math.round(11 * fps), [0, 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const cx = W / 2;
  return (
    <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 12}px)`, display: 'flex', justifyContent: 'center' }}>
      <svg width={W} height={SWITCH_Y + NODE_R + 30} viewBox={`0 0 ${W} ${SWITCH_Y + NODE_R + 30}`}>
        {NODES.map((d, i) => {
          const nx = i * 130 + 65;
          const t = interpolate(frame - Math.round(d.at * fps), [0, 10], [0, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          });
          return (
            <React.Fragment key={i}>
              <line x1={nx} y1={NODE_Y + NODE_R} x2={nx + (cx - nx) * t} y2={NODE_Y + NODE_R + (SWITCH_Y - NODE_Y - NODE_R) * t}
                stroke={d.color} strokeWidth={4} strokeLinecap="round" />
              <circle cx={nx} cy={NODE_Y} r={NODE_R} fill={THEME.panel} stroke={d.color} strokeWidth={1.5} />
              <text x={nx} y={NODE_Y + 5} textAnchor="middle" fill={d.color} fontFamily={MONO} fontSize={13} fontWeight={800}>{d.label}</text>
            </React.Fragment>
          );
        })}
        <rect x={cx - SWITCH_W / 2} y={SWITCH_Y} width={SWITCH_W} height={26} rx={6} fill={THEME.panel} stroke={THEME.text} strokeWidth={1.5} />
        {[0, 1, 2, 3, 4, 5].map(i => (
          <rect key={i} x={cx - 46 + i * 13} y={SWITCH_Y + 9} width={8} height={8} rx={1} fill={THEME.purple} opacity={0.8} />
        ))}
        <text x={cx} y={SWITCH_Y + 40} textAnchor="middle" fill={THEME.muted} fontFamily={MONO} fontSize={13}>switch</text>
      </svg>
    </div>
  );
};

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(31.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 14 }}>
            THE <span style={{ color: THEME.purple }}>802.1Q TAG</span>: 4 BYTES THAT NAME THE FLOOR
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <TerminalWindow title="switch# show vlan brief" width={540} delay={Math.round(4.5 * fps)}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.amber }}>VLAN  Name        Status  Ports</span>
                {'\n'}<span style={{ color: THEME.dim }}>----  ----------  ------  ----------</span>
                {'\n'}<span style={{ color: THEME.cyan }}>10    EMPLOYEES   active  Fa0/1-8</span>
                {'\n'}<span style={{ color: THEME.green }}>20    SERVERS     active  Fa0/9-10</span>
                {'\n'}<span style={{ color: THEME.amber }}>30    CAMERAS     active  Fa0/11-16</span>
                {'\n'}<span style={{ color: THEME.red }}>40    GUESTS      active  Fa0/17-24</span>
              </div>
            </TerminalWindow>
            <TerminalWindow title="switch# show interfaces trunk" width={540} delay={Math.round(10.8 * fps)}>
              <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.8 }}>
                <span style={{ color: THEME.amber }}>Port   Mode  Encapsulation  Status     Native</span>
                {'\n'}<span style={{ color: THEME.green }}>Fa0/24 on    802.1q         trunking   1</span>
                {'\n'}
                {'\n'}<span style={{ color: THEME.amber }}>Port   Vlans allowed on trunk</span>
                {'\n'}<span style={{ color: THEME.green }}>Fa0/24 10,20,30</span>
              </div>
            </TerminalWindow>
          </div>
          <VlanTopology fps={fps} />
          <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <RevealLine at={24.1} fps={fps} mark="🔒" color={THEME.green}>containment: the attacker stays in their own segment</RevealLine>
            <RevealLine at={31.2} fps={fps} mark="✗" color={THEME.red}>segmentation, not encryption: VLAN hopping tries to jump floors</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>VLAN: <span style={{ color: THEME.purple }}>WALLS</span> INSIDE THE SWITCH</>}
          subtitle="without moving a single cable"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re1VlansEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re1-05-vlans'];
  const starts = sceneStartFrames('re1-05-vlans', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re1-05-vlans/re1-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re1-05-vlans/re1-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re1-05-vlans/re1-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
