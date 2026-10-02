// ── video/remotion/compositions/Re2Dhcp.tsx ──────────────────────────
// Video: DHCP — el servicio que reparte las direcciones IP.
// Lección networksII-01 del Academy (Redes II). Guiones: voicebox-scripts/re2-01-*.txt
// Audio real cargado: timings de audioTimings.ts; syncs internos alineados
// a silencedetect (-50dB) de voicebox-scripts/re2-01-scene*.wav.
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
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
      title: <>EL QUE <span style={{ color: THEME.cyan }}>REPARTE</span> LAS IP</>,
      subtitle: 'DHCP — Dynamic Host Configuration Protocol',
      heading: <>TE DA <span style={{ color: THEME.cyan }}>TODO</span> AL CONECTARTE</>,
      labels: ['IP', 'MÁSCARA', 'GATEWAY', 'DNS'],
      points: [
        { mark: '🔑', color: THEME.amber, text: 'alquileres: te presta la IP y la renueva antes de vencer' },
        { mark: '▸', color: THEME.cyan, text: 'sin él: todo configurado a mano' },
      ],
    },
    s2: {
      heading: <>EL HANDSHAKE: <span style={{ color: THEME.cyan }}>DORA</span></>,
      dora: [
        { letter: 'D', name: 'DISCOVER', color: THEME.cyan, desc: 'el cliente grita al broadcast: ¿hay DHCP?' },
        { letter: 'O', name: 'OFFER', color: THEME.green, desc: 'el servidor ofrece una IP libre' },
        { letter: 'R', name: 'REQUEST', color: THEME.amber, desc: 'el cliente acepta esa oferta' },
        { letter: 'A', name: 'ACK', color: THEME.purple, desc: 'el servidor confirma y firma el alquiler' },
      ],
      footer: 'todo por UDP · puertos 67 y 68 · en segundos',
    },
    s3: {
      staticHeading: <>SI NADIE RESPONDE → <span style={{ color: THEME.amber }}>IP ESTÁTICA</span> vs <span style={{ color: THEME.cyan }}>DHCP</span></>,
      staticLabel: 'IP ESTÁTICA',
      staticPoints: [
        { at: 0, mark: '▸', color: THEME.amber, text: 'si nadie responde → configurar a mano' },
        { at: 5.2, mark: '▸', color: THEME.amber, text: 'estable · predecible · servidores / impresoras / routers' },
        { at: 9.7, mark: '✗', color: THEME.red, text: 'no escala: 300 PCs a mano' },
      ],
      dhcpLabel: 'DHCP',
      dhcpPoints: [
        { at: 13.06, mark: '✓', color: THEME.cyan, text: 'automático · escala solo' },
        { at: 15.58, mark: '▸', color: THEME.cyan, text: 'pero depende de un servicio' },
        { at: 17.28, mark: '⚠️', color: THEME.red, text: 'y acá está el problema: no autentica a los servidores' },
      ],
      rogueHeading: <>DHCP NO AUTENTICA: <span style={{ color: THEME.red }}>ROGUE DHCP</span></>,
      rogueLines: [
        { at: 0, span: <span style={{ color: THEME.cyan }}>DHCPDISCOVER</span>, rest: ' on eth0 to 255.255.255.255' },
        { at: 3.6, span: <span style={{ color: THEME.green }}>DHCPOFFER</span>, rest: ' of 192.168.1.34 from ', red: '192.168.1.99 (falso)' },
        { at: 4.4, span: <span style={{ color: THEME.amber }}>DHCPREQUEST</span>, rest: ' for 192.168.1.34' },
        { at: 5.4, span: <span style={{ color: THEME.purple }}>DHCPACK</span>, rest: ' of 192.168.1.34 from ', red: '192.168.1.99' },
        { at: 6.6, dim: true, text: 'bound to 192.168.1.34 -- renewal in 3600 seconds' },
        { at: 7.3, dim: true, text: 'routers (gateway)   : ', red: '192.168.1.99' },
        { at: 7.9, dim: true, text: 'dns nameservers     : ', red: '192.168.1.99' },
      ],
      points: [
        { at: 6.6, mark: '🕳️', color: THEME.red, text: 'un servidor falso reparte gateway/DNS maliciosos → MITM sin pelear por ARP' },
        { at: 8.8, mark: '🛡️', color: THEME.green, text: 'defensa: DHCP snooping (solo puertos autorizados)' },
      ],
      closeTitle: <>DHCP = <span style={{ color: THEME.cyan }}>MAGIA</span> QUE HAY QUE VIGILAR</>,
      closeSubtitle: 'reparte IPs · y a veces, a manos equivocadas',
    },
  },
  en: {
    s1: {
      title: <>THE ONE THAT <span style={{ color: THEME.cyan }}>HANDS OUT</span> IPs</>,
      subtitle: 'DHCP — Dynamic Host Configuration Protocol',
      heading: <>IT GIVES YOU <span style={{ color: THEME.cyan }}>EVERYTHING</span> ON CONNECT</>,
      labels: ['IP', 'NETMASK', 'GATEWAY', 'DNS'],
      points: [
        { mark: '🔑', color: THEME.amber, text: 'leases: it lends the IP and renews before it expires' },
        { mark: '▸', color: THEME.cyan, text: 'without it: everything configured by hand' },
      ],
    },
    s2: {
      heading: <>THE HANDSHAKE: <span style={{ color: THEME.cyan }}>DORA</span></>,
      dora: [
        { letter: 'D', name: 'DISCOVER', color: THEME.cyan, desc: 'the client shouts to the broadcast: any DHCP here?' },
        { letter: 'O', name: 'OFFER', color: THEME.green, desc: 'the server answers by offering a free IP' },
        { letter: 'R', name: 'REQUEST', color: THEME.amber, desc: 'the client accepts and formally asks for that offer' },
        { letter: 'A', name: 'ACK', color: THEME.purple, desc: 'the server confirms and signs the lease' },
      ],
      footer: 'all over UDP · ports 67 and 68 · in seconds',
    },
    s3: {
      staticHeading: <>IF NOBODY ANSWERS → <span style={{ color: THEME.amber }}>STATIC IP</span> VS <span style={{ color: THEME.cyan }}>DHCP</span></>,
      staticLabel: 'STATIC IP',
      staticPoints: [
        { at: 3.0, mark: '▸', color: THEME.amber, text: 'if nobody answers → configure by hand' },
        { at: 6.3, mark: '▸', color: THEME.amber, text: 'stable · predictable · servers / printers / routers' },
        { at: 11.1, mark: '✗', color: THEME.red, text: "doesn't scale: 300 PCs written by hand" },
      ],
      dhcpLabel: 'DHCP',
      dhcpPoints: [
        { at: 14.8, mark: '✓', color: THEME.cyan, text: 'automatic · scales on its own' },
        { at: 17.5, mark: '▸', color: THEME.cyan, text: 'but it depends on a service' },
        { at: 19.2, mark: '⚠️', color: THEME.red, text: "and here's the problem: it doesn't authenticate servers" },
      ],
      rogueHeading: <>DHCP DOESN'T AUTHENTICATE: <span style={{ color: THEME.red }}>ROGUE DHCP</span></>,
      rogueLines: [
        { at: 0, span: <span style={{ color: THEME.cyan }}>DHCPDISCOVER</span>, rest: ' on eth0 to 255.255.255.255' },
        { at: 2.2, span: <span style={{ color: THEME.green }}>DHCPOFFER</span>, rest: ' of 192.168.1.34 from ', red: '192.168.1.99 (rogue)' },
        { at: 3.0, span: <span style={{ color: THEME.amber }}>DHCPREQUEST</span>, rest: ' for 192.168.1.34' },
        { at: 3.8, span: <span style={{ color: THEME.purple }}>DHCPACK</span>, rest: ' of 192.168.1.34 from ', red: '192.168.1.99' },
        { at: 4.6, dim: true, text: 'bound to 192.168.1.34 -- renewal in 3600 seconds' },
        { at: 5.2, dim: true, text: 'routers (gateway)   : ', red: '192.168.1.99' },
        { at: 5.8, dim: true, text: 'dns nameservers     : ', red: '192.168.1.99' },
      ],
      points: [
        { at: 4.6, mark: '🕳️', color: THEME.red, text: 'a rogue server hands out malicious gateway/DNS → MITM without fighting over ARP' },
        { at: 8.4, mark: '🛡️', color: THEME.green, text: 'defense: DHCP snooping (authorized ports only)' },
      ],
      closeTitle: <>DHCP = <span style={{ color: THEME.cyan }}>MAGIC</span> WORTH WATCHING</>,
      closeSubtitle: 'hands out IPs · and sometimes, to the wrong hands',
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    s1: { panelAt: 7.34, pieces: [0, 0, 0, 0], points: [3.87, 9.7] },
    s2: { dora: [6.39, 8.79, 13.38, 17.57] },
    s3: { rogueAt: 20.9, closeAt: 32.1, termLines: [0, 3.6, 4.4, 5.4, 6.6, 7.3, 7.9] },
  },
  en: {
    s1: { panelAt: 8.2, pieces: [3.9, 4.7, 5.4, 6.1], points: [7.1, 12.6] },
    s2: { dora: [8.5, 13.7, 17.5, 21.5] },
    s3: { rogueAt: 19.2, closeAt: 31.8, termLines: [0, 2.2, 3.0, 3.8, 4.6, 5.2, 5.8] },
  },
};

