// ── academy/others-lessons.ts ──────────────────────────────────────
// Subsección Otros SO del path Sistemas Operativos.
// 4 lecciones: sistemas alternativos de PC/servidores (macOS, BSD, ChromeOS)
// → equipos portátiles y de electrónica (Android, iOS, Raspberry Pi)
// → hardware de hacking (Pineapple, Flipper Zero, Rubber Ducky)
// → gadgets ofensivos e ingeniería social (solo educativo).

import type { Lesson } from '../types';
import { OTHERS_HW_LESSONS } from './others-hw-lessons';

export const OTHERS_LESSONS: Lesson[] = [
  {
    id: 'others-01',
    pathId: 'os',
    order: 1,
    title: 'Alternative PC and server systems: macOS, BSD and ChromeOS',
    titleEs: 'Sistemas alternativos de PC y servidores: macOS, BSD y ChromeOS',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Fuera de Linux y Windows existe un tercer mundo: macOS en las Mac, BSD en routers y firewalls, ChromeOS en las Chromebooks. No son mayoría en servidores, pero los vas a encontrar en el camino.',
            en: "Beyond Linux and Windows there's a third world: macOS on Macs, BSD in routers and firewalls, ChromeOS on Chromebooks. They're not the majority on servers, but you'll meet them along the way.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ot-01-alternative-systems.mp4',
        durationSec: 116,
        caption: 'The third world of operating systems: macOS (certified Unix, zsh, /Users, launchd), the BSD family (FreeBSD, OpenBSD, NetBSD, pfSense) and ChromeOS (a Linux kernel with Chrome as the whole UI). uname answers differently in each — but they are all Unix family.',
        captionEs: 'El tercer mundo de los sistemas: macOS (Unix certificado, zsh, /Users, launchd), la familia BSD (FreeBSD, OpenBSD, NetBSD, pfSense) y ChromeOS (un kernel Linux con Chrome como toda la interfaz). uname responde distinto en cada uno — pero todos son de la familia Unix.',
      },
      {
        type: 'content',
        title: 'macOS: certified Unix with an Apple finish',
        titleEs: 'macOS: Unix certificado con acabado Apple',
        body: 'macOS is based on BSD and is certified Unix. The shell is `zsh` by default, the home folder is `/Users` instead of `/home`, and `/etc`, `/tmp` and `/var` all exist — most Linux commands work identically. Differences: `launchd` manages services instead of systemd, configs are `.plist` files, and Apple adds a proprietary layer on top: the Finder, the App Store, and security controls like SIP (System Integrity Protection) and Gatekeeper, which restrict what you can modify and run.',
        bodyEs: 'macOS está basado en BSD y es Unix certificado. La shell por defecto es `zsh`, la carpeta del usuario es `/Users` en vez de `/home`, y `/etc`, `/tmp` y `/var` existen — la mayoría de los comandos de Linux funcionan idénticos. Diferencias: `launchd` administra los servicios en vez de systemd, las configs son archivos `.plist`, y Apple suma una capa privativa encima: el Finder, la App Store y controles de seguridad como SIP (System Integrity Protection) y Gatekeeper, que limitan qué podés modificar y ejecutar.',
      },
      {
        type: 'content',
        title: 'The BSD family: FreeBSD, OpenBSD, NetBSD',
        titleEs: 'La familia BSD: FreeBSD, OpenBSD, NetBSD',
        body: 'BSD is the direct descendant of the Unix of the 70s from Berkeley. Three main branches: FreeBSD (the most used in servers and network appliances), OpenBSD (famous for being the most audited — its authors claim to have the fewest holes) and NetBSD (portable to everything). You will find BSD in routers, firewalls (pfSense and OPNSense are FreeBSD), VPN appliances and NAS. Same philosophy as Linux — CLI, permissions, files — but with a more permissive license that allows companies to take the code and not share their changes.',
        bodyEs: 'BSD es el descendiente directo del Unix de los 70 de Berkeley. Tres ramas principales: FreeBSD (la más usada en servidores y appliances de red), OpenBSD (famosa por ser la más auditada — sus autores dicen tener la menor cantidad de agujeros) y NetBSD (portable a todo). Encontrás BSD en routers, firewalls (pfSense y OPNSense son FreeBSD), appliances VPN y NAS. Misma filosofía que Linux — CLI, permisos, archivos — pero con una licencia más permisiva que permite a las empresas tomar el código sin compartir sus cambios.',
      },
      {
        type: 'content',
        title: 'ChromeOS: the browser as an operating system',
        titleEs: 'ChromeOS: el navegador como sistema operativo',
        body: 'ChromeOS is Google\'s system for Chromebooks: a Linux kernel with the Chrome browser as the whole interface. Everything lives in the cloud — lightweight, fast, and hard to break by the user. Its variants: ChromiumOS (the open source base), ChromeOS Flex (turns old PCs and Macs into Chromebooks, great for recycling hardware) and the Android apps that run inside it. Developers can also open a real Linux container (Crostini) with the terminal and apt. For a pentester it matters because it is a Linux kernel: same networking, same filesystem concepts, and its recovery modes are pure Chrome.',
        bodyEs: 'ChromeOS es el sistema de Google para Chromebooks: un kernel Linux con el navegador Chrome como toda la interfaz. Todo vive en la nube — liviano, rápido y difícil de romper por el usuario. Sus variantes: ChromiumOS (la base de código abierto), ChromeOS Flex (convierte PCs y Macs viejos en Chromebooks, ideal para reciclar hardware) y las apps de Android que corren adentro. Los desarrolladores también pueden abrir un contenedor Linux real (Crostini) con terminal y apt. Para un pentester importa porque es un kernel Linux: mismas redes, mismos conceptos de filesystem, y sus modos de recuperación son Chrome puro.',
      },
      {
        type: 'terminal-demo',
        command: 'uname -a',
        output: 'FreeBSD fw01 13.2-RELEASE-p7 GENERIC amd64',
        explanation: '`uname` tells you who you are: FreeBSD says it directly, macOS answers "Darwin" and ChromeOS answers "Linux" because its kernel is Linux. Three systems, three answers — but all from the Unix family.',
        explanationEs: '`uname` te dice quién sos: FreeBSD lo dice directo, macOS responde "Darwin" y ChromeOS responde "Linux" porque su kernel es Linux. Tres sistemas, tres respuestas — pero todos de la familia Unix.',
      },
      {
        type: 'quiz',
        question: 'Which of these systems is based on the Linux kernel?',
        questionEs: '¿Cuál de estos sistemas está basado en el kernel Linux?',
        options: [
          { es: 'ChromeOS', en: 'ChromeOS' },
          { es: 'macOS', en: 'macOS' },
          { es: 'OpenBSD', en: 'OpenBSD' },
          { es: 'FreeBSD', en: 'FreeBSD' },
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: 'others-02',
    pathId: 'os',
    order: 2,
    title: 'Portable and electronics devices: Android, iOS and Raspberry Pi',
    titleEs: 'Equipos portátiles y de electrónica: Android, iOS y Raspberry Pi',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Tu teléfono y esas placas mini también son sistemas operativos: Android es Linux, iOS es Unix, y la Raspberry Pi es Linux pura pensada para electrónica. Como ya sabés Linux, los vas a entender rapidísimo.',
            en: "Your phone and those little boards are operating systems too: Android is Linux, iOS is Unix, and the Raspberry Pi is pure Linux aimed at electronics. Since you already know Linux, you'll understand them in no time.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/ot-02-portable-devices.mp4',
        durationSec: 106,
        caption: 'Android is a modified Linux kernel (adb shell gives you a real shell), iOS is Unix but the most locked-down system (jailbreak to get root), and the Raspberry Pi is Debian-based with apt and GPIO pins for electronics. The "other" is the hardware, not the software.',
        captionEs: 'Android es un kernel Linux modificado (adb shell te da una shell real), iOS es Unix pero el sistema más encerrado (jailbreak para root), y la Raspberry Pi está basada en Debian con apt y pines GPIO para electrónica. Lo "otro" es el hardware, no el software.',
      },
      {
        type: 'content',
        title: 'Android: Linux under the hood',
        titleEs: 'Android: Linux por dentro',
        body: 'Android uses a modified Linux kernel — in fact, most Linux devices in the world are Androids. `adb shell` gives you a real Linux shell on the phone: same `ls`, `cd`, `ps`, `cat`. Differences: apps run sandboxed and execute in ART (a virtual machine), the filesystem has extra layers, and by default there is no root — you get it by "rooting" with tools like Magisk or by installing custom ROMs like LineageOS. For pentesting it matters: mobile app testing, `adb`, Frida for instrumentation — all of this runs on the Linux base you already know.',
        bodyEs: 'Android usa un kernel Linux modificado — de hecho, la mayoría de los dispositivos Linux del mundo son Androids. `adb shell` te da una shell Linux real en el teléfono: los mismos `ls`, `cd`, `ps`, `cat`. Diferencias: las apps corren sandboxeadas y se ejecutan en ART (una máquina virtual), el filesystem tiene capas extra, y por defecto no hay root — lo conseguís haciendo "root" con herramientas como Magisk o instalando ROMs custom como LineageOS. Para pentesting importa: testing de apps móviles, `adb`, Frida para instrumentación — todo corre sobre la base Linux que ya conocés.',
      },
      {
        type: 'content',
        title: 'iOS: Unix, but very locked',
        titleEs: 'iOS: Unix, pero muy encerrado',
        body: 'iOS runs on iPhones and iPads and shares its core (the Darwin kernel) with macOS — it is Unix under the hood. But it is the most locked system of all: every app runs in its own sandbox, you can only install from the App Store and you cannot modify the system. The "jailbreak" exists precisely to break that sandbox and get root. Exploits for iOS are rare, expensive and kept secret — an unpatched iPhone is a trophy. The terminal is there, but you only get to it after a jailbreak.',
        bodyEs: 'iOS corre en iPhones y iPads y comparte su núcleo (el kernel Darwin) con macOS — es Unix por dentro. Pero es el sistema más encerrado de todos: cada app corre en su propia sandbox, solo podés instalar desde la App Store y no podés modificar el sistema. El "jailbreak" existe justamente para romper esa sandbox y obtener root. Los exploits para iOS son raros, caros y se mantienen en secreto — un iPhone sin parchear es un trofeo. La terminal existe, pero solo llegás a ella después de un jailbreak.',
      },
      {
        type: 'content',
        title: 'Raspberry Pi: Linux for electronics',
        titleEs: 'Raspberry Pi: Linux para electrónica',
        body: 'The Raspberry Pi is a Linux computer the size of a credit card. Its system, Raspberry Pi OS, is based on Debian: same `apt`, same `sudo`, same terminal — if you know Linux, you already know the Pi. What makes it special is what it targets: electronics. It has GPIO pins to control sensors, LEDs and motors, and it powers home automation, Pi-hole (network ad blocker), retro consoles and NAS. In pentesting you will see it as an attack box (there is even a Kali image for it), as a honeypot, or disguised as a USB gadget for rubber-ducky style attacks. Knowing it is Linux tells you exactly what to do with it.',
        bodyEs: 'La Raspberry Pi es una computadora Linux del tamaño de una tarjeta de crédito. Su sistema, Raspberry Pi OS, está basado en Debian: mismo `apt`, mismo `sudo`, misma terminal — si sabés Linux, ya sabés la Pi. Lo que la hace especial es a qué apunta: la electrónica. Tiene pines GPIO para controlar sensores, LEDs y motores, y alimenta automatización del hogar, Pi-hole (bloqueador de anuncios de red), consolas retro y NAS. En pentesting la vas a ver como caja de ataque (existe hasta una imagen de Kali para ella), como honeypot, o disfrazada de gadget USB para ataques tipo rubber ducky. Saber que es Linux te dice exactamente qué hacer con ella.',
      },
      {
        type: 'terminal-demo',
        command: 'cat /etc/os-release',
        output: 'PRETTY_NAME="Raspbian GNU/Linux 11 (bullseye)"\nVERSION_ID="11"\nID=raspbian\nID_LIKE=debian',
        explanation: 'Raspberry Pi OS declares itself as Debian-based. Same commands, same package manager (apt), same permission system — the "other" is the hardware, not the software.',
        explanationEs: 'Raspberry Pi OS se declara basado en Debian. Mismos comandos, mismo gestor de paquetes (apt), mismo sistema de permisos — lo "otro" es el hardware, no el software.',
      },
      {
        type: 'quiz',
        question: 'What is Raspberry Pi OS based on?',
        questionEs: '¿En qué está basado Raspberry Pi OS?',
        options: [
          { es: 'Windows', en: 'Windows' },
          { es: 'macOS', en: 'macOS' },
          { es: 'Debian Linux', en: 'Debian Linux' },
          { es: 'FreeBSD', en: 'FreeBSD' },
        ],
        correctIndex: 2,
      },
    ],
  },
  ...OTHERS_HW_LESSONS,
];
