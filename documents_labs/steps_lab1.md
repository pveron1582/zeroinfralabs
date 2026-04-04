# Lab 01 — WordPress Compromise
**File:** `src/laboratorios/laboratorio01.ts`
**Date:** 2026-04-02
**Difficulty:** Medium
**Category:** Web
**Network Range:** 192.168.1.0/24
**Target:** 192.168.1.11

---

## Steps

### 01 — Network Reconnaissance
**Text:** Discover the active hosts on the network
**Hint 1 (tool):** Use arp-scan
**Hint 2 (command):** `arp-scan 192.168.1.0/24`

### 02 — Port Scanning
**Text:** Identify the services running on the target
**Hint 1 (tool):** Use nmap
**Hint 2 (command):** `nmap -sV <target-ip>`

### 03 — Web Enumeration
**Text:** Access the website to enumerate its content
**Hint 1 (tool):** Use the Firefox browser
**Hint 2 (command):** Click the Firefox button

### 04 — Directory Discovery
**Text:** Enumerate hidden directories on the web server
**Hint 1 (tool):** Use gobuster
**Hint 2 (command):** `gobuster dir -u http://<ip> -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt`

### 05 — WP-Admin Compromise
**Text:** Find credentials in the uploads directory and access the WordPress admin panel
**Hint 1 (tool):** Look for backup files in /uploads
**Hint 2 (command):** Navigate to /wp-admin

### 06 — SSH Connection
**Text:** Connect via SSH as root to complete the lab
**Hint 1 (tool):** Use the ssh command
**Hint 2 (command):** `ssh root@<target-ip> R00t@SSH2024!`
