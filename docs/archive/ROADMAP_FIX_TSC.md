# ROADMAP FIX: Solución de Errores de TypeScript (`tsc --noEmit`)

Guía detallada paso a paso para resolver los **128 errores de TypeScript** en ZeroInfra Labs manteniendo la compatibilidad con los **1.135 tests pasando en Vitest (100%)**.

---

## 📌 Ubicación y Contexto

- **Proyecto**: ZeroInfra Labs (React + TypeScript + Vite)
- **Comando de Verificación**: `pnpm exec tsc --noEmit`
- **Comando de Tests**: `pnpm test:run`

---

## 🎯 Diagnóstico de Errores

| Categoría | Causa Raíz | Archivos Afectados | Solución Propuesta |
|---|---|---|---|
| 1. Archivos Deprecados | Inclusión de legacy code | `src/_deprecated/` (22 errores) | Excluir `src/_deprecated` en [tsconfig.json](file:///home/pablo/cyberops-v2/tsconfig.json) |
| 2. Tipos de Permisos / FS | Falta `type: 'text'` en `FileEntry` | [fs-linux.ts](file:///home/pablo/cyberops-v2/src/fs-models/fs-linux.ts) | Agregar `type: 'text'` a `/etc/passwd`, `/etc/shadow` y wordlists |
| 3. Interfaces Base | Falta `service` y `completedMissionId` | [types.ts](file:///home/pablo/cyberops-v2/src/types.ts) | Agregar `service?: string` en `ValidationCriteria` y `completedMissionId?: number` en `CommandResponse` |
| 4. Firmas de Funciones | Parámetro obligatorio `machines` | [useCommandRunner.ts](file:///home/pablo/cyberops-v2/src/hooks/useCommandRunner.ts) | Pasar `machines` array en invocaciones de test |
| 5. Componentes y Mocks UI | Props desactualizadas en tests | Tests de UI y Metasploit | Actualizar mocks en tests de componentes |

---

## 🛠️ Pasos de Ejecución para Cualquier Agente / Desarrollador

### Paso 1: Excluir código deprecado
En [tsconfig.json](file:///home/pablo/cyberops-v2/tsconfig.json):
```json
{
  "include": ["src"],
  "exclude": ["node_modules", "src/_deprecated"]
}
```

### Paso 2: Actualizar la interfaz de tipos
En [src/types.ts](file:///home/pablo/cyberops-v2/src/types.ts):
```typescript
export interface ValidationCriteria {
  // ...
  service?: string;
}

export interface CommandResponse {
  // ...
  completedMissionId?: number;
}
```

### Paso 3: Completar `type` en el modelo Linux
En [src/fs-models/fs-linux.ts](file:///home/pablo/cyberops-v2/src/fs-models/fs-linux.ts):
Agregar `type: 'text'` a los objetos de `/etc/passwd`, `/etc/shadow`, y archivos de wordlist.

### Paso 4: Ajustar firmas en tests
En [src/hooks/__tests__/useCommandRunner.test.ts](file:///home/pablo/cyberops-v2/src/hooks/__tests__/useCommandRunner.test.ts):
Actualizar `makeWelcome()` a `makeWelcome([])`.

---

## 🧪 Verificación Final

1. Correr comprobación de tipos:
   ```bash
   pnpm exec tsc --noEmit
   ```
   *(Resultado esperado: 0 errores)*

2. Correr suite de tests:
   ```bash
   pnpm test:run
   ```
   *(Resultado esperado: 90/90 pasados)*
