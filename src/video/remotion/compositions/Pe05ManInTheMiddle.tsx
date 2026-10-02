// ── video/remotion/compositions/Pe05ManInTheMiddle.tsx ─────────────
// Video: man-in-the-middle — ARP spoofing en la LAN.
// Clase 5 de Pentesting (lección pentesting-05). Guiones: voicebox-scripts/pe-05-*.txt
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
      title: <>EN EL MEDIO DE LA CONVERSACIÓN: <span style={{ color: THEME.red }}>MAN IN THE MIDDLE</span></>,
      subtitle: 'todo el tráfico pasa por el atacante… y nadie lo nota',
      heading: <>LA VÍCTIMA HABLA CON SU ROUTER… <span style={{ color: THEME.red }}>PERO TE ESCUCHA A VOS</span></>,
      panels: [
        { text: 'LEER el tráfico (sniffing)', color: THEME.cyan },
        { text: 'MODIFICARLO (inyección)', color: THEME.amber },
        { text: 'DESCARTARLO (DoS)', color: THEME.red },
      ],
      footer: <>como interceptar el correo: <span style={{ color: THEME.text }}>fotocopiar cada carta</span> y entregarla igual</>,
    },
    s2: {
      heading: <>ARP SPOOFING: <span style={{ color: THEME.amber }}>LA JUGADA CLÁSICA</span></>,
      terminalTitle: 'kali@attacker-01:~$ sudo arpspoof -i eth0 -t 192.168.1.11 192.168.1.1',
      terminalLines: [
        '0:c:29:aa:bb:cc 192.168.1.11  is-at 00:11:22:33:44:55',
        '# la IP del router ahora apunta a MI MAC',
        'kali@attacker-01:~$ echo 1 > /proc/sys/net/ipv4/ip_forward',
        '# reenvío al router real: la navegación no se corta',
      ],
      keycapsules: [
        { label: 'ARP poisoning', value: 'tabla falsa', accent: THEME.amber },
        { label: 'ip_forward = 1', value: 'puente invisible', accent: THEME.green },
        { label: 'la víctima', value: 'no nota nada', accent: THEME.red },
      ],
      footer: '',
    },
    s3: {
      heading: <>DETECTARLO Y <span style={{ color: THEME.green }}>FRENARLO</span></>,
      toolGroups: [
        {
          label: 'DETECTAR', labelColor: THEME.red, labelAt: 2.5,
          lines: [{ text: 'arp -a: dos IPs, misma MAC', at: 4.5 }, { text: 'proceso arpspoof corriendo', at: 7 }],
        },
        {
          label: 'PREVENIR', labelColor: THEME.amber, labelAt: 9.8,
          lines: [{ text: 'entradas ARP estáticas', at: 11.5 }, { text: 'port security: 1 MAC por puerto', at: 13 }],
        },
        {
          label: 'CIFRAR', labelColor: THEME.green, labelAt: 16,
          lines: [{ text: 'TLS en todas partes', at: 18 }, { text: 'sniffean, pero solo ven ruido', at: 20 }],
        },
      ],
      closeTitle: <>DE POSICIÓN SIMPLE A <span style={{ color: THEME.red }}>COSECHA DE CONTRASEÑAS</span></>,
      closeSubtitle: 'MITM: cookies, sesiones y credenciales completas',
    },
  },
  en: {
    s1: {
      title: <>SOMEONE IN THE <span style={{ color: THEME.red }}>MIDDLE</span></>,
      subtitle: 'a man in the middle attack, explained',
      heading: <>THE CONNECTION STILL WORKS — <span style={{ color: THEME.amber }}>NOBODY SUSPECTS A THING</span></>,
      panels: [
        { text: 'READ', subtitle: 'every message, read and forwarded like nothing happened', color: THEME.cyan },
        { text: 'MODIFY', subtitle: 'the data, modified mid-flight', color: THEME.amber },
        { text: 'CUT OFF', subtitle: 'entirely — like photocopying someone\'s mail', color: THEME.red },
      ],
    },
    s2: {
      heading: <>THE CLASSIC PLAY: <span style={{ color: THEME.amber }}>ARP SPOOFING</span></>,
      terminalTitle: 'kali@attacker-01:~$ sudo arpspoof -i eth0 -t 192.168.1.11 192.168.1.1',
      terminalLines: [
        '# "the router\'s IP now points to my MAC"',
        'kali@attacker-01:~$ echo 1 > /proc/sys/net/ipv4/ip_forward',
      ],
      keycapsules: [
        { label: 'ARP poisoning', value: 'fake replies', accent: THEME.amber },
        { label: 'ip_forward = 1', value: 'invisible bridge', accent: THEME.green },
        { label: 'the victim', value: 'never notices', accent: THEME.red },
      ],
      footer: 'one command poisons the victim\'s ARP table, the other turns your machine into the bridge everything flows through',
    },
    s3: {
      heading: <>HOW DO YOU <span style={{ color: THEME.red }}>DETECT</span> IT AND <span style={{ color: THEME.green }}>STOP</span> IT?</>,
      toolGroups: [
        {
          label: 'DETECT', labelColor: THEME.red, labelAt: 0.0,
          lines: [{ text: 'arp -a: two IPs, same MAC', at: 2.6 }, { text: 'an intruder standing in the middle', at: 8.1 }],
        },
        {
          label: 'PREVENT', labelColor: THEME.amber, labelAt: 10.3,
          lines: [{ text: 'static ARP entries', at: 10.6 }, { text: 'port security: one MAC per port', at: 12.1 }],
        },
        {
          label: 'ENCRYPT', labelColor: THEME.green, labelAt: 15.1,
          lines: [{ text: 'TLS everywhere', at: 15.1 }, { text: 'they sniff your traffic, but they only see noise', at: 17.3 }],
        },
      ],
      closeTitle: <>MITM: FROM A FOOTHOLD TO A <span style={{ color: THEME.red }}>HARVEST</span></>,
      closeSubtitle: 'passwords, cookies, and full sessions — one bridge away',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 6, panels: [19.5, 21.5, 23] },
    s2: { terminalDelay: 4, capsules: [12, 20, 27] },
    s3: { closeAt: 25 },
  },
  en: {
    s1: { panelAt: 8.5, panels: [14.1, 16.0, 17.6] },
    s2: { terminalDelay: 4.1, capsules: [13.0, 24.1, 19.9] },
    s3: { closeAt: 20.7 },
  },
};

