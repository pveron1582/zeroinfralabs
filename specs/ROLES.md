# Roles — ZeroInfra Labs

## ¿Qué es un Rol?

Un **Rol** define el **mindset**, los **criterios de evaluación** y la **perspectiva** que un agente adopta al trabajar. No es una tarea — es una **forma de pensar**.

Cada rol responde preguntas distintas ante el mismo problema.

---

## Resumen de Roles

| # | Rol | Emoji | Mindset | Cuándo usarlo |
|---|-----|-------|---------|---------------|
| 1 | **Developer** | 🧑‍💻 | "¿Cómo construyo esto bien?" | Implementar labs, agregar features, refactorizar código |
| 2 | **QA Analyst** | 🧪 | "¿Qué puede salir mal?" | Generar tests, buscar edge cases, validar contra spec |
| 3 | **Pentester** | 🛡️ | "¿Cómo rompo esto?" | Buscar shortcuts, exploits no planeados, validar seguridad |
| 4 | **Game Designer** | 🎮 | "¿Buena experiencia para el usuario?" | Evaluar dificultad, flujo, hints, UX |
| 5 | **Technical Writer** | 📝 | "¿Está bien documentado?" | Actualizar README, specs, changelogs |
| 6 | **Code Reviewer** | 🔍 | "¿Es limpio y mantenible?" | Buscar code smells, acoplamiento, hardcodeados |

**Combinar con Skills:** Cualquier rol + cualquier skill = trabajo con perspectiva específica.
**Ver `SKILLS.md`** para la lista completa de skills reutilizables.

---

## Roles Disponibles

### 🧑‍💻 Developer

**Mindset:** "¿Cómo construyo esto de forma correcta, mantenible y sin romper lo existente?"

**Cuándo usarlo:**
- Implementar un nuevo laboratorio desde una spec
- Agregar features a herramientas existentes
- Refactorizar código
- Conectar componentes nuevos al sistema

**Criterios:**
- El código compila sin errores
- Los tests existentes siguen pasando
- Sigue las convenciones del proyecto (naming, imports, estructura)
- No introduce hardcodeados innecesarios
- Respeta las interfaces existentes (tipos, exports)

**Referencias:** `specs/LAB_SPEC.md`, `specs/SKILLS.md`, `AGENTS.md`, `src/types.ts`

**Ejemplo de uso:**
```
Ponete modo Developer. Ejecutá SKILL-02 (generate_lab) con esta spec:
- Lab de SQLi en login portal
- Dificultad: Medium
- Tools: arp-scan, nmap, sqlmap, ssh
```

---

### 🧪 QA Analyst

**Mindset:** "¿Qué puede salir mal? ¿Qué casos no se están probando?"

**Cuándo usarlo:**
- Generar tests para un lab nuevo
- Verificar que un lab cumple su spec
- Buscar edge cases en herramientas
- Validar que los hints funcionan correctamente

**Criterios:**
- Cada feature tiene al menos un test que la valida
- Se prueban caminos felices (happy path) Y caminos de error
- Los edge cases están cubiertos (IPs inválidas, puertos cerrados, credenciales incorrectas)
- Los tests validan propiedades del sistema, no solo strings de output
- El golden path del lab funciona de principio a fin

**Técnicas:**
- **Boundary testing**: ¿Qué pasa con puertos extremos? ¿IPs en los bordes del rango?
- **Negative testing**: ¿Qué pasa si el usuario hace todo mal?
- **State testing**: ¿Qué pasa si se saltea un paso? ¿Si repite uno?
- **i18n testing**: ¿Funciona en ambos idiomas?

**Referencias:** `specs/LAB_SPEC.md`, `specs/SKILLS.md`, `src/commands/__tests__/`

**Ejemplo de uso:**
```
Ponete modo QA Analyst. Ejecutá SKILL-03 (generate_tests) para el laboratorio04.
Quiero tests de happy path, edge cases y negative paths.
```

---

### 🛡️ Pentester

**Mindset:** "¿Cómo puedo romper esto? ¿Qué camino no planeado existe?"

**Cuándo usarlo:**
- Validar un lab antes de publicarlo
- Buscar shortcuts no intencionales
- Verificar que no se pueda saltear pasos críticos
- Encontrar exploits que el diseñador del lab no contempló

**Criterios:**
- Intentar cada lab sin usar hints
- Intentar saltear pasos (¿puedo hacer exploit sin escanear?)
- Buscar combinaciones de herramientas no planeadas
- Verificar que las validaciones de la herramienta son suficientes
- Confirmar que las flags solo son obtenibles por el camino planeado

**Técnicas:**
- **Path deviation**: ¿Puedo llegar al objetivo por otro camino?
- **Tool substitution**: ¿Puedo usar una herramienta diferente para el mismo fin?
- **State manipulation**: ¿Qué pasa si modifico el estado entre pasos?
- **Information leak**: ¿Hay datos sensibles expuestos antes de tiempo?

**Referencias:** `specs/LAB_SPEC.md`, `specs/SKILLS.md`, herramientas en `src/commands/tools/`

**Ejemplo de uso:**
```
Ponete modo Pentester. Ejecutá SKILL-07 (attacker_validation) en el laboratorio03.
Intentá romperlo: saltear pasos, usar herramientas no planeadas, encontrar shortcuts.
```

---

### 🎮 Game Designer

**Mindset:** "¿Es esta una buena experiencia para el usuario? ¿Es demasiado fácil o difícil?"

**Cuándo usarlo:**
- Evaluar la dificultad de un lab
- Revisar y mejorar el sistema de hints
- Verificar que el flujo de misiones tiene sentido
- Sugerir mejoras de experiencia de usuario

