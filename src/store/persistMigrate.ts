// ── store/persistMigrate.ts ──────────────────────────────────────
// Migración del snapshot persistido de `cyberops-store`.
//
// `partialize` (scenarioStore.ts) sólo guarda preferencias de UI y el
// progreso de Academy, así que "migrar" no es transformar un estado de
// laboratorio: es garantizar la FORMA del snapshot — aplicar lo que diga
// cada salto de versión, tirar las claves que ya no existen y dejar que
// `merge` rellene lo que falte con los defaults actuales.
//
// Por qué existe: zustand DESCARTA el estado guardado cuando `version` no
// coincide con la almacenada y no hay `migrate` — tira en consola «State
// loaded from storage couldn't be migrated since no migrate function was
// provided» y hace `merge(undefined, actual)`. Es decir, cualquier bump de
// `version` hecho a mano = el alumno pierde idioma, tema y progreso de
// Academy sin aviso.
//
// Para subir la versión: 1) agregar en MIGRATIONS el caso de la versión que
// INICIA el cambio (recibe el snapshot viejo y devuelve el nuevo), 2) subir
// PERSIST_VERSION, 3) correr los tests de acá.

import type { ScenarioState } from './types';
import { LEGACY_LESSON_IDS } from '../academy/legacyIds';

/** Versión del snapshot persistido. Única fuente: la consume scenarioStore. */
export const PERSIST_VERSION = 5;

/** Claves que sobreviven en el snapshot. TODO lo demás se tira. */
export const PERSIST_KEYS = [
  'language',
  'theme',
  'uiMode',
  'activeApp',
  'termColor',
  'completedLessons',
  'quizResults',
] as const;

export type PersistKey = (typeof PERSIST_KEYS)[number];

/** Snapshot persistido: lo mismo que devuelve `partialize`, pero opcional. */
export type PersistedState = Partial<Pick<ScenarioState, PersistKey>>;

/** `${idDeLección}-q${n}` → el id de lección de la clave (o la clave entera). */
const QUIZ_KEY = /^(.*)-q(\d+)$/;

/** Reescribe las claves de quiz cuya lección cambió de id. */
function renombrarQuizResults(quizResults: unknown): unknown {
  if (!quizResults || typeof quizResults !== 'object' || Array.isArray(quizResults)) return quizResults;
  const out: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(quizResults as Record<string, unknown>)) {
    const [, id, n] = clave.match(QUIZ_KEY) ?? [];
    out[id !== undefined ? `${LEGACY_LESSON_IDS[id] ?? id}-q${n}` : clave] = valor;
  }
  return out;
}

/**
 * Migración de cada salto: `MIGRATIONS[n]` recibe el snapshot guardado con
 * versión `n - 1` y lo deja listo para `n`. 2 es la primera versión con
 * forma estable (los snapshots más viejos sólo necesitan el recorte de
 * claves, que lo que falte lo cubre `merge`). Alta de una versión:
 * `4: (s) => ({ ...s, termFont: 'monospace' })`.
 */
/** Renombra ids de lección con LEGACY_LESSON_IDS (progreso + quizzes). */
function renombrarIdsDeLeccion(snapshot: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...snapshot };
  if (Array.isArray(out.completedLessons)) {
    out.completedLessons = (out.completedLessons as string[]).map(id => LEGACY_LESSON_IDS[id] ?? id);
  }
  if (out.quizResults !== undefined) out.quizResults = renombrarQuizResults(out.quizResults);
  return out;
}

const MIGRATIONS: MigrationMap = {
  // 2 → 3 (2026-10): paths de Redes renombrados (fundaments, networksI,
  // networksII) y con ellos 15 lecciones. Sin renombrar acá, el progreso
  // guardado con los ids viejos dejaría de matchear y el alumno "pierde"
  // lo completado sin ningún aviso.
  3: (snapshot) => renombrarIdsDeLeccion(snapshot),
  // 3 → 4 (2026-10): misma serie, segunda tanda — paths cyber (entonces
  // `ciber`), pentesting y hackingweb con 10 lecciones más. Salto aparte por
  // si un snapshot ya quedó en v3 (los renombres son idempotentes: el mapa
  // no tiene ids actuales como clave).
  4: (snapshot) => renombrarIdsDeLeccion(snapshot),
  // 4 → 5 (2026-10): el id del path `ciber` pasó a `cyber` (rutas en
  // inglés) y con él sus 5 lecciones. Mismo motivo que los saltos anteriores:
  // sin esto, el progreso con los ids viejos deja de matchear.
  5: (snapshot) => renombrarIdsDeLeccion(snapshot),
};

/** Mapa `versión que inicia el cambio → transformación del snapshot viejo`. */
export type MigrationMap = Record<number, (snapshot: Record<string, unknown>) => Record<string, unknown>>;

/**
 * @param migrations Sólo para tests: inyectar un registro distinto al real
 *   y poder verificar el orden en que se aplican los saltos.
 */
export function migratePersistedState(
  persisted: unknown,
  storedVersion: number,
  migrations: MigrationMap = MIGRATIONS
): PersistedState {
  let snapshot: Record<string, unknown> =
    persisted && typeof persisted === 'object' ? { ...(persisted as Record<string, unknown>) } : {};

  for (let target = storedVersion + 1; target <= PERSIST_VERSION; target++) {
    snapshot = migrations[target]?.(snapshot) ?? snapshot;
  }

  // Recorte final: sólo las claves que hoy existen.
  const out: Record<string, unknown> = {};
  for (const key of PERSIST_KEYS) {
    if (snapshot[key] !== undefined) out[key] = snapshot[key];
  }
  return out as PersistedState;
}
