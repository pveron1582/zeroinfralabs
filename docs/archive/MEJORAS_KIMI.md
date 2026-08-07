# Auditoría de Arquitectura — Kimi K3 (2026-08-04)

> Revisión general del proyecto: arquitectura, estado, tests, docs y DX.
> Estado: **9 mejoras completadas** — ver §9 para el detalle de cambios aplicados.
> Última actualización: **2026-08-06** — Todas las mejoras aplicadas.

---

## 1. Veredicto general

La arquitectura conceptual está **bien pensada**. El sistema de validación universal es
genuinamente buen diseño. El problema de "complejidad" no es de diseño sino de
**fragmentación de responsabilidades en la capa de ejecución**: demasiada lógica
concentrada en un solo hook y estado de sesiones repartido en 3 lugares distintos.

| Aspecto | Nota | Comentario |
|---|---|---|
| Arquitectura conceptual | 8.5/10 | Validación universal, labs declarativos, comandos desacoplados |
| Calidad de código | 8.5/10 | Consistente, tipado, responsabilidades bien acotadas |
| Testing | 8/10 | 128 archivos de test, patrón claro, setup sólido |
| Documentación | 9/10 | Excepcional para un proyecto personal |
| Developer Experience | 8/10 | Hook orquestador 384 líneas, slices en store bien separados |
| Mantenibilidad | 8.5/10 | State único de sesiones, identity stack en store, todo <300 líneas |

---

## 2. Lo que está bien (fortalezas)

### 2.1 Sistema de validación universal ⭐

`Comando → metadata → LabValidator → misión completada`

- Los comandos no conocen los labs (bajo acoplamiento real)
- Agregar un lab = solo definir `validationCriteria`
- Agregar un comando = solo emitir metadata
- `src/utils/labValidator.ts` es limpio, declarativo y fácil de extender

### 2.2 Contrato tipado en `types.ts`

El `CommandResponse` como discriminated union centraliza toda la metadata que emiten
los comandos. Es la fuente única de verdad del sistema de validación. Bien diseñado.

### 2.3 Convenciones consistentes

- Pattern `cmd_<name>` uniforme
- Tests en español (`it('debe hacer algo', ...)`)
- Estructura de respuesta uniforme en todos los comandos
- Regla de archivos < 300 líneas (mayormente respetada)

### 2.4 ShellManager minimalista

~124 líneas, un stack de shells anidados, hace una sola cosa bien.
Buen ejemplo de capa de infraestructura aislada.

### 2.5 Documentación excepcional

`AGENTS.md` + `docs/ARCHITECTURE.md` + reglas de permisos inline en `types.ts`.
Un contributor nuevo puede entender el sistema leyendo 3 archivos.

### 2.6 Cobertura de tests

128 archivos de test con patrón uniforme (`happyPathHelpers.ts` como factory de mocks).
El setup global (`src/test/setup.ts`) resetea el store y mockea APIs del navegador
de forma automática.

---

## 3. Problemas detectados

### 3.1 `useCommandRunner.ts` ~~es~~ era un god hook ~~(776 líneas)~~ 🔴 → ✅

**Archivo:** `src/hooks/useCommandRunner.ts` — era el archivo más grande del
proyecto. Tras la descomposición completa de §4.1 (aplicada el 2026-08-05),
quedó en **384 líneas** como orquestador delgado. Las responsabilidades
antes concentradas en un solo hook ahora viven en 9 módulos especializados
(fila a fila en la tabla siguiente, hoy todos extraídos):

