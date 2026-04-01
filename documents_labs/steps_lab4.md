# Lab 04 — LFI to RCE
**File:** `src/laboratorios/laboratorio04.ts`
**Date:** 2026-03-31
**Difficulty:** Medium
**Category:** Web
**Network Range:** 192.168.20.0/24
**Target:** 192.168.20.11

---

## Steps

### 01 — Reconnaissance
Discover host: `arp-scan 192.168.20.0/24`

### 02 — Scanning
Scan services: `nmap -sV 192.168.20.11`

### 03 — LFI Discovery
Test reading server files. Go to the site and navigate to "About". Delete only about.php and enter ../../../../etc/passwd

### 04 — Prepare Payload
Inspect the file for the reverse shell: `cat /root/payload.php`

### 05 — Setup Listener
Prepare the listener in your terminal: `nc -nlvp 4444`

### 06 — Remote Code Execution
Upload the file at /upload.php and execute it through the file manager at /files/payload.php or by clicking on the file at /files