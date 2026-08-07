// ── commands/builtin/systemctl.ts ───────────────────────────────────
// Simulador de systemctl / service - gestión de servicios (ROADMAP Fase 5.5)
// Nota: Este comando es "libre" - no conoce laboratorios ni misiones.

import type { CommandContext, CommandResponse } from '../../types';
import { getAllServices, startService, stopService } from '../../frameworks/process/processManager';
import { getCurrentUser, isRoot } from '../../utils/users';

function unitName(target: string): string {
  return target.endsWith('.service') ? target.slice(0, -'.service'.length) : target;
}

export const cmd_systemctl = {
  name: 'systemctl',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const [action, target] = args;
    const machine = ctx.machine;

    if (!action) {
      return { output: 'systemctl: se requiere un comando (status, start, stop, restart)', isError: true };
    }

    if (action === 'status') {
      if (!target) {
        const services = getAllServices(machine);
        if (services.length === 0) return { output: 'No se encontraron servicios en el sistema.', isError: false };
        let output = '';
        for (const s of services) {
          output += `${s.running ? '●' : '○'} ${s.name}.service - ${s.description}\n`;
          output += `     Loaded: loaded (/lib/systemd/system/${s.name}.service; enabled)\n`;
          output += `     Active: ${s.running ? 'active (running)' : 'inactive (dead)'}\n\n`;
        }
        return { output: output.trimEnd(), isError: false };
      }

      const service = unitName(target);
      const info = getAllServices(machine).find(s => s.name === service);
      if (!info) {
        return { output: `Unit ${target}.service could not be found.`, isError: true };
      }
      return {
        output:
          `● ${service}.service - ${info.description}\n` +
          `     Loaded: loaded (/lib/systemd/system/${service}.service; enabled)\n` +
          `     Active: ${info.running ? 'active (running)' : 'inactive (dead)'}`,
        isError: false,
      };
    }

    if (action === 'start' || action === 'stop' || action === 'restart') {
      if (!target) {
        return { output: `systemctl: falta el nombre del servicio para '${action}'`, isError: true };
      }
      const service = unitName(target);
      const known = getAllServices(machine).some(s => s.name === service);
      if (!known) {
        return { output: `Failed to ${action} ${target}.service: Unit not found.`, isError: true };
      }

      const currentUser = getCurrentUser(machine);
      if (!isRoot(currentUser)) {
        return { output: `systemctl: Operation not permitted (se requiere root para ${action} servicios)`, isError: true };
      }

      if (action === 'stop') stopService(machine, service);
      if (action === 'start') startService(machine, service);
      if (action === 'restart') {
        stopService(machine, service);
        startService(machine, service);
      }

      const verb = action === 'start' ? 'started' : action === 'stop' ? 'stopped' : 'restarted';
      return { output: `Job for ${service}.service ${verb}.`, isError: false };
    }

    if (action === 'is-active') {
      if (!target) return { output: 'systemctl: falta el servicio para is-active', isError: true };
      const service = unitName(target);
      return { output: getAllServices(machine).find(s => s.name === service)?.running ? 'active' : 'inactive', isError: false };
    }

    if (action === 'enable' || action === 'disable') {
      if (!target) return { output: `systemctl: falta el servicio para '${action}'`, isError: true };
      const service = unitName(target);
      const known = getAllServices(machine).some(s => s.name === service);
      if (!known) return { output: `Failed to ${action} ${target}.service: Unit not found.`, isError: true };
      return { output: `Synchronizing state of ${service}.service with SysV service script with /lib/systemd/systemd-sysv-install.\nExecuting: /lib/systemd/systemd-sysv-install ${action} ${service}`, isError: false };
    }

    return { output: `systemctl: comando desconocido: '${action}'`, isError: true };
  }
};

// Alias estilo SysV: service <nombre> <status|start|stop|restart>
export const cmd_service = {
  name: 'service',
  execute: (args: string[], ctx: CommandContext): CommandResponse => {
    const [service, action] = args;
    if (!service) {
      return { output: 'service: uso: service <servicio> <status|start|stop|restart>', isError: true };
    }
    if (!action) {
      return { output: `service: se requiere una acción para '${service}' (status, start, stop, restart)`, isError: true };
    }
    return cmd_systemctl.execute([action, service], ctx);
  }
};
