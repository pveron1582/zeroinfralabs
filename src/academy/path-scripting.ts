// ── academy/path-scripting.ts ──────────────────────────────────────
// Path: Scripting para pentesting (dentro del grupo Hacking Ético).
// Subsecciones: Bash (5) → PowerShell (5) → Python (5).
// Compat: SCRIPTING_LESSONS es el flat array para callers antiguos.

import type { Lesson, AcademySubSection } from '../types';
import { BASH_LESSONS } from './bash-lessons';
import { POWERSHELL_LESSONS } from './powershell-lessons';
import { PYTHON_LESSONS } from './python-lessons';

export const SCRIPTING_SUBSECTIONS: AcademySubSection[] = [
  {
    id: 'bash',
    title: 'Bash',
    titleEs: 'Bash',
    icon: '🐚',
    lessons: BASH_LESSONS,
  },
  {
    id: 'powershell',
    title: 'PowerShell',
    titleEs: 'PowerShell',
    icon: '🪟',
    lessons: POWERSHELL_LESSONS,
  },
  {
    id: 'python',
    title: 'Python',
    titleEs: 'Python',
    icon: '🐍',
    lessons: PYTHON_LESSONS,
  },
];

export const SCRIPTING_LESSONS: Lesson[] = SCRIPTING_SUBSECTIONS.flatMap(s => s.lessons);
