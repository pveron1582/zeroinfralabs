# PROYECTO: Academy — contenido educativo guiado

> Plan de diseño. Estado: **IMPLEMENTADO** (actualizado 2026-08-22).
> Decidido el 2026-08-08 como prioridad tras el Admin Panel UI; desarrollado
> durante agosto 2026. Estado real: **7 paths / 58 lecciones** bilingües ES/EN,
> con quizzes + progreso persistido (`completedLessons`/`quizResults` en
> `partialize`), videos Remotion (`public/videos/`), FoxyNarrator, simuladores
> de red interactivos y LessonBuilder en el AdminPanel. Diseño visual unificado
> con el landing (ver `docs/ACADEMY_DESIGN.md`). Suite academy verde.
> Este documento conserva el plan original como referencia histórica.

## Por qué ahora

- **Diferenciador vs TryHackMe/HTB Academy**: ellos tienen contenido y labs separados.
  Nosotros podemos integrarlos: una lección de `nmap -sV` con botón "Probalo ahora"
  que abre el lab directamente, sin cambiar de aplicación ni página.
- **Reutiliza infraestructura**: el blog ya usa el patrón `{es, en}` en textos
  (`titleEs`/`contentEs` en `src/blog/articles.ts`). Foxy ya tiene componente
  SVG reutilizable. El MissionPanel ya valida misiones automáticamente.
- **Se alinea con el Lab Builder**: el Academy da el contexto teórico; el Builder
  genera los labs que las lecciones referencian. Uno sin el otro es incompleto.

## Objetivo de aprendizaje por base

| Base | Meta (al terminar, el usuario sabe...) |
|---|---|
| 🐧 Sistemas Operativos | Navegar un Linux, entender usuarios/permisos, saber dónde buscar info sensible. Mencionar Windows (AD, event logs) y otros OS sin profundizar. |
| 🌐 Redes | Entender qué es un puerto, un protocolo, un servicio. Por qué nmap muestra lo que muestra. Qué significa "22/tcp open". |
| 🛡️ Ciberseguridad | Triada CID con ejemplos, hashes vs cifrado, qué es un hash de password y por qué se crackea, terminología básica (0day, exploit, payload). |
| ⚔️ Hacking Ético | Las 5 fases: recon → escaneo → explotación → post-explotación → reporte. Usar el lab para practicarlas como método, no como juego. |

## Decisiones de diseño (acordadas)

- **Nombre/ruta:** `/es/academy` | `/en/academy`. Visible en el header de la landing.
- **Estructura fija:** 4 bases (paths), lecciones ordenadas dentro de cada una.
  No hay "cursos" ni "módulos" extra — la base ES la unidad organizativa.
- **Contenido semilla:** 2 lecciones por base (8 total) en Fase A, todas en ES y EN.
- **Sin backend:** progreso guardado en `localStorage` vía `partialize` del store
  (mismo patrón que `termColor`/`uiMode`). Sin cuentas, sin sync aún.
- **Foxy NO integrado en Fase A** (Fase D): el narrador vendría después, una vez
  que el contenido base funcione. No bloquea el MVP.
- **Vinculación con labs vía metadata**: cada lección puede marcar `labRef` con
  el `scenarioId` del lab sugerido. En Fase C se convierte en botón interactivo
  que abre el lab dentro de la lección.

## Arquitectura — 4 bases + modelo de lección

### Tipos (`src/types.ts`)

```typescript
// ── Academy ─────────────────────────────────────────────────────────
export type AcademyPathId = 'os' | 'network' | 'ciberseguridad' | 'hacking';

export interface AcademyPath {
  id: AcademyPathId;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  icon: string;              // emoji
  accentColor: string;       // hex para badges/bordes
  lessons: Lesson[];
  comingSoon?: boolean;
}

export type LessonStep =
  | { type: 'content';        title: string; titleEs: string; body: string;           bodyEs: string; }
  | { type: 'terminal-demo';  command: string; output: string; explanation: string;    explanationEs: string; }
  | { type: 'lab-challenge';  labId: string; missionObjective: string; missionObjectiveEs: string; }
  | { type: 'quiz';           question: string; questionEs: string; options: { es: string; en: string }[]; correctIndex: number; };

export interface Lesson {
  id: string;
  pathId: AcademyPathId;
  order: number;             // 1-based, define secuencia
  title: string;
  titleEs: string;
  readingMinutes: number;
  steps: LessonStep[];
  labRef?: string;           // scenarioId del lab sugerido para practicar
}
```

### Contenido — `src/academy/paths.ts`

4 paths, 8 lecciones semilla. Cada una mapeada a un lab existente vía `labRef`:
`laboratorio01` (FTP), `laboratorio02` (web/SSH), `laboratorio03` (SMB/MS17-010),
`laboratorio04` (LFI), `laboratorio05` (SQLi), `laboratorio06` (privesc).

