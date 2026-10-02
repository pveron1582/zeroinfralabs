// ── video/remotion/compositions/Pe03OfflineCracking.tsx ────────────
// Video: cracking offline — john the ripper + hashcat.
// Lección pentesting-03, clase 3 de Pentesting. Guiones: voicebox-scripts/{es,en}/pentesting/pentesting-03-*.txt
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
      title: <>YA TENÉS EL HASH: <span style={{ color: THEME.cyan }}>CRACKING OFFLINE</span></>,
      subtitle: 'en tu máquina, a tu ritmo, sin alertas',
      heading: <>EL ESCENARIO: <span style={{ color: THEME.green }}>TENÉS EL HASH</span>, NO EL SERVIDOR</>,
      leftLabel: <>EN TU PROPIA MÁQUINA</>,
      leftLines: ['sin intentos que cuenten', 'sin bloqueos ni alertas'],
      rightLabel: <>EL LÍMITE ES EL TIEMPO</>,
      rightLines: ['hash débil → segundos', 'hash fuerte → años'],
    },
    s2: {
      heading: <><span style={{ color: THEME.green }}>JOHN THE RIPPER</span>: EL CLÁSICO</>,
      terminalTitle: 'kali@attacker-01:~$ john hash.txt --wordlist=rockyou.txt',
      terminalLines: ['Loaded 1 password hash (sha512crypt)', 'password123   (admin)'],
      keycapsules: [
        { label: 'wordlist', value: 'rockyou', accent: THEME.amber },
        { label: 'contraseñas reales', value: '14M+', accent: THEME.green },
        { label: 'leak 2009', value: 'filtradas', accent: THEME.cyan },
      ],
      footer: <>si la contraseña está en la lista, <span style={{ color: THEME.green }}>cae siempre</span></>,
    },
    s3: {
      heading: <>CUANDO JOHN SE QUEDA CORTO: <span style={{ color: THEME.red }}>HASHCAT</span></>,
      terminalTitle: 'kali@attacker-01:~$ hashcat -m 1800 -a 0 hash.txt rockyou.txt',
      terminalLines: [
        'Hash-mode 1800 (sha512crypt + salt)',
        'Session..........: hashcat',
        'Speed.DEV.#1....: 1234.5 kH/s (GPU)',
        'password123:admin',
      ],
      panels: [
        { text: 'corre en la GPU: miles de núcleos', color: THEME.red },
        { text: 'reglas: password → Password1', color: THEME.amber },
        { text: 'diccionario + mutaciones', color: THEME.cyan },
      ],
      closeTitle: <>LA <span style={{ color: THEME.amber }}>WORDLIST</span> ES LA MITAD DEL JUEGO</>,
      closeSubtitle: 'la GPU te da velocidad · la lista, el resultado',
    },
  },
  en: {
    s1: {
      title: <>YOU HAVE THE HASH: <span style={{ color: THEME.cyan }}>OFFLINE CRACKING</span></>,
      subtitle: 'on your machine, at your pace, no alerts',
      heading: <>THE SCENARIO: <span style={{ color: THEME.green }}>YOU HAVE THE HASH</span>, NOT THE SERVER</>,
      leftLabel: <>ON YOUR OWN MACHINE</>,
      leftLines: ['no failed attempts being counted', 'no blocks, no alarms going off'],
      rightLabel: <>THE LIMIT IS TIME</>,
      rightLines: ['a weak hash falls in seconds', 'a strong one can take years'],
    },
    s2: {
      heading: <><span style={{ color: THEME.green }}>JOHN THE RIPPER</span>: THE CLASSIC</>,
      terminalTitle: 'kali@attacker-01:~$ john hash.txt --wordlist=rockyou.txt',
      terminalLines: ['Loaded 1 password hash (sha512crypt)', 'password123   (admin)'],
      keycapsules: [
        { label: 'wordlist', value: 'rockyou', accent: THEME.amber },
        { label: 'real leaked passwords', value: '14M+', accent: THEME.green },
        { label: '2009 leak', value: 'exposed', accent: THEME.cyan },
      ],
      footer: <>weak passwords always fall: <span style={{ color: THEME.green }}>they're already on the list</span></>,
    },
    s3: {
      heading: <>WHEN JOHN FALLS SHORT: <span style={{ color: THEME.red }}>HASHCAT</span></>,
      terminalTitle: 'kali@attacker-01:~$ hashcat -m 1800 -a 0 hash.txt rockyou.txt',
      terminalLines: [
        'Hash-mode 1800 (sha512crypt + salt)',
        'Session..........: hashcat',
        'Speed.DEV.#1....: 1234.5 kH/s (GPU)',
        'password123:admin',
      ],
      panels: [
        { text: 'runs on the GPU: thousands of parallel cores', color: THEME.red },
        { text: 'mutation rules: word → word1, Word', color: THEME.amber },
        { text: 'numbers at the end, capitals at the start', color: THEME.cyan },
      ],
      closeTitle: <>THE <span style={{ color: THEME.amber }}>WORDLIST</span> IS HALF THE GAME</>,
      closeSubtitle: 'the GPU gives you speed · the list gives you the result',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 6, leftLines: [12.5, 15], rightLines: [20, 22.5], leftLabelAt: 8, rightLabelAt: 17.5 },
    s2: { terminalDelay: 3, capsules: [9, 14, 17.5] },
    s3: { closeAt: 25, terminalDelay: 3, panels: [11.5, 19.5, 21.5] },
  },
  en: {
    s1: { panelAt: 5.8, leftLines: [8.9, 11.3], rightLines: [16.8, 18.8], leftLabelAt: 5.2, rightLabelAt: 13.1 },
    s2: { terminalDelay: 0.5, capsules: [10.1, 16.2, 18.6] },
    s3: { closeAt: 24.5, terminalDelay: 6.3, panels: [9.7, 16.9, 20.5] },
  },
};

const VID = 'pentesting-03-offline-cracking';

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
          <div style={{ display: 'flex', gap: 24, width: 1100, justifyContent: 'center' }}>
            <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>
                <RevealLine at={b.leftLabelAt} fps={fps} mark="" color={THEME.cyan}>{c.leftLabel}</RevealLine>
              </div>
              {c.leftLines.map((line, i) => (
                <RevealLine key={i} at={b.leftLines[i]} fps={fps} mark="▸" color={THEME.cyan}>{line}</RevealLine>
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

const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={760} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
        <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
        {'\n'}{c.terminalLines[1].split('(admin)')[0]}<span style={{ color: THEME.green }}>  (admin)</span>
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={24} />
      ))}
    </div>
    <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, width: 880 }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <TerminalWindow title={c.terminalTitle} width={820} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              <span style={{ color: THEME.dim }}>{c.terminalLines[0]}</span>
              {'\n'}{c.terminalLines[1]}
              {'\n'}{c.terminalLines[2].replace('1234.5 kH/s', '')}<span style={{ color: THEME.green }}>1234.5 kH/s</span> (GPU)
              {'\n'}{c.terminalLines[3]}
            </div>
          </TerminalWindow>
          <div style={{ display: 'flex', gap: 20, width: 1040, marginTop: 26, justifyContent: 'center' }}>
            {c.panels.map((p, i) => (
              <div key={i} style={{ flex: 1, background: THEME.panel, border: `1px solid ${p.color}60`, borderRadius: 14, padding: '16px 20px', textAlign: 'left' }}>
                <RevealLine at={b.panels[i]} fps={fps} mark="▸" color={p.color}>{p.text}</RevealLine>
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
export const Pe03OfflineCracking: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pentesting-03-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pentesting-03-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pentesting-03-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
