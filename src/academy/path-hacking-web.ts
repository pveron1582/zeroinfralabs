// ── academy/path-hacking-web.ts ────────────────────────────────────
// Path: Hacking Web — vulnerabilidades y protocolos del lado web.

import type { Lesson } from '../types';

export const HACKING_WEB_LESSONS: Lesson[] = [
  {
    // Movida desde Pentesting (path-hacking) el 2026-08-17: conserva su id
    // `proto-02` para no perder el progreso guardado de quien ya la completó.
    id: 'proto-02',
    pathId: 'hacking-web',
    order: 1,
    title: 'Web hacking protocols: HTTP, HTTPS and more',
    titleEs: 'Protocolos en hacking web: HTTP, HTTPS y más',
    readingMinutes: 9,
    labRef: 'scenario-01',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'La web es el campo de batalla más grande que existe. HTTP y HTTPS son sus dos idiomas principales — y hay un par más que conviene tener en el radar.',
            en: 'The web is the biggest battlefield that exists. HTTP and HTTPS are its two main languages — and there are a couple more worth keeping on your radar.',
          },
        ],
      },
      {
        type: 'content',
        title: 'HTTP: the unencrypted web',
        titleEs: 'HTTP: la web sin cifrar',
        body: 'It runs on port `80` and sends everything in plain text: whoever captures the traffic reads the full requests. Main methods: `GET` (ask for a resource), `POST` (send data). Headers and cookies carry sessions. This is where the classic vulnerabilities live: SQL injection, XSS, command injection.',
        bodyEs: 'Corre en el puerto `80` y manda todo en texto plano: quien capture el tráfico lee las peticiones completas. Métodos principales: `GET` (pedir un recurso), `POST` (enviar datos). Las cabeceras y cookies llevan las sesiones. Acá viven las vulnerabilidades clásicas: inyección SQL, XSS, inyección de comandos.',
      },
      {
        type: 'content',
        title: 'HTTPS: the encrypted web',
        titleEs: 'HTTPS: la web cifrada',
        body: 'It runs on port `443` and wraps HTTP in TLS, which encrypts the content: the traffic can no longer be read in clear. Key idea: the encryption protects the channel, not the application — injections still work because they travel inside legitimate traffic.',
        bodyEs: 'Corre en el puerto `443` y envuelve al HTTP en TLS, que cifra el contenido: ya no se puede leer el tráfico en claro. Idea clave: el cifrado protege el canal, no la aplicación — las inyecciones siguen funcionando porque viajan dentro del tráfico legítimo.',
      },
      {
        type: 'content',
        title: 'Other web protocols',
        titleEs: 'Otros protocolos web',
        body: '`WebSocket`: persistent two-way connection (chats, trading, real-time dashboards). `WebDAV`: edit files on the server over HTTP — sometimes forgotten with weak auth. `REST/API`: JSON over HTTP, the language of modern applications. And watch out: DNS can also be an attack protocol — exfiltrating data inside DNS queries.',
        bodyEs: '`WebSocket`: conexión bidireccional persistente (chats, trading, dashboards en tiempo real). `WebDAV`: editar archivos en el servidor a través de HTTP — a veces olvidado con autenticación débil. `REST/API`: JSON sobre HTTP, el idioma de las aplicaciones modernas. Y ojo: el DNS también puede ser protocolo de ataque — exfiltrar datos dentro de consultas DNS.',
      },
      {
        type: 'terminal-demo',
        command: 'curl -I http://10.0.0.11',
        output: 'HTTP/1.1 200 OK\nDate: Mon, 10 Aug 2026 14:22:05 GMT\nServer: Apache/2.4.41 (Ubuntu)\nContent-Type: text/html',
        explanation: 'The Server header gives you the web server and its version — the first data point to pick an exploit. `curl -I` asks for headers only.',
        explanationEs: 'La cabecera Server te da el servidor web y su versión — el primer dato para elegir un exploit. `curl -I` pide solo las cabeceras.',
      },
      {
        type: 'quiz',
        question: 'Which web protocol keeps a persistent two-way connection?',
        questionEs: '¿Qué protocolo web mantiene una conexión bidireccional y persistente?',
        options: [
          { es: 'HTTP', en: 'HTTP' },
          { es: 'HTTPS', en: 'HTTPS' },
          { es: 'WebSocket', en: 'WebSocket' },
          { es: 'SMTP', en: 'SMTP' },
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'web-01',
    pathId: 'hacking-web',
    order: 2,
    title: 'XSS: injecting scripts into the browser',
    titleEs: 'XSS: inyectando scripts en el navegador',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Hay una vulnerabilidad que no se ejecuta en el servidor, sino en el navegador de la víctima. El XSS te deja correr código JavaScript donde no deberías. Vamos a lo básico.',
            en: 'There is a vulnerability that does not run on the server, but in the victim\u2019s browser. XSS lets you run JavaScript where you should not. Let\u2019s get the basics.',
          },
        ],
      },
      {
        type: 'content',
        title: 'What is XSS?',
        titleEs: '¿Qué es XSS?',
        body: '**Cross-Site Scripting (XSS)** happens when an application echoes user input back without escaping it, and the browser interprets it as code instead of text. Instead of blaming the victim\u2019s browser, it is your input executing inside their page. The classic proof-of-concept is `<script>alert(1)</script>`: if it pops a dialog inside your session, the app is vulnerable.',
        bodyEs: '**Cross-Site Scripting (XSS)** ocurre cuando la aplicación devuelve lo que escribís sin escaparlo, y el navegador lo interpreta como código en vez de texto. No es culpa del navegador de la víctima: es tu entrada ejecutándose dentro de su página. La prueba clásica es `<script>alert(1)</script>`: si te sale un diálogo dentro de tu sesión, la app es vulnerable.',
      },
      {
        type: 'content',
        title: 'The three flavors, the basics',
        titleEs: 'Los tres tipos, lo básico',
        body: '`Reflected`: your payload goes inside the URL or a request and the server echoes it immediately (search boxes). `Stored`: the payload is saved on the server — a comment, a profile field — and runs for every visitor, the most dangerous. `DOM`: the payload never reaches the server; it runs on the client side manipulating the page.',
        bodyEs: '`Reflected`: tu payload va en la URL o en una petición y el servidor lo devuelve al instante (buscadores, formularios). `Stored`: el payload queda guardado en el servidor — un comentario, un campo del perfil — y se ejecuta para todo visitante; es el más peligroso. `DOM`: el payload nunca llega al servidor; se ejecuta del lado del cliente manipulando la página.',
      },
      {
        type: 'terminal-demo',
        command: "curl 'http://10.0.0.11/search?q=<script>alert(1)</script>'",
        output: '<div class="result">Results for: <script>alert(1)</script></div>',
        explanation: 'The server reflects the search term inside the HTML without escaping it. When the victim opens that URL, `<script>` becomes executable code in their browser instead of literal text.',
        explanationEs: 'El servidor devuelve el término buscado dentro del HTML sin escaparlo. Cuando la víctima abre esa URL, `<script>` se convierte en código ejecutable en su navegador en vez de texto literal.',
      },
      {
        type: 'content',
        title: 'Why XSS matters',
        titleEs: 'Por qué importa el XSS',
        body: 'Inside the victim\u2019s browser, JavaScript can read **cookies** (session hijacking — you steal the login), capture keystrokes, snap the page, redirect to phishing, or call APIs on the victim\u2019s behalf. It runs with the privileges of the logged-in user, so the more rights the user has, the more you get. Defense: escape output and never trust user input as HTML.',
        bodyEs: 'Dentro del navegador de la víctima, JavaScript puede leer **cookies** (secuestro de sesión — robás el login), capturar tecleos, sacar capturas, redirigir a phishing o llamar APIs en nombre de la víctima. Corre con los permisos del usuario logueado: a más privilegios del usuario, más conseguís. Defensa: escapar la salida y no confiar nunca en la entrada del usuario como HTML.',
      },
      {
        type: 'quiz',
        question: 'Which type of XSS is stored on the server and then runs for every visitor?',
        questionEs: '¿Qué tipo de XSS se guarda en el servidor y luego se ejecuta para todo visitante?',
        options: [
          { es: 'Reflected', en: 'Reflected' },
          { es: 'Stored', en: 'Stored' },
          { es: 'DOM', en: 'DOM' },
          { es: 'CSRF', en: 'CSRF' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'web-02',
    pathId: 'hacking-web',
    order: 3,
    title: 'SQL Injection: talking to the database',
    titleEs: 'SQL Injection: hablándole a la base de datos',
    readingMinutes: 8,
    labRef: 'scenario-06',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Si una app arma su consulta a la base de datos uniendo tu input sin filtrarlo, dejás de escribir texto y empezás a hablar SQL directo con el servidor. Eso es inyección SQL.',
            en: 'If an app builds its database query by concatenating your input without filtering it, you stop typing text and start speaking SQL straight to the server. That is SQL injection.',
          },
        ],
      },
      {
        type: 'content',
        title: 'What is SQL injection?',
        titleEs: '¿Qué es la inyección SQL?',
        body: 'When a login or search field is plugged directly into a SQL query, an attacker can inject fragments that change the query\u2019s logic. The database treats your input as commands. Beyond authentication, you can read, alter or delete entire tables.',
        bodyEs: 'Cuando un campo de login o de búsqueda se pega directo en una consulta SQL, un atacante puede inyectar fragmentos que cambian la lógica de la consulta. La base de datos trata tu entrada como comandos. Más allá de la autenticación, podés leer, modificar o borrar tablas enteras.',
      },
      {
        type: 'content',
        title: 'The classic auth bypass',
        titleEs: 'El clásico: saltarse el login',
        body: 'A login query looks like `SELECT * FROM users WHERE username = \'\' AND password = \'\'`. If you send `\' OR \'1\'=\'1` as the username, the condition becomes always-true: `WHERE username = \'\' OR \'1\'=\'1\' AND password = \'...\'`. The server lets you in as the first row — often admin.',
        bodyEs: 'Un login arma algo como `SELECT * FROM users WHERE username = \'\' AND password = \'\'`. Si mandás `\' OR \'1\'=\'1` como usuario, la condición queda siempre verdadera: `WHERE username = \'\' OR \'1\'=\'1\' AND password = \'...\'`. El servidor te deja pasar como la primera fila — a menudo admin.',
      },
      {
        type: 'terminal-demo',
        command: "curl -d \"username=admin' OR '1'='1\" --data-urlencode password=x http://10.0.0.11/login",
        output: 'HTTP/1.1 200 OK\nWelcome admin!',
        explanation: 'The quotes close the string and `OR \'1\'=\'1` makes the condition always true. The SQL that reaches the database is not a login anymore, it is a tautology that returns the first user.',
        explanationEs: 'Las comillas cierran el string y `OR \'1\'=\'1` vuelve la condición siempre verdadera. El SQL que llega a la base ya no es un login, es una tautología que devuelve al primer usuario.',
      },
      {
        type: 'content',
        title: 'More than the login: the impact',
        titleEs: 'Más allá del login: el impacto',
        body: '`In-band`: read data directly with queries (`UNION` to merge extra results, error messages that leak data). `Blind`: no visible output, you ask true/false questions (boolean) or measure delays (time-based). Impact: dump usernames and password hashes, extract customers and secrets, escalate to full server access if the DB user has privileges. Defense: **parameterized queries** — send the user input as data, never as SQL.',
        bodyEs: '`In-band`: leés datos directo con consultas (`UNION` para sumar resultados extra, mensajes de error que filtran información). `Blind`: no hay salida visible; hacés preguntas de sí/no (boolean) o medís demoras (time-based). Impacto: volcar usuarios y hashes de contraseñas, extraer clientes y secretos, escalar a acceso total al servidor si el usuario de la DB tiene privilegios. Defensa: **consultas parametrizadas** — la entrada del usuario viaja como dato, nunca como SQL.',
      },
      {
        type: 'quiz',
        question: 'Which action prevents SQL injection in most cases?',
        questionEs: '¿Qué acción previene la inyección SQL en la mayoría de los casos?',
        options: [
          { es: 'Usar consultas parametrizadas', en: 'Using parameterized queries' },
          { es: 'Escribir más comentarios en el código', en: 'Writing more comments in the code' },
          { es: 'Renombrar la tabla de usuarios', en: 'Renaming the users table' },
          { es: 'Cambiar el puerto de la base de datos', en: 'Changing the database port' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'web-03',
    pathId: 'hacking-web',
    order: 4,
    title: 'Path Traversal & LFI: reading files to get code execution',
    titleEs: 'Path Traversal y LFI: de leer archivos a ejecutar código',
    readingMinutes: 9,
    labRef: 'scenario-04',
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Si la app usa tu input para elegir qué archivo incluir, controlás el archivo... y a veces mucho más. Path traversal te deja escapar del directorio web; el LFI lo lleva a leer archivos del servidor en el peor lugar posible.',
            en: 'If the app uses your input to pick which file to include, you control the file... and sometimes much more. Path traversal lets you escape the web directory; LFI goes further and reads server files in the worst possible place.',
          },
        ],
      },
      {
        type: 'content',
        title: 'Path Traversal: escaping the web root',
        titleEs: 'Path Traversal: escaparse de la raíz web',
        body: 'The web server exposes only a folder (`/var/www/html`), but an endpoint serving files by name (`page=home.php`) may accept `../../` to climb out of it. `../../../../etc/passwd` walks up four folders and reads the password file. Few `..` get you back to the root; then you append any absolute path you want to read.',
        bodyEs: 'El servidor web expone solo una carpeta (`/var/www/html`), pero un endpoint que sirve archivos por nombre (`page=home.php`) puede aceptar `../../` para subir por el árbol. `../../../../etc/passwd` escala cuatro directorios y lee el archivo de cuentas: unos pocos `..` te llevan a la raíz; después agregás la ruta absoluta que quieras.',
      },
      {
        type: 'terminal-demo',
        command: "curl 'http://10.0.0.11/?page=../../../../etc/passwd'",
        output: "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
        explanation: '`..` climbs folders before the path is appended to the include. The web server joins it blindly and returns `/etc/passwd` instead of a page. Reading order: first `etc/passwd` (who exists), then configs with secrets.',
        explanationEs: 'Los `..` suben de directorio antes de que la ruta se pegue a la raíz. El servidor une la ruta a ciegas y devuelve `/etc/passwd` en vez de una página. Orden de lectura: primero `etc/passwd` (qué usuarios existen), después los configs con secretos.',
      },
      {
        type: 'content',
        title: 'LFI: Local File Inclusion',
        titleEs: 'LFI: inclusión local de archivos',
        body: 'When the app **includes** a file (`include($page)` in PHP) instead of just returning it, you can pull source code: `php://filter` streams read files without executing them (`php://filter/convert.base64-encode/resource=config.php` → config never runs, comes back base64). Now you can read credentials, API keys and source logic. Same payload family, one step deeper: not just reading, but forcing the server to include anything local.',
        bodyEs: 'Cuando la app **incluye** un archivo (`include($page)` en PHP) en vez de devolverlo, podés traer el código fuente: los streams de `php://filter` lo leen sin ejecutarlo (`php://filter/convert.base64-encode/resource=config.php` — el config no corre, vuelve en base64). Ahora podés leer credenciales, claves de API y el código fuente. Mismo payload, un paso más adentro: no solo leer, sino forzar al servidor a incluir lo local.',
      },
      {
        type: 'content',
        title: 'From LFI to RCE: log poisoning',
        titleEs: 'De LFI a RCE: log poisoning',
        body: 'The final escalation. If the server writes your request into a log file and you can **include** that log, you feed PHP code inside a log line and the include() executes it. `User-Agent: <?php system($_GET["cmd"]); ?>` lands in access.log; then include it and call `?cmd=id`. The app includes a file that never was meant to be code — and gives you a shell. Defense: no user-controlled paths into include/open, validate to a whitelist, and run the web server under the least privileges.',
        bodyEs: 'La escalada final. Si el servidor escribe tus peticiones en un log y podés **incluir** ese log, metés código PHP en una línea de log y el `include()` lo ejecuta. `User-Agent: <?php system($_GET["cmd"]); ?>` aterriza en el access log; después incluilo y llamá `?cmd=id`. Un archivo que nunca debía ser código ejecuta el tuyo — y ganás una shell. Defensa: nunca meter input del usuario en rutas de `include`/`open`, validar contra una lista blanca y correr el servidor web con el menor privilegio posible.',
      },
      {
        type: 'quiz',
        question: 'What technique escalates LFI to Remote Code Execution?',
        questionEs: '¿Qué técnica escala de LFI a Remote Code Execution?',
        options: [
          { es: 'Añadir más `../` a la ruta', en: 'Adding more `../` to the path' },
          { es: 'Añadir código PHP a un log que luego se incluye', en: 'Injecting PHP into a log file and then including it' },
          { es: 'Haciendo fuerza bruta contra la página de inicio de sesión', en: 'By brute forcing the login page' },
          { es: 'Cambiando el puerto del servidor', en: 'Changing the server port' },
        ],
        correctIndex: 1,
      },
    ],
  },
];
