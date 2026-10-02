// ── video/remotion/compositions/Ot01AlternativeSystems.tsx ──────────
// Video: sistemas alternativos de PC y servidores — macOS (Unix certificado),
// la familia BSD (FreeBSD/OpenBSD/NetBSD) y ChromeOS (kernel Linux).
// Versión unificada ES/EN con `lang` prop.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
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
      title: <>FUERA DE LINUX Y WINDOWS: <span style={{ color: THEME.amber }}>EL TERCER MUNDO</span></>,
      subtitle: 'macOS · la familia BSD · ChromeOS',
      labelRouters: 'routers y firewalls',
      caption: <>no son mayoría en servidores,<br />pero los vas a encontrar en el camino</>,
    },
    s2: {
      heading: <>macOS: <span style={{ color: THEME.amber }}>UNIX CERTIFICADO</span> con acabado Apple</>,
      macPoints: [
        { text: 'núcleo de BSD · Unix certificado', at: 2.5 },
        { text: 'shell por defecto: zsh', at: 4.6 },
        { text: '/Users en vez de /home', at: 6.5 },
        { text: '/etc, /tmp y /var existen igual', at: 9.5 },
        { text: 'launchd en vez de systemd', at: 16.5 },
        { text: 'configs en archivos .plist', at: 18.5 },
        { text: 'SIP + Gatekeeper limitan qué tocás', at: 22 },
      ],
    },
    s3: {
      heading: <>LA FAMILIA <span style={{ color: THEME.cyan }}>BSD</span>: el Unix de Berkeley</>,
      tableHeader1: 'VERSIÓN',
      tableHeader2: 'LO VAS A ENCONTRAR EN',
      bsdRows: [
        { v: 'FreeBSD', d: 'servidores y appliances', color: THEME.cyan },
        { v: 'OpenBSD', d: 'la más auditada', color: THEME.amber },
        { v: 'NetBSD', d: 'portable a todo', color: THEME.purple },
      ],
      placeRows: [
        { v: 'routers', d: null },
        { v: 'firewalls', d: 'pfSense · OPNSense' },
        { v: 'appliances', d: 'VPN' },
        { v: 'NAS', d: null },
      ],
      footer1: 'misma filosofía que Linux: CLI, permisos, archivos',
      footer2: 'licencia permisiva: tomás el código sin compartir tus cambios',
    },
    s4: {
      heading: <>ChromeOS: <span style={{ color: THEME.green }}>EL NAVEGADOR COMO SISTEMA</span></>,
      chromePoints: [
        { text: 'kernel Linux · Chrome como toda la interfaz', at: 2 },
        { text: 'todo vive en la nube', at: 7 },
        { text: 'variantes: ChromiumOS, ChromeOS Flex, apps Android', at: 9.5 },
        { text: 'contenedor Linux real con terminal y apt', at: 16 },
      ],
      terminalTitle: 'uname -s en tres sistemas',
      commentFreeBSD: '# en FreeBSD',
      commentMacOS: '# en macOS',
      commentChromeOS: '# en ChromeOS',
      closeTitle: <>TRES RESPUESTAS, <span style={{ color: THEME.cyan }}>UNA FAMILIA</span></>,
      closeSubtitle: 'todos de la familia Unix',
    },
  },
  en: {
    s1: {
      title: <>BEYOND LINUX AND WINDOWS: <span style={{ color: THEME.amber }}>THE THIRD WORLD</span></>,
      subtitle: 'macOS · the BSD family · ChromeOS',
      labelRouters: 'routers and firewalls',
      caption: <>they're not the majority on servers,<br />but you'll run into them along the way</>,
    },
    s2: {
      heading: <>macOS: <span style={{ color: THEME.amber }}>CERTIFIED UNIX</span> with an Apple finish</>,
      macPoints: [
        { text: 'certified Unix · core from BSD', at: 1.9 },
        { text: 'default shell: zsh', at: 5.6 },
        { text: '/Users instead of /home', at: 8.6 },
        { text: '/etc, /tmp and /var exist just like Linux', at: 10.0 },
        { text: 'launchd instead of systemd', at: 16.6 },
        { text: 'configs are .plist files', at: 19.8 },
        { text: 'SIP + Gatekeeper limit what you touch', at: 24.1 },
      ],
    },
    s3: {
      heading: <>THE <span style={{ color: THEME.cyan }}>BSD</span> FAMILY: Berkeley's Unix</>,
      tableHeader1: 'VERSION',
      tableHeader2: "YOU'LL FIND IT IN",
      bsdRows: [
        { v: 'FreeBSD', d: 'servers and appliances', color: THEME.cyan },
        { v: 'OpenBSD', d: 'the most audited', color: THEME.amber },
        { v: 'NetBSD', d: 'portable to everything', color: THEME.purple },
      ],
      placeRows: [
        { v: 'routers', d: null },
        { v: 'firewalls', d: 'pfSense · OPNSense' },
        { v: 'appliances', d: 'VPN' },
        { v: 'NAS', d: null },
      ],
      footer1: 'same philosophy as Linux: terminal, permissions, files',
      footer2: "more permissive license: take the code, don't share your changes",
    },
    s4: {
      heading: <>ChromeOS: <span style={{ color: THEME.green }}>THE BROWSER AS A SYSTEM</span></>,
      chromePoints: [
        { text: 'Linux kernel · Chrome as the whole interface', at: 3.2 },
        { text: 'everything lives in the cloud', at: 7.3 },
        { text: 'variants: ChromiumOS, Flex, Android apps inside', at: 9.4 },
        { text: 'a real Linux container with terminal and apt', at: 16.5 },
      ],
      terminalTitle: 'uname -s on three systems',
      commentFreeBSD: '# on FreeBSD',
      commentMacOS: '# on macOS',
      commentChromeOS: '# on ChromeOS',
      closeTitle: <>THREE ANSWERS, <span style={{ color: THEME.cyan }}>ONE FAMILY</span></>,
      closeSubtitle: 'all from the Unix family',
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { cardsAt: 4.5, captionAt: 8.5 },
    s2: { panelAt: 4.5 },
    s3: {
      bsdTimings: [5.5, 8.5, 14.5],
      placeTimings: [17.5, 19.5, 21, 22.5],
      footer1At: 23,
      footer2At: 27,
    },
    s4: { closeAt: 33, cmd1At: 25.5, cmd2At: 27.6, cmd3At: 29.9, terminalDelay: 24.5 },
  },
  en: {
    s1: { cardsAt: 5.0, captionAt: 10.4 },
    s2: { panelAt: 5.0 },
    s3: {
      bsdTimings: [6.0, 9.7, 14.7],
      placeTimings: [17.8, 19.0, 22.2, 23.9],
      footer1At: 24.9,
      footer2At: 28.6,
    },
    s4: { closeAt: 34.2, cmd1At: 27.3, cmd2At: 29.4, cmd3At: 31.6, terminalDelay: 24.5 },
  },
};