| # | Responsabilidad (histórica) | Estado actual | Nuevo módulo |
|---|---|---|---|
| 1 | Ejecución de comandos (runCommand) | ✅ Extraído | `useCommandRunner.ts` (384 líneas, orquestador) |
| 2 | Historial, scroll, auto-focus | ✅ Extraído | `useTerminalEffects.ts` |
| 3 | Streaming con delays por comando | ✅ Extraído | `streamingConfig.ts` + `runCommand` |
| 4 | Sesión FTP interactiva | ✅ Extraído | `useFtpSession.ts` |
| 5 | Sesión SSH interactiva | ✅ Extraído | `useSshSession.ts` |
| 6 | Password prompt para `su` (pendingSu) | ✅ Extraído | `usePendingSu.ts` |
| 7 | Identity stack | ✅ Extraído (fase 1) | `useIdentityStack.ts` |
| 8 | Reverse shell handling | ✅ Extraído | `useReverseShell.ts` |
| 9 | Guardado de archivos (nano) | ✅ Extraído (fase 1) | `useNanoSave.ts` |
| 10 | Auto-refresh de top/htop | ✅ Extraído | `useAutoRefresh.ts` |
| 11 | Mission completion checking | ✅ Extraído | `useMissionCompletion.ts` + `processCommandResult.ts` |
| 12 | MSF state bridging | ✅ En línea (`handleSetMsfState` en orquestador) | — |

**Impacto anterior:** cualquier cambio en manejo de sesiones, identidades,
streaming, permisos o misión requería tocar este archivo.

**Impacto actual:** cada concern tiene su propio archivo testeable. El hook
principal es composición pura.

### 3.2 Estado de sesiones fragmentado en 3 lugares ~~🔴~~ → ✅

```
ShellManager (singleton en memoria)           ← SSH/FTP sessions (ejecución)
Zustand store                                 ← ftpSession, sshSession, msfState,
                                                blockingCommand, listeningPort
                                                (estado para UI)
```

**Resuelto (2026-08-05):** `useFtpSession` y `useSshSession` ahora leen/escriben
del store directamente — no hay estado React local duplicado. `ShellManager` sigue
siendo el orquestador de ejecución (ejecuta sub-comandos como `USER`/`PASS`),
pero el *estado visible para la UI* vive únicamente en el store.

La separación restante es intencional:
- `ShellManager` = infraestructura de ejecución (qué comandos corren)
- Store = estado de presentación (qué prompt mostrar, qué sesión está activa)

El identity stack también vive en el store (§4.5) — ya no hay hooks con estado
de sesión privado.

### 3.3 MSF state usa un protocolo implícito frágil 🟡

**Archivo:** `src/commands/index.ts` líneas 61-73

```typescript
// Los sub-comandos de MSF serializan su estado DENTRO del output:
return { output: 'MSF_STATE:{"active":true,...}\nmsf6 >' }

// El dispatcher lo parsea con string matching:
if (!result.output.startsWith('MSF_STATE:')) return result;
const parsedState = safeJsonParse<MsfState | null>(result.output.slice(...));
```

**Riesgo:** si alguien cambia el formato de output de un comando MSF, rompe el estado
sin que TypeScript lo detecte. Es código que funciona pero que cualquier refactor
puede romper silenciosamente.

### 3.4 Duplicación de tipos de sesión 🟡

`FtpSessionState` existe tanto en `src/types.ts` como `FtpSessionData` en
`src/types.ts` (el segundo dentro del union de CommandResponse). Los campos son
casi idénticos pero se mantienen por separado:

```typescript
// types.ts: FtpSessionData (usado por comandos para emitir resultado)
interface FtpSessionData { active, connected, targetIp, targetId, username, loggedIn, currentDir, step }

// store/types.ts: FtpSessionState (usado por el store)
interface FtpSessionState { active, targetIp, targetId, username, loggedIn, currentDir, step }
```

Lo mismo para SSH (`SshSessionData` vs `SshSessionState`).

### 3.5 Registro de comandos requiere 4 pasos manuales 🟡

Para agregar un comando hay que tocar:
1. Crear `src/commands/builtin/<name>.ts`
2. Re-exportar en `src/commands/builtin/index.ts`
3. Importar en `src/commands/index.ts`
4. Agregar al `COMMANDS` Map en `src/commands/index.ts`

