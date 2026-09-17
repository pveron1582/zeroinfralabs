// ── video/remotion/compositions/Pe04OnlineCracking.tsx ─────────────
// Video: cracking online — hydra, medusa y ncrack.
// Lección hacking-06, clase 4 de Pentesting. Guiones: voicebox-scripts/pe-04-*.txt
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
const COPY = {
  es: {
    s1: {
      title: <>ATACÁS EL SERVICIO VIVO: <span style={{ color: THEME.red }}>CRACKING ONLINE</span></>,
      subtitle: 'probando usuario y clave contra el servidor',
      heading: <>SIN HASH: <span style={{ color: THEME.red }}>NO TENÉS LA HUELLA</span>, TENÉS LA PUERTA</>,
      leftLabel: 'CÓMO FUNCIONA',
      leftLines: ['probás combinaciones una tras otra', 'SSH, FTP, HTTP, SMB…'],
      rightLabel: 'EL COSTO',
      rightLines: ['más lento que el offline', 'deja logs · riesgo de lockout'],
    },
    s2: {
      heading: <><span style={{ color: THEME.red }}>HYDRA</span>: LA MÁS FAMOSA</>,
      terminalTitle: 'kali@attacker-01:~$ hydra -l admin -P rockyou.txt ssh://192.168.1.11',
      terminalLines: [
        '[22][ssh] host: 192.168.1.11 login: admin password: password123',
        '[22][ssh] host: 192.168.1.11   login: admin   password: password123',
      ],
      panels: [
        { text: 'usuario o lista de usuarios', color: THEME.red },
        { text: 'lista de contraseñas + servicio', color: THEME.amber },
        { text: 'prueba todas las combinaciones en paralelo', color: THEME.cyan },
      ],
      footer: <>si la clave está en la lista, <span style={{ color: THEME.red }}>la encuentra</span> — probá antes los usuarios que enumeraste</>,
    },
    s3: {
      heading: <>HYDRA NO ESTÁ SOLA: <span style={{ color: THEME.purple }}>MEDUSA</span> Y <span style={{ color: THEME.green }}>NCRACK</span></>,
      toolGroups: [
        {
          label: 'MEDUSA', labelColor: THEME.purple, labelAt: 6.6,
          lines: [{ text: 'más liviana', at: 7.6 }, { text: 'muchos servicios', at: 8.4 }],
        },
        {
          label: 'NCRACK', labelColor: THEME.green, labelAt: 9.2,
          lines: [{ text: 'de la familia Nmap', at: 11.5 }, { text: 'se integra con el escaneo', at: 13 }],
        },
        {
          label: 'EL LÍMITE', labelColor: THEME.amber, labelAt: 15.5,
          lines: [{ text: 'la red, no tu CPU', at: 17.5 }, { text: 'cada intento es una conexión real', at: 21 }],
        },
      ],
      closeTitle: <>FUERZA BRUTA: <span style={{ color: THEME.red }}>RUIDOSA</span> PERO EFECTIVA</>,
      closeSubtitle: 'en el lab y con permiso escrito, siempre',
    },
  },
  en: {
    s1: {
      title: <>NO HASH IN HAND: <span style={{ color: THEME.red }}>ONLINE CRACKING</span></>,
      subtitle: 'against a live service — slower, noisier, real',
      heading: <>A LIVE SERVICE: <span style={{ color: THEME.red }}>SSH · FTP · WEB LOGIN</span></>,
      leftLabel: 'HOW IT WORKS',
      leftLines: ['try combinations one after another against the server', 'SSH, FTP, HTTP, SMB…'],
      rightLabel: 'THE COST',
      rightLines: ['slower and noisier than offline', 'every attempt travels and leaves logs · lockout risk'],
    },
    s2: {
      heading: <><span style={{ color: THEME.red }}>HYDRA</span>: THE MOST FAMOUS</>,
      terminalTitle: 'kali@attacker-01:~$ hydra -l admin -P rockyou.txt ssh://192.168.1.11',
      terminalLines: [
        '[DATA] 1 task, 14344392 total tries',
        '[ssh] host: 192.168.1.11  login: admin  password: password123',
      ],
      lines: [
        { text: 'give it the username or a list of users' },
        { text: 'a list of passwords + the service to attack' },
        { text: 'it tries every combination in parallel' },
        { text: 'the trick: good lists + the users you already enumerated first', mark: '✓', color: THEME.green },
      ],
    },
    s3: {
      heading: <>HYDRA ISN'T ALONE: <span style={{ color: THEME.purple }}>MEDUSA</span> AND <span style={{ color: THEME.green }}>NCRACK</span></>,
      toolGroups: [
        {
          label: 'MEDUSA', labelColor: THEME.purple, labelAt: 2.0,
          lines: [{ text: 'lighter', at: 4.9 }, { text: 'support for many services', at: 5.5 }],
        },
        {
          label: 'NCRACK', labelColor: THEME.green, labelAt: 7.5,
          lines: [{ text: 'the Nmap family\'s version', at: 8.4 }, { text: 'integrates with your scans', at: 10.1 }],
        },
        {
          label: 'THE LIMIT', labelColor: THEME.amber, labelAt: 15.3,
          lines: [{ text: 'the network and the service, not your CPU', at: 17.3 }, { text: 'every attempt is a real connection', at: 21.0 }],
        },
      ],
      closeTitle: <>BRUTE FORCE: <span style={{ color: THEME.red }}>NOISY</span> BUT EFFECTIVE</>,
      closeSubtitle: 'always, always, with authorization — otherwise it\'s a crime',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 6, leftLabelAt: 7, leftLines: [11.5, 13.5], rightLabelAt: 17.5, rightLines: [19, 21.5] },
    s2: { terminalDelay: 3, panels: [8, 11, 13.5] },
    s3: { closeAt: 26 },
  },
  en: {
    s1: { panelAt: 3.8, leftLabelAt: 1.0, leftLines: [7.3, 9.9], rightLabelAt: 13.6, rightLines: [17.0, 19.4] },
    s2: { terminalDelay: 0.5, lines: [3.5, 6.3, 10.4, 26.5] },
    s3: { closeAt: 25.6 },
  },
};

