# Guía de Laboratorios

## Laboratorio 01 — WordPress Vulnerable Lab
**Dificultad:** Medium | **Categoría:** Web | **Red:** 192.168.1.0/24

**Descripción:** Enumeración web, descubrimiento de directorios y compromiso de WordPress.

### Misiones (8)

1. **Network Reconnaissance** — Descubre hosts con arp-scan
2. **Port Scanning** — Identifica servicios con nmap (Apache, SSH)
3. **Web Enumeration** — Accede al sitio WordPress
4. **Directory Discovery** — Encuentra /wp-admin, /uploads con gobuster
5. **Find Credentials** — Descubre config.bak en /uploads
6. **WP-Admin Compromise** — Accede al panel con credenciales encontradas
7. **SSH Connection** — Conecta por SSH usando credenciales del dashboard
8. **Capture Root Flag** — Lee la flag en /root/flag.txt

**Herramientas:** arp-scan, nmap, gobuster, firefox, ssh
**Flags:** ZIL{USER_WP_GRANTED}, ZIL{ROOT_WP_ACHIEVED}

---

## Laboratorio 02 — Web OSINT & SSH Compromise
**Dificultad:** Easy | **Categoría:** Web | **Red:** 10.10.10.0/24

**Descripción:** Reconocimiento web, enumeración de usuarios y compromiso SSH con Hydra.

### Misiones (6)

1. **Network Reconnaissance** — Descubre hosts
2. **Port Scanning** — Identifica SSH (puerto 22) y HTTP (puerto 80)
3. **Web Reconnaissance** — Extrae "Gonzalo" como usuario del sitio
4. **Credential Attack** — Brute force SSH con hydra
5. **SSH Access** — Conecta con credenciales encontradas
6. **Capture User Flag** — Lee la flag en el home del usuario

**Herramientas:** arp-scan, nmap, firefox, hydra, ssh
**Flag:** ZIL{SSH_USER_ACCESS_GRANTED}
**Credenciales:** gonzalo / casablanca

---

## Laboratorio 03 — EternalBlue MS17-010
**Dificultad:** Easy | **Categoría:** Network | **Red:** 172.16.0.0/24

**Descripción:** Explotación EternalBlue en Windows 7 sin parchear mediante Metasploit.

### Misiones (5)

1. **Network Reconnaissance** — Descubre hosts con arp-scan
2. **Port Scanning** — Identifica SMB (puerto 445) con nmap
3. **Verify Vulnerability** — Usa `auxiliary/scanner/smb/smb_ms17_010` en msfconsole
4. **Exploit EternalBlue** — Ejecuta `exploit/windows/smb/ms17_010_eternalblue`
5. **Verify SYSTEM Access** — Comprueba privilegios con `getuid` en meterpreter

**Herramientas:** arp-scan, nmap, msfconsole
**Target:** Windows 7 Professional SP1 x64
**Flag:** ZIL{ETERNALBLUE_SYSTEM_PWNED}

---

## Laboratorio 04 — LFI to RCE
**Dificultad:** Medium | **Categoría:** Web | **Red:** 192.168.20.0/24

**Descripción:** Explota LFI para ejecutar una reverse shell (RCE).

### Misiones (7)

1. **Reconnaissance** — Descubre hosts con arp-scan
2. **Scanning** — Identifica Apache y OpenSSH con nmap
3. **LFI Discovery** — Prueba LFI via `?page=../../../../etc/passwd`
4. **Prepare Payload** — Inspecciona `/root/payload.php`
5. **Setup Listener** — Inicia `nc -nlvp 4444`
6. **Remote Code Execution** — Sube y ejecuta payload.php
7. **Capture User Flag** — Lee la flag

**Herramientas:** arp-scan, nmap, firefox, nc
**Flag:** ZIL{LFI_REVERSE_SHELL_PWNED}

---

## Laboratorio 05 — FTP Enumeration & Privilege Escalation
**Dificultad:** Medium | **Categoría:** Network | **Red:** 10.10.20.0/24

**Descripción:** Enumeración FTP anónima, fuerza bruta SSH y escalada con sudo vim.

### Misiones (9)

1. **Host Discovery** — Descubre hosts
2. **Port Scanning** — Identifica FTP (21) y SSH (22)
3. **FTP Enumeration** — Conecta como anonymous, descarga nota
4. **Read FTP Note** — Lee la nota para descubrir el usuario "john"
5. **SSH Brute Force** — Usa hydra contra el usuario "john"
6. **SSH Access** — Conecta con credenciales
7. **Sudo Enumeration** — Verifica permisos con `sudo -l`
8. **Privilege Escalation** — Escalada con `sudo vim -c '!bash'`
9. **Capture Root Flag** — Lee /root/flag2.txt

**Herramientas:** arp-scan, nmap, ftp, hydra, ssh, sudo
**Flags:** ZIL{FTP_ANON_ACCESS}, ZIL{SUDO_VIM_PRIVESC_COMPLETE}
**Credenciales:** john / ilovelinux

---

## Laboratorio 06 — SQL Injection & Database Exfiltration
**Dificultad:** Medium | **Categoría:** Web | **Red:** 192.168.40.0/24

