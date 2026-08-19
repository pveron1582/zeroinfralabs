// ── video/remotion/compositions/Li04CreateEdit.tsx ─────────────────
// Video: crear y editar archivos — mkdir, touch, nano. Remodelado con
// los audios nuevos (voz "Miguel"): cada paso del pipeline aparece
// cuando la narración lo explica y la escena de permisos resalta la
// advertencia de /etc (solo root). Timings por silencedetect.
//
// Scene 1 (14.7s): intro — no ensucies, 3 comandos en orden
// Scene 2 (28.7s): mkdir → touch → nano, paso a paso
// Scene 3 (26.3s): dónde podés crear — /tmp, home, /etc (solo root)

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

const CENTERED: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  textAlign: 'center',
};

// ── Scene 1: intro — 3 comandos en orden ────────────────────────────
// Los `at` son RELATIVOS a la secuencia anidada (que arranca en titleEnd,
// 3.3s). Los momentos absolutos de la narración eran mkdir~4s, touch~7.8s,
// nano~10s → relativos: 0.7, 4.5, 6.7.
const ORDER_STEPS = [
  { n: '1', cmd: 'mkdir', what: 'creás la carpeta', c: THEME.cyan, at: 0.7 },
  { n: '2', cmd: 'touch', what: 'creás el archivo', c: THEME.amber, at: 4.5 },
  { n: '3', cmd: 'nano', what: 'lo editás', c: THEME.red, at: 6.7 },
];

