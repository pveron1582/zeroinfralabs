# ROADMAP — Sistema de simulación ZeroInfra Labs

Plan de implementación para un sistema virtual lo más realista posible.
Dividido en fases con tareas concretas, ordenadas por dependencias.

> ✅ = Completado | Fecha última actualización: 2026-07-31

---

## Documentación relacionada

- **`docs/PERMISSIONS.md`** — patrón transversal para comandos que tocan el filesystem
  (helpers `canRead`/`canCreateInDir`/`canDeleteInDir`/`canEditFile`, lookup de archivos,
  anti-patrones, tabla operación → helper). Cualquier comando nuevo que lea, cree, edite,
  borre o liste archivos debe seguir este contrato. Reemplaza las reglas dispersas que
  existían en Fases 1, 2, 3 y 4 con una guía unificada.
- **`docs/arreglos_minimax_m3.md`** — plan ejecutado (2026-07-29) que generalizó el
  sistema de permisos Unix en 5 etapas. Cita `PERMISSIONS.md` como entregable principal.
- **`docs/MEJORAS.md`** — hygiene del codebase (consolidación de docs, `console.log`,
  `vitest.config.ts`, `.gitignore`, etc.).

---

## FASE 0 — Foundation: Usuarios, Grupos y Sistema de Permisos

### 0.1 Tipos base `User` y `Group` ✅

**Archivos:** `src/types.ts`

Agregar al final (antes de `FileEntry`):
```typescript
export interface User {
  username: string;
  uid: number;
  gid: number;
  home: string;
  shell: string;
  groups: number[];
}

export interface Group {
  name: string;
  gid: number;
  members: string[];
}
```

### 0.2 Extender `FileEntry` con permisos reales ✅

**Archivos:** `src/types.ts`

Agregar campos a `FileEntry`:
```typescript
export interface FileEntry {
  path: string;
  content: string;
  type: string;
  owner?: string;    // username del dueño
  group?: string;    // nombre del grupo
  mode?: number;     // ej: 0o644, 0o755, 0o4755 (SUID)
}
```

Valores por defecto: `owner='root'`, `group='root'`, `mode=0o644` (archivos) o `0o755` (directorios).

### 0.3 Utilidad de parseo de `/etc/passwd` y `/etc/group` ✅

**Archivo nuevo:** `src/utils/users.ts`

Funciones:
- `parsePasswd(content: string): User[]` — extrae usuarios reales del contenido de `/etc/passwd`
- `parseGroup(content: string): Group[]` — extrae grupos de `/etc/group`
- `getUser(machine: Machine, username?: string): User | null` — obtiene un usuario (usando la identidad actual del terminal si no se especifica)
- `getGroup(machine: Machine, groupname: string): Group | null`
- `getCurrentUser(machine: Machine): User` — integra con `useTerminalIdentity` (misma heurística)

### 0.4 Utilidad de chequeo de permisos ✅

**Archivo nuevo:** `src/utils/permissions.ts`

Función central:
```typescript
function checkPermission(
  machine: Machine,
  file: FileEntry,
  user: User | null,
  operation: 'read' | 'write' | 'execute'
): boolean
```

Lógica:
- Si `user` es `root` → siempre permite
- Si `user` es el `owner` del archivo → usa bits de owner (mode >> 6)
- Si `user` está en el `group` del archivo → usa bits de group (mode >> 3)
- Sino → usa bits de others (mode & 7)
- Directorios: 'read' = listar, 'write' = crear/borrar archivos, 'execute' = `cd` al directorio

Además:
- `canRead(machine, file, user)` → alias
- `canWrite(machine, file, user)` → alias
- `canExecute(machine, file, user)` → alias
- `hasStickyBit(mode): boolean` → verifica sticky bit (modo 0o1000)
- `hasSuid(mode): boolean` → verifica SUID (modo 0o4000)
- `hasSgid(mode): boolean` → verifica SGID (modo 0o2000)
- `formatMode(mode: number): string` → ej: `-rwxr-xr-x`, `drwxr-xr-x`, `-rwsr-xr-x`

### 0.5 Actualizar `createFile()` en templates ✅

**Archivo:** `src/laboratorios/templates.ts`

Actualizar `createFile()` para aceptar `owner`, `group`, `mode` opcionales:
```typescript
export function createFile(
  path: string,
  content: string,
  type: 'text' | 'hash' | 'binary' = 'text',
  owner = 'root',
  group = 'root',
  mode?: number
): FileEntry
```

- Si el path termina en `.dir`, mode por defecto = `0o755`
- Si no, mode por defecto = `0o644`

### 0.6 Actualizar `createLinuxFileSystem()` con permisos reales ✅

**Archivos:**
- `src/fs-models/fs-linux.ts`
- `src/laboratorios/templates.ts` (legacy)
- `src/laboratorios/attackers/kali.ts`

