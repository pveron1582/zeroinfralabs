# Lab 02 — Web OSINT & SSH Compromise
**File:** `src/laboratorios/laboratorio02.ts`
**Difficulty:** Easy
**Category:** Web
**Network Range:** 10.10.10.0/24
**Target:** 10.10.10.11 (ssh-target-lab)

---

## Steps (6 missions)

### 01 — Network Reconnaissance
**Text:** Discover the hosts on the network
**Text ES:** Descubrí los hosts en la red
**Discovery Level:** 1
**Hint 1 (tool):** Use arp-scan / Usá arp-scan
**Hint 2 (command):** `arp-scan 10.10.10.0/24`
**Validation:** discoveredHosts (minHosts: 1)

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Text ES:** Identificá los servicios que corren en el objetivo
**Discovery Level:** 2
**Hint 1 (tool):** Use nmap / Usá nmap
**Hint 2 (command):** `nmap -sV <target-ip>` / `nmap -sV <ip-objetivo>`
**Validation:** scanResults (port: 22)
**Expected:** OpenSSH 8.9p1 Ubuntu, Apache/2.4.41

### 03 — Web Reconnaissance
**Text:** Access the website to identify employees and possible usernames
**Text ES:** Accedé al sitio web para identificar empleados y posibles nombres de usuario
**Discovery Level:** 3
**Hint 1 (tool):** Use the Firefox browser / Usá el navegador Firefox
**Hint 2 (command):** Click the Firefox button / Hacé clic en el botón Firefox
**Validation:** custom
**Expected:** Find "Gonzalo" as username from consultancy site

### 04 — Credential Attack
**Text:** Perform a credential attack using the discovered username
**Text ES:** Realizá un ataque de credenciales usando el nombre de usuario descubierto
**Discovery Level:** 3
**Hint 1 (tool):** Use hydra for credential attack / Usá hydra para el ataque de credenciales
**Hint 2 (command):** `hydra -l <username> -P /usr/share/wordlists/rockyou.txt <target-ip> ssh` / `hydra -l <usuario> -P /usr/share/wordlists/rockyou.txt <ip> ssh`
**Validation:** foundCredentials (service: ssh, user: gonzalo)
**Credentials:** gonzalo / casablanca

### 05 — SSH Access
**Text:** Connect via SSH using the found credentials
**Text ES:** Conectate por SSH usando las credenciales encontradas
**Discovery Level:** 4
**Hint 1 (tool):** Use the ssh command / Usá el comando ssh
**Hint 2 (command):** `ssh <username>@<target-ip> <password>` / `ssh <usuario>@<ip> <contraseña>`
**Validation:** sshLogin (user: gonzalo)

### 06 — Capture User Flag
**Text:** Find and read the user flag to complete the lab
**Text ES:** Encontrá y leé la flag de usuario para completar el laboratorio
**Discovery Level:** 4
**Hint 1 (tool):** Check the user's home / Revisá el home del usuario
**Hint 2 (command):** `cat /home/gonzalo/flag.txt`
**Validation:** fileRead (fileType: flag)
**Flag:** ZIL{SSH_USER_ACCESS_GRANTED}
