// ── academy/others-hw-lessons.ts ────────────────────────────────────
// Subsección "Otros sistemas operativos y hardware" del path Sistemas Operativos.
// Lecciones 03 y 04: hardware de hacking y gadgets ofensivos (solo educativo).
// Se concatenan a OTHERS_LESSONS en others-lessons.ts.

import type { Lesson } from '../types';

export const OTHERS_HW_LESSONS: Lesson[] = [
  {
    id: 'others-03',
    pathId: 'os',
    order: 3,
    title: 'Hacking hardware: WiFi Pineapple, Flipper Zero, Rubber Ducky and friends',
    titleEs: 'Hardware de hacking: WiFi Pineapple, Flipper Zero, Rubber Ducky y compañía',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'No todo ataque sale de un teclado. Hay todo un mundo de dispositivos físicos que hackean redes, teclados, radios y llaves. Acá te muestro los más conocidos: el WiFi Pineapple, el Flipper Zero y el Rubber Ducky, más un par de compañeros de viaje.',
            en: 'Not every attack comes from a keyboard. There is a whole world of physical devices that hack networks, keyboards, radios and keys. Here I show you the most famous ones: the WiFi Pineapple, the Flipper Zero and the Rubber Ducky, plus a couple of travel companions.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ot-03-hacking-hardware.mp4',
        durationSec: 109,
        caption: 'Hacking hardware: the WiFi Pineapple (rogue access point that hijacks Wi-Fi), USB HID injection (Rubber Ducky and Bash Bunny type commands as a fake keyboard), the Flipper Zero (RFID/NFC, 433 MHz, IR, GPIO and replay) plus the O.MG Cable, Proxmark3 and HackRF One. All dual-use: attackers use them to get in, defenders to test their gear.',
        captionEs: 'Hardware de hacking: el WiFi Pineapple (punto de acceso malicioso que secuestra el Wi-Fi), la inyección USB HID (Rubber Ducky y Bash Bunny escriben comandos como teclado falso), el Flipper Zero (RFID/NFC, 433 MHz, IR, GPIO y replay) más el O.MG Cable, el Proxmark3 y el HackRF One. Todos de doble uso: los atacantes entran, los defensores prueban.',
      },
      {
        type: 'content',
        title: 'WiFi Pineapple: the rogue access point',
        titleEs: 'WiFi Pineapple: el punto de acceso malicioso',
        body: 'A small box from Hak5 that creates its own Wi-Fi network and "improves" it: it broadcasts the name of a real network (coffee shop, airport, hotel), devices connect automatically because they recognize the SSID, and the Pineapple sits in the middle seeing all their traffic. With plugins it can steal cookies, inject pages or run man-in-the-middle attacks. Classic scenario: a researcher at a conference captures corporate credentials because the attendees\' laptops auto-join an "evil twin" of the hotel network.',
        bodyEs: 'Una cajita de Hak5 que crea su propia red Wi-Fi y la "mejora": emite el nombre de una red real (café, aeropuerto, hotel), los dispositivos se conectan solos porque reconocen el SSID, y la Pineapple queda en el medio viendo todo su tráfico. Con plugins puede robar cookies, inyectar páginas o hacer man-in-the-middle. Escenario clásico: un investigador en una conferencia captura credenciales corporativas porque las laptops de los asistentes se conectan automáticamente a un "evil twin" de la red del hotel.',
      },
      {
        type: 'content',
        title: 'USB HID injection: Rubber Ducky and Bash Bunny',
        titleEs: 'Inyección USB HID: Rubber Ducky y Bash Bunny',
        body: 'The Rubber Ducky looks like a USB drive but the computer sees it as a keyboard. It executes a small script (ducky script) that types commands at full speed: opens a terminal, downloads a payload and runs it, in seconds, without the user noticing. Its big brother, the Bash Bunny, appears as a keyboard + network card + mass storage and runs attacks by folder: you copy files into a directory and plug it in. Tools like USB Rubber Ducky are how the "auto-write-on-insert" attacks of real APTs are automated.',
        bodyEs: 'El Rubber Ducky parece un pendrive pero la computadora lo ve como un teclado. Ejecuta un mini script (ducky script) que escribe comandos a toda velocidad: abre una terminal, descarga un payload y lo corre, en segundos, sin que el usuario se dé cuenta. Su hermano mayor, el Bash Bunny, aparece como teclado + placa de red + almacenamiento masivo y ejecuta ataques por carpeta: copiás archivos en un directorio y lo enchufás. Herramientas como el USB Rubber Ducky son cómo se automatizan los ataques de "auto-ejecución al insertar" de APTs reales.',
      },
      {
        type: 'content',
        title: 'Flipper Zero: the Swiss army knife',
        titleEs: 'Flipper Zero: la navaja suiza',
        body: 'A pocket multi-tool that is a hit with security researchers. It reads and clones RFID/NFC cards at 125 kHz and 13.56 MHz (access cards, hotel keys, payments), transmits on 433 MHz (garage doors, car remotes, wireless doorbells), has infrared for TVs and cameras, a GPIO header to poke at electronics and a sub-GHz radio. It can replay a signal it captured, which is how you test whether your garage or gate is vulnerable to replay attacks.',
        bodyEs: 'Una multiherramienta de bolsillo que es un éxito entre los investigadores de seguridad. Lee y clona tarjetas RFID/NFC de 125 kHz y 13.56 MHz (tarjetas de acceso, llaves de hotel, pagos), transmite en 433 MHz (portones, controles de autos, timbres inalámbricos), tiene infrarrojo para TVs y cámaras, un conector GPIO para meterle mano a la electrónica y radio sub-GHz. Puede repetir una señal que capturó, que es cómo probás si tu portón o tu reja son vulnerables a ataques de replay.',
      },
      {
        type: 'content',
        title: 'More tools: O.MG Cable, Proxmark3 and HackRF One',
        titleEs: 'Más herramientas: O.MG Cable, Proxmark3 y HackRF One',
        body: 'O.MG Cable: a USB cable that looks and works normal but has a hidden Wi-Fi implant inside; an attacker with physical access swaps it for yours and gets a covert channel into your machine. Proxmark3: a research station for RFID/NFC that reads, clones and analyzes cards at 125 kHz and 13.56 MHz — the standard tool for auditing access controls. HackRF One: a software-defined radio that can capture and transmit from 1 MHz to 6 GHz; with it you record radio signals (garage openers, key fobs) and replay or analyze them. All three are dual-use: they are also the way defenders test their own gear.',
        bodyEs: 'O.MG Cable: un cable USB que se ve y funciona normal pero lleva un implante Wi-Fi oculto adentro; un atacante con acceso físico te lo cambia por el tuyo y obtiene un canal encubierto hacia tu máquina. Proxmark3: una estación de investigación de RFID/NFC que lee, clona y analiza tarjetas de 125 kHz y 13.56 MHz — la herramienta estándar para auditar controles de acceso. HackRF One: una radio definida por software que puede capturar y transmitir de 1 MHz a 6 GHz; con ella grabás señales de radio (controles de portón, llaveros) y las repetís o analizás. Las tres son de doble uso: también son la forma en que los defensores prueban su propio equipamiento.',
      },
      {
        type: 'terminal-demo',
        command: 'lsusb',
        output: 'Bus 001 Device 004: ID 1d50:6153 Hak5 USB Rubber Ducky\nBus 001 Device 002: ID 8087:0024 Intel Corp.',
        explanation: 'USB devices announce themselves with a vendor and product ID. A Rubber Ducky presents itself as a keyboard — that is exactly how it injects keystrokes without installing a driver.',
        explanationEs: 'Los dispositivos USB se presentan con un ID de vendor y producto. Un Rubber Ducky se anuncia como teclado — justamente por eso puede inyectar teclas sin instalar ningún driver.',
      },
      {
        type: 'quiz',
        question: 'Which device works by pretending to be a keyboard and typing commands at full speed?',
        questionEs: '¿Qué dispositivo funciona haciéndose pasar por teclado y escribiendo comandos a toda velocidad?',
        options: [
          { es: 'WiFi Pineapple', en: 'WiFi Pineapple' },
          { es: 'Flipper Zero', en: 'Flipper Zero' },
          { es: 'Rubber Ducky', en: 'Rubber Ducky' },
          { es: 'Proxmark3', en: 'Proxmark3' },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'others-04',
    pathId: 'os',
    order: 4,
    title: 'Offensive gadgets and social engineering (educational only)',
    titleEs: 'Gadgets ofensivos e ingeniería social (solo educativo)',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Pará, disclaimer: esto es SOLO educativo. Entender cómo se clonan tarjetas o cómo te manipulan te sirve para defenderte, no para robar. Mencionamos los elementos, cómo funcionan y cómo detectarlos. La ingeniería social es tan importante que merece un módulo entero en Hacking Ético — por ahora, el inicio.',
            en: 'Wait, disclaimer: this is ONLY educational. Understanding how cards are cloned or how people are manipulated helps you defend, not steal. We mention the elements, how they work and how to detect them. Social engineering is so important it deserves its own full module in Ethical Hacking — for now, the beginning.',
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ot-04-social-engineering.mp4',
        durationSec: 122,
        caption: 'Educational only: skimmers read the magnetic stripe (the EMV chip blocks clones), access-card cloners exploit broken RFID like Mifare Classic, and social engineering attacks the human — phishing, vishing, baiting, pretexting and tailgating. It deserves a full module in Ethical Hacking.',
        captionEs: 'Solo educativo: los skimmers leen la banda magnética (el chip EMV bloquea los clones), los clonadores de acceso explotan el RFID roto como Mifare Classic, y la ingeniería social ataca al humano — phishing, vishing, baiting, pretexting y tailgating. Merece un módulo entero en Hacking Ético.',
      },
      {
        type: 'content',
        title: 'Skimmers and card cloners: how they work and how to spot them',
        titleEs: 'Skimmers y clonadores de tarjetas: cómo funcionan y cómo detectarlos',
        body: 'A skimmer is a small device placed over a real card reader (ATM, gas pump, point of sale) that reads the magnetic stripe as you swipe. Combined with a hidden camera or an overlay on the keypad, the attacker captures card number + PIN and clones the magnetic stripe onto a blank card with a simple writer. Defenses: the EMV chip makes clones useless for in-person payment, banks alert on unusual use, and you check the reader for loose parts, overlays and cameras before inserting your card.',
        bodyEs: 'Un skimmer es un dispositivo pequeño que se coloca sobre un lector de tarjetas real (cajero, surtidor, posnet) y lee la banda magnética cuando pasás la tarjeta. Combinado con una cámara oculta o un teclado falso arriba, el atacante captura número de tarjeta + PIN y clona la banda magnética en una tarjeta en blanco con un grabador simple. Defensas: el chip EMV hace que los clones no sirvan para pagar en persona, los bancos alertan por usos inusuales, y revisás el lector por partes sueltas, sobrecubiertas y cámaras antes de meter tu tarjeta.',
      },
      {
        type: 'content',
        title: 'Access card cloners: copying your badge',
        titleEs: 'Clonadores de tarjetas de acceso: copiando tu credencial',
        body: 'Many building badges use old RFID tech like Mifare Classic, whose crypto was broken years ago. With a cheap reader (or a Flipper Zero / Proxmark3) an attacker can read the card from your pocket, copy it in seconds and clone it onto a blank card — no physical contact needed. That is why modern facilities move to AES cards, phone-based credentials (HID Mobile Access) and multi-factor. If your office still uses badges that open doors by proximity without a PIN, they are likely cloningable.',
        bodyEs: 'Muchas credenciales de edificios usan RFID viejo como Mifare Classic, cuyo cifrado fue roto hace años. Con un lector barato (o un Flipper Zero / Proxmark3) un atacante puede leer la tarjeta desde tu bolsillo, copiarla en segundos y clonarla en una tarjeta en blanco — sin contacto físico. Por eso las instalaciones modernas migran a tarjetas AES, credenciales por celular (HID Mobile Access) y multi-factor. Si tu oficina todavía abre puertas con tarjetas por proximidad sin PIN, probablemente son clonables.',
      },
      {
        type: 'content',
        title: 'Social engineering: attacking the human',
        titleEs: 'Ingeniería social: atacar al humano',
        body: 'Every system has a human at the end, and humans are the weakest link. Social engineering is manipulating people to give up information or access, using psychology instead of exploits. Classic techniques: phishing (fake email), vishing (fake call), smishing (fake SMS), baiting (a tempting USB or download), pretexting (inventing a fake situation) and tailgating (following you through the door). No firewall blocks a polite phone call asking for your password — training and verification do.',
        bodyEs: 'Todo sistema tiene un humano al final, y el humano es el eslabón más débil. La ingeniería social es manipular a las personas para que suelten información o acceso, usando psicología en vez de exploits. Técnicas clásicas: phishing (mail falso), vishing (llamada falsa), smishing (SMS falso), baiting (un USB o descarga tentadora), pretexting (inventar una situación falsa) y tailgating (entrar detrás tuyo por la puerta). Ningún firewall bloquea una llamada amable pidiendo tu contraseña — lo hacen la capacitación y la verificación.',
      },
      {
        type: 'content',
        title: 'Why a pentester needs this',
        titleEs: 'Por qué un pentester necesita esto',
        body: 'Physical and social attacks are part of real engagements: red teams test badge cloning, USB drops and vishing against employees, and companies pay for it because that is how real attackers enter. Understanding these elements is the first step of a much bigger topic: social engineering deserves a full module of its own inside Ethical Hacking, with real examples and simulations. For now, keep the mental model: hacking is not only keyboards and exploits — it is also doors, badges, cables and conversations.',
        bodyEs: 'Los ataques físicos y sociales son parte de los engagement reales: los red teams prueban clonación de credenciales, USB drops y vishing contra los empleados, y las empresas pagan por eso porque es así como entran los atacantes reales. Entender estos elementos es el primer paso de un tema mucho más grande: la ingeniería social merece un módulo entero propio dentro de Hacking Ético, con ejemplos reales y simulaciones. Por ahora, quedate con el modelo mental: hackear no es solo teclado y exploits — también son puertas, credenciales, cables y conversaciones.',
      },
      {
        type: 'matching',
        title: 'Match the social engineering technique',
        titleEs: 'Emparejá la técnica de ingeniería social',
        instructions: 'Tap each term and its definition.',
        instructionsEs: 'Tocá cada término con su definición.',
        pairs: [
          {
            left: 'Phishing',
            leftEs: 'Phishing',
            right: 'A fake email impersonating a trusted entity to steal credentials.',
            rightEs: 'Un mail falso que se hace pasar por una entidad de confianza para robar credenciales.',
          },
          {
            left: 'Vishing',
            leftEs: 'Vishing',
            right: 'The same trick over the phone, with a fake voice call.',
            rightEs: 'La misma estafa pero por teléfono, con una llamada de voz falsa.',
          },
          {
            left: 'Baiting',
            leftEs: 'Baiting',
            right: 'A tempting lure (a USB or download) that hides malware.',
            rightEs: 'Un cebo tentador (un USB o descarga) que esconde malware.',
          },
          {
            left: 'Pretexting',
            leftEs: 'Pretexting',
            right: 'Inventing a fake situation to make you reveal data.',
            rightEs: 'Inventar una situación falsa para que sueltes datos.',
          },
          {
            left: 'Tailgating',
            leftEs: 'Tailgating',
            right: 'Following an employee through a secure door without a badge.',
            rightEs: 'Entrar detrás de un empleado por una puerta segura sin credencial.',
          },
        ],
      },
      {
        type: 'quiz',
        question: 'What is the best defense against social engineering?',
        questionEs: '¿Cuál es la mejor defensa contra la ingeniería social?',
        options: [
          { es: 'Instalar más antivirus', en: 'Install more antivirus' },
          { es: 'Capacitación y verificación de identidad', en: 'Security awareness and identity verification' },
          { es: 'Un firewall más fuerte', en: 'A stronger firewall' },
          { es: 'Cifrar los discos', en: 'Encrypt the disks' },
        ],
        correctIndex: 1,
      },
    ],
  },
];