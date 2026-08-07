# arreglos_minimax_m3.md — Plan de acción para generalizar permisos Unix

> Documento vivo. Cada ítem se marca con ✅ al completarse. Cambios al plan se hacen al tope de la sección "Cambios al plan".

## Cambios al plan

_(vacío — agregar acá cualquier desviación o ajuste sobre la marcha)_

---

## Contexto y motivación

El sistema de permisos Unix (lectura/escritura/ejecución sobre owner/group/others + SUID/SGID/sticky bit) está implementado en algunos comandos pero **no es transversal**. El audit del 2026-07-29 detectó:

- **5 comandos** (`cat`, `cd`, `mkdir`, `rmdir`, `rm`, `mv`, `touch`, `nano` en comando, `chmod`, `chown`, `chgrp`) chequean permisos correctamente.
- **3 comandos** tienen chequeos parciales: `cp` (no chequea `canWrite` del destino al sobreescribir ni sticky del padre destino), `echo >/>>` (no chequea `canWrite` del archivo existente), `nano` save (lógica en `Terminal.tsx`, no en el comando).
- **3 comandos/sitios** no chequean nada: `ls` (lista cualquier directorio), `nmap -oN/-oG` (crea sin permisos), `ftp get` (no chequea `canRead` remoto, descarga sin permisos).
- **Patrones duplicados** en 7+ archivos: `canCreateInDir` (7 copias), `checkStickyBit` (3 copias), `findFile/findDirEntry` (10+ copias).

Cada nuevo comando que toque el filesystem reinventa los chequeos → alta probabilidad de regresiones.

**Objetivo:** que cualquier comando presente o futuro que lea, cree, edite, borre o liste archivos use el mismo set de helpers, y que los permisos sean **un contrato verificable**.

---

## Etapas

### Etapa 1 — Centralizar helpers (base, sin esto el resto duplica bugs)

**Archivos nuevos:**
- `src/utils/fs.ts` — `findFile(machine, path)`, `findDirEntry(machine, dirPath)`, `applyDefaultOwnership(machine, user, mode)`.

**Archivos modificados (`src/utils/permissions.ts`):**
- Agregar `canCreateInDir(machine, parentDirEntry, user): boolean` — wrapper semántico sobre `canWrite(parent) && canExecute(parent)`.
- Agregar `canDeleteInDir(machine, parentDirEntry, targetFile, user): boolean` — incluye chequeo de sticky bit (root o dueño del archivo pueden borrar; otros no si `mode & 0o1000`).
- Agregar `canEditFile(machine, file, user): boolean` — alias de `canWrite`, explícito para mutaciones.

**Migración de los 8 comandos que hoy duplican la lógica:**
- `mkdir.ts` — usa `canCreateInDir` + `findDirEntry` de `utils/fs`.
- `rmdir.ts` — usa `canDeleteInDir` + `findDirEntry`. Eliminar la copia local de `checkStickyBit`.
- `rm.ts` — usa `canDeleteInDir` + `findFile`. Eliminar copia local de `checkStickyBit`.
- `mv.ts` — usa `canDeleteInDir` para source y destino.
- `touch.ts` — usa `canCreateInDir` + `findDirEntry` + `applyDefaultOwnership`.
- `echo.ts` — usa `canCreateInDir` (creación) + `canEditFile` (sobreescritura/appended) + `applyDefaultOwnership`.
- `cp.ts` — usa `canRead` (origen), `canCreateInDir` (destino nuevo), `canEditFile` (sobreescribir destino), `canDeleteInDir` (sticky en destino).
- `nano.ts` (solo apertura) — usa `findFile` + `canRead` + `canEditFile`.

**Tests nuevos:**
- `src/utils/__tests__/fs.test.ts` — `findFile`, `findDirEntry`, `applyDefaultOwnership`.
- `src/utils/__tests__/permissions.test.ts` — agregar tests de `canCreateInDir`, `canDeleteInDir` (incluido sticky bit), `canEditFile`.

**Criterio de aceptación:** todos los tests existentes pasan sin cambios; `tsc --noEmit` 0 errores.

---

### Etapa 2 — Decouple nano save del UI (prerequisito para testear Etapa 3 con confianza)

**Problema:** el handler `onSave` que decide preservar owner/group/mode vive en `Terminal.tsx:73-114` (componente React). Acoplamiento incorrecto: cualquier consumidor headless (test, terminal programática) no podría guardar.

**Cambios:**
- `src/types.ts`: agregar `nanoFile.existingSnapshot?: Pick<FileEntry, 'owner' | 'group' | 'mode' | 'path'>` al `nanoFile` (snapshot del archivo al abrirlo, undefined si es nuevo).
- `src/commands/builtin/nano.ts`: si el archivo existe al abrir, capturar snapshot.
- `src/hooks/useCommandRunner.ts:259-262`: al detectar `nanoFile`, también capturar el snapshot actual del `machine.files` por path.
- `src/components/EditorModal.tsx`: el `onSave` ya no decide permisos — sigue reportando éxito, pero el snapshot se preserva en `existingFileSnapshot` que el hook usa al persistir.
- `src/hooks/useCommandRunner.ts` (o nuevo handler): implementar `addFileToMachine` con la lógica preservadora usando `existingSnapshot`.