**Descripción:** Explotación de SQL injection y enumeración de bases de datos.

### Misiones (8)

1. **Network Discovery** — Descubre hosts con arp-scan
2. **Port Enumeration** — Identifica Apache, MySQL y FTP
3. **Identify SQL Injection Vector** — Accede al formulario de login vulnerable
4. **Exploit SQL Injection** — Bypass authentication con `' OR '1'='1`
5. **Database Enumeration** — Usa UNION-based SQL injection
6. **FTP Access Setup** — Conecta a FTP (ftpuser/ftp_dump_2024)
7. **Extract Database Dump** — Descarga database_dump.sql
8. **Capture Flag** — Extrae flag del dump

**Herramientas:** arp-scan, nmap, curl, ftp
**Flags:** ZIL{SQL_INJECTION_FOUND}, ZIL{DATABASE_COMPROMISED}

---

## Laboratorio 07 — Burp Suite: Web Application Pentesting
**Dificultad:** Medium | **Categoría:** Web | **Red:** 192.168.50.0/24

**Descripción:** La víctima es "CasinoVeo", una parodia de generador de
imágenes y videos con IA en la nube (el chiste es "casi no veo": los renders
salen tan difusos que casi no se ven), con login vulnerable a SQLi. Primero
se prueba manualmente en el navegador y luego se explota profesionalmente
con Burp Suite (Proxy + Repeater).

### Misiones (8)

1. **Network Discovery** — Descubre hosts (arp-scan / nmap -sn)
2. **Port Scan** — Identifica Apache con nmap
3. **Browse CasinoVeo** — Visitá el sitio en el CyberBrowser (`http://<ip>/login`)
4. **Test SQLi in the Browser** — Comilla simple (`'`) en el formulario → 500 SQL syntax
5. **Bypass Auth in the Browser** — `' OR '1'='1` → dashboard premium (SQLi confirmed)
6. **Intercept With Burp Suite** — Interceptá el POST /login en el Proxy y envíalo al Repeater
7. **Dump Data With UNION** — `' UNION SELECT * FROM users--` → credenciales MySQL root
8. **Capture the Flag** — La flag viaja en la tabla users del volcado

**Herramientas:** arp-scan, nmap, burpsuite
**Flags:** ZIL{BURP_REPEATER_MASTER}, ZIL{INTERCEPT_AND_EXPLOIT}

---

## Laboratorio 08 — Webmail RCE → xrdp → Escalada
**Dificultad:** Medium | **Categoría:** Web | **Red:** 192.168.60.0/24

**Descripción:** Windows Server 2019 sirviendo un webmail **SquirrelMail
1.4.22** con Apache/PHP. La entrada es el webmail (CVE-2017-7692), pero la
sesión que se abre es de la **cuenta del servicio**, así que todavía falta
escalar: se reutilizan las credenciales locales que dejaron en el servidor
para entrar por **xrdp** al escritorio remoto, y desde el PowerShell de esa
sesión se encuentra el servicio de backup (corre como `LocalSystem` desde
una carpeta con permisos abiertos) y se escala con **potato**.

> El lab 08 no aparece en la grilla (igual que el 07): se entra escribiendo
> la ruta `/<lang>/scenario/scenario-08`.

### Misiones (10)

1. **Network Discovery** — Descubre hosts (arp-scan / nmap -sn)
2. **Port Scan** — Identifica el 443/tcp del webmail
3. **Browse the Webmail** — CyberBrowser en `http://<ip>/webmail`; la versión se lee debajo del login
4. **Scan the Webmail Version** — `use auxiliary/scanner/http/squirrelmail_version` → `set RHOSTS` → `run`
5. **Exploit the Webmail** — `use exploit/multi/http/squirrelmail_cgi_rce` → shell como `svc_webmail`
6. **Read the Attachment Note** — `type C:\inetpub\webmail\attachments\nota.txt` → clave de `helpdesk`
7. **RDP Session with xrdp** — `xrdp /v:<ip> /u:helpdesk /p:<clave>` → escritorio remoto
8. **Find the Misconfigured Service** — `C:\Users\Public\svc-backup\svc-backup.ini` dice `ObjectName=LocalSystem`
9. **Escalate With Potato** — `potato` desde el PowerShell del escritorio → admin
10. **Capture the Admin Flag** — `type C:\Users\Administrator\flag.txt` (0600: sin escalar no se lee)

**Herramientas:** arp-scan, nmap, metasploit, xrdp, potato
**Flags:** ZIL{RDP_POTATO_ESCALATION}

---

## Consejos Generales

### Discovery Levels
- **Level 1:** Descubrimiento de red (arp-scan)
- **Level 2:** Escaneo de puertos (nmap)
- **Level 3:** Enumeración de servicios
- **Level 4:** Acceso y post-explotación

### Diccionarios Disponibles
- `/usr/share/wordlists/rockyou.txt` — 100+ contraseñas para hydra
- `/usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt` — 100+ directorios para gobuster

### Atajos Útiles
- `Ctrl+L` — Limpiar terminal
- `Ctrl+U` — Borrar línea actual
- `Tab` — Autocompletar comandos y paths
- `↑/↓` — Navegar historial de comandos
