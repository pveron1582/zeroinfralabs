// ── academy/path-hacking.ts ────────────────────────────────────────
// Path: Pentesting — el método y las 5 fases.

import type { Lesson } from '../types';

export const HACKING_LESSONS: Lesson[] = [
  {
    id: 'hacking-01',
    pathId: 'hacking',
    order: 1,
    title: 'The 5 phases: method, not chaos',
    titleEs: 'Las 5 fases: el método, no el caos',
    readingMinutes: 7,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'El hacking real no es caos: es método. Esta lección te da las 5 fases que usan los pentesters profesionales, del reconocimiento al reporte.',
            en: "Real hacking isn't chaos: it's method. This lesson gives you the 5 phases professional pentesters use, from recon to reporting.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/pe01-pentest-phases.mp4',
        durationSec: 86,
        caption: 'The 5 phases in action: recon, scanning, exploitation, post-exploitation and reporting. Method, not chaos.',
        captionEs: 'Las 5 fases en acción: reconocimiento, escaneo, explotación, post-explotación y reporte. El método, no el caos.',
      },
      {
        type: 'content',
        title: 'The methodology',
        titleEs: 'La metodología',
        body: 'Professionals follow phases: 1) Recon — gather info without touching much. 2) Scanning — nmap, enumerate services. 3) Exploitation — get in. 4) Post-exploitation — escalate, persist, loot. 5) Reporting — write it down so it can be fixed.',
        bodyEs: 'Los profesionales siguen fases: 1) Recon — juntar info sin tocar mucho. 2) Scanning — nmap, enumerar servicios. 3) Explotación — entrar. 4) Post-explotación — escalar, persistir, lootear. 5) Reporte — documentarlo para que se arregle.',
      },
      {
        type: 'terminal-demo',
        command: 'nmap -sV -sC 192.168.1.11',
        output: 'PORT   STATE SERVICE VERSION\n21/tcp open  ftp     vsFTPd 3.0.3\n22/tcp open  ssh     OpenSSH 8.2p1\n| ssh-hostkey: 3072 SHA256:abc... (RSA)',
        explanation: 'Phase 2 in action: `-sC` runs default scripts that grab banners, hostkeys and obvious misconfigurations automatically.',
        explanationEs: 'Fase 2 en acción: `-sC` corre scripts por defecto que capturan banners, hostkeys y malas configuraciones obvias automáticamente.',
      },
      {
        type: 'content',
        title: 'Ethics first',
        titleEs: 'La ética primero',
        body: 'Never test systems without written authorization. Define scope (what you CAN touch), stay inside it, and never destroy data. Getting in is the fun part; the report is what you get paid for.',
        bodyEs: 'Nunca pruebes sistemas sin autorización escrita. Definí el alcance (qué PODÉS tocar), quedate dentro, y nunca destruyas datos. Entrar es la parte divertida; el reporte es por lo que te pagan.',
      },
      {
        type: 'quiz',
        question: 'Which phase comes BEFORE launching an exploit?',
        questionEs: '¿Qué fase viene ANTES de lanzar un exploit?',
        options: [
          { es: 'Post-explotación', en: 'Post-exploitation' },
          { es: 'Reporte', en: 'Reporting' },
          { es: 'Escaneo y enumeración', en: 'Scanning and enumeration' },
          { es: 'Persistencia', en: 'Persistence' },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'hacking-02',
    pathId: 'hacking',
    order: 2,
    title: 'Where the info lives in each OS',
    titleEs: 'Dónde está la información en cada sistema',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Para hackear no necesitás adivinar: necesitás saber dónde vive la información. Cada sistema operativo esconde sus datos en lugares predecibles. Aprender esos lugares es la mitad del trabajo.',
            en: "To hack you don't need to guess: you need to know where the information lives. Every OS hides its data in predictable places. Learning those places is half the job.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/pe02-filesystem.mp4',
        durationSec: 76,
        caption: 'First, understand the map: Linux organizes everything under a single / — Windows splits per drive (C:\\, D:\\). The concepts are the same; the names differ.',
        captionEs: 'Primero, entendé el mapa: Linux organiza todo bajo un solo / — Windows divide por disco (C:\\, D:\\). Los conceptos son los mismos; los nombres cambian.',
      },
      {
        type: 'content',
        title: 'Linux: the treasure map',
        titleEs: 'Linux: el mapa del tesoro',
        body: 'In Linux the important stuff is centralized: /etc/passwd and /etc/shadow hold users and hashes, /var/log keeps every log (auth, syslog, access), /home/<user>/.bash_history records everything typed, /var/www hosts the websites and /tmp is where you work (world-writable). One tree, predictable paths.',
        bodyEs: 'En Linux lo importante está centralizado: /etc/passwd y /etc/shadow guardan usuarios y hashes, /var/log guarda todos los registros (auth, syslog, access), /home/<usuario>/.bash_history registra todo lo tipeado, /var/www aloja los sitios web y /tmp es donde trabajás (escritura global). Un solo árbol, rutas predecibles.',
      },
      {
        type: 'content',
        title: 'Windows: scattered but consistent',
        titleEs: 'Windows: disperso pero consistente',
        body: 'Windows spreads it across drives: C:\Users holds profiles (Desktop, Documents, Downloads), the SAM hive in C:\Windows\System32\config stores local password hashes, the Event Logs record everything, C:\inetpub hosts IIS websites and Program Files holds the apps. Different names, same ideas: users, logs, configs, web roots.',
        bodyEs: 'Windows lo reparte por discos: C:\Users guarda los perfiles (Desktop, Documents, Downloads), el hive SAM en C:\Windows\System32\config almacena los hashes de contraseñas locales, los Event Logs registran todo, C:\inetpub aloja los sitios IIS y Program Files las aplicaciones. Distintos nombres, mismas ideas: usuarios, logs, configs, raíces web.',
      },
      {
        type: 'terminal-demo',
        command: 'cat /etc/passwd | grep bash',
        output: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash\njohn:x:1001:1001:John,,,:/home/john:/bin/bash',
        explanation: 'Users with a shell (bash) are real accounts. The x in field 2 means the hash lives in /etc/shadow — which only root can read. This is the first thing to enumerate on a Linux target.',
        explanationEs: 'Los usuarios con shell (bash) son cuentas reales. La x en el campo 2 indica que el hash vive en /etc/shadow — que solo root puede leer. Esto es lo primero que enumerás en un objetivo Linux.',
      },
      {
        type: 'quiz',
        question: 'Where does Windows store the local password hashes?',
        questionEs: '¿Dónde guarda Windows los hashes de contraseñas locales?',
        options: [
          { es: 'En /etc/shadow', en: 'In /etc/shadow' },
          { es: 'En el hive SAM (C:\\Windows\\System32\\config)', en: 'In the SAM hive (C:\\Windows\\System32\\config)' },
          { es: 'En C:\\Users', en: 'In C:\\Users' },
          { es: 'En los Event Logs', en: 'In the Event Logs' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'hacking-05',
    pathId: 'hacking',
    order: 3,
    title: 'Offline password cracking: john and hashcat',
    titleEs: 'Cracking offline: john y hashcat',
    readingMinutes: 9,
    labRef: 'scenario-02',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'En la clase de ciberseguridad viste qué es un hash. Ahora es momento de crackearlos. El escenario offline es el más cómodo: ya tenés el hash en tu máquina, sin que nadie te bloquee. Dos herramientas lo hacen brillar: john the ripper para el clásico y hashcat cuando necesitás velocidad.',
            en: 'In the cybersecurity class you saw what a hash is. Now it is time to crack them. The offline scenario is the most comfortable: you already have the hash on your machine, with nobody blocking you. Two tools make it shine: john the ripper for the classic approach and hashcat when you need speed.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/pe03-offline-cracking.mp4',
        durationSec: 78,
        caption: 'Offline cracking: you own the hash, so you crack it at your own pace — no lockouts, no alerts. john the ripper runs on CPU with a wordlist (rockyou); hashcat runs on GPU with rules and millions of combinations per second.',
        captionEs: 'Cracking offline: vos tenés el hash, así que lo crackeás a tu ritmo — sin bloqueos ni alertas. john the ripper corre en CPU con una wordlist (rockyou); hashcat corre en GPU con reglas y millones de combinaciones por segundo.',
      },
      {
        type: 'content',
        title: 'The offline scenario',
        titleEs: 'El escenario offline',
        body: 'Offline means the hash is already in your hands: a leaked /etc/shadow, a database dump, a memory image. You crack it on your own machine, so there are no failed-attempt counters, no lockouts and no alerts. Your only constraint is time: a weak hash falls in seconds, a strong one can take years. The material matters more than the tool.',
        bodyEs: 'Offline significa que el hash ya está en tus manos: un /etc/shadow filtrado, un dump de base de datos, una imagen de memoria. Lo crackeás en tu propia máquina, así que no hay contadores de intentos fallidos, ni bloqueos, ni alertas. Tu única limitación es el tiempo: un hash débil cae en segundos, uno fuerte puede tardar años. El material importa más que la herramienta.',
      },
      {
        type: 'content',
        title: 'john the ripper: the classic',
        titleEs: 'john the ripper: el clásico',
        body: 'John tries words from a **wordlist** until one produces the same hash. The most famous list is **rockyou**: 14M+ real passwords leaked in 2009. Point john at a hash file and it auto-detects the format (sha512crypt, md5, ntlm...). Weak passwords fall because they are already in the list — that is the whole trick.',
        bodyEs: 'John prueba palabras de una **wordlist** hasta que una produce el mismo hash. La lista más famosa es **rockyou**: más de 14 millones de contraseñas reales filtradas en 2009. Apuntale un archivo de hashes y detecta el formato solo (sha512crypt, md5, ntlm...). Las contraseñas débiles caen porque ya están en la lista — ese es todo el truco.',
      },
      {
        type: 'terminal-demo',
        command: 'john --wordlist=rockyou.txt hash.txt\njohn --show hash.txt',
        output: 'Loaded 1 password hash (sha512crypt)\npassword123      (admin)\n1 password hash cracked, 0 left',
        explanation: 'First run cracks the hash with the wordlist; the second shows the result. john reads /etc/shadow-style hashes directly — you only need the file.',
        explanationEs: 'La primera corrida crackea el hash con la wordlist; la segunda muestra el resultado. john lee hashes estilo /etc/shadow directamente — solo necesitás el archivo.',
      },
      {
        type: 'content',
        title: 'hashcat: speed on the GPU',
        titleEs: 'hashcat: velocidad en la GPU',
        body: 'When hashes are strong (sha512 + salt, bcrypt), john on CPU can be too slow. **hashcat** pushes the work to your graphics card: thousands of parallel cores, millions of candidates per second. It also supports **rules** (mutations: password → Password1, password1, passw0rd...) so one word generates many variants. Choose the mode with `-m` (1800 = sha512crypt, 0 = MD5) and the attack with `-a` (0 = dictionary, 3 = brute force).',
        bodyEs: 'Cuando los hashes son fuertes (sha512 + salt, bcrypt), john en CPU puede ser demasiado lento. **hashcat** manda el trabajo a la tarjeta gráfica: miles de núcleos en paralelo, millones de candidatos por segundo. También soporta **reglas** (mutaciones: password → Password1, password1, passw0rd...) así una palabra genera muchas variantes. Elegí el modo con `-m` (1800 = sha512crypt, 0 = MD5) y el ataque con `-a` (0 = diccionario, 3 = fuerza bruta).',
      },
      {
        type: 'terminal-demo',
        command: 'hashcat -m 1800 -a 0 hash.txt rockyou.txt\nhashcat -m 1800 hash.txt --show',
        output: 'Session..........: hashcat\nSpeed.DEV.#1.....: 1234.5 kH/s\npassword123:admin',
        explanation: 'Same hash, GPU speed. `--show` prints the cracked ones again without re-cracking. In the lab you usually run this on your own Kali with the leaked shadow file.',
        explanationEs: 'El mismo hash, velocidad de GPU. `--show` vuelve a imprimir los crackeados sin re-crackear. En el lab normalmente lo corrés en tu propio Kali con el shadow filtrado.',
      },
      {
        type: 'content',
        title: 'Cracking strategy',
        titleEs: 'Estrategia de cracking',
        body: 'Order matters: 1) start with the wordlist (rockyou) — covers the obvious; 2) apply rules to catch mutations; 3) only then brute force, and only if the hash is fast (MD5/NTLM) — never brute force sha512/bcrypt. And split the work: crack the fast hashes first to keep momentum. The wordlist is half the game.',
        bodyEs: 'El orden importa: 1) empezá por la wordlist (rockyou) — cubre lo obvio; 2) aplicá reglas para atrapar mutaciones; 3) recién después fuerza bruta, y solo si el hash es rápido (MD5/NTLM) — nunca fuerza bruta a sha512/bcrypt. Y repartí el trabajo: crackeá primero los hashes rápidos para no perder ritmo. La wordlist es la mitad del juego.',
      },
      {
        type: 'quiz',
        question: 'Why does hashcat crack faster than john for the same hash?',
        questionEs: '¿Por qué hashcat crackea más rápido que john con el mismo hash?',
        options: [
          { es: 'Porque usa una wordlist más grande', en: 'Because it uses a bigger wordlist' },
          { es: 'Porque corre en la GPU con miles de núcleos', en: 'Because it runs on the GPU with thousands of cores' },
          { es: 'Porque tiene más reglas por defecto', en: 'Because it has more default rules' },
          { es: 'Porque saltea el hash y adivina directo', en: 'Because it skips the hash and guesses directly' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'hacking-06',
    pathId: 'hacking',
    order: 4,
    title: 'Online password cracking: medusa, hydra and ncrack',
    titleEs: 'Cracking online: medusa, hydra y ncrack',
    readingMinutes: 9,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'No siempre tenés el hash. A veces la única vía es probar contraseñas contra el servicio vivo: SSH, FTP, un login web. Eso es cracking online, y tres herramientas lo hacen bien: hydra, medusa y ncrack. Más ruidoso que el offline, pero a veces es la única puerta.',
            en: 'You do not always have the hash. Sometimes the only way is trying passwords against the live service: SSH, FTP, a web login. That is online cracking, and three tools do it well: hydra, medusa and ncrack. Noisier than offline, but sometimes the only door.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/pe04-online-cracking.mp4',
        durationSec: 90,
        caption: 'Online cracking attacks the live service: no hash needed, every attempt is a real connection. hydra (the classic), medusa (lighter) and ncrack (from the Nmap family, integrates with scans). Slower and noisier — the network and lockout policies set your limits.',
        captionEs: 'El cracking online ataca el servicio vivo: no hace falta el hash, cada intento es una conexión real. hydra (el clásico), medusa (más liviana) y ncrack (de la familia Nmap, se integra con los escaneos). Más lento y ruidoso — la red y las políticas de bloqueo ponen tus límites.',
      },
      {
        type: 'content',
        title: 'The online scenario',
        titleEs: 'El escenario online',
        body: 'You do not have the hash: you attack a live service that validates user + password in real time. Every attempt is a real network connection. It is slower and noisier than offline: it leaves logs, and if the service locks accounts after N failed attempts you can lock yourself out and alert the owner. Use it when offline is impossible or the goal is a weak login.',
        bodyEs: 'No tenés el hash: atacás un servicio vivo que valida usuario + contraseña en tiempo real. Cada intento es una conexión de red real. Es más lento y ruidoso que el offline: deja logs, y si el servicio bloquea cuentas tras N intentos fallidos podés quedarte afuera y alertar al dueño. Usalo cuando el offline es imposible o el objetivo es un login débil.',
      },
      {
        type: 'content',
        title: 'hydra: the classic brute-forcer',
        titleEs: 'hydra: el clásico brute-forcer',
        body: 'Hydra tries every user/pass combination in parallel against a service: `hydra -l admin -P rockyou.txt ssh://192.168.1.11`. It supports SSH, FTP, HTTP(S), SMB, RDP and many more. Give it a username or a list (`-L`), a password list (`-P`), the protocol, and the target. It stops when a combination works.',
        bodyEs: 'Hydra prueba cada combinación usuario/clave en paralelo contra un servicio: `hydra -l admin -P rockyou.txt ssh://192.168.1.11`. Soporta SSH, FTP, HTTP(S), SMB, RDP y muchos más. Dale un usuario o una lista (`-L`), una lista de contraseñas (`-P`), el protocolo y el objetivo. Se detiene cuando una combinación funciona.',
      },
      {
        type: 'terminal-demo',
        command: 'hydra -l admin -P rockyou.txt ssh://192.168.1.11\nhydra -L users.txt -P pass.txt smb://192.168.1.11',
        output: '[22][ssh] host: 192.168.1.11   login: admin   password: password123\n[DATA] attacking smb://192.168.1.11/  | login: admin  password: summer2026',
        explanation: 'First command targets one user (admin); the second sprays user list × password list against SMB. hydra shows the successful login with `[service]` tags.',
        explanationEs: 'El primer comando apunta a un solo usuario (admin); el segundo rocía lista de usuarios × lista de contraseñas contra SMB. hydra muestra el login exitoso con tags `[servicio]`.',
      },
      {
        type: 'content',
        title: 'medusa and ncrack',
        titleEs: 'medusa y ncrack',
        body: '**medusa**: the lighter rival, parallel and fast with big lists, same idea as hydra. **ncrack**: from the Nmap family — designed to pair with your scans: you found SSH open, you feed ncrack the target and it attacks. Both take user lists (`-U`), password lists (`-P`) and a service spec. Choose hydra for breadth, ncrack for Nmap integration.',
        bodyEs: '**medusa**: la rival más liviana, en paralelo y rápida con listas grandes, misma idea que hydra. **ncrack**: de la familia Nmap — diseñada para ir de la mano de tus escaneos: encontraste SSH abierto, le pasás el objetivo a ncrack y ataca. Ambas toman listas de usuarios (`-U`), de contraseñas (`-P`) y una especificación de servicio. Elegí hydra por su cobertura, ncrack por su integración con Nmap.',
      },
      {
        type: 'terminal-demo',
        command: 'ncrack -U users.txt -P pass.txt ssh://192.168.1.11\nmedusa -h 192.168.1.11 -U users.txt -P pass.txt -M ssh',
        output: 'Discovered credentials for ssh on 192.168.1.11\n192.168.1.11 ssh admin password123 valid\nACCOUNT FOUND: [ssh] Host: 192.168.1.11 User: admin Password: password123',
        explanation: 'ncrack prints "Discovered credentials"; medusa reports "ACCOUNT FOUND". Same job, different output style. In a pentest you usually confirm the find manually once.',
        explanationEs: 'ncrack imprime "Discovered credentials"; medusa reporta "ACCOUNT FOUND". El mismo trabajo, distinto estilo de salida. En un pentest normalmente confirmás el hallazgo a mano una vez.',
      },
      {
        type: 'content',
        title: 'Strategy and limits',
        titleEs: 'Estrategia y límites',
        body: 'Online is bounded by the network, not your CPU: bandwidth, latency and lockout policies set the real limit. Enumerate first (users from the OS or the service), then attack the small set — never spray 14M passwords against a live service. Add `-t` threads carefully. And remember: brute-forcing a system you do not own is a crime; the lab is your playground, with written authorization.',
        bodyEs: 'El online está limitado por la red, no por tu CPU: ancho de banda, latencia y políticas de bloqueo ponen el límite real. Enumerá primero (usuarios del sistema o del servicio), después atacá el conjunto chico — nunca rocíes 14M de contraseñas contra un servicio vivo. Sumá hilos con `-t` con cuidado. Y recordá: la fuerza bruta contra un sistema que no es tuyo es un delito; el lab es tu patio de juegos, con autorización escrita.',
      },
      {
        type: 'quiz',
        question: 'What is the main difference between offline and online cracking?',
        questionEs: '¿Cuál es la diferencia principal entre cracking offline y online?',
        options: [
          { es: 'Offline usa GPU, online usa CPU', en: 'Offline uses GPU, online uses CPU' },
          { es: 'Offline ya tiene el hash; online ataca el servicio vivo', en: 'Offline already has the hash; online attacks the live service' },
          { es: 'Online es siempre más rápido', en: 'Online is always faster' },
          { es: 'No hay diferencia', en: 'There is no difference' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    // Movida desde Redes II (2026-08-17): conserva su id `network-05` para
    // no perder el progreso guardado de quien ya la completó. Al final del
    // path (2026-08-18): MITM se ve después de las 2 de cracking.
    id: 'network-05',
    pathId: 'hacking',
    order: 5,
    title: 'Man-in-the-middle: intercepting traffic',
    titleEs: 'Man-in-the-middle: interceptando tráfico',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'La red no te miente: todo paquete tiene origen y destino. Pero ¿y si alguien se para en el medio y dice "el camino pasa por acá"? Eso es el ataque Man-in-the-Middle, y el ARP spoof es la forma clásica de lograrlo en una LAN.',
            en: "A network doesn't lie: every packet has an origin and a destination. But what if someone steps into the middle and says 'the path goes through here'? That's the Man-in-the-Middle attack, and ARP spoofing is the classic way to pull it off on a LAN.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/pe05-man-in-the-middle.mp4',
        durationSec: 93,
        caption: 'Man-in-the-middle in action: the attacker floods the victim with forged ARP replies, becomes the fake gateway and relays every packet with ip_forward — reading the traffic while the victim keeps browsing normally.',
        captionEs: 'El man-in-the-middle en acción: el atacante inunda a la víctima con respuestas ARP falsas, pasa a ser el gateway falso y retransmite cada paquete con ip_forward — leyendo el tráfico mientras la víctima sigue navegando normal.',
      },
      {
        type: 'content',
        title: 'Stepping into the conversation',
        titleEs: 'Metiéndose en la conversación',
        body: 'In a MITM, the attacker sits between two parties and relays their traffic. Both sides believe they talk to each other — but in reality every packet passes through the attacker, who can **read** it (sniffing), **modify** it (injection) or **drop** it (DoS). The victim never notices, because the connection still works.',
        bodyEs: 'En un MITM, el atacante se sienta entre dos partes y retransmite el tráfico. Ambos lados creen que hablan entre sí — pero en realidad cada paquete pasa por el atacante, que puede **leerlo** (sniffing), **modificarlo** (inyección) o **descartarlo** (DoS). La víctima no se da cuenta, porque la conexión sigue funcionando.',
      },
      {
        type: 'content',
        title: 'ARP spoofing, the classic move',
        titleEs: 'ARP spoofing, la jugada clásica',
        body: 'On a LAN, devices remember who the gateway is via **ARP**: "192.168.1.1 is at MAC 00:11:22:33:44:55". The attacker floods the victim with forged ARP replies: "No, 192.168.1.1 is at MY MAC". From then on, the victim sends gateway traffic to the attacker, who forwards it to the real gateway — reading everything on the way.',
        bodyEs: 'En una LAN, los dispositivos recuerdan quién es el gateway mediante **ARP**: "192.168.1.1 está en la MAC 00:11:22:33:44:55". El atacante inunda a la víctima con respuestas ARP falsas: "No, 192.168.1.1 está en MI MAC". Desde ahí, la víctima envía el tráfico del gateway al atacante, que lo reenvía al gateway real — leyendo todo en el camino.',
      },
      {
        type: 'terminal-demo',
        command: 'sudo arpspoof -i eth0 -t 192.168.1.11 192.168.1.1\necho 1 > /proc/sys/net/ipv4/ip_forward',
        output: '0:c:29:aa:bb:cc 192.168.1.11 00:11:22:33:44:55 192.168.1.1\n# La PC víctima ahora manda su tráfico a TU MAC / ip_forward: retransmitir sin cortar',
        explanation: 'arpspoof sends forged ARP replies to the victim announcing your MAC as the gateway. ip_forward=1 lets the kernel relay the packets so the victim keeps browsing. You are the gateway now.',
        explanationEs: 'arpspoof envía respuestas ARP falsas a la víctima anunciando tu MAC como el gateway. ip_forward=1 hace que el kernel retransmita los paquetes para que la víctima siga navegando. Ahora vos sos el gateway.',
      },
      {
        type: 'interactive-demo',
        demoKind: 'network-mitm',
        instructions: 'You are the attacker. First bring up the internet (internet—router—switch cables), connect BOTH the victim and the attacker to the switch, then flip the ARP spoof ON. Watch the victim turn "intercepted".',
        instructionsEs: 'Vos sos el atacante. Primero da internet (cables internet—router—switch), conectá tanto a la víctima como al atacante al switch, y activá el ARP spoof. Mirá cómo la víctima pasa a "interceptada".',
      },
      {
        type: 'content',
        title: 'Detecting & defending',
        titleEs: 'Detección y defensa',
        body: 'How to catch it: `arp -a` showing two IPs on the same MAC, or an arpspoof process running. How to stop it: **static ARP entries**, **switch port security** (one MAC per port), **TLS everywhere** (even if traffic is sniffed, it\'s encrypted). For a pentester: MITM turns a simple LAN foothold into a password harvest.',
        bodyEs: 'Cómo detectarlo: `arp -a` mostrando dos IPs con la misma MAC, o un proceso arpspoof corriendo. Cómo frenarlo: **entradas ARP estáticas**, **seguridad de puertos del switch** (una MAC por puerto), **TLS en todos lados** (aunque sniffeen el tráfico, va cifrado). Para un pentester: el MITM convierte una simple posición en la LAN en una cosecha de contraseñas.',
      },
      {
        type: 'quiz',
        question: 'In an ARP spoofing attack, what does the attacker fake?',
        questionEs: 'En un ataque de ARP spoofing, ¿qué falsifica el atacante?',
        options: [
          { es: 'El DNS de la red', en: 'The DNS of the network' },
          { es: 'La dirección MAC del gateway', en: 'The MAC address of the gateway' },
          { es: 'La IP del navegador de la víctima', en: "The IP of the victim's browser" },
          { es: 'La tabla de VLANs del switch', en: "The switch's VLAN table" },
        ],
        correctIndex: 1,
      },
    ],
  },
];
