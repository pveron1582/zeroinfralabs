// ── commands/windows/session.ts ───────────────────────────────────
// Comandos cmd.exe de sesión: echo, set, cls, ver, cmd, help.
// (powershell vive en commands/powershell/ — PLAN_WINDOWS W2)

import type { CommandContext, CommandResponse } from '../../types';
import { WIN_VERSION } from './helpers';

// ── echo ───────────────────────────────────────────────────────────

export const cmd_echo = {
  name: 'echo',
  execute: (args: string[]): CommandResponse => {
    if (args.length === 0) return { output: 'ECHO está activado.' };
    if (args.length === 1 && (args[0] === 'on' || args[0] === 'off')) {
      return { output: `ECHO está ${args[0] === 'on' ? 'activado' : 'desactivado'}.` };
    }
    return { output: args.join(' ') };
  },
};

// ── set ────────────────────────────────────────────────────────────

export const cmd_set = {
  name: 'set',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const env = ctx.env || {};

    if (args.length === 0) {
      const keys = Object.keys(env).sort();
      const lines = keys.map(k => `${k}=${env[k]}`);
      return { output: lines.join('\n') };
    }

    const line = args.join(' ');
    const eq = line.indexOf('=');
    if (eq === -1) {
      const upper = line.trim().toUpperCase();
      const value = env[upper] ?? env[line.trim()];
      if (value === undefined) {
        return { output: `La variable de entorno ${line.trim()} no está definida.`, isError: true };
      }
      return { output: `${line.trim()}=${value}` };
    }

    const name = line.slice(0, eq).trim();
    const value = line.slice(eq + 1);
    if (!name) return { output: 'Uso: set VAR=valor', isError: true };
    ctx.setEnv?.({ ...env, [name]: value });
    return { output: '' };
  },
};

// ── cls ────────────────────────────────────────────────────────────

export const cmd_cls = {
  name: 'cls',
  execute: (): CommandResponse => ({ output: '', clearScreen: true }),
};

// ── ver ────────────────────────────────────────────────────────────

export const cmd_ver = {
  name: 'ver',
  execute: (): CommandResponse => ({ output: `\n${WIN_VERSION}\n` }),
};

// ── cmd ────────────────────────────────────────────────────────────

/** Mensaje clásico de cmd.exe cuando no encuentra un comando. */
export const cmdNotFound = (name: string): CommandResponse => ({
  output: `'${name}' no se reconoce como un comando interno o externo,
programa o archivo por lotes ejecutable.`,
  isError: true,
});

export const cmd_cmd = {
  name: 'cmd',
  // El prompt NO va en el banner: lo dibuja la terminal en la línea de
  // input. Imprimirlo acá dejaba dos prompts (el del output y el
  // editable un renglón abajo).
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const flag = (args[0] ?? '').toLowerCase();
    // /c ejecuta y cierra; /k ejecuta y queda (acá no hay sesión interactiva,
    // así que se comportan igual).
    if (flag === '/c' || flag === '/k') {
      const cmdline = args.slice(1).join(' ').trim();
      if (!cmdline) return { output: '' };
      if (!ctx.runChild) return cmdNotFound(cmdline);
      const child = ctx.runChild(cmdline);
      // El dispatcher dice "Command not found: x" — cmd.exe tiene su propio
      // texto, así que se re-escribe (el resto del output se respeta).
      if (child.isError && child.output.startsWith('Command not found:')) {
        const missing = child.output.slice('Command not found:'.length).split('\n')[0].trim();
        return cmdNotFound(missing);
      }
      // Salida y metadatos (fileRead, blockingCommand, privesc…) viajan tal
      // cual: `cmd /c type C:\flag.txt` tiene que validar la misión igual
      // que `type` ejecutado directo.
      return child;
    }
    return { output: WIN_VERSION };
  },
};

// ── help (listado win) ─────────────────────────────────────────────

const HELP_TEXT = [
  'Comandos de Windows (cmd.exe):',
  '',
  '--- Sistema de archivos ---',
  '  dir [ruta]           Lista archivos y directorios',
  '  cd [ruta]            Muestra o cambia el directorio actual (chdir)',
  '  type <archivo>       Muestra el contenido de un archivo',
  '  copy <o> <d>         Copia archivos',
  '  move <o> <d>         Mueve o renombra archivos',
  '  del <archivo>        Elimina archivos (erase)',
  '  mkdir / md <dir>     Crea directorios',
  '  rmdir / rd <dir>     Elimina directorios vacíos',
  '  attrib [+r|-r] <f>   Muestra o cambia atributos de solo lectura',
  '',
  '--- Sesión ---',
  '  echo [texto]         Muestra texto',
  '  set [VAR=valor]      Muestra o establece variables de entorno',
  '  cls                  Limpia la pantalla',
  '  ver                  Versión de Windows',
  '  cmd                  Información de la shell cmd',
  '  powershell [-Command "<ps>"]  Sesión PowerShell o cmdlet one-shot',
  '  help                 Esta ayuda',
  '',
  '--- Sistema ---',
  '  hostname             Nombre del equipo',
  '  whoami [/groups|/priv]  Usuario actual',
  '  systeminfo           Información del sistema',
  '  ipconfig [/all]      Configuración de red',
  '  netstat [-an]        Conexiones de red',
  '  tasklist             Procesos en ejecución',
  '  taskkill /PID <n>    Finaliza un proceso',
  '  ping [-n <n>] <dst>  Prueba de conexión',
  '  tracert <destino>    Traza de ruta (traceroute)',
  '',
  '--- Administración ---',
  '  sc query|start|stop <servicio>   Servicios',
  '  reg query <clave>                Registro',
  '  net user|localgroup|view         Cuentas y red',
  '  schtasks [/query]                Tareas programadas',
  '  shutdown /r|/s|/l                Apagar o reiniciar',
  '',
  '--- Escritorio remoto ---',
  '  mstsc /v:<ip> [/u:<u>]           Conexión RDP (Escritorio remoto)',
  '',
  '--- Privilegios ---',
  '  winpeas                          Enumerar hallazgos y credenciales',
  '  potato                           Escalar privilegios (Potato)',
].join('\n');

export const cmd_help = {
  name: 'help',
  execute: (): CommandResponse => ({ output: HELP_TEXT }),
};
