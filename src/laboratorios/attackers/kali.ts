// ── laboratorios/attackers/kali.ts ─────────────────────────────────
// Definición de la máquina atacante Kali Linux 2026.1
// Incluye filesystem base, diccionarios y herramientas pre-configuradas

import type { Machine, FileEntry } from '../../types';
import { createLinuxFileSystem } from '../../fs-models';
import { createFile } from '../templates';

// ── MAC pool para instancias de Kali ────────────────────────────────
const KALI_MACS = ['08:00:27:AA:BB:CC', '08:00:27:AA:BB:CD', '08:00:27:AA:BB:CE'];
let kaliInstanceCount = 0;

export function resetKaliCounter() { kaliInstanceCount = 0; }

function getNextMac(): string {
  const mac = KALI_MACS[kaliInstanceCount % KALI_MACS.length];
  kaliInstanceCount++;
  return mac;
}

// ── Diccionarios ────────────────────────────────────────────────────
export const ROCKYOU_CONTENT = `password
123456
12345678
qwerty
abc123
monkey
letmein
dragon
111111
baseball
princess
1234567
football
mickey
buster
daniel
andrew
hello
love
admin
welcome
password123
sunshine
master
photoshop
iloveyou
123123
666666
1q2w3e4r
football1
charlie
aa123456
jesus
password1
whatever
121212
dragon1
qwerty123
mustang
trustno1
batman
passw0rd
welcome1
qazwsx
123qwe
killer
michael
jordan
superman
harley
ranger
hunter
casablanca
fuckyou
ilovelinux
thomas
pepper
joshua
maggie
starwars
silver
ashley
tigger
purple
andrew1
justin
buster12
matthew
jonathan
buster12
amanda
william
makaveli1
`;

export const COMMON_TXT_CONTENT = `/
/admin
/login
/wp-admin
/wp-login.php
/wp-content
/wp-includes
/uploads
/api
/config
/backup
/.git
/.env
/robots.txt
/sitemap.xml
/phpinfo.php
/phpmyadmin
/server-status
/test
/temp
/tmp
/debug
/console
/admin/login
/admin/dashboard
/api/v1
/api/v2
/assets
/css
/js
/images
/img
/fonts
/download
/docs
/help
/about
/contact
/register
/search
/profile
/settings
/dashboard
/panel
/manager
/control
`;

export const PASSWORDS_LIST_CONTENT = `admin
root
toor
password
password1
password123
123456
12345678
123456789
qwerty
abc123
letmein
monkey
dragon
master
login
princess
football
shadow
sunshine
trustno1
iloveyou
welcome
admin123
root123
P@ssw0rd
P@ssw0rd123!
changeme
default
guest
test
user
kali
ubuntu
`;

