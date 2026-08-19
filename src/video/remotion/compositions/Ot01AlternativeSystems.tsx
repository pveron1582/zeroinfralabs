// ── video/remotion/compositions/Ot01AlternativeSystems.tsx ──────────
// Video: sistemas alternativos de PC y servidores — macOS (Unix certificado),
// la familia BSD (FreeBSD/OpenBSD/NetBSD) y ChromeOS (kernel Linux).
// Con audio de la voz "Miguel" (4 escenas, ~114s).
// Syncs internos alineados a los segmentos de habla medidos con
// silencedetect (-50dB) sobre los wavs reales (2026-08-15).

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate, spring } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
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

// ── Escena 1: el tercer mundo de los sistemas ───────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const cardsAt = Math.round(4.5 * fps);
  const captionAt = Math.round(8.5 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={cardsAt}>
        <TitleScene
          title={<>FUERA DE LINUX Y WINDOWS: <span style={{ color: THEME.amber }}>EL TERCER MUNDO</span></>}
          subtitle="macOS · la familia BSD · ChromeOS"
        />
      </Sequence>
      <Sequence from={cardsAt} durationInFrames={captionAt - cardsAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 18 }}>
            <KeyCapsule label="Mac" value="macOS" accent={THEME.amber} size={26} />
            <KeyCapsule label="routers y firewalls" value="BSD" accent={THEME.cyan} size={26} />
            <KeyCapsule label="Chromebooks" value="ChromeOS" accent={THEME.green} size={26} />
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={captionAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 22, color: THEME.muted, fontFamily: MONO, lineHeight: 1.6 }}>
            no son mayoría en servidores,
            <br />pero los vas a encontrar en el camino
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: macOS, Unix certificado ───────────────────────────────
// Habla (voz Miguel): 'Unix certificado / núcleo de BSD' ~2.5 ·
// 'shell zsh' ~4.6 · '/Users' ~6.5 · '/etc /tmp /var' ~9.5 ·
// 'launchd' ~16.5 · 'plist' ~18.5 · 'SIP + Gatekeeper' ~22
const MAC_POINTS = [
  { text: 'núcleo de BSD · Unix certificado', at: 2.5 },
  { text: 'shell por defecto: zsh', at: 4.6 },
  { text: '/Users en vez de /home', at: 6.5 },
  { text: '/etc, /tmp y /var existen igual', at: 9.5 },
  { text: 'launchd en vez de systemd', at: 16.5 },
  { text: 'configs en archivos .plist', at: 18.5 },
  { text: 'SIP + Gatekeeper limitan qué tocás', at: 22 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
        macOS: <span style={{ color: THEME.amber }}>UNIX CERTIFICADO</span> con acabado Apple
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ width: 560, background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
          {MAC_POINTS.map(p => (
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
// Habla (voz Miguel): 'FreeBSD' ~5.5 · 'OpenBSD la más auditada' ~8.5 ·
// 'NetBSD portable' ~14.5 · 'routers / pfSense y OPNSense / VPN / NAS'
// ~17.5-22.5 · 'misma filosofía que Linux' ~23 · 'licencia permisiva' ~27
// Pantalla fija: tabla "VERSIÓN" + tabla "LO VAS A ENCONTRAR EN".
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const bsdRows = [
    { v: 'FreeBSD', d: 'servidores y appliances', at: 5.5, color: THEME.cyan },
    { v: 'OpenBSD', d: 'la más auditada', at: 8.5, color: THEME.amber },
    { v: 'NetBSD', d: 'portable a todo', at: 14.5, color: THEME.purple },
  ];
  const placeRows = [
    { v: 'routers', d: null, at: 17.5 },
    { v: 'firewalls', d: 'pfSense · OPNSense', at: 19.5 },
    { v: 'appliances', d: 'VPN', at: 21 },
    { v: 'NAS', d: null, at: 22.5 },
  ];
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 26 }}>
        LA FAMILIA <span style={{ color: THEME.cyan }}>BSD</span>: el Unix de Berkeley
      </div>
      <div style={{ display: 'flex', gap: 22, width: 1080 }}>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}`, fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, textAlign: 'left' }}>
            VERSIÓN
          </div>
          <div style={{ padding: '16px 20px' }}>
            {bsdRows.map(r => (
              <RevealLine key={r.v} at={r.at} fps={fps} mark="▸" color={r.color}>
                <span style={{ fontWeight: 700 }}>{r.v}</span>
                <span style={{ color: THEME.muted }}> — {r.d}</span>
              </RevealLine>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, background: THEME.panel, border: `1px solid ${THEME.cyan}50`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', background: THEME.bgAlt, borderBottom: `1px solid ${THEME.border}`, fontSize: 20, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, textAlign: 'left' }}>
            LO VAS A ENCONTRAR EN
          </div>
          <div style={{ padding: '16px 20px' }}>
            {placeRows.map(r => (
              <RevealLine key={r.v} at={r.at} fps={fps} mark="▸" color={THEME.cyan}>
                <span style={{ fontWeight: 700 }}>{r.v}</span>
                {r.d && <span style={{ color: THEME.muted }}> — {r.d}</span>}
              </RevealLine>
            ))}
          </div>
        </div>
      </div>
      <RevealLine at={23} fps={fps} mark="▸" color={THEME.text}>misma filosofía que Linux: CLI, permisos, archivos</RevealLine>
      <RevealLine at={27} fps={fps} mark="▸" color={THEME.green}>licencia permisiva: tomás el código sin compartir tus cambios</RevealLine>
    </AbsoluteFill>
  );
};

// ── Escena 4: ChromeOS + cierre ─────────────────────────────────────
// Habla (voz Miguel): 'kernel Linux + Chrome' ~2 · 'todo vive en la nube' ~7 ·
// 'variantes' ~9.5 · 'contenedor Linux' ~16 · 'si escribís uname: FreeBSD →
// FreeBSD, macOS → Darwin, ChromeOS → Linux' ~25-33 · 'tres sistemas, una
// familia' ~33. La terminal revela cada comando al ritmo de la narración.
const CHROME_POINTS = [
  { text: 'kernel Linux · Chrome como toda la interfaz', at: 2 },
  { text: 'todo vive en la nube', at: 7 },
  { text: 'variantes: ChromiumOS, ChromeOS Flex, apps Android', at: 9.5 },
  { text: 'contenedor Linux real con terminal y apt', at: 16 },
];

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

const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const closeAt = Math.round(33 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={closeAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 28 }}>
            ChromeOS: <span style={{ color: THEME.green }}>EL NAVEGADOR COMO SISTEMA</span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 540, background: THEME.panel, border: `1px solid ${THEME.green}60`, borderRadius: 14, padding: '22px 22px', textAlign: 'left' }}>
              {CHROME_POINTS.map(p => (
                <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.green}>{p.text}</RevealLine>
              ))}
            </div>
            <TerminalWindow title="uname -s en tres sistemas" width={480} delay={Math.round(24.5 * fps)}>
              <div style={{ fontSize: 17 }}>
                <CmdBlock at={25.5} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}># en FreeBSD</span>
                  {'\n'}<span style={{ color: THEME.cyan, fontWeight: 700 }}>FreeBSD</span>
                </CmdBlock>
                <CmdBlock at={27.6} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}># en macOS</span>
                  {'\n'}<span style={{ color: THEME.amber, fontWeight: 700 }}>Darwin</span>
                </CmdBlock>
                <CmdBlock at={29.9} fps={fps}>
                  {'\n'}<span style={{ color: THEME.green }}>$</span> uname -s <span style={{ color: THEME.dim }}># en ChromeOS</span>
                  {'\n'}<span style={{ color: THEME.green, fontWeight: 700 }}>Linux</span>
                </CmdBlock>
              </div>
            </TerminalWindow>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={closeAt}>
        <TitleScene
          title={<>TRES RESPUESTAS, <span style={{ color: THEME.cyan }}>UNA FAMILIA</span></>}
          subtitle="todos de la familia Unix"
        />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Ot01AlternativeSystems: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['ot-01-alternative-systems'];
  const starts = sceneStartFrames('ot-01-alternative-systems', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: el tercer mundo */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/ot-01-alternative-systems/ot-01-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: macOS */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/ot-01-alternative-systems/ot-01-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: BSD */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/ot-01-alternative-systems/ot-01-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: ChromeOS + cierre */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/ot-01-alternative-systems/ot-01-scene4.wav')} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};