**Beneficio:** el test "root edita archivo de kali" deja de requerir renderizar Terminal entero — basta instanciar `nano` comando y verificar la metadata emitida.

**Criterio de aceptación:** `src/components/Terminal.tsx:73-114` queda en < 30 líneas, solo delega al hook; tests nuevos en `src/commands/__tests__/nano-save-preserve-owner.test.ts`.

---

### Etapa 3 — Cerrar los 4 bugs abiertos

Cada uno usa los helpers de Etapa 1.

#### 3.1 `echo > file` / `echo >> file` no chequean `canWrite(file)`

**Archivo:** `src/commands/builtin/echo.ts:55-67`

**Fix:** antes de mutar `existing.content` o hacer push a `files`, verificar `canEditFile(existing, currentUser)` (root bypass). Si falla → `output: 'echo: ${path}: Permission denied'`, `isError: true`.

**Test:** `src/commands/__tests__/fase4-editors.test.ts` agregar: `echo > archivo_ajeno_en_/tmp_con_sticky_denegado`, `echo > archivo_no_escribible_por_user_denegado`.

#### 3.2 `cp` sobreescribe sin chequear destino

**Archivo:** `src/commands/builtin/cp.ts:100-104`

**Fix:** antes de `files.push({...srcEntry, path: targetPath})` cuando destino existe, verificar:
- `canEditFile(existing_target, currentUser)` (root bypass).
- `canDeleteInDir(parent_of_target, existing_target, currentUser)` para sticky bit en destino.

**Test:** `cp src dst_existente_con_sticky_denegado`, `cp src dst_existente_no_escribible_denegado`.

#### 3.3 `ls` no respeta permisos del directorio listado

**Archivo:** `src/commands/builtin/ls.ts`

**Fix:** en la función que arma la lista, antes de iterar:
- Resolver `parentDir` (directorio del path listado, o currentDir si path vacío).
- Si `parentDir` tiene FileEntry (no es `/`) y `!canExecute(parentDir, currentUser)` → `output: 'ls: ${path}: Permission denied'`, `isError: true`.
- Si pasa, filtrar entries por `canRead(entry, currentUser)` solo en formato `-l` (UNIX: `r` en dir = listar nombres; `x` en dir = resolver inodes).

**Decisión de diseño:** ¿filtrar también nombres en formato no-`-l`? Unix real filtra nombres cuando no hay `r` en el dir. Por simplicidad inicial, validar `canExecute(dir)` (mostrar o denegar) pero no filtrar nombres individuales en formato corto — agregar nota para iteración futura.

**Test:** `src/commands/__tests__/ls-permissions.test.ts` — `ls /root como user → Permission denied`, `ls /home/user como user → ok`, `ls -l /home/user/archivo_ajeno_0600 como user → muestra permisos pero deniega leer contenido (no aplica aquí porque -l solo lee metadatos)`.

#### 3.4 Archivos creados sin permisos (`nmap -oN/-oG`, `ftp get`)

**Archivos:**
- `src/commands/tools/nmap.ts:242-256` — al emitir `createdFiles`, agregar `owner: user_atacante`, `group: getPrimaryGroupName(machine_atacante, user_atacante)`, `mode: applyUmask(0o644)`. Verificar que `currentDir` (o path absoluto) sea escribible con `canCreateInDir(parentDir, user_atacante)`.
- `src/frameworks/shells/FtpSession.ts:189-227` — agregar chequeo de `canRead` sobre el archivo remoto (chequeando credenciales FTP); al emitir `downloadedFile`, el consumer en `useCommandRunner.ts:313-317` debe asignar `owner: atacante`, `group: getPrimaryGroupName(attacker, atacante)`, `mode: 0o644`.

**Test:** `src/commands/__tests__/nmap-output-permissions.test.ts`, `src/frameworks/__tests__/FtpSession-permissions.test.ts`.

---

### Etapa 4 — Documentar el patrón para futuros comandos

**Archivo nuevo:** `docs/PERMISSIONS.md` (en `/docs`, junto a `ARCHITECTURE.md` y `ROADMAP.md`).

**Contenido:**

1. Resumen del modelo (owner/group/others + SUID/SGID/sticky).
2. Los 4 helpers y cuándo usar cada uno (`canCreateInDir`, `canEditFile`, `canDeleteInDir`, `canRead`).
3. Tabla: para cada operación (crear, editar, borrar, listar, leer) qué helper aplica.
4. Patrón de migración para nuevos comandos (template copy-paste).
5. Anti-patrones:
   - NO mutar `file.mode` / `file.owner` directamente — siempre vía `addFileToMachine`.
   - NO reimplementar `checkStickyBit` localmente.
   - NO obviar `canRead` asumiendo que `canWrite` lo implica.
   - NO guardar archivos nuevos sin `owner`/`group`/`mode`.
