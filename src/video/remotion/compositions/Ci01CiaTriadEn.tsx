// ── video/remotion/compositions/Ci01CiaTriadEn.tsx ──────────────
// English version of ci-01-cia-triad. Same visuals; beats re-measured
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
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: the three legs of the triad ───────────────────────
// EN: confidentiality 3.3 · integrity 4.4 · availability 5.4 ·
// authorized eyes 10.0 · silence 14.6 · need it 17.3. Panel at 3.2s
// → relative: 0.1 / 1.2 / 2.2 / 6.8 / 11.4 / 14.1.
const PILLARS = [
  { name: 'CONFIDENTIALITY', icon: '🔒', color: THEME.cyan, points: [['only authorized eyes read the data', 6.8], ['stealing data = breaking it', 9.9]] },
  { name: 'INTEGRITY', icon: '🧾', color: THEME.amber, points: [['the data doesn\'t get modified in silence', 11.4], ['touching logs = breaking it', 14.4]] },
  { name: 'AVAILABILITY', icon: '✅', color: THEME.green, points: [['the system works when you need it', 14.1], ['DDoS = breaking it', 18.1]] },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(3.2 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE <span style={{ color: THEME.cyan }}>CIA</span> TRIAD</>}
          subtitle="confidentiality · integrity · availability"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 24, width: 1120 }}>
            {PILLARS.map(p => (
              <div
                key={p.name}
                style={{
                  flex: 1,
                  background: THEME.panel,
                  border: `1px solid ${p.color}60`,
                  borderRadius: 16,
                  padding: '26px 22px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: p.color, fontFamily: MONO, marginBottom: 12 }}>
                  {p.icon} {p.name}
                </div>
                {p.points.map(([pt, at]) => (
                  <RevealLine key={pt as string} at={at as number} fps={fps} mark="▸" color={p.color}>{pt}</RevealLine>
                ))}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: real attacks per leg ─────────────────────────────
// EN: break one 1.1 · confidentiality 3.2 · SQLi 7.2 · integrity
// 8.7 · defacing 9.7 · logs 11.0 · availability 13.2 · DDoS 14.2 ·
// ransomware 16.2
const ATTACKS = [
  { name: 'CONFIDENTIALITY', color: THEME.cyan, attacks: [['stealing a password file', 4.1], ['SQL injection dumping the database', 6.1]] },
  { name: 'INTEGRITY', color: THEME.amber, attacks: [['defacing a web page', 9.7], ['touching the logs to cover your tracks', 11.0]] },
  { name: 'AVAILABILITY', color: THEME.green, attacks: [['a DDoS takes down a service', 14.2], ['ransomware locks everything', 16.2]] },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
        EVERY ATTACK BREAKS <span style={{ color: THEME.red }}>ONE LEG</span>
      </div>
      <div style={{ display: 'flex', gap: 24, width: 1120 }}>
        {ATTACKS.map(a => (
          <div
            key={a.name}
            style={{
              flex: 1,
              background: THEME.panel,
              border: `1px solid ${a.color}60`,
              borderRadius: 16,
              padding: '26px 22px',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: a.color, fontFamily: MONO, marginBottom: 12 }}>
              {a.name}
            </div>
            {a.attacks.map(([at, atT]) => (
              <RevealLine key={at as string} at={atT as number} fps={fps} mark="✗" color={THEME.red}>{at}</RevealLine>
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: closing — the pentester angle ────────────────────
// EN: worth the most 2.1 · enumerating 5.4 · defending 10.1 ·
// afford to lose 12.4. closeAt 9.9.
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(9.9 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
            WHAT'S WORTH THE MOST IS <span style={{ color: THEME.cyan }}>THE INFORMATION</span>
          </div>
          <TerminalWindow title="kali@attacker-01:~$" width={680} delay={Math.round(5.4 * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.green }}>kali@attacker-01:~$</span> cat /etc/shadow | head -2
              {'\n'}root:$6$rounds=656000$abcdef$<span style={{ color: THEME.dim }}>...</span>:19100:0:99999:7:::
              {'\n'}admin:$6$rounds=656000$ghijkl$<span style={{ color: THEME.dim }}>...</span>:19100:0:99999:7:::
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 22, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            reading it breaks confidentiality: the attacker cracks it offline, no alerts
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>ENUMERATE: <span style={{ color: THEME.amber }}>WHICH LEG PAYS OFF TO ATTACK?</span></>}
          subtitle="and when you're defending: which one can't you afford to lose?"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci01CiaTriadEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ci-01-cia-triad'];
  const starts = sceneStartFrames('ci-01-cia-triad', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ci-01-cia-triad/ci-01-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ci-01-cia-triad/ci-01-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ci-01-cia-triad/ci-01-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
