// ── video/remotion/compositions/Ci05OwaspTopTen.tsx ────────────────
// Video: OWASP Top Ten — los 10 riesgos web más explotados.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const OTHER7 = [
  { n: '4', name: 'Insecure Design', color: THEME.purple },
  { n: '5', name: 'Security Misconfiguration', color: THEME.amber },
  { n: '6', name: 'Vulnerable Components', color: THEME.red },
  { n: '7', name: 'Auth Failures', color: THEME.cyan },
  { n: '8', name: 'Integrity Failures', color: THEME.green },
  { n: '9', name: 'Logging & Monitoring', color: THEME.purple },
  { n: '10', name: 'SSRF', color: THEME.amber },
];

const COPY = {
  es: {
    s1: {
      title: <>LA TABLA QUE EL RED TEAM <span style={{ color: THEME.red }}>MEMORIZA</span></>,
      subtitle: 'OWASP Top Ten — los 10 riesgos web más explotados',
      heading: 'QUIÉN LA USA: <span style={{ color: THEME.cyan }}>TODOS</span>',
      auditors: { label: 'AUDITORES', lines: ['testean contra la lista', 'cada entrada = un lugar donde mirar'] },
      developers: { label: 'DESARROLLADORES', lines: ['refuerzan contra la lista', 'arreglá los 10, cerrás el 80% de la puerta'] },
      attackers: { label: 'ATACANTES', lines: ['cazan dentro de la lista', 'un ataque clásico por entrada'] },
    },
    s2: {
      heading: 'EL <span style={{ color: THEME.red }}>TOP 3</span>, LOS QUE MÁS IMPORTAN',
      top3: [
        { n: '1', name: 'BROKEN ACCESS CONTROL', desc: 'llegás a lo que no deberías: /admin, datos de otro', color: THEME.red },
        { n: '2', name: 'CRYPTOGRAPHIC FAILURES', desc: 'datos sensibles sin proteger: texto plano, hashes débiles', color: THEME.amber },
        { n: '3', name: 'INJECTION', desc: "tu input se ejecuta como código: ' OR 1=1, XSS", color: THEME.cyan },
      ],
      summary: 'juntos, estos tres cubren la mayoría de las brechas reales',
    },
    s3: {
      heading: 'LOS OTROS <span style={{ color: THEME.purple }}>SIETE</span>',
      other7: OTHER7,
      playbookHeading: 'EL TOP TEN COMO <span style={{ color: THEME.red }}>PLAYBOOK</span>',
      redTeam: { label: 'RED TEAM ⚔️', lines: ['cada entrada es una idea de ataque'] },
      blueTeam: { label: 'BLUE TEAM 🛡️', lines: ['invertida: una lista de arreglos', 'arreglá los 10 y cerrás el 80% de la puerta'] },
      closeTitle: <>NO ES UNA LISTA PARA <span style={{ color: THEME.red }}>MEMORIZAR</span></>,
      closeSubtitle: 'es un menú de ideas de ataque · y, invertido, de arreglos',
    },
  },
  en: {
    s1: {
      title: <>THE TABLE THE RED TEAM <span style={{ color: THEME.red }}>MEMORIZES</span></>,
      subtitle: 'OWASP Top Ten — the 10 most exploited web risks',
      heading: 'WHO USES IT: <span style={{ color: THEME.cyan }}>EVERYONE</span>',
      auditors: { label: 'AUDITORS', lines: ['test against the list', 'every entry = a checklist'] },
      developers: { label: 'DEVELOPERS', lines: ['harden against the list', 'closes 80% of the door'] },
      attackers: { label: 'ATTACKERS', lines: ['hunt within the list', 'a classic attack per entry'] },
    },
    s2: {
      heading: 'THE <span style={{ color: THEME.red }}>TOP 3</span>, THE ONES THAT MATTER MOST',
      top3: [
        { n: '1', name: 'BROKEN ACCESS CONTROL', desc: "you reach things you shouldn't: /admin, another user's data", color: THEME.red },
        { n: '2', name: 'CRYPTOGRAPHIC FAILURES', desc: 'sensitive data unprotected: plain text, weak hashes', color: THEME.amber },
        { n: '3', name: 'INJECTION', desc: "your input runs as code: ' OR 1=1, XSS", color: THEME.cyan },
      ],
      summary: 'together, these three cover most real world breaches',
    },
    s3: {
      heading: 'THE OTHER <span style={{ color: THEME.purple }}>SEVEN</span>',
      other7: OTHER7,
      playbookHeading: 'THE TOP TEN AS A <span style={{ color: THEME.red }}>PLAYBOOK</span>',
      redTeam: { label: 'RED TEAM ⚔️', lines: ['every entry is an attack idea', 'a classic attack to try per entry'] },
      blueTeam: { label: 'BLUE TEAM 🛡️', lines: ["flipped, it's a fix list", 'fix all 10 and you close 80% of the door'] },
      closeTitle: <>IT'S NOT A LIST TO <span style={{ color: THEME.red }}>MEMORIZE</span></>,
      closeSubtitle: "it's a menu of attack ideas · and, flipped, of defense fixes",
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { panelAt: 9.0, auditors: [1.1, 2.0, 3.3], developers: [3.0, 3.7, 5.9], attackers: [5.0, 5.8, 7.7] },
    s2: { top3: [2.1, 9.5, 15.0], sumAt: 16, sumLine: 0.4, capsules: [0.5, 1.2, 1.9] },
    s3: { other7: [1.6, 4.2, 8.3, 11.9, 14.3, 17.4, 21.0], playbookAt: 18, redTeam: [0.0, 0.5], blueTeam: [0.8, 1.5, 2.8], closeAt: 28 },
  },
  en: {
    s1: { panelAt: 6.0, auditors: [6.2, 8.2, 10.2], developers: [7.8, 9.8, 11.8], attackers: [9.5, 10.5, 16.0] },
    s2: { top3: [2.7, 10.2, 18.0], sumAt: 16, sumLine: 0.2, capsules: [0.5, 1.2, 1.9] },
    s3: { other7: [2.2, 5.6, 9.7, 13.2, 15.3, 17.8, 21.2], playbookAt: 18, redTeam: [0.3, 0.5, 1.2], blueTeam: [0.8, 1.5, 2.8], closeAt: 28 },
  },
};

const VID = 'cyber-05-owasp-top-ten';

// ── Scene 1: qué es OWASP ───────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            {[c.auditors, c.developers, c.attackers].map((group, gi) => {
              const color = gi === 0 ? THEME.cyan : gi === 1 ? THEME.green : THEME.red;
              const beats = gi === 0 ? b.auditors : gi === 1 ? b.developers : b.attackers;
              return (
                <div key={gi} style={{ flex: 1, background: THEME.panel, border: `1px solid ${color}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color, fontFamily: MONO, marginBottom: 12 }}>
                    <RevealLine at={beats[0]} fps={fps} mark="" color={color}>{group.label}</RevealLine>
                  </div>
                  {group.lines.map((line, li) => (
                    <RevealLine key={li} at={beats[li + 1]} fps={fps} mark="▸" color={color}>{line}</RevealLine>
                  ))}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: top 3 ──────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  const sumAt = Math.round(b.sumAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={sumAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 32 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
          <div style={{ display: 'flex', gap: 20, width: 1100, justifyContent: 'center' }}>
            {c.top3.map((t, i) => (
              <div key={t.n} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${t.color}60`, borderRadius: 16,
                padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 38, fontWeight: 800, color: t.color, fontFamily: MONO, marginBottom: 6 }}>
                  <RevealLine at={b.top3[i]} fps={fps} mark="" color={t.color}>{t.n}</RevealLine>
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
            <RevealLine at={b.sumLine} fps={fps} mark="▸" color={THEME.red}>{c.summary}</RevealLine>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 26 }}>
            {['Access', 'Crypto', 'Injection'].map((x, i) => (
              <KeyCapsule key={x} label="dónde apuntar" value={x} accent={[THEME.red, THEME.amber, THEME.cyan][i]} delay={Math.round(b.capsules[i] * fps)} size={24} />
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 3: los otros 7 + red/blue team + cierre ───────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const playbookAt = Math.round(b.playbookAt * fps);
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={playbookAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14, width: 1080 }}>
            {c.other7.map((o, i) => (
              <div key={o.n} style={{
                background: THEME.panel, border: `1px solid ${o.color}50`, borderRadius: 12,
                padding: '14px 12px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: o.color, fontFamily: MONO }}>
                  <RevealLine at={b.other7[i]} fps={fps} mark="" color={o.color}>{o.n}</RevealLine>
                </div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 4 }}>{o.name}</div>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={playbookAt} durationInFrames={closeAt - playbookAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }} dangerouslySetInnerHTML={{ __html: c.playbookHeading }} />
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={b.redTeam[0]} fps={fps} mark="" color={THEME.red}>{c.redTeam.label}</RevealLine>
              </div>
              {c.redTeam.lines.map((line, i) => (
                <RevealLine key={i} at={b.redTeam[i + 1]} fps={fps} mark="▸" color={THEME.red}>{line}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '18px 20px', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 10 }}>
                <RevealLine at={b.blueTeam[0]} fps={fps} mark="" color={THEME.green}>{c.blueTeam.label}</RevealLine>
              </div>
              {c.blueTeam.lines.map((line, i) => (
                <RevealLine key={i} at={b.blueTeam[i + 1]} fps={fps} mark="▸" color={THEME.green}>{line}</RevealLine>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Ci05OwaspTopTen: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);
  const withAudio = hasAudio(VID);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/cyber-05-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/cyber-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/cyber-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
