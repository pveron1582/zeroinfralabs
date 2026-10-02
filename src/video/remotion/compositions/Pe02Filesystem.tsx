// ── video/remotion/compositions/Pe02Filesystem.tsx ─────────────────
// Video: comparación del filesystem. Linux a la izquierda, Windows a la derecha.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, audioTimings, SCENE_GAP, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TreeView } from '../primitives/TreeView';
import type { TreeItem } from '../primitives/TreeView';

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: { title: 'DOS MUNDOS, DOS MAPAS', subtitle: 'Linux y Windows organizan todo distinto' },
    s2: {
      linuxDescs: {
        root: 'la raíz: todo cuelga de aquí',
        etc: 'configuración',
        passwd: 'usuarios',
        homeUsers: 'usuarios',
        rootHome: 'home de root',
        www: 'sitios web',
        log: 'logs',
        tmp: 'temporal',
      },
      windowsDescs: {
        drive: 'el disco: otro mundo, otra raíz',
        os: 'el SO',
        core: 'núcleo',
        temp: 'temporal',
        users: 'usuarios',
        programs: 'programas',
        iis: 'web IIS',
      },
      linuxHeader: '🐧 Linux',
      windowsHeader: '🪟 Windows',
      linuxFooter: <>Un solo árbol desde <span style={{ color: THEME.green }}>/</span> — cada cosa tiene su lugar</>,
      windowsFooter: <>Un árbol por disco: <span style={{ color: THEME.cyan }}>C:\</span>, <span style={{ color: THEME.cyan }}>D:\</span>...</>,
    },
    s4: {
      titleLine1: 'CUANDO ENTRES A UN SISTEMA,',
      titleLine2: 'SABÉ DÓNDE MIRAR',
      linuxLabel: '🐧 LINUX',
      windowsLabel: '🪟 WINDOWS',
      footer: 'conocer el mapa de cada sistema es saber dónde va a estar la información',
      closingLinux: [
        { path: '/etc', icon: '⚙️', desc: 'configuración' },
        { path: '/home', icon: '👤', desc: 'usuarios' },
        { path: '/var/www', icon: '🌐', desc: 'sitios web' },
      ],
      closingWindows: [
        { path: 'C:\\Windows', icon: '🪟', desc: 'el sistema' },
        { path: 'C:\\Users', icon: '👤', desc: 'perfiles' },
        { path: 'C:\\inetpub', icon: '🌐', desc: 'web IIS' },
      ],
    },
  },
  en: {
    s1: { title: 'TWO WORLDS, TWO MAPS', subtitle: 'Linux and Windows organize everything differently' },
    s2: {
      linuxDescs: {
        root: 'the root: everything hangs from here',
        etc: 'configuration',
        passwd: 'users',
        homeUsers: 'users',
        rootHome: "root's home",
        www: 'websites',
        log: 'logs',
        tmp: 'temp',
      },
      windowsDescs: {
        drive: 'the drive: another world, another root',
        os: 'the OS',
        core: 'core',
        temp: 'temp',
        users: 'users',
        programs: 'programs',
        iis: 'IIS web',
      },
      linuxHeader: '🐧 Linux',
      windowsHeader: '🪟 Windows',
      linuxFooter: <>A single tree from <span style={{ color: THEME.green }}>/</span> — everything has its place</>,
      windowsFooter: <>One tree per drive: <span style={{ color: THEME.cyan }}>C:\</span>, <span style={{ color: THEME.cyan }}>D:\</span>...</>,
    },
    s4: {
      titleLine1: 'WHEN YOU GET INTO A SYSTEM,',
      titleLine2: 'KNOW WHERE TO LOOK',
      linuxLabel: '🐧 LINUX',
      windowsLabel: '🪟 WINDOWS',
      footer: 'knowing each system\'s map means knowing exactly where the information will be',
      closingLinux: [
        { path: '/etc', icon: '⚙️', desc: 'configuration' },
        { path: '/home', icon: '👤', desc: 'users' },
        { path: '/var/www', icon: '🌐', desc: 'websites' },
      ],
      closingWindows: [
        { path: 'C:\\Windows', icon: '🪟', desc: 'the system' },
        { path: 'C:\\Users', icon: '👤', desc: 'profiles' },
        { path: 'C:\\inetpub', icon: '🌐', desc: 'IIS web' },
      ],
    },
  },
};

