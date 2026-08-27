# Happy Path Tests

## Escenario 01: WordPress
- [ ] arp-scan descubre máquina
- [ ] nmap muestra OS (Ubuntu 20.04)
- [ ] Firefox carga sitio
- [ ] gobuster encuentra /wp-admin
- [ ] Misión 1 → 8 completan en orden
- [ ] Sin errores en consola (F12)

## Escenario 02: SSH Brute
- [ ] arp-scan descubre máquina
- [ ] nmap muestra SSH (OpenSSH 8.9p1)
- [ ] hydra ataca SSH
- [ ] ssh root@ip conecta
- [ ] whoami muestra "root"
- [ ] Misión 1 → 6 completan

## Escenario 03: EternalBlue
- [ ] arp-scan descubre máquina
- [ ] nmap muestra Windows 7
- [ ] MSF checker auxilia
- [ ] MSF exploit EternalBlue
- [ ] Meterpreter abre
- [ ] getuid muestra SYSTEM
- [ ] Misión 1 → 5 completan

## Escenario 04: LFI + RCE
- [ ] arp-scan descubre máquina
- [ ] nmap muestra HTTP (Apache)
- [ ] Firefox carga sitio
- [ ] LFI lee /etc/passwd
- [ ] nc -nlvp prepara listener
- [ ] Payload sube y ejecuta
- [ ] RCE shell recibida
- [ ] Misión 1 → 7 completan

## Escenario 05: FTP Enum & PrivEsc
- [ ] arp-scan descubre máquina
- [ ] nmap muestra SSH + FTP (21) + HTTP (80)
- [ ] ftp anonymous conecta
- [ ] get nota.txt descarga nota
- [ ] cat nota.txt revela usuario "john"
- [ ] hydra ataca SSH (john)
- [ ] ssh john@ip conecta
- [ ] sudo -l muestra vim
- [ ] sudo vim -c '!bash' abre root
- [ ] cat /root/flag2.txt funciona
- [ ] Misión 1 → 9 completan

## Escenario 06: SQL Injection
- [ ] arp-scan descubre máquina
- [ ] nmap muestra Apache, MySQL y FTP
- [ ] CyberBrowser carga el sitio con formulario de login
- [ ] Comilla simple (') en el formulario → error 500 SQL syntax
- [ ] ' OR '1'='1 → bypass authentication → dashboard
- [ ] ftp con (ftpuser / ftp_dump_2024)
- [ ] get database_dump.sql descarga el dump
- [ ] La flag aparece en el dump
- [ ] Misión 1 → 8 completan

## Escenario 07: Burp Suite Web Pentesting
- [ ] arp-scan / nmap -sn descubre máquina
- [ ] nmap muestra Apache
- [ ] CyberBrowser carga CasinoVeo (http://<ip>/login)
- [ ] Comilla simple (') en el formulario → error 500 SQL syntax
- [ ] ' OR '1'='1 en el navegador → dashboard premium
- [ ] Burp Suite intercepta POST /login (Proxy)
- [ ] Request enviado al Repeater
- [ ] ' UNION SELECT * FROM users-- → credenciales MySQL root
- [ ] Flag en la tabla users del volcado
- [ ] Misión 1 → 8 completan

---

## 🚨 Señales de que ALGO ESTÁ MAL

**Red flags:**
- ❌ Terminal muestra "msf6 >" cuando debería mostrar bash
- ❌ Cambias de escenario y el listener anterior sigue activo
- ❌ whoami no matchea el usuario que conectaste
- ❌ Misiones se completan en orden aleatorio
- ❌ discovery_level no sube después de comandos
- ❌ Errores en consola del navegador (F12)

---

## 📞 Cómo trabajar conmigo

**Cuando encuentres un bug:**

1. **Describe exactamente:**
   - Qué escenario
   - Qué comando ejecutaste
   - Qué pasó
   - Qué esperabas

2. **Pasa el error:**

   Escenario: 04 LFI
   Comando: nc -nlvp 4444
   Error: "Cannot set property 'blockingCommand' of undefined"
   Esperaba: Listener activo esperando reverse shell
