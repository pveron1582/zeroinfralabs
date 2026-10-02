// ── academy/__tests__/legacy-ids.test.ts ───────────────────────────
// @vitest-environment node (lógica pura, sin DOM)
// Contrato de `academy/legacyIds.ts`: los alias que resuelven URLs viejas
// (bookmarks y SEO: /academy/redes, /academy/protocolos/proto-07…) y el
// progreso persistido con ids anteriores. El RENDER de las redirecciones
// está en components/__tests__/academy-legacy-routes.test.tsx y la
// migración del snapshot en store/__tests__/persistMigrate.test.ts.

import { describe, it, expect } from 'vitest';
import { LEGACY_PATH_IDS, LEGACY_LESSON_IDS } from '../legacyIds';
import {
  ACADEMY_PATHS, legacyPathId, resolveLessonRoute, findPathIdForLesson,
} from '../paths';

const pathIds = new Set<string>(ACADEMY_PATHS.map(p => p.id));
const lessonIds = new Set<string>(ACADEMY_PATHS.flatMap(p => p.lessons.map(l => l.id)));

describe('alias de paths (LEGACY_PATH_IDS)', () => {
  it('lista exactamente las rutas que cambiaron de id', () => {
    expect(Object.keys(LEGACY_PATH_IDS).sort()).toEqual([
      'ciberseguridad', 'hacking', 'hacking-web', 'os', 'protocolos', 'protocolos-ii', 'redes',
    ]);
  });

  it('los ids viejos ya no existen y los nuevos sí', () => {
    for (const [viejo, actual] of Object.entries(LEGACY_PATH_IDS)) {
      expect(pathIds.has(viejo), `${viejo} sigue vigente: sacalo del mapa`).toBe(false);
      expect(pathIds.has(actual), `${actual} no es un path actual`).toBe(true);
    }
  });

  it('legacyPathId resuelve las URLs viejas e ignora las vigentes', () => {
    expect(legacyPathId('redes')).toBe('fundaments');
    expect(legacyPathId('protocolos')).toBe('networksI');
    expect(legacyPathId('protocolos-ii')).toBe('networksII');
    expect(legacyPathId('os')).toBe('linux');
    expect(legacyPathId('os', 'linux')).toBe('linux'); // /academy/os/module/linux
    expect(legacyPathId('ciberseguridad')).toBe('ciber');
    expect(legacyPathId('hacking')).toBe('pentesting');
    expect(legacyPathId('hacking-web')).toBe('hackingweb');
    expect(legacyPathId('fundaments')).toBeUndefined(); // ya es la ruta nueva
    expect(legacyPathId('no-existe')).toBeUndefined();
    // claves del prototipo de Object: nunca deben caer en el mapa
    expect(legacyPathId('constructor')).toBeUndefined();
    expect(legacyPathId('toString')).toBeUndefined();
  });
});

describe('alias de lecciones (LEGACY_LESSON_IDS)', () => {
  it('lista 25 renombres (15 de Redes + 10 de Pentesting/Hacking Web)', () => {
    expect(Object.keys(LEGACY_LESSON_IDS)).toHaveLength(25);
  });

  it('los ids viejos dejaron de existir y los nuevos están en su path', () => {
    for (const [viejo, actual] of Object.entries(LEGACY_LESSON_IDS)) {
      expect(lessonIds.has(viejo), `${viejo} sigue vigente: sacalo del mapa`).toBe(false);
      expect(lessonIds.has(actual), `${actual} no es una lección actual`).toBe(true);
    }
  });

  it('sin cadenas: ningún valor es a su vez alias (un salto siempre alcanza)', () => {
    for (const actual of Object.values(LEGACY_LESSON_IDS)) {
      expect(LEGACY_LESSON_IDS[actual], `${actual} es alias de otra cosa`).toBeUndefined();
    }
  });

  it('resuelve los renombres de Pentesting y Hacking Web', () => {
    expect(resolveLessonRoute('hacking-05')).toEqual({ pathId: 'pentesting', lessonId: 'pentesting-03' });
    expect(resolveLessonRoute('network-05')).toEqual({ pathId: 'pentesting', lessonId: 'pentesting-05' });
    expect(resolveLessonRoute('proto-02')).toEqual({ pathId: 'hackingweb', lessonId: 'hackingweb-01' });
    expect(resolveLessonRoute('web-03')?.lessonId).toBe('hackingweb-05');
    expect(resolveLessonRoute('ciber-01')?.pathId).toBe('ciber'); // id sin cambios
  });
});

describe('resolveLessonRoute / findPathIdForLesson', () => {
  it('devuelve la ruta actual de un id renombrado', () => {
    expect(resolveLessonRoute('redes-03')).toEqual({ pathId: 'fundaments', lessonId: 'fundaments-03' });
    expect(resolveLessonRoute('proto-07')).toEqual({ pathId: 'networksI', lessonId: 'networksI-04' });
    expect(resolveLessonRoute('network-04')).toEqual({ pathId: 'networksII', lessonId: 'networksII-05' });
    expect(findPathIdForLesson('proto-07')).toBe('networksI');
  });

  it('devuelve la misma ruta si el id ya está actualizado', () => {
    expect(resolveLessonRoute('networksI-04')).toEqual({ pathId: 'networksI', lessonId: 'networksI-04' });
    expect(resolveLessonRoute('fundaments-01')).toEqual({ pathId: 'fundaments', lessonId: 'fundaments-01' });
  });

  it('devuelve undefined para ids que no existen', () => {
    expect(resolveLessonRoute('network-01')).toBeUndefined();
    expect(findPathIdForLesson('no-existe')).toBeUndefined();
  });
});
