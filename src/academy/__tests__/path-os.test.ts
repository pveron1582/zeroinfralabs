// ── academy/__tests__/path-os.test.ts ──────────────────────────────
// @vitest-environment node  (lógica pura, sin DOM)
// Los 3 paths de Sistemas Operativos pasaron a ser paths de primer nivel
// (antes: una entrada 'os' con subsecciones y rutas /academy/os/module/<sub>).
// Acá se cubre ese contrato + las URLs legacy que siguen llegando por
// bookmarks y SEO viejo. Ver docs/PROYECTO_ACADEMY.md.

import { describe, it, expect } from 'vitest';
import { ACADEMY_PATHS, legacyPathId, findPathIdForLesson, getLesson } from '../paths';
import { OS_PATHS } from '../path-os';

describe('paths de Sistemas Operativos (rutas /academy/<módulo>)', () => {
  it('existen como paths de primer nivel con sus lecciones', () => {
    expect(OS_PATHS.map(p => p.id)).toEqual(['linux', 'windows', 'others']);
    expect(OS_PATHS.flatMap(p => p.lessons)).toHaveLength(14); // 5 + 5 + 4
    // Ninguno conserva subsecciones: la ruta es /academy/<path>/<lección>
    for (const p of OS_PATHS) expect(p.subSections).toBeUndefined();
    // Y están los 3 en el registro general, antes que el resto de los paths
    expect(ACADEMY_PATHS.slice(0, 3)).toEqual(OS_PATHS);
  });

  it('el path legacy "os" ya no existe', () => {
    expect(ACADEMY_PATHS.some(p => (p.id as string) === 'os')).toBe(false);
    expect(getLesson('os', 'linux-01')).toBeUndefined();
    // Las lecciones quedaron en su propio path
    expect(getLesson('linux', 'linux-01')?.pathId).toBe('linux');
    expect(getLesson('windows', 'windows-01')?.pathId).toBe('windows');
    expect(getLesson('others', 'others-03')?.pathId).toBe('others');
  });

  it('legacyPathId resuelve las URLs viejas de SO', () => {
    expect(legacyPathId('os')).toBe('linux'); // /academy/os
    expect(legacyPathId('os', 'windows')).toBe('windows'); // /academy/os/module/windows
    expect(legacyPathId('os', 'no-existe')).toBe('linux'); // subId inválido → primer módulo
    expect(legacyPathId('scripting')).toBeUndefined(); // path vigente, no legacy
    expect(legacyPathId('linux')).toBeUndefined(); // ya es la ruta nueva
  });

  it('findPathIdForLesson encuentra el path de una lección sin importar su pathId', () => {
    expect(findPathIdForLesson('linux-01')).toBe('linux');
    expect(findPathIdForLesson('windows-01')).toBe('windows');
    expect(findPathIdForLesson('others-03')).toBe('others');
    expect(findPathIdForLesson('bash-01')).toBe('scripting');
    expect(findPathIdForLesson('no-existe')).toBeUndefined();
  });
});
