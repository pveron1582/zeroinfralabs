// ── video/remotion/compositions/Ci05OwaspTopTenEn.tsx ───────
// English version of ci-05-owasp-top-ten. Same visuals; beats
// re-measured against the EN wavs (word-level transcription, 2026-08-30).
// EN audio available even though ES is still pending.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, AUDIO_TIMINGS_EN, audioBase } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { RevealLine } from '../primitives/RevealLine';
import { KeyCapsule } from '../primitives/KeyCapsule';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: what OWASP is ───────────────────────────────────
// EN: list 2.4 · non-profit 6.9 · auditors 12.2 · developers
// 13.8 · attackers 15.5 · red team memorizes 17.3 · place to look
// 22.0. Panel at 6.0s → rel: 6.2 / 7.8 / 9.5 / 11.3 / 16.0.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6.0 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE TABLE THE RED TEAM <span style={{ color: THEME.red }}>MEMORIZES</span></>}
          subtitle="OWASP Top Ten — the 10 most exploited web risks"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            WHO USES IT: <span style={{ color: THEME.cyan }}>EVERYONE</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={6.2} fps={fps} mark="" color={THEME.cyan}>AUDITORS</RevealLine>
              </div>
              <RevealLine at={8.2} fps={fps} mark="▸" color={THEME.cyan}>test against the list</RevealLine>
              <RevealLine at={10.2} fps={fps} mark="▸" color={THEME.cyan}>every entry = a checklist</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={7.8} fps={fps} mark="" color={THEME.green}>DEVELOPERS</RevealLine>
              </div>
              <RevealLine at={9.8} fps={fps} mark="▸" color={THEME.green}>harden against the list</RevealLine>
              <RevealLine at={11.8} fps={fps} mark="▸" color={THEME.green}>closes 80% of the door</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={9.5} fps={fps} mark="" color={THEME.red}>ATTACKERS</RevealLine>
              </div>
              <RevealLine at={10.5} fps={fps} mark="▸" color={THEME.red}>hunt within the list</RevealLine>
              <RevealLine at={16.0} fps={fps} mark="▸" color={THEME.red}>a classic attack per entry</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: top 3 ──────────────────────────────────────────
// sumAt adelantado de 25.2 a 16s (antes la 2ª pantalla duraba 3s).
const TOP3 = [
  { n: '1', name: 'BROKEN ACCESS CONTROL', desc: 'you reach things you shouldn\'t: /admin, another user\'s data', color: THEME.red, at: 2.7 },
  { n: '2', name: 'CRYPTOGRAPHIC FAILURES', desc: 'sensitive data unprotected: plain text, weak hashes', color: THEME.amber, at: 10.2 },
  { n: '3', name: 'INJECTION', desc: "your input runs as code: ' OR 1=1, XSS", color: THEME.cyan, at: 18.0 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const sumAt = Math.round(16 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={sumAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 32 }}>
            THE <span style={{ color: THEME.red }}>TOP 3</span>, THE ONES THAT MATTER MOST
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1100, justifyContent: 'center' }}>
            {TOP3.map(t => (
              <div key={t.n} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${t.color}60`, borderRadius: 16,
                padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 38, fontWeight: 800, color: t.color, fontFamily: MONO, marginBottom: 6 }}>
                  <RevealLine at={t.at} fps={fps} mark="" color={t.color}>{t.n}</RevealLine>
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{t.name}</div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={sumAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>
            <RevealLine at={0.2} fps={fps} mark="▸" color={THEME.red}>together, these three cover most real world breaches</RevealLine>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
            {['Access', 'Crypto', 'Injection'].map((x, i) => (
              <KeyCapsule key={x} label="dónde apuntar" value={x} accent={[THEME.red, THEME.amber, THEME.cyan][i]} delay={Math.round((0.5 + i * 0.7) * fps)} size={24} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 3: the other 7 + red/blue team + closing ──────────
// playbookAt adelantado de 25.5 a 18s y closeAt de 31.9 a 28s para que
// las comparaciones red/blue carguen completas (antes quedaba 1s).
const OTHER7 = [
  { n: '4', name: 'Insecure Design', color: THEME.purple, at: 2.2 },
  { n: '5', name: 'Security Misconfiguration', color: THEME.amber, at: 5.6 },
  { n: '6', name: 'Vulnerable Components', color: THEME.red, at: 9.7 },
  { n: '7', name: 'Auth Failures', color: THEME.cyan, at: 13.2 },
  { n: '8', name: 'Integrity Failures', color: THEME.green, at: 15.3 },
  { n: '9', name: 'Logging & Monitoring', color: THEME.purple, at: 17.8 },
  { n: '10', name: 'SSRF', color: THEME.amber, at: 21.2 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const playbookAt = Math.round(18 * fps);
  const closeAt = Math.round(28 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={playbookAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            THE OTHER <span style={{ color: THEME.purple }}>SEVEN</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, width: 1080 }}>
            {OTHER7.map(o => (
              <div key={o.n} style={{
                background: THEME.panel, border: `1px solid ${o.color}50`, borderRadius: 12,
                padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: o.color, fontFamily: MONO }}>
                  <RevealLine at={o.at} fps={fps} mark="" color={o.color}>{o.n}</RevealLine>
                </div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 4 }}>{o.name}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={playbookAt} durationInFrames={closeAt - playbookAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            THE TOP TEN AS A <span style={{ color: THEME.red }}>PLAYBOOK</span>
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={0.3} fps={fps} mark="" color={THEME.red}>RED TEAM ⚔️</RevealLine>
              </div>
              <RevealLine at={0.5} fps={fps} mark="▸" color={THEME.red}>every entry is an attack idea</RevealLine>
              <RevealLine at={1.2} fps={fps} mark="▸" color={THEME.red}>a classic attack to try per entry</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={0.8} fps={fps} mark="" color={THEME.green}>BLUE TEAM 🛡️</RevealLine>
              </div>
              <RevealLine at={1.5} fps={fps} mark="▸" color={THEME.green}>flipped, it's a fix list</RevealLine>
              <RevealLine at={2.8} fps={fps} mark="▸" color={THEME.green}>fix all 10 and you close 80% of the door</RevealLine>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>IT'S NOT A LIST TO <span style={{ color: THEME.red }}>MEMORIZE</span></>}
          subtitle="it's a menu of attack ideas · and, flipped, of defense fixes"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ci05OwaspTopTenEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['ci-05-owasp-top-ten'];
  const starts = sceneStartFrames('ci-05-owasp-top-ten', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/ci-05-owasp-top-ten/ci-05-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/ci-05-owasp-top-ten/ci-05-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/ci-05-owasp-top-ten/ci-05-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
