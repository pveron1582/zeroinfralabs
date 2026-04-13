# Lab 01 — WordPress Vulnerable Lab
**File:** `src/laboratorios/laboratorio01.ts`
**Difficulty:** Medium
**Category:** Web
**Network Range:** 192.168.1.0/24
**Target:** 192.168.1.11 (vulnerable-wp-lab)

---

## Steps (8 missions)

### 01 — Network Reconnaissance
**Text:** Discover the active hosts on the network
**Text ES:** Descubrí los hosts activos en la red
**Discovery Level:** 1
**Hint 1 (tool):** Use arp-scan / Usá arp-scan
**Hint 2 (command):** `arp-scan <network_range>` / `arp-scan <rango-de-red>`
**Validation:** discoveredHosts (minHosts: 1)

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Text ES:** Identificá los servicios que corren en el objetivo
**Discovery Level:** 2
**Hint 1 (tool):** Use nmap / Usá nmap
**Hint 2 (command):** `nmap -sV <target-ip>` / `nmap -sV <ip-objetivo>`
**Validation:** scanResults (port: 80)
**Expected:** Apache httpd 2.4.41, OpenSSH 8.2p1, MySQL (filtered)

### 03 — Web Enumeration
**Text:** Access the website to enumerate its content
**Text ES:** Accedé al sitio web para enumerar su contenido
**Discovery Level:** 2
**Hint 1 (tool):** Open the Firefox browser / Abrí el navegador Firefox
**Hint 2 (command):** Click the Firefox button and navigate to http://<ip> / Hacé clic en el botón Firefox y navega a http://<ip>
**Validation:** custom

### 04 — Directory Discovery
**Text:** Enumerate hidden directories on the web server
**Text ES:** Enumerá los directorios ocultos del servidor web
**Discovery Level:** 3
**Hint 1 (tool):** Use gobuster / Usá gobuster
**Hint 2 (command):** `gobuster dir -u http://<ip> -w <common-wordlist>` / `gobuster dir -u http://<ip> -w <wordlist-común>`
**Validation:** foundDirectories (directories: ['/uploads'])
**Expected:** /wp-admin, /uploads, /backup (403)

### 05 — Find Credentials
**Text:** Find credentials hidden in the web server
**Text ES:** Encontrá credenciales ocultas en el servidor web
**Discovery Level:** 3
**Hint 1 (tool):** Check the /uploads directory in the browser / Revisá el directorio /uploads en el navegador
**Hint 2 (command):** Navigate to http://<ip>/uploads and look for backup or config files / Navegá a http://<ip>/uploads y buscá archivos de backup o configuración
**Validation:** custom
**Expected:** config.bak file with WP credentials

### 06 — WP-Admin Compromise
**Text:** Use the credentials to access the WordPress admin panel
**Text ES:** Usá las credenciales para acceder al panel de admin de WordPress
**Discovery Level:** 3
**Hint 1 (tool):** Go to the WordPress login page / Andá a la página de login del WordPress
**Hint 2 (command):** Navigate to http://<ip>/wp-admin and log in / Navegá a http://<ip>/wp-admin e iniciá sesión
**Validation:** custom
**Credentials:** admin / P@ssw0rd123!

### 07 — SSH Connection
**Text:** Connect via SSH as root to complete the lab
**Text ES:** Conectate por SSH como root para completar el laboratorio
**Discovery Level:** 4
**Hint 1 (tool):** Use ssh command with credentials from WP dashboard / Usá ssh con credenciales del dashboard WP
**Hint 2 (command):** `ssh <user>@<target-ip>` / `ssh <usuario>@<ip-objetivo>`
**Validation:** sshLogin (user: root)
**Credentials:** root / R00t@SSH2024!

### 08 — Capture Root Flag
**Text:** Read the root flag to complete the lab
**Text ES:** Leé la flag de root para completar el laboratorio
**Discovery Level:** 4
**Hint 1 (tool):** Search in /root / Buscá en /root
**Hint 2 (command):** `cat /root/flag.txt`
**Validation:** fileRead (fileType: flag)
**Flag:** ZIL{ROOT_WP_ACHIEVED}