Son ~70 comandos registrados manualmente. Un barrel file que re-exporte todo y un
loop de auto-registro eliminaría los pasos 2-4 y reduciría errores de omisión.

### 3.6 `validators/custom` es dead code 🟡

```typescript
case 'custom':
  // Custom validation handled elsewhere or via conditions
  return false;
```

Siempre retorna `false`. Si existe en `MissionCriteriaType` pero no se usa,
genera confusión sobre su propósito. O se implementa o se elimina del type union.

### 3.7 `AGENTS.md` tiene info desactualizada sobre state ~~🟢~~ → ✅

Resuelto: la sección de "MSF state management" fue actualizada. El documento
ahora describe correctamente que el estado vive en el Zustand store
(`useScenarioStore.getState().msfState`), no en una variable de módulo.
También se corrigió la ubicación del identity stack (era React state, ahora
es `identitySlice` en el store).

---

## 4. Mejoras propuestas (priorizadas)

### Quick wins (1-2hs cada una)

#### 4.1 Descomponer `useCommandRunner` en hooks especializados ⭐⭐⭐

La mejora individual más grande que se puede hacer:

```
useCommandRunner.ts          → orquestador delgado (~100 líneas)
├── useIdentityStack.ts      → push/pop/apply de identidades
├── useSessionHandlers.ts    → FTP + SSH interactivos unificados
├── useStreamingOutput.ts    → delays CMD_DELAYS, animación línea por línea
├── useNanoSave.ts           → lógica de guardado de archivos con permisos
├── useMissionChecker.ts     → validateMission + completedMissionId
└── useTerminalFocus.ts      → auto-focus, scroll, blur handling
```

Cada hook < 150 líneas, testeable por separado, y el principal se convierte en
composición pura.

#### 4.2 Eliminar el `MSF_STATE:` prefix del output

```typescript
// Antes (frágil):
return { output: 'MSF_STATE:{...}\nmsf6 >' }

// Después (tipo-seguro):
return { output: 'msf6 >', msfStateUpdate: newState }
```

Agregar `msfStateUpdate?: MsfState | null` a `CmdResponseBase` en `types.ts`.
El dispatcher lo lee directamente sin parsing de strings.

#### 4.3 Unificar tipos de sesión

Crear un `SessionData` común en `types.ts`:

```typescript
interface SessionData {
  active: boolean;
  targetIp?: string;
  targetId?: string;
  username?: string;
  step: string;
}

interface FtpSessionData extends SessionData {
  loggedIn?: boolean;
  currentDir?: string;
  step: 'connecting' | 'username' | 'password' | 'connected';
}

interface SshSessionData extends SessionData {
  authenticated?: boolean;
  step: 'connecting' | 'password' | 'connected';
}
```

Usar el mismo tipo en `CommandResponse` y en el store.

#### 4.4 Eliminar `custom` del union de validators

Si no tiene implementación real, quitar `'custom'` de `MissionCriteriaType` para
evitar confusión. O implementar un mecanismo real si hay planes de usarlo.

### Refactors estratégicos (medio día)

#### 4.5 ✅ Identity stack → servicio/store (completa — 2026-08-05)

Se movió el stack de identidades de React state (dentro de `useIdentityStack`)
al store Zustand (`identitySlice`):

| Aspecto | Antes | Después |
|---|---|---|
| Ubicación del stack | React `useState` en hook | Zustand store (`scenarioStore`) |
| Persistencia al recargar | Se pierde (intencional) | Se pierde (intencional) |
| Accesibilidad | Solo dentro de `useCommandRunner` | Desde cualquier componente vía `useScenarioStore` |
| Testabilidad | Requiere montar hook React | Se puede testear con `useScenarioStore.setState()` directamente |

Cambios realizados:

- **Nuevo** `src/store/slices/identitySlice.ts` — stack + `pushIdentity`,
  `popIdentity`, `resetIdentity`, `applyIdentity`.
