---
name: command-pattern
description: Cómo agregar un comando nuevo al sistema de comandos de este proyecto (cmd_<nombre>, registry central, tests, helpers de permisos). Usar cuando se pida crear un comando, una herramienta de pentesting, o tocar el registry de comandos (nuevo comando, agregar comando, crear herramienta, cmd_, COMMANDS Map, executeCommand).
---

# Command Pattern — ZeroInfra Labs

Guía para agregar un comando nuevo **siguiendo el patrón exacto** del proyecto.
No es un comando "que anda": es un comando que emite la metadata correcta,
respeta permisos del filesystem y queda registrado sin tocar el registry a mano.

## Estructura obligatoria

Todo comando tiene la misma forma (`CommandPattern`, ver `AGENTS.md`):

```typescript
export const cmd_<nombre> = {
  name: '<nombre>',
  execute: (args: string[], context: CommandContext): CommandResponse => {
    return { output: '...', isError?: true, <metadata fields> };
  }
};
```

Pasos para agregar uno:

1. Crear `src/commands/builtin/<nombre>.ts` (comando de sistema) o
   `src/commands/tools/<nombre>.ts` (herramienta de pentesting).
2. Exportar `cmd_<nombre>`.
3. Re-exportarlo desde `src/commands/builtin/index.ts` o
   `src/commands/tools/index.ts` (barrel). El `COMMANDS` Map en
   `src/commands/index.ts` se auto-registra iterando los barrels — **no**
   registrarlo a mano. Única excepción: `msfconsole` (factory con estado,
   registrado explícitamente).
4. Agregar tests en `src/commands/<dir>/__tests__/<nombre>.test.ts`.

## Metadata: el contrato con los labs

Los comandos **no conocen los labs** (bajo acoplamiento). Emiten metadata en
`CommandResponse` (definida en `src/types.ts:182-280`) y `LabValidator`
compara contra `validationCriteria`. Campos disponibles:

`discoveredHosts`, `scanResults`, `foundCredentials`, `foundDirectories`,
`fileRead`, `fileDownloaded`, `privesc`, `sshLogin`, `ftpLogin`,
`vulnerabilityFound`, `exploit`, `uidChecked`, `ncListener`, `blockingCommand`,
`sudoPrivileges`, `custom`.

Reglas:
- Usá el campo que corresponda (ej. `nmap` → `scanResults`, `ssh` →
  `sshLogin`). NO inventar campos propios ni embeder protocolos en `output`.
- Si el comando pausa el prompt (ej. `nc -lvnp 4444`), emitir
  `blockingCommand: true` para que el Terminal cambie de modo UI.

## Permisos en comandos de filesystem (regla transversal)

Todo comando que lea, cree, edite, borre o liste archivos/dirs usa los helpers
de `src/utils/permissions.ts` (`canRead`, `canWrite`, `canEditFile`,
`canCreateInDir`, `canDeleteInDir`) y los lookups de `src/utils/fs.ts`
(`findFile`, `findDirEntry`, `findParentDir`, `defaultOwnership`,
`buildNewFile`). Ver `docs/PERMISSIONS.md` para el patrón completo y
anti-patrones. Resumen:

- **Crear:** `findParentDir` + `canCreateInDir(parent, user)` +
  `defaultOwnership(machine, user, applyUmask(mode))` + `addFileToMachine`.
- **Editar:** `findFile` + `canEditFile(file, user)` + preservar
  owner/group/mode del archivo existente.
- **Borrar:** `canDeleteInDir(parent, file, user)` (incluye sticky bit).
- **Listar:** `canExecute(dir)`; filtrar por `canRead` por entry.
- NO mutar `file.mode`/`file.owner` directamente, NO reimplementar
  `checkStickyBit`/`findFile`/`findDirEntry` localmente, NO guardar archivos
  sin `owner`/`group`/`mode`.

## Errores

- Nunca `throw`. Devolver `{ output, isError?: true }`.
- Mensajes en español.
- En caso de fallo de permisos, devolver un mensaje claro que indique
  permiso denegado.

## Tests (patrón)

En `src/commands/__tests__/` o `src/commands/<dir>/__tests__/`:

```typescript
it('debe <verbo en español>', () => {
  const result = cmd_<nombre>.execute(args, ctx(machine));
  expect(result.output).toContain('...');
  expect(result.<metadataField>).toBeTruthy(); // si corresponde
});
```

- Nombres de tests en español.
- Usar `happyPathHelpers.ts` para crear machines de prueba y evolucionar
  estado.
- Correr `pnpm exec tsc --noEmit` y `pnpm test:run` antes de cerrar.
- Cache rara en tests: `rm -rf node_modules/.vitest`.

## Referencias

- `AGENTS.md` → sección "Command Pattern" y "Testing".
- `docs/PERMISSIONS.md` → patrón filesystem + anti-patrones.
- `src/commands/index.ts` → registry y `createIsolatedExecutor()`.
- `src/types.ts` → contrato `CommandResponse`.