const VID = 'others-01-alternative-systems';

// ── Escena 1: el tercer mundo de los sistemas ───────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const cardsAt = Math.round(b.cardsAt * fps);
  const captionAt = Math.round(b.captionAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardsAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={cardsAt} durationInFrames={captionAt - cardsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="Mac" value="macOS" accent={THEME.amber} size={26} />
            <KeyCapsule label={c.labelRouters} value="BSD" accent={THEME.cyan} size={26} />
            <KeyCapsule label="Chromebooks" value="ChromeOS" accent={THEME.green} size={26} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO, lineHeight: 1.6 }}>
            {c.caption}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: macOS, Unix certificado ───────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2 }> = ({ fps, c }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
        {c.heading}
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 560, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
          {c.macPoints.map(p => (
            <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
          ))}
        </div>
        <TerminalWindow title="mac@laptop:~$" width={430}>
          <div style={{ fontSize: 15, whiteSpace: 'pre', lineHeight: 1.8 }}>
            <span style={{ color: THEME.green }}>mac@laptop:~$</span> uname -a
            {'\n'}Darwin <span style={{ color: THEME.dim }}>macOS 14.5</span> arm64
            {'\n'}
            {'\n'}<span style={{ color: THEME.green }}>mac@laptop:~$</span> ls /Users/
            {'\n'}miguel <span style={{ color: THEME.dim }}>shared</span>
          </div>
        </TerminalWindow>
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: la familia BSD ────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
        {c.heading}
      </div>
      <div style={{ display: 'flex', gap: 22, width: 1080 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}`, fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, textAlign: 'left' }}>
            {c.tableHeader1}
          </div>
          <div style={{ padding: '16px 20px' }}>
            {c.bsdRows.map((r, i) => (
              <RevealLine key={r.v} at={b.bsdTimings[i]} fps={fps} mark="▸" color={r.color}>
                <span style={{ fontWeight: 700 }}>{r.v}</span>
                <span style={{ color: THEME.muted }}> — {r.d}</span>
              </RevealLine>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}`, fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, textAlign: 'left' }}>
            {c.tableHeader2}
          </div>
          <div style={{ padding: '16px 20px' }}>
            {c.placeRows.map((r, i) => (
              <RevealLine key={r.v} at={b.placeTimings[i]} fps={fps} mark="▸" color={THEME.cyan}>
                <span style={{ fontWeight: 700 }}>{r.v}</span>
                {r.d && <span style={{ color: THEME.muted }}> — {r.d}</span>}
              </RevealLine>
            ))}
          </div>
        </div>
      </div>
      <RevealLine at={b.footer1At} fps={fps} mark="▸" color={THEME.text}>{c.footer1}</RevealLine>
      <RevealLine at={b.footer2At} fps={fps} mark="▸" color={THEME.green}>{c.footer2}</RevealLine>
    </AbsoluteFill>
  );
};

