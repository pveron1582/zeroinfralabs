# Roadmap de comandos — ZeroInfra Labs

> Fecha: 2026-09-17. Inventario medido y plan propuesto; no es una
> certificación de compatibilidad Linux. Alcance: simulación local en navegador.

## 1. Inventario actual

**74 nombres de comandos de primer nivel (inventario inicial, 2026-09-17; 120 tras Tier 1, 21-09)** en
`/home/pablo/cyberops-v2/src/commands/names.ts`.
El registro ejecutable es la fuente de verdad; el test
`/home/pablo/cyberops-v2/src/commands/__tests__/commandNames.test.ts`
comprueba que ambos coincidan.

Distribución por organización del código (no por finalidad):

- **62 exports en builtin**, repartidos en 51 archivos de implementación.
- **12 exports en tools**: `apt`, `arp-scan`, `curl`, `dpkg`, `ftp`,
  `gobuster`, `hydra`, `msfconsole`, `nc`, `netdiscover`, `nmap`, `ssh`.
- `hashcat` está en builtin aunque es una herramienta de seguridad;
  `apt` y `dpkg` están en tools aunque son gestores de paquetes.
- Por finalidad, hay **7 herramientas claramente orientadas a seguridad**:
  `arp-scan`, `netdiscover`, `nmap`, `gobuster`, `hydra`, `hashcat`,
  `msfconsole`; otras 4 son de red/transferencia de uso general:
  `curl`, `ssh`, `nc`, `ftp`. Esta clasificación es editorial.
- Alias como `python`/`python3` cuentan como nombres distintos, no como
  implementaciones completas independientes. `end` es propio del simulador.

### Capacidades que el conteo no refleja

- FS virtual, permisos, usuarios, procesos, red y sesiones con estado.
- Mini-intérprete Python, editor y herramientas de paquetes simuladas.
- **14 entradas en el catálogo MSF** de
  `/home/pablo/cyberops-v2/src/frameworks/metasploit/core/msfModules.ts`.
  Una entrada catalogada no demuestra implementación completa del módulo.
- Los comandos internos de MSF, las sesiones FTP y las interfaces gráficas
  se deben auditar aparte. No sumarlos al total de comandos Linux.

## 2. Comparación con Linux real y correcciones del estudio inicial

| Medición local | Resultado | Interpretación |
|---|---:|---|
| Nombres distintos de `compgen -c` | 3985 | Incluye comandos, builtins, aliases y funciones; no son solo binarios |
| Entradas de `/usr/bin` | 2965 | No garantiza ejecutabilidad ni funciones diferentes |
| Entradas de `/usr/sbin` | 621 | No sumar con `/bin` y `/sbin` sin resolver enlaces |
| Coincidencias de man en secciones 1 y 8 | 4199 | No equivale a comandos únicos implementados |
| Paquetes instalados reportados por dpkg | 3384 | Contexto de esta máquina, no estándar de Linux |

**74 / 3985 = 1,86%**, una relación de tamaños entre inventarios,
NO un porcentaje de compatibilidad o realismo. No se calculó la intersección
exacta de nombres, y los denominadores varían según instalación y shell.
No existe un total cerrado de «todo lo instalable en Linux».

Correcciones explícitas a la explicación inicial:

- Retirada la cifra de «1300 comandos POSIX/SUS»: no se verificó y no
  debe emplearse como base para calcular porcentajes.
- Retirados «50–60% del uso real», «95% con 150–250 comandos» y
  «menos de 0,1% adicional por comando»: no hay corpus ni estudio citado
  que los sustente en esta revisión.
- Retirada la suma de «~40 subcomandos MSF» al total: se leyó ayuda,
  pero listar un comando no demuestra que tenga un handler funcional.
- No se verificó la cifra de herramientas de Kali ni cuántas usa un
  pentester habitual; no se usará para justificar objetivos.
- No se puede prometer una experiencia indistinguible de Linux por
  alcanzar cierta cantidad de comandos.

**Diagnóstico:** hay una base amplia para los escenarios educativos
previstos; falta medir la fidelidad fuera de los caminos guiados.

## 3. Objetivo propuesto, no porcentaje demostrado

Conservar **~200 comandos de sistema + ~40 herramientas (~240 nombres)**
como horizonte opcional de planificación, NO como requisito ni garantía.
Los tiers siguientes son un backlog inicial y no suman necesariamente 240.
No inflar el total con alias, módulos MSF o comandos de interfaces gráficas.

