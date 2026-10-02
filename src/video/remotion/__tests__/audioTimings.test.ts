// ── video/remotion/__tests__/audioTimings.test.ts ─────────────────
// @vitest-environment node  (lógica pura, sin DOM)
// `audioTimings.ts` es el que calcula la duración de cada video: si una
// clave se tipea mal, `totalDurationFrames` devuelve el buffer de 1s y el
// video se renderiza corto/mudo sin que nadie lo note. Acá se cubren las
// funciones puras + el contrato de los dos mapas de duraciones (ES/EN).

import { describe, it, expect } from 'vitest';
import { remotionSource, mapKeys } from './remotionFixtures';
import {
  audioTimings,
  audioBase,
  hasAudio,
  sceneStartFrames,
  totalDurationSec,
  totalDurationFrames,
  SCENE_GAP,
  AUDIO_TIMINGS,
  AUDIO_TIMINGS_EN,
} from '../audioTimings';

const source = remotionSource('audioTimings.ts');

describe('audioTimings — funciones puras', () => {
  it('devuelve las duraciones del idioma pedido (default es)', () => {
    expect(audioTimings('linux-01-linux-history')).toEqual([15.28, 20.4, 19.2, 17.92]);
    expect(audioTimings('linux-01-linux-history', 'es')).toEqual([15.28, 20.4, 19.2, 17.92]);
    expect(audioTimings('linux-01-linux-history', 'en')).toEqual([16.4, 20.96, 22.08, 16.64]);
  });

  it('una clave inexistente da [] y no revienta', () => {
    expect(audioTimings('no-existe')).toEqual([]);
    expect(audioTimings('no-existe', 'en')).toEqual([]);
  });

  it('sceneStartFrames acumula audios + gap y arranca en 0', () => {
    // 15.28s → 15.58 con gap → 467 frames; después +20.4+0.3 → 1088; +19.2+0.3 → 1673
    expect(sceneStartFrames('linux-01-linux-history', 30)).toEqual([0, 467, 1088, 1673]);
    expect(sceneStartFrames('no-existe', 30)).toEqual([]);
    // Con otro fps los frames cambian pero el primer cuadro sigue en 0
    expect(sceneStartFrames('linux-01-linux-history', 60)[0]).toBe(0);
  });

  it('sceneStartFrames es estrictamente creciente en cualquier video e idioma', () => {
    for (const [id, timings] of Object.entries({ ...AUDIO_TIMINGS, ...AUDIO_TIMINGS_EN })) {
      const frames = sceneStartFrames(id, 30);
      expect(frames).toHaveLength(timings.length);
      expect(frames[0]).toBe(0);
      for (let i = 1; i < frames.length; i++) expect(frames[i]).toBeGreaterThan(frames[i - 1]);
    }
  });

  it('totalDurationSec suma los audios y agrega el gap entre escenas', () => {
    expect(SCENE_GAP).toBe(0.3);
    // 15.28+20.40+19.20+17.92 = 72.80 + 3 gaps de 0.3
    expect(totalDurationSec('linux-01-linux-history')).toBeCloseTo(73.7, 5);
    // Sin escenas no hay gaps (reduce sobre [] + max(0, -1))
    expect(totalDurationSec('no-existe')).toBe(0);
  });

  it('totalDurationFrames redondea hacia arriba y reserva 1s de buffer', () => {
    expect(totalDurationFrames('linux-01-linux-history', 30)).toBe(Math.ceil(73.7 * 30) + 30);
    expect(totalDurationFrames('linux-01-linux-history', 30)).toBe(2241);
    // El idioma EN tiene otras duraciones ⇒ otra duración en frames
    expect(totalDurationFrames('linux-01-linux-history', 30, 'en')).toBe(2340);
    expect(totalDurationFrames('linux-01-linux-history', 60, 'en')).toBeGreaterThan(
      totalDurationFrames('linux-01-linux-history', 30, 'en'),
    );
  });

  it('audioBase apunta a la carpeta de audios correcta', () => {
    expect(audioBase('es')).toBe('videos/audio-es');
    expect(audioBase('en')).toBe('videos/audio-en');
  });

  it('hoy ningún video queda mudo (AUDIO_PENDING vacío)', () => {
    for (const id of Object.keys(AUDIO_TIMINGS)) expect(hasAudio(id)).toBe(true);
    expect(hasAudio('id-que-no-existe')).toBe(true);
  });
});

describe('audioTimings — contrato de los mapas de duraciones', () => {
  const esKeys = mapKeys(source, 'AUDIO_TIMINGS');
  const enKeys = mapKeys(source, 'AUDIO_TIMINGS_EN');

  it('los dos mapas cubren exactamente los mismos videos', () => {
    expect(esKeys.length).toBeGreaterThan(50);
    expect([...enKeys].sort()).toEqual([...esKeys].sort());
  });

  it('las claves tienen el formato de id de video', () => {
    // `<lessonId>-<slug>` — el id puede traer mayúscula (networksI, networksII).
    for (const id of [...esKeys, ...enKeys]) expect(id).toMatch(/^[a-zA-Z0-9-]+$/);
  });

  it('toda duración es un número positivo y el ES y el EN tienen las mismas escenas', () => {
    for (const id of esKeys) {
      const es = AUDIO_TIMINGS[id];
      const en = AUDIO_TIMINGS_EN[id];
      expect(es.length).toBeGreaterThan(0);
      expect(en.length).toBe(es.length);
      for (const secs of [es, en]) {
        for (const s of secs) expect(s).toBeGreaterThan(0);
      }
    }
  });

  it('el archivo no deja timings huérfanos fuera de los dos mapas', () => {
    // Todas las claves literales del archivo tienen que pertenecer a un mapa
    // (si alguien agrega una línea suelta con formato 'id': [...]).
    const allLiterals = [...source.matchAll(/^\s*'([a-zA-Z0-9-]+)':\s*\[/gm)].map(m => m[1]);
    expect(new Set(allLiterals).size).toBe(esKeys.length);
  });
});
