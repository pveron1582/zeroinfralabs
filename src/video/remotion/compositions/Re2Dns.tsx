// ── video/remotion/compositions/Re2Dns.tsx ───────────────────────────
// Video: DNS — cómo busca los nombres la internet.
// Lección network-08 del Academy (Redes II). Guiones: voicebox-scripts/re2-03-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-03-scene*.wav.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>LA AGENDA <span style={{ color: THEME.cyan }}>DE INTERNET</span></>,
      subtitle: 'DNS — nombres → IPs',
      points: [
        { at: 4.14, mark: '▸', color: THEME.cyan, text: 'base de datos mundial y distribuida: nadie sabe todo' },
        { at: 8.45, mark: '▸', color: THEME.amber, text: 'UDP puerto 53 · TCP si la respuesta es grande' },
        { at: 14.32, mark: '⚠️', color: THEME.red, text: 'si falla, parece que se cayó toda la internet' },
      ],
    },
    s2: {
      heading: <>LA CADENA DE <span style={{ color: THEME.green }}>RESOLUCIÓN</span></>,
      chain: [
        { icon: '🌍', name: 'ROOT', color: THEME.amber, desc: '"no sé google.com, pero los que manejan .com son…"' },
        { icon: '📁', name: 'TLD (.com)', color: THEME.cyan, desc: '"los responsables de google.com son…"' },
        { icon: '🏢', name: 'AUTORITATIVO', color: THEME.green, desc: '"google.com es 142.250.78.78"' },
      ],
      footer: <>3 preguntas · y cada respuesta viene con un <span style={{ color: THEME.amber }}>TTL</span> para cachear</>,
    },
    s3: {
      heading: <>LOS <span style={{ color: THEME.cyan }}>REGISTROS</span> PRINCIPALES</>,
      records: [
        { name: 'A', desc: 'nombre → IPv4', color: THEME.cyan },
        { name: 'AAAA', desc: 'nombre → IPv6', color: THEME.cyan },
        { name: 'MX', desc: 'correo del dominio', color: THEME.green },
        { name: 'NS', desc: 'autoritativo', color: THEME.amber },
        { name: 'CNAME', desc: 'alias', color: THEME.purple },
        { name: 'TXT', desc: 'propiedad + anti-spam', color: THEME.green },
      ],
      recordAt: [2.32, 3.52, 6.47, 8.32, 10.88, 13.26],
      points: [
        { at: 18.77, mark: '☠️', color: THEME.red, text: 'envenenamiento de caché · hijacking · exfiltración por subdominios' },
        { at: 34.78, mark: '🛡️', color: THEME.green, text: 'defensas: DNSSEC · DNS sobre HTTPS/TLS' },
      ],
      closeTitle: <>DNS: <span style={{ color: THEME.cyan }}>ORO DE RECON</span></>,
      closeSubtitle: 'subdominios y registros revelan la estructura antes de atacar',
    },
  },
  en: {
    s1: {
      title: <>THE INTERNET'S <span style={{ color: THEME.cyan }}>CONTACT LIST</span></>,
      subtitle: 'DNS — names → IPs',
      points: [
        { at: 6.4, mark: '▸', color: THEME.cyan, text: 'worldwide distributed database: no single server knows everything' },
        { at: 12.2, mark: '▸', color: THEME.amber, text: 'UDP port 53 · TCP when the answer is too big' },
        { at: 15.0, mark: '⚠️', color: THEME.red, text: 'if it fails, it looks like the whole internet is down' },
      ],
    },
    s2: {
      heading: <>THE <span style={{ color: THEME.green }}>RESOLUTION</span> CHAIN</>,
      chain: [
        { icon: '🌍', name: 'ROOT', color: THEME.amber, desc: '"I don\'t know google.com, but the ones running .com are these"' },
        { icon: '📁', name: 'TLD (.com)', color: THEME.cyan, desc: '"the ones responsible for google.com are these"' },
        { icon: '🏢', name: 'AUTHORITATIVE', color: THEME.green, desc: '"google.com is 142.250.78.78"' },
      ],
      footer: <>3 questions · and every answer carries a <span style={{ color: THEME.amber }}>TTL</span> to cache</>,
    },
    s3: {
      heading: <>THE MAIN <span style={{ color: THEME.cyan }}>RECORDS</span></>,
      records: [
        { name: 'A', desc: 'name → IPv4', color: THEME.cyan },
        { name: 'AAAA', desc: 'name → IPv6', color: THEME.cyan },
        { name: 'MX', desc: 'domain mail', color: THEME.green },
        { name: 'NS', desc: 'authoritative', color: THEME.amber },
        { name: 'CNAME', desc: 'alias', color: THEME.purple },
        { name: 'TXT', desc: 'ownership + anti-spam', color: THEME.green },
      ],
      recordAt: [3.6, 6.8, 9.4, 12.3, 14.5, 16.4],
      points: [
        { at: 27.1, mark: '☠️', color: THEME.red, text: 'cache poisoning · hijacking · exfiltration through subdomains' },
        { at: 38.0, mark: '🛡️', color: THEME.green, text: 'defenses: DNSSEC · DNS over HTTPS/TLS' },
      ],
      closeTitle: <>DNS: <span style={{ color: THEME.cyan }}>RECON GOLD</span></>,
      closeSubtitle: 'subdomains and records reveal the structure before you attack',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 6.74 },
    s2: { chain: [6.43, 15.71, 22.22] },
    s3: { closeAt: 37.29, terminalDelay: 15.28 },
  },
  en: {
    s1: { panelAt: 6.4 },
    s2: { chain: [6.8, 13.0, 18.6] },
    s3: { closeAt: 38.1, terminalDelay: 20.0 },
  },
};

