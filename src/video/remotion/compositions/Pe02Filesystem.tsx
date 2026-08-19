// ── video/remotion/compositions/Pe02Filesystem.tsx ─────────────────
// Video: comparación del filesystem. Linux a la izquierda, Windows a la
// derecha. Con audio de la voz "Miguel". Escenas 2 y 3 fusionadas en una
// sola escena continua: el árbol de Linux se ve completo con un rectángulo
// que rodea cada palabra mientras el narrador la menciona, y cuando pasa a
// Windows el árbol crece al lado (sin corte ni cambio de escena), también
// con resaltado por palabra.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS, SCENE_GAP } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TreeView } from '../primitives/TreeView';
import type { TreeItem } from '../primitives/TreeView';

const LINUX_TREE: TreeItem[] = [
  {
    label: '/',
    icon: '🌱',
    desc: 'la raíz: todo cuelga de aquí',
    color: THEME.green,
    children: [
      { label: 'etc', icon: '⚙️', color: THEME.green, desc: 'configuración', children: [
        { label: 'passwd', icon: '🔑', color: THEME.green, desc: 'usuarios' },
      ] },
      { label: 'home', icon: '👤', color: THEME.green, desc: 'usuarios' },
      { label: 'root', icon: '👑', color: THEME.green, desc: 'home de root' },
      { label: 'var', icon: '🗃️', color: THEME.green, children: [
        { label: 'www', icon: '🌐', color: THEME.green, desc: 'sitios web' },
        { label: 'log', icon: '📋', color: THEME.green, desc: 'logs' },
      ] },
      { label: 'tmp', icon: '⏳', color: THEME.green, desc: 'temporal' },
    ],
  },
];

const WINDOWS_TREE: TreeItem[] = [
  {
    label: 'C:\\',
    icon: '💽',
    desc: 'el disco: otro mundo, otra raíz',
    color: THEME.cyan,
    children: [
      { label: 'Windows', icon: '🪟', color: THEME.cyan, desc: 'el SO', children: [
        { label: 'System32', icon: '⚙️', color: THEME.cyan, desc: 'núcleo' },
        { label: 'Temp', icon: '⏳', color: THEME.cyan, desc: 'temporal' },
      ] },
      { label: 'Users', icon: '👤', color: THEME.cyan, desc: 'usuarios' },
      { label: 'Program Files', icon: '📦', color: THEME.cyan, desc: 'programas' },
      { label: 'inetpub', icon: '🌐', color: THEME.cyan, children: [
        { label: 'wwwroot', icon: '🗃️', color: THEME.cyan, desc: 'web IIS' },
      ] },
    ],
  },
];

// Palabras que el narrador menciona y cuándo (segundos desde el inicio de
// la narración de cada árbol), medidas con silencedetect fino (-50dB, voz
// Miguel) y alineadas por segmento de habla:
// Linux: 'la raíz' ~2.7 · 'etc' ~3.5 · 'home' ~7.5 · 'root' ~10.0 ·
//        'var doble u' (www) ~12.4 · 'var barra log' (log) ~14.7
const LINUX_HIGHLIGHTS = [
  { label: '/', at: 2.7 },
  { label: 'etc', at: 3.5 },
  { label: 'home', at: 7.4 },
  { label: 'root', at: 10.0 },
  { label: 'www', at: 12.4 },
  { label: 'log', at: 15.0 },
];
// Windows: 'un árbol por cada disco' (C:\) ~2.2 · 'Windows' ~4.4 ·
//          'Users' ~7.0 · 'Program Files' ~9.8 · 'inetpub' ~12.2 ·
//          'wwwroot' ~12.45 · 'System 32' ~14.6
const WINDOWS_HIGHLIGHTS = [
  { label: 'C:\\', at: 2.4 },
  { label: 'Windows', at: 4.4 },
  { label: 'Users', at: 7.3 },
  { label: 'Program Files', at: 9.7 },
  { label: 'inetpub', at: 12.2 },
  { label: 'wwwroot', at: 12.45 },
  { label: 'System32', at: 14.6 },
];

interface HState {
  cur: string | null;
  highlighted: string[];
  startSec: number;
}