const PIECE_COLORS = [THEME.cyan, THEME.green, THEME.amber, THEME.purple];
const VID = 're2-01-dhcp';

// ── Scene 1: qué es y qué hace ────────────────────────────────────
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
          <div style={{ display: 'flex', gap: 16, width: 980, justifyContent: 'center' }}>
            {c.labels.map((label, i) => (
              <div key={label} style={{
                background: THEME.panel, border: `1px solid ${PIECE_COLORS[i]}60`, borderRadius: 14,
                padding: '20px 22px', textAlign: 'center', width: 200,
              }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: PIECE_COLORS[i], fontFamily: MONO }}>
                  <RevealLine at={b.pieces[i]} fps={fps} mark="" color={PIECE_COLORS[i]}>{label}</RevealLine>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '18px 26px', width: 860, textAlign: 'left', marginTop: 24 }}>
            {c.points.map((p, i) => (
              <RevealLine key={i} at={b.points[i]} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: DORA ─────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => (
  <AbsoluteFill style={CENTERED}>
    <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
      {c.heading}
    </div>
    <div style={{ display: 'flex', gap: 16, width: 1120 }}>
      {c.dora.map((d, i) => (
        <div key={d.letter} style={{
          flex: 1, background: THEME.panel, border: `1px solid ${d.color}60`, borderRadius: 16,
          padding: '20px 16px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: d.color, fontFamily: MONO, marginBottom: 6 }}>
            <RevealLine at={b.dora[i]} fps={fps} mark="" color={d.color}>{d.letter}</RevealLine>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: THEME.text, fontFamily: MONO }}>{d.name}</div>
          <div style={{ fontSize: 13, color: THEME.muted, fontFamily: MONO, marginTop: 8, lineHeight: 1.5 }}>{d.desc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 24, fontSize: 16, color: THEME.muted, fontFamily: MONO }}>
      {c.footer}
    </div>
  </AbsoluteFill>
);

// ── Scene 3: estática vs DHCP + rogue DHCP + cierre ───────────────
const TermRow: React.FC<{ at: number; fps: number; children: React.ReactNode }> = ({ at, fps, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f - Math.round(at * fps), [0, 8], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return <div style={{ opacity: o, whiteSpace: 'pre' }}>{children}</div>;
};

const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const rogueAt = Math.round(b.rogueAt * fps);
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill>
          <Sequence from={0} durationInFrames={rogueAt}>
            <AbsoluteFill style={CENTERED}>
              <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 22 }}>
                {c.staticHeading}
              </div>
              <div style={{ display: 'flex', gap: 20, width: 1040 }}>
                <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderTop: `5px solid ${THEME.amber}`, borderRadius: 12, padding: '22px 20px', textAlign: 'left' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 10 }}>{c.staticLabel}</div>
                  {c.staticPoints.map((p, i) => (
                    <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
                  ))}
                </div>
                <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderTop: `5px solid ${THEME.cyan}`, borderRadius: 12, padding: '22px 20px', textAlign: 'left' }}>
                  <div style={{ fontSize: 19, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 10 }}>{c.dhcpLabel}</div>
                  {c.dhcpPoints.map((p, i) => (
                    <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
                  ))}
                </div>
              </div>
            </AbsoluteFill>
          </Sequence>
          <Sequence from={rogueAt}>
            <AbsoluteFill style={CENTERED}>
              <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 18 }}>
                {c.rogueHeading}
              </div>
              <TerminalWindow title="kali@attacker-01:~$ dhclient -v eth0" width={780} delay={0}>
                <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                  {c.rogueLines.map((line, i) => (
                    <TermRow key={i} at={b.termLines[i]} fps={fps}>
                      {line.dim ? (
                        <span style={{ color: THEME.dim }}>{line.text}{line.red && <span style={{ color: THEME.red }}>{line.red}</span>}</span>
                      ) : (
                        <>{line.span}{line.rest}{line.red && <span style={{ color: THEME.red }}>{line.red}</span>}</>
                      )}
                    </TermRow>
                  ))}
                </div>
              </TerminalWindow>
              <div style={{ width: 880, textAlign: 'left', marginTop: 16 }}>
                {c.points.map((p, i) => (
                  <RevealLine key={i} at={p.at} fps={fps} mark={p.mark} color={p.color}>{p.text}</RevealLine>
                ))}
              </div>
            </AbsoluteFill>
          </Sequence>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene title={c.closeTitle} subtitle={c.closeSubtitle} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Re2Dhcp: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/re2-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
