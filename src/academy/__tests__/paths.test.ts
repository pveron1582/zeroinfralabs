// ── academy/__tests__/paths.test.ts ────────────────────────────────
// @vitest-environment node  (lógica pura, sin DOM: más rápido y sin jsdom)
// Contrato de datos del Academy: 12 paths y ~59 lecciones escritas a mano.
// Antes había CERO tests acá, así que un `id` duplicado o desalineado con
// su path rompía la navegación en runtime (las rutas /:lang/academy/:pathId
// y /:lang/academy/:pathId/:lessonId se arman con estos ids).
//
// Esto NO es un test de contenido (el texto se revisa a ojo), sino de
// integridad: unicidad, referencias cruzadas y paridad ES/EN donde el tipo
// la deja opcional.

import { describe, it, expect } from 'vitest';
import {
  ACADEMY_PATHS, getPath, getLesson, getAllLessons, isValidPathId,
} from '../paths';
import type { AcademyPath, Lesson, LessonStep } from '../../types';

const ALL = getAllLessons();
const lessonById = new Map(ALL.map(l => [l.id, l]));

/** Paths declarados en el union type AcademyPathId. */
const PATHS_DECLARADOS = [
  'linux', 'windows', 'others',
  'fundaments', 'networksI', 'networksII',
  'cyber', 'pentesting', 'hackingweb',
  'bash', 'powershell', 'python',
];

const nonEmpty = (s: string | undefined) => typeof s === 'string' && s.trim().length > 0;

/** Ids de escenario: los labs a los que apuntan `labRef` y los lab-challenge. */
const SCENARIO_IDS = [
  'scenario-01', 'scenario-02', 'scenario-03', 'scenario-04',
  'scenario-05', 'scenario-06', 'scenario-07', 'scenario-08',
];

