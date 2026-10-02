// ── video/remotion/compositions/Ci03InformationGathering.tsx ───────
// Video: Information Gathering — la fase 1 del pentesting.
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
const FUNNEL_ES = [
  { n: '1', name: 'FOOTPRINTING', desc: 'mapa: dominios, IPs, emails, tecnología', color: THEME.green },
  { n: '2', name: 'ENUMERACIÓN', desc: 'DNS, subdominios, puertos, servicios', color: THEME.cyan },
  { n: '3', name: 'FINGERPRINTING', desc: 'Apache 2.4.41, WP 6.2 → exploit', color: THEME.amber },
];
const FUNNEL_EN = [
  { n: '1', name: 'FOOTPRINTING', desc: 'map: domains, IP ranges, emails, technology', color: THEME.green },
  { n: '2', name: 'ENUMERATION', desc: 'DNS, subdomains, ports, services', color: THEME.cyan },
  { n: '3', name: 'FINGERPRINTING', desc: 'Apache 2.4.41, WP 6.2 → exploit', color: THEME.amber },
];

const COPY = {
  es: {
    s1: {
      title: <>SABER ANTES DE <span style={{ color: THEME.cyan }}>TOCAR</span></>,
      subtitle: 'Information gathering — la fase 1 del pentesting',
      heading: 'DOS MODOS: <span style={{ color: THEME.green }}>PASIVO</span> Y <span style={{ color: THEME.amber }}>ACTIVO</span>',
      passive: { label: 'PASIVO · OSINT', descLines: ['solo observás datos públicos, sin tocar al objetivo'], trace: 'no deja rastro' },
      active: { label: 'ACTIVO', descLines: ['le hablás a la máquina: consultas DNS, escaneos, banners'], trace: 'sí deja rastro' },
      footer: 'cuanto más sabés antes, menos fuerza bruta después',
    },
    s2: {
      heading: '¿ES <span style={{ color: THEME.green }}>LEGAL</span>?',
      legal: { label: 'OSINT pasivo sobre datos públicos', lines: ['cualquiera puede leer un sitio o un WHOIS', 'en general, legal'] },
      illegal: { label: 'escaneo activo SIN autorización', lines: ['escanear puertos, probar vulnerabilidades: NO', 'requiere permiso escrito (rules of engagement)'] },
      footer: 'usar datos contra un sistema ajeno = <span style={{ color: THEME.red }}>delito</span>',
    },
    s3: {
      funnelHeading: 'LA METODOLOGÍA: UN <span style={{ color: THEME.cyan }}>EMBUDO</span>',
      funnel: FUNNEL_ES,
      funnelFooter: 'de "toda la internet" a <span style={{ color: THEME.red }}>un solo servicio vulnerable</span>',
      toolsHeading: 'EL SET DE <span style={{ color: THEME.cyan }}>HERRAMIENTAS</span>',
      toolsFooter: ['pasivas: whois, dig, Google dorking, Shodan, theHarvester', 'activas: nmap, gobuster, curl'],
      closeTitle: <>INFORMACIÓN = <span style={{ color: THEME.cyan }}>SUPERPODER</span></>,
      closeSubtitle: 'cada herramienta reduce el mapa un paso más',
    },
  },
  en: {
    s1: {
      title: <>KNOW BEFORE YOU <span style={{ color: THEME.cyan }}>TOUCH</span></>,
      subtitle: 'Information gathering — phase 1 of pentesting',
      heading: 'TWO MODES: <span style={{ color: THEME.green }}>PASSIVE</span> AND <span style={{ color: THEME.amber }}>ACTIVE</span>',
      passive: { label: 'PASSIVE · OSINT', descLines: ['you only observe public data', 'without touching the target'], trace: 'leaves no trace' },
      active: { label: 'ACTIVE', descLines: ['you talk to the machine: DNS, ports, banners', 'scans, fingerprints'], trace: 'leaves logs' },
      footer: 'the more you know beforehand, the less brute force you need later',
    },
    s2: {
      heading: 'IS IT <span style={{ color: THEME.green }}>LEGAL</span>?',
      legal: { label: 'passive OSINT on public data', lines: ['anyone can read a website or a WHOIS record', 'generally, it is legal'] },
      illegal: { label: 'unauthorized active scanning', lines: ['scanning, exploiting: NOT legal', 'requires written permission (rules of engagement)'] },
      footer: 'using data against a system that isn\'t yours = <span style={{ color: THEME.red }}>a crime</span>',
    },
    s3: {
      funnelHeading: 'THE METHODOLOGY: A <span style={{ color: THEME.cyan }}>FUNNEL</span>',
      funnel: FUNNEL_EN,
      funnelFooter: 'from "the whole internet" to <span style={{ color: THEME.red }}>a single vulnerable service</span>',
      toolsHeading: 'THE <span style={{ color: THEME.cyan }}>TOOLBOX</span>',
      toolsFooter: ['passive: whois, dig, Google dorking, Shodan, theHarvester', 'active: nmap, gobuster, curl'],
      closeTitle: <>INFORMATION = <span style={{ color: THEME.cyan }}>A SUPERPOWER</span></>,
      closeSubtitle: 'the best tool is the one that gives you the version',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { panelAt: 12.5, passiveLabel: 3.8, passiveDescLines: [5.7, 5.7] as [number, number], passiveTrace: 13.6, activeLabel: 8.6, activeDescLines: [10.9, 10.9] as [number, number], activeTrace: 15.7, footer: 0.1 },
    s2: { legalLabel: 0.6, legalLines: [5.0, 6.3], illegalLabel: 9.6, illegalLines: [12.3, 15.9] },
    s3: { funnelAt: 1.5, funnelNums: [0.4, 1.0, 1.6], toolsAt: 1.5, terminalDelay: 2, toolLines: [2.5, 5], closeAt: 27.9 },
  },
  en: {
    s1: { panelAt: 14.4, passiveLabel: 4.0, passiveDescLines: [6.7, 8.7] as [number, number], passiveTrace: 15.6, activeLabel: 9.7, activeDescLines: [11.7, 13.7] as [number, number], activeTrace: 17.7, footer: 0.1 },
    s2: { legalLabel: 3.8, legalLines: [6.2, 7.2], illegalLabel: 11.6, illegalLines: [15.0, 18.8] },
    s3: { funnelAt: 1.2, funnelNums: [0.4, 1.0, 1.6], toolsAt: 7, terminalDelay: 2, toolLines: [2.5, 5], closeAt: 29.6 },
  },
};

const VID = 'cyber-03-information-gathering';

// ── Scene 1: qué es + pasivo vs activo ──────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
          <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={b.passiveLabel} fps={fps} mark="" color={THEME.green}>{c.passive.label}</RevealLine>
              </div>
              {c.passive.descLines.map((line, i) => (
                <RevealLine key={i} at={b.passiveDescLines[i]} fps={fps} mark="◻" color={THEME.green}>{line}</RevealLine>
              ))}
              <RevealLine at={b.passiveTrace} fps={fps} mark="▸" color={THEME.green}>{c.passive.trace}</RevealLine>
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={b.activeLabel} fps={fps} mark="" color={THEME.amber}>{c.active.label}</RevealLine>
              </div>
              {c.active.descLines.map((line, i) => (
                <RevealLine key={i} at={b.activeDescLines[i]} fps={fps} mark="◻" color={THEME.amber}>{line}</RevealLine>
              ))}
              <RevealLine at={b.activeTrace} fps={fps} mark="⚠" color={THEME.amber}>{c.active.trace}</RevealLine>
            </div>
          </div>
          <div style={{ width: 900, textAlign: 'left', marginTop: 20 }}>
            <RevealLine at={b.footer} fps={fps} mark="▸" color={THEME.cyan}>{c.footer}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: legalidad ──────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }} dangerouslySetInnerHTML={{ __html: c.heading }} />
      <div style={{ display: 'flex', gap: 20, width: 1040, justifyContent: 'center' }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.green, fontFamily: MONO }}>
            <RevealLine at={b.legalLabel} fps={fps} mark="✓" color={THEME.green}>{c.legal.label}</RevealLine>
          </div>
          {c.legal.lines.map((line, i) => (
            <RevealLine key={i} at={b.legalLines[i]} fps={fps} mark="▸" color={THEME.green}>{line}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '20px 22px', textAlign: 'left' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: THEME.red, fontFamily: MONO }}>
            <RevealLine at={b.illegalLabel} fps={fps} mark="✗" color={THEME.red}>{c.illegal.label}</RevealLine>
          </div>
          {c.illegal.lines.map((line, i) => (
            <RevealLine key={i} at={b.illegalLines[i]} fps={fps} mark="▸" color={THEME.red}>{line}</RevealLine>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 22, fontSize: 17, color: THEME.muted, fontFamily: MONO }} dangerouslySetInnerHTML={{ __html: c.footer }} />
    </AbsoluteFill>
  );
};