const OrderChip: React.FC<{ step: typeof ORDER_STEPS[0]; fps: number }> = ({ step, fps }) => {
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

const Scene1: React.FC<{ fps: number }> = ({ fps }) => {
  const titleEnd = Math.round(3.3 * fps);
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={titleEnd}>
        <TitleScene
          title="CREÁ TU ESPACIO DE TRABAJO"
          subtitle="primera regla: no ensucies — trabajá en una carpeta tuya"
          fontSize={40}
        />
      </Sequence>
      <Sequence from={titleEnd}>
        <AbsoluteFill style={CENTERED}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {ORDER_STEPS.map((s) => (
              <OrderChip key={s.n} step={s} fps={fps} />
            ))}
          </div>
          <div style={{ marginTop: 34, fontSize: 21, color: THEME.muted, fontFamily: MONO }}>
            un orden muy simple — vamos a verlos
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Scene 2: mkdir → touch → nano, paso a paso ──────────────────────
// Silencias de la narración: mkdir ~0.6-3.9 · touch ~3.9-6.7 ·
// nano ~6.7-14.8 · ctrl+o/ctrl+x ~14.8-23.6 · cierre ~23.6.
const PIPELINE = [
  { n: '1', cmd: 'mkdir /tmp/trabajo', what: 'make directory — crea la carpeta', c: THEME.cyan, at: 1.0 },
  { n: '2', cmd: 'touch /tmp/trabajo/notas.txt', what: 'crea un archivo vacío', c: THEME.amber, at: 4.0 },
  { n: '3', cmd: 'nano /tmp/trabajo/notas.txt', what: 'editor de texto en la terminal', c: THEME.red, at: 7.0 },
];

const StepCard: React.FC<{ step: typeof PIPELINE[0]; fps: number }> = ({ step, fps }) => {
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

const Scene2: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const ctrlAt = Math.round(19.0 * fps);
  const closeAt = Math.round(23.6 * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 36 }}>
          CARPETA → ARCHIVO → EDITOR
        </div>
        <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PIPELINE.map((s) => (
            <StepCard key={s.n} step={s} fps={fps} />
          ))}
        </div>

        <div style={{ marginTop: 30, fontSize: 20, color: THEME.cyan, fontFamily: MONO, opacity: interpolate(frame - ctrlAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          en nano: <span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+O</span> guardar ·{' '}
          <span style={{ color: THEME.text, fontWeight: 700 }}>Ctrl+X</span> salir
        </div>

        <div style={{ marginTop: 26, fontSize: 19, color: THEME.muted, fontFamily: MONO, opacity: interpolate(frame - closeAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          carpeta, archivo, editor — así dejás notas y scripts en cualquier sistema
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: dónde podés crear ──────────────────────────────────────
const LOCATIONS = [
  { path: '/tmp', allowed: true, label: 'siempre — carpeta temporal', c: THEME.cyan, at: 3.4 },
  { path: '/home/tu_usuario', allowed: true, label: 'tu home', c: THEME.green, at: 8.0 },
  { path: '/etc', allowed: false, label: 'solo root — config del sistema', c: THEME.red, at: 11.5 },
];

const LocationChip: React.FC<{ loc: typeof LOCATIONS[0]; fps: number }> = ({ loc, fps }) => {
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
      <div style={{ fontSize: 30, margin: '10px 0' }}>{loc.allowed ? '✓' : '✗'}</div>
      <div style={{ fontSize: 13, color: THEME.muted }}>{loc.label}</div>
    </div>
  );
};

const Scene3: React.FC<{ fps: number }> = ({ fps }) => {
  const frame = useCurrentFrame();
  const introAt = Math.round(1.7 * fps);
  const warningAt = Math.round(16.0 * fps);
  const attackerAt = Math.round(22.9 * fps);

  return (
    <AbsoluteFill>
      <div style={CENTERED}>
        <div style={{ fontSize: 28, fontWeight: 800, color: THEME.text, fontFamily: MONO, marginBottom: 16, opacity: interpolate(frame - introAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          NO TODAS LAS CARPETAS TE DEJAN ESCRIBIR
        </div>
        <div style={{ fontSize: 19, color: THEME.muted, fontFamily: MONO, marginBottom: 32, opacity: interpolate(frame - introAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          hay que mirar los permisos
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {LOCATIONS.map((l) => (
            <LocationChip key={l.path} loc={l} fps={fps} />
          ))}
        </div>

        <div style={{ marginTop: 30, fontSize: 19, color: THEME.red, fontFamily: MONO, opacity: interpolate(frame - warningAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          en /etc con un usuario normal → el sistema lo rechaza (Permission denied)
        </div>
        <div style={{ marginTop: 24, fontSize: 20, color: THEME.cyan, fontFamily: MONO, opacity: interpolate(frame - attackerAt, [0, 15], [0, 1], { extrapolateRight: 'clamp' }) }}>
          por eso los atacantes trabajan desde <span style={{ color: THEME.text, fontWeight: 700 }}>/tmp</span>: siempre pueden escribir sin pedir permiso
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Li04CreateEdit: React.FC = () => {
  const { fps } = useVideoConfig();

  const [s1, s2, s3] = AUDIO_TIMINGS['li-04-create-edit'];
  const starts = sceneStartFrames('li-04-create-edit', fps);
  const dur1 = Math.ceil(s1 * fps);
  const dur2 = Math.ceil(s2 * fps);
  const dur3 = Math.ceil(s3 * fps) + fps;

  return (
    <AbsoluteFill style={{ background: THEME.bg, padding: 60, fontFamily: MONO }}>
      <FontFace />

      {/* Scene 1: intro */}
      <Sequence from={starts[0]} durationInFrames={dur1}>
        <Audio src={staticFile('videos/audio/li-04-create-edit/li-04-scene1.wav')} />
        <Scene1 fps={fps} />
      </Sequence>

      {/* Scene 2: pipeline */}
      <Sequence from={starts[1]} durationInFrames={dur2}>
        <Audio src={staticFile('videos/audio/li-04-create-edit/li-04-scene2.wav')} />
        <Scene2 fps={fps} />
      </Sequence>

      {/* Scene 3: dónde podés crear */}
      <Sequence from={starts[2]} durationInFrames={dur3}>
        <Audio src={staticFile('videos/audio/li-04-create-edit/li-04-scene3.wav')} />
        <Scene3 fps={fps} />
      </Sequence>
    </AbsoluteFill>
  );
};