describe('Academy — paths', () => {
  it('tiene 12 paths con ids únicos', () => {
    expect(ACADEMY_PATHS).toHaveLength(12);
    const ids = ACADEMY_PATHS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('los ids coinciden con el union type AcademyPathId (y viceversa)', () => {
    // Si se agrega un path al tipo y no a los datos (o al revés), la UI
    // resuelve `undefined` en runtime.
    const deDatos = [...ACADEMY_PATHS.map(p => p.id)].sort();
    expect(deDatos).toEqual([...PATHS_DECLARADOS].sort());
    PATHS_DECLARADOS.forEach(id => expect(isValidPathId(id)).toBe(true));
    expect(isValidPathId('no-existe')).toBe(false);
  });

  it('cada path tiene título ES/EN, learners y al menos una lección', () => {
    for (const p of ACADEMY_PATHS) {
      expect(nonEmpty(p.title), p.id).toBe(true);
      expect(nonEmpty(p.titleEs), p.id).toBe(true);
      expect(nonEmpty(p.description), p.id).toBe(true);
      expect(nonEmpty(p.descriptionEs), p.id).toBe(true);
      expect(p.lessons.length, `${p.id} sin lecciones`).toBeGreaterThan(0);
    }
  });
});

describe('Academy — lecciones', () => {
  it('el id de cada lección es único en TODA la academy', () => {
    const ids = ALL.map(l => l.id);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    // Sin unicidad global, el progreso y getLesson se pisan entre paths.
    expect(dupes).toEqual([]);
  });

  it('cada lección declara el path que la lista (lesson.pathId coherente)', () => {
    for (const p of ACADEMY_PATHS) {
      for (const l of p.lessons) {
        expect(l.pathId, `${l.id} dice pathId=${l.pathId} pero está en ${p.id}`).toBe(p.id);
      }
    }
  });

  it('tiene título ES/EN, minutos de lectura y order válido', () => {
    for (const l of ALL) {
      expect(nonEmpty(l.title), l.id).toBe(true);
      expect(nonEmpty(l.titleEs), l.id).toBe(true);
      expect(l.readingMinutes, l.id).toBeGreaterThan(0);
      expect(l.order, l.id).toBeGreaterThan(0);
    }
  });

  it('el order es único dentro de cada path y arranca en 1', () => {
    // Ojo: `order` es POR PATH. Desde que cada módulo de SO y cada
    // lenguaje de scripting son su propio path, no hay subsecciones:
    // el orden que ve el alumno es el del path.
    for (const p of ACADEMY_PATHS) {
      const orders = p.lessons.map(l => l.order);
      expect(new Set(orders).size, `${p.id}: orders repetidos`).toBe(orders.length);
      expect(Math.min(...orders), `${p.id} no arranca en 1`).toBe(1);
    }
  });

  it('el piso de 59 lecciones se mantiene (los docs dicen 59)', () => {
    // Es un PISO, no un número exacto: agregar lecciones no debe romper el
    // test, pero sí tiene que obliga a revisar el número de la documentación.
    expect(ALL.length).toBeGreaterThanOrEqual(59);
  });

  it('getLesson resuelve para toda lección y devuelve undefined si no existe', () => {
    for (const l of ALL) {
      const found = getLesson(l.pathId, l.id);
      expect(found?.id, `getLesson no resolvió ${l.pathId}/${l.id}`).toBe(l.id);
    }
    expect(getLesson('linux', 'linux-01')?.id).toBe('linux-01');
    expect(getLesson('linux', 'no-existe')).toBeUndefined();
    expect(getLesson('no-existe', 'linux-01')).toBeUndefined();
  });

  it('getPath resuelve cada path y devuelve undefined si no existe', () => {
    for (const p of ACADEMY_PATHS) expect(getPath(p.id)?.id).toBe(p.id);
    expect(getPath('no-existe')).toBeUndefined();
  });
});

describe('Academy — scripting como paths de primer nivel', () => {
  // Antes había UN path 'scripting' con subsecciones y rutas
  // /academy/scripting/module/<sub>; hoy cada lenguaje es su path.
  it('los 3 lenguajes son paths propios, en orden, con sus 5 lecciones', () => {
    const ids = ACADEMY_PATHS
      .filter(p => ['bash', 'powershell', 'python'].includes(p.id))
      .map(p => p.id);
    expect(ids).toEqual(['bash', 'powershell', 'python']);
    for (const id of ids) {
      const p = getPath(id);
      expect(p?.lessons, `${id} sin 5 lecciones`).toHaveLength(5);
      for (const l of p?.lessons ?? []) expect(l.pathId).toBe(id);
    }
  });

  it('el path único "scripting" dejó de existir (es legacy, no vigente)', () => {
    expect(getPath('scripting')).toBeUndefined();
    expect(isValidPathId('scripting')).toBe(false);
  });
});

describe('Academy — pasos (steps)', () => {
  const pasosDe = (l: Lesson): LessonStep[] => l.steps;

  it('toda lección tiene al menos un paso', () => {
    for (const l of ALL) {
      expect(pasosDe(l).length, `${l.id} sin pasos`).toBeGreaterThan(0);
    }
  });

  it('los quizzes tienen opciones válidas y correctIndex en rango', () => {
    for (const l of ALL) {
      for (const s of pasosDe(l)) {
        if (s.type !== 'quiz') continue;
        expect(s.options.length, `${l.id}: quiz sin opciones`).toBeGreaterThanOrEqual(2);
        expect(s.correctIndex, `${l.id}: correctIndex fuera de rango`).toBeGreaterThanOrEqual(0);
        expect(s.correctIndex, `${l.id}: correctIndex fuera de rango`).toBeLessThan(s.options.length);
        for (const o of s.options) {
          expect(nonEmpty(o.es), `${l.id}: opción sin es`).toBe(true);
          expect(nonEmpty(o.en), `${l.id}: opción sin en`).toBe(true);
        }
        expect(nonEmpty(s.question), l.id).toBe(true);
        expect(nonEmpty(s.questionEs), l.id).toBe(true);
      }
    }
  });

  it('paridad ES/EN en los captions de video (el tipo los deja opcionales)', () => {
    for (const l of ALL) {
      for (const s of pasosDe(l)) {
        if (s.type !== 'video') continue;
        expect(nonEmpty(s.src), `${l.id}: video sin src`).toBe(true);
        expect(s.durationSec, `${l.id}: video sin duración`).toBeGreaterThan(0);
        // Si hay caption en un idioma, tiene que estar en el otro.
        if (nonEmpty(s.caption)) expect(nonEmpty(s.captionEs), `${l.id}: caption sin captionEs`).toBe(true);
        if (nonEmpty(s.captionEs)) expect(nonEmpty(s.caption), `${l.id}: captionEs sin caption`).toBe(true);
      }
    }
  });

  it('paridad ES/EN en los pares del ejercicio de matching', () => {
    for (const l of ALL) {
      for (const s of pasosDe(l)) {
        if (s.type !== 'matching') continue;
        expect(s.pairs.length, `${l.id}: matching sin pares`).toBeGreaterThan(0);
        for (const p of s.pairs) {
          expect(nonEmpty(p.left) && nonEmpty(p.leftEs), `${l.id}: left sin ES/EN`).toBe(true);
          expect(nonEmpty(p.right) && nonEmpty(p.rightEs), `${l.id}: right sin ES/EN`).toBe(true);
        }
      }
    }
  });

  it('las narraciones de Foxy traen ambos idiomas', () => {
    for (const l of ALL) {
      for (const s of pasosDe(l)) {
        if (s.type !== 'foxy-narrator') continue;
        for (const m of s.messages) {
          expect(nonEmpty(m.es), `${l.id}: mensaje sin es`).toBe(true);
          expect(nonEmpty(m.en), `${l.id}: mensaje sin en`).toBe(true);
        }
      }
    }
  });

  it('los lab-challenge apuntan a un lab existente', () => {
    const labIds = new Set(
      (SCENARIO_IDS as string[]),
    );
    for (const l of ALL) {
      for (const s of pasosDe(l)) {
        if (s.type !== 'lab-challenge') continue;
        expect(nonEmpty(s.labId), `${l.id}: lab-challenge sin labId`).toBe(true);
        expect(labIds.has(s.labId), `${l.id}: labId ${s.labId} no existe`).toBe(true);
      }
    }
  });
});

/** Cada lección es alcanzable desde algún path (control de huérfanos). */
describe('Academy — sin lecciones huérfanas', () => {
  it('toda lección del módulo está en un path (lessonById sin sobras)', () => {
    const enPaths = new Set<string>();
    for (const p of ACADEMY_PATHS) for (const l of p.lessons) enPaths.add(l.id);
    for (const id of lessonById.keys()) {
      expect(enPaths.has(id), `${id} existe pero ningún path lo lista`).toBe(true);
    }
    expect(enPaths.size).toBe(ALL.length);
  });

  it('los labRef de las lecciones apuntan a labs existentes', () => {
    const labIds = new Set(SCENARIO_IDS as string[]);
    for (const l of ALL) {
      if (!l.labRef) continue;
      expect(labIds.has(l.labRef), `${l.id}: labRef ${l.labRef} no existe`).toBe(true);
    }
  });

  it('el type AcademyPath cubre todos los paths sin sobras', () => {
    const total = ACADEMY_PATHS.reduce((n: number, p: AcademyPath) => n + p.lessons.length, 0);
    expect(total).toBe(ALL.length);
  });


});
