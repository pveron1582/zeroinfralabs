# Happy Path Tests

## Escenario 01: WordPress
- [ ] arp-scan descubre máquina
- [ ] nmap muestra OS (Ubuntu 20.04)
- [ ] Firefox carga sitio
- [ ] gobuster encuentra /wp-admin
- [ ] Misión 1 → 5 completan en orden
- [ ] Sin errores en consola (F12)

## Escenario 02: SSH Brute
- [ ] arp-scan descubre máquina
- [ ] nmap muestra SSH (OpenSSH 8.9p1)
- [ ] hydra ataca SSH
- [ ] ssh root@ip conecta
- [ ] whoami muestra "root"
- [ ] Misión 1 → 4 completan

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
- [ ] Misión 1 → 6 completan

## Escenario 05: Privesc
- [ ] arp-scan descubre máquina
- [ ] nmap muestra SSH + HTTP
- [ ] ssh developer conecta
- [ ] sudo -l muestra vim
- [ ] sudo vim -c '!bash' abre root
- [ ] cat /root/root.txt funciona
- [ ] Misión 1 → 7 completan
```

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
```
   Escenario: 04 LFI
   Comando: nc -nlvp 4444
   Error: "Cannot set property 'blockingCommand' of undefined"
   Esperaba: Listener activo esperando reverse shell