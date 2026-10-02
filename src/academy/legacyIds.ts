// ── academy/legacyIds.ts ───────────────────────────────────────────
// Alias de ids que cambiaron en el rework de rutas de la Academy
// (2026-10): módulos de SO a paths de primer nivel y paths de Redes
// renombrados. Es una hoja SIN contenido de lecciones (sólo tipos): la
// consumen `paths.ts` (redirect de URLs viejas) y
// `store/persistMigrate.ts` (migración del progreso persistido). Por eso
// no vive en `paths.ts`: desde ahí arrastraría las 59 lecciones al store
// (mismo motivo por el que el store sólo habla con los labs por
// `laboratorios/registry.ts`).
//
// Regla: los valores son SIEMPRE ids actuales, nunca otro alias — así un
// id viejo resuelve en un solo salto. El contrato está en
// `academy/__tests__/paths.test.ts`.

import type { AcademyPathId } from '../types';

/** Path id viejo → actual: `/academy/redes` → `/academy/fundaments`. */
export const LEGACY_PATH_IDS: Record<string, AcademyPathId> = {
  os: 'linux',
  redes: 'fundaments',
  protocolos: 'networksI',
  'protocolos-ii': 'networksII',
};

/** Lección renombrada: id viejo → id actual. */
export const LEGACY_LESSON_IDS: Record<string, string> = {
  // Fundamentos de redes (antes path `redes`)
  'redes-01': 'fundaments-01',
  'redes-02': 'fundaments-02',
  'redes-03': 'fundaments-03',
  'redes-04': 'fundaments-04',
  'redes-05': 'fundaments-05',
  // Redes I (antes path `protocolos`; el orden es el de la portada)
  'proto-01': 'networksI-01',
  'proto-06': 'networksI-02',
  'proto-03': 'networksI-03',
  'proto-07': 'networksI-04',
  'proto-08': 'networksI-05',
  // Redes II (antes path `protocolos-ii`)
  'network-06': 'networksII-01',
  'network-07': 'networksII-02',
  'network-08': 'networksII-03',
  'network-09': 'networksII-04',
  'network-04': 'networksII-05',
};