Agregar `owner`, `group`, `mode` a cada `FileEntry` en el filesystem base:

| Ruta | owner | group | mode | Razón |
|---|---|---|---|---|
| `/bin/.dir` | root | root | 755 | Binarios del sistema |
| `/etc/.dir` | root | root | 755 | Config del sistema |
| `/etc/passwd` | root | root | 644 | Lectura universal |
| `/etc/shadow` | root | shadow | 640 | Solo root/grupo shadow |
| `/etc/ssh/sshd_config` | root | root | 600 | Config sensible |
| `/root/.dir` | root | root | 700 | Solo root |
| `/home/.dir` | root | root | 755 | Hogar de usuarios |
| `/tmp/.dir` | root | root | 777 | Sticky bit (1777) |
| `/var/www/html/` | www-data | www-data | 755 | Web root |
| `/usr/bin/su` | root | root | 4755 | SUID — ejecuta como root |
| `/usr/bin/sudo` | root | root | 4755 | SUID — ejecuta como root |
| `/usr/bin/passwd` | root | root | 4755 | SUID — ejecuta como root |

... y así para todos los archivos del sistema.

> Nota: los binarios con SUID se definen **acá**, en la tabla base de 0.6, y no se repiten como tarea aparte en Fase 3 (ver 3.3). Una sola fuente de verdad evita inconsistencias entre el fs-model base y lo que después valida la Fase 3.

### 0.7 Parser de `/etc/group` en fs-models ✅

**Archivo:** `src/fs-models/fs-linux.ts`

Agregar archivo `/etc/group` con grupos estándar (root, daemon, bin, sys, adm, shadow, www-data, etc.) y sus miembros.

> Implementado: `fs-linux.ts:116` define `/etc/group` con grupos estándar y miembros (root, daemon, bin, sys, adm, tty, disk, lp, mail, news, uucp, man, proxy, kmem, etc.). El parser `parseGroup` vive en `src/utils/users.ts`.

### 0.8bis Nota: actualización de estado inmutable

Toda modificación de `FileEntry` (mode, owner, group) hecha por `chmod`, `chown`, `chgrp`, `touch`, `rm`, `nano`, etc. debe pasar por el setter/reducer de la máquina (nunca mutar `file.mode` directamente sobre el objeto en memoria). Esto evita bugs silenciosos de re-render y mantiene consistencia si en algún momento se agrega undo/historial.

### 0.8 Tests de utilidades de permisos ✅

**Archivo nuevo:** `src/utils/__tests__/permissions.test.ts`

Testear:
- `checkPermission` con root vs user normal
- `formatMode` para 644, 755, 4755 (SUID), 1777 (sticky)
- `parsePasswd` con contenido de `/etc/passwd` real
- `hasStickyBit`, `hasSuid`, `hasSgid`

> Implementado: `src/utils/__tests__/permissions.test.ts` cubre `parsePasswd`/`parseGroup`, `checkPermission` root vs normal, `formatMode`, `hasSuid`/`hasSgid`/`hasStickyBit` y `getCurrentUser`.

---

## FASE 1 — Comandos existentes con consciencia de permisos ✅

### 1.1 `ls` — Mostrar permisos reales en `-l` ✅

**Archivo:** `src/commands/builtin/ls.ts`

- Leer `owner`, `group`, `mode` de `FileEntry`
- Usar `formatMode()` para mostrar permisos reales
- Mostrar `owner` y `group` reales en el formato largo

Cambia de:
```
drwxr-xr-x  2 root   root   4096 Jan 01 00:00 bin
-rw-r--r--  1 admin  admin   512 Jan 01 00:00 passwd
```
A (basado en datos reales):
```
drwxr-xr-x  2 root     root     4096 Jan 01 00:00 bin
-rw-r--r--  1 root     root     2048 Jan 01 00:00 passwd
-rw-r-----  1 root     shadow   1024 Jan 01 00:00 shadow
drwxrwxrwt  2 root     root     4096 Jan 01 00:00 tmp
-rwsr-xr-x  1 root     root     1024 Jan 01 00:00 su
```

### 1.2 `cat` — Verificar permiso de lectura ✅

**Archivo:** `src/commands/builtin/cat.ts`

Antes de mostrar contenido, verificar:
```typescript
const user = getCurrentUser(machine);
if (!canRead(machine, file, user)) {
  return { output: `cat: ${rawPath}: Permission denied`, isError: true };
}
```

### 1.3 `cd` — Verificar permiso execute en directorio ✅

**Archivo:** `src/commands/builtin/cd.ts`

Unificar `getCurrentUser()` con la nueva utilidad `getCurrentUser()` de `src/utils/users.ts`. Antes de permitir el `cd`, verificar `canExecute()` en el directorio destino.

### 1.4 `mkdir` — Verificar permiso de escritura en el padre ✅

**Archivo:** `src/commands/builtin/mkdir.ts`