// Última palabra mencionada a tiempo t: queda como `cur` (glow) y las
// anteriores como `highlighted` (caja sutil persistente).
function highlightState(words: { label: string; at: number }[], t: number): HState {
  let cur: string | null = null;
  let lastAt = 0;
  for (const w of words) {
    if (t >= w.at) {
      cur = w.label;
      lastAt = w.at;
    }
  }
  const highlighted = cur === null ? [] : words.filter(w => w.at < lastAt).map(w => w.label);
  return { cur, highlighted, startSec: lastAt };
}

const NONE: HState = { cur: null, highlighted: [], startSec: 0 };

// ── Escena 4: cierre — panel de resumen con rutas por sistema ─────
// Cada ruta aparece en su caja cuando el narrador la menciona.
// Linux: '/etc' ~3.3 · '/home' ~4.3 · '/var/www' ~6.4
// Windows: 'C:\\Windows' ~8.5 · 'C:\\Users' ~9.4 · 'C:\\inetpub' ~11.7
const CLOSING_LINUX = [
  { path: '/etc', icon: '⚙️', desc: 'configuración', at: 3.3 },
  { path: '/home', icon: '👤', desc: 'usuarios', at: 4.3 },
  { path: '/var/www', icon: '🌐', desc: 'sitios web', at: 6.4 },
];
const CLOSING_WINDOWS = [
  { path: 'C:\\Windows', icon: '🪟', desc: 'el sistema', at: 8.5 },
  { path: 'C:\\Users', icon: '👤', desc: 'perfiles', at: 9.4 },
  { path: 'C:\\inetpub', icon: '🌐', desc: 'web IIS', at: 11.9 },
];

const ClosingPathCard: React.FC<{ path: string; icon: string; desc: string; at: number; color: string; fps: number }> = ({
  path, icon, desc, at, color, fps,
}) => {
  const frame = useCurrentFrame();
  const delay = Math.round(at * fps);
  const opacity = interpolate(frame - delay, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const pop = interpolate(frame - delay, [0, 10], [0.85, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{ opacity, transform: `scale(${pop})`, transformOrigin: 'left center' }}>
      <span style={{
        display: 'inline-block',
        padding: '7px 14px',
        borderRadius: 9,
        border: `1.5px solid ${color}`,
        background: color + '1f',
        boxShadow: `0 0 16px ${color}33`,
        fontSize: 23,
        color,
        fontWeight: 700,
        fontFamily: MONO,
      }}>
        {icon} {path}
      </span>
      <span style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginLeft: 12 }}>{desc}</span>
    </div>
  );
};

const ClosingScene: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
        <div style={{ opacity: titleIn, transform: `translateY(${(1 - Math.min(1, frame / 14)) * 18}px)` }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: THEME.text, fontFamily: MONO, lineHeight: 1.2 }}>
            CUANDO ENTRES A UN SISTEMA,
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginTop: 8 }}>
            SABÉ DÓNDE MIRAR
          </div>
        </div>

        <div style={{ display: 'flex', gap: 60, marginTop: 44 }}>
          {/* Columna Linux */}
          <div style={{ textAlign: 'left', minWidth: 300 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 18 }}>
              🐧 LINUX
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CLOSING_LINUX.map(c => (
                <ClosingPathCard key={c.path} {...c} color={THEME.green} fps={fps} />
              ))}
            </div>
          </div>

          {/* Columna Windows */}
          <div style={{ textAlign: 'left', minWidth: 300 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 18 }}>
              🪟 WINDOWS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {CLOSING_WINDOWS.map(c => (
                <ClosingPathCard key={c.path} {...c} color={THEME.cyan} fps={fps} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 90, right: 90, textAlign: 'center', fontSize: 20, color: THEME.muted, fontFamily: MONO, opacity: titleIn }}>
        conocer el mapa de cada sistema es saber dónde va a estar la información
      </div>
    </AbsoluteFill>
  );
};

