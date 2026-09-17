// ── video/remotion/compositions/Re02IpAddresses.tsx ────────────────
// Video: direcciones IP — formato, públicas vs privadas y NAT.
// Lección redes-02 del Academy. Guiones: voicebox-scripts/re-02-*.txt
// Audio real cargado (wavs Voicebox, ffprobe 2026-08-17). Los syncs internos
// (RevealLine/KeyCapsule/TitleScene) están alineados a silencedetect (-50dB).
// Versión unificada ES/EN con `lang` prop.

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
      title: <>LA <span style={{ color: THEME.cyan }}>DIRECCIÓN IP</span></>,
      subtitle: 'la dirección postal de cada equipo',
      octetLabel: (i: number) => `octeto ${i} (0-255)`,
      line1: '4 NÚMEROS, DE ',
      line1Accent: <>0 A 255</>,
      line1Rest: ', SEPARADOS POR PUNTOS',
      points: [
        'número único dentro de la red: a quién entregarle datos',
        'dos equipos con la misma IP = conflicto de IP',
      ],
    },
    s2: {
      heading: <><span style={{ color: THEME.amber }}>PÚBLICAS</span> VS <span style={{ color: THEME.green }}>PRIVADAS</span></>,
      publicLabel: '🌍 PÚBLICA',
      publicPoints: ['única en todo internet', 'la asigna tu proveedor', 'cualquiera puede alcanzarla'],
      privateLabel: '🏠 PRIVADA',
      privatePoints: ['interna de tu red', 'intocable desde afuera', 'rangos: 10.x · 172.16–31.x · 192.168.x'],
      footer: <>tu casa: <span style={{ color: THEME.amber }}>pública afuera</span> → el router reparte <span style={{ color: THEME.green }}>privadas adentro</span></>,
    },
    s3: {
      heading: <><span style={{ color: THEME.cyan }}>NAT</span>: TODA TU CASA SALE CON UNA IP</>,
      terminalLines: [
        { dim: true, text: '2: eth0: <BROADCAST,MULTICAST,UP>' },
        { indent: '    inet ', green: '192.168.1.10', rest: '/24 scope global eth0' },
        { dimPrefix: '1: lo:', indent: '    inet ', cyan: '127.0.0.1', rest: '/8 scope host lo' },
      ],
      footer: '192.168.1.10 = privada · 127.0.0.1 = loopback (la máquina hablándose a sí misma)',
      closeTitle: <>EL ROUTER <span style={{ color: THEME.cyan }}>TRADUCE</span> TODO</>,
      closeSubtitle: 'privadas adentro, una pública hacia afuera',
    },
  },
  en: {
    s1: {
      title: <>THE <span style={{ color: THEME.cyan }}>IP ADDRESS</span></>,
      subtitle: "every machine's mailing address",
      octetLabel: (i: number) => `octet ${i} (0-255)`,
      line1: '4 NUMBERS, FROM ',
      line1Accent: <>0 TO 255</>,
      line1Rest: ', SEPARATED BY DOTS',
      points: [
        'a unique number on the network: who data gets delivered to',
        'two machines with the same IP = an IP conflict',
      ],
    },
    s2: {
      heading: <><span style={{ color: THEME.amber }}>PUBLIC</span> VS <span style={{ color: THEME.green }}>PRIVATE</span></>,
      publicLabel: '🌍 PUBLIC',
      publicPoints: ['unique across the whole internet', 'your provider assigns them', 'any machine in the world can reach them'],
      privateLabel: '🏠 PRIVATE',
      privatePoints: ['internal to your network', "can't be touched from outside", 'ranges: 10.x · 172.16–31.x · 192.168.x'],
      footer: <>at home: <span style={{ color: THEME.amber }}>public facing out</span> → the router hands out <span style={{ color: THEME.green }}>private ones inward</span></>,
    },
    s3: {
      heading: <><span style={{ color: THEME.cyan }}>NAT</span>: YOUR WHOLE HOME ON ONE IP</>,
      terminalLines: [
        { dim: true, text: '2: eth0: <BROADCAST,MULTICAST,UP>' },
        { indent: '    inet ', green: '192.168.1.10', rest: '/24 scope global eth0' },
        { dimPrefix: '1: lo:', indent: '    inet ', cyan: '127.0.0.1', rest: '/8 scope host lo' },
      ],
      footer: '192.168.1.10 = private · 127.0.0.1 = loopback (the machine talking to itself)',
      closeTitle: <>THE ROUTER <span style={{ color: THEME.cyan }}>TRANSLATES</span> EVERYTHING</>,
      closeSubtitle: 'private inside, one public outside',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 6, octets: [2.2, 3.0, 3.8, 4.6], points: [0.4, 5.8] },
    s2: { publicAt: [1.5, 3.5, 5.5], privateAt: [7.5, 9, 11] },
    s3: { closeAt: 14.6, terminalDelay: 11 },
  },
  en: {
    s1: { panelAt: 6.9, octets: [4.3, 5.1, 5.9, 6.7], points: [0.1, 8.1] },
    s2: { publicAt: [2.0, 4.9, 7.0], privateAt: [8.8, 10.9, 12.8] },
    s3: { closeAt: 20.5, terminalDelay: 13.8 },
  },
};