El primer objetivo es completar flujos educativos, no llenar el inventario.
Reevaluar el alcance tras cada lote de 5–10 comandos, según utilidad,
fallos de compatibilidad y coste de mantenimiento. Puede ser suficiente
un subconjunto menor si cubre bien las prácticas elegidas.

### Cómo medir «suficiente»

1. Seleccionar un corpus versionado de tareas de Academy, administración
   básica y laboratorios propios; incluir variantes no guiadas y errores.
2. Definir para cada tarea entradas, salidas relevantes, cambios de estado,
   permisos, códigos de salida y composición con otros comandos.
3. Comparar operaciones inocuas con una imagen Linux de referencia fijada
   por versión. Para seguridad, usar únicamente fixtures y tráfico sintético.
4. Medir `tareas compatibles / tareas evaluadas`. Si se ponderan tareas,
   publicar sus pesos y no presentarlos como frecuencia universal de uso.
5. Separar cobertura de nombres, opciones, semántica, composición y UX.

**Criterio de salida propuesto:** 100% de tareas críticas del corpus y
al menos 90% del conjunto acordado, sin fallos críticos de aislamiento,
permisos o pérdida de estado. Son metas de producto, todavía no medidas.

## 4. Backlog por tiers

Todo lo siguiente permanece pendiente de auditoría y priorización.
Cada herramienta de seguridad se limita al mundo virtual; sin tráfico ni
explotación de equipos externos. No implementar solamente respuestas fijas.


### Tier 1 — Flujos cotidianos (prioridad alta)

- [x] Lectura: `less`, `more` (hecho 2026-09-20: dump no interactivo + `-N`, pipe, permisos).
- [x] Ayuda: `man`, `whatis`, `apropos` (hecho 2026-09-20: `man` usa las
  páginas de `help`, índice `WHATIS` compartido; subconjunto = comandos
  implementados, el resto dice `No manual entry`).
- [x] Shell: `history`, `alias`, `unalias`, `type` (hecho 2026-09-20: historial
  por terminal vía contexto, tabla de alias aislada por executor con expansión
  en primera palabra de cada segmento de pipe, `type` distingue alias/comando).
- [x] Texto: `cut`, `tr`, `tac`, `sed` básico, `awk` básico, `tee`, `diff`,
  `nl`, `rev`, `column` (hecho 2026-09-20: `cut -d/-f/-c/-s/--complement`,
  `tr` con rangos/escapes/`-d/-s/-c`, `nl -b/-i/-v/-w/-s`, `column -t`,
  `sed s///[gip]+d/p/q` con `&` y `\1`, `awk` con `/re/`, comparaciones,
  `BEGIN/END`, `NR/NF/FNR/$NF`, `diff` normal/`-u`/`-q` con LCS, `tee -a`
  con permisos; `text.ts` + `sed/awk/diff/tee.ts` por límite de 300 líneas).
- [x] Sistema: `uname`, `hostname`, `hostnamectl`, `uptime`, `free`,
  `lscpu`, `w`, `last`, `arch`, `lsb_release` (hecho 2026-09-20: uptime
  por reloj virtual con `-p`/`-s`, free derivado del host, host
  seed determinista).
- [x] Archivos: `stat`, `file`, `basename`, `dirname`, `realpath`,
  `md5sum`, `sha256sum`, `base64`, `strings` (hecho 2026-09-20:
  crypto real vía `js-md5`/`js-sha256` (vectores RFC/FIPS), base64
  RFC 4648 con UTF-8, strings con `-n`, realpath con `-e`/symlinks).
- [x] Red virtual: `wget`, `dig`, `nslookup`, `scp`, `whois`,
  `tcpdump` con capturas sintéticas (hecho 2026-09-21: wget escribe
  con permisos reales vía nmap/outfiles, dig/nslookup resuelven el
  DNS virtual del lab, scp exige 22 abierto + credencial verificada,
  whois registro sintético, tcpdump tráfico sintético entre máquinas).
- [x] Editor: `vi`/`vim` emulados sobre el editor del simulador (nano modal).
  Documentado: los modos vi (normal/insert/visual, :wq) no se implementan;
  `sudo vim` y `vim -c '!bash'` siguen como flujos de escalada (hecho 2026-09-21).
  **Tier 1 completo (a 2026-09-21): 120 nombres en el inventario.**

Primer lote sugerido: `uname`, `hostname`, `stat`, `file`, `less` — hecho
2026-09-20 (+ `more`). `wc` y `nano` ya existen y no cuentan como altas nuevas.
Inventario tras el lote: 80 nombres (74 + `file`, `hostname`, `less`,
`more`, `stat`, `uname`).

### Tier 2 — Ampliación educativa de seguridad (prioridad media)

