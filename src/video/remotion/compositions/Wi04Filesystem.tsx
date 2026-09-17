// ── video/remotion/compositions/Wi04Filesystem.tsx ────────────────
// Video: estructura de archivos de Windows — el árbol de C:\, el hive
// SAM y las cuentas, y los permisos NTFS (ACL) con icacls. Cierre:
// saber el mapa es saber dónde buscar.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TreeView } from '../primitives/TreeView';
import type { TreeItem } from '../primitives/TreeView';
import { KeyCapsule } from '../primitives/KeyCapsule';
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
      title: <><span style={{ color: THEME.cyan }}>EL MAPA</span> DE WINDOWS</>,
      subtitle: 'un disco, un árbol propio',
      aclFooter: <>las <span style={{ color: THEME.cyan }}>ACL</span> solo existen en NTFS — FAT32 no tiene permisos de archivos</>,
    },
    s2: {
      samTitle: '🔑 EL HIVE SAM',
      samPoints: [
        { text: 'las contraseñas locales viven en el hive SAM', at: 0.1 },
        { text: 'System32\\config — bloqueado mientras Windows corre', at: 2.6 },
        { text: 'se obtiene offline o con una copia de volumen', at: 5.1 },
      ],
      noSingleRoot: 'no hay un solo root: hay varias cuentas',
      accounts: [
        { label: 'Administrator', at: 12.1 },
        { label: 'usuarios estándar', at: 13.5 },
        { label: 'Guest', at: 14.7 },
        { label: 'SYSTEM = root', at: 15.4 },
      ],
      accountLabel: 'cuenta',
      keyGroups: 'grupos clave: Administrators · Users · Remote Desktop Users · Everyone',
      keyGroupsAt: 18.5,
      fadeAt: 10.0,
    },
    s3: {
      aclTitle: '🧾 PERMISOS NTFS (ACL)',
      aclPoints: [
        { text: 'los permisos se llaman ACL: quién puede hacer qué', at: 1.5 },
        { text: 'control total · modificar · leer y ejecutar · leer', at: 4.9 },
        { text: 'dueño + herencia desde las carpetas padre', at: 9.1 },
      ],
      icaclsFooter: <>se ven y se cambian con <span style={{ color: THEME.cyan }}>icacls</span></>,
      lootAt: 15.4,
      lootHeading: <>¿DÓNDE VIVE <span style={{ color: THEME.amber }}>LO JUGOSO</span>?</>,
      lootPoints: [
        { text: 'el SAM y el registro guardan configs, a veces contraseñas en texto plano', at: 1.4 },
        { text: 'Documents y Desktop: lo que el usuario toca de verdad', at: 5.0 },
        { text: 'share SMB = segunda capa de permisos encima de las ACL', at: 8.0 },
      ],
    },
  },
  en: {
    s1: {
      title: <><span style={{ color: THEME.cyan }}>THE MAP</span> OF WINDOWS</>,
      subtitle: 'one drive, one tree of its own',
      aclFooter: <><span style={{ color: THEME.cyan }}>ACLs</span> only exist on NTFS — FAT32 drives have no file permissions</>,
    },
    s2: {
      samTitle: '🔑 THE SAM HIVE',
      samPoints: [
        { text: 'local passwords live in the SAM hive', at: 0.0 },
        { text: 'System32\\config — locked while Windows runs', at: 2.3 },
        { text: 'you get it offline or with a volume shadow copy', at: 5.3 },
      ],
      noSingleRoot: "there's no single root: there are several accounts",
      accounts: [
        { label: 'Administrator', at: 13.0 },
        { label: 'standard users', at: 14.0 },
        { label: 'Guest', at: 15.0 },
        { label: 'SYSTEM = root', at: 15.4 },
      ],
      accountLabel: 'account',
      keyGroups: 'key groups: Administrators · Users · Remote Desktop Users · Everyone',
      keyGroupsAt: 19.0,
      fadeAt: 10.3,
    },
    s3: {
      aclTitle: '🧾 NTFS PERMISSIONS (ACLs)',
      aclPoints: [
        { text: 'permissions are called ACLs: who can do what', at: 0.0 },
        { text: 'full control · modify · read and execute · read', at: 5.6 },
        { text: 'an owner + inheritance from parent folders', at: 9.6 },
      ],
      icaclsFooter: <>you view and change them with <span style={{ color: THEME.cyan }}>icacls</span></>,
      lootAt: 15.6,
      lootHeading: <>WHERE DOES <span style={{ color: THEME.amber }}>THE JUICY STUFF</span> LIVE?</>,
      lootPoints: [
        { text: 'the SAM and the registry sometimes store passwords in plain text', at: 1.9 },
        { text: 'Documents and Desktop: what the user actually touches', at: 6.5 },
        { text: 'an SMB share = a second layer of permissions on top of the ACLs', at: 8.0 },
      ],
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: {
      treeAt: 5.3,
      aclFooterAt: 27.0,
      treeHighlights: [
        { label: 'C:\\', at: 5.3 },
        { label: 'Windows', at: 7.6 },
        { label: 'System32', at: 8.0 },
        { label: 'Temp', at: 10.5 },
        { label: 'Users', at: 14.4 },
        { label: 'Program Files', at: 19.9 },
        { label: 'inetpub', at: 21.9 },
        { label: 'wwwroot', at: 23.7 },
      ],
    },
    s2: {},
    s3: {},
  },
  en: {
    s1: {
      treeAt: 5.7,
      aclFooterAt: 26.0,
      treeHighlights: [
        { label: 'C:\\', at: 5.7 },
        { label: 'Windows', at: 7.9 },
        { label: 'System32', at: 8.0 },
        { label: 'Temp', at: 10.3 },
        { label: 'Users', at: 13.5 },
        { label: 'Program Files', at: 17.8 },
        { label: 'inetpub', at: 20.6 },
        { label: 'wwwroot', at: 23.0 },
      ],
    },
    s2: {},
    s3: {},
  },
};