- **Modificado** `src/store/types.ts` — `ScenarioState` extiende `IdentitySlice`.
- **Modificado** `src/store/scenarioStore.ts` — integra `createIdentitySlice`.
- **Refactorizado** `src/hooks/useIdentityStack.ts` — ya no tiene estado propio,
  solo lee del store y sincroniza el frame base al montar.
- **Modificado** `src/hooks/useCommandRunner.ts` — pasa solo `initialMachine` y
  `onChangeMachine` al hook (antes pasaba 4 callbacks).
- **Modificado** `src/hooks/__tests__/useCommandRunner.test.ts` — mock del store
  ahora incluye las acciones del identity slice.

Beneficio adicional: el identity stack ahora sobrevive a un remount del componente
Terminal (aunque sigue reseteándose al cambiar de escenario, por diseño).

### 4.6 ✅ Session state unificado en store (2026-08-05)

Se eliminó la duplicación de estado de sesiones FTP/SSH:

**Antes:**
- `useFtpSession` / `useSshSession` tenían `useState` local en el hook
- `AppContent` / `AdminPanel` / `NetworkMap` leían del store Zustand
- Resultado: dos fuentes de verdad desincronizadas

**Después:**
- `useFtpSession` / `useSshSession` leen/escriben directamente del store
- `Terminal` sigue recibiendo los mismos valores (API estable del hook)
- Cualquier componente puede leer `ftpSession`/`sshSession` sin pasar por el hook

Nota: `ShellManager` sigue siendo el orquestador de ejecución de sub-comandos
(él maneja el stack de shells y la ejecución de `USER`/`PASS`/`GET`/etc.).
El store solo refleja el *estado de sesión* para la UI (prompt, indicadores
visuales, mapa de red). Esto es intencional: `ShellManager` es infraestructura
de ejecución, el store es estado de presentación.

### 4.7 ✅ Auto-registro de comandos (2026-08-05)

Se eliminó el registro manual de comandos en el `COMMANDS` Map:

**Antes:** 4 pasos para agregar un comando:
1. Crear `src/commands/builtin/<name>.ts` o `src/commands/tools/<name>.ts`
2. Re-exportar en `src/commands/builtin/index.ts` o `src/commands/tools/index.ts`
3. Importar en `src/commands/index.ts`
4. Agregar entrada manual al `COMMANDS` Map (72 entradas mantenidas a mano)

**Después:** 2 pasos:
1. Crear el archivo del comando con export `cmd_<name>`
2. Re-exportar desde el barrel file correspondiente (`builtin/index.ts` o `tools/index.ts`)

El `COMMANDS` Map se auto-construye en `src/commands/index.ts` iterando los
exports de los barrels y registrando todo lo que empiece con `cmd_` y tenga
`name` + `execute`. `msfconsole` sigue siendo un factory especial que se
regresa manualmente (una sola línea).

Archivos modificados:
- `src/commands/index.ts` — imports de `*` desde los barrels, auto-registro

Beneficio: elimina el paso 3 y 4 del proceso anterior. Menos imports manuales
y menos riesgo de olvidar registrar un comando nuevo.

---

## 5. Riesgos si no se cambia nada

| Riesgo | Probabilidad | Impacto |
|---|---|---|
| Bug sutil al modificar useCommandRunner | Alta | Alto — todo pasa por ahí |
| Sesiones FTP/SSH desincronizadas entre ShellManager y hook | Media | Medio — causa bugs intermitentes de UI |
| Estado MSF roto por cambio en formato de output | Baja | Alto — todo el flujo metasploit se rompe |
| Dificultad para onboarding de contributors | Crece con tiempo | Medio |
| Tests frágiles si se refactoriza el hook | Alta | Medio — 128 archivos de test que tocan el executor |

---

## 6. Orden sugerido de implementación

