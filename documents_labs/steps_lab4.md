# Lab 04 — LFI to RCE Lab
**File:** `src/laboratorios/laboratorio04.ts`
**Difficulty:** Medium
**Category:** Web
**Network Range:** 192.168.20.0/24
**Target:** 192.168.20.11 (dev-portal-backup)

---

## Steps (7 missions)

### 01 — Reconnaissance
**Text:** Discover the host on the network
**Text ES:** Descubrí el host en la red
**Discovery Level:** 1
**Hint 1 (tool):** Use arp-scan / Usá arp-scan
**Hint 2 (command):** `arp-scan 192.168.20.0/24`
**Validation:** discoveredHosts (minHosts: 1)

### 02 — Scanning
**Text:** Identify the services running on the target
**Text ES:** Identificá los servicios que corren en el objetivo
**Discovery Level:** 2
**Hint 1 (tool):** Use nmap / Usá nmap
**Hint 2 (command):** `nmap -sV 192.168.20.11`
**Validation:** scanResults (port: 80)
**Expected:** Debian 11 (Bullseye), Apache/2.4.52, OpenSSH 8.4p1

### 03 — LFI Discovery
**Text:** Test for Local File Inclusion vulnerability
**Text ES:** Probá la vulnerabilidad de Inclusión Local de Archivos
**Discovery Level:** 3
**Hint 1 (tool):** Use the browser to test LFI / Usá el navegador para probar LFI
**Hint 2 (command):** Navigate to the About page and test `../../../../etc/passwd` / Navegá a la página About y probá `../../../../etc/passwd`
**Validation:** custom
**Payload:** LFI via `?page=` parameter

### 04 — Prepare Payload
**Text:** Inspect the reverse shell payload file
**Text ES:** Inspeccioná el archivo de la reverse shell
**Discovery Level:** 3
**Hint 1 (tool):** View the payload.php file / Visualizá el archivo payload.php
**Hint 2 (command):** `cat /root/payload.php`
**Validation:** fileRead (fileType: payload)
**Location:** `/root/payload.php` (PHP reverse shell)

### 05 — Setup Listener
**Text:** Prepare a listener to receive the reverse shell
**Text ES:** Prepará un listener para recibir la reverse shell
**Discovery Level:** 3
**Hint 1 (tool):** Use netcat / Usá netcat
**Hint 2 (command):** `nc -nlvp 4444`
**Validation:** ncListener
**Port:** 4444

### 06 — Remote Code Execution
**Text:** Upload the payload and execute it to get RCE
**Text ES:** Subí el payload y ejecutalo para obtener RCE
**Discovery Level:** 4
**Hint 1 (tool):** Upload via /upload.php and execute via /files/ / Subí por /upload.php y ejecutá por /files/
**Hint 2 (command):** Upload at /upload.php, execute at /files/payload.php / Subí en /upload.php, ejecutá en /files/payload.php
**Validation:** blockingCommand
**Exploit:** LFI to RCE chain

### 07 — Capture User Flag
**Text:** Read the user flag to complete the lab
**Text ES:** Leé la flag de usuario para completar el laboratorio
**Discovery Level:** 4
**Hint 1 (tool):** Check the current directory / Revisá el directorio actual
**Hint 2 (command):** `cat flag.txt`
**Validation:** fileRead (fileType: flag)
**Flag:** ZIL{LFI_REVERSE_SHELL_PWNED}
