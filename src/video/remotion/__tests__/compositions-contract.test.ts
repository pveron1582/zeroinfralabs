// ── video/remotion/__tests__/compositions-contract.test.ts ────────
// @vitest-environment node
// Root.tsx registra las <Composition> A MANO (59 archivos de composición
// → 118 bloques ES+EN). Nada de esto lo ve `tsc` ni la suite web: los
// errores aparecen recién al abrir el studio o renderizar. Remotion tira
// `Multiple composition with id X are registered.` con un id repetido, y
// un `totalDurationFrames('clave-mal-tipiada')` cae en el `|| []` y
// devuelve sólo el buffer de 1s ⇒ video corto. Este test lee el fuente
// como texto y es la verja del registro.

import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { REMOTION_DIR, remotionSource, mapKeys, timingCounts, compositionBlocks } from './remotionFixtures';

const root = remotionSource('Root.tsx');
const audio = remotionSource('audioTimings.ts');

interface Comp {
  id: string;
  component: string;
  lang: string;
  audioId: string;
  audioLang: string | null;
  fps: string;
  width: number;
  height: number;
}

const field = (text: string, re: RegExp, label: string): string => {
  const m = text.match(re);
  if (!m) throw new Error(`Composition sin ${label}: ${text.replace(/\s+/g, ' ').slice(0, 90)}`);
  return m[1];
};

const blocks: Comp[] = compositionBlocks(root).map(t => {
  const dur = t.match(/totalDurationFrames\('([^']+)',\s*FPS(?:,\s*'(en)')?\)/);
  if (!dur) throw new Error(`Composition sin durationInFrames: ${t.replace(/\s+/g, ' ').slice(0, 90)}`);
  // Dos formas: `component={() => <X lang="es" />}` y `component={X}` (usa el
  // default `lang = 'es'` de la composición — sólo li-01 queda así).
  const comp = t.match(/component=\{\(\) => <(\w+) lang="(es|en)" \/>}/) ?? t.match(/component=\{(\w+)\}/);
  if (!comp) throw new Error(`Composition sin component: ${t.replace(/\s+/g, ' ').slice(0, 90)}`);
  return {
    id: field(t, /id="([^"]+)"/, 'id'),
    component: comp[1],
    lang: comp[2] ?? 'es',
    audioId: dur[1],
    audioLang: dur[2] ?? null,
    fps: field(t, /fps=\{(\w+)\}/, 'fps'),
    width: Number(field(t, /width=\{(\d+)\}/, 'width')),
    height: Number(field(t, /height=\{(\d+)\}/, 'height')),
  };
});

const imports = [...root.matchAll(/import \{ (\w+) \} from '\.\/compositions\/(\w+)'/g)]
  .map(m => ({ name: m[1], file: m[2] }));

const files = readdirSync(join(REMOTION_DIR, 'compositions'))
  .filter(f => f.endsWith('.tsx'))
  .map(f => f.replace(/\.tsx$/, ''))
  .sort();

const esKeys = mapKeys(audio, 'AUDIO_TIMINGS');
const enKeys = mapKeys(audio, 'AUDIO_TIMINGS_EN');
const esCounts = timingCounts(audio, 'AUDIO_TIMINGS');
const enCounts = timingCounts(audio, 'AUDIO_TIMINGS_EN');

/** El `const VID` con el que la composición le pide sus escenas. */
function compositionInfo(file: string): { vid: string; scenes: number } {
  const src = remotionSource(`compositions/${file}.tsx`);
  const vid = src.match(/const (?:VID|vid) = '([^']+)'/)?.[1];
  if (!vid) throw new Error(`${file}.tsx no declara const VID`);
  const scenes = src.match(/const \[([^\]]+)\] = audioTimings\(/)?.[1].split(',').length;
  if (!scenes) throw new Error(`${file}.tsx no destructura audioTimings()`);
  return { vid, scenes };
}