```
Semana 1 (quick wins): ✅ COMPLETADO 2026-08-06
  1. [4.2] MSF_STATE prefix → tipo explícito          (✅ hecho)
  2. [4.4] Eliminar custom validator                   (✅ hecho — reemplazado por browserAction)
  3. [4.3] Unificar tipos de sesión                    (✅ hecho)
  4. [4.1] Descomponer useCommandRunner                (✅ hecho — 776→384 líneas)

Semana 2 (strategic): ✅ COMPLETADO 2026-08-05
  5. [4.5] Identity stack → store                     (✅ hecho)
  6. [4.6] SessionCoordinator                          (✅ hecho — store único)
  7. [4.7] Auto-registro de comandos                   (✅ hecho)

Pendientes menores: ✅ TODOS COMPLETADOS 2026-08-06
  8. [3.7] Actualizar AGENTS.md                        (✅ hecho)
  9. [8.2] Fix SUID try/finally                        (✅ hecho)
 10. [4.4] Eliminar custom → browserAction             (✅ hecho)
```

---

## 7. Lo que NO cambiaría

- **El sistema de validación universal** (`labValidator.ts`) — es el mejor logro
  arquitectónico del proyecto
- **ShellManager** — hace una sola cosa bien, es limpio y testeable
- **La convención `cmd_<name>`** — consistencia real en todos los comandos
- **Zustand con slices** — la estructura ui/terminal/scenario es adecuada
- **El patrón de labs declarativos** — `buildScenario()` + `validationCriteria`
  escala bien
- **Las docs (AGENTS.md, ARCHITECTURE.md)** — actualizar la parte desactualizada,
  pero el formato y nivel de detalle es correcto
- **La suite de tests** — 128 archivos con patrón uniforme es una base excelente

---

## 8. Análisis de patrones de diseño

**Veredicto: la arquitectura sigue patrones estándar bien identificables — no
salió "cualquier cosa".** La sensación de "complicado" no viene de los patrones,
sino de violaciones de disciplina de fronteras (SRP, single source of truth).
Los problemas de fronteras se arreglan con refactors acotados; los de diseño
conceptual hubieran obligado a reescribir. Este proyecto está en el primer caso.

### 8.1 Patrones estándar presentes (bien aplicados)

| Patrón | Dónde | Evaluación |
|---|---|---|
| **Command** (GoF) | `src/commands/index.ts` — registry + `execute(args, ctx)` | Textbook: invoker desacoplado de receivers; el patrón idiomático para terminales/IDEs |
| **Specification** | `validationCriteria` + `labValidator.ts` | Criterios declarativos evaluados contra resultados; mismo patrón que queries de ORMs. Es lo que hace a los labs "declarativos" |
| **Event-Driven / Mediator** | `CommandResponse` metadata → validator | Comandos emiten sin conocer consumidores; el response actúa como mensaje en un bus implícito |
| **Builder** | `buildScenario()` en `templates.ts` | Construcción paso a paso de `Scenario` complejo |
| **Factory Method** | `createFile()`, `buildNewFile()` | Creación consistente de `FileEntry` |
| **State** | Consola MSF (`ContextRegistry`, contextos base/meterpreter/shell) | Comportamiento cambia por contexto; State + Strategy combinados |
| **Stack** (estructural) | `ShellManager` — shells anidados LIFO | Modelo fiel a shells reales y call stacks |
| **Strategy** (por tabla) | Switch de validadores, `CMD_DELAYS` lookup | Selección de algoritmo por clave, sin ifs dispersos |
| **Slice** | Store Zustand (ui/terminal/scenario) | Patrón del mundo Redux Toolkit |
| **Hook Composition** | `useIdentityStack` + `useNanoSave` + `useMissionCompletion` | Patrón idiomático React para SRP en lógica de UI (aplicado en 4.1) |
| **Mini-Interpreter** | `shellParse.ts` → expansión → pipes/redirección → dispatch | Parseo separado de ejecución: la estructura de un intérprete chico |

### 8.2 ~~Desviaciones del estándar (code smells)~~ → Resueltas

