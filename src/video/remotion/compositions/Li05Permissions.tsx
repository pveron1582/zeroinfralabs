// ── video/remotion/compositions/Li05Permissions.tsx ────────────────
// Video: leer permisos Unix, octal y SUID. Remodelado con los audios
// nuevos (voz "Miguel"): el -rw-r--r-- se arma parte por parte cuando
// la narración lo explica y el bit SUID se destaca con glow.
// Timings por silencedetect.
//
// Scene 1 (17.0s): qué es esa línea de guiones y letras
// Scene 2 (36.6s): tipo + rwx · dueño/grupo/otros · octal (644)
// Scene 3 (27.7s): SUID — la "s" en el grupo del dueño
// Scene 4 (26.6s): repase numérico — 644 vs 4755

import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { Audio } from '@remotion/media';
import { staticFile } from 'remotion';
import { sceneStartFrames, AUDIO_TIMINGS } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';
import { TerminalWindow } from '../primitives/TerminalWindow';
import { RevealLine } from '../primitives/RevealLine';

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// Carácter coloreado que se enciende cuando el narrador lo lee
const PermChar: React.FC<{ c: string; color: string; on: number; fps: number; size?: number }> = ({
  c,
  color,
  on,
  fps,
  size = 36,
}) => {
  const frame = useCurrentFrame();
  const t = frame - on;
  const active = t >= 0;
  const pop = spring({ frame: t, fps, config: { damping: 14 } });
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: 8,
        fontSize: size,
        fontWeight: 700,
        color: active ? color : THEME.dim,
        border: active ? `2px solid ${color}` : '2px solid transparent',
        background: active ? color + '1e' : 'transparent',
        transform: active ? `scale(${0.9 + 0.1 * pop})` : 'scale(1)',
        boxShadow: active ? `0 0 14px ${color}44` : 'none',
      }}
    >
      {c}
    </span>
  );
};

// ── Scene 1: esa línea de guiones y letras ──────────────────────────
const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const perm = '-rw-r--r--';
  const titleEnd = Math.round(1.4 * fps);
  const revealStart = Math.round((1.67 - 1.4) * fps); // narrador lee los chars → relativo
  const cps = 6; // chars/seg aprox lo que tarda en leerlos
  const noiseAt = Math.round((9.2 - 1.4) * fps);
  const privAt = Math.round((11.0 - 1.4) * fps);

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="¿MUCHO GUIÓN Y LETRAS?"
          subtitle="al inicio de cada archivo, cuando listás en largo"
          fontSize={38}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', fontFamily: MONO }}>
            {perm.split('').map((ch, i) => (
              <PermChar
                key={i}
                c={ch}
                color={i === 0 ? THEME.amber : i <= 3 ? THEME.green : i <= 6 ? THEME.cyan : THEME.red}
                on={revealStart + Math.round(i * (30 / cps))}
                fps={fps}
                size={44}
              />
            ))}
          </div>
          <RevealLine at={noiseAt} fps={fps} mark="▸" color={THEME.muted}>
            parece ruido, pero es el sistema diciendo quién puede hacer qué con el archivo
          </RevealLine>
          <RevealLine at={privAt} fps={fps} mark="▲" color={THEME.red}>
            aprender a leerlo te destapa la puerta de la <b>escalada de privilegios</b>
          </RevealLine>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: tipo + rwx + octal ─────────────────────────────────────
// Narración (silencedetect): primer carácter=tipo (~1.4) → guion común / d
// directorio (~2.9) → tres grupos de tres letras (~4.5) → r lectura / w
// escritura / x ejecución (~8.2) → dueño / grupo / otros (~8.6) → cada
// letra vale r=4 w=2 x=1 (~12.4) → suma por grupo rw-=6 (~16.7) → 644
// (~22.3) → "leer de un vistazo" (~28).
const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const frameAt = (s: number) => Math.round(s * fps);

  const groupsAt = frameAt(4.5); // tres grupos de tres letras
  const legendAt = frameAt(8.2); // r=lectura w=escritura x=ejecución
  const ownersAt = frameAt(8.6); // dueño / grupo / otros
  const numsAt = frameAt(12.4); // r=4 w=2 x=1
  const sumAt = frameAt(17.0); // rw- = 6
  const keyAt = frameAt(23.0); // "la clave para leer de un vistazo"

  const groups = [
    { chars: 'rw-', octal: '6', color: THEME.green, owner: 'dueño' },
    { chars: 'r--', octal: '4', color: THEME.cyan, owner: 'grupo' },
    { chars: 'r--', octal: '4', color: THEME.red, owner: 'otros' },
  ];

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 22 }}>
        {/* línea de permisos completa */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', fontFamily: MONO }}>
          <PermChar c="-" color={THEME.amber} on={frameAt(1.4)} fps={fps} size={32} />
          <PermChar c="r" color={THEME.green} on={groupsAt} fps={fps} size={32} />
          <PermChar c="w" color={THEME.green} on={groupsAt} fps={fps} size={32} />
          <PermChar c="-" color={THEME.green} on={groupsAt} fps={fps} size={32} />
          <PermChar c="r" color={THEME.cyan} on={groupsAt + Math.round(0.4 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.cyan} on={groupsAt + Math.round(0.4 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.cyan} on={groupsAt + Math.round(0.4 * fps)} fps={fps} size={32} />
          <PermChar c="r" color={THEME.red} on={groupsAt + Math.round(0.8 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.red} on={groupsAt + Math.round(0.8 * fps)} fps={fps} size={32} />
          <PermChar c="-" color={THEME.red} on={groupsAt + Math.round(0.8 * fps)} fps={fps} size={32} />
        </div>

        <div style={{ fontSize: 19, color: THEME.muted, fontFamily: MONO, opacity: interpolate(frame - groupsAt, [0, 12], [0, 1], { extrapolateRight: 'clamp' }) }}>
          primer carácter = <span style={{ color: THEME.amber, fontWeight: 700 }}>tipo</span> ({'-'} común · <span style={{ color: THEME.cyan }}>d</span> directorio) — después 3 grupos de 3
        </div>

        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', justifyContent: 'center' }}>
          {groups.map((g, i) => {
            const t = frame - (ownersAt + Math.round(i * 1.6 * fps));
            const enter = spring({ frame: t, fps, config: { damping: 200 } });
            // octal empieza a aparecer bien entrada la explicación numérica
            const octalT = frame - (sumAt + Math.round(i * 1.1 * fps));
            return (
              <div
                key={g.owner}
                style={{
                  opacity: interpolate(t, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
                  transform: `translateY(${(1 - enter) * 16}px)`,
                  background: THEME.panel, border: `2px solid ${g.color}50`, borderRadius: 12,
                  padding: '16px 20px', minWidth: 130, textAlign: 'center', fontFamily: MONO,
                }}
              >
                <div style={{ fontSize: 26, color: g.color, fontWeight: 700 }}>{g.chars}</div>
                <div style={{ fontSize: 13, color: THEME.muted, marginTop: 4 }}>{g.owner}</div>
                <div
                  style={{
                    marginTop: 8, fontSize: 22, color: THEME.amber, fontWeight: 800,
                    opacity: interpolate(octalT, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
                  }}
                >
                  {g.octal}
                </div>
              </div>
            );
          })}
        </div>

        <RevealLine at={legendAt} fps={fps} mark="▸" color={THEME.cyan}>
          r = lectura · w = escritura · x = ejecución
        </RevealLine>
        <RevealLine at={numsAt} fps={fps} mark="▸" color={THEME.red}>
          cada letra vale: r = 4 · w = 2 · x = 1 — sumá cada grupo
        </RevealLine>
        <RevealLine at={keyAt} fps={fps} mark="★" color={THEME.amber}>
          rw- = 4+2 = <b>6</b> · r-- = <b>4</b> → <span style={{ color: THEME.amber, fontWeight: 800 }}>644</span> de un vistazo
        </RevealLine>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: SUID ───────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const suidAt = Math.round(2.9 * fps); // "ves una s en lugar de la x"
  const meaningAt = Math.round(10.0 * fps); // "corre como si lo lanzara el dueño"
  const findAt = Math.round(16.0 * fps); // "buscá binarios con esa s"

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24, opacity: interpolate(frame - frame / 2, [0, 18], [0, 1], { extrapolateRight: 'clamp' }) }}>
          EL CASO QUE TE INTERESA COMO ATACANTE
        </div>
        <TerminalWindow title="ls -la /usr/bin/passwd" width={820}>
          <div style={{ fontFamily: MONO }}>
            <div style={{ fontSize: 22 }}>
              <PermChar c="-" color={THEME.amber} on={0} fps={fps} size={26} />
              <PermChar c="r" color={THEME.green} on={0} fps={fps} size={26} />
              <PermChar c="w" color={THEME.green} on={suidAt} fps={fps} size={26} />
              <PermChar c="s" color={THEME.red} on={suidAt} fps={fps} size={26} />
              <PermChar c="r" color={THEME.cyan} on={suidAt + Math.round(0.6 * fps)} fps={fps} size={26} />
              <PermChar c="-" color={THEME.cyan} on={suidAt + Math.round(0.6 * fps)} fps={fps} size={26} />
              <PermChar c="x" color={THEME.cyan} on={suidAt + Math.round(0.6 * fps)} fps={fps} size={26} />
              <PermChar c="r" color={THEME.red} on={suidAt + Math.round(1.2 * fps)} fps={fps} size={26} />
              <PermChar c="-" color={THEME.red} on={suidAt + Math.round(1.2 * fps)} fps={fps} size={26} />
              <PermChar c="x" color={THEME.red} on={suidAt + Math.round(1.2 * fps)} fps={fps} size={26} />
              <span style={{ color: THEME.text, marginLeft: 12 }}>root root /usr/bin/passwd</span>
            </div>
          </div>
        </TerminalWindow>

        <RevealLine at={meaningAt} fps={fps} mark="!" color={THEME.red}>
          la <span style={{ color: THEME.red, fontWeight: 700 }}>s</span> en el grupo del dueño = bit <b>SUID</b>: el binario corre como su dueño (root)
        </RevealLine>
        <RevealLine at={meaningAt + 2.5} fps={fps} mark="▸" color={THEME.muted}>
          un usuario normal lo ejecuta, y trabaja con poderes de administrador
        </RevealLine>
        <RevealLine at={findAt} fps={fps} mark="▲" color={THEME.amber}>
          buscar binarios con esa <b>s</b> = un paso de la escalada de privilegios
        </RevealLine>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: repase numérico ────────────────────────────────────────
const Scene4: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const normalAt = Math.round(1.5 * fps); // 644 — dueño escribre, demás leen
  const suidAt = Math.round(8.5 * fps); // 4755 — el 4 inicial es SUID
  const bonusAt = Math.round(19.6 * fps); // escalada servida en bandeja
  const smileAt = Math.round(23.0 * fps); // sonreí

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30, opacity: interpolate(frame - Math.round(0.4 * fps), [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          REPASEMOS CON NÚMEROS
        </div>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* 644 */}
          <div style={{
            opacity: interpolate(frame - normalAt, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
            background: THEME.panel, border: `2px solid ${THEME.green}50`, borderRadius: 12,
            padding: '24px 26px', textAlign: 'center', fontFamily: MONO,
          }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: THEME.green }}>644</div>
            <div style={{ fontSize: 15, color: THEME.muted, marginTop: 8 }}>
              dueño: leer+escribir · demás: solo leer
            </div>
          </div>

          {/* 4755 */}
          <div style={{
            opacity: interpolate(frame - suidAt, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
            background: THEME.panel, border: `2px solid ${THEME.red}66`, borderRadius: 12,
            padding: '24px 26px', textAlign: 'center', fontFamily: MONO,
            boxShadow: interpolate(frame - suidAt, [0, 40], [0, 1], { extrapolateRight: 'clamp' }) > 0 ? `0 0 30px ${THEME.red}33` : 'none',
          }}>
            <div style={{ fontSize: 44, fontWeight: 800 }}>
              <span style={{ color: THEME.red }}>4</span>
              <span style={{ color: THEME.text }}>755</span>
            </div>
            <div style={{ fontSize: 15, color: THEME.muted, marginTop: 8 }}>
              el <span style={{ color: THEME.red, fontWeight: 700 }}>4</span> al inicio = SUID → corre como root
            </div>
          </div>
        </div>

        <RevealLine at={bonusAt} fps={fps} mark="▲" color={THEME.amber}>
          en un pentest, encontrar <span style={{ color: THEME.red, fontWeight: 700 }}>4</span>xxx es la escalada servida en bandeja
        </RevealLine>
        <RevealLine at={smileAt} fps={fps} mark="★" color={THEME.green}>
          cuando lo veas, sonreí: ya sabés leer la mente del sistema
        </RevealLine>
      </div>
    </AbsoluteFill>
  );
};

export const Li05Permissions: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3, s4] = AUDIO_TIMINGS['li-05-permissions'];
  const starts = sceneStartFrames('li-05-permissions', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: qué es esa línea */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/li-05-permissions/li-05-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: breakdown rwx + octal */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/li-05-permissions/li-05-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: SUID */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/li-05-permissions/li-05-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>

      {/* Scene 4: 644 vs 4755 */}
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile('videos/audio/li-05-permissions/li-05-scene4.wav')} />
        <Scene4 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};