// ── Escena central (Linux completo + Windows crece al lado) ────────
const MergedScene: React.FC<{ fps: number; s2: number }> = ({ fps, s2 }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const s3Start = s2 + SCENE_GAP; // el narrador pasa a Windows
  const s3Frame = Math.round(s3Start * fps);
  const transDur = 0.9;
  const p = interpolate(t, [s3Start, s3Start + transDur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const linuxW = interpolate(p, [0, 1], [100, 52]);
  const winW = interpolate(p, [0, 1], [0, 46]);
  const winOp = p;
  const winX = interpolate(p, [0, 1], [70, 0]);
  const dividerOp = p;
  const linuxFont = Math.round(interpolate(p, [0, 1], [21, 16]));
  const linuxHeader = Math.round(interpolate(p, [0, 1], [30, 24]));

  const inWin = t >= s3Start;
  const lh: HState = inWin
    ? { cur: null, highlighted: LINUX_HIGHLIGHTS.map(w => w.label), startSec: 0 }
    : highlightState(LINUX_HIGHLIGHTS, t);
  const wh: HState = inWin ? highlightState(WINDOWS_HIGHLIGHTS, t - s3Start) : NONE;

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', gap: 24, height: '100%', padding: '0 60px' }}>
        {/* Linux: se queda en pantalla todo el tiempo */}
        <div style={{ width: `${linuxW}%`, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: linuxHeader, color: THEME.green, fontWeight: 700, fontFamily: MONO, marginBottom: 22 }}>
            🐧 Linux
          </div>
          <TreeView
            items={LINUX_TREE}
            start={0}
            framesPerRow={10}
            fontSize={linuxFont}
            highlight={lh.cur}
            highlightStart={Math.round(lh.startSec * fps)}
            highlighted={lh.highlighted}
          />
        </div>

        {/* Divisor */}
        <div style={{ width: 2, background: THEME.border, opacity: dividerOp, alignSelf: 'stretch' }} />

        {/* Windows: crece al lado, misma escena */}
        <div style={{
          width: `${winW}%`, minWidth: 0, opacity: winOp, transform: `translateX(${winX}px)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 24, color: THEME.cyan, fontWeight: 700, fontFamily: MONO, marginBottom: 22 }}>
            🪟 Windows
          </div>
          <TreeView
            items={WINDOWS_TREE}
            start={s3Frame}
            framesPerRow={7}
            fontSize={16}
            highlight={wh.cur}
            highlightStart={Math.round((s3Start + wh.startSec) * fps)}
            highlighted={wh.highlighted}
          />
        </div>
      </div>

      {/* Footer: cruza del pie de Linux al de Windows */}
      <div style={{ position: 'absolute', bottom: 40, left: 90, right: 90, textAlign: 'center', fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
        <div style={{ opacity: 1 - p }}>
          Un solo árbol desde <span style={{ color: THEME.green }}>/</span> — cada cosa tiene su lugar
        </div>
        <div style={{ opacity: p, marginTop: -24 }}>
          Un árbol por disco: <span style={{ color: THEME.cyan }}>C:\</span>, <span style={{ color: THEME.cyan }}>D:\</span>...
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Pe02Filesystem: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['pe-02-filesystem'];
  const starts = sceneStartFrames('pe-02-filesystem', fps);
  const dur1 = Math.ceil(s1 * fps);
  const mergedDur = Math.ceil((s2 + SCENE_GAP + s3) * fps);
  const s3Frame = Math.round((s2 + SCENE_GAP) * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: Título */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/pe-02-filesystem/pe-02-scene1.wav')} />
        <TitleScene title="DOS MUNDOS, DOS MAPAS" subtitle="Linux y Windows organizan todo distinto" />
      </Sequence>

      {/* Escena central: Linux con resaltados + Windows crece al lado (misma escena) */}
      <Sequence from={starts[1]} durationInFrames={mergedDur}>
        <Sequence from={0} durationInFrames={Math.ceil(s2 * fps)}>
          <Audio src={staticFile('videos/audio/pe-02-filesystem/pe-02-scene2.wav')} />
        </Sequence>
        <Sequence from={s3Frame} durationInFrames={dur3}>
          <Audio src={staticFile('videos/audio/pe-02-filesystem/pe-02-scene3.wav')} />
        </Sequence>
        <MergedScene fps={fps} s2={s2} />
      </Sequence>

      {/* Scene 4: Cierre — panel de resumen con rutas por sistema */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/pe-02-filesystem/pe-02-scene4.wav')} />
        <ClosingScene fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