| Desviación | Qué viola | Estado |
|---|---|---|
| `useCommandRunner` god object (692 líneas tras refactor) | SRP — un hook con ~8 responsabilidades | **Resuelto** (384 líneas, orquestador) |
| Tipo `'hybrid'` en `CommandResponse` | Debilita el discriminated union — cajón de sastre que acepta todo | Pendiente (riesgo bajo, se mantiene por compatibilidad) |
| `ctx.machine.privesc_completed = true` temporal en SUID (`commands/index.ts`) | Mutación con save/restore manual — si el comando lanzara, queda estado corrupto | **Resuelto** — `try/finally` agregado |
| Estado de sesiones en 3 lugares (singleton + store + hook) | Single Source of Truth | **Resuelto** (§4.6 — store único) |
| `shellManager` singleton global | Testeable solo porque se resetea en setup | Baja — diseño intencional, documentado |

### 8.3 Anécdota que valida el análisis

Al implementar **4.2**, 5 tests rompieron precisamente por el patrón frágil
que la auditoría había señalado: tests que matcheaban `"auxiliary"` en el
output solo pasaban porque el JSON embebido traía `"module": "auxiliary/..."`.
Eran tests de humo disfrazados de assertions. El bug se manifestó al tocar el
protocolo — exactamente el riesgo documentado en §3.3.

---

## 9. Cambios aplicados (2026-08-04)

Tras la auditoría inicial, se implementaron los siguientes quick wins:

### 4.2 ✅ MSF state como campo explícito

Se eliminó el protocolo implícito `MSF_STATE:{json}\n` que los orquestadores
Metasploit embebían en el `output` de cada `CommandResponse`.

- `src/types.ts` — nuevo campo `msfStateUpdate?: MsfState | null` en `CmdResponseBase`
- `src/frameworks/metasploit/core/msfHelpers.ts` — `withState` emite el campo explícito
- `src/frameworks/metasploit/orchestrators/msfBase.ts` — `exit/quit` actualizado
- `src/commands/index.ts` — `parseMsfResponse` lee el campo directo, `safeJsonParse` eliminado
- 6 archivos de test MSF actualizados para usar `result.msfStateUpdate`

Beneficio: TypeScript valida el estado en lugar de parsear strings frágiles.

### 4.4 ✅ Eliminado `custom` validator (2026-08-06)

**Problema:** `type: 'custom'` existía en el union `MissionCriteriaType` pero el
validator siempre retornaba `false`. Se descubrió que los labs 01/02/04 lo usaban
para validación manual en `FakeBrowser.tsx`.

**Solución:** Reemplazado por `browserAction` — un criterio explícito con campos
específicos:

```typescript
// Antes (confuso, siempre false en validator):
validationCriteria: { type: 'custom' }

// Después (explícito, documentado):
validationCriteria: { type: 'browserAction', action: 'navigate', url: '/wp-admin' }
```

Cambios realizados:

| Archivo | Cambio |
|---|---|
| `src/types.ts` | `'custom'` → `'browserAction'` en `MissionCriteriaType`; agregados campos `url` y `action` a `ValidationCriteria` |
| `src/laboratorios/laboratorio01.ts` | 3 misiones custom → browserAction con metadata |
| `src/laboratorios/laboratorio02.ts` | 1 misión custom → browserAction |
| `src/laboratorios/laboratorio04.ts` | 1 misión custom → browserAction |
| `src/laboratorios/__tests__/laboratorio02.test.ts` | Test actualizado |
| `src/utils/__tests__/labValidator.test.ts` | Test de custom → browserAction |
| `src/utils/labValidator.ts` | Caso `custom` eliminado, agregado `browserAction` (documentado como validación externa en FakeBrowser) |

**Nota:** La validación real de `browserAction` sigue ocurriendo en
`FakeBrowser.tsx` (el componente llama `onMissionComplete` cuando el usuario
navega a la URL objetivo). El validator retorna `false` por diseño — la
validación es "externa" al sistema de comandos, pero ahora es **explícita**
en lugar de un hack genérico.

### 4.3 ✅ Tipos de sesión unificados

