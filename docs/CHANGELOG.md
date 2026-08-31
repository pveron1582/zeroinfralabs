# Changelog

## [Unreleased] - 2026-08-30

### ci-03/04/05 ES: los últimos 3 videos mudos ahora suenan

El autor grabó los 9 wavs ES que faltaban (ci-03, ci-04, ci-05) — los
únicos que quedaban de toda la academia:

- **Wavs** en `public/videos/audio-es/<video-id>/` · **`AUDIO_TIMINGS`**
  con las duraciones reales (ffprobe): ci-03 [28.96, 27.36, 31.76],
  ci-04 [29.60, 28.40, 32.80], ci-05 [21.92, 28.80, 35.12].
- **`AUDIO_PENDING` queda vacío** — las 3 composiciones ya emiten su
  `<Audio>` ES (antes se renderizaban mudas con timings estimados).
- **Beats re-medidos** con transcripción word-level del wav ES en las
  3 composiciones ES (los estimados quedaban hasta 14s corridos vs el
  audio real, p.ej. el cierre de ci-05 pasaba de 16s a 32.3s).
- **Render**: 3 MP4 en `public/videos/es/` (87-92s, audio aac) ·
  **CDN** (`a4a6286`) con purge.
- Pixel-check de ci-04 (título → hash/cifrado → familias → HTTPS →
  usos diarios, cada panel entra cuando la voz lo nombra).

Con esto la academia queda **completa en ambos idiomas**: 59 videos ES
con audio + 59 EN con audio, 59/59 lecciones con `srcEn`.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **1956 tests**.

### Scripting EN: sl/ps/py (15 videos) — la academia completa en inglés

Último módulo: con los 45 wavs de scripting se completa la versión
EN de **los 59 videos del Academy** (14 sisops + 15 redes + 15
hacking ético + 15 scripting):

- **`AUDIO_TIMINGS_EN`**: duraciones de sl-01..05, ps-01..05,
  py-01..05 (ffprobe). Wavs en `public/videos/audio-en/<video-id>/`.
- **15 composiciones `*En.tsx`** con beats re-medidos de la
  transcripción word-level. Traducciones de terminales al inglés
  (`.\recon.ps1` with execution policy, `bash -i >& /dev/tcp`,
  `requests.get`), conservando los comandos técnicos.
- **Render**: 15 MP4 en `public/videos/en/` (52-80s, audio aac).
- **Lecciones**: `srcEn` en las 15 (bash/powershell/python lessons)
  → verificación total: **59 lecciones con video tienen sus 59
  `srcEn`**. La UI en inglés sirve siempre el video EN.
- **CDN** (`b4f4728`): subidos con purge — `videos/en/` queda con
  los 59 MP4. La academia completa funciona en ambos idiomas.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm lint` limpio ·
`pnpm test:run` → **1956 tests pasando**.

### Hacking Ético EN: 2ª tanda — pe-01..05, hw-03..05 (8 videos) → módulo completo

Con los 26 wavs restantes se completa el módulo de Hacking Ético en
inglés (15 videos EN totales):

- **`AUDIO_TIMINGS_EN`**: duraciones de pe-01..05 (pe-01 tiene 6
  escenas, pe-02 tiene 4) y hw-03..05 (ffprobe).
- **8 composiciones `*En.tsx`** con beats re-medidos de la
  transcripción word-level. pe-02 conserva la escena fusionada
  Linux→Windows con resaltado por palabra en ambos árboles.
- **Wavs** en `public/videos/audio-en/<video-id>/` (nombre corto).
- **Render**: 8 MP4 en `public/videos/en/` (85-105s, audio aac) ·
  `srcEn` en las 8 lecciones (path-hacking, path-hacking-web).
- **CDN** (`cd35d55`): subidos con purge — el módulo de Hacking Ético
  queda completo en EN en la página (los `ci-03/04/05` suenan en EN
  aunque su audio ES siga pendiente).

**Métricas:** `tsc --noEmit` 0 errores · `pnpm lint` limpio ·
`pnpm test:run` → **1956 tests pasando**.

### Hacking Ético EN: 1ª tanda — ci-01..05, hw-01, hw-02 (7 videos)

El autor va pasando los audios EN del módulo; con la primera tanda
completa (15 ci + 3 hw-01 + 3 hw-02 = 21 wavs de 50) se arman:

- **`AUDIO_TIMINGS_EN`**: duraciones de ci-01..05 y hw-01/02 (ffprobe).
  Nota: ci-03/04/05 tienen audio EN aunque el ES siga pendiente en
  `AUDIO_PENDING` — las composiciones EN suenan, las ES siguen mudas.
- **7 composiciones `*En.tsx`** con beats re-medidos de la
  transcripción word-level. hw-01/hw-02 reordenan escenas para
  matchear el guion EN (curl pasa de escena 2 a 3, gobuster de 2 a 3).
- **Wavs**: `public/videos/audio-en/<video-id>/` con nombre corto
  (`ci-01-scene1.wav` — el copy inicial volvió a dejar el nombre
  largo; renombrado).
- **Render**: 7 MP4 en `public/videos/en/` · `srcEn` en las 7
  lecciones (path-ciberseguridad, path-hacking-web).
- **CDN** (`311527b`): subidos con purge — ya sirven en la página EN.
- Pendiente de la 2ª tanda: pe-01..05 (20 wavs), hw-03 escena 3,
  hw-04, hw-05.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm lint` limpio ·
`pnpm test:run` → **1956 tests pasando**.

### Reorganización: MP4 ES a `videos/es/` y wavs a `videos/audio-es/`

Para dejar la estructura simétrica por idioma en local y en el CDN:

- **`public/videos/`**: los 59 MP4 ES pasan a `es/` (junto al `en/`
  existente); la carpeta de wavs `audio/` pasa a `audio-es/`
  (el `audio-en/` no cambia).
- **59 composiciones ES**: `staticFile('videos/audio/...')` →
  `videos/audio-es/...` (las `*En.tsx` ya usan `audioBase()`).
- **`audioBase('es')`** → `videos/audio-es` + comentario de
  `AUDIO_PENDING`.
- **13 archivos de lecciones**: `src: '/videos/x.mp4'` →
  `/videos/es/x.mp4` (los `srcEn` siguen apuntando a `/videos/en/`).
- **Tests** (`AcademyVideo.test.tsx`): 31 expectativas actualizadas a
  la ruta nueva. Placeholder del admin builder actualizado.
- **CDN** (`zilabs-videos`, `736ec8a`): los 59 MP4 movidos a
  `videos/es/` con `git mv`; purge de las rutas viejas y nuevas —
  `videos/es/li01-linux-history.mp4` → 200, la raíz → 404.
- **Importante**: el deploy ya publicado seguirá pidiendo
  `/videos/*.mp4` (raíz) hasta el próximo deploy del repo principal —
  después de pushear este cambio, jsDelivr sirve todo desde `es/`.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm lint` limpio ·
`pnpm test:run` → **1956 tests pasando** · render de control ES
(li-01) verificado con la nueva carpeta de audio.

### Redes: 15 videos en inglés (Fundamentos/Redes I/Redes II) con audio EN

Segundo módulo en inglés (sigue a Sistemas Operativos). El autor grabó
los 45 audios EN y se arman las versiones EN de los 15 videos:

- **`AUDIO_TIMINGS_EN`**: duraciones de los 45 wavs EN de redes
  (ffprobe). Los wavs van a `public/videos/audio-en/<video-id>/`
  renombrados al nombre corto que usa cada composición
  (`re-01-scene1.wav`, `re1-01-scene1.wav`... — ojo: primero se
  copiaron con el nombre largo y el render 404-eó; renombrar).
- **15 composiciones `*En.tsx`** (Re01..05, Re1*, Re2*): mismos
  visuales, textos EN, beats re-medidos contra la transcripción
  word-level de los wavs EN.
- **Render**: 15 MP4 en `public/videos/en/` con el nombre que usan las
  lecciones (`re01-network-types.mp4`, `re101-...`, `re201-...`).
- **Lecciones**: `srcEn` agregado en las 15 de
  `path-redes.ts`/`path-protocolos.ts`/`path-protocolos-ii.ts`.
- **CDN**: los 29 MP4 EN (14 sisops + 15 redes) subidos al repo
  `zilabs-videos` (`videos/en/`, commit `38d1303`) con purge de caché —
  la página en inglés ya los resuelve.
- **Verificación**: pixel-check de re01 EN (título, nodos, chips por
  escena) · duraciones de los 15 MP4 contra `AUDIO_TIMINGS_EN` · audio
  aac presente.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm lint` limpio ·
`pnpm test:run` → **1956 tests pasando**.

### Sistemas Operativos: 14 videos en inglés (li/wi/ot) con audio EN

El autor grabó los 49 audios EN (voz del guion inglés) y se arman las
versiones EN de los 14 videos del módulo:

- **`src/video/remotion/audioTimings.ts`**: `AUDIO_TIMINGS_EN` con las
  duraciones de los 49 wavs EN (ffprobe) + helpers `audioTimings(id, lang)`,
  `sceneStartFrames/totalDurationSec/totalDurationFrames(id, fps, lang)` y
  `audioBase(lang)` (`videos/audio-en/`). Los helpers ES quedan con default
  `lang='es'` — las 39 composiciones ES no cambian.
- **14 composiciones `*En.tsx`** (Li01..05, Wi01..05, Ot01..04): mismos
  visuales que las ES, con textos en inglés y beats internos re-medidos
  contra la transcripción word-level (faster-whisper `small` int8) de los
  wavs EN — cada reveal/cápsula/terminal aparece cuando la voz EN lo nombra.
- **Wavs**: `public/videos/audio-en/<video-id>/` (49 archivos, copiados de
  `voicebox-scripts/sistemas-operativos/`).
- **Render**: 14 MP4 en `public/videos/en/` (li01..05, wi01..05,
  ot-01..04 — 3.7-6.3 MB c/u, audio aac, duraciones 70-126s).
- **Lecciones**: paso `video` gana `srcEn?` (`src/types/academy.ts`).
  `AcademyVideo` usa `srcEn` cuando `!isEs` (fallback al `src` ES si falta).
  Agregado en las 14 lecciones de linux/windows/otros (`srcEn` apunta a
  `/videos/en/<nombre>.mp4`).
- **Root.tsx**: 14 composiciones registradas como `<id>-en` con
  `totalDurationFrames(id, FPS, 'en')`.
- **Verificación**: pixel-check de li01 EN (título a t=3, typewriter del
  quote t=7-9, cápsulas GNU a t=20 — sincronizadas con la voz EN) ·
  duraciones de los 14 MP4 contra `AUDIO_TIMINGS_EN` · audio aac presente.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm lint` limpio ·
`pnpm test:run` → **1956 tests pasando**.

Nota: los MP4 EN de Sistemas Operativos ya están en el CDN (junto con
los de redes, commit `38d1303`).

## [Unreleased] - 2026-08-29

### Otros Sistemas (ot-01..04): mismo fix de texto negro en terminales

Los MP4 de ot-01 (macOS/BSD/ChromeOS) y ot-02 (móviles/Raspberry) tenían el
mismo bug que los wi-*: texto de `TerminalWindow` sin `color` heredaba el
negro del navegador (`uname -a`, `Darwin`, `adb shell`, `ls /sdcard/`,
`cat /etc/os-release`...). El fix ya estaba en el primitive
(`TerminalWindow.tsx` impone `color: THEME.text`); se re-renderizaron los 4
videos del módulo y se subieron al repo de videos (`ffe0ef5`) con purge de
caché. ot-03/ot-04 no usan terminales — sus re-renders salieron idénticos.
Verificado por píxeles: texto claro en la terminal de macOS pasó de 24 px
(viejo) a 606 px (nuevo). Nota jsDelivr: el edge de `@main` para ot-02 puede
tardar hasta 12h en rotar; por SHA sirve la versión nueva de inmediato.

### Wi03/04/05: texto negro dentro de las terminales (heredaba color del navegador)

Todo texto de `TerminalWindow` sin `color` explícito (`C:\` y `Default share` del
`net share`, `Info: Establishing...` del evil-winrm, cuentas del `net user`)
heredaba el negro por defecto del navegador sobre el fondo oscuro — ilegible.
Fix en el primitive (`TerminalWindow.tsx`): el contenedor ahora impone
`color: THEME.text`, cubriendo las 43 composiciones que lo usan. Los 3 MP4
re-renderizados y subidos al repo de videos (`f8d8e81`), caché de jsDelivr
purgada. Nota: jsDelivr cachea `@main` 12h por edge (`s-maxage=43200`) —
referirse por SHA (`@<commit>`) entrega la versión nueva de inmediato.

### Wi03/Wi04/Wi05: los videos que ve el usuario venían del CDN, no de public/

El reproductor del Academy (`src/utils/videoUrl.ts`) sirve los MP4 desde
jsDelivr (`pveron1582/zilabs-videos@main`), no desde `public/videos/` — los
re-renders locales no llegaban al usuario. Los 3 MP4 corregidos
(wi03-security, wi04-filesystem, wi05-network-services) se subieron al repo
de videos (commit `ac170f8`), se purgó la caché de jsDelivr y se verificó por
píxeles que el CDN sirve la versión nueva (ON en verde: 221 px en t=12s de
wi03, antes ~0). Además el `▶` del overlay del reproductor
(`AcademyVideo.tsx`) ahora es blanco (`#e5e7eb`) — era negro por defecto.

### Wi03: los "ON" de los perfiles del firewall eran invisibles (texto negro sobre terminal oscura)

En la escena 1 del video de seguridad (`Wi03Security.tsx`), la terminal
`netsh advfirewall` listaba los 3 perfiles con su estado `ON` sin color — el
texto heredaba el negro por defecto del navegador sobre el fondo casi negro
de la `TerminalWindow`. Ahora cada `ON` se pinta en verde (`THEME.green`),
semánticamente correcto para perfiles activos y legible sobre el fondo.
Verificado por píxeles en el re-render: 52 px verdes estables durante toda
la escena (antes 0). MP4 re-renderizado (misma duración, 67.6s).

### Videos de Windows (clases 4 y 5) re-sincronizados con el audio re-grabado + terminales nuevas

El audio de `wi-04-filesystem` y `wi-05-network-services` se re-grabó (wavs del
2026-08-27) y los beats internos de las composiciones quedaron corridos hasta
~3s respecto de la narración nueva. Re-medición con transcripción word-level
(faster-whisper, `small` int8) sobre los 6 wavs y re-render de los 2 MP4:

- **Wi04 Escena 1**: resaltados del árbol re-medidos (Windows 7.6 / Temp 10.5 /
  Program Files 19.9 / inetpub 21.9 / wwwroot 23.7 — antes 7.2/10.6/17.8/18.8/19.8)
  · footer ACL/NTFS a 27.0s (antes 21.9s).
- **Wi04 Escena 2**: cápsulas de cuentas a 12.1/13.5/14.7/15.4s (antes
  10.3-14.8) · "no hay un solo root" a 10.0s · grupos clave a 18.5s · **nueva
  `TerminalWindow`** con `net user` + `net localgroup` (fade a 23.7s) — la
  narración los menciona y no tenían visual.
- **Wi04 Escena 3**: puntos ACL a 1.5/4.9/9.1s · loot re-medido (SAM/registro
  16.8 / Documents+Desktop 20.5 / share SMB 23.4 — antes 22.1/24.3 al final).
- **Wi05 Escena 1**: puntos SMB a 1.7/5.7/14.3/20.5 relativos al panel (antes
  0.1/3.6/11.0/17.1) · terminal `net share` ahora entra con fade a 8.8s de
  escena (cuando la narración nombra los shares admin) y agrega el share
  `publico` que la narración menciona.
- **Wi05 Escena 2**: RDP a 0.8/5.4/8.7/16.0s (antes 2.0/5.5/9.8/17.6).
- **Wi05 Escena 3**: WinRM a 0.7/7.6/11.2s · cierre a 15.3s (sin cambios).
- **Verificación por píxeles**: footer ACL aparece 27→28s, cápsulas crecen
  90→314 entre 47-50s, terminal `net user` visible a 58s (dots 360), loot
  amber aparece a ~78s, terminal `net share` entra 9→9.5s, cierre Wi05 crece
  a 1166 px verdes a los 70s. Duraciones de los MP4 sin cambios (90.6s /
  74.7s, las que declaran las lecciones).

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **1956 tests pasando**.

---

## [Unreleased] - 2026-08-17

### Academy: Redes I estrena "VLANs: segmentación por diseño"

Clase nueva `proto-08` (`src/academy/path-protocolos.ts`, orden 5) —
"VLANs: segmentación por diseño". Cubre: qué es una VLAN (red lógica en
capa 2 sobre los puertos físicos); **segmentación por diseño**
(empleado/servidores/cámaras-iot/invitados con su propio rango IP, orden
en vez de suerte); **eficiencia** (dominios de broadcast más chicos →
menos CPU/ancho de banda desperdiciados); **802.1Q y trunks** (el tag de
4 bytes, puertos access vs trunk, VLANs compartidas entre edificios);
demo `show vlan brief` + `show interfaces trunk`; y **seguridad**:
contención de invasores en la VLAN de invitados, ataques que mueren en el
límite de VLAN (ARP spoofing/MITM de la lección anterior, rogue DHCP,
scanning), puntos de control ruteables, buenas prácticas (cambiar la
VLAN default, native VLAN dedicada, user ports en access, DTP off) y el
**VLAN hopping** (double-tagging / DTP spoofing) como el clásico del
pentester. Quiz: por qué el ARP spoofing del WiFi de invitados no alcanza
a los servidores. Redes I vuelve a 5 lecciones; total de la academia 50
(progreso `5/50` = 10%).

### Academy: Redes I — switch y router se unifican + simulador de cables estilo Packet Tracer

Las lecciones `proto-04` "El switch: el dispositivo de capa 2" y `proto-05`
"El router: el dispositivo de capa 3" se **unifican** en una sola clase de
dispositivos físicos: `proto-07` "Dispositivos esenciales de red: hub,
switch y router" (`src/academy/path-protocolos.ts`, orden 4). Contenido
nuevo/unificado:

- Hub (capa 1, el fósil: repite todo a todos los puertos), switch (capa 2,
  tabla MAC, VLANs, managed/unmanaged, PoE) y router (capa 3, tabla de
  rutas estática/dinámica, NAT/DHCP, puertos WAN/LAN) con su diferencia
  clave.
- **Nueva sección de cableado**: cobre UTP RJ45 (Cat5e/6, ~100 m), fibra
  óptica (SFP, enlaces largos switch→router) y aire: el **access point**
  que irradia WiFi para laptops y celulares.
- `matching` unificado de 5 pares (hub/switch/router/AP/fibra) y
  `interactive-demo` nuevo.

**Simulador nuevo: `NetworkTopologyLab`**
(`src/components/academy/NetworkTopologyLab.tsx`) — mini Packet Tracer:
- Selector de cable (cobre 🟧 / fibra 🟦 / WiFi 📶) **antes** de arrastrar;
  cada conexión valida el tipo elegido y rechaza los incorrectos con
  mensajes pedagógicos ("la PC va con cable de cobre", "el celular no tiene
  puerto: solo WiFi").
- 8 nodos: internet, router, switch, AP, PC, laptop, servidor y celular.
  Cobre para internet→router y switch→AP (PoE), fibra para el servidor,
  WiFi para laptop/celular vía AP. Gana cuando los 4 terminales están
  online; stats "por cable / WiFi / con internet".

Para esto se extendió **`NetworkSimCore`** (motor genérico): nuevo tipo
`SimCableType`, `cableTypes?` + `cableRules?` opcionales en `SimConfig`,
`SimCable.type`, selector de cable en la UI, validación por regla con
mensaje propio, cables coloreados por tipo (cobre ámbar, fibra cyan, WiFi
lila punteado) y línea de drag con el color del cable elegido. Los labs
viejos no usan nada de esto y quedan idénticos.

- Cableo: `demoKind: 'network-topology'` en `types/academy.ts`,
  `LessonContent.tsx` y el StepEditor del LessonBuilder.
- Redes I queda transitoriamente con 4 lecciones (proto-01, proto-06,
  proto-03, proto-07); la clase 5 de VLANs (`proto-08`) llega en el cambio
  siguiente y lleva el total de la academia a **50** lecciones. El progreso
  de `proto-04`/`proto-05` deja de contar; la clase nueva es `proto-07`.
- Tests: conteos 0/5→7 y 0/4→3 (Otros, Protocolos I y Protocolos II);
  total `5/49` = 10%; listao de Redes I verifica la clase unificada y que
  las dos viejas ya no están; el test de matching apunta a `proto-07`
  (8 pasos: narrator + 4 contents + matching + sim + quiz);
  `NetworkSims.test.tsx` suma 4 tests del laboratorio de topologías
  (render + selector, rechazos de cable, victoria completa).

### Academy: VPN pasa antes de la DMZ en Redes II

Al armar el orden pedagógico quedó mejor VPN (4) antes que DMZ (5) —
primero se entiende cómo entrar seguro a la red y después cómo exponer lo
público. El párrafo de segmentación de la clase de VPN ahora adelanta la
DMZ ("guardate la idea: en la lección de DMZ vas a ver la otra cara del
control de exposición"). Orden final de Redes II: DHCP (1) → NAT (2) →
DNS (3) → VPN (4) → DMZ (5).

### Academy: Redes II se reenfoca — nuevas lecciones DHCP, NAT, DNS y VPN (se sacan 3 repetidas)

Las primeras 3 lecciones de Redes II duplicaban contenido de
**Fundamentos de redes** o **Redes I** y se eliminan:
`network-01` "Qué es un puerto y por qué importa" (puertos ya se ven en
Redes I/proto-06), `network-02` "Servicios clásicos" (ya en Redes I/proto-03)
y `network-03` "Tu primera red doméstica" (ya en Fundamentos de redes/redes-03).
El progreso de esas 3 deja de contar.

**Nueva clase 1: DHCP** (`network-06`, orden 1) — "DHCP: el servicio que
reparte las direcciones IP". Cubre: qué es y qué reparte (IP, máscara,
gateway, DNS) con leases; cómo funciona el handshake **DORA**
(Discover/Offer/Request/Acknowledge, UDP 67/68); qué pasa sin DHCP →
**IP estática** y comparación pros/contras (estática estable pero no escala;
DHCP automático pero depende del servicio); quién lo ejecuta (router ISP en
casa; Windows Server con rol DHCP o Linux con `isc-dhcp-server`/`dnsmasq` en
empresas); y el ataque **rogue DHCP** (servidor falso reparte gateway/DNS
maliciosos → MITM sin pelear la tabla ARP; defensa: DHCP snooping).
Terminal-demo con `dhclient -v eth0` + quiz.

**Nueva clase 2: NAT** (`network-07`, orden 2) — "NAT: cómo toda tu red
sale a internet con una sola IP". Cubre: qué es NAT y por qué existe
(rewriting de IPs privadas → pública); la **tabla de traducción**
(conntrack) y por qué NAT solo reacciona al tráfico saliente (bloqueo
implícito de conexiones entrantes); **PAT/masquerading** (un puerto de
salida distinto por equipo sobre la misma IP pública) como solución al
agotamiento de IPv4; demo de `iptables MASQUERADE` + `conntrack -L`;
pros y contras (ahorro de IPs / firewall gratis vs. ruptura del modelo
end-to-end y problemas con FTP/VoIP/P2P); y **DNAT / port forwarding**
(dejar entrar: cada regla DNAT es un agujero en la pared del NAT → puente
con la lección de DMZ). Quiz sobre el bloqueo de conexiones entrantes.

**Nueva clase 3: DNS** (`network-08`, orden 3) — "DNS: cómo busca los
nombres la internet". Cubre: qué hace (nombre → IP, UDP/TCP puerto 53);
la cadena de resolución completa (resolver → root → TLD → autoritativo);
caché y TTL (por qué parece instantáneo y por qué los cambios tardan en
propagarse); demo de `dig` leyendo la ANSWER SECTION y el TTL; tipos de
registro principales (A, AAAA, MX, NS, CNAME, TXT + enumeración DNS como
recon); y ataques (cache poisoning/Kaminsky, DNS hijacking vía rogue DHCP
de la lección 1, exfiltración por consultas al puerto 53; defensas:
DNSSEC, DNS sobre HTTPS/TLS). Quiz sobre el servidor autoritativo.

**Nueva clase 5: VPN** (`network-09`, orden 5) — "VPN: túneles cifrados
que extienden la red". Cubre: qué es (túnel cifrado sobre internet,
virtual + privada); los tres trabajos (confidencialidad, integridad,
autenticidad); extender (site-to-site une sedes) y segmentar (la VPN como
puerta controlada, puente directo con la DMZ); los protocolos (IPsec,
OpenVPN, WireGuard, TLS/SSL VPN); demo de `openvpn` estableciendo el túnel;
y de qué te protege la VPN y de qué no (cifra el camino como HTTPS, no el
destino; credencial comprometida = entrada a la red). Quiz sobre site-to-site.

- Redes II queda con **5 lecciones**: DHCP (`network-06`, orden 1) + NAT
  (`network-07`, orden 2) + DNS (`network-08`, orden 3) + DMZ
  (`network-04`, orden 4) + VPN (`network-09`, orden 5). Total de la
  academia: 49 → **50** lecciones (se sacan 3 repetidas, se agregan 4
  nuevas).
