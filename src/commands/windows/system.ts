// ── commands/windows/system.ts ────────────────────────────────────
// Comandos cmd.exe de sistema: whoami, systeminfo, ipconfig, netstat,
// tasklist, taskkill, ping, tracert, hostname (PLAN_WINDOWS W1).

import type { CommandContext, CommandResponse, Machine } from '../../types';
import { getCurrentUser } from '../../utils/users';
import { getListeningPorts } from '../../frameworks/network/networkState';
import { killPid, list as listProcesses } from '../../frameworks/process/processManager';
import { gatewayOf } from './helpers';
import { WIN_ERR } from './helpers';

// ── hostname ───────────────────────────────────────────────────────

export const cmd_hostname = {
  name: 'hostname',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => ({
    output: ctx.machine.win?.computerName || ctx.machine.machine_info.hostname,
  }),
};

// ── whoami ─────────────────────────────────────────────────────────

export const cmd_whoami = {
  name: 'whoami',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const user = getCurrentUser(ctx.machine);
    const flag = (args[0] || '').toLowerCase();
    const host = ctx.machine.win?.computerName || ctx.machine.machine_info.hostname;
    const isAdmin = user.uid === 0;

    if (!flag) return { output: user.username };

    if (flag === '/groups') {
      const lines = [
        'GRUPO TIPO                          SID',
        '========================================= =============== ==============================',
        'Todos                                Well-known group S-1-1-0',
        'Local                                Well-known group S-1-2-0',
        `${host}\\${user.username.padEnd(31)} Usuario         S-1-5-21-1-543-1`,
        'NT AUTHORITY\\Usuarios                Well-known group S-1-5-32-545',
      ];
      if (isAdmin) {
        lines.push('Administradores                     Alias            S-1-5-32-544');
        lines.push('NT AUTHORITY\\SYSTEM                 Well-known group S-1-5-18');
      }
      lines.push(WIN_ERR.completed);
      return { output: lines.join('\n') };
    }

    if (flag === '/priv') {
      const lines = [
        'Nombre de usuario del privilegio Descripción                                        Estado',
        '================================ ============ ==============',
        'SeChangeNotifyPrivilege          Omitir comprobación de navegación              Habilitado',
        'SeIncreaseWorkingSetPrivilege    Aumentar el conjunto de trabajo de un proceso  Habilitado',
      ];
      if (isAdmin) {
        lines.push('SeDebugPrivilege                 Depurar programas                               Habilitado');
        lines.push('SeShutdownPrivilege              Apagar el sistema                              Habilitado');
      } else {
        lines.push('SeDebugPrivilege                 Depurar programas                               Deshabilitado');
      }
      return { output: lines.join('\n') };
    }

    return { output: `whoami: opción no válida: ${args[0]}`, isError: true };
  },
};

// ── systeminfo ─────────────────────────────────────────────────────

export const cmd_systeminfo = {
  name: 'systeminfo',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    const m = ctx.machine;
    const host = m.win?.computerName || m.machine_info.hostname;
    const ip = m.machine_info.ip;
    const lines = [
      `Nombre de host:                       ${host}`,
      `Nombre del sistema operativo:         ${m.machine_info.os}`,
      `Versión del sistema operativo:        10.0.17763`,
      `Fabricante del sistema operativo:     Microsoft Corporation`,
      `Propietario registrado:               ZeroInfra`,
      `Fecha de instalación original:        15/03/2024, 10:00:00`,
      `Tiempo de arranque del sistema:       01/01/2024, 08:00:00`,
      `Fabricante del equipo:                QEMU`,
      `Tipo de sistema:                     x64-based PC`,
      `Procesador(es):                       1 procesador(es) instalado(s)`,
      `                                      [01]: x64 Family 6 ~2904 Mhz`,
      `Versión de BIOS:                      EDKII 1.0.0`,
      `Memoria física total:                 4.096 MB`,
      `Memoria física disponible:            2.847 MB`,
      `Nombre de dominio:                    WORKGROUP`,
      `Nombre de usuario:                    ${getCurrentUser(m).username}`,
      `Zona horaria:                         (UTC-05:00) Bogotá, Lima, Quito`,
      `Idioma de sistema:                    es-ES`,
      `Memoria virtual total:                5.529 MB`,
      `Memoria virtual disponible:           3.981 MB`,
      `Id. de producto:                      00331-10000-00001-AA778`,
      `Nombre de equipo:                     ${host}`,
      `Ruta de ejecución del sistema:        C:\\Windows\\system32`,
      `Dirección IP de red:                  ${ip}`,
      `Nombre de interfaz de red:            Ethernet0`,
      `Número de serie:                      7A3C-9F21`,
    ];
    return { output: lines.join('\n') };
  },
};

