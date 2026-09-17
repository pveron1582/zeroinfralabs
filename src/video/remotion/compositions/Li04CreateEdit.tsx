// ── video/remotion/compositions/Li04CreateEdit.tsx ─────────────────
// Video: crear y editar archivos — mkdir, touch, nano. Versión unificada
// ES/EN con `lang` prop. Timings por silencedetect.

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
import { sceneStartFrames, audioTimings, audioBase, hasAudio } from '../audioTimings';
import { THEME, MONO } from '../theme';
import { FontFace } from '../fonts';
import { TitleScene } from '../primitives/TitleScene';

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
      title: 'CREÁ TU ESPACIO DE TRABAJO',
      subtitle: 'primera regla: no ensucies — trabajá en una carpeta tuya',
      outro: 'un orden muy simple — vamos a verlos',
      orderSteps: [
        { n: '1', cmd: 'mkdir', what: 'creás la carpeta', c: THEME.cyan, at: 4.6 },
        { n: '2', cmd: 'touch', what: 'creás el archivo', c: THEME.amber, at: 6.8 },
        { n: '3', cmd: 'nano', what: 'lo editás', c: THEME.red, at: 8.7 },
      ],
    },
    s2: {
      heading: 'CARPETA → ARCHIVO → EDITOR',
      ctrlHint: <>en nano: <span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+O</span> guardar ·{' '}<span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+X</span> salir</>,
      footer: 'carpeta, archivo, editor — así dejás notas y scripts en cualquier sistema',
      pipeline: [
        { n: '1', cmd: 'mkdir /tmp/trabajo', what: 'make directory — crea la carpeta', c: THEME.cyan, at: 1.0 },
        { n: '2', cmd: 'touch /tmp/trabajo/notas.txt', what: 'crea un archivo vacío', c: THEME.amber, at: 4.0 },
        { n: '3', cmd: 'nano /tmp/trabajo/notas.txt', what: 'editor de texto en la terminal', c: THEME.red, at: 7.0 },
      ],
    },
    s3: {
      intro: 'NO TODAS LAS CARPETAS TE DEJAN ESCRIBIR',
      introSub: 'hay que mirar los permisos',
      warning: 'en /etc con un usuario normal → el sistema lo rechaza (Permission denied)',
      attacker: <>por eso los atacantes trabajan desde <span style={{ color: THEME.text, fontWeight: 700 }}>/tmp</span>: siempre pueden escribir sin pedir permiso</>,
      locations: [
        { path: '/tmp', allowed: true, label: 'siempre — carpeta temporal', c: THEME.cyan, at: 3.4 },
        { path: '/home/tu_usuario', allowed: true, label: 'tu home', c: THEME.green, at: 8.0 },
        { path: '/etc', allowed: false, label: 'solo root — config del sistema', c: THEME.red, at: 9.5 },
      ],
    },
  },
  en: {
    s1: {
      title: 'BUILD YOUR WORKSPACE',
      subtitle: "first rule: don't make a mess — work in a folder of your own",
      outro: "a very simple order — let's see them",
      orderSteps: [
        { n: '1', cmd: 'mkdir', what: 'you create the folder', c: THEME.cyan, at: 7.2 },
        { n: '2', cmd: 'touch', what: 'you create the file', c: THEME.amber, at: 9.7 },
        { n: '3', cmd: 'nano', what: 'you edit it', c: THEME.red, at: 11.6 },
      ],
    },
    s2: {
      heading: 'FOLDER → FILE → EDITOR',
      ctrlHint: <>in nano: <span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+O</span> save ·{' '}<span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+X</span> exit</>,
      footer: 'folder, file, editor — leave notes and scripts on any system',
      pipeline: [
        { n: '1', cmd: 'mkdir /tmp/trabajo', what: 'make directory — creates the folder', c: THEME.cyan, at: 0.2 },
        { n: '2', cmd: 'touch /tmp/trabajo/notas.txt', what: 'creates an empty file', c: THEME.amber, at: 12.6 },
        { n: '3', cmd: 'nano /tmp/trabajo/notas.txt', what: 'text editor inside the terminal', c: THEME.red, at: 18.0 },
      ],
    },
    s3: {
      intro: 'NOT EVERY FOLDER LETS YOU WRITE',
      introSub: 'you have to look at the permissions',
      warning: 'in /etc as a regular user → the system rejects you (Permission denied)',
      attacker: <>that's why attackers work from <span style={{ color: THEME.text, fontWeight: 700 }}>/tmp</span>: the one place they can always write without asking permission</>,
      locations: [
        { path: '/tmp', allowed: true, label: 'always — the temporary folder', c: THEME.cyan, at: 4.4 },
        { path: '/home/tu_usuario', allowed: true, label: 'your home', c: THEME.green, at: 10.3 },
        { path: '/etc', allowed: false, label: 'root only — system config', c: THEME.red, at: 13.1 },
      ],
    },
  },
};

