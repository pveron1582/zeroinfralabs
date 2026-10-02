// ── video/remotion/compositions/Wi02CurrentVersions.tsx ────────────
// Video: versiones actuales de Windows — 10 (2015/LTSC), 11 (TPM 2.0,
// Secure Boot) y Server (AD, IIS, DNS, SMB, Core + WinRM). Cierre: el
// controlador de dominio = la empresa entera.
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
      title: <><span style={{ color: THEME.cyan }}>TRES WINDOWS</span>, TRES ROLES</>,
      subtitle: 'lo que vas a encontrar en una empresa',
      win10Desc: 'la versión de escritorio más extendida',
      win10Points: [
        { text: '2015: unificó PCs, tablets y consolas', at: 1.4 },
        { text: 'soporte termina en octubre de 2025', at: 3.9 },
        { text: 'millones de máquinas sin actualizar', at: 5.7 },
        { text: 'LTSC: años en la misma versión (bancos, industria)', at: 9.1 },
      ],
    },
    s2: {
      win11Title: '🪟 WINDOWS 11',
      win11Desc: 'la actual: requisitos de hardware estrictos',
      win11Chips: [
        { label: 'TPM 2.0', at: 7.0 },
        { label: 'Secure Boot', at: 7.9 },
        { label: 'kernel NT', at: 10.2 },
      ],
      win11ChipLabel: 'endurece la máquina',
      serverTitle: '🖥️ WINDOWS SERVER',
      serverDesc: 'la identidad de toda la empresa',
      serverChips: [
        { label: 'Active Directory', at: 17.9 },
        { label: 'IIS + DNS', at: 19.2 },
        { label: 'shares SMB', at: 20.6 },
        { label: 'Core: PowerShell + WinRM', at: 25.9 },
      ],
      serverChipLabel: 'servicios corporativos',
    },
    s3: {
      heading: '¿POR QUÉ TE IMPORTA?',
      whyPoints: [
        { text: 'Windows 10 y 11: estaciones de trabajo', at: 5.0 },
        { text: 'los servidores guardan la identidad de la empresa', at: 7.4 },
        { text: 'comprometés un controlador de dominio → empresa entera', at: 10.5 },
      ],
      closeAt: 13.6,
      closeTitle: <>CADA WINDOWS TIENE SU <span style={{ color: THEME.cyan }}>PERSONALIDAD</span></>,
      closeSubtitle: 'distinguir qué mirás te dice por dónde empezar',
    },
  },
  en: {
    s1: {
      title: <><span style={{ color: THEME.cyan }}>THREE WINDOWS</span>, THREE ROLES</>,
      subtitle: "what you'll run into at a company",
      win10Desc: 'the most widespread desktop version',
      win10Points: [
        { text: '2015: unified PCs, tablets, and consoles', at: 1.3 },
        { text: 'support ends in October 2025', at: 5.3 },
        { text: 'millions of machines keep running unpatched', at: 9.1 },
        { text: 'LTSC: years on the same version (banks, industry)', at: 14.5 },
      ],
    },
    s2: {
      win11Title: '🪟 WINDOWS 11',
      win11Desc: 'the current one: strict hardware requirements',
      win11Chips: [
        { label: 'TPM 2.0', at: 6.5 },
        { label: 'Secure Boot', at: 8.8 },
        { label: 'NT kernel', at: 12.4 },
      ],
      win11ChipLabel: 'hardens the machine',
      serverTitle: '🖥️ WINDOWS SERVER',
      serverDesc: "the whole company's identity",
      serverChips: [
        { label: 'Active Directory', at: 20.6 },
        { label: 'IIS + DNS', at: 21.9 },
        { label: 'SMB shares', at: 23.6 },
        { label: 'Core: PowerShell + WinRM', at: 25.9 },
      ],
      serverChipLabel: 'corporate services',
    },
    s3: {
      heading: 'WHY DOES IT MATTER TO YOU?',
      whyPoints: [
        { text: 'Windows 10 and 11 are workstations', at: 5.4 },
        { text: "the servers hold the whole company's identity", at: 8.1 },
        { text: 'compromise a domain controller → the entire company', at: 10.4 },
      ],
      closeAt: 14.9,
      closeTitle: <>EVERY WINDOWS HAS ITS OWN <span style={{ color: THEME.cyan }}>PERSONALITY</span></>,
      closeSubtitle: "knowing which one you're looking at tells you where to start",
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { cardAt: 4.0 },
    s2: {},
    s3: {},
  },
  en: {
    s1: { cardAt: 3.9 },
    s2: {},
    s3: {},
  },
};

const VID = 'windows-02-current-versions';

// ── Scene 1: Windows 10 ───────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const cardAt = Math.round(b.cardAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={cardAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '30px 36px', width: 860, textAlign: 'left' }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 8 }}>
              🪟 WINDOWS 10
            </div>
            <div style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginBottom: 18 }}>
              {c.win10Desc}
            </div>
            {c.win10Points.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: Windows 11 y Windows Server ──────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ display: 'flex', gap: 26, width: 1100 }}>
        {/* Windows 11 */}
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '28px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 8 }}>{c.win11Title}</div>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>{c.win11Desc}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {c.win11Chips.map(chip => (
              <KeyCapsule key={chip.label} label={c.win11ChipLabel} value={chip.label} accent={THEME.cyan} delay={Math.round(chip.at * fps)} size={18} />
            ))}
          </div>
        </div>
        {/* Windows Server */}
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '28px 26px', textAlign: 'left' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 8 }}>{c.serverTitle}</div>
          <div style={{ fontSize: 16, color: THEME.muted, fontFamily: MONO, marginBottom: 16 }}>{c.serverDesc}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {c.serverChips.map(chip => (
              <KeyCapsule key={chip.label} label={c.serverChipLabel} value={chip.label} accent={THEME.amber} delay={Math.round(chip.at * fps)} size={18} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: por qué importa + cierre ─────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c }) => {
  const closeAt = Math.round(c.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
            {c.heading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 32px', width: 920, textAlign: 'left' }}>
            {c.whyPoints.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="⚠" color={THEME.amber}>{p.text}</RevealLine>
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
export const Wi02CurrentVersions: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: Windows 10 */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: Windows 11 y Server */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: por qué importa + cierre */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/windows-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
