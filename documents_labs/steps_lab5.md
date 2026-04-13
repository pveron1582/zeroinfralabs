# Lab 05 — FTP Enumeration & Privilege Escalation
**File:** `src/laboratorios/laboratorio05.ts`
**Difficulty:** Medium
**Category:** Network
**Network Range:** 10.10.20.0/24
**Target:** 10.10.20.11 (privesc-server)

---

## Steps (8 missions)

### 01 — Host Discovery
**Text:** Discover the active host on the network
**Text ES:** Descubrí el host activo en la red
**Discovery Level:** 1
**Hint 1 (tool):** Use arp-scan to discover hosts / Usá arp-scan para descubrir hosts
**Hint 2 (command):** `arp-scan 10.10.20.0/24`
**Validation:** discoveredHosts (minHosts: 1)

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Text ES:** Identificá los servicios que corren en el objetivo
**Discovery Level:** 2
**Hint 1 (tool):** Use nmap for port scanning / Usá nmap para escanear puertos
**Hint 2 (command):** `nmap -sV <target-ip>` / `nmap -sV <ip-objetivo>`
**Validation:** scanResults (port: 21)
**Expected:** vsFTPd 3.0.3 on port 21, OpenSSH 8.2p1 on port 22

### 03 — FTP Enumeration
**Text:** Connect to the FTP server anonymously and download the note
**Text ES:** Conectate al servidor FTP anónimamente y descargá la nota
**Discovery Level:** 2
**Hint 1 (tool):** Connect via FTP as anonymous and download the note / Conectate por FTP como anonymous y descargá la nota
**Hint 2 (command):** `ftp <ip> → anonymous → ls → get nota.txt → exit → cat nota.txt`
**Validation:** ftpLogin
**Note Location:** `/srv/ftp/nota.txt` (hints at weak SSH password for user 'john')

### 04 — SSH Brute Force
**Text:** Use the information from the note to brute force SSH and get credentials
**Text ES:** Usá la información de la nota para hacer fuerza bruta por SSH y obtener credenciales
**Discovery Level:** 3
**Hint 1 (tool):** Use hydra for brute force attack / Usá hydra para el ataque de fuerza bruta
**Hint 2 (command):** `hydra -l john -P /usr/share/wordlists/rockyou.txt <ip> ssh` / `hydra -l john -P /usr/share/wordlists/rockyou.txt <ip> ssh`
**Validation:** foundCredentials (service: ssh, user: john)
**Credentials:** john / ilovelinux

### 05 — SSH Access
**Text:** Connect via SSH using the found credentials
**Text ES:** Conectate por SSH usando las credenciales encontradas
**Discovery Level:** 3
**Hint 1 (tool):** Connect via SSH with credentials / Conectate por SSH con las credenciales
**Hint 2 (command):** `ssh john@<ip>`
**Validation:** sshLogin (user: john)

### 06 — Sudo Enumeration
**Text:** Check your sudo permissions on the system
**Text ES:** Verificá tus permisos de sudo en el sistema
**Discovery Level:** 3
**Hint 1 (tool):** Check sudo permissions / Verificá los permisos de sudo
**Hint 2 (command):** `sudo -l`
**Validation:** privesc
**Expected:** john can run vim as root without password

### 07 — Privilege Escalation
**Text:** Use vim to escalate and become root
**Text ES:** Usá vim para escalar y ser root
**Discovery Level:** 4
**Hint 1 (tool):** You can execute vim in a single command to escalate and become root / Podes ejecutar vim en un solo comando para escalar y ser root
**Hint 2 (command):** `sudo vim -c '!bash'`
**Validation:** privesc
**Method:** sudo vim privilege escalation

### 08 — Capture Root Flag
**Text:** Read the root flag to complete the lab
**Text ES:** Leé la flag de root para completar el laboratorio
**Discovery Level:** 4
**Hint 1 (tool):** You're root! Read the flag file / ¡Sos root! Leé el archivo de la flag
**Hint 2 (command):** `cat /root/flag2.txt`
**Validation:** fileRead (fileType: flag)
**Flag:** ZIL{SUDO_VIM_PRIVESC_COMPLETE}