Reemplazar la lógica hardcodeada de `SYSTEM_DIRS` por chequeo real de permisos:
- Verificar que el usuario tenga permiso de escritura en el directorio padre
- Usar `canWrite()` + `canExecute()` en el padre

### 1.5 `rmdir` — Verificar permiso de escritura en el padre ✅

**Archivo:** `src/commands/builtin/rmdir.ts`

Mismo approach que `mkdir`.

### 1.6 `whoami` — Usar `getCurrentUser()` unificado ✅

**Archivo:** `src/commands/builtin/whoami.ts`

Reemplazar lógica duplicada por `getCurrentUser()` desde `src/utils/users.ts`.

### 1.7 `sudo` — Integrar con sistema de usuarios y `/etc/sudoers` ✅

**Archivo:** `src/commands/builtin/sudo.ts`

- Usar `getCurrentUser()` para obtener la identidad actual
- Verificar que el usuario pertenezca al grupo `sudo` (o `wheel`), no solo que exista
- Parsear `/etc/sudoers` con reglas por usuario/comando, incluyendo entradas `NOPASSWD` (ej: `usuario ALL=(ALL) NOPASSWD: /usr/bin/algo`)
- Esto es importante para los labs de escalada de privilegios vía sudo mal configurado (vector clásico de CTF): un usuario sin ser root pero con una entrada `NOPASSWD` sobre un binario específico debería poder escalar

### 1.8 Hook `useTerminalIdentity` — Usar `getCurrentUser()` ✅

**Archivo:** `src/hooks/useTerminalIdentity.ts`

Reemplazar la heurística inline por datos reales de `User`:
- El prompt muestra `username@hostname:path$`
- La identidad se determina desde `User` en vez de heurística dispersa

### 1.9 `useCommandRunner` — Restricción `/root` por permisos ✅

**Archivo:** `src/hooks/useCommandRunner.ts`

Reemplazar el hardcodeo de `/root` por un chequeo genérico de permisos en el directorio destino.

### 1.10 Tests de regresión para Fase 1 ✅

Actualizar tests existentes de `ls`, `cat`, `cd`, `mkdir`, `rmdir` para que pasen con los nuevos campos de permisos.

---

## FASE 2 — Comandos de gestión de permisos ✅

### 2.1 `chmod` ✅

**Archivo nuevo:** `src/commands/builtin/chmod.ts`

Soporte para:
- `chmod 755 archivo` — modo octal
- `chmod u+x archivo` — modo simbólico (u/g/o +-/ r/w/x)
- `chmod -R 755 directorio` — recursivo
- Validar que el usuario sea el dueño del archivo (o root)
- Actualizar `mode` en `FileEntry`

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 2.2 `chown` ✅

**Archivo nuevo:** `src/commands/builtin/chown.ts`

Soporte para:
- `chown usuario archivo`
- `chown usuario:grupo archivo`
- `chown -R usuario directorio`
- Solo root puede cambiar owner
- Actualizar `owner` y `group` en `FileEntry`

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 2.3 `chgrp` ✅

**Archivo nuevo:** `src/commands/builtin/chgrp.ts`

Soporte para:
- `chgrp grupo archivo`
- `chgrp -R grupo directorio`
- El usuario debe ser dueño o root
- Validar que el grupo exista en `/etc/group`
- Regla real de Unix: un usuario no-root solo puede cambiar el grupo de un archivo a un grupo del que **él mismo sea miembro** (no a cualquier grupo del sistema). Root no tiene esta restricción.

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 2.4 `umask` ✅

**Archivo nuevo:** `src/commands/builtin/umask.ts`

- `umask` — muestra máscara actual
- `umask 022` — cambia máscara
- Almacenar en contexto de terminal (no persistente)

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

> Importante: para que `umask` no sea solo decorativo, todo comando que cree archivos nuevos (`touch`, `mkdir`, `echo >`, guardado en `nano`, `cp`) debe calcular el mode resultante como `mode_por_defecto & ~umask` en vez de usar 644/755 fijos. Marcar esto explícitamente en las tareas de Fase 4 (4.1 a 4.7) al implementarlas.

### 2.5 `id` ✅

**Archivo nuevo:** `src/commands/builtin/id.ts`

- `id` — muestra uid, gid, grupos del usuario actual
- `id otro-usuario` — muestra info de otro usuario (leyendo `/etc/passwd`)
- Parsear `/etc/passwd` y `/etc/group` para mostrar datos reales

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 2.6 `groups` ✅

**Archivo nuevo:** `src/commands/builtin/groups.ts`

- `groups` — muestra grupos del usuario actual
- `groups usuario` — muestra grupos de otro usuario

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 2.7 `ls -la` — Mostrar archivos . y .. con permisos ✅

**Archivo:** `src/commands/builtin/ls.ts`

En formato largo con `-a`, mostrar entradas `.` (directorio actual) y `..` (directorio padre) con sus permisos reales.

