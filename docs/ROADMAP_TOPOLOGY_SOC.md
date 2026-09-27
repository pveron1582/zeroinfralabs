# ROADMAP — Topología dinámica, SOC virtual y objetivos Windows

> Plan de crecimiento del simulador hacia redes configurables (múltiples
> máquinas con topología), detección estilo SOC (Wazuh/SIEM virtual) y
> soporte de objetivos Windows — sin redistribuir nada de Microsoft.
>
> Origen: propuesta "red dinámica + monitor/IPS + wazuh virtual + Windows"
> (2026-09-21). Relaciona con: `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`.
>
> **Estado:** propuesto. ✅ = Listo | ⏳ = En progreso | ⬜ = Pendiente.

---

## Visión

Hoy un lab = atacante Kali + un objetivo. La visión es un **laboratorio
sandbox**: una topología editable (switch, workstation Linux, server, Kali,
más adelante Windows y routers/IDS) donde podés:

- Atacar desde el Kali como hoy (atacante ↔ objetivo).
- Conmutar al **desktop de otra máquina** (tabs estilo VM) y defender:
  revisar el SIEM virtual, investigar alertas y reaccionar.
- Jugar en modo **SOC**: recibir alertas de un ataque en curso, analizarlas,
  escalarlas o mitigarlas (bloquear puerto, cortar proceso, aislar host).

Diferenciador frente a HTB/THM: no sólo ofensiva — **detección y respuesta
en la misma red simulada**, sin infraestructura real.

---

## Decisiones de diseño (fijas)

1. **Todo simulado, cero imágenes/binarios propietarios.** Windows es un pack
   textual (comandos + FS + servicios), igual que ya existe
   `createWindowsFileSystem` en `src/fs-models/fs-windows.ts`. Sin licencias.
2. **La metadata es el bus de eventos.** El SIEM no "snifa": consume los
   eventos que `CommandResponse` ya emite (`scanResults`, `exploit`,
   `foundVulnerability`, `sshLogin`...) y los traduce a alertas por reglas.
3. **Bajo acoplamiento preservado.** Topología y SIEM son frameworks nuevos
   (`src/frameworks/topology/`, `src/frameworks/siem/`); comandos y laps no
   los importan directamente.
4. **Incremental:** cada fase deja algo usable. Nada de reescrituras.

---

## FASE A — Sandbox multi-máquina

Permitir escenarios con N máquinas (no sólo atacante + objetivo).

- **A.1** `buildSandboxScenario(config)` en `src/laboratorios/templates.ts`:
  versión generalizada de `buildScenario()` que recibe N máquinas
  (con `COMMON_PORTS` por rol: workstation, server) y un `networkRange`.
  ⬜
- **A.2** Roles declarativos: `role: 'workstation' | 'server' | 'attacker'`
  en `MachineInfo` (opcional) para icons/NetworkMap y defaults de FS. ⬜
- **A.3** NetworkMap multi-host (ya soporta N nodos; validar layout). ⬜
- **A.4** Misiones con `targetMachineId` arbitrario (ya existe en el
  validador; agregar tests happy-path con 3-4 máquinas). ⬜
- **A.5** Lab de poc a 4 máquinas: kali + workstation + server + win-srv. ⬜

**Entregable:** un escenario sandbox jugable con 4 hosts en la misma red.

## FASE B — Topología (switch, segmentos, visibilidad)

Agregar modelo de topología y reglas de alcance.

- **B.1** Tipos (`src/types/network.ts`): `TopologyNodeId`, `Link`,
  `NetworkTopology` (nodos + enlaces; nodos host or infra). ⬜
- **B.2** `src/frameworks/topology/`: grafo + `canReach(from, to)` y
  `pathBetween(from, to)` (BFS sobre enlaces; respeta dispositivos). ⬜
- **B.3** Integración gradual:
  - `arp-scan`/`netdiscover`/`nmap` devuelven sólo hosts alcanzables. ⬜
  - `ssh`/`ftp`/`scp`/`curl`/`wget` fallan con "No route to host" si no hay
    camino. ⬜
- **B.4** Editor visual de topología en el desktop (drag-and-drop simple):
  energía por defecto = star con un switch. Persistir en el escenario. ⬜

