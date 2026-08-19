// ── academy/paths.ts ───────────────────────────────────────────────
// Las bases del Academy. Ver docs/PROYECTO_ACADEMY.md.

import type { AcademyPath, AcademyPathId, Lesson } from '../types';
import { OS_LESSONS, OS_SUBSECTIONS } from './path-os';
import { REDES_LESSONS } from './path-redes';
import { PROTOCOLOS_LESSONS } from './path-protocolos';
import { PROTOCOLOS2_LESSONS } from './path-protocolos-ii';
import { CIBERSEG_LESSONS } from './path-ciberseguridad';
import { HACKING_LESSONS } from './path-hacking';
import { HACKING_WEB_LESSONS } from './path-hacking-web';
import { SCRIPTING_LESSONS, SCRIPTING_SUBSECTIONS } from './path-scripting';

export const ACADEMY_PATHS: AcademyPath[] = [
  {
    id: 'os',
    title: 'Operating Systems',
    titleEs: 'Sistemas Operativos',
    description: 'Linux and Windows for hacking: filesystems, users, permissions and where attackers look first.',
    descriptionEs: 'Linux y Windows para hacking: filesystems, usuarios, permisos y dónde miran los atacantes primero.',
    icon: '🐧',
    accentColor: '#f59e0b',
    lessons: OS_LESSONS,
    subSections: OS_SUBSECTIONS,
  },
  {
    id: 'redes',
    title: 'Network Fundamentals',
    titleEs: 'Fundamentos de redes',
    description: 'What networks are, how they are shaped, and the addressing that makes them work.',
    descriptionEs: 'Qué son las redes, qué formas tienen y el direccionamiento que las hace funcionar.',
    icon: '🌐',
    accentColor: '#06b6d4',
    lessons: REDES_LESSONS,
  },
  {
    id: 'protocolos',
    title: 'Networking I',
    titleEs: 'Redes I',
    description: 'The protocols you see in every scan, the essential devices that move them, and the VLANs that segment them.',
    descriptionEs: 'Los protocolos que ves en cada escaneo, los dispositivos esenciales que los mueven y las VLANs que los segmentan.',
    icon: '📡',
    accentColor: '#8b5cf6',
    lessons: PROTOCOLOS_LESSONS,
  },
  {
    id: 'protocolos-ii',
    title: 'Networking II',
    titleEs: 'Redes II',
    description: 'The services and architectures that make a network tick: DHCP, NAT, DNS, VPN, DMZ.',
    descriptionEs: 'Los servicios y arquitecturas que hacen funcionar una red: DHCP, NAT, DNS, VPN, DMZ.',
    icon: '🖧',
    accentColor: '#64748b',
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
