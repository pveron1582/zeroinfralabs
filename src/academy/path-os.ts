// ── academy/path-os.ts ─────────────────────────────────────────────
// Path: Sistemas Operativos para hacking.
// Subsecciones: Linux (5 lecciones) → Windows (5 lecciones) → Otros SO y hardware (4 lecciones).
// Compat: OS_LESSONS es el flat array para callers antiguos.

import type { Lesson, AcademySubSection } from '../types';
import { LINUX_LESSONS } from './linux-lessons';
import { WINDOWS_LESSONS } from './windows-lessons';
import { OTHERS_LESSONS } from './others-lessons';

export const OS_SUBSECTIONS: AcademySubSection[] = [
  {
    id: 'linux',
    title: 'Linux',
    titleEs: 'Linux',
    icon: '🐧',
    illustration: 'linux',
    lessons: LINUX_LESSONS,
  },
  {
    id: 'windows',
    title: 'Windows',
    titleEs: 'Windows',
    icon: '🪟',
    illustration: 'windows',
    lessons: WINDOWS_LESSONS,
  },
  {
    id: 'others',
    title: 'Other operating systems and hardware',
    titleEs: 'Otros sistemas operativos y hardware',
    icon: '📱',
    illustration: 'others',
    lessons: OTHERS_LESSONS,
  },
];

export const OS_LESSONS: Lesson[] = OS_SUBSECTIONS.flatMap(s => s.lessons);
