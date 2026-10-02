// ── academy/__tests__/media-naming.test.ts ────────────────────────
// Contrato de nombres de media: TODO archivo de video, audio y guion de
// locución sigue el esquema `<lessonId>-<slug>` de las rutas nuevas,
// así algo se encuentra por el nombre de la lección. Si alguien agrega
// una clase con un nombre inventado, esto explota ANTES de subir el
// archivo al CDN (jsDelivr) o de romper un render de Remotion.
//
// La lección es la fuente de verdad: de su step de video sale el
// `<slug>` que después se espera encontrar en media/videos/{es,en},
// media/videos/audio-{es,en}/ y voicebox-scripts/{es,en}/<módulo>/.
//
// Ojo con `voicebox-scripts`: los guiones EN son material intermedio
// sin trackear (`.gitignore`), así que se chequean sólo si existen.

import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { AUDIO_TIMINGS, AUDIO_TIMINGS_EN } from '../../video/remotion/audioTimings';
import type { Lesson } from '../../types';
import { getAllLessons } from '../paths';

const MEDIA = join(process.cwd(), 'media', 'videos');
const VOICEBOX = join(process.cwd(), 'voicebox-scripts');

interface Row {
  lessonId: string;
  /** Idioma del módulo: linux, fundaments, pentesting, bash… */
  mod: string;
  /** `<lessonId>-<slug>` — nombre base de mp4, carpeta de audio y prefijo de escenas. */
  base: string;
}

const nombre = (p: string): string => p.slice(p.lastIndexOf('/') + 1);

function fila(lesson: Lesson): Row {
  const step = lesson.steps.find(s => s.type === 'video');
  if (!step || step.type !== 'video') throw new Error(`lección sin step de video: ${lesson.id}`);
  const es = nombre(step.src);
  const en = nombre(step.srcEn ?? step.src);
  if (es !== en) throw new Error(`${lesson.id}: src ES (${es}) y EN (${en}) no coinciden`);
  if (!es.endsWith('.mp4')) throw new Error(`${lesson.id}: el video no es .mp4: ${es}`);
  return {
    lessonId: lesson.id,
    mod: lesson.id.replace(/-\d+$/, ''),
    base: es.slice(0, -'.mp4'.length),
  };
}

const rows = getAllLessons().map(fila);

describe('media-naming — el esquema <lessonId>-<slug>', () => {
  it('cada video se llama <lessonId>-<slug>.mp4 (la clase se encuentra por su id)', () => {
    for (const r of rows) {
      expect(r.base.startsWith(`${r.lessonId}-`), `${r.lessonId}: ${r.base}`).toBe(true);
      expect(r.base.slice(r.lessonId.length + 1), r.lessonId).toMatch(/^[a-z0-9-]+$/);
      expect(r.mod, r.lessonId).toMatch(/^[a-z]+[a-zA-Z0-9]*$/); // networksI, networksII…
    }
  });

  it('media/videos/{es,en} tiene exactamente los videos de las lecciones (sin huérfanos)', () => {
    for (const lang of ['es', 'en'] as const) {
      const enDisco = readdirSync(join(MEDIA, lang)).sort();
      const esperados = rows.map(r => `${r.base}.mp4`).sort();
      expect(enDisco, `media/videos/${lang}`).toEqual(esperados);
    }
  });

  it('las carpetas de audio final coinciden con los videos y traen <lessonId>-sceneN.wav', () => {
    for (const lang of ['es', 'en'] as const) {
      const carpetas = readdirSync(join(MEDIA, `audio-${lang}`)).sort();
      expect(carpetas, `audio-${lang}`).toEqual(rows.map(r => r.base).sort());
    }
    for (const r of rows) {
      const escenas = AUDIO_TIMINGS[r.base]?.length ?? 0;
      expect(escenas, `sin timings para ${r.base}`).toBeGreaterThan(0);
      expect(AUDIO_TIMINGS_EN[r.base]?.length, `timings EN de ${r.base}`).toBe(escenas);
      for (const lang of ['es', 'en'] as const) {
        const wavs = readdirSync(join(MEDIA, `audio-${lang}`, r.base)).sort();
        const esperados = Array.from({ length: escenas }, (_, i) => `${r.lessonId}-scene${i + 1}.wav`);
        expect(wavs, `audio-${lang}/${r.base}`).toEqual(esperados);
      }
    }
  });

  it('AUDIO_TIMINGS y AUDIO_TIMINGS_EN usan las mismas claves que los videos', () => {
    const esperado = rows.map(r => r.base).sort();
    expect(Object.keys(AUDIO_TIMINGS).sort()).toEqual(esperado);
    expect(Object.keys(AUDIO_TIMINGS_EN).sort()).toEqual(esperado);
  });

  it('los guiones de voz viven en voicebox-scripts/<idioma>/<módulo>/<lessonId>-sceneN.txt', () => {
    if (!existsSync(VOICEBOX)) return; // material intermedio no trackeado
    // ni archivos sueltos en la raíz ni carpetas con el viejo orden por tema
    // (hacking-etico/, redes/, sistemas-operativos/, scripts/)
    expect(readdirSync(VOICEBOX).filter(e => e !== 'es' && e !== 'en')).toEqual([]);
    for (const lang of ['es', 'en'] as const) {
      const dir = join(VOICEBOX, lang);
      if (!existsSync(dir)) continue; // los guiones EN pueden no estar en un checkout limpio
      expect(readdirSync(dir).sort(), `${lang}/`).toEqual([...new Set(rows.map(r => r.mod))].sort());
      for (const r of rows) {
        const escenas = AUDIO_TIMINGS[r.base]?.length ?? 0;
        const guiones = readdirSync(join(dir, r.mod))
          .filter(f => f.startsWith(`${r.lessonId}-`) && f.endsWith('.txt')).sort();
        const esperados = Array.from({ length: escenas }, (_, i) => `${r.lessonId}-scene${i + 1}.txt`);
        expect(guiones, `${lang}/${r.mod}/${r.lessonId}`).toEqual(esperados);
      }
    }
  });
});