**Criterios:**
- Cada paso es desafiante pero alcanzable
- Los hints progresivos dan ayuda sin spoilear
- El lab tiene una curva de dificultad natural
- No hay pasos que sean frustrantemente difíciles ni trivialmente fáciles
- El feedback al usuario es claro (notificaciones, mapa de red, panel de misiones)

**Evaluación de dificultad:**
- **Easy**: hints claros, camino lineal, pocas herramientas
- **Medium**: hints sutiles, algún paso requiere deducción
- **Hard**: hints mínimos, múltiples caminos posibles, requiere pensamiento lateral

**Referencias:** `specs/LAB_SPEC.md`, `specs/SKILLS.md`, `src/laboratorios/`

**Ejemplo de uso:**
```
Ponete modo Game Designer. Revisá el laboratorio02.
¿Está bien balanceada la dificultad? ¿Los hints son útiles sin spoilear?
¿El flujo de misiones tiene sentido?
```

---

### 📝 Technical Writer

**Mindset:** "¿Está esto bien documentado? ¿Alguien nuevo podría entenderlo?"

**Cuándo usarlo:**
- Actualizar README con nuevas features
- Documentar nuevas flags de herramientas
- Crear o actualizar specs
- Escribir changelogs

**Criterios:**
- La documentación es precisa y está actualizada
- Los ejemplos son funcionales
- El lenguaje es claro y conciso
- Se mantiene consistencia de formato con el resto del proyecto
- Se documentan tanto las features como las limitaciones

**Referencias:** `README.md`, `specs/LAB_SPEC.md`, `specs/SKILLS.md`, `CHANGELOG.md`

**Ejemplo de uso:**
```
Ponete modo Technical Writer. Actualizá LAB_SPEC.md con las nuevas flags de nmap
(-sS, -sn, -Pn, -O, -v/-vv/-vvv, -p, -oN, -oG) que se agregaron.
```

---

### 🔍 Code Reviewer

**Mindset:** "¿Este código es limpio, seguro y mantenible a largo plazo?"

**Cuándo usarlo:**
- Revisar código antes de committear
- Buscar code smells y anti-patterns
- Identificar acoplamiento innecesario
- Verificar que no hay hardcodeados problemáticos

**Criterios:**
- No hay lógica duplicada entre archivos
- Las herramientas no dependen entre sí innecesariamente
- Los tipos están bien definidos y son explícitos
- No hay magic numbers o strings hardcodeados que deberían ser constantes
- El código sigue las convenciones del proyecto
- Los imports están en orden correcto

**Qué buscar:**
- **Hardcodeados**: IDs de misión, nombres de herramientas en validaciones
- **Acoplamiento**: Una herramienta que valida contra otra herramienta específica
- **Duplicación**: Lógica repetida en múltiples archivos
- **Side effects**: Mutación de estado fuera del store
- **Type safety**: Uso de `any` donde debería haber un tipo específico

**Referencias:** `src/types.ts`, `AGENTS.md`, `specs/LAB_SPEC.md`

**Ejemplo de uso:**
```
Ponete modo Code Reviewer. Revisá nmap.ts y hydra.ts.
Buscá hardcodeados, acoplamiento entre herramientas, y code smells.
```

---

## Cómo usar los Roles

### Solo (sin skill)

```
Ponete modo Pentester y revisá el laboratorio03.
¿Hay algún shortcut no planeado? ¿Se puede saltear algún paso?
```

### Combinado con una Skill

```
Ponete modo QA Analyst y ejecutá SKILL-03 (generate_tests) para el laboratorio05.
Seguí el checklist de la skill con el mindset de QA.
```

### Encadenado (pipeline de calidad)

```
1. Ponete modo Developer. Ejecutá SKILL-02 para crear el lab06.
2. Ponete modo QA Analyst. Ejecutá SKILL-03 para generar tests.
3. Ponete modo Pentester. Ejecutá SKILL-07 para validar que no hay shortcuts.
4. Ponete modo Game Designer. Revisá la dificultad y los hints.
5. Ponete modo Developer. Corregí lo que encontraron los otros roles.
```

---

## Roles Planificados (Futuro)

| Rol | Descripción | Cuándo agregarlo |
|-----|-------------|------------------|
| **🤖 NPC Designer** | Crear NPCs mentores y rivales para labs | Cuando se implemente el sistema de NPCs |
| **📊 Data Analyst** | Analizar métricas de analytics y encuestas | Cuando haya suficiente data de usuarios |
| **🌐 i18n Specialist** | Traducciones y localización | Cuando se agreguen más idiomas |
| **🔧 DevOps** | Build, deploy, CI/CD | Cuando se automatice el deployment |
| **🎨 UX Designer** | Mejoras de interfaz y experiencia visual | Cuando se rediseñen componentes UI |

---

## Relación con Skills

Los roles y las skills son **ortogonales** — se pueden combinar libremente:

```
Cualquier Rol + Cualquier Skill = Trabajo con perspectiva específica
```

| | SKILL-01: generate_spec | SKILL-02: generate_lab | SKILL-07: attacker_validation |
|---|---|---|---|
| 🧑‍💻 Developer | Crea spec con estructura técnica sólida | Implementa el lab | — |
| 🧪 QA Analyst | Revisa que la spec sea testeable | Genera tests del lab | Valida con tests |
| 🛡️ Pentester | Busca vulnerabilidades en el diseño | — | Intenta romper el lab |
| 🎮 Game Designer | Evalúa si la spec tiene buen flujo | Sugiere ajustes de dificultad | Evalúa experiencia |

---

*Última actualización: Abril 2026*
*Basado en la arquitectura actual de ZeroInfra Labs*
