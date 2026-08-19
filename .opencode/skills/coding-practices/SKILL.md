---
name: coding-practices
description: Buenas prácticas de programación para este proyecto — patrones de diseño, modularidad, bajo acoplamiento, SRP, single source of truth y documentación del código. Usar cuando se pida escribir código nuevo, refactorizar, evaluar acoplamiento, documentar, o revisar si algo sigue los patrones del proyecto (refactor, patrón de diseño, acoplamiento, modularidad, documentar código, buenas prácticas).
---

# Buenas Prácticas — ZeroInfra Labs

Guía transversal para escribir código que siga los patrones y la disciplina de
fronteras del proyecto. El código de este proyecto no "funciona nomás": se
diseñó con patrones explícitos y bajo acoplamiento, y hay que mantenerlos.

## Principio rector: bajo acoplamiento

Los comandos están **100% desacoplados** de los labs (ver `docs/ARCHITECTURE.md`).
No conocen las misiones ni los laboratorios. Emiten metadata en
`CommandResponse` y `LabValidator` (`src/utils/labValidator.ts`) compara contra
`validationCriteria`. Consecuencias:

- Un comando nuevo **no** debe referenciar un lab, una misión o un `scenarioId`
  específico para "validar".
- Agregar un lab no requiere tocar comandos existentes.
- `CommandResponse` metadata (`src/types.ts:182-280`) es el contrato: usá esos
  campos en vez de inventar protocolos propios embebidos en `output`.

## Patrones de diseño del proyecto (ya presentes, no reinventarlos)

| Patrón | Dónde |
|---|---|
| Command (GoF) | `src/commands/index.ts` — registry + `execute(args, ctx)` |
| Specification | `validationCriteria` + `labValidator.ts` |
| Event-Driven / Mediator | `CommandResponse` metadata → validator |
| Builder | `buildScenario()` en `src/laboratorios/templates.ts` |
| Factory Method | `createFile()`, `buildNewFile()` |
| State + Strategy | Consola MSF (`ContextRegistry`, contextos base/meterpreter/shell) |
| Stack | `ShellManager` — shells anidados LIFO |
| Strategy (por tabla) | Validadores, `CMD_DELAYS` |
| Slice | Store Zustand (`src/store/slices/`) |
| Hook Composition | `useIdentityStack` + `useNanoSave` + `useMissionCompletion` |
| Mini-Interpreter | `shellParse.ts` → expansión → pipes → dispatch |

## Disciplina de fronteras (lo que mantiene el proyecto sano)

- **SRP**: un archivo/hook/componente = una responsabilidad. Si un archivo
  supera ~300 líneas o hace más de una cosa, dividir (ver cómo se modularizaron
  `help.ts` y `App.tsx` en `docs/CHANGELOG.md`).
- **Single source of truth**: el estado vive en el store Zustand (4 slices).
  Los sistemas externos (ShellManager, ProcessManager, networkState,
  packageManager, mounts, cronRunner) siguen el patrón "estado por máquina NO
  persistente". NO duplicar estado en el store + un singleton + un hook.
- **Sin mutación directa**: nunca mutar `file.mode`/`file.owner` a mano ni
  campos de la máquina fuera del store. Todo cambio de filesystem pasa por
  `addFileToMachine` / helpers de `src/utils/permissions.ts` + `src/utils/fs.ts`
  (ver `docs/PERMISSIONS.md`).

## Documentar el código correctamente

- Comentarios solo cuando aportan contexto: archivos grandes llevan header con
  propósito y referencias (ej. `// Video: puertos — qué son...`); secciones se
  separan con `// ── Sección ───`.
- NO comentar lo obvio (`// incrementa x`). Comentar el "por qué", no el "qué".
- Mensajes de error en español, nunca `throw` — siempre
  `return { output, isError?: true }`.
- Mensajes de commit en el estilo del repo (mirar `git log --oneline -10`).

## Checklist de terminación (antes de dar por cerrado)

1. `pnpm exec tsc --noEmit` → 0 errores (strict, noUnusedLocals,
   noUnusedParameters).
2. `pnpm test:run` → tests relevantes pasan (Vitest 4.x, nombres en español).
3. Archivos < 300 líneas.
4. Sin magic numbers / strings hardcodeados que deberían ser constantes.
5. Sin imports desordenados (externos → `import type` → internos).
6. Sin `any` donde debería ir un tipo específico (los tipos viven en
   `src/types.ts`).
7. Naming: archivos `kebab-case`, componentes `PascalCase`, comandos
   `cmd_<nombre>`, tests `<nombre>.test.ts`.

## Code smells a evitar (del rol Code Reviewer, `specs/ROLES.md`)

- **Hardcodeados**: IDs de misión, nombres de herramientas en validaciones.
- **Acoplamiento**: una herramienta que valida contra otra herramienta.
- **Duplicación**: lógica repetida en varios archivos.
- **Side effects**: mutación de estado fuera del store.
- **Type safety**: uso de `any` innecesario.

## Referencias

- `AGENTS.md` — convenciones, comandos, arquitectura resumida.
- `docs/ARCHITECTURE.md` — sistema de validación universal y acoplamiento.
- `docs/PERMISSIONS.md` — patrón canónico + anti-patrones para filesystem.
- `specs/ROLES.md` — mindset de cada rol (Developer, QA, Code Reviewer, etc.).
- `docs/archive/MEJORAS_KIMI.md` §8 — auditoría de patrones y code smells.