// ── academy/path-os.ts ─────────────────────────────────────────────
// Los tres paths de Sistemas Operativos. Antes eran UNA entrada ('os')
// con subsecciones y rutas /academy/os/module/<sub>; hoy cada módulo es
// un path de primer nivel, así las URLs quedan limpias y simétricas:
//   /academy/linux  →  /academy/linux/linux-01
//   /academy/windows →  /academy/windows/windows-01
//   /academy/others  →  /academy/others/others-01
// (lo mismo para los 3 paths de scripting; las URLs /module/<sub> que
// quedaron en bookmarks resuelven por legacyIds.ts).

import type { AcademyPath } from '../types';
import { LINUX_LESSONS } from './linux-lessons';
import { WINDOWS_LESSONS } from './windows-lessons';
import { OTHERS_LESSONS } from './others-lessons';

// La descripción es la misma para los 3 (así se mostraba en la portada).
const OS_DESC = 'Linux and Windows for hacking: filesystems, users, permissions and where attackers look first.';
const OS_DESC_ES = 'Linux y Windows para hacking: filesystems, usuarios, permisos y dónde miran los atacantes primero.';

export const LINUX_PATH: AcademyPath = {
  id: 'linux',
  title: 'Linux',
  titleEs: 'Linux',
  description: OS_DESC,
  descriptionEs: OS_DESC_ES,
  icon: '🐧',
  accentColor: '#f59e0b',
  illustration: 'linux',
  lessons: LINUX_LESSONS,
};

export const WINDOWS_PATH: AcademyPath = {
  id: 'windows',
  title: 'Windows',
  titleEs: 'Windows',
  description: OS_DESC,
  descriptionEs: OS_DESC_ES,
  icon: '🪟',
  accentColor: '#f59e0b',
  illustration: 'windows',
  lessons: WINDOWS_LESSONS,
};

export const OTHERS_PATH: AcademyPath = {
  id: 'others',
  title: 'Other operating systems and hardware',
  titleEs: 'Otros sistemas operativos y hardware',
  description: OS_DESC,
  descriptionEs: OS_DESC_ES,
  icon: '📱',
  accentColor: '#f59e0b',
  illustration: 'others',
  lessons: OTHERS_LESSONS,
};

/** Los 3 paths de SO, en orden de presentación en la portada del Academy. */
export const OS_PATHS: AcademyPath[] = [LINUX_PATH, WINDOWS_PATH, OTHERS_PATH];
