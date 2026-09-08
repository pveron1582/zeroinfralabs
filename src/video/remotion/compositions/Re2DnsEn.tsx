// ── video/remotion/compositions/Re2DnsEn.tsx ──────────────────
// English version of re2-03-dns. Same visuals; beats re-measured
// against the EN wavs (word-level transcription, 2026-08-30).

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

// ── Scene 1: what it does ─────────────────────────────────────
// EN: DNS 6.5 · distributed 12.8 · UDP 18.6 · too big 22.9. Panel at
// 6.4s → relative: 6.4 / 12.8 / 18.6.
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const panelAt = Math.round(6.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene
          title={<>THE INTERNET'S <span style={{ color: THEME.cyan }}>CONTACT LIST</span></>}
          subtitle="DNS — names → IPs"
        />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>google.com</div>
            <span style={{ fontSize: 30, color: THEME.green }}>→</span>
            <div style={{ fontSize: 28, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>142.250.78.78</div>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 840, textAlign: 'left' }}>
            <RevealLine at={6.4} fps={fps} mark="▸" color={THEME.cyan}>worldwide distributed database: no single server knows everything</RevealLine>
            <RevealLine at={12.2} fps={fps} mark="▸" color={THEME.amber}>UDP port 53 · TCP when the answer is too big</RevealLine>
            <RevealLine at={15.0} fps={fps} mark="⚠️" color={THEME.red}>if it fails, it looks like the whole internet is down</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: the resolution chain ────────────────────────────
// EN: resolver 2.9 · root 6.8 · .com 13.0 · authoritative 18.6 ·
// three questions 24.7 · TTL 27.5
const CHAIN = [
  { icon: '🌍', name: 'ROOT', color: THEME.amber, desc: '"I don\'t know google.com, but the ones running .com are these"' },
  { icon: '📁', name: 'TLD (.com)', color: THEME.cyan, desc: '"the ones responsible for google.com are these"' },
  { icon: '🏢', name: 'AUTHORITATIVE', color: THEME.green, desc: '"google.com is 142.250.78.78"' },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      THE <span style={{ color: THEME.green }}>RESOLUTION</span> CHAIN
    </div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', width: 1080 }}>
      {CHAIN.map((s, i) => {
        const at = [6.8, 13.0, 18.6][i];
        return (
        <React.Fragment key={s.name}>
          {i > 0 && <span style={{ fontSize: 30, color: THEME.green }}>→</span>}
          <div style={{
            flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`, borderRadius: 16, padding: '20px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{s.icon}</div>
            <RevealLine at={at} fps={fps} mark="" color={s.color}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{s.name}</span>
            </RevealLine>
            <div style={{ fontSize: 12, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        </React.Fragment>
        );
      })}
    </div>
    <div style={{ marginTop: 24, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      3 questions · and every answer carries a <span style={{ color: THEME.amber }}>TTL</span> to cache
    </div>
  </AbsoluteFill>
);

// ── Scene 3: records + attacks + closing ─────────────────────
// EN: many things 1.2 · A 3.6 · AAAA 6.8 · MX 9.4 · NS 12.3 ·
// CNAME 14.5 · TXT 16.4 · enumeration 21.3 · poisoning 31.4 ·
// hijacked 32.6 · tunnel 35.2 · defenses 38.1
const RECORDS = [
  { name: 'A', desc: 'name → IPv4', color: THEME.cyan },
  { name: 'AAAA', desc: 'name → IPv6', color: THEME.cyan },
  { name: 'MX', desc: 'domain mail', color: THEME.green },
  { name: 'NS', desc: 'authoritative', color: THEME.amber },
  { name: 'CNAME', desc: 'alias', color: THEME.purple },
  { name: 'TXT', desc: 'ownership + anti-spam', color: THEME.green },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(38.1 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            THE MAIN <span style={{ color: THEME.cyan }}>RECORDS</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 920, justifyContent: 'center' }}>
            {RECORDS.map((r, i) => {
        const at = [3.6, 6.8, 9.4, 12.3, 14.5, 16.4][i];
        return (
        <RevealLine key={r.name} at={at} fps={fps} mark="" color={r.color}>
          <span style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 10,
            background: THEME.panel, border: `1px solid ${r.color}60`, borderRadius: 10, padding: '8px 14px',
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{r.name}</span>
            <span style={{ fontSize: 13, color: THEME.muted }}>{r.desc}</span>
          </span>
        </RevealLine>
        );
      })}
          </div>
          <TerminalWindow title="kali@attacker-01:~$ dig example.com" width={620} delay={Math.round(20.0 * fps)}>
            <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>;; ANSWER SECTION:</span>
              {'\n'}example.com.  <span style={{ color: THEME.amber }}>86400</span>  IN  A  <span style={{ color: THEME.green }}>93.184.216.34</span>
              {'\n'}<span style={{ color: THEME.dim }}>;; SERVER: 8.8.8.8#53</span>
            </div>
          </TerminalWindow>
          <div style={{ width: 900, textAlign: 'left', marginTop: 14 }}>
            <RevealLine at={27.1} fps={fps} mark="☠️" color={THEME.red}>cache poisoning · hijacking · exfiltration through subdomains</RevealLine>
            <RevealLine at={38.0} fps={fps} mark="🛡️" color={THEME.green}>defenses: DNSSEC · DNS over HTTPS/TLS</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>DNS: <span style={{ color: THEME.cyan }}>RECON GOLD</span></>}
          subtitle="subdomains and records reveal the structure before you attack"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Re2DnsEn: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS_EN['re2-03-dns'];
  const starts = sceneStartFrames('re2-03-dns', fps, 'en');
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase('en');

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/re2-03-dns/re2-03-scene1.wav`)} />
        <Scene1 fps={fps} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/re2-03-dns/re2-03-scene2.wav`)} />
        <Scene2 fps={fps} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/re2-03-dns/re2-03-scene3.wav`)} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