// ── BEATS ───────────────────────────────────────────────────────────
const BEATS = {
  es: {
    linuxHighlights: [
      { label: '/', at: 2.7 },
      { label: 'etc', at: 3.5 },
      { label: 'home', at: 7.4 },
      { label: 'root', at: 10.0 },
      { label: 'www', at: 12.4 },
      { label: 'log', at: 15.0 },
    ],
    windowsHighlights: [
      { label: 'C:\\', at: 2.4 },
      { label: 'Windows', at: 4.4 },
      { label: 'Users', at: 7.3 },
      { label: 'Program Files', at: 9.7 },
      { label: 'inetpub', at: 12.2 },
      { label: 'wwwroot', at: 12.45 },
      { label: 'System32', at: 14.6 },
    ],
    closingLinux: [{ at: 3.3 }, { at: 4.3 }, { at: 6.4 }],
    closingWindows: [{ at: 8.5 }, { at: 9.4 }, { at: 11.9 }],
  },
  en: {
    linuxHighlights: [
      { label: '/', at: 3.2 },
      { label: 'etc', at: 5.7 },
      { label: 'home', at: 8.8 },
      { label: 'root', at: 11.6 },
      { label: 'www', at: 15.2 },
      { label: 'log', at: 16.3 },
    ],
    windowsHighlights: [
      { label: 'C:\\', at: 1.8 },
      { label: 'Windows', at: 4.7 },
      { label: 'Users', at: 8.3 },
      { label: 'Program Files', at: 10.1 },
      { label: 'inetpub', at: 12.8 },
      { label: 'wwwroot', at: 14.3 },
      { label: 'System32', at: 16.6 },
    ],
    closingLinux: [{ at: 3.5 }, { at: 4.5 }, { at: 6.1 }],
    closingWindows: [{ at: 8.6 }, { at: 9.6 }, { at: 10.8 }],
  },
};

const VID = 'pentesting-02-filesystem';

// ── Helpers ─────────────────────────────────────────────────────────
function buildLinuxTree(descs: typeof COPY.es.s2.linuxDescs): TreeItem[] {
  return [{
    label: '/', icon: '🌱', desc: descs.root, color: THEME.green,
    children: [
      { label: 'etc', icon: '⚙️', color: THEME.green, desc: descs.etc, children: [
        { label: 'passwd', icon: '🔑', color: THEME.green, desc: descs.passwd },
      ] },
      { label: 'home', icon: '👤', color: THEME.green, desc: descs.homeUsers },
      { label: 'root', icon: '👑', color: THEME.green, desc: descs.rootHome },
      { label: 'var', icon: '🗃️', color: THEME.green, children: [
        { label: 'www', icon: '🌐', color: THEME.green, desc: descs.www },
        { label: 'log', icon: '📋', color: THEME.green, desc: descs.log },
      ] },
      { label: 'tmp', icon: '⏳', color: THEME.green, desc: descs.tmp },
    ],
  }];
}

function buildWindowsTree(descs: typeof COPY.es.s2.windowsDescs): TreeItem[] {
  return [{
    label: 'C:\\', icon: '💽', desc: descs.drive, color: THEME.cyan,
    children: [
      { label: 'Windows', icon: '🪟', color: THEME.cyan, desc: descs.os, children: [
        { label: 'System32', icon: '⚙️', color: THEME.cyan, desc: descs.core },
        { label: 'Temp', icon: '⏳', color: THEME.cyan, desc: descs.temp },
      ] },
      { label: 'Users', icon: '👤', color: THEME.cyan, desc: descs.users },
      { label: 'Program Files', icon: '📦', color: THEME.cyan, desc: descs.programs },
      { label: 'inetpub', icon: '🌐', color: THEME.cyan, children: [
        { label: 'wwwroot', icon: '🗃️', color: THEME.cyan, desc: descs.iis },
      ] },
    ],
  }];
}

interface HState {
  cur: string | null;
  highlighted: string[];
  startSec: number;
}

function highlightState(words: { label: string; at: number }[], t: number): HState {
  let cur: string | null = null;
  let lastAt = 0;
  for (const w of words) {
    if (t >= w.at) { cur = w.label; lastAt = w.at; }
  }
  const highlighted = cur === null ? [] : words.filter(w => w.at < lastAt).map(w => w.label);
  return { cur, highlighted, startSec: lastAt };
}

const NONE: HState = { cur: null, highlighted: [], startSec: 0 };

// ── ClosingPathCard ────────────────────────────────────────────────
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
        display: 'inline-block', padding: '7px 14px', borderRadius: 9,
        border: `1.5px solid ${color}`, background: color + '1f',
        boxShadow: `0 0 16px ${color}33`, fontSize: 23, color, fontWeight: 700, fontFamily: MONO,
      }}>
        {icon} {path}
      </span>
      <span style={{ fontSize: 17, color: THEME.muted, fontFamily: MONO, marginLeft: 12 }}>{desc}</span>
    </div>
  );
};