// ── ipconfig ───────────────────────────────────────────────────────

export const cmd_ipconfig = {
  name: 'ipconfig',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const m = ctx.machine;
    const ip = m.machine_info.ip || '0.0.0.0';
    const gw = gatewayOf(ip);
    const all = args.some(a => a.toLowerCase() === '/all');

    let out = `Configuración IP de Windows\n\n`;
    out += `Adaptador de Ethernet Ethernet0:\n`;
    out += `   Sufijo DNS específico según la lista de vínculos: local\n`;
    if (all) {
      out += `   Descripción. . . . . . . . . . . . . : VirtIO Ethernet Adapter\n`;
      out += `   Dirección física. . . . . . . . . . : ${m.machine_info.mac?.replace(/:/g, '-') || '52-54-00-12-34-56'}\n`;
      out += `   DHCP habilitado. . . . . . . . . . . : Sí\n`;
      out += `   Configuración automática habilitada : Sí\n`;
    }
    out += `   Dirección IPv4. . . . . . . . . . . : ${ip}         (Preferencial)\n`;
    out += `   Máscara de subred. . . . . . . . . . : 255.255.255.0\n`;
    if (gw) {
      out += `   Puerta de enlace predeterminada. . . : ${gw}\n`;
    }
    if (all) {
      out += `   Servidores DNS. . . . . . . . . . . . : 10.10.10.1\n`;
      out += `   NetBIOS sobre TCP/IP . . . . . . . . : Habilitado\n`;
    }
    out += `\n`;
    return { output: out };
  },
};

// ── netstat ────────────────────────────────────────────────────────

export const cmd_netstat = {
  name: 'netstat',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    const listening = getListeningPorts(ctx.machine);
    let out = `Conexiones activas\n\n`;
    out += `  Proto Dirección local        Dirección remota       Estado          PID\n`;
    out += `  ----  ----------------------- ---------------------- -------------- ------\n`;
    const ip = ctx.machine.machine_info.ip || '0.0.0.0';
    for (const lp of listening) {
      const local = `${ip}:${lp.port}`;
      out += `  TCP   ${local.padEnd(23)} ${ip.padEnd(22)} ${'LISTENING'.padEnd(14)} ${lp.pid ?? 0}\n`;
    }
    return { output: out };
  },
};

// ── tasklist ───────────────────────────────────────────────────────

export const cmd_tasklist = {
  name: 'tasklist',
  execute: (_args: string[], ctx: CommandContext): CommandResponse => {
    const procs = listProcesses(ctx.machine);
    let out = `Nombre de imagen                     PID Uso de memoria\n`;
    out += `========================= ======== ============\n`;
    for (const p of procs) {
      const mem = Math.round((p.mem + 1) * 1024 + p.pid);
      out += `${p.name.padEnd(36)} ${String(p.pid).padStart(8)} ${String(mem).padStart(12)} K\n`;
    }
    return { output: out };
  },
};

// ── taskkill ───────────────────────────────────────────────────────

export const cmd_taskkill = {
  name: 'taskkill',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let pid: number | null = null;
    for (let i = 0; i < args.length; i++) {
      const a = args[i].toUpperCase();
      if (a === '/F' || a === '-F') continue;
      if (a === '/PID' || a === '-PID') {
        const next = parseInt(args[++i], 10);
        pid = Number.isNaN(next) ? pid : next;
        continue;
      }
      const bare = parseInt(args[i], 10);
      if (!Number.isNaN(bare)) pid = bare;
    }
    if (pid === null) {
      return { output: 'Uso: taskkill /PID <n> /F', isError: true };
    }
    if (killPid(ctx.machine, pid)) {
      return { output: `Correcto: se terminó el proceso con PID ${pid}.` };
    }
    return { output: `ERROR: no se encontró el proceso con PID ${pid}.`, isError: true };
  },
};

