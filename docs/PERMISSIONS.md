# PERMISSIONS — Sistema de permisos Unix en ZeroInfra Labs

> Patrón transversal para todos los comandos que tocan el filesystem virtual.
> Cualquier comando nuevo que lea, cree, edite, borre o liste archivos/directorios
> debe seguir estas reglas. El objetivo es que los permisos sean un contrato
> verificable y uniforme.

## Resumen del modelo

El filesystem virtual (`src/utils/fs.ts` + `src/fs-models/`) modela permisos Unix reales:

- **owner / group / others** con bits `rwx` (lectura / escritura / ejecución).
- **mode** numérico octal: ej. `0o644`, `0o755`, `0o4755` (SUID), `0o1777` (sticky).
- **SUID/SGID/sticky bit** soportados pero SUID solo en comandos que escalan privilegios
  (`su`, `sudo`, `passwd`, `find`, `vim`); SGID se detecta pero no aplica cambio de grupo
  en esta simulación.
- **Identidad activa** se obtiene con `getCurrentUser(machine)` (`src/utils/users.ts`)
  y respeta SSH login, privesc completada, `su -`, etc.
- **Root bypass**: `uid === 0` o `username === 'root'` siempre pasa cualquier chequeo.

## Helpers principales

Todos viven en `src/utils/permissions.ts` y `src/utils/fs.ts`. Estos son los **únicos**
que deben usarse; no se reimplementa lógica de permisos inline.

### Lookup de archivos/dirs (`src/utils/fs.ts`)

| Helper | Uso |
|---|---|
| `findFile(machine, path)` | Buscar archivo regular O directorio (`/.dir`). Acepta trailing slash. |
| `findDirEntry(machine, dirPath)` | Buscar el `.dir` de un directorio. |
| `findParentDir(machine, filePath)` | Devuelve el `.dir` del directorio padre de un archivo. |
| `resolveParentDirPath(filePath)` | String con la ruta del padre sin trailing slash. |
| `defaultOwnership(machine, user, mode)` | Devuelve `{ owner, group, mode }` para un archivo nuevo. |
| `buildNewFile(path, content, type, ownership)` | Construye un `FileEntry` listo para `addFileToMachine`. |

### Chequeos de permiso (`src/utils/permissions.ts`)

| Helper | Cuándo usar |
|---|---|
| `canRead(machine, file, user)` | Leer un archivo (`cat`, `nano` apertura, `cp` source, FTP `get` remoto). |
| `canWrite(machine, file, user)` | Modificar contenido de un archivo existente. |
| `canExecute(machine, file, user)` | `cd` a un directorio, ejecutar un binario. |
| `canEditFile(machine, file, user)` | **Alias semántico de `canWrite`** — usar este nombre cuando la intención es editar un archivo (no un dir). |
| `canCreateInDir(machine, parentDir, user)` | Crear archivo/dir nuevo en un directorio. Chequea `write + execute` del padre. Root bypass. |
| `canDeleteInDir(machine, parentDir, target, user)` | Borrar un archivo. Chequea `write + execute` del padre + sticky bit. Root bypass. |

> ⚠️ Root bypass aplica en `canRead`, `canWrite`, `canExecute`, `canCreateInDir`,
> `canDeleteInDir`. Si necesitás un chequeo que **no** aplique a root, usá
> `checkPermission` directo o construí el chequeo desde los bits.

## Tabla: operación → helper

| Operación | Helper | Ejemplo |
|---|---|---|
| **Crear archivo nuevo** | `findParentDir` + `canCreateInDir` + `defaultOwnership` + `buildNewFile` + `addFileToMachine` | `touch`, `echo >`, `cp` destino nuevo, `nano` archivo nuevo |
| **Editar archivo existente** | `findFile` + `canEditFile` + preservar `owner`/`group`/`mode` + `addFileToMachine` | `echo > file_existente`, `nano` save, `cp` sobreescribir destino |
| **Borrar archivo/dir** | `findFile` + `canDeleteInDir` + `machine.files.splice/filter` | `rm`, `rmdir`, `mv` |
| **Mover/renombrar** | `canDeleteInDir` (source) + `canCreateInDir` (dest) | `mv` |
| **Copiar** | `canRead` (source) + `canCreateInDir` (dest) + `canEditFile` (si sobreescribe) | `cp` |
| **Listar directorio** | `findDirEntry` + `canExecute`; filtrar por `canRead` por entry | `ls` |
| **Cambiar directorio** | `findDirEntry` + `canExecute` | `cd` |
| **Cambiar permisos/owner** | Solo root o dueño; no usa `canWrite` | `chmod`, `chown`, `chgrp` |