describe('Root de Remotion — registro de composiciones', () => {
  it('ningún id está registrado dos veces', () => {
    const seen = new Map<string, number>();
    for (const b of blocks) seen.set(b.id, (seen.get(b.id) ?? 0) + 1);
    const dupes = [...seen].filter(([, n]) => n > 1).map(([id, n]) => `${id} (${n}×)`);
    expect(dupes).toEqual([]);
    expect(blocks).toHaveLength(seen.size);
  });

  it('los ids sólo usan caracteres que Remotion acepta', () => {
    expect(blocks.length).toBeGreaterThan(100);
    for (const b of blocks) expect(b.id).toMatch(/^[a-zA-Z0-9-]+$/);
  });

  it('todo archivo de compositions/ está importado y registrado', () => {
    expect(imports.map(i => i.file).sort()).toEqual(files);
    expect(new Set(imports.map(i => i.file)).size).toBe(imports.length);

    const names = new Set(imports.map(i => i.name));
    expect(blocks.filter(b => !names.has(b.component)).map(b => b.id)).toEqual([]);

    const registered = new Set(blocks.map(b => b.component));
    expect(imports.filter(i => !registered.has(i.name)).map(i => i.file)).toEqual([]);
  });

  it('lang, id y durationInFrames apuntan todos al mismo idioma', () => {
    for (const b of blocks) {
      const isEn = b.id.endsWith('-en');
      expect(b.lang, b.id).toBe(isEn ? 'en' : 'es');
      expect(b.audioLang, b.id).toBe(isEn ? 'en' : null);
    }
  });

  it('todas las composiciones son 1280×720 a 30 fps', () => {
    expect(new Set(blocks.map(b => `${b.width}x${b.height}`))).toEqual(new Set(['1280x720']));
    expect(new Set(blocks.map(b => b.fps))).toEqual(new Set(['FPS']));
    expect(root).toMatch(/const FPS = 30\b/);
  });

  it('cada registro apunta a una clave real de AUDIO_TIMINGS', () => {
    for (const b of blocks) {
      const keys = b.audioLang === 'en' ? enKeys : esKeys;
      expect(keys, b.id).toContain(b.audioId);
    }
  });

  it('los registros cubren exactamente las claves de los dos mapas', () => {
    const esUsed = [...new Set(blocks.filter(b => b.audioLang === null).map(b => b.audioId))].sort();
    const enUsed = [...new Set(blocks.filter(b => b.audioLang === 'en').map(b => b.audioId))].sort();
    expect(esUsed).toEqual([...esKeys].sort());
    expect(enUsed).toEqual([...enKeys].sort());
  });
});

describe('composiciones ↔ timings', () => {
  it('cada composición le pide el audio con la misma clave que su registro', () => {
    for (const imp of imports) {
      const info = compositionInfo(imp.file);
      const referenced = new Set(blocks.filter(b => b.component === imp.name).map(b => b.audioId));
      expect([...referenced], imp.file).toEqual([info.vid]);
    }
  });

  it('destructura exactamente las escenas que tiene el audio (ES y EN)', () => {
    // Si alguien agrega un escena de audio sin sumarla al destructuring,
    // la última escena nunca se muestra; si sobra, `s3` queda undefined.
    for (const imp of imports) {
      const { vid, scenes } = compositionInfo(imp.file);
      expect(esCounts[vid], `${imp.file} (es)`).toBe(scenes);
      expect(enCounts[vid], `${imp.file} (en)`).toBe(scenes);
    }
  });

  it('exporta el componente con el nombre del archivo y props de idioma', () => {
    for (const imp of imports) {
      const src = remotionSource(`compositions/${imp.file}.tsx`);
      expect(src, imp.file).toMatch(
        new RegExp(`export const ${imp.name}: React\\.FC<\\{ lang\\?: 'es' \\| 'en' \\}>`),
      );
    }
  });
});