const VID = 're-02-ip-addresses';

// ── Scene 1: el formato de la IP ──────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const panelAt = Math.round(b.panelAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={panelAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={panelAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {['192', '168', '1', '10'].map((part, i) => (
              <KeyCapsule key={part + i} label={c.octetLabel(i + 1)} value={part} accent={THEME.cyan} delay={b.octets[i]} size={40} />
            ))}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
            {c.line1}<span style={{ color: THEME.amber }}>{c.line1Accent}</span>{c.line1Rest}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '20px 28px', width: 760, textAlign: 'left' }}>
            <RevealLine at={b.points[0]} fps={fps} mark="▸" color={THEME.cyan}>{c.points[0]}</RevealLine>
            <RevealLine at={b.points[1]} fps={fps} mark="✗" color={THEME.red}>{c.points[1]}</RevealLine>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: públicas vs privadas ─────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 24, width: 1120 }}>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>{c.publicLabel}</div>
        {c.publicPoints.map((p, i) => (
          <RevealLine key={i} at={b.publicAt[i]} fps={fps} mark="▸" color={THEME.amber}>{p}</RevealLine>
        ))}
      </div>
      <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 16, padding: '24px 22px', textAlign: 'left' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 12 }}>{c.privateLabel}</div>
        {c.privatePoints.map((p, i) => (
          <RevealLine key={i} at={b.privateAt[i]} fps={fps} mark="▸" color={THEME.green}>{p}</RevealLine>
        ))}
      </div>
    </div>
    <div style={{ marginTop: 26, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Escena 3: NAT + ip addr ────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.heading}
          </div>
          <TerminalWindow title="kali@attacker-01:~$ ip addr" width={700} delay={Math.round(b.terminalDelay * fps)}>
            <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.7 }}>
              {c.terminalLines.map((line, i) => (
                <React.Fragment key={i}>
                  {i > 0 && '\n'}
                  {line.dim && <span style={{ color: THEME.dim }}>{line.text}</span>}
                  {!line.dim && (
                    <>
                      {line.dimPrefix && <span style={{ color: THEME.dim }}>{line.dimPrefix}</span>}
                      {line.indent}{line.green && <span style={{ color: THEME.green }}>{line.green}</span>}
                      {line.cyan && <span style={{ color: THEME.cyan }}>{line.cyan}</span>}
                      {line.rest}
                    </>
                  )}
                </React.Fragment>
              ))}
            </div>
          </TerminalWindow>
          <div style={{ marginTop: 20, fontSize: 18, color: THEME.muted, fontFamily: MONO }}>
            {c.footer}
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
export const Re02IpAddresses: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-02-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-02-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re-02-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
