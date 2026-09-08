// ── video/remotion/compositions/Wi03SecurityEn.tsx ───────────────
// English version of wi-03-security. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { KeyCapsule } from '../primitives/KeyCapsule';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: firewall ─────────────────────────────────────────────
// EN (relative to panel, starts at 3.5s): firewall 3.3 → rel -0.2 → 0.1 ·
// three profiles 6.5 → rel 3.0 · "watch out" 12.5 → rel 9.0 ·
// "lateral movement" 15.5 → rel 12.0
const FW_POINTS = [
  { text: 'enabled by default', at: 0.1 },
  { text: '3 profiles: domain, private, and public', at: 3.0 },
  { text: 'a port "closed" outside can be open just for the internal network', at: 9.0 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>WINDOWS COMES <span style={{ color: THEME.amber }}>HARDENED</span> BY DEFAULT</>}
          subtitle="firewall, antivirus, UAC, and group policies"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 520, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 16 }}>
                🧱 WINDOWS DEFENDER FIREWALL
              </div>
              {FW_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="C:\\> netsh advfirewall" width={500}>
              <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.6 }}>
                <span style={{ color: THEME.amber }}>Domain Profile:</span> <span style={{ color: THEME.green }}>ON</span>
                {'\n'}<span style={{ color: THEME.amber }}>Private Profile:</span> <span style={{ color: THEME.green }}>ON</span>
                {'\n'}<span style={{ color: THEME.amber }}>Public Profile:</span> <span style={{ color: THEME.green }}>ON</span>
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: Defender + UAC ───────────────────────────────────────
// EN: Defender 0.6 · real-time 5.0 · evade 7.4 · UAC 9.6 · prompt 13.2 ·
// slows down 18.7
const DEFENDER_POINTS = [
  { text: 'the antivirus built into Windows 10 and 11', at: 0.6 },
  { text: 'real-time scanning and cloud detection', at: 5.0 },
  { text: 'modern payloads have to evade it', at: 7.4 },
];
const UAC_POINTS = [
  { text: 'a prompt when a program wants admin changes', at: 13.2 },
  { text: 'asks for consent or credentials', at: 16.5 },
  { text: "doesn't stop a real attack, but slows it down and leaves a popup", at: 18.7 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 26, width: 1100 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '26px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>🛡️ MICROSOFT DEFENDER</div>
          {DEFENDER_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 14 }}>🪟 UAC — USER ACCOUNT CONTROL</div>
          {UAC_POINTS.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: GPO + more defenses + closing ───────────────────────
// EN: policies 0.5 · passwords 2.1 · what users run 3.5 · firewall
// rules 4.7 · AD 6.2 · BitLocker 10.2 · Credential Guard 12.7 ·
// Event Logs 16.5 · "care about" 19.5
const GPO_POINTS = [
  { text: 'configure passwords, what users can run, firewall rules', at: 2.1 },
  { text: 'in a company they are applied from Active Directory', at: 6.2 },
];
const MORE_DEFENSES = [
  { label: 'BitLocker', desc: 'encrypts the disk', at: 10.2 },
  { label: 'Credential Guard', desc: 'protects hashes in memory', at: 12.7 },
  { label: 'Event Logs', desc: 'record every access attempt', at: 16.5 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '24px 30px', width: 980, textAlign: 'left', marginBottom: 26 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 12 }}>📋 GROUP POLICIES (GPO)</div>
        {GPO_POINTS.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1000 }}>
        {MORE_DEFENSES.map(d => (
          <KeyCapsule key={d.label} label={d.desc} value={d.label} accent={THEME.amber} delay={Math.round(d.at * fps)} size={18} />
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: 20, color: THEME.muted, fontFamily: MONO, opacity: 1 }}>
        reading what the defenders configured tells you what they care about
      </div>
    </AbsoluteFill>
  );
};

export const Wi03SecurityEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['wi-03-security'];
  const starts = sceneStartFrames('wi-03-security', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: firewall */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/wi-03-security/wi-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: Defender + UAC */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/wi-03-security/wi-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: GPO + more defenses */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/wi-03-security/wi-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
