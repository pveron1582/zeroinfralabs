// ── commands/builtin/help.ts ──────────────────────────────────────
// Muestra la ayuda de comandos disponibles

import type { CommandResponse } from '../../types';

const COMMAND_HELP: Record<string, string> = {
  mkdir: `mkdir - Crear directorios

Uso:
  mkdir [-p] directorio...

Opciones:
  -p  Crear directorios padres si no existen

Ejemplos:
  mkdir nueva_carpeta              # Crear en directorio actual
  mkdir -p /var/www/html/nueva     # Crear ruta completa
  mkdir /tmp/test                  # Crear en ruta absoluta

Descripción:
  Crea uno o más directorios. Con -p crea toda la ruta de directorios.
  Sin -p, los directorios padres deben existir.`,

  rmdir: `rmdir - Eliminar directorios vacíos

Uso:
  rmdir [-p] directorio...

Opciones:
  -p  Eliminar directorios padres si quedan vacíos

Ejemplos:
  rmdir carpeta_vacia             # Eliminar directorio vacío
  rmdir -p /var/www/html/nueva    # Eliminar ruta completa

Descripción:
  Elimina directorios que están vacíos. Con -p elimina también los padres
  si quedan vacíos. Solo root puede eliminar en directorios del sistema.`,

  ls: `ls - Listar archivos y directorios

Uso:
  ls [opciones] [directorio]

Opciones:
  -l  Formato largo (permisos, tamaño, fecha)
  -a  Mostrar archivos ocultos (que empiezan con .)
  -la Combinación de -l y -a

Ejemplos:
  ls                              # Listar directorio actual
  ls -l /etc                      # Formato largo de /etc
  ls -la ~                        # Ocultos + formato largo en home`,

  cd: `cd - Cambiar directorio

Uso:
  cd [directorio]

Ejemplos:
  cd /etc                         # Ir a /etc
  cd ..                           # Directorio padre
  cd ~                            # Home del usuario
  cd                              # Home del usuario

Descripción:
  Cambia el directorio de trabajo actual.`,

  cat: `cat - Mostrar contenido de archivos

Uso:
  cat archivo...

Ejemplos:
  cat /etc/passwd                 # Mostrar archivo de usuarios
  cat log.txt                     # Mostrar archivo de log

Descripción:
  Muestra el contenido de uno o más archivos en la terminal.`
};

export const cmd_help = {
  name: 'help',
  execute: (args: string[]): CommandResponse => {
    if (args.length === 0) {
      return {
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
  mkdir [-p] dir - Crear directorios
  rmdir [-p] dir - Eliminar directorios vacíos
  nc [args]      - Netcat utility
  exit           - Cerrar sesión SSH
  end            - Salir del laboratorio

Uso: help <comando> para más información sobre un comando específico.`,
        isError: false
      };
    }

    const command = args[0].toLowerCase();
    const helpText = COMMAND_HELP[command];

    if (helpText) {
      return { output: helpText, isError: false };
    }

    return {
      output: `No hay ayuda disponible para el comando: ${command}\nEscribe 'help' sin argumentos para ver la lista de comandos disponibles.`,
      isError: true
    };
  }
};
