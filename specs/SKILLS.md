# Skills — ZeroInfra Labs

## ¿Qué es una Skill?

Una **Skill** es una tarea reusable y documentada que un agente de IA puede ejecutar de forma predecible. Cada skill define:

- **Input**: qué necesita para empezar
- **Output**: qué produce al terminar
- **Checklist**: cómo verificar que el resultado es correcto
- **Archivos**: qué archivos toca o crea

---

## Skills Disponibles

### SKILL-01: `generate_spec`

Generar la especificación de un nuevo laboratorio a partir de una idea.

**Input:**
- Idea del lab (ej: "lab de SQLi en un login portal")
- Dificultad deseada (Easy/Medium/Hard)
- Categoría (Web/Network/System)
- Herramientas principales a usar

**Output:**
- Documento `specs/lab-XX-spec.md` con:
  - Metadata del scenario
  - Definición de máquinas (attacker + targets)
  - Puertos y servicios
  - Learning steps en orden
  - Flags y credenciales
  - Hints progresivos

**Checklist:**
- [ ] `id` único siguiendo patrón `scenario-XX`
- [ ] Al menos 5 learning steps en orden lógico
- [ ] Cada step tiene `task`, `taskEs`, `text`, `textEs`, `discoveryLevel`, `hints`
- [ ] `discoveryLevel` progresa correctamente (1→2→3→4)
- [ ] Flags definidas con formato `ZIL{...}`
- [ ] Credenciales asociadas a puertos correctos
- [ ] Compatible con `LAB_SPEC.md`

**Referencia:** `specs/LAB_SPEC.md`

---

### SKILL-02: `generate_lab`

Implementar un laboratorio completo a partir de una spec.

**Input:**
- Spec del lab (`specs/lab-XX-spec.md`)

**Output:**
- `src/laboratorios/laboratorioXX.ts` — escenario implementado
- Registro en `src/laboratorios/laboratorios.ts`
- Fakesite en `src/components/fakesites/` (si aplica)
- Archivos de configuración si son necesarios

**Checklist:**
- [ ] Archivo `laboratorioXX.ts` creado con estructura correcta
- [ ] Importa de `templates.ts` (`buildScenario`, `COMMON_PORTS`, `createFile`, `createLinuxFileSystem`)
- [ ] `targetMachine` con `id`, `hostname`, `mac`, `os`, `type`, `ports`
- [ ] `learningSteps` alineados con la spec
- [ ] `files` incluyen sistema base + archivos custom (flags, configs)
- [ ] Registrado en `SCENARIOS` array de `laboratorios.ts`
- [ ] `initialMachineId` apunta a máquina atacante
- [ ] `npm run build` compila sin errores
- [ ] `npm test` pasa todos los tests existentes

**Referencia:** `specs/LAB_SPEC.md`, `src/laboratorios/laboratorio01.ts`

---

### SKILL-03: `generate_tests`

Generar tests para un laboratorio o herramienta.

**Input:**
- Archivo del lab o herramienta
- Spec del lab (si aplica)

**Output:**
- `src/commands/__tests__/happyPath-scenarioXX.test.ts` — test de flujo completo
- Tests unitarios para herramientas nuevas
- Tests de integración si hay lógica compartida

**Checklist:**
- [ ] Test de golden path completo (arp-scan → ... → flag)
- [ ] Tests de error (IP inválida, discovery_level insuficiente, credenciales incorrectas)
- [ ] Tests de edge cases (puertos filtrados, servicios no encontrados)
- [ ] Usa helpers `exec()`, `expectSuccess()`, `advanceState()` si existen
- [ ] Valida propiedades del sistema (`completedMissionId`, `foundCredentials`, `isError`) no solo strings de output
- [ ] `npm test -- --run` pasa todos los tests

**Referencia:** `src/commands/__tests__/happyPath-scenario01.test.ts`, `src/commands/__tests__/happyPathHelpers.ts`

---

### SKILL-04: `analyze_scenario`

Analizar un laboratorio existente para encontrar problemas, inconsistencias o mejoras.

**Input:**
- Archivo `laboratorioXX.ts`
- Spec del lab (si existe)

**Output:**
- Reporte con:
  - Inconsistencias entre spec e implementación
  - Learning steps que no tienen sentido en orden
  - Hints que dan demasiado o muy poco
  - Puertos/credenciales que no coinciden
  - Posibles shortcuts no planeados
  - Sugerencias de mejora

**Checklist de análisis:**
- [ ] ¿Los `discoveryLevel` de los steps son coherentes con las herramientas requeridas?
- [ ] ¿Cada step es alcanzable con las herramientas listadas en `tools`?
- [ ] ¿Las credenciales están asociadas a los puertos correctos?
- [ ] ¿Los archivos existen en las rutas correctas del filesystem?
- [ ] ¿Los hints revelan información en el orden correcto (herramienta → comando)?
- [ ] ¿Hay algún paso que se pueda saltear?
- [ ] ¿El lab es resoluble sin hints?

---

### SKILL-05: `create_hint_system`

Crear o mejorar el sistema de hints progresivos para un laboratorio.

**Input:**
- Spec del lab o archivo `laboratorioXX.ts`