Se eliminó la duplicación entre `FtpSessionData`/`FtpSessionState` y
`SshSessionData`/`SshSessionState`:

- `src/types.ts` — tipos base extendidos con `connected?: boolean`
- `src/store/types.ts` — `FtpSessionState`/`SshSessionState` ahora son alias de
  los tipos de `src/types.ts`, sin campos duplicados

### 4.1 ✅ Descomposición de `useCommandRunner` (completa — 2026-08-05)

**Segunda fase aplicada el 2026-08-05:** el hook principal pasó de
**693 → 384 líneas** (de las 776 originales, un **50% menos**). Ya no es un
god hook: ahora es un orquestador delgado que compone 9 módulos especializados.

| Archivo | Líneas | Responsabilidad |
|---|:-:|---|
| `src/hooks/useIdentityStack.ts` | 87 | Stack de identidades (push/pop/apply, reseteo) |
| `src/hooks/useNanoSave.ts` | 78 | Guardado de archivos con validación de permisos |
| `src/hooks/streamingConfig.ts` | 39 | Delays de streaming (helpers puros, sin React) |
| `src/hooks/useMissionCompletion.ts` | 19 | Wrapper de `validateMission` + store |
| `src/hooks/processCommandResult.ts` | 194 | **Dispatcher puro** de side-effects de `CommandResponse` |
| `src/hooks/useFtpSession.ts` | 98 | Sesión FTP interactiva (estado, prompt, sub-comandos) |
| `src/hooks/useSshSession.ts` | 67 | Sesión SSH interactiva (estado, password prompt) |
| `src/hooks/usePendingSu.ts` | 59 | Password `su`/`sudo -i` con validación |
| `src/hooks/useReverseShell.ts` | 66 | Listener `nc` → conexión de reverse shell |
| `src/hooks/useAutoRefresh.ts` | 71 | Polling de `top`/`htop` |
| `src/hooks/useDownloadedFile.ts` | 51 | `ftp get`/`scp`/`wget` → archivo descargado al atacante |
| `src/hooks/useTerminalEffects.ts` | 50 | Scroll, focus, window focus |

Beneficios:

- `processCommandResult` es una **función pura** sin React — testeable sin
  montar componentes.
- Cada tipo de sesión (FTP, SSH, su) tiene su propio hook con su prompt y
  su ciclo de vida aislados.
- Decisiones de diseño documentadas: los type guards en las sesiones explican
  por qué el narrowing de TS sobre `CommandResponse` no funciona ahí (la
  unión tiene miembros sin `type` que rompen el estrechamiento con `in`).

Verificación final:
- `pnpm exec tsc --noEmit` — compila limpio
- `pnpm test:run` — **1680/1680 tests pasan**

### 3.7 ✅ AGENTS.md actualizado (2026-08-05)

Se corrigió la documentación desactualizada:
- MSF state: ya no dice "_msfState module variable", ahora describe correctamente
  que vive en el Zustand store (`useScenarioStore.getState().msfState`)
- Store slices: actualizado de 3 a 4 slices (`identitySlice` agregado)
- `createIsolatedExecutor`: descripción actualizada

### 8.2 ✅ SUID con try/finally (2026-08-05)

El bug de riesgo **Alto** identificado en la auditoría fue corregido.

**Antes:**
```typescript
const originalPrivesc = ctx.machine.privesc_completed;
ctx.machine.privesc_completed = true;
result = cmd.execute(finalArgs, ctx);  // ← si esto lanza, privesc queda corrupto
ctx.machine.privesc_completed = originalPrivesc;
```

**Después:**
```typescript
const originalPrivesc = ctx.machine.privesc_completed;
ctx.machine.privesc_completed = true;
try {
  result = { ...cmd.execute(finalArgs, ctx), privescAttempted: true, ... };
} finally {
  ctx.machine.privesc_completed = originalPrivesc;  // siempre se restaura
}
```

Archivo: `src/commands/index.ts` líneas ~208-222.