### 2.8 Tests de Fase 2 ✅

**Archivos nuevos:**
- `src/commands/builtin/__tests__/chmod.test.ts`
- `src/commands/builtin/__tests__/chown.test.ts`
- `src/commands/builtin/__tests__/chgrp.test.ts`
- `src/commands/builtin/__tests__/umask.test.ts`
- `src/commands/builtin/__tests__/id.test.ts`
- `src/commands/builtin/__tests__/groups.test.ts`

---

## FASE 3 — Permisos especiales: SUID, SGID, Sticky Bit ✅

### 3.1 SUID en ejecución de comandos ✅

**Archivos:** `src/commands/index.ts` y sistema de ejecución

Cuando un binario tiene SUID (`mode & 0o4000`), ejecutarlo como el `owner` del archivo en vez del usuario actual.
- `getSuidEffectiveUser()` en `index.ts:107` busca el binario en `machine.files` y detecta SUID/SGID
- `executeCommandInternal()` establece `privesc_completed=true` durante la ejecución para que `getCurrentUser()` retorne root
- `sudo` queda excluido del handler SUID porque maneja su propia escalada
- SGID detectado pero no implementa cambio de grupo (no requerido por los labs actuales)

### 3.2 Sticky bit en `/tmp` ✅

**Archivo:** `src/commands/builtin/rmdir.ts`

`rmdir.ts` tiene `checkStickyBit()` que:
- Obtiene el `.dir` del directorio padre
- Si tiene sticky bit y el usuario no es root ni el dueño del target, deniega la operación con "Operation not permitted"
- Bug corregido: el lookup del `.dir` del padre faltaba el `/` separador (`parentDir + '/.dir'` en vez de `parentDir + '.dir'`)

### 3.3 Verificación de binarios SUID conocidos ✅

**Archivos:** `src/fs-models/fs-linux.ts`

Test verifica 5 binarios SUID (`su`, `sudo`, `passwd`, `find`, `vim`) y sticky bit en `/tmp`.

### 3.4 Escalada de privilegios vía SUID ✅

**Archivo:** `src/commands/index.ts:177-189`

Cuando un binario SUID (distinto de `sudo`) se ejecuta:
- El `CommandResponse` incluye `privescAttempted: true`, `privescTool: cmdName`, `privescCompleted: machine.id`
- Esto permite que los laboratorios validen privesc vía los `validationCriteria`

### 3.5 Tests de Fase 3 ✅

Test:
- Detección de SUID/SGID/Sticky (`hasSuid`, `hasStickyBit`, `formatMode`)
- Identidad cambia a root al ejecutar binario SUID
- `privescAttempted`, `privescTool`, `privescCompleted` en respuesta SUID
- Binario sin SUID no emite privesc
- Sticky bit: root puede borrar subdirectorio ajeno en `/tmp`
- Sticky bit: usuario no puede borrar subdirectorio ajeno en `/tmp`
- Sticky bit: dueño puede borrar su propio subdirectorio en `/tmp`
- Verificación de 5 SUID binaries en fs-linux

---

## FASE 4 — Editores de texto y manipulación de archivos ✅

### 4.1 `nano` ✅

**Archivo:** `src/commands/builtin/nano.ts`

- `nano archivo` — abre archivo existente o crea uno nuevo
- Muestra contenido + instrucciones Ctrl+O/Ctrl+X
- Verifica permisos de escritura antes de crear/abrir
- Usa `applyUmask()` para el mode del archivo nuevo

### 4.2 Editor Touch UI ✅

**Archivo:** `src/components/EditorModal.tsx`

- Modal con textarea, botones Save (Ctrl+O) y Exit (Ctrl+X)
- Props: `onSave(content)`, `onClose()`, `filePath`, `initialContent`

### 4.3 `echo` (con redirección) ✅

**Archivo:** `src/commands/builtin/echo.ts`

- `echo texto` — imprime texto
- `echo texto > archivo` — escribe/sobrescribe archivo (usa `applyUmask()` para nuevos)
- `echo texto >> archivo` — append a archivo existente (o crea si no existe)
- Verifica permisos de escritura en el directorio padre
- Usa `src/utils/redirection.ts` para parsear `>`/`>>`

### 4.4 `touch` ✅

**Archivo:** `src/commands/builtin/touch.ts`

- `touch archivo` — crea archivo vacío si no existe
- Verifica permisos de escritura en el directorio padre
- Usa `applyUmask()` para el mode del archivo

### 4.5 `rm` ✅

**Archivo:** `src/commands/builtin/rm.ts`

- `rm archivo` — elimina archivo
- `rm -r directorio` — elimina recursivamente
- `rm -f` — force (ignora archivos inexistentes)
- Verifica permisos de escritura en el directorio padre
- Respeta sticky bit (no permite borrar archivos ajenos en /tmp)

### 4.6 `cp` ✅

