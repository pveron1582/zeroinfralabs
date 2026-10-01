// ── video/remotion/__tests__/remotionFixtures.ts ──────────────────
// Helpers compartidos por los tests de Remotion. Se leen los fuentes
// como TEXTO en vez de importarlos: Root.tsx monta <Composition> que
// sólo funciona dentro del studio de Remotion, y los mapas de duraciones
// son datos literales que un regex ya alcanza a validar.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const REMOTION_DIR = join(process.cwd(), 'src/video/remotion');

export function remotionSource(file: string): string {
  return readFileSync(join(REMOTION_DIR, file), 'utf8');
}

/** Cuerpo de un objeto exportado, del `{` de la declaración al que lo cierra. */
function objectBody(source: string, name: string): string {
  const decl = source.indexOf(`export const ${name}`);
  if (decl < 0) throw new Error(`No se encontró export const ${name}`);
  const open = source.indexOf('{', decl);
  let depth = 0;
  let end = open;
  for (; end < source.length; end++) {
    if (source[end] === '{') depth++;
    else if (source[end] === '}' && --depth === 0) break;
  }
  return source.slice(open, end + 1);
}

/** Claves literales ('id': [...]) de un objeto exportado del archivo. */
export function mapKeys(source: string, name: string): string[] {
  return [...objectBody(source, name).matchAll(/^\s*'([^']+)':/gm)].map(m => m[1]);
}

/** Clave → cantidad de escenas (elementos del array de duraciones). */
export function timingCounts(source: string, name: string): Record<string, number> {
  const body = objectBody(source, name);
  return Object.fromEntries(
    [...body.matchAll(/^\s*'([^']+)':\s*\[([^\]]*)\]/gm)].map(m => [
      m[1],
      m[2].split(',').filter(v => v.trim()).length,
    ]),
  );
}
