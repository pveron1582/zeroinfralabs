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
];