**Output:**
- `hints` actualizados en cada `learningStep`

**Reglas de hints:**
- `hint1`: menciona la **herramienta** a usar (ej: "Usá nmap")
- `hint2`: menciona el **comando** específico (ej: "nmap -sV 192.168.1.10")
- Nunca revelar la respuesta directa en hint1
- hint2 debe ser suficiente para completar el paso sin dar la solución completa

**Checklist:**
- [ ] Cada step tiene `hint1` y `hint2` en ambos idiomas (en/es)
- [ ] hint1 no revela el comando exacto
- [ ] hint2 no revela la flag o credencial
- [ ] Los hints son útiles pero no spoilers

---

### SKILL-06: `add_tool_feature`

Agregar una nueva flag o funcionalidad a una herramienta existente.

**Input:**
- Herramienta a modificar (ej: `nmap.ts`)
- Nueva feature deseada (ej: "agregar flag `-T` para timing")

**Output:**
- Herramienta actualizada con la nueva feature
- Tests para la nueva feature
- Documentación actualizada en `LAB_SPEC.md` (sección Herramientas)

**Checklist:**
- [ ] Nueva flag parseada correctamente
- [ ] Output refleja la nueva flag
- [ ] Tests unitarios para la nueva feature
- [ ] Tests existentes siguen pasando
- [ ] `LAB_SPEC.md` actualizado con la nueva flag
- [ ] `nmap -h` / `nmap --help` incluye la nueva flag

---

### SKILL-07: `attacker_validation`

Intentar resolver un laboratorio como si fuera un usuario real para validar que funciona.

**Input:**
- Lab implementado (`laboratorioXX.ts`)
- Spec del lab

**Output:**
- Reporte de validación:
  - ✅ Pasos que funcionan correctamente
  - ❌ Pasos que fallan o no se pueden completar
  - ⚠️ Shortcuts no planeados encontrados
  - 💡 Sugerencias de mejora

**Metodología:**
1. Empezar desde estado inicial (discovery_level = 0)
2. Intentar completar cada step en orden usando solo los hints
3. Intentar completar cada step SIN hints
4. Intentar saltear pasos (buscar shortcuts)
5. Verificar que las misiones se completan en orden correcto

---

### SKILL-08: `refactor_component`

Refactorizar un componente existente para mejorar mantenibilidad sin cambiar comportamiento.

**Input:**
- Componente o archivo a refactorizar
- Razón del refactor (ej: "reducir acoplamiento", "mejorar legibilidad")

**Output:**
- Componente refactorizado
- Tests pasando (sin cambios en comportamiento)

**Reglas:**
- No cambiar comportamiento observable
- No cambiar interfaces públicas (exports, props, tipos)
- Correr tests antes y después para confirmar
- Documentar cambios en el commit

---

### SKILL-09: `create_fakesite`

Crear un sitio web simulado para un laboratorio.

**Input:**
- Spec del lab con definición del sitio web
- Tipo de sitio (WordPress, portal login, consultoría, custom)

**Output:**
- Componente en `src/components/fakesites/`
- Registro en `FakeBrowser.tsx` (router)
- Tests del componente

**Checklist:**
- [ ] Componente funcional con props correctas
- [ ] Contenido en inglés (estándar del proyecto)
- [ ] Sensible a cambios en archivos de la máquina (credenciales dinámicas)
- [ ] Bloquea acceso si no se cumplieron prerrequisitos (ej: nmap previo)
- [ ] Tests de renderizado y lógica
- [ ] Integrado en `FakeBrowser.tsx`

---

### SKILL-10: `fix_bug`

Investigar y corregir un bug reportado.

**Input:**
- Descripción del bug
- Steps to reproduce (si existen)

**Output:**
- Bug corregido
- Test que previene regresión
- Commit con mensaje descriptivo

**Metodología:**
1. Reproducir el bug
2. Identificar causa raíz
3. Escribir test que falle (reproduce el bug)
4. Corregir el bug
5. Confirmar que el test pasa
6. Correr suite completa de tests

---

## Cómo usar las Skills

### Para el usuario

Cuando necesites que un agente haga algo, referenciá la skill:

```
Ejecutá SKILL-02 (generate_lab) con esta spec:
- Lab de SQLi en login portal
- Dificultad: Medium
- Tools: arp-scan, nmap, sqlmap, ssh
- networkRange: 10.10.10.0/24
```

### Para el agente

1. Leer la skill correspondiente en este archivo
2. Seguir el checklist paso a paso
3. Reportar completion de cada item
4. Solicitar revisión si algo no está claro

---

## Skills Planificadas (Futuro)

| Skill | Descripción | Prioridad |
|-------|-------------|-----------|
| `generate_npc` | Crear NPC mentor o rival para un lab | Media |
| `generate_command_evaluator` | Implementar el sistema de evaluación central | Alta |
| `balance_difficulty` | Ajustar dificultad de un lab basado en métricas | Baja |
| `i18n_translate` | Traducir contenido nuevo a EN/ES | Media |
| `generate_analytics_query` | Crear queries para Google Sheets analytics | Baja |

---

*Última actualización: Abril 2026*
*Basado en la arquitectura actual de ZeroInfra Labs*