// ── ping / tracert (resolución de destino) ────────────────────────

function resolveTarget(machines: Machine[], target: string): Machine | undefined {
  return machines.find(m =>
    m.machine_info.ip === target ||
    m.machine_info.hostname.toLowerCase() === target.toLowerCase() ||
    (m.win?.computerName || '').toLowerCase() === target.toLowerCase(),
  );
}

function isIpv4(s: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s);
}

export const cmd_ping = {
  name: 'ping',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    let count = 4;
    let target: string | undefined;
    for (let i = 0; i < args.length; i++) {
      if (args[i].toLowerCase() === '-n') {
        const n = parseInt(args[++i], 10);
        if (!Number.isNaN(n) && n > 0) count = n;
        continue;
      }
      if (!target && !args[i].startsWith('-')) target = args[i];
    }
    if (!target) return { output: 'Uso: ping [-n <cantidad>] <destino>', isError: true };

    const targetMachine = resolveTarget(ctx.allMachines || [ctx.machine], target);
    const ip = targetMachine?.machine_info.ip || (isIpv4(target) ? target : null);
    if (!ip) {
      return { output: `No se puede encontrar el host ${target}. El nombre no es válido.`, isError: true };
    }

    const ttl = targetMachine?.machine_info.os.toLowerCase().includes('windows') ? 128 : 64;
    const exists = !!targetMachine;
    let out = `Disparando ping a ${ip} con 32 bytes de datos:\n\n`;
    const times: number[] = [];

    for (let i = 0; i < count; i++) {
      if (exists) {
        const t = Math.floor(Math.random() * 3) + 1;
        times.push(t);
        out += `Respuesta desde ${ip}: bytes=32 tiempo=${t}ms TTL=${ttl}\n`;
      } else {
        out += `Tiempo de espera agotado para esta solicitud.\n`;
      }
    }

    out += `\nEstadísticas de ping para ${ip}:\n`;
    if (exists) {
      const min = Math.min(...times);
      const max = Math.max(...times);
      const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      out += `    Paquetes: Enviados = ${count}, Recibidos = ${count}, Perdidos = 0 (0% de pérdida),\n`;
      out += `Tiempos aproximados de ida y vuelta en milisegundos:\n`;
      out += `    Mínimo = ${min}ms, Máximo = ${max}ms, Promedio = ${avg}ms`;
    } else {
      out += `    Paquetes: Enviados = ${count}, Recibidos = 0, Perdidos = ${count} (100% de pérdida),`;
    }
    return { output: out };
  },
};

export const cmd_tracert = {
  name: 'tracert',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const target = args.find(a => !a.startsWith('-') && !['-d', '-h'].includes(a.toLowerCase()));
    if (!target) return { output: 'Uso: tracert <destino>', isError: true };

    const targetMachine = resolveTarget(ctx.allMachines || [ctx.machine], target);
    const ip = targetMachine?.machine_info.ip || (isIpv4(target) ? target : null);
    if (!ip) {
      return { output: `No se puede resolver ${target}: Nombre no válido.`, isError: true };
    }

    let out = `Traza a la dirección ${ip} sobre caminos de 30 saltos:\n\n`;
    if (targetMachine) {
      const srcIp = ctx.machine.machine_info.ip || '';
      const gw = gatewayOf(srcIp);
      let hop = 1;
      if (gw && gw !== ip) {
        out += `  ${String(hop).padStart(3)}    1 ms     1 ms     1 ms  ${gw}\n`;
        hop++;
      }
      out += `  ${String(hop).padStart(3)}    1 ms     1 ms     1 ms  ${ip}\n`;
      out += `\nTraza completa.`;
    } else {
      for (let hop = 1; hop <= 3; hop++) {
        out += `  ${String(hop).padStart(3)}     *       *       *     Tiempo de espera agotado.\n`;
      }
      out += `\nTraza completa.`;
    }
    return { output: out };
  },
};
