# Auditoría y Registro de Bugs en Comandos — ZeroInfra Labs

> **Fecha:** 2026-09-21  
> **Alcance:** Auditoría de comandos nuevos (Tier 1: texto, utilidades, red, crypto, transferencias) y comandos del núcleo de simulación.  
> **Estado base verificado:** `tsc --noEmit` sin errores, 2.295 pruebas unitarias passing (185 archivos).

---

## 1. Resumen Ejecutivo

Durante la expansión de comandos a ~120 comandos de primer nivel, la base de código ganó una cobertura funcional muy amplia (`awk`, `sed`, `cut`, `tr`, `diff`, `stat`, `file`, `tee`, `less`, `more`, `vi`/`vim`, `alias`/`unalias`, `history`, `type`, `uname`, `uptime`, `free`, `scp`, `wget`, `tcpdump`, `dig`, `nslookup`, `whois`).

Sin embargo, se identificaron **5 bugs directos de ejecución**, **1 fuga transversal en el sistema de permisos Unix**, y **3 brechas de integración con la validación de misiones y pipelines**.

---

## 2. Bugs Concretos de Ejecución

### Bug 1: `free -h` muestra la ayuda en lugar del estado de memoria
* **Archivo:** `src/commands/builtin/sysinfo.ts` (Línea 62)
* **Severidad:** Media (Experiencia de usuario y hábitos de terminal)
* **Diagnóstico:**
  ```typescript
  if (args.includes('-h')) return { output: 'Usage: free [-h] [-m]\nShow amount of free, used and available memory.\n  -h human-readable (default)\n  -m megabytes' };
  ```
  En sistemas Unix/Linux, `-h` representa `--human-readable` (el parámetro más común al ejecutar `free`). El propio texto de ayuda lo describe así (`-h human-readable (default)`). Debido a este chequeo, cualquier usuario que ejecute `free -h` recibe el mensaje de ayuda en lugar de la tabla formateada en `Gi`/`Mi`.
* **Corrección requerida:**
  Cambiar la condición de ayuda a `args.includes('--help')` (o `-?`), permitiendo que `-h` mantenga el formato por defecto o lo active explícitamente.

---

### Bug 2: `scp` falla con rutas relativas y no valida permisos
* **Archivo:** `src/commands/tools/scp.ts` (Líneas 68–89)
* **Severidad:** Alta (Falla de transferencia de archivos y omisión de permisos)
* **Diagnóstico:**
  1. **Upload local → remoto:**
     ```typescript
     const f = findFile(ctx.machine, src);
     ```
     Si `src` es una ruta relativa (ej. `scp nota.txt user@10.0.0.1:/tmp/`), `findFile` busca la cadena exacta `"nota.txt"`. Como las rutas en `machine.files` son absolutas (`/root/nota.txt`), `findFile` devuelve `null` y el comando reporta `nota.txt: No such file or directory`.
  2. **Download remoto → local:**
     ```typescript
     const full = dst.endsWith('/') ? dst + fname : dst;
     ```
     Si `dst` es relativo (ej. `scp user@10.0.0.1:/etc/passwd loot.txt` o `dst = '.'`), `full` queda como `'loot.txt'`, no como `'/root/loot.txt'`. Como el FS virtual indexa con rutas absolutas, `ls` en `/root` nunca muestra `loot.txt` y `cat loot.txt` no lo encuentra.
  3. **Omisión de permisos (`docs/PERMISSIONS.md`):**
     En la línea 71–72 se calcula el directorio padre remoto:
     ```typescript
     const parent = findParentDir(...) ?? ...;
     void parent;
     ```
     Se descarta con `void parent;` sin comprobar `canCreateInDir` o `canEditFile`. Tampoco se comprueban permisos en la escritura local al descargar.
* **Corrección requerida:**
  - Resolver `src` y `dst` con `normalizePath(resolvePath(..., ctx.currentDir || '/', home))`.
  - Aplicar `canCreateInDir` y `canEditFile` según las directivas de `docs/PERMISSIONS.md`.
  - Emitir `downloadedFile` en el resultado para compatibilidad con validadores de laboratorios.

---

### Bug 3: `ls` con rutas relativas a subdirectorios devuelve vacío
* **Archivo:** `src/commands/builtin/ls.ts` (Línea 164)
* **Severidad:** Media (Usabilidad básica del filesystem)
* **Diagnóstico:**
  ```typescript
  for (const arg of args) {
    if (arg.startsWith('-')) { ... }
    else {
      targetDir = ensureTrailingSlash(arg);
    }
  }
  ```
  Si el usuario está en `/var/log` y ejecuta `ls nginx` o `ls ./nginx`, `ensureTrailingSlash` produce `'nginx/'` o `'./nginx/'`. Como los archivos en `machine.files` tienen rutas canónicas absolutas (`/var/log/nginx/...`), la comparación `filePath.startsWith(targetDir)` no coincide nunca, devolviendo vacío de forma errónea.
