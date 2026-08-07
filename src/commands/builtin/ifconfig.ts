// ── commands/builtin/ifconfig.ts ──────────────────────────────────
// Muestra configuración de red. Refleja el estado real de las
// interfaces (down/up) vía networkState (ROADMAP Fase 6.3).

import type { CommandContext, CommandResponse } from '../../types';
import { isInterfaceDown } from '../../frameworks/network/networkState';

export const cmd_ifconfig = {
  name: 'ifconfig',
  execute: (_: string[], { machine }: CommandContext): CommandResponse => {
    const { ip, mac } = machine.machine_info;
    const net = ip.split('.').slice(0, 3).join('.');
    const ethDown = isInterfaceDown(machine.id, 'eth0');
    const ethFlags = ethDown ? 'flags=4098<BROADCAST,MULTICAST>' : 'flags=4163<UP,BROADCAST,RUNNING,MULTICAST>';
    const loDown = isInterfaceDown(machine.id, 'lo');
    const loFlags = loDown ? 'flags=8<LOOPBACK>' : 'flags=73<UP,LOOPBACK>';
    return {
      output: `eth0: ${ethFlags}  mtu 1500\n        inet ${ip}  netmask 255.255.255.0  broadcast ${net}.255\n        ether ${mac}\n\nlo: ${loFlags}  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`
    };
  }
};