// ── ClosingScene ────────────────────────────────────────────────────
const ClosingScene: React.FC<{ fps: number; c: typeof COPY.es.s4; b: typeof BEATS.es }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
        <div style={{ opacity: titleIn, transform: `translateY(${(1 - Math.min(1, frame / 14)) * 18}px)` }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: THEME.text, fontFamily: MONO, lineHeight: 1.2 }}>
            {c.titleLine1}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginTop: 8 }}>
            {c.titleLine2}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 60, marginTop: 44 }}>
          <div style={{ textAlign: 'left', minWidth: 300 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.green, fontFamily: MONO, marginBottom: 18 }}>
              {c.linuxLabel}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {c.closingLinux.map((cl, i) => (
                <ClosingPathCard key={cl.path} {...cl} at={b.closingLinux[i].at} color={THEME.green} fps={fps} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'left', minWidth: 300 }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 18 }}>
              {c.windowsLabel}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {c.closingWindows.map((cw, i) => (
                <ClosingPathCard key={cw.path} {...cw} at={b.closingWindows[i].at} color={THEME.cyan} fps={fps} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 90, right: 90, textAlign: 'center', fontSize: 20, color: THEME.muted, fontFamily: MONO, opacity: titleIn }}>
        {c.footer}
      </div>
    </AbsoluteFill>
  );
};

// ── MergedScene ─────────────────────────────────────────────────────
const MergedScene: React.FC<{ fps: number; s2: number; lang: 'es' | 'en'; c: typeof COPY.es.s2; b: typeof BEATS.es }> = ({ fps, s2, lang: _lang, c, b }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const s3Start = s2 + SCENE_GAP;
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

  const linuxTree = buildLinuxTree(c.linuxDescs);
  const windowsTree = buildWindowsTree(c.windowsDescs);

  const inWin = t >= s3Start;
  const lh: HState = inWin
    ? { cur: null, highlighted: b.linuxHighlights.map(w => w.label), startSec: 0 }
    : highlightState(b.linuxHighlights, t);
  const wh: HState = inWin ? highlightState(b.windowsHighlights, t - s3Start) : NONE;

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', gap: 24, height: '100%', padding: '0 60px' }}>
        <div style={{ width: `${linuxW}%`, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: linuxHeader, color: THEME.green, fontWeight: 700, fontFamily: MONO, marginBottom: 22 }}>
            {c.linuxHeader}
          </div>
          <TreeView
            items={linuxTree}
            start={0}
            framesPerRow={10}
            fontSize={linuxFont}
            highlight={lh.cur}
            highlightStart={Math.round(lh.startSec * fps)}
            highlighted={lh.highlighted}
          />
        </div>
        <div style={{ width: 2, background: THEME.border, opacity: dividerOp, alignSelf: 'stretch' }} />
        <div style={{
          width: `${winW}%`, minWidth: 0, opacity: winOp, transform: `translateX(${winX}px)`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: 24, color: THEME.cyan, fontWeight: 700, fontFamily: MONO, marginBottom: 22 }}>
            {c.windowsHeader}
          </div>
          <TreeView
            items={windowsTree}
            start={s3Frame}
            framesPerRow={7}
            fontSize={16}
            highlight={wh.cur}
            highlightStart={Math.round((s3Start + wh.startSec) * fps)}
            highlighted={wh.highlighted}
          />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 40, left: 90, right: 90, textAlign: 'center', fontSize: 20, color: THEME.muted, fontFamily: MONO }}>
        <div style={{ opacity: 1 - p }}>{c.linuxFooter}</div>
        <div style={{ opacity: p, marginTop: -24 }}>{c.windowsFooter}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Pe02Filesystem: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];

  const [s1, s2, s3, s4] = audioTimings(VID, lang);
  const starts = sceneStartFrames(VID, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const mergedDur = Math.ceil((s2 + SCENE_GAP + s3) * fps);
  const s3Frame = Math.round((s2 + SCENE_GAP) * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pentesting-02-scene1.wav`)} />}
        <TitleScene title={c.s1.title} subtitle={c.s1.subtitle} />
      </Sequence>

      <Sequence from={starts[1]} durationInFrames={mergedDur}>
        <Sequence from={0} durationInFrames={Math.ceil(s2 * fps)}>
          {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pentesting-02-scene2.wav`)} />}
        </Sequence>
        <Sequence from={s3Frame} durationInFrames={dur3}>
          {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pentesting-02-scene3.wav`)} />}
        </Sequence>
        <MergedScene fps={fps} s2={s2} lang={lang} c={c.s2} b={b} />
      </Sequence>

      <Sequence from={starts[3]} durationInFrames={dur4}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/pentesting-02-scene4.wav`)} />}
        <ClosingScene fps={fps} c={c.s4} b={b} />
      </Sequence>
    </AbsoluteFill>
  );
};
