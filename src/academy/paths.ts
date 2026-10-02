// ── academy/paths.ts ───────────────────────────────────────────────
// Las bases del Academy. Ver docs/PROYECTO_ACADEMY.md.

import type { AcademyPath, AcademyPathId, Lesson } from '../types';
import { OS_PATHS } from './path-os';
import { LEGACY_PATH_IDS, LEGACY_LESSON_IDS } from './legacyIds';
import { REDES_LESSONS } from './path-redes';
import { PROTOCOLOS_LESSONS } from './path-protocolos';
import { PROTOCOLOS2_LESSONS } from './path-protocolos-ii';
import { CIBERSEG_LESSONS } from './path-ciberseguridad';
import { HACKING_LESSONS } from './path-hacking';
import { HACKING_WEB_LESSONS } from './path-hacking-web';
import { SCRIPTING_LESSONS, SCRIPTING_SUBSECTIONS } from './path-scripting';

export const ACADEMY_PATHS: AcademyPath[] = [
  // Los 3 paths de Sistemas Operativos: antes eran una sola entrada 'os'
  // con subsecciones (rutas /academy/os/module/<sub>), ahora cada módulo
  // es un path de primer nivel (rutas /academy/linux, /academy/linux/linux-01).
  ...OS_PATHS,
  {
    id: 'fundaments',
    title: 'Network Fundamentals',
    titleEs: 'Fundamentos de redes',
    description: 'What networks are, how they are shaped, and the addressing that makes them work.',
    descriptionEs: 'Qué son las redes, qué formas tienen y el direccionamiento que las hace funcionar.',
    icon: '🌐',
    accentColor: '#06b6d4',
    illustration: 'redes',
    lessons: REDES_LESSONS,
  },
  {
    id: 'networksI',
    title: 'Networking I',
    titleEs: 'Redes I',
    description: 'The protocols you see in every scan, the essential devices that move them, and the VLANs that segment them.',
    descriptionEs: 'Los protocolos que ves en cada escaneo, los dispositivos esenciales que los mueven y las VLANs que los segmentan.',
    icon: '📡',
    accentColor: '#8b5cf6',
    illustration: 'protocolos',
    lessons: PROTOCOLOS_LESSONS,
  },
  {
    id: 'networksII',
    title: 'Networking II',
    titleEs: 'Redes II',
    description: 'The services and architectures that make a network tick: DHCP, NAT, DNS, VPN, DMZ.',
    descriptionEs: 'Los servicios y arquitecturas que hacen funcionar una red: DHCP, NAT, DNS, VPN, DMZ.',
    icon: '🖧',
    accentColor: '#64748b',
    illustration: 'protocolos-ii',
    lessons: PROTOCOLOS2_LESSONS,
  },
  {
    id: 'ciberseguridad',
    title: 'Cybersecurity Fundamentals',
    titleEs: 'Fundamentos de Ciberseguridad',
    description: 'CIA triad, encryption vs hashing, and how passwords are cracked.',
    descriptionEs: 'Triada CID, cifrado vs hashing, y cómo se crackean las contraseñas.',
    icon: '🛡️',
    accentColor: '#10b981',
    illustration: 'ciberseguridad',
    lessons: CIBERSEG_LESSONS,
  },
  {
    id: 'hacking',
    title: 'Pentesting',
    titleEs: 'Pentesting',
    description: 'The 5-phase methodology: recon, scanning, exploitation, post-exploitation, reporting.',
    descriptionEs: 'La metodología de 5 fases: reconocimiento, escaneo, explotación, post-explotación, reporte.',
    icon: '⚔️',
    accentColor: '#ef4444',
    illustration: 'hacking',
    lessons: HACKING_LESSONS,
  },
  {
    id: 'hacking-web',
    title: 'Web Hacking',
    titleEs: 'Hacking Web',
    description: 'Web vulnerabilities and the protocols they ride on: HTTP, HTTPS, cookies, sessions.',
    descriptionEs: 'Las vulnerabilidades web y los protocolos sobre los que viajan: HTTP, HTTPS, cookies, sesiones.',
    icon: '🕸️',
    accentColor: '#d946ef',
    illustration: 'hacking-web',
    lessons: HACKING_WEB_LESSONS,
  },
  {
    id: 'scripting',
    title: 'Pentesting Scripting',
    titleEs: 'Scripting para pentesting',
    description: 'Bash, PowerShell and Python: the languages attackers automate with. 5 lessons per language: what they are, the basics, and pentest examples.',
    descriptionEs: 'Bash, PowerShell y Python: los lenguajes con los que se automatizan los ataques. 5 clases por lenguaje: qué son, las bases y ejemplos de pentesting.',
    icon: '💻',
    accentColor: '#f97316',
    lessons: SCRIPTING_LESSONS,
    subSections: SCRIPTING_SUBSECTIONS,
  },
];