| Path | Lección 1 | Lección 2 |
|---|---|---|
| OS | "Linux para hackers: el filesystem y usuarios" | "Permisos y archivos sensibles" |
| Redes | "Qué es un puerto y por qué importa" | "Servicios clásicos: SSH, FTP, HTTP" |
| Ciberseg | "La triada CID con ejemplos reales" | "Hashes, cifrado y cómo se crackean passwords" |
| Hacking | "Las 5 fases del hacking: el método" | "Primera práctica: reconocimiento con el lab" |

### Componentes React

```
src/components/academy/
├── AcademyHome.tsx          ← grid de 4 paths + progreso del usuario
├── AcademyPath.tsx          ← lista de lecciones del path con badges
├── LessonViewer.tsx          ← stepper: navega steps, marca completados
├── LessonContent.tsx         ← renderiza cada tipo de step
├── QuizStep.tsx              ← pregunta MC con feedback inmediato
└── LessonProgress.tsx        ← barra lateral con % del path
```

Todos los componentes < 300 líneas. Estética: mismo dark theme que el sitio
(`#0b1015` bg, `#10b981` emerald accent, font mono para código).

### Store — `src/store/slices/academySlice.ts`

```typescript
interface AcademySlice {
  completedLessons: string[];      // ["os-01", "os-02", ...]
  currentLessonId: string | null;
  markLessonCompleted: (lessonId: string) => void;
  setCurrentLesson: (id: string | null) => void;
}
```

Persistir en `partialize()` (igual que `termColor`). Al entrar a un path,
el AcademyPath muestra badges "Completada" basado en `completedLessons`.

### Rutas (`App.tsx`)

```
/:lang/academy                 → AcademyHome
/:lang/academy/:pathId         → AcademyPath
/:lang/academy/:pathId/:lessonId → LessonViewer
```

## Estética y tono

**No es un LMS tradicional.** La estética sigue la del sitio: oscura, terminal,
"hack the planet". Los títulos de las lecciones son directos y prácticos, no
académicos. Ejemplos:

- ❌ "Fundamentos de sistemas operativos: procesos y memoria"
- ✅ "Linux para hackers: dónde esconder un archivo"

**Cada lección cierra con una práctica real.** No es "leé esto y aprendete la
teoría" — es "esto es lo que vas a ver en el próximo lab, y acá te explico por qué".

## Contenido semilla (Fase A) — detallado

### Path 1: Sistemas Operativos 🐧

**Lección OS-01: "Linux para hackers: el filesystem y usuarios"** (~8 min)
- Steps `content`: árbol de directorios (`/etc`, `/home`, `/var/www`), qué hay en cada uno
- Step `terminal-demo`: `ls -la /etc/passwd` mostrando permisos
- Step `terminal-demo`: `cat /etc/passwd` filtrando usuarios con shell
- Step `content`: mención Windows (C:\, Users, Administrador) y "otros OS existen"
- Step `quiz`: "¿Qué usuario tiene UID 0?" → `root`
- `labRef: 'laboratorio02'` (práctica en el lab de SSH)

**Lección OS-02: "Permisos y archivos sensibles"** (~7 min)
- `content`: lectura de `-rw-r----- root:shadow` y qué significa cada campo
- `terminal-demo`: intento de `cat /etc/shadow` como usuario normal → `Permission denied`
- `content`: dónde se esconden cosas: `/etc/ssh/sshd_config`, `/root/`, `/var/log/`
- `quiz`: "¿Qué permiso tiene que tener un directorio para que `cd` funcione?" → `execute`
- `labRef: 'laboratorio06'` (lab de privesc, ya tiene permisos reales)

### Path 2: Redes 🌐

**Lección REDES-01: "Qué es un puerto y por qué importa"** (~6 min)
- `content`: analogía de edificio (IP = dirección, puerto = puerta). Rango 0-65535.
- `terminal-demo`: `arp-scan --localnet` mostrando hosts en la red
- `terminal-demo`: `nmap -sV <ip>` con salida real del lab
- `quiz`: "¿Qué puerto usa SSH por defecto?" → `22`
- `labRef: 'laboratorio01'`

**Lección REDES-02: "Servicios clásicos: dónde mirar primero"** (~7 min)
- `content`: tabla SSH/FTP/HTTP/SMB/MySQL con puerto y versión típica
- `terminal-demo`: `nmap -p- <ip>` → por qué `filtered` ≠ `closed`
- `content`: banner grabbing: qué te dice `OpenSSH 8.2p1 Ubuntu`
- `quiz`: "¿Qué servicio corre en el puerto 445?" → `SMB`
- `labRef: 'laboratorio02'`

### Path 3: Ciberseguridad 🛡️

**Lección CIBER-01: "La triada CID con ejemplos reales"** (~6 min)
- `content`: Confidencialidad (robar `/etc/shadow`), Integridad (modificar `index.html`),
  Disponibilidad (tirar el servicio). Cada una con ejemplo del sitio.