const VID = 'pe-04-online-cracking';

// ── Scene components ────────────────────────────────────────────────

const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 24, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 24, width: 1120, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.red}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.red, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={b.leftLabelAt} fps={fps} mark="" color={THEME.red}>{c.leftLabel}</RevealLine>
              </div>
              {c.leftLines.map((line, i) => (
                <RevealLine key={i} at={b.leftLines[i]} fps={fps} mark="▸" color={THEME.red}>{line}</RevealLine>
              ))}
            </div>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={b.rightLabelAt} fps={fps} mark="" color={THEME.amber}>{c.rightLabel}</RevealLine>
              </div>
              {c.rightLines.map((line, i) => (
                <RevealLine key={i} at={b.rightLines[i]} fps={fps} mark="▸" color={THEME.amber}>{line}</RevealLine>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ES Scene 2: hydra with panels
const EsScene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={820} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
        {'\n'}<span style={{ color: THEME.green }}>{c.terminalLines[1]}</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 20, width: 1060, marginTop: 28, justifyContent: 'center' }}>
      {c.panels.map((p, i) => (
        <div key={i} style={{ flex: 1, background: THEME.panel, border: `1px solid ${p.color}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
          <RevealLine at={b.panels[i]} fps={fps} mark="▸" color={p.color}>{p.text}</RevealLine>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// EN Scene 2: hydra with reveal lines
const EnScene2: React.FC<{ fps: number; c: typeof COPY.en.s2; b: typeof BEATS.en.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={820} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
        {'\n'}[ssh] host: 192.168.1.11  login: admin  <span style={{ color: THEME.green }}>password: password123</span>
      </div>
    </TerminalWindow>
    <div style={{ marginTop: 26, width: 880 }}>
      {c.lines.map((l, i) => (
        <RevealLine key={i} at={b.lines[i]} fps={fps} mark={l.mark ?? '▸'} color={l.color ?? (i === 0 ? THEME.red : i === 1 ? THEME.amber : THEME.cyan)}>{l.text}</RevealLine>
      ))}
    </div>
  </AbsoluteFill>
);

// Scene 3: medusa + ncrack + closing (shared structure)
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3; lang: 'es' | 'en' }> = ({ fps, c, b, lang: _lang }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 20, width: 1120, justifyContent: 'center' }}>
            {c.toolGroups.map((g, gi) => (
              <div key={gi} style={{ flex: 1, background: THEME.panel, border: `1px solid ${g.labelColor}60`, borderRadius: 14, padding: '20px 22px', textAlign: 'left' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: g.labelColor, fontFamily: MONO, marginBottom: 10 }}>
                  <RevealLine at={g.labelAt} fps={fps} mark="" color={g.labelColor}>{g.label}</RevealLine>
                </div>
                {g.lines.map((l, li) => (
                  <RevealLine key={li} at={l.at} fps={fps} mark="▸" color={g.labelColor}>{l.text}</RevealLine>
                ))}
              </div>
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
export const Pe04OnlineCracking: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pe-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pe-04-scene2.wav`)} />}
        {lang === 'es'
          ? <EsScene2 fps={fps} c={c.s2 as typeof COPY.es.s2} b={b.s2 as typeof BEATS.es.s2} />
          : <EnScene2 fps={fps} c={c.s2 as typeof COPY.en.s2} b={b.s2 as typeof BEATS.en.s2} />}
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pe-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} lang={lang} />
      </Sequence>
    </AbsoluteFill>
  );
};