**Archivo:** `src/commands/builtin/cp.ts`

- `cp origen destino` — copia archivo
- `cp -r origen destino` — copia directorio recursivamente
- Verifica permisos de lectura en origen y escritura en destino
- Copias de directorios incluyen todo el contenido

### 4.7 `mv` ✅

**Archivo:** `src/commands/builtin/mv.ts`

- `mv origen destino` — mueve/renombra archivo
- Verifica permisos de escritura en ambos directorios
- Respeta sticky bit

### 4.8 Tests de Fase 4 ✅

**Archivo:** `src/commands/__tests__/fase4-editors.test.ts`

- 26 tests cubriendo echo, touch, rm, cp, mv, nano, redirection utils
- Permisos variados (denegación en /usr/bin, creación en /tmp)
- rm con/sin -f, -r, sticky bit

### Bonus: `mkdir` actualizado ✅
- `mkdir` ahora usa `applyUmask(0o777)` para el mode de directorios nuevos (antes mode implícito 0o755)
- `redirection.ts` (`src/utils/`) reutilizable por otros comandos

---

## FASE 5 — Procesos y servicios ✅

### 5.1 Sistema de procesos (Process Manager) ✅

**Archivo nuevo:** `src/frameworks/process/processManager.ts`

- Mantener lista de procesos simulados: `{ pid, name, user, cpu, mem, state, command }`
- Operaciones: `start()`, `kill()`, `list()`
- Los procesos tienen dueño (UID del usuario que los inicia)

> Implementación: la lista base se deriva de la máquina (SO + puertos/servicios
> abiertos) y el estado de procesos matados / servicios detenidos se mantiene por
> máquina en memoria (no persistente, igual que ShellManager). `resetProcessManager()`
> se invoca al cambiar de escenario desde `useCommandRunner`.

### 5.2 `ps` mejorado ✅

**Archivo:** `src/commands/builtin/ps.ts`

- `ps aux` — todos los procesos
- `ps -ef` — formato estándar
- Mostrar procesos realistas basados en el estado de la máquina (servicios corriendo, etc.)

### 5.3 `top` / `htop` mejorados ✅

**Archivo:** `src/commands/builtin/top.ts`, `htop.ts`

- Mostrar procesos del sistema con datos realistas
- Refrescar cada ciclo (usar streaming de líneas si es posible)

### 5.4 `kill` ✅

**Archivo nuevo:** `src/commands/builtin/kill.ts`

- `kill PID` — termina proceso
- `kill -9 PID` — fuerza terminación
- `kill -l` — lista señales
- Verificar que el usuario sea el dueño del proceso (o root)

### 5.5 `systemctl` / `service` ✅

**Archivo nuevo:** `src/commands/builtin/systemctl.ts`

- `systemctl status ssh` — muestra estado del servicio
- `systemctl start/stop/restart ssh` — controla servicio
- `service ssh status` — alias
- Simular cambios de estado en la máquina (detectar si un servicio está caído en nmap, etc.)

> Nota: el cambio de estado se refleja en `ps`, `top`, `htop`, `systemctl status`
> y `journalctl`. La integración con el escaneo de nmap queda anotada para la Fase 6.

### 5.6 `journalctl` ✅

**Archivo nuevo:** `src/commands/builtin/journalctl.ts`

- `journalctl -u ssh` — logs de un servicio específico
- `journalctl -f` — follow (streaming de logs)
- Leer de archivos en `/var/log/`

### 5.7 Tests de Fase 5 ✅

**Archivo nuevo:** `src/commands/__tests__/fase5-processes.test.ts`

- 18 tests: ps (aux/-ef/básico), kill (señales, permisos, -9, -l), systemctl
  (status/stop/start/restart, root-only, alias `service`), journalctl
  (filtrado por servicio, generación de logs, -f bloqueante)

---

## FASE 6 — Red y firewall

### 6.1 `iptables` ✅

**Archivo nuevo:** `src/commands/builtin/iptables.ts`

- `iptables -L` — lista reglas actuales
- `iptables -A INPUT -p tcp --dport 22 -j DROP` — agregar regla
- `iptables -P INPUT DROP` — política por defecto
- `iptables -D INPUT <n>` / `iptables -F [chain]` — borrar/limpiar reglas
- Las reglas afectan los escaneos de nmap (puertos filtrados vs abiertos)
- Solo root puede modificar

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 6.2 `ufw` ✅

**Archivo nuevo:** `src/commands/builtin/ufw.ts`

- `ufw status` — estado del firewall y reglas
- `ufw enable/disable` — al habilitar aplica default-deny sobre INPUT
- `ufw allow 22/tcp` / `ufw allow ssh` — abre puertos (nombres de servicio)
- `ufw deny/reject <service>` — reglas que se activan al habilitar
- `ufw delete/reset`
- Wrapper sobre las reglas de `networkState`

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 6.3 `ip` / `ifconfig` mejorado ✅