- `terminal-demo`: `cat /etc/shadow` mostrando hash `$6$...`
- `quiz`: "Modificar el log de un ataque para taparte rompe qué principio?" → Integridad
- `labRef: 'laboratorio05'` (SQLi como ejemplo de Integridad/Confidencialidad)

**Lección CIBER-02: "Hashes, cifrado y cómo se crackean passwords"** (~8 min)
- `content`: hash ≠ cifrado (irreversible vs reversible). MD5/SHA1/sha512.
- `terminal-demo`: `john hash.txt --wordlist=rockyou.txt` (simulado)
- `content`: por qué un password como `123456` es vulnerable a fuerza bruta
- `quiz`: "¿Qué hace `hydra -l user -P pass.txt ssh://ip`?" → prueba combos
- `labRef: 'laboratorio02'` (hydra SSH)

### Path 4: Hacking Ético ⚔️

**Lección HACK-01: "Las 5 fases: el método, no el caos"** (~7 min)
- `content`: recon (pasivo/activo) → scanning → explotación → post-explotación → reporte.
  Ejemplo narrado con un escenario real del simulador.
- `terminal-demo`: `nmap` como fase de scanning
- `content`: ética del pentesting: autorización escrita, scope, no destruir
- `quiz`: "¿Qué fase viene ANTES de lanzar un exploit?" → Scanning/enumeración
- `labRef: 'laboratorio01'`

**Lección HACK-02: "Tu primera práctica: reconocimiento con el lab"** (~10 min)
- Esta es la lección "*hacélo conmigo*" — guía interactiva paso a paso dentro del lab
- Steps `content` + `terminal-demo` alternados
- `lab-challenge` (Fase C): el usuario debe completar misión #1 del lab seleccionado
- `labRef: 'laboratorio01'` o el primer lab visible

## Fases de implementación

```
Fase A — MVP (visitable)
─────────────────────────
✓ Tipos Academy en src/types.ts
✓ src/academy/paths.ts + seeds (8 lecciones, ES/EN)
✓ 3 rutas nuevas en App.tsx
✓ AcademyHome: hero + grid de 4 paths
✓ LessonViewer: stepper básico (solo steps content + terminal-demo)
✓ Marcar lección como completada (localStorage)
✓ i18n: todas las keys nuevas en src/i18n/translations.ts
✓ Tests: AcademyHome render, LessonViewer navega pasos, persistencia
✓ Verificación: tsc + build + suite completa

Fase B — Quiz + progreso visible
─────────────────────────────────
- Componente QuizStep con feedback inmediato
- Barra de progreso por path en AcademyPath
- Store persiste quiz completados

Fase C — Integración con labs (el diferenciador)
────────────────────────────────────────────────
- Step `lab-challenge` en LessonViewer
- Botón "Abrir lab" que monta el workspace del scenarioRef
- Usa el sistema de validación existente para marcar
  la misión como completada dentro de la lección

Fase D — Foxy narrador
──────────────────────
- FoxyFox + burbuja tipo FoxyTour dentro de la lección
- Tips contextuales ("¿Necesitás ayuda con este comando?")
- Reutiliza la lógica del FoxyAssistant del MissionPanel

Fase E — Editor en Lab Builder
──────────────────────────────
- Nueva sección en AdminPanel: "Lecciones"
- Editor visual: steps, textos ES/EN, selector de labRef
- Exporta JSON que se convierte en Lesson
```

## Archivos a modificar / crear

| Archivo | Cambio |
|---|---|
| `src/types.ts` | `AcademyPathId`, `AcademyPath`, `LessonStep`, `Lesson` |
| `src/academy/paths.ts` | NUEVO — 4 paths + 8 lecciones semilla |
| `src/App.tsx` | 3 rutas nuevas |
| `src/components/SiteHeader.tsx` | Link "Academy" en el header |
| `src/components/academy/*.tsx` | NUEVO — 6 componentes UI |
| `src/store/slices/academySlice.ts` | NUEVO — progreso + persistencia |
| `src/store/scenarioStore.ts` | merge del slice nuevo |
| `src/i18n/translations.ts` | ~30 keys nuevas |
| `src/components/__tests__/Academy.test.tsx` | NUEVO — tests de rutas + viewer |
| `src/store/__tests__/academyStore.test.ts` | NUEVO — tests de progreso |

## Validación / Done

- `pnpm exec tsc --noEmit` → 0 errores
- `pnpm build` → ok
- `pnpm test:run` → suite completa verde (>1695 tests)
- `/es/academy` renderiza los 4 paths
- Se puede entrar a una lección, leer y completarla
- La próxima lección se marca como sugerida
- El progreso persiste al recargar

## No-objetivos (out of scope para Fase A–E)

- Editor visual de lecciones para usuarios (solo devs/editores del sitio)
- Certificados de finalización
- Backend de progreso (siempre localStorage por ahora)
- Foro/comentarios por lección
- Badges/gamificación compleja (el "completado" del store es suficiente MVP)