- `paths.ts`: descripción de Redes II actualizada ("DHCP, NAT, DNS, DMZ,
  VPN").
- Tests: conteos 0/5→9 (8 cards + el progreso global "0/50" también matchea
  `/0\/5/`), 0/4→2 y 0/2→1; total 50 (progreso `10%`, `5/50`); listao de
  Redes II verifica las 5 lecciones y que las 3 eliminadas ya no están;
  `FoxyNarrator.test.tsx` apunta a `network-06`; el back-link flat usa
  `network-04`. `NetworkSims.test.tsx` intacto (el simulador `NetworkHomeLab`
  sigue testeado standalone, solo quedó sin lección que lo referencie).

### Academy: "MITM" se mueve de Redes II a Pentesting

La lección "Man-in-the-middle: interceptando tráfico" (`network-05`, era
orden 5 de Redes II) pasa al módulo **Pentesting** como lección 4. Se muda
completa (narrator + 3 contents + terminal-demo de `arpspoof`/`ip_forward`
+ interactive-demo `network-mitm` + quiz) de `path-protocolos-ii.ts` a
`path-hacking.ts`. **Conserva su id `network-05`** para no perder progreso
guardado — mismo criterio que con `proto-02`.

- Redes II queda con 4 lecciones (network-01, network-02, network-03,
  network-04); Pentesting pasa de 3 a 4.
- Total de la academia sigue siendo 49 lecciones.
- `Academy.test.tsx`: conteos 0/5→7 y 0/4→3 (Otros, Protocolos II y
  Hacking); listado de Redes II ahora verifica que MITM ya no aparece
  ahí; el test de Pentesting espera las 4 lecciones.

### Academy: "Protocolos en hacking web" se mueve de Redes I a Pentesting

La lección 6 de Redes I ("Protocolos en hacking web: HTTP, HTTPS y más")
pasa al módulo **Pentesting** como lección 3. Se muda completa (mismos
pasos: narrator + 3 contents + terminal-demo de `curl -I` + quiz de
WebSocket) de `src/academy/path-protocolos.ts` a `src/academy/path-hacking.ts`
con `order: 3`. **Conserva su id `proto-02`** para no perder el progreso
guardado de quien ya la completó — mismo criterio usado con el reorden
anterior de la lección de puertos.

- Redes I queda con 5 lecciones (proto-01, proto-06, proto-03, proto-04,
  proto-05); Pentesting pasa de 2 a 3 (hacking-01, hacking-02, proto-02).
- Total de la academia sigue siendo 49 lecciones.
- Tests (`Academy.test.tsx`): conteos 0/5→8, 0/3→1, 0/2→1; el test de
  listao de Redes I ahora espera 5 títulos y verifica que la lección web
  ya no aparece ahí; test nuevo para el listado de Pentesting con 3.

### Academy: redes I gana una lección de puertos + 5 videos de Fundamentos de redes

**Lección nueva en Redes I** (`src/academy/path-protocolos.ts`): "Puertos:
qué son, cuántos hay y los que tenés que conocer" (`proto-06`, orden 2) —
fundamental para pentesting. Cubre qué es un puerto (socket = IP:puerto),
por qué existen (una IP, muchos servicios), los 65 536 puertos y sus tres
rangos (0–1023 bien conocidos, 1024–49151 registrados, 49152–65535
dinámicos), `terminal-demo` sobre `/etc/services` y tabla de puertos clave
(21/22/23/25/53/80/110/143/443/445/3306/3389/8080). La antigua orden 2
("Protocolos en hacking web: HTTP, HTTPS y más") pasa a orden 6; se
conserva su id `proto-02` para no perder progreso guardado. Total de la
academia: 48 → 49 lecciones (tests de conteo actualizados).

**Videos de Fundamentos de redes** (Remotion, `src/video/remotion/`):
5 composiciones nuevas, una por lección del path `redes`
(`Re01NetworkTypes`, `Re02IpAddresses`, `Re03DevicesTopologies`,
`Re04OsiLayers`, `Re05AddressingDns`) — 3 escenas c/u siguiendo el patrón
existente (TitleScene/RevealLine/KeyCapsule/TerminalWindow + tema oscuro
JetBrains Mono). Se agregaron `steps` de video en `path-redes.ts`
(`/videos/re0N-*.mp4`) con captions ES/EN. Guiones de narración en
`voicebox-scripts/re-*.txt` (15 escenas).

**Flujo pendiente de audio** (`audioTimings.ts`): nuevos helper `hasAudio()`
+ registro `AUDIO_PENDING` — los ids en pendiente omiten el `<Audio>` y se
renderizan mudos. Para completar un video: 1) generar los wavs con Voicebox
a `public/videos/audio/<id>/<id>-sceneN.wav`, 2) reemplazar los timings
estimados con `ffprobe`, 3) sacar el id de `AUDIO_PENDING`, 4)
`pnpm exec remotion render src/video/remotion/index.ts <id>
--output public/videos/<salida>.mp4`. Verificado: `remotion compositions`
lista las 5 (1788–2238 frames).

**Verificación**: tsc 0 · lint 0 errores · `remotion compositions` OK ·
1871 tests verdes · build OK.

### Academy: diseño unificado con el landing page

**Decisión final de diseño**: la estética "expediente táctico"
(`docs/propuesta_diseno_v4.html`) se implementó, se probó y fue descartada.
La Academy ahora usa exactamente el mismo diseño que el landing / páginas
internas: `SiteHeader` + `PageHero` (hero oscuro con dot grid + glow
emerald) + cuerpo claro con cards + `MarketingFooter`. Los tokens salen de
`src/components/landing/constants.ts` (`useColors()`, `FONT_SANS`,
`FONT_MONO`) — sin paletas propias, y con soporte de tema claro/oscuro.

- **Doc de diseño**: `docs/ACADEMY_DESIGN.md` reescrito describiendo el
  diseño del landing (colores, hero, cards, botones, progreso); la
  propuesta expediente queda como histórico descartado.
- **Componentes reescritos** (`src/components/academy/`):
  - `AcademyHome` — PageHero + secciones con cards de módulo (hover con
    borde/sombra emerald, `translateY`, entrada `fadeInEntry` escalonada),
    progreso general con % grande y barra delgada emerald→cyan.
  - `AcademyPath` — PageHero por módulo + filas-card de lección con chip de
    orden, metadata mono y flecha que se desplaza en hover; progreso del
    módulo con conteo `x de y lecciones completadas` + %.
  - `LessonViewer` — hero oscuro compacto (back link, título, paso n/m,
    progreso) + cuerpo claro; botones Anterior/Siguiente con CTA emerald
    en gradiente y sombra glow; dots de paso.
  - `LessonContent` (384→159 líneas) + `lessonSteps.tsx` (nuevo, 240) —
    quiz, matching y ejercicio práctico con tokens del landing;
    terminal-demo con chrome de ventana oscura.
  - `AcademyVideo`, `FoxyNarrator`, `FoxyAssistantBubble`, `LabMiniTerminal` —
    chrome de ventana oscura (slate-900, dots, bordes slate-800) igual a
    los demos del landing.
  - `NetworkSimCore` — marco exterior tipo ventana oscura (el canvas
    interno sigue dark por ser superficie de pantalla).
- **Limpieza**: `academyTheme.tsx` (tokens del expediente) eliminado;
  Special Elite/Courier Prime removidos del link de Google Fonts de
  `index.html`.
- **Verificación**: `tsc` 0, lint 0 errores, build OK, 1871 tests verdes
  (aserciones de `Academy.test.tsx` actualizadas al nuevo diseño).
- Pendientes menores documentados en `QWEN3.8.md` §7
  (fuentes JetBrains sin usar, step `lab-challenge` sin contenido, doc
  `PROYECTO_ACADEMY.md` desactualizado, `NetworkSimCore` > 300 líneas).

## [Unreleased] - 2026-08-16

### Fix: Foxy ya no se reabre al cerrarlo + rebranding CasinoVeo (Lab 07)

**Fix del tour de Foxy** (`useAppContentEffects.ts`): el guard que evitaba
reabrir el tour era un `useRef`, que se reseteaba cuando `AppContent` se
remontaba (el `pushState` de `selectScenario` cambia la location key y
`ScenarioLauncherWrapper` usa `key={location.key}`). Tras el remount, el
effect veía ref limpio + tour cerrado y lo reabría una vez más. El flag
ahora vive en `sessionStorage['foxy-tour-shown']` con el id del escenario
como valor, así sobrevive remounts dentro de la pestaña y se reabre al
cambiar de lab. El test ya limpiaba esa clave — la clave era correcta,
el código la había dejado de usar.

**Rebranding CasinoVeo**: el sitio del Lab 07 ya no tiene temática de casino.
Es una parodia de generador de imágenes y videos con IA en la nube; el chiste
del nombre es "casi no veo" (los renders salen tan difusos que casi no se
ven). Modelo "Casi-No-Veo v2", planes Free/Premium, prompts absurdos. Se
actualizaron `casinoveo.ts` (motor HTTP), `CasinoVeoSite.tsx` (fake site),
`laboratorio07.ts` y todos los tests y docs que referenciaban textos de casino.

### Lab 07 (Burp Suite): sitio "CasinoVeo" + flujo navegador→Burp

- **`src/frameworks/http/casinoveo.ts`** (nuevo): branding de "CasinoVeo" —
  parodia de generador de imágenes con IA (tipo Veo) para el objetivo del Lab 07.
  Expone `isCasinoVeo`, `classifySqli` y el HTML sintético (landing, login, 403,
  error SQL y dashboard). Compartido por el motor HTTP sintético y el fake site
  del navegador para que ambos emitan metadata idéntica.
- **`src/frameworks/http/response.ts`**: usa `classifySqli`/`isCasinoVeo` para
  las respuestas de SQLi; cuando el target es CasinoVeo devuelve las páginas con
  ese branding (el resto de labs mantiene el aspecto genérico).
- **`src/components/fakesites/casinoveo/CasinoVeoSite.tsx`** (nuevo): fake site
  con landing + login vulnerable. El formulario corre por el mismo motor HTTP que
  Burp/curl, por lo que `'` → 500 SQL syntax (SQLi detected) y `' OR '1'='1` →
  dashboard premium (SQLi confirmed), emitiendo `CommandResponse` tipo `http`.
- **`src/components/FakeBrowser.tsx`**: registra la máquina CasinoVeo (detectada
  por id `casino` o cms `CasinoVeo`), navega al site, completa la misión 3 al
  visitar la IP (con discovery_level >= 2) y propaga `checkMissionCompletion`.
  La lógica LFI-to-RCE del escenario 04 se extrajo a `fakebrowser/lfiRce.ts`
  para mantener el componente < 300 líneas.
- **`laboratorio07.ts`**: target renombrado `lab-scenario-07-casinoveo` y misiones
  reestructuradas al flujo profesional: 1-2 discovery/scan, 3 navegar el sitio,
  4-5 SQLi probado en el navegador (detected/confirmed), 6-8 intercept+Repeater
  con Burp (request, UNION → creds MySQL, flag).
- **Tests**: `CasinoVeoSite.test.tsx` (9), branding CasinoVeo en `http.test.ts` (6),
  FakeBrowser (2), happyPath-scenario07 re-escrito al nuevo flujo. Suite completa verde.

## [Unreleased] - 2026-08-16

### Refactors de archivos > 300 líneas + mejora de fidelidad de nmap + Burp Suite simulado

**Rondas 1-3 refactor (>300 → submódulos, 12 archivos):**

- `nmap.ts` (517) → directorio `nmap/` con 9 módulos (index/flags/help/vendors/ports/cidr/outfiles/pingScan/portScan)
- `commands/index.ts` (467) → 127 + `executor.ts`, `shellIntegration.ts`, `suid.ts`
- `fs-linux.ts` (548) → 93 + `fs-etc.ts`, `fs-var.ts`, `fs-wordlists.ts`, `fs-linux-types.ts`
- `FakeBrowser.tsx` (463) → 293 + `fakebrowser/pages.tsx`
- `types.ts` (482) → eliminado; `types/` con `machine.ts`, `mission.ts`, `command.ts`, `academy.ts` + barrel index.ts (imports `../types` preservados)
- `MissionPanel.tsx` (432) → 126 + `missionPanel/{HintButton,StepCarousel,AttackerCredentials}`
- `MachineLoader.tsx` (420) → 147 + `machineLoader/{phases,screens}`
- `EditorModal.tsx` (417) → 320 + `editorModal/{cursor,NanoStatusBar,NanoFooter}`
- `FeedbackModal.tsx` (410) → 193 + `feedbackModal/{captcha,texts,StatusViews,CaptchaSection,FeedbackForm}`
- `LabGrid.tsx` (409) → 198 + `labGrid/{helpers,ScenarioCard,ModalContent}`
- `AdminPanel.tsx` (597) → 294 + `admin/{LoginScreen,AdminHome,DebugPanel,shared}`
- `AppContent.tsx` (486) → 292 + `appContent/{useAppContentEffects,WorkspaceTopBar,WorkspaceOverlays,LandingView}`

**Mejora de fidelidad de nmap (3 correcciones + extra):**

- `-A` ahora implica `-sV` → columna VERSION + detección de servicio automática (`flags.ts`)
- MAC Address siempre visible en misma subred sin `-v` (`portScan.ts`, `pingScan.ts`) — fiel al nmap real
- `Host is up` siempre visible sin `-v` (`portScan.ts`)
- Default `-p` = top ~1000: 1-1024 + puertos altos frecuentes (3306, 3389, 5432, 5900, 6379, 8080, 8443, 9090, 27017, ...) (`ports.ts`)
- `buildHostScriptResults` integrado en `-A`: smb-os-discovery (Windows+445/139), http-server-header/http-title (servicios web) (`scripts.ts` + `portScan.ts`)
- `Service Info: OS:` en `-A` (`portScan.ts`)
- Help actualizado: `-A` ≡ `-sV -O --script=default`, default top-1000 (`help.ts`)
- 8 tests nuevos (46 total en nmap.test.ts)

**Burp Suite simulado (Proxy + Repeater + Target):**

- **`src/frameworks/http/`** (nuevo): motor HTTP sintético compartido. `request.ts` (parseUrl, parseFormData, buildRawRequest/Response), `response.ts` (getVulnerablePage, buildLoginResponse, buildSyntheticResponse). La lógica de SQLi/auth-bypass/UNION-extract se extrajo de curl.ts para reutilizarla en Burp sin duplicar.
- **`src/commands/tools/curl.ts` (298→117)**: refactorizado para usar el motor extraído — mismo comportamiento, mismo output, misma metadata (`foundVulnerability`, `foundCredentials`). Ahora emite `httpRequest`/`httpResponse` en cada response para alimentar el historial de Burp.
- **`src/components/burpsuite/`** (nuevo, 5 archivos): app con 3 tabs
  - **Proxy**: form de "Intercept" (method+URL+body), historial tabla (id/method/URL/status/time), click→Send to Repeater
  - **Repeater**: editor de request (method select, URL, headers textarea, body textarea, Send ▶ / Ctrl+Enter) + panel de response (status code colorizado, headers, body formatting)
  - **Target**: site map de máquinas con `web_enumeration` — lista directorios con status, cada uno con "Intercept →" que preconfigura Proxy
- **Integración**: `activeApp` extendido a `'terminal' | 'browser' | 'burpsuite'`; WorkspaceTopBar gana botón "Burp" (solo en escenarios Web); AppContent renderiza `<BurpSuite>` cuando `activeApp === 'burpsuite'`. Las acciones de Burp propagan `onReportVulnerability` y `onCredentialsFound` al store — LabValidator valida igual que con curl.
- **Tipos** (`src/types/command.ts`): nuevos `HttpRequestData`/`HttpResponseData` + tipo `'http'` en `CommandResponse` (con `foundVulnerability?`/`foundCredentials?`/`foundDirectories?` opcionales). `CmdResponseBase` gana `httpRequest?`/`httpResponse?`.
- **Laboratorio 07** (`src/laboratorios/laboratorio07.ts`, nuevo): "Burp Suite: Web Application Pentesting" — 8 misiones que guían el flujo intercept→Repeater→SQLi bypass→UNION SELECT→flag. Reusa el mismo motor que curl, así que LabValidator valida `vulnerabilityFound`/`foundCredentials` con criterios existentes (sin crear nuevos tipos de criteria). Registrado en `SCENARIOS` y `SCENARIOS_META` → los Labs pasan de 6 a 7.
- **Tests**: 36 nuevos (16 del motor HTTP + 16 del laboratorio07 + 4 ajustes a tests existentes). `credentials-by-machine.test.ts` gana scenario-07 con usuarios `[admin, analyst]`. `LandingPage.test.tsx` actualiza `View all labs (6)` → `(7)`. curl.test.ts (12) intacto, happyPath-scenario06 (13) intacto — el refactor del motor no rompió nada.

**Métricas:** `tsc --noEmit` 0 · `pnpm test:run` → **140 archivos / 1822 tests pasando** (antes 138/1778) · `pnpm build` OK · `pnpm lint` 0 errores / 112 warnings.

---

## [Unreleased] - 2026-08-14

### Sync fino corregido de los 5 videos de Windows (`wi-`) contra los segmentos de habla reales