**Entregable:** primer lab con dos segmentos (DMZ + LAN) y pivoting.

## FASE C — SIEM virtual (Wazuh-like) y modo defensa

- **C.1** `src/frameworks/siem/`: `SiemEngine` con reglas
  (evento → severidad/descripción), correlación simple (N eventos en T
  tiempo) y feed por máquina/escenario. ⬜
- **C.2** App de desktop "SIEM": panel con feed de alertas, detalle,
  ack/escalado. Reusa patrones de `MissionPanel`. ⬜
- **C.3** Generadores: mapear metadata de comandos a alertas
  (`nmap -sS` → SYN scan, `hydra` → password spraying, `exploit` →
  intrusión, lectura de `/etc/shadow` → acceso indebido, etc.). ⬜
- **C.4** Acciones defensivas desde la terminal: `ufw deny`, `kill`, `userdel`,
  deshabilitar servicio, que cierren las alertas correspondientes
  (validador `siemMitigated`). ⬜
- **C.5** Misión SOC: "detectá y frená el ataque N antes de T min". ⬜

**Entregable:** modo defensa jugable con alertas reactivas y mitigación.

## FASE D — Objetivos Windows (simulación textual) ✅

**Plan detallado (W0–W5): `docs/PLAN_WINDOWS.md`** — expandido con pack
**cmd.exe**, sesión **PowerShell** (cmdlets MVP), **escritorio simulado
tipo RDP** y lab EternalBlue como caso de uso. **W0–W5 listos**
(2026-09-23).

Sin binarios ni marcas de MS. Reusa `fs-windows.ts`.

- **D.1** Pack comandos Windows: `dir`, `ipconfig`, `netstat -ano`,
  `tasklist`, `whoami /priv`, `sc`, `reg query`, `net user` — en
  `src/commands/windows/`, activos cuando la máquina es Windows. ✅
- **D.2** Servicios como puertos: SMB(445), RDP(3389), WinRM(5985),
  MSSQL(1433); `nmap` los reconoce; `ssh` no aplica → `evil-winrm`-like.
  RDP(3389) cubierto por `mstsc` con credenciales (W5); WinRM/MSSQL
  pendientes. ⏳
- **D.3** FS Windows vía `createWindowsFileSystem` + rutas `C:\` ↔
  normalización (adaptar `resolvePath` con flag de "OS" o mapa por máquina). ✅
- **D.4** Lab ej: EternalBlue-style vía exploit MSF simulado + hashdump
  (sin memeces de bypass EDR; educativo). ✅ (lab08)

**Legal:** todo texto propio; referencia nominativa ("tipo Windows"); ver
sección Legal abajo.

---

## Notas de UX: desktops por máquina (tabs)

La propuesta del usuario (tab por máquina, estilo virtual-machine):

- Ya existe estado de terminal/máquina activa; generalizar a **dock de
  hosts** que abre una pestaña terminal/SIEM/browser por máquina. ⬜ (FASE E)
- El modo SOC alterna "consola atacante" ↔ "consola servidor" mostrando cómo
  el mismo evento se ve de ambos lados (attack path ↔ alertas).

## Legal (Windows)

- **Nunca** shaders/binarios/logos/fuentes/ISO de Microsoft.
- No presentarlo como producto de Microsoft: copys tipo "entorno tipo
  Windows simulado con fines educativos".
- Textos de ayuda y respuestas de comandos: redacción original.
- La palabra "Windows" como referencia descriptiva = uso nominativo válido.

## Riesgos y costños

| Fase | Riesgo principal | Estimado relativo |
|---|---|---|
| A | Generalizar buildScenario sin romper los 7 labs | Medio |
| B | Alcance/segmentación afecta muchos comandos | Medio-Alto |
| C | Correlación de alertas bien calibrada (ni spam ni ciegas) | Medio |
| D | Path Windows (`C:\`) rompe helpers POSIX | Medio |

## Orden sugerido

**A (sandbox 4 hosts) → C.1-C.3 (SIEM MVP) → B (topología/segmentos) →
D (Windows) → E (dock multi-host)**. Permite demo temprana de defensa con la
red actual, y la topología/segmentación madura después sobre demanda real.