6. Lista de comandos ya migrados (Etapas 1+3) y comandos pendientes si los hay.

**Actualizar `AGENTS.md`** (sección "Code Conventions") con un puntero a `docs/PERMISSIONS.md`.

---

### Etapa 5 — Matriz de tests de regresión transversal

**Archivo nuevo:** `src/commands/__tests__/permissions-integration.test.ts`

**Estructura:** matriz `comando × escenario` con casos:

```
mkdir:   root=ok, user-with-write=ok, user-without-write=denied, /tmp sticky=ok
echo>:   root=ok, user-own-file=ok, user-others-file=denied, /tmp sticky=respect
echo>>:  idem
cp:      root=ok, user-own-src-own-dst=ok, no-read-src=denied, no-write-dst=denied, sticky-dst=respect
rm:      root=ok, user-own-file=ok, others-file-in-/tmp-sticky=denied
nano:    root=ok, user-readonly-file=opens-with-readOnly, no-read=denied
ls:      user-/root=denied, user-/home/user=ok, user-/tmp=ok
mv:      root=ok, user-with-write-src=ok, sticky-src=respect, sticky-dst=respect
```

Cada caso arma un `Machine` mínimo y verifica `result.output` + metadata fields. ~30-40 casos totales.

---

## Orden de ejecución

```
Etapa 1 (helpers + refactor 8 comandos)
   ↓
Etapa 2 (decouple nano save)
   ↓
Etapa 3 (cerrar 4 bugs abiertos)
   ↓
Etapa 4 (docs/PERMISSIONS.md)
   ↓
Etapa 5 (matriz de tests)
```

Cada etapa puede testearse de forma independiente con `tsc --noEmit` + `pnpm test:run`.

## Estimación

- Etapa 1: 1 archivo nuevo (`fs.ts`), 1 modificado (`permissions.ts`), 8 comandos modificados, 1 archivo de tests. ~150 LOC refactor + ~100 LOC tests.
- Etapa 2: 3 archivos modificados (`types.ts`, `nano.ts`, `useCommandRunner.ts`, `EditorModal.tsx`). ~80 LOC.
- Etapa 3: 4 archivos modificados (`echo.ts`, `cp.ts`, `ls.ts`, `nmap.ts`, `FtpSession.ts`, `useCommandRunner.ts`). ~120 LOC.
- Etapa 4: 1 archivo nuevo (`docs/PERMISSIONS.md`) + 1 modificado (`AGENTS.md`). ~150 LOC.
- Etapa 5: 1 archivo nuevo (matriz tests). ~200 LOC.

**Total estimado:** ~800 LOC entre código, tests y documentación.

## Verificación global al finalizar

```bash
pnpm exec tsc --noEmit   # 0 errores
pnpm test:run            # 99 archivos, ~1280+ tests (base 1242 + ~30-40 nuevos)
pnpm build               # compila sin warnings de chunk size
```

## Revisión de tests correspondiente

Cuando se ejecute cualquier etapa, **revisar y ajustar** estos tests:

| Etapa | Tests a revisar/ajustar |
|-------|-------------------------|
| 1 | `src/commands/__tests__/fase4-editors.test.ts` (mkdir/touch/echo/cp/mv/nano), `src/commands/__tests__/fase3-suid-sticky.test.ts` (rm/rmdir), `src/commands/builtin/__tests__/chown.test.ts`, `src/commands/builtin/__tests__/chgrp.test.ts`, `src/utils/__tests__/permissions.test.ts` |
| 2 | `src/components/__tests__/EditorModal.test.tsx` (readOnly), nuevo `src/commands/__tests__/nano-save-preserve-owner.test.ts` |
| 3 | `src/commands/__tests__/fase4-editors.test.ts` (echo/cp), nuevo `ls-permissions.test.ts`, `nmap-output-permissions.test.ts`, `FtpSession-permissions.test.ts` |
| 5 | nuevo `permissions-integration.test.ts` (no rompe existentes; agrega cobertura) |

---

## Estado actual

- ✅ Audit completado (2026-07-29)
- ✅ Etapa 1 completada (helpers centralizados en `src/utils/fs.ts` + `src/utils/permissions.ts`, 8 comandos migrados)
- ✅ Etapa 2 completada (decouple nano save del UI — `existingSnapshot` en `nanoFile` + `handleNanoSave` en hook)
- ✅ Etapa 3 completada (cerrados bugs de `ls`, `nmap`, `ftp`; `echo`/`cp` quedaron preventivamente en Etapa 1)
- ✅ Etapa 4 completada (`docs/PERMISSIONS.md` creado + `AGENTS.md` actualizado con puntero)
- ✅ Etapa 5 completada (`src/commands/__tests__/permissions-integration.test.ts` con 46 tests transversales comando × escenario)
- ✅ Bonus: arreglo del autocompletado (`AVAILABLE_COMMAND_NAMES` derivado del registry)

**Plan cerrado.**