* **Corrección requerida:**
  Resolver `arg` usando `resolvePath(arg, currentDir || '/', home)`.

---

### Bug 4: `curl -o <file>` descarta la opción silenciosamente
* **Archivo:** `src/commands/tools/curl.ts` (Línea 69)
* **Severidad:** Media (Pentesting educativo)
* **Diagnóstico:**
  ```typescript
  else if (a === '-o') { i++; }
  ```
  El argumento `-o` se consume en el bucle pero nunca se escribe en el filesystem virtual ni se notifica en `filesChanged`. En ejercicios de CTF y laboratorios de explotación web, `curl -o payload.sh http://...` es uno de los comandos estándar para descargar herramientas y exploits.
* **Corrección requerida:**
  Implementar la persistencia del cuerpo de la respuesta en `ctx.machine.files` respetando `currentDir`, umask y permisos (`canCreateInDir`/`canEditFile`), e incluir `filesChanged` y `downloadedFile` en la respuesta.

---

### Bug 5: Typo en la función hash de DNS
* **Archivo:** `src/commands/tools/dns.ts` (Línea 103)
* **Severidad:** Baja (Cosmética / Determinismo)
* **Diagnóstico:**
  ```typescript
  function hash(s: string): number {
    let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(0)) | 0;
    return h;
  }
  ```
  Usa `s.charCodeAt(0)` repetidamente en lugar de `s.charCodeAt(i)`. El ID de query de dig sigue siendo un número determinista, pero el hash depende únicamente del primer carácter y la longitud.
* **Corrección requerida:**
  Cambiar `s.charCodeAt(0)` por `s.charCodeAt(i)`.

---

## 3. Fuga Transversal: Permisos Unix en Comandos de Lectura

* **Archivos afectados:**
  - `src/commands/builtin/awk.ts` (Línea 313)
  - `src/commands/builtin/sed.ts` (Línea 31)
  - `src/commands/builtin/diff.ts` (Línea 149)
  - `src/commands/builtin/text.ts` (`cut`, `tr`, `tac`, `nl`, `rev`, `column`)
  - `src/commands/builtin/pipeline.ts` (`head`, `tail`, `grep`, `wc`, `sort`, `uniq`)
  - `src/commands/builtin/file.ts` (Línea 87)
  - `src/commands/builtin/crypto.ts` (`md5sum`, `sha256sum`, `base64`, `strings`)
* **Regla transversal incumplida (`docs/PERMISSIONS.md`):**
  > *"Todo comando que lea, cree, edite, borre o liste archivos/dirs usa los helpers de `src/utils/permissions.ts` (`canRead`, `canWrite`, `canEditFile`, `canCreateInDir`, `canDeleteInDir`) y los lookups de `src/utils/fs.ts`."*
* **Problema:**
  Mientras que `cat` y `less` sí validan `canRead(machine, resolved, currentUser)`, el helper común `input(ctx, fileArg)` de estos módulos hace un lookup directo:
  ```typescript
  const file = findFile(ctx.machine, fullPath);
  return file ? (file.content ?? '') : null;
  ```
  Sin validar permisos de lectura ni resolver symlinks.
* **Impacto educativo y de seguridad:**
  Un usuario no privilegiado (como `student`, `www-data` o `guest`) puede saltarse las restricciones de acceso leyendo archivos protegidos (`/etc/shadow`, `/root/flag.txt`, claves privadas SSH) simplemente usando `head /etc/shadow`, `awk '{print}' /etc/shadow` o `grep root /etc/shadow` sin recibir el `Permission denied` correspondiente.
* **Corrección requerida:**
  Crear o generalizar un helper de lectura centralizado (ej. `readVirtualFile(machine, path, currentDir, user)`) que:
  1. Resuelva la ruta absoluta canónica (`resolvePath`).
  2. Resuelva symlinks con `resolveSymlink`.
  3. Verifique que no sea un directorio (`file.path.endsWith('.dir')`).
  4. Valide `canRead(machine, file, user)`.
  5. Retorne `{ content, error }`.

---

## 4. Brechas de Integración con el Sistema de Validación de Misiones

### A. Cobertura incompleta de `fileRead`
* **Situación actual:** Solo `cat`, `nano` y `python3` invocan `buildFileReadMetadata`.
* **Problema:** En muchos laboratorios y escenarios libres, un usuario puede inspeccionar un archivo o flag con `less note.txt`, `more note.txt`, `head -n 20 /root/note.txt` o `grep -i flag secret.txt`. Como estos comandos no emiten `fileRead`, la misión no se autovalida aunque el estudiante haya descubierto y leído el archivo objetivo.
* **Acción:** Integrar `buildFileReadMetadata` en las salidas exitosas de lectura de archivo en `less`, `more`, `head`, `tail` y `strings`.