// ── Shared tree data (icons/colors are structural, not text) ────────
const C_TREE: TreeItem[] = [
  {
    label: 'C:\\',
    icon: '💽',
    color: THEME.cyan,
    children: [
      { label: 'Windows', icon: '🪟', color: THEME.cyan, children: [
        { label: 'System32', icon: '⚙️', color: THEME.cyan },
        { label: 'Temp', icon: '⏳', color: THEME.cyan },
      ] },
      { label: 'Users', icon: '👤', color: THEME.cyan },
      { label: 'Program Files', icon: '📦', color: THEME.cyan },
      { label: 'ProgramData', icon: '🗃️', color: THEME.cyan },
      { label: 'inetpub', icon: '🌐', color: THEME.cyan, children: [
        { label: 'wwwroot', icon: '🗃️', color: THEME.cyan },
      ] },
    ],
  },
];

const VID = 'wi-04-filesystem';

// ── Scene 1: el mapa de C:\ ───────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const treeAt = Math.round(b.treeAt * fps);
  const t = frame / fps;
  const active = b.treeHighlights.find(h => t >= h.at && t < h.at + 1.6);
  const highlight = active ? active.label : null;
  const highlighted = b.treeHighlights.filter(h => t >= h.at + 1.6).map(h => h.label);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={treeAt}>
        <TitleScene title={c.title} subtitle={c.subtitle} />
      </Sequence>
      <Sequence from={treeAt}>
        <AbsoluteFill style={CENTERED}>
          <TreeView
            items={C_TREE}
            start={0}
            framesPerRow={7}
            fontSize={16}
            highlight={highlight}
            highlightStart={Math.max(0, Math.round((active ? active.at : 0) * fps) - treeAt)}
            highlighted={highlighted}
          />
          <div style={{ marginTop: 26, fontSize: 19, color: THEME.muted, fontFamily: MONO,
            opacity: interpolate(frame - Math.round(b.aclFooterAt * fps), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            {c.aclFooter}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: SAM, cuentas y grupos ────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c }) => {
  const frame = useCurrentFrame();
  const fade = (at: number) =>
    interpolate(frame - Math.round(at * fps), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '24px 30px', width: 940, textAlign: 'left', marginBottom: 26 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>{c.samTitle}</div>
        {c.samPoints.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
        ))}
      </div>
      <div style={{ fontSize: 20, color: THEME.muted, fontFamily: MONO, marginBottom: 16, opacity: fade(c.fadeAt) }}>
        {c.noSingleRoot}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 980 }}>
        {c.accounts.map(a => (
          <KeyCapsule key={a.label} label={c.accountLabel} value={a.label} accent={THEME.cyan} delay={Math.round(a.at * fps)} size={17} />
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, opacity: fade(c.keyGroupsAt) }}>
        {c.keyGroups}
      </div>
      <div style={{ marginTop: 24, opacity: fade(23.7) }}>
        <TerminalWindow title="C:\\> net user / net localgroup" width={900}>
          <div style={{ fontSize: 13, whiteSpace: 'pre', lineHeight: 1.6 }}>
            {'C:\\>'} <span style={{ color: THEME.amber }}>net user</span>{'\n'}
            Administrator   Guest   ana{'\n'}
            {'C:\\>'} <span style={{ color: THEME.amber }}>net localgroup</span>{'\n'}
            Administrators  Users  Remote Desktop Users  Everyone
          </div>
        </TerminalWindow>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: permisos NTFS + dónde vive lo jugoso ─────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c }) => {
  const lootAt = Math.round(c.lootAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={lootAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '26px 32px', width: 940, textAlign: 'left' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>{c.aclTitle}</div>
            {c.aclPoints.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
            ))}
            <div style={{ marginTop: 12, fontSize: 17, color: THEME.muted, fontFamily: MONO }}>
              {c.icaclsFooter}
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={lootAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            {c.lootHeading}
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 32px', width: 940, textAlign: 'left' }}>
            {c.lootPoints.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="💎" color={THEME.amber}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Wi04Filesystem: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: el mapa de C:\ */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/wi-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: SAM, cuentas y grupos */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/wi-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: permisos NTFS + dónde vive lo jugoso */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/wi-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
