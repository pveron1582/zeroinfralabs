// ── blog/article-academy-launch.ts ─────────────────────────────────
// Artículo del blog que presenta la ZILabs Academy (beta abierta y gratis).
// Imágenes: placeholders nombrados — reemplazar por screenshots reales en /public/.

import type { BlogArticle } from './articles';

export const ACADEMY_LAUNCH_ARTICLE: BlogArticle = {
  slug: 'zilabs-academy-learn-cybersecurity-from-zero',
  slugEs: 'zilabs-academy-aprende-ciberseguridad-desde-cero',
  title: 'ZILabs Academy: learn cybersecurity from zero (free, in your browser)',
  titleEs: 'ZILabs Academy: aprendé ciberseguridad desde cero (gratis, en tu navegador)',
  date: '2026-08-15',
  author: '@pabloveron',
  excerpt: 'A new free section to learn the fundamentals before jumping into the labs: operating systems, networking, security basics and scripting — interactive lessons with mini terminals and network simulators.',
  excerptEs: 'Una nueva sección gratis para aprender los fundamentos antes de entrar a los laboratorios: sistemas operativos, redes, fundamentos de seguridad y scripting — lecciones interactivas con mini terminales y simuladores de red.',
  tags: ['academy', 'ciberseguridad', 'principiantes', 'fundamentos', 'gratis'],
  ctaTo: 'academy',
  content: `## Why we built an Academy before the labs

Most people who want to get into hacking hit the same wall: they open a lab, face a terminal, and don't know what to type. They can run a command, but they don't understand *why* it works.

That gap is what kills motivation. You can't exploit a system if you don't know how an operating system works. You can't intercept traffic if you don't know what a packet is.

So we built **ZILabs Academy**: a free section that teaches you the fundamentals *before* you touch a lab.

![ZILabs Academy home with the learning paths](/academy-01-home.png)

## What you actually learn

The Academy is organized into learning paths, each with short interactive lessons. No long videos to passively watch — every lesson has built-in steps: content, mini terminals, network simulators and quizzes.

The current paths:

- **Operating Systems** — Linux and Windows: filesystems, users, permissions, where attackers look first. Plus other systems like macOS, BSD, ChromeOS, Android, iOS and Raspberry Pi.
- **Networking** — what a network is, how IPs work, the OSI and TCP/IP models, ports, classic services, DMZ and man-in-the-middle.
- **Cybersecurity fundamentals** — the CIA triad, encryption vs hashing, and how passwords are cracked.
- **Pentesting** — the 5-phase methodology: recon, scanning, exploitation, post-exploitation, reporting.
- **Scripting for pentesting** — Bash, PowerShell and Python: the languages attackers automate with.

![Interactive lesson with an embedded mini terminal](/academy-02-lesson.png)

## Interactive, not passive

Every lesson is a step-by-step experience. You read a concept, then you *see* it in action:

- **Mini terminals** run real commands inside the browser — no setup, no Kali, no virtual machines.
- **Network simulators** show you how packets move through a switch, a router or a man-in-the-middle.
- **Quizzes and matching exercises** lock your progress until you actually understand the topic.

The idea is simple: you learn by doing, from the very first lesson.

![Network simulator showing packets between devices](/academy-03-network-sim.png)

## Who it's for

The Academy is built for **absolute beginners**. If you've never opened a terminal, that's fine — the first Linux lesson starts with what a shell even is and why it exists.

If you already know some Linux, you can jump straight to networking or pentesting and fill the gaps you have.

And the whole thing is **free and in your browser**. No account required to start, no install, no configuration. Spanish and English are both supported.

## It's a beta — and it's growing

The Academy is in **open beta** right now. That means:

- **It's free** during this phase.
- **New lessons are being added** — not every path is complete yet, but the format and the core fundamentals are already there.
- **Feedback shapes what comes next** — tell us what you'd like to see and we'll prioritize it.

The goal isn't to be a university course. It's to give you the solid base you need so that when you enter a lab, you understand what you're doing.

![Academy module list with progress tracking](/academy-04-modules.png)

## How to start

1. Go to **[zilabs.vercel.app](https://zilabs.vercel.app/)** and click **Academy**.
2. Pick the path that interests you — Operating Systems is the recommended starting point.
3. Complete lessons, track your progress, and when you're ready, jump into the labs.

Learning cybersecurity is a journey. The Academy is here so you don't have to start it alone. 🦊`,
  contentEs: `## Por qué hicimos una academia antes que los labs

La mayoría de las personas que quieren entrar al hacking se golpean con la misma pared: abren un laboratorio, ven una terminal, y no saben qué escribir. Pueden ejecutar un comando, pero no entienden *por qué* funciona.

Ese hueco es lo que mata la motivación. No podés explotar un sistema si no sabés cómo funciona un sistema operativo. No podés interceptar tráfico si no sabés qué es un paquete.

Por eso construimos **ZILabs Academy**: una sección gratis que te enseña los fundamentos *antes* de tocar un laboratorio.

![Inicio de ZILabs Academy con las rutas de aprendizaje](/academy-01-home.png)

## Qué vas a aprender de verdad

La Academy se organiza en rutas de aprendizaje, cada una con lecciones cortas e interactivas. No hay videos largos para mirar pasivamente — cada lección tiene pasos: contenido, mini terminales, simuladores de red y cuestionarios.

Las rutas actuales:

- **Sistemas Operativos** — Linux y Windows: filesystems, usuarios, permisos, dónde miran los atacantes primero. Más otros sistemas como macOS, BSD, ChromeOS, Android, iOS y Raspberry Pi.
- **Redes** — qué es una red, cómo funcionan las IPs, los modelos OSI y TCP/IP, puertos, servicios clásicos, DMZ y man-in-the-middle.
- **Fundamentos de ciberseguridad** — la triada CID, cifrado vs hashing, y cómo se crackean las contraseñas.
- **Pentesting** — la metodología de 5 fases: reconocimiento, escaneo, explotación, post-explotación, reporte.
- **Scripting para pentesting** — Bash, PowerShell y Python: los lenguajes con los que se automatizan los ataques.

![Lección interactiva con una mini terminal embebida](/academy-02-lesson.png)

## Interactivo, no pasivo

Cada lección es una experiencia paso a paso. Leés un concepto, después lo *ves* en acción:

- **Mini terminales** que corren comandos reales dentro del navegador — sin configurar nada, sin Kali, sin máquinas virtuales.
- **Simuladores de red** que te muestran cómo viajan los paquetes por un switch, un router o un man-in-the-middle.
- **Cuestionarios y ejercicios de emparejar** que bloquean tu avance hasta que de verdad entendés el tema.

La idea es simple: aprendés haciendo, desde la primera lección.

![Simulador de red mostrando paquetes entre dispositivos](/academy-03-network-sim.png)

## Para quién es

La Academy está pensada para **principiantes totales**. Si nunca abriste una terminal, está bien — la primera lección de Linux arranca con qué es una shell y por qué existe.

Si ya sabés algo de Linux, podés ir directo a redes o pentesting y llenar los huecos que tengas.

Y todo es **gratis y en tu navegador**. Sin cuenta para empezar, sin instalar nada, sin configurar. Soporta español e inglés.

## Es una beta — y está creciendo

La Academy está en **beta abierta** ahora mismo. Eso significa que:

- **Es gratis** durante esta fase.
- **Se están agregando lecciones nuevas** — no todas las rutas están completas todavía, pero el formato y los fundamentos centrales ya están ahí.
- **Los comentarios definen qué viene después** — decinos qué te gustaría ver y lo priorizamos.

El objetivo no es ser un curso universitario. Es darte la base sólida que necesitás para que, cuando entres a un laboratorio, entiendas qué estás haciendo.

![Lista de módulos de la Academy con seguimiento de progreso](/academy-04-modules.png)

## Cómo empezar

1. Entrá en **[zilabs.vercel.app](https://zilabs.vercel.app/)** y hacé clic en **Academy**.
2. Elegí la ruta que te interese — Sistemas Operativos es el punto de partida recomendado.
3. Completá lecciones, seguí tu progreso, y cuando estés listo, saltá a los laboratorios.

Aprender ciberseguridad es un camino. La Academy está para que no tengas que empezar ese camino solo. 🦊`,
};
