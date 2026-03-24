// ── commands/builtin/help.ts ──────────────────────────────────────
// Muestra la ayuda de comandos disponibles

import type { CommandResponse } from '../../types';

export const cmd_help = {
  name: 'help',
  execute: (): CommandResponse => ({
    output: `Comandos disponibles:
  help           - Mostrar esta ayuda
  clear          - Limpiar la terminal
  whoami         - Info del usuario actual
  ifconfig       - Configuración de red
  arp-scan [red] - Descubrir hosts activos
  nmap [ip]      - Escanear puertos y servicios
  gobuster dir   - Enumerar directorios web
  hydra [args]   - Fuerza bruta de credenciales
  hashcat [args] - Crackeo de contraseñas
  ssh user@ip    - Conectar por SSH
  msfconsole     - Iniciar Metasploit Framework
  ls [dir]       - Listar archivos
  cd [dir]       - Cambiar directorio
  cat [archivo]  - Mostrar contenido de archivo
  exit           - Cerrar sesión SSH
  end            - Salir del laboratorio`
  })
};
