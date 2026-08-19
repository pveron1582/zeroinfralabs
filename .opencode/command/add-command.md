---
description: Agrega un comando nuevo al simulador siguiendo el Command Pattern del proyecto (cmd_<nombre>, barrel, metadata, permisos, tests).
agent: build
---

Agregá un comando nuevo al sistema de comandos de ZeroInfra Labs siguiendo
exactamente el **Command Pattern** del proyecto. Cargá la skill `command-pattern`
y `coding-practices` antes de empezar.

Requerimiento: $ARGUMENTS

## Flujo obligatorio

1. **Clasificá el comando**: sistema → `src/commands/builtin/<nombre>.ts`;
   herramienta de pentesting → `src/commands/tools/<nombre>.ts`. Si lee/crea/
   edita/borra/listas archivos, mirá `docs/PERMISSIONS.md` y usá los helpers de
   `src/utils/permissions.ts` + `src/utils/fs.ts`.

2. **Escribí el comando** con la forma exacta:

   ```typescript
   export const cmd_<nombre> = {
     name: '<nombre>',
     execute: (args: string[], context: CommandContext): CommandResponse => {
       return { output: '...', isError?: true, <metadata fields> };
     }
   };
   ```

   - Nunca `throw`; errores como `{ output, isError?: true }`, mensajes en español.
   - Emití la metadata correcta de `CommandResponse` (`src/types.ts:182-280`):
     `scanResults`, `foundCredentials`, `sshLogin`, `blockingCommand`, etc.
   - Si pausa el prompt (ej. listener), emití `blockingCommand: true`.
   - NO registres el comando a mano en el `COMMANDS` Map: re-exportalo desde el
     barrel y se auto-registra. Única excepción: `msfconsole`.

3. **Re-export** en `src/commands/builtin/index.ts` o `src/commands/tools/index.ts`.

4. **Tests** en `src/commands/<dir>/__tests__/<nombre>.test.ts`:
   - Llamar `command.execute(args, context)`, assert sobre `output` y metadata.
   - Nombres en español: `it('debe <verbo>...')`.
   - Usar `happyPathHelpers.ts` para crear la máquina de prueba.

5. **Verificación final** (obligatoria, reportar resultados):
   - `pnpm exec tsc --noEmit` → 0 errores
   - `pnpm test:run` → correr al menos el test del comando nuevo

## Salida

Resumí: archivo creado, metadata emitida, barrel tocado, tests agregados y el
resultado de tsc + tests.