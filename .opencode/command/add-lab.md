---
description: Agrega un laboratorio nuevo al simulador siguiendo el patrón declarativo de labs (buildScenario, SCENARIOS, COMMON_PORTS, tests happy path).
agent: build
---

Agregá un laboratorio nuevo a ZeroInfra Labs siguiendo el **patrón declarativo**
del proyecto (ver `AGENTS.md` sección "Lab Pattern" y `docs/ARCHITECTURE.md`).
Cargá la skill `coding-practices` antes de empezar.

Requerimiento: $ARGUMENTS

## Flujo obligatorio

1. **Creá el scenario** en `src/laboratorios/laboratorioXX.ts` (próximo número
   libre, ej. `laboratorio07.ts`) con un objeto `scenarioXXData`:
   - Máquina(s) objetivo con `COMMON_PORTS` helpers de `templates.ts`.
   - `learningSteps` con `validationCriteria` (los criterios se definen con la
     metadata de `CommandResponse`: `scanResults`, `foundCredentials`,
     `sshLogin`, `privesc`, etc.).

2. **Usá `buildScenario({...})`** de `src/laboratorios/templates.ts` para
   construir el `Scenario` — no armes el objeto a mano.

3. **Registralo** en `src/laboratorios/laboratorios.ts`:
   - Export del archivo nuevo.
   - Agregar al array `SCENARIOS` (visible). Si es oculto, usar el patrón de
     `TEST_SCENARIO` (laboratorio06).
   - Si corresponde, actualizar `SCENARIOS_META` para la LandingPage.

4. **Tests happy path** en `src/commands/__tests__/happyPath-scenarioXX.test.ts`:
   - Flujo completo: reconocimiento → escaneo → credenciales → acceso → flag.
   - Nombres en español, usar `happyPathHelpers.ts`.
   - Assert sobre la metadata emitida por cada comando y el estado de la misión.

5. **Verificación final** (obligatoria, reportar resultados):
   - `pnpm exec tsc --noEmit` → 0 errores
   - `pnpm test:run` → correr los tests del lab nuevo (y los existentes)

## Reglas clave

- Comandos **no conocen los labs**: el lab solo declara `validationCriteria`;
  no toques comandos para "hacer que el lab funcione".
- Sin hardcodeados de credenciales en comandos; las credenciales viven en el
  scenario y se asocian al puerto correcto.

## Salida

Resumí: archivo creado, escenas/steps y criterios definidos, registro en
`laboratorios.ts`, tests agregados y resultado de tsc + tests.