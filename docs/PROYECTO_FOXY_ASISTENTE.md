# PROYECTO: Foxy como Asistente por Misión (integra los hints)

> Proyecto pendiente de implementación. Plan aprobado el 2026-08-03.
> **Estado: NO implementado todavía.** Este documento describe el diseño acordado
> para retomarlo cuando se decida construir.

## Objetivo

Que Foxy (la mascota del simulador) actúe como asistente interactivo dentro de cada
misión del `MissionPanel`, reemplazando los botones de hint actuales por una burbuja
que ofrezca dos niveles de ayuda:

1. **"Te doy orientación"** — pista general (hint1) y luego pista concreta (hint2).
2. **"Te explico cómo resolverlo"** — solución paso a paso con comandos copiables.

La mecánica de desbloqueo progresivo (`revealNextHint` + `hintLevel`) se mantiene.

## Decisiones de diseño (acordadas con el usuario)

- **Alcance:** asistente por misión (no guía global del lab).
- **Editor:** los pasos se definen en código declarativo (`src/laboratorios/laboratorioXX.ts`),
  siguiendo el patrón `{en, es}` de los hints actuales. No hay editor visual en runtime.
- **Acciones de los pasos:** texto + comandos copiables (bloque `<code>` con botón
  "Copiar"). Sin apertura automática de terminal/navegador.
- **Hints:** Foxy integra y reemplaza los hints actuales (un solo sistema, no conviven por separado).

## Estado actual del código (contexto)

- `StepHint` en `src/types.ts:45-48` = `hint1` (orientación) + `hint2` (solución directa),
  en `{en, es}`. Definido en los 6 labs y montado en misiones por `buildScenario`
  (`src/laboratorios/templates.ts:62`).
- `HintButton` en `src/components/MissionPanel.tsx:16-78` revela hints progresivos vía
  `revealNextHint` (`src/store/slices/scenarioSlice.ts:150`). Vive dentro de `StepCarousel`
  (`MissionPanel.tsx:264-267`), por eso es **por misión**.
- `FoxyFox.tsx` (SVG animado reutilizable, prop `size`) + patrones de burbuja del
  `FoxyTour` (`src/components/tour/`) para la estética.
- `MissionPanel.tsx` ya tiene ~398 líneas → el asistente debe ser un componente separado.
- Tests existentes que NO tocan hints: `MissionPanel.test.tsx`, `AdminPanel.test.tsx`
  (mockea `MissionPanel`). No deberían romperse.

## Cambios propuestos

### 1. Tipos — `src/types.ts`
- Nueva interfaz `SolutionStep { en: string; es: string; command?: string }`.
- Extender `StepHint` con campo opcional `solution?: SolutionStep[]` (pasos de resolución
  en/es, con comando opcional para copiar).
- `solution` queda **opcional**: si un lab no la define, la opción 2 de Foxy solo muestra
  `hint2` (comportamiento actual).

### 2. Contenido — `src/laboratorios/laboratorio01..06.ts`
- Añadir `solution` con 3-5 pasos a cada lab (ej. paso 1: comando, paso 2: abrir
  navegador, etc.). Textos ES/EN siguiendo el patrón `{en, es}` existente.

### 3. Nuevo componente — `src/components/FoxyAssistant.tsx` (<300 líneas)
- Prop: `{ mission: Mission }` + `resolve(text, targetId)` (reusa el resolver de IPs del panel).
- Burbuja con `FoxyFox size={40}` y mensaje "¿Cómo te ayudo?" con 2 opciones:
  - **"Te doy orientación"** → revela `hint1` y luego `hint2` (reusa `revealNextHint`;
    botones deshabilitados hasta que el nivel permita).
  - **"Te explico cómo resolverlo"** → si existe `solution`, muestra los pasos numerados
    con el comando en bloque `<code>` + botón **Copiar** (`navigator.clipboard`, feedback
    "¡Copiado!"); si no, revela `hint2`.
- Estado local (`useState`) para elegir opción / mostrar pasos. Sin cambios de store
  (solo reusa `revealNextHint`).

### 4. Integración — `src/components/MissionPanel.tsx`
- Reemplazar el bloque `HintButton` de `StepCarousel` (líneas 264-267) por
  `<FoxyAssistant mission={currentMission} resolve={resolve} />`.
- Pasar `resolve` al carousel / `FoxyAssistant` (o recibirlo del `MissionPanel`).

### 5. i18n — `src/i18n/translations.ts`
- Nuevas keys EN/ES: `foxyHowCanIHelp`, `foxyOrient`, `foxySolve`, `foxyStep`,
  `foxyCopy`, `foxyCopied`, `foxySolved`, `foxyHintLabel`.

### 6. Tests
- Nuevo `src/components/__tests__/FoxyAssistant.test.tsx`:
  - opción orientación → llama `revealNextHint`;
  - opción solución → muestra pasos y comandos;
  - botón copiar → clipboard + feedback.
- Ajustar `MissionPanel.test.tsx` si el texto de hint cambia (los tests actuales no
  tocan hints, deberían seguir verdes).

### 7. Verificación
- `pnpm exec tsc --noEmit`
- `pnpm build`
- Suite completa: `pnpm test:run`

## Decisiones por defecto (revisar antes de implementar)

- **AdminPanel:** no se toca — la edición es declarativa en los labs. (Opcional más
  adelante: tab de previsualización de la guía.)
- **Persistencia:** la solución se muestra/oculta localmente; no se agrega `hintLevel`
  extra. Mantener simple.