## Patrón de migración para nuevos comandos

Al agregar un comando nuevo que toca el filesystem, seguí este template:

```typescript
import { findFile, findParentDir, defaultOwnership, buildNewFile } from '../../utils/fs';
import { canRead, canCreateInDir, canEditFile, canDeleteInDir } from '../../utils/permissions';
import { getCurrentUser } from '../../utils/users';

export const cmd_micomando = {
  name: 'micomando',
  execute: (args, { machine, currentDir }) => {
    const currentUser = getCurrentUser(machine);

    const fullPath = normalizePath(resolvePath(args[0], currentDir || '/', currentUser.home));
    const cleanPath = fullPath.endsWith('/') ? fullPath.slice(0, -1) : fullPath;

    const existing = findFile(machine, cleanPath);

    if (!existing) {
      // ── Crear: chequea permiso del padre ──
      const parentDir = findParentDir(machine, cleanPath);
      if (!parentDir) return { output: '...: No such file or directory', isError: true };
      if (!canCreateInDir(machine, parentDir, currentUser)) {
        return { output: '...: Permission denied', isError: true };
      }
      // Crear con helper
      const ownership = defaultOwnership(machine, currentUser, applyUmask(0o644));
      machine.files.push(buildNewFile(cleanPath, '', 'text', ownership));
    } else {
      // ── Editar: chequea permiso del archivo ──
      if (!canEditFile(machine, existing, currentUser)) {
        return { output: '...: Permission denied', isError: true };
      }
      // Preservar propiedades del archivo existente
      const ownership = {
        owner: existing.owner ?? currentUser.username,
        group: existing.group ?? getPrimaryGroupName(machine, currentUser),
        mode: existing.mode ?? 0o644,
      };
      // O usar buildNewFile(cleanPath, newContent, existing.type, ownership)
    }

    return { output: 'ok' };
  },
};
```

## Anti-patrones (NO hacer)

❌ **NO** mutar `file.mode` / `file.owner` directamente sobre el objeto en memoria:

```typescript
// ❌ MAL — rompe inmutabilidad, no re-render, no undo/historial
existingFile.mode = 0o755;
existingFile.owner = 'kali';
```

✅ **SÍ** pasar por `addFileToMachine` (slice reducer) o construir un nuevo `FileEntry`:

```typescript
// ✅ BIEN — el store maneja la inmutabilidad
useScenarioStore.getState().addFileToMachine(machine.id, {
  ...existingFile,
  mode: 0o755,
  owner: 'kali',
});
```

❌ **NO** reimplementar `checkStickyBit` localmente. Usá `canDeleteInDir`.

❌ **NO** obviar `canRead` asumiendo que `canWrite` lo implica. Un archivo 0600 root:root
permite escritura al owner pero no lectura a otros.

❌ **NO** guardar archivos nuevos sin `owner`/`group`/`mode`. Todos los `push({...})`
deben pasar por `defaultOwnership` + `buildNewFile` (o equivalente con `applyUmask`).

❌ **NO** duplicar `findFile`/`findDirEntry` localmente. Importá de `src/utils/fs.ts`.

❌ **NO** hardcodear lista de comandos disponibles en sistemas como autocompletado.
Usá `AVAILABLE_COMMAND_NAMES` exportado desde `src/commands/index.ts` (se deriva
del registro real).

## Comandos ya migrados (Etapas 1, 2 y 3)

