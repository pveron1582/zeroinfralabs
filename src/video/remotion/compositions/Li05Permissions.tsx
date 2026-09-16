// ── video/remotion/compositions/Li05Permissions.tsx ────────────────
// Video: leer permisos Unix, octal y SUID.
// Versión unificada ES/EN con `lang` prop.
// Timings por silencedetect.

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
import { sceneStartFrames, audioTimings, audioBase } from '../audioTimings';
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

const PermChar: React.FC<{ c: string; color: string; on: number; fps: number; size?: number }> = ({
  c, color, on, fps, size = 36,
}) => {
  const frame = useCurrentFrame();
  const t = frame - on;
  const active = t >= 0;
  const pop = spring({ frame: t, fps, config: { damping: 14 } });
  return (
    <span style={{
      display: 'inline-block', padding: '4px 8px', borderRadius: 8, fontSize: size,
      fontWeight: 700, color: active ? color : THEME.dim,
      border: active ? `2px solid ${color}` : '2px solid transparent',
      background: active ? color + '1e' : 'transparent',
      transform: active ? `scale(${0.9 + 0.1 * pop})` : 'scale(1)',
      boxShadow: active ? `0 0 14px ${color}44` : 'none',
    }}>{c}</span>
  );
};

// ── COPY ────────────────────────────────────────────────────────────
const COPY = {
  es: {
    s1: {
      title: '¿MUCHO GUIÓN Y LETRAS?',
      subtitle: 'al inicio de cada archivo, cuando listás en largo',
      noiseReveal: 'parece ruido, pero es el sistema diciendo quién puede hacer qué con el archivo',
      privReveal: <>aprender a leerlo te destapa la puerta de la <b>escalada de privilegios</b></>,
    },
    s2: {
      typeExplanation: <>primer carácter = <span style={{ color: THEME.amber, fontWeight: 700 }}>tipo</span> ({'-'} común · <span style={{ color: THEME.cyan }}>d</span> directorio) — después 3 grupos de 3</>,
      legend: 'r = lectura · w = escritura · x = ejecución',
      nums: 'cada letra vale: r = 4 · w = 2 · x = 1 — sumá cada grupo',
      key: <>rw- = 4+2 = <b>6</b> · r-- = <b>4</b> → <span style={{ color: THEME.amber, fontWeight: 800 }}>644</span> de un vistazo</>,
      groups: [
        { chars: 'rw-', octal: '6', color: THEME.green, owner: 'dueño' },
        { chars: 'r--', octal: '4', color: THEME.cyan, owner: 'grupo' },
        { chars: 'r--', octal: '4', color: THEME.red, owner: 'otros' },
      ] as Array<{ chars: string; octal: string; color: string; owner: string }>,
    },
    s3: {
      heading: 'EL CASO QUE TE INTERESA COMO ATACANTE',
      meaning: <>la <span style={{ color: THEME.red, fontWeight: 700 }}>s</span> en el grupo del dueño = bit <b>SUID</b>: el binario corre como su dueño (root)</>,
      secondary: 'un usuario normal lo ejecuta, y trabaja con poderes de administrador',
      find: <>buscar binarios con esa <b>s</b> = un paso de la escalada de privilegios</>,
    },
    s4: {
      heading: 'REPASEMOS CON NÚMEROS',
      desc644: 'dueño: leer+escribir · demás: solo leer',
      desc4755: <>el <span style={{ color: THEME.red, fontWeight: 700 }}>4</span> al inicio = SUID → corre como root</>,
      bonus: <>en un pentest, encontrar <span style={{ color: THEME.red, fontWeight: 700 }}>4</span>xxx es la escalada servida en bandeja</>,
      smile: 'cuando lo veas, sonreí: ya sabés leer la mente del sistema',
    },
  },
  en: {
    s1: {
      title: 'A BUNCH OF DASHES AND LETTERS?',
      subtitle: 'at the start of every file, when you list in long format',
      noiseReveal: "it looks like noise, but it's the system telling you who can do what with the file",
      privReveal: <>learning to read it unlocks the door to <b>privilege escalation</b></>,
    },
    s2: {
      typeExplanation: <>first character = <span style={{ color: THEME.amber, fontWeight: 700 }}>type</span> ({'-'} regular · <span style={{ color: THEME.cyan }}>d</span> directory) — then 3 groups of 3</>,
      legend: 'r = read · w = write · x = execute',
      nums: 'each letter is worth: r = 4 · w = 2 · x = 1 — add up each group',
      key: <>rw- = 4+2 = <b>6</b> · r-- = <b>4</b> → <span style={{ color: THEME.amber, fontWeight: 800 }}>644</span> at a glance</>,
      groups: [
        { chars: 'rw-', octal: '6', color: THEME.green, owner: 'owner' },
        { chars: 'r--', octal: '4', color: THEME.cyan, owner: 'group' },
        { chars: 'r--', octal: '4', color: THEME.red, owner: 'others' },
      ] as Array<{ chars: string; octal: string; color: string; owner: string }>,
    },
    s3: {
      heading: 'THE CASE YOU CARE ABOUT AS AN ATTACKER',
      meaning: <>the <span style={{ color: THEME.red, fontWeight: 700 }}>s</span> in the owner's group = the <b>SUID</b> bit: the binary runs as its owner (root)</>,
      secondary: 'a regular user executes it, and it works with administrator powers',
      find: <>hunting binaries with that <b>s</b> = one step from privilege escalation</>,
    },
    s4: {
      heading: "LET'S REVIEW WITH NUMBERS",
      desc644: 'owner: read+write · everyone else: read only',
      desc4755: <>the <span style={{ color: THEME.red, fontWeight: 700 }}>4</span> up front = SUID → runs as root</>,
      bonus: <>on a pentest, finding <span style={{ color: THEME.red, fontWeight: 700 }}>4</span>xxx is privilege escalation served on a plate</>,
      smile: "when you see it, smile: you already know how to read the system's mind",
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { titleEnd: 1.4, cps: 6, noiseAt: 9.2, privAt: 11.0 },
    s2: { typeAt: 1.4, groupsAt: 4.5, legendAt: 8.2, ownersAt: 8.6, numsAt: 12.4, sumAt: 17.0, keyAt: 23.0 },
    s3: { suidAt: 2.9, meaningAt: 10.0, secondaryOffset: 2.5, findAt: 16.0 },
    s4: { normalAt: 1.5, suidAt: 8.5, bonusAt: 19.6, smileAt: 23.0 },
  },
  en: {
    s1: { titleEnd: 2.2, cps: 4.5, noiseAt: 10.3, privAt: 15.1 },
    s2: { typeAt: 1.3, groupsAt: 9.4, legendAt: 13.6, ownersAt: 17.2, numsAt: 22.9, sumAt: 32.0, keyAt: 35.9 },
    s3: { suidAt: 4.8, meaningAt: 10.7, secondaryOffset: 3.0, findAt: 22.7 },
    s4: { normalAt: 1.8, suidAt: 10.6, bonusAt: 20.2, smileAt: 24.0 },
  },
};

// ── Scene 1 ─────────────────────────────────────────────────────────
const Scene1: React.FC<{ fps: number; c: typeof COPY['es']['s1']; b: typeof BEATS['es']['s1'] }> = ({ fps, c, b }) => {
  const perm = '-rw-r--r--';
  const titleEnd = Math.round(b.titleEnd * fps);
  const revealStart = Math.round((b.privAt > 10 ? b.noiseAt - b.titleEnd : 1.67 - b.titleEnd) * fps);
  const cps = b.cps;
  const noiseAt = Math.round((b.noiseAt - b.titleEnd) * fps);
  const privAt = Math.round((b.privAt - b.titleEnd) * fps);

  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene title={c.title} subtitle={c.subtitle} fontSize={38} />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', gap: 2, alignItems: 'center', fontFamily: MONO }}>
            {perm.split('').map((ch, i) => (
              <PermChar
                key={i} c={ch}
                color={i === 0 ? THEME.amber : i <= 3 ? THEME.green : i <= 6 ? THEME.cyan : THEME.red}
                on={revealStart + Math.round(i * (30 / cps))} fps={fps} size={44}
              />
            ))}
          </div>
          <RevealLine at={noiseAt} fps={fps} mark="▸" color={THEME.muted}>{c.noiseReveal}</RevealLine>
          <RevealLine at={privAt} fps={fps} mark="▲" color={THEME.red}>{c.privReveal}</RevealLine>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2 ─────────────────────────────────────────────────────────
const Scene2: React.FC<{ fps: number; c: typeof COPY['es']['s2']; b: typeof BEATS['es']['s2'] }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const frameAt = (s: number) => Math.round(s * fps);

  const typeAt = frameAt(b.typeAt);
  const groupsAt = frameAt(b.groupsAt);
  const legendAt = frameAt(b.legendAt);
  const ownersAt = frameAt(b.ownersAt);
  const numsAt = frameAt(b.numsAt);
  const sumAt = frameAt(b.sumAt);
  const keyAt = frameAt(b.keyAt);

  return (
    <AbsoluteFill>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 22 }}>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', fontFamily: MONO }}>
          <PermChar c="-" color={THEME.amber} on={typeAt} fps={fps} size={32} />
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
          {c.typeExplanation}
        </div>

        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', justifyContent: 'center' }}>
          {c.groups.map((g, i) => {
            const t = frame - (ownersAt + Math.round(i * 1.6 * fps));
            const enter = spring({ frame: t, fps, config: { damping: 200 } });
            const octalT = frame - (sumAt + Math.round(i * 1.1 * fps));
            return (
              <div key={g.owner} style={{
                opacity: interpolate(t, [0, 14], [0, 1], { extrapolateRight: 'clamp' }),
                transform: `translateY(${(1 - enter) * 16}px)`,
                background: THEME.panel, border: `2px solid ${g.color}50`, borderRadius: 12,
                padding: '16px 20px', minWidth: 130, textAlign: 'center', fontFamily: MONO,
              }}>
                <div style={{ fontSize: 26, color: g.color, fontWeight: 700 }}>{g.chars}</div>
                <div style={{ fontSize: 13, color: THEME.muted, marginTop: 4 }}>{g.owner}</div>
                <div style={{
                  marginTop: 8, fontSize: 22, color: THEME.amber, fontWeight: 800,
                  opacity: interpolate(octalT, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
                }}>{g.octal}</div>
              </div>
            );
          })}
        </div>

        <RevealLine at={legendAt} fps={fps} mark="▸" color={THEME.cyan}>{c.legend}</RevealLine>
        <RevealLine at={numsAt} fps={fps} mark="▸" color={THEME.red}>{c.nums}</RevealLine>
        <RevealLine at={keyAt} fps={fps} mark="★" color={THEME.amber}>{c.key}</RevealLine>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3 ─────────────────────────────────────────────────────────
const Scene3: React.FC<{ fps: number; c: typeof COPY['es']['s3']; b: typeof BEATS['es']['s3'] }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const suidAt = Math.round(b.suidAt * fps);
  const meaningAt = Math.round(b.meaningAt * fps);
  const findAt = Math.round(b.findAt * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 30, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 24, opacity: interpolate(frame - frame / 2, [0, 18], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.heading}
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

        <RevealLine at={meaningAt} fps={fps} mark="!" color={THEME.red}>{c.meaning}</RevealLine>
        <RevealLine at={meaningAt + Math.round(b.secondaryOffset * fps)} fps={fps} mark="▸" color={THEME.muted}>{c.secondary}</RevealLine>
        <RevealLine at={findAt} fps={fps} mark="▲" color={THEME.amber}>{c.find}</RevealLine>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4 ─────────────────────────────────────────────────────────
const Scene4: React.FC<{ fps: number; c: typeof COPY['es']['s4']; b: typeof BEATS['es']['s4'] }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const normalAt = Math.round(b.normalAt * fps);
  const suidAt = Math.round(b.suidAt * fps);
  const bonusAt = Math.round(b.bonusAt * fps);
  const smileAt = Math.round(b.smileAt * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 26, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 30, opacity: interpolate(frame - Math.round(0.4 * fps), [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.heading}
        </div>
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{
            opacity: interpolate(frame - normalAt, [0, 16], [0, 1], { extrapolateRight: 'clamp' }),
            background: THEME.panel, border: `2px solid ${THEME.green}50`, borderRadius: 12,
            padding: '24px 26px', textAlign: 'center', fontFamily: MONO,
          }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: THEME.green }}>644</div>
            <div style={{ fontSize: 15, color: THEME.muted, marginTop: 8 }}>{c.desc644}</div>
          </div>

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
            <div style={{ fontSize: 15, color: THEME.muted, marginTop: 8 }}>{c.desc4755}</div>
          </div>
        </div>

        <RevealLine at={bonusAt} fps={fps} mark="▲" color={THEME.amber}>{c.bonus}</RevealLine>
        <RevealLine at={smileAt} fps={fps} mark="★" color={THEME.green}>{c.smile}</RevealLine>
      </div>
    </AbsoluteFill>
  );
};

// ── Main ────────────────────────────────────────────────────────────
export const Li05Permissions: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
  const { fps } = useVideoConfig();
  const c = COPY[lang];
  const b = BEATS[lang];
  const vid = 'li-05-permissions';

  const [s1, s2, s3, s4] = audioTimings(vid, lang);
  const starts = sceneStartFrames(vid, fps, lang);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps);
  const dur4 = Math.ceil(s4 * fps) + fps;
  const base = audioBase(lang);

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene1.wav`)} />
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene2.wav`)} />
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene3.wav`)} />
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
      <Sequence from={starts[3]} durationInFrames={dur4}>
        <Audio src={staticFile(`${base}/li-05-permissions/li-05-scene4.wav`)} />
        <Scene4 fps={fps} c={c.s4} b={b.s4} />
      </Sequence>
    </AbsoluteFill>
  );
};
