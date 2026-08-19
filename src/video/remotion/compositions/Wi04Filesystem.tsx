// ── video/remotion/compositions/Wi04Filesystem.tsx ────────────────
// Video: estructura de archivos de Windows — el árbol de C:\, el hive
// SAM y las cuentas, y los permisos NTFS (ACL) con icacls. Cierre:
// saber el mapa es saber dónde buscar.
// Con audio de la voz "Miguel" (3 escenas, ~93s).

import React from 'react';
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TreeView } from '../primitives/TreeView';
import type { TreeItem } from '../primitives/TreeView';
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

// ── Escena 1: el mapa de C:\ ───────────────────────────────────────
const C_TREE: TreeItem[] = [
  {
    label: 'C:\\',
    icon: '💽',
    color: THEME.cyan,
    desc: 'cada disco es un árbol propio',
    children: [
      { label: 'Windows', icon: '🪟', color: THEME.cyan, children: [
        { label: 'System32', icon: '⚙️', color: THEME.cyan, desc: 'el núcleo del SO' },
        { label: 'Temp', icon: '⏳', color: THEME.cyan, desc: 'escribible por todos' },
      ] },
      { label: 'Users', icon: '👤', color: THEME.cyan, desc: 'perfiles: Desktop, Documents, Downloads' },
      { label: 'Program Files', icon: '📦', color: THEME.cyan, desc: 'aplicaciones' },
      { label: 'ProgramData', icon: '🗃️', color: THEME.cyan, desc: 'datos de apps' },
      { label: 'inetpub', icon: '🌐', color: THEME.cyan, children: [
        { label: 'wwwroot', icon: '🗃️', color: THEME.cyan, desc: 'web IIS' },
      ] },
    ],
  },
];

// Momentos (en segundos, relativos a la escena) en que la narración
// menciona cada carpeta del árbol — medidos con silencedetect (-50dB)
// sobre wi-04-scene1.wav.
const TREE_HIGHLIGHTS: Array<{ label: string; at: number }> = [
  { label: 'C:\\', at: 5.3 },
  { label: 'Windows', at: 7.2 },
  { label: 'System32', at: 8.0 },
  { label: 'Temp', at: 10.6 },
  { label: 'Users', at: 14.5 },
  { label: 'Program Files', at: 17.8 },
  { label: 'inetpub', at: 18.8 },
  { label: 'wwwroot', at: 19.8 },
];

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  // el árbol aparece cuando la narración llega a "la estrella es C dos puntos" (5.3s)
  const treeAt = Math.round(5.3 * fps);
  const t = frame / fps;
  const active = TREE_HIGHLIGHTS.find(h => t >= h.at && t < h.at + 1.6);
  const highlight = active ? active.label : null;
  const highlighted = TREE_HIGHLIGHTS.filter(h => t >= h.at + 1.6).map(h => h.label);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={treeAt}>
        <TitleScene
          title={<><span style={{ color: THEME.cyan }}>EL MAPA</span> DE WINDOWS</>}
          subtitle="un disco, un árbol propio"
        />
      </Sequence>
      <Sequence from={treeAt}>
        <AbsoluteFill style={CENTERED}>
          <TreeView
            items={C_TREE}
            start={0}
            framesPerRow={7}
            fontSize={16}
            highlight={highlight}
            // frame relativo a la Sequence (restamos treeAt) para que el pop
            // animado coincida con el momento en que la narración menciona la fila
            highlightStart={Math.max(0, Math.round((active ? active.at : 0) * fps) - treeAt)}
            highlighted={highlighted}
          />
          <div style={{ marginTop: 26, fontSize: 19, color: THEME.muted, fontFamily: MONO,
            opacity: interpolate(frame - Math.round(21.9 * fps), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
            las <span style={{ color: THEME.cyan }}>ACL</span> solo existen en NTFS — FAT32 no tiene permisos de archivos
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Escena 2: SAM, cuentas y grupos ────────────────────────────────
const SAM_POINTS = [
  { text: 'las contraseñas locales viven en el hive SAM', at: 0.3 },
  { text: 'System32\\config — bloqueado mientras Windows corre', at: 2.8 },
  { text: 'se obtiene offline o con una copia de volumen', at: 5.1 },
];
const ACCOUNTS = [
  { label: 'Administrator', at: 10.3 },
  { label: 'usuarios estándar', at: 11.5 },
  { label: 'Guest', at: 12.4 },
  { label: 'SYSTEM = root', at: 14.8 },
];

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const fade = (at: number) =>
    interpolate(frame - Math.round(at * fps), [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={CENTERED}>
      <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '24px 30px', width: 940, textAlign: 'left', marginBottom: 26 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: THEME.amber, fontFamily: MONO, marginBottom: 12 }}>🔑 EL HIVE SAM</div>
        {SAM_POINTS.map(p => (
          <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.amber}>{p.text}</RevealLine>
        ))}
      </div>
      <div style={{ fontSize: 20, color: THEME.muted, fontFamily: MONO, marginBottom: 16, opacity: fade(7.2) }}>
        no hay un solo root: hay varias cuentas
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 980 }}>
        {ACCOUNTS.map(a => (
          <KeyCapsule key={a.label} label="cuenta" value={a.label} accent={THEME.cyan} delay={Math.round(a.at * fps)} size={17} />
        ))}
      </div>
      <div style={{ marginTop: 24, fontSize: 18, color: THEME.muted, fontFamily: MONO, opacity: fade(17.3) }}>
        grupos clave: Administrators · Users · Remote Desktop Users · Everyone
      </div>
    </AbsoluteFill>
  );
};