Re-midiendo `public/videos/audio/wi-*/` con `silencedetect` (-50dB, d=0.12) se detectó que varios
`at`/`delay` de las composiciones quedaban corridos **2–9s** contra lo que el narrador dice en cada
wav (p. ej. EternalBlue en Wi05 estaba en 11.4s y el audio lo menciona a los ~20.2s; el "¿dónde vive
lo jugoso?" de Wi04 a 8.7s y se dice a los ~15.3s). Correcciones por video:

- **Wi01**: timeline re-mapeada a las menciones reales (Microsoft 6.5 / Windows 1.0 7.0 / Windows 95 14.6 / XP 19.2 / kernel NT 24.7, arranque a 6.5s) · privativo: 3.0/4.3/5.3/7.1 · libre: 10.7/11.9 (antes 15.1/17.6) · legacy: 4.2/5.1/5.8 · exploits: 12.2/15.2 · cierre "PUERTA SIN LLAVE": 17.4.
- **Wi02**: card Win10 a 4.0s + puntos 5.4/7.9/9.7/13.1 · chips Server a 17.9/19.2/20.6/25.9 (antes 12.4/14.6/16.9/19.3) · cierre: 13.6.
- **Wi03**: firewall reordenado al orden real del narrador (activado 6.1 → 3 perfiles 7.6 → puerto en LAN 14.4) · Defender 2.1/4.6/7.1 · UAC 12.6/14.9/17.9 · GPO 2.1/6.7 · defensas 11.2/13.2/14.3/15.0/17.1.
- **Wi04**: resaltados del TreeView re-medidos (C:\ 5.3 / Windows 7.2 / System32 8.0 / Temp 10.6 / Users 14.5 / Program Files 17.8 / inetpub 18.8 / wwwroot 19.8) + footer ACL/NTFS con fade a 21.9s · SAM 0.3/2.8/5.1 · cuentas 10.3/11.5/12.4/14.8 · ACL 2.6/5.0/9.2 · sección "lo jugoso" a 15.4s (antes 8.7s) con 16.8/22.1/24.3 · fix del pop del resaltado (`highlightStart` ahora relativo a la Sequence interna).
- **Wi05**: SMB 3.2/6.7/14.1/20.2 · RDP 2.0/5.5/9.8/17.6 · WinRM 2.2/7.8/11.2 · cierre "USUARIO + CONTRASEÑA": 15.3.

Los 5 MP4 re-renderizados con `remotion render` (mismo audio aac real, misma duración total).

**Métricas:** `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-14

### Videos de Windows (`wi-`) re-renderizados con los audios reales del autor + sincronización fina

El autor pasó los 15 audios (`wi-0X-sceneN.wav` en cada carpeta) y los 5 videos pasan de placeholder silencioso con sync estimado a **audio real + sincronizado segmento por segmento**:

- **`src/video/remotion/audioTimings.ts`**: los timings estimados de `wi-*` se reemplazan con las duraciones reales medidas con ffprobe:

  | Video | Antes (est.) | Ahora (real) | Total MP4 |
  |---|---|---|---|
  | wi-01-windows-history | [18, 20, 16] | **[27.52, 23.60, 21.52]** | 74.3s · 3.7 MB |
  | wi-02-current-versions | [18, 22, 16] | **[24.32, 31.76, 17.12]** | 74.8s · 3.8 MB |
  | wi-03-security | [18, 19, 19] | **[21.44, 21.20, 23.36]** | 67.6s · 3.5 MB |
  | wi-04-filesystem | [21, 20, 21] | **[33.44, 28.16, 27.36]** | 90.6s · 4.8 MB |
  | wi-05-network-services | [20, 15, 15] | **[28.96, 21.60, 22.56]** | 74.7s · 3.9 MB |

- **Syncs internos re-alineados** con `silencedetect` fino (-50dB, d=0.12) a los segmentos de habla reales (los estimados quedaban hasta 2-9s corridos):
  - **Wi01**: timeline 1985→kernel NT (4.3s + cápsulas c/2.4s) · privativo vs libre: 'código fuente cerrado' 1.8 / 'no podés leerlo' 3.3 / 'licencia' 5.4 / 'es de Microsoft' 8.9 / 'podés leer cada línea' 15.1 / 'gratis y modificable' 17.6 · legacy: Win7 4.6 / XP 5.2 / Server 2008 7.1 / MS17-010 12.1 / MS08-067 14.9 · cierre "LEGACY = PUERTA SIN LLAVE" 17.1.
  - **Wi02**: card Win10 6.5 + puntos (7.6/11/13/17.1) · chips Win11 (TPM 5.5 / Secure Boot 7.8 / kernel NT 9.3) y Server (AD 12.4 / IIS+DNS 14.6 / SMB 16.9 / Core+WinRM 19.3) · cierre 17.0.
  - **Wi03**: firewall (perfiles 6.5 / por defecto 9.8 / puerto en LAN 15.1) · Defender (1.6/4.5/9.1) y UAC (12.3/14.6/17.5) · GPO (2.8/6.2) + defensas (BitLocker 10.9 / Credential Guard 11.9 / Secure Boot 12.9 / AppLocker 14.0 / Event Logs 16.7).
  - **Wi04**: **TreeView con resaltado por palabra** (`highlight`/`highlighted`) sobre el árbol de C:\ — C:\ 4.5 / Windows 5.2 / System32 7.0 / Temp 10.2 / Users 12.5 / Program Files 14.0 / inetpub 16.5 / wwwroot 17.6 · SAM (1.5/3.0/6.5) + cuentas (9.4/10.2/11.2/12.1) · ACL (2.5/4.5/6.8) y loot (14.2/16.3/18.1).
  - **Wi05**: SMB (puerto 4.3 / shares admin 6.3 / shares custom 9.3 / EternalBlue 11.4) · RDP (3.0/5.4/8.1/10.1) · WinRM (2.1/4.6/8.0) + cierre "USUARIO + CONTRASEÑA = SHELL" 11.1.

- **Render**: los 5 MP4 re-generados con audio aac real + video h264, renombrados a la convención corta (`wi01-…wi05-…`) que usan las lecciones.
- **Verificación por píxeles**: resaltados del árbol de Wi04 crecen con la narración (cyan 189 → 645 → 935 → 1033), reveals de Wi01 crecen 862 → 1010, chips de Wi02 crecen 421 → 974, y el cierre de Wi01 aparece justo al cambiar la narración (ámbar 386 → 1473). Audio del MP4 verificado contra los wavs (33 segmentos de habla en wi-04).

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **138 archivos / 1776 tests pasando**.

---

## [Unreleased] - 2026-08-13

### Landing: ventana de anuncio de la Academy al ingresar

Nueva ventana modal `AcademyAnnouncement` que anuncia la Academy al entrar al landing (`src/components/academy/AcademyAnnouncement.tsx`):

- **Estética de ventana de escritorio del simulador**: barra con puntitos rojo/ámbar/verde, título `zeroinfra · anuncio`, badge `ZILABS`, botón de cierre ✕.
- **Dos columnas**: panel visual izquierdo (slot de imagen) + contenido derecho con badge `✦ NUEVO`, título `🎓 Academy`, descripción, chips de los 6 módulos (Linux/Windows/Redes/Ciberseguridad/Pentesting/Scripting) y CTAs `Ir a la Academy →` / `Ahora no`.
- **Slot de imagen reemplazable**: si existe `public/academy-announcement.png` se muestra; si no, fallback con Foxy + gradiente etiquetado «aquí va tu imagen» (para cuando el autor genere la imagen con otra IA).
- **Comportamiento**: aparece ~1.4s después de entrar (tras el fade-in del hero), se cierra con ✕, backdrop, tecla Escape o «Ahora no». Textos bilingües ES/EN vía `useLanguage`.
- **`LandingPage.tsx`**: `<AcademyAnnouncement />` montado junto a FeedbackModal/DonationModal.
- **Tests**: `AcademyAnnouncement.test.tsx` (8) — delay de aparición, CTA hacia `/en/academy`, módulos, cierres (✕, backdrop, Escape, «Not now») y textos en español.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **138 archivos / 1776 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-13

### Academy: infraestructura completa de los 2 videos de Ciberseguridad (`ci-`)

Videos para las 2 lecciones del path de ciberseguridad, siguiendo el patrón `wi-` (3 escenas, 1280×720, 30fps):

| ID | Composición | Lección | Duración |
|---|---|---|---|
| `ci-01-cia-triad` | `Ci01CiaTriad.tsx` | ciber-01 · Triada CID | 52.6s |
| `ci-02-hashes-cracking` | `Ci02HashesCracking.tsx` | ciber-02 · Hashes y cracking | 47.6s |

- **`voicebox-scripts/ci-0X-scene1..3.txt`** (6 scripts): narraciones en español nivel principiante — triada CID (las 3 patas, ataques reales por pata, cierre pentester) y hashes (hash vs cifrado, algoritmos MD5/SHA1/SHA512/bcrypt/argon2, cracking con john + rockyou).
- **Composiciones**: `Ci01CiaTriad` (3 columnas de la triada con RevealLines, ataques reales ✗, terminal `cat /etc/shadow`) y `Ci02HashesCracking` (terminal `echo | sha512sum`, cápsulas de algoritmos, terminal `john hash.txt --wordlist=rockyou.txt`).
- **`src/video/remotion/audioTimings.ts`**: claves `ci-*` con **timings ESTIMADOS** → se reemplazan con los reales (ffprobe) cuando el autor pase los wavs.
- **`public/videos/audio/ci-0X-*/ci-0X-sceneN.wav`**: carpetas de audio con **wavs placeholder de silencio** de la duración estimada (se reemplazan 1:1 por los reales).
- **`src/academy/path-ciberseguridad.ts`**: las 2 lecciones incorporan el paso `video` como paso 2 (narrator → video → contenido).
- **`AcademyVideo.test.tsx`**: 2 tests nuevos — ciber-01 → `ci01-cia-triad.mp4` y ciber-02 → `ci02-hashes-cracking.mp4` como paso 2.

**Estado:** los 2 MP4 ya están renderizados con los placeholders (silencioso + sync estimado) para que las lecciones queden funcionales. **Pendiente de terminar:** cuando el autor pase los audios reales → medir con ffprobe, actualizar `audioTimings` y `durationSec`, re-sincronizar los reveals internos y re-renderizar.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **137 archivos / 1768 tests pasando** · `pnpm build` OK · QC por píxeles de los 2 MP4 (YAVG/YMAX consistentes con li/pe/wi) · streams video h264 + audio aac.

---

## [Unreleased] - 2026-08-13

### Academy: nuevo path de Scripting para pentesting — Bash, PowerShell y Python (5 clases c/u)

Nuevo path **`scripting`** ("Scripting para pentesting", 💻, naranja `#f97316`) agrupado dentro de **Hacking Ético** en el Home de la Academy, con 3 subsecciones y **15 lecciones nuevas**:

| Subsección | Icono | Lecciones |
|---|---|---|
| **Bash** | 🐚 | bash-01 Qué es bash · bash-02 Bases: variables, argumentos y condicionales · bash-03 Bucles, funciones y filtros de texto · bash-04 Pentesting I: enumeración · bash-05 Pentesting II: automatización y reverse shells |
| **PowerShell** | 🪟 | powershell-01 Qué es PowerShell: objetos, no texto · powershell-02 Bases: variables, arrays y condiciones · powershell-03 Bucles, funciones y cmdlets útiles · powershell-04 Pentesting I: enumeración de Windows · powershell-05 Pentesting II: credenciales, ofuscación y exfiltración |
| **Python** | 🐍 | python-01 Qué es Python: el lenguaje del hacking · python-02 Bases: variables, tipos y condiciones · python-03 Bucles, funciones y librerías · python-04 Pentesting I: redes con socket · python-05 Pentesting II: HTTP con requests |

**Estructura de cada clase:** narrator → content (¿qué es? + bases) → 2× content técnico → terminal-demo con ejemplo real → practical-exercise (sin `labId` — no hay lab Windows; el ejercicio se muestra sin terminal embebida) → quiz que bloquea el avance.

**Archivos nuevos:** `src/academy/bash-lessons.ts`, `powershell-lessons.ts`, `python-lessons.ts`, `path-scripting.ts` (exporta `SCRIPTING_SUBSECTIONS` + `SCRIPTING_LESSONS` flat para callers antiguos). Registrado en `src/types.ts` (`AcademyPathId` gana `'scripting'`), `paths.ts` y `AcademyHome.tsx` (módulos dentro del grupo Hacking Ético, con rutas `/module/{bash,powershell,python}` y back links vía `getSubIdForLesson`).

**Total de la Academy: 31 → 46 lecciones.** Tests actualizados: `Academy.test.tsx` — 8×`0/5 lecs` (antes 5) y 3×`0/2`, progreso global `0/46` y 11% (5 de 46), y 5 tests nuevos del módulo (redirect a bash, las 3 listas de 5 lecciones, back link a módulo).

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **137 archivos / 1766 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-13

### Academy: paths de redes renombrados + infraestructura completa de los 5 videos de Windows (`wi-`)

**Renombre de módulos de redes** (solo nombres visibles; los IDs `protocolos`/`protocolos-ii` se mantienen → el progreso guardado no se pierde):

- `Protocolos y dispositivos` → **Redes I** (`title` EN: *Networking I*)
- `Protocolos y Dispositivos II` → **Redes II** (`title` EN: *Networking II*)
- Afecta: `src/academy/paths.ts`, el selector del `LessonBuilder` (admin) y `Academy.test.tsx`.

**5 videos nuevos de Windows con prefijo `wi-`** (3 escenas cada uno, 1280×720, 30fps, ~52-64s):

| ID | Composición | Lección | Duración |
|---|---|---|---|
| `wi-01-windows-history` | `Wi01WindowsHistory.tsx` | windows-01 · Historia | 55.6s |
| `wi-02-current-versions` | `Wi02CurrentVersions.tsx` | windows-02 · Versiones 10/11/Server | 57.6s |
| `wi-03-security` | `Wi03Security.tsx` | windows-03 · Firewall/Defender/UAC/GPO | 57.6s |
| `wi-04-filesystem` | `Wi04Filesystem.tsx` | windows-04 · Filesystem/usuarios/ACL | 63.6s |
| `wi-05-network-services` | `Wi05NetworkServices.tsx` | windows-05 · SMB/RDP/WinRM | 51.6s |

- **`voicebox-scripts/wi-0X-scene1..3.txt`** (15 scripts): narraciones en español nivel principiante (historia, versiones, seguridad, filesystem, red), listas para generar audios con la voz "Miguel".
- **`src/video/remotion/audioTimings.ts`**: claves `wi-*` con **timings ESTIMADOS** (marcados con comentario) → se reemplazan con los reales (ffprobe) cuando el autor pase los wavs.
- **`public/videos/audio/wi-0X-*/wi-0X-sceneN.wav`**: carpetas de audio con **wavs placeholder de silencio** de la duración estimada (para poder renderizar ya; se reemplazan 1:1 por los reales).
- **`src/academy/windows-lessons.ts`**: cada lección de Windows incorpora el paso `video` como paso 2 (narrator → video → contenido), con `src` `/videos/wi0X-*.mp4`, captions ES/EN y `durationSec` = duración real del placeholder.
- **`AcademyVideo.test.tsx`**: nuevo test — windows-01 incluye `wi01-windows-history.mp4` como paso 2.

**Estado:** los 5 MP4 ya están renderizados con los placeholders (silencioso + sync estimado) para que las lecciones queden funcionales. **Pendiente de terminar:** cuando el autor pase los audios reales → medir con ffprobe, actualizar `audioTimings` y `durationSec`, re-sincronizar los reveals internos y re-renderizar.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **137 archivos / 1761 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-13

### Videos li-02 a li-05: corrección de delays en secuencias anidadas + fix del video de la lección 2

Se encontró y corrigió el patrón de bug transversal: dentro de una `Sequence` anidada (`from={titleEnd}`), `useCurrentFrame()` reinicia a 0, pero los `delay`/`at` de chips y líneas se calculaban como segundos absolutos de la escena → los elementos aparecían tarde o nunca. Se pasaron todos a tiempos relativos al arranque de la secuencia anidada:

- **`Li02ShellAnatomy.tsx` Scene 1**: las 4 cápsulas (usuario/máquina/home/permisos) ahora aparecen a ~1.45s, 2.35s, 3.25s y 4.15s dentro de la secuencia (narración los lista ~5.8-8.5s absolutos).
- **`Li04CreateEdit.tsx` Scene 1**: `ORDER_STEPS.at` de mkdir/touch/nano relativizados (0.7 / 4.5 / 6.7 dentro de la secuencia); **Scene 2**: `PIPELINE.at` de touch (7.0→4.0) y nano (15.0→7.0) re-ubicados según las pausas de la narración (3.9s / 6.7s).
- **`Li05Permissions.tsx` Scene 1**: revelación de caracteres y las líneas "parece ruido"/"escalada de privilegios" relativizadas al arranque de la secuencia (antes se corrían ~1.4s).
- **`Li03CoreCommands.tsx` Scene 1**: delay de las cápsulas con preguntas (¿dónde estoy? pwd / ¿quién soy? id / …) pasados a relativos — era el reporte "ahora no sale" del usuario; el render final muestra las 4 preguntas apareciendo progresivamente (verificado por hashes de frames 5.8→12.4s).

**Corrección de contenido en la Academy** (`src/academy/linux-lessons.ts`):
- **Bug reportado**: la lección `linux-02` ("La terminal: shells, PATH, prompt y flags") reproducía `/videos/li04-create-edit.mp4` (mkdir/touch/nano) por un `src` mal copiado. Reemplazado por `/videos/li02-shell.mp4` con caption/`durationSec` (111s) coherentes.
- `durationSec` de las demás lecciones corregidos a la duración real de los mp4: li01 75 · li03 **65** (era 21) · li04 **71** (era 46) · li05 **110** (era 37).

**Verificación:** re-render de `li02-shell.mp4`, `li03-commands.mp4`, `li04-create-edit.mp4` y `li05-permissions.mp4` (mismas duraciones totales de antes: 111.5 / 65.4 / 71.4 / 109.9s). El audio del mp4 de li-02 se comparó contra los `.wav` de la carpeta: patrones de silencio idénticos → el audio ya era el correcto, el problema era solo la referencia en la lección. `tsc --noEmit` 0 errores y 5/5 tests de `AcademyVideo.test.tsx`.

---

## [Unreleased] - 2026-08-12

### Video pe-02: re-sincronización fina de resaltados y cierre con la narración

Los tiempos de aparición de textos se habían estimado a ojo con silencios gruesos y quedaban corridos respecto al audio. Re-medidos con `silencedetect` fino (-50dB, d=0.08) y alineados por segmento de habla (`src/video/remotion/compositions/Pe02Filesystem.tsx`):

- **Resaltados del árbol Linux** (escena 2): `/` 2.6→**2.7** · `etc` 3.4→**3.5** · `home` 7.5→**7.4** · `root` 10.0 (igual) · `www` 12.3→**12.4** · `log` 14.6→**15.0**.
- **Resaltados del árbol Windows** (escena 3): `C:\` 2.2→**2.4** · `Windows` 3.2→**4.4** (antes aparecía ~1s antes) · `Users` 6.4→**7.3** · `Program Files` 9.6→**9.7** · `inetpub`/`wwwroot` 12.2/12.45 (iguales) · `System32` 14.5→**14.6**.
- **Cierre** (escena 4): `/etc` 2.2→**3.3** · `/home` 4.0→**4.3** · `/var/www` 6.5→**6.4** · `C:\Windows` 10.8→**8.5** (antes ~2.3s tarde) · `C:\Users` 11.8→**9.4** · `C:\inetpub` 12.9→**11.9**.

**Verificación:** re-render `public/videos/pe02-filesystem.mp4` (**4.4 MB**, 2297 frames). Análisis por píxeles frame a frame: cada caja del cierre aparece escalonada en el momento en que el audio pronuncia la ruta (jumps de píxeles en 64.5/65.3/67.3/69.4/70.3/72.8s) y los resaltados de los árboles crecen en sus instantes correspondientes. `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-12

### Video pe-02: cierre rediseñado como panel de resumen con rutas por sistema

La escena 4 del video de filesystems (dos líneas de texto plano) pasa a ser un panel visual:

- **`ClosingScene`** (`src/video/remotion/compositions/Pe02Filesystem.tsx`): título "CUANDO ENTRES A UN SISTEMA, SABÉ DÓNDE MIRAR" + dos columnas con encabezado de color — 🐧 **LINUX** (verde) y 🪟 **WINDOWS** (cian) — cada una con **3 cajas de ruta** (borde + fondo + glow del color del sistema, con pop 0.85→1): Linux `/etc` `/home` `/var/www`, Windows `C:\Windows` `C:\Users` `C:\inetpub`, cada una con su descripción.
- Cada caja **aparece cuando el narrador la menciona** (medido con silencedetect, voz Miguel): `/etc` ~2.2s · `/home` ~4.0s · `/var/www` ~6.5s · `C:\Windows` ~10.8s · `C:\Users` ~11.8s · `C:\inetpub` ~12.9s (relativos al inicio del cierre).
- Pie de cierre: "conocer el mapa de cada sistema es saber dónde va a estar la información".

**Verificación:** re-render `public/videos/pe02-filesystem.mp4` (**4.4 MB**, 2297 frames). Análisis por píxeles del cierre: las cajas verdes crecen con cada ruta de Linux (378 → 578 → 1002 → 1544 px) y las cian con las de Windows (925 → 5074 → 11734 px) en los momentos de la narración. `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-12

### Video pe-02: resaltado por palabra + Linux y Windows en una sola escena continua

Rediseño de la escena central del video de filesystems para seguir la narración:

- **`TreeView`** (`src/video/remotion/primitives/TreeView.tsx`): nuevas props `highlight` / `highlightStart` / `highlighted`. La fila que el narrador menciona se rodea con un **rectángulo redondeado con glow** (pop 0.82→1 al activarse); las palabras ya mencionadas quedan con una **caja sutil persistente** (borde + fondo al 14%).
- **`Pe02Filesystem.tsx`**: las escenas 2 y 3 se fusionan en **una sola escena continua** (`Sequence` único con ambos audios). El árbol de Linux queda en pantalla todo el tiempo (sin oscurecerse ni reiniciar su animación) y el de Windows **crece al lado** con un fade+slide cuando el narrador pasa a explicarlo — se acabó el "corte de escena".
- **Sincronización por palabra** (medida con `silencedetect`, voz Miguel):
  - Linux: `/` ~2.6s · `etc` ~3.4 · `home` ~7.5 · `root` ~10.0 · `www` ~12.3 · `log` ~14.6.
  - Windows: `C:\` ~2.2 · `Windows` ~3.2 · `Users` ~6.4 · `Program Files` ~9.6 · `inetpub` ~12.2 · `wwwroot` ~12.5 · `System32` ~14.5.
- El pie de página cruza de "Un solo árbol desde /" a "Un árbol por disco: C:\\, D:\\..." en la transición.

**Verificación:** re-render `public/videos/pe02-filesystem.mp4` (**4.3 MB**, 2297 frames). Análisis por píxeles: los píxeles verdes del resaltado Linux crecen al narrar cada palabra (686 → 2293), la mitad derecha arranca vacía (0) y el árbol cian de Windows crece a partir de la transición (0 → 2104 → 10367 → 14669 px) — sin reiniciarse ni cortar. `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-12

### Video pe-02 (filesystem) re-renderizado con los audios nuevos del autor

El autor regrabó los 4 audios de `pe-02-filesystem` con narración más clara y extensa. Re-sincronizado y re-renderizado:

- **`src/video/remotion/audioTimings.ts`**: `'pe-02-filesystem'` pasa de [4.48, 14.08, 16.08, 10.24] a las duraciones reales medidas con ffprobe: **[12.08, 23.84, 24.24, 14.48]** (74.6s de audio + gaps ≈ 76.5s total).
- **`src/academy/path-hacking.ts`**: `durationSec` del video de hacking-02 45 → **76**.
- **Render**: `public/videos/pe02-filesystem.mp4` re-generado (**76.6s, 3.7 MB**, 2297 frames) con los 4 wavs nuevos (`pe-02-scene1..4.wav`) sincronizados escena por escena. Verificado por píxeles en los 4 momentos (título t=6s, árbol Linux t=20s, ambos árboles t=45s, cierre t=72s) y streams de video+audio presentes.

**Métricas:** `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-12

### Videos de Pentesting renombrados: prefijo `pe-` (Hacking Ético → Pentesting)

Los videos del path de pentesting pasan de prefijo `he-` a `pe-`, manteniendo la consistencia con la convención por plataforma (`li-` Linux, `pe-` Pentesting, `wi-` Windows futuro). Renombrado 1:1 en composición, ID de Remotion, MP4, carpeta de audio, wavs y scripts — **sin re-render** (el contenido no cambió):

| Antes | Ahora | Composición | MP4 |
|---|---|---|---|
| `he-01-pentest-phases` | `pe-01-pentest-phases` | `Pe01PentestPhases` | `pe01-pentest-phases.mp4` |
| `he-02-filesystem` | `pe-02-filesystem` | `Pe02Filesystem` | `pe02-filesystem.mp4` |

- **`src/video/remotion/compositions/`**: `He01PentestPhases.tsx` → `Pe01PentestPhases.tsx`, `He02Filesystem.tsx` → `Pe02Filesystem.tsx` (componentes, rutas `staticFile` y headers actualizados).
- **`Root.tsx`**: IDs `pe-01-pentest-phases` / `pe-02-filesystem` (imports + registro).
- **`audioTimings.ts`**: claves `'pe-01-pentest-phases'` y `'pe-02-filesystem'` (timings intactos).
- **Assets**: MP4 renombrados, carpetas de audio `pe-01-pentest-phases/` y `pe-02-filesystem/` con wavs renombrados (`pe-0N-sceneM.wav`).
- **Scripts Voicebox**: `he-01-scene1..6.txt` → `pe-01-scene1..6.txt`, `he-02-scene1..4.txt` → `pe-02-scene1..4.txt`.
- **Academy**: `path-hacking.ts` apunta a `/videos/pe01-pentest-phases.mp4` y `/videos/pe02-filesystem.mp4`; `AcademyVideo.test.tsx` actualizado.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **1760 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Video he-01 (5 fases del pentesting) renderizado con los audios reales

- **`audioTimings.ts`**: `'he-01-pentest-phases'` pasa de estimados [16, 20, 21, 18, 22, 22] a las duraciones reales medidas con ffprobe: **[12.56, 15.60, 13.92, 13.60, 16.24, 12.32]** (84.2s + gaps ≈ 86s).
- **`src/academy/path-hacking.ts`**: `durationSec` del video de hacking-01 121 → **86**.
- **Render**: `public/videos/he01-pentest-phases.mp4` (**86.8s, 4.1 MB**, 2603 frames) con los 6 wavs del autor (`he-01-scene1..6.wav`) sincronizados escena por escena.

**Métricas:** `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-12

### Academy: la sección Redes se divide en 3 paths (total de lecciones 21 → 31)

La categoría Redes pasa de 1 path con 5 lecciones a **3 paths** con 15 lecciones: `Fundamentos de redes`, `Protocolos y dispositivos` y `Protocolos y Dispositivos II`. Además, nuevo tipo de paso **`matching`** (emparejar términos con definiciones haciendo clic en pares).

**`src/academy/path-redes.ts` (nuevo) — Fundamentos de redes (5 lecciones):**

- **redes-01 · ¿Qué es una red?** — definición (nodos, medios de conexión) y tipos por tamaño: LAN, MAN, WAN (internet) y PAN; la VPN como túnel cifrado sobre internet. Quiz: la WAN más grande.
- **redes-02 · Cómo se comunican** — concepto de dirección IP (formato, conflicto de IP), públicas vs privadas (rangos 10.x/172.16-31.x/192.168.x) y NAT a nivel concepto. Terminal-demo con `ip addr`.
- **redes-03 · Dispositivos básicos y topologías** — hub (obsoleto), switch y router; topologías bus, estrella, anillo y malla. **Simulador `network-home`**: armá tu propia red en estrella arrastrando cables.
- **redes-04 · Modelo OSI y TCP/IP** — las 7 capas con su trabajo puntual (analogía postal) y el modelo TCP/IP de 4 capas que usa internet de verdad.
- **redes-05 · Direccionamiento** — dirección, máscara y puerta de enlace; clases A/B/C y CIDR; DNS como agenda de internet. Terminal-demo con `resolv.conf` + `ip route`.

**`src/academy/path-protocolos.ts` (nuevo) — Protocolos y dispositivos (5 lecciones):**

- **proto-01 · Protocolos por capa** — qué es un protocolo y dos por capa: Ethernet/ARP (2), IP/ICMP (3), TCP/UDP (4), HTTP/DNS/SSH/SMTP (7). Quiz: ping = ICMP.
- **proto-02 · Protocolos en hacking web** — HTTP (80, texto plano, GET/POST, cookies, SQLi/XSS), HTTPS (443, TLS cifra el canal, no la app) + WebSocket, WebDAV y REST/API; DNS como vía de exfiltración. Terminal-demo con `curl -I`.
- **proto-03 · Servicios de red comunes** — SSH (22), FTP (21), SMB (445, EternalBlue) y VNC (5900, primo de RDP). Terminal-demo con `nmap -sV`.
- **proto-04 · El switch (capa 2)** — tabla MAC, full duplex, velocidades, VLANs, managed/unmanaged, PoE, ejemplos reales. **Ejercicio `matching`**: 5 pares término↔definición.
- **proto-05 · El router (capa 3)** — tabla de rutas, NAT/PAT, DHCP, puertos WAN/LAN, ruteo estático vs dinámico, y la diferencia clave con el switch. **Ejercicio `matching`**: 5 pares.

**`src/academy/path-protocolos-ii.ts` (nuevo) — Protocolos y Dispositivos II:** las 5 lecciones históricas del path Redes (`network-01` puertos, `network-02` servicios, `network-03` red doméstica con simulador, `network-04` DMZ, `network-05` MITM) se mudan acá con sus IDs intactos (el progreso de los usuarios no se pierde). `path-network.ts` eliminado.

**Nuevo tipo de paso `matching` (`src/types.ts`):**

- `{ type: 'matching'; title; instructions; pairs: {left, leftEs, right, rightEs}[] }`.
- **`LessonContent.tsx`**: `MatchingStep` — dos columnas (términos a la izquierda, definiciones **barajadas** a la derecha), clic en un término + su definición → se fijan en verde; par equivocado → flash rojo; banner de éxito al completar y botón reiniciar.
- **`LessonViewer.tsx`/`LessonPreviewLive.tsx`**: el matching **bloquea el avance** hasta resolver todos los pares (igual que el quiz).
- **Builder**: `LessonBuilder`/`StepEditor`/`generateLessonTs` soportan `matching` (editor de pares) y las options de path incluyen los 3 de redes.

**Integración:**

- `src/types.ts`: `AcademyPathId` = `'os' | 'redes' | 'protocolos' | 'protocolos-ii' | 'ciberseguridad' | 'hacking'`.
- `paths.ts`: 6 paths registrados; `AcademyHome.tsx`: la sección Redes muestra las 3 tarjetas (🌐 Fundamentos · 📡 Protocolos · 🖧 Protocolos II).
- Tests `Academy.test.tsx`: total 21 → **31** (0/31, progreso 5/31 = 16%), conteos 0/5 lecs ×5 y 0/2 lecs ×3, tests nuevos de los 3 paths y del matching (bloquea hasta emparejar los 5 pares y luego completa la lección). `FoxyNarrator.test.tsx` apunta a `protocolos-ii/network-01`.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → 137 archivos / **1760 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Fix: variables de entorno en la terminal — `echo $PATH` / `echo $SHELL` ya funcionan

El entorno del terminal arrancaba en `undefined`: `DEFAULT_ENV` (PATH, HOME, USER, SHELL, TERM, EDITOR...) solo existía en los tests y nunca se inicializaba en la app real. Como la expansión de `$VAR` en `executeCommand` depende de `ctx.env`, `echo $PATH` imprimía literalmente `$PATH` y `env` no mostraba nada — rompiendo el ejercicio práctico de linux-02 ("probá `echo $PATH`") y la demo de la lección.

- **`src/hooks/useCommandRunner.ts`**: `env` se inicializa con `DEFAULT_ENV(machine)` (lazy init) en vez de `undefined`; el reset de escenario lo restaura a `DEFAULT_ENV` en vez de `undefined`; y un nuevo effect que **re-deriva las variables por defecto** (PATH/HOME/USER/SHELL...) cuando cambia la máquina activa (`machine.id`, SSH) o el usuario efectivo (`sshUser`, su), preservando los `export` custom del usuario (como `su` en bash real).
- **Tests**: `Terminal.test.tsx` — nuevo test de regresión que tipea `echo $PATH` y `echo $SHELL` en el flujo real del hook y verifica la expansión (`/usr/local/sbin:...` y `/bin/bash`).

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → 137 archivos / **1756 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Academy: subsección Otros SOs pasa de 1 a 2 lecciones (total de lecciones 20 → 21)

**`src/academy/others-lessons.ts`** (nuevo, patrón de `linux-lessons.ts`/`windows-lessons.ts`) — reemplaza la lección única "Android, macOS, BSD: primos de Linux" por dos lecciones completas y bilingües:

- **others-01 · Sistemas de PC y servidores alternativos: macOS, BSD y ChromeOS** — macOS como Unix certificado basado en BSD (`zsh`, `/Users`, `launchd`, capa privativa de Apple: SIP, Gatekeeper), la familia BSD (FreeBSD, OpenBSD la más auditada, NetBSD; pfSense/OPNSense; licencia permisiva), y ChromeOS (kernel Linux + navegador como interfaz; variantes ChromiumOS, ChromeOS Flex y contenedor Linux Crostini). Terminal-demo con `uname -a` de FreeBSD y quiz (¿cuál usa kernel Linux? → ChromeOS).
- **others-02 · Equipos portátiles y de electrónica: Android, iOS y Raspberry Pi** — Android como kernel Linux modificado (`adb shell`, ART, rooting con Magisk/ROMs custom, relevancia para pentesting móvil), iOS como Unix encerrado (sandbox, App Store, jailbreak, exploits caros), y la Raspberry Pi como Linux puro pensado para electrónica (Raspberry Pi OS = Debian, pines GPIO, Pi-hole; en pentesting: caja de ataque Kali, honeypots, gadgets USB). Terminal-demo con `/etc/os-release` de Raspbian y quiz (base de Raspberry Pi OS → Debian Linux).

- **`src/academy/path-os.ts`**: importa `OTHERS_LESSONS` desde el nuevo archivo (subsecciones intactas).
- **Tests** `Academy.test.tsx` actualizados: total de lecciones **20 → 21** (0/21, progreso 25%→24%), conteos de módulos (0/5 ×3 y 0/2 ×3: Otros + Ciberseguridad + Hacking), progreso del path OS (1 de 11 → **1 de 12**, 9%→8%) y un test nuevo del módulo `/module/others` con sus 2 lecciones.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → 137 archivos / **1755 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Academy: 5 lecciones de Windows (la subsección pasa de 1 a 5 lecciones)

**`src/academy/windows-lessons.ts`** (nuevo, patrón de `linux-lessons.ts`) — la subsección Windows del path OS pasa de 1 lección a 5, reemplazando `windows-01` por contenido completo y bilingüe:

- **windows-01 · Historia** — orígenes (Microsoft, Bill Gates/Paul Allen, 1975; Windows 1.0 sobre MS-DOS en 1985; 95/XP/Vista/7/8), el kernel NT como base común, el **modelo privativo** (código cerrado, licencia, imposibilidad de auditar vs Linux) y por qué el Windows viejo (EternalBlue MS17-010, MS08-067) sigue siendo relevante. Quiz: qué es privativo.
- **windows-02 · Versiones actuales** — Windows 10 (soporte hasta 2025, ediciones LTSC), Windows 11 (TPM 2.0 + Secure Boot, mismo kernel NT), Windows Server (Active Directory, IIS, Server Core). Quiz: requisito TPM.
- **windows-03 · Seguridad** — Defender Firewall (3 perfiles), Microsoft Defender Antivirus, **UAC**, **Group Policy (GPO)** + extras pedidos: BitLocker, Windows Hello, Credential Guard, Secure Boot/TPM, AppLocker/WDAC, Sandbox, Event Logs. Quiz: qué hace UAC.
- **windows-04 · Filesystem, usuarios y permisos** — mapa de C:\ (System32, Temp, Users, Program Files, inetpub, NTFS vs FAT32), tipos de cuentas (Administrador, estándar, Guest, **SYSTEM**, cuentas de servicio), SAM, grupos, **ACL NTFS** (full control/modify/read/execute, dueño, herencia, `icacls`) y dónde vive la info jugosa (SAM, Registry, perfiles). Quiz: `icacls`.
- **windows-05 · Servicios de red** — **SMB** (445/139, shares C$/ADMIN$/IPC$, EternalBlue), **RDP** (3389, fuerza bruta y movimiento lateral), **WinRM** (5985/5986, PowerShell Remoting, Evil-WinRM). Quiz: puerto 5985.

Las lecciones de Windows usan narrator → content → terminal-demo (comandos Windows mostrados, el simulador es Linux) → quiz, sin practical-exercise ni video aún — los videos `wi-0N` vendrán cuando el autor los produzca.

- **`src/academy/path-os.ts`**: importa `WINDOWS_LESSONS` desde el nuevo archivo (OTHERS y subsecciones intactas).
- **Tests** `Academy.test.tsx` actualizados: total de lecciones **16 → 20** (0/20, progreso 31%→25%), conteos de módulos (0/5 ×3, 0/1 ×1), progreso del path OS (1 de 7 → **1 de 11**, 14%→9%) y el test del módulo Windows ahora verifica las 5 lecciones; quiz de windows-01 actualizado.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → 137 archivos / **1754 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Video he-02 reescrito + nuevo video he-01 (5 fases del pentesting) para hacking-01

**he-02 (filesystem, hacking-02):** narración reescrita (`voicebox-scripts/he-02-scene1..4.txt`) para principiantes — qué es un mapa de sistema, el árbol único de Linux (etc/home/root/var/www/var/log) y el de Windows por discos (C:\Windows, Users, Program Files, inetpub/wwwroot, System32), con cierre-resumen de dónde mirar. Composición y audio folder intactos; pendiente regrabar el audio y re-renderizar.

**he-01 (nuevo, hacking-01): video de las 5 fases del pentesting**

- **`voicebox-scripts/he-01-scene1..6.txt`** (nuevo): 6 escenas — título (el método, no el caos) + una escena por fase (reconocimiento, escaneo, explotación, post-explotación, reporte) con narración clara y paso a paso.
- **`src/video/remotion/compositions/He01PentestPhases.tsx`** (nuevo): una escena por fase con barra de progreso (FASE n DE 5), número grande + nombre en color de fase, 3 bullets que aparecen línea por línea (efecto `RevealLine`) y un comando representativo por fase (`whois` → `nmap -sV -sC` → `searchsploit` → `sudo su` → `nano informe.md`).
- **`src/video/remotion/primitives/RevealLine.tsx`** (nuevo): primitive compartido para líneas que aparecen con fade + slide sincronizado con la narración (extraído de Li01, que ahora lo importa — mismo output, re-render verificado).
- **`audioTimings.ts`**: `'he-01-pentest-phases'` con duraciones **estimadas** [16, 20, 21, 18, 22, 22] marcadas como pendientes de reemplazar con las reales.
- **`Root.tsx`**: composición registrada como `he-01-pentest-phases`.
- **`src/academy/path-hacking.ts`**: hacking-01 gana el paso `video` (`/videos/he01-pentest-phases.mp4`) después del narrator.
- Carpeta `public/videos/audio/he-01-pentest-phases/` creada para los audios nuevos.

**Pendiente del autor:** grabar los 4 audios de he-02 y los 6 de he-01 (voz Miguel); después se miden duraciones, se sincronizan los beats y se re-renderizan `he02-filesystem.mp4` y `he01-pentest-phases.mp4`.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → 137 archivos / **1754 tests pasando** · `pnpm build` OK · li-01 re-renderizado tras el refactor.

---

## [Unreleased] - 2026-08-12

### Narraciones de li-02..li-05 reescritas: más claras y paso a paso para principiantes

Los guiones de los 4 videos de Linux (terminal, comandos, crear/editar, permisos) eran demasiado abreviados — explicaban cada tema como para alguien que ya lo sabe. Reescritas las 14 escenas (`voicebox-scripts/li-02-scene1..4.txt`, `li-03-scene1..3.txt`, `li-04-scene1..3.txt`, `li-05-scene1..4.txt`) manteniendo el mismo número de escenas y los términos que muestra cada pantalla:

- **li-02 (terminal)**: qué es el prompt y para qué sirve cada símbolo (usuario, máquina, virgulilla=home, `$`=usuario común, `#`=root); anatomía del comando explicando comando → flags → argumento con `nmap -sV -p-`.
- **li-03 (comandos)**: pwd/id/ls/echo explicados con su pregunta base (dónde estoy, quién soy, qué hay, cómo escribo), qué mirar en la salida de `id` (grupo sudo) y el `ls -la`; `.bash_history` como lectura de la mente del usuario.
- **li-04 (crear/editar)**: pipeline mkdir → touch → nano explicado paso a paso (incluye Ctrl+O guardar / Ctrl+X salir) y por qué /tmp es el lugar para trabajar (escritura global) frente a /etc (solo root).
- **li-05 (permisos)**: tipo de archivo, los 3 grupos (dueño/grupo/otros), r/w/x con sus valores 4/2/1 y la suma octal; SUID explicado con el mecanismo completo (corre como el dueño, normalmente root) y su valor en escalada.

**Flujo pendiente:** el autor regraba el audio con estas narraciones (voz Miguel); después se miden las duraciones reales (`ffmpeg silencedetect`), se re-sincronizan los beats internos de cada composición si hace falta y se re-renderizan los 4 MP4. Las composiciones no cambian (el contenido visual sigue siendo válido).

---

## [Unreleased] - 2026-08-12

### li-01-linux-history escena 4: características de Linux/Windows aparecen línea por línea con la narración

Nuevo componente `Line` en `Li01LinuxHistory.tsx` (spring + fade) para que cada ✓/✗ de los paneles comparativos aparezca cuando el narrador la menciona (tiempos medidos con `silencedetect`):

- **Linux** (panel izquierdo): 'código fuente disponible' ~1.4s · 'podés leerlo y estudiarlo' ~2.2s · 'entenderlo por dentro' ~4.8s · 'crear tus propias herramientas' ~8.7s.
- **Windows** (panel derecho, el narrador pasa a Windows ~10.9s): 'código privativo' ~11.0s · 'eso es mucho más difícil' ~12.3s · 'no sabés qué hay adentro' ~13.2s. El orden de las líneas se reordenó para seguir el orden de la narración.
- Antes: las 7 líneas aparecían juntas de golpe al iniciar la escena.

**Verificación:** re-render de `public/videos/li01-linux-history.mp4` (3.8 MB, 2241 frames) + análisis por píxeles con seek preciso: el texto crece escalonado en los momentos exactos (47 → 195 → 252 → 255 → 335 → 393 → 542 px entre 56.5s y 69.5s). `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-12

### Fix de sincronización en li-01-linux-history: los cambios de pantalla siguen a la narración

Los beats internos de las escenas 3 y 4 cambiaban de pantalla antes de que el narrador terminara de explicar. Medidos los silencios reales de los wavs con `ffmpeg silencedetect` (voz Miguel) y realineados los switches al inicio de cada frase:

- **Escena 1**: la ventana con la cita del foro pasa de 6.5s → **6.7s** (la cita arranca en el silencio 6.20-6.66).
- **Escena 2**: el bloque GNU/LINUX pasa de 8.5s → **9.5s** (la frase del kernel termina en el silencio 8.99-9.49).
- **Escena 3**: el beat "miles de ojos" pasa de 10s → **15.6s** (la frase final arranca ~15.7s). Además, cada cápsula de las 4 libertades aparece cuando el narrador la nombra: 0→2.8s, 1→6.7s, 2→9.4s, 3→11.7s (`FREEDOM_AT`).
- **Escena 4**: el cierre "CON LINUX, NO HAY SECRETOS" pasa de 9.5s → **14.6s** (arranca ~14.7s) — los paneles comparativos quedan mientras explica Linux y Windows.

**Verificación:** re-render de `public/videos/li01-linux-history.mp4` (3.8 MB, 2241 frames) + análisis de píxeles en los 4 momentos clave: a los 49s las 4 cápsulas siguen en pantalla (4 colores), a los 53s ya está "miles de ojos" (solo verde), a los 67s los paneles verde/rojo siguen, a los 72s el cierre (verde, sin rojo). `tsc --noEmit` 0 errores.

---

## [Unreleased] - 2026-08-12

### Videos renombrados a la convención por plataforma: `li-` (Linux) y `he-` (Hacking Ético)

Nueva convención de naming de videos pensando en el contenido futuro de Windows (`wi-`). Los 5 videos de Linux pasan de prefijo `os-` a `li-`; el video de filesystems (en hacking-02) pasa a `he-02`. Renombrado 1:1 en composición, ID de Remotion, MP4, carpeta de audio, wavs y scripts — sin re-render (el contenido no cambió):

| Antes | Ahora | Composición | MP4 |
|---|---|---|---|
| `os-01-linux-history` | `li-01-linux-history` | `Li01LinuxHistory` | `li01-linux-history.mp4` |
| `os-02-shell-anatomy` | `li-02-shell-anatomy` | `Li02ShellAnatomy` | `li02-shell.mp4` |
| `os-03-core-commands` | `li-03-core-commands` | `Li03CoreCommands` | `li03-commands.mp4` |
| `os-04-create-edit` | `li-04-create-edit` | `Li04CreateEdit` | `li04-create-edit.mp4` |
| `os-05-permissions` | `li-05-permissions` | `Li05Permissions` | `li05-permissions.mp4` |
| `os-06-filesystem` | `he-02-filesystem` | `He02Filesystem` | `he02-filesystem.mp4` |

- **`src/video/remotion/`**: 6 composiciones renombradas (componentes + rutas `staticFile` + headers), `Root.tsx` con IDs nuevos, `audioTimings.ts` con claves nuevas (timings intactos).
- **Assets**: MP4 renombrados, carpetas de audio `li-01-linux-history/` … `he-02-filesystem/` con wavs renombrados (`li-0N-sceneM.wav` / `he-02-sceneM.wav`).
- **Scripts voicebox**: `os-0N-sceneM.txt` → `li-0N-sceneM.txt`, `os-06-sceneM.txt` → `he-02-sceneM.txt` (recreados los del filesystem, que un `mv` previo había pisado).
- **Academy**: `linux-lessons.ts` (5 srcs `/videos/li0N-*.mp4`), `path-hacking.ts` (`/videos/he02-filesystem.mp4`), `AcademyVideo.test.tsx` y comentario en `types.ts` actualizados.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → 137 archivos / **1754 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Video de historia de Linux (os-01-linux-history) construido y renderizado + Academy renombrada

**Nuevo video `os-01-linux-history` (~75s, 2241 frames, 3.8 MB):**

- **`src/video/remotion/compositions/Os01LinuxHistory.tsx`** (nuevo) — 4 escenas que siguen la narración: (1) 1991 · Linus Torvalds y el post en el foro (título + `TerminalWindow` con `Typewriter` de la cita real), (2) kernel (memoria/procesos/drivers) + proyecto GNU = `GNU/LINUX` (KeyCapsules shell/comandos/compiladores), (3) las 4 libertades (4 KeyCapsules 0-3 + "miles de ojos revisando el código"), (4) Linux abierto vs Windows cerrado + cierre "CON LINUX, NO HAY SECRETOS".
- **`audioTimings.ts`**: `'os-01-linux-history': [15.28, 20.40, 19.20, 17.92]` (duraciones reales medidas con ffprobe).
- **`Root.tsx`**: composición registrada como `os-01-linux-history`.
- **`linux-lessons.ts`**: `durationSec` del video de linux-01 40 → 75.
- **Audios**: `public/videos/audio/os-01-linux-history/` con los 4 wavs del autor renombrados a `os-01-linux-history-sceneN.wav` (estaban como `os-06-sceneN.wav`).
- **Fix**: los scripts `voicebox-scripts/os-01-linux-history-scene1..4.txt` habían quedado con la narración del filesystem (el `mv` de la tanda anterior pisó los de historia) — restaurados con la narración correcta.
- **Render**: `public/videos/os01-linux-history.mp4` (streams video + audio, verificado por píxeles: paleta completa en las 4 escenas).

**Academy renombrada:**

- **Grupo** `Pentesting y Ciberseguridad` → **`Hacking Ético`** (`AcademyHome.tsx`, header de la sección que agrupa los paths ciberseguridad + hacking).
- **Path** `Hacking Ético` → **`Pentesting`** (`paths.ts` title/titleEs, `LessonBuilder.tsx` option, comentario de `path-hacking.ts`).
- **Test** `Academy.test.tsx` actualizado (heading 'Hacking Ético' + tarjeta 'Pentesting').

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → 137 archivos / **1754 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Videos renumerados: filesystem os-01 → os-06, historia de Linux pasa a ser os-01

Reorganización de la numeración de videos tras mover el filesystem a Hacking Ético. El video de historia de Linux (en preparación, con audio grabado por el autor) toma el número **os-01** porque es el primer video del path Linux; el video de filesystems (ahora en hacking-02) pasa a **os-06**. Todo consistente entre composición, MP4, audio y scripts:

- **Composición**: `src/video/remotion/compositions/Os01Filesystem.tsx` → `Os06Filesystem.tsx` (componente renombrado, rutas `staticFile` → `videos/audio/os-06-filesystem/os-06-sceneN.wav`).
- **`Root.tsx`**: ID `os-01-filesystem` → `os-06-filesystem` (import + registro).
- **`audioTimings.ts`**: clave `'os-01-filesystem'` → `'os-06-filesystem'` (timings intactos: 4.48/14.08/16.08/10.24).
- **Assets**: `public/videos/os01-filesystem.mp4` → `os06-filesystem.mp4`; carpeta `audio/os-01-filesystem/` → `audio/os-06-filesystem/` con los wavs renombrados a `os-06-sceneN.wav`.
- **Scripts Voicebox**: `voicebox-scripts/os-01-scene1..4.txt` → `os-06-scene1..4.txt` (filesystem). La narración del video nuevo pasa de `os-06-scene1..4.txt` a `os-01-linux-history-scene1..4.txt`.
- **Academy**: `linux-lessons.ts` apunta a `/videos/os01-linux-history.mp4` (nuevo, en preparación); `path-hacking.ts` apunta a `/videos/os06-filesystem.mp4`. Test `AcademyVideo.test.tsx` actualizado (ambas src + nombre del test).
- **Carpeta libre**: `public/videos/audio/os-01-linux-history/` creada vacía — el autor dejará ahí los 4 audios nuevos (`os-01-linux-history-scene1..4.wav`).

---

## [Unreleased] - 2026-08-12

### Academy: video de filesystems movido a Hacking Ético + nueva lección "dónde está la info" + video de historia de Linux en preparación

- **`src/academy/linux-lessons.ts`**: el video de linux-01 pasa de `/videos/os01-filesystem.mp4` a `/videos/os06-linux-history.mp4` (nuevo, en preparación) con caption actualizado. El video de filesystems ya no pertenecía a la lección de historia.
- **`src/academy/path-hacking.ts`**: eliminada `hacking-02` ("Tu primera práctica: reconocimiento con el lab", con paso `lab-challenge` que mandaba al simulador completo). Nueva `hacking-02` — **"Dónde está la información en cada sistema"** — con el video `os01-filesystem.mp4` movido aquí, contenido de dónde vive la info en Linux (/etc/passwd, /etc/shadow, /var/log, .bash_history, /var/www, /tmp) y Windows (SAM, Event Logs, C:\Users, C:\inetpub), terminal-demo (`cat /etc/passwd | grep bash`) y quiz. Sin `labRef` (no manda al simulador).
- **Narración del nuevo video de Linux (`voicebox-scripts/os-06-scene1..4.txt`)**: 4 escenas estilo Voicebox (voz Miguel) — (1) nacimiento 1991 / Linus Torvalds, (2) kernel + GNU/Linux, (3) las 4 libertades, (4) por qué es el SO del hacking (código fuente disponible vs Windows cerrado). El audio lo genera el autor; la composición Remotion `os-06-linux-history` se construirá con las duraciones reales del audio.
- **Tests**: `AcademyVideo.test.tsx` actualizado (linux-01 apunta a os06) + test nuevo de hacking-02 con el video os01. Total de lecciones intacto: 16.

**Métricas:** `tsc --noEmit` 0 errores · tests de Academy pasando · `pnpm build` OK.

---

## [Unreleased] - 2026-08-12

### Videos Academy: polish post-revisión — fuente bundleada en todas las composiciones + íconos en el árbol + fixes

Continuación del feedback de revisión de las 5 composiciones Remotion. `tsc --noEmit` 0 errores · `pnpm test:run` → **137 archivos / 1753 tests pasando** · renders de verificación con `remotion still` OK.

- **`src/video/remotion/fonts.ts` → `fonts.tsx`** — fix de compilación: el archivo contenía JSX (`<style>`) con extensión `.ts`, que TypeScript no parsea (TS1005 en línea 27). Renombrado a `.tsx`; los imports (`from '../fonts'`) resuelven igual.
- **Os04 y Os05 refactorizados a primitives compartidos**: ahora usan `THEME`/`MONO` de `theme.ts` (colores duplicados hardcodeados eliminados), renderizan `<FontFace />` (antes **no cargaban la fuente JetBrains Mono bundleada** — seguían dependiendo de Cascadia/Fira/Consolas instalados en la máquina de render, el riesgo que señalaba la revisión) y usan `TitleScene` para los títulos de apertura.
- **`TreeView` con íconos por directorio**: nuevo campo opcional `icon?: string` en `TreeItem`; Os01 usa íconos semánticos — Linux: 🌱 `/` · ⚙️ etc · 🔑 passwd · 👤 home · 👑 root · 🗃️ var · 🌐 www · 📋 log · ⏳ tmp; Windows: 💽 `C:\` · 🪟 Windows · ⚙️ System32 · 👤 Users · 📦 Program Files · 🌐 inetpub.
- **Os05**: eliminado el shorthand raro `margin: '24 auto 0'` → `marginLeft/Right: 'auto'` + `marginTop` explícitos.
- **Fixes de `noUnusedLocals` pre-existentes**: `interpolate` sin usar en Os01 e `useCurrentFrame`/`frame` sin usar en Os02.
- **Verificación visual**: `remotion still` de os-01 (frame 300, árbol Linux con íconos) y os-05 (frame 350, breakdown rwx) renderizaron PNG 1280×720 sin errores; análisis de píxeles confirma la paleta esperada (verde/cian del árbol e íconos, 4 colores del breakdown).
- **Re-render de los 5 MP4** (`public/videos/os01..os05.mp4`): regenerados con el código nuevo (2.4 / 2.0 / 1.2 / 1.2 / 1.8 MB, con streams de video + audio). Frame extraído de `os01-filesystem.mp4` confirma el árbol con emojis a color (1400 píxeles coloridos — sin cajas tofu).

---

## [Unreleased] - 2026-08-12

### Academy: NetworkSimCore genérico + 2 simuladores nuevos (DMZ y MITM)

**`src/components/academy/NetworkSimCore.tsx`** (nuevo) — motor genérico de simulador de red, config-driven:
canvas con drag&drop de cables, nodos con estado (`internet` / `lan` / `blocked` / `none`), toggles ON/OFF
(firewall, ARP spoof), animación de paquetes (coords reales vía ResizeObserver), zonas (DMZ/LAN como paneles),
leyenda, stats, banners de éxito/advertencia y reset.

- **Refactor:** `NetworkHomeLab.tsx` ahora es un wrapper fino sobre el core (misma topología y comportamiento).
  Fix latente: las coordenadas de drag fallan a la posición del nodo cuando no son finitas (jsdom), evitando
  CSS inválido `calc(NaN% + ...)`.
- **`NetworkDMZLab.tsx`** (nuevo) — topología DMZ con zonas visibles (DMZ pública + LAN privada), firewall
  como chokepoint, badges `⚡ público` vs `🛡️ protegido`.
- **`NetworkMitmLab.tsx`** (nuevo) — ataque Man-in-the-Middle con ARP spoof: toggle en el atacante,
  la víctima pasa a `⚠️ vía atacante` / `interceptada` cuando el spoof está activo y el atacante está en la LAN.
- **Puertos por peer:** `port(node, peer)` permite que un nodo salga por bordes distintos según con quién conecta.

**Lecciones nuevas en `src/academy/path-network.ts` (path de Redes: 3 → 5):**
- **`network-04`** — «DMZ: separando lo público de lo privado» con simulador DMZ + demo `iptables` NAT.
- **`network-05`** — «Man-in-the-middle: interceptando tráfico» con simulador MITM + demo `arpspoof`/`ip_forward`.

**Integración:**
- `src/types.ts`: `demoKind` = `'network-home' | 'network-dmz' | 'network-mitm'`.
- `LessonContent.tsx`: map de los 3 simuladores.
- `LessonBuilder`/`StepEditor`: selector de simulador (3 opciones) para pasos `interactive-demo`.
- `src/components/__tests__/NetworkSims.test.tsx` (nuevo): 9 tests (ruteo de cables, refuerzos ilegales,
  estados, condiciones de victoria y advertencias de los 3 simuladores).
- Tests de Academy actualizados por el cambio 14 → 16 lecciones.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **137 archivos / 1751 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-10

### Academy: videos con Remotion en las 5 lecciones Linux

**Infraestructura Remotion (video como código):**

- **`src/video/remotion/index.ts`** — entry point.
- **`src/video/remotion/Root.tsx`** — registro de 5 composiciones (una por lección Linux).
- **`remotion.config.ts`** — output JPEG, overwrite on.
- Render: `pnpm exec remotion render src/video/remotion/index.ts <id> public/videos/<nombre>.mp4`.

**5 composiciones nuevas (todas 1280×720, 30fps, ~20s):**

| ID | Lección | Contenido |
|---|---|---|
| `os-01-filesystem` | Linux vs Windows | comparación lado a lado del árbol de directorios |
| `os-02-shell-anatomy` | La terminal | prompt descompuesto (user@host:~$) + anatomía de un comando con flags |
| `os-03-core-commands` | pwd/id/ls/echo | 4 bloques animados de comandos esenciales |
| `os-04-create-edit` | touch/mkdir/nano | pipeline "carpeta → archivo → editor", dónde se puede escribir (/tmp vs /etc) |
| `os-05-permissions` | permisos/SUID | lectura de `-rwsr-xr-x`, octal, SUID = escalada |

**Estructura:**

- **`src/types.ts`**: nuevo tipo `LessonStep` = `'video'` (`src`, `durationSec`, `caption` ES/EN).
- **`src/components/academy/AcademyVideo.tsx`** (nuevo): player embebido con estética del sitio (borde cyan, header ventana, caption footer bilingüe).
- **`LessonContent.tsx`**: caso `video` → `VideoStep` → `AcademyVideo`.
- **`src/academy/linux-lessons.ts`**: cada una de las 5 lecciones lleva su video como step después del narrator.

**Salida:** `public/videos/os01..05.mp4` (1.0-1.3 MB por video), servidos como assets estáticos por Vercel bajo `/videos/`.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **136 archivos / 1737 tests pasando** · `pnpm build` · total de videos: 5, ~5.4 MB.

---

## [Unreleased] - 2026-08-09

### Academy: restructura de contenido con subsecciones + Foxy flotante en ejercicios

**Path OS dividido en subsecciones con sidebar:**

- **`src/types.ts`**: nuevo tipo `AcademySubSection`; `AcademyPath` gana `subSections?: AcademySubSection[]` (compatible con flat `lessons`).
- **`src/academy/linux-lessons.ts`** (nuevo): 5 lecciones Linux completas — historia/software libre · terminal/PATH/prompt · comandos base (pwd/echo/id/ls) · crear/editar (touch/mkdir/nano) · permisos (rwx/octal/SUID/sticky). Cada una con narrator → content → terminal-demo → practical-exercise → quiz.
- **`src/academy/path-os.ts`** reescrito: subsecciones Linux/Windows/Otros. WINDOWS_LESSONS (1 lección) y OTHERS_LESSONS (1 lección: Android, macOS, BSD) separados.
- **`src/academy/paths.ts`**: expone `subSections` en el path OS.
- **`AcademyPath.tsx`**: sidebar con subsecciones, click filtra lecciones; barra de progreso global del path permanece arriba.

**Cambio de flujo en practical-exercise (UI):**

- **`LessonContent.tsx`**: `PracticalExerciseStep` muestra banner + `<LabMiniTerminal>` inline + `<FoxyAssistantBubble>` flotante (reintroducida).
- Banner ya no tiene el hint — solo la consigna y aviso "Foxy está abajo a la derecha".
- **`LabMiniTerminal`** queda inline (sin overlay), con altura fija 320px.

**Métricas:** `tsc --noEmit` 0 errores · `pnpm test:run` → **134 archivos / 1733 tests pasando** · `pnpm build` OK.

---

## [Unreleased] - 2026-08-08

### Academy: sección educativa con lecciones guiadas (Fases A–D) + Admin Panel hub + Lab Builder UI

Nueva sección `/es/academy` con 4 bases de contenido y 9 lecciones bilingües, asistida por Foxy (la mascota) en dos formas: narrator de contexto y burbuja flotante en ejercicios prácticos con terminal embebida del lab.

**Admin Panel:**

- **`src/components/AdminPanel.tsx`** rediseñado: hub con 4 tarjetas (Sandbox/Debug · Lab Builder · Asistente Foxy · Analíticas). Sandbox conserva el workspace + debug panel; el resto queda con badge "Próximamente" salvo Builder que abre el Lab Builder. Login `admin`/`admin` actualizado a mensaje de error bilingüe correcto. Ruta `/es/zildeb`.
- **`src/components/admin/LabBuilder*.tsx`** (4 archivos nuevos): wizard de 5 pasos (Básico → Máquina → Piezas → Misiones → Revisar) con preview JSON copiable. Solo UI — la generación del Scenario y el share vienen en una fase posterior.

**Academy — infraestructura:**

- **`src/types.ts`**: `AcademyPathId`, `AcademyPath`, `LessonStep` (5 tipos: content / terminal-demo / quiz / practical-exercise / foxy-narrator), `Lesson`.
- **`src/academy/`**: 4 paths (os, network, ciberseguridad, hacking) con 9 lecciones semilla ES/EN, mapeadas a labs existentes vía `labRef`/`labId`.
- **`src/store/slices/academySlice.ts`**: progreso (`completedLessons`) + analytics de quizzes (`quizResults` con `firstTryCorrect`). Ambos persistidos en `localStorage` vía `partialize`/`merge`.
- **`src/App.tsx`**: 3 rutas nuevas (`/academy`, `/academy/:pathId`, `/academy/:pathId/:lessonId`).
- **`SiteHeader.tsx`**: link "Academy" en nav (desktop y mobile).

**Academy — componentes UI (`src/components/academy/`):**

- `AcademyHome.tsx`: progreso global + grid de paths ordenado por menor avance
- `AcademyPath.tsx`: lista de lecciones + barra de progreso por path (con %)
- `LessonViewer.tsx`: stepper con navegación y auto-cierre de la terminal embebida al cambiar de paso
- `LessonContent.tsx`: renderer de los 5 tipos de step
- `FoxyAssistantBubble.tsx`: Foxy flotante con consigna + pista expandible (estética ≈ FoxyTour sin spotlight)
- `FoxyNarrator.tsx`: Foxy inline con mensajes rotativos ("Siguiente tip →")
- `LabMiniTerminal.tsx`: modal con `<Terminal>` standalone cargando el scenario del ejercicio (760×480, comandos reales). Cierra con X roja, click fuera o cambio de paso.

**Contenido y tono:**

- Lecciones con recorrido `narrator → content → terminal-demo → practical-exercise → quiz`.
- Tono latino neutro (sin "che", "mirá", "hacé"). Foxy habla directo pero no robótico.
- Quizzes bloquean el avance hasta acertar. Los `practical-exercise` no bloquean — son invitación.
- Terminal-demo con inline code (`backticks` resaltados) y llamadas explicativas.

**Fix de IDs**: `labRef`/`labId` usaban `laboratorio-XX`; corregido a `scenario-XX` (el ID real del Scenario).

**Métricas:** `tsc --noEmit` 0 errores · `pnpm build` OK · `pnpm test:run` → **133 archivos / 1734 tests pasando** (29 nuevos: 13 Academy + 5 FoxyNarrator + 4 FoxyAssistantBubble + 4 LabMiniTerminal + 3 quiz tracking en academyStore).

---

## [Unreleased] - 2026-08-06

### Auditoría de arquitectura completa — MEJORAS_KIMI.md

Sesión de refactorización mayor basada en la auditoría de arquitectura. 9 mejoras aplicadas:

- **4.1** `useCommandRunner` descompuesto: 776 → **384 líneas** (orquestador delgado). 9 hooks especializados extraídos.
- **4.2** MSF state como campo explícito `msfStateUpdate` en `CommandResponse` (antes: parsing de strings frágil con prefijo `MSF_STATE:`).
- **4.3** Tipos de sesión unificados (`FtpSessionData`/`SshSessionData` compartidos entre comandos y store).
- **4.4** Eliminado validator `custom` (confuso, siempre retornaba false). Reemplazado por `browserAction` explícito con campos `url`/`action`.
- **4.5** Identity stack movido al store Zustand (`identitySlice`). Antes: React state local en hook. Ahora: accesible desde cualquier componente.
- **4.6** Estado de sesiones unificado en store. Eliminada duplicación entre `useFtpSession`/`useSshSession` (React state) y componentes que leían del store.
- **4.7** Auto-registro de comandos. Eliminadas 72 entradas manuales del `COMMANDS` Map. Ahora se auto-construye iterando barrel exports (`import * as builtin from './builtin'`).
- **3.7** `AGENTS.md` actualizado: MSF state ya no dice "_msfState module variable", describe el store Zustand actual.
- **8.2** Fix SUID sin try/finally: `ctx.machine.privesc_completed` ahora se restaura en `finally` block. Antes: si el comando lanzaba excepción, quedaba corrupto en `true`.

**Métricas finales:** `tsc` 0 errores | `test:run` **1680/1680** ✅ | Build OK

---

## [Unreleased] - 2026-08-04

### Lab 5: eliminada la flag de usuario de `/home/john` (solo valida la de `/root`)

John tenía una flag en su carpeta home (`/home/john/flag1.txt` con `ZIL{FTP_ANON_ACCESS}`) que al leerla con `cat`/`nano` emitía `fileRead.isFlag: true` y completaba prematuramente la misión "Capture Root Flag" — siendo que la única flag que debe validar esa misión es `/root/flag2.txt`. Se elimina para evitar confusión: solo queda la flag de root tras la escalada. `tsc --noEmit` 0 errores, `pnpm test:run` → **128 archivos / 1681 tests pasando**.

- **`src/laboratorios/laboratorio05.ts`**: eliminado `createFile('/home/john/flag1.txt', scenario05Data.flags.user)` del template y el `flag1.txt` del `targetMachine.files` (dato redundante que no llegaba al escenario).
- **Tests**: `laboratorio05.test.ts` ahora verifica que `flag1.txt` NO exista en `targetMachine.files`; `commands-scenario05.test.ts` quita el `user.txt` con contenido de flag del fixture.

## [Unreleased] - 2026-08-03

### Autocompletado de `msfconsole`

`msfconsole` no aparecía en el autocompletado del sistema: `AVAILABLE_COMMAND_NAMES` (`src/commands/index.ts`) lo excluía con un filtro pensado para el REPL, pero eso solo impedía autocompletar el comando para ARRANCARLO (`msf` + Tab no sugería `msfconsole`). Dentro del REPL el autocompletado ya usa `autocompleteMsf` (msfState activo). `tsc --noEmit` 0 errores, `pnpm test:run` → **128 archivos / 1681 tests pasando**.

- **`src/commands/index.ts`**: se elimina el `.filter(name => name !== 'msfconsole')` de `AVAILABLE_COMMAND_NAMES` — ahora `msf` + Tab → `msfconsole`.
- **Tests**: `autocomplete.test.ts` (msfconsole incluido; dentro de msf usa comandos MSF y autocompleta módulos tras `use`) y `useKeyboardShortcuts.test.ts` (Tab con `msfState` activo completa `use`; Tab con `msf` completa `msfconsole`).

### Lectura de flags/notas con `nano` también valida las misiones

Antes, solo `cat` emitía la metadata `fileRead` y completaba las misiones de tipo flag/nota/payload. Ahora **abrir el archivo con `nano` también las valida** (y los futuros editores como vim/vi podrán hacer lo mismo). `tsc --noEmit` 0 errores, `pnpm test:run` → **128 archivos / 1677 tests pasando**.

- **Nuevo helper compartido `src/utils/fileRead.ts`**: `buildFileReadMetadata(machine, allMachines, resolved)` centraliza la detección de tipo de archivo (`isFlag`/`isNote`/`isPayload`), la detección de usuarios mencionados (`possibleUsers`) y el mapeo de máquina (atacante → víctima).
- **`src/commands/builtin/cat.ts`**: refactorizado para usar el helper (comportamiento idéntico).
- **`src/commands/builtin/nano.ts`**: al abrir un archivo existente emite `fileRead` (+ `possibleUsers`) — resolviendo symlinks como `cat` — así leer una flag/nota/payload con nano valida la misión. El camino `sudo nano` (elevado) también lo emite (lab 5: `sudo nano /root/flag2.txt`).
- **`src/types.ts`**: `fileRead?` y `possibleUsers?` pasan a `CmdResponseBase` (antes solo vivían en la variante `type: 'fileRead'`) para que cualquier herramienta los emita.
- **Cubre lab 5 nota FTP**: `nano nota.txt` descargada del FTP → `fileRead.isNote` + `possibleUsers` (usuario `john`) → completa la misión "Read FTP Note" y muestra el usuario en EnumerationPanel.
- **Tests**: `nano.test.ts` nuevo (6 tests: flag valida misión, nota + possibleUsers, payload, sin fileRead en archivo nuevo/sin args) y `sudo.test.ts` (`sudo nano` de una flag 0600 emite fileRead).

### `su` con autoridad de root + `sudo -l` de root + `sudo nano` elevado

Semántica Unix real para `su`/`sudo`, con el fix del tipeo de password de fondo. `tsc --noEmit` 0 errores, `pnpm test:run` → **127 archivos / 1670 tests pasando**.

**Fix: password de `su` tipeada carácter a carácter (`src/components/Terminal.tsx`):**
- `TerminalInput` forzaba `value=''` cuando `hideValue` estaba activo, así React descartaba los caracteres previos y solo sobrevivía la última tecla → `su: Authentication failure` aunque la password fuera correcta. Ahora usa `type={hideValue ? 'password' : 'text'}` con `value={value}`.
- Test de regresión en `src/components/__tests__/Terminal.test.tsx` que simula el flujo real kali → `su root` → password `zilabs` tipeada char a char.

**`su` con autoridad de root (`src/commands/builtin/su.ts`):**
- **root → usuario de menor privilegio** (`su kali`): NO pide password — root tiene autoridad. Nuevo campo `suUserApplied` en `CommandResponse` (`src/types.ts`); el CommandRunner aplica `setSuUser` + `pushIdentity` al instante (`src/hooks/useCommandRunner.ts`) y el prompt cambia sin pasar por el prompt de password.
- **no-root → root** (`su root` desde kali): pide la password de ROOT y la valida contra `known_passwords` (kali: `zilabs`; todos los labs Linux tienen `root` en `known_passwords`).
- Tests: `su.test.ts` (root → developer sin password; no-root → sigue pidiendo) y `useCommandRunner.test.ts` (caso `suUserApplied`).

**`sudo -l` de root (`src/commands/builtin/sudo.ts`):**
- Antes mostraba `root@kali# -l` (nada). Ahora root también consulta sus privilegios: `User root may run the following commands on kali:` + `(ALL : ALL) ALL`, con metadata `sudoPrivileges`.

**`sudo nano` elevado — emular al usuario destino (`sudo.ts` + `nano.ts`):**
- `sudo nano/vi/vim <archivo>` abre el editor **como root**: puede abrir y modificar archivos restringidos que el usuario solo puede leer (p.ej. `/etc/passwd` 0644) o que ni siquiera puede leer (`/root/secret.txt` 0600). `sudo vim -c "!bash"` sigue siendo la escalada de shell (se detecta antes).
- Nuevos campos: `elevatedEdit` en `CommandContext` y `elevated` en `nanoFile` (`src/types.ts`). `nano.ts` usa `ROOT_USER` (nueva constante en `src/utils/users.ts`) para los checks de permisos; `handleNanoSave` (`src/hooks/useCommandRunner.ts`) guarda con identidad root cuando `nanoFile.elevated` está marcado, conservando el ownership.
- Tests: `sudo.test.ts` (root `sudo -l`, `sudo nano` sobre archivo restringido / no legible / no permitido) y `useCommandRunner.test.ts` (save de `/etc/hosts` rechazado sin elevated y permitido con elevated).

## [Unreleased] - 2026-08-02

### Coverage de `src` + modularización de `help.ts` y `App.tsx`

Subió el coverage global de `src` (estaba bajo en varios archivos) y se modularizaron los dos archivos más grandes del proyecto. `tsc --noEmit` 0 errores, `pnpm test:run` → **125 archivos / 1622 tests pasando**.

**Coverage global mejorado:**

| Métrica | Antes | Después |
|---------|-------|---------|
| Statements | 81.04% | **82.63%** |
| Branches | 69.4% | **71.26%** |
| Functions | 78.26% | **80.84%** |
| Lines | 83.06% | **84.75%** |

- **`AdminPanel.tsx`**: 0% → **94.11% statements**. Nuevo `src/components/__tests__/AdminPanel.test.tsx` (9 tests): login correcto/incorrecto (es/en), cambio de escenario, toggle del panel de debug, pestañas Store/Machines/Missions, abrir/cerrar el mapa de red, navegación al inicio. Mocks de `DesktopTerminal`, `MissionPanel` y `NetworkMap` con `vi.mock`.
- **Tests flaky de FoxyTour (fix):** los 3 tests interactivos (`Ver red`, `Chrome` unit, `Chrome` en AppContent real) fallaban de forma intermitente bajo carga del suite completo (timers reales: interval 200ms + setTimeout 350ms excedían el `waitFor` default de 1000ms). Cambios:
  - `src/components/tour/FoxyTour.tsx`: intervalo de auto-avance 200ms → 150ms y delay de avance 350ms → 250ms (más margen dentro de los timeouts de los tests).
  - `src/components/__tests__/FoxyTour.test.tsx` y `FoxyTour-app.test.tsx`: `waitFor` con `{ timeout: 5000 }` en todos los pasos interactivos y `testTimeout` 20000 en los tests largos de Chrome y Ver red.

**Modularización de `help.ts` (814 → 105 líneas):**
- Las 47 descripciones de comandos (`COMMAND_HELP`) se extrajeron a `src/commands/help/` — un archivo por comando (`su.ts`, `echo.ts`, `nmap.ts`, …), cada uno exporta `help_<cmd>`. íaz`src/commands/help/index.ts` las re-exporta como `COMMAND_HELP`.
- `src/commands/builtin/help.ts` ahora solo importa `COMMAND_HELP` de `../help` y contiene la lógica `execute()` (lista de comandos + lookup).

**Modularización de `App.tsx` (712 → 28 líneas):**
- `src/components/AppContent.tsx` (nuevo, 533 líneas): `AppContent` (workspace completo: terminal, browser, mission panel, network map, overlays), `ThemeSync` y `RootRedirect`.
- `src/components/ScenarioLauncher.tsx` (nuevo, 105 líneas): `ScenarioLauncher` (loader → workspace → LabGrid), `ScenarioLauncherWrapper` (force remount por navegación) y `TestLab`.
- `src/App.tsx` queda solo con el `BrowserRouter` + `Routes` (router puro).
- `src/components/__tests__/FoxyTour-app.test.tsx`: `import { AppContent }` pasa de `'../../App'` a `'../AppContent'`.

## [Unreleased] - 2026-08-02

### Fixes del escritorio (límites de ventanas, z-index de iconos, reloj) + tour de Foxy + manual PDF en inglés

Cuatro tandas de cambios sobre el escritorio, el tour y la documentación. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **125 archivos / 1631 tests pasando** (1626 previos + 5 nuevos).

**Ventanas atrapadas detrás de la barra de tareas (fix):**
- **`src/hooks/useDesktopWindows.ts`**: nuevo helper `clampToDesktop` que acota la posición de cada ventana al área del escritorio — `y` nunca menor que `0` (tope con la barra superior) y siempre quedan ≥80px de la ventana visibles en los 4 bordes para poder volver a agarrarla. Se aplica en `startDrag` y `startResize` (incluye las esquinas superiores `n`/`nw`/`ne`, que podían empujar la ventana bajo la barra). Antes, una ventana arrastrada por encima de la taskbar quedaba tapada por ella (la barra tiene `z-40` vs ventanas `zIndex ≥ 1`) y no se podía volver a mover.
- **Tests**: `src/hooks/__tests__/useDesktopWindows.test.ts` — 4 tests nuevos (movimiento libre dentro de límites, `y` clavado en 0 al arrastrar hacia arriba, 80px visibles al arrastrar hacia la izquierda, resize `n` con tope en 0).

**Iconos del escritorio siempre debajo de las ventanas (fix):**
- **`src/components/DesktopTerminal.tsx`**: el contenedor de iconos pasa de `z-10` a `z-0` — antes pintaba por encima de las ventanas (que usan `zIndex` inline ≥ 1); ahora cualquier ventana (abierta, arrastrada o maximizada) queda por encima de los iconos.
- **Test**: `src/components/__tests__/DesktopTerminal.test.tsx` — verifica `z-0` en los iconos y `zIndex > 0` en la ventana de terminal.

**Reloj de la barra de tareas a la derecha (fix/mejora):**
- **`src/components/DesktopTopBar.tsx`**: el reloj deja de estar centrado (`absolute left-1/2`) y pasa al contenedor derecho de la taskbar, **justo antes del botón de apagado**, mostrando solo **hora y minutos** (`HH:MM`, sin segundos) con `tabular-nums` para que los dígitos no bailen.
- **`src/components/AppContent.tsx`**: el chip de `network_range` ya no se alinea con el centro del reloj (que se movió) — ahora se centra en la barra superior (`bar.clientWidth / 2`); estado renombrado `clockCenter` → `barCenter`.
- **Tests**: `src/components/__tests__/DesktopTopBar.test.tsx` — formato sin segundos + el reloj es el hermano inmediato anterior del botón de apagado.

**Tour de Foxy: burbuja centrada en el inicio y a la derecha en la enumeración (fix):**
- **`src/components/tour/FoxyTour.tsx`**: sin objetivo, la burbuja queda **verticalmente centrada** (`(innerHeight - 200) / 2` en vez de `innerHeight / 2 + 40`, que la dejaba ~140px baja). Nueva propiedad `align: 'right'` en `TourStep`: con ella la burbuja va a la derecha (`innerWidth - width - 48`, margen de 48px) y centrada en altura.
- **`src/components/tour/tourSteps.ts`**: nuevo campo `align?: 'right'`; el paso `network-map-enum` lo usa porque el panel de enumeración **no existe al inicio del lab** (solo se renderiza si hay una máquina con `discovery_level > 0`), así que la burbuja igual apunta a la derecha, donde estaría el panel.
- **Tests**: `src/components/__tests__/FoxyTour.test.tsx` — 2 tests nuevos (burbuja centrada en el paso inicial; burbuja a la derecha en el paso de enumeración saltando con los dots).

**Manual PDF del simulador en inglés (feature):**
- **`manual_zilabs_en.md` (nuevo)**: traducción al inglés del manual (misma estructura que `manual_zilabs.md`).
- **`scripts/generate_manual_pdf.py` (nuevo)**: generador markdown → PDF con reportlab (fuentes DejaVu para Unicode ↑↓→, estilos acordes a la app: títulos esmeralda, código en caja gris, nota en caja ámbar). Soporta `es|en` — `python3 -m venv .venv && .venv/bin/pip install reportlab && .venv/bin/python scripts/generate_manual_pdf.py en`.
- **`public/docs/manual-en.pdf` (nuevo)**: PDF A4 (3 páginas) generado desde `manual_zilabs_en.md`.
- **`src/components/PdfReader.tsx`**: carga `/docs/manual-en.pdf` y muestra `manual-en.pdf` en la barra del lector cuando `isEs` es false; en español sigue con `/docs/manual.pdf`.
- **`src/hooks/useDesktopWindows.ts`**: el título de la ventana del manual en inglés pasa a `User Manual - manual-en.pdf`.
- **Tests**: `src/components/__tests__/PdfReader.test.tsx` (verifica `src` `/docs/manual-en.pdf` + nombre) y `src/hooks/__tests__/useDesktopWindows.test.ts` (título EN del manual).

## [Unreleased] - 2026-08-02

### Ventanas en cascada + paso interactivo "Ver red" en el tour

Las ventanas del escritorio se ordenan en cascada y la guía de Foxy explica la topología y la enumeración automática. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **121 archivos / 1586 tests pasando** (1585 previos + 1 nuevo).

**Ventanas en cascada:**
- **`src/hooks/useDesktopWindows.ts`**: cada tipo de ventana se abre ahora en **cascada prolija** — `CASCADE_STEP = 30`, `CASCADE_MAX = 6` y `cascadeOffset(prev.length)` = `(prev.length % 6) * 30`. Cada tipo tiene su posición base propia: terminal `(90, 60)`, Chrome/browser `(240, 60)`, selector de fondos `(150, 90)`, manual/guide `(390, 60)`. Al abrir ventanas del mismo tipo se desplazan 30px por esquina (se repite cada 6) sin pisarse.

**Paso interactivo "Ver red" en el tour:**
- **`src/components/NetworkMap.tsx`**: nuevos selectores `data-tour` — `network-map` (raíz del modal), `network-map-close` (botón ✕), `network-map-topology` (panel de topología), `network-map-enum` (panel de enumeración).
- **`src/components/tour/tourSteps.ts`**: el paso único `network-map` se reemplaza por 4 pasos — `network-map-btn` (interactivo, pide **hacer clic en "Ver red"** y avanza cuando aparece el mapa, `waitFor`), `network-map-topology` (explica que las PCs de la topología revelan nueva información a medida que avanza el reconocimiento: arp-scan, nmap, gobuster...), `network-map-enum` (explica que credenciales, puertos y servicios se agregan automáticamente y que el botón **"Ver red" se ilumina** cuando hay una novedad) y `network-map-close` (interactivo con `waitForHidden`, pide cerrar la topología con la X y avanza cuando desaparece).
- **Soporte `waitForHidden`**: nueva propiedad opcional `waitForHidden?: string` en `TourStep` — el paso interactivo avanza cuando el selector **desaparece** del DOM (para pasos que se cierran). `FoxyTour.tsx` lo maneja: `shouldAdvance = waitFor ? !!el : waitForHidden ? !el : false`.
- **Test**: `src/components/__tests__/FoxyTour.test.tsx` — nuevo test "el paso Ver red pide hacer clic, avanza al abrirse la topología y al cerrarla" (crea `[data-tour="network-map"]`, verifica el auto-avance al aparecer y al desaparecer; timeout del loop subido a 20000ms). Los pasos `network-map-topology` y `network-map-enum` reutilizan el botón "Ver red" ya iluminado (`hasNewNetworkInfo` + `animate-pulse` en `MissionPanel.tsx`), que el store activa automáticamente vía `createEnumerationSnapshot`/`hasEnumerationChanged`.

## [Unreleased] - 2026-08-01

### Guía interactiva con Foxy (tour con spotlight) + correcciones menores

Nuevo onboarding guiado con un zorro animado que presenta el laboratorio paso a paso. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **121 archivos / 1585 tests pasando** (1566 previos + 19 nuevos).

**Tour interactivo "Foxy":**
- **`src/components/tour/FoxyFox.tsx` (nuevo)**: zorro mascota en SVG puro (sin assets externos) con animaciones CSS (parpadeo de ojos + "respiración").
- **`src/components/tour/tourSteps.ts` (nuevo)**: 9 pasos con selector objetivo, textos ES/EN, y soporte de pasos interactivos (`waitFor`).
- **`src/components/tour/FoxyTour.tsx` (nuevo)**: overlay a pantalla completa que **oscurece todo excepto el elemento enfocado** (spotlight con `box-shadow: 0 0 0 9999px`), burbuja de diálogo con Foxy, navegación (Siguiente/Atrás/Saltar/dots) y animación de "¡Hacé clic!" en pasos interactivos.
- **Secuencia**: presentación → iconos del escritorio → icono de terminal (el tour **pide hacer clic** y avanza automáticamente cuando se abre la ventana) → ventana de terminal → botón de ajustes (idem al abrir el panel) → panel de ajustes → icono de fondos (idem al abrir el selector) → selector de fondos → icono de Chrome (solo en escenarios Web, idem al abrir el navegador) → navegador → icono del manual (idem al abrir la guía) → manual de uso → panel de misiones → topología de red → menú Aplicaciones → cierre.
- **Saltar pasos inexistentes**: `getTourSteps()` (exportado desde `tourSteps.ts`) filtra en tiempo de render los pasos marcados con `skipIfMissing` (p. ej. el icono de Chrome) cuando su `data-tour` no está en el DOM — en escenarios no-Web el paso del navegador y su ventana se omiten sin romper la secuencia. `FoxyTour` usa esta lista filtrada para los dots, el auto-avance y la navegación. *Fix de bug*: la lista se calculaba con `useMemo(..., [])` en el primer render (cuando `open=false` y el DOM del escritorio aún no estaba committeado), por lo que **Chrome nunca aparecía** — ahora se recalcula con `useMemo(..., [open])`, que se ejecuta con el escritorio ya montado. Test de regresión en `FoxyTour-app.test.tsx` (recorre la secuencia real en un escenario Web y verifica que el paso `desktop-icon-browser` está presente).
- **Botón de salir en la burbuja**: la burbuja de Foxy ahora tiene un botón `✕` (aria-label "Salir de la guía") en su esquina superior derecha para cerrar el tour en cualquier paso, además del botón "Saltar" del overlay.
- **Icono de Foxy en el escritorio**: nuevo acceso directo `desktop-icon-foxy` (etiqueta "Guía", `data-tour="desktop-icon-foxy"`) en `DesktopTerminal.tsx` que re-lanza el tour con un clic, igual que la opción "Guía con Foxy" del menú Aplicaciones.
- **El tour arranca siempre del principio**: `FoxyTour` resetea `stepIndex` a 0 cuando `open` pasa de `false` a `true` (antes persistía el paso del cierre y al reabrir mostraba el último paso como terminado). Aplica tanto al icono del escritorio como a la opción del menú. Test de regresión en `FoxyTour.test.tsx`.
- **Cierre con pista para repetir**: el paso "Menú Aplicaciones" ahora menciona la opción "Guía con Foxy", y el paso final ("¡Eso es todo!") indica que se puede repetir el recorrido desde el icono de Foxy del escritorio o desde el menú Aplicaciones.
- **`src/store/slices/uiSlice.ts` + `src/store/types.ts`**: nuevos estados `foxyTourOpen`, `openFoxyTour`, `closeFoxyTour`.
- **`src/App.tsx`**: auto-apertura del tour **cada vez que se entra al workspace** (el effect abre Foxy al montar con `view === 'workspace'`, sin flag de sesión); renderizado solo en modo desktop (`uiMode === 'desktop'`). *Fix de bug*: la versión inicial usaba `sessionStorage` + un ref de transición (`wasWorkspaceRef`) que se inicializaba en `true` porque `ScenarioLauncher` monta `AppContent` ya en `view === 'workspace'` — el tour nunca aparecía. Ahora abre en el montaje directo.
- **`src/test/setup.ts`**: mock de `ResizeObserver` convertido a clase (`new ResizeObserver(...)` fallaba con "is not a constructor" en tests que montan `AppContent`).
- **Selectores `data-tour`**: `terminal-window`/`guide-window`/`wallpaper-window`/`browser-window` en `WindowFrame.tsx`; `settings-btn`/`settings-panel` en la ventana de terminal; `desktop-icons` + `desktop-icon-terminal`/`desktop-icon-wallpaper`/`desktop-icon-browser`/`desktop-icon-guide` en el escritorio (`DesktopTerminal.tsx`); `mission-panel` y `network-map-btn` en `MissionPanel.tsx`; `apps-btn` en `DesktopTopBar.tsx`.
- **Menú Aplicaciones**: nuevo ítem "Guía con Foxy" (re-lanza el tour manualmente). Cableado `App → DesktopTerminal → DesktopTopBar` vía prop `onOpenTour` (agregado a `CommandRunnerProps`).
- **Ventanas cerradas al entrar**: `useDesktopWindows.ts` arranca con lista vacía (`useState([])`) — ya no se abren terminal ni manual por defecto al entrar al lab; se abren desde los iconos del escritorio o el menú Aplicaciones. El tour los abre uno por uno.
- **Test**: `src/components/__tests__/FoxyTour.test.tsx` (12 tests: render ES/EN, navegación, pasos interactivos con `waitFor`, paso de Chrome condicional, cierre con Saltar y con ✕, reinicio al reabrir) + `src/components/__tests__/FoxyTour-app.test.tsx` (3 tests de integración: monta `AppContent` real en workspace, verifica que Foxy aparece, que no se reabre al cerrarlo y que el paso de Chrome existe en escenario Web) + `src/hooks/__tests__/useDesktopWindows.test.ts` reescrito (39 tests, helper `openDefaultWindows`) + `src/components/__tests__/DesktopTerminal.test.tsx` reescrito (10 tests: iconos del escritorio incluido el de Foxy, sin ventanas por defecto).
- **Fix burbuja desbordada**: ancho aumentado a 400px (responsive, `min(400, viewport-24)`) y fila de controles con `flex-wrap` — el botón "Siguiente" ya no queda fuera del cuadro.
- **Fix paso interactivo bloqueado**: el overlay raíz ahora es `pointer-events-none` (solo `burbuja` y `Saltar` capturan clics) — antes interceptaba todos los clics y el usuario no podía hacer clic en el botón de ajustes en el paso 3, por lo que nunca aparecía `settings-panel` y no avanzaba.
- **Fix bucle de auto-avance**: el paso interactivo solo avanza si el elemento `waitFor` aparece **después** de entrar al paso (`alreadyPresent` guard) — evita que al volver atrás con el panel ya abierto re-avance solo.
- **Fix paso interactivo obligatorio**: en pasos con `interactive: true` el botón **"Siguiente" queda deshabilitado** (gris, con texto "Hacé clic") — el usuario debe hacer clic sí o sí en el objetivo (botón de ajustes) para que aparezca el panel y el tour avance solo.
- **Fix burbuja fuera de pantalla**: el posicionamiento ahora decide entre **4 lados** (abajo → arriba → derecha → izquierda) según el espacio disponible. Para el panel de ajustes (que se abre `absolute top-9 right-2` dentro de la ventana del terminal, al borde derecho) Foxy se coloca a la **izquierda** del panel en vez de abajo, donde antes quedaba fuera del viewport. Añadida flecha lateral para colocaciones derecha/izquierda.
- **Fix reapertura al cerrar**: el effect de `App.tsx` re-abría el tour inmediatamente tras cerrarlo (al pulsar "¡A trabajar!"), porque `foxyTourOpen` volvía a `false` con `view` todavía en `'workspace'`. Ahora usa un `useRef` (`tourShownRef`) que abre el tour una sola vez por montaje de `AppContent` — al cerrarlo no se reabre, pero al volver a entrar a un lab (remontaje por `key={location.key}`) vuelve a mostrarse. Test de regresión en `FoxyTour-app.test.tsx`.
- **Fix reloj/IP de la barra**: el reloj/cronómetro de `DesktopTopBar.tsx` ahora se centra con posicionamiento absoluto (`left-1/2 -translate-x-1/2`, `pointer-events-none`) en lugar de depender del flujo del lado izquierdo — ya no se mueve al abrir o cerrar ventanas.

## [Unreleased] - 2026-08-01

### Correcciones de parser/shell + manual PDF en el escritorio + redimensión por bordes

Correcciones de comportamiento tipo Linux y nueva app de escritorio. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **119 archivos / 1566 tests pasando** (1549 previos + 17 nuevos).

**Correcciones de shell y laboratorios:**
- **`src/commands/builtin/cat.ts`**: el flag ahora se detecta también por **contenido** (`/(?:ZIL|THM|FLAG)\{[^}]+\}/`), no solo por nombre de archivo. Esto permite que `cat /root/database_dump.sql` (lab 06, paso 8) marque `fileRead.isFlag: true` y complete la misión, ya que el dump descargado se llama `database_dump.sql` y no contiene "flag" en el nombre.
- **`src/utils/shellParse.ts`**: `splitArgs` reimplementado con máquina de estados tipo bash — las comillas (simples o dobles) como **delimitador** agrupan y se eliminan (`echo 'hola'` → `hola`), pero las simples **dentro** de comillas dobles son literales (payloads SQL `-d "username=' OR '1'='1&password=x"` intactos).
- **`src/commands/index.ts`**: los comandos ahora son **case-sensitive** como en Linux (`LS` → `Command not found: LS`); se eliminó el `.toLowerCase()` del dispatch.
- **Bug de sesiones "stuck"**: `resetWorkspace` (`src/store/scenarioStore.ts`) y `selectScenario` (`src/store/slices/scenarioSlice.ts`) ahora llaman `shellManager.reset()`. Antes, salir del lab sin tipear `quit` dejaba la sesión FTP/SSH viva en el singleton y el siguiente `ftp <ip>` respondía `?Invalid command` sin poder re-loguear. Test de regresión `ftp-shell-reset.test.ts`.

**Manual PDF en el escritorio (app "ZeroPDF"):**
- **`manual_zilabs.md` (nuevo)**: guía breve del simulador (bienvenida + escritorio, terminal, browser, misiones, topología/enumeración, wallpapers).
- **`public/docs/manual.pdf`**: PDF real de 3 páginas A4 generado desde el `.md` (script + LibreOffice). Reemplazable.
- **`src/components/PdfReader.tsx` (nuevo)**: lector PDF estilo app inventada "ZeroPDF" (barra con `manual.pdf`, zoom decorativo, footer "Página 1 de 1") que embebe el PDF en un iframe que llena toda la ventana (al maximizar, el documento se escala al ancho completo).
- **`src/hooks/useDesktopWindows.ts`**: nuevo tipo de ventana `'guide'` con **auto-apertura** al cargar el escritorio (ventana del manual junto a la terminal, en todos los labs por ahora); `addGuide`, `guideWindows`.
- **`src/components/DesktopTerminal.tsx`**: icono **Manual** en el escritorio + render de la ventana `guide`.
- **`src/components/DesktopTopBar.tsx`**: entrada "Ver Manual de uso" en el menú Aplicaciones + botón "Manual" en la taskbar (minimizar/restaurar/traer al frente).
- **`src/components/WindowFrame.tsx`**: icono 📄 en la barra de título de las ventanas `guide`.

**Redimensión por bordes:**
- **`src/components/WindowFrame.tsx`**: además de las 4 esquinas, ahora hay handles en los **4 bordes** (superior `n`, inferior `s`, izquierdo `w`, derecho `e`) para redimensionar terminales, Chrome, Manual y fondos.
- **`src/hooks/useDesktopWindows.ts`**: `startResize` ampliado a direcciones `n`/`s`/`w`/`e` (la lógica con `includes()` ya las soportaba).
- **Manual**: la sección 1 del PDF aclara la redimensión desde bordes o esquinas.

## [Unreleased] - 2026-08-01

### Reorganización de la UI del simulador + sitio WordPress + plan Site-as-Data

Cambios de UI, contenido y arquitectura. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **112 archivos / 1495 tests pasando** (1486 previos + 9 nuevos).

**Salida del simulador:**
- **`src/components/DesktopTopBar.tsx`**: botón de apagado al estilo distros Linux (icono de poder al lado de la batería, rojo al hover). Requiere `onRequestExit` opcional.
- **`src/components/ExitConfirm.tsx` (nuevo)**: modal de confirmación "¿Volver al menú?" (ES/EN) con Cancelar / Sí, salir; advierte que se pierde el progreso.
- **`src/App.tsx`**: estado `showExitConfirm` central; el botón rojo del `MissionPanel` y el botón de apagado abren el mismo diálogo → al confirmar ejecuta `handleGoHome` (encuesta si todas las misiones completas, si no `resetWorkspace`). El botón rojo de salida se movió de `DesktopTerminal` al `MissionPanel`; se eliminó el botón "Menú" de la taskbar.
- **`src/hooks/useCommandRunner.ts`**: nueva prop `onRequestExit` en `CommandRunnerProps`, cableada `App → DesktopTerminal → DesktopTopBar`.

**Red/máscara centrada:**
- **`src/App.tsx`**: el `network_range` se posiciona en el centro real de la barra superior (chip blanco en negrita), alineado en columna con el reloj del `DesktopTopBar`. Se mide en runtime el centro del reloj (`ResizeObserver` + `MutationObserver` sobre `[data-desktop-topbar]` / `.desktop-clock`) porque el reloj está en posición `justify-between`; ajuste fino vertical vía `top: calc(50% + 1px)`.

**Panel de ajustes de terminal (unificado):**
- **`src/components/termColors.ts` (nuevo)**: `TERM_COLORS` extraído a módulo compartido (verde/blanco/naranja/azul).
- **`src/components/WindowFrame.tsx`**: se eliminaron los dos botones de la barra de título (opacidad `%` y fuente `px`); ahora un único botón de engranaje (solo terminales) abre un panel con barra de tamaño de fuente (10–20px), barra de opacidad (0–100%) y los 4 puntos de color (usa `setTermColor` global). El panel se cierra al hacer click fuera (listener `pointerdown` en `document`).
- **`src/hooks/useDesktopWindows.ts`**: `activeOpacitySliderId`/`activeFontSliderId` → `activeSettingsId` (estado único por ventana).
- **`src/App.tsx`**: eliminado el color picker de la taskbar superior derecha (ahora el color se configura solo desde el panel de la terminal).

**Animación de carga en ventana:**
- **`src/components/MachineLoader.tsx`**: la animación se muestra dentro de una ventana estilo terminal (440×520px responsive, barra de título con puntos de control, cuerpo translúcido `rgba(15,23,42,0.5)`), centrada sobre el wallpaper; los tres usos (ScenarioLauncher, fallback, modo clásico) heredan el cambio.

**Sitio WordPress (lab 1):**
- **`src/components/fakesites/wordpress/wp01/Index.tsx`**: primer artículo reemplazado por "DeepSeek Flash: the new open model that rivals frontier AI" (actualizado el test de contenido).
- **`src/laboratorios/laboratorio01.ts`**: agregados archivos WordPress al FS del objetivo — `/var/www/html/index.php` (front page con los 3 artículos, `www-data` 0644), `/var/www/html/wp-config.php` (DB `wordpress_db`, salts; coherente con `config.bak`, 0640) y directorios `wp-content/` + `wp-content/uploads/`. Ahora `ls`/`cat` desde la terminal muestran contenido coherente con el sitio.

**Docs:**
- **`docs/PLAN_GENERADOR_LABS.md` (nuevo)**: plan en 4 fases (A: sitios como datos `SiteDefinition`/`SiteRenderer`; B: sitios desde el FS; C: catálogos de vulns/credenciales/privesc/OS; D: generador + UI) con subfases, criterios de salida y observaciones verificadas del acoplamiento actual de los sitios.

## [Unreleased] - 2026-07-31

### Fase 9 — Sistema de archivos avanzado (ROADMAP Fase 9 ✅)

Fase completa del ROADMAP. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **111 archivos / 1488 tests pasando** (1464 previos + 24 nuevos). Cierra la Fase 9 entera (9.1-9.6): montajes con `/etc/fstab`, `df`/`du` con human-readable, enlaces simbólicos con `->` en `ls -l` y seguimiento en `cat`, `find` y `grep -r`.

- **`src/frameworks/fs/mounts.ts` (nuevo)**: estado por máquina NO persistente (patrón ProcessManager). `parseFstab`/`getFstabEntries`/`getMounts`/`mountDevice`/`unmount`/`isMounted`/`resetMounts`; `unmount` no permite desmontar montajes del sistema.
- **`src/commands/builtin/mount.ts` (nuevo)**: `mount` sin args lista montajes base + fstab; `mount /dev/sdb1 /mnt` monta (solo root, el mount point debe existir). `cmd_umount` desmonta (protege mounts de sistema).
- **`src/commands/builtin/df.ts` (nuevo)**: `df -h` con tabla simulada y filtro por mount point.
- **`src/commands/builtin/du.ts` (nuevo)**: `du -h/-s/-a` (flags combinados `-sh`) con tamaño = contenido + bloque base 4K.
- **`src/commands/builtin/ln.ts` (nuevo)**: `ln -s target link` crea `FileEntry` type `'symlink'` + `linkTarget` (`-f` sobreescribe); hard link copia el entry. Guarda paths sin `/` final.
- **`src/commands/builtin/find.ts` (nuevo)**: `find [dir] -name/-iname/-perm -4000/-user/-type f|d` (glob quote-aware, SUID, permisos).
- **`src/commands/builtin/pipeline.ts`**: `grep` gana `-r/--recursive` (flags combinados `-ri`) con salida `path:line`.
- **`src/utils/fs.ts`**: `resolveSymlink` (seguimiento recursivo de enlaces con detección de ciclos).
- **`src/commands/builtin/{cat,ls}.ts`**: `cat` sigue el enlace vía `resolveSymlink`; `ls -l` muestra `lrwxrwxrwx` y `name -> target`.
- **`src/types.ts`**: `FileEntry.linkTarget` para enlaces simbólicos.
- **`src/hooks/useCommandRunner.ts`**: `resetMounts()` al cambiar de escenario.
- **`src/commands/__tests__/fase9-fs.test.ts` (nuevo)**: 24 tests (mount/umount con permisos, df/du, ln -> ls -l/cat, resolveSymlink, find, grep -r).

## [Unreleased] - 2026-07-31

### Fase 8 — Tareas programadas (cron/crontab) (ROADMAP Fase 8 ✅)

Fase completa del ROADMAP. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **110 archivos / 1464 tests pasando** (1443 previos + 21 nuevos). Cierra la Fase 8 entera (8.1-8.3): `crontab` con edición vía nano, reloj virtual y ejecución simulada de cron jobs con logs en syslog y efectos en el filesystem.

- **`src/frameworks/cron/cronRunner.ts` (nuevo)**: estado por máquina NO persistente (patrón ProcessManager). Reloj virtual desde base `2024-03-19T10:00:00Z`; `parseCrontab`/`listCronJobs` leen `/etc/crontab` (con columna de usuario) y `/var/spool/cron/crontabs/<user>`; matcher de horario con `*`, `*/n`, rangos y listas; `runCron(machine, minutes)` ejecuta las tareas debidas si el servicio cron está corriendo (`processManager.isServiceRunning('cron')`), genera `CRON[pid]: (user) CMD (...)` en `/var/log/syslog` y aplica efectos simples (`touch`, `echo >|>>`); `resetCron()`.
- **`src/commands/builtin/crontab.ts` (nuevo)**: `crontab -l/-e/-r/-u`. `-e` abre nano (crea la cadena `/var/spool/cron/crontabs` si falta, mode 0600, respeta permisos); `-u` solo root.
- **`src/commands/builtin/{date,sleep}.ts` (nuevos)**: `sleep N` avanza el reloj virtual y ejecuta los cron jobs debidos (disparador por acción del usuario); `date` muestra la hora virtual. Ambos devuelven `filesChanged` cuando cron muta el filesystem.
- **`src/commands/builtin/index.ts` / `src/commands/index.ts` / `which.ts` / `help.ts`**: registro de `crontab`, `date`, `sleep`.
- **`src/hooks/useCommandRunner.ts`**: `resetCron()` al cambiar de escenario.
- **`src/commands/__tests__/fase8-cron.test.ts` (nuevo)**: 21 tests (parse/list, ejecución `* * * * *` y `*/2`, efectos en FS, cron detenido, crontab -l/-e/-r/-u, date, sleep + integración con executeCommand y journalctl).

## [Unreleased] - 2026-07-31

### Fase 7 — Sistema de paquetes, pipes/redirección y variables de entorno (ROADMAP Fase 7 ✅)

Fase completa del ROADMAP. `tsc --noEmit` 0 errores, `pnpm build` ok, `pnpm test:run` → **109 archivos / 1443 tests pasando** (1404 previos + 39 nuevos). Cierra la Fase 7 entera (7.1-7.5): el `apt`/`dpkg` con estado por máquina, pipes con filtros y redirección global quote-aware, y variables de entorno `export`/`env`/`unset` con expansión `$VAR`.

- **`src/frameworks/packages/packageManager.ts` (nuevo)**: estado por máquina NO persistente (patrón ProcessManager/networkState). Base de datos de ~25 paquetes; el set instalado se deriva de los binarios presentes en el filesystem. `installPackage`/`removePackage`/`isInstalled`/`listInstalled`/`searchPackages`/`resetPackageManager`.
- **`src/commands/tools/apt.ts` (nuevo)**: `apt update/install/remove/list --installed/search`, solo root. Instalar agrega los binarios del paquete al filesystem (con permisos + umask) y devuelve `filesChanged`.
- **`src/commands/tools/dpkg.ts` (nuevo)**: `dpkg -l` y `dpkg -i archivo.deb` (parsea campos Package/Version del archivo).
- **`src/utils/shellParse.ts` (nuevo)**: `splitTopLevel`, `extractRedirection` y `expandCommandLine` — parseo quote-aware (comillas simples literales, dobles con expansión).
- **`src/commands/builtin/pipeline.ts` (nuevo)**: filtros `grep` (`-v`/`-i`), `head`, `tail`, `wc`, `sort` (`-r`/`-n`), `uniq` — leen `CommandContext.pipedInput` o un archivo.
- **`src/commands/builtin/export.ts` (nuevo)**: `export` (define/lista), `env`, `unset`.
- **`src/utils/environment.ts` (nuevo)**: `DEFAULT_ENV(machine)`, `expandVariables`, `parseExportAssignment`, `formatEnvLine`.
- **`src/utils/redirection.ts`**: ampliado con `writeOutputToFile` (permisos + umask centralizados) y `readFileContent`.
- **`src/commands/index.ts`**: `runPipeline()` (ejecuta segmentos en secuencia con `pipedInput`, preserva la metadata del primer comando y fusiona `filesChanged`); redirección global `>`/`>>` y `<` en el executor; expansión `$VAR` antes de despachar. `executeCommand`/`createIsolatedExecutor` ahora aceptan `env`/`setEnv`.
- **`src/types.ts`**: `CommandContext` gana `env`, `setEnv` y `pipedInput`.
- **`src/hooks/useCommandRunner.ts`**: estado `env` por sesión, `resetPackageManager()` al cambiar de escenario, y `env`/`setEnv` pasados al executor.
- **`src/commands/__tests__/fase7-packages-pipes-env.test.ts` (nuevo)**: 39 tests (apt, dpkg, env, filtros, redirección, integración `cat | grep`, `ls | head`, `cat | wc`, shellParse).

## [Unreleased] - 2026-07-31

### Higiene técnica del codebase — MEJORAS.md Fase 4 y Fase 5

Plan parcial ejecutado de `docs/MEJORAS.md`. 8 de 16 puntos de las fases de documentación duplicada, higiene media prioridad y dependencias resueltos. Sin cambios funcionales ni en tests. `tsc --noEmit` 0 errores, `pnpm build` sin warnings, `pnpm test:run` → 106 archivos / 1355 tests pasando (Vitest v4.1.10).

**Fase 4 — Documentación duplicada:**

- **4.4** `GUIA_SIIMULADOR_PDF.md` → `docs/GUIA_SIMULADOR_PDF.md` vía `git mv`. Typo "SIIMULADOR" corregido. Referencias actualizadas en `CLAUDE.md:135`.
- **4.5** `HAPPY_PATH_TEST.md`, `MODELO_NEGOCIO.md`, `SECURITY.md` movidos a `docs/` vía `git mv` (historia preservada). Referencias actualizadas en `CLAUDE.md:9`, `AGENTS.md:167`, `README.md:150`.
- **4.2** Consolidación de CHANGELOGs: `changelog.md` (raíz) ya estaba eliminado en commit `a2ec4c4` previo — verificado ausente del working tree. Quedan como única fuente de verdad `docs/CHANGELOG.md` y `docs/CHANGELOG_ARCHIVE.md`. Link corregido en `README.md:161` (`CHANGELOG.md` → `docs/CHANGELOG.md`).
- **4.3** `README_FULL.md` (951 líneas, desactualizado: npm en vez de pnpm, "740+ tests", 5 labs, "strict: false intencional", rutas `src/shells/` que se movieron) **eliminado**. `README.md` (162) queda como README único y vigente. Contenido único de `README_FULL.md` migrado a **`docs/OVERVIEW.md`** (nuevo): sección de Analytics (webhook de Google Apps Script + queries de Google Sheets) y visión de producto a futuro (Admin Panel, Lab Builder, Community Platform, rutas premium, modelo freemium).

**Fase 5 — Higiene media prioridad:**

- **5.2** `labs.html` (628 líneas, standalone con array `LABS` inline de 5 de 6 labs) **eliminado** vía `git rm`. Era un artefacto muerto: no referenciado desde `index.html`, `vercel.json`, ni código React. La ruta `/:lang/labs` del SPA sirve el componente `LabGrid` (`src/App.tsx:149`), no al `labs.html`. Vite no lo copiaba a `dist/` (estaba en la raíz, no en `public/`), así que en producción `/labs.html` daba 404.
- **5.3** Floors de dependencias acotados en `package.json`:
  - `vitest`: `^4.0.18` → `^4.1.6`. `pnpm update` bumpó installado a **4.1.10** (latest dentro del rango).
  - `@vitest/coverage-v8`: `^4.0.18` → `^4.1.6`. Bumpado a **4.1.10**.
  - `@vitejs/plugin-react`: `^4.0.0` → `^4.7.0` (acota, sin saltar al major 6 no pedido).
  - `pnpm-lock.yaml` actualizado. Mayores (`react 19`, `@types/react 19`, `@testing-library/jest-dom 7`, `jsdom 30`) **no tocados** — breaking changes fuera del scope.
- **5.6** `vitest.config.ts:10`: `include: ['src/**/*.{test,spec}.{ts,tsx}']` simplificado a `['src/**/*.test.{ts,tsx}']`. Verificado que no existe ningún archivo `.spec.*` en `src/` (rg sale 0 resultados).
- **5.7** Imports rotos en `src/frameworks/metasploit/core/ContextRegistry.ts` ya estaban arreglados en commit previo (stopgap local `interface SessionManager {}` con comentario explicativo). Verificación: el archivo importa `MsfState`/`MsfSession` desde `'./msfTypes'` (módulo existente) y define `SessionManager` como marker interface inline. No quedan rutas inexistentes.

Archivos: `docs/MEJORAS.md`, `docs/CHANGELOG.md`, `docs/OVERVIEW.md` (nuevo), `README.md`, `CLAUDE.md`, `AGENTS.md`, `vitest.config.ts`, `package.json`, `pnpm-lock.yaml`, `labs.html` (eliminado), `README_FULL.md` (eliminado), `GUIA_SIIMULADOR_PDF.md` (renombrado/movido), `HAPPY_PATH_TEST.md` (movido), `MODELO_NEGOCIO.md` (movido), `SECURITY.md` (movido).

## [Unreleased] - 2026-07-29

### Generalización del sistema de permisos Unix — Etapas 1-5 del plan `arreglos_minimax_m3.md`

Plan completo ejecutado: `src/utils/fs.ts` + `src/utils/permissions.ts` centralizan los helpers de filesystem y permisos. 8 comandos migrados (`mkdir`, `rmdir`, `rm`, `mv`, `touch`, `echo`, `cp`, `nano`). Cierre de bugs abiertos en `ls`, `nmap`, `ftp get`. `nano` save desacoplado del UI con `existingSnapshot`. Documentación canónica en `docs/PERMISSIONS.md`. Matriz de 46 tests transversales comando × escenario.

- **`src/utils/fs.ts` (nuevo)**: `findFile`, `findDirEntry`, `findParentDir`, `resolveParentDirPath`, `isDirectoryEntry`, `defaultOwnership`, `buildNewFile`. Reemplazan las 10+ copias duplicadas en comandos de fs.
- **`src/utils/permissions.ts`**: nuevos `canEditFile` (alias semántico), `canCreateInDir` (write+execute del padre), `canDeleteInDir` (incluye sticky bit). Root bypass uniforme.
- **`src/commands/builtin/{mkdir,rmdir,rm,mv,touch,echo,cp,nano}.ts`**: migrados a los helpers. Reducción de 70+ LOC en duplicación.
  - `echo.ts` y `cp.ts` aplican preventivamente `canEditFile` al sobreescribir archivos existentes (cierra bugs 3.1 y 3.2 del plan).
  - `nano.ts`: ahora chequea `canRead` para abrir (denegado si no podés leer), `canEditFile` para `readOnly` flag.
- **`src/commands/builtin/ls.ts`**: respeta `canExecute` del directorio target (devuelve "Permission denied" si no podés acceder); filtra entries por `canRead` en formato corto.
- **`src/commands/tools/nmap.ts`**: `-oN`/`-oG` ahora validan permisos del directorio destino (`canCreateInDir`/`canEditFile`) y asignan `owner`/`group`/`mode` del usuario local al archivo creado. Errores de permisos se reportan al final del output.
- **`src/frameworks/shells/ftp/FtpSession.ts`**: `get` valida `canRead` remoto con identidad `anonymous` (uid 65534) y asigna `owner`/`group`/`mode` del atacante al archivo descargado. `550 Permission denied` si el archivo no es world-readable.
- **`src/hooks/useCommandRunner.ts`**: nuevo `handleNanoSave(content, filename?)` que centraliza la lógica de guardado (parent check, canEditFile, addFileToMachine con snapshot). `handleDownloadedFile` propaga los metadatos si vienen en `downloadedFile`.
- **`src/types.ts`**: `nanoFile` incluye `existingSnapshot?: { owner, group, mode }` para preservar las propiedades del archivo al editar.
- **`src/components/Terminal.tsx`**: `onSave` de `nano` reducido a `onSave={handleNanoSave}`. Eliminada toda la lógica de validación inline.
- **`docs/PERMISSIONS.md` (nuevo)**: documentación canónica del patrón. Resumen del modelo, tabla de helpers, tabla operación → helper, template copy-paste para nuevos comandos, anti-patrones, comandos ya migrados, sección sticky bit, sección persistencia, inventario de tests.
- **`AGENTS.md`**: nueva sub-sección "Permissions on filesystem commands" con resumen rápido y puntero a `docs/PERMISSIONS.md`.
- **Tests nuevos** (+101 tests, total 1343):
  - `src/utils/__tests__/fs.test.ts` (13 tests): findFile, findDirEntry, findParentDir, defaultOwnership, buildNewFile.
  - `src/utils/__tests__/permissions.test.ts`: +18 tests para canEditFile, canCreateInDir, canDeleteInDir (incluido sticky bit).
  - `src/commands/__tests__/nano-save-preserve-owner.test.ts` (6 tests): existingSnapshot, readOnly, defaults.
  - `src/commands/__tests__/ls-permissions.test.ts` (7 tests): bob no puede listar `/root` (0700), sí puede `/home/bob` y `/tmp`.
  - `src/commands/tools/__tests__/nmap-output-permissions.test.ts` (4 tests): kali guarda en `/tmp` y `/home/kali`, denegado en `/root/.secret.txt` y `/usr/bin`.
  - `src/frameworks/shells/ftp/__tests__/FtpSession-permissions.test.ts` (3 tests): descarga world-readable OK, denegada en 0600 root, metadatos del atacante asignados.
  - `src/commands/__tests__/permissions-integration.test.ts` (46 tests): matriz transversal comando × escenario (read, write, create, delete+sticky, copy, move, ls, cd, nano, chmod/chown, root bypass).
- **Verificación global**: `tsc --noEmit` 0 errores, 105 archivos de test, 1343/1343 tests pasando.

### Bonus: arreglo del autocompletado de comandos

`src/utils/autocomplete.ts` tenía una lista hardcodeada `AVAILABLE_COMMANDS` desactualizada (28 comandos) que no incluía `chmod`, `chown`, `chgrp`, `nano`, `echo`, `touch`, `rm`, `cp`, `mv`, etc. Derivada ahora del registry real.

- **`src/commands/index.ts`**: nuevo export `AVAILABLE_COMMAND_NAMES: string[]` derivado del `Map` `COMMANDS` (excluye `msfconsole`). Si mañana se agrega un comando nuevo al registry, automáticamente aparece en el autocompletado.
- **`src/utils/autocomplete.ts`**: `autocompleteCommand()` ahora filtra desde `AVAILABLE_COMMAND_NAMES` en lugar del array hardcodeado.
- **`src/hooks/__tests__/useKeyboardShortcuts.test.ts`**: actualizado el `vi.mock('../../commands', ...)` para incluir el nuevo export.
- **`src/utils/__tests__/autocomplete.test.ts`**: +4 tests verificando que `chmod`/`chown`/`chgrp`/`nano`/`echo`/`touch`/`rm`/`cp`/`mv` aparecen y que `msfconsole` se excluye.

## [Unreleased] - 2026-07-29

### Editor `nano` inline en Terminal, redimensionado responsivo y guardado relativo con permisos

- **`src/components/EditorModal.tsx`: Renderizado inline dentro del contenedor de la ventana de Terminal**
  - Se eliminó el overlay modal flotante fijo (`fixed inset-0 z-50 bg-black/70`) y las dimensiones fijas en píxeles.
  - El editor `nano` pasa a ser un contenedor flex `w-full h-full flex-1` que ocupa el área interna de la ventana de la terminal de forma responsiva.
  - Al arrastrar la barra de título de la ventana de la terminal (drag & move), la ventana se mueve fluidamente con `nano` en su interior.
  - Al cambiar el tamaño de la ventana (resize), el editor ajusta su área de texto, locator y barras de estado de forma fluida.
  - Agregado soporte para mensajes de error de permisos en la barra de estado de `nano` (ej: `nano: '/root/secret.txt': Permission denied`). Si ocurre un error de permisos, `nano` no se cierra y permite corregir la ruta o cancelar.

- **`src/components/Terminal.tsx`: Integración inline y resolución de rutas relativas con chequeo Unix de permisos**
  - Cuando `nanoFile` está activo, `EditorModal` sustituye inline la vista del historial/prompt de la terminal.
  - Al presionar `Ctrl+O` o guardar un archivo, resuelve rutas relativas (ej: `mi_archivo.txt` o `./notas.txt`) respecto al directorio actual (`currentDir`) y directorio home (`homeDir`).
  - Realiza validación de permisos de escritura Unix (`canWrite` en archivo existente, o `canWrite` + `canExecute` en directorio padre para archivos nuevos) antes de llamar a `addFileToMachine`.

- **`src/components/__tests__/EditorModal.test.tsx`: Pruebas unitarias para `EditorModal`**
  - Pruebas cubriendo el renderizado inline, edición de texto, estado `Modified`, accesos `Ctrl+X` y `Ctrl+O`, y la respuesta ante errores de permisos.

## [Unreleased] - 2026-07-28

### Editor `nano` rediseñado como réplica fiel de GNU nano 6.2

- **`src/components/EditorModal.tsx`: Reescritura completa del editor**
  - Header tipo GNU nano real: "GNU nano 6.2" + título centrado (archivo o "New Buffer") + indicador "Modified" cuando hay cambios sin guardar.
  - Área de edición con fondo `#0a0a0a`, texto gris y cursor cyan parpadeante (`caretColor` alternando cada 530ms).
  - Locator `[ line X/Y (Z%) ]` + `[ col N ]` que se actualiza al mover el cursor (onKey/onClick/onKeyUp).
  - Barra inferior dinámica con tres modos: `edit` / "File Name to Write:" / "Search:" — emula la barra de prompts de nano real.
  - Footer con dos filas de atajos: `^G Help ^O Write Out ^W Where Is ^\\ Replace ^K Cut` / `^U Paste ^J Justify ^C Cursor Pos ^X Exit ^T To Spell`, con los `^` resaltados en amarillo.
  - Atajos: Ctrl+O → prompt "File Name to Write:", Ctrl+X → sale (pide guardar si hay cambios), Ctrl+W → "Search:" con wrap-around, Ctrl+G → overlay de ayuda.
  - Contrato de props intacto (`onSave(content, filename?)` / `onClose()` / `filePath` / `initialContent`): los 4 tests de `fase4-editors.test.ts` siguen pasando.
  - Bug menor corregido: header con `truncate` + `flex justify-between` dejaba el path ilegible en archivos con rutas largas. Reemplazado por layout `flex` con `min-w-0` y separadores verticales.

### Documentación de plan de trabajo

- **`docs/ROADMAP.md`: Roadmap de features actualizado** (776 líneas). FASES 0–4 marcadas ✅, FASES 5–9 pendientes (procesos, red/firewall, paquetes, cron, fs avanzado). Docker en BACKLOG fuera de secuencia.
- **`docs/MEJORAS.md`: Plan de higiene técnica unificado** (228 líneas). Combina `ROADMAP_FIX_TSC.md` + mejoras urgentes detectadas en análisis de código. FASES 0–4 ✅ (incluye refactor del `CommandResponse` god type en Fase 4). Pendientes: consolidación de CHANGELOGs/READMEs, mover `.md` sueltos a `docs/`, eliminar `console.log` de debug, `useShallow` en `App.tsx` (34 selectors), code-splitting real de Vite, y NO persistir `machines` con credenciales en `localStorage` (Fase 7.1, pendiente crítico).

## [Unreleased] - 2026-07-26

### Fase 4 — Editores de texto y manipulación de archivos (ROADMAP Fase 4 ✅)

- **`src/commands/builtin/touch.ts`: Nuevo comando `touch`**
  - Crea archivos vacíos con `touch <file>`, verifica permisos de escritura en el directorio padre.
  - Usa `applyUmask()` para el mode del archivo nuevo.

- **`src/commands/builtin/echo.ts`: Nuevo comando `echo` con redirección (`>` / `>>`)**
  - `echo texto` imprime texto; `echo texto > archivo` escribe/sobrescribe; `echo texto >> archivo` append.
  - Usa `src/utils/redirection.ts` para parsear la redirección.
  - Verifica permisos de escritura, usa `applyUmask()` para archivos nuevos.

- **`src/commands/builtin/rm.ts`: Nuevo comando `rm`**
  - `rm archivo`, `rm -r directorio` (recursivo), `rm -f` (ignora inexistentes).
  - Verifica permisos de escritura y respeta sticky bit.
  - Bug corregido: `isError` usaba `!r.startsWith('rm:')` que negaba los errores.

- **`src/commands/builtin/cp.ts`: Nuevo comando `cp`**
  - `cp origen destino` copia archivos; `cp -r origen destino` copia directorios (recursivo).
  - Verifica permisos de lectura en origen y escritura en destino.

- **`src/commands/builtin/mv.ts`: Nuevo comando `mv`**
  - `mv origen destino` mueve/renombra archivos y directorios.
  - Verifica permisos de escritura en ambos directorios, respeta sticky bit.

- **`src/commands/builtin/nano.ts`: Nuevo comando `nano`**
  - Abre archivo existente o crea nuevo; muestra contenido + instrucciones Ctrl+O/Ctrl+X.
  - Verifica permisos de escritura.

- **`src/components/EditorModal.tsx`: Nuevo componente EditorModal**
  - Modal con textarea, soporte Ctrl+O (guardar) y Ctrl+X (salir), botones Save/Exit.
  - Props: `onSave(content)`, `onClose()`, `filePath`, `initialContent`.

- **`src/utils/redirection.ts`: Nuevo parser de redirección**
  - `parseRedirection(args)` retorna `{ text, operator: '>' | '>>' | null, filename }`.
  - Reutilizable por echo, cat, nano y futuros comandos.

- **`src/commands/builtin/mkdir.ts`: Actualizado para usar `applyUmask()`**
  - Directorios nuevos creados con `mode: applyUmask(0o777)` en vez de mode implícito.

- **Tests:** `src/commands/__tests__/fase4-editors.test.ts` — 26 tests cubriendo echo, touch, rm, cp, mv, nano y redirection utils.

### Fase 3 — SUID con cambio de identidad y privesc metadata (ROADMAP Fase 3 ✅)

- **`src/commands/index.ts`: SUID handler ahora emite privesc metadata**
  - Cuando un binario SUID (distinto de `sudo`) se ejecuta, la respuesta incluye `privescAttempted: true`, `privescTool: cmdName`, `privescCompleted: machine.id`.
  - `sudo` excluido del handler SUID porque maneja su propia escalada.

- **`src/types.ts`: `privescAttempted`, `privescTool`, `privescCompleted` movidos a `CmdResponseBase`**
  - Cualquier comando puede emitirlos sin necesidad del variant `type: 'sudo'`.

- **`src/commands/builtin/rmdir.ts`: Bug corregido en sticky bit**
  - `checkStickyBit()` buscaba `parentDir + '.dir'` en vez de `parentDir + '/.dir'` — el sticky bit nunca funcionó.
  - Cómputo de `parentDir` corregido: removía incorrectamente el trailing slash antes de `lastIndexOf('/')`.

- **Tests actualizados:** `fase3-suid-sticky.test.ts` — 22 tests (agregados identidad SUID, metadatos privesc, sticky bit root/owner/denied).

- **Verificación:**
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 98/98 archivos, 1.231 tests ✅

### CommandResponse como discriminated union (MEJORAS Fase 3)

- **`src/types.ts`: `CommandResponse` convertido a discriminated union** con 15 variantes tipadas:
  - Extraídos 10 subtipos reutilizables (`FtpSessionData`, `SshSessionData`, `FoundCredentialsData`, `ScanResultsData`, `FoundDirectoriesData`, `FileReadData`, `SudoPrivilegesData`, `FoundVulnerabilityData`, `FailedUserData`, `PossibleUsersData`).
  - Cada comando retorna con un `type` literal (`'scan'`, `'creds'`, `'blocking'`, `'sudo'`, `'discovery'`, etc.) que el compilador verifica.
  - Consumidores (`labValidator`, `useCommandRunner`, tests) usan `'field' in result` para narrowing.
  - ~58 archivos modificados entre tipos, comandos, shells, MSF, hooks, validator y tests.
- **Verificación:**
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 90/90 archivos, 1.135 tests ✅
  - `pnpm build` → compila sin warnings ✅

## [Unreleased] - 2026-07-23

### Code duplication elimination (MEJORAS Fase 2)

- **`src/commands/index.ts`: Eliminada la duplicación entre `executeCommand` / `createIsolatedExecutor`** (FASE 2.1):
  - Extraído `safeJsonParse<T>` — reemplaza 4 try/catch vacíos, loggea errores con `console.warn`.
  - Extraído `parseMsfResponse()` — función compartida que parsea prefijo `MSF_STATE:` y actualiza estado.
  - Extraído `createMsfCommand(getState, setState)` — factory que genera el handler msfconsole sin duplicación.
  - Extraído `executeCommandInternal()` — lógica compartida de ejecución de comandos.
  - `executeCommand` y `createIsolatedExecutor` ahora usan las mismas funciones compartidas.
  - Archivo reducido de ~417 a ~320 líneas, 0 duplicación de lógica.
- **`_msfState` singleton eliminado — migrado al store de Zustand** (FASE 2.2):
  - `_getMsf()`/`_setMsf()` ahora leen del store (`useScenarioStore.getState().msfState`).
  - Eliminada `restoreMsfState()` — redundante, el store es la única fuente de verdad.
  - `resetMsfState()`, `isMsfActive()`, `getMsfPrompt()`, `getMsfState()` delegadas al store.
  - `App.tsx`: eliminados 2 efectos de sync (reset/restore MSF), lee `msfState` directo del store.
  - `useCommandRunner.test.ts`: limpiado mock de `restoreMsfState`.
- **Verificación:**
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 90/90 archivos, 1.135/1.135 tests ✅

## [Unreleased] - 2026-07-22

### Críticos de arquitectura y tipos (MEJORAS Fase 0 + Fase 1)

- **`tsconfig.json`**: Activado `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true` — `pnpm exec tsc --noEmit` pasa de 128 errores a 0.
- **Eliminado `src/_deprecated/`** (39 archivos, ~2.139 LOC muerto). Confirmado sin imports externos. Resuelve 22 de los errores de tsc.
- **`scenarioStore` partido en slices** (`src/store/slices/`): `scenarioSlice.ts`, `terminalSlice.ts`, `uiSlice.ts` — el God Store de 460 líneas quedó en 69 líneas (sólo fachada re-exportadora, mantiene compatibilidad con consumers y tests existentes).
- **`resetWorkspace()` extraído**: el bloque `setState({...15 keys...})` duplicado 4× (App.tsx ×3, useCommandRunner.ts ×1) ahora es una acción única que puebla los 3 sub-stores.
- **`src/types.ts` extendido**:
  - `ValidationCriteria.service?: string` (ya usado en runtime, no declarado).
  - `CommandResponse.completedMissionId?: number` (ya emitido por algunos comandos).
- **`src/fs-models/fs-linux.ts`**: 4 `FileEntry` (`/etc/passwd`, `/etc/shadow`, `common.txt`, `rockyou.txt`) con `type: 'text'` faltante.
- **`src/frameworks/metasploit/core/msfTypes.ts`**: `module?` corregido a `string` (era `string | unknown`); `sessions?` tipado a `MsfSession[]`; agregado `MsfSession` interface.
- **`src/frameworks/metasploit/core/ContextRegistry.ts`**: imports rotos (`'../modules/types'`, `'./SessionManager'` — rutas inexistentes) reemplazados por tipos locales stopgap (`MsfSession`, `SessionManager` stub).
- **`src/frameworks/shells/ShellSession.ts`**: agregado `ShellResult.completedMissionId?: number`.
- **`src/hooks/useCommandRunner.ts`**: `CommandRunnerProps.onCredentialsFound.file` ahora opcional (para alinear con consumers que pueden omitirlo); `onVerifyCredentials?.()` con optional chaining.
- **158 archivos editados** en cleanup masivo tras activar `noUnusedLocals`/`noUnusedParameters`:
  - Imports `React` por defecto eliminados (~63 archivos `.tsx` — con `jsx: react-jsx` no es necesario).
  - Locals sin uso eliminados; params sin uso prefix `_`; `const { a, _b, c }` → sin `_b`.
  - Tests alineados a los tipos nuevos: `MsfState` mocks con `uidChecked: false`; `CommandContext` mocks con `currentDir: '/root'`; `cmd_help.execute()` callado con 1 arg (no 2); `makeWelcome([])` en vez de `makeWelcome()`.
  - `DesktopTopBar.test.tsx`: `type: 'wallpapers'` → `'wallpaper'`; `width`/`height` → `w`/`h`; agregados `opacity`/`fontSize` requeridos por `DesktopWindow`.
- **Verificación final**:
  - `pnpm exec tsc --noEmit` → 0 errores ✅
  - `pnpm test:run` → 90/90 archivos, 1.135/1.135 tests ✅

## [Unreleased] - 2026-07-18

### Fase 0 — Sistema de permisos (Foundation)

- **Tipos `User` y `Group`**: Agregados a `src/types.ts` con username, uid, gid, home, shell, groups.
- **`FileEntry` extendido**: Campos opcionales `owner?`, `group?`, `mode?` — compatibilidad backward total.
- **Nuevo `src/utils/users.ts`**: `parsePasswd()`, `parseGroup()`, `getUser()`, `getGroup()`, `getCurrentUser()` (replica la heurística de `useTerminalIdentity`), `isRoot()`.
- **Nuevo `src/utils/permissions.ts`**: `checkPermission()` (owner/group/others bits), `canRead()/canWrite()/canExecute()`, `hasSuid()/hasSgid()/hasStickyBit()`, `formatMode()`.
- **`createFile()` actualizada**: Nueva firma con `owner`, `group`, `mode` opcionales. Defaults: root:root, 755 (dirs) / 644 (files).
- **Permisos reales en todos los filesystems**: `fs-linux.ts`, `templates.ts` (legacy), `kali.ts` — tmp → 1777, root → 700, shadow → 640 root:shadow, logs → 640 root:adm, www-data → 755/644, etc.
- *Archivos: `src/types.ts`, `src/utils/users.ts`, `src/utils/permissions.ts`, `src/laboratorios/templates.ts`, `src/fs-models/fs-linux.ts`, `src/laboratorios/attackers/kali.ts`*

### Fase 1 — Comandos con consciencia de permisos

- **`ls -l`**: Muestra permisos reales (`formatModeFromFile()`), owner y group desde cada `FileEntry` en vez de valores hardcodeados.
- **`cat`**: Verifica `canRead()` antes de mostrar contenido. Si el usuario no tiene permiso de lectura, devuelve `Permission denied`.
- *Archivos: `src/commands/builtin/ls.ts`, `src/commands/builtin/cat.ts`, `src/commands/builtin/__tests__/ls.test.ts`*

## [Unreleased] - 2026-07-17

### Optimización de rendimiento en comandos (fase 1)

- **`commands/index.ts`**: `COMMANDS[]` convertido a `Map<string, Command>` — resolución de comandos O(1) vs O(n). Lo mismo para `createIsolatedExecutor`.
- **`sudo.ts`**: `parseSudoers()` se cachea y se pasa a `hasPermission`/`hasNopasswd` — 3 parseos → 1 por invocación.
- **`nmap.ts`**: `parsePorts()` sin `-p` ya no aloca arrays de 1024/65535 elementos; filtra por rango o devuelve copia directa. Puertos específicos usan `Set.has()` O(1) vs `Array.includes()` O(n).
- **`ls.ts`**: Unificados dos `forEach` sobre `machine.files` en un solo paso.
- **`ping.ts`** y **`traceroute.ts`**: 3-4 `indexOf()` → único `for` con `switch`. Regex movido a constante del módulo.
- **`whoami.ts`**: 3 `.find()` anidados → 1 línea con `||` short-circuit (mínimo de escaneos).
- **`cd.ts`**: Eliminada doble llamada a `getCurrentUser()` (`isRoot` lo hacía internamente). Path normalization extraída a utilidad compartida.
- **`mkdir.ts`** y **`rmdir.ts`**: Path normalization y `SYSTEM_DIRS` extraídos a `utils/path.ts` — elimina código duplicado en 3 comandos.
- **Nuevo `src/utils/path.ts`**: `normalizePath()`, `ensureTrailingSlash()`, `resolvePath()`, `SYSTEM_DIRS` — utilidades compartidas de ruta.
- *Archivos: `src/utils/path.ts`, `src/commands/index.ts`, `src/commands/builtin/sudo.ts`, `src/commands/tools/nmap.ts`, `src/commands/builtin/ls.ts`, `src/commands/builtin/cd.ts`, `src/commands/builtin/mkdir.ts`, `src/commands/builtin/rmdir.ts`, `src/commands/builtin/ping.ts`, `src/commands/builtin/traceroute.ts`, `src/commands/builtin/whoami.ts`*

### Streaming output realista en herramientas + fixes críticos

- Agregado `streamingLineDelays` a nmap, hydra, gobuster, netdiscover, arp-scan y hashcat — el output aparece línea por línea con delays variables según el tipo de operación (puertos, raw packets, GPU, etc.).
- **Fix 🔥 whoami**: ya no crashea si `machine.scan_results` es undefined (`src/commands/builtin/whoami.ts`).
- **Fix 🔥 cat**: resuelve rutas relativas contra `currentDir` — `cat archivo.txt` funciona desde cualquier directorio (`src/commands/builtin/cat.ts`).
- **Fix 🔥 mkdir -p**: detecta directorios existentes con `path + '/.dir'` en vez de `path + '.dir'` — ya no duplica entradas (`src/commands/builtin/mkdir.ts`).
- **Fix 🔴 hydra**: busca la wordlist en todas las máquinas (no solo en la Kali), y si no se encuentra asume pass correcta en vez de fallar (`src/commands/tools/hydra.ts`).
- *Archivos: `src/commands/tools/nmap.ts`, `src/commands/tools/hydra.ts`, `src/commands/tools/gobuster.ts`, `src/commands/tools/netdiscover.ts`, `src/commands/tools/arp-scan.ts`, `src/commands/builtin/hashcat.ts`, `src/commands/builtin/whoami.ts`, `src/commands/builtin/cat.ts`, `src/commands/builtin/mkdir.ts`*

## [Unreleased] - 2026-07-13

### Debug panel renombrado a /zildeb + LinkedIn link

- Ruta `/admin` renombrada a `/zildeb`. El link `[admin]` se eliminó del `MarketingFooter` — ahora solo es accesible escribiendo la URL directamente.
- `@pabloveron` en el footer ahora es un link a LinkedIn (`https://www.linkedin.com/in/pablomarceloveron`).
- *Archivos: `src/App.tsx`, `src/components/landing/MarketingFooter.tsx`*

## [Unreleased] - 2026-07-12

### Bug fix — Links del ConsultancySite sacaban del laboratorio

- Los `<a href="#">` y `<a href="#servicios">` en `ConsultancySite.tsx` ahora tienen `onClick` con `e.preventDefault()` para evitar que la navegación real del browser saque al usuario del lab. Los enlaces a `#servicios` y `#equipo` además hacen scroll suave a la sección correspondiente.
- Se agregó `onNavigate` a las props de `ConsultancySite` y se pasa desde `FakeBrowser.tsx`.
- *Archivos: `src/components/fakesites/ConsultancySite.tsx`, `src/components/FakeBrowser.tsx`*

### Fake site — zeroinfralabs.vercel.app

- Nueva landing page `ZeroInfraLabs.tsx` con diseño futurista/joke (Cloud Null, Seguridad Imaginaria, Deploy a /dev/null). Accesible desde la URL `https://zeroinfralabs.vercel.app` en el FakeBrowser.
- Agregado botón `⚡ zeroinfralabs.vercel.app` en Google Home (debajo de las sugerencias de búsqueda).
- *Archivos: `src/components/fakesites/ZeroInfraLabs.tsx`, `src/components/FakeBrowser.tsx`*

### Chrome button habilitado en labs 3 y 5

- Cambiada categoría de lab 3 (EternalBlue) y lab 5 (FTP + PrivEsc) de `'Network'` a `'Web'` para que muestren el botón de Chrome. Los usuarios pueden abrir el navegador e intentar acceder a los servidores (verán 404).
- *Archivos: `src/laboratorios/laboratorio03.ts`, `src/laboratorios/laboratorio05.ts`, `src/laboratorios/__tests__/laboratorio05.test.ts`*

## [Unreleased] - 2026-07-10

### Theme toggle (dark/light) — Marketing pages

- **Nuevo estado `theme` en store**: Agregado `theme: 'light' | 'dark'` + `setTheme` a `scenarioStore.ts`. Persistido en localStorage.
- **`ThemeSync` en `App.tsx`**: Sincroniza `data-theme` en `<html>` al cambiar el tema.
- **`useColors()` hook**: Creado en `src/components/landing/constants.ts` con 12 tokens por tema (`colorsLight`/`colorsDark`). Todos los componentes marketing lo usan en vez de valores hardcodeados.
- **SiteHeader**: Adaptado completamente al tema — fondo (`rgba(10,14,20,0.92)` dark / `rgba(255,255,255,0.92)` light), navegación, menú mobile, badges activos. Nuevo `ThemeToggle` (sol/luna) al lado del selector de idioma.
- **LandingPage**: Features cards (4 cuadros "hecho para principiantes") y step badges (01-04) ahora usan colores del tema. Hover shadows ajustados para modo oscuro (`hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]`).
- **LandingLabPreview**: Cards, hover shadows, links de "empezar" y "ver todos" adaptados al tema.
- **LabGrid**: Cards (`#11161f` dark / `#ffffff` light), modal, close button, badges, tags — todos theme-aware. Imagen placeholder: `#0a0e14` dark / `#f1f5f9` light.
- **BlogListPage**: ArticleCard, tags, metadata — theme-aware.
- **BlogArticlePage**: `renderMarkdown()` acepta `isDark`/`colors` y genera HTML con colores del tema. Tags y back link adaptados.
- *Archivos: `src/store/types.ts`, `src/store/scenarioStore.ts`, `src/App.tsx`, `src/components/landing/constants.ts`, `src/components/landing/SiteHeader.tsx`, `src/components/LandingPage.tsx`, `src/components/landing/LandingLabPreview.tsx`, `src/components/LabGrid.tsx`, `src/components/BlogListPage.tsx`, `src/components/BlogArticlePage.tsx`*

### CTA siempre visible en LandingPage

- Eliminado `showFloatCta` state y scroll listener. CTA en SiteHeader ahora siempre visible (`showCta={true}`). Eliminado el botón CTA flotante fixed-bottom en mobile.
- *Archivo: `src/components/LandingPage.tsx`*

### Botón "Regresar" en LabGrid

- El botón verde del header en la página de labs ahora dice "Regresar" (ES) / "Back" (EN) y navega al landing (`/${language}`) en vez de "Iniciar" → `/labs`.
- Nueva clave i18n `backToLanding`.
- *Archivos: `src/components/LabGrid.tsx`, `src/i18n/translations.ts`*

### Bug fix — Scroll bloqueado al salir del modal de labs

- Agregado `useEffect` cleanup que restaura `document.body.style.overflow` al desmontar `LabGrid`. Esto evita que el scroll quede bloqueado al navegar ("Start Lab" o botón atrás del browser) mientras el modal está abierto.
- *Archivo: `src/components/LabGrid.tsx`*

## [Unreleased] - 2026-07-09

### 🎨 Rediseño visual completo — Landing, Labs, Blog + tipografía Inter

- **LandingPage**: rediseño completo. Pasó de fondo oscuro `#0b1015` 100% monospace a hero oscuro (`#0f172a` → `#1e293b`) + secciones de contenido con fondo claro (`#ffffff`, `#f8fafc`). Tipografía cambia de monospace a **Inter (sans-serif)**. Se eliminaron 10 cards de features/audience → 4 cards compactas. Nueva sección "How it works" con animaciones alternadas. Nuevos componentes compartidos: `SiteHeader`, `MarketingFooter`, `PageHero`, `LandingLabPreview`. Se eliminaron gradientes verdes en títulos. Nuevo CTA flotante en mobile.
- **LabGrid**: mismo cambio de fondo oscuro → `#f8fafc` con tipografía Inter. Cards de laboratorios pasaron de fondo `#0d1117` con bordes verdes oscuros a fondo **blanco** con bordes `#e2e8f0` y sombras sutiles. Título con gradiente eliminado, reemplazado por `PageHero`.
- **BlogListPage**: fondo oscuro → secciones claras. ArticleCard: fondo `#0d1117` borde `#243030` → fondo blanco con borde `#e2e8f0`. Tags pasaron de estilo verde-oscuro a `rounded-full` verde claro. Monospace → Inter.
- **BlogArticlePage**: mismo cambio de fondo. Markdown renderizado pasó de colores `#10b981`/`#22d3ee`/`text-gray-300` a `text-emerald-800`/`text-slate-600`.
- **Tipografía**: se agregó Google Fonts **Inter** en `index.html`. Definida en `src/components/landing/constants.ts` como `FONT_SANS`. Monospace queda solo para badges, tags y metadata técnica.
- **Paleta centralizada**: nuevo archivo `src/components/landing/constants.ts` con objeto `C` conteniendo todos los colores del nuevo diseño, `FONT_SANS`, `FONT_MONO` y demo de nmap.
- **App.tsx**: nueva ruta `/:lang/admin` con componente `AdminPanel`.
- *Archivos: `src/components/LandingPage.tsx`, `src/components/LabGrid.tsx`, `src/components/BlogListPage.tsx`, `src/components/BlogArticlePage.tsx`, `src/components/landing/*`, `index.html`, `src/App.tsx`*

## [Unreleased] - 2026-07-08

### Bug fixes — Path relativo sin separador en `mkdir`, `rmdir`, `cd`

- **`mkdir` / `rmdir` / `cd`**: al construir paths relativos, concatenaban `currentDir + dir` sin asegurar que `currentDir` terminara con `/`. Si `currentDir` era `'/root'` (sin trailing slash), `mkdir hola` creaba `/roothola/` en vez de `/root/hola/`. Lo mismo ocurría con `cd hola` y `rmdir hola`.
- *Archivos: `src/commands/builtin/mkdir.ts`, `src/commands/builtin/rmdir.ts`, `src/commands/builtin/cd.ts`*

## [Unreleased] - 2026-07-05

### Admin Panel (debug)
- **Nuevo `/:lang/admin` route** con panel debug completo (login `admin/admin`, selector de escenario, debug overlay flotante con pestañas Store/Machines/Missions)
- **Workspace con DesktopTerminal real** — muestra el escritorio Linux completo (ventanas, wallpaper, taskbar) como en los labs, no solo Terminal aislada
- *Archivos: `src/components/AdminPanel.tsx`, `src/App.tsx`, `src/components/LandingPage.tsx`*

### Bug fixes — Case sensitivity en comandos
- **`executeCommand`** ya no baja a mayúsculas el nombre del comando (`parts[0].toLowerCase()` → `parts[0]`). Ahora `NMAP`, `LS`, `CAT`, `CD`, etc. dan `Command not found`
- **`help` lookup** ya no usa `toLowerCase()` — `help NMAP` ya no muestra la ayuda de `nmap`
- **Autocomplete de comandos** ya no filtra con `toLowerCase()` — `NM` + Tab ya no sugiere `nmap`
- *Archivos: `src/commands/index.ts`, `src/commands/builtin/help.ts`, `src/utils/autocomplete.ts`*
- *Tests: `src/commands/builtin/__tests__/help.test.ts`, `src/utils/__tests__/autocomplete.test.ts`*

### Bug fixes — `ls` sin trailing slash en directorios
- **Formato simple** (`ls`): directorios ya no muestran `/` al final (`bin/` → `bin`)
- **Formato largo** (`ls -l`): directorios ya no muestran `/` al final del nombre
- Comportamiento como Linux real (`ls` sin `-F` no agrega `/`)
- *Archivo: `src/commands/builtin/ls.ts`*
- *Tests: `src/commands/builtin/__tests__/ls.test.ts`*

### Bug fixes — `admin` hardcodeado en template de filesystem
- **`createLinuxFileSystem`** (`fs-linux.ts`): eliminado `/home/admin/.dir`, `.bashrc`, `.profile`, `.bash_history` del template estándar. Cada lab define sus propios usuarios.
- **`/etc/passwd` y `/etc/shadow`**: eliminada la entrada hardcodeada de `admin`. Solo existe el usuario dinámico `${u}` del config.
- **`createLinuxFileSystemLegacy`** (`templates.ts`): mismo cambio.
- **`laboratorio01.ts`**: agregados `.bashrc`, `.profile`, `.bash_history` de admin (es el único lab que lo necesita).
- *Archivos: `src/fs-models/fs-linux.ts`, `src/laboratorios/templates.ts`, `src/laboratorios/laboratorio01.ts`*

### Bug fixes — `nmap.ts` (sesión anterior)
- ✅ `-sV` ya no se trata como scan type (era un flag de versión)
- ✅ Default scan type cambiado a `-sS` (SYN stealth)
- ✅ `-Pn` solo muestra mensaje en modo verbose (`-v`)
- ✅ "Not shown" movido antes de la tabla de puertos
- ✅ `-oG` formato corregido (protocol/state, doble `//` entre service/version)
- ✅ `getKnownService()` eliminada (código muerto)
- *Archivo: `src/commands/tools/nmap.ts`*

## [Unreleased] - 2026-06-21

### Fixes `laboratorio05.ts` — Code Review

- ✅ **`REVERSE_SHELL_PAYLOAD` eliminado** de `validationCriteria` — solo existe en lab 4 (`laboratorio05.ts:295`)
- ✅ **`COMMON_PORTS` corregido a `DISCOVERED_PORTS`** — referenciaba constante inexistente
- ✅ **`"service"` corregido a `"services"`** — typo en validación de servicio
- ✅ **`criteria[0]` corregido a `criteria[i]`** — siempre validaba el primer criterio en el bucle
- ✅ **`targetMachineId` hardcoded reemplazado** por `config.targetMachineId`
- ✅ **Import `SCENARIO_TEMPLATES` corregido** — era `SCENARIO_TEMPLATE` (inexistente)
- ✅ **`description` corregido a `descripcion`** — propiedad incorrecta en metadatos del lab

### Pentester: Shortcuts eliminados

- ✅ **`cmd_ssh` v2** — ya no emite `foundCredentials` automáticamente al hacer SSH (era un shortcut que saltaba la validación)
- ✅ **`cmd_nmap` v2** — `nmap -sn` ya no emite `discoveredHosts` (el escaneo de descubrimiento no debe revelar hosts automáticamente)

### Tests: `AnimatedBrowser.test.tsx` corregido

- ✅ **Mock de `Math.random`** añadido (`mockReturnValue(0)`) para hacer la animación determinista con fake timers
- ✅ **Timings ajustados** para coincidir con la línea de tiempo real de la animación (1200/1500/1000/1500/2000ms)
- ✅ **URL personalizada** — `advanceTimersByTime(12000)` → `5000ms` para evitar entrar al segundo ciclo de animación

## [Unreleased] - 2026-06-18

### UX: Ventanas de escritorio más grandes, centradas y con opacidad default 50%

- ✅ **Terminal inicial más grande y centrada** (`useDesktopWindows.ts:46-58`) — `x:40,y:60,w:640,h:400,opacity:0.92` → `x:100,y:80,w:820,h:520,opacity:0.5`. Nuevas terminales (`addTerminal`) usan los mismos defaults.
- ✅ **Wallpaper picker más grande y centrado** (`useDesktopWindows.ts:119`) — `x:120,y:100,w:520,h:400` → `x:180,y:100,w:660,h:540`. Previews `h-16` → `h-24`, gap `gap-3` → `gap-4`, padding `p-2.5` → `p-3`.
- ✅ **Text selection en browser y terminal** (`FakeBrowser.tsx:446`, `Terminal.tsx:63`) — El `select-none` del escritorio impedía seleccionar texto en todas las ventanas. Se agregó `select-text` al contenido del browser y la terminal.
- ✅ **WPIndex responsivo** (`Index.tsx`) — `max-w-4xl` → `max-w-7xl` con padding, sidebar y textos responsivos por breakpoint (`md:`/`lg:`/`xl:`). Layout `flex-col` en mobile, `lg:flex-row` en desktop.

### Refactor: Bajo acoplamiento — correcciones de alta prioridad

- ✅ **ShellSession.ts: import roto reparado** (`frameworks/shells/ShellSession.ts:4`) — El import apuntaba a `'../types'` que resuelve a `src/frameworks/types.ts` (inexistente). Corregido a `'../../types'` que resuelve a `src/types.ts`. Era un bug latente que funcionaba solo por `moduleResolution: "bundler"` de Vite.

- ✅ **FtpSession.ts: dependencia directa del store eliminada** (`frameworks/shells/ftp/FtpSession.ts:4`) — El shell FTP importaba `useScenarioStore` desde `store/scenarioStore`, una violación de capas grave (framework → store). El import no se usaba en el código, solo era un residual. Eliminado.

- ✅ **autocomplete.ts: desacoplado de `frameworks/metasploit`** (`utils/autocomplete.ts:7`) — La capa de utilidades (`utils/`) importaba `MSF_MODULES` desde `frameworks/metasploit/core/msfModules`, creando una dependencia invertida. Se refactorizó para que `autocompleteMsf` y `getAutocompleteSuggestions` reciban los módulos como parámetro opcional. El llamador (`useKeyboardShortcuts.ts`) los importa y pasa. Tests actualizados.

- ✅ **useCommandRunner.ts: eliminada validación duplicada** (`hooks/useCommandRunner.ts`) — El bloque de validación de misiones (`validateMission`) estaba repetido 3 veces (comando normal, sesión FTP, sesión SSH). Se extrajo en el helper `checkMissionCompletion()` y se unificaron las 3 llamadas. También se eliminó la duplicación del manejo de descarga de archivos FTP reutilizando `handleDownloadedFile()`. El archivo pasó de 582 a 540 líneas.

### Refactor: Modularización de DesktopTerminal

- ✅ **DesktopTerminal.tsx reducido de 1011 a 159 líneas** — Se extrajeron 5 módulos:
  - `src/components/desktopWallpapers.ts`: interfaz `Wallpaper` + 6 wallpapers SVG
  - `src/hooks/useDesktopWindows.ts`: hook con toda la lógica de ventanas (drag, resize, add, close, minimize, wallpaper, clock)
  - `src/components/DesktopTopBar.tsx`: barra superior con menú de apps, taskbar, reloj, indicadores de sistema
  - `src/components/WindowFrame.tsx`: marco de ventana con header, sliders de opacidad/fuente, botones de control, handles de resize
  - `src/components/WallpaperPicker.tsx`: grilla de selección de wallpaper

- ✅ **Tests de hooks**: `useDesktopWindows.test.ts` (31 tests) y `useCommandRunner.test.ts` (15 tests) nuevos, usando `vi.hoisted()` para evitar TDZ, store ref reseteable, timers fake para comandos streaming, y `waitFor` para operaciones asíncronas.

### Refactor: Metasploit unificado en `src/frameworks/metasploit/`

- ✅ **Movidos `msfTypes.ts`, `msfHelpers.ts`, `msfModules.ts`** de `src/commands/tools/` a `src/frameworks/metasploit/core/`
- ✅ **Movido `msfCommands/` (orquestadores)** de `src/commands/tools/` a `src/frameworks/metasploit/orchestrators/`
- ✅ **`msfconsole.ts`** queda como thin wrapper en `src/commands/tools/` con comentario apuntando a `frameworks/metasploit/`
- ✅ Actualizados imports en 25+ archivos, eliminados archivos duplicados

### Structure final de MSF

```
src/frameworks/metasploit/
├── core/              ← tipos, helpers, módulos, context-registry
├── commands/          ← sub-comandos (use, set, show, search, exit…)
├── orchestrators/     ← orquestadores (msfBase, msfMeterpreter, msfShell, msfExploits, msfContextHelp)
├── modules/           ← módulos de exploit/post
└── index.ts
```

---

## [Unreleased] - 2026-06-16

### Nuevo: DesktopTerminal — Entorno de escritorio Linux simulado

Se reemplazó la terminal simple por un escritorio Kali virtual completo con ventanas arrastrables, redimensionables, minimizables y maximizables. Todo el estado de las ventanas se maneja localmente en `DesktopTerminal.tsx` con un array de `DesktopWindow`.

- **Gestión de ventanas**: Drag desde el header, resize desde las 4 esquinas, minimizar (−), maximizar/restaurar (□/⧉), cerrar (×).
- **Barra de tareas (Kali-style)**: Botón de aplicaciones, botones individuales para cada ventana de terminal (1–5), Chrome (1–2) y configuración de fondos. Solo el botón de la ventana superior se resalta.
- **Comportamiento del botón en barra de tareas**: Si la ventana está minimizada → se restaura y trae al frente. Si está visible (aunque esté detrás de otra) → se minimiza.
- **Z-index compartido**: Terminales, Chrome y ventana de fondos comparten el mismo stack de z-index; se pueden intercalar.
- **Aplicación "Change Wallpaper"**: Se abre como una ventana tipo `wallpaper` en el escritorio, con los mismos controles (minimize, maximize, close) y botón en la barra de tareas.

### Chrome como ventana nativa del escritorio

- Chrome se movió de un overlay separado a una `DesktopWindow` con `type: 'browser'`, heredando todas las capacidades de ventana (drag, resize, minimize, maximize, close).
- Cada instancia de Chrome tiene estado **independiente** (URL actual, historial de navegación, login) manejado con `useState` local en `FakeBrowser`, en lugar del store global.
- La numeración de Chrome es **monótona creciente** (1, 2, 3…) sin reiniciar al cerrar ventanas.
- Al cerrar un Chrome y reabrirlo, arranca desde `https://www.google.com`.
- Límite: máximo 2 ventanas de Chrome.
- "Firefox" renombrado a "Chrome" en toda la interfaz (etiquetas, menú, icono de escritorio, AnimatedBrowser, pistas de laboratorio). Nuevo icono SVG estilo Chrome.

### Estado aislado por terminal

Cada terminal tiene ahora su propio contexto de ejecución independiente:

- `msfState` — cada terminal puede ejecutar `msfconsole` sin afectar a otras.
- `currentDir` — cada terminal tiene su propio directorio de trabajo.
- `blockingCommand` / `listeningPort` — comandos bloqueantes como `nc` son por terminal.
- `ftpSession` / `sshSession` — sesiones FTP/SSH interactivas por terminal.
- Nuevo `createIsolatedExecutor()` en `commands/index.ts` que devuelve un ejecutor con `_msfState` capturado en closure.
- Limpieza del store: eliminados `browserMinimized`, `firefoxOpenCount`, `setBrowserMinimized`, `setFirefoxOpenCount`.

### Botones de ventana reordenados

- Verde (−) = minimizar
- Amarillo (□/⧉) = maximizar/restaurar

### Limpieza de código

- Eliminado el overlay de Chrome de `App.tsx` en modo desktop.
- Eliminados `browserClosing`, `browserMaximized`, `browserCustomDims`, resize refs del `App.tsx`.
- FakeBrowser convertido a estado local (`useState`) para URL, navegación y login.

---

## [Unreleased] - 2026-06-08

### Fixes de Laboratorio / Validación

- ✅ **Lab 5: `cat nota.txt` ahora muestra a `john` en "Possible SSH Users"** — La nota FTP se descarga en la máquina atacante, por lo que el `cat` corría siempre con `machine.id === 'attacker-01'`. El `possibleUsers.machineId` quedaba guardado en el atacante y el `EnumerationPanel` (que filtra máquinas no-atacante) nunca mostraba a `john` como posible usuario SSH. Se restauró la resolución: si el `cat` corre en el atacante y hay `allMachines`, los usuarios descubiertos se asignan al target del lab. Además, se restauró el regex robusto de `extractMentionedUsers` con `matchAll` + filtrado de falsos positivos (`esta`, `equipo`, `seguridad`, `root`) + `length >= 3` + word boundaries, que también se había perdido en la "restauración" del 7 de junio.
  - `src/commands/builtin/cat.ts`: `extractMentionedUsers` y resolución de `machineId` corregidas.
  - `src/commands/builtin/__tests__/cat.test.ts`: 5 tests de regresión nuevos (atacante→target, ES/EN, falsos positivos, fallback sin `allMachines`).

---

## [Unreleased] - 2026-06-06

### Fixes de Laboratorio / Validación

- ✅ **Solución a la validación del Paso 3 en Lab 5 (FTP + PrivEsc)** — Se rehizo este cambio partiendo de una versión anterior en el GitHub del 29 de abril.
  - Implementado el tipo de validación `fileDownloaded` en `MissionCriteriaType` (`src/types.ts`) y su validador respectivo en `validateMission` (`src/utils/labValidator.ts`).
  - Agregada la validación universal del laboratorio en el flujo interactivo de FTP (`Terminal.tsx`) al descargar archivos con `get`.
  - Añadidas pruebas unitarias para `fileDownloaded` en `labValidator.test.ts`.

---

## [Unreleased] - 2026-05-28

### DevOps y Gestión de Dependencias

- ✅ **Migración a pnpm** — Se migró el gestor de paquetes de `npm` a `pnpm` (v11) para acelerar las instalaciones, mejorar la seguridad del árbol de dependencias y optimizar el almacenamiento.
  - Reemplazado `package-lock.json` por `pnpm-lock.yaml`.
  - Actualizada toda la documentación y guías del proyecto (`README.md`, `AGENTS.md`, `docs/DEVELOPMENT.md`, `docs/TESTING.md`) con las nuevas instrucciones de ejecución basadas en `pnpm`.

---

## [Unreleased] - 2026-04-29

### Mejoras de UX y Routing

- ✅ **Detección automática de idioma** — Detecta `navigator.language` del navegador
  - Redirige a `/es` si el navegador está en español (es-ES, es-MX, es-AR, etc.)
  - Redirige a `/en` por defecto o para otros idiomas
  - Respeta preferencia guardada en localStorage si el usuario ya cambió manualmente

- ✅ **Language switcher fix** — Cambio de idioma actualiza la URL correctamente
  - Al cambiar ES → EN, la URL cambia de `/es/scenario/...` a `/en/scenario/...`
  - Preserva la ruta completa, solo cambia el prefijo de idioma

- ✅ **Persistencia de directorio actual** — `currentDir` se guarda en localStorage
  - Valor inicial: `/root` (en lugar de `/`)
  - Al refrescar la página, mantiene el directorio donde estabas

### Comandos

- ✅ **nmap -oN / -oG fix** — Guarda archivos en el directorio actual
  - Ej: `nmap -oN basico 192.168.1.10` guarda en `/root/basico`
  - Ej: `nmap -oN salida.txt 192.168.1.10` guarda en `/root/salida.txt`
  - Paths absolutos se respetan: `nmap -oN /tmp/scan.txt ...` guarda en `/tmp/scan.txt`
  - `-oG` funciona igual que `-oN`

- ✅ **nmap --open** — Nuevo flag para filtrar solo puertos abiertos

### DevOps

- ✅ **vercel.json** — Configuración para SPA routing
  - Soluciona error 404 al refrescar páginas con rutas dinámicas (`/es/labs`, `/en/scenario/...`)
  - Redirige todas las rutas al `index.html` para que React Router maneje el routing

- ✅ **chunkSizeWarningLimit** — Aumentado a 1000KB para suprimir warning de Vercel

---

## [Unreleased] - 2026-04-23

### Comandos de Sistema y Red

- ✅ **ping** — Comando ICMP para testear conectividad de red
  - Flags: `-c` (count), `-i` (interval), `-W` (timeout), `-s` (size), `-h` (help)
  - Simula respuestas de hosts existentes con TTL (64 Linux / 128 Windows)
  - 10 tests incluidos

- ✅ **traceroute** — Trazar ruta a un destino
  - Flags: `-m` (max hops), `-q` (queries), `-w` (wait), `-h` (help)
  - Simula saltos intermedios con latencias
  - 7 tests incluidos

- ✅ **ps** — Reportar estado de procesos
  - Opciones: `ps`, `ps aux`, `ps -e`, `ps -ef`
  - Procesos simulados según OS (Linux/Windows)
  - 5 tests incluidos

- ✅ **top** — Visor dinámico de procesos en tiempo real
  - Implementado como comando bloqueante (sale con `q`)
  - Muestra CPU%, MEM%, load average, uptime
  - 6 tests incluidos

- ✅ **which** — Localizar ejecutables en PATH
  - Soporta múltiples comandos: `which nmap ls python`
  - Lista completa de comandos builtin y tools
  - 12 tests incluidos

- ✅ **htop** — Visor de procesos interactivo con colores
  - Barras visuales de CPU (múltiples cores)
  - Barras de memoria y swap con porcentajes
  - Proceso htop resaltado con '>'
  - Menú de function keys (F1-F10)
  - Sale con 'q' o F10
  - 8 tests incluidos

### Comandos de Reconocimiento de Red

- ✅ **netdiscover** — Nuevo comando de descubrimiento de hosts pasivo/activo
  - Auto-detección de red desde la IP de la máquina
  - Flags: `-r` (rango), `-p` (pasivo), `-v` (verbose), `-P` (parseable), `-f` (fast), `-n` (nodo inicial)
  - Output tipo netdiscover real con tabla de hosts encontrados
  - 12 tests incluidos

- ✅ **nmap -sn con CIDR** — Escaneo de red completa (`nmap -sn 192.168.1.0/24`)
  - Encuentra todos los hosts en la red especificada
  - Retorna `discoveredHosts` para validación de labs
  - 4 tests nuevos para CIDR

- ✅ **nmap simplificado** — Removida validación de `discovery_level` del comando
  - El comando ahora es completamente "libre" (sin validaciones internas)
  - La validación de pasos debe hacerse en el sistema de labs (labValidator)

### Documentación

- ✅ **docs/nmap/help.md** — Referencia rápida de opciones de nmap
- ✅ **docs/nmap/man.md** — Manual completo de nmap en formato Unix man page

### DevOps

- ✅ **Vercel Analytics** — Agregado seguimiento de analytics con `@vercel/analytics` en `src/main.tsx`

---

## [1.1.0] - 2026-04-12

### Fixes de Navegación

- ✅ **Corregido tipo `lang` en `App.tsx`** — Validación explícita `'en' | 'es'` con fallback seguro a `'en'`
- ✅ **Flujo encuesta → LabGrid corregido** — Al saltar o enviar encuesta, navega directamente a `/:lang/labs` en vez de volver al mismo lab (usaba `history.back()`)
- ✅ **Botones atrás/adelante del browser** — `popstate` handler ahora hace cleanup directo + `navigate()` para evitar loops con `history.back()`
- ✅ **Estado se limpia correctamente** — Survey y workspace state se resetean completamente al salir de un lab
- ✅ **7 tests de navegación nuevos** — `AppNavigation.test.tsx` cubriendo todos los flujos en ambos idiomas

### Landing Page — Textos para principiantes

- ✅ **Hero** — Supertítulo: "LA PRIMERA PLATAFORMA DE HACKING ÉTICO EN ESPAÑOL — DIRECTO EN TU NAVEGADOR"
- ✅ **Hero** — Título: "Aprendé hacking desde cero — sin instalar nada"
- ✅ **Hero** — 4 badges: Sin conocimientos previos, Sin registro, 100% seguro y legal, ⏱️ Sin límite de tiempo
- ✅ **Hero** — CTA: "Empezar gratis ahora →"
- ✅ **Sección "¿Nunca hackeaste nada? Perfecto."** — Reemplaza "Meet ZI Labs"
- ✅ **Card "Terminal realista"** — Texto centrado en aprender haciendo
- ✅ **Card "Curiosos del hacking"** — Reemplaza "Preparación para certificaciones" (ícono 👀)
- ✅ **Paso 01** — "Labs ordenados de más fácil a más difícil"
- ✅ **Sección nueva: Disclaimer legal** — "Hacking ético, siempre." con ícono de escudo
- ✅ **6ta card "Sin límite de tiempo"** — Reemplaza "Enumeración guiada" (ícono ⏱️)
- ✅ **Card "Autodidactas"** — Mención al tiempo: "ni un reloj corriendo en contra"
- ✅ **Card "Sin dolores de cabeza con VMs"** → **"Amantes de lo simple"** (ES) / **"Lovers of simplicity"** (EN)
- ✅ **Todos los textos en ES (voseo) y EN**

### Lab 02 — SSH Compromised Fix

- ✅ **Misiones 5 y 6** — `discoveryLevel: 4` → `3` — SSH como `gonzalo` ya no marca la máquina como "Compromised" (no hay escalada de privilegios en este lab)

---

## [1.0.0] - 2026-04-11

### Features Principales

- **6 Laboratorios completos** — WordPress, SSH Brute, EternalBlue, LFI/RCE, FTP+PrivEsc, SQL Injection
- **Terminal realista** — 20+ comandos funcionales (nmap, hydra, ssh, msfconsole, etc.)
- **Sistema de Validación Universal** — Comandos libres, validación declarativa
- **Landing Page** — Marketing completo con animaciones
- **800+ Tests** — Cobertura completa con Vitest

### Arquitectura

- React 18 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- Zustand + localStorage persistence
- i18n (Español/Inglés)

### Fixes Recientes

- ✅ Validación universal implementada (14 criterios)
- ✅ LHOST mensaje genérico en MSF exploit
- ✅ Tests de Terminal actualizados con store mock
- ✅ Coverage de store mejorado (selectors tests)

---

## Versiones Anteriores

Ver [CHANGELOG_ARCHIVE.md](CHANGELOG_ARCHIVE.md) para historial completo de versiones anteriores.
