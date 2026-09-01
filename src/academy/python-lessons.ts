// ── academy/python-lessons.ts ──────────────────────────────────────
// Subsección Python del path Scripting para pentesting.
// 5 clases: qué es → variables/tipos/condiciones → bucles/funciones →
// pentesting I (redes con socket) → pentesting II (HTTP con requests).

import type { Lesson } from '../types';

export const PYTHON_LESSONS: Lesson[] = [
  {
    id: 'python-01',
    pathId: 'scripting',
    order: 1,
    title: 'What is Python: the hacker language',
    titleEs: 'Qué es Python: el lenguaje del hacking',
    readingMinutes: 8,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Si hay un lenguaje que domina el hacking, es Python. Es legible, poderoso y tiene librerías para casi todo: redes, HTTP, explotación. Esta clase te muestra cómo correr tu primer script.',
            en: "If there is one language that dominates hacking, it's Python. It's readable, powerful and has libraries for almost everything: networking, HTTP, exploitation. This lesson shows you how to run your first script.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/py01-python-intro.mp4',
        srcEn: '/videos/en/py01-python-intro.mp4',
        durationSec: 60,
        caption: 'Python is the hacking language: readable, powerful and with libraries for almost everything. print, input and your first one-liner.',
        captionEs: 'Python es el lenguaje del hacking: legible, poderoso y con librerías para casi todo. print, input y tu primer one-liner.',
      },
      {
        type: 'content',
        title: 'Interpreted, readable, everywhere',
        titleEs: 'Interpretado, legible, en todos lados',
        body: 'Python is interpreted: no compilation step, you just run it. `python3 script.py` runs a file; `python3 -c "print(1)"` runs a line. Indentation defines blocks (no braces). Why attackers love it: `socket` (networking), `requests` (HTTP), `subprocess` (run commands), `scapy` (packets), `paramiko` (SSH). Most public exploits are written in Python.',
        bodyEs: 'Python es interpretado: no hay paso de compilación, lo ejecutás directo. `python3 script.py` corre un archivo; `python3 -c "print(1)"` corre una línea. La indentación define los bloques (no hay llaves). Por qué lo aman los atacantes: `socket` (redes), `requests` (HTTP), `subprocess` (correr comandos), `scapy` (paquetes), `paramiko` (SSH). La mayoría de los exploits públicos están escritos en Python.',
      },
      {
        type: 'content',
        title: 'Your first script',
        titleEs: 'Tu primer script',
        body: '`print("hola")` prints. `#` starts a comment. `input("Dame un host: ")` asks for user input. Three functions cover a surprising amount of what you will script: show, annotate, ask.',
        bodyEs: '`print("hola")` imprime. `#` arranca un comentario. `input("Dame un host: ")` pide entrada al usuario. Tres funciones cubren un montón de lo que vas a scriptear: mostrar, comentar, preguntar.',
      },
      {
        type: 'terminal-demo',
        command: 'python3 -c "print(\'Hola desde Python\')"\npython3 -c "nombre = input(\'Quién sos? \'); print(\'Hola\', nombre)"',
        output: 'Hola desde Python\nQuién sos? kali\nHola kali',
        explanation: 'One-liners are great for quick tests; files are better for real scripts. From here on, everything runs with python3.',
        explanationEs: 'Los one-liners sirven para pruebas rápidas; los archivos son mejores para scripts reales. De acá en adelante, todo corre con python3.',
      },
      {
        type: 'practical-exercise',
        task: 'In the lab terminal, run python3 -c "print(\'hola pentesting\')". Then create /tmp/saludo.py with nano: a print and an input(), and run it with python3 /tmp/saludo.py.',
        taskEs: 'En la terminal del lab, corré python3 -c "print(\'hola pentesting\')". Después creá /tmp/saludo.py con nano: un print y un input(), y ejecutalo con python3 /tmp/saludo.py.',
        hint: 'python3 -c "print(\'hola\')" → nano /tmp/saludo.py (print + input) → python3 /tmp/saludo.py',
        hintEs: 'python3 -c "print(\'hola\')" → nano /tmp/saludo.py (print + input) → python3 /tmp/saludo.py',
        labId: 'scenario-01',
      },
      {
        type: 'quiz',
        question: 'What defines code blocks in Python instead of braces?',
        questionEs: '¿Qué define los bloques de código en Python en lugar de llaves?',
        options: [
          { es: 'Los paréntesis', en: 'Parentheses' },
          { es: 'La indentación', en: 'Indentation' },
          { es: 'El punto y coma', en: 'The semicolon' },
          { es: 'Las comillas', en: 'Quotes' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'python-02',
    pathId: 'scripting',
    order: 2,
    title: 'Basics: variables, types and conditions',
    titleEs: 'Bases: variables, tipos y condiciones',
    readingMinutes: 9,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Python tiene pocos tipos y muy intuitivos: números, textos, listas y diccionarios. Con esos cuatro y un if, ya podés modelar casi cualquier cosa de un pentest.',
            en: "Python has few types and very intuitive ones: numbers, strings, lists and dictionaries. With those four and an if, you can model almost anything in a pentest.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/py02-types-conditions.mp4',
        srcEn: '/videos/en/py02-types-conditions.mp4',
        durationSec: 58,
        caption: 'Four types — int, str, list, dict — and an if: with that you can model almost anything in a pentest. F-strings to format.',
        captionEs: 'Cuatro tipos — int, str, list, dict — y un if: con eso modelás casi cualquier cosa de un pentest. F-strings para formatear.',
      },
      {
        type: 'content',
        title: 'Types: int, str, list, dict',
        titleEs: 'Tipos: int, str, list, dict',
        body: '`ip = "10.0.0.11"` (str), `puerto = 445` (int), `abiertos = [22, 80, 443]` (list), `servidor = {"ip": "10.0.0.11", "os": "windows"}` (dict). Access: `abiertos[0]`, `servidor["os"]`. F-strings build text: `print(f"{ip}:{puerto} está abierto")`. `len()` gives the size, `in` checks membership: `445 in abiertos`.',
        bodyEs: '`ip = "10.0.0.11"` (str), `puerto = 445` (int), `abiertos = [22, 80, 443]` (list), `servidor = {"ip": "10.0.0.11", "os": "windows"}` (dict). Acceso: `abiertos[0]`, `servidor["os"]`. Los f-strings arman texto: `print(f"{ip}:{puerto} está abierto")`. `len()` da el tamaño, `in` verifica pertenencia: `445 in abiertos`.',
      },
      {
        type: 'content',
        title: 'Conditions',
        titleEs: 'Condiciones',
        body: '`if puerto == 445: print("SMB")` — note the colon and the indented block. `elif` chains, `else` closes. Comparisons: `==`, `!=`, `<`, `>`, `and`, `or`, `not`. `input()` always returns text, so convert with `int(...)` when you need a number.',
        bodyEs: '`if puerto == 445: print("SMB")` — ojo con los dos puntos y el bloque indentado. `elif` encadena, `else` cierra. Comparaciones: `==`, `!=`, `<`, `>`, `and`, `or`, `not`. `input()` siempre devuelve texto, así que convertí con `int(...)` cuando necesites un número.',
      },
      {
        type: 'terminal-demo',
        command: 'puerto = int(input("Puerto a probar: "))\nservicios = {22: "SSH", 80: "HTTP", 445: "SMB", 3389: "RDP", 5985: "WinRM"}\nif puerto in servicios:\n    print(f"{puerto} → {servicios[puerto]}")\nelse:\n    print(f"{puerto} → desconocido")',
        output: 'Puerto a probar: 445\n445 → SMB',
        explanation: 'A dictionary maps ports to services. The script asks for a port, checks if it is known and prints the service. This is the heart of a port-based decision script.',
        explanationEs: 'Un diccionario mapea puertos a servicios. El script pide un puerto, verifica si es conocido e imprime el servicio. Este es el corazón de un script de decisión por puertos.',
      },
      {
        type: 'quiz',
        question: 'What does input() return in Python?',
        questionEs: '¿Qué devuelve input() en Python?',
        options: [
          { es: 'Un número entero', en: 'An integer' },
          { es: 'Texto (str)', en: 'Text (str)' },
          { es: 'Una lista', en: 'A list' },
          { es: 'Un booleano', en: 'A boolean' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'python-03',
    pathId: 'scripting',
    order: 3,
    title: 'Loops, functions and libraries',
    titleEs: 'Bucles, funciones y librerías',
    readingMinutes: 9,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'El 80% de tus scripts serán bucles sobre IPs y puertos, funciones para no repetirte, e imports para traer poder externo. Acá ves las tres piezas.',
            en: "80% of your scripts will be loops over IPs and ports, functions to avoid repetition, and imports to bring in external power. Here are the three pieces.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/py03-loops-libraries.mp4',
        srcEn: '/videos/en/py03-loops-libraries.mp4',
        durationSec: 55,
        caption: '80% of your scripts: loops over IPs and ports, functions with def and imports to bring in external power.',
        captionEs: 'El 80% de tus scripts: bucles sobre IPs y puertos, funciones con def e imports para traer poder externo.',
      },
      {
        type: 'content',
        title: 'Loops',
        titleEs: 'Bucles',
        body: '`for i in range(1, 255):` — iterate 1..254. `for p in [22, 80, 443]:` — iterate a list. `for linea in open("wordlist.txt"):` — read a file line by line. `while True:` — loop forever (with a break inside). `range`, lists and files: the three iteration sources.',
        bodyEs: '`for i in range(1, 255):` — itera 1..254. `for p in [22, 80, 443]:` — itera una lista. `for linea in open("wordlist.txt"):` — lee un archivo línea por línea. `while True:` — bucle infinito (con un break adentro). `range`, listas y archivos: las tres fuentes de iteración.',
      },
      {
        type: 'content',
        title: 'Functions and imports',
        titleEs: 'Funciones e imports',
        body: '`def escanear(host, puerto):` defines a function; call it with `escanear("10.0.0.11", 445)`. `import socket` / `from socket import socket` bring in libraries. The essentials for pentesting: `socket` (raw TCP/UDP), `sys` (arguments via `sys.argv`), `subprocess` (run system commands), `time` (sleep for patience).',
        bodyEs: '`def escanear(host, puerto):` define una función; la llamás con `escanear("10.0.0.11", 445)`. `import socket` / `from socket import socket` trae librerías. Las esenciales para pentesting: `socket` (TCP/UDP crudo), `sys` (argumentos vía `sys.argv`), `subprocess` (correr comandos del sistema), `time` (sleep para tener paciencia).',
      },
      {
        type: 'terminal-demo',
        command: 'import socket\nhost = "10.0.0.11"\nfor p in [22, 80, 445]:\n    s = socket.socket()\n    s.settimeout(1)\n    r = s.connect_ex((host, p))\n    print(f"{host}:{p} →", "abierto" if r == 0 else "cerrado")\n    s.close()',
        output: '10.0.0.11:22 → abierto\n10.0.0.11:80 → abierto\n10.0.0.11:445 → cerrado',
        explanation: 'The first real network code: for each port, open a socket, try to connect, print the result. connect_ex returns 0 on success — the basis of every Python port scanner.',
        explanationEs: 'El primer código de red real: para cada puerto, abrí un socket, intentá conectar, imprimí el resultado. connect_ex devuelve 0 si hay éxito — la base de todo scanner de puertos en Python.',
      },
      {
        type: 'quiz',
        question: 'Which library does Python use for raw TCP/UDP connections?',
        questionEs: '¿Qué librería usa Python para conexiones TCP/UDP crudas?',
        options: [
          { es: 'requests', en: 'requests' },
          { es: 'socket', en: 'socket' },
          { es: 'os', en: 'os' },
          { es: 'json', en: 'json' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'python-04',
    pathId: 'scripting',
    order: 4,
    title: 'Pentesting I: networking with socket',
    titleEs: 'Pentesting I: redes con socket',
    readingMinutes: 10,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Ahora el caso real: un scanner de puertos en Python. El objetivo del lab (10.0.0.11) espera. Escribís el script, lo corrés y ves qué puertas tiene abiertas.',
            en: "Now the real case: a port scanner in Python. The lab target (10.0.0.11) is waiting. You write the script, run it and see which doors are open.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/py04-socket-networking.mp4',
        srcEn: '/videos/en/py04-socket-networking.mp4',
        durationSec: 49,
        caption: 'Your first network script: a port scanner with socket, try/except and banner grabbing.',
        captionEs: 'Tu primer script de red: un scanner de puertos con socket, try/except y banner grabbing.',
      },
      {
        type: 'content',
        title: 'Banner grabbing',
        titleEs: 'Banner grabbing',
        body: 'Connecting is step one; reading what the service says is step two. `s.recv(1024)` reads the banner a service sends on connect (FTP says hello, SSH sends its version). That banner tells you the exact service and version — the data you search exploits for.',
        bodyEs: 'Conectar es el paso uno; leer lo que dice el servicio es el paso dos. `s.recv(1024)` lee el banner que un servicio manda al conectar (FTP saluda, SSH manda su versión). Ese banner te dice el servicio y la versión exacta — los datos que buscás para los exploits.',
      },
      {
        type: 'content',
        title: 'The scanner script',
        titleEs: 'El script del scanner',
        body: 'Pattern: `host = sys.argv[1]` (target from argument), loop over ports, `try/except` to swallow timeouts, `s.settimeout(0.5)` for speed. A real scanner wraps each connect in try/except so one closed port does not crash the whole run. That is the difference between a demo and a tool.',
        bodyEs: 'Patrón: `host = sys.argv[1]` (objetivo desde el argumento), bucle sobre puertos, `try/except` para tragar timeouts, `s.settimeout(0.5)` para velocidad. Un scanner real envuelve cada conexión en try/except para que un puerto cerrado no tumbe toda la corrida. Esa es la diferencia entre una demo y una herramienta.',
      },
      {
        type: 'terminal-demo',
        command: 'import socket, sys\nhost = sys.argv[1]\nfor p in range(1, 100):\n    s = socket.socket()\n    s.settimeout(0.5)\n    try:\n        if s.connect_ex((host, p)) == 0:\n            print(f"[+] {host}:{p} abierto")\n    finally:\n        s.close()',
        output: '[+] 10.0.0.11:21 abierto\n[+] 10.0.0.11:22 abierto\n[+] 10.0.0.11:80 abierto',
        explanation: 'Run with: python3 scan.py 10.0.0.11. It scans the first 100 ports and prints the open ones. sys.argv[1] makes it reusable for any target.',
        explanationEs: 'Se corre con: python3 scan.py 10.0.0.11. Escanea los primeros 100 puertos e imprime los abiertos. sys.argv[1] lo hace reutilizable para cualquier objetivo.',
      },
      {
        type: 'practical-exercise',
        task: 'In the lab, save the scanner as /tmp/scan.py (with nano) and run python3 /tmp/scan.py 10.0.0.11. Which ports are open? Then compare with nmap -sV 10.0.0.11.',
        taskEs: 'En el lab, guardá el scanner como /tmp/scan.py (con nano) y ejecutá python3 /tmp/scan.py 10.0.0.11. ¿Qué puertos están abiertos? Después comparalo con nmap -sV 10.0.0.11.',
        hint: 'nano /tmp/scan.py → pegar el script → python3 /tmp/scan.py 10.0.0.11 → nmap -sV 10.0.0.11 para comparar',
        hintEs: 'nano /tmp/scan.py → pegar el script → python3 /tmp/scan.py 10.0.0.11 → nmap -sV 10.0.0.11 para comparar',
        labId: 'scenario-01',
      },
      {
        type: 'quiz',
        question: 'Why does a good scanner wrap each connection in try/except?',
        questionEs: '¿Por qué un buen scanner envuelve cada conexión en try/except?',
        options: [
          { es: 'Para que sea más rápido', en: 'To make it faster' },
          { es: 'Para que un puerto cerrado no tumbe la corrida', en: 'So a closed port does not crash the run' },
          { es: 'Para ocultar el scanner', en: 'To hide the scanner' },
          { es: 'Para cifrar el tráfico', en: 'To encrypt the traffic' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'python-05',
    pathId: 'scripting',
    order: 5,
    title: 'Pentesting II: HTTP with requests',
    titleEs: 'Pentesting II: HTTP con requests',
    readingMinutes: 10,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'La web es el blanco número uno. Con la librería requests automatizás ataques HTTP: probar logins, descubrir rutas, mandar payloads. Cierre perfecto del módulo.',
            en: "The web is target number one. With the requests library you automate HTTP attacks: testing logins, discovering paths, sending payloads. Perfect closure for the module.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/py05-http-requests.mp4',
        srcEn: '/videos/en/py05-http-requests.mp4',
        durationSec: 60,
        caption: 'HTTP in three lines with requests, and a login brute force that decides by the response. The module closer.',
        captionEs: 'HTTP en tres líneas con requests y un brute force de login que decide por la respuesta. El cierre del módulo.',
      },
      {
        type: 'content',
        title: 'requests: HTTP in three lines',
        titleEs: 'requests: HTTP en tres líneas',
        body: '`r = requests.get("http://10.0.0.11")` — one line, response in r. Read it: `r.status_code` (200, 404...), `r.headers` (the Server header), `r.text` (the body). POST sends data: `requests.post(url, data={"user": "admin", "pass": "1234"})`. A `Session()` keeps cookies between requests — like a browser that stays logged in.',
        bodyEs: '`r = requests.get("http://10.0.0.11")` — una línea, la respuesta en r. La leés: `r.status_code` (200, 404...), `r.headers` (la cabecera Server), `r.text` (el cuerpo). POST envía datos: `requests.post(url, data={"user": "admin", "pass": "1234"})`. Una `Session()` mantiene las cookies entre peticiones — como un navegador que sigue logueado.',
      },
      {
        type: 'content',
        title: 'Automating a login attack',
        titleEs: 'Automatizando un ataque de login',
        body: 'The brute-force pattern: load a wordlist of passwords, POST each one, and decide by the response — a redirect, a "welcome" in the body, or a different status code means success. `for passwd in open("passwords.txt"): r = requests.post(url, data={...}); if "bienvenido" in r.text: print(f"[+] {passwd}")`. Same pattern works for directory discovery with GET and status codes.',
        bodyEs: 'El patrón de fuerza bruta: cargá una wordlist de contraseñas, POSTea cada una, y decidí por la respuesta — un redirect, un "bienvenido" en el cuerpo, o un código distinto significa éxito. `for passwd in open("passwords.txt"): r = requests.post(url, data={...}); if "bienvenido" in r.text: print(f"[+] {passwd}")`. El mismo patrón sirve para descubrir directorios con GET y códigos de estado.',
      },
      {
        type: 'terminal-demo',
        command: 'import requests\nurl = "http://10.0.0.11/login"\nfor p in ["admin", "123456", "password", "toor"]:\n    r = requests.post(url, data={"user": "admin", "pass": p})\n    if "bienvenido" in r.text.lower():\n        print(f"[+] credencial: admin:{p}")\n        break\n    else:\n        print(f"[-] admin:{p}")',
        output: '[-] admin:admin\n[-] admin:123456\n[-] admin:password\n[+] credencial: admin:toor',
        explanation: 'A tiny password list against a login form. The response body decides: if it contains "welcome", the credential is valid. Scale it with a real wordlist and you have a brute-forcer.',
        explanationEs: 'Una mini lista de contraseñas contra un formulario de login. El cuerpo de la respuesta decide: si contiene "bienvenido", la credencial es válida. Escalalo con una wordlist real y tenés un brute-forcer.',
      },
      {
        type: 'quiz',
        question: 'In an HTTP brute force with requests, how do you usually detect a successful login?',
        questionEs: 'En un brute force HTTP con requests, ¿cómo se suele detectar un login exitoso?',
        options: [
          { es: 'Comparando el tamaño del archivo', en: 'Comparing the file size' },
          { es: 'Por la respuesta: un texto/status distinto al del fallo', en: 'By the response: a different text/status than the failure' },
          { es: 'Midiendo el tiempo de la petición', en: 'Measuring the request time' },
          { es: 'No se puede detectar', en: 'It cannot be detected' },
        ],
        correctIndex: 1,
      },
    ],
  },
];
