**step01:** se pide ejecutar arp-scan con rango de red

**info maquina victima:** nada, totalmente sin informacion

**al hacer click en la maquina victima:** se muestra la IP y MAC obtenidas del arp-scan, pero no se muestra el sistema operativo ni los puertos abiertos (esto se obtiene en el step 2 con nmap)

**validacion step01:** ejecucion de comando arp-scan

---

**step02:** se pide ejecutar nmap -sV para identificar servicios

**info maquina victima:** solo la IP obtenida del arp-scan

**al hacer click en la maquina victima:** se muestra IP, MAC, sistema operativo y puertos abiertos (22/tcp ssh, 80/tcp http) - el sistema operativo solo se muestra después de ejecutar nmap

**validacion step02:** ejecucion de comando nmap -sV <target-ip>

---

**step03:** se pide ejecutar hydra para fuerza bruta SSH

**info maquina victima:** IP y puerto 22 abierto (obtenido del nmap)

**al hacer click en la maquina victima:** se muestra IP, MAC, sistema operativo y puertos abiertos (igual que step 2)

**validacion step03:** ejecucion de comando hydra -l developer -P rockyou.txt <target-ip> ssh

---

**step04:** se pide conectar por SSH con las credenciales encontradas

**info maquina victima:** credenciales developer:dev2024 obtenidas de hydra

**al hacer click en la maquina victima:** se muestra IP, MAC, sistema operativo, puertos abiertos y credenciales verificadas (developer:dev2024)

**validacion step04:** ejecucion de comando ssh developer@<target-ip> dev2024

---

**step05:** se pide ejecutar sudo -l para enumerar permisos

**info maquina victima:** acceso SSH como usuario developer

**al hacer click en la maquina victima:** se muestra IP, MAC, sistema operativo, puertos abiertos, credenciales verificadas y sesión SSH activa

**validacion step05:** ejecucion de comando sudo -l