// ── Escena 4: ChromeOS + cierre ─────────────────────────────────────
const CmdBlock: React.FC<{ at: number; fps: number; children: React.ReactNode }> = ({ at, fps, children }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
      transform: `translateY(${(1 - enter) * 8}px)`,
      whiteSpace: 'pre',
      lineHeight: 1.8,
    }}>
      {children}
    </div>
  );
};

const Scene4: React.FC<{ fps: number; c: typeof COPY.es.s4; b: typeof BEATS.es.s4 }> = ({ fps, c, b }) => {
  const closeAt = Math.round(b.closeAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            {c.heading}
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 540, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
              {c.chromePoints.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title={c.terminalTitle} width={480} delay={Math.round(b.terminalDelay * fps)}>
              <div style={{ fontSize: 17 }}>
                <CmdBlock at={b.cmd1At} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}>{c.commentFreeBSD}</span>
                  {'\n'}<span style={{ color: THEME.cyan, fontWeight: 700 }}>FreeBSD</span>
                </CmdBlock>
                <CmdBlock at={b.cmd2At} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}>{c.commentMacOS}</span>
                  {'\n'}<span style={{ color: THEME.amber, fontWeight: 700 }}>Darwin</span>
                </CmdBlock>
                <CmdBlock at={b.cmd3At} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}>{c.commentChromeOS}</span>
                  {'\n'}<span style={{ color: THEME.green, fontWeight: 700 }}>Linux</span>
                </CmdBlock>
              </div>
            </TerminalWindow>
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
export const Ot01AlternativeSystems: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3, s4] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: el tercer mundo */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-01-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: macOS */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-01-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} />
      </Sequence>

      {/* Scene 3: BSD */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-01-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>

      {/* Scene 4: ChromeOS + cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/others-01-scene4.wav`)} />}
        <Scene4 fps={fps} c={c.s4} b={b.s4} />
      </Sequence>
    </AbsoluteFill>
  );
};