// ── Archivos del sistema Kali ──────────────────────────────────────
export function createKaliFilesystem(username: string = 'kali', extraFiles: FileEntry[] = []): FileEntry[] {
  const baseFs = createLinuxFileSystem({ username });

  const kaliSpecific: FileEntry[] = [
    // Diccionarios de wordlists
    createFile('/usr/share/wordlists/rockyou.txt', ROCKYOU_CONTENT, 'text'),
    createFile('/usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt', COMMON_TXT_CONTENT, 'text'),
    createFile('/usr/share/wordlists/SecLists/Passwords/common-passwords.txt', PASSWORDS_LIST_CONTENT, 'text'),

    // sudo: el usuario kali tiene sudo sin password (como Kali real). Así,
    // estando como kali, `sudo su` vuelve a root. `su root` a secas NO sirve
    // porque root no tiene password registrada (el atacante es root por diseño).
    createFile('/etc/sudoers', `# /etc/sudoers
# This file MUST be edited with the 'visudo' command as root.
Defaults        env_reset
Defaults        mail_badpass
Defaults        secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# User privilege specification
root            ALL=(ALL:ALL) ALL

# Kali user: full sudo without password
kali    ALL=(ALL:ALL) NOPASSWD: ALL`, 'text', 'root', 'root', 0o440),

    // Home de kali (usuario no-root por defecto)
    createFile('/home/kali/.dir', '', 'text', 'kali', 'kali', 0o755),
    createFile('/home/kali/.bashrc', `# ~/.bashrc: executed by bash(1) for non-login shells.
export PS1='\\u@\\h:\\w\\$ '
export PATH=$PATH:/usr/local/bin:/usr/sbin

# Aliases comunes de pentesting
alias ll='ls -l'
alias la='ls -la'
`, 'text', 'kali', 'kali', 0o644),
    createFile('/home/kali/.profile', `# ~/.profile: executed by the command interpreter for login shells.
if [ -n "$BASH_VERSION" ]; then
    if [ -f "$HOME/.bashrc" ]; then
	. "$HOME/.bashrc"
    fi
fi
`, 'text', 'kali', 'kali', 0o644),

    // Herramientas de Kali pre-configuradas
    createFile('/root/.bashrc', `# ~/.bashrc: executed by bash(1) for non-login shells.
export PS1='\\u@\\h:\\w\\$ '
export PATH=$PATH:/usr/local/bin:/usr/sbin

# Aliases comunes de pentesting
alias nmap-fast='nmap -T4 -F'
alias nmap-full='nmap -sV -sC -O'
alias gobuster-common='gobuster dir -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt'
alias hydra-ssh='hydra -l root -P /usr/share/wordlists/rockyou.txt'

# Historial de comandos
export HISTSIZE=10000
export HISTFILESIZE=20000
`, 'text', 'root', 'root', 0o600),

    createFile('/root/.ssh/known_hosts', '# SSH known hosts (empty)', 'text', 'root', 'root', 0o600),

    // Herramientas instaladas (marcadores)
    createFile('/usr/bin/nmap', '#!/bin/bash\n# nmap placeholder', 'text', 'root', 'root', 0o755),
    createFile('/usr/bin/gobuster', '#!/bin/bash\n# gobuster placeholder', 'text', 'root', 'root', 0o755),
    createFile('/usr/bin/hydra', '#!/bin/bash\n# hydra placeholder', 'text', 'root', 'root', 0o755),
    createFile('/usr/bin/msfconsole', '#!/bin/bash\n# metasploit placeholder', 'text', 'root', 'root', 0o755),
    createFile('/usr/bin/nc', '#!/bin/bash\n# netcat placeholder', 'text', 'root', 'root', 0o755),
    createFile('/usr/bin/ssh', '#!/bin/bash\n# ssh placeholder', 'text', 'root', 'root', 0o755),
    createFile('/usr/bin/arp-scan', '#!/bin/bash\n# arp-scan placeholder', 'text', 'root', 'root', 0o755),
  ];

  // Dedupe por path (último gana): el /etc/sudoers específico de Kali debe
  // reemplazar al estándar que genera createLinuxFileSystem.
  const allFiles = [...baseFs, ...kaliSpecific, ...extraFiles];
  const deduped = [...new Map(allFiles.map(f => [f.path, f])).values()];

  return deduped;
}

// ── Factory de máquina Kali ─────────────────────────────────────────
export interface KaliMachineOptions {
  networkRange?: string;
  hostname?: string;
  username?: string;
  extraFiles?: FileEntry[];
}

export function createKaliMachine(options: KaliMachineOptions = {}): Machine {
  const {
    networkRange = '192.168.1.0/24',
    hostname = 'kali-attacker',
    username = 'kali',
    extraFiles = [],
  } = options;

  const mac = getNextMac();

  // Asignar IP basada en el network range
  const match = networkRange.match(/^(\d+\.\d+\.\d+)\./);
  const ip = match ? `${match[1]}.10` : '192.168.1.10';

  return {
    id: 'attacker-01',
    machine_info: {
      hostname,
      ip,
      mac,
      os: 'Kali Linux 2026.1',
      status: 'up',
      type: 'workstation',
    },
    discovery_level: 4,
    scan_results: { ports: [] },
    web_enumeration: { web_server: 'none', cms: 'none', directories: [] },
    learning_steps: [],
    // Credenciales del usuario común `kali` y del superusuario `root`.
    // El atacante arranca como root por diseño, pero con estas passwords
    // puede `su kali` / `su root` (también se muestran en el panel de misión).
    known_passwords: { kali: 'zilabs', root: 'zilabs' },
    files: createKaliFilesystem(username, extraFiles),
  };
}