export function getPath(pathId: string): AcademyPath | undefined {
  return ACADEMY_PATHS.find(p => p.id === pathId);
}

export function getLesson(pathId: string, lessonId: string): Lesson | undefined {
  return getPath(pathId)?.lessons.find(l => l.id === lessonId);
}

// Subsección a la que pertenece una lección (ej: linux-01 → 'linux').
// Devuelve undefined si el path no tiene subsecciones.
export function getSubIdForLesson(pathId: string, lessonId: string): string | undefined {
  return getPath(pathId)?.subSections?.find(s => s.lessons.some(l => l.id === lessonId))?.id;
}

export function getAllLessons(): Lesson[] {
  return ACADEMY_PATHS.flatMap(p => p.lessons);
}

export function isValidPathId(id: string): id is AcademyPathId {
  return ACADEMY_PATHS.some(p => p.id === id);
}

// ── URLs legacy de la Academy ──────────────────────────────────────
// En 2026-10 cambiaron dos veces los ids: los módulos de SO dejaron de
// vivir bajo `/academy/os/...` y los paths de Redes pasaron de `redes` /
// `protocolos` / `protocolos-ii` a `fundaments` / `networksI` /
// `networksII`. Los alias están en `legacyIds.ts` (hoja sin contenido,
// también la consume el store para migrar el progreso persistido); acá
// están las funciones que resuelven las URLs viejas (bookmarks y SEO).

/**
 * Path actual de una URL vieja: `/academy/os` → `linux`,
 * `/academy/os/module/<sub>` → `<sub>`, `/academy/redes` → `fundaments`.
 * Devuelve undefined si el path está vigente (no es legacy).
 */
export function legacyPathId(pathId: string, subId?: string): AcademyPathId | undefined {
  if (!Object.prototype.hasOwnProperty.call(LEGACY_PATH_IDS, pathId)) return undefined;
  // Los módulos de SO ya son paths de primer nivel: el subId manda
  if (subId && isValidPathId(subId)) return subId;
  return LEGACY_PATH_IDS[pathId];
}

/** Ruta actual de una lección, buscando también los ids renombrados. */
export function resolveLessonRoute(lessonId: string): { pathId: AcademyPathId; lessonId: string } | undefined {
  const actual = ACADEMY_PATHS.find(p => p.lessons.some(l => l.id === lessonId));
  if (actual) return { pathId: actual.id, lessonId };
  const viejo = LEGACY_LESSON_IDS[lessonId];
  // Los valores del mapa son ids actuales: un salto llega (el contrato
  // de no-cadenas está en legacy-ids.test.ts), así que no hay recursión infinita.
  return viejo && viejo !== lessonId ? resolveLessonRoute(viejo) : undefined;
}

/** Path que contiene una lección, con id actual o renombrado. */
export function findPathIdForLesson(lessonId: string): AcademyPathId | undefined {
  return resolveLessonRoute(lessonId)?.pathId;
}