const VID = 'pe-05-man-in-the-middle';

// ── Scene components ────────────────────────────────────────────────

// ES Scene 1
const EsScene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
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
          <div style={{ display: 'flex', gap: 20, width: 1060, justifyContent: 'center' }}>
            {c.panels.map((p, i) => (
              <div key={i} style={{ flex: 1, background: THEME.panel, border: `1px solid ${p.color}60`, borderRadius: 14, padding: '18px 22px' }}>
                <RevealLine at={b.panels[i]} fps={fps} mark="▸" color={p.color}>{p.text}</RevealLine>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// EN Scene 1
const EnScene1: React.FC<{ fps: number; c: typeof COPY.en.s1; b: typeof BEATS.en.s1 }> = ({ fps, c, b }) => {
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
            {c.panels.map((p, i) => (
              <div key={i} style={{ flex: 1, background: THEME.panel, border: `1px solid ${p.color}60`, borderRadius: 16, padding: '22px 24px', textAlign: 'left' }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: p.color, fontFamily: MONO, marginBottom: 12 }}>
                  <RevealLine at={b.panels[i]} fps={fps} mark="" color={p.color}>{p.text}</RevealLine>
                </div>
                <RevealLine at={b.panels[i]} fps={fps} mark="▸" color={p.color}>{(p as { subtitle: string }).subtitle}</RevealLine>
              </div>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// Scene 2: ARP spoofing (shared)
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
      {c.heading}
    </div>
    <TerminalWindow title={c.terminalTitle} width={900} delay={Math.round(b.terminalDelay * fps)}>
      <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
        {c.terminalLines.map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && '\n'}
            <span style={{ color: line.startsWith('#') || line.startsWith('0:') ? THEME.dim : THEME.text }}>{line}</span>
          </React.Fragment>
        ))}
      </div>
    </TerminalWindow>
    <div style={{ display: 'flex', gap: 16, marginTop: 28 }}>
      {c.keycapsules.map((k, i) => (
        <KeyCapsule key={k.label} label={k.label} value={k.value} accent={k.accent} delay={Math.round(b.capsules[i] * fps)} size={24} />
      ))}
    </div>
    {c.footer && (
      <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, width: 880 }}>
        {c.footer}
      </div>
    )}
  </AbsoluteFill>
);

// Scene 3: detection + defense + closing (shared)
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
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
export const Pe05ManInTheMiddle: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pe-05-scene1.wav`)} />}
        {lang === 'es'
          ? <EsScene1 fps={fps} c={c.s1 as typeof COPY.es.s1} b={b.s1 as typeof BEATS.es.s1} />
          : <EnScene1 fps={fps} c={c.s1 as typeof COPY.en.s1} b={b.s1 as typeof BEATS.en.s1} />}
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pe-05-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pe-05-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