Activar cada grupo solo cuando una lección o un lab lo necesite.
Se trata de interfaces simuladas, no de herramientas ofensivas reales.

- [ ] Inventario virtual: `smbclient`, `enum4linux`, `showmount`,
  `rpcclient`, `snmpwalk`, `dnsrecon`.
- [ ] Análisis de sitios ficticios: `nikto`, `sqlmap`, `wfuzz`/`ffuf`,
  `whatweb`, `wpscan`.
- [ ] Catálogos y conexiones sintéticas: `searchsploit`, `socat`,
  subconjunto de `openssl s_client`.
- [ ] Informes sobre máquinas ficticias: `linpeas`, `winpeas`,
  `linux-exploit-suggester`, `pspy`.

Aceptación: resultados derivados del estado virtual, metadata coherente
con misiones y rechazo claro de destinos externos.

### Tier 3 — Administración y operaciones complementarias

No considerarlos «ruido»: algunas operaciones requieren un modelo profundo.

- [ ] Archivos: `tar`, `gzip`, `gunzip`, `zip`, `unzip`, `xz`, `split`, `cksum`.
- [ ] Composición: `seq`, `printf`, `yes` con límites, `test`, `xargs`,
  `nohup`. Evaluar `[[` como sintaxis de shell, no binario.
- [ ] Usuarios: `useradd`, `userdel`, `usermod`, `passwd`, `getent`,
  `chage`, `adduser`.
- [ ] Sistema: `lsblk`, `blkid`, `lsof`, `vmstat`, `iostat`, `watch`, `dmesg`.
- [ ] Diagnóstico y ciclo de vida virtual: `strace` limitado,
  `shutdown`, `reboot`, `init`.

### Transversal — Fidelidad antes que cantidad

- [ ] Auditar quoting, escapes, expansión de variables y rutas.
- [ ] Auditar pipes, redirecciones y separación stdout/stderr.
- [ ] Auditar códigos de salida, encadenamiento y errores de argumentos.
- [ ] Verificar permisos, propietario, grupo y umask.
- [ ] Verificar sesiones anidadas y aislamiento entre terminales.
- [ ] Acotar bucles, salida, memoria y tiempos para no bloquear el navegador.
- [ ] Comprobar que la ayuda no anuncie funcionalidades inexistentes.

## 5. Implementación y aceptación

Raíz del repositorio: `/home/pablo/cyberops-v2`.

1. Elegir una tarea del corpus y definir el subconjunto soportado.
2. Usar `/home/pablo/cyberops-v2/src/commands/builtin/` o
   `/home/pablo/cyberops-v2/src/commands/tools/`, exportando `cmd_<name>`.
3. Añadir el export al barrel y actualizar
   `/home/pablo/cyberops-v2/src/commands/names.ts` sin duplicados.
4. Para FS, seguir `/home/pablo/cyberops-v2/docs/PERMISSIONS.md`:
   helpers compartidos, conservación de metadatos y sin mutación directa.
5. Reutilizar estado y metadata existentes. No ejecutar comandos reales
   desde la simulación. Mantener archivos de código menores de 300 líneas.
6. Tests en español: caso válido, argumentos inválidos, permisos,
   composición, cambios de estado y ausencia de efectos entre terminales.
7. Validar TypeScript, lint, tests y build; añadir E2E cuando cambie la UI.
8. Marcar completado solo tras revisar pruebas y límites documentados.

Comprobaciones desde la raíz del repositorio:

```bash
pnpm typecheck
pnpm lint
pnpm test:run
pnpm build
```

## 6. Seguimiento

| Hito | Estado | Evidencia requerida |
|---|---|---|
| Inventario top-level | 74 nombres; 62 builtin + 12 tools | Registro y test de sincronización |
| Auditoría de opciones y subcomandos | Pendiente | Handlers y pruebas, no menús de ayuda |
| Corpus y baseline de fidelidad | Pendiente | Tareas versionadas y resultados |
| Primer lote Tier 1 | Pendiente | Tests y comparación inocua de referencia |
| Tier 1 restante | Pendiente | Revisión por lotes |
| Tier 2 | Pendiente | Necesidad pedagógica y aislamiento virtual |
| Tier 3 | Pendiente | Utilidad y coste por subsistema |
| Horizonte de ~240 nombres | Propuesto, revisable | No indica realismo por sí solo |

Ficha por lote: fecha, comandos nuevos frente a alias, opciones soportadas,
tareas desbloqueadas, tests ejecutados, límites y siguiente prioridad.
No se calcula aún un porcentaje de realismo: primero hay que medirlo.