**Archivo:** `src/commands/builtin/ip.ts`, `src/commands/builtin/ifconfig.ts`

- `ip addr` — muestra interfaces con IP/MAC y estado
- `ip link set eth0 down/up` — desactivar/activar interfaz (solo root)
- `ip route` — tabla de enrutamiento
- `ifconfig` refleja el estado DOWN de la interfaz

### 6.4 `ss` / `netstat` ✅

**Archivo nuevo:** `src/commands/builtin/ss.ts`

- `ss -tlnp` — puertos en escucha con proceso
- `ss -tnp` — conexiones establecidas
- `netstat -tlnp` / `netstat -an` — equivalente con PID/Program name
- Basados en el estado real: firewall + servicios activos (`getListeningPorts`)

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 6.5 Tests de Fase 6 ✅

**Archivo nuevo:** `src/commands/__tests__/fase6-network.test.ts`

- 27 tests: iptables (list/append/delete/flush/policy/permisos), ufw
  (enable/allow/deny/disable/status, reglas solo activas al habilitar),
  ip/ifconfig (addr/link/route, down/up, permisos), ss/netstat (listening,
  established, filtrado por firewall), e integración con nmap (puertos
  filtrados excluidos con --open, -v muestra filtered).

**Framework nuevo:** `src/frameworks/network/networkState.ts`

- Estado de red por máquina NO persistente (igual que ProcessManager):
  reglas iptables/ufw, políticas por defecto, interfaces down.
- `effectivePortState(machine, port)` aplica firewall + servicios a los
  puertos que reportan nmap, ss y netstat.
- `resetNetworkState()` se llama en `useCommandRunner` al cambiar de escenario.

---

## FASE 7 — Sistema de paquetes y scripting ✅

### 7.1 `apt` ✅

**Archivo nuevo:** `src/commands/tools/apt.ts`

- `apt update` — simula actualización de repositorios
- `apt install nmap` — "instala" una herramienta (agrega binario a `/usr/bin/`)
- `apt list --installed` — lista paquetes instalados
- `apt search <term>` — busca por nombre/descripción
- `apt remove <pkg>` — desinstala
- Solo root

Registro en: `src/commands/tools/index.ts` y `src/commands/index.ts`

**Framework nuevo:** `src/frameworks/packages/packageManager.ts`

- Base de datos de ~25 paquetes conocidos con sus binarios.
- Estado por máquina NO persistente (`Map<string, Set<string>>`): el set base
  se deriva de los binarios presentes en el filesystem de la máquina.
- `installPackage`/`removePackage`/`isInstalled`/`listInstalled`/`searchPackages`.
- `resetPackageManager()` se llama en `useCommandRunner` al cambiar de escenario.

### 7.2 `dpkg` ✅

**Archivo nuevo:** `src/commands/tools/dpkg.ts`

- `dpkg -l` — lista paquetes
- `dpkg -i paquete.deb` — instalar .deb local (parsea campos Package/Version
  del archivo en el filesystem)

### 7.3 Pipes y redirección (`|`, `>`, `>>`) ✅

**Archivo nuevo:** `src/utils/shellParse.ts`

- `splitTopLevel` / `extractRedirection`: parseo quote-aware (comillas simples
  y dobles) de `|`, `>`, `>>` y `<`.
- `expandCommandLine`: expansión de `$VAR`/`${VAR}` respetando comillas.

**Cambios en:** `src/commands/index.ts` (ejecución de comandos)

- `runPipeline()`: ejecuta segmentos en secuencia pasando `pipedInput` al
  siguiente; conserva la metadata del primer comando (p. ej. `scanResults`
  de `nmap | grep`) y fusiona `filesChanged`.
- Redirección global `>`/`>>` vía `writeOutputToFile` (permisos + umask) y
  `<` inyectando el archivo como argumento final (`cat < file` → `cat file`).
- Filtros nuevos: `grep` (`-v`, `-i`), `head`, `tail`, `wc`, `sort`, `uniq`
  en `src/commands/builtin/pipeline.ts` — leen `CommandContext.pipedInput` o
  un archivo.

### 7.4 Variables de entorno ✅

**Archivo nuevo:** `src/utils/environment.ts`

- `export VAR=valor` — establece variable (con soporte de comillas)
- `env` / `unset` — listar y eliminar variables
- `echo $VAR` — muestra variable
- Variables por defecto: `PATH`, `HOME`, `USER`, `SHELL`, `EDITOR` (derivadas
  del usuario actual de la máquina vía `DEFAULT_ENV(machine)`)
- Almacenar en el contexto de la terminal (`CommandContext.env` / `setEnv`,
  igual que `umask` — por sesión, no persistente)

### 7.5 Tests de Fase 7 ✅

**Archivo nuevo:** `src/commands/__tests__/fase7-packages-pipes-env.test.ts`

