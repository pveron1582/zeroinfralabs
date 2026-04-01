# Lab 01 — WordPress Compromise
**File:** `src/laboratorios/laboratorio01.ts`
**Date:** 2026-03-31
**Difficulty:** Medium
**Category:** Web
**Network Range:** 192.168.1.0/24
**Target:** 192.168.1.11

---

## Steps

### 01 — Network Reconnaissance
Discover active hosts: `arp-scan 192.168.1.0/24`

### 02 — Port Scanning
Scan ports: `nmap -sV 192.168.1.11`

### 03 — Web Enumeration
Access the website from the Firefox button above.

### 04 — Directory Discovery
Enumerate routes: `gobuster dir -u http://192.168.1.11 -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`

### 05 — WP-Admin Compromise
Find credentials in `/uploads` and access `/wp-admin`.

### 06 — SSH Connection
Connect via SSH as root to complete the lab: `ssh root@192.168.1.11 R00t@SSH2024!`