// ── BEATS (seconds, multiplied by fps at use site) ──────────────────
const BEATS = {
  es: {
    s1: { titleEnd: 3.3, outroAt: 10.7 },
    s2: { ctrlAt: 11.5, closeAt: 15.2 },
    s3: { introAt: 0.3, warningAt: 15.5, attackerAt: 17.0 },
  },
  en: {
    s1: { titleEnd: 3.3, outroAt: 12.3 },
    s2: { ctrlAt: 23.2, closeAt: 29.0 },
    s3: { introAt: 0.3, warningAt: 19.1, attackerAt: 22.9 },
  },
};

const VID = 'li-04-create-edit';

// ── Scene 1: intro — 3 comandos en orden ────────────────────────────
const OrderChip: React.FC<{ step: typeof COPY.es.s1.orderSteps[0]; fps: number }> = ({ step, fps }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(step.at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
      transform: `translateY(${(1 - enter) * 20}px)`,
      display: 'flex', alignItems: 'center', gap: 14,
      background: THEME.panel, border: `2px solid ${step.c}50`, borderRadius: 12,
      padding: '18px 26px', fontFamily: MONO,
    }}>
      <span style={{ fontSize: 30, fontWeight: 800, color: step.c }}>{step.n}</span>
      <span style={{ fontSize: 26, color: THEME.text, fontWeight: 700 }}>{step.cmd}</span>
      <span style={{ fontSize: 17, color: THEME.muted }}>{step.what}</span>
    </div>
  );
};

const OutroText: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      marginTop: 34, fontSize: 21, color: THEME.muted, fontFamily: MONO,
      opacity: interpolate(frame - at, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
    }}>
      {text}
    </div>
  );
};

