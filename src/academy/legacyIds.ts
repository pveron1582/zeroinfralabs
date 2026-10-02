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
  ciberseguridad: 'cyber',
  // El id del path pasó a inglés (2026-10): `/academy/ciber` → `/academy/cyber`
  ciber: 'cyber',
  hacking: 'pentesting',
  'hacking-web': 'hackingweb',
  // El path 'scripting' se partió en 3 paths de primer nivel (2026-10):
  // /academy/scripting → /academy/bash (y con subId, el subId manda).
  scripting: 'bash',
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
  // Pentesting (antes path `hacking`; el orden es el de la portada)
  'hacking-01': 'pentesting-01',
  'hacking-02': 'pentesting-02',
  'hacking-05': 'pentesting-03',
  'hacking-06': 'pentesting-04',
  'network-05': 'pentesting-05',
  // Ciberseguridad → Cyber (el id pasó a inglés; el contenido no cambió)
  'ciber-01': 'cyber-01',
  'ciber-02': 'cyber-02',
  'ciber-03': 'cyber-03',
  'ciber-04': 'cyber-04',
  'ciber-05': 'cyber-05',
  // Hacking Web (antes path `hacking-web`)
  'proto-02': 'hackingweb-01',
  'web-04': 'hackingweb-02',
  'web-01': 'hackingweb-03',
  'web-02': 'hackingweb-04',
  'web-03': 'hackingweb-05',
};
