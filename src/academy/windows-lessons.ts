// ── academy/windows-lessons.ts ─────────────────────────────────────
// Subsección Windows del path Sistemas Operativos.
// 5 lecciones: historia → versiones actuales → seguridad → filesystem/usuarios/permisos → red.

import type { Lesson } from '../types';

export const WINDOWS_LESSONS: Lesson[] = [
  {
    id: 'windows-01',
    pathId: 'os',
    order: 1,
    title: 'Windows history: origins, versions and the proprietary model',
    titleEs: 'Historia de Windows: orígenes, versiones y el modelo privativo',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Antes de tocar un Windows, vale la pena entender de dónde viene y por qué funciona distinto. Windows es el gran rival de Linux: privativo, con licencia y de código cerrado. Su historia explica todo lo demás.',
            en: "Before touching a Windows box, it's worth understanding where it comes from and why it works differently. Windows is Linux's great rival: proprietary, licensed and closed-source. Its history explains everything else.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/wi01-windows-history.mp4',
        durationSec: 74,
        caption: 'Born in 1985 as a GUI on top of MS-DOS, Windows 95 brought the Start menu, and every version shares the NT kernel. Windows is proprietary: closed source, licensed, and you cannot read the code.',
        captionEs: 'Nació en 1985 como interfaz sobre MS-DOS, Windows 95 trajo el menú Inicio y todas las versiones comparten el kernel NT. Windows es privativo: código cerrado, con licencia y sin acceso al código.',
      },
      {
        type: 'content',
        title: '1985: a GUI on top of MS-DOS',
        titleEs: '1985: una interfaz gráfica sobre MS-DOS',
        body: 'Microsoft was founded in 1975 by Bill Gates and Paul Allen. In 1985 Windows 1.0 appeared: a graphical interface that ran on top of MS-DOS, the text OS of the era. The big jump was Windows 95, the first one with the Start menu as we know it. Then XP (2001, the most loved), Vista (the flop), Windows 7, 8 and the modern ones. All of them share the same core: the Windows NT kernel, born in 1993.',
        bodyEs: 'Microsoft fue fundada en 1975 por Bill Gates y Paul Allen. En 1985 apareció Windows 1.0: una interfaz gráfica que corría sobre MS-DOS, el sistema de texto de la época. El salto grande fue Windows 95, el primero con el menú Inicio como lo conocemos. Después XP (2001, el más querido), Vista (el fracaso), Windows 7, 8 y los modernos. Todos comparten el mismo núcleo: el kernel NT, nacido en 1993.',
      },
      {
        type: 'content',
        title: 'The proprietary model',
        titleEs: 'El modelo privativo',
        body: 'Windows is proprietary software: the source code is closed. You cannot read it, study it or modify it. You buy a license that lets you use it, but the code belongs to Microsoft. Compare with Linux: there you can read every line. For a hacker this changes everything — on Windows you cannot audit what the OS does; you discover its behavior by testing, by reading documentation, and by the bugs other people found before you.',
        bodyEs: 'Windows es software privativo: el código fuente es cerrado. No podés leerlo, estudiarlo ni modificarlo. Comprás una licencia que te deja usarlo, pero el código es de Microsoft. Comparalo con Linux: ahí podés leer cada línea. Para un hacker esto lo cambia todo — en Windows no podés auditar lo que hace el sistema; descubrís su comportamiento probándolo, leyendo documentación y con los bugs que otros encontraron antes que vos.',
      },
      {
        type: 'content',
        title: 'Why old Windows matters',
        titleEs: 'Por qué importa el Windows viejo',
        body: 'In real networks you still find old Windows everywhere: 7, XP, Server 2008 — machines companies refuse to update. And old Windows is full of classic exploits: MS17-010 (EternalBlue), MS08-067... For a pentester, finding a legacy Windows box is like finding a door with no lock.',
        bodyEs: 'En redes reales todavía encontrás Windows viejos por todos lados: 7, XP, Server 2008 — máquinas que las empresas se niegan a actualizar. Y los Windows viejos están llenos de exploits clásicos: MS17-010 (EternalBlue), MS08-067... Para un pentester, encontrar una máquina Windows legacy es como encontrar una puerta sin llave.',
      },
      {
        type: 'terminal-demo',
        command: 'ver',
        output: 'Microsoft Windows [Versión 10.0.19045.4046]',
        explanation: '`ver` (en CMD) o `winver` te dicen qué versión corre. `systeminfo` da el detalle completo: versión, arquitectura, parches instalados. Es lo primero que enumerás en un Windows.',
        explanationEs: '`ver` (en CMD) o `winver` te dicen qué versión corre. `systeminfo` da el detalle completo: versión, arquitectura, parches instalados. Es lo primero que enumerás en un Windows.',
      },
      {
        type: 'quiz',
        question: 'What does it mean that Windows is proprietary software?',
        questionEs: '¿Qué significa que Windows sea software privativo?',
        options: [
          { es: 'Que es gratis pero con publicidad', en: 'That it is free but with ads' },
          { es: 'Que el código fuente es cerrado y se usa con licencia', en: 'That the source code is closed and used under a license' },
          { es: 'Que se puede modificar libremente', en: 'That it can be freely modified' },
          { es: 'Que es de código abierto', en: 'That it is open source' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'windows-02',
    pathId: 'os',
    order: 2,
    title: 'Current versions: Windows 10, 11 and Server',
    titleEs: 'Versiones actuales: Windows 10, 11 y Server',
    readingMinutes: 7,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Cuando entrás a una empresa, te vas a encontrar con tres tipos de Windows: estaciones de trabajo con 10 u 11, y servidores. Cada uno tiene su rol y sus particularidades.',
            en: "When you get into a company you'll find three kinds of Windows: workstations running 10 or 11, and servers. Each one has its own role and quirks.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/wi02-current-versions.mp4',
        durationSec: 75,
        caption: 'Three Windows rule the corporate world: 10 (2015, support ends Oct 2025), 11 (TPM 2.0 + Secure Boot) and Server (Active Directory, IIS, PowerShell/WinRM).',
        captionEs: 'Tres Windows dominan el mundo corporativo: 10 (2015, soporte hasta oct 2025), 11 (TPM 2.0 + Secure Boot) y Server (Active Directory, IIS, PowerShell/WinRM).',
      },
      {
        type: 'content',
        title: 'Windows 10',
        titleEs: 'Windows 10',
        body: 'Windows 10 (2015) was the version that unified everything: PCs, tablets, Xbox. Microsoft announced its support ends in October 2025 — which is why millions of machines will keep running an unsupported Windows, a goldmine for attackers. The LTSB/LTSC editions stay on the same version for years and are very common in banks and industry.',
        bodyEs: 'Windows 10 (2015) fue la versión que unificó todo: PCs, tablets, Xbox. Microsoft anunció que su soporte termina en octubre de 2025 — por eso millones de máquinas van a seguir corriendo un Windows sin soporte, una mina de oro para los atacantes. Las ediciones LTSB/LTSC se quedan en la misma versión durante años y son muy comunes en bancos e industria.',
      },
      {
        type: 'content',
        title: 'Windows 11',
        titleEs: 'Windows 11',
        body: 'Windows 11 (2021) is the current version for home and business. The big difference: strict hardware requirements — TPM 2.0 chip and Secure Boot — which also harden the machine. Under the hood it is still the NT kernel: same filesystem, same commands, same SAM hive.',
        bodyEs: 'Windows 11 (2021) es la versión actual para hogar y empresas. La gran diferencia: requisitos de hardware estrictos — chip TPM 2.0 y Secure Boot — que además endurecen la máquina. Por dentro sigue siendo el kernel NT: mismo filesystem, mismos comandos, mismo hive SAM.',
      },
      {
        type: 'content',
        title: 'Windows Server',
        titleEs: 'Windows Server',
        body: 'Windows Server is the edition for servers: Active Directory (the identity of the whole company), IIS (web), DNS, DHCP and file shares over SMB. Versions: 2008, 2012, 2016, 2019, 2022, 2025. Server Core has no graphical interface — you manage it remotely with PowerShell and WinRM. If you compromise a domain controller, you own the whole company.',
        bodyEs: 'Windows Server es la edición para servidores: Active Directory (la identidad de toda la empresa), IIS (web), DNS, DHCP y compartición de archivos vía SMB. Versiones: 2008, 2012, 2016, 2019, 2022, 2025. Server Core no tiene interfaz gráfica — se administra de forma remota con PowerShell y WinRM. Si comprometés un controlador de dominio, tenés la empresa entera.',
      },
      {
        type: 'terminal-demo',
        command: 'systeminfo | findstr /B /C:"OS Name" /C:"OS Version"',
        output: 'OS Name: Microsoft Windows 11 Pro\nOS Version: 10.0.22631 N/A Build 22631',
        explanation: '`systeminfo` gives the full system detail. The 10.0.x version number runs on both Windows 10 and 11: the internal NT kernel number is still the same.',
        explanationEs: '`systeminfo` da el detalle completo del sistema. El número de versión 10.0.x corre tanto en Windows 10 como en 11: el número interno del kernel NT sigue siendo el mismo.',
      },
      {
        type: 'quiz',
        question: 'Which mandatory hardware requirement in Windows 11 also helps security?',
        questionEs: '¿Qué requisito de hardware obligatorio en Windows 11 también ayuda a la seguridad?',
        options: [
          { es: 'Un lector de DVD', en: 'A DVD reader' },
          { es: 'Un chip TPM 2.0', en: 'A TPM 2.0 chip' },
          { es: 'Una tarjeta de sonido', en: 'A sound card' },
          { es: 'Un monitor 4K', en: 'A 4K monitor' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'windows-03',
    pathId: 'os',
    order: 3,
    title: 'Security features: firewall, Defender, UAC, Group Policy and more',
    titleEs: 'Seguridad: firewall, Defender, UAC, políticas de grupo y más',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Windows viene con un montón de controles de seguridad activados por defecto. Un buen pentester sabe qué hace cada uno: firewall, antivirus, UAC, políticas de grupo y algunos más que te van a aparecer en cualquier auditoría.',
            en: "Windows ships with a lot of security controls enabled by default. A good pentester knows what each one does: firewall, antivirus, UAC, Group Policy and a few more that will show up in any audit.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/wi03-security.mp4',
        durationSec: 68,
        caption: 'Windows ships locked down: firewall with 3 profiles, Defender antivirus, UAC prompts, Group Policy from Active Directory — plus BitLocker, Credential Guard and the Event Logs.',
        captionEs: 'Windows viene blindado: firewall con 3 perfiles, antivirus Defender, avisos de UAC, políticas de grupo desde Active Directory — más BitLocker, Credential Guard y los Event Logs.',
      },
      {
        type: 'content',
        title: 'Windows Defender Firewall',
        titleEs: 'Windows Defender Firewall',
        body: 'The host firewall, enabled by default, with three profiles: Domain, Private and Public. You manage it with `netsh advfirewall` or the GUI. Why it matters in pentesting: a port that looks "closed" from outside may only be open for the internal network — that is why lateral movement exists.',
        bodyEs: 'El firewall del host, activado por defecto, con tres perfiles: dominio, privado y público. Se administra con `netsh advfirewall` o desde la GUI. Por qué importa en pentesting: un puerto que parece "cerrado" desde afuera puede estar abierto solo para la red interna — por eso existe el movimiento lateral.',
      },
      {
        type: 'content',
        title: 'Microsoft Defender Antivirus',
        titleEs: 'Microsoft Defender Antivirus',
        body: 'The built-in antivirus, enabled by default on 10 and 11: real-time scanning, cloud detection. Modern payloads must evade it. Attackers often try to disable it (Defender is itself a target) — and every attempt leaves traces in the logs.',
        bodyEs: 'El antivirus integrado, activado por defecto en 10 y 11: escaneo en tiempo real, detección en la nube. Los payloads modernos tienen que evadirlo. Los atacantes suelen intentar desactivarlo (Defender es un objetivo en sí mismo) — y cada intento deja rastros en los logs.',
      },
      {
        type: 'content',
        title: 'UAC — User Account Control',
        titleEs: 'UAC — Control de Cuentas de Usuario',
        body: 'When a program wants to make an administrative change, UAC shows a prompt asking for consent or admin credentials. Even an "Administrator" account runs with a filtered token until UAC approves. It does not stop a real attack, but it slows it down and leaves a visible popup.',
        bodyEs: 'Cuando un programa quiere hacer un cambio de administrador, UAC muestra un aviso pidiendo consentimiento o credenciales de administrador. Incluso una cuenta "Administrador" corre con un token filtrado hasta que UAC aprueba. No detiene un ataque real, pero lo frena y deja un popup visible.',
      },
      {
        type: 'content',
        title: 'Group Policy (GPO)',
        titleEs: 'Políticas de grupo (GPO)',
        body: 'Group Policy configures and hardens Windows machines: password policies, what users can run, firewall rules, audit settings. Local policies live in `gpedit.msc` and `secpol.msc`; in a domain, administrators apply GPOs centrally from Active Directory. Reading the applied policies tells you what the defenders cared about.',
        bodyEs: 'Las políticas de grupo configuran y endurecen las máquinas Windows: políticas de contraseñas, qué pueden ejecutar los usuarios, reglas de firewall, ajustes de auditoría. Las políticas locales viven en `gpedit.msc` y `secpol.msc`; en un dominio, los administradores aplican GPO de forma centralizada desde Active Directory. Leer las políticas aplicadas te dice qué le importaba a los defensores.',
      },
      {
        type: 'content',
        title: 'More defenses you will see',
        titleEs: 'Más defensas que vas a ver',
        body: 'BitLocker — full disk encryption; the recovery key is a valuable loot. Windows Hello — biometric login. Credential Guard — protects the LSASS process that holds your password hashes in memory. Secure Boot + TPM — verifies the boot chain. AppLocker / WDAC — application allowlisting. Windows Sandbox — isolated environment. Event Logs — the audit trail: Security, System and Application logs record every login attempt and privilege use.',
        bodyEs: 'BitLocker — cifrado de disco completo; la recovery key es un botín valioso. Windows Hello — acceso biométrico. Credential Guard — protege el proceso LSASS que guarda los hashes de contraseñas en memoria. Secure Boot + TPM — verifica la cadena de arranque. AppLocker / WDAC — lista blanca de aplicaciones. Windows Sandbox — entorno aislado. Event Logs — el registro de auditoría: los logs de Seguridad, Sistema y Aplicaciones registran cada intento de login y uso de privilegios.',
      },
      {
        type: 'terminal-demo',
        command: 'netsh advfirewall show allprofiles state',
        output: 'Domain Profile Settings:\nState                                 ON\n\nPrivate Profile Settings:\nState                                 ON\n\nPublic Profile Settings:\nState                                 ON',
        explanation: 'The firewall is ON by default in all three profiles. In a pentest, a "closed" port from outside can be open for the internal network only — that is why moving laterally inside the LAN is so valuable.',
        explanationEs: 'El firewall está activo por defecto en los tres perfiles. En un pentest, un puerto "cerrado" desde afuera puede estar abierto solo para la red interna — por eso moverse lateralmente dentro de la LAN es tan valioso.',
      },
      {
        type: 'quiz',
        question: 'What does UAC do when a program wants to make an administrative change?',
        questionEs: '¿Qué hace UAC cuando un programa quiere hacer un cambio de administrador?',
        options: [
          { es: 'Lo bloquea siempre sin preguntar', en: 'Always blocks it without asking' },
          { es: 'Muestra un aviso pidiendo consentimiento o credenciales', en: 'Shows a prompt asking for consent or credentials' },
          { es: 'Reinicia la máquina', en: 'Reboots the machine' },
          { es: 'Cifra el disco', en: 'Encrypts the disk' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'windows-04',
    pathId: 'os',
    order: 4,
    title: 'Filesystem, users and NTFS permissions',
    titleEs: 'Sistema de archivos, usuarios y permisos NTFS',
    readingMinutes: 9,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'En Linux aprendiste que todo cuelga de un solo árbol. Windows es distinto: cada disco es un árbol propio, los permisos se llaman ACL y el "root" se llama SYSTEM. Esta lección te arma el mapa completo.',
            en: "In Linux you learned that everything hangs from a single tree. Windows is different: each drive is its own tree, permissions are called ACLs and the 'root' is called SYSTEM. This lesson gives you the full map.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/wi04-filesystem.mp4',
        durationSec: 91,
        caption: 'Windows maps differently: C:\\ with System32, Temp, Users, Program Files and inetpub. Passwords live in the SAM hive. Permissions are ACLs, shown with icacls.',
        captionEs: 'Windows se mapea distinto: C:\\ con System32, Temp, Users, Program Files e inetpub. Las contraseñas viven en el hive SAM. Los permisos son ACL, con icacls.',
      },
      {
        type: 'content',
        title: 'The map: C: and the key folders',
        titleEs: 'El mapa: C: y las carpetas clave',
        body: '`C:\\Windows\\System32` — the OS core (like /etc + /bin together). `C:\\Windows\\Temp` — world-writable, attackers love it (like /tmp). `C:\\Users\\<name>` — each user profile: Desktop, Documents, Downloads. `C:\\Program Files` (and `Program Files (x86)`) — installed apps. `C:\\ProgramData` — app data for all users. `C:\\inetpub\\wwwroot` — the IIS web root. ACLs only exist on NTFS; FAT32/exFAT drives have no file permissions.',
        bodyEs: '`C:\\Windows\\System32` — el núcleo del SO (como /etc + /bin juntos). `C:\\Windows\\Temp` — escribible por todos, los atacantes lo adoran (como /tmp). `C:\\Users\\<nombre>` — el perfil de cada usuario: Desktop, Documents, Downloads. `C:\\Program Files` (y `Program Files (x86)`) — aplicaciones instaladas. `C:\\ProgramData` — datos de apps para todos los usuarios. `C:\\inetpub\\wwwroot` — la raíz web de IIS. Las ACL solo existen en NTFS; los discos FAT32/exFAT no tienen permisos de archivos.',
      },
      {
        type: 'content',
        title: 'Users and groups',
        titleEs: 'Usuarios y grupos',
        body: 'The SAM hive (`C:\\Windows\\System32\\config\\SAM`) stores local password hashes — locked while Windows runs; you grab it offline or via Volume Shadow Copy. Account types: the built-in Administrator, standard users, Guest, SYSTEM (Windows\' "root", with total power) and service accounts. Key groups: Administrators, Users, Remote Desktop Users, Everyone. `net user` lists accounts; `net localgroup` lists groups.',
        bodyEs: 'El hive SAM (`C:\\Windows\\System32\\config\\SAM`) guarda los hashes de contraseñas locales — bloqueado mientras Windows corre; se obtiene offline o vía Volume Shadow Copy. Tipos de cuenta: el Administrador integrado, usuarios estándar, Invitado, SYSTEM (el "root" de Windows, con poder total) y cuentas de servicio. Grupos clave: Administrators, Users, Remote Desktop Users, Everyone. `net user` lista las cuentas; `net localgroup` lista los grupos.',
      },
      {
        type: 'content',
        title: 'NTFS permissions (ACLs)',
        titleEs: 'Permisos NTFS (ACL)',
        body: 'Every NTFS file has an ACL: a list of entries telling which user or group can do what. Main permissions: Full control, Modify, Read & Execute, Read, Write. There is an owner (who can change the ACL) and inheritance from parent folders. `icacls` shows and changes them. And when a folder is shared over SMB, the share adds a second layer of permissions on top of the NTFS ones.',
        bodyEs: 'Todo archivo NTFS tiene una ACL: una lista de entradas que dicen qué usuario o grupo puede hacer qué. Permisos principales: control total, modificar, leer y ejecutar, leer, escribir. Hay un dueño (que puede cambiar la ACL) y herencia desde las carpetas padre. `icacls` las muestra y las cambia. Y cuando una carpeta se comparte por SMB, el share agrega una segunda capa de permisos encima de los NTFS.',
      },
      {
        type: 'content',
        title: 'Where the juicy stuff lives',
        titleEs: 'Dónde vive lo jugoso',
        body: 'SAM — local password hashes. The Registry — stores everything, including service configs and autologon passwords in plain text. `C:\\Users\\<name>\\Documents`, `Downloads` and `Desktop` — the files users actually work with. `C:\\inetpub\\wwwroot` — web apps and their configs. And remember: on a company machine, the browser profile often holds saved passwords.',
        bodyEs: 'SAM — hashes de contraseñas locales. El Registry — guarda todo, incluida la configuración de servicios y contraseñas de autologon en texto plano. `C:\\Users\\<nombre>\\Documents`, `Downloads` y `Desktop` — los archivos con los que los usuarios trabajan de verdad. `C:\\inetpub\\wwwroot` — las apps web y sus configs. Y recordá: en una máquina de empresa, el perfil del navegador suele tener contraseñas guardadas.',
      },
      {
        type: 'terminal-demo',
        command: 'icacls C:\\Users\\pablo\\Documents',
        output: 'C:\\Users\\pablo\\Documents BUILTIN\\Users:(OI)(CI)(RX)\n                            NT AUTHORITY\\SYSTEM:(I)(OI)(CI)(F)\n                            pablo:(I)(OI)(CI)(F)',
        explanation: 'The ACL shows who accesses and with which permission: (F) full control, (RX) read & execute, (M) modify. Note that SYSTEM has full control — in Windows, SYSTEM is the equivalent of root.',
        explanationEs: 'La ACL muestra quién accede y con qué permiso: (F) control total, (RX) leer y ejecutar, (M) modificar. Fijate que SYSTEM tiene control total — en Windows, SYSTEM es el equivalente a root.',
      },
      {
        type: 'quiz',
        question: 'Which command shows the ACLs of a file in Windows?',
        questionEs: '¿Qué comando muestra las ACL de un archivo en Windows?',
        options: [
          { es: 'ls -la', en: 'ls -la' },
          { es: 'icacls', en: 'icacls' },
          { es: 'chmod', en: 'chmod' },
          { es: 'getfacl', en: 'getfacl' },
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'windows-05',
    pathId: 'os',
    order: 5,
    title: 'Network services: SMB, RDP and WinRM',
    titleEs: 'Servicios de red: SMB, RDP y WinRM',
    readingMinutes: 8,
    steps: [
      {
        type: 'foxy-narrator',
        messages: [
          {
            es: 'Las máquinas Windows hablan entre ellas con servicios propios: SMB para archivos, RDP para escritorio remoto y WinRM para administración. Conocerlos es conocer las puertas de entrada de una red corporativa.',
            en: "Windows machines talk to each other with their own services: SMB for files, RDP for remote desktop and WinRM for administration. Knowing them is knowing the entry doors of a corporate network.",
          },
        ],
      },
      {
        type: 'video',
        src: '/videos/wi05-network-services.mp4',
        durationSec: 75,
        caption: 'The corporate entry doors: SMB on 445 (shares, EternalBlue), RDP on 3389 (lateral movement), WinRM on 5985 (PowerShell remoting with Evil-WinRM).',
        captionEs: 'Las puertas de entrada corporativas: SMB en 445 (shares, EternalBlue), RDP en 3389 (movimiento lateral), WinRM en 5985 (PowerShell remoto con Evil-WinRM).',
      },
      {
        type: 'content',
        title: 'SMB — port 445 (and 139)',
        titleEs: 'SMB — puerto 445 (y 139)',
        body: 'Server Message Block handles file and printer sharing. Every Windows machine exposes administrative shares by default: `C$` (the whole disk), `ADMIN$` and `IPC$`. Custom shares (`datos`, `publico`...) are the classic target — that is where the interesting files live. Enumeration: `net share` locally, `smbclient`/`enum4linux` from Linux. And SMB is the home of EternalBlue (MS17-010): the exploit that takes over old Windows without credentials.',
        bodyEs: 'Server Message Block maneja la compartición de archivos e impresoras. Toda máquina Windows expone shares administrativos por defecto: `C$` (todo el disco), `ADMIN$` e `IPC$`. Los shares personalizados (`datos`, `publico`...) son el objetivo clásico — ahí viven los archivos interesantes. Enumeración: `net share` localmente, `smbclient`/`enum4linux` desde Linux. Y SMB es la casa de EternalBlue (MS17-010): el exploit que toma Windows viejos sin credenciales.',
      },
      {
        type: 'content',
        title: 'RDP — port 3389',
        titleEs: 'RDP — puerto 3389',
        body: 'Remote Desktop Protocol is the graphical remote access. If 3389 is exposed to the internet, it is a brute-force magnet. Once inside a network, RDP is the classic tool for lateral movement: you steal credentials and connect to the next machine. Saved credentials (`cmdkey /list`) and pass-the-hash with Restricted Admin mode are real techniques.',
        bodyEs: 'Remote Desktop Protocol es el acceso remoto gráfico. Si el 3389 está expuesto a internet, es un imán de fuerza bruta. Ya dentro de una red, RDP es la herramienta clásica de movimiento lateral: robás credenciales y te conectás a la siguiente máquina. Las credenciales guardadas (`cmdkey /list`) y el pass-the-hash con modo Restricted Admin son técnicas reales.',
      },
      {
        type: 'content',
        title: 'WinRM — port 5985 (and 5986)',
        titleEs: 'WinRM — puerto 5985 (y 5986)',
        body: 'Windows Remote Management is the admin channel for PowerShell Remoting (`Enter-PSSession`): with valid credentials you get a full remote shell. Port 5985 is HTTP, 5986 is HTTPS. Tools like Evil-WinRM abuse exactly this: user + password → interactive PowerShell on the target. It is one of the first things to test when you get credentials.',
        bodyEs: 'Windows Remote Management es el canal de administración para PowerShell Remoting (`Enter-PSSession`): con credenciales válidas obtenés una shell remota completa. El puerto 5985 es HTTP, el 5986 HTTPS. Herramientas como Evil-WinRM abusan exactamente de esto: usuario + contraseña → PowerShell interactivo en el objetivo. Es de lo primero que se prueba cuando conseguís credenciales.',
      },
      {
        type: 'terminal-demo',
        command: 'net share',
        output: 'Share name   Resource                        Remark\n---------------------------------------------------------------\nC$           C:\\                             Default share\nADMIN$       C:\\Windows                      Remote Admin\nIPC$                                         Remote IPC\ndatos        D:\\datos',
        explanation: 'The administrative shares (C$, ADMIN$, IPC$) exist by default. Custom shares like `datos` are the classic target: that is where the information you want usually lives.',
        explanationEs: 'Los shares administrativos (C$, ADMIN$, IPC$) existen por defecto. Los shares personalizados como `datos` son el objetivo clásico: ahí suele estar la información que querés.',
      },
      {
        type: 'quiz',
        question: 'Which port does WinRM use by default (HTTP)?',
        questionEs: '¿En qué puerto corre WinRM por defecto (HTTP)?',
        options: [
          { es: '22', en: '22' },
          { es: '445', en: '445' },
          { es: '5985', en: '5985' },
          { es: '3389', en: '3389' },
        ],
        correctIndex: 2,
      },
    ],
  },
];