// ── Scene 3: embudo + herramientas + cierre ─────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3; lang: 'es' | 'en' }> = ({ fps, c, b, lang }) => {
  const funnelAt = Math.round(b.funnelAt * fps);
  const toolsAt = lang === 'en' ? Math.round(b.toolsAt * fps) : funnelAt;
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={funnelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: c.funnelHeading }} />
          <div style={{ display: 'flex', gap: 16, width: 1040 }}>
            {c.funnel.map((s, i) => (
              <div key={s.n} style={{
                flex: 1, background: THEME.panel, border: `1px solid ${s.color}60`, borderRadius: 16,
                padding: '18px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 34, fontWeight: 800, color: s.color, fontFamily: MONO, marginBottom: 4 }}>
                  <RevealLine at={b.funnelNums[i]} fps={fps} mark="" color={s.color}>{s.n}</RevealLine>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{s.name}</div>
                <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, fontSize: 17, color: THEME.muted, fontFamily: MONO }} dangerouslySetInnerHTML={{ __html: c.funnelFooter }} />
        </AbsoluteFill>
      </Sequence>
      {lang === 'en' && (
        <Sequence from={funnelAt} durationInFrames={toolsAt - funnelAt}>
          <AbsoluteFill style={CENTERED}>
            <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO, marginBottom: 14 }}>
              every tool narrows the map one more step
            </div>
          </AbsoluteFill>
        </Sequence>
      )}
      <Sequence from={toolsAt} durationInFrames={closeAt - toolsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }} dangerouslySetInnerHTML={{ __html: c.toolsHeading }} />
          <TerminalWindow title="kali@attacker-01:~$" width={820} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
              <span style={{ color: THEME.green }}>whois</span> example.com         <span style={{ color: THEME.dim }}>{lang === 'es' ? '# dueño del dominio' : '# domain owner'}</span>
              {'\n'}<span style={{ color: THEME.green }}>dig</span> example.com ANY   <span style={{ color: THEME.dim }}>{lang === 'es' ? '# IP y registros DNS' : '# IP and DNS records'}</span>
              {'\n'}<span style={{ color: THEME.green }}>nmap</span> -sV 192.168.1.11 <span style={{ color: THEME.dim }}># fingerprinting</span>
              {'\n'}<span style={{ color: THEME.green }}>gobuster</span> dir -u http://... <span style={{ color: THEME.dim }}>{lang === 'es' ? '# directorios' : '# directories'}</span>
              {'\n'}<span style={{ color: THEME.green }}>curl</span> -I http://...    <span style={{ color: THEME.dim }}># banners</span>
            </div>
          </TerminalWindow>
          <div style={{ width: 900, textAlign: 'left', marginTop: 18 }}>
            {c.toolsFooter.map((line, i) => (
              <RevealLine key={i} at={b.toolLines[i]} fps={fps} mark="◻" color={i === 0 ? THEME.purple : THEME.cyan}>{line}</RevealLine>
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
export const Ci03InformationGathering: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {withAudio && <Audio src={staticFile(`${base}/${VID}/cyber-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/cyber-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {withAudio && <Audio src={staticFile(`${base}/${VID}/cyber-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} lang={lang} />
      </Sequence>
    </AbsoluteFill>
  );
};