const VID = 're2-03-dns';

// ── Escena 1: qué hace ─────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>google.com</div>
            <span style={{ fontSize: 30, color: THEME.green }}>→</span>
            <div style={{ fontSize: 28, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>142.250.78.78</div>
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 840, textAlign: 'left' }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: la cadena de resolución ──────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', width: 1080 }}>
      {c.chain.map((s, i) => (
        <React.Fragment key={s.name}>
          {i > 0 && <span style={{ fontSize: 30, color: THEME.green }}>→</span>}
          <div style={{
            flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`, borderRadius: 16, padding: '20px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 30, marginBottom: 6 }}>{s.icon}</div>
            <RevealLine at={b.chain[i]} fps={fps} mark="" color={s.color}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>{s.name}</span>
            </RevealLine>
            <div style={{ fontSize: 12, color: THEME.muted, fontFamily: MONO, marginTop: 10, lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
    <div style={{ marginTop: 24, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Escena 3: registros + ataques + cierre ─────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: 920, justifyContent: 'center' }}>
            {c.records.map((r, i) => (
              <RevealLine key={r.name} at={c.recordAt[i]} fps={fps} mark="" color={r.color}>
                <span style={{
                  display: 'inline-flex', alignItems: 'baseline', gap: 10,
                  background: THEME.panel, border: `1px solid ${r.color}60`, borderRadius: 10, padding: '8px 14px',
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{r.name}</span>
                  <span style={{ fontSize: 13, color: THEME.muted }}>{r.desc}</span>
                </span>
              </RevealLine>
            ))}
          </div>
          <TerminalWindow title="kali@attacker-01:~$ dig example.com" width={620} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 14, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>;; ANSWER SECTION:</span>
              {'\n'}example.com.  <span style={{ color: THEME.amber }}>86400</span>  IN  A  <span style={{ color: THEME.green }}>93.184.216.34</span>
              {'\n'}<span style={{ color: THEME.dim }}>;; SERVER: 8.8.8.8#53</span>
            </div>
          </TerminalWindow>
          <div style={{ width: 900, textAlign: 'left', marginTop: 14 }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
            ))}
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
export const Re2Dns: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