### B. `wget` no emite `downloadedFile`
* **Situación actual:** `wget` guarda el archivo en el FS virtual mediante `createNmapFileWriter`, pero su `CommandResponse` no incluye la propiedad `downloadedFile: { path, content }`.
* **Problema:** El validador `validateFileDownloaded` (`src/utils/validators/filesystem.ts:41`) inspecciona exclusivamente `result.downloadedFile`. Si una misión exige descargar un archivo (como la etapa de descarga de notas en laboratorios de enumeración), `wget` no la completará.
* **Acción:** Retornar `downloadedFile: { path: fname, content: body }` en `cmd_wget`.

### C. Descarte de metadatos en pipelines (`executor.ts:105`)
* **Archivo:** `src/commands/executor.ts`
* **Problema:**
  ```typescript
  for (let i = 0; i < segments.length; i++) {
    ...
    if (i === 0) {
      result = segResult;
    } else {
      result = { ...result, output: segResult.output };
      if (segResult.isError) result = { ...result, isError: true };
    }
  }
  ```
  Si un pipeline contiene múltiples comandos y el último segmento es el que realiza la acción relevante (por ejemplo `echo "data" | sudo tee /etc/crontab` o `cat file | grep flag`), cualquier metadata emitida por el segmento 1 en adelante (`blockingCommand`, `privesc`, `fileRead`, `foundCredentials`, etc.) se pierde porque `result` solo actualiza `output` e `isError`.
* **Acción:** Realizar un merge selectivo de metadatos de los segmentos (`result = { ...segResult, output: segResult.output, filesChanged: allChanged }`).

---

## 5. Desviaciones de Semántica y Realismo Unix

### A. `stat` desreferencia symlinks automáticamente
* **Archivo:** `src/commands/builtin/stat.ts` (Línea 67)
* **Diagnóstico:** `defaultOutput` ejecuta `resolveEntry` al inicio, sustituyendo el enlace por su destino antes de leer atributos. Por tanto, `stat enlace` siempre muestra los datos del archivo apuntado en lugar de `File: enlace -> target` con tipo `symbolic link`.
* **Acción:** Solo resolver el destino si se especifica la bandera `-L` / `--dereference`.

### B. `tcpdump` sin chequeo de privilegios
* **Archivo:** `src/commands/tools/tcpdump.ts`
* **Diagnóstico:** Cualquier usuario no root puede capturar paquetes en el simulador. En Linux real requiere `CAP_NET_RAW` / `root`.
* **Acción:** Si `currentUser.uid !== 0`, retornar mensaje estándar: `tcpdump: eth0: You don't have permission to capture on that device`.

---

## 6. Checklist de Prioridades

> **Resolución 2026-09-21:** todos los items corregidos y verificados
> (`tsc --noEmit` limpio, 2309 tests en verde en 186 archivos, incluyendo
> 14 tests nuevos de regresión en `src/commands/__tests__/bugs-comandos-fix.test.ts`).

- [x] **P0:** Corregir `free -h` en `src/commands/builtin/sysinfo.ts`.
- [x] **P0:** Corregir resolución de rutas relativas y permisos en `src/commands/tools/scp.ts`.
- [x] **P0:** Corregir resolución de rutas relativas en `src/commands/builtin/ls.ts`.
- [x] **P1:** Implementar chequeo `canRead` en `input()` para `awk`, `sed`, `diff`, `text.ts` y `pipeline.ts`.
- [x] **P1:** Implementar guardado de archivo en `curl -o`.
- [x] **P1:** Agregar `downloadedFile` en `wget` y `curl -o`.
- [x] **P2:** Agregar `buildFileReadMetadata` a `less`, `more`, `head`, `tail`, `strings`.
- [x] **P2:** Preservar metadatos del pipeline en `executor.ts`.
- [x] **P3:** Corregir typo en `src/commands/tools/dns.ts`.
- [x] **P3:** Corregir comportamiento de symlinks en `src/commands/builtin/stat.ts`.
- [x] **P3:** Agregar chequeo de privilegios en `src/commands/tools/tcpdump.ts` (§5.B).

### Extras aplicados fuera del checklist original

- Nuevo helper centralizado `readVirtualFile()` + `toCleanFilePath()` en `src/utils/fileRead.ts`
  (ruta canónica + symlinks + `canRead`); lo usan `awk`, `sed`, `diff`, `text.ts`,
  `pipeline.ts` y `crypto.ts`.
- `file.ts` también valida `canRead` en archivos regulares (dirs/symlinks como `file(1)` real).
- `downloadedFile?: FileEntry` agregado a la base de `CommandResponse` (`src/types/command.ts`).
- `grep -r` omite archivos ilegibles según `canRead`.
- Fixture de `src/commands/tools/__tests__/netdig.test.ts`: agregado `/tmp/.dir` (1777).
