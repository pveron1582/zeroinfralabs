# Lab 04 — LFI to RCE
**File:** `src/laboratorios/laboratorio04.ts`
**Date:** 2026-04-02
**Difficulty:** Medium
**Category:** Web
**Network Range:** 192.168.20.0/24
**Target:** 192.168.20.11

---

## Steps

### 01 — Reconnaissance
**Text:** Discover the host on the network
**Hint 1 (tool):** Use arp-scan
**Hint 2 (command):** `arp-scan 192.168.20.0/24`

### 02 — Scanning
**Text:** Identify the services running on the target
**Hint 1 (tool):** Use nmap
**Hint 2 (command):** `nmap -sV 192.168.20.11`

### 03 — LFI Discovery
**Text:** Test for Local File Inclusion vulnerability
**Hint 1 (tool):** Use the browser to test LFI
**Hint 2 (command):** Navigate to the About page and test `../../../../etc/passwd`

### 04 — Prepare Payload
**Text:** Inspect the reverse shell payload file
**Hint 1 (tool):** View the payload.php file
**Hint 2 (command):** `cat /root/payload.php`

### 05 — Setup Listener
**Text:** Prepare a listener to receive the reverse shell
**Hint 1 (tool):** Use netcat
**Hint 2 (command):** `nc -nlvp 4444`

### 06 — Remote Code Execution
**Text:** Upload the payload and execute it to get RCE
**Hint 1 (tool):** Upload via /upload.php and execute via /files/
**Hint 2 (command):** Upload at /upload.php, execute at /files/payload.php