const Scene1: React.FC<{ fps: number; c: typeof COPY.es.s1; b: typeof BEATS.es.s1 }> = ({ fps, c, b }) => {
  const titleEnd = Math.round(b.titleEnd * fps);
  const outroAt = Math.round(b.outroAt * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title={c.title}
          subtitle={c.subtitle}
          fontSize={40}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {c.orderSteps.map((s) => (
              <OrderChip key={s.n} step={s} fps={fps} />
            ))}
          </div>
          <OutroText at={outroAt} text={c.outro} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: mkdir → touch → nano, paso a paso ──────────────────────
const StepCard: React.FC<{ step: typeof COPY.es.s2.pipeline[0]; fps: number }> = ({ step, fps }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(step.at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 12], [0, 1], { extrapolateRight: 'clamp' }),
      transform: `translateX(${(1 - enter) * 24}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      background: THEME.panel, border: `2px solid ${step.c}50`, borderRadius: 12,
      padding: '22px 24px', minWidth: 250, fontFamily: MONO,
    }}>
      <div style={{ fontSize: 38, fontWeight: 800, color: step.c }}>{step.n}</div>
      <div style={{ fontSize: 18, color: THEME.text, fontWeight: 700 }}>{step.cmd}</div>
      <div style={{ fontSize: 14, color: THEME.muted }}>{step.what}</div>
    </div>
  );
};

const Scene2: React.FC<{ fps: number; c: typeof COPY.es.s2; b: typeof BEATS.es.s2 }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const ctrlAt = Math.round(b.ctrlAt * fps);
  const closeAt = Math.round(b.closeAt * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 36 }}>
          {c.heading}
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
          {c.pipeline.map((s) => (
            <StepCard key={s.n} step={s} fps={fps} />
          ))}
        </div>

        <div style={{ marginTop: 30, fontSize: 20, color: THEME.cyan, fontFamily: MONO, opacity: interpolate(frame - ctrlAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.ctrlHint}
        </div>

        <div style={{ marginTop: 26, fontSize: 19, color: THEME.muted, fontFamily: MONO, opacity: interpolate(frame - closeAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.footer}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: dónde podés crear ──────────────────────────────────────
const LocationChip: React.FC<{ loc: typeof COPY.es.s3.locations[0]; fps: number }> = ({ loc, fps }) => {
  const frame = useCurrentFrame();
  const t = frame - Math.round(loc.at * fps);
  const enter = spring({ frame: t, fps, config: { damping: 200 } });
  return (
    <div style={{
      opacity: interpolate(t, [0, 15], [0, 1], { extrapolateRight: 'clamp' }),
      transform: `translateY(${(1 - enter) * 16}px)`,
      background: THEME.panel, border: `2px solid ${loc.c}50`, borderRadius: 12,
      padding: '24px 22px', minWidth: 210, textAlign: 'center', fontFamily: MONO,
    }}>
      <div style={{ fontSize: 22, color: loc.c, fontWeight: 700 }}>{loc.path}</div>
      <div style={{ fontSize: 34, margin: '10px 0', fontWeight: 800, color: loc.allowed ? THEME.green : THEME.red }}>
        {loc.allowed ? '✓' : '✗'}
      </div>
      <div style={{ fontSize: 13, color: THEME.muted }}>{loc.label}</div>
    </div>
  );
};

const Scene3: React.FC<{ fps: number; c: typeof COPY.es.s3; b: typeof BEATS.es.s3 }> = ({ fps, c, b }) => {
  const frame = useCurrentFrame();
  const introAt = Math.round(b.introAt * fps);
  const warningAt = Math.round(b.warningAt * fps);
  const attackerAt = Math.round(b.attackerAt * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16, opacity: interpolate(frame - introAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.intro}
        </div>
        <div style={{ fontSize: 19, color: THEME.muted, fontFamily: MONO, marginBottom: 32, opacity: interpolate(frame - introAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.introSub}
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {c.locations.map((l) => (
            <LocationChip key={l.path} loc={l} fps={fps} />
          ))}
        </div>

        <div style={{ marginTop: 30, fontSize: 19, color: THEME.red, fontFamily: MONO, opacity: interpolate(frame - warningAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.warning}
        </div>
        <div style={{ marginTop: 24, fontSize: 20, color: THEME.cyan, fontFamily: MONO, opacity: interpolate(frame - attackerAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          {c.attacker}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Componente principal ────────────────────────────────────────────
export const Li04CreateEdit: React.FC<{ lang?: 'es' | 'en' }> = ({ lang = 'es' }) => {
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

      {/* Scene 1: intro */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/li-04-scene1.wav`)} />}
        <Scene1 fps={fps} c={c.s1} b={b.s1} />
      </Sequence>

      {/* Scene 2: pipeline */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/li-04-scene2.wav`)} />}
        <Scene2 fps={fps} c={c.s2} b={b.s2} />
      </Sequence>

      {/* Scene 3: dónde podés crear */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        {hasAudio(VID) && <Audio src={staticFile(`${base}/${VID}/li-04-scene3.wav`)} />}
        <Scene3 fps={fps} c={c.s3} b={b.s3} />
      </Sequence>
    </AbsoluteFill>
  );
};