- 39 tests: apt (update/install/remove/list/search, permisos root, binarios
  agregados al FS), dpkg (-l, -i local, permisos), variables de entorno
  (export/env/unset, parseExportAssignment, expandVariables, DEFAULT_ENV),
  filtros de pipe (grep/head/tail/wc/sort/uniq), redirección global
  (escritura, append, permisos, `<`), integración `cat | grep`, `ls | head`,
  `cat | wc`, y utilidades de shellParse.

---

## FASE 8 — Tareas programadas ✅

### 8.1 `crontab` ✅

**Archivo nuevo:** `src/commands/builtin/crontab.ts`

- `crontab -l` — lista tareas del usuario (`/var/spool/cron/crontabs/USER`),
  "no crontab for USER" si no existe
- `crontab -e` — editar tareas (usa nano internamente; crea la cadena
  `/var/spool/cron` si falta y respeta permisos)
- `crontab -r` — elimina la crontab
- `crontab -u user` — operar sobre otra crontab (solo root)
- Crontabs de usuario se guardan con mode 0600

Registro en: `src/commands/builtin/index.ts` y `src/commands/index.ts`

### 8.2 Ejecución de Cron Jobs ✅

**Archivo nuevo:** `src/frameworks/cron/cronRunner.ts`

- **Reloj virtual por máquina** (no persistente): minutos transcurridos desde
  base `2024-03-19T10:00:00Z`. `resetCron()` se llama en `useCommandRunner`.
- Evalúa tareas en `/etc/crontab` (con columna de usuario) y
  `/var/spool/cron/crontabs/<user>` (sin ella). Matcher de horario:
  `*`, `*/n`, rangos `a-b` y listas `a,b` en los 5 campos.
- `runCron(machine, minutes)`: avanza el reloj y ejecuta las tareas que
  correspondan **si el servicio cron está corriendo** (integración con
  `processManager.isServiceRunning('cron')`). Genera entradas `CRON[pid]:
  (user) CMD (...)` en `/var/log/syslog` y aplica efectos simples sobre el
  filesystem (`touch <f>`, `<cmd> >|>> <f>`).
- **Disparador por acción del usuario:** el comando `sleep N` (nuevo, builtin)
  avanza el reloj virtual N minutos (mínimo 1) y ejecuta las tareas debidas;
  `date` muestra la hora virtual. `journalctl -u cron` refleja las entradas
  generadas.

### 8.3 Tests de Fase 8 ✅

**Archivo nuevo:** `src/commands/__tests__/fase8-cron.test.ts`

- 21 tests: parseCrontab/listCronJobs, ejecución de `* * * * *`, `*/2`,
  efectos en filesystem, cron detenido, reloj que avanza sin jobs,
  crontab -l/-e/-r/-u, date, sleep (avance + integración con
  executeCommand y journalctl).

---

## FASE 9 — Sistema de archivos avanzado ✅

### 9.1 `mount` / `umount` ✅

**Archivo nuevo:** `src/commands/builtin/mount.ts` + `src/frameworks/fs/mounts.ts`

- `mount` — lista montajes actuales (desde `/etc/fstab`)
- `mount /dev/sdb1 /mnt/usb` — montar dispositivo
- `umount /mnt/usb` — desmontar
- Solo root

### 9.2 `df` / `du` ✅

**Archivo nuevo:** `src/commands/builtin/df.ts`

- `df -h` — espacio en disco (simulado basado en cantidad de archivos)

**Archivo nuevo:** `src/commands/builtin/du.ts`

- `du -sh directorio` — tamaño del directorio

### 9.3 `ln` ✅

**Archivo nuevo:** `src/commands/builtin/ln.ts`

- `ln -s target link_name` — enlace simbólico
- Representar enlaces en `ls -l` con `->`
- `FileEntry` gana `linkTarget`; `cat` sigue el enlace vía `resolveSymlink`

### 9.4 `find` ✅

**Archivo nuevo:** `src/commands/builtin/find.ts`

- `find / -name "*.txt"` — buscar archivos
- `find / -perm -4000` — buscar SUID
- `find / -user root` — buscar archivos de un usuario

### 9.5 `grep` ✅

**Archivo:** `src/commands/builtin/pipeline.ts`

- `grep pattern archivo` — buscar en archivo
- `grep -r pattern directorio` — buscar recursivo (`path:line`)
- `grep -i` — case insensitive

### 9.6 Tests de Fase 9 ✅

**Archivo nuevo:** `src/commands/__tests__/fase9-fs.test.ts` (24 tests)

- `mount`/`umount` con permisos raíz, mount point inexistente, montajes del sistema protegidos
- `df -h` y `du -sh`/`-s`/`-a` con human readable
- `ln -s` → `ls -l` con `->` y `cat` que sigue el enlace; `resolveSymlink` con cadenas
- `find` por `-name`, `-perm -4000`, `-user`, `-type`
- `grep -r` y `grep -ri` con `path:line`

