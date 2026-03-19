// ── commands/builtin/ifconfig.ts ──────────────────────────────────
// Muestra configuración de red

import type { CommandContext, CommandResponse } from '../../types';

export const cmd_ifconfig = {
  name: 'ifconfig',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    const { ip, mac } = machine.machine_info;
    const net = ip.split('.').slice(0, 3).join('.');
    return {
      output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet ${ip}  netmask 255.255.255.0  broadcast ${net}.255\n        ether ${mac}\n\nlo: flags=73<UP,LOOPBACK>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`
    };
  }
};
