// ── academy/path-scripting.ts ──────────────────────────────────────
// Los tres paths de Scripting para pentesting. Antes eran UNA entrada
// ('scripting') con subsecciones y rutas /academy/scripting/module/<sub>;
// hoy cada lenguaje es un path de primer nivel, simétrico a los módulos
// de SO (path-os.ts) y con URLs limpias:
//   /academy/bash        →  /academy/bash/bash-01
//   /academy/powershell  →  /academy/powershell/powershell-01
//   /academy/python      →  /academy/python/python-01
// (`/academy/scripting…` sigue resolviendo por legacyIds.ts.)

import type { AcademyPath } from '../types';
import { BASH_LESSONS } from './bash-lessons';
import { POWERSHELL_LESSONS } from './powershell-lessons';
import { PYTHON_LESSONS } from './python-lessons';

// Mismo acento para los 3: así se mostraban cuando estaban agrupados.
const SCRIPTS_COLOR = '#f97316';

export const BASH_PATH: AcademyPath = {
  id: 'bash',
  title: 'Bash',
  titleEs: 'Bash',
  description: 'The shell that is also a language: variables, loops and text filters, plus enumeration and reverse shells with one-liners.',
  descriptionEs: 'La shell que también es lenguaje: variables, bucles y filtros de texto, más enumeración y reverse shells con one-liners.',
  icon: '🐚',
  accentColor: SCRIPTS_COLOR,
  illustration: 'bash',
  lessons: BASH_LESSONS,
};

export const POWERSHELL_PATH: AcademyPath = {
  id: 'powershell',
  title: 'PowerShell',
  titleEs: 'PowerShell',
  description: 'Windows with objects instead of text: cmdlets and scripts for enumeration, credentials and obfuscation on a target.',
  descriptionEs: 'Windows con objetos en vez de texto: cmdlets y scripts para enumeración, credenciales y ofuscación en el objetivo.',
  icon: '🪟',
  accentColor: SCRIPTS_COLOR,
  illustration: 'powershell',
  lessons: POWERSHELL_LESSONS,
};

export const PYTHON_PATH: AcademyPath = {
  id: 'python',
  title: 'Python',
  titleEs: 'Python',
  description: "The pentester's language: types, functions and libraries, networking with socket and HTTP attacks with requests.",
  descriptionEs: 'El lenguaje del pentester: tipos, funciones y librerías, redes con socket y ataques HTTP con requests.',
  icon: '🐍',
  accentColor: SCRIPTS_COLOR,
  illustration: 'python',
  lessons: PYTHON_LESSONS,
};

/** Los 3 paths de scripting, en orden de presentación en la portada. */
export const SCRIPTING_PATHS: AcademyPath[] = [BASH_PATH, POWERSHELL_PATH, PYTHON_PATH];
