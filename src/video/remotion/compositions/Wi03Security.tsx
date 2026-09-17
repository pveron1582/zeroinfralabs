// ── video/remotion/compositions/Wi03Security.tsx ──────────────────
// Video: controles de seguridad de Windows — firewall (3 perfiles),
// Defender y UAC, políticas de grupo y las demás defensas (BitLocker,
// Credential Guard, Event Logs...). Para el pentester: leer qué
// configuraron los defensores te dice qué les importa.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
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

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: <>WINDOWS YA VIENE <span style={{ color: THEME.amber }}>BLINDADO</span></>,
      subtitle: 'firewall, antivirus, UAC y políticas de grupo',
      fwTitle: '🧱 WINDOWS DEFENDER FIREWALL',
      fwPoints: [
        { text: 'activado por defecto', at: 2.3 },
        { text: '3 perfiles: dominio, privado y público', at: 3.8 },
        { text: 'un puerto "cerrado" puede estar abierto solo en la LAN', at: 10.6 },
      ],
    },
    s2: {
      defenderTitle: '🛡️ MICROSOFT DEFENDER',
      defenderPoints: [
        { text: 'antivirus integrado (10 y 11)', at: 2.1 },
        { text: 'escaneo en tiempo real + nube', at: 4.6 },
        { text: 'los payloads modernos tienen que evadirlo', at: 7.1 },
      ],
      uacTitle: '🪟 UAC — CONTROL DE CUENTAS',
      uacPoints: [
        { text: 'aviso cuando algo pide permisos de admin', at: 12.6 },
        { text: 'pide consentimiento o credenciales', at: 14.9 },
        { text: 'no detiene: frena y deja un popup visible', at: 17.9 },
      ],
    },
    s3: {
      gpoTitle: '📋 POLÍTICAS DE GRUPO (GPO)',
      gpoPoints: [
        { text: 'configura contraseñas, apps y firewall', at: 2.1 },
        { text: 'en empresas: se aplica desde Active Directory', at: 6.7 },
      ],
      moreDefenses: [
        { label: 'BitLocker', desc: 'cifra el disco', at: 11.2 },
        { label: 'Credential Guard', desc: 'protege los hashes en memoria', at: 13.2 },
        { label: 'Secure Boot', desc: 'verifica el arranque', at: 14.3 },
        { label: 'AppLocker', desc: 'lista blanca de apps', at: 15.0 },
        { label: 'Event Logs', desc: 'registran cada acceso', at: 17.1 },
      ],
    },
  },
  en: {
    s1: {
      title: <>WINDOWS COMES <span style={{ color: THEME.amber }}>HARDENED</span> BY DEFAULT</>,
      subtitle: 'firewall, antivirus, UAC, and group policies',
      fwTitle: '🧱 WINDOWS DEFENDER FIREWALL',
      fwPoints: [
        { text: 'enabled by default', at: 0.1 },
        { text: '3 profiles: domain, private, and public', at: 3.0 },
        { text: 'a port "closed" outside can be open just for the internal network', at: 9.0 },
      ],
    },
    s2: {
      defenderTitle: '🛡️ MICROSOFT DEFENDER',
      defenderPoints: [
        { text: 'the antivirus built into Windows 10 and 11', at: 0.6 },
        { text: 'real-time scanning and cloud detection', at: 5.0 },
        { text: 'modern payloads have to evade it', at: 7.4 },
      ],
      uacTitle: '🪟 UAC — USER ACCOUNT CONTROL',
      uacPoints: [
        { text: 'a prompt when a program wants admin changes', at: 13.2 },
        { text: 'asks for consent or credentials', at: 16.5 },
        { text: "doesn't stop a real attack, but slows it down and leaves a popup", at: 18.7 },
      ],
    },
    s3: {
      gpoTitle: '📋 GROUP POLICIES (GPO)',
      gpoPoints: [
        { text: 'configure passwords, what users can run, firewall rules', at: 2.1 },
        { text: 'in a company they are applied from Active Directory', at: 6.2 },
      ],
      moreDefenses: [
        { label: 'BitLocker', desc: 'encrypts the disk', at: 10.2 },
        { label: 'Credential Guard', desc: 'protects hashes in memory', at: 12.7 },
        { label: 'Event Logs', desc: 'record every access attempt', at: 16.5 },
      ],
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: { s1: { panelAt: 3.8 }, s2: {}, s3: {} },
  en: { s1: { panelAt: 3.5 }, s2: {}, s3: {} },
};

const VID = 'wi-03-security';

// ── Scene 1: firewall ─────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <div style={{ width: 520, textAlign: 'left' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 16 }}>
                {c.fwTitle}
              </div>
              {c.fwPoints.map(p => (
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
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 26, width: 1100 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '26px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 14 }}>{c.defenderTitle}</div>
          {c.defenderPoints.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
          ))}
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 14 }}>{c.uacTitle}</div>
          {c.uacPoints.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: GPO + más defensas + cierre ──────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.purple}60`, borderRadius: 16, padding: '24px 30px', width: 980, textAlign: 'left', marginBottom: 26 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.purple, fontFamily: MONO, marginBottom: 12 }}>{c.gpoTitle}</div>
        {c.gpoPoints.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.purple}>{p.text}</RevealLine>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1000 }}>
        {c.moreDefenses.map(d => (
          <KeyCapsule key={d.label} label={d.desc} value={d.label} accent={THEME.amber} delay={Math.round(d.at * fps)} size={18} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Wi03Security: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: firewall */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/wi-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: Defender + UAC */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/wi-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: GPO + más defensas */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/wi-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