// ── Escena 3: permisos NTFS + dónde vive lo jugoso + cierre ────────
const ACL_POINTS = [
  { text: 'los permisos se llaman ACL: quién puede hacer qué', at: 2.6 },
  { text: 'control total · modificar · leer y ejecutar · leer', at: 5.0 },
  { text: 'dueño + herencia desde las carpetas padre', at: 9.2 },
];
// `at` es relativo a la sub-secuencia "lo jugoso" (arranca en `lootAt` 15.4s).
// En tiempo de escena quedan en 16.8 / 22.1 / 24.3s (silencedetect).
const LOOT_POINTS = [
  { text: 'el registro guarda configs, a veces contraseñas en texto plano', at: 1.4 },
  { text: 'Documents y Desktop: lo que el usuario toca de verdad', at: 6.7 },
  { text: 'share SMB = segunda capa de permisos encima de las ACL', at: 8.9 },
];

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  // "¿Dónde vive lo jugoso?" se dice a los ~15.3s de la escena (silencedetect)
  const lootAt = Math.round(15.4 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={lootAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.cyan}60`, borderRadius: 16, padding: '26px 32px', width: 940, textAlign: 'left' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: THEME.cyan, fontFamily: MONO, marginBottom: 12 }}>🧾 PERMISOS NTFS (ACL)</div>
            {ACL_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="▸" color={THEME.cyan}>{p.text}</RevealLine>
            ))}
            <div style={{ marginTop: 12, fontSize: 17, color: THEME.muted, fontFamily: MONO }}>
              se ven y se cambian con <span style={{ color: THEME.cyan }}>icacls</span>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={lootAt}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24 }}>
            ¿DÓNDE VIVE <span style={{ color: THEME.amber }}>LO JUGOSO</span>?
          </div>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.amber}60`, borderRadius: 16, padding: '26px 32px', width: 940, textAlign: 'left' }}>
            {LOOT_POINTS.map(p => (
              <RevealLine key={p.text} at={p.at} fps={fps} mark="💎" color={THEME.amber}>{p.text}</RevealLine>
            ))}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

export const Wi04Filesystem: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['wi-04-filesystem'];
  const starts = sceneStartFrames('wi-04-filesystem', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: el mapa de C:\ */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/wi-04-filesystem/wi-04-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: SAM, cuentas y grupos */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/wi-04-filesystem/wi-04-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: permisos NTFS + dónde vive lo jugoso */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/wi-04-filesystem/wi-04-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};
