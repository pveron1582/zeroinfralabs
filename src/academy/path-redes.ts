// ── academy/path-redes.ts ──────────────────────────────────────────
// Path: Fundamentos de redes — conceptos base antes de tocar protocolos.

import type { Lesson } from '../types';

export const REDES_LESSONS: Lesson[] = [
  {
    id: 'redes-01',
    pathId: 'redes',
    order: 1,
    title: 'What is a network? Types: LAN, MAN, WAN and VPN',
    titleEs: '¿Qué es una red? Tipos: LAN, MAN, WAN y VPN',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Antes de escanear nada, necesitás entender el mapa: qué es una red y qué tamaños puede tener. Esta lección define las reglas del juego antes de jugarlo.',
            en: 'Before you scan anything, you need to understand the map: what a network is and what sizes it can take. This lesson sets the rules of the game before you play it.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/re01-network-types.mp4',
        srcEn: '/videos/en/re01-network-types.mp4',
        durationSec: 59,
        caption: 'A network is connected devices sharing data. Each device is a node: wired (ethernet, fiber) or wireless (wifi). By size: PAN (personal), LAN (home/office), MAN (city), WAN (countries — the internet). The VPN is an encrypted tunnel over the internet, not a physical network.',
        captionEs: 'Una red es un conjunto de dispositivos conectados para compartir datos. Cada equipo es un nodo: por cable (ethernet, fibra) o inalámbrico (wifi). Por tamaño: PAN (personal), LAN (casa/oficina), MAN (ciudad), WAN (países — internet). La VPN es un túnel cifrado sobre internet, no una red física.',
      },
      {
        type: 'content',
        title: 'What is a network?',
        titleEs: '¿Qué es una red?',
        body: 'A network is a group of devices — computers, phones, servers, printers — connected to each other to share data and resources. Every connected device is a `node`. The connection can be wired (ethernet, fiber optic) or wireless (wifi). The core idea: a network exists to share — files, printers, internet access.',
        bodyEs: 'Una red es un conjunto de dispositivos — computadoras, celulares, servidores, impresoras — conectados entre sí para compartir datos y recursos. Cada dispositivo conectado es un `nodo`. La conexión puede ser por cable (ethernet, fibra óptica) o inalámbrica (wifi). La idea central: una red existe para compartir — archivos, impresoras, acceso a internet.',
      },
      {
        type: 'content',
        title: 'Types by size',
        titleEs: 'Tipos por tamaño',
        body: '`LAN` (Local Area Network): a house, office or building — the network your switch and wifi build. `MAN` (Metropolitan): a city or a university campus — it joins several LANs. `WAN` (Wide Area): joins cities and countries — the biggest one of all is the internet. `PAN` (Personal): your own personal space, like the bluetooth between your phone and your earbuds.',
        bodyEs: '`LAN` (Red de Área Local): una casa, oficina o edificio — la red que arman tu switch y tu wifi. `MAN` (Metropolitana): una ciudad o un campus universitario — une varias LAN. `WAN` (Red de Área Amplia): une ciudades y países — la más grande de todas es internet. `PAN` (Personal): tu propio espacio personal, como el bluetooth entre tu celular y tus auriculares.',
      },
      {
        type: 'content',
        title: 'Other networks: the VPN',
        titleEs: 'Otras redes: la VPN',
        body: 'A `VPN` is not a physical network: it is an encrypted tunnel that runs over the internet and makes your device look like it is inside another network. The remote employee enters the office as if they were sitting there; the pentester uses it to hide where the traffic comes from.',
        bodyEs: 'Una `VPN` no es una red física: es un túnel cifrado que corre sobre internet y hace que tu equipo parezca estar dentro de otra red. El empleado remoto entra a la oficina como si estuviera sentado ahí; el pentester la usa para ocultar de dónde viene su tráfico.',
      },
      {
        type: 'quiz',
        question: 'Which of these is the biggest WAN of all?',
        questionEs: '¿Cuál de estas es la WAN más grande de todas?',
        options: [
          { es: 'La LAN de una oficina', en: 'The LAN of an office' },
          { es: 'La red de un campus', en: 'A university campus network' },
          { es: 'Internet', en: 'The internet' },
          { es: 'Una red bluetooth', en: 'A bluetooth network' },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'redes-02',
    pathId: 'redes',
    order: 2,
    title: 'How networks communicate: public and private IP addresses',
    titleEs: 'Cómo se comunican: direcciones IP públicas y privadas',
    readingMinutes: 7,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Cada equipo conectado tiene una dirección, como cada casa en una calle. Esta lección explica qué es esa dirección y la diferencia entre la que ves hacia adentro y la que ve internet.',
            en: 'Every connected device has an address, like every house on a street. This lesson explains what that address is and the difference between what you see inside and what the internet sees.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/re02-ip-addresses.mp4',
        srcEn: '/videos/en/re02-ip-addresses.mp4',
        durationSec: 72,
        caption: 'The IP is the postal address of each device: four numbers from 0 to 255 separated by dots. Public IPs are unique on the internet; private ones (10.x, 172.16–31.x, 192.168.x) stay inside your network. NAT lets the router translate all private addresses into a single public one.',
        captionEs: 'La IP es la dirección postal de cada equipo: cuatro números de 0 a 255 separados por puntos. Las públicas son únicas en internet; las privadas (10.x, 172.16–31.x, 192.168.x) quedan dentro de tu red. NAT deja que el router traduzca todas las privadas a una sola pública.',
      },
      {
        type: 'content',
        title: 'The IP address',
        titleEs: 'La dirección IP',
        body: 'Every device on a network has an IP address: a unique number that lets data be delivered to it, like the postal address of your house. Format: four numbers from 0 to 255 separated by dots: `192.168.1.10`. If two devices use the same IP on the same network, they collide — that is called an IP conflict.',
        bodyEs: 'Cada dispositivo de la red tiene una dirección IP: un número único que permite entregarle datos, como la dirección postal de tu casa. Formato: cuatro números de 0 a 255 separados por puntos: `192.168.1.10`. Si dos equipos usan la misma IP en la misma red, se pisan — eso se llama conflicto de IP.',
      },
      {
        type: 'content',
        title: 'Public vs private',
        titleEs: 'Públicas vs privadas',
        body: '`Public`: unique across the whole internet; your ISP assigns them and any device in the world can reach them. `Private`: internal to your network; they cannot be reached from the internet directly. Classic private ranges: `10.x.x.x`, `172.16.x.x` to `172.31.x.x`, `192.168.x.x`. At home: the router holds the public IP facing out and hands out private ones inside (wifi, ethernet).',
        bodyEs: '`Públicas`: únicas en todo internet; las asigna tu proveedor y cualquier equipo del mundo puede alcanzarlas. `Privadas`: internas de tu red; no se pueden alcanzar desde internet directamente. Rangos privados clásicos: `10.x.x.x`, `172.16.x.x` a `172.31.x.x`, `192.168.x.x`. En una casa: el router tiene la IP pública hacia afuera y reparte privadas hacia adentro (wifi, ethernet).',
      },
      {
        type: 'content',
        title: 'The translation: NAT',
        titleEs: 'La traducción: NAT',
        body: 'Private IPs cannot go out to the internet as they are. The router uses `NAT` (Network Address Translation) to translate the private addresses into its single public one. That is why a whole house can browse with one public IP. You will meet NAT again in the router lesson.',
        bodyEs: 'Las IPs privadas no pueden salir a internet tal cual. El router usa `NAT` (Traducción de Direcciones de Red) para traducir las direcciones privadas a su única pública. Por eso toda una casa puede navegar con una sola IP pública. Te vas a volver a encontrar con NAT en la lección del router.',
      },
      {
        type: 'terminal-demo',
        command: 'ip addr',
        output: '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0',
        explanation: 'The machine has a private IP: 192.168.1.10, a typical home network address. 127.0.0.1 is the loopback — the machine talking to itself.',
        explanationEs: 'La máquina tiene una IP privada: 192.168.1.10, una dirección típica de red doméstica. 127.0.0.1 es el loopback — la máquina hablándose a sí misma.',
      },
      {
        type: 'quiz',
        question: 'Which of these is a private IP address?',
        questionEs: '¿Cuál de estas es una dirección IP privada?',
        options: [
          { es: '8.8.8.8', en: '8.8.8.8' },
          { es: '192.168.1.10', en: '192.168.1.10' },
          { es: '1.1.1.1', en: '1.1.1.1' },
          { es: '203.0.113.7', en: '203.0.113.7' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'redes-03',
    pathId: 'redes',
    order: 3,
    title: 'Basic devices: hub, switch and router + network topologies',
    titleEs: 'Dispositivos básicos: hub, switch y router + topologías',
    readingMinutes: 10,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'La LAN moderna tiene tres protagonistas: el hub viejo, el switch y el router. Y las redes se dibujan con formas — las topologías. Esta lección te deja armando una con tus manos.',
            en: 'The modern LAN has three main characters: the old hub, the switch and the router. And networks are drawn with shapes — the topologies. This lesson gets you building one with your own hands.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/re03-devices-topologies.mp4',
        srcEn: '/videos/en/re03-devices-topologies.mp4',
        durationSec: 74,
        caption: 'Hub (layer 1, repeats everything), switch (layer 2, delivers by MAC) and router (layer 3, joins networks, NAT, DHCP). Topologies are the shape of the network: bus, star (the most used), ring and mesh. Where you sit in the topology decides what you can see.',
        captionEs: 'Hub (capa 1, repite todo), switch (capa 2, entrega por MAC) y router (capa 3, une redes, NAT, DHCP). Las topologías son la forma de la red: bus, estrella (la más usada), anillo y malla. Tu posición en la topología define qué podés ver.',
      },
      {
        type: 'content',
        title: 'The three devices',
        titleEs: 'Los tres aparatos',
        body: '`Hub`: layer 1. It repeats everything it receives to all its ports — inefficient and almost unused today, but it shows up in old texts and you should know it. `Switch`: layer 2. It learns which MAC address lives on each port and delivers data only to the destination — the heart of modern LANs. `Router`: layer 3. It connects different networks to each other and out to the internet; it does NAT and hands out IPs (DHCP).',
        bodyEs: '`Hub`: capa 1. Repite todo lo que recibe a todos sus puertos — ineficiente y casi sin uso hoy, pero aparece en textos viejos y conviene conocerlo. `Switch`: capa 2. Aprende qué dirección MAC vive en cada puerto y entrega los datos solo al destino — el corazón de las LAN modernas. `Router`: capa 3. Conecta redes distintas entre sí y sale a internet; hace NAT y reparte IPs (DHCP).',
      },
      {
        type: 'content',
        title: 'Topologies: the shape of the network',
        titleEs: 'Topologías: la forma de la red',
        body: '`Bus`: one single cable shared by everyone; if it breaks, the whole network falls. `Star`: every device connects to a central point — usually a switch; if one cable fails, only that device falls: the most used today. `Ring`: each device connects to the next one, forming a circle; data travels in one direction. `Mesh`: each node connects to several others — the basis of the internet; resilient but expensive.',
        bodyEs: '`Bus`: un único cable compartido por todos; si se corta, cae toda la red. `Estrella`: todos los equipos conectan a un punto central — normalmente un switch; si falla un cable, solo cae ese equipo: la más usada hoy. `Anillo`: cada equipo conecta con el siguiente formando un círculo; los datos viajan en una sola dirección. `Malla`: cada nodo conecta con varios otros — la base de internet; resistente pero cara.',
      },
      {
        type: 'interactive-demo',
        demoKind: 'network-home',
        instructions: 'Build your own star network: connect the PC, the laptop and the server to the switch, the switch to the router, the router to the firewall and the firewall to the internet. What you just built is a star topology.',
        instructionsEs: 'Armá tu propia red en estrella: conectá la PC, la laptop y el servidor al switch, el switch al router, el router al firewall y el firewall a internet. Lo que acabás de armar es una topología en estrella.',
      },
      {
        type: 'content',
        title: 'Why this matters for pentesting',
        titleEs: 'Por qué importa para el pentesting',
        body: 'When you scan a network, you are asking the switch who is connected. When you attack something outside your LAN, the traffic crosses routers. Knowing where you are in the topology tells you what you can see and what you cannot.',
        bodyEs: 'Cuando escaneás una red, le estás preguntando al switch quién está conectado. Cuando atacás algo fuera de tu LAN, el tráfico cruza routers. Saber en qué punto de la topología estás te dice qué ves y qué no.',
      },
      {
        type: 'quiz',
        question: 'Which device sits at the center of a star topology?',
        questionEs: '¿Qué dispositivo está en el centro de una topología en estrella?',
        options: [
          { es: 'El hub', en: 'The hub' },
          { es: 'El switch', en: 'The switch' },
          { es: 'El módem', en: 'The modem' },
          { es: 'El cable', en: 'The cable' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'redes-04',
    pathId: 'redes',
    order: 4,
    title: 'OSI and TCP/IP models: the layers',
    titleEs: 'Modelo OSI y TCP/IP: las capas',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Cuando escuchás "capa 2" o "capa 3" en un lab, ¿de qué hablan? De los pisos de un edificio imaginario que ordena la comunicación. Esta lección te da el mapa mental.',
            en: 'When you hear "layer 2" or "layer 3" in a lab, what are they talking about? The floors of an imaginary building that organizes communication. This lesson gives you the mental map.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/re04-osi-layers.mp4',
        srcEn: '/videos/en/re04-osi-layers.mp4',
        durationSec: 73,
        caption: 'OSI splits communication into 7 layers with one job each: application, presentation, session, transport, network, data link, physical. The internet runs on TCP/IP, which merges them into 4. "Layer 2" or "layer 3" always means the OSI model.',
        captionEs: 'OSI divide la comunicación en 7 capas con un trabajo cada una: aplicación, presentación, sesión, transporte, red, enlace, física. Internet corre con TCP/IP, que las junta en 4. "Capa 2" o "capa 3" siempre significan el modelo OSI.',
      },
      {
        type: 'content',
        title: 'Why layers?',
        titleEs: '¿Por qué capas?',
        body: 'Network communication is complex; the OSI model splits it into 7 layers, each with one specific job. Each layer only talks to the one above and the one below. Analogy: the postal service — you write the letter (application layer), the mail sorts and transports it (lower layers), and at the end someone reads it.',
        bodyEs: 'La comunicación de red es compleja; el modelo OSI la divide en 7 capas, cada una con un trabajo puntual. Cada capa solo conversa con la de arriba y la de abajo. Analogía: el correo postal — vos escribís la carta (capa de aplicación), el correo la clasifica y transporta (capas inferiores), y al final alguien la lee.',
      },
      {
        type: 'content',
        title: 'The 7 layers of the OSI model (top to bottom)',
        titleEs: 'Las 7 capas del modelo OSI (de arriba a abajo)',
        body: '`7 Aplicación`: the protocols the programs use (HTTP, DNS, SSH). `6 Presentación`: data format and encryption. `5 Sesión`: keeping the conversation open. `4 Transporte`: TCP/UDP — segmentation and ports; it guarantees delivery or not. `3 Red`: IP — addresses and routes between networks. `2 Enlace`: MAC and ethernet — where the switch works. `1 Física`: cables, fiber, wifi waves.',
        bodyEs: '`7 Aplicación`: los protocolos que usan los programas (HTTP, DNS, SSH). `6 Presentación`: formato y cifrado de los datos. `5 Sesión`: mantener la conversación abierta. `4 Transporte`: TCP/UDP — segmentación y puertos; garantiza la entrega o no. `3 Red`: IP — direcciones y rutas entre redes. `2 Enlace`: MAC y ethernet — donde trabaja el switch. `1 Física`: cables, fibra, ondas wifi.',
      },
      {
        type: 'content',
        title: 'TCP/IP: the real model of the internet',
        titleEs: 'TCP/IP: el modelo real de internet',
        body: 'OSI is the reference model for studying, but the internet actually runs on TCP/IP, which merges the 7 layers into 4: `Application` (HTTP, DNS, SSH — everything you touch in a pentest), `Transport` (TCP/UDP), `Internet` (IP), `Network access` (ethernet/wifi). When someone says "layer 2" or "layer 3", they mean the OSI model.',
        bodyEs: 'OSI es el modelo de referencia para estudiar, pero internet funciona con TCP/IP, que junta las 7 capas en 4: `Aplicación` (HTTP, DNS, SSH — todo lo que tocás en un pentest), `Transporte` (TCP/UDP), `Internet` (IP), `Acceso a red` (ethernet/wifi). Cuando alguien dice "capa 2" o "capa 3", se refiere al modelo OSI.',
      },
      {
        type: 'quiz',
        question: 'Which layer of the OSI model does the switch work on?',
        questionEs: '¿En qué capa del modelo OSI trabaja el switch?',
        options: [
          { es: 'Capa 1 — Física', en: 'Layer 1 — Physical' },
          { es: 'Capa 2 — Enlace', en: 'Layer 2 — Data link' },
          { es: 'Capa 3 — Red', en: 'Layer 3 — Network' },
          { es: 'Capa 4 — Transporte', en: 'Layer 4 — Transport' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'redes-05',
    pathId: 'redes',
    order: 5,
    title: 'Addressing: address, mask, gateway and DNS',
    titleEs: 'Direccionamiento: dirección, máscara, puerta de enlace y DNS',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Configurar un equipo en una red son tres números + una agenda. Acá los vemos uno por uno, sin miedo al detalle.',
            en: 'Setting up a device on a network is three numbers + one address book. Let us go through them one by one, without fear of detail.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/re05-addressing-dns.mp4',
        srcEn: '/videos/en/re05-addressing-dns.mp4',
        durationSec: 65,
        caption: 'Three numbers configure a device: IP (identity), subnet mask (network vs device), gateway (the router that takes you out). Historically IPs came in classes (A/B/C); today CIDR rules. DNS translates names into IPs — the internet\'s address book.',
        captionEs: 'Tres números configuran un equipo: IP (identidad), máscara de red (red vs equipo), gateway (el router por donde salís). Históricamente las IPs venían en clases (A/B/C); hoy manda CIDR. El DNS traduce nombres a IPs — la agenda de internet.',
      },
      {
        type: 'content',
        title: 'The three pieces of the configuration',
        titleEs: 'Las tres piezas de la configuración',
        body: '`IP address`: the device identity on the network (192.168.1.10). `Subnet mask`: delimits which part of the IP identifies the network and which part the device (255.255.255.0 = the first three numbers are the network). `Gateway`: the router IP — the bridge you cross to leave your network and reach the outside.',
        bodyEs: '`Dirección IP`: la identidad del equipo en la red (192.168.1.10). `Máscara de red`: delimita qué parte de la IP identifica a la red y cuál al equipo (255.255.255.0 = los primeros tres números son la red). `Puerta de enlace`: la IP del router — el puente por donde salís de tu red hacia afuera.',
      },
      {
        type: 'content',
        title: 'Classes and groups',
        titleEs: 'Clases y grupos',
        body: 'Historically, IPs were grouped into classes by size: `Class A` (1–126): huge networks — 10.x.x.x. `Class B` (128–191): medium networks — 172.16–31.x.x. `Class C` (192–223): small networks — 192.168.x.x. Today CIDR is used (`192.168.1.0/24`), but classes explain why the private ranges look the way they do.',
        bodyEs: 'Históricamente las IPs se agruparon en clases por tamaño: `Clase A` (1–126): redes enormes — 10.x.x.x. `Clase B` (128–191): redes medianas — 172.16–31.x.x. `Clase C` (192–223): redes chicas — 192.168.x.x. Hoy se usa CIDR (`192.168.1.0/24`), pero las clases explican por qué los rangos privados se ven así.',
      },
      {
        type: 'content',
        title: 'DNS: the internet address book',
        titleEs: 'DNS: la agenda de internet',
        body: 'Machines find each other by IP; people find things by name. DNS (Domain Name System) translates `google.com` into an IP. It is like the contact list of the internet. If DNS fails, "the web is down" even though you have internet. For the pentester: enumerating DNS reveals subdomains and internal records.',
        bodyEs: 'Las máquinas se buscan por IP; las personas, por nombre. DNS (Sistema de Nombres de Dominio) traduce `google.com` a una IP. Es como la agenda de contactos de internet. Si el DNS falla, "la web no anda" aunque tengas internet. Para el pentester: enumerar DNS revela subdominios y registros internos.',
      },
      {
        type: 'terminal-demo',
        command: 'cat /etc/resolv.conf\nip route',
        output: '# Generated by NetworkManager\nnameserver 8.8.8.8\nnameserver 1.1.1.1\ndefault via 192.168.1.1 dev eth0',
        explanation: '`default via 192.168.1.1` is the gateway (the router); the `nameserver` lines are the DNS servers. With these three pieces (IP, gateway, DNS) any device is ready to browse.',
        explanationEs: '`default via 192.168.1.1` es la puerta de enlace (el router); las líneas `nameserver` son los DNS. Con estos tres datos (IP, gateway, DNS) cualquier equipo queda listo para navegar.',
      },
      {
        type: 'quiz',
        question: 'What is the gateway?',
        questionEs: '¿Qué es la puerta de enlace?',
        options: [
          { es: 'La IP de tu propio equipo', en: 'The IP of your own device' },
          { es: 'La IP del router por donde salís de tu red', en: 'The router IP you use to leave your network' },
          { es: 'Un servidor que traduce nombres', en: 'A server that translates names' },
          { es: 'La máscara de red', en: 'The subnet mask' },
        ],
        correctIndex: 1,
      },
    ],
  },
];