| Comando | Lee | Crea | Edita | Borra | Listar |
|---|---|---|---|---|---|
| `cat` | ✅ `canRead` | — | — | — | — |
| `cd` | — | — | — | — | ✅ `canExecute` |
| `ls` | — | — | — | — | ✅ `canExecute` dir + `canRead` por entry |
| `mkdir` | — | ✅ `canCreateInDir` | — | — | — |
| `rmdir` | — | — | — | ✅ `canDeleteInDir` | — |
| `rm` | — | — | — | ✅ `canDeleteInDir` | — |
| `mv` | — | — | — | ✅ `canDeleteInDir` source + dest | — |
| `cp` | ✅ `canRead` source | ✅ `canCreateInDir` | ✅ `canEditFile` dest | — | — |
| `touch` | — | ✅ `canCreateInDir` | — | — | — |
| `echo` | — | ✅ `canCreateInDir` | ✅ `canEditFile` | — | — |
| `nano` (comando) | ✅ `canRead` | ✅ `canCreateInDir` | ✅ `canEditFile` (via hook `handleNanoSave`) | — | — |
| `nmap -oN/-oG` | — | ✅ `canCreateInDir` | ✅ `canEditFile` | — | — |
| `ftp get` | ✅ `canRead` remoto | ✅ `addFileToMachine` con `defaultOwnership` | — | — | — |

### Comandos pendientes

(actualmente ninguno — los chequeos están centralizados)

## Sticky bit

El sticky bit (`mode & 0o1000`, ej. `0o1777` en `/tmp`) está modelado en:

- `hasStickyBit(mode)` — chequeo individual.
- `canDeleteInDir(parent, target, user)` — chequeo completo: si el padre tiene sticky bit
  y el user no es root, **solo el dueño del archivo** (no del directorio) puede borrarlo.

Ejemplo de Unix real: `bob` borra `alice_file.txt` en `/tmp` (1777) → denegado.
`alice` borra su propio `alice_file.txt` en `/tmp` → permitido. Root puede borrar cualquiera.

## Persistencia

`addFileToMachine` (en `src/store/slices/scenarioSlice.ts:230`) hace upsert:
filtra por `path` y agrega el nuevo `FileEntry`. Es el **único** camino válido
para modificar el filesystem desde un comando.

Para preservar las propiedades del archivo al editar (ej. root edita archivo de kali),
capturá un snapshot al abrir y propágalo en el save:

```typescript
// En el comando nano al abrir:
return {
  nanoFile: {
    path: cleanPath,
    content: existing.content,
    readOnly: !canEditFile(machine, existing, currentUser),
    existingSnapshot: {
      owner: existing.owner ?? 'root',
      group: existing.group ?? 'root',
      mode: existing.mode ?? 0o644,
    },
  },
};

// En el hook (useCommandRunner.handleNanoSave):
const ownership = nanoFile.existingSnapshot ?? defaultOwnership(machine, currentUser, 0o644);
useScenarioStore.getState().addFileToMachine(machine.id, buildNewFile(cleanPath, content, 'text', ownership));
```

## Tests

Los tests de permisos viven en:

- `src/utils/__tests__/permissions.test.ts` — unit tests de los helpers.
- `src/utils/__tests__/fs.test.ts` — unit tests de los helpers de filesystem.
- `src/commands/__tests__/fase3-suid-sticky.test.ts` — integración SUID/sticky.
- `src/commands/__tests__/fase4-editors.test.ts` — integración comandos de edición.
- `src/commands/__tests__/nano-save-preserve-owner.test.ts` — preservación de owner.
- `src/commands/__tests__/ls-permissions.test.ts` — `ls` con permisos de dir.
- `src/commands/tools/__tests__/nmap-output-permissions.test.ts` — `nmap -oN`/`-oG` con permisos.
- `src/frameworks/shells/ftp/__tests__/FtpSession-permissions.test.ts` — `ftp get` con permisos.

Al agregar un comando nuevo con chequeos de permisos, agregá un test que verifique
**al menos**: caso root OK, caso user sin permiso denegado, caso user con permiso OK.

## Referencias

- `src/utils/permissions.ts` — implementación de los helpers de chequeo.
- `src/utils/fs.ts` — implementación de los helpers de lookup.
- `src/utils/users.ts` — `getCurrentUser`, `getPrimaryGroupName`.
- `src/store/slices/scenarioSlice.ts` — `addFileToMachine`.
- `src/commands/builtin/umask.ts` — `applyUmask` (umask del terminal actual).
- `docs/ROADMAP.md` — Fases 0-4 que explican el modelo base.
- `docs/arreglos_minimax_m3.md` — plan de generalización del que nace este documento.