---

## BACKLOG — Fuera de la secuencia principal (sin prioridad actual)

### Docker (simulación de contenedores)

**Archivo nuevo:** `src/commands/tools/docker.ts`

- `docker ps` — lista contenedores
- `docker exec -it container bash` — ejecutar comando en contenedor
- `docker run` — iniciar contenedor
- Los contenedores son sub-máquinas dentro de una máquina

> Se saca deliberadamente de la secuencia numerada de fases. Implica modelar "máquinas dentro de máquinas", que es un salto de complejidad grande comparado con el resto del roadmap. No es prioridad ahora — queda anotado acá para el día que se retome, pero no bloquea ni depende de ninguna otra fase.

---

## Notas de implementación

### Orden sugerido para abordar las fases

```
FASE 0 → FASE 1 → FASE 2 → FASE 3 → FASE 4
                                           ↓
                                    FASE 5 → FASE 6
                                           ↓
                                    FASE 7 → FASE 8 → FASE 9
```

Cada fase puede trabajarse de forma independiente una vez completada la Fase 0.

Docker queda fuera de esta secuencia (ver sección BACKLOG al final) — no es prioridad actual y no bloquea nada.

### Estrategia para no romper tests existentes

1. Extender `FileEntry` con campos opcionales (`owner?`, `group?`, `mode?`)
2. Valores por defecto en los lugares de lectura (si no hay mode, asumir 644/755)
3. Actualizar `createFile()` primero, después los fs-models, después los laboratorios
4. Ejecutar `pnpm test:run` después de cada tarea

### Resumen de archivos nuevos

| Archivo | Propósito |
|---|---|
| `src/utils/users.ts` | Parseo de passwd/group, getCurrentUser |
| `src/utils/permissions.ts` | checkPermission, formatMode, canRead/Write/Execute |
| `src/commands/builtin/chmod.ts` | Cambiar permisos |
| `src/commands/builtin/chown.ts` | Cambiar dueño |
| `src/commands/builtin/chgrp.ts` | Cambiar grupo |
| `src/commands/builtin/umask.ts` | Máscara de permisos |
| `src/commands/builtin/id.ts` | Mostrar identidad |
| `src/commands/builtin/groups.ts` | Mostrar grupos |
| `src/commands/builtin/__tests__/chmod.test.ts` | Tests de chmod |
| `src/commands/builtin/__tests__/chown.test.ts` | Tests de chown |
| `src/commands/builtin/__tests__/chgrp.test.ts` | Tests de chgrp |
| `src/commands/builtin/__tests__/umask.test.ts` | Tests de umask |
| `src/commands/builtin/__tests__/id.test.ts` | Tests de id |
| `src/commands/builtin/__tests__/groups.test.ts` | Tests de groups |
| `src/commands/builtin/nano.ts` | Editor de texto |
| `src/components/EditorModal.tsx` | UI del editor |
| `src/commands/builtin/echo.ts` | Echo con redirección |
| `src/commands/builtin/touch.ts` | Crear archivos |
| `src/commands/builtin/rm.ts` | Eliminar archivos |
| `src/commands/builtin/cp.ts` | Copiar archivos |
| `src/commands/builtin/mv.ts` | Mover archivos |
| `src/commands/builtin/kill.ts` | Matar procesos |
| `src/commands/builtin/systemctl.ts` | Gestión de servicios |
| `src/commands/builtin/journalctl.ts` | Logs |
| `src/frameworks/process/processManager.ts` | Procesos |
| `src/commands/builtin/ss.ts` | Conexiones de red |
| `src/commands/builtin/mount.ts` | Montajes |
| `src/commands/builtin/df.ts` | Espacio en disco |
| `src/commands/builtin/du.ts` | Uso de disco |
| `src/commands/builtin/ln.ts` | Enlaces simbólicos |
| `src/commands/builtin/find.ts` | Buscar archivos |
| `src/commands/builtin/grep.ts` | Buscar texto |
| `src/commands/builtin/crontab.ts` | Tareas programadas |
| `src/commands/tools/iptables.ts` | Firewall |
| `src/commands/tools/ufw.ts` | Firewall simplificado |
| `src/commands/tools/apt.ts` | Gestor de paquetes |
| `src/commands/tools/dpkg.ts` | Paquetes deb |
| `src/frameworks/process/processManager.ts` | Procesos |
| `src/frameworks/cron/cronRunner.ts` | Cron jobs |
| `src/utils/environment.ts` | Variables de entorno |
| `src/utils/redirection.ts` | Parseo compartido de `>` / `>>` (reutilizado por `echo`, `cat`, `nano`) |
| `docs/ROADMAP.md` | Este archivo |

### Docker — fuera de la secuencia principal

Ver sección **BACKLOG** al final del documento. No forma parte del orden de fases 0-9 y no tiene prioridad asignada por ahora.
