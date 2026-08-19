// ── academy/path-protocolos-ii.ts ─────────────────────────────────
// Path: Redes II — los servicios y arquitecturas que hacen funcionar
// una red por dentro: DHCP, NAT, DNS, VPN, DMZ.

import type { Lesson } from '../types';

export const PROTOCOLOS2_LESSONS: Lesson[] = [
  {
    // Clase nueva (2026-08-17): reemplaza a las tres primeras lecciones
    // históricas (network-01 puertos, network-02 servicios clásicos y
    // network-03 red doméstica), cuyo contenido ya se cubre en
    // Fundamentos de redes y Redes I. Nuevo orden: DHCP (1) + DMZ (2).
    id: 'network-06',
    pathId: 'protocolos-ii',
    order: 1,
    title: 'DHCP: the service that hands out IP addresses',
    titleEs: 'DHCP: el servicio que reparte las direcciones IP',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Cuando enchufás un cable o te unís a un WiFi, tu máquina sabe al toque qué IP usar. No es magia: hay un servicio trabajando atrás, el DHCP. Y cuando está mal vigilado, también es una puerta para el atacante.',
            en: 'When you plug in a cable or join a WiFi, your machine instantly knows which IP to use. Not magic: a service works behind the scenes — DHCP. And when it is poorly watched, it is also a door for the attacker.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/re201-dhcp.mp4',
        durationSec: 82,
        caption: 'DHCP hands out the network config automatically: IP, mask, gateway and DNS. It works with leases (lends the IP, renews before it expires). The DORA handshake: Discover, Offer, Request, Acknowledge over UDP 67/68. Static IP is stable but does not scale. The attack: rogue DHCP hands out malicious gateway/DNS — defense is DHCP snooping.',
        captionEs: 'DHCP reparte la configuración automáticamente: IP, máscara, gateway y DNS. Trabaja con alquileres (presta la IP y la renueva antes de vencer). El handshake DORA: Discover, Offer, Request, Acknowledge por UDP 67/68. La IP estática es estable pero no escala. El ataque: rogue DHCP entrega gateway/DNS maliciosos — la defensa es DHCP snooping.',
      },
      {
        type: 'content',
        title: 'What is it and what does it do',
        titleEs: 'Qué es y qué hace',
        body: 'DHCP (Dynamic Host Configuration Protocol) is the service that **hands out the network configuration automatically**: IP address, subnet mask, gateway and DNS servers. Without it, every device would need that configuration typed by hand. It works with **leases**: it lends the IP for a while (hours or days) and renews it before it expires — that is why a laptop can move between networks without reconfiguring anything.',
        bodyEs: 'DHCP (Dynamic Host Configuration Protocol) es el servicio que **reparte la configuración de red automáticamente**: dirección IP, máscara de subred, puerta de enlace (gateway) y servidores DNS. Sin él, cada equipo necesitaría esa configuración escrita a mano. Trabaja con **alquileres (leases)**: presta la IP por un tiempo (horas o días) y la renueva antes de que venza — por eso una laptop puede moverse de red a red sin reconfigurar nada.',
      },
      {
        type: 'content',
        title: 'How it works: the 4-message handshake (DORA)',
        titleEs: 'Cómo funciona: el handshake de 4 mensajes (DORA)',
        body: 'When a device joins the network it has nothing, not even an IP. The conversation is always the same, 4 messages known as **DORA**: **D**iscover — the client shouts to the broadcast "any DHCP out there?"; **O**ffer — the server answers offering a free IP; **R**equest — the client accepts and formally asks for that offer; **A**cknowledge — the server confirms and signs the lease. All over UDP (ports 67 and 68), in seconds, with no human intervention.',
        bodyEs: 'Cuando un equipo entra a la red no tiene nada, ni IP. El diálogo es siempre el mismo, 4 mensajes conocidos como **DORA**: **D**iscover — el cliente grita al broadcast "¿hay algún DHCP acá?"; **O**ffer — el servidor responde ofreciendo una IP libre; **R**equest — el cliente acepta y pide formalmente esa oferta; **A**cknowledge — el servidor confirma y firma el alquiler. Todo por UDP (puertos 67 y 68), en segundos, sin intervención humana.',
      },
      {
        type: 'terminal-demo',
        command: 'dhclient -v eth0',
        output: 'Internet Systems Consortium DHCP Client 4.4.3\nListening on LPF/eth0/00:0c:29:aa:bb:cc\nDHCPDISCOVER on eth0 to 255.255.255.255 port 67\nDHCPOFFER of 192.168.1.34 from 192.168.1.1\nDHCPREQUEST for 192.168.1.34 on eth0 to 255.255.255.255 port 67\nDHCPACK of 192.168.1.34 from 192.168.1.1\nbound to 192.168.1.34 -- renewal in 40234 seconds.',
        explanation: 'dhclient -v shows the DORA handshake live: DISCOVER to the broadcast, OFFER from the router (192.168.1.1), REQUEST accepting and the final ACK. The IP is leased and gets renewed before it expires.',
        explanationEs: 'dhclient -v muestra el handshake DORA en vivo: DISCOVER al broadcast, OFFER del router (192.168.1.1), REQUEST aceptando y ACK final. La IP queda alquilada y se renueva antes de vencer.',
      },
      {
        type: 'content',
        title: 'When there is no DHCP: static IP',
        titleEs: 'Cuando no hay DHCP: IP estática',
        body: 'If nobody answers the DISCOVER, the device gets no IP and you must configure it by hand (**static IP**: type IP, mask, gateway and DNS one by one). Comparison: static is stable and predictable — that is why servers, printers and routers use it — but it does not scale (imagine 300 PCs typed by hand) and one mistake kills the connection. DHCP is automatic and scales on its own, but it depends on a service that, if it fails or gets spoofed, leaves everyone with no network or in the wrong hands.',
        bodyEs: 'Si nadie responde el DISCOVER, el equipo queda sin IP y hay que configurarla a mano (**IP estática**: escribir IP, máscara, gateway y DNS uno por uno). Comparación: la estática es estable y predecible — por eso se usa en servidores, impresoras y routers — pero no escala (imaginate 300 PCs escritas a mano) y un error tumba la conexión. DHCP es automático y escala solo, pero depende de un servicio que, si falla o es falsificado, deja a todos sin red o en manos equivocadas.',
      },
      {
        type: 'content',
        title: 'Who runs it',
        titleEs: 'Quién lo ejecuta',
        body: 'At home you almost never see it: the **ISP router** runs DHCP built in (the same box that does NAT, WiFi and switching). In companies a little router is not enough: **dedicated servers** run the service — Windows Server with the DHCP role (reservations, scopes and central administration) or Linux with `isc-dhcp-server` / `dnsmasq`. The bigger the network, the more important who administers that service becomes.',
        bodyEs: 'En casa casi nunca lo ves: el **router del proveedor** corre el DHCP integrado (la misma caja que hace NAT, WiFi y switch). En empresas no alcanza con un routercito: el servicio lo corren **servidores dedicados** — Windows Server con el rol DHCP (con reservas, scopes y administración centralizada) o Linux con `isc-dhcp-server` / `dnsmasq`. Cuanto más grande la red, más importante es quién administra ese servicio.',
      },
      {
        type: 'content',
        title: 'The attack: rogue DHCP',
        titleEs: 'El ataque: DHCP falso (rogue DHCP)',
        body: 'DHCP does not authenticate servers: anyone who enters the LAN can answer the DISCOVERs with their own offer. In a **rogue DHCP** attack, the attacker sets up a fake server that hands out IPs with a **malicious gateway or DNS**. Victims accept happily (they keep browsing as usual) and now all their traffic crosses the attacker machine before going out — the same result as a MITM, but without even fighting for the ARP table. Defense: **DHCP snooping** on managed switches, which only accepts DHCP offers from trusted ports.',
        bodyEs: 'DHCP no autentica a los servidores: cualquiera que entre a la LAN puede responder los DISCOVER con su propia oferta. En un ataque **rogue DHCP**, el atacante levanta un servidor falso que entrega IPs con **gateway o DNS maliciosos**. Las víctimas aceptan contentas (siguen navegando igual) y ahora todo su tráfico pasa por la máquina del atacante antes de salir — el mismo resultado que un MITM, pero sin ni siquiera pelear por la tabla ARP. Defensa: **DHCP snooping** en switches administrables, que solo acepta ofertas DHCP de los puertos autorizados.',
      },
      {
        type: 'quiz',
        question: 'Why does a rogue DHCP attack work so easily on a LAN with no defenses?',
        questionEs: '¿Por qué un ataque de rogue DHCP funciona tan fácil en una LAN sin defensas?',
        options: [
          { es: 'Porque DHCP no autentica qué servidor puede responder', en: 'Because DHCP does not authenticate which server can answer' },
          { es: 'Porque las víctimas apagan su firewall', en: 'Because victims turn their firewall off' },
          { es: 'Porque las IPs estáticas están prohibidas', en: 'Because static IPs are forbidden' },
          { es: 'Porque el protocolo viaja cifrado', en: 'Because the protocol is encrypted' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'network-07',
    pathId: 'protocolos-ii',
    order: 2,
    title: 'NAT: how your whole network goes out with one IP',
    titleEs: 'NAT: cómo toda tu red sale a internet con una sola IP',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'En tu casa hay un teléfono, una tele, dos notebooks y tres celulares — y todos salen a internet con UNA sola IP pública. Eso es NAT, y sin él la mitad de las redes del mundo no existiría.',
            en: 'At your place there is a phone, a TV, two laptops and three cellphones — and they all hit the internet with ONE single public IP. That is NAT, and without it half the networks in the world would not exist.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/re202-nat.mp4',
        durationSec: 88,
        caption: 'NAT rewrites packet IPs between your private network and the internet. The translation table remembers who asked: outgoing connections match an entry, incoming ones do not and get dropped. PAT gives each device a different outgoing port on one public IP. Pros: saves IPs, hides topology, free firewall. Cons: breaks end-to-end. DNAT / port forwarding is the reverse: what the network chose to expose.',
        captionEs: 'NAT reescribe las IPs de cada paquete entre tu red privada e internet. La tabla de traducción recuerda quién preguntó: las conexiones salientes calzan, las entrantes no y se descartan. PAT da a cada equipo un puerto de salida distinto sobre una IP pública. Pros: ahorra IPs, oculta topología, firewall gratis. Contras: rompe extremo a extremo. DNAT / port forwarding es la dirección inversa: lo que la red decidió exponer.',
      },
      {
        type: 'content',
        title: 'What NAT is',
        titleEs: 'Qué es NAT',
        body: '**NAT** (Network Address Translation) is what the router does: it **rewrites the IP addresses of each packet** when it crosses between your private network and the internet. Private IPs (like 192.168.1.34) are not routable on the internet — no public route accepts them. NAT swaps them for the router\'s **public IP** before they go out, and when the answer comes back, it swaps it back and delivers it to the right device.',
        bodyEs: '**NAT** (Network Address Translation) es lo que hace el router: **reescribe las direcciones IP de cada paquete** al cruzar entre tu red privada e internet. Las IPs privadas (como 192.168.1.34) no son ruteables en internet — ninguna ruta pública las acepta. NAT las cambia por la **IP pública** del router antes de salir, y cuando llega la respuesta la vuelve a cambiar y se la entrega al dispositivo correcto.',
      },
      {
        type: 'content',
        title: 'The translation table: remembering who asked',
        titleEs: 'La tabla de traducción: recordar quién preguntó',
        body: 'When your PC (192.168.1.34:51234) opens a webpage, the router rewrites the packet to PUBLIC-IP:40001 and saves it in its **translation table**: "40001 = 192.168.1.34:51234". When the web server answers to PUBLIC-IP:40001, the router looks the table up and forwards the packet inside. Key idea: **NAT reacts to outgoing traffic** — connections born from the internet do not match any table entry and get dropped. That is why, by default, nobody from outside can initiate a connection to your devices.',
        bodyEs: 'Cuando tu PC (192.168.1.34:51234) abre una página, el router reescribe el paquete a IP-PÚBLICA:40001 y lo guarda en su **tabla de traducción**: "40001 = 192.168.1.34:51234". Cuando el servidor web contesta a IP-PÚBLICA:40001, el router mira la tabla y reenvía el paquete hacia adentro. Idea clave: **NAT reacciona al tráfico que sale** — las conexiones que nacen desde internet no calzan con ninguna entrada de la tabla y se descartan. Por eso, por defecto, nadie desde afuera puede iniciar una conexión hacia tus equipos.',
      },
      {
        type: 'content',
        title: 'PAT: many devices, one public IP',
        titleEs: 'PAT: muchos equipos, una IP pública',
        body: 'What makes it all fit in a single public IP is **PAT** (Port Address Translation), also called NAT overload or masquerading: each internal device gets a different outgoing **port** on the shared public IP. And the reason it exists: **IP addresses ran out** — with only ~4 billion IPv4 for the whole world, a home or a company cannot have one per device. IPv6 (the 24 trillion IPs) solves it, but until the migration finishes, NAT keeps everything alive.',
        bodyEs: 'Lo que hace que todo entre en una sola IP pública es **PAT** (Port Address Translation), también llamado NAT overload o masquerading: cada equipo interno obtiene un **puerto** de salida distinto sobre la IP pública compartida. Y existe por esto: **las direcciones IPv4 se agotaron** — con solo ~4 mil millones para todo el mundo, una casa o empresa no puede tener una por dispositivo. IPv6 (las 24 trillones de IPs) lo resuelve, pero hasta que la migración termine, NAT mantiene todo andando.',
      },
      {
        type: 'terminal-demo',
        command: 'sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE\nconntrack -L | grep 192.168.1.34',
        output: 'proto=6 src=192.168.1.34 dst=93.184.216.34 sport=51234 dport=443\n                  src=93.184.216.34 dst=203.0.113.7 sport=443 dport=40001\n# cada línea de conntrack es una fila activa de la tabla de traducción',
        explanation: 'MASQUERADE activates NAT for everything that leaves via eth0. `conntrack -L` shows the live table: each line maps an internal connection (192.168.1.34:51234) to the public side — you are looking at the router\'s memory at work.',
        explanationEs: 'MASQUERADE activa NAT para todo lo que sale por eth0. `conntrack -L` muestra la tabla en vivo: cada línea mapea una conexión interna (192.168.1.34:51234) con el lado público — estás viendo la memoria del router en acción.',
      },
      {
        type: 'content',
        title: 'Pros and cons',
        titleEs: 'Pros y contras',
        body: 'Pros: saves public IPs (one per entire network), hides the internal topology from the outside (an attacker cannot see your private IPs), and by default blocks outside-initiated connections — a free firewall. Cons: it **breaks the end-to-end model** (your machine is no longer directly reachable), complicates protocols that embed IPs in their payload (FTP, VoIP, P2P), and every connection consumes one entry of the translation table. When something on your network stops working "for no reason", NAT is often the suspect.',
        bodyEs: 'Pros: ahorra IPs públicas (una por red entera), oculta la topología interna de afuera (un atacante no ve tus IPs privadas) y por defecto bloquea conexiones iniciadas desde afuera — un firewall gratis. Contras: **rompe el modelo de extremo a extremo** (tu máquina ya no es alcanzable directamente), complica protocolos que llevan IPs dentro de su carga (FTP, VoIP, P2P), y cada conexión consume una entrada de la tabla de traducción. Cuando algo en tu red deja de andar "sin razón", NAT suele ser el sospechoso.',
      },
      {
        type: 'content',
        title: 'DNAT: letting the internet in (port forwarding)',
        titleEs: 'DNAT: dejar entrar a internet (port forwarding)',
        body: 'The reverse direction also exists: **DNAT** (Destination NAT) rewrites the destination of incoming packets — what everyone calls **port forwarding**. "Port 80 of the public IP → 192.168.1.50:80" makes the internal web server reachable from the internet, even if the LAN stays hidden. For a pentester: every DNAT rule is **a hole in the NAT wall** — scanning the public IP reveals what the network decided to expose. Combined with the previous lesson, the DMZ is nothing but controlled DNAT.',
        bodyEs: 'La dirección inversa también existe: **DNAT** (Destination NAT) reescribe el destino de los paquetes entrantes — lo que todos llaman **port forwarding**. "Puerto 80 de la IP pública → 192.168.1.50:80" hace alcanzable desde internet al servidor web interno, aunque la LAN siga oculta. Para un pentester: cada regla DNAT es **un agujero en la pared del NAT** — escanear la IP pública revela lo que la red decidió exponer. Combinando con la lección anterior, la DMZ no es más que DNAT controlado.',
      },
      {
        type: 'quiz',
        question: 'Why can nobody from the internet start a connection to your PC when NAT is active?',
        questionEs: '¿Por qué nadie de internet puede iniciar una conexión hacia tu PC cuando hay NAT activo?',
        options: [
          { es: 'Porque las conexiones entrantes no calzan en la tabla de traducción', en: 'Because incoming connections match no translation table entry' },
          { es: 'Porque tu PC no tiene IP pública asignada', en: 'Because your PC has no public IP assigned' },
          { es: 'Porque el firewall de Windows las bloquea', en: 'Because the Windows firewall blocks them' },
          { es: 'Porque PAT cifra los paquetes entrantes', en: 'Because PAT encrypts incoming packets' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'network-08',
    pathId: 'protocolos-ii',
    order: 3,
    title: 'DNS: how the internet looks up names',
    titleEs: 'DNS: cómo busca los nombres la internet',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Anotás "google.com" y listo. Pero atrás hay una cadena de servidores preguntándose entre sí hasta encontrar la IP correcta. DNS es el servicio más importante que nadie ve — y cuando falla, parece que se cayó toda la internet.',
            en: 'You type "google.com" and you are done. But behind it there is a chain of servers asking each other until they find the right IP. DNS is the most important service nobody sees — and when it fails, it looks like the whole internet went down.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/re203-dns.mp4',
        durationSec: 102,
        caption: 'DNS translates names to IPs (google.com → 142.250.78.78) over UDP 53, falling back to TCP. The resolution chain: root servers → TLD servers (.com) → authoritative server. Answers carry a TTL to be cached. Record types: A (IPv4), AAAA (IPv6), MX (mail), NS (authoritative), CNAME (alias), TXT. Attacks: cache poisoning, DNS hijacking, exfiltration. Defenses: DNSSEC, DNS over HTTPS.',
        captionEs: 'DNS traduce nombres a IPs (google.com → 142.250.78.78) por UDP 53, con fallback a TCP. La cadena de resolución: root servers → servidores TLD (.com) → servidor autoritativo. Las respuestas llevan un TTL para cachear. Registros: A (IPv4), AAAA (IPv6), MX (correo), NS (autoritativo), CNAME (alias), TXT. Ataques: envenenamiento de caché, hijacking, exfiltración. Defensas: DNSSEC, DNS sobre HTTPS.',
      },
      {
        type: 'content',
        title: 'What it does',
        titleEs: 'Qué hace',
        body: '**DNS** (Domain Name System) translates **names into IP addresses**: `google.com` → `142.250.78.78`. Machines only speak in IPs, but humans remember names, not 4 numbers. It is a worldwide, distributed database: no single server knows everything, so servers ask each other. Detail: DNS works over **UDP port 53** (fast, one question one answer) and falls back to **TCP** when the answer is too big.',
        bodyEs: '**DNS** (Domain Name System) traduce **nombres a direcciones IP**: `google.com` → `142.250.78.78`. Las máquinas solo hablan en IPs, pero las personas recordamos nombres, no 4 números. Es una base de datos mundial y distribuida: ningún servidor sabe todo, así que los servidores se preguntan entre sí. Detalle: DNS trabaja sobre **UDP puerto 53** (rápido, una pregunta una respuesta) y cae a **TCP** cuando la respuesta es demasiado grande.',
      },
      {
        type: 'content',
        title: 'The resolution chain',
        titleEs: 'La cadena de resolución',
        body: 'When you type an address, your **resolver** (the DNS server configured on your network, like 8.8.8.8 or your ISP one) does the legwork: 1) asks the **root servers** (13 worldwide), which say "I do not know google.com, but the ones who handle .com are..."; 2) asks the **TLD servers** (.com), which answer "the ones responsible for google.com are..."; 3) asks the **authoritative server** for the domain, which finally says "google.com is 142.250.78.78". Your resolver returns you that answer and keeps a copy. Three questions before the browser sends a single packet.',
        bodyEs: 'Cuando escribís una dirección, tu **resolver** (el servidor DNS configurado en tu red, como 8.8.8.8 o el de tu proveedor) hace el trabajo: 1) les pregunta a los **root servers** (13 en el mundo), que dicen "no sé google.com, pero los que manejan .com son..."; 2) les pregunta a los **servidores TLD** (.com), que responden "los responsables de google.com son..."; 3) les pregunta a los **servidores autoritativos** del dominio, que al fin dicen "google.com es 142.250.78.78". Tu resolver te devuelve esa respuesta y guarda una copia. Tres preguntas antes de que el navegador mande un solo paquete.',
      },
      {
        type: 'content',
        title: 'Cache and TTL: why it feels instant',
        titleEs: 'Caché y TTL: por qué parece instantáneo',
        body: 'If every name looked had to climb the full chain, the internet would be too slow. Every answer comes with a **TTL** (Time To Live): how many seconds it can be cached. Your OS keeps a cache, your router keeps its own, and every resolver in the chain keeps one too. That is why the second visit is instant — and that is also why DNS changes take a while to propagate: while old copies live out their TTL, part of the world answers with the old IP.',
        bodyEs: 'Si cada búsqueda tuviera que subir toda la cadena, la internet sería lentísima. Cada respuesta viene con un **TTL** (Time To Live): cuántos segundos se puede cachear. Tu SO mantiene una caché, tu router tiene la suya, y cada resolver de la cadena también. Por eso la segunda visita es instantánea — y también por eso los cambios de DNS tardan en propagarse: mientras las copias viejas agotan su TTL, parte del mundo sigue respondiendo la IP antigua.',
      },
      {
        type: 'terminal-demo',
        command: 'dig example.com +nocmd',
        output: ';; QUESTION SECTION:\n;example.com.                   IN      A\n\n;; ANSWER SECTION:\nexample.com.            86400   IN      A       93.184.216.34\n\n;; Query time: 32 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8)',
        explanation: 'dig shows a DNS answer up close. The ANSWER SECTION is the whole point: the A record of example.com and its IP. The 86400 next to it is the TTL in seconds (24 hours of cache). SERVER: 8.8.8.8#53 tells you which resolver did the legwork for you.',
        explanationEs: 'dig muestra una respuesta DNS de cerca. La ANSWER SECTION es lo que importa: el registro A de example.com y su IP. El 86400 al lado es el TTL en segundos (24 horas de caché). SERVER: 8.8.8.8#53 te dice qué resolver hizo el trabajo por vos.',
      },
      {
        type: 'content',
        title: 'The main record types',
        titleEs: 'Los tipos de registro principales',
        body: 'DNS answers many things, not only IPs: `A` — name to IPv4. `AAAA` — name to IPv6. `MX` — which server receives the mail for the domain. `NS` — who is authoritative for the zone. `CNAME` — alias that points to another name. `TXT` — free text, used to prove domain ownership and carry anti-spam policies. In a pentest, DNS enumeration is recon phase gold: subdomains, mail servers and TXT records reveal internal structure before you even touch a service.',
        bodyEs: 'DNS responde muchas cosas, no solo IPs: `A` — nombre a IPv4. `AAAA` — nombre a IPv6. `MX` — qué servidor recibe el correo del dominio. `NS` — quién es autoritativo para la zona. `CNAME` — alias que apunta a otro nombre. `TXT` — texto libre, usado para probar la propiedad del dominio y llevar políticas anti-spam. En un pentest, la enumeración DNS es oro de la fase de recon: subdominios, servidores de correo y registros TXT revelan estructura interna antes de tocar un solo servicio.',
      },
      {
        type: 'content',
        title: 'Attacks: poisoning, hijacking and exfiltration',
        titleEs: 'Ataques: envenenamiento, secuestro y exfiltración',
        body: 'DNS was built on trust: if a resolver accepts a forged answer, it serves it to everyone during the TTL — that is **cache poisoning** (the classic Kaminsky attack). In **DNS hijacking**, the attacker controls the DNS configured on the victims (their router, or the rogue DHCP from lesson 1): every name resolves wherever the attacker wants, with valid locks and all. And it is also a tunnel: sensitive data can leave the network hidden inside subdomain queries (exfiltration), because almost no firewall blocks port 53 outbound. Defenses: **DNSSEC** (signed answers), **DNS over HTTPS/TLS**, and monitoring anomalous query patterns.',
        bodyEs: 'DNS se construyó con confianza: si un resolver acepta una respuesta falsificada, se la sirve a todos durante el TTL — eso es el **envenenamiento de caché** (el clásico ataque Kaminsky). En el **secuestro de DNS (hijacking)** el atacante controla el DNS que usan las víctimas (su router, o el rogue DHCP de la lección 1): todos los nombres resuelven a donde él quiera, con candados válidos y todo. Y también es un túnel: puede sacarse datos sensibles de la red escondidos dentro de consultas de subdominios (exfiltración), porque casi ningún firewall bloquea el puerto 53 saliente. Defensas: **DNSSEC** (respuestas firmadas), **DNS sobre HTTPS/TLS**, y monitorear patrones de consultas anómalos.',
      },
      {
        type: 'quiz',
        question: 'In the resolution chain, which server gives the definitive answer for the domain?',
        questionEs: 'En la cadena de resolución, ¿qué servidor da la respuesta definitiva del dominio?',
        options: [
          { es: 'El root server', en: 'The root server' },
          { es: 'El servidor TLD (.com)', en: 'The TLD server (.com)' },
          { es: 'El servidor autoritativo del dominio', en: "The domain's authoritative server" },
          { es: 'El caché del navegador', en: "The browser's cache" },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'network-09',
    pathId: 'protocolos-ii',
    order: 4,
    title: 'VPN: encrypted tunnels that extend the network',
    titleEs: 'VPN: túneles cifrados que extienden la red',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Una empresa tiene una sede en Buenos Aires y otra en Madrid. Sin pagar fibra dedicada, sus redes funcionan como si fueran una sola — y un empleado en un café puede entrar como si estuviera en la oficina. Eso es una VPN: un túnel cifrado sobre internet que hace de internet tu red.',
            en: 'A company has one office in Buenos Aires and another in Madrid. Without paying for dedicated fiber, their networks behave as if they were one — and an employee in a café can walk in as if sitting in the office. That is a VPN: an encrypted tunnel over the internet that turns the internet into your network.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/re204-vpn.mp4',
        durationSec: 86,
        caption: 'A VPN is an encrypted tunnel over the internet. Three jobs: confidentiality (encrypted), integrity (authenticated) and authenticity (only credentialed users enter). Uses: site-to-site to join offices, remote access, segmentation. Protocols: IPsec (layer 3, site-to-site), OpenVPN (flexible), WireGuard (fast), TLS VPN (browser). It protects the path, not the destination: a compromised VPN credential is a direct entry to the network.',
        captionEs: 'Una VPN es un túnel cifrado sobre internet. Tres trabajos: confidencialidad (cifrado), integridad (autenticado) y autenticidad (solo entran usuarios con credenciales). Usos: site-to-site para unir sedes, acceso remoto, segmentación. Protocolos: IPsec (capa 3, site-to-site), OpenVPN (flexible), WireGuard (rápido), TLS VPN (navegador). Protege el camino, no el destino: una credencial de VPN comprometida es una entrada directa a la red.',
      },
      {
        type: 'content',
        title: 'What a VPN is',
        titleEs: 'Qué es una VPN',
        body: '**VPN** (Virtual Private Network) is an **encrypted tunnel built over the internet**. It is "virtual" because it uses no dedicated cable, and "private" because everything inside travels encrypted and authenticated. Your device negotiates a secure session with a **VPN server**: from there on, every packet is wrapped and only unwrapped on the other end. The classic example: a remote worker connects to the office VPN server and, for the network, sits down in the office.',
        bodyEs: '**VPN** (Virtual Private Network) es un **túnel cifrado construido sobre internet**. Es "virtual" porque no usa cables dedicados, y "privada" porque todo lo que viaja adentro va cifrado y autenticado. Tu equipo negocia una sesión segura con un **servidor VPN**: desde ese momento, cada paquete se envuelve y solo se desenvuelve en el otro extremo. El ejemplo clásico: un empleado remoto se conecta al servidor VPN de la oficina y, a los ojos de la red, queda sentado en la oficina.',
      },
      {
        type: 'content',
        title: 'The three jobs a VPN does',
        titleEs: 'Los tres trabajos que hace una VPN',
        body: 'VPN provides three properties, and each is a different reason to use it. **Confidentiality**: the tunnel is encrypted, so anyone sniffing on the path only sees noise. **Integrity**: authentication ensures no one can tamper with the packets in transit. **Authenticity**: only users with credentials enter — the network stops being open to anyone who plugs a cable. In short, VPN turns the hostile internet into a transport you can trust, without changing the network itself.',
        bodyEs: 'VPN da tres propiedades, y cada una es una razón distinta para usarla. **Confidencialidad**: el túnel es cifrado, así que cualquiera que sniffee el camino solo ve ruido. **Integridad**: la autenticación asegura que nadie pueda alterar los paquetes en tránsito. **Autenticidad**: solo entran usuarios con credenciales — la red deja de estar abierta a quien conecte un cable. En resumen, la VPN convierte la internet hostil en un transporte confiable, sin cambiar la red en sí.',
      },
      {
        type: 'content',
        title: 'Extending and segmenting the network',
        titleEs: 'Extender y segmentar la red',
        body: 'The biggest organizational use is **connecting sites**: a site-to-site VPN joins two offices and their LANs become one, as if the internet were an internal bridge. It also **extends access** to remote workers and teleworkers. And it helps **segment**: instead of opening a whole LAN to the internet, you can reach only the machines behind the VPN — that is, the VPN itself becomes a segment, a controlled door with credentials. Keep this idea: in the DMZ lesson you will see the other side of exposure control.',
        bodyEs: 'El mayor uso organizacional es **unir sedes**: una VPN site-to-site conecta dos oficinas y sus LAN se vuelven una, como si internet fuera un puente interno. También **extiende el acceso** a teletrabajadores y personal remoto. Y ayuda a **segmentar**: en vez de abrir toda una LAN a internet, se alcanza solo a las máquinas detrás de la VPN — es decir, la VPN misma se vuelve un segmento, una puerta controlada con credenciales. Guardate la idea: en la lección de DMZ vas a ver la otra cara del control de exposición.',
      },
      {
        type: 'content',
        title: 'The protocols behind it',
        titleEs: 'Los protocolos que la sostienen',
        body: 'A tunnel needs a protocol to agree on how to encrypt, and several coexist. **IPsec**: the classic, operates at layer 3, encrypts and authenticates the whole packet; standard for site-to-site. **OpenVPN**: very flexible, works over UDP or TCP, widely used for remote access. **WireGuard**: modern, light and very fast, gaining ground everywhere. **TLS VPN** (SSL VPN): enters through the browser itself, ideal when you cannot install a client. In pentesting you see all of them: the version of the VPN server you find on a scan is a lead for reconnaissance.',
        bodyEs: 'Un túnel necesita un protocolo para acordar cómo cifrar, y coexisten varios. **IPsec**: el clásico, opera en capa 3, cifra y autentica el paquete entero; estándar para site-to-site. **OpenVPN**: muy flexible, anda sobre UDP o TCP, muy usado para acceso remoto. **WireGuard**: moderno, liviano y muy rápido, ganando terreno en todos lados. **TLS VPN** (SSL VPN): entra por el propio navegador, ideal cuando no se puede instalar cliente. En pentesting se ven todos: la versión del servidor VPN que aparece en un escaneo es una pista para el reconocimiento.',
      },
      {
        type: 'terminal-demo',
        command: 'sudo openvpn --config cliente.ovpn',
        output: 'OpenVPN 2.6.3 x86_64-pc-linux-gnu\nControl Channel Authentication: using /etc/openvpn/ca.crt\nTLS: Initial handshake complete\nData Channel: using negotiated cipher AES-256-GCM\nInitialization Sequence Completed\ninet 10.8.0.6/24',
        explanation: 'OpenVPN establishes the tunnel: it authenticates with the certificate, negotiates the cipher (AES-256-GCM) and assigns you an IP inside the remote network (10.8.0.6). That new IP is the proof you are now "inside" the other LAN.',
        explanationEs: 'OpenVPN establece el túnel: se autentica con el certificado, negocia el cifrado (AES-256-GCM) y te asigna una IP dentro de la red remota (10.8.0.6). Esa IP nueva es la prueba de que ya estás "adentro" de la otra LAN.',
      },
      {
        type: 'content',
        title: 'What VPN does and does not protect you from',
        titleEs: 'De qué te protege la VPN y de qué no',
        body: 'VPN encrypts the **path**, the same way HTTPS protects the channel in the web-hacking lesson: what it hides is the transport, not the destination. It protects you from someone reading your traffic on an open WiFi or on the intermediate path — and from NAT-based visibility. It does **not** protect you from what exists at the other end: if you access a machine through the VPN and that machine has its own weaknesses, the tunnel does nothing for you. For the pentester: a compromised VPN credential is an entry straight into the network, and a VPN server is a high-value target. Defenses: MFA, client certificates, and keeping VPN servers patched.',
        bodyEs: 'VPN cifra el **camino**, igual que HTTPS protege el canal en la lección de hacking web: lo que esconde es el transporte, no el destino. Te protege de que lean tu tráfico en una WiFi abierta o en el camino intermedio — y de la visibilidad que da el NAT. **No** te protege de lo que existe en el otro extremo: si entrás a una máquina por la VPN y esa máquina tiene sus propias debilidades, el túnel no hace nada por vos. Para el pentester: una credencial de VPN comprometida es una entrada directa a la red, y un servidor VPN es un objetivo de alto valor. Defensas: MFA, certificados de cliente y mantener parchados los servidores VPN.',
      },
      {
        type: 'quiz',
        question: 'Why does a VPN keep the LAN of two distant offices behaving as one network?',
        questionEs: '¿Por qué una VPN hace que las LAN de dos oficinas lejanas funcionen como una sola red?',
        options: [
          { es: 'Porque instala un cable de fibra dedicado entre las sedes', en: 'Because it installs a dedicated fiber cable between sites' },
          { es: 'Porque crea un túnel cifrado sobre internet que une ambos lados', en: 'Because it creates an encrypted tunnel over the internet joining both sides' },
          { es: 'Porque reemplaza las IPs privadas por públicas', en: 'Because it replaces private IPs with public ones' },
          { es: 'Porque apaga los firewalls de ambas sedes', en: 'Because it disables both offices\' firewalls' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'network-04',
    pathId: 'protocolos-ii',
    order: 5,
    title: 'DMZ: separating the public from the private',
    titleEs: 'DMZ: separando lo público de lo privado',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Cuando construís una red que da servicios al mundo, no podés juntar todo en el mismo saco. La DMZ es esa separación: lo público adelante, lo privado atrás, y un firewall en el medio que decide quién entra.',
            en: "When you build a network that serves the world, you can't throw everything in the same bag. The DMZ is that separation: the public stuff in front, the private stuff behind, and one firewall in the middle deciding who comes in.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/re205-dmz.mp4',
        durationSec: 77,
        caption: 'DMZ = Demilitarized Zone: a network segment between the internet and your internal LAN. Public-facing machines (web, mail) live there; databases and workstations live in the LAN behind the firewall. Inbound only allows DMZ ports (80/443, 25); outbound is normal. If the web server is pwned, the attacker is stuck in the DMZ. For pentesting: land on the DMZ, then pivot toward the LAN.',
        captionEs: 'DMZ = Zona Desmilitarizada: un segmento de red entre internet y tu LAN interna. Las máquinas públicas (web, correo) viven ahí; las bases de datos y PCs viven en la LAN detrás del firewall. Entrante solo permite puertos de la DMZ (80/443, 25); saliente normal. Si hackean el web, el atacante queda atrapado en la DMZ. Para pentesting: aterrizás en la DMZ y después pivotás hacia la LAN.',
      },
      {
        type: 'content',
        title: 'The DMZ concept',
        titleEs: 'El concepto de DMZ',
        body: "DMZ = Demilitarized Zone. It's a network segment **between the internet and your internal LAN**. Machines that must be reachable from outside — web servers, mail servers — live here. Machines that must NEVER be reached from outside — databases, workstations — live in the LAN, protected by the firewall. If the web server gets pwned, the attacker is stuck in the DMZ, not inside your LAN.",
        bodyEs: "DMZ = Zona Desmilitarizada. Es un segmento de red **entre internet y tu LAN interna**. Las máquinas que deben ser alcanzables desde afuera — servidores web, de correo — viven ahí. Las que NUNCA deben alcanzarse desde afuera — bases de datos, estaciones de trabajo — viven en la LAN, protegidas por el firewall. Si hackean el servidor web, el atacante queda atrapado en la DMZ, no dentro de tu LAN.",
      },
      {
        type: 'content',
        title: 'The two faces of the firewall',
        titleEs: 'Las dos caras del firewall',
        body: 'The perimeter firewall reads every packet in both directions. **Inbound**: allows only the DMZ ports (80/443 for web, 25 for mail) — everything aimed at the LAN is dropped. **Outbound**: the LAN and the DMZ can reach the internet normally. That asymmetry is what makes the DMZ architecture work.',
        bodyEs: 'El firewall perimetral lee cada paquete en ambas direcciones. **Entrante**: permite solo los puertos de la DMZ (80/443 para web, 25 para correo) — todo lo que apunte a la LAN se descarta. **Saliente**: la LAN y la DMZ pueden salir a internet con normalidad. Esa asimetría es lo que hace funcionar la arquitectura DMZ.',
      },
      {
        type: 'interactive-demo',
        demoKind: 'network-dmz',
        instructions: 'Connect internet to the firewall, then hang each server on it: Web and Mail in the public DMZ, Workstation and Database in the private LAN. Watch the DMZ devices turn "public" and the LAN ones stay "protected".',
        instructionsEs: 'Conectá internet al firewall y colgá cada servidor de él: Web y Correo en la DMZ pública, PC y Base de datos en la LAN privada. Mirá cómo los dispositivos de la DMZ quedan "públicos" y los de la LAN siguen "protegidos".',
      },
      {
        type: 'terminal-demo',
        command: 'sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j DNAT --to-destination 10.0.1.10\nsudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 3306 -j DROP',
        output: '# El puerto 80 (web, DMZ 10.0.1.0/24) se expone hacia adentro\n# El puerto 3306 (MySQL, LAN 10.0.2.0/24) se descarta: base de datos protegida',
        explanation: 'Two NAT rules: port 80 is forwarded to the DMZ web server; port 3306 is dropped, so the database is reachable only from inside the LAN.',
        explanationEs: 'Dos reglas de NAT: el puerto 80 se reenvía al servidor web de la DMZ; el 3306 se descarta, así la base de datos solo se alcanza desde dentro de la LAN.',
      },
      {
        type: 'content',
        title: 'Why it matters for pentesting',
        titleEs: 'Por qué importa para el pentesting',
        body: 'When you land on a DMZ server, your job is to **pivot**: turn the public box into a stepping stone toward the LAN. And the first thing a pentester maps on a target network? "Where is the DMZ?" — often a web server with the company\'s guts one click away.',
        bodyEs: 'Cuando aterrizás en un servidor de la DMZ, tu trabajo es **pivotar**: convertir la máquina pública en un trampolín hacia la LAN. Y lo primero que mapea un pentester en la red objetivo: "¿dónde está la DMZ?" — a menudo un servidor web con las entrañas de la empresa a un clic.',
      },
      {
        type: 'quiz',
        question: 'Where should a MySQL database live?',
        questionEs: '¿Dónde debería vivir una base de datos MySQL?',
        options: [
          { es: 'En la DMZ, necesita ser rápida', en: 'In the DMZ, it needs to be fast' },
          { es: 'En la LAN, protegida por el firewall', en: 'In the LAN, protected by the firewall' },
          { es: 'En la nube de internet', en: 'On the internet cloud' },
          { es: 'No importa', en: "It doesn't matter" },
        ],
        correctIndex: 1,
      },
    ],
